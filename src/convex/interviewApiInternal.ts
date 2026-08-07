// Internal functions used by the HTTP-API interview actions (actions cannot
// access the database directly — they must go through runQuery/runMutation).

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getApiSessionBySessionId = internalQuery({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("apiSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();
  },
});

export const createApiSession = internalMutation({
  args: {
    sessionId: v.string(),
    candidate: v.any(),
    messages: v.any(),
    questionsAsked: v.number(),
    daysCovered: v.array(v.number()),
    engine: v.union(v.literal("ai"), v.literal("fallback")),
    createdAt: v.number(),
  },
  handler: async (
    ctx,
    { sessionId, candidate, messages, questionsAsked, daysCovered, engine, createdAt },
  ) => {
    return await ctx.db.insert("apiSessions", {
      sessionId,
      candidate,
      messages,
      questionsAsked,
      daysCovered,
      engine,
      status: "active",
      createdAt,
    });
  },
});

export const updateApiSession = internalMutation({
  args: {
    sessionId: v.string(),
    messages: v.any(),
    questionsAsked: v.number(),
    daysCovered: v.array(v.number()),
    status: v.union(v.literal("active"), v.literal("completed")),
    feedback: v.optional(v.any()),
  },
  handler: async (
    ctx,
    { sessionId, messages, questionsAsked, daysCovered, status, feedback },
  ) => {
    const session = await ctx.db
      .query("apiSessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();
    if (!session) return;
    await ctx.db.patch(session._id, {
      messages,
      questionsAsked,
      daysCovered,
      status,
      feedback,
      ...(status === "completed" ? { completedAt: Date.now() } : {}),
    });
  },
});
