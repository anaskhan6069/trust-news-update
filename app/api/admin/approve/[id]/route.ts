import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveDraftNews } from "@/lib/google-sheets";

export const runtime = "nodejs";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const news = await approveDraftNews(context.params.id);

    return NextResponse.json({ success: true, news }, { status: 200 });
  } catch (error) {
    console.error("Failed to approve draft", error);
    const message = error instanceof Error ? error.message : "Unable to approve draft";
    const status = message === "Draft not found" ? 404 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
