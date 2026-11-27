"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const NAV_LINKS: { href: string; label: string; anchor?: boolean }[] = [
  { href: "#how-it-works", label: "How it works", anchor: true },
  { href: "#tracker", label: "Tracker", anchor: true },
  { href: "/ats-cv-checker", label: "Free ATS check" },
  { href: "/pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ", anchor: true },
];

const PAINS = [
  {
    title: "One CV, fifty different jobs",
    body: "Graduate programmes and big employers screen for the keywords in their own job description. A generic CV quietly loses to people who tailored theirs.",
  },
  {
    title: "No idea what you sent where",
    body: "Which version went to which company? When did you apply? It all lives in a spreadsheet you stopped updating in week two.",
  },
  {
    title: "Silence, with no feedback",
    body: "Most applications never get a reply, so you can't tell what's working. You just keep sending and hoping.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tailor your CV to the role",
    body: "Paste your CV and the job description. Get a match score, the keywords you're missing, and stronger rewrites of weak bullet points.",
    tags: ["Match score", "Missing keywords", "Bullet rewrites"],
  },
  {
    n: "02",
    title: "Save it to your tracker",
    body: "One click turns that tailored CV into an application card, with the company, role, match score and the exact CV version you sent.",
    tags: ["One-click save", "CV version kept", "Status board"],
  },
  {
    n: "03",
    title: "Follow up and learn",
    body: "A week after you apply, GhostAI asks if you've heard back. Over time you can see which applications got replies, and which didn't.",
    tags: ["7-day check-in", "Outcome tracking", "Interview prep"],
  },
];

const COMPARISON: { row: string; chatgpt: boolean | "partial"; ghost: boolean }[] = [
  { row: "Rewrites CV bullet points", chatgpt: true, ghost: true },
  { row: "Scores your CV against a specific job", chatgpt: "partial", ghost: true },
  { row: "Remembers which CV you sent where", chatgpt: false, ghost: true },
  { row: "Tracks every application's status", chatgpt: false, ghost: true },
  { row: "Checks in when you haven't heard back", chatgpt: false, ghost: true },
];

const FAQS = [
  {
    q: "What's the best way to track job applications?",
    a: "Use one place that records the role, the date you applied, the CV version you sent and when to follow up. A spreadsheet works until you have 20+ applications. GhostAI's job application tracker does this automatically when you save a tailored CV, and reminds you to follow up after 7 days.",
  },
  {
    q: "Is GhostAI only for graduates?",
    a: "It's built for anyone job hunting, especially students and graduates sending lots of applications at once. It works for jobs in any country.",
  },
  {
    q: "Does it work for graduate programmes and big-company applications?",
    a: "Yes. Paste the job description for any role and GhostAI compares your CV against it, flags missing keywords, and suggests stronger wording.",
  },
  {
    q: "Is it free?",
    a: "Yes. The free plan includes 10 AI requests a day, CV feedback, a match score, and tracking for up to 25 applications. The ATS checker works without an account at all.",
  },
  {
    q: "Will GhostAI get me interviews?",
    a: "No tool can promise that. GhostAI helps you send more relevant applications and keep on top of them. You stay in control of everything that goes on your CV.",
  },
  {
    q: "What happens to my CV?",
    a: "Your CV is only used to give you feedback. It's never sold or shared.",
  },
];

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className={`h-5 w-5 ${className}`}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className={`h-5 w-5 ${className}`}>
      <path d="M6.3 5.3a1 1 0 00-1.4 1.4L8.6 10l-3.7 3.3a1 1 0 101.4 1.4L10 11.4l3.7 3.3a1 1 0 001.4-1.4L11.4 10l3.7-3.3a1 1 0 00-1.4-1.4L10 8.6 6.3 5.3z" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-400 mb-3">
      {children}
    </p>
  );
}

/** Illustrative tracker board used in the hero and tracker section. */
function TrackerPreview({ compact = false }: { compact?: boolean }) {
  const cols: {
    label: string;
    dot: string;
    cards: { co: string; role: string; score: number; nudge?: boolean }[];
  }[] = [
    {
      label: "Applied",
      dot: "bg-sky-400",
      cards: [
        { co: "Northwind Bank", role: "Graduate Analyst", score: 86, nudge: true },
        { co: "Brightline Energy", role: "Grad Engineer", score: 79 },
      ],
    },
    {
      label: "Interview",
      dot: "bg-indigo-400",
      cards: [{ co: "Harbour Retail", role: "Commercial Grad", score: 91 }],
    },
    {
      label: "No response",
      dot: "bg-slate-500",
      cards: [{ co: "Kestrel Consulting", role: "Associate", score: 58 }],
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-sky-950/50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        </div>
        <p className="text-xs text-slate-500">Your applications · example</p>
      </div>

      <div className={`grid grid-cols-3 gap-3 p-4 ${compact ? "" : "sm:p-5"}`}>
        {cols.map((col) => (
          <div key={col.label} className="min-w-0">
            <div className="mb-2.5 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 truncate">
                {col.label}
              </p>
            </div>
            <div className="space-y-2.5">
              {col.cards.map((c) => (
                <div
                  key={c.co}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 sm:p-3"
                >
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">{c.co}</p>
                  <p className="text-[11px] text-slate-400 truncate mb-2">{c.role}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c.score >= 80 ? "bg-emerald-400" : c.score >= 70 ? "bg-sky-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-300 tabular-nums">{c.score}</span>
                  </div>
                  {c.nudge && (
                    <p className="mt-2 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[10px] leading-snug text-sky-200">
                      Applied 8 days ago. Heard back?
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-slate-950 text-white antialiased">
      {/* ---------------- Nav ---------------- */}
      <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/75 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image src="/ghostai-icon.svg" alt="" width={30} height={30} priority unoptimized />
              <span className="text-lg font-bold tracking-tight">GhostAI</span>
            </Link>

            <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm text-slate-300">
              {NAV_LINKS.map((l) =>
                l.anchor ? (
                  <a key={l.href} href={l.href} className="hover:text-white transition">
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} className="hover:text-white transition">
                    {l.label}
                  </Link>
                )
              )}
            </nav>

            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition">
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition"
              >
                Start free
              </Link>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <Link href="/signup" className="px-3 py-2 rounded-lg text-sm font-semibold bg-sky-500 text-slate-950">
                Start free
              </Link>
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="p-2 rounded-lg border border-slate-700 text-slate-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {mobileMenuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-800/70 py-3 space-y-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-2 py-2 text-slate-200 hover:bg-slate-900"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 block rounded-lg border border-slate-700 px-2 py-2 text-center text-slate-200"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(56,189,248,0.22),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-sm font-medium text-sky-300 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                For students, graduates and job seekers everywhere
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.1rem] font-extrabold leading-[1.05] tracking-tight mb-6">
                Sent 50 applications and heard nothing back?{" "}
                <span className="bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
                  Let&apos;s fix that.
                </span>
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed max-w-xl mb-8">
                GhostAI is a job application tracker and CV tailoring tool. It
                tailors your CV to each job, keeps every application in one
                place, and checks in when you haven&apos;t heard back, so you can
                see what&apos;s actually working.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link
                  href="/signup"
                  className="px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-center transition shadow-lg shadow-sky-500/25"
                >
                  Start free
                </Link>
                <Link
                  href="/ats-cv-checker"
                  className="px-7 py-3.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 font-semibold text-center transition"
                >
                  Free ATS check, no signup
                </Link>
              </div>

              <p className="text-sm text-slate-400">
                No card needed. Free plan includes 10 AI requests a day and tracking for 25 applications.
              </p>
            </div>

            <div className="relative">
              <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-sky-500/10 blur-3xl" />
              <div className="relative">
                <TrackerPreview />
                {/* floating match card */}
                <div className="absolute -bottom-10 right-2 sm:-right-4 w-52 sm:w-56 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">CV match · Graduate Analyst</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-slate-500 line-through tabular-nums">54</span>
                    <span className="text-3xl font-extrabold text-emerald-400 tabular-nums">86</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">After adding 6 missing keywords</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Problem ---------------- */}
      <section className="border-y border-slate-800/70 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl mb-10">
            <SectionLabel>The problem</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              The job hunt is a numbers game you can&apos;t see.
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed">
              Most applications get no reply because the CV doesn&apos;t match the
              job ad and there&apos;s no system for following up. Many employers
              screen CVs with{" "}
              <a
                href="https://en.wikipedia.org/wiki/Applicant_tracking_system"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 underline-offset-2 hover:underline"
              >
                applicant tracking systems (ATS)
              </a>{" "}
              before a person ever reads them.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-800">
            {PAINS.map((p) => (
              <div key={p.title} className="bg-slate-950 p-7">
                <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                <p className="text-slate-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how-it-works" className="scroll-mt-20 max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            One place for your whole job search
          </h2>
          <p className="text-slate-400 text-lg">
            Tailor, track, follow up. Repeat for every application without losing the thread.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <li key={s.n} className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-7">
              <span className="text-5xl font-extrabold text-slate-800 tabular-nums">{s.n}</span>
              <h3 className="mt-4 text-xl font-semibold mb-3">{s.title}</h3>
              <p className="text-slate-400 leading-relaxed mb-5">{s.body}</p>
              <div className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span key={t} className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- Tracker showcase ---------------- */}
      <section id="tracker" className="scroll-mt-20 relative overflow-hidden border-y border-slate-800/70">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(56,189,248,0.12),transparent)]" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionLabel>Application tracker</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">
              Stop losing track of where you applied.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Every application gets a card with the role, the match score, and
              the CV you sent. Move it from Applied to Interview to Offer. If a
              week passes with no news, GhostAI asks, so nothing quietly disappears.
            </p>
            <ul className="space-y-4">
              {[
                "Save a tailored CV straight from the CV coach",
                "See every application's status on one board",
                "Get a check-in 7 days after you apply",
                "Mark no-responses so you know what to change",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-200">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
                    <Check className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <TrackerPreview compact />
        </div>
      </section>

      {/* ---------------- vs ChatGPT ---------------- */}
      <section className="max-w-4xl mx-auto px-5 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-12">
          <SectionLabel>Why not just use ChatGPT?</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            ChatGPT can rewrite a bullet. It can&apos;t run your job search.
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A chat forgets everything when you close it. GhostAI remembers every
            application, so you can actually learn from them.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 text-sm">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium text-slate-400">
                  <span className="sr-only">Feature</span>
                </th>
                <th scope="col" className="px-4 py-4 font-semibold text-slate-300 text-center w-28 sm:w-36">ChatGPT</th>
                <th scope="col" className="px-4 py-4 font-semibold text-sky-300 text-center w-28 sm:w-36">GhostAI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {COMPARISON.map((r) => (
                <tr key={r.row} className="bg-slate-950">
                  <th scope="row" className="px-5 py-4 font-normal text-slate-200 text-sm sm:text-base">{r.row}</th>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      {r.chatgpt === true ? (
                        <Check className="text-slate-400" />
                      ) : r.chatgpt === "partial" ? (
                        <span className="text-xs text-slate-500">If prompted</span>
                      ) : (
                        <Cross className="text-slate-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 bg-sky-500/[0.04]">
                    <div className="flex justify-center">
                      <Check className="text-sky-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- Pricing teaser ---------------- */}
      <section className="border-t border-slate-800/70 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-12">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Free to start. £4.99 when you&apos;re applying seriously.
            </h2>
            <p className="text-slate-400 text-lg">Cancel anytime. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
              <p className="text-sm font-semibold text-slate-400 mb-1">Free</p>
              <p className="text-4xl font-extrabold mb-5">£0</p>
              <ul className="space-y-3 text-slate-300 mb-7">
                {["10 AI requests a day", "CV feedback, match score and rewrites", "Track up to 25 applications", "Free ATS checker"].map((f) => (
                  <li key={f} className="flex gap-3"><Check className="text-slate-500 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/signup" className="block rounded-xl border border-slate-700 py-3 text-center font-semibold hover:bg-slate-900 transition">
                Start free
              </Link>
            </div>

            <div className="relative rounded-2xl border border-sky-500/50 bg-slate-950 p-7 shadow-xl shadow-sky-500/10">
              <span className="absolute -top-3 left-7 rounded-full bg-sky-500 px-3 py-0.5 text-xs font-semibold text-slate-950">
                Most popular
              </span>
              <p className="text-sm font-semibold text-sky-300 mb-1">Pro</p>
              <p className="text-4xl font-extrabold mb-5">
                £4.99<span className="text-base font-medium text-slate-400">/month</span>
              </p>
              <ul className="space-y-3 text-slate-300 mb-7">
                {["45 AI requests a day", "Unlimited application tracking", "Interview mock mode with STAR feedback", "Everything in Free"].map((f) => (
                  <li key={f} className="flex gap-3"><Check className="text-sky-400 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/pricing" className="block rounded-xl bg-sky-500 hover:bg-sky-400 py-3 text-center font-semibold text-slate-950 transition">
                See all plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Human option ---------------- */}
      <section className="px-5 sm:px-6 pt-16">
        <Link
          href="/cv-rewrite"
          className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-7 py-6 hover:bg-sky-500/15 transition"
        >
          <span>
            <span className="block text-lg font-semibold">Rather have a person do it?</span>
            <span className="block text-slate-300">
              I&apos;ll rewrite your CV for the role you want and send a video walkthrough within 48 hours. £49, includes lifetime GhostAI.
            </span>
          </span>
          <span className="text-sky-300 font-semibold whitespace-nowrap">CV Rewrite →</span>
        </Link>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="scroll-mt-20 max-w-3xl mx-auto px-5 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-10">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Questions job seekers ask</h2>
        </div>

        <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold">{f.q}</span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-45" : ""}`}
                  >
                    <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
                  </svg>
                </button>
                {open && <p className="px-6 pb-5 -mt-1 text-slate-400 leading-relaxed">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="px-5 sm:px-6 pb-20 sm:pb-28">
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-500/15 to-slate-900/60 px-6 py-14 sm:py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Make your next application count.
          </h2>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
            Tailor your CV, save it to your tracker, and know where every application stands.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition"
            >
              Start free
            </Link>
            <Link
              href="/ats-cv-checker"
              className="px-7 py-3.5 rounded-xl border border-slate-600 hover:bg-slate-800 font-semibold transition"
            >
              Free ATS check
            </Link>
          </div>
          <p className="mt-8 text-xs text-slate-500">
            GhostAI helps you prepare stronger applications. It doesn&apos;t guarantee interviews or job offers.
          </p>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <Image src="/ghostai-icon.svg" alt="" width={28} height={28} unoptimized />
                <span className="font-bold">GhostAI</span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-4">
                Tailor your CV to every graduate role and keep your whole job search in one place.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/manjot-bhoot-6780a43ba/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GhostAI on LinkedIn"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H19v-5.4c0-1.3 0-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H11V9z" />
                  </svg>
                </a>
                <a
                  href="https://x.com/ghostai_co"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GhostAI on X"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white transition"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Product</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#how-it-works" className="hover:text-slate-200 transition">How it works</a></li>
                <li><a href="#tracker" className="hover:text-slate-200 transition">Tracker</a></li>
                <li><Link href="/pricing" className="hover:text-slate-200 transition">Pricing</Link></li>
                <li><Link href="/ats-cv-checker" className="hover:text-slate-200 transition">ATS Checker</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Company</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/about" className="hover:text-slate-200 transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-slate-200 transition">Contact</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-slate-200 transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-slate-200 transition">Terms of Service</Link></li>
                <li><Link href="/refunds" className="hover:text-slate-200 transition">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} GhostAI. All rights reserved.</p>
            <a
              href="https://backlinklog.com/listing/ghostaicorp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://backlinklog.com/badge/ghostaicorp.com.svg" alt="Listed on BacklinkLog" width="130" height="32" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
