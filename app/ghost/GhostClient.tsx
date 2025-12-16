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

  const [task, setTask] = useState("");
  const [category, setCategory] = useState("Work");
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
        body: JSON.stringify({ task, category }),
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
      setHistory([{ task, category, response: data.result }, ...history]);
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
        className="flex flex-col items-center justify-center w-full"
      >
        <h1 className="text-5xl font-extrabold mb-8 text-white text-center">
          Welcome to GhostAI
        </h1>

        {/* CATEGORY */}
        <div className="flex gap-3 mb-4">
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

        {/* INPUT */}
        <input
          type="text"
          placeholder="Enter your AI task..."
          className="border border-gray-600 p-3 mb-4 w-full rounded-lg bg-gray-800 text-white max-w-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          {loading ? "Thinking..." : "Submit"}
        </motion.button>

        {/* PAYWALL MESSAGE */}
        {limitReached && (
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-white mb-2">
              You’ve reached your free daily limit.
            </p>
            <a
              href="/pricing"
              className="text-indigo-400 hover:underline"
            >
              Upgrade to Pro →
            </a>
          </div>
        )}

        {/* RESPONSE */}
        {response && (
          <div className="mt-4 p-4 w-full max-w-3xl bg-gray-800 rounded-lg shadow">
            <p className="text-white whitespace-pre-line">{response}</p>
          </div>
        )}
      </motion.div>
    </ModernLayout>
  );
}
