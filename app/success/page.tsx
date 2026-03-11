export default function SuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-x1 p-8 text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4 text-green-400">
          Payment Successful!
        </h1>

        <p className="text-gray-300 mb-6">
          Your GhostAI subscription has been processed successfully. You can now enjoy the benefits of your new plan.
        </p>

        <a
          href="/ghost"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg"
        >
          Go to GhostAI
        </a>
      </div>
    </div>
  );
}
