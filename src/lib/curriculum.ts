// ---------------------------------------------------------------------------
// The AI Cohort — 31-day curriculum
// Synthetic data for the Interview Agent challenge. Used both by the interview
// engine (to ground questions in what a candidate has actually covered) and by
// the UI (module grid, day chips, progress).
// ---------------------------------------------------------------------------

export interface CurriculumDay {
  /** 1-indexed day of the cohort */
  day: number;
  module: string;
  topic: string;
  objectives: string[];
  tools: string[];
}

export interface CurriculumModule {
  id: string;
  name: string;
  /** inclusive day range */
  days: [number, number];
  focus: string;
}

export const MODULES: CurriculumModule[] = [
  {
    id: "rag",
    name: "Foundations & RAG",
    days: [1, 6],
    focus: "LLMs, embeddings, chunking and retrieval-augmented generation",
  },
  {
    id: "vector-db",
    name: "Vector Databases",
    days: [7, 10],
    focus: "Indexing algorithms, operations, and hybrid search",
  },
  {
    id: "prompting",
    name: "Prompt Engineering",
    days: [11, 14],
    focus: "Few-shot, chain-of-thought, structured output and tool calling",
  },
  {
    id: "agents",
    name: "Agentic AI",
    days: [15, 20],
    focus: "Agent architectures, memory, multi-agent orchestration, guardrails",
  },
  {
    id: "mcp",
    name: "Model Context Protocol",
    days: [21, 23],
    focus: "MCP clients, servers, transports and production considerations",
  },
  {
    id: "deployment",
    name: "AI Deployment",
    days: [24, 27],
    focus: "Serving, observability, cost engineering and LLM security",
  },
  {
    id: "production",
    name: "Production AI Systems",
    days: [28, 31],
    focus: "System design, evaluation pipelines, reliability and the capstone",
  },
];

export const CURRICULUM: CurriculumDay[] = [
  {
    day: 1,
    module: "Foundations & RAG",
    topic: "LLMs & the AI Engineering Stack",
    objectives: [
      "Explain how tokens, context windows and temperature shape LLM behavior",
      "Describe the anatomy of a completion call and common failure modes",
    ],
    tools: ["OpenAI API", "Python"],
  },
  {
    day: 2,
    module: "Foundations & RAG",
    topic: "Embeddings & Semantic Similarity",
    objectives: [
      "Explain what embeddings capture and why cosine similarity works",
      "Reason about embedding drift, dimensionality and model choice",
    ],
    tools: ["OpenAI Embeddings", "NumPy"],
  },
  {
    day: 3,
    module: "Foundations & RAG",
    topic: "Chunking Strategies",
    objectives: [
      "Compare chunk size, overlap and structure-aware splitting",
      "Diagnose retrieval failures caused by poor chunking",
    ],
    tools: ["LangChain", "tiktoken"],
  },
  {
    day: 4,
    module: "Foundations & RAG",
    topic: "RAG Architecture",
    objectives: [
      "Diagram the retrieval + generation pipeline and each component's job",
      "Explain why RAG exists — grounding, freshness, attribution",
    ],
    tools: ["LangChain", "FAISS"],
  },
  {
    day: 5,
    module: "Foundations & RAG",
    topic: "Building a RAG Pipeline",
    objectives: [
      "Build ingestion, retrieval and synthesis end-to-end",
      "Debug a broken pipeline: bad chunks, bad queries, bad synthesis",
    ],
    tools: ["LangChain", "FastAPI"],
  },
  {
    day: 6,
    module: "Foundations & RAG",
    topic: "Evaluating RAG",
    objectives: [
      "Measure retrieval quality: hit rate, precision, recall",
      "Measure generation quality: faithfulness, answer relevance",
    ],
    tools: ["RAGAS", "LangSmith"],
  },
  {
    day: 7,
    module: "Vector Databases",
    topic: "Vector DBs vs. Traditional Indexes",
    objectives: [
      "Explain why B-trees underperform for similarity search at scale",
      "Map storage, filtering and recall tradeoffs to use cases",
    ],
    tools: ["pgvector", "PostgreSQL"],
  },
  {
    day: 8,
    module: "Vector Databases",
    topic: "Indexing Algorithms: HNSW, IVF, PQ",
    objectives: [
      "Explain HNSW graph traversal and its recall/latency tradeoffs",
      "Compare IVF clustering and product quantization for memory",
    ],
    tools: ["FAISS", "hnswlib"],
  },
  {
    day: 9,
    module: "Vector Databases",
    topic: "Operating a Vector Database",
    objectives: [
      "Design indexes, namespaces and metadata filters for production",
      "Handle reindexing, deduplication and data lifecycle",
    ],
    tools: ["Pinecone"],
  },
  {
    day: 10,
    module: "Vector Databases",
    topic: "Hybrid Search: Dense + Sparse",
    objectives: [
      "Explain why keyword signals still matter (names, IDs, jargon)",
      "Implement dense + BM25 fusion and tune the alpha weight",
    ],
    tools: ["Pinecone", "BM25", "Weaviate"],
  },
  {
    day: 11,
    module: "Prompt Engineering",
    topic: "Prompt Anatomy & Zero-Shot",
    objectives: [
      "Deconstruct a prompt: role, task, context, constraints, format",
      "Iterate on zero-shot prompts with systematic testing",
    ],
    tools: ["OpenAI Playground", "LangChain"],
  },
  {
    day: 12,
    module: "Prompt Engineering",
    topic: "Few-Shot & In-Context Learning",
    objectives: [
      "Design exemplars that teach format and reasoning style",
      "Avoid common few-shot failure modes: bias, overfitting, token cost",
    ],
    tools: ["LangChain"],
  },
  {
    day: 13,
    module: "Prompt Engineering",
    topic: "Chain-of-Thought, Self-Consistency & ReAct",
    objectives: [
      "Explain when and why chain-of-thought improves reasoning",
      "Compare self-consistency and ReAct for multi-step problems",
    ],
    tools: ["LangChain", "LangGraph"],
  },
  {
    day: 14,
    module: "Prompt Engineering",
    topic: "Structured Output & Function Calling",
    objectives: [
      "Guarantee structured output with JSON mode and tool schemas",
      "Design reliable tool schemas and handle malformed responses",
    ],
    tools: ["OpenAI function calling", "JSON mode"],
  },
  {
    day: 15,
    module: "Agentic AI",
    topic: "Agent Architecture: Perceive, Plan, Act",
    objectives: [
      "Break an agent into perception, planning, action and reflection",
      "Decide when an agent is the right tool versus a pipeline",
    ],
    tools: ["LangGraph"],
  },
  {
    day: 16,
    module: "Agentic AI",
    topic: "Tool Use & Function Calling at Scale",
    objectives: [
      "Design tool registries, retry loops and error surfacing",
      "Protect against prompt injection through tool descriptions",
    ],
    tools: ["OpenAI", "LangGraph"],
  },
  {
    day: 17,
    module: "Agentic AI",
    topic: "Agent Memory & State Management",
    objectives: [
      "Distinguish short-term, long-term and episodic memory",
      "Persist agent state and handle checkpointing and resumption",
    ],
    tools: ["LangGraph", "Redis"],
  },
  {
    day: 18,
    module: "Agentic AI",
    topic: "Multi-Agent Orchestration",
    objectives: [
      "Choose between a single agent and a team of specialists",
      "Design handoffs, shared state and deadlock avoidance",
    ],
    tools: ["LangGraph", "CrewAI"],
  },
  {
    day: 19,
    module: "Agentic AI",
    topic: "Planning, Reflection & ReAct Loops",
    objectives: [
      "Compare plan-and-execute with iterative ReAct loops",
      "Add reflection steps that improve plan quality",
    ],
    tools: ["LangGraph"],
  },
  {
    day: 20,
    module: "Agentic AI",
    topic: "Agent Evaluation & Guardrails",
    objectives: [
      "Build evaluation harnesses for multi-turn agent behavior",
      "Layer guardrails: output validation, rate limits, human review",
    ],
    tools: ["LangSmith", "Guardrails AI"],
  },
  {
    day: 21,
    module: "Model Context Protocol",
    topic: "MCP Fundamentals",
    objectives: [
      "Explain MCP: clients, servers, tools, resources and transports",
      "Compare MCP with bespoke tool integrations",
    ],
    tools: ["MCP SDK"],
  },
  {
    day: 22,
    module: "Model Context Protocol",
    topic: "Building an MCP Server",
    objectives: [
      "Expose tools and resources through a typed MCP server",
      "Test an MCP server with the inspector and a reference client",
    ],
    tools: ["MCP SDK", "TypeScript"],
  },
  {
    day: 23,
    module: "Model Context Protocol",
    topic: "MCP in Production",
    objectives: [
      "Handle auth, discovery and versioning for MCP servers",
      "Scale MCP services and reason about their failure modes",
    ],
    tools: ["MCP SDK", "FastAPI"],
  },
  {
    day: 24,
    module: "AI Deployment",
    topic: "Serving & Inference Optimization",
    objectives: [
      "Compare serverless, dedicated and self-hosted inference",
      "Use batching, quantization and continuous batching to cut cost",
    ],
    tools: ["vLLM", "Hugging Face TGI"],
  },
  {
    day: 25,
    module: "AI Deployment",
    topic: "Observability for AI Systems",
    objectives: [
      "Trace a request through retrieval, prompt build and generation",
      "Track latency, token spend and quality metrics per version",
    ],
    tools: ["LangSmith", "Grafana"],
  },
  {
    day: 26,
    module: "AI Deployment",
    topic: "Cost & Scale Engineering",
    objectives: [
      "Cache prompts, responses and embeddings to cut spend",
      "Route by model tier and quota to control blast radius",
    ],
    tools: ["Redis", "LiteLLM"],
  },
  {
    day: 27,
    module: "AI Deployment",
    topic: "LLM Security",
    objectives: [
      "Identify prompt injection, data leakage and indirect attacks",
      "Apply the OWASP LLM Top 10 as a review checklist",
    ],
    tools: ["OWASP LLM Top 10"],
  },
  {
    day: 28,
    module: "Production AI Systems",
    topic: "Designing Production AI Architectures",
    objectives: [
      "Design an end-to-end architecture for a RAG or agent product",
      "Defend decisions: data flow, caching, failure isolation",
    ],
    tools: ["FastAPI", "System design"],
  },
  {
    day: 29,
    module: "Production AI Systems",
    topic: "Evaluation Pipelines & CI for AI",
    objectives: [
      "Build regression suites that gate deploys on eval thresholds",
      "Curate golden datasets and track drift over time",
    ],
    tools: ["RAGAS", "GitHub Actions"],
  },
  {
    day: 30,
    module: "Production AI Systems",
    topic: "Reliability: Retries, Fallbacks & Degradation",
    objectives: [
      "Design retries with backoff and circuit breakers",
      "Build graceful degradation when the model or store fails",
    ],
    tools: ["LangChain", "OpenAI"],
  },
  {
    day: 31,
    module: "Production AI Systems",
    topic: "Capstone: Shipping a Production AI System",
    objectives: [
      "Synthesize the full stack into one shipped system",
      "Present architecture, evals and operational runbook",
    ],
    tools: ["Full cohort toolchain"],
  },
];

export const DAY_BY_NUMBER = new Map(CURRICULUM.map((d) => [d.day, d]));

export function dayTopic(day: number): string {
  return DAY_BY_NUMBER.get(day)?.topic ?? `Day ${day}`;
}

export function moduleForDay(day: number): string {
  return DAY_BY_NUMBER.get(day)?.module ?? "Unknown";
}
