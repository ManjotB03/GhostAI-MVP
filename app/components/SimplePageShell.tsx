import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

// Shared dark shell for simple content pages (About, Contact).
export default function SimplePageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white antialiased">
      <header className="border-b border-slate-800/70">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/ghostai-icon.svg" alt="" width={28} height={28} unoptimized />
            <span className="font-bold">GhostAI</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate-300">
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link
              href="/signup"
              className="rounded-lg bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 font-semibold text-slate-950 transition"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-800 py-6 px-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} GhostAI ·{" "}
        <Link href="/privacy" className="hover:text-slate-300">Privacy</Link> ·{" "}
        <Link href="/terms" className="hover:text-slate-300">Terms</Link> ·{" "}
        <Link href="/refunds" className="hover:text-slate-300">Refunds</Link>
      </footer>
    </main>
  );
}
