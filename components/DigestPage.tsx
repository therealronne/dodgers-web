"use client";

import { useState } from "react";
import type { Story, Category } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import { CategoryFilter } from "./CategoryFilter";
import { DigestHeader } from "./DigestHeader";
import { EmailSignup } from "./EmailSignup";

interface Props {
  initialStories: Story[];
  date: string;
}

export function DigestPage({ initialStories, date }: Props) {
  const [stories] = useState<Story[]>(initialStories);
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  const filtered =
    activeCategory === "All"
      ? stories
      : stories.filter((s) => s.category === activeCategory);

  const categoryCounts: Record<string, number> = {};
  for (const s of stories) {
    categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DigestHeader date={date} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {stories.length > 0 && (
          <div className="mb-6">
            <CategoryFilter
              active={activeCategory}
              onChange={setActiveCategory}
              counts={categoryCounts}
            />
          </div>
        )}

        {stories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚾</div>
            <p className="text-slate-500 text-sm">No stories available right now. Check back soon.</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((story, i) => (
              <StoryCard key={story.id} story={story} rank={i + 1} />
            ))}
          </div>
        )}

        {filtered.length === 0 && stories.length > 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            No {activeCategory} stories in today&apos;s digest.
          </div>
        )}

        {stories.length > 0 && (
          <div className="mt-10">
            <EmailSignup />
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-slate-400">
        Dodgers Daily · Not affiliated with MLB or the LA Dodgers
      </footer>
    </div>
  );
}
