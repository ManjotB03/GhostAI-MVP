"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<null | "pro" | "ultimate">(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const handleSubscribe = async (tier: "pro" | "ultimate") => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      window.location.href = "/login";
      return;
    }

    try {
      setLoadingPlan(tier);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.alreadySubscribed) {
        const portalRes = await fetch("/api/stripe/portal", { method: "POST" });
        const portalData = await portalRes.json();

        if (portalRes.ok && portalData?.url) {
          window.location.href = portalData.url;
          return;
        }

        alert(data?.message || "You already have an active subscription.");
        return;
      }

      if (!res.ok) {
        alert(data?.error || data?.message || "Checkout failed");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      alert("Checkout failed: missing checkout URL.");
    } catch (err: any) {
      alert(err?.message || "Checkout error");
    } finally {
      setLoadingPlan(null);
    }
  };

  const [passLoading, setPassLoading] = useState(false);

  const handleJobHuntPass = async () => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      window.location.href = "/signup?next=/pricing";
      return;
    }
    try {
      setPassLoading(true);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "job-hunt-pass" }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      alert(data?.message || data?.error || "Checkout failed");
    } catch (err: any) {
      alert(err?.message || "Checkout error");
    } finally {
      setPassLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!session?.user?.email) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || data?.message || "Could not open billing portal");
        return;
      }

      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      alert(err?.message || "Portal error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-16 pb-20 px-6 text-center text-white">
      <p className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300 mb-4">
        Start free. Upgrade when you need more.
      </p>

      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
        Pricing
      </h1>

      <p className="text-slate-300 text-lg mb-3 max-w-2xl mx-auto">
        Clear plans for job seekers who want better CV feedback, stronger
        applications, and a system to manage the whole search.
      </p>

      <p className="text-slate-500 text-sm mb-10">
        Cancel anytime. No hidden fees.
      </p>

      {session?.user?.email && (
        <div className="mb-10">
          <button
            onClick={handleManageBilling}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition"
          >
            Manage Billing
          </button>
        </div>
      )}

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span
          className={`text-sm font-medium ${
            billingCycle === "monthly" ? "text-white" : "text-slate-400"
          }`}
        >
          Monthly
        </span>

        <button
          onClick={() =>
            setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")
          }
          aria-label="Toggle billing cycle"
          className="relative w-16 h-8 bg-slate-800 rounded-full border border-slate-700 transition"
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-sky-500 transition-all ${
              billingCycle === "annual" ? "left-9" : "left-1"
            }`}
          />
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              billingCycle === "annual" ? "text-white" : "text-slate-400"
            }`}
          >
            Annual
          </span>

          <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/30">
            Save 33%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* FREE */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-left flex flex-col">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Try GhostAI
          </p>
          <h2 className="text-2xl font-bold mb-2">Free</h2>
          <p className="text-4xl font-extrabold text-sky-300 mb-4">£0</p>

          <p className="text-slate-300 mb-5">
            Best for testing GhostAI and getting your first CV match score.
          </p>

          <ul className="text-slate-300 space-y-3 mb-6 flex-1">
            <li>• 10 AI requests per day</li>
            <li>• CV feedback and bullet rewrites</li>
            <li>• ATS-style match score</li>
            <li>• Missing keyword suggestions</li>
            <li>• Track up to 5 applications</li>
            <li>• Free ATS checker (no signup needed)</li>
          </ul>

          <button
            disabled
            className="w-full py-3 bg-slate-700 text-white rounded-lg opacity-80 cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* PRO */}
        <div className="bg-slate-950 border-2 border-sky-500 rounded-2xl p-8 shadow-2xl text-left lg:scale-105 flex flex-col">
          <p className="text-xs uppercase tracking-wider text-sky-300 mb-2">
            Most Popular
          </p>
          <h2 className="text-2xl font-bold mb-2">Pro</h2>
          <p className="text-4xl font-extrabold text-sky-300 mb-1">
            {billingCycle === "monthly" ? "£4.99/mo" : "£3.33/mo"}
          </p>

          {billingCycle === "annual" && (
            <div className="mb-4">
              <p className="text-sm text-slate-400 line-through">£4.99/mo</p>
              <p className="text-emerald-300 text-sm font-medium">
                Billed annually at £39.99
              </p>
            </div>
          )}

          <p className="text-slate-300 mb-5">
            Best for active job seekers tailoring CVs across multiple applications.
          </p>

          <ul className="text-slate-300 space-y-3 mb-6 flex-1">
            <li>• 45 AI requests per day</li>
            <li>
              • <span className="text-white font-medium">Unlimited</span>{" "}
              application tracking
            </li>
            <li>• Interview mock mode with STAR-style feedback</li>
            <li>• Everything in Free</li>
          </ul>

          <button
            onClick={() => handleSubscribe("pro")}
            disabled={loadingPlan === "pro"}
            className="w-full py-3 bg-sky-500 text-slate-950 rounded-lg hover:bg-sky-400 transition disabled:opacity-70 disabled:cursor-not-allowed font-semibold"
          >
            {loadingPlan === "pro" ? "Redirecting..." : "Upgrade to Pro"}
          </button>
        </div>

        {/* ULTIMATE */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-left flex flex-col">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Power User
          </p>
          <h2 className="text-2xl font-bold mb-2">Ultimate</h2>
          <p className="text-4xl font-extrabold text-sky-300 mb-1">
            {billingCycle === "monthly" ? "£14.99/mo" : "£9.99/mo"}
          </p>

          {billingCycle === "annual" && (
            <div className="mb-4">
              <p className="text-sm text-slate-400 line-through">£14.99/mo</p>
              <p className="text-emerald-300 text-sm font-medium">
                Billed annually at £119.99
              </p>
            </div>
          )}

          <p className="text-slate-300 mb-5">
            Best for heavy users, career switchers, and people applying at scale.
          </p>

          <ul className="text-slate-300 space-y-3 mb-6 flex-1">
            <li>• Unlimited AI requests</li>
            <li>
              • <span className="text-white font-medium">Unlimited</span>{" "}
              application tracking
            </li>
            <li>• Interview mock mode with STAR-style feedback</li>
            <li>• Everything in Pro</li>
            <li>• Priority access to new features</li>
          </ul>

          <button
            onClick={() => handleSubscribe("ultimate")}
            disabled={loadingPlan === "ultimate"}
            className="w-full py-3 bg-sky-500 text-slate-950 rounded-lg hover:bg-sky-400 transition disabled:opacity-70 disabled:cursor-not-allowed font-semibold"
          >
            {loadingPlan === "ultimate" ? "Redirecting..." : "Unlock Ultimate"}
          </button>
        </div>
      </div>

      {/* Comparison table */}
      <div className="mt-16 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-950">
              <tr>
                <th className="p-5 text-white font-semibold">Features</th>
                <th className="p-5 text-white font-semibold">Free</th>
                <th className="p-5 text-sky-300 font-semibold">Pro</th>
                <th className="p-5 text-white font-semibold">Ultimate</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-5">AI requests per day</td>
                <td className="p-5">10</td>
                <td className="p-5">45</td>
                <td className="p-5">Unlimited</td>
              </tr>

              <tr>
                <td className="p-5">CV feedback &amp; bullet rewrites</td>
                <td className="p-5 text-sky-400">✓</td>
                <td className="p-5 text-sky-400">✓</td>
                <td className="p-5 text-sky-400">✓</td>
              </tr>

              <tr>
                <td className="p-5">ATS match score</td>
                <td className="p-5 text-sky-400">✓</td>
                <td className="p-5 text-sky-400">✓</td>
                <td className="p-5 text-sky-400">✓</td>
              </tr>

              <tr>
                <td className="p-5">Application tracking</td>
                <td className="p-5">5 applications</td>
                <td className="p-5 text-sky-400">Unlimited</td>
                <td className="p-5 text-sky-400">Unlimited</td>
              </tr>

              <tr>
                <td className="p-5">Interview mock mode</td>
                <td className="p-5 text-slate-600">✕</td>
                <td className="p-5 text-sky-400">✓</td>
                <td className="p-5 text-sky-400">✓</td>
              </tr>

              <tr>
                <td className="p-5">Saved chat history</td>
                <td className="p-5 text-sky-400">✓</td>
                <td className="p-5 text-sky-400">✓</td>
                <td className="p-5 text-sky-400">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ONE-OFF OPTIONS */}
      <div id="one-off" className="mt-16 scroll-mt-24">
        <h2 className="text-3xl font-bold text-white mb-2">Prefer to pay once?</h2>
        <p className="text-slate-400 mb-8">No subscription to remember to cancel.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          <div className="bg-slate-900/70 border border-sky-500/40 rounded-2xl p-8 shadow-xl">
            <p className="text-xs uppercase tracking-wider text-sky-300 mb-2">One job hunt</p>
            <h3 className="text-2xl font-bold mb-2">Job Hunt Pass</h3>
            <p className="text-4xl font-extrabold mb-1">£19</p>
            <p className="text-slate-400 text-sm mb-5">One payment · 90 days of Pro · no renewal</p>
            <ul className="space-y-2 text-slate-300 text-sm mb-6">
              <li>• 45 AI requests a day</li>
              <li>• Unlimited application tracking</li>
              <li>• Cover letters and interview mock mode</li>
            </ul>
            <button
              onClick={handleJobHuntPass}
              disabled={passLoading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-lg transition disabled:opacity-70"
            >
              {passLoading ? "Opening checkout..." : "Get the Job Hunt Pass"}
            </button>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-xl">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Founding members</p>
            <h3 className="text-2xl font-bold mb-2">Lifetime Pass</h3>
            <p className="text-4xl font-extrabold mb-1">£49</p>
            <p className="text-slate-400 text-sm mb-5">One payment · Pro forever · limited spots</p>
            <ul className="space-y-2 text-slate-300 text-sm mb-6">
              <li>• Everything in the Job Hunt Pass</li>
              <li>• Never pay again for your next job hunt</li>
              <li>• Only available during the founding sale</li>
            </ul>
            <Link
              href="/lifetime"
              className="block w-full py-3 text-center border border-slate-600 hover:bg-slate-800 font-semibold rounded-lg transition"
            >
              See the Lifetime Pass →
            </Link>
          </div>
        </div>
        <Link
          href="/cv-rewrite"
          className="mt-6 max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-6 py-5 text-left hover:bg-sky-500/15 transition"
        >
          <span>
            <span className="block font-semibold text-white">Want a person to do it for you?</span>
            <span className="block text-sm text-slate-300">CV Rewrite by the founder: tailored to your target role, back in 48 hours, includes Lifetime. £49.</span>
          </span>
          <span className="text-sky-300 font-semibold whitespace-nowrap">See CV Rewrite →</span>
        </Link>

        <p className="text-slate-500 text-sm mt-6">
          All of these come with our 14-day full refund. See the <Link href="/refunds" className="text-sky-400 hover:text-sky-300">Refund Policy</Link>.
        </p>
      </div>

      {/* FAQ */}
      <div className="mt-16 text-left">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Common pricing questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              q: "Can I use GhostAI for free?",
              a: "Yes. The free plan gives you 10 AI requests a day, CV feedback, an ATS match score, and tracking for up to 5 applications. You can also use the ATS checker without an account at all.",
            },
            {
              q: "What do I get by upgrading?",
              a: "Pro raises your daily requests to 45, unlocks interview mock mode, and gives you unlimited application tracking so you can manage your whole job search in one place.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. Paid plans can be cancelled anytime through the billing portal, and you can get a full refund on your first payment if you ask within 14 days. There are no hidden fees. See our Refund Policy at ghostaicorp.com/refunds.",
            },
            {
              q: "Does GhostAI guarantee interviews?",
              a: "No. GhostAI helps improve your CV, ATS match, and interview preparation, but it cannot guarantee interviews or job offers.",
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
      </div>

      {/* Which plan */}
      <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left">
        <h3 className="text-xl font-bold mb-3 text-white">
          Which plan should I choose?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm text-slate-300">
          <p>
            <span className="text-white font-semibold">Free</span> is for testing
            the product and getting quick feedback before committing.
          </p>

          <p>
            <span className="text-white font-semibold">Pro</span> is best if you
            are actively applying and want to track every application.
          </p>

          <p>
            <span className="text-white font-semibold">Ultimate</span> is for
            heavy usage, repeated interview practice, and high-volume applying.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Link
          href="/ats-cv-checker"
          className="text-sky-400 hover:text-sky-300 font-medium"
        >
          Not ready to sign up? Try the free ATS checker →
        </Link>
      </div>

      <p className="text-slate-400 text-sm mt-8">
        Cancel anytime. No hidden fees. GhostAI helps improve applications, but
        does not guarantee interviews or job offers.
      </p>
    </div>
  );
}
