export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to GhostAI</h1>
      <p className="text-slate-300 mb-6">
        Your personal AI assistant for Work, Career & Money.
      </p>

      <a
        href="/login"
        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 rounded-lg text-white font-semibold transition"
      >
        Get Started
      </a>
    </div>
  );
}
