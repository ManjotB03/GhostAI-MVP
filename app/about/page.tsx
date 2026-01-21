export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto mt-16 px-6 text-white">
      <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
        About GhostAI
      </h1>

      <p className="text-slate-300 text-lg leading-relaxed mb-10">
        GhostAI is an AI-powered <span className="text-sky-400 font-semibold">career coach</span>{" "}
        built to help people land better jobs. We focus on practical outcomes — stronger CVs,
        better interview answers, and clearer career direction.
      </p>

      <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-white">
          What GhostAI can help you with
        </h2>

        <ul className="text-slate-300 space-y-3 leading-relaxed">
          <li>• Rewrite CV bullets to sound more impactful and results-driven</li>
          <li>• Improve cover letters and tailor applications to job descriptions</li>
          <li>• Generate strong STAR interview answers with real structure</li>
          <li>• Prepare for common interview questions and follow-ups</li>
          <li>• Build a clear plan to move roles, industries, or levels</li>
          <li>• Salary negotiation scripts and confidence-building responses</li>
        </ul>
      </div>

      <div className="mt-10 text-slate-300 leading-relaxed">
        <h3 className="text-xl font-bold text-white mb-3">Built with</h3>
        <p>
          GhostAI is built using modern web tools and AI models to deliver fast,
          structured, and genuinely useful career guidance.
        </p>
        <p className="mt-4 text-slate-400 text-sm">
          Next.js • Tailwind CSS • Secure Auth • Stripe Billing • Supabase
        </p>
      </div>
    </div>
  );
}
