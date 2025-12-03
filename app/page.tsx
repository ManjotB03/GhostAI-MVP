"use client";

import React, { useState } from "react";
import ModernLayout from "./components/ModernLayout";
import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";

interface HistoryItem {
  task: string;
  category: string;
  response: string;
}

export default function Home() {
  // ❗ ALL HOOKS MUST RUN BEFORE ANY CONDITIONAL RETURNS
  const { data: session } = useSession();

  const [task, setTask] = useState("");
  const [category, setCategory] = useState("Work");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // If user is NOT logged in → show login screen
  if (!session) {
    return (
      <ModernLayout>
        <div className="text-center mt-20">
          <h2 className="text-3xl mb-6 text-gray-900 dark:text-white">
            You must be signed in to use GhostAI
          </h2>

          <button
            onClick={() => signIn()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </div>
      </ModernLayout>
    );
  }

  const handleSubmit = async () => {
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
    } catch (err) {
      setResponse("Error contacting AI.");
    }

    setLoading(false);
    setTask("");
  };

  const handleClearHistory = () => setHistory([]);

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

        {/* AI Task Input */}
        <input
          type="text"
          placeholder="Enter your AI task..."
          className="border border-gray-300 dark:border-gray-700 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition mb-4 w-full sm:w-auto"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              Thinking...
            </motion.span>
          ) : (
            "Submit"
          )}
        </motion.button>

        {/* Clear History Button */}
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-sm text-red-500 hover:underline mb-4"
          >
            Clear History
          </button>
        )}

        {/* AI Response */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 w-full bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm"
          >
            <p className="text-gray-900 dark:text-white">{response}</p>
          </motion.div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 w-full max-w-3xl flex flex-col gap-4">
            {history.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-sm"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {item.category} • You asked:
                </p>
                <p className="text-gray-900 dark:text-white mb-2">{item.task}</p>
                <p className="text-gray-800 dark:text-gray-200">
                  {item.response}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </ModernLayout>
  );} 