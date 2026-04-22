import type { Metadata, MetadataRoute } from "next";
export const metadata: Metadata = {
  title: "Pricing - GhostAI CV Review & Interview Coaching",
  description: "Explore our pricing plans for AI-powered CV feedback, ATS scoring, and interview coaching. Choose the best plan to boost your career with GhostAI.",
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
        