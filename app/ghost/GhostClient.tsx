"use client";

import React, { useState } from "react";
import ModernLayout from "../components/ModernLayout";
import { motion } from "framer-motion";

interface HistoryItem {
  task: string;
  response: string;
}

const STARTER_PROMPTS = [
  "Review my CV for a graduate role",
  "Prepare me for an interview",
  "What salary should I ask for?",
  "How can I switch careers into tech?",
  "How do I get promoted faster?",
];

export default function GhostClient() {
  const [task, setTask] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [limitReached, setLimitReached] = useState(false);

  const handleSubmit = async () => {
    if (!task.trim()) return;

    setLoading(true);
    setResponse("");
    setLimitReached(false);

    try {
      const res = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, category: "Career" }),
      });

      const data = await res.json();

      if (res.status === 403 && data.limitReached) {
        setLimitReached(true);
        return;
      }

      if (!res.ok) {
        setResponse(data.error || "Something went wrong");
        return;
      }

      setResponse(data.result);
      setHistory([{ task, response: data.result }, ...history]);
      setTask("");
    } catch {
      setResponse("Error contacting AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModernLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center w-full"
      >
        <h1 className="text-5xl font-extrabold mb-6 text-white text-center">
          GhostAI Career Coach
        </h1>

        <p className="text-gray-300 mb-8 text-center max-w-2xl">
          Get clear, actionable career advice for CVs, interviews, salary growth,
          and promotions.
        </p>

        {/* STARTER PROMPTS */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setTask(prompt)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <input
          type="text"
          placeholder="Ask your career question..."
          className="border border-gray-600 p-3 mb-4 w-full max-w-xl rounded-lg bg-gray-800 text-white"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {/* SUBMIT */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg mb-4"
        >
          {loading ? "Thinking..." : "Get Advice"}
        </motion.button>

        {/* LIMIT MESSAGE */}
        {limitReached && (
          <div className="bg-red-900 text-white p-4 rounded-lg text-center max-w-xl">
            <p className="mb-2">
              You’ve reached your free daily limit.
            </p>
            <a
              href="/pricing"
              className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 inline-block"
            >
              Upgrade to Pro
            </a>
          </div>
        )}

        {/* RESPONSE */}
        {response && (
          <div className="mt-6 p-4 w-full max-w-3xl bg-gray-800 rounded-lg">
            <p className="text-white whitespace-pre-line">{response}</p>
          </div>
        )}
      </motion.div>
    </ModernLayout>
  );
}
