"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // --------------------------
  // LOGIN HANDLER
  // --------------------------
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg("Invalid email or password.");
      return;
    }

    router.push("/ghost"); // redirect after login
  };

  // --------------------------
  // PASSWORD RESET HANDLER
  // --------------------------
  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg("Enter your email first to reset your password.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMsg("Could not send reset email. Try again.");
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-700 rounded-2xl p-8 shadow-2xl">

        {/* TITLE */}
        <h1 className="text-3xl font-extrabold text-center mb-4">
          <span className="text-sky-400">Login</span>{" "}
          <span className="text-white">to GhostAI</span>
        </h1>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500 px-3 py-2 text-sm text-red-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* RESET PASSWORD SENT MESSAGE */}
        {resetSent && (
          <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500 px-3 py-2 text-sm text-green-300 text-center">
            Password reset email sent! Check your inbox.
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg px-3 py-2 bg-slate-800 border border-slate-600 text-white"
              placeholder="you@example.com"
              autoComplete="email"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sky-400 text-sm hover:text-sky-300 mt-2 underline underline-offset-2"
            >
              Forgot password?
            </button>
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
        <div className='mt-6'>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/ghost`
                }
              });
            }}
            className='w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition'
          >
            <img src='https://www.svgrepo.com/show/475656/google-color.svg' alt='Google Logo' className='inline-block w-5 h-5 mr-2 -mt-1' />
            Continue with Google
          </button> 
        </div>
        <p className="mt-4 text-center text-sm text-slate-400">
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