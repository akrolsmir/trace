"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { useState, useMemo } from "react";

type SortKey = "name" | "location";
type SortDir = "asc" | "desc";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function PeoplePage() {
  const people = useQuery(api.people.list);
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "grantmaker" | "regrantor"
  >("all");
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
    if (!people) return [];
    const q = filter.toLowerCase();
    let list = q
      ? people.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.bio?.toLowerCase().includes(q) ?? false) ||
            (p.location?.toLowerCase().includes(q) ?? false)
        )
      : [...people];

    if (roleFilter === "grantmaker") {
      list = list.filter((p) => p.isGrantmaker);
    } else if (roleFilter === "regrantor") {
      list = list.filter((p) => p.isRegrantor);
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "location") {
        cmp = (a.location ?? "").localeCompare(b.location ?? "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [people, filter, roleFilter, sortKey, sortDir]);

  const grantmakerCount = useMemo(
    () => people?.filter((p) => p.isGrantmaker).length ?? 0,
    [people]
  );
  const regrantorCount = useMemo(
    () => people?.filter((p) => p.isRegrantor).length ?? 0,
    [people]
  );

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="font-logo text-4xl text-warm-900 mb-3">People</h1>
          <p className="text-warm-500 text-lg font-light max-w-2xl leading-relaxed">
            Researchers, grantmakers, and builders working on AI safety and its
            funding ecosystem.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search people..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 bg-warm-50 border border-warm-200 text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-warm-400 focus:bg-white transition-all rounded-sm"
          />
          <div className="flex gap-2">
            {(
              [
                ["all", `All${people ? ` (${people.length})` : ""}`],
                ["grantmaker", `Grantmakers (${grantmakerCount})`],
                ["regrantor", `Regrantors (${regrantorCount})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`px-3 py-2 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors ${
                  roleFilter === key
                    ? "bg-warm-800 text-white"
                    : "bg-warm-50 text-warm-500 border border-warm-200 hover:bg-warm-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {people === undefined ? (
          <p className="text-sm text-warm-400">Loading...</p>
        ) : (
          <>
            {/* Sort controls */}
            <div className="flex gap-4 mb-6 text-xs">
              <button
                onClick={() => handleSort("name")}
                className="font-medium text-warm-500 uppercase tracking-wider hover:text-warm-700 transition-colors select-none"
              >
                Name{sortIndicator("name")}
              </button>
              <button
                onClick={() => handleSort("location")}
                className="font-medium text-warm-500 uppercase tracking-wider hover:text-warm-700 transition-colors select-none"
              >
                Location{sortIndicator("location")}
              </button>
              <span className="text-warm-300 ml-auto">
                {filtered.length}{" "}
                {filtered.length === 1 ? "person" : "people"}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((person) => (
                <Link
                  key={person._id}
                  href={`/people/${person.slug}`}
                  className="group block"
                >
                  <div className="border border-warm-200 rounded-sm p-5 bg-white hover:border-warm-300 transition-all duration-200 hover:shadow-[0_2px_16px_rgba(164,50,90,0.05)] h-full flex flex-col">
                    {/* Top row */}
                    <div className="flex items-start gap-4 mb-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-warm-100 border border-warm-200 text-warm-400 text-[0.6rem] font-medium tracking-wider shrink-0">
                        {initials(person.name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-warm-900 text-sm group-hover:text-accent transition-colors leading-tight truncate">
                          {person.name}
                        </h3>
                        {person.location && (
                          <p className="text-xs text-warm-400 mt-0.5 truncate">
                            {person.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio excerpt */}
                    {person.bio && (
                      <p className="text-xs text-warm-500 leading-relaxed line-clamp-2 flex-1">
                        {person.bio}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex gap-1.5 mt-3 flex-wrap">
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-sm text-warm-400 py-12 text-center">
                {filter || roleFilter !== "all"
                  ? "No people match your filters."
                  : "No people found."}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
