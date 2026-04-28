import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createDraftNews, queryPublishedNews } from "@/lib/google-sheets";
import { sendAdminNotification } from "@/lib/email";
import { isCategorySlug } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createNewsSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(50),
  category: z.string().refine(isCategorySlug, "Invalid category"),
  imageUrl: z.string().url(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  authorName: z.string().min(2),
  authorEmail: z.string().email()
});

function getPositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const categoryParam = searchParams.get("category");
    const category = categoryParam && isCategorySlug(categoryParam) ? categoryParam : undefined;
    const search = searchParams.get("search") ?? undefined;
    const page = getPositiveInt(searchParams.get("page"), 1);
    const limit = getPositiveInt(searchParams.get("limit"), 9);

    const result = await queryPublishedNews({
      category,
      search,
      page,
      limit
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch published news", error);
    return NextResponse.json({ success: false, message: "Unable to fetch news" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = createNewsSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid news payload" },
        { status: 400 }
      );
    }

    const draft = await createDraftNews({
      ...parsed.data,
      category: parsed.data.category
    });

    try {
      await sendAdminNotification({
        authorName: draft.authorName,
        authorEmail: draft.authorEmail,
        title: draft.title,
        category: draft.category,
        timestamp: draft.submittedAt
      });
    } catch (emailError) {
      console.error("Draft saved, but admin email failed", emailError);
    }

    return NextResponse.json({ success: true, message: "Draft saved", draft }, { status: 201 });
  } catch (error) {
    console.error("Failed to create draft news", error);
    return NextResponse.json({ success: false, message: "Unable to save draft" }, { status: 500 });
  }
}
