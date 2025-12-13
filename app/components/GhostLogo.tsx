"use client";

import Image from "next/image";
import Link from "next/link";

export default function GhostLogo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src="/ghostai-logo.png"
        alt="GhostAI logo"
        width={42}
        height={42}
        priority
        className="rounded-md"
      />
      <span className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">
        GhostAI
      </span>
    </Link>
  );
}
