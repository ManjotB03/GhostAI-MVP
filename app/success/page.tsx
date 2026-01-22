export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-6">
      <h1 className="text-4xl font-bold mb-3">Payment successful ✅</h1>
      <p className="text-slate-300 mb-8 text-center max-w-xl">
        Your plan is being activated. If it doesn’t update instantly, refresh in 10–20 seconds.
      </p>

      <a
        href="/ghost"
        className="px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 font-semibold transition"
      >
        Go to GhostAI
      </a>
    </div>
  );
}
