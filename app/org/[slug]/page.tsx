"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export default function OrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const org = useQuery(api.orgs.getOrgBySlug, { slug });
  const staff = useQuery(
    api.staff.getStaffByOrg,
    org ? { orgId: org._id } : "skip"
  );
  const comments = useQuery(
    api.comments.getCommentsByOrg,
    org ? { orgId: org._id } : "skip"
  );
  const addComment = useMutation(api.comments.addComment);

  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !body.trim()) return;
    setSubmitting(true);
    await addComment({
      orgId: org._id,
      authorName: authorName.trim(),
      body: body.trim(),
      rating,
    });
    setAuthorName("");
    setBody("");
    setRating(5);
    setSubmitting(false);
  };

  return (
    <main className="flex-1 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-warm-400 hover:text-warm-600 transition-colors">
          &larr; All organizations
        </Link>

        {/* Header with logo */}
        <div className="mt-6 mb-10 flex items-start gap-6">
          {/* Large logo placeholder */}
          <div className="w-[72px] h-[72px] rounded-[10px] flex items-center justify-center bg-warm-100 border border-warm-200 text-warm-400 text-[0.7rem] font-medium uppercase tracking-wider shrink-0">
            {org.name.slice(0, 2)}
          </div>
          <div>
            <h1 className="font-logo text-3xl text-warm-900">{org.name}</h1>
            <p className="text-warm-500 mt-1 text-lg font-light">{org.subtitle}</p>
            <p className="mt-4 text-sm leading-relaxed text-warm-600 max-w-2xl">
              {org.description}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-xs text-warm-400 uppercase tracking-wider font-medium">
              Headcount
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">{org.headcount}</div>
          </div>
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-xs text-warm-400 uppercase tracking-wider font-medium">
              Total Funding
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">{org.totalFunding}</div>
          </div>
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-xs text-warm-400 uppercase tracking-wider font-medium">
              2026 Budget
            </div>
            <div className="text-2xl font-mono mt-2 text-warm-800 tabular-nums">{org.budget2026}</div>
          </div>
          <div className="bg-warm-50 border border-warm-200 p-5 rounded-sm">
            <div className="text-xs text-warm-400 uppercase tracking-wider font-medium">
              Website
            </div>
            <div className="text-sm mt-3">
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-light transition-colors underline underline-offset-2"
              >
                {org.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          </div>
        </div>

        {/* Staff */}
        {staff && staff.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
              Team
            </h2>
            <div className="space-y-2">
              {staff
                .sort((a, b) => a.order - b.order)
                .map((s) => (
                  <div key={s._id} className="text-sm flex items-baseline gap-3">
                    <span className="font-medium text-warm-800">{s.name}</span>
                    <span className="text-warm-400">{s.title}</span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* External links */}
        <section className="mb-10 flex flex-wrap gap-3">
          {org.donationUrl && (
            <a
              href={org.donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors rounded-sm"
            >
              Donate
            </a>
          )}
          {org.budgetUrl && (
            <a
              href={org.budgetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 border border-warm-300 text-warm-600 text-sm hover:bg-warm-50 transition-colors rounded-sm"
            >
              Budget Details
            </a>
          )}
          {org.email && (
            <a
              href={`mailto:${org.email}`}
              className="px-5 py-2.5 border border-warm-300 text-warm-600 text-sm hover:bg-warm-50 transition-colors rounded-sm"
            >
              {org.email}
            </a>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-warm-200 mb-10" />

        {/* Comments */}
        <section className="mb-10">
          <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
            Community Reviews
          </h2>
          {comments && comments.length > 0 ? (
            <div className="space-y-5">
              {comments
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((c) => (
                  <div
                    key={c._id}
                    className="border-b border-warm-100 pb-4"
                  >
                    <div className="flex items-baseline gap-3 text-sm">
                      <span className="font-medium text-warm-800">{c.authorName}</span>
                      <span className="text-amber-600 text-xs tracking-wide">
                        {stars(c.rating)}
                      </span>
                      <span className="text-warm-300 text-xs">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-warm-600 mt-1.5 leading-relaxed">{c.body}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-warm-300">No reviews yet.</p>
          )}
        </section>

        {/* Add comment form */}
        <section className="mb-12">
          <h2 className="text-xs font-medium uppercase tracking-wider text-warm-400 mb-4 pb-2 border-b border-warm-200">
            Add a Review
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <input
              type="text"
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-warm-50 border border-warm-200 text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-warm-400 focus:bg-white transition-all rounded-sm"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-warm-400">Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="px-3 py-1.5 bg-warm-50 border border-warm-200 text-sm text-warm-700 focus:outline-none focus:border-warm-400 rounded-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {stars(n)}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Your review..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2.5 bg-warm-50 border border-warm-200 text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-warm-400 focus:bg-white transition-all resize-none rounded-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-50 rounded-sm"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
