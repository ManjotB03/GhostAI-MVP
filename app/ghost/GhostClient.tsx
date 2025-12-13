"use client";

import React, { useState } from "react";
import ModernLayout from "../components/ModernLayout";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/access";

interface HistoryItem {
  task: string;
  category: string;
  response: string;
}

export default function GhostClient() {
  const { data: session } = useSession();

  // ⬇️ TEMP: until we fetch from DB (next step)
  const userTier =
    (session?.user as any)?.role === "owner"
      ? "owner"
      : (session?.user as any)?.subscription_tier || "free";

  const [task, setTask] = useState("");
  const [category, setCategory] = useState("Work");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // ------------------------------
  // AI SUBMIT HANDLER (PAYWALL HERE)
  // ------------------------------
  const handleSubmit = async () => {
    if (!task.trim()) return;

    // 🔒 PAYWALL
    if (!hasAccess(userTier, "pro")) {
      alert("Upgrade to Pro to continue using GhostAI.");
      return;
    }

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
  const handleUpgrade = async (plan: "pro" | "ultimate") => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        email: session?.user?.email,
      }),
    });

    const data = await res.json();
    if (data?.url) window.location.href = data.url;
  };

  return (
    <ModernLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center w-full"
      >
        <h1 className="text-5xl font-extrabold mb-8 text-gray-900 dark:text-white text-center">
          Welcome to GhostAI
        </h1>

        {/* UPGRADE CTA (FREE USERS ONLY) */}
        {!hasAccess(userTier, "pro") && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handleUpgrade("pro")}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Upgrade to Pro
            </button>

            <button
              onClick={() => handleUpgrade("ultimate")}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Upgrade to Ultimate
            </button>
          </div>
        )}

        {/* Category Selector */}
        <div className="flex gap-3 justify-center mb-4">
          {["Work", "Career", "Money"].map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded ${
                category === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-white"
              }`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Task input */}
        <input
          type="text"
          placeholder="Enter your AI task..."
          className="border border-gray-300 dark:border-gray-700 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white max-w-xl"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {/* Submit button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition mb-4 w-full sm:w-auto"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Submit"}
        </motion.button>

        {/* Clear history */}
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-sm text-red-500 hover:underline mb-4"
          >
            Clear History
          </button>
        )}

        {/* AI response */}
        {response && (
          <motion.div className="mt-4 p-4 w-full max-w-3xl bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
            <p className="text-gray-900 dark:text-white whitespace-pre-line">
              {response}
            </p>
          </motion.div>
        )}
      </motion.div>
    </ModernLayout>
  );
}
