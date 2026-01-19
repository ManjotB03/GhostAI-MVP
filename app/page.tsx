"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-6 text-center">
      <h1 className="text-5xl sm:text-6xl font-extrabold mb-5">
        GhostAI <span className="text-sky-400">Career Coach</span>
      </h1>

      <p className="text-slate-300 max-w-2xl text-lg sm:text-xl mb-8">
        Level up your career with clear, actionable advice for CVs, interviews,
        job strategy, and salary growth.
      </p>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4">
        {status === "loading" ? null : session ? (
          <Link
            href="/ghost"
            className="px-7 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold transition"
          >
            Go to Career Coach
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="px-7 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold transition"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="px-7 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition border border-slate-700"
            >
              Sign up free
            </Link>
          </>
        )}

        <Link
          href="/pricing"
          className="px-7 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition border border-slate-700"
        >
          View Pricing
        </Link>
      </div>

      {/* FEATURE GRID */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <h3 className="font-bold text-white mb-2">CV / Resume</h3>
          <p className="text-slate-300 text-sm">
            Strong bullet points, structure, and tailored wording for any role.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <h3 className="font-bold text-white mb-2">Interviews</h3>
          <p className="text-slate-300 text-sm">
            Mock questions, answers, frameworks, and confidence-building prep.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <h3 className="font-bold text-white mb-2">Salary Growth</h3>
          <p className="text-slate-300 text-sm">
            Negotiation scripts, promotion plans, and realistic next steps.
          </p>
        </div>
      </div>

      <p className="mt-10 text-slate-400 text-sm">
        Built with Next.js • Tailwind • AI
      </p>
    </div>
  );
}
