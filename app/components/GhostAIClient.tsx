"use client";
import React, { useState } from "react";

type Mode = "work" | "career" | "money";

export default function GhostAIClient() {
  const [task, setTask] = useState("");
  const [response, setResponse] = useState("");
  const [mode, setMode] = useState<Mode>("work");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!task) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, mode }),
      });

      const data = await res.json();
      setResponse(data.result || "No response from AI.");
    } catch (err) {
      console.error(err);
      setResponse("Error contacting AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white dark:bg-black w-full max-w-3xl rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">
          Welcome to GhostAI
        </h1>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-4">
          {(["work", "career", "money"] as Mode[]).map((m) => (
            <button
              key={m}
              className={`px-4 py-2 rounded ${
                mode === m ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              }`}
              onClick={() => setMode(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Task Input */}
        <input
          type="text"
          placeholder="Enter your AI task..."
          className="border border-gray-400 p-3 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />

        {/* Submit Button */}
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition mb-4"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </button>

        {/* AI Response */}
        {response && (
          <div className="mt-4 p-4 w-full bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-black dark:text-white">{response}</p>
          </div>
        )}

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          Powered by GhostAI • Built with Next.js & Tailwind CSS
        </p>
      </main>
    </div>
  );
}
