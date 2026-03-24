"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { formatCurrency, formatDateFull as formatDate } from "../../lib/format";

function ExpandableText({ text, clamp = 5 }: { text: string; clamp?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [clamped, setClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [check, text]);

  const clampClass = clamp === 5 ? "line-clamp-5" : "line-clamp-3";

  return (
    <div>
      <div ref={ref} className={expanded ? "" : clampClass}>
        {text}
      </div>
      {clamped && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-warm-400 hover:text-warm-600 text-xs mt-1 transition-colors"
        >
          {expanded ? "show less" : "show more"}
        </button>
      )}
    </div>
  );
}

export default function OrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const org = useQuery(api.orgs.getBySlug, { slug });
  const people = useQuery(
    api.people.getByOrg,
    org ? { orgId: org._id } : "skip"
  );
  const projects = useQuery(
    api.projects.getByOrg,
    org ? { orgId: org._id } : "skip"
  );
  const grantsReceived = useQuery(
    api.grants.getByRecipientOrg,
    org ? { orgId: org._id } : "skip"
  );
  const grantsGiven = useQuery(
    api.grants.getByFunderOrg,
    org ? { orgId: org._id } : "skip"
  );

  if (org === undefined) {
    return (
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto text-sm text-warm-400">
          Loading...
        </div>
      </main>
    );
  }

  if (org === null) {
    return (
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-warm-400">Organization not found.</p>
          <Link href="/" className="text-sm text-accent hover:underline mt-2 inline-block">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-warm-400 hover:text-warm-600 transition-colors">
          &larr; All organizations
        </Link>

        {/* Header */}
        <div className="mt-6 mb-10 flex items-start gap-6">
          {org.logoUrl ? (
            <div className="w-[72px] h-[72px] rounded-[10px] border border-warm-200 text-warm-400 bg-warm-100 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={org.logoUrl}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-[72px] h-[72px] rounded-[10px] flex items-center justify-center bg-warm-100 border border-warm-200 text-warm-400 text-[0.7rem] font-medium uppercase tracking-wider shrink-0">
              {org.name.slice(0, 2)}
            </div>
          )}
          <div>
            <h1 className="font-logo text-3xl text-warm-900">{org.name}</h1>
            {org.descriptionShort && (
              <p className="text-warm-500 mt-1 text-lg font-light">{org.descriptionShort}</p>
            )}
            {org.location && (
              <p className="text-warm-400 text-sm mt-1">{org.location}</p>
            )}
            {(org.descriptionMedium || org.descriptionFull) && (
              <div className="mt-4 text-sm leading-relaxed text-warm-600 max-w-2xl">
                <ExpandableText text={(org.descriptionFull ?? org.descriptionMedium)!} />
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-xs text-warm-400 uppercase tracking-wider font-medium">
              Team Size
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">
              {org.teamSize ?? "-"}
            </div>
          </div>
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-xs text-warm-400 uppercase tracking-wider font-medium">
              Funding Raised
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">
              {formatCurrency(org.fundingRaisedToDate)}
            </div>
          </div>
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-xs text-warm-400 uppercase tracking-wider font-medium">
              Annual Budget
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">
              {formatCurrency(org.annualBudget)}
            </div>
          </div>
          {org.websiteUrl ? (
            <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
              <div className="text-xs text-warm-400 uppercase tracking-wider font-medium">
                Website
              </div>
              <div className="text-sm mt-3">
                <a
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-light transition-colors underline underline-offset-2"
                >
                  {org.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
              <div className="text-xs text-warm-400 uppercase tracking-wider font-medium">
                Founded
              </div>
              <div className="text-sm font-mono mt-3 text-warm-800">
                {formatDate(org.foundedDate) || "-"}
              </div>
            </div>
          )}
        </div>

        {/* Fundraising status */}
        {org.isActivelyFundraising && (
          <div className="mb-10 px-5 py-4 bg-accent-muted border border-accent/20 rounded-sm">
            <span className="text-sm font-medium text-accent">Actively fundraising</span>
            {org.fundingGoal && (
              <span className="text-sm text-warm-600 ml-2">
                &middot; Goal: {formatCurrency(org.fundingGoal)}
              </span>
            )}
            {org.fundingStage && (
              <span className="text-sm text-warm-500 ml-2">
                &middot; {org.fundingStage}
              </span>
            )}
          </div>
        )}

        {/* People */}
        {people && people.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
              People
            </h2>
            <div className="space-y-2">
              {people.map((p) => (
                <div key={p._id} className="text-sm flex items-baseline gap-3">
                  <span className="font-medium text-warm-800">{p.name}</span>
                  {p.role && <span className="text-warm-400">{p.role}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
              Projects
            </h2>
            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p._id} className="border border-warm-200 rounded-sm p-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium text-warm-800 text-sm">{p.name}</span>
                    {p.status && (
                      <span className="text-xs text-warm-400 uppercase tracking-wider">
                        {p.status}
                      </span>
                    )}
                  </div>
                  {p.descriptionShort && (
                    <p className="text-sm text-warm-500 mt-1">{p.descriptionShort}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* External links */}
        <section className="mb-10 flex flex-wrap gap-3">
          {org.donationLinks && org.donationLinks.length > 0 && (
            <a
              href={org.donationLinks[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors rounded-sm"
            >
              Donate{org.donationLinks[0].platform ? ` (${org.donationLinks[0].platform})` : ""}
            </a>
          )}
          {org.linkedinUrl && (
            <a
              href={org.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 border border-warm-300 text-warm-600 text-sm hover:bg-warm-50 transition-colors rounded-sm"
            >
              LinkedIn
            </a>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-warm-200 mb-10" />

        {/* Grants received */}
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
                      {g.funderOrgSlug ? (
                        <Link href={`/org/${g.funderOrgSlug}`} className="font-medium text-warm-800 hover:text-accent transition-colors">
                          {g.funderName}
                        </Link>
                      ) : g.funderFundSlug ? (
                        <Link href={`/funds/${g.funderFundSlug}`} className="font-medium text-warm-800 hover:text-accent transition-colors">
                          {g.funderName}
                        </Link>
                      ) : (
                        <span className="font-medium text-warm-800">
                          {g.funderName ?? g.name ?? "Unknown funder"}
                        </span>
                      )}
                      {g.purpose && (
                        <span className="text-warm-400 ml-2 truncate">&middot; {g.purpose}</span>
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

        {/* Grants given */}
        {grantsGiven && grantsGiven.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
              Grants Given ({grantsGiven.length})
            </h2>
            <div className="space-y-3">
              {grantsGiven
                .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
                .map((g) => (
                  <div
                    key={g._id}
                    className="flex items-baseline justify-between gap-4 text-sm border-b border-warm-100 pb-2"
                  >
                    <div className="min-w-0">
                      {g.recipientOrgSlug ? (
                        <Link href={`/org/${g.recipientOrgSlug}`} className="font-medium text-warm-800 hover:text-accent transition-colors">
                          {g.recipientName}
                        </Link>
                      ) : (
                        <span className="font-medium text-warm-800">
                          {g.recipientName ?? g.name ?? "Unknown recipient"}
                        </span>
                      )}
                      {g.purpose && (
                        <span className="text-warm-400 ml-2 truncate">&middot; {g.purpose}</span>
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
