// ---------------------------------------------------------------------------
// Interview Agent — HTTP API engine (Technical Specification contract)
//
//   POST /api/interview
//     { sessionId, candidate }            → start  → { reply, done: false }
//     { sessionId, message }              → turn   → { reply, done: false }
//                                            ...until done: true, with
//     feedback: { summary, strengths, gaps, next }
//
// State is maintained per sessionId in the `apiSessions` table. No auth, no
// accounts, no long-term history — exactly what the spec requires.
//
// The interview itself reuses the core engine from interviews.ts: same AI
// interviewer prompt, same day-tagging, same deterministic fallback, same
// coverage minimums (8 questions across 4+ days).
// ---------------------------------------------------------------------------

"use node";

import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { action } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { CANDIDATE_BY_ID, type CandidateProfile } from "../lib/candidates";
import { dayTopic } from "../lib/curriculum";
import {
  MIN_DAYS,
  MIN_QUESTIONS,
  buildFeedback,
  buildFeedbackSystemPrompt,
  buildSystemPrompt,
  complete,
  extractDayTag,
  fallbackFeedback,
  fallbackNextTurn,
  fallbackOpening,
  stripDayTag,
  type ChatMessage,
  type EngineInterviewState,
  type EngineTurn,
} from "./interviews";

type ApiSessionDoc = Doc<"apiSessions">;

interface ApiTurn {
  role: "assistant" | "user";
  content: string;
  day?: number;
  isQuestion: boolean;
}

interface ApiFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

// ---------------------------------------------------------------------------
// Internal function references (see note in interviews.ts)
// ---------------------------------------------------------------------------

const getApiSessionRef = makeFunctionReference<
  "query",
  { sessionId: string },
  ApiSessionDoc | null
>("interviewApiInternal:getApiSessionBySessionId");

const createApiSessionRef = makeFunctionReference<
  "mutation",
  {
    sessionId: string;
    candidate: CandidateProfile;
    messages: ApiTurn[];
    questionsAsked: number;
    daysCovered: number[];
    engine: "ai" | "fallback";
    createdAt: number;
  },
  Id<"apiSessions">
>("interviewApiInternal:createApiSession");

const updateApiSessionRef = makeFunctionReference<
  "mutation",
  {
    sessionId: string;
    messages: ApiTurn[];
    questionsAsked: number;
    daysCovered: number[];
    status: "active" | "completed";
    feedback?: ApiFeedback;
  },
  null
>("interviewApiInternal:updateApiSession");

// ---------------------------------------------------------------------------
// Candidate payload normalization (candidates.json schema)
// ---------------------------------------------------------------------------

const TONES = [
  "#6366f1",
  "#0d9488",
  "#7c3aed",
  "#2563eb",
  "#db2777",
  "#ea580c",
];

interface RawMission {
  day?: number;
  title?: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

/** Convert the spec's candidate payload into the engine's profile shape. */
function candidateFromPayload(payload: unknown): CandidateProfile {
  const p = (payload ?? {}) as Record<string, unknown>;
  const member = (p.member ?? {}) as Record<string, unknown>;
  const missions = (Array.isArray(p.missions) ? p.missions : []) as RawMission[];
  const sig = (p.signals ?? {}) as Record<string, number | undefined>;

  const id = typeof member.id === "string" ? member.id : "external-candidate";
  // If the payload references a known roster candidate, reuse the canonical
  // profile (identical signals and tone) instead of re-deriving it.
  const known = CANDIDATE_BY_ID.get(id);
  if (known) return known;

  const completedDays: number[] = [];
  const attemptedDays: number[] = [];
  const skippedDays: number[] = [];
  const retakes: { day: number; title: string; attempts: number }[] = [];
  let notPassed = 0;

  for (const m of missions) {
    const day = typeof m.day === "number" ? m.day : 0;
    if (m.skipped) {
      skippedDays.push(day);
      continue;
    }
    if (m.passed === true) {
      completedDays.push(day);
    } else {
      attemptedDays.push(day);
      notPassed += 1;
    }
    if (typeof m.attempts === "number" && m.attempts > 1) {
      retakes.push({ day, title: m.title ?? `Day ${day}`, attempts: m.attempts });
    }
  }
  const completed = [...completedDays].sort((a, b) => a - b);
  const attempted = [...attemptedDays].sort((a, b) => a - b);
  const skipped = [...skippedDays].sort((a, b) => a - b);

  const signals: string[] = [];
  const completedCount = sig.missionsCompleted ?? completed.length;
  signals.push(
    `${completedCount}/31 missions completed · ${sig.commitDays ?? 0} active commit days`,
  );
  const firstTry = missions.filter(
    (m) => m.passed === true && (m.attempts ?? 1) === 1,
  ).length;
  if (firstTry > 0) {
    signals.push(`${firstTry} missions passed on the first attempt`);
  }
  if (skipped.length > 0) {
    signals.push(`Skipped ${skipped.length} day${skipped.length > 1 ? "s" : ""}`);
  }
  if (retakes.length > 0) {
    const top = retakes.sort((a, b) => b.attempts - a.attempts)[0];
    signals.push(`Took ${top.attempts} attempts to pass Day ${top.day} (${top.title})`);
  }
  if (notPassed > 0) {
    signals.push(`Did not pass ${notPassed} attempted mission${notPassed > 1 ? "s" : ""}`);
  }

  const years =
    typeof member.yearsExperience === "number" ? member.yearsExperience : 0;
  const role = typeof member.jobRole === "string" ? member.jobRole : "AI Cohort learner";
  const education = typeof member.education === "string" ? member.education : "";
  const name = typeof member.name === "string" ? member.name : "Candidate";

  const hash = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  return {
    id,
    name,
    title: role,
    bio: `${years} yrs · ${role}${education ? ` · ${education}` : ""}`,
    completedDays: completed,
    attemptedDays: attempted,
    skippedDays: skipped,
    signals,
    tone: TONES[hash % TONES.length],
  };
}

// ---------------------------------------------------------------------------
// Feedback mapping (engine report → API contract shape)
// ---------------------------------------------------------------------------

function toApiFeedback(
  report: Record<string, unknown>,
  profile: CandidateProfile,
): ApiFeedback {
  const strengths = (Array.isArray(report.strengths) ? report.strengths : []).slice(
    0,
    3,
  ) as string[];
  const gaps = (Array.isArray(report.improvements) ? report.improvements : []).slice(
    0,
    3,
  ) as string[];
  const summary =
    typeof report.summary === "string" ? report.summary : "Interview complete.";

  const next: string[] = [];
  if (profile.skippedDays.length > 0) {
    next.push(
      `Review skipped material: ${profile.skippedDays
        .map((d) => `Day ${d} (${dayTopic(d)})`)
        .join(", ")}.`,
    );
  }
  const scorecard = Array.isArray(report.scorecard) ? report.scorecard : [];
  const weakest = [...scorecard].sort(
    (a, b) => (a?.score ?? 0) - (b?.score ?? 0),
  )[0] as { dimension?: string; note?: string } | undefined;
  if (weakest?.dimension) {
    next.push(`Focus on ${weakest.dimension}${weakest.note ? `: ${weakest.note}` : ""}`);
  }
  if (gaps[0]) next.push(`Practice: ${gaps[0]}`);
  if (next.length < 2) {
    next.push("Re-run the interview after reviewing the curriculum to measure progress.");
  }

  return { summary, strengths, gaps, next };
}

async function generateApiFeedback(
  profile: CandidateProfile,
  messages: ApiTurn[],
  questionsAsked: number,
  daysCovered: number[],
): Promise<ApiFeedback> {
  const transcript: ChatMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const system = buildFeedbackSystemPrompt();
  const prompt = [
    "=== INTERVIEW TRANSCRIPT ===",
    transcript
      .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n\n"),
    "",
    "=== CANDIDATE CONTEXT ===",
    `Name: ${profile.name} (${profile.title})`,
    `Completed days: ${profile.completedDays.join(", ")}`,
    `Skipped days: ${profile.skippedDays.join(", ") || "none"}`,
  ].join("\n");

  const state: EngineInterviewState = {
    daysCovered,
    completedDays: profile.completedDays,
    questionsAsked,
    signals: profile.signals,
    skippedDays: profile.skippedDays,
    candidateName: profile.name,
  };
  const turns: EngineTurn[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
    day: m.day,
  }));

  let report: Record<string, unknown>;
  try {
    const raw = await complete(
      [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      { temperature: 0.3, maxTokens: 1400 },
    );
    report = buildFeedback(raw);
  } catch {
    try {
      const raw = await complete(
        [
          {
            role: "system",
            content: `${system}\n\nIMPORTANT: Output ONLY the raw JSON object. No markdown, no code fences, no prose before or after.`,
          },
          { role: "user", content: prompt },
        ],
        { temperature: 0.2, maxTokens: 1400 },
      );
      report = buildFeedback(raw);
    } catch {
      report = fallbackFeedback(state, turns, questionsAsked, daysCovered);
    }
  }

  return toApiFeedback(report, profile);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Start a new interview session for a candidate payload. */
export const startApiInterview = action({
  args: { sessionId: v.string(), candidate: v.any() },
  returns: v.object({
    reply: v.string(),
    done: v.boolean(),
  }),
  handler: async (ctx, { sessionId, candidate }) => {
    if (!sessionId.trim()) throw new Error("sessionId is required");
    const existing = await ctx.runQuery(getApiSessionRef, { sessionId });
    if (existing) {
      throw new Error(`A session already exists for sessionId: ${sessionId}`);
    }

    const profile = candidateFromPayload(candidate);
    const system = buildSystemPrompt(profile);

    let opening: string;
    let engine: "ai" | "fallback";
    try {
      opening = await complete(
        [
          { role: "system", content: system },
          {
            role: "user",
            content:
              "Begin the interview now. Introduce yourself briefly, make the candidate comfortable, and ask your first question.",
          },
        ],
        { temperature: 0.8, maxTokens: 500 },
      );
      engine = "ai";
    } catch {
      opening = fallbackOpening(profile);
      engine = "fallback";
    }

    const cleaned = stripDayTag(opening);
    const day = extractDayTag(opening);
    const isQuestion = cleaned.includes("?") || cleaned.includes("？");
    const messages: ApiTurn[] = [
      { role: "assistant", content: cleaned, day: day ?? undefined, isQuestion },
    ];
    const questionsAsked = isQuestion ? 1 : 0;
    const daysCovered = day ? [day] : [];

    await ctx.runMutation(createApiSessionRef, {
      sessionId,
      candidate: profile,
      messages,
      questionsAsked,
      daysCovered,
      engine,
      createdAt: Date.now(),
    });

    return { reply: cleaned, done: false };
  },
});

/** Send the candidate's latest message and get the next interviewer turn. */
export const respondApiInterview = action({
  args: { sessionId: v.string(), message: v.string() },
  returns: v.object({
    reply: v.string(),
    done: v.boolean(),
    feedback: v.optional(v.any()),
  }),
  handler: async (ctx, { sessionId, message }) => {
    const session = await ctx.runQuery(getApiSessionRef, { sessionId });
    if (!session) {
      throw new Error(`No interview found for sessionId: ${sessionId}`);
    }
    if (session.status === "completed") {
      return { reply: "Interview completed.", done: true, feedback: session.feedback };
    }
    if (!message.trim()) throw new Error("message cannot be empty");

    const profile = session.candidate as CandidateProfile;
    const userTurn: ApiTurn = {
      role: "user",
      content: message.trim(),
      isQuestion: false,
    };
    const turns: EngineTurn[] = [...session.messages, userTurn].map((m) => ({
      role: m.role,
      content: m.content,
      day: m.day,
    }));
    const transcript: ChatMessage[] = turns.map((t) => ({
      role: t.role,
      content: t.content,
    }));

    const state: EngineInterviewState = {
      daysCovered: session.daysCovered,
      completedDays: profile.completedDays,
      questionsAsked: session.questionsAsked,
      signals: profile.signals,
      skippedDays: profile.skippedDays,
      candidateName: profile.name,
    };

    let turn: string;
    if (session.engine === "fallback") {
      turn = fallbackNextTurn(state, turns).message;
    } else {
      try {
        const system = buildSystemPrompt(profile);
        turn = await complete(
          [{ role: "system", content: system }, ...transcript],
          { temperature: 0.8, maxTokens: 550 },
        );
      } catch {
        turn = fallbackNextTurn(state, turns).message;
      }
    }

    const cleaned = stripDayTag(turn);
    const day = extractDayTag(turn);
    const isQuestion = cleaned.includes("?") || cleaned.includes("？");
    const questionsAsked = session.questionsAsked + (isQuestion ? 1 : 0);
    const daysCovered = day
      ? Array.from(new Set([...session.daysCovered, day])).sort((a, b) => a - b)
      : session.daysCovered;
    const nextMessages: ApiTurn[] = [
      ...session.messages,
      userTurn,
      { role: "assistant", content: cleaned, day: day ?? undefined, isQuestion },
    ];

    if (questionsAsked < MIN_QUESTIONS || daysCovered.length < MIN_DAYS) {
      await ctx.runMutation(updateApiSessionRef, {
        sessionId,
        messages: nextMessages,
        questionsAsked,
        daysCovered,
        status: "active",
      });
      return { reply: cleaned, done: false };
    }

    // Coverage complete — produce the structured feedback and end the interview.
    const feedback = await generateApiFeedback(
      profile,
      nextMessages,
      questionsAsked,
      daysCovered,
    );
    await ctx.runMutation(updateApiSessionRef, {
      sessionId,
      messages: nextMessages,
      questionsAsked,
      daysCovered,
      status: "completed",
      feedback,
    });

    return { reply: "Interview completed.", done: true, feedback };
  },
});
