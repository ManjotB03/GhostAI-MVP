"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface ModernLayoutProps {
  children: ReactNode;
}

const NAV = [
  { href: "/ghost", label: "CV coach" },
  { href: "/applications", label: "Tracker" },
  { href: "/pricing", label: "Pricing" },
];

// App shell for signed-in pages. Always the dark navy theme so it matches the
// rest of the site (it used to switch to a light background in light mode,
// which put white text on a light page).
export default function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[48rem] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/ghostai-icon.svg" alt="" width={30} height={30} priority />
            <span className="text-lg font-bold tracking-tight">GhostAI</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate-300">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white transition">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-start p-6 sm:p-12">
        {children}
      </main>

      <footer className="relative z-10 border-t border-slate-800 py-5 px-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} GhostAI ·{" "}
        <Link href="/privacy" className="hover:text-slate-300">Privacy</Link> ·{" "}
        <Link href="/terms" className="hover:text-slate-300">Terms</Link> ·{" "}
        <Link href="/refunds" className="hover:text-slate-300">Refunds</Link>
      </footer>
    </div>
  );
}
