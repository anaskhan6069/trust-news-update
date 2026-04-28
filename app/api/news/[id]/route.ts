import { NextResponse } from "next/server";
import { getPublishedNewsById, getRelatedNews } from "@/lib/google-sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const news = await getPublishedNewsById(context.params.id);

    if (!news) {
      return NextResponse.json({ success: false, message: "News not found" }, { status: 404 });
    }

    const related = await getRelatedNews({
      id: news.id,
      category: news.category,
      limit: 3
    });

    return NextResponse.json({ success: true, news, related }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch news detail", error);
    return NextResponse.json({ success: false, message: "Unable to fetch news detail" }, { status: 500 });
  }
}
