"use client";

import { use, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { formatCurrency, formatFullCurrency, formatDate, formatRole } from "../../lib/format";

type SortKey = "recipient" | "amount" | "date";
type SortDir = "asc" | "desc";

export default function FundPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const fund = useQuery(api.funds.getBySlug, { slug });
  const grants = useQuery(
    api.funds.getGrants,
    fund ? { fundId: fund._id } : "skip"
  );
  const people = useQuery(
    api.funds.getPeople,
    fund ? { fundId: fund._id } : "skip"
  );

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("amount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "recipient" ? "asc" : "desc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  const filtered = useMemo(() => {
    if (!grants) return [];
    const q = search.toLowerCase();
    const list = q
      ? grants.filter(
          (g) =>
            (g.recipientName?.toLowerCase().includes(q) ?? false) ||
            (g.name?.toLowerCase().includes(q) ?? false) ||
            (g.purpose?.toLowerCase().includes(q) ?? false)
        )
      : [...grants];

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "recipient") {
        cmp = (a.recipientName ?? "").localeCompare(b.recipientName ?? "");
      } else if (sortKey === "amount") {
        cmp = (a.amount ?? 0) - (b.amount ?? 0);
      } else if (sortKey === "date") {
        cmp = (a.dateAwarded ?? "").localeCompare(b.dateAwarded ?? "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [grants, search, sortKey, sortDir]);

  const totalGranted = useMemo(() => {
    if (!grants) return 0;
    return grants.reduce((sum, g) => sum + (g.amount ?? 0), 0);
  }, [grants]);

  if (fund === undefined) {
    return (
      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto text-sm text-warm-400">
          Loading...
        </div>
      </main>
    );
  }

  if (fund === null) {
    return (
      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-warm-400">Fund not found.</p>
          <Link
            href="/funds"
            className="text-sm text-accent hover:underline mt-2 inline-block"
          >
            Back to funds
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/funds"
          className="text-sm text-warm-400 hover:text-warm-600 transition-colors"
        >
          &larr; All funds
        </Link>

        {/* ── Header ─────────────────────────────── */}
        <div className="mt-6 mb-10">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-logo text-3xl text-warm-900 leading-tight">
              {fund.name}
            </h1>
            {fund.type && (
              <span className="shrink-0 mt-1 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-widest text-warm-400 border border-warm-200 rounded-sm bg-warm-50">
                {fund.type}
              </span>
            )}
          </div>
          {fund.descriptionShort && (
            <p className="text-warm-500 mt-3 text-lg font-light max-w-3xl leading-relaxed">
              {fund.descriptionShort}
            </p>
          )}
          {fund.descriptionMedium && (
            <p className="mt-4 text-sm leading-relaxed text-warm-600 max-w-3xl">
              {fund.descriptionMedium}
            </p>
          )}
        </div>

        {/* ── Stats ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-[0.65rem] text-warm-400 uppercase tracking-widest font-medium">
              Total Deployed
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">
              {formatCurrency(fund.totalDeployedToDate)}
            </div>
          </div>
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-[0.65rem] text-warm-400 uppercase tracking-widest font-medium">
              Annual Distribution
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">
              {formatCurrency(fund.expectedAnnualDistribution)}
            </div>
          </div>
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-[0.65rem] text-warm-400 uppercase tracking-widest font-medium">
              Grants in Database
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">
              {grants?.length ?? "-"}
            </div>
          </div>
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-[0.65rem] text-warm-400 uppercase tracking-widest font-medium">
              Sum of Grants
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">
              {grants ? formatCurrency(totalGranted) : "-"}
            </div>
          </div>
        </div>

        {/* ── People ─────────────────────────────── */}
        {people && people.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
              People
            </h2>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {people.map((p) => (
                <div key={p._id} className="text-sm flex items-baseline gap-2">
                  <span className="font-medium text-warm-800">{p.name}</span>
                  {p.role && (
                    <span className="text-warm-400 text-xs">
                      {formatRole(p.role)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Links ──────────────────────────────── */}
        <section className="mb-10 flex flex-wrap gap-3">
          {fund.websiteUrl && (
            <a
              href={fund.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 border border-warm-300 text-warm-600 text-sm hover:bg-warm-50 transition-colors rounded-sm"
            >
              Website
            </a>
          )}
          {fund.applicationUrl && (
            <a
              href={fund.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors rounded-sm"
            >
              Apply for Funding
            </a>
          )}
          {fund.donationLinks && fund.donationLinks.length > 0 && (
            <a
              href={fund.donationLinks[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 border border-warm-300 text-warm-600 text-sm hover:bg-warm-50 transition-colors rounded-sm"
            >
              Donate
            </a>
          )}
        </section>

        {/* ── Application info ───────────────────── */}
        {fund.applicationInfo && (
          <section className="mb-10 px-5 py-4 bg-warm-50 border border-warm-200 rounded-sm">
            <div className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-2">
              Application Info
            </div>
            <p className="text-sm text-warm-600 leading-relaxed">
              {fund.applicationInfo}
            </p>
          </section>
        )}

        {/* ── Divider ────────────────────────────── */}
        <div className="border-t border-warm-200 mb-10" />

        {/* ── Grants table ───────────────────────── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-logo text-xl text-warm-900">Grants</h2>
              {grants && (
                <p className="text-xs text-warm-400 mt-1">
                  {filtered.length === grants.length
                    ? `${grants.length} grants`
                    : `${filtered.length} of ${grants.length} grants`}
                  {search && " matching your search"}
                </p>
              )}
            </div>
            <input
              type="text"
              placeholder="Search recipients, names, purposes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 bg-warm-50 border border-warm-200 text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-warm-400 focus:bg-white transition-all rounded-sm"
            />
          </div>

          {grants === undefined ? (
            <p className="text-sm text-warm-400 py-8">Loading grants...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-warm-400 py-8">
              {search ? "No grants match your search." : "No grants found."}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-warm-200 text-left">
                    <th
                      className="py-3 pr-4 font-medium text-warm-500 uppercase text-xs tracking-wider cursor-pointer select-none hover:text-warm-700 transition-colors"
                      onClick={() => handleSort("recipient")}
                    >
                      Recipient{sortIndicator("recipient")}
                    </th>
                    <th className="py-3 pr-4 font-medium text-warm-500 uppercase text-xs tracking-wider hidden lg:table-cell">
                      Purpose
                    </th>
                    <th
                      className="py-3 pr-4 font-medium font-mono text-warm-500 uppercase text-xs tracking-wider cursor-pointer select-none text-right hover:text-warm-700 transition-colors"
                      onClick={() => handleSort("amount")}
                    >
                      Amount{sortIndicator("amount")}
                    </th>
                    <th
                      className="py-3 font-medium font-mono text-warm-500 uppercase text-xs tracking-wider cursor-pointer select-none text-right hover:text-warm-700 transition-colors"
                      onClick={() => handleSort("date")}
                    >
                      Date{sortIndicator("date")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => (
                    <tr
                      key={g._id}
                      className="border-b border-warm-100 hover:bg-warm-50/60 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        {g.recipientOrgSlug ? (
                          <Link
                            href={`/org/${g.recipientOrgSlug}`}
                            className="font-medium text-warm-800 hover:text-accent transition-colors"
                          >
                            {g.recipientName}
                          </Link>
                        ) : (
                          <span className="font-medium text-warm-800">
                            {g.recipientName ?? g.name ?? "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-warm-500 max-w-sm hidden lg:table-cell">
                        <span className="line-clamp-2">{g.purpose ?? ""}</span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-warm-700 text-right tabular-nums whitespace-nowrap">
                        {g.amount != null ? formatFullCurrency(g.amount) : "—"}
                      </td>
                      <td className="py-3 font-mono text-warm-400 text-right tabular-nums whitespace-nowrap text-xs">
                        {formatDate(g.dateAwarded)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
