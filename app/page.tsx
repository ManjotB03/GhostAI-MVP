"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function HomePage() {
  const [demoInput, setDemoInput] = useState("");
  const [demoOutput, setDemoOutput] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/ghostai-logo.png"
                alt="GhostAI"
                width={32}
                height={32}
                priority
                unoptimized
              />
              <span className="font-bold text-lg tracking-tight text-white">
                GhostAI
              </span>
            </Link>

            {/* Center links (desktop) */}
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-8 text-sm text-slate-300"
            >
              <a href="#how-it-works" className="hover:text-white transition">
                How it Works
              </a>
              <a href="#features" className="hover:text-white transition">
                Features
              </a>
              <Link href="/pricing" className="hover:text-white transition">
                Pricing
              </Link>
              <a href="#faq" className="hover:text-white transition">
                FAQ
              </a>
            </nav>

            {/* Right actions (desktop) */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-900 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 transition shadow-lg shadow-sky-500/20"
              >
                Start Free Review →
              </Link>
            </div>

            {/* Mobile actions: keep primary CTA visible + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/signup"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 transition"
              >
                Start Free
              </Link>
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="p-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-900 transition"
              >
                {mobileMenuOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-1 border-t border-slate-800/80 pt-3">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-2 rounded-lg text-slate-200 hover:bg-slate-900 transition"
              >
                How it Works
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-2 rounded-lg text-slate-200 hover:bg-slate-900 transition"
              >
                Features
              </a>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-2 rounded-lg text-slate-200 hover:bg-slate-900 transition"
              >
                Pricing
              </Link>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-2 rounded-lg text-slate-200 hover:bg-slate-900 transition"
              >
                FAQ
              </a>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-2 rounded-lg text-slate-200 border border-slate-700 text-center mt-2 hover:bg-slate-900 transition"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%)]" />
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-12 sm:pt-14 sm:pb-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left column */}
            <div>
              <p className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300 mb-5">
                AI-powered CV optimization for ATS
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.05] mb-5">
                Tailor your CV to every job in seconds
                <span className="text-sky-400"> and stop getting ignored.</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl mb-6 leading-relaxed">
                Paste your CV and a job description. GhostAI shows what is missing,
                rewrites weak bullets, and helps you match the role before you apply.
              </p>

              {/* Feature ticks */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-7 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> ATS Match Score
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Missing Keyword Detection
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Bullet Rewriting
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Job Match Boost
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link
                  href="/signup"
                  className="px-7 py-3.5 bg-sky-500 hover:bg-sky-600 rounded-xl text-white font-semibold transition shadow-lg shadow-sky-500/20 text-center"
                >
                  Start Free Review →
                </Link>

                <a
                  href="#demo"
                  className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-white font-semibold transition border border-slate-700 text-center"
                >
                  See how it works
                </a>
              </div>

              <p className="text-sm text-slate-400">
                No signup required to try · 100% secure · Results in seconds
              </p>
            </div>

            {/* Right column: Before / After match score cards */}
            <div className="relative">
              <p className="text-xs text-slate-500 mb-2 text-center lg:text-right">
                Example — illustrative match scores
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
                  <p className="text-center text-xs font-semibold tracking-wide text-slate-400 mb-3">
                    BEFORE MATCH
                  </p>
                  <p className="text-center text-sm text-slate-400 mb-1">Match Score</p>
                  <p className="text-center text-5xl font-extrabold text-red-400 mb-3">54%</p>

                  <div className="h-1.5 w-full rounded-full bg-slate-800 mb-4 overflow-hidden">
                    <div className="h-full rounded-full bg-red-400/80" style={{ width: "54%" }} />
                  </div>

                  <ul className="space-y-2.5 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">✕</span> Missing keywords
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">✕</span> Weaker bullet points
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">✕</span> Lower match score
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">✕</span> Not fully optimized
                    </li>
                  </ul>
                </div>

                {/* After */}
                <div className="rounded-2xl border border-sky-500/30 bg-slate-900/70 p-6 shadow-xl shadow-sky-500/10">
                  <p className="text-center text-xs font-semibold tracking-wide text-slate-400 mb-3">
                    AFTER MATCH
                  </p>
                  <p className="text-center text-sm text-slate-400 mb-1">Match Score</p>
                  <p className="text-center text-5xl font-extrabold text-emerald-400 mb-3">89%</p>

                  <div className="h-1.5 w-full rounded-full bg-slate-800 mb-4 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400/80" style={{ width: "89%" }} />
                  </div>

                  <ul className="space-y-2.5 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> All keywords added
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> Stronger bullet points
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> Higher match score
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> ATS-optimized
                    </li>
                  </ul>
                </div>
              </div>

              <p className="mt-4 text-center text-sm text-slate-400">
                See your real match score in seconds —{" "}
                <a href="/signup" className="text-sky-400 hover:text-sky-300 font-medium">
                  run a free review →
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

{/* Why not just use ChatGPT */}
<section className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
  <div className="rounded-3xl border border-sky-500/20 bg-slate-900/70 p-8 sm:p-10 shadow-lg shadow-sky-500/10">
    <div className="text-center mb-8">
      <p className="text-sky-400 font-semibold tracking-wide mb-3">
        Why not just use ChatGPT?
      </p>

      <h2 className="text-3xl sm:text-4xl font-bold mb-4">
        GhostAI is built for the job application workflow, not just one prompt
      </h2>

      <p className="text-slate-300 max-w-3xl mx-auto leading-relaxed">
        ChatGPT can rewrite a CV bullet. GhostAI guides you through matching your CV
        to a specific job description, spotting gaps, improving weak bullet points,
        and understanding what to change before you apply.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
        <p className="text-sky-400 text-sm font-semibold mb-2">
          Job-specific matching
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Compare your CV against the actual role instead of getting generic advice.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
        <p className="text-sky-400 text-sm font-semibold mb-2">
          Clear reasons, not random rewrites
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          See what is missing, why it matters, and how to improve your wording honestly.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
        <p className="text-sky-400 text-sm font-semibold mb-2">
          Built around applications
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          GhostAI is designed to help you prepare stronger applications, not just produce AI text.
        </p>
      </div>
    </div>

    <p className="text-slate-400 text-sm text-center mt-8 max-w-3xl mx-auto">
      GhostAI does not guarantee interviews or job offers. It helps you improve your application readiness
      by making your CV clearer, more relevant, and easier to tailor to each role.
    </p>
  </div>
</section>


      {/* Who GhostAI is for */}
      <section className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <div className="text-center mb-10">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">
            Who GhostAI is for
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for people tired of getting ignored
          </h2>

          <p className="text-slate-300 max-w-2xl mx-auto">
            GhostAI helps job seekers understand why their applications are not
            converting and how to position themselves more effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="text-2xl mb-3">🎓</div>
            <h3 className="text-lg font-bold mb-2">Graduates</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Struggling to land interviews even after sending dozens of applications.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="text-2xl mb-3">🔄</div>
            <h3 className="text-lg font-bold mb-2">Career Switchers</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Trying to break into tech or reposition existing experience for a new role.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="text-2xl mb-3">📄</div>
            <h3 className="text-lg font-bold mb-2">Job Applicants</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Tired of generic CV advice and unsure why recruiters are not responding.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="text-2xl mb-3">🚀</div>
            <h3 className="text-lg font-bold mb-2">Professionals</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Looking to improve positioning, interview performance, and career direction.
            </p>
          </div>
        </div>
      </section>

      {/* Early trust / social proof */}
      <section className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <div className="rounded-3xl border border-sky-500/20 bg-slate-900/70 p-8 sm:p-10 text-center shadow-lg shadow-sky-500/10">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">
            Early traction
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Built in public with real job seekers in mind
          </h2>

          <p className="text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            GhostAI is being improved through real user feedback, session analytics,
            and early distribution tests across founder communities and AI tool platforms.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-sky-400 text-sm font-semibold mb-2">
                Feedback-led
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Built around real hesitation points job seekers face when their CVs
                are not getting responses.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-sky-400 text-sm font-semibold mb-2">
                Data-informed
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Uses analytics and session tracking to understand where users get
                stuck and improve the product quickly.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-sky-400 text-sm font-semibold mb-2">
                Career-focused
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Focused on CV matching, missing keywords, stronger bullet points,
                and interview confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo */}
<section id="demo" className="max-w-5xl mx-auto px-6 py-14 sm:py-20 scroll-mt-20">
  <div className="text-center mb-10">
    <p className="text-sky-400 font-semibold tracking-wide mb-3">
      Try GhostAI instantly
    </p>

    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
      See how GhostAI improves weak CV bullets
    </h2>

    <p className="text-slate-300 max-w-2xl mx-auto">
      Experience the kind of improvements GhostAI gives before you even sign up.
    </p>
  </div>

  <div className="max-w-3xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
    <div className="mb-5">
      <p className="text-sm text-slate-400 mb-2">
        Weak CV bullet
      </p>

      <textarea
        value={demoInput}
        onChange={(e) => {
          setDemoInput(e.target.value);
          setDemoOutput("");
        }}
        className="w-full rounded-xl bg-slate-950 border border-slate-700 p-4 text-white outline-none min-h-[120px]"
      />
    </div>

    <button
  onClick={async () => {
    if (!demoInput.trim() || demoLoading) return;

    setDemoLoading(true);
    setDemoOutput("");

    try {
      const res = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "career",
          targetRole: "General job application",
          task: `Rewrite this weak CV bullet into one stronger, concise, impact-focused CV bullet. Only return the improved bullet, no extra explanation:\n\n${demoInput}`,
          docText: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDemoOutput("Could not generate a rewrite right now. Please try again.");
        return;
      }

      setDemoOutput(String(data?.result || "").trim());
    } catch {
      setDemoOutput("Could not generate a rewrite right now. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  }}
  disabled={demoLoading}
  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 transition font-semibold disabled:opacity-70"
>
  {demoLoading ? "Improving..." : "Improve with GhostAI →"}
</button>

    {demoOutput && (
      <div className="mt-6 rounded-2xl border border-sky-500/30 bg-slate-950 p-5">
        <p className="text-sm text-sky-400 font-semibold mb-2">
          Improved version
        </p>

        <p className="text-white leading-relaxed">
          {demoOutput}
        </p>
      </div>
    )}
  </div>
</section>

      {/* Feature cards */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-8 sm:py-12 scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="text-sky-400 text-2xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-3">Smart CV Review</h3>
            <p className="text-slate-300 leading-relaxed">
              Upload your CV and get practical feedback on structure, clarity,
              impact, and how to improve it for real job applications.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="text-sky-400 text-2xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">ATS Score</h3>
            <p className="text-slate-300 leading-relaxed">
              See how well your CV matches a target role with an ATS-style score
              and suggestions to strengthen keywords and positioning.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="text-sky-400 text-2xl mb-4">🎤</div>
            <h3 className="text-xl font-bold mb-3">Interview Coaching</h3>
            <p className="text-slate-300 leading-relaxed">
              Practise answers, get feedback, and improve the way you explain
              your experience with structured interview support.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 sm:py-24 scroll-mt-20">
        <div className="text-center mb-12">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From CV upload to interview confidence
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            GhostAI gives you a clear path from improving your CV to preparing
            stronger answers for interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-sky-400 text-sm font-semibold mb-3">STEP 1</div>
            <h3 className="text-xl font-bold mb-3">Upload your CV</h3>
            <p className="text-slate-300 leading-relaxed">
              Add your CV and choose the role you’re targeting so GhostAI can tailor the feedback.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-sky-400 text-sm font-semibold mb-3">STEP 2</div>
            <h3 className="text-xl font-bold mb-3">Get tailored feedback</h3>
            <p className="text-slate-300 leading-relaxed">
              Receive ATS-style scoring, stronger bullet rewrites, and specific improvements based on your target role.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-sky-400 text-sm font-semibold mb-3">STEP 3</div>
            <h3 className="text-xl font-bold mb-3">Practise interview answers</h3>
            <p className="text-slate-300 leading-relaxed">
              Use Interview Mock mode to turn weak answers into stronger, clearer, more confident responses.
            </p>
          </div>
        </div>
      </section>

      
        {/* Trust signals */}
      <section className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <div className="text-center mb-10">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">
            Why job seekers choose GhostAI
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built to be genuinely useful — and honest
          </h2>

          <p className="text-slate-300 max-w-2xl mx-auto">
            No inflated promises. Just practical, role-specific help you stay in control of,
            built for people actively applying for jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="text-2xl mb-3">✏️</div>
            <h3 className="text-lg font-bold mb-2">You stay in control</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every suggestion is editable. Nothing is applied automatically —
              you decide what goes on your CV.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="text-lg font-bold mb-2">Your data stays private</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your CV is used to give you feedback — not sold or shared.
              Start securely, no strings attached.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="text-lg font-bold mb-2">Role-specific, not generic</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              GhostAI matches your CV to the actual job description —
              real gaps and keywords, not one-size-fits-all advice.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-bold mb-2">Free to start</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              No card required to try. Get a match score, missing keywords,
              and stronger bullets in seconds.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8 max-w-2xl mx-auto">
          GhostAI helps improve your application readiness. It does not guarantee
          interviews or job offers.
        </p>
      </section>

      {/* Trust / audience section */}
      <section className="max-w-6xl mx-auto px-6 pb-16 sm:pb-24">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12 text-center">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">
            Built for job seekers
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for graduates, professionals, and career switchers
          </h2>
          <p className="text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Whether you&apos;re a graduate, experienced professional, or switching careers,
            GhostAI helps you present your experience more clearly and prepare stronger interview answers.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              CV feedback
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              ATS score
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              Interview prep
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              Target role matching
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              Career coaching
            </span>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section id="faq" className="max-w-5xl mx-auto px-6 py-16 sm:py-24 scroll-mt-20">
        <div className="text-center mb-10">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">FAQs</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Common Questions
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Quick answers about how GhostAI works and what to expect.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "What does GhostAI do?",
              a: "GhostAI helps you tailor your CV to specific job descriptions, highlight gaps, improve weak bullet points, and prepare stronger interview answers.",
            },
            {
              q: "Does GhostAI guarantee interviews or job offers?",
              a: "No. GhostAI helps improve your CV and preparation, but it cannot guarantee interviews, job offers, or employment outcomes.",
            },
            {
              q: "Can I edit the AI suggestions?",
              a: "Yes. You stay in control and can edit every suggestion before using it. Nothing is applied automatically.",
            },
            {
              q: "Who is GhostAI for?",
              a: "GhostAI is built for students, graduates, career switchers, and professionals who want clearer, more targeted job applications.",
            },
            {
              q: "Can I use GhostAI for a specific job description?",
              a: "Yes. You can paste a job description and use GhostAI to make your CV more relevant to that specific role.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{item.q}</h3>
              <p className="text-slate-300 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to tailor your CV to the next job?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">
            Paste your CV and job description, get targeted feedback, and improve your application before you send it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-7 py-3.5 bg-sky-500 hover:bg-sky-600 rounded-xl text-white font-semibold transition shadow-lg shadow-sky-500/20"
            >
              Start free CV review
            </Link>

            <Link
              href="/pricing"
              className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-white font-semibold transition border border-slate-700"
            >
              See Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <Image
                  src="/ghostai-logo.png"
                  alt="GhostAI"
                  width={28}
                  height={28}
                  unoptimized
                />
                <span className="font-bold text-white">GhostAI</span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-4">
                AI-powered CV optimization that helps you tailor your CV to each job,
                match more roles, and land more interviews.
              </p>

              {/* Social */}
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

            {/* Product */}
            <div>
              <p className="text-sm font-semibold text-white mb-3">Product</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-slate-200 transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-slate-200 transition">How it Works</a></li>
                <li><Link href="/pricing" className="hover:text-slate-200 transition">Pricing</Link></li>
                <li><Link href="/ats-cv-checker" className="hover:text-slate-200 transition">ATS Checker</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-sm font-semibold text-white mb-3">Company</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/about" className="hover:text-slate-200 transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-slate-200 transition">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-sm font-semibold text-white mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-slate-200 transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-slate-200 transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} GhostAI. All rights reserved.
            </p>

            <a
              href="https://backlinklog.com/listing/ghostaicorp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition"
            >
              <img
                src="https://backlinklog.com/badge/ghostaicorp.com.svg"
                alt="Listed on BacklinkLog"
                width="130"
                height="32"
              />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}