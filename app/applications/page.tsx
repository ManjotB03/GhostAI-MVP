"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

type Status = "saved" | "applied" | "interview" | "offer" | "rejected" | "no_response";

type Application = {
  id: string;
  company: string | null;
  role_title: string | null;
  job_description: string | null;
  status: Status;
  match_score: number | null;
  cv_version: string | null;
  notes: string | null;
  applied_at: string | null;
  last_prompted_at: string | null;
  created_at: string;
};

const STATUSES: { key: Status; label: string; accent: string }[] = [
  { key: "saved", label: "Saved", accent: "border-slate-600" },
  { key: "applied", label: "Applied", accent: "border-sky-500/50" },
  { key: "interview", label: "Interview", accent: "border-indigo-500/50" },
  { key: "offer", label: "Offer", accent: "border-emerald-500/50" },
  { key: "rejected", label: "Rejected", accent: "border-red-500/40" },
  { key: "no_response", label: "No response", accent: "border-slate-700" },
];

const STATUS_LABEL: Record<Status, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  no_response: "No response",
};

// How many days an application sits in "Applied" before we ask for an update.
const FOLLOW_UP_DAYS = 7;

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

export default function ApplicationsPage() {
  const { data: session, status: authStatus } = useSession();

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Load applications
  useEffect(() => {
    const load = async () => {
      if (!session?.user?.email) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/applications");
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.error || "Could not load applications.");
          return;
        }
        setApps(Array.isArray(data?.applications) ? data.applications : []);
      } catch {
        setError("Could not load applications.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session?.user?.email]);

  const grouped = useMemo(() => {
    const map: Record<Status, Application[]> = {
      saved: [],
      applied: [],
      interview: [],
      offer: [],
      rejected: [],
      no_response: [],
    };
    for (const a of apps) {
      const s = (a.status as Status) in map ? (a.status as Status) : "saved";
      map[s].push(a);
    }
    return map;
  }, [apps]);

  const addApplication = async () => {
    if (!roleTitle.trim() && !company.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim() || null,
          roleTitle: roleTitle.trim() || null,
          jobDescription: jobDescription.trim() || null,
          status: "saved",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.application) {
        setApps((prev) => [data.application, ...prev]);
        setCompany("");
        setRoleTitle("");
        setJobDescription("");
        setShowAdd(false);
      } else {
        setError(data?.error || "Could not add application.");
      }
    } catch {
      setError("Could not add application.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, newStatus: Status) => {
    // optimistic
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    try {
      await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // if it fails, reload to resync
      setError("Status update failed. Refresh to resync.");
    }
  };

  const snoozePrompt = async (id: string) => {
    const now = new Date().toISOString();
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, last_prompted_at: now } : a))
    );
    try {
      await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastPromptedAt: now }),
      });
    } catch {
      setError("Could not save. Refresh to resync.");
    }
  };

  const deleteApplication = async (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/applications/${id}`, { method: "DELETE" });
    } catch {
      setError("Delete failed. Refresh to resync.");
    }
  };

  // Not signed in
  if (authStatus !== "loading" && !session?.user?.email) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3">Sign in to track your applications</h1>
          <p className="text-slate-400 mb-6">
            Keep every job, CV version, and status in one place.
          </p>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold transition"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/ghostai-logo.png" alt="GhostAI" width={30} height={30} unoptimized />
            <span className="font-bold text-lg">GhostAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/ghost"
              className="text-sm text-slate-300 hover:text-white transition"
            >
              CV Coach
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-900 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">Application Tracker</h1>
            <p className="text-slate-400 mt-1">
              Every job you&apos;re applying to, in one place.
            </p>
          </div>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold transition self-start sm:self-auto"
          >
            {showAdd ? "Close" : "+ Add application"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Add form */}
        {showAdd && (
          <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Role title (e.g. Data Engineer)"
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
              />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
              />
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description (optional)"
              className="w-full min-h-[90px] rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500 mb-3"
            />
            <button
              onClick={addApplication}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold transition disabled:opacity-70"
            >
              {saving ? "Adding..." : "Add to tracker"}
            </button>
          </div>
        )}

        {/* Board */}
        {loading ? (
          <p className="text-slate-400">Loading your applications…</p>
        ) : apps.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center">
            <p className="text-lg font-semibold mb-2">No applications yet</p>
            <p className="text-slate-400 mb-5">
              Add your first job to start tracking your search.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold transition"
            >
              + Add your first application
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {STATUSES.map((col) => (
              <div key={col.key} className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-200">
                    {col.label}
                  </h2>
                  <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5">
                    {grouped[col.key].length}
                  </span>
                </div>

                <div className="space-y-3">
                  {grouped[col.key].length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-800 p-4 text-xs text-slate-600 text-center">
                      Empty
                    </div>
                  )}

                  {grouped[col.key].map((a) => (
                    <div
                      key={a.id}
                      className={`rounded-xl border ${col.accent} bg-slate-900/70 p-4`}
                    >
                      <p className="font-semibold text-white leading-tight">
                        {a.role_title || "Untitled role"}
                      </p>
                      {a.company && (
                        <p className="text-sm text-slate-400 mb-2">{a.company}</p>
                      )}

                      {typeof a.match_score === "number" && (
                        <p className="text-xs text-sky-300 mb-2">
                          Match {a.match_score}/100
                        </p>
                      )}

                      {/* Outcome loop: ask for an update on stale "applied" cards */}
                      {(() => {
                        if (a.status !== "applied") return null;
                        const since = daysSince(a.applied_at || a.created_at);
                        if (since === null || since < FOLLOW_UP_DAYS) return null;
                        const askedAgo = daysSince(a.last_prompted_at);
                        if (askedAgo !== null && askedAgo < FOLLOW_UP_DAYS) return null;

                        return (
                          <div className="mb-2 rounded-lg border border-sky-500/30 bg-sky-500/10 p-2.5">
                            <p className="text-[11px] text-sky-200 mb-2">
                              Applied {since} days ago — heard anything back?
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => updateStatus(a.id, "interview")}
                                className="text-[11px] px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
                              >
                                Interview
                              </button>
                              <button
                                onClick={() => updateStatus(a.id, "rejected")}
                                className="text-[11px] px-2 py-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition"
                              >
                                Rejected
                              </button>
                              <button
                                onClick={() => updateStatus(a.id, "no_response")}
                                className="text-[11px] px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-100 transition"
                              >
                                No reply
                              </button>
                              <button
                                onClick={() => snoozePrompt(a.id)}
                                className="text-[11px] px-2 py-1 rounded-md text-slate-400 hover:text-slate-200 transition"
                              >
                                Not yet
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      <select
                        value={a.status}
                        onChange={(e) =>
                          updateStatus(a.id, e.target.value as Status)
                        }
                        className="w-full text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1.5 mb-2 outline-none focus:border-sky-500"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {STATUS_LABEL[s.key]}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => deleteApplication(a.id)}
                          className="text-[11px] text-red-300 hover:text-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
