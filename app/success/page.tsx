export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-xl w-full bg-slate-900/70 border border-slate-700 rounded-2xl p-8 text-center shadow-xl">
        <h1 className="text-4xl font-extrabold mb-3">Payment successful ✅</h1>
        <p className="text-slate-300 mb-6">
          Your subscription is being activated. If it doesn’t update instantly, give it 10–30 seconds.
        </p>

        <a
          href="/ghost"
          className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition"
        >
          Go back to GhostAI
        </a>

        <p className="text-slate-400 text-sm mt-6">
          If your tier doesn’t update after 1 minute, sign out and sign in again.
        </p>
      </div>
    </div>
  );
}
