import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import GhostClient from "./GhostClient";

export default async function GhostPage({
  searchParams,
}: {
  searchParams: { prompt?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const initialPrompt = searchParams?.prompt || "";

  return <GhostClient initialPrompt={initialPrompt} />;
}