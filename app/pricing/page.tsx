"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<null | "pro" | "ultimate">(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const handleSubscribe = async (tier: "pro" | "ultimate") => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      alert("You must be signed in to upgrade your plan.");
      window.location.href = "/login";
      return;
    }

    try {
      setLoadingPlan(tier);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
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

  const handleManageBilling = async () => {
    if (!session?.user?.email) {
      alert("You must be signed in.");
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
    <div className="max-w-6xl mx-auto mt-16 px-6 text-center text-white">
        
      <p className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-300 mb-4">
        Start free. Upgrade when you need more.
      </p>

      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
        Pricing
      </h1>

      <p className="text-slate-300 text-lg mb-3 max-w-2xl mx-auto">
        Clear plans for job seekers who want better CV feedback, stronger applications,
        and interview coaching without vague limits.
      </p>

      <p className="text-slate-500 text-sm mb-10">
        Cancel anytime. No hidden fees. Upgrade only when GhostAI becomes part of your application workflow.
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
      setBillingCycle(
        billingCycle === "monthly" ? "annual" : "monthly"
      )
    }
    className="relative w-16 h-8 bg-slate-800 rounded-full border border-slate-700 transition"
  >
    <div
      className={`absolute top-1 w-6 h-6 rounded-full bg-indigo-500 transition-all ${
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

    <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
      Save 33%
    </span>
  </div>
</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* FREE */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-left">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Try GhostAI
          </p>
          <h2 className="text-2xl font-bold mb-2">Free</h2>
          <p className="text-4xl font-extrabold text-indigo-300 mb-4">£0</p>

          <p className="text-slate-300 mb-5">
            Best for testing GhostAI and getting your first CV match score.
          </p>

          <ul className="text-slate-300 space-y-3 mb-6">
            <li>• 10 AI requests per day</li>
            <li>• CV feedback and bullet improvements</li>
            <li>• ATS-style match score</li>
            <li>• Missing keyword suggestions</li>
            <li>• Basic interview answer support</li>
          </ul>

          <button
            disabled
            className="w-full py-3 bg-slate-700 text-white rounded-lg opacity-80 cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* PRO */}
        <div className="bg-slate-950 border-2 border-indigo-500 rounded-2xl p-8 shadow-2xl text-left transform scale-105">
          <p className="text-xs uppercase tracking-wider text-indigo-300 mb-2">
            Most Popular
          </p>
          <h2 className="text-2xl font-bold mb-2">Pro</h2>
          <p className="text-4xl font-extrabold text-indigo-300 mb-1">
  {billingCycle === "monthly" ? "£4.99/mo" : "£3.33/mo"}
</p>

{billingCycle === "annual" && (
  <div className="mb-4">
    <p className="text-sm text-slate-400 line-through">
      £4.99/mo
    </p>

    <p className="text-green-300 text-sm font-medium">
      Billed annually at £39.99
    </p>
  </div>
)}

          <p className="text-slate-300 mb-5">
            Best for active job seekers tailoring CVs across multiple applications.
          </p>

          <ul className="text-slate-300 space-y-3 mb-6">
            <li>• 45 AI requests per day</li>
            <li>• More CV rewrites and tailored feedback</li>
            <li>• Stronger ATS keyword suggestions</li>
            <li>• Interview prep with structured STAR answers</li>
            <li>• Unlimited chat history access</li>
            <li>• Better support for role-specific applications</li>
          </ul>

          <button
            onClick={() => handleSubscribe("pro")}
            disabled={loadingPlan === "pro"}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingPlan === "pro" ? "Redirecting..." : "Upgrade to Pro"}
          </button>
        </div>

        {/* ULTIMATE */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-left">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Power User
          </p>
          <h2 className="text-2xl font-bold mb-2">Ultimate</h2>
          <p className="text-4xl font-extrabold text-indigo-300 mb-1">
  {billingCycle === "monthly" ? "£14.99/mo" : "£9.99/mo"}
</p>

{billingCycle === "annual" && (
  <div className="mb-4">
    <p className="text-sm text-slate-400 line-through">
      £14.99/mo
    </p>

    <p className="text-green-300 text-sm font-medium">
      Billed annually at £119.99
    </p>
  </div>
)}

          <p className="text-slate-300 mb-5">
            Best for heavy users, career switchers, and people applying at scale.
          </p>

          <ul className="text-slate-300 space-y-3 mb-6">
            <li>• 100,000 AI requests per day</li>
            <li>• Highest usage limits for heavy application cycles</li>
            <li>• Top-tier CV, interview, and career coaching responses</li>
            <li>• Priority access to new features</li>
            <li>• Best for frequent CV tailoring and interview practice</li>
            <li>• Designed for maximum flexibility</li>
          </ul>

          <button
            onClick={() => handleSubscribe("ultimate")}
            disabled={loadingPlan === "ultimate"}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingPlan === "ultimate" ? "Redirecting..." : "Unlock Ultimate"}
          </button>
        </div>
      </div>

<div className="mt-16 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[800px] text-left">
      <thead className="bg-slate-950">
        <tr>
          <th className="p-5 text-white font-semibold">Features</th>
          <th className="p-5 text-white font-semibold">Free</th>
          <th className="p-5 text-indigo-300 font-semibold">Pro</th>
          <th className="p-5 text-white font-semibold">Ultimate</th>
          <th className="p-5 text-amber-300 font-semibold">CV Boost</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-800 text-slate-300">

        <tr>
          <td className="p-5">CV tailoring sessions</td>
          <td className="p-5">5/day</td>
          <td className="p-5">50/day</td>
          <td className="p-5">Unlimited</td>
          <td className="p-5">1 rewrite</td>
        </tr>

        <tr>
          <td className="p-5">ATS score</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-green-400">✓</td>
        </tr>

        <tr>
          <td className="p-5">Gap analysis</td>
          <td className="p-5 text-slate-600">✕</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-slate-600">✕</td>
        </tr>

        <tr>
          <td className="p-5">Interview coaching</td>
          <td className="p-5 text-slate-600">✕</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-slate-600">✕</td>
        </tr>

        <tr>
          <td className="p-5">Cover letter drafting</td>
          <td className="p-5 text-slate-600">✕</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-slate-600">✕</td>
        </tr>

        <tr>
          <td className="p-5">History access</td>
          <td className="p-5 text-slate-600">✕</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-slate-600">✕</td>
        </tr>

        <tr>
          <td className="p-5">Priority support</td>
          <td className="p-5 text-slate-600">✕</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-green-400">✓</td>
          <td className="p-5 text-slate-600">✕</td>
        </tr>

        <tr>
          <td className="p-5">LinkedIn review</td>
          <td className="p-5 text-slate-600">✕</td>
          <td className="p-5 text-slate-600">✕</td>
          <td className="p-5 text-green-400">Coming soon</td>
          <td className="p-5 text-slate-600">✕</td>
        </tr>

      </tbody>
    </table>
  </div>
</div>

<div className="mt-16 text-left">
  <h2 className="text-3xl font-bold text-white text-center mb-8">
    Common pricing questions
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[
      {
        q: "Can I use GhostAI for free?",
        a: "Yes. The free plan gives you daily CV tailoring sessions, bullet rewrites, and a basic ATS score so you can try GhostAI before upgrading.",
      },
      {
        q: "What is CV Boost?",
        a: "CV Boost is a one-time option for users who want one full tailored CV rewrite without starting a subscription.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Paid plans can be cancelled anytime through the billing portal. There are no hidden fees.",
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

      <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left">
        <h3 className="text-xl font-bold mb-3 text-white">
          Which plan should I choose?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm text-slate-300">
          <p>
            <span className="text-white font-semibold">Free</span> is for testing the product
            and getting quick feedback before committing.
          </p>

          <p>
            <span className="text-white font-semibold">Pro</span> is best if you are actively
            applying and want to tailor multiple CVs each week.
          </p>

          <p>
            <span className="text-white font-semibold">Ultimate</span> is for heavy usage,
            repeated interview practice, and high-volume job applications.
          </p>
        </div>
      </div>

      <p className="text-slate-400 text-sm mt-10">
        Cancel anytime. No hidden fees. 7-day money-back guarantee on paid plans. GhostAI helps improve applications, but does not guarantee interviews or job offers.
      </p>

    {/* CV BOOST */}
<div className="bg-slate-900/70 border border-amber-500/40 rounded-2xl p-8 shadow-xl text-left">
  <p className="text-xs uppercase tracking-wider text-amber-300 mb-2">
    One-Time Purchase
  </p>

  <h2 className="text-2xl font-bold mb-2">CV Boost</h2>

  <p className="text-4xl font-extrabold text-amber-300 mb-4">
    £9.99
  </p>

  <p className="text-slate-300 mb-5">
    Perfect for users who want one high-quality CV upgrade without a subscription.
  </p>

  <ul className="text-slate-300 space-y-3 mb-6">
    <li>• 1 full CV rewrite</li>
    <li>• ATS compatibility score</li>
    <li>• Stronger bullet improvements</li>
    <li>• Tailored keyword suggestions</li>
    <li>• PDF-ready output</li>
    <li>• No recurring payments</li>
  </ul>

  <button
    className="w-full py-3 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-400 transition"
  >
    Buy CV Boost — £9.99
  </button>
</div>

    </div>
  );
}