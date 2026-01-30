"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface ModernLayoutProps {
  children: ReactNode;
}

export default function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans relative">
      
      {/* ✅ BACKGROUND LAYER (CANNOT BLOCK CLICKS) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* optional subtle glow */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/ghostai-logo.png"
            alt="GhostAI"
            width={34}
            height={34}
            priority
          />
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            GhostAI
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="space-x-4">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition"
          >
            Contact
          </Link>

          <Link
            href="/pricing"
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition"
          >
            Pricing
          </Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-start p-6 sm:p-12">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400 relative z-10">
        &copy; {new Date().getFullYear()} GhostAI • Built with Next.js & Tailwind CSS
      </footer>
    </div>
  );
}
