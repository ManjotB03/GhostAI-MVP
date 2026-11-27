import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://www.ghostaicorp.com"),
  title: "Job Application Tracker & CV Tailoring Tool | GhostAI",
  description:
    "GhostAI is a free job application tracker and CV tailoring tool. Tailor your CV to every job, track every application in one place, and get a reminder when you haven't heard back.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Job Application Tracker & CV Tailoring Tool | GhostAI",
    description:
      "GhostAI is a free job application tracker and CV tailoring tool. Tailor your CV to every job, track every application in one place, and get a reminder when you haven't heard back.",
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
    title: "Job Application Tracker & CV Tailoring Tool | GhostAI",
    description:
      "GhostAI is a free job application tracker and CV tailoring tool. Tailor your CV to every job, track every application in one place, and get a reminder when you haven't heard back.",
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
                  "GhostAI is a free job application tracker and CV tailoring tool. Tailor your CV to every job, track every application in one place, and get a reminder when you haven't heard back.",
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What's the best way to track job applications?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Use one place that records the role, the date you applied, the CV version you sent and when to follow up. A spreadsheet works until you have 20+ applications. GhostAI's job application tracker does this automatically when you save a tailored CV, and reminds you to follow up after 7 days.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is GhostAI only for graduates?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "It's built for anyone job hunting, especially students and graduates sending lots of applications at once. It works for jobs in any country.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does it work for graduate programmes and big-company applications?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. Paste the job description for any role and GhostAI compares your CV against it, flags missing keywords, and suggests stronger wording.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is it free?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. The free plan includes 10 AI requests a day, CV feedback, a match score, and tracking for up to 25 applications. The ATS checker works without an account at all.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Will GhostAI get me interviews?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No tool can promise that. GhostAI helps you send more relevant applications and keep on top of them. You stay in control of everything that goes on your CV.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What happens to my CV?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Your CV is only used to give you feedback. It's never sold or shared.",
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
