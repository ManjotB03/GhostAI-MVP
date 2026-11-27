"use client";

import { useState } from "react";

type Props = {
  source: "ats-report" | "lifetime-waitlist";
  buttonLabel: string;
  report?: unknown;
  /** What we tell the user after success, depending on what the server did. */
  successEmailed?: string;
  successStored?: string;
};

export default function EmailCapture({
  source,
  buttonLabel,
  report,
  successEmailed = "Sent. Check your inbox (and spam, just in case).",
  successStored = "Thanks, you're on the list.",
}: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, consent, report }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setState("done");
      if (source === "ats-report") {
        setMessage(
          data.emailed
            ? successEmailed
            : "We couldn't send the email right now, but we've saved your address and will follow up."
        );
      } else {
        setMessage(successStored);
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition disabled:opacity-70"
        >
          {state === "sending" ? "Sending..." : buttonLabel}
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs text-slate-400 text-left">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-sky-500"
        />
        Also send me occasional job-search tips and GhostAI offers. Unsubscribe anytime.
      </label>
      {state === "error" && <p className="mt-2 text-sm text-red-300">{message}</p>}
    </form>
  );
}
