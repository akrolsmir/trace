import { mutation } from "./_generated/server";
import { v } from "convex/values";

const donationLink = v.object({
  url: v.string(),
  platform: v.optional(v.string()),
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "personProjects",
      "fundPersons",
      "personOrgs",
      "grants",
      "projects",
      "funds",
      "people",
      "orgs",
      // Legacy tables from old schema
      "orgs",
      "staff",
      "comments",
    ];

    const counts: Record<string, number> = {};
    for (const table of tables) {
      const docs = await ctx.db.query(table as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id as any);
      }
      counts[table] = docs.length;
    }
    console.log("Cleared all tables:", counts);
    return counts;
  },
});

export const insertOrgs = mutation({
  args: {
    docs: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        descriptionShort: v.optional(v.string()),
        descriptionMedium: v.optional(v.string()),
        descriptionFull: v.optional(v.string()),
        theoryOfChange: v.optional(v.string()),
        websiteUrl: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        linkedinUrl: v.optional(v.string()),
        location: v.optional(v.string()),
        foundedDate: v.optional(v.string()),
        teamSize: v.optional(v.number()),
        annualBudget: v.optional(v.number()),
        monthlyBurnRate: v.optional(v.number()),
        currentRunwayMonths: v.optional(v.number()),
        fundingGoal: v.optional(v.number()),
        fundingStage: v.optional(v.string()),
        isActivelyFundraising: v.optional(v.boolean()),
        fundingRaisedToDate: v.optional(v.number()),
        fiscalSponsor: v.optional(v.string()),
        donationLinks: v.optional(v.array(donationLink)),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const doc of args.docs) {
      const id = await ctx.db.insert("orgs", doc);
      ids.push(id);
    }
    return ids;
  },
});

export const insertPeople = mutation({
  args: {
    docs: v.array(
      v.object({
        name: v.string(),
        bio: v.optional(v.string()),
        profileImageUrl: v.optional(v.string()),
        linkedinUrl: v.optional(v.string()),
        twitterUrl: v.optional(v.string()),
        lesswrongHandle: v.optional(v.string()),
        gwwcPledge: v.optional(v.boolean()),
        personalWebsiteUrl: v.optional(v.string()),
        contactEmail: v.optional(v.string()),
        isGrantmaker: v.optional(v.boolean()),
        isRegrantor: v.optional(v.boolean()),
        location: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const doc of args.docs) {
      const id = await ctx.db.insert("people", doc);
      ids.push(id);
    }
    return ids;
  },
});

export const insertFunds = mutation({
  args: {
    docs: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        descriptionShort: v.optional(v.string()),
        descriptionMedium: v.optional(v.string()),
        descriptionFull: v.optional(v.string()),
        type: v.optional(v.string()),
        websiteUrl: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        totalDeployedToDate: v.optional(v.number()),
        expectedAnnualDistribution: v.optional(v.number()),
        applicationUrl: v.optional(v.string()),
        applicationInfo: v.optional(v.string()),
        donationLinks: v.optional(v.array(donationLink)),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const doc of args.docs) {
      const id = await ctx.db.insert("funds", doc);
      ids.push(id);
    }
    return ids;
  },
});

export const insertProjects = mutation({
  args: {
    docs: v.array(
      v.object({
        name: v.string(),
        descriptionShort: v.optional(v.string()),
        descriptionMedium: v.optional(v.string()),
        descriptionFull: v.optional(v.string()),
        theoryOfChange: v.optional(v.string()),
        status: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        expectedDuration: v.optional(v.string()),
        fundingRaisedToDate: v.optional(v.number()),
        isActivelyFundraising: v.optional(v.boolean()),
        orgId: v.optional(v.id("orgs")),
        donationLinks: v.optional(v.array(donationLink)),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const doc of args.docs) {
      const id = await ctx.db.insert("projects", doc);
      ids.push(id);
    }
    return ids;
  },
});

export const insertGrants = mutation({
  args: {
    docs: v.array(
      v.object({
        name: v.optional(v.string()),
        funderFundId: v.optional(v.id("funds")),
        funderPersonId: v.optional(v.id("people")),
        funderOrgId: v.optional(v.id("orgs")),
        recipientPersonId: v.optional(v.id("people")),
        recipientOrgId: v.optional(v.id("orgs")),
        recipientProjectId: v.optional(v.id("projects")),
        amount: v.optional(v.number()),
        dateAwarded: v.optional(v.string()),
        purpose: v.optional(v.string()),
        sourceUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const doc of args.docs) {
      await ctx.db.insert("grants", doc);
    }
  },
});

export const insertPersonOrgs = mutation({
  args: {
    docs: v.array(
      v.object({
        personId: v.id("people"),
        orgId: v.id("orgs"),
        role: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        isCurrent: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const doc of args.docs) {
      await ctx.db.insert("personOrgs", doc);
    }
  },
});

export const insertFundPersons = mutation({
  args: {
    docs: v.array(
      v.object({
        fundId: v.id("funds"),
        personId: v.id("people"),
        role: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const doc of args.docs) {
      await ctx.db.insert("fundPersons", doc);
    }
  },
});

export const insertPersonProjects = mutation({
  args: {
    docs: v.array(
      v.object({
        personId: v.id("people"),
        projectId: v.id("projects"),
        role: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const doc of args.docs) {
      await ctx.db.insert("personProjects", doc);
    }
  },
});
