"use client";

import React, { useState } from "react";
import ModernLayout from "../components/ModernLayout";
import { motion } from "framer-motion";

interface HistoryItem {
  task: string;
  category: string;
  response: string;
}

export default function GhostClient() {
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("Work");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [limitReached, setLimitReached] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);

  // ------------------------------
  // SUBMIT TO AI (SERVER CONTROLS LIMITS)
  // ------------------------------
  const handleSubmit = async () => {
    if (!task.trim()) return;

    setLoading(true);
    setResponse("");
    setLimitReached(false);

    try {
      const res = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, category }),
      });

      const data = await res.json();

      // 🔒 Free daily limit reached
      if (res.status === 403 && data.limitReached) {
        setLimitReached(true);
        setUsageCount(15);
        return;
      }

      if (!res.ok) {
        setResponse(data.error || "Something went wrong");
        return;
      }

      // ✅ Success
      setResponse(data.result);
      setHistory([{ task, category, response: data.result }, ...history]);
      setUsageCount((prev) => (prev === null ? 1 : prev + 1));
      setTask("");
    } catch {
      setResponse("Error contacting AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = "/pricing";
  };

  return (
    <ModernLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center w-full"
      >
        <h1 className="text-5xl font-extrabold mb-8 text-white text-center">
          Welcome to GhostAI
        </h1>

        {/* CATEGORY */}
        <div className="flex gap-3 mb-4">
          {["Work", "Career", "Money"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded ${
                category === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <input
          type="text"
          placeholder="Enter your AI task..."
          className="border border-gray-600 p-3 mb-4 w-full max-w-xl rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={limitReached}
        />

        {/* SUBMIT */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleSubmit}
          disabled={loading || limitReached}
          className={`px-6 py-3 rounded-lg mb-2 transition ${
            loading || limitReached
              ? "bg-gray-500 cursor-not-allowed text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {loading ? "Thinking..." : "Submit"}
        </motion.button>

        {/* USAGE COUNTER */}
        {usageCount !== null && !limitReached && (
          <p className="text-sm text-gray-400 mb-3">
            Free usage: {usageCount} / 15
          </p>
        )}

        {/* LIMIT MESSAGE */}
        {limitReached && (
          <div className="bg-red-900 text-white p-4 rounded-lg text-center max-w-xl mt-4">
            <p className="mb-2">
              You’ve reached your free daily limit (15 prompts).
            </p>
            <button
              onClick={handleUpgrade}
              className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* RESPONSE */}
        {response && (
          <div className="mt-6 p-4 w-full max-w-3xl bg-gray-800 rounded-lg shadow">
            <p className="text-white whitespace-pre-line">{response}</p>
          </div>
        )}
      </motion.div>
    </ModernLayout>
  );
}
