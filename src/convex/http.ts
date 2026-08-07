import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { api } from "./_generated/api";

// ---------------------------------------------------------------------------
// Interview Agent — HTTP API (Technical Specification contract)
//
//   GET  /api/health                     → service status
//   POST /api/interviews                 → start an interview  { candidateId }
//   POST /api/interviews/:id/respond     → next turn           { answer }
//   POST /api/interviews/:id/complete    → structured feedback
//   GET  /api/interviews/:id             → interview + transcript
//
// All routes return JSON. Errors are returned as { "error": string } with a
// 4xx/5xx status.
// ---------------------------------------------------------------------------

const http = httpRouter();

auth.addHttpRoutes(http);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Path params exposed by Convex (e.g. :interviewId) at runtime. */
function pathParams(request: Request): Record<string, string> {
  return (request as unknown as { params: Record<string, string> }).params ?? {};
}

http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async () => {
    return json({
      status: "ok",
      service: "interview-agent",
      version: "1.0.0",
      endpoints: [
        "POST /api/interviews",
        "POST /api/interviews/:id/respond",
        "POST /api/interviews/:id/complete",
        "GET /api/interviews/:id",
      ],
    });
  }),
});

http.route({
  path: "/api/interviews",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const body = await readJson(request);
    const candidateId = body?.candidateId;
    if (typeof candidateId !== "string" || candidateId.length === 0) {
      return error("candidateId is required", 400);
    }
    try {
      const result = await _ctx.runAction(api.interviews.startInterview, {
        candidateId,
      });
      return json(result, 201);
    } catch (e) {
      return error(
        e instanceof Error ? e.message : "Failed to start interview",
        500,
      );
    }
  }),
});

http.route({
  path: "/api/interviews/:interviewId/respond",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { interviewId } = pathParams(request);
    const body = await readJson(request);
    const answer = body?.answer;
    if (typeof answer !== "string" || answer.trim().length === 0) {
      return error("answer is required", 400);
    }
    try {
      const result = await ctx.runAction(api.interviews.respond, {
        interviewId: interviewId as never,
        answer,
      });
      return json(result, 200);
    } catch (e) {
      return error(e instanceof Error ? e.message : "Failed to respond", 500);
    }
  }),
});

http.route({
  path: "/api/interviews/:interviewId/complete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { interviewId } = pathParams(request);
    try {
      const result = await ctx.runAction(api.interviews.completeInterview, {
        interviewId: interviewId as never,
      });
      return json(result, 200);
    } catch (e) {
      return error(
        e instanceof Error ? e.message : "Failed to complete interview",
        500,
      );
    }
  }),
});

http.route({
  path: "/api/interviews/:interviewId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { interviewId } = pathParams(request);
    try {
      const [interview, messages] = await Promise.all([
        ctx.runQuery(api.interviewQueries.getInterview, {
          interviewId: interviewId as never,
        }),
        ctx.runQuery(api.interviewQueries.getMessages, {
          interviewId: interviewId as never,
        }),
      ]);
      if (!interview) {
        return error("Interview not found", 404);
      }
      return json({ interview, messages }, 200);
    } catch (e) {
      return error(
        e instanceof Error ? e.message : "Failed to fetch interview",
        500,
      );
    }
  }),
});

export default http;
