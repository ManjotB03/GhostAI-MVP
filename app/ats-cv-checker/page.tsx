"use client";

import { useState } from "react";
import Link from "next/link";

export default function ATSCheckerPage() {
  const [cv, setCv] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleCheck() {
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/ats-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv,
          jobDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong.");
        return;
      }

      setResults(data);
    } catch (err: any) {
      setError(err?.message || "ATS checker failed.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    results?.score >= 70
      ? "bg-green-500"
      : results?.score >= 40
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* NAV */}
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-400">
            GhostAI
          </Link>

          <Link
            href="/signup"
            className="bg-green-500 hover:bg-green-600 transition px-5 py-2 rounded-lg font-semibold text-black"
          >
            Sign up free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-16 text-center">
        <h1 className="text-5xl font-extrabold mb-6">
          Free ATS CV Checker
        </h1>

        <p className="text-xl text-slate-300 mb-8">
          Paste your CV and job description. Get an instant ATS match score,
          missing keywords, and 3 improvements. No signup needed.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <span className="bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm">
            Free
          </span>

          <span className="bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm">
            No signup
          </span>

          <span className="bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm">
            Instant results
          </span>
        </div>
      </section>

      {/* TOOL */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <textarea
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            placeholder="Paste your full CV here..."
            className="min-h-[350px] rounded-2xl bg-zinc-900 border border-white/10 p-5 outline-none focus:border-green-500"
          />

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="min-h-[350px] rounded-2xl bg-zinc-900 border border-white/10 p-5 outline-none focus:border-green-500"
          />
        </div>

        <button
          onClick={handleCheck}
          disabled={loading}
          className="w-full mt-6 bg-green-500 hover:bg-green-600 transition py-4 rounded-2xl font-bold text-lg text-black"
        >
          {loading ? "Checking ATS score..." : "Check my ATS score →"}
        </button>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* RESULTS */}
        {results && (
          <div className="mt-12 bg-zinc-900 border border-white/10 rounded-3xl p-8">
            <div className="flex justify-center mb-10">
              <div
                className={`w-40 h-40 rounded-full ${scoreColor} flex items-center justify-center text-5xl font-extrabold text-black`}
              >
                {results.score}%
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Missing */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-red-400">
                  Missing Keywords
                </h3>

                <div className="flex flex-wrap gap-2">
                  {results.missingKeywords?.map((item: string) => (
                    <span
                      key={item}
                      className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 rounded-full text-sm"
                    >
                      ✕ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matched */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-green-400">
                  Matched Keywords
                </h3>

                <div className="flex flex-wrap gap-2">
                  {results.matchedKeywords?.map((item: string) => (
                    <span
                      key={item}
                      className="bg-green-500/20 border border-green-500/30 text-green-300 px-3 py-2 rounded-full text-sm"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div className="mt-12">
              <h3 className="text-3xl font-bold mb-6">
                Top 3 Improvements
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.improvements?.map(
                  (item: string, index: number) => (
                    <div
                      key={index}
                      className="bg-black border border-white/10 rounded-2xl p-5"
                    >
                      <div className="text-green-400 text-2xl font-bold mb-3">
                        {index + 1}
                      </div>

                      <p className="text-slate-300">{item}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link
                href="/signup"
                className="inline-block bg-green-500 hover:bg-green-600 transition px-8 py-4 rounded-2xl font-bold text-black text-lg"
              >
                Want a full CV rewrite? Try GhostAI free →
              </Link>
            </div>
          </div>
        )}
      </section>
      
      {/* SEO ARTICLE */}
<section className="max-w-4xl mx-auto px-6 pb-24">
  <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8">
    <h2 className="text-4xl font-bold mb-6">
      What is an ATS score and why does it matter?
    </h2>

    <div className="space-y-5 text-slate-300 leading-relaxed">
      <p>
        An ATS score measures how well your CV matches a job description.
        ATS stands for Applicant Tracking System — software used by many UK
        employers and recruiters to scan CVs before a human reviews them.
      </p>

      <p>
        Most large companies use ATS software to filter applications based on
        keywords, skills, formatting, and relevance to the role. If your CV is
        missing important keywords from the job description, your application
        may never reach the hiring manager.
      </p>

      <p>
        This is why tailoring your CV for every application matters. A generic
        CV may look strong to a person, but ATS systems often prioritise exact
        keyword matches and role-specific terminology.
      </p>

      <p>
        A higher ATS score generally means your CV aligns more closely with the
        role you are applying for. This can improve your chances of passing the
        first screening stage and getting interviews.
      </p>

      <p>
        GhostAI helps UK job seekers improve their ATS score by identifying
        missing keywords, highlighting matched skills, and suggesting practical
        CV improvements instantly. Instead of guessing why applications are
        being rejected, you can quickly see how well your CV fits the role.
      </p>

      <p>
        While ATS optimisation is important, recruiters still review your
        experience, achievements, and communication skills. The goal is not to
        “trick” ATS systems, but to make your CV clearer, more relevant, and
        easier for both software and recruiters to understand.
      </p>
    </div>
  </div>
</section>

{/* FAQ */}
<section className="max-w-4xl mx-auto px-6 pb-24">
  <h2 className="text-4xl font-bold mb-8 text-center">
    Free ATS CV Checker FAQs
  </h2>

  <div className="space-y-4">
    {[
      {
        q: "What is a good ATS score?",
        a: "A good ATS score is usually 70% or higher. This suggests your CV closely matches the job description and includes many of the relevant keywords recruiters may be looking for.",
      },
      {
        q: "Is this ATS checker free?",
        a: "Yes. GhostAI’s ATS CV checker is free to use and does not require signup to get your initial score and keyword feedback.",
      },
      {
        q: "Should I tailor my CV for every job?",
        a: "Yes. Tailoring your CV for each job can improve keyword alignment, make your experience feel more relevant, and increase your chances of passing early screening.",
      },
      {
        q: "Can ATS software reject my CV automatically?",
        a: "Some employers use ATS software to rank, filter, or organise CVs before recruiters review them. A poorly matched CV may be less likely to reach the interview stage.",
      },
      {
        q: "Does GhostAI guarantee interviews?",
        a: "No. GhostAI helps improve your CV, ATS match, and interview preparation, but it cannot guarantee interviews or job offers.",
      },
    ].map((item) => (
      <div
        key={item.q}
        className="rounded-2xl border border-white/10 bg-zinc-900 p-6"
      >
        <h3 className="text-xl font-semibold mb-2">{item.q}</h3>
        <p className="text-slate-300 leading-relaxed">{item.a}</p>
      </div>
    ))}
  </div>
</section>

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [ { "@type": "Question", name: "What is a good ATS score?", acceptedAnswer: { "@type": "Answer", text: "A good ATS score is usually 70% or higher. This suggests your CV closely matches the job description and includes many relevant keywords.", }, }, { "@type": "Question", name: "Is this ATS checker free?", acceptedAnswer: { "@type": "Answer", text: "Yes. GhostAI’s ATS CV checker is free to use and does not require signup to get your initial score and keyword feedback.", }, }, { "@type": "Question", name: "Should I tailor my CV for every job?", acceptedAnswer: { "@type": "Answer", text: "Yes. Tailoring your CV for each job can improve keyword alignment and make your experience more relevant.", }, }, { "@type": "Question", name: "Can ATS software reject my CV automatically?", acceptedAnswer: { "@type": "Answer", text: "Some employers use ATS software to rank, filter, or organise CVs before recruiters review them.", }, }, { "@type": "Question", name: "Does GhostAI guarantee interviews?", acceptedAnswer: { "@type": "Answer", text: "No. GhostAI helps improve your CV, ATS match, and interview preparation, but cannot guarantee interviews or job offers.", }, }, ], }), }} />

    </main>
  );
}
