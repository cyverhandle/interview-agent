import { v } from "convex/values";
import { query } from "./_generated/server";

export const getInterview = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, { interviewId }) => {
    return await ctx.db.get(interviewId);
  },
});

export const getMessages = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, { interviewId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_interview", (q) => q.eq("interviewId", interviewId))
      .order("asc")
      .collect();
  },
});

export const listInterviews = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_createdAt")
      .order("desc")
      .take(20);
  },
});
