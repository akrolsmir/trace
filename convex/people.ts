import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("people").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("people")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

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

export const getOrgs = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("personOrgs")
      .withIndex("by_person", (q) => q.eq("personId", args.personId))
      .collect();
    const orgs = [];
    for (const link of links) {
      const org = await ctx.db.get(link.orgId);
      if (org) {
        orgs.push({ ...org, role: link.role, isCurrent: link.isCurrent });
      }
    }
    return orgs;
  },
});

export const getProjects = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("personProjects")
      .withIndex("by_person", (q) => q.eq("personId", args.personId))
      .collect();
    const projects = [];
    for (const link of links) {
      const project = await ctx.db.get(link.projectId);
      if (project) {
        projects.push({ ...project, role: link.role });
      }
    }
    return projects;
  },
});

export const getFunds = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("fundPersons")
      .withIndex("by_person", (q) => q.eq("personId", args.personId))
      .collect();
    const funds = [];
    for (const link of links) {
      const fund = await ctx.db.get(link.fundId);
      if (fund) {
        funds.push({ ...fund, role: link.role });
      }
    }
    return funds;
  },
});

export const getGrantsReceived = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const grants = await ctx.db
      .query("grants")
      .withIndex("by_recipientPerson", (q) =>
        q.eq("recipientPersonId", args.personId)
      )
      .collect();
    return Promise.all(
      grants.map(async (g) => {
        let funderName: string | undefined;
        let funderFundSlug: string | undefined;
        let funderOrgSlug: string | undefined;
        if (g.funderFundId) {
          const fund = await ctx.db.get(g.funderFundId);
          funderName = fund?.name;
          funderFundSlug = fund?.slug;
        } else if (g.funderOrgId) {
          const org = await ctx.db.get(g.funderOrgId);
          funderName = org?.name;
          funderOrgSlug = org?.slug;
        } else if (g.funderPersonId) {
          const person = await ctx.db.get(g.funderPersonId);
          funderName = person?.name;
        }
        return { ...g, funderName, funderFundSlug, funderOrgSlug };
      })
    );
  },
});
