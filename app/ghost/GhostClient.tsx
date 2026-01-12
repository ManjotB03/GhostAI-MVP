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
  const [limitInfo, setLimitInfo] = useState<{ used?: number; limit?: number; tier?: string }>({});

  const handleSubmit = async () => {
    if (!task.trim()) return;

    setLoading(true);
    setResponse("");
    setLimitReached(false);
    setLimitInfo({});

    try {
      const res = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, category }),
      });

      const data = await res.json();

      if (res.status === 403 && data?.limitReached) {
        setLimitReached(true);
        setLimitInfo({ used: data.used, limit: data.limit, tier: data.tier });
        return;
      }

      if (!res.ok) {
        setResponse(data?.error || "Something went wrong");
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
                category === cat ? "bg-indigo-600 text-white" : "bg-gray-700 text-white"
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
          {loading ? "Thinking..." : "Submit"}
        </motion.button>

        {/* LIMIT MESSAGE */}
        {limitReached && (
          <div className="bg-red-900 text-white p-4 rounded-lg text-center max-w-xl">
            <p className="mb-2">
              You’ve reached your daily limit{limitInfo?.limit ? ` (${limitInfo.limit})` : ""}.
            </p>
            <button
              onClick={() => (window.location.href = "/pricing")}
              className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
            >
              Upgrade
            </button>
          </div>
        )}

        {/* RESPONSE */}
        {response && (
          <div className="mt-4 p-4 w-full max-w-3xl bg-gray-800 rounded-lg">
            <p className="text-white whitespace-pre-line">{response}</p>
          </div>
        )}

        {/* HISTORY */}
        {history.length > 0 && (
          <div className="mt-6 w-full max-w-3xl flex flex-col gap-3">
            {history.map((h, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-900/60 border border-gray-700">
                <p className="text-sm text-gray-400">{h.category} • You asked:</p>
                <p className="text-white">{h.task}</p>
                <p className="text-gray-200 mt-2">{h.response}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </ModernLayout>
  );
}
