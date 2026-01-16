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
    } else {
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-16 px-6 text-center">
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
        Pricing
      </h1>

      <p className="text-gray-300 text-lg mb-12">
        Choose the plan that fits your goals. Upgrade anytime.
      </p>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* FREE PLAN */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
          <p className="text-4xl font-extrabold text-indigo-400 mb-4">£0</p>

          <p className="text-gray-300 mb-4">
            Try GhostAI and get real value with no commitment.
          </p>

          <ul className="text-gray-300 space-y-3 mb-6 text-left">
            <li>
              • Up to <strong>5 AI questions per day</strong>
            </li>
            <li>• Career-focused guidance</li>
            <li>• Standard response speed</li>
            <li>• Secure Google login</li>
          </ul>

          <button className="w-full py-3 bg-gray-700 text-white rounded-lg cursor-default">
            Current Plan
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="relative bg-gray-900 border-2 border-indigo-500 rounded-2xl p-8 shadow-2xl transform scale-105">
          {/* Most Popular Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm px-4 py-1 rounded-full">
            Most Popular
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
          <p className="text-4xl font-extrabold text-indigo-400 mb-4">
            £4.99 / mo
          </p>

          <p className="text-gray-300 mb-4">
            Unlock GhostAI as your daily career assistant.
          </p>

          <ul className="text-gray-300 space-y-3 mb-6 text-left">
            <li>
              • <strong>20 AI questions per day</strong>
            </li>
            <li>• Faster response speed</li>
            <li>• Priority AI models</li>
            <li>• Deeper, more actionable answers</li>
            <li>• Full history access</li>
          </ul>

          <button
            onClick={() => handleSubscribe("pro")}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* ULTIMATE PLAN */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ultimate</h2>
          <p className="text-4xl font-extrabold text-indigo-400 mb-4">
            £14.99 / mo
          </p>

          <p className="text-gray-300 mb-4">Maximum power. No limits.</p>

          <ul className="text-gray-300 space-y-3 mb-6 text-left">
            <li>
              • <strong>Unlimited AI questions</strong>
            </li>
            <li>• Ultra-fast responses</li>
            <li>• Top-tier AI models (GPT-4 / GPT-5 level)</li>
            <li>• Personalised AI behaviour</li>
            <li>• Early access to new features</li>
          </ul>

          <button
            onClick={() => handleSubscribe("ultimate")}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Unlock Ultimate
          </button>
        </div>
      </div>
    </div>
  );
}
