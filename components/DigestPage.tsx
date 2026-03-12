"use client";

import { useState, useEffect, useCallback } from "react";
import type { Story, Category } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import { CategoryFilter } from "./CategoryFilter";
import { DigestHeader } from "./DigestHeader";
import { EmailSignup } from "./EmailSignup";

interface DigestResponse {
  stories: Story[];
  error?: string;
}

export function DigestPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDigest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/digest");
      const data: DigestResponse = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setStories(data.stories);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDigest();
  }, [fetchDigest]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/refresh", { method: "POST" });
      await fetchDigest();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filtered =
    activeCategory === "All"
      ? stories
      : stories.filter((s) => s.category === activeCategory);

  const categoryCounts: Record<string, number> = {};
  for (const s of stories) {
    categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1;
  }

  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50">
      <DigestHeader
        date={todayKey}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Category filter bar */}
        {!loading && stories.length > 0 && (
          <div className="mb-6">
            <CategoryFilter
              active={activeCategory}
              onChange={setActiveCategory}
              counts={categoryCounts}
            />
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse"
              >
                <div className="flex gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200" />
                  <div className="w-16 h-5 rounded-full bg-slate-200" />
                  <div className="w-20 h-5 rounded-full bg-slate-200" />
                </div>
                <div className="h-5 bg-slate-200 rounded mb-2 w-full" />
                <div className="h-5 bg-slate-200 rounded mb-4 w-3/4" />
                <div className="h-4 bg-slate-100 rounded mb-2" />
                <div className="h-4 bg-slate-100 rounded mb-2 w-5/6" />
                <div className="h-4 bg-slate-100 rounded w-4/6" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚾</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Couldn&apos;t load the digest
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchDigest}
              className="px-5 py-2 bg-dodger-blue text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Story grid */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((story, i) => (
                <StoryCard key={story.id} story={story} rank={i + 1} />
              ))}
            </div>

            {/* Breaking news callout for high-relevance items */}
            {stories[0]?.relevanceScore >= 40 && activeCategory === "All" && (
              <div className="mt-3 text-xs text-center text-slate-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Stories ranked by relevance — breaking news and major transactions appear first
              </div>
            )}
          </>
        )}

        {/* Empty state after filter */}
        {!loading && !error && filtered.length === 0 && stories.length > 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            No {activeCategory} stories in today&apos;s digest.
          </div>
        )}

        {/* Email signup */}
        {!loading && !error && stories.length > 0 && (
          <div className="mt-10">
            <EmailSignup />
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-slate-400">
        Dodgers Daily · Stories summarized with Claude AI · Not affiliated with MLB or the LA Dodgers
      </footer>
    </div>
  );
}
