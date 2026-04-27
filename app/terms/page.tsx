import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sky-400 hover:text-sky-300 text-sm">
          ← Back to GhostAI
        </Link>

        <h1 className="text-4xl font-bold mt-8 mb-4">Terms of Service</h1>

        <p className="text-slate-400 mb-8">Last updated: 27 April 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              1. Overview
            </h2>
            <p>
              These Terms of Service govern your use of GhostAI, an AI-powered
              tool designed to help users improve CVs, job applications, and
              interview preparation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              2. AI-Generated Content
            </h2>
            <p>
              GhostAI provides AI-generated suggestions and feedback. You are
              responsible for reviewing, editing, and verifying all outputs
              before using them in real applications, interviews, or professional
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              3. No Guarantee of Employment
            </h2>
            <p>
              GhostAI does not guarantee job offers, interviews, salary
              increases, or employment outcomes. The service is intended to
              support your preparation and improve the quality of your career
              materials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              4. User Responsibilities
            </h2>
            <p>
              You agree not to misuse GhostAI, submit unlawful content, upload
              content you do not have permission to use, attempt to abuse the
              service, or rely on AI outputs without human review.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              5. Accounts and Access
            </h2>
            <p>
              You are responsible for maintaining access to your account and for
              activity that occurs through it. We may limit, suspend, or remove
              access if the service is misused.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              6. Subscriptions and Payments
            </h2>
            <p>
              Paid plans may provide access to additional features or higher
              usage limits. Payments are processed by third-party payment
              providers. Pricing and plan features may change over time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              7. Availability
            </h2>
            <p>
              We aim to keep GhostAI available and useful, but we do not
              guarantee uninterrupted or error-free service. Features may be
              updated, changed, or removed as the product develops.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, GhostAI is not liable for
              indirect, incidental, or consequential losses arising from your use
              of the service or reliance on AI-generated outputs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              9. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of
              GhostAI after changes means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              10. Contact
            </h2>
            <p>
              If you have questions about these Terms, contact us at{" "}
              <a
                href="mailto:ghostaicorp@gmail.com"
                className="text-sky-400 hover:text-sky-300"
              >
                ghostaicorp@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}