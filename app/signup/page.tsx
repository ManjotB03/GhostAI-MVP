"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("Account created! Please check your email to verify.");
    
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-center mb-4">
          <span className="text-sky-400">Sign Up</span>{" "}
          <span className="text-white">for GhostAI</span>
        </h1>

        {errorMsg && (
          <div className="mb-4 text-red-300 bg-red-500/10 border border-red-500 rounded-lg p-3 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 text-green-300 bg-green-500/10 border border-green-500 rounded-lg p-3 text-sm text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="text-sm text-slate-200">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-200">Password</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-slate-400 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}