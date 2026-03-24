import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("funds").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("funds")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getPeople = query({
  args: { fundId: v.id("funds") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("fundPersons")
      .withIndex("by_fund", (q) => q.eq("fundId", args.fundId))
      .collect();
    const people = [];
    for (const link of links) {
      const person = await ctx.db.get(link.personId);
      if (person) {
        people.push({ ...person, role: link.role });
      }
    }
    return people;
  },
});

export const getGrants = query({
  args: { fundId: v.id("funds") },
  handler: async (ctx, args) => {
    const grants = await ctx.db
      .query("grants")
      .withIndex("by_funderFund", (q) => q.eq("funderFundId", args.fundId))
      .collect();
    return Promise.all(
      grants.map(async (g) => {
        let recipientName: string | undefined;
        let recipientOrgSlug: string | undefined;
        let recipientPersonSlug: string | undefined;
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
          recipientPersonSlug = person?.slug;
        }
        return { ...g, recipientName, recipientOrgSlug, recipientPersonSlug };
      })
    );
  },
});
