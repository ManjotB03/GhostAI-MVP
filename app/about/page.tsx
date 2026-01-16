export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto mt-16 px-6">
      <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
        About GhostAI
      </h1>

      <p className="text-gray-300 text-lg leading-relaxed mb-8">
        GhostAI is a modern AI-powered <span className="text-white font-semibold">career coach</span>{" "}
        built to help you level up your professional life. Our mission is to
        give you clear, practical guidance that helps you land better roles,
        perform in interviews, and grow your career with confidence.
      </p>

      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8 shadow-xl mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">
          What GhostAI Can Help You With
        </h2>

        <ul className="text-gray-300 space-y-3 text-left">
          <li>• CV / resume improvements (bullet points, structure, wording)</li>
          <li>• Cover letters tailored to specific job descriptions</li>
          <li>• Interview preparation (questions, answers, mock interview practice)</li>
          <li>• Career switching strategy and job search planning</li>
          <li>• Salary negotiation guidance and long-term career growth plans</li>
        </ul>
      </div>

      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Built With</h2>

        <p className="text-gray-300 leading-relaxed">
          GhostAI is built using{" "}
          <span className="text-white font-semibold">Next.js</span>,{" "}
          <span className="text-white font-semibold">Tailwind CSS</span>, and modern{" "}
          <span className="text-white font-semibold">AI technology</span> to deliver fast, secure,
          and helpful career support anytime you need it.
        </p>
      </div>
    </div>
  );
}
