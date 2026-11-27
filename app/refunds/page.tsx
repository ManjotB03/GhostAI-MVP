import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy – GhostAI",
  description:
    "GhostAI's refund policy: a full refund on your first payment if you ask within 14 days, and you can cancel anytime.",
  alternates: { canonical: "/refunds" },
};

const EMAIL = "ghostaicorp@gmail.com";

export default function RefundsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sky-400 hover:text-sky-300 text-sm">
          ← Back to GhostAI
        </Link>

        <h1 className="text-4xl font-bold mt-8 mb-4">Refund Policy</h1>

        <p className="text-slate-400 mb-8">Last updated: 27 November 2026</p>

        {/* Summary */}
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-6 mb-10">
          <p className="font-semibold text-white mb-3">The short version</p>
          <ul className="space-y-2 text-slate-200">
            <li>• Changed your mind? Ask within 14 days of your first payment for a full refund.</li>
            <li>• You can cancel anytime. You keep access until the end of the period you&apos;ve paid for.</li>
            <li>• After 14 days, we don&apos;t give partial refunds for unused time.</li>
          </ul>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              1. 14-day full refund
            </h2>
            <p>
              If you&apos;re not happy with a paid plan (Pro or Ultimate, monthly or
              annual), email us within 14 days of your first payment for that plan
              and we&apos;ll refund it in full. You don&apos;t need to give a reason.
              Your plan will then be cancelled and your account returns to the
              Free plan.
            </p>
            <p className="mt-3">
              This applies to the first payment of a subscription. If you cancel
              and later subscribe again, the 14-day refund doesn&apos;t apply to the
              new subscription unless the law gives you that right.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              2. Cancelling your subscription
            </h2>
            <p>
              You can cancel anytime using the Manage Billing button on the{" "}
              <Link href="/pricing" className="text-sky-400 hover:text-sky-300">
                Pricing page
              </Link>{" "}
              while logged in, or by emailing us. Cancelling stops future
              payments. You keep your paid features until the end of the current
              monthly or annual period, then move to the Free plan. Your saved
              applications and chat history are kept.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              3. Renewals and partial refunds
            </h2>
            <p>
              Subscriptions renew automatically. After the first 14 days, we
              don&apos;t refund renewal payments or unused parts of a billing period,
              including annual plans. If you&apos;ve been charged for a renewal you
              didn&apos;t want, contact us as soon as possible and we&apos;ll look at it
              fairly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              4. Problems with the service
            </h2>
            <p>
              If you were charged twice, charged in error, or a paid feature
              didn&apos;t work as described and we couldn&apos;t fix it, we&apos;ll refund
              you whenever it happened. Nothing in this policy affects your
              statutory rights as a consumer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              5. How to request a refund
            </h2>
            <p>
              Email{" "}
              <a href={`mailto:${EMAIL}?subject=Refund%20request`} className="text-sky-400 hover:text-sky-300">
                {EMAIL}
              </a>{" "}
              from the email address on your GhostAI account, with &quot;Refund
              request&quot; in the subject. We aim to reply within 2 working days.
              Approved refunds go back to your original payment method through our
              payment provider, Stripe, and usually arrive within 5–10 working
              days, depending on your bank.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              6. Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. Changes won&apos;t affect
              payments you made before the change. See also our{" "}
              <Link href="/terms" className="text-sky-400 hover:text-sky-300">
                Terms of Service
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
