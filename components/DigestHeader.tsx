interface Props {
  date: string;
}

export function DigestHeader({ date }: Props) {
  const formatted = new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-dodger-blue text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-1">
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
        <div className="flex items-center gap-3 mt-5 ml-11">
          <span className="text-xs text-blue-200 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
            Updated daily
          </span>
        </div>
      </div>
    </header>
  );
}
