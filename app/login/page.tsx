"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-3xl p-8 shadow-2xl">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/ghostai-logo.png"
            alt="GhostAI"
            width={180}
            height={50}
            priority
            unoptimized
          />
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Welcome back
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Log in to continue improving your CV
        </p>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* GOOGLE LOGIN */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/ghost" })}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-slate-100 transition text-slate-800 font-semibold py-3 mb-6"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google"
          />
          Continue with Google
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-slate-700 flex-1" />
          <span className="text-sm text-slate-400">or log in with email</span>
          <div className="h-px bg-slate-700 flex-1" />
        </div>

        {/* EMAIL LOGIN FORM */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-xl px-4 py-3 bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500"
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-xl px-4 py-3 pr-14 bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-500"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-200"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 transition disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* SIGN UP LINK */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="text-sky-400 hover:text-sky-300 font-medium"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
