import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV Rewrite by the Founder – GhostAI",
  description:
    "A real person tailors your CV to the job you want, with a 5-minute video walkthrough in 48 hours. £49, includes lifetime GhostAI access.",
  alternates: { canonical: "/cv-rewrite" },
};

export default function CvRewriteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
