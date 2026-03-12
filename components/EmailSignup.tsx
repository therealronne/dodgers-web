"use client";

import { useState } from "react";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // In a real app this would POST to a subscription API
    // For now we just simulate success
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
      <div className="text-2xl mb-2">📬</div>
      <h3 className="text-base font-bold text-slate-900 mb-1">
        Get the daily digest in your inbox
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Every morning, the top Dodgers stories — curated and summarized.
      </p>

      {status === "success" ? (
        <p className="text-sm font-semibold text-emerald-600">
          You&apos;re subscribed! Check your inbox tomorrow.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-dodger-blue"
          />
          <button
            type="submit"
            className="text-sm font-semibold px-4 py-2 bg-dodger-blue text-white rounded-xl hover:bg-blue-800 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-dodger-blue"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
