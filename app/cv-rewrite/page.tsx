"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";

const PRICE = "£49";

const STEPS = [
  {
    title: "Pay and send your CV",
    body: "After checkout you'll get an email address to send your CV and the job ad (or role) you're targeting.",
  },
  {
    title: "I rewrite it for that role",
    body: "I go through it line by line with GhostAI: missing keywords, weak bullets, structure. Only your real experience, made to read properly.",
  },
  {
    title: "You get it back within 48 hours",
    body: "Your tailored CV plus a 5-minute video walking you through every change, so you can do it yourself next time.",
  },
];

const INCLUDED = [
  "Your CV rewritten for one target role, by a person",
  "A 5-minute video walkthrough of every change",
  "Before and after match score against the job ad",
  "Lifetime GhostAI access: tailoring, application tracker, cover letters, interview practice",
  "One round of follow-up questions by email",
];

const FAQS = [
  {
    q: "Who actually does the rewrite?",
    a: "Me, Manjot, the founder of GhostAI. I use GhostAI to find gaps and then edit your CV myself.",
  },
  {
    q: "How fast?",
    a: "Within 48 hours of receiving your CV, usually sooner. If you have a deadline, say so in your email.",
  },
  {
    q: "Will it get me interviews?",
    a: "No one can promise that. You'll get a CV that clearly matches the role you're applying for, and the tools to keep tailoring it.",
  },
  {
    q: "What if I'm not happy?",
    a: "Email within 14 days for a full refund.",
  },
];

export default function CvRewritePage() {
  const { status } = useSession();
  const [buying, setBuying] = useState(false);
  const [notice, setNotice] = useState("");

  async function buy() {
    if (status !== "authenticated") {
      window.location.href = "/signup?next=/cv-rewrite";
      return;
    }
    setBuying(true);
    setNotice("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "cv-rewrite" }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setNotice(data?.message || data?.error || "Checkout couldn't start. Please try again.");
    } catch {
      setNotice("Checkout couldn't start. Please try again.");
    } finally {
      setBuying(false);
    }
  }

  const cta = (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={buy}
        disabled={buying}
        className="w-full sm:w-auto rounded-xl bg-sky-500 hover:bg-sky-400 px-8 py-4 text-lg font-semibold text-slate-950 transition shadow-lg shadow-sky-500/25 disabled:opacity-70"
      >
        {buying ? "Opening checkout..." : `Get my CV rewritten, ${PRICE}`}
      </button>
      <p className="text-sm text-slate-400">One payment · back in 48 hours · 14-day full refund</p>
      {notice && <p className="text-sm text-amber-300">{notice}</p>}
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white antialiased">
      <header className="border-b border-slate-800/70">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/ghostai-logo.png" alt="" width={28} height={28} unoptimized />
            <span className="font-bold">GhostAI</span>
          </Link>
          <Link href="/pricing" className="text-sm text-slate-300 hover:text-white">
            All plans
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(56,189,248,0.22),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-6 pt-14 pb-12 text-center">
          <p className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-sm font-medium text-sky-300 mb-6">
            Done with you, not just AI
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] mb-5">
            Your CV, rewritten for the job you want.{" "}
            <span className="text-sky-400">By a real person, in 48 hours.</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Send me your CV and the role you&apos;re going for. I&apos;ll tailor it line by line, show you
            every change on video, and you keep GhostAI for life to tailor the next ones yourself.
          </p>
          {cta}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">How it works</h2>
        <ol className="space-y-6">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500/15 font-bold text-sky-300">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold mb-1">{s.title}</p>
                <p className="text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7">
          <h2 className="text-xl font-bold mb-4">What you get for {PRICE}</h2>
          <ul className="space-y-3">
            {INCLUDED.map((f) => (
              <li key={f} className="flex gap-3 text-slate-200">
                <span className="text-sky-400">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Questions</h2>
        <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800">
          {FAQS.map((f) => (
            <div key={f.q} className="px-6 py-5">
              <p className="font-semibold mb-1">{f.q}</p>
              <p className="text-slate-400 leading-relaxed">{f.a}</p>
            </div>
          ))}
          <div className="px-6 py-5">
            <p className="font-semibold mb-1">Where are the refund terms?</p>
            <p className="text-slate-400 leading-relaxed">
              In our <Link href="/refunds" className="text-sky-400 hover:text-sky-300">Refund Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-500/15 to-slate-900/60 px-6 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Applying soon? Get it right first.</h2>
          {cta}
        </div>
      </section>
    </main>
  );
}
