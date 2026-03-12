"use client";

import { formatDistanceToNow } from "date-fns";
import type { Story, Category } from "@/lib/types";

const CATEGORY_COLORS: Record<Category, string> = {
  Injuries: "bg-red-100 text-red-700 border-red-200",
  Transactions: "bg-purple-100 text-purple-700 border-purple-200",
  "Game Recaps": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Opinion: "bg-amber-100 text-amber-700 border-amber-200",
  General: "bg-slate-100 text-slate-600 border-slate-200",
};

const SOURCE_SHORT: Record<string, string> = {
  "MLB.com": "MLB",
  ESPN: "ESPN",
  "Dodgers Nation": "DN",
  "True Blue LA": "TBLA",
  "MLB Trade Rumors": "MLBTR",
  "AP Sports": "AP",
};

interface Props {
  story: Story;
  rank: number;
}

export function StoryCard({ story, rank }: Props) {
  const timeAgo = formatDistanceToNow(new Date(story.publishedAt), {
    addSuffix: true,
  });

  const categoryClass =
    CATEGORY_COLORS[story.category] ?? CATEGORY_COLORS.General;
  const shortSource = SOURCE_SHORT[story.source] ?? story.source;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top bar with rank accent */}
      <div className="h-1 bg-dodger-blue opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Rank badge */}
          <span className="w-6 h-6 rounded-full bg-dodger-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {rank}
          </span>

          {/* Source badge */}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            {shortSource}
          </span>

          {/* Category badge */}
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryClass}`}
          >
            {story.category}
          </span>

          {/* Timestamp */}
          <span className="text-xs text-slate-400 ml-auto">{timeAgo}</span>
        </div>

        {/* Headline */}
        <h2 className="text-base font-bold text-slate-900 leading-snug group-hover:text-dodger-blue transition-colors duration-150 line-clamp-3">
          {story.title}
        </h2>

        {/* Summary */}
        <p className="text-sm text-slate-600 leading-relaxed flex-1">
          {story.summary}
        </p>

        {/* CTA */}
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-dodger-blue hover:text-blue-800 transition-colors duration-150"
        >
          Read full story
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
      </div>
    </article>
  );
}
