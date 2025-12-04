export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto mt-16 px-6 text-center">
      <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        About GhostAI
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        GhostAI is a modern AI assistant built to help you with <span className="font-semibold text-cyan-400">Work</span>,{" "}
        <span className="font-semibold text-blue-400">Career</span>, and{" "}
        <span className="font-semibold text-indigo-400">Money</span>.
        Our mission is to create an intelligent tool that improves your daily life,
        boosts productivity, and makes complex tasks simple.
      </p>

      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-cyan-300">What GhostAI Can Do:</h2>
        <ul className="text-gray-300 space-y-3"> 
          <li>• Generate answers instantly using advanced AI</li>
          <li>• Help with CVs, career guidance, and job applications</li>
          <li>• Assist with money management, investing, and financial advice</li>
          <li>• Solve work tasks, create content, write emails, and more</li>
        </ul>
      </div>

      <p className="text-gray-400 mt-10">
        Built with ❤️ using Next.js, Tailwind CSS, and AI technology.
      </p>
    </div>
  );
}
