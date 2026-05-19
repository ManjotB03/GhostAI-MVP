"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setEmailError("");
    setPasswordError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (cleanPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Signup failed.");
        return;
      }

      setSuccess("Account created. Logging you in...");

      const loginRes = await signIn("credentials", {
        email: cleanEmail,
        password: cleanPassword,
        redirect: false,
      });

      if (loginRes?.error) {
        setError(
          "Account created, but login failed. Please go to /login and sign in."
        );
        return;
      }

      router.push("/ghost");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0b0b0f] p-8 shadow-2x1">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/ghostai-logo.png"
            alt="GhostAI"
            width={180}
            height={50}
            priority
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Create your free account
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Get your CV match score and missing keywords — free, no card required
        </p>

        {/* Google button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/ghost" })}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-green-500 hover:bg-green-600 transition text-white font-semibold py-3 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5 bg-white rounded-full p-0.5"
          >
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303C33.659 32.657 29.194 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.176 0-9.631-3.328-11.29-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-1.064 3.098-3.328 5.559-6.084 7.083l.004-.002 6.19 5.238C33.971 41.205 44 36 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>

          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-sm text-slate-400">
            or sign up with email
          </span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={email}
              onBlur={() => {
                if (email && !/\S+@\S+\.\S+/.test(email)) {
                  setEmailError("Please enter a valid email address.");
                } else {
                  setEmailError("");
                }
              }}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-green-500"
            />

            {emailError && (
              <p className="text-sm text-red-500 mt-2">
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                onBlur={() => {
                  if (password && password.length < 8) {
                    setPasswordError(
                      "Password must be at least 8 characters."
                    );
                  } else {
                    setPasswordError("");
                  }
                }}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pr-14 text-white outline-none focus:border-green-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {passwordError && (
              <p className="text-sm text-red-500 mt-2">
                {passwordError}
              </p>
            )}
          </div>

          {/* Errors */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-500 hover:bg-green-600 transition py-3 font-semibold text-white disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create free account"}
          </button>
        </form>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mt-6 flex-wrap">
          <span>✓ Free forever</span>
          <span>✓ No credit card</span>
          <span>✓ 30 seconds to start</span>
        </div>

        {/* Login */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}