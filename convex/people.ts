import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByOrg = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("personOrgs")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
    const people = [];
    for (const link of links) {
      const person = await ctx.db.get(link.personId);
      if (person) {
        people.push({ ...person, role: link.role, isCurrent: link.isCurrent });
      }
    }
    return people;
  },
});
