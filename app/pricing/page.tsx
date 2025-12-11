"use client";

import { useSession } from "next-auth/react";

export default function PricingPage() {
  const { data: session } = useSession();

  const handleSubscribe = async (plan: string) => {
    if (!session?.user?.email) {
      alert("You must be signed in to upgrade your plan.");
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        email: session.user.email,   // ⬅️ REQUIRED
      }),
    });

    const data = await res.json();
    window.location.href = data.url; // Redirect to Stripe checkout
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
          <ul className="text-gray-300 space-y-3 mb-6 text-left">
            <li>• 20 questions/day</li>
            <li>• Work, Career & Money categories</li>
            <li>• Standard response speed</li>
          </ul>

          <button className="w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
            Current Plan
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="bg-gray-900 border-2 border-indigo-500 rounded-2xl p-8 shadow-2xl transform scale-105">
          <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
          <p className="text-4xl font-extrabold text-indigo-400 mb-4">£4.99/mo</p>
          <ul className="text-gray-300 space-y-3 mb-6 text-left">
            <li>• Unlimited questions</li>
            <li>• Faster response speed</li>
            <li>• Priority AI model usage</li>
            <li>• Full category access</li>
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
          <p className="text-4xl font-extrabold text-indigo-400 mb-4">£14.99/mo</p>
          <ul className="text-gray-300 space-y-3 mb-6 text-left">
            <li>• Everything in Pro</li>
            <li>• Ultra-fast responses</li>
            <li>• GPT-4 / GPT-5 Tier Models</li>
            <li>• Custom AI personalization</li>
          </ul>

          <button
            onClick={() => handleSubscribe("ultimate")}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Unlock Ultimate
          </button>
        </div>
      </div>
    </div>
  );
}
