import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function GhostDashboardPage() {
  // Get the session from NextAuth (server-side)
  const session = await getServerSession(authOptions);

  // If the user is NOT logged in → redirect to login
  if (!session) {
    redirect("/login");
  }

  // If logged in → access user info
  const user = session.user;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-4xl font-bold">Welcome to GhostAI 👻</h1>

      <p className="mt-2 text-slate-400">
        Logged in as{" "}
        <span className="text-sky-400">{user?.email}</span>
      </p>

      <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h2 className="text-2xl font-semibold mb-4">Your GhostAI Tools</h2>

        {/* TODO: Insert your scoring tools, money prediction, career tools, etc */}
        <p className="text-slate-400">
          This is your protected dashboard. Only logged-in users can see this.
        </p>
      </div>
    </div>
  );
}
