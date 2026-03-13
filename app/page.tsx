import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%)]" />
        <div className="max-w-6xl mx-auto px-6 py-24 sm:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <p className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1 text-sm font-medium text-sky-300 mb-6">
              GhostAI Career Coach
            </p>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              Land more interviews with
              <span className="text-sky-400"> AI-powered </span>
              CV reviews, ATS scoring, and interview coaching
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              GhostAI helps students, graduates, and early professionals improve
              their CVs, tailor applications for specific roles, and practise
              stronger interview answers that feel natural and convincing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="px-7 py-3.5 bg-sky-500 hover:bg-sky-600 rounded-xl text-white font-semibold transition shadow-lg shadow-sky-500/20"
              >
                Get Started Free
              </Link>

              <Link
                href="/pricing"
                className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-white font-semibold transition border border-slate-700"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-8 text-sm text-slate-400">
              Built for real career outcomes — practical feedback, clear next
              steps, and better interview preparation.
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="text-sky-400 text-2xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-3">Smart CV Review</h3>
            <p className="text-slate-300 leading-relaxed">
              Upload your CV and get practical feedback on structure, clarity,
              impact, and how to improve it for real job applications.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="text-sky-400 text-2xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">ATS Score</h3>
            <p className="text-slate-300 leading-relaxed">
              See how well your CV matches a target role with an ATS-style score
              and suggestions to strengthen keywords and positioning.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="text-sky-400 text-2xl mb-4">🎤</div>
            <h3 className="text-xl font-bold mb-3">Interview Coaching</h3>
            <p className="text-slate-300 leading-relaxed">
              Practise answers, get feedback, and improve the way you explain
              your experience with structured interview support.
            </p>
          </div>
        </div>
      </section>

      {/* Example output section */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">
            See GhostAI in action
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Example of the kind of feedback you can get
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            GhostAI turns vague CV bullets into stronger, clearer, more
            interview-worthy achievements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
              Original CV Bullet
            </p>
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5">
              <p className="text-slate-300 leading-relaxed">
                Built data pipelines and worked with SQL to support reporting.
              </p>
            </div>

            <div className="mt-6 text-sm text-slate-400">
              A typical bullet that sounds too vague and doesn’t show enough impact.
            </div>
          </div>

          <div className="rounded-3xl border border-sky-500/30 bg-sky-500/10 p-8 shadow-xl">
            <p className="text-xs uppercase tracking-wider text-sky-300 mb-3">
              GhostAI Improvement
            </p>
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5">
              <p className="text-slate-100 leading-relaxed">
                Designed and improved SQL-based data pipelines to support
                reporting workflows, helping deliver more reliable business
                insights and clearer access to decision-critical data.
              </p>
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-200">
              <p>• Stronger action verb</p>
              <p>• Clearer technical positioning</p>
              <p>• More impact and professionalism</p>
              <p>• Better fit for ATS and recruiter scanning</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From CV upload to interview confidence
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            GhostAI gives you a clear path from improving your CV to preparing
            stronger answers for interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-sky-400 text-sm font-semibold mb-3">STEP 1</div>
            <h3 className="text-xl font-bold mb-3">Upload your CV</h3>
            <p className="text-slate-300 leading-relaxed">
              Add your CV and choose the role you’re targeting so GhostAI can
              tailor the feedback.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-sky-400 text-sm font-semibold mb-3">STEP 2</div>
            <h3 className="text-xl font-bold mb-3">Get tailored feedback</h3>
            <p className="text-slate-300 leading-relaxed">
              Receive ATS-style scoring, stronger bullet rewrites, and specific
              improvements based on your target role.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-sky-400 text-sm font-semibold mb-3">STEP 3</div>
            <h3 className="text-xl font-bold mb-3">Practise interview answers</h3>
            <p className="text-slate-300 leading-relaxed">
              Use Interview Mock mode to turn weak answers into stronger,
              clearer, more confident responses.
            </p>
          </div>
        </div>
      </section>

      {/* Trust / audience section */}
      <section className="max-w-6xl mx-auto px-6 pb-16 sm:pb-24">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12 text-center">
          <p className="text-sky-400 font-semibold tracking-wide mb-3">
            Built for job seekers
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ideal for students, graduates, and early-career professionals
          </h2>
          <p className="text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Whether you’re applying for data, software, analytics, cloud, or AI
            roles, GhostAI helps you present yourself better and prepare with
            more confidence.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              CV feedback
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              ATS score
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              Interview prep
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              Target role matching
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-slate-300">
              Career coaching
            </span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Start improving your career materials today
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">
            Upload your CV, get targeted feedback, and practise better interview
            answers with GhostAI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-7 py-3.5 bg-sky-500 hover:bg-sky-600 rounded-xl text-white font-semibold transition shadow-lg shadow-sky-500/20"
            >
              Start Free
            </Link>

            <Link
              href="/pricing"
              className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-white font-semibold transition border border-slate-700"
            >
              See Plans
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
