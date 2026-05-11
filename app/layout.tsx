import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://www.ghostaicorp.com"),
  title: "GhostAI – Improve Your CV & Land More Interviews",
  description:
    "Get AI-powered CV feedback, ATS scoring, and interview coaching to help you land more interviews faster.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GhostAI – Improve Your CV & Land More Interviews",
    description:
      "Get AI-powered CV feedback, ATS scoring, and interview coaching to help you land more interviews faster.",
    url: "https://www.ghostaicorp.com",
    siteName: "GhostAI",
    images: [
      {
        url: "https://www.ghostaicorp.com/ghostai-logo.png",
        width: 1200,
        height: 630,
        alt: "GhostAI Logo",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostAI – Improve Your CV & Land More Interviews",
    description:
      "Get AI-powered CV feedback, ATS scoring, and interview coaching to help you land more interviews faster.",
    images: ["https://www.ghostaicorp.com/ghostai-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Script id="schema-org" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "GhostAI",
                url: "https://www.ghostaicorp.com",
                logo: "https://www.ghostaicorp.com/ghostai-logo.png",
              },
              {
                "@type": "WebSite",
                name: "GhostAI",
                url: "https://www.ghostaicorp.com",
                description:
                  "Get AI-powered CV feedback, ATS scoring, and interview coaching to help you land more interviews faster.",
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What does GhostAI do?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "GhostAI helps you tailor your CV to specific job descriptions, highlight gaps, improve weak bullet points, and prepare stronger interview answers.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does GhostAI guarantee interviews or job offers?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. GhostAI helps improve your CV and preparation, but it cannot guarantee interviews, job offers, or employment outcomes.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I edit the AI suggestions?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. You stay in control and can edit every suggestion before using it. Nothing is applied automatically.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Who is GhostAI for?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "GhostAI is built for students, graduates, career switchers, and professionals who want clearer, more targeted job applications.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I use GhostAI for a specific job description?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. You can paste a job description and use GhostAI to make your CV more relevant to that specific role.",
                    },
                  },
                ],
              },
            ],
          })}
        </Script>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4ENL3PHNKD"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4ENL3PHNKD');
          `}
        </Script>

        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wcneusp32l");
          `}
        </Script>

        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
