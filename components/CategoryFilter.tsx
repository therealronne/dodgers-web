"use client";

import type { Category } from "@/lib/types";

const CATEGORIES: (Category | "All")[] = [
  "All",
  "Game Recaps",
  "Transactions",
  "Injuries",
  "Opinion",
  "General",
];

interface Props {
  active: Category | "All";
  onChange: (cat: Category | "All") => void;
  counts: Record<string, number>;
}

export function CategoryFilter({ active, onChange, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        const count = cat === "All" ? undefined : counts[cat];
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-dodger-blue ${
              isActive
                ? "bg-dodger-blue text-white border-dodger-blue shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-dodger-blue hover:text-dodger-blue"
            }`}
          >
            {cat}
            {count !== undefined && (
              <span
                className={`ml-1.5 text-xs ${isActive ? "opacity-80" : "opacity-60"}`}
              >
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
