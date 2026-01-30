"use client";

import React from "react";
import ModernLayout from "../components/ModernLayout";

export default function PricingPage() {
  const handleUpgrade = async (priceId: string) => {
    console.log("CLICKED PRICE:", priceId);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert("Stripe error – no checkout URL returned");
      console.error(data);
    }
  };

  return (
    <ModernLayout>
      <div className="relative z-50 flex flex-col items-center w-full pointer-events-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Pricing</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pointer-events-auto">

          {/* FREE */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-2">Free</h2>
            <p className="text-gray-300 mb-4">£0</p>
            <ul className="text-gray-400 text-sm mb-6 space-y-2">
              <li>• 10 prompts per day</li>
              <li>• Career advice</li>
              <li>• Standard speed</li>
            </ul>
            <button
              className="w-full bg-gray-600 text-white py-2 rounded cursor-not-allowed"
              disabled
            >
              Current Plan
            </button>
          </div>

          {/* PRO */}
          <div className="bg-indigo-700 p-6 rounded-xl border border-indigo-500 relative z-50 pointer-events-auto">
            <h2 className="text-xl font-bold text-white mb-2">Pro</h2>
            <p className="text-white mb-4">£4.99 / month</p>
            <ul className="text-indigo-100 text-sm mb-6 space-y-2">
              <li>• 45 prompts per day</li>
              <li>• Faster responses</li>
              <li>• Interview mock mode</li>
            </ul>
            <button
              type="button"
              onClick={() =>
                handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE!)
              }
              className="w-full bg-white text-indigo-700 py-2 rounded font-semibold hover:bg-gray-200 pointer-events-auto"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* ULTIMATE */}
          <div className="bg-purple-700 p-6 rounded-xl border border-purple-500 relative z-50 pointer-events-auto">
            <h2 className="text-xl font-bold text-white mb-2">Ultimate</h2>
            <p className="text-white mb-4">£14.99 / month</p>
            <ul className="text-purple-100 text-sm mb-6 space-y-2">
              <li>• Unlimited prompts</li>
              <li>• Top-tier AI</li>
              <li>• Priority features</li>
            </ul>
            <button
              type="button"
              onClick={() =>
                handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_PRICE!)
              }
              className="w-full bg-white text-purple-700 py-2 rounded font-semibold hover:bg-gray-200 pointer-events-auto"
            >
              Upgrade to Ultimate
            </button>
          </div>

        </div>
      </div>
    </ModernLayout>
  );
}
