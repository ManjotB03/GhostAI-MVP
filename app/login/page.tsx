"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCredentialsLogin = async () => {
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Sign in to GhostAI
        </h1>

        {/* Google Login */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full py-3 mb-6 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg shadow"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-2 my-6">
          <span className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></span>
          <span className="text-gray-500 text-sm dark:text-gray-400">OR</span>
          <span className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></span>
        </div>

        {/* Email Input */}
        <input
          type="email"
          className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-700 dark:text-white"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input */}
        <input
          type="password"
          className="w-full p-3 mb-6 border rounded-lg dark:bg-gray-700 dark:text-white"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          onClick={handleCredentialsLogin}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
        >
          Login
        </button>

        <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          Don't have an account? <span className="text-indigo-600">Sign up soon</span>
        </p>
      </div>
    </div>
  );
}