// ---------------------------------------------------------------------------
// Candidate profiles — synthetic data for the Interview Agent challenge.
// Each profile describes a cohort participant's learning journey: completed
// missions, attempts, skipped topics and qualitative learning signals. The
// interview engine uses these to adapt questioning to the individual.
// ---------------------------------------------------------------------------

export interface CandidateProfile {
  id: string;
  name: string;
  title: string;
  /** short bio shown in the interviewer UI */
  bio: string;
  /** cohort days completed (mission passed) */
  completedDays: number[];
  /** cohort days attempted at least once (retries / close calls) */
  attemptedDays: number[];
  /** cohort days skipped */
  skippedDays: number[];
  /** qualitative learning signals from the cohort platform */
  signals: string[];
  /** accent used for the avatar */
  tone: string;
}

export const CANDIDATES: CandidateProfile[] = [
  {
    id: "maya-chen",
    name: "Maya Chen",
    title: "Senior Frontend Engineer",
    bio: "Mid-cohort. Strong communicator, light on vector internals.",
    completedDays: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15,
    ],
    attemptedDays: [9],
    skippedDays: [10],
    signals: [
      "Excellent at explaining tradeoffs in product terms",
      "Strong on prompt engineering — few-shot and chain-of-thought",
      "Shaky on vector index internals (HNSW / IVF)",
      "Skipped hybrid search day",
    ],
    tone: "#6366f1",
  },
  {
    id: "andre-okafor",
    name: "Andre Okafor",
    title: "Data Engineer",
    bio: "Late-cohort. Deep on RAG evaluation, skipped MCP entirely.",
    completedDays: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      24, 25, 26, 27, 28, 29, 30, 31,
    ],
    attemptedDays: [6, 20],
    skippedDays: [21, 22, 23],
    signals: [
      "Deep on RAG evaluation — RAGAS, faithfulness, retrieval metrics",
      "Comfortable with deployment and observability",
      "Weak on agent memory and state management",
      "Skipped the entire MCP module",
    ],
    tone: "#0d9488",
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    title: "Backend Engineer",
    bio: "Early-cohort. Solid fundamentals, still learning to defend designs.",
    completedDays: [1, 2, 3, 4, 5, 6, 7, 8],
    attemptedDays: [2, 3],
    skippedDays: [],
    signals: [
      "Solid conceptual fundamentals — embeddings and similarity",
      "Needs practice articulating design tradeoffs out loud",
      "Hasn't skipped anything yet",
      "Retook embeddings and chunking days before passing",
    ],
    tone: "#7c3aed",
  },
  {
    id: "tomas-rivera",
    name: "Tomás Rivera",
    title: "ML Engineer",
    bio: "Full cohort. Strong across modules; answers lack structure.",
    completedDays: Array.from({ length: 31 }, (_, i) => i + 1),
    attemptedDays: [7, 17],
    skippedDays: [],
    signals: [
      "Strong across every module — RAG, agents, MCP, deployment",
      "Tends to over-answer without structure",
      "Deep familiarity with evaluation pipelines",
      "Retook agent memory and vector indexing days",
    ],
    tone: "#2563eb",
  },
  {
    id: "lena-fischer",
    name: "Lena Fischer",
    title: "Mobile Engineer",
    bio: "Mid-cohort. Great concepts, no hands-on RAG pipeline.",
    completedDays: [1, 2, 3, 4, 7, 8, 9, 10, 11, 12],
    attemptedDays: [8],
    skippedDays: [5, 6],
    signals: [
      "Great conceptual grasp of embeddings and vector search",
      "No hands-on RAG pipeline experience — skipped build and eval days",
      "Solid on prompt engineering fundamentals",
    ],
    tone: "#db2777",
  },
  {
    id: "dev-osei",
    name: "Dev Osei",
    title: "Platform Engineer",
    bio: "Mid-cohort. Deployment-focused, lighter on prompting & agents.",
    completedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 19, 20],
    attemptedDays: [11],
    skippedDays: [13, 18],
    signals: [
      "Strong at serving, cost and deployment engineering",
      "Light on chain-of-thought / ReAct depth",
      "Skipped multi-agent orchestration day",
      "Retook prompt anatomy before passing",
    ],
    tone: "#ea580c",
  },
];

export const CANDIDATE_BY_ID = new Map(CANDIDATES.map((c) => [c.id, c]));
