import { Geist, Geist_Mono } from "next/font/google";
import ClientSessionProvider from "./components/ClientSessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GhostAI",
  description: "Powered by GhostAI",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (  
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientSessionProvider>{children}</ClientSessionProvider>
      </body>
    </html>
  );
}
 