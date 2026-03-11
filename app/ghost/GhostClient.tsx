"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ModernLayout from "../components/ModernLayout";
import { motion } from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { signOut, useSession } from "next-auth/react";

type Mode = "career" | "interview_mock";

type Chat = {
  id: string;
  title: string;
  createdAt: number;
  mode: Mode;
  targetRole: string;
  customRole: string;
  task: string;
  response: string;
  fileName?: string | null;
  atsScore: number | null;
};

const STARTER_PROMPTS = [
  "Review my CV for a graduate role",
  "Help me answer: “Tell me about yourself”",
  "How can I switch into tech?",
  "Write me a salary negotiation script for London",
  "What should I do in the next 30 days to get interviews?",
];

function cleanText(input: string) {
  return input
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function makeTitle(task: string, fileName?: string | null) {
  const t = (task || "").trim();
  if (t) return t.length > 48 ? t.slice(0, 48) + "…" : t;
  if (fileName) return `(file) ${fileName}`;
  return "New chat";
}

async function extractFileTextViaServer(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/filetext", { method: "POST", body: form });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || data?.details || "File extraction failed");
  }

  const text = String(data?.text || "").trim();
  return cleanText(text);
}

function clampScore(n: number) {
  if (Number.isNaN(n)) return null;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function extractAtsScore(raw: string): { score: number | null; cleaned: string } {
  const match = raw.match(/ATS_SCORE:\s*(\d{1,3})\b/i);
  const score = match ? clampScore(parseInt(match[1], 10)) : null;

  const cleaned = raw.replace(/\n?\s*ATS_SCORE:\s*\d{1,3}\s*$/i, "").trim();

  return { score, cleaned };
}

function dbToChat(row: any): Chat {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    mode: (row.mode as Mode) || "career",
    targetRole: row.target_role || "Data Engineer",
    customRole: row.custom_role || "",
    task: row.task || "",
    response: row.response || "",
    fileName: row.file_name || null,
    atsScore: row.ats_score ?? null,
  };
}

export default function GhostClient() {
  const { data: session } = useSession();

  const [mode, setMode] = useState<Mode>("career");
  const [targetRole, setTargetRole] = useState("Data Engineer");
  const [customRole, setCustomRole] = useState("");
  const effectiveTargetRole = (customRole.trim() || targetRole).trim();

  const [task, setTask] = useState("");
  const [response, setResponse] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [extracting, setExtracting] = useState(false);
  const [docText, setDocText] = useState("");
  const [docPreview, setDocPreview] = useState("");
  const [docStats, setDocStats] = useState<{ chars: number; words: number } | null>(null);
  const [fileWarning, setFileWarning] = useState("");

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const placeholder = useMemo(() => {
    return mode === "interview_mock"
      ? "Paste interview question + your answer…"
      : "Ask about CVs, interviews, career moves, or salary growth…";
  }, [mode]);

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.email) return;

      setHistoryLoading(true);
      try {
        const res = await fetch("/api/chats", { method: "GET" });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error("LOAD CHATS FAILED:", data);
          return;
        }

        const rows = Array.isArray(data?.chats) ? data.chats : [];
        setChats(rows.map(dbToChat));
      } finally {
        setHistoryLoading(false);
      }
    };

    load();
  }, [session?.user?.email]);

  const resetComposer = () => {
    setActiveChatId(null);
    setTask("");
    setResponse("");
    setAtsScore(null);
    setFile(null);
    setDocText("");
    setDocPreview("");
    setDocStats(null);
    setFileWarning("");
    setMobileHistoryOpen(false);
  };

  const loadChat = (chat: Chat) => {
    setActiveChatId(chat.id);
    setMode(chat.mode);
    setTargetRole(chat.targetRole);
    setCustomRole(chat.customRole);
    setTask(chat.task);
    setResponse(chat.response);
    setAtsScore(chat.atsScore);

    setFile(null);
    setDocText("");
    setDocPreview("");
    setDocStats(null);
    setFileWarning(
      chat.fileName
        ? `Previously used file: ${chat.fileName}. Re-attach it if you want to run again.`
        : ""
    );
  };

  const deleteChat = async (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) resetComposer();

    try {
      await fetch(`/api/chats/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error("DELETE CHAT FAILED:", e);
    }
  };

  const handleFileSelected = async (f: File | null) => {
    setFile(f);
    setDocText("");
    setDocPreview("");
    setDocStats(null);
    setFileWarning("");
    setAtsScore(null);

    if (!f) return;

    try {
      setExtracting(true);

      const extracted = await extractFileTextViaServer(f);
      const chars = extracted.length;
      const words = extracted ? extracted.split(/\s+/).filter(Boolean).length : 0;

      setDocText(extracted);
      setDocPreview(extracted.slice(0, 500));
      setDocStats({ chars, words });

      if (f.name.toLowerCase().endsWith(".pdf") && chars < 250) {
        setFileWarning(
          "This PDF might be scanned (very little selectable text). If results look wrong, export a text-based PDF or paste the text."
        );
      }
    } catch (err: any) {
      setFileWarning(err?.message || "Could not extract text from that file.");
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!task.trim() && !file) return;

    setLoading(true);
    setResponse("");
    setAtsScore(null);

    try {
      if (file && !docText && !extracting) {
        await handleFileSelected(file);
      }

      const taskToSend =
        task.trim() ||
        (file ? "Please review this document as my career coach and improve it." : "");

      const res = await fetch("/api/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: taskToSend,
          mode,
          targetRole: effectiveTargetRole,
          docText: docText ? docText.slice(0, 12000) : "",
        }),
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(`Server returned non-JSON (${res.status}): ${raw.slice(0, 250)}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
      }

      const resultText = String(data?.result || "").trim();
      const { score, cleaned } = extractAtsScore(resultText);

      setAtsScore(score);
      setResponse(cleaned || "No response returned.");

      const title = makeTitle(taskToSend, file?.name);

      if (activeChatId) {
        const up = await fetch(`/api/chats/${activeChatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            mode,
            targetRole,
            customRole,
            task: taskToSend,
            response: cleaned,
            atsScore: score,
            fileName: file?.name || null,
          }),
        });

        const upData = await up.json().catch(() => null);
        if (up.ok && upData?.chat) {
          const updated = dbToChat(upData.chat);
          setChats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        }
      } else {
        const cr = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            mode,
            targetRole,
            customRole,
            task: taskToSend,
            response: cleaned,
            atsScore: score,
            fileName: file?.name || null,
          }),
        });

        const crData = await cr.json().catch(() => null);
        if (cr.ok && crData?.chat) {
          const created = dbToChat(crData.chat);
          setChats((prev) => [created, ...prev]);
          setActiveChatId(created.id);
        }
      }

      setTask("");
      await handleFileSelected(null);
    } catch (err: any) {
      setResponse(err?.message || "Unknown error");
      console.error("GHOST SUBMIT ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModernLayout>
      <div className="w-full flex min-h-[calc(100vh-0px)]">
        {/* Desktop / tablet sidebar */}
        <div className="w-72 bg-gray-950 border-r border-gray-800 p-4 hidden md:flex flex-col">
          <button
            onClick={resetComposer}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg mb-4 transition"
          >
            + New chat
          </button>

          <div className="text-xs text-gray-400 mb-2">
            History {historyLoading ? "• loading…" : ""}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full mb-3 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg p-2"
          />

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredChats.length === 0 && !historyLoading && (
              <div className="text-sm text-gray-500">
                No chats yet. Run your first CV analysis.
              </div>
            )}

            {filteredChats.map((chat) => {
              const active = chat.id === activeChatId;
              return (
                <div
                  key={chat.id}
                  className={`group rounded-lg border transition ${
                    active
                      ? "bg-gray-800 border-gray-600"
                      : "bg-gray-900 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <button className="w-full text-left p-3" onClick={() => loadChat(chat)}>
                    <div className="text-sm text-white font-medium">{chat.title}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(chat.createdAt).toLocaleString()}
                    </div>
                  </button>

                  <div className="px-3 pb-3 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      {chat.atsScore !== null ? `ATS ${chat.atsScore}/100` : "—"}
                    </div>
                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="text-xs text-red-300 hover:text-red-200 opacity-0 group-hover:opacity-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-800 mt-4">
            {session?.user?.email && (
              <div className="text-xs text-gray-400 mb-2 truncate">{session.user.email}</div>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center w-full max-w-5xl py-6"
          >
            {/* Mobile top bar */}
            <div className="w-full flex items-center justify-between mb-4 md:hidden">
              <button
                type="button"
                onClick={() => setMobileHistoryOpen((prev) => !prev)}
                className="bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
              >
                {mobileHistoryOpen ? "Hide History" : "Show History"}
              </button>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
              >
                Log out
              </button>
            </div>

            {/* Mobile history panel */}
            {mobileHistoryOpen && (
              <div className="w-full mb-6 md:hidden rounded-xl border border-gray-800 bg-gray-950 p-4">
                <button
                  onClick={resetComposer}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg mb-4 transition"
                >
                  + New chat
                </button>

                <div className="text-xs text-gray-400 mb-2">
                  History {historyLoading ? "• loading…" : ""}
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full mb-3 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg p-2"
                />

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {filteredChats.length === 0 && !historyLoading && (
                    <div className="text-sm text-gray-500">
                      No chats yet. Run your first CV analysis.
                    </div>
                  )}

                  {filteredChats.map((chat) => {
                    const active = chat.id === activeChatId;
                    return (
                      <div
                        key={chat.id}
                        className={`rounded-lg border transition ${
                          active
                            ? "bg-gray-800 border-gray-600"
                            : "bg-gray-900 border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <button
                          className="w-full text-left p-3"
                          onClick={() => {
                            loadChat(chat);
                            setMobileHistoryOpen(false);
                          }}
                        >
                          <div className="text-sm text-white font-medium">{chat.title}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(chat.createdAt).toLocaleString()}
                          </div>
                        </button>

                        <div className="px-3 pb-3 flex items-center justify-between">
                          <div className="text-xs text-gray-400">
                            {chat.atsScore !== null ? `ATS ${chat.atsScore}/100` : "—"}
                          </div>
                          <button
                            onClick={() => deleteChat(chat.id)}
                            className="text-xs text-red-300 hover:text-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <h1 className="text-5xl font-extrabold mb-4 text-white text-center">
              GhostAI Career Coach
            </h1>

            <p className="text-gray-300 mb-6 text-center max-w-2xl">
              Career advice that feels like a real coach — CVs, interviews, and salary growth.
            </p>

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

            <div className="flex flex-wrap gap-3 justify-center mb-6 max-w-3xl">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setTask(p)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="w-full max-w-xl mb-4">
              <label className="text-sm text-gray-300 block mb-1">Target Role</label>

              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg p-2"
              >
                <option>Data Engineer</option>
                <option>Data Analyst</option>
                <option>Machine Learning Engineer</option>
                <option>Software Engineer</option>
                <option>AI Engineer</option>
                <option>Cloud Engineer</option>
                <option>DevOps Engineer</option>
              </select>

              <div className="mt-3">
                <label className="text-xs text-gray-400 block mb-1">
                  Or type any custom role (optional)
                </label>
                <input
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g., Analytics Engineer, Quant Developer, Cyber Security Analyst…"
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Using: <span className="text-gray-200">{effectiveTargetRole}</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-xl mb-4">
              <div className="flex items-center gap-3 mb-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-800 transition"
                >
                  {extracting ? "Extracting..." : "Attach file"}
                </button>

                {file ? (
                  <div className="text-sm text-gray-300 truncate">
                    Attached: <span className="font-semibold">{file.name}</span>{" "}
                    <button
                      className="ml-2 text-red-300 hover:text-red-200 underline"
                      onClick={() => handleFileSelected(null)}
                    >
                      remove
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">PDF/text supported</div>
                )}
              </div>

              {fileWarning && (
                <div className="text-sm bg-yellow-900/40 border border-yellow-700 text-yellow-200 p-3 rounded-lg">
                  {fileWarning}
                </div>
              )}

              {docStats && (
                <div className="mt-2 text-xs text-gray-400">
                  Extracted: {docStats.words.toLocaleString()} words •{" "}
                  {docStats.chars.toLocaleString()} chars{" "}
                  {docStats.chars > 12000 ? "• sending first 12,000 chars" : ""}
                </div>
              )}

              {docPreview && (
                <div className="mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2">Extract preview</div>
                  <div className="text-sm text-gray-200 whitespace-pre-wrap">
                    {docPreview}
                    {docStats && docStats.chars > 500 ? "…" : ""}
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder={placeholder}
              className="border border-gray-600 p-3 mb-4 w-full max-w-xl rounded-lg bg-gray-800 text-white"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleSubmit}
              disabled={loading || extracting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg mb-4 disabled:opacity-70"
            >
              {loading ? (file ? "Analyzing CV..." : "Thinking...") : file ? "Analyze CV" : "Submit"}
            </motion.button>

            {response && (
              <div className="mt-6 p-5 w-full max-w-3xl bg-gray-800 rounded-2xl border border-gray-700">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-sm text-gray-300">Output (Markdown)</div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(response);
                      } catch {}
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition"
                  >
                    Copy
                  </button>
                </div>

                {atsScore !== null && (
                  <div className="mb-4 bg-gray-900 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-200 font-semibold">ATS Score</div>
                      <div className="text-sm text-indigo-300 font-bold">{atsScore}/100</div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div className="h-2 bg-indigo-500" style={{ width: `${atsScore}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Based on ATS-friendliness + keyword match for:{" "}
                      <span className="text-gray-200">{effectiveTargetRole}</span>
                    </div>
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]}>{response}</Markdown>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ModernLayout>
  );
}