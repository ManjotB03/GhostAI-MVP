"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const FREE_DAILY_LIMIT = 5;
const OWNER_EMAIL = "ghostaicorp@gmail.com";

export default function GhostClient() {
  const { data: session } = useSession();

  const [task, setTask] = useState("");
  const [category, setCategory] = useState("Work");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const isOwner = session?.user?.email === OWNER_EMAIL;
  const role = "free"; // default until Stripe upgrades

  const isFreeUser = !isOwner && role === "free";

  // 🚨 IMPORTANT CHANGE:
  // INPUT IS NEVER DISABLED
  // ONLY SUBMIT IS BLOCKED
  const canSubmit = !isFreeUser || !limitReached;

  const handleSubmit = async () => {
    if (!task.trim() || loading) return;

    if (!canSubmit) {
      setResponse(
        "You’ve reached your free daily limit. Upgrade to continue using GhostAI."
      );
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

      if (res.status === 403 && data.limitReached) {
        setLimitReached(true);
        setResponse(
          "You’ve reached your free daily limit. Upgrade to continue using GhostAI."
        );
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setResponse(data.error || "Something went wrong.");
      } else {
        setResponse(data.result);
        setUsageCount((prev) => prev + 1);
      }
    } catch {
      setResponse("Error contacting AI.");
    }

    setTask("");
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center w-full max-w-3xl mx-auto"
    >
      <h1 className="text-5xl font-extrabold mb-8 text-white text-center">
        Welcome to GhostAI
      </h1>

      {/* Upgrade buttons */}
      <div className="flex gap-4 mb-6">
        <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
          Upgrade to Pro
        </button>
        <button className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700">
          Upgrade to Ultimate
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 mb-4">
        {["Work", "Career", "Money"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded ${
              category === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* INPUT — ALWAYS ENABLED */}
      <input
        type="text"
        placeholder="Enter your AI task..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="w-full p-4 rounded-lg mb-4 text-white bg-gray-800 focus:ring-2 focus:ring-indigo-500"
      />

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className={`px-6 py-3 rounded-lg text-white ${
          !canSubmit
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "Thinking..." : canSubmit ? "Submit" : "Upgrade Required"}
      </button>

      {/* Usage */}
      {isFreeUser && !limitReached && (
        <p className="text-sm text-gray-400 mt-3">
          Free usage: {usageCount}/{FREE_DAILY_LIMIT}
        </p>
      )}

      {/* Response */}
      {response && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg w-full text-white">
          {response}
        </div>
      )}
    </motion.div>
  );
}
