import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Founding Lifetime Pass – GhostAI",
  description:
    "GhostAI Pro forever for one payment of £49. Tailor your CV to every role, track every application, and get follow-up check-ins. 200 founding spots.",
  alternates: { canonical: "/lifetime" },
};

export default function LifetimeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
