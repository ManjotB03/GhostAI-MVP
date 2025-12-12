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
        email: session.user.email,
      }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="max-w-5xl mx-auto mt-16 px-6 text-center">
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
        Pricing
      </h1>

      <p className="text-gray-300 text-lg mb-12">
        Choose the plan that fits your goals. Upgrade anytime.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* FREE */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white">Free</h2>
          <p className="text-4xl text-indigo-400 mb-4">£0</p>
          <ul className="text-gray-300 mb-6 space-y-2 text-left">
            <li>• 20 questions/day</li>
            <li>• Work, Career & Money</li>
          </ul>
          <button className="w-full py-3 bg-gray-700 rounded-lg">
            Current Plan
          </button>
        </div>

        {/* PRO */}
        <div className="bg-gray-900 border-2 border-indigo-500 rounded-2xl p-8 scale-105">
          <h2 className="text-2xl font-bold text-white">Pro</h2>
          <p className="text-4xl text-indigo-400 mb-4">£4.99/mo</p>
          <ul className="text-gray-300 mb-6 space-y-2 text-left">
            <li>• Unlimited usage</li>
            <li>• Faster AI</li>
          </ul>
          <button
            onClick={() => handleSubscribe("pro")}
            className="w-full py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* ULTIMATE */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white">Ultimate</h2>
          <p className="text-4xl text-indigo-400 mb-4">£14.99/mo</p>
          <ul className="text-gray-300 mb-6 space-y-2 text-left">
            <li>• Everything in Pro</li>
            <li>• Top-tier models</li>
          </ul>
          <button
            onClick={() => handleSubscribe("ultimate")}
            className="w-full py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Unlock Ultimate
          </button>
        </div>
      </div>
    </div>
  );
}
