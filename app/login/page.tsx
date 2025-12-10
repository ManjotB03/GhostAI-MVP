"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // EMAIL + PASSWORD LOGIN (NextAuth Credentials Provider)
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setErrorMsg("Invalid email or password.");
      return;
    }

    window.location.href = "/ghost";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-700 rounded-2xl p-8 shadow-xl">

        {/* TITLE */}
        <h1 className="text-3xl font-extrabold text-center mb-6">
          <span className="text-sky-400">Login</span>{" "}
          <span className="text-white">to GhostAI</span>
        </h1>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500 px-3 py-2 text-sm text-red-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* GOOGLE LOGIN */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/ghost" })}
          className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition flex items-center justify-center gap-2"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google Logo"
          />
          Continue with Google
        </button>

        {/* APPLE LOGIN (READY WHEN YOU ENABLE IT) */}
        <button
          onClick={() => signIn("apple", { callbackUrl: "/ghost" })}
          className="mt-3 w-full py-2.5 rounded-lg bg-black hover:bg-neutral-900 text-white font-semibold transition flex items-center justify-center gap-2"
        >
           Continue with Apple
        </button>

        {/* DIVIDER */}
        <div className="my-6 flex items-center justify-center">
          <span className="text-slate-500 text-sm">──────── or ────────</span>
        </div>

        {/* EMAIL LOGIN FORM */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg px-3 py-2 bg-slate-800 border border-slate-600 text-white"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg px-3 py-2 bg-slate-800 border border-slate-600 text-white"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* SIGN UP LINK */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}