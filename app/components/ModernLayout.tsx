"use client";

import React, { ReactNode } from "react";
import Link from "next/link"; // Required for navigation
import GhostLogo from "./GhostLogo"; 

interface ModernLayoutProps {
  children: ReactNode;
}

export default function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        
        {/* Logo */}
        <GhostLogo />

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
      <main className="flex-1 flex flex-col items-center justify-start p-6 sm:p-12">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} GhostAI • Built with Next.js & Tailwind CSS
      </footer>

    </div>
  );
}
