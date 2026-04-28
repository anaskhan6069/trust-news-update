import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardStats, getPendingDrafts } from "@/lib/google-sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const [drafts, stats] = await Promise.all([getPendingDrafts(), getDashboardStats()]);

    return NextResponse.json({ success: true, drafts, stats }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch admin drafts", error);
    return NextResponse.json({ success: false, message: "Unable to fetch drafts" }, { status: 500 });
  }
}
