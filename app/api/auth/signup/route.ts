import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/google-sheets";

export const runtime = "nodejs";

const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.json();
    const parsed = signupSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid signup payload" },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(parsed.data.email);

    if (existingUser) {
      return NextResponse.json({ success: false, message: "A user with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(parsed.data.password, 12);

    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      hashedPassword,
      provider: "credentials",
      role: "user"
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup failed", error);
    return NextResponse.json({ success: false, message: "Unable to create account" }, { status: 500 });
  }
}
