import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // -----------------------------------------------------------------------
    // Interview Agent tables
    // -----------------------------------------------------------------------

    /** One interview session between an interviewer and a candidate profile. */
    interviews: defineTable({
      candidateId: v.string(),
      // Snapshot of the profile used to seed the interview.
      candidateName: v.string(),
      candidateTitle: v.string(),
      candidateBio: v.string(),
      candidateTone: v.string(),
      completedDays: v.array(v.number()),
      attemptedDays: v.array(v.number()),
      skippedDays: v.array(v.number()),
      signals: v.array(v.string()),
      status: v.union(v.literal("active"), v.literal("completed")),
      /** interview engine: "ai" uses the LLM interviewer, "fallback" uses the local deterministic interviewer */
      engine: v.union(v.literal("ai"), v.literal("fallback")),
      /** number of questions the interviewer has asked so far */
      questionsAsked: v.number(),
      /** curriculum days covered by questions so far */
      daysCovered: v.array(v.number()),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
      /** structured feedback produced by completeInterview */
      feedback: v.optional(v.any()),
    }).index("by_createdAt", ["createdAt"]),

    /** A single turn in an interview transcript. */
    messages: defineTable({
      interviewId: v.id("interviews"),
      role: v.union(v.literal("assistant"), v.literal("user")),
      content: v.string(),
      /** curriculum day this message maps to (assistant questions only) */
      day: v.optional(v.number()),
      /** whether the assistant message asks a question */
      isQuestion: v.boolean(),
      createdAt: v.number(),
    }).index("by_interview", ["interviewId", "createdAt"]),

    /**
     * Stateless HTTP-API interview sessions (Technical Specification):
     * each is keyed by the client-supplied sessionId and holds its own
     * transcript, so no long-term accounts or history are required.
     */
    apiSessions: defineTable({
      sessionId: v.string(),
      /** normalized candidate profile snapshot (CandidateProfile shape) */
      candidate: v.any(),
      messages: v.array(
        v.object({
          role: v.union(v.literal("assistant"), v.literal("user")),
          content: v.string(),
          day: v.optional(v.number()),
          isQuestion: v.boolean(),
        }),
      ),
      /** number of questions the interviewer has asked so far */
      questionsAsked: v.number(),
      /** curriculum days covered by questions so far */
      daysCovered: v.array(v.number()),
      /** interview engine: "ai" uses the LLM interviewer, "fallback" uses the local deterministic interviewer */
      engine: v.union(v.literal("ai"), v.literal("fallback")),
      status: v.union(v.literal("active"), v.literal("completed")),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
      /** feedback in the API contract shape: { summary, strengths, gaps, next } */
      feedback: v.optional(v.any()),
    }).index("by_sessionId", ["sessionId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
