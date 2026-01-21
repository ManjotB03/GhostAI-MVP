import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-3xl text-center">
        <p className="text-sky-400 font-semibold tracking-wide mb-3">
          GhostAI Career Coach
        </p>

        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
          Your AI Career Coach for{" "}
          <span className="text-sky-400">CVs</span>,{" "}
          <span className="text-sky-400">Interviews</span> &{" "}
          <span className="text-sky-400">Job Offers</span>
        </h1>

        <p className="text-slate-300 text-lg sm:text-xl mb-10">
          GhostAI helps students, graduates, and early professionals write
          stronger CVs, craft better applications, and prepare interview answers
          that actually get you hired.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 rounded-lg text-white font-semibold transition"
          >
            Get Started Free
          </Link>

          <Link
            href="/pricing"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-semibold transition border border-slate-700"
          >
            View Pricing
          </Link>
        </div>

        <div className="mt-10 text-sm text-slate-400">
          Built for real career outcomes — clear answers, strong templates, and
          actionable next steps.
        </div>
      </div>
    </div>
  );
}
