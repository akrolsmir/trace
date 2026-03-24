import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const donationLink = v.object({
  url: v.string(),
  platform: v.optional(v.string()),
});

export default defineSchema({
  organizations: defineTable({
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
  }).index("by_slug", ["slug"]),

  people: defineTable({
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
  }).index("by_name", ["name"]),

  funds: defineTable({
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
  }).index("by_name", ["name"]),

  projects: defineTable({
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
    orgId: v.optional(v.id("organizations")),
    donationLinks: v.optional(v.array(donationLink)),
  }).index("by_org", ["orgId"]),

  grants: defineTable({
    name: v.optional(v.string()),
    funderFundId: v.optional(v.id("funds")),
    funderPersonId: v.optional(v.id("people")),
    funderOrgId: v.optional(v.id("organizations")),
    recipientPersonId: v.optional(v.id("people")),
    recipientOrgId: v.optional(v.id("organizations")),
    recipientProjectId: v.optional(v.id("projects")),
    amount: v.optional(v.number()),
    dateAwarded: v.optional(v.string()),
    purpose: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
  })
    .index("by_funderFund", ["funderFundId"])
    .index("by_funderOrg", ["funderOrgId"])
    .index("by_recipientOrg", ["recipientOrgId"])
    .index("by_recipientPerson", ["recipientPersonId"])
    .index("by_recipientProject", ["recipientProjectId"]),

  personOrgs: defineTable({
    personId: v.id("people"),
    orgId: v.id("organizations"),
    role: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isCurrent: v.optional(v.boolean()),
  })
    .index("by_person", ["personId"])
    .index("by_org", ["orgId"]),

  fundPersons: defineTable({
    fundId: v.id("funds"),
    personId: v.id("people"),
    role: v.optional(v.string()),
  })
    .index("by_fund", ["fundId"])
    .index("by_person", ["personId"]),

  personProjects: defineTable({
    personId: v.id("people"),
    projectId: v.id("projects"),
    role: v.optional(v.string()),
  })
    .index("by_person", ["personId"])
    .index("by_project", ["projectId"]),
});
