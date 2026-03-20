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
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto text-sm text-zinc-500">
          Loading...
        </div>
      </main>
    );
  }

  if (org === null) {
    return (
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-zinc-500">Organization not found.</p>
          <Link href="/" className="text-sm underline mt-2 inline-block">
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
    <main className="flex-1 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          &larr; All orgs
        </Link>

        {/* Header */}
        <div className="mt-4 mb-8">
          <h1 className="text-2xl font-semibold">{org.name}</h1>
          <p className="text-zinc-500 mt-1">{org.subtitle}</p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-700">
            {org.description}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-zinc-200 p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Headcount
            </div>
            <div className="text-xl font-mono mt-1">{org.headcount}</div>
          </div>
          <div className="border border-zinc-200 p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Total Funding
            </div>
            <div className="text-xl font-mono mt-1">{org.totalFunding}</div>
          </div>
          <div className="border border-zinc-200 p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              2026 Budget
            </div>
            <div className="text-xl font-mono mt-1">{org.budget2026}</div>
          </div>
          <div className="border border-zinc-200 p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Website
            </div>
            <div className="text-sm mt-1">
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {org.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          </div>
        </div>

        {/* Staff */}
        {staff && staff.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
              Staff
            </h2>
            <div className="space-y-1.5">
              {staff
                .sort((a, b) => a.order - b.order)
                .map((s) => (
                  <div key={s._id} className="text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-zinc-500 ml-2">{s.title}</span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* External links */}
        <section className="mb-8 flex flex-wrap gap-3">
          {org.donationUrl && (
            <a
              href={org.donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-black text-white text-sm hover:bg-zinc-800 transition-colors"
            >
              Donate
            </a>
          )}
          {org.budgetUrl && (
            <a
              href={org.budgetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-zinc-300 text-sm hover:bg-zinc-50 transition-colors"
            >
              Budget Details
            </a>
          )}
          {org.email && (
            <a
              href={`mailto:${org.email}`}
              className="px-4 py-2 border border-zinc-300 text-sm hover:bg-zinc-50 transition-colors"
            >
              {org.email}
            </a>
          )}
        </section>

        {/* Comments */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
            Community Reviews
          </h2>
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((c) => (
                  <div
                    key={c._id}
                    className="border-b border-zinc-100 pb-3"
                  >
                    <div className="flex items-baseline gap-2 text-sm">
                      <span className="font-medium">{c.authorName}</span>
                      <span className="text-amber-500 text-xs">
                        {stars(c.rating)}
                      </span>
                      <span className="text-zinc-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 mt-1">{c.body}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No reviews yet.</p>
          )}
        </section>

        {/* Add comment form */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
            Add a Review
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
            <input
              type="text"
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none focus:border-zinc-500"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-500">Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="px-2 py-1 border border-zinc-300 text-sm focus:outline-none focus:border-zinc-500"
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
              className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none focus:border-zinc-500 resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-black text-white text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
