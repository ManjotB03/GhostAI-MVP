"use client";

import Image from "next/image";
import Link from "next/link";

export default function GhostLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/ghostai-logo.png"
        alt="GhostAI Logo"
        width={40}
        height={40}
        priority
      />
      <span className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">
        GhostAI
      </span>
    </Link>
  );
}
