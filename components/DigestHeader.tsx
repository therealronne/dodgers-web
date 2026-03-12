"use client";

interface Props {
  date: string;
  cached: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DigestHeader({ date, cached, onRefresh, isRefreshing }: Props) {
  const formatted = new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-dodger-blue text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Wordmark */}
        <div className="flex items-center gap-3 mb-1">
          {/* Baseball icon */}
          <svg className="w-8 h-8 opacity-90" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" />
            <path d="M6 10 Q10 14 6 20" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M26 10 Q22 14 26 20" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M10 5 Q14 9 18 5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M10 27 Q14 23 18 27" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dodgers Daily
          </h1>
        </div>
        <p className="text-blue-200 text-sm font-medium ml-11">
          Your morning briefing — {formatted}
        </p>

        {/* Refresh row */}
        <div className="flex items-center gap-3 mt-5 ml-11">
          <span className="text-xs text-blue-200 flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                cached ? "bg-green-400" : "bg-yellow-400"
              }`}
            />
            {cached ? "Showing cached results" : "Freshly fetched"}
          </span>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ml-auto flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isRefreshing ? "Refreshing…" : "Refresh feed"}
          </button>
        </div>
      </div>
    </header>
  );
}
