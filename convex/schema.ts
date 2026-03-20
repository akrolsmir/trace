import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  orgs: defineTable({
    slug: v.string(),
    name: v.string(),
    subtitle: v.string(),
    description: v.string(),
    headcount: v.number(),
    totalFunding: v.string(),
    budget2026: v.string(),
    website: v.string(),
    logoUrl: v.optional(v.string()),
    budgetUrl: v.optional(v.string()),
    donationUrl: v.optional(v.string()),
    email: v.optional(v.string()),
    tags: v.array(v.string()),
  }).index("by_slug", ["slug"]),

  staff: defineTable({
    orgId: v.id("orgs"),
    name: v.string(),
    title: v.string(),
    linkedinUrl: v.optional(v.string()),
    order: v.number(),
  }).index("by_org", ["orgId"]),

  comments: defineTable({
    orgId: v.id("orgs"),
    authorName: v.string(),
    body: v.string(),
    rating: v.number(),
    createdAt: v.number(),
  }).index("by_org", ["orgId"]),
});
