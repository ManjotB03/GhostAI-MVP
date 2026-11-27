import Link from "next/link";
import SimplePageShell from "../components/SimplePageShell";

export const metadata = {
  title: "About – GhostAI",
  description:
    "GhostAI helps graduates tailor every application, track them all, and follow up. Built by a solo founder who went through the job hunt himself.",
};

const FEATURES = [
  "Tailor your CV to each job: match score, missing keywords, stronger bullet rewrites",
  "Track every application with the CV version you sent",
  "Get a check-in 7 days after applying, so nothing quietly disappears",
  "Draft cover letters from the job ad and your CV in one click",
  "Practise interview answers with STAR-style feedback",
];

export default function AboutPage() {
  return (
    <SimplePageShell>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-400 mb-3">About</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
          The job hunt, turned into a system.
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed mb-10">
          GhostAI helps graduates and job seekers stop sending the same CV everywhere and hoping.
          Tailor each application, keep every one in one place, and know when to follow up.
        </p>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7 mb-10">
          <h2 className="text-xl font-bold mb-4">What GhostAI does</h2>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex gap-3 text-slate-200">
                <span className="text-sky-400">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="text-xl font-bold mb-3">Why I built it</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          I&apos;m Manjot, the founder. My own job hunt felt like sending CVs into a void: dozens of
          applications, the same CV, mostly silence. The problem wasn&apos;t effort. It was having no
          system. GhostAI is the tool I wanted then.
        </p>
        <p className="text-slate-300 leading-relaxed mb-10">
          GhostAI helps you prepare stronger applications. It doesn&apos;t guarantee interviews or job
          offers, and you stay in control of everything that goes on your CV.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-center transition"
          >
            Start free
          </Link>
          <Link
            href="/cv-rewrite"
            className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 font-semibold text-center transition"
          >
            Or have me rewrite your CV
          </Link>
        </div>
      </div>
    </SimplePageShell>
  );
}
