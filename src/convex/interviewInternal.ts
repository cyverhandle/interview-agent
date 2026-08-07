// Internal functions used by the interview engine actions (actions cannot
// access the database directly — they must go through runQuery/runMutation).

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const createInterview = internalMutation({
  args: {
    /** full candidate snapshot: candidateId, candidateName, ..., signals */
    candidate: v.any(),
    engine: v.union(v.literal("ai"), v.literal("fallback")),
    createdAt: v.number(),
  },
  handler: async (ctx, { candidate, engine, createdAt }) => {
    return await ctx.db.insert("interviews", {
      ...candidate,
      status: "active",
      engine,
      questionsAsked: 0,
      daysCovered: [],
      createdAt,
    });
  },
});

export const appendMessage = internalMutation({
  args: {
    interviewId: v.id("interviews"),
    role: v.union(v.literal("assistant"), v.literal("user")),
    content: v.string(),
    day: v.optional(v.number()),
    isQuestion: v.boolean(),
  },
  handler: async (ctx, { interviewId, role, content, day, isQuestion }) => {
    await ctx.db.insert("messages", {
      interviewId,
      role,
      content,
      day,
      isQuestion,
      createdAt: Date.now(),
    });
  },
});

export const updateCounters = internalMutation({
  args: {
    interviewId: v.id("interviews"),
    questionsAsked: v.number(),
    daysCovered: v.array(v.number()),
  },
  handler: async (ctx, { interviewId, questionsAsked, daysCovered }) => {
    await ctx.db.patch(interviewId, { questionsAsked, daysCovered });
  },
});

export const finishInterview = internalMutation({
  args: {
    interviewId: v.id("interviews"),
    feedback: v.any(),
    questionsAsked: v.number(),
    daysCovered: v.array(v.number()),
  },
  handler: async (
    ctx,
    { interviewId, feedback, questionsAsked, daysCovered },
  ) => {
    await ctx.db.patch(interviewId, {
      status: "completed",
      completedAt: Date.now(),
      feedback,
      questionsAsked,
      daysCovered,
    });
  },
});

export const getInterviewInternal = internalQuery({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, { interviewId }) => {
    return await ctx.db.get(interviewId);
  },
});

export const getMessagesInternal = internalQuery({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, { interviewId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_interview", (q) => q.eq("interviewId", interviewId))
      .order("asc")
      .collect();
  },
});
