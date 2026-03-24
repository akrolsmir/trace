import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByRecipientOrg = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const grants = await ctx.db
      .query("grants")
      .withIndex("by_recipientOrg", (q) => q.eq("recipientOrgId", args.orgId))
      .collect();
    return Promise.all(
      grants.map(async (g) => {
        let funderName: string | undefined;
        let funderOrgSlug: string | undefined;
        let funderFundSlug: string | undefined;
        if (g.funderOrgId) {
          const org = await ctx.db.get(g.funderOrgId);
          funderName = org?.name;
          funderOrgSlug = org?.slug;
        } else if (g.funderFundId) {
          const fund = await ctx.db.get(g.funderFundId);
          funderName = fund?.name;
          funderFundSlug = fund?.slug;
        } else if (g.funderPersonId) {
          const person = await ctx.db.get(g.funderPersonId);
          funderName = person?.name;
        }
        return { ...g, funderName, funderOrgSlug, funderFundSlug };
      })
    );
  },
});

export const getByFunderOrg = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const grants = await ctx.db
      .query("grants")
      .withIndex("by_funderOrg", (q) => q.eq("funderOrgId", args.orgId))
      .collect();
    return Promise.all(
      grants.map(async (g) => {
        let recipientName: string | undefined;
        let recipientOrgSlug: string | undefined;
        if (g.recipientOrgId) {
          const org = await ctx.db.get(g.recipientOrgId);
          recipientName = org?.name;
          recipientOrgSlug = org?.slug;
        } else if (g.recipientProjectId) {
          const project = await ctx.db.get(g.recipientProjectId);
          recipientName = project?.name;
        } else if (g.recipientPersonId) {
          const person = await ctx.db.get(g.recipientPersonId);
          recipientName = person?.name;
        }
        return { ...g, recipientName, recipientOrgSlug };
      })
    );
  },
});
