"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { formatCurrency, formatDate, formatRole } from "../../lib/format";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const person = useQuery(api.people.getBySlug, { slug });
  const orgs = useQuery(
    api.people.getOrgs,
    person ? { personId: person._id } : "skip"
  );
  const projects = useQuery(
    api.people.getProjects,
    person ? { personId: person._id } : "skip"
  );
  const funds = useQuery(
    api.people.getFunds,
    person ? { personId: person._id } : "skip"
  );
  const grantsReceived = useQuery(
    api.people.getGrantsReceived,
    person ? { personId: person._id } : "skip"
  );

  if (person === undefined) {
    return (
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto text-sm text-warm-400">
          Loading...
        </div>
      </main>
    );
  }

  if (person === null) {
    return (
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-warm-400">Person not found.</p>
          <Link
            href="/people"
            className="text-sm text-accent hover:underline mt-2 inline-block"
          >
            Back to people
          </Link>
        </div>
      </main>
    );
  }

  const externalLinks = [
    person.personalWebsiteUrl && { label: "Website", href: person.personalWebsiteUrl },
    person.linkedinUrl && { label: "LinkedIn", href: person.linkedinUrl },
    person.twitterUrl && { label: "Twitter", href: person.twitterUrl },
    person.lesswrongHandle && {
      label: "LessWrong",
      href: `https://www.lesswrong.com/users/${person.lesswrongHandle}`,
    },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/people"
          className="text-sm text-warm-400 hover:text-warm-600 transition-colors"
        >
          &larr; All people
        </Link>

        {/* ── Header ─────────────────────────────── */}
        <div className="mt-6 mb-10 flex items-start gap-6">
          {/* Avatar */}
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-warm-100 border border-warm-200 text-warm-400 text-sm font-medium tracking-wider shrink-0">
            {initials(person.name)}
          </div>
          <div>
            <h1 className="font-logo text-3xl text-warm-900 leading-tight">
              {person.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {person.location && (
                <span className="text-sm text-warm-400">{person.location}</span>
              )}
              {person.isGrantmaker && (
                <span className="px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-accent bg-accent-muted rounded-sm">
                  Grantmaker
                </span>
              )}
              {person.isRegrantor && (
                <span className="px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-warm-500 bg-warm-100 rounded-sm">
                  Regrantor
                </span>
              )}
              {person.gwwcPledge && (
                <span className="px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-warm-500 bg-warm-100 rounded-sm">
                  GWWC Pledge
                </span>
              )}
            </div>
            {person.bio && (
              <p className="mt-4 text-sm leading-relaxed text-warm-600 max-w-2xl">
                {person.bio}
              </p>
            )}
          </div>
        </div>

        {/* ── External links ─────────────────────── */}
        {externalLinks.length > 0 && (
          <section className="mb-10 flex flex-wrap gap-3">
            {externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 border border-warm-300 text-warm-600 text-sm hover:bg-warm-50 transition-colors rounded-sm"
              >
                {link.label}
              </a>
            ))}
            {person.contactEmail && (
              <a
                href={`mailto:${person.contactEmail}`}
                className="px-5 py-2.5 border border-warm-300 text-warm-600 text-sm hover:bg-warm-50 transition-colors rounded-sm"
              >
                Email
              </a>
            )}
          </section>
        )}

        {/* ── Funds ──────────────────────────────── */}
        {funds && funds.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
              Funds
            </h2>
            <div className="space-y-3">
              {funds.map((fund) => (
                <Link
                  key={fund._id}
                  href={`/funds/${fund.slug}`}
                  className="flex items-baseline justify-between gap-4 border border-warm-200 rounded-sm p-4 hover:border-warm-300 transition-colors group"
                >
                  <div>
                    <span className="font-medium text-warm-800 text-sm group-hover:text-accent transition-colors">
                      {fund.name}
                    </span>
                    {fund.role && (
                      <span className="text-xs text-warm-400 ml-2">
                        {formatRole(fund.role)}
                      </span>
                    )}
                  </div>
                  {fund.totalDeployedToDate != null && (
                    <span className="font-mono text-xs text-warm-400 tabular-nums shrink-0">
                      {formatCurrency(fund.totalDeployedToDate)} deployed
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Organizations ──────────────────────── */}
        {orgs && orgs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
              Organizations
            </h2>
            <div className="space-y-2">
              {orgs.map((org) => (
                <div key={org._id} className="flex items-baseline gap-3 text-sm">
                  <Link
                    href={`/org/${org.slug}`}
                    className="font-medium text-warm-800 hover:text-accent transition-colors"
                  >
                    {org.name}
                  </Link>
                  {org.role && (
                    <span className="text-warm-400">{formatRole(org.role)}</span>
                  )}
                  {org.isCurrent === false && (
                    <span className="text-xs text-warm-300">Former</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Projects ───────────────────────────── */}
        {projects && projects.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="border border-warm-200 rounded-sm p-4"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium text-warm-800 text-sm">
                      {project.name}
                    </span>
                    {project.role && (
                      <span className="text-xs text-warm-400">
                        {formatRole(project.role)}
                      </span>
                    )}
                  </div>
                  {project.descriptionShort && (
                    <p className="text-sm text-warm-500 mt-1">
                      {project.descriptionShort}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Divider ────────────────────────────── */}
        {grantsReceived && grantsReceived.length > 0 && (
          <div className="border-t border-warm-200 mb-10" />
        )}

        {/* ── Grants received ────────────────────── */}
        {grantsReceived && grantsReceived.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
              Grants Received ({grantsReceived.length})
            </h2>
            <div className="space-y-3">
              {grantsReceived
                .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
                .map((g) => (
                  <div
                    key={g._id}
                    className="flex items-baseline justify-between gap-4 text-sm border-b border-warm-100 pb-2"
                  >
                    <div className="min-w-0">
                      {g.funderFundSlug ? (
                        <Link
                          href={`/funds/${g.funderFundSlug}`}
                          className="font-medium text-warm-800 hover:text-accent transition-colors"
                        >
                          {g.funderName}
                        </Link>
                      ) : g.funderOrgSlug ? (
                        <Link
                          href={`/org/${g.funderOrgSlug}`}
                          className="font-medium text-warm-800 hover:text-accent transition-colors"
                        >
                          {g.funderName}
                        </Link>
                      ) : (
                        <span className="font-medium text-warm-800">
                          {g.funderName ?? g.name ?? "Unknown funder"}
                        </span>
                      )}
                      {g.purpose && (
                        <span className="text-warm-400 ml-2">
                          &middot; {g.purpose}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-3 shrink-0">
                      {g.amount != null && (
                        <span className="font-mono text-warm-700 tabular-nums">
                          {formatCurrency(g.amount)}
                        </span>
                      )}
                      {g.dateAwarded && (
                        <span className="text-xs text-warm-300">
                          {formatDate(g.dateAwarded)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
