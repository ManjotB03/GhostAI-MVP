import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sky-400 hover:text-sky-300 text-sm">
          ← Back to GhostAI
        </Link>

        <h1 className="text-4xl font-bold mt-8 mb-4">Privacy Policy</h1>

        <p className="text-slate-400 mb-8">
          Last updated: 27 April 2026
        </p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              1. Overview
            </h2>
            <p>
              GhostAI helps users improve CVs, job applications, and interview
              preparation using AI-powered feedback. This Privacy Policy explains
              what information we collect, how we use it, and how we protect it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              2. Information We Collect
            </h2>
            <p>
              We may collect information you provide directly, including your
              name, email address, account details, CV content, job descriptions,
              prompts, uploaded files, and messages submitted to GhostAI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              3. How We Use Your Information
            </h2>
            <p>
              We use your information to provide AI feedback, improve CV and
              interview support, manage accounts, process subscriptions, improve
              the product, prevent misuse, and communicate important updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              4. CVs, Files, and Prompts
            </h2>
            <p>
              Content you upload or paste into GhostAI may be processed to
              generate feedback. You should avoid uploading information you do
              not want processed by the service. You remain responsible for
              reviewing and editing any AI-generated suggestions before using
              them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              5. Third-Party Services
            </h2>
            <p>
              GhostAI may use trusted third-party providers for authentication,
              payments, hosting, database storage, analytics, and AI processing.
              These providers may process data only as needed to support the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              6. Payments
            </h2>
            <p>
              Payments are processed by third-party payment providers. GhostAI
              does not store full payment card details directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              7. Data Retention
            </h2>
            <p>
              We keep information for as long as needed to provide the service,
              maintain records, comply with legal obligations, resolve disputes,
              and improve GhostAI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              8. Your Rights
            </h2>
            <p>
              Depending on your location, you may have rights to access, correct,
              delete, or request a copy of your personal information. You can
              contact us to make a privacy-related request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              9. Security
            </h2>
            <p>
              We take reasonable steps to protect your information, but no online
              service can guarantee complete security. You should use strong
              passwords and avoid uploading unnecessary sensitive information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              10. Contact
            </h2>
            <p>
              If you have questions about this Privacy Policy, contact us at{" "}
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
