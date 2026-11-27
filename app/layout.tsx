import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://www.ghostaicorp.com"),
  title: "GhostAI – CV Tailoring & Job Application Tracker for Graduates",
  description:
    "Tailor your CV to every graduate role, track every application in one place, and get a check-in when you haven't heard back. Free to start.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GhostAI – CV Tailoring & Job Application Tracker for Graduates",
    description:
      "Tailor your CV to every graduate role, track every application in one place, and get a check-in when you haven't heard back. Free to start.",
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
    title: "GhostAI – CV Tailoring & Job Application Tracker for Graduates",
    description:
      "Tailor your CV to every graduate role, track every application in one place, and get a check-in when you haven't heard back. Free to start.",
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
                  "Tailor your CV to every graduate role, track every application in one place, and get a check-in when you haven't heard back. Free to start.",
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Is GhostAI only for graduates?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "It's built around the graduate job hunt (grad schemes, first roles, lots of applications at once), but anyone tailoring a CV to specific jobs can use it.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does it work for grad schemes and big-company applications?",
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
                      text: "Yes. The free plan includes 10 AI requests a day, CV feedback, a match score, and tracking for up to 5 applications. The ATS checker works without an account at all.",
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
