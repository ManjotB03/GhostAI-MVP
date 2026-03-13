"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-xl text-center">

        <div className="text-5xl mb-6">🎉</div>

        <h1 className="text-4xl font-extrabold mb-4">
          Welcome to GhostAI Pro
        </h1>

        <p className="text-slate-300 text-lg mb-8">
          Your subscription is now active. You can start using higher limits,
          interview mock mode, and advanced career coaching.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <Link
            href="/ghost"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition"
          >
            Go to GhostAI
          </Link>

          <Link
            href="/pricing"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition border border-slate-700"
          >
            View Billing
          </Link>

        </div>

        <p className="text-sm text-slate-400 mt-8">
          You can manage or cancel your subscription anytime from the pricing page.
        </p>

      </div>
    </main>
  );
}