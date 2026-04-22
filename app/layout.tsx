import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import Providers from "./providers";
import { Images } from "openai/resources/images.mjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = { 
  metadataBase: new URL("https://www.ghostaicorp.com"), 
  title: "GhostAI – Improve Your CV & Land More Interviews", 
  description: "Get AI-powered CV feedback, ATS scoring, and interview coaching to help you land more interviews faster.", 
  alternates: { 
    canonical: "/", 
  }, 
  openGraph: { 
    title: "GhostAI – Improve Your CV & Land More Interviews", 
    description: "Get AI-powered CV feedback, ATS scoring, and interview coaching to help you land more interviews faster.", 
    url: "https://www.ghostaicorp.com", 
    siteName: "GhostAI",
    Images: [
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
    description: "Get AI-powered CV feedback, ATS scoring, and interview coaching to help you land more interviews faster.",
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
        <Script id="schemaorg" type ="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organisation",
                "name": "GhostAI",
                "url": "https://www.ghostaicorp.com",
                "logo": "https://www.ghostaicorp.com/ghostai-logo.png",
              },
              {
                "@type": "WebSite",
                "name": "GhostAI",
                "url": "https://www.ghostaicorp.com",
                "description": "Get AI-powered CV feedback, ATS scoring, and interview coaching to help you land more interviews faster.",
              
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
      </body>
    </html>
  );
}