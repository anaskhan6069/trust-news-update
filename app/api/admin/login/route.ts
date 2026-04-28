import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.json();
    const parsed = adminLoginSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid admin credentials" }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (
      adminEmail &&
      adminPassword &&
      parsed.data.email.toLowerCase() === adminEmail.toLowerCase() &&
      parsed.data.password === adminPassword
    ) {
      return NextResponse.json({ success: true, message: "Admin credentials verified", role: "admin" }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "Invalid admin credentials" }, { status: 401 });
  } catch (error) {
    console.error("Admin login route failed", error);
    return NextResponse.json({ success: false, message: "Unable to verify admin credentials" }, { status: 500 });
  }
}
