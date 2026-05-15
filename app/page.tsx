"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function HomePage() {
  const [demoInput, setDemoInput] = useState("");
  const [demoOutput, setDemoOutput] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%)]" />
        <div className="max-w-6xl mx-auto px-6 pt-2 pb-6 sm:pt-3 sm:pb-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Image
              src="/ghostai-logo.png"
              alt="GhostAI logo"
              width={260}
              height={76}
              className="mx-auto mb-4"
              priority
              unoptimized
            />

            <p className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300 mb-4">
              For people actively applying to jobs
            </p>

            <p className="text-sky-400 text-sm font-medium mb-2">
              Most CVs get ignored because they don&apos;t match the job.
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.9rem] font-extrabold leading-[1.05] mb-4">
              Tailor your CV to every job in seconds -
              <span className="text-sky-400"> and stop getting ignored.</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-5 leading-relaxed">
              Paste your CV and a job description. GhostAI shows what is missing,
              rewrites weak bullets, and helps you match the role before you apply.
            </p>

            {/* Quick start input */}
            <form action="/ghost" method="GET" className="max-w-2xl mx-auto mb-5">
              <div className="bg-slate-900 border border-sky-500/20 rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-lg shadow-sky-500/10">
                <input
                  name="prompt"
                  type="text"
                  placeholder="Paste a job description - we'll guide you from there..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm outline-none text-white placeholder:text-slate-500"
                />

                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg text-sm font-semibold text-white transition whitespace-nowrap"
                >
                  Get my CV match score →
                </button>
              </div>

              <p className="text-xs text-sky-400 mt-2 text-center">
                See your match score + missing keywords instantly
              </p>

              <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sky-300 font-medium">
                Free to start
                </span>
                
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300">
                Takes 30 seconds
                </span>

                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300 font-medium">
                No signup required
                </span>
              </div>
            </form>

            {/* Above-fold proof */}
            <div className="max-w-4xl mx-auto text-left mb-5">
              <p className="text-xs text-slate-500 mb-3 text-center">
                Example: turning generic experience into a job-matched bullet
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">❌ Generic CV bullet</p>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
                    <p className="text-slate-300">
                      Built data pipelines and worked with SQL to support reporting.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-sky-400 mb-1 font-semibold">
                    ✅ Stronger, job-matched bullet
                  </p>
                  <div className="bg-slate-900 border border-sky-500/30 rounded-xl p-4 h-full shadow-lg shadow-sky-500/10">
                    <p className="text-white">
                      Designed SQL-based reporting pipelines that improved data
                      reliability and supported faster business decision-making.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400 mt-6 text-center">
                Get your match score, missing keywords, and improved bullets in seconds.
              </p>
            </div>

            <nav
              aria-label="Main navigation"
              className="flex flex-col sm:flex-row gap-4 justify-center mt-4"
            >
              <Link
                href="/signup"
                className="px-7 py-3.5 bg-sky-500 hover:bg-sky-600 rounded-xl text-white font-semibold transition shadow-lg shadow-sky-500/20"
              >
                Fix My CV for This Job
              </Link>
            </nav>

            <p className="mt-4 text-sm text-slate-400">
              Paste your CV + job description • Get instant feedback • Free to start
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300">
                CV feedback
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300">
                ATS-style score
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300">
                Job description matching
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300">
                Interview coaching
              </span>
            </div>
          </div>
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
<section className="max-w-5xl mx-auto px-6 py-14 sm:py-20">
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
      <section className="max-w-6xl mx-auto px-6 py-8 sm:py-12">
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
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
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

      
        {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <div className="text-center mb-10">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">
            Early feedback
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What early users are saying
          </h2>

          <p className="text-slate-300 max-w-2xl mx-auto">
            GhostAI is being refined through real feedback from graduates,
            job seekers, and professionals actively applying for roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-slate-300 leading-relaxed mb-5">
              “The keyword suggestions were much more actionable than I expected.
              It actually explained why my CV felt weak.”
            </p>

            <div>
              <p className="font-semibold text-white">
                Graduate Applicant
              </p>
              <p className="text-sm text-slate-500">
                London
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-slate-300 leading-relaxed mb-5">
              “Most tools just give a score. GhostAI felt more like actual coaching
              and helped me rewrite weak bullet points properly.”
            </p>

            <div>
              <p className="font-semibold text-white">
                Career Switcher
              </p>
              <p className="text-sm text-slate-500">
                Manchester
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-slate-300 leading-relaxed mb-5">
              “The interview feedback was surprisingly useful. It pushed my answers
              to sound clearer and more structured.”
            </p>

            <div>
              <p className="font-semibold text-white">
                Tech Applicant
              </p>
              <p className="text-sm text-slate-500">
                Birmingham
              </p>
            </div>
          </div>
        </div>
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
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
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
      <footer className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2026 GhostAI. All rights reserved.</p>
          <div className="mt-4 flex justify-center">
  <a
    href="https://backlinklog.com/listing/ghostaicorp.com"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src="https://backlinklog.com/badge/ghostaicorp.com.svg"
      alt="Listed on BacklinkLog"
      width="160"
      height="40"
    />
  </a>
</div>

          <nav aria-label="Footer navigation" className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition">
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}