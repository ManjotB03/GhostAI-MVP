import type { Metadata, MetadataRoute } from "next";
export const metadata: Metadata = {
  title: "CV Tailoring Tool Pricing: Free, £19 Job Hunt Pass, £49 Lifetime | GhostAI",
  description: "GhostAI CV tailoring tool pricing: start free, get a £19 Job Hunt Pass for 90 days, or Pro monthly. Job application tracker, cover letters and interview practice included. 14-day refund.",
    alternates: {
    canonical: "/pricing",
  },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}  
        