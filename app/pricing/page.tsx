"use client";

import { useSession } from "next-auth/react";

export default function PricingPage() {
  const { data: session } = useSession();

  const handleSubscribe = async (plan: "pro" | "ultimate") => {
    if (!session?.user?.email) {
      alert("You must be signed in to upgrade your plan.");
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        email: session.user.email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("CHECKOUT RESPONSE:", { status: res.status, data });
      alert(data?.error || "Checkout failed");
      return;
    }

    if (data?.url) window.location.href = data.url;
  };

  return (
    <div className="max-w-5xl mx-auto mt-16 px-6 text-center text-white">
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
        Pricing
      </h1>

      <p className="text-slate-300 text-lg mb-12">
        Choose the plan that helps you get hired faster. Upgrade anytime.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* FREE */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-left">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Try it first</p>
          <h2 className="text-2xl font-bold mb-2">Free</h2>
          <p className="text-4xl font-extrabold text-indigo-300 mb-4">£0</p>

          <p className="text-slate-300 mb-5">Get real career value with no commitment.</p>

          <ul className="text-slate-300 space-y-3 mb-6">
            <li>• Daily career questions limit</li>
            <li>• CV bullet rewrites & improvements</li>
            <li>• Basic interview answer support</li>
            <li>• Secure Google login</li>
          </ul>

          <button className="w-full py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
            Current Plan
          </button>
        </div>

        {/* PRO */}
        <div className="bg-slate-950 border-2 border-indigo-500 rounded-2xl p-8 shadow-2xl text-left transform scale-105">
          <p className="text-xs uppercase tracking-wider text-indigo-300 mb-2">Most Popular</p>
          <h2 className="text-2xl font-bold mb-2">Pro</h2>
          <p className="text-4xl font-extrabold text-indigo-300 mb-4">
            £4.99<span className="text-base font-semibold text-slate-300">/mo</span>
          </p>

          <p className="text-slate-300 mb-5">
            Your daily career assistant to help you apply faster and answer better.
          </p>

          <ul className="text-slate-300 space-y-3 mb-6">
            <li>• Higher daily limit</li>
            <li>• Better CV & cover letter rewrites</li>
            <li>• Interview prep with structured STAR answers</li>
            <li>• Stronger, more actionable responses</li>
            <li>• Unlimited history access</li>
          </ul>

          <button
            onClick={() => handleSubscribe("pro")}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* ULTIMATE */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-left">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Max Power</p>
          <h2 className="text-2xl font-bold mb-2">Ultimate</h2>
          <p className="text-4xl font-extrabold text-indigo-300 mb-4">
            £14.99<span className="text-base font-semibold text-slate-300">/mo</span>
          </p>

          <p className="text-slate-300 mb-5">
            For power users who want maximum performance and zero friction.
          </p>

          <ul className="text-slate-300 space-y-3 mb-6">
            <li>• Very high / near-unlimited usage</li>
            <li>• Top-tier AI responses</li>
            <li>• Personalized coaching behaviour</li>
            <li>• Early access to new features</li>
            <li>• Best speed and priority</li>
          </ul>

          <button
            onClick={() => handleSubscribe("ultimate")}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Unlock Ultimate
          </button>
        </div>
      </div>

      <p className="text-slate-400 text-sm mt-10">Cancel anytime. No hidden fees.</p>
    </div>
  );
}
