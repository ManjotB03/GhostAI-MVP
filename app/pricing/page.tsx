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
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 px-6 text-center">
      {/* HEADER */}
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
        Pricing
      </h1>

      <p className="text-gray-400 text-lg mb-14">
        Choose the plan that fits your goals. Upgrade anytime.
      </p>

      {/* PRICING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* FREE PLAN */}
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
          <p className="text-4xl font-extrabold text-indigo-400 mb-4">£0</p>

          <p className="text-gray-400 mb-6">
            Try GhostAI and get real value with no commitment.
          </p>

          <ul className="text-gray-300 space-y-3 text-left mb-8">
            <li>• Up to <strong>20 AI questions per day</strong></li>
            <li>• Work, Career & Money categories</li>
            <li>• Standard response speed</li>
            <li>• Secure Google login</li>
          </ul>

          <button className="w-full py-3 bg-gray-700 text-white rounded-lg cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="bg-gray-900 border-2 border-indigo-500 rounded-2xl p-8 shadow-2xl transform scale-105 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
            Most Popular
          </span>

          <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
          <p className="text-4xl font-extrabold text-indigo-400 mb-4">£4.99 / mo</p>

          <p className="text-gray-300 mb-6">
            Unlock GhostAI as your daily assistant.
          </p>

          <ul className="text-gray-300 space-y-3 text-left mb-8">
            <li>• <strong>Unlimited AI questions</strong></li>
            <li>• Faster response speed</li>
            <li>• Priority AI models</li>
            <li>• Deeper, more actionable answers</li>
            <li>• Unlimited history access</li>
          </ul>

          <button
            onClick={() => handleSubscribe("pro")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* ULTIMATE PLAN */}
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ultimate</h2>
          <p className="text-4xl font-extrabold text-indigo-400 mb-4">£14.99 / mo</p>

          <p className="text-gray-300 mb-6">
            Maximum power. No limits.
          </p>

          <ul className="text-gray-300 space-y-3 text-left mb-8">
            <li>• Everything in Pro</li>
            <li>• <strong>Ultra-fast responses</strong></li>
            <li>• Top-tier AI models (GPT-4 / GPT-5 level)</li>
            <li>• Personalised AI behaviour</li>
            <li>• Early access to new features</li>
          </ul>

          <button
            onClick={() => handleSubscribe("ultimate")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            Unlock Ultimate
          </button>
        </div>

      </div>

      {/* FOOTER NOTE */}
      <p className="mt-14 text-gray-500 text-sm">
        Free = Try it • Pro = Use it daily • Ultimate = Dominate your decisions
      </p>
    </div>
  );
}
