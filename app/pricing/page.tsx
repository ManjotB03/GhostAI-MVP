"use client";

import { useSession } from "next-auth/react";

export default function PricingPage() {
  const { data: session } = useSession();

  const handleSubscribe = async (plan: "pro" | "ultimate") => {
    if (!session?.user?.email) {
      alert("You must be signed in to upgrade.");
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
    <div className="max-w-5xl mx-auto mt-16 px-6 text-center">
      <h1 className="text-5xl font-extrabold mb-4 text-white">
        Pricing
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">

        <div className="bg-gray-800 p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-white">Free</h2>
          <p className="text-gray-400 mt-4">£0</p>
          <button className="mt-6 w-full py-3 bg-gray-600 rounded">
            Current Plan
          </button>
        </div>

        <div className="bg-indigo-900 p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-white">Pro</h2>
          <p className="text-gray-300 mt-4">£4.99 / mo</p>
          <button
            onClick={() => handleSubscribe("pro")}
            className="mt-6 w-full py-3 bg-indigo-600 rounded"
          >
            Upgrade
          </button>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-white">Ultimate</h2>
          <p className="text-gray-300 mt-4">£14.99 / mo</p>
          <button
            onClick={() => handleSubscribe("ultimate")}
            className="mt-6 w-full py-3 bg-indigo-600 rounded"
          >
            Unlock
          </button>
        </div>

      </div>
    </div>
  );
}
