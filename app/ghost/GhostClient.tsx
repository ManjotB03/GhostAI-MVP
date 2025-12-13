"use client";

import React, { useState } from "react";
import ModernLayout from "../components/ModernLayout";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface HistoryItem {
  task: string;
  category: string;
  response: string;
}

export default function GhostClient() {
  const { data: session } = useSession();

  // 🔐 ACCESS LOGIC
  const OWNER_EMAIL = "ghostaicorp@gmail.com"; // 🔴 CHANGE IF NEEDED

  const isOwner = session?.user?.email === OWNER_EMAIL;
  const isFreeUser = !isOwner;

  // 🧠 STATE
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("Work");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // ------------------------------
  // AI SUBMIT HANDLER (PAYWALL HERE)
  // ------------------------------
  const handleSubmit = async () => {
    if (isFreeUser) {
      alert("Upgrade to Pro to continue using GhostAI.");
      return;
    }

    if (!task.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, category }),
      });

      const data = await res.json();
      const answer = res.ok
        ? data.result
        : `Error: ${data.error || "Something went wrong"}`;

      setResponse(answer);
      setHistory([{ task, category, response: answer }, ...history]);
    } catch {
      setResponse("Error contacting AI.");
    }

    setLoading(false);
    setTask("");
  };

  const handleClearHistory = () => setHistory([]);

  // ------------------------------
  // STRIPE UPGRADE HANDLER
  // ------------------------------
  const handleUpgrade = async (priceId: string) => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        email: session?.user?.email,
      }),
    });

    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <ModernLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center w-full"
      >
        <h1 className="text-5xl font-extrabold mb-8 text-white text-center">
          Welcome to GhostAI
        </h1>

        {/* 🔼 UPGRADE BUTTONS */}
        {isFreeUser && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={() =>
                handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE!)
              }
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Upgrade to Pro
            </button>

            <button
              onClick={() =>
                handleUpgrade(
                  process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_PRICE!
                )
              }
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Upgrade to Ultimate
            </button>
          </div>
        )}

        {/* CATEGORY SELECTOR */}
        <div className="flex gap-3 justify-center mb-4">
          {["Work", "Career", "Money"].map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded ${
                category === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-white"
              }`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 📝 INPUT (NEVER DISABLED) */}
        <input
          type="text"
          placeholder={
            isFreeUser
              ? "Upgrade to Pro to continue"
              : "Enter your AI task..."
          }
          className="border border-gray-600 p-3 mb-4 w-full rounded-lg bg-gray-800 text-white max-w-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {/* 🚀 SUBMIT BUTTON */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: isFreeUser ? 1 : 1.03 }}
          disabled={loading || isFreeUser}
          onClick={handleSubmit}
          className={`px-6 py-3 rounded-lg mb-4 w-full sm:w-auto transition
            ${
              isFreeUser
                ? "bg-gray-500 cursor-not-allowed text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
        >
          {isFreeUser ? "Upgrade Required" : loading ? "Thinking..." : "Submit"}
        </motion.button>

        {/* CLEAR HISTORY */}
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-sm text-red-400 hover:underline mb-4"
          >
            Clear History
          </button>
        )}

        {/* AI RESPONSE */}
        {response && (
          <div className="mt-4 p-4 w-full max-w-3xl bg-gray-800 rounded-lg shadow">
            <p className="text-white whitespace-pre-line">{response}</p>
          </div>
        )}
      </motion.div>
    </ModernLayout>
  );
}
