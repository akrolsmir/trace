import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCommentsByOrg = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const addComment = mutation({
  args: {
    orgId: v.id("orgs"),
    authorName: v.string(),
    body: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("comments", {
      orgId: args.orgId,
      authorName: args.authorName,
      body: args.body,
      rating: args.rating,
      createdAt: Date.now(),
    });
  },
});
