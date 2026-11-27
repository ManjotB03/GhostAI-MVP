import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ATS CV Checker: Instant Match Score & Missing Keywords | GhostAI",
  description:
    "Free ATS CV checker: paste your CV and a job description to get an instant ATS match score, missing keywords and 3 improvements. No signup needed.",
  alternates: { canonical: "/ats-cv-checker" },
};

export default function AtsCvCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
