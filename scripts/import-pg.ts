import { Client } from "pg";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// ── Helpers ──────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(name: string, used: Set<string>): string {
  let slug = slugify(name);
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }
  let i = 2;
  while (used.has(`${slug}-${i}`)) i++;
  slug = `${slug}-${i}`;
  used.add(slug);
  return slug;
}

/** Convert PG numeric (string | null) to number | undefined */
function num(val: string | number | null | undefined): number | undefined {
  if (val == null) return undefined;
  const n = typeof val === "number" ? val : parseFloat(val);
  return isNaN(n) ? undefined : n;
}

/** Convert null to undefined, pass strings through */
function str(val: string | null | undefined): string | undefined {
  return val ?? undefined;
}

/** Convert PG boolean | null to boolean | undefined */
function bool(val: boolean | null | undefined): boolean | undefined {
  return val ?? undefined;
}

/** Convert PG timestamp to ISO date string */
function isoDate(val: string | Date | null | undefined): string | undefined {
  if (val == null) return undefined;
  const d = val instanceof Date ? val : new Date(val);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Parse donation_links JSONB into {url, platform?}[] */
function parseDonationLinks(
  val: unknown
): { url: string; platform?: string }[] | undefined {
  if (!val || !Array.isArray(val)) return undefined;
  const links = val
    .filter((l: any) => l && typeof l.url === "string")
    .map((l: any) => {
      const link: { url: string; platform?: string } = { url: l.url };
      if (l.platform) link.platform = l.platform;
      return link;
    });
  return links.length > 0 ? links : undefined;
}

/** Strip undefined values from an object (Convex doesn't accept explicit undefined) */
function clean<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as any;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v;
  }
  return result;
}

/** Split an array into chunks */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── Main ─────────────────────────────────────────────────

const BATCH_SIZE = 100;

async function main() {
  // Connect to PG
  const pg = new Client({
    host: process.env.SUPABASE_PG_HOST,
    port: 5432,
    database: "postgres",
    user: process.env.SUPABASE_PG_USER,
    password: process.env.SUPABASE_PG_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();
  console.log("Connected to PG.");

  // Connect to Convex
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  console.log("Connected to Convex.");

  // Confirm
  process.stdout.write(
    "\nThis will DELETE all existing Convex data and reimport from PG. Continue? (y/n) "
  );
  const answer = await new Promise<string>((resolve) => {
    process.stdin.once("data", (data) => resolve(data.toString().trim()));
  });
  if (answer.toLowerCase() !== "y") {
    console.log("Aborted.");
    await pg.end();
    process.exit(0);
  }

  // Clear all existing data
  console.log("\nClearing existing Convex data...");
  const cleared = await convex.mutation(api.import.clearAll, {});
  console.log("Cleared:", cleared);

  // ── 1. Organizations ────────────────────────────────────
  console.log("\nImporting organizations...");
  const { rows: pgOrgs } = await pg.query("SELECT * FROM app.organizations");
  const usedSlugs = new Set<string>();
  const orgDocs = pgOrgs.map((r: any) =>
    clean({
      slug: uniqueSlug(r.name, usedSlugs),
      name: r.name,
      descriptionShort: str(r.description_short),
      descriptionMedium: str(r.description_medium),
      descriptionFull: str(r.description_full),
      theoryOfChange: str(r.theory_of_change),
      websiteUrl: str(r.website_url),
      logoUrl: str(r.logo_url),
      linkedinUrl: str(r.linkedin_url),
      location: str(r.location),
      foundedDate: isoDate(r.founded_date),
      teamSize: num(r.team_size),
      annualBudget: num(r.annual_budget),
      monthlyBurnRate: num(r.monthly_burn_rate),
      currentRunwayMonths: num(r.current_runway_months),
      fundingGoal: num(r.funding_goal),
      fundingStage: str(r.funding_stage),
      isActivelyFundraising: bool(r.is_actively_fundraising),
      fundingRaisedToDate: num(r.funding_raised_to_date),
      fiscalSponsor: str(r.fiscal_sponsor),
      donationLinks: parseDonationLinks(r.donation_links),
    })
  );

  const orgMap = new Map<string, Id<"orgs">>();
  for (const batch of chunk(orgDocs, BATCH_SIZE)) {
    const ids = await convex.mutation(api.import.insertOrgs, {
      docs: batch,
    });
    // Match returned IDs to PG UUIDs by batch position
    const batchStart = orgDocs.indexOf(batch[0]);
    ids.forEach((id: Id<"orgs">, i: number) => {
      orgMap.set(pgOrgs[batchStart + i].id, id);
    });
  }
  console.log(`  ${orgMap.size} organizations imported.`);

  // ── 2. People ───────────────────────────────────────────
  console.log("Importing people...");
  const { rows: pgPeople } = await pg.query("SELECT * FROM app.persons");
  const usedPeopleSlugs = new Set<string>();
  const peopleDocs = pgPeople.map((r: any) =>
    clean({
      slug: uniqueSlug(r.name, usedPeopleSlugs),
      name: r.name,
      bio: str(r.bio),
      profileImageUrl: str(r.profile_image_url),
      linkedinUrl: str(r.linkedin_url),
      twitterUrl: str(r.twitter_url),
      lesswrongHandle: str(r.lesswrong_handle),
      gwwcPledge: bool(r.gwwc_pledge),
      personalWebsiteUrl: str(r.personal_website_url),
      contactEmail: str(r.contact_email),
      isGrantmaker: bool(r.is_grantmaker),
      isRegrantor: bool(r.is_regrantor),
      location: str(r.location),
    })
  );

  const personMap = new Map<string, Id<"people">>();
  for (const batch of chunk(peopleDocs, BATCH_SIZE)) {
    const ids = await convex.mutation(api.import.insertPeople, { docs: batch });
    const batchStart = peopleDocs.indexOf(batch[0]);
    ids.forEach((id: Id<"people">, i: number) => {
      personMap.set(pgPeople[batchStart + i].id, id);
    });
  }
  console.log(`  ${personMap.size} people imported.`);

  // ── 3. Funds ────────────────────────────────────────────
  console.log("Importing funds...");
  const { rows: pgFunds } = await pg.query("SELECT * FROM app.funds");
  const usedFundSlugs = new Set<string>();
  const fundDocs = pgFunds.map((r: any) =>
    clean({
      slug: uniqueSlug(r.name, usedFundSlugs),
      name: r.name,
      descriptionShort: str(r.description_short),
      descriptionMedium: str(r.description_medium),
      descriptionFull: str(r.description_full),
      type: str(r.type),
      websiteUrl: str(r.website_url),
      logoUrl: str(r.logo_url),
      totalDeployedToDate: num(r.total_deployed_to_date),
      expectedAnnualDistribution: num(r.expected_annual_distribution),
      applicationUrl: str(r.application_url),
      applicationInfo: str(r.application_info),
      donationLinks: parseDonationLinks(r.donation_links),
    })
  );

  const fundMap = new Map<string, Id<"funds">>();
  for (const batch of chunk(fundDocs, BATCH_SIZE)) {
    const ids = await convex.mutation(api.import.insertFunds, { docs: batch });
    const batchStart = fundDocs.indexOf(batch[0]);
    ids.forEach((id: Id<"funds">, i: number) => {
      fundMap.set(pgFunds[batchStart + i].id, id);
    });
  }
  console.log(`  ${fundMap.size} funds imported.`);

  // ── 4. Projects ─────────────────────────────────────────
  console.log("Importing projects...");
  const { rows: pgProjects } = await pg.query("SELECT * FROM app.projects");
  const projectDocs = pgProjects.map((r: any) =>
    clean({
      name: r.name,
      descriptionShort: str(r.description_short),
      descriptionMedium: str(r.description_medium),
      descriptionFull: str(r.description_full),
      theoryOfChange: str(r.theory_of_change),
      status: str(r.status),
      startDate: isoDate(r.start_date),
      endDate: isoDate(r.end_date),
      expectedDuration: str(r.expected_duration),
      fundingRaisedToDate: num(r.funding_raised_to_date),
      isActivelyFundraising: bool(r.is_actively_fundraising),
      orgId: r.org_id ? orgMap.get(r.org_id) : undefined,
      donationLinks: parseDonationLinks(r.donation_links),
    })
  );

  const projectMap = new Map<string, Id<"projects">>();
  for (const batch of chunk(projectDocs, BATCH_SIZE)) {
    const ids = await convex.mutation(api.import.insertProjects, {
      docs: batch,
    });
    const batchStart = projectDocs.indexOf(batch[0]);
    ids.forEach((id: Id<"projects">, i: number) => {
      projectMap.set(pgProjects[batchStart + i].id, id);
    });
  }
  console.log(`  ${projectMap.size} projects imported.`);

  // ── 5. Grants ───────────────────────────────────────────
  console.log("Importing grants...");
  const { rows: pgGrants } = await pg.query("SELECT * FROM app.grants");
  let grantOrphans = 0;
  const grantDocs = pgGrants.map((r: any) => {
    const doc: Record<string, unknown> = {};
    if (r.name) doc.name = r.name;

    // Funder FK resolution
    if (r.funder_fund_id) {
      const id = fundMap.get(r.funder_fund_id);
      if (id) doc.funderFundId = id;
      else grantOrphans++;
    }
    if (r.funder_person_id) {
      const id = personMap.get(r.funder_person_id);
      if (id) doc.funderPersonId = id;
      else grantOrphans++;
    }
    if (r.funder_org_id) {
      const id = orgMap.get(r.funder_org_id);
      if (id) doc.funderOrgId = id;
      else grantOrphans++;
    }

    // Recipient FK resolution
    if (r.recipient_person_id) {
      const id = personMap.get(r.recipient_person_id);
      if (id) doc.recipientPersonId = id;
      else grantOrphans++;
    }
    if (r.recipient_org_id) {
      const id = orgMap.get(r.recipient_org_id);
      if (id) doc.recipientOrgId = id;
      else grantOrphans++;
    }
    if (r.recipient_project_id) {
      const id = projectMap.get(r.recipient_project_id);
      if (id) doc.recipientProjectId = id;
      else grantOrphans++;
    }

    if (r.amount != null) doc.amount = num(r.amount);
    if (r.date_awarded) doc.dateAwarded = isoDate(r.date_awarded);
    if (r.purpose) doc.purpose = r.purpose;
    if (r.source_url) doc.sourceUrl = r.source_url;

    return doc;
  });

  for (const batch of chunk(grantDocs, BATCH_SIZE)) {
    await convex.mutation(api.import.insertGrants, { docs: batch as any });
  }
  console.log(`  ${grantDocs.length} grants imported.`);
  if (grantOrphans > 0) {
    console.log(`  ⚠ ${grantOrphans} orphaned FK references skipped.`);
  }

  // ── 6. Person-Org links ─────────────────────────────────
  console.log("Importing person-org links...");
  const { rows: pgPersonOrgs } = await pg.query(
    "SELECT * FROM app.person_orgs"
  );
  const personOrgDocs = pgPersonOrgs
    .map((r: any) => {
      const personId = personMap.get(r.person_id);
      const orgId = orgMap.get(r.org_id);
      if (!personId || !orgId) return null;
      return clean({
        personId,
        orgId,
        role: str(r.role),
        startDate: isoDate(r.start_date),
        endDate: isoDate(r.end_date),
        isCurrent: bool(r.is_current),
      });
    })
    .filter(Boolean);

  for (const batch of chunk(personOrgDocs, BATCH_SIZE)) {
    await convex.mutation(api.import.insertPersonOrgs, {
      docs: batch as any,
    });
  }
  console.log(`  ${personOrgDocs.length} person-org links imported.`);

  // ── 7. Fund-Person links ────────────────────────────────
  console.log("Importing fund-person links...");
  const { rows: pgFundPersons } = await pg.query(
    "SELECT * FROM app.fund_persons"
  );
  const fundPersonDocs = pgFundPersons
    .map((r: any) => {
      const fundId = fundMap.get(r.fund_id);
      const personId = personMap.get(r.person_id);
      if (!fundId || !personId) return null;
      return clean({
        fundId,
        personId,
        role: str(r.role),
      });
    })
    .filter(Boolean);

  for (const batch of chunk(fundPersonDocs, BATCH_SIZE)) {
    await convex.mutation(api.import.insertFundPersons, {
      docs: batch as any,
    });
  }
  console.log(`  ${fundPersonDocs.length} fund-person links imported.`);

  // ── 8. Person-Project links ─────────────────────────────
  console.log("Importing person-project links...");
  const { rows: pgPersonProjects } = await pg.query(
    "SELECT * FROM app.person_projects"
  );
  const personProjectDocs = pgPersonProjects
    .map((r: any) => {
      const personId = personMap.get(r.person_id);
      const projectId = projectMap.get(r.project_id);
      if (!personId || !projectId) return null;
      return clean({
        personId,
        projectId,
        role: str(r.role),
      });
    })
    .filter(Boolean);

  for (const batch of chunk(personProjectDocs, BATCH_SIZE)) {
    await convex.mutation(api.import.insertPersonProjects, {
      docs: batch as any,
    });
  }
  console.log(`  ${personProjectDocs.length} person-project links imported.`);

  // ── Summary ─────────────────────────────────────────────
  console.log("\n✓ Import complete.");
  console.log(
    `  Organizations: ${orgMap.size}, People: ${personMap.size}, Funds: ${fundMap.size}, Projects: ${projectMap.size}`
  );
  console.log(
    `  Grants: ${grantDocs.length}, PersonOrgs: ${personOrgDocs.length}, FundPersons: ${fundPersonDocs.length}, PersonProjects: ${personProjectDocs.length}`
  );

  await pg.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
