import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("orgs").first();
    if (existing) return "Already seeded";

    // --- Mox ---
    const mox = await ctx.db.insert("orgs", {
      slug: "mox",
      name: "Mox",
      subtitle: "AI alignment research",
      description:
        "Mox conducts technical AI alignment research focused on interpretability and reward modeling. The team publishes openly and collaborates with leading AI labs on safety evaluations.",
      headcount: 12,
      totalFunding: "$8M",
      budget2026: "$4.2M",
      website: "https://mox.ai",
      donationUrl: "https://mox.ai/donate",
      email: "info@mox.ai",
      tags: ["alignment", "interpretability", "technical research"],
    });
    await ctx.db.insert("staff", { orgId: mox, name: "Elena Vasquez", title: "Executive Director", order: 0 });
    await ctx.db.insert("staff", { orgId: mox, name: "James Chen", title: "Head of Research", order: 1 });
    await ctx.db.insert("staff", { orgId: mox, name: "Priya Sharma", title: "Research Scientist", order: 2 });
    await ctx.db.insert("comments", { orgId: mox, authorName: "Sarah K.", body: "Impressive interpretability work. Their recent paper on feature circuits was a real contribution.", rating: 5, createdAt: 1710000000000 });
    await ctx.db.insert("comments", { orgId: mox, authorName: "David L.", body: "Small team but punching above their weight. Would like to see more public engagement.", rating: 4, createdAt: 1712000000000 });

    // --- Lightcone Infrastructure ---
    const lightcone = await ctx.db.insert("orgs", {
      slug: "lightcone-infrastructure",
      name: "Lightcone Infrastructure",
      subtitle: "Rationalist community infrastructure",
      description:
        "Lightcone Infrastructure builds and maintains key community resources including LessWrong, the AI Alignment Forum, and hosts rationalist community events. They focus on improving the information ecosystem around AI safety.",
      headcount: 18,
      totalFunding: "$12M",
      budget2026: "$5.5M",
      website: "https://lightcone.org",
      budgetUrl: "https://lightcone.org/budget",
      donationUrl: "https://lightcone.org/donate",
      email: "team@lightcone.org",
      tags: ["community", "LessWrong", "information ecosystem"],
    });
    await ctx.db.insert("staff", { orgId: lightcone, name: "Oliver Habryka", title: "CEO", order: 0 });
    await ctx.db.insert("staff", { orgId: lightcone, name: "Ray Arnold", title: "COO", order: 1 });
    await ctx.db.insert("comments", { orgId: lightcone, authorName: "Alex M.", body: "LessWrong is indispensable infrastructure for the alignment community. Glad someone is maintaining it seriously.", rating: 5, createdAt: 1711000000000 });
    await ctx.db.insert("comments", { orgId: lightcone, authorName: "Nina P.", body: "Good community work but I question whether forum infrastructure is the highest-leverage safety intervention.", rating: 3, createdAt: 1713000000000 });
    await ctx.db.insert("comments", { orgId: lightcone, authorName: "Tom R.", body: "The Alignment Forum has been crucial for my research. High-quality moderation.", rating: 4, createdAt: 1714000000000 });

    // --- Forethought Foundation ---
    const forethought = await ctx.db.insert("orgs", {
      slug: "forethought-foundation",
      name: "Forethought Foundation",
      subtitle: "AI safety grantmaking",
      description:
        "Forethought Foundation identifies and funds promising AI safety research and researchers through targeted grants. They specialize in finding talent and projects overlooked by larger funders.",
      headcount: 8,
      totalFunding: "$25M",
      budget2026: "$8M",
      website: "https://forethought.org",
      budgetUrl: "https://forethought.org/financials",
      donationUrl: "https://forethought.org/give",
      email: "grants@forethought.org",
      tags: ["grantmaking", "talent search", "funding"],
    });
    await ctx.db.insert("staff", { orgId: forethought, name: "William MacAskill", title: "Co-founder", order: 0 });
    await ctx.db.insert("staff", { orgId: forethought, name: "Jade Leung", title: "Director of Grants", order: 1 });
    await ctx.db.insert("comments", { orgId: forethought, authorName: "Rachel B.", body: "They funded three researchers in my department. Great eye for talent and very responsive.", rating: 5, createdAt: 1710500000000 });
    await ctx.db.insert("comments", { orgId: forethought, authorName: "Mike T.", body: "Application process was straightforward. Decision came quickly. Solid grantmaker.", rating: 4, createdAt: 1712500000000 });

    // --- METR ---
    const metr = await ctx.db.insert("orgs", {
      slug: "metr",
      name: "METR",
      subtitle: "Frontier model evaluations",
      description:
        "METR (Model Evaluation and Threat Research) designs and runs evaluations of frontier AI models to assess dangerous capabilities. They work with AI labs and governments to establish safety benchmarks.",
      headcount: 25,
      totalFunding: "$15M",
      budget2026: "$7M",
      website: "https://metr.org",
      budgetUrl: "https://metr.org/transparency",
      donationUrl: "https://metr.org/support",
      email: "contact@metr.org",
      tags: ["evaluations", "frontier models", "policy"],
    });
    await ctx.db.insert("staff", { orgId: metr, name: "Beth Barnes", title: "CEO", order: 0 });
    await ctx.db.insert("staff", { orgId: metr, name: "Ryan Greenblatt", title: "Head of Evaluations", order: 1 });
    await ctx.db.insert("staff", { orgId: metr, name: "Karina Nguyen", title: "Research Lead", order: 2 });
    await ctx.db.insert("comments", { orgId: metr, authorName: "Chris W.", body: "The most important org in evals right now. Their autonomy benchmarks have shaped lab policy.", rating: 5, createdAt: 1711500000000 });
    await ctx.db.insert("comments", { orgId: metr, authorName: "Laura S.", body: "Rigorous methodology. I trust their eval results more than any other group's.", rating: 5, createdAt: 1713500000000 });
    await ctx.db.insert("comments", { orgId: metr, authorName: "Jeff H.", body: "Would love to see them expand into multi-agent evals. Current focus is solid though.", rating: 4, createdAt: 1714500000000 });

    // --- Tarbell ---
    const tarbell = await ctx.db.insert("orgs", {
      slug: "tarbell",
      name: "Tarbell",
      subtitle: "AI safety investigative journalism",
      description:
        "Tarbell is an investigative journalism outlet focused on AI safety and governance. They produce in-depth reporting on AI lab practices, safety incidents, and policy developments.",
      headcount: 6,
      totalFunding: "$3M",
      budget2026: "$1.8M",
      website: "https://tarbell.org",
      donationUrl: "https://tarbell.org/support",
      email: "tips@tarbell.org",
      tags: ["journalism", "transparency", "governance"],
    });
    await ctx.db.insert("staff", { orgId: tarbell, name: "Katya Petrov", title: "Editor-in-Chief", order: 0 });
    await ctx.db.insert("staff", { orgId: tarbell, name: "Marcus Webb", title: "Senior Reporter", order: 1 });
    await ctx.db.insert("comments", { orgId: tarbell, authorName: "Jen F.", body: "Finally, real investigative journalism in the AI safety space. Their reporting on lab practices was eye-opening.", rating: 5, createdAt: 1712000000000 });
    await ctx.db.insert("comments", { orgId: tarbell, authorName: "Aaron K.", body: "Good journalism but small team means limited coverage. Hope they can scale up.", rating: 4, createdAt: 1714000000000 });

    return "Seeded 5 orgs with staff and comments";
  },
});
