"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { formatCurrency } from "../lib/format";

export default function FundsPage() {
  const funds = useQuery(api.funds.list);

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="mb-14">
          <h1 className="font-logo text-4xl text-warm-900 mb-3">Funds</h1>
          <p className="text-warm-500 text-lg font-light max-w-2xl leading-relaxed">
            Funding vehicles deploying capital toward AI safety research, policy,
            and field-building.
          </p>
        </div>

        {funds === undefined ? (
          <p className="text-sm text-warm-400">Loading...</p>
        ) : (
          <div className="grid gap-8">
            {funds.map((fund) => (
              <Link
                key={fund._id}
                href={`/funds/${fund.slug}`}
                className="group block"
              >
                <article className="relative border border-warm-200 rounded-sm p-8 bg-white hover:border-warm-300 transition-all duration-200 hover:shadow-[0_2px_20px_rgba(164,50,90,0.06)]">
                  {/* Name */}
                  <div className="mb-4">
                    <h2 className="font-logo text-2xl text-warm-900 group-hover:text-accent transition-colors leading-tight">
                      {fund.name}
                    </h2>
                  </div>

                  {/* Description */}
                  {fund.descriptionShort && (
                    <p className="text-sm text-warm-500 leading-relaxed max-w-3xl mb-6">
                      {fund.descriptionShort}
                    </p>
                  )}

                  {/* Stats strip */}
                  <div className="flex flex-wrap gap-x-10 gap-y-3 pt-5 border-t border-warm-100">
                    {fund.totalDeployedToDate != null && (
                      <div>
                        <span className="text-[0.65rem] uppercase tracking-widest text-warm-400 font-medium">
                          Total Deployed
                        </span>
                        <span className="block font-mono text-xl text-warm-800 tabular-nums mt-0.5">
                          {formatCurrency(fund.totalDeployedToDate)}
                        </span>
                      </div>
                    )}
                    {fund.expectedAnnualDistribution != null && (
                      <div>
                        <span className="text-[0.65rem] uppercase tracking-widest text-warm-400 font-medium">
                          Annual Distribution
                        </span>
                        <span className="block font-mono text-xl text-warm-800 tabular-nums mt-0.5">
                          {formatCurrency(fund.expectedAnnualDistribution)}
                        </span>
                      </div>
                    )}
                    {fund.websiteUrl && (
                      <div>
                        <span className="text-[0.65rem] uppercase tracking-widest text-warm-400 font-medium">
                          Website
                        </span>
                        <span className="block text-sm text-accent mt-1.5 group-hover:text-accent-light transition-colors">
                          {fund.websiteUrl
                            .replace(/^https?:\/\//, "")
                            .replace(/\/$/, "")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute top-8 right-8 text-warm-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all text-lg hidden md:block">
                    &rarr;
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
