"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { useState, useMemo } from "react";
import { formatCurrency } from "./lib/format";

type SortKey = "name" | "teamSize" | "annualBudget";
type SortDir = "asc" | "desc";

export default function Home() {
  const orgs = useQuery(api.orgs.listOrgs);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  };

  const filtered = useMemo(() => {
    if (!orgs) return [];
    const q = filter.toLowerCase();
    const list = q
      ? orgs.filter(
          (o) =>
            o.name.toLowerCase().includes(q) ||
            (o.descriptionShort?.toLowerCase().includes(q) ?? false) ||
            (o.location?.toLowerCase().includes(q) ?? false)
        )
      : [...orgs];

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "teamSize") {
        cmp = (a.teamSize ?? 0) - (b.teamSize ?? 0);
      } else if (sortKey === "annualBudget") {
        cmp = (a.annualBudget ?? 0) - (b.annualBudget ?? 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [orgs, filter, sortKey, sortDir]);

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero section */}
        <div className="mb-12">
          <h1 className="font-logo text-4xl text-warm-900 mb-3">
            Organizations
          </h1>
          <p className="text-warm-500 text-lg font-light max-w-2xl leading-relaxed">
            A directory of organizations working to ensure artificial intelligence benefits humanity.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search organizations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 bg-warm-50 border border-warm-200 text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-warm-400 focus:bg-white transition-all rounded-sm"
          />
        </div>

        {orgs === undefined ? (
          <p className="text-sm text-warm-400">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-warm-200 text-left">
                <th className="py-3 pr-4 w-10"></th>
                <th
                  className="py-3 pr-4 font-medium text-warm-500 uppercase text-xs tracking-wider cursor-pointer select-none hover:text-warm-700 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Organization{sortIndicator("name")}
                </th>
                <th className="py-3 pr-4 font-medium text-warm-500 uppercase text-xs tracking-wider hidden md:table-cell">
                  Description
                </th>
                <th
                  className="py-3 pr-4 font-medium font-mono text-warm-500 uppercase text-xs tracking-wider cursor-pointer select-none text-right hover:text-warm-700 transition-colors"
                  onClick={() => handleSort("teamSize")}
                >
                  Team{sortIndicator("teamSize")}
                </th>
                <th
                  className="py-3 pr-4 font-medium font-mono text-warm-500 uppercase text-xs tracking-wider cursor-pointer select-none text-right hover:text-warm-700 transition-colors"
                  onClick={() => handleSort("annualBudget")}
                >
                  Budget{sortIndicator("annualBudget")}
                </th>
                <th className="py-3 font-medium text-warm-500 uppercase text-xs tracking-wider hidden lg:table-cell">
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr
                  key={org._id}
                  className="border-b border-warm-100 hover:bg-warm-50 transition-colors group"
                >
                  {/* Logo placeholder */}
                  <td className="py-3.5 pr-3">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-warm-100 border border-warm-200 text-warm-400 text-[0.55rem] font-medium uppercase tracking-wider">
                      {org.name.slice(0, 2)}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <Link
                      href={`/org/${org.slug}`}
                      className="font-medium text-warm-900 group-hover:text-accent transition-colors"
                    >
                      {org.name}
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4 text-warm-500 max-w-xs truncate hidden md:table-cell">
                    {org.descriptionShort ?? ""}
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-warm-600 text-right tabular-nums">
                    {org.teamSize ?? "-"}
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-warm-600 text-right tabular-nums">
                    {formatCurrency(org.annualBudget)}
                  </td>
                  <td className="py-3.5 text-warm-500 text-sm hidden lg:table-cell">
                    {org.location ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
