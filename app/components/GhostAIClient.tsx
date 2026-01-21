"use client";

import React, { useState } from "react";
import ModernLayout from "../components/ModernLayout";
import { motion } from "framer-motion";

interface HistoryItem {
  task: string;
  response: string;
}

export default function GhostClient() {
  const [task, setTask] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ used: number; limit: number } | null>(null);

  const handleSubmit = async () => {
    if (!task.trim()) return;

    setLoading(true);
    setResponse("");
    setLimitReached(false);

    try {
      const res = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          category: "Career", // 🔒 fixed, no UI choice
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.limitReached) {
        setLimitReached(true);
        setLimitInfo({ used: data.used ?? 0, limit: data.limit ?? 0 });
        return;
      }

      if (!res.ok) {
        setResponse(data.error || "Something went wrong");
        return;
      }

      setResponse(data.result);
      setHistory([{ task, response: data.result }, ...history]);
      setTask("");

      if (typeof data.used === "number" && typeof data.limit === "number") {
        setLimitInfo({ used: data.used, limit: data.limit });
      }
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
        <h1 className="text-5xl font-extrabold mb-4 text-white text-center">
          GhostAI Career Coach
        </h1>

        <p className="text-slate-300 mb-6 text-center max-w-xl">
          CVs, interviews, career decisions, salary growth — clear answers, real steps.
        </p>

        {limitInfo && !limitReached && (
          <p className="text-sm text-slate-400 mb-4">
            Today: <strong>{limitInfo.used}</strong> / <strong>{limitInfo.limit}</strong> prompts
          </p>
        )}

        <input
          type="text"
          placeholder="Ask a career question (CV, job switch, interview, salary...)"
          className="border border-gray-600 p-3 mb-4 w-full max-w-xl rounded-lg bg-gray-800 text-white"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg mb-4"
        >
          {loading ? "Thinking..." : "Ask GhostAI"}
        </motion.button>

        {limitReached && (
          <div className="bg-red-900 text-white p-4 rounded-lg text-center max-w-xl">
            <p className="mb-2">
              You’ve reached your daily free limit.
            </p>
            <button
              onClick={handleUpgrade}
              className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {response && (
          <div className="mt-4 p-4 w-full max-w-3xl bg-gray-800 rounded-lg">
            <p className="text-white whitespace-pre-line">{response}</p>
          </div>
        )}
      </motion.div>
    </ModernLayout>
  );
}
