"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // CREATE USER IN SUPABASE (our user DB)
  const createUserRecord = async (email: string, password_hash: string) => {
    const { error } = await supabase.from("app_users").insert([
      {
        email,
        password_hash,
      },
    ]);

    if (error) {
      console.error(error);
      throw new Error("Failed to create user");
    }
  };

  // SIGNUP FORM HANDLER
  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // HASH PASSWORD
      const hashed = await fetch("/api/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }).then((res) => res.json());

      // SAVE USER TO SUPABASE TABLE
      await createUserRecord(email, hashed.hash);

      // Auto-login after signup
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/ghost",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-center mb-6">
          <span className="text-sky-400">Create</span>{" "}
          <span className="text-white">your GhostAI account</span>
        </h1>

        {errorMsg && (
          <div className="mb-4 text-red-300 bg-red-500/10 border border-red-500 rounded-lg p-3 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* GOOGLE SIGNUP */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/ghost" })}
          className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition flex items-center justify-center gap-2"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google Logo"
          />
          Sign up with Google
        </button>

        {/* APPLE SIGNUP (activate later) */}
        <button
          onClick={() => signIn("apple", { callbackUrl: "/ghost" })}
          className="mt-3 w-full py-2.5 rounded-lg bg-black hover:bg-neutral-900 text-white font-semibold transition flex items-center justify-center gap-2"
        >
           Sign up with Apple
        </button>

        {/* DIVIDER */}
        <div className="my-6 flex items-center justify-center">
          <span className="text-slate-500 text-sm">──────── or ────────</span>
        </div>

        {/* EMAIL SIGNUP FORM */}
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
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
