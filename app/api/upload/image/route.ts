import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "trust-news"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}