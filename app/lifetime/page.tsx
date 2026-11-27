"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import EmailCapture from "../components/EmailCapture";

type Sale = {
  open: boolean;
  ended: boolean;
  soldOut: boolean;
  endsAt: string | null;
  cap: number;
  remaining: number;
};

const PRICE = "£49";

const FEATURES = [
  "Tailored CVs: match score, missing keywords and stronger bullet rewrites for every job",
  "Unlimited application tracking, with the CV you sent saved on each card",
  "A check-in 7 days after you apply, so nothing quietly disappears",
  "One-click cover letters drafted from the job ad and your CV",
  "Interview mock mode with STAR-style feedback",
  "45 AI requests a day, every day",
  "Every new Pro feature we ship",
];

const FAQS = [
  {
    q: "What does \"lifetime\" mean?",
    a: "For as long as GhostAI runs, you keep Pro features with no further payments.",
  },
  {
    q: "Is there a catch?",
    a: "Fair use is 45 AI requests a day, the same as Pro. That's more than almost anyone uses.",
  },
  {
    q: "What if I don't like it?",
    a: "Email us within 14 days for a full refund, no questions asked.",
  },
  {
    q: "Will this get me a job?",
    a: "No tool can promise that. GhostAI helps you send better applications and stay on top of them.",
  },
  {
    q: "I already pay monthly. Can I switch?",
    a: "Yes. Buy the Lifetime Pass, then cancel your monthly plan from Manage Billing on the Pricing page so you aren't charged again.",
  },
];

function formatClose(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

function useCountdown(iso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!iso) return;
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [iso]);
  if (!iso) return null;
  const ms = Date.parse(iso) - now;
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h ${mins}m left`;
}

export default function LifetimePage() {
  const { status: authStatus } = useSession();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [buying, setBuying] = useState(false);
  const [notice, setNotice] = useState("");
  const countdown = useCountdown(sale?.open ? sale.endsAt : null);

  useEffect(() => {
    fetch("/api/lifetime")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setSale)
      .catch(() => setLoadError(true));
  }, []);

  async function buy() {
    if (authStatus !== "authenticated") {
      window.location.href = "/signup?next=/lifetime";
      return;
    }
    setBuying(true);
    setNotice("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "lifetime" }),
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
        {buying ? "Opening checkout..." : `Claim my Lifetime Pass, ${PRICE}`}
      </button>
      <p className="text-sm text-slate-400">One payment. No subscription. 14-day full refund.</p>
      {notice && <p className="text-sm text-amber-300">{notice}</p>}
    </div>
  );

  const closedOrWaiting = sale && !sale.open;

  return (
    <main className="min-h-screen bg-slate-950 text-white antialiased">
      <header className="border-b border-slate-800/70">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/ghostai-icon.svg" alt="" width={28} height={28} unoptimized />
            <span className="font-bold">GhostAI</span>
          </Link>
          <Link href="/pricing" className="text-sm text-slate-300 hover:text-white">
            All plans
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(56,189,248,0.22),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-6 pt-14 pb-12 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-sm font-medium text-sky-300 mb-6">
            Founding Lifetime Pass
            {sale?.open && <> · {sale.remaining} of {sale.cap} spots left</>}
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] mb-5">
            Your whole job search, sorted. Forever.{" "}
            <span className="text-sky-400">One payment of {PRICE}.</span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Tailor your CV to every role, track every application, and get a check-in when you
            haven&apos;t heard back. Founding members get GhostAI Pro for life, for less than ten
            months of the monthly plan.
          </p>

          {!sale && !loadError && <p className="text-slate-500">Loading...</p>}
          {loadError && (
            <p className="text-slate-400">
              Couldn&apos;t load the sale status. Please refresh the page.
            </p>
          )}

          {sale?.open && (
            <>
              {cta}
              {sale.endsAt && (
                <p className="mt-5 text-sm text-slate-300">
                  Closes {formatClose(sale.endsAt)}
                  {countdown && <span className="text-sky-300"> · {countdown}</span>}, or when all{" "}
                  {sale.cap} spots are gone.
                </p>
              )}
            </>
          )}

          {closedOrWaiting && (sale.ended || sale.soldOut) && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="font-semibold mb-2">The Founding Lifetime Pass is closed.</p>
              <p className="text-slate-400 mb-4">
                Thank you to everyone who joined. You can still get Pro on the{" "}
                <Link href="/pricing" className="text-sky-400 hover:text-sky-300">pricing page</Link>.
              </p>
            </div>
          )}

          {closedOrWaiting && !sale.ended && !sale.soldOut && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left">
              <p className="font-semibold mb-1 text-center">Opening soon.</p>
              <p className="text-slate-400 mb-4 text-center">
                Join the waitlist and get 24 hours of early access before it opens to everyone.
              </p>
              <EmailCapture
                source="lifetime-waitlist"
                buttonLabel="Join the waitlist"
                successStored="You're on the waitlist. We'll email you when it opens."
              />
            </div>
          )}
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">What you get, forever</h2>
        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex gap-3 text-slate-200">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-400 text-xs">
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
          Bonus for the first 50 founding members: a free 15-minute CV call with the founder.
        </p>
      </section>

      {/* Price anchor */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-8">
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 text-sm">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium text-slate-400"><span className="sr-only">Period</span></th>
                <th scope="col" className="px-5 py-3 font-semibold text-slate-300">Pro monthly (£4.99)</th>
                <th scope="col" className="px-5 py-3 font-semibold text-sky-300">Founding Lifetime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr><th scope="row" className="px-5 py-3 font-normal text-slate-300">Year 1</th><td className="px-5 py-3 text-slate-300">£59.88</td><td className="px-5 py-3 font-semibold">{PRICE}</td></tr>
              <tr><th scope="row" className="px-5 py-3 font-normal text-slate-300">Year 3</th><td className="px-5 py-3 text-slate-300">£179.64</td><td className="px-5 py-3 font-semibold">{PRICE}</td></tr>
              <tr><th scope="row" className="px-5 py-3 font-normal text-slate-300">Your next job hunt</th><td className="px-5 py-3 text-slate-300">Pay again</td><td className="px-5 py-3 font-semibold">Already covered</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Founder note + who it's for */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="font-semibold mb-2">Who it&apos;s for</h3>
          <p className="text-slate-400 leading-relaxed">
            Graduates applying to grad schemes this season, career changers who&apos;ll job hunt
            more than once, and anyone who&apos;d rather pay once than manage another subscription.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="font-semibold mb-2">From the founder</h3>
          <p className="text-slate-400 leading-relaxed">
            I built GhostAI after my own job hunt felt like sending CVs into a void. The Founding
            Pass funds the next features, and the people who back it now get them free, forever.
          </p>
        </div>
      </section>

      {/* FAQ */}
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

      {sale?.open && (
        <section className="px-5 sm:px-6 pb-20">
          <div className="max-w-3xl mx-auto rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-500/15 to-slate-900/60 px-6 py-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              {sale.remaining} spots left. Claim yours for {PRICE}.
            </h2>
            {cta}
          </div>
        </section>
      )}
    </main>
  );
}
