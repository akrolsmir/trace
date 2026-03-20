"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { useState, useMemo } from "react";

type SortKey = "name" | "headcount" | "budget2026";
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
            o.subtitle.toLowerCase().includes(q) ||
            o.tags.some((t) => t.toLowerCase().includes(q))
        )
      : [...orgs];

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "headcount") {
        cmp = a.headcount - b.headcount;
      } else if (sortKey === "budget2026") {
        const parse = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ""));
        cmp = parse(a.budget2026) - parse(b.budget2026);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [orgs, filter, sortKey, sortDir]);

  return (
    <main className="flex-1 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Filter orgs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-zinc-300 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        {orgs === undefined ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left">
                <th
                  className="py-2 pr-4 font-medium cursor-pointer select-none"
                  onClick={() => handleSort("name")}
                >
                  Name{sortIndicator("name")}
                </th>
                <th className="py-2 pr-4 font-medium">Subtitle</th>
                <th
                  className="py-2 pr-4 font-medium font-mono cursor-pointer select-none text-right"
                  onClick={() => handleSort("headcount")}
                >
                  Headcount{sortIndicator("headcount")}
                </th>
                <th
                  className="py-2 pr-4 font-medium font-mono cursor-pointer select-none text-right"
                  onClick={() => handleSort("budget2026")}
                >
                  2026 Budget{sortIndicator("budget2026")}
                </th>
                <th className="py-2 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr
                  key={org._id}
                  className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
                >
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/org/${org.slug}`}
                      className="font-medium hover:underline"
                    >
                      {org.name}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-zinc-600">{org.subtitle}</td>
                  <td className="py-2.5 pr-4 font-mono text-right">
                    {org.headcount}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-right">
                    {org.budget2026}
                  </td>
                  <td className="py-2.5">
                    <div className="flex gap-1.5 flex-wrap">
                      {org.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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
