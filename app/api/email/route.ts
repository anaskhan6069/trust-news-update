import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAdminNotification } from "@/lib/email";

export const runtime = "nodejs";

const emailSchema = z.object({
  authorName: z.string().min(2),
  authorEmail: z.string().email(),
  title: z.string().min(3),
  category: z.string().min(2)
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.json();
    const parsed = emailSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid email payload" }, { status: 400 });
    }

    await sendAdminNotification(parsed.data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Email notification failed", error);
    return NextResponse.json({ success: false, message: "Unable to send email" }, { status: 500 });
  }
}
