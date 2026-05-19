"use client";

type UpgradeModalProps = {
  onClose: () => void;
};

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  return (
    <div className="min-h-[500px] w-full flex items-center justify-center bg-black/70 px-4 py-10 animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-300">Daily usage</span>
            <span className="font-semibold text-red-300">
              5 / 5 daily reviews used
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-full rounded-full bg-red-500" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          You&apos;ve reached today&apos;s free limit
        </h2>

        <p className="text-slate-300 leading-relaxed mb-5">
          Upgrade to Pro to get 50 CV reviews per day, unlimited rewrites,
          cover letter drafting, and interview coaching.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
            50 reviews/day
          </span>
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
            Cover letter drafting
          </span>
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
            Interview mock mode
          </span>
        </div>

        <button
          onClick={() => console.log("Upgrade to Pro clicked")}
          className="w-full rounded-xl bg-green-500 py-3 font-semibold text-white transition hover:bg-green-600"
        >
          Upgrade to Pro — £4.99/mo
        </button>

        <button
          onClick={() => console.log("7-day free trial clicked")}
          className="mt-3 w-full rounded-xl border border-slate-700 py-3 font-semibold text-slate-200 transition hover:bg-slate-900"
        >
          Start 7-day free trial — no card required
        </button>

        <button
          onClick={onClose}
          className="mt-5 block w-full text-center text-sm text-slate-500 transition hover:text-slate-300"
        >
          Maybe later
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          Cancel anytime. Takes 30 seconds to upgrade.
        </p>
      </div>
    </div>
  );
}