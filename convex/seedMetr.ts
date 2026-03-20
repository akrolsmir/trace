import { mutation } from "./_generated/server";

export const seedMetr = mutation({
  args: {},
  handler: async (ctx) => {
    // Find and delete existing METR org by slug
    const existing = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", "metr"))
      .first();

    if (existing) {
      // Delete all staff for this org
      const staff = await ctx.db
        .query("staff")
        .withIndex("by_org", (q) => q.eq("orgId", existing._id))
        .collect();
      for (const s of staff) {
        await ctx.db.delete(s._id);
      }

      // Delete all comments for this org
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_org", (q) => q.eq("orgId", existing._id))
        .collect();
      for (const c of comments) {
        await ctx.db.delete(c._id);
      }

      // Delete the org itself
      await ctx.db.delete(existing._id);
    }

    // Insert METR with accurate data
    const metr = await ctx.db.insert("orgs", {
      slug: "metr",
      name: "METR",
      subtitle: "Frontier AI model evaluations and risk assessment",
      description:
        "METR (Model Evaluation and Threat Research) is a nonprofit research institute that develops scientific methods to assess catastrophic risks from AI systems' autonomous capabilities. They design and run evaluations of frontier AI models, partnering with labs like OpenAI and Anthropic as well as government bodies like AISI, to measure dangerous capabilities and inform safety policies. Originally spun off from ARC Evals in December 2023, METR operates independently and does not accept funding from AI companies.",
      headcount: 30,
      totalFunding: "Unknown (major Audacious Project grant + foundation support)",
      budget2026: "Unknown",
      website: "https://metr.org",
      logoUrl: "https://metr.org/assets/images/gen/home/evals-logo-slideable.svg",
      donationUrl: "https://www.every.org/metr?donateTo=metr#/donate/card",
      email: "donations@metr.org",
      tags: ["evaluations", "frontier models", "autonomous capabilities", "policy", "safety benchmarks"],
    });

    // Leadership
    await ctx.db.insert("staff", { orgId: metr, name: "Beth Barnes", title: "Founder & CEO", order: 0 });
    await ctx.db.insert("staff", { orgId: metr, name: "Chris Painter", title: "Policy Director", order: 1 });

    // Technical Staff
    await ctx.db.insert("staff", { orgId: metr, name: "Ajeya Cotra", title: "Technical Staff", order: 2 });
    await ctx.db.insert("staff", { orgId: metr, name: "Daniel Filan", title: "Technical Staff", order: 3 });
    await ctx.db.insert("staff", { orgId: metr, name: "David Rein", title: "Technical Staff", order: 4 });
    await ctx.db.insert("staff", { orgId: metr, name: "Hjalmar Wijk", title: "Technical Staff", order: 5 });
    await ctx.db.insert("staff", { orgId: metr, name: "Joel Becker", title: "Technical Staff", order: 6 });
    await ctx.db.insert("staff", { orgId: metr, name: "Lawrence Chan", title: "Technical Staff", order: 7 });
    await ctx.db.insert("staff", { orgId: metr, name: "Lucas Sato", title: "Technical Staff", order: 8 });
    await ctx.db.insert("staff", { orgId: metr, name: "Manish Shetty", title: "Technical Staff", order: 9 });
    await ctx.db.insert("staff", { orgId: metr, name: "Megan Kinniment", title: "Technical Staff", order: 10 });
    await ctx.db.insert("staff", { orgId: metr, name: "Mischa Spiegelmock", title: "Technical Staff", order: 11 });
    await ctx.db.insert("staff", { orgId: metr, name: "Nate Rush", title: "Technical Staff", order: 12 });
    await ctx.db.insert("staff", { orgId: metr, name: "Neev Parikh", title: "Technical Staff", order: 13 });
    await ctx.db.insert("staff", { orgId: metr, name: "Nikola Jurkovic", title: "Technical Staff", order: 14 });
    await ctx.db.insert("staff", { orgId: metr, name: "Paarth Shah", title: "Technical Staff", order: 15 });
    await ctx.db.insert("staff", { orgId: metr, name: "Rasmus Faber-Espensen", title: "Technical Staff", order: 16 });
    await ctx.db.insert("staff", { orgId: metr, name: "Sydney Von Arx", title: "Technical Staff", order: 17 });
    await ctx.db.insert("staff", { orgId: metr, name: "Thomas Broadley", title: "Technical Staff", order: 18 });
    await ctx.db.insert("staff", { orgId: metr, name: "Thomas Kwa", title: "Technical Staff", order: 19 });
    await ctx.db.insert("staff", { orgId: metr, name: "Tom Cunningham", title: "Technical Staff", order: 20 });

    // Research Contractors
    await ctx.db.insert("staff", { orgId: metr, name: "Khalid Mahamud", title: "Research Contractor", order: 21 });
    await ctx.db.insert("staff", { orgId: metr, name: "Vincent Cheng", title: "Research Contractor", order: 22 });

    // Operations Staff
    await ctx.db.insert("staff", { orgId: metr, name: "Bhaskar Chaturvedi", title: "Operations Lead & Secretary", order: 23 });
    await ctx.db.insert("staff", { orgId: metr, name: "Jingyi Wang", title: "Operations Staff", order: 24 });
    await ctx.db.insert("staff", { orgId: metr, name: "Kris Chari", title: "Operations Staff", order: 25 });
    await ctx.db.insert("staff", { orgId: metr, name: "Rae She", title: "Operations Staff", order: 26 });
    await ctx.db.insert("staff", { orgId: metr, name: "Wilder Seitz", title: "Operations Staff", order: 27 });

    // Policy Staff
    await ctx.db.insert("staff", { orgId: metr, name: "Charles Foster", title: "Policy Staff", order: 28 });
    await ctx.db.insert("staff", { orgId: metr, name: "Jasmine Dhaliwal", title: "Policy Staff", order: 29 });
    await ctx.db.insert("staff", { orgId: metr, name: "Kit Harris", title: "Policy Staff", order: 30 });
    await ctx.db.insert("staff", { orgId: metr, name: "Michael Chen", title: "Policy Staff", order: 31 });

    return "Seeded METR org with 32 staff members";
  },
});
