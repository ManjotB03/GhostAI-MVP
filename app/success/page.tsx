"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONTACT = "ghostaicorp@gmail.com";

type Copy = { title: string; body: string; note: string };

const COPY: Record<string, Copy> = {
  "cv-rewrite": {
    title: "Thanks! Now send me your CV",
    body: "Your CV Rewrite is booked and your lifetime GhostAI access is active. To get started, email your CV and the job ad (or a link to it) using the button below. You'll get your rewritten CV and a video walkthrough within 48 hours.",
    note: "Your Lifetime Pass doesn't renew, so there's nothing to cancel.",
  },
  lifetime: {
    title: "Welcome, founding member",
    body: "Your Lifetime Pass is active. You have GhostAI Pro for life: tailored CVs, unlimited application tracking, cover letters and interview practice.",
    note: "One payment, so there's nothing to cancel.",
  },
  "job-hunt-pass": {
    title: "Your Job Hunt Pass is active",
    body: "You have GhostAI Pro for the next 90 days: tailored CVs, unlimited application tracking, cover letters and interview practice.",
    note: "The pass doesn't renew, so there's nothing to cancel.",
  },
};

const SUBSCRIPTION: Copy = {
  title: "Welcome to GhostAI Pro",
  body: "Your subscription is now active. You can start using higher limits, interview mock mode, cover letters and unlimited application tracking.",
  note: "You can manage or cancel your subscription anytime from Manage Billing on the pricing page.",
};

export default function SuccessPage() {
  // Read ?plan= on the client (avoids a Suspense boundary for useSearchParams).
  const [plan, setPlan] = useState<string | null>(null);
  useEffect(() => {
    setPlan(new URLSearchParams(window.location.search).get("plan"));
  }, []);

  const copy = (plan && COPY[plan]) || SUBSCRIPTION;
  const isRewrite = plan === "cv-rewrite";
  const mailto = `mailto:${CONTACT}?subject=${encodeURIComponent("CV Rewrite")}&body=${encodeURIComponent(
    "Hi Manjot,\n\nThe role I'm targeting: \nLink to the job ad (if you have one): \nMy deadline (if any): \n\nI've attached my CV.\n"
  )}`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-xl text-center">
        <div className="text-5xl mb-6">🎉</div>

        <h1 className="text-4xl font-extrabold mb-4">{copy.title}</h1>

        <p className="text-slate-300 text-lg mb-8">{copy.body}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isRewrite ? (
            <a
              href={mailto}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg font-semibold transition"
            >
              Email my CV
            </a>
          ) : null}
          <Link
            href="/ghost"
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              isRewrite
                ? "bg-slate-800 hover:bg-slate-700 border border-slate-700"
                : "bg-sky-500 hover:bg-sky-400 text-slate-950"
            }`}
          >
            Go to GhostAI
          </Link>
        </div>

        {isRewrite && (
          <p className="text-sm text-slate-400 mt-6">
            Or email it yourself to <span className="text-slate-200">{CONTACT}</span> with the subject
            &quot;CV Rewrite&quot;.
          </p>
        )}

        <p className="text-sm text-slate-500 mt-8">{copy.note}</p>
      </div>
    </main>
  );
}
