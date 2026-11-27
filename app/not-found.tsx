import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Page not found | GhostAI",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <Image src="/ghostai-icon.svg" alt="GhostAI logo" width={72} height={72} className="mx-auto mb-6" />
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-400 mb-3">404</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          This page has ghosted you.
        </h1>
        <p className="text-slate-400 mb-8">
          The page you were looking for doesn&apos;t exist or has moved. Here&apos;s where you can go instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition"
          >
            Back to home
          </Link>
          <Link
            href="/ats-cv-checker"
            className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 font-semibold transition"
          >
            Free ATS check
          </Link>
        </div>
      </div>
    </main>
  );
}
