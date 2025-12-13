"use client";

import Image from "next/image";
import Link from "next/link";

export default function GhostLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/ghostai-logo.png"
        alt="GhostAI Logo"
        width={140}
        height={40}
        priority
      />
    </Link>
  );
}
