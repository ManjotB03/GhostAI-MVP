"use client";

import React, { useMemo, useState } from "react";
import ModernLayout from "../components/ModernLayout";
import { motion } from "framer-motion";

interface HistoryItem {
  task: string;
  response: string;
  mode: Mode;
}

type Mode = "career" | "interview_mock";

const STARTER_PROMPTS = [
  "Review my CV for a graduate role",
  "Help me answer: “Tell me about yourself”",
  "How can I switch into tech?",
  "Write me a salary negotiation script for London",
  "What should I do in the next 30 days to get interviews?",
];

// ✅ simple client-side logging helper
function track(event: string, payload?: Record<string, any>) {
  // Only log in dev OR keep it for production too (your choice)
  // If you want logs only locally, uncomment this:
  // if (process.env.NODE_ENV === "production") return;

  console.log(`[TRACK] ${event}`, payload || {});
}

export default function GhostClient() {
  const [mode, setMode] = useState<Mode>("career");

  const [task, setTask] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [limitReached, setLimitReached] = useState(false);

  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string>("");

  const placeholder = useMemo(() => {
    if (mode === "interview_mock") {
      return "Paste the interview question + your answer (or ask for a mock question)…";
    }
    return "Ask about CVs, interviews, career moves, or salary growth…";
  }, [mode]);

  const handleUpgradeClick = () => {
    track("upgrade_clicked", { from: "ghost", mode });
    window.location.href = "/pricing";
  };

  const handleSubmit = async () => {
    if (!task.trim()) return;

    // tracking: user tried to submit
    track("submit_clicked", { mode, taskPreview: task.slice(0, 60) });

    setLoading(true);
    setResponse("");
    setLimitReached(false);
    setUpgradeRequired(false);
    setUpgradeMsg("");

    try {
      const res = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          category: "Career",
          mode, // ✅ used by API for Pro-gate on interview_mock
        }),
      });

      const data = await res.json().catch(() => ({}));

      // ✅ Free daily limit hit
      if (res.status === 403 && data.limitReached) {
        track("limit_hit", {
          mode,
          tier: data.tier,
          used: data.used,
          limit: data.limit,
        });

        setLimitReached(true);
        return;
      }

      // ✅ Pro feature blocked (interview_mock)
      if ((res.status === 402 || res.status === 403) && data.upgradeRequired) {
        track("pro_gate_hit", {
          mode,
          message: data.message,
        });

        setUpgradeRequired(true);
        setUpgradeMsg(
          data.message || "Upgrade to Pro to use Interview Mock Mode."
        );
        return;
      }

      if (!res.ok) {
        track("api_error", {
          mode,
          status: res.status,
          error: data?.error,
        });

        setResponse(data?.error || "Something went wrong");
        return;
      }

      // ✅ success
      track("ai_success", {
        mode,
        tier: data?.tier,
        used: data?.used,
        limit: data?.limit,
      });

      setResponse(data.result);
      setHistory([{ task, response: data.result, mode }, ...history]);
      setTask("");
    } catch (err: any) {
      track("network_error", {
        mode,
        message: err?.message || String(err),
      });

      setResponse("Error contacting AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModernLayout>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center w-full"
      >
        <h1 className="text-5xl font-extrabold mb-4 text-white text-center">
          GhostAI Career Coach
        </h1>

        <p className="text-gray-300 mb-6 text-center max-w-2xl">
          Career advice that feels like a real coach — CVs, interviews, and
          salary growth.
        </p>

        {/* ✅ MODE SELECTOR */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-xl">
          <button
            onClick={() => setMode("career")}
            className={`px-4 py-2 rounded-lg border transition w-full ${
              mode === "career"
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
            }`}
          >
            Career Advice
          </button>

          <button
            onClick={() => setMode("interview_mock")}
            className={`px-4 py-2 rounded-lg border transition w-full ${
              mode === "interview_mock"
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
            }`}
          >
            Interview Mock (Pro)
          </button>
        </div>

        {/* STARTER PROMPTS */}
        <div className="flex flex-wrap gap-3 justify-center mb-6 max-w-3xl">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                track("starter_prompt_clicked", { mode, prompt });
                setTask(prompt);
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <input
          type="text"
          placeholder={placeholder}
          className="border border-gray-600 p-3 mb-4 w-full max-w-xl rounded-lg bg-gray-800 text-white"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {/* SUBMIT */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg mb-4"
        >
          {loading
            ? "Thinking..."
            : mode === "interview_mock"
            ? "Get Feedback"
            : "Get Advice"}
        </motion.button>

        {/* LIMIT MESSAGE */}
        {limitReached && (
          <div className="bg-red-900 text-white p-4 rounded-lg text-center max-w-xl w-full">
            <p className="mb-2">You’ve reached your free daily limit.</p>
            <button
              onClick={handleUpgradeClick}
              className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 inline-block"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* UPGRADE REQUIRED (PRO FEATURE) */}
        {upgradeRequired && (
          <div className="bg-purple-900 text-white p-4 rounded-lg text-center max-w-xl w-full">
            <p className="mb-2 font-semibold">Pro feature</p>
            <p className="mb-3">{upgradeMsg}</p>
            <button
              onClick={handleUpgradeClick}
              className="bg-white text-purple-900 px-4 py-2 rounded hover:bg-gray-200 inline-block font-semibold"
            >
              See Pro Plan
            </button>
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
