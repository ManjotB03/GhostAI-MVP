import SimplePageShell from "../components/SimplePageShell";

export const metadata = {
  title: "Contact – GhostAI",
  description: "Questions, feedback or partnership enquiries? Email GhostAI.",
};

const EMAIL = "ghostaicorp@gmail.com";

export default function ContactPage() {
  return (
    <SimplePageShell>
      <div className="max-w-xl mx-auto px-5 sm:px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-400 mb-3">Contact</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">Get in touch</h1>
        <p className="text-lg text-slate-300 mb-10">
          Questions, feedback, a refund, or a partnership idea for your society, bootcamp or
          coaching clients? Email me directly.
        </p>

        <a
          href={`mailto:${EMAIL}`}
          className="block rounded-2xl border border-sky-500/30 bg-sky-500/10 p-6 hover:bg-sky-500/15 transition"
        >
          <span className="block text-sm text-slate-400 mb-1">Email</span>
          <span className="block text-xl font-semibold text-white">{EMAIL}</span>
        </a>

        <p className="text-slate-400 mt-8">I aim to reply within 2 working days.</p>
      </div>
    </SimplePageShell>
  );
}
