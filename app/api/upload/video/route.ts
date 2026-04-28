import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Video file is required" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { success: false, message: "Only video files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { success: false, message: "Video must be 100MB or smaller" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "trust-news/videos"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json(
      {
        success: true,
        embedUrl: uploadResult.secure_url,
        viewUrl: uploadResult.secure_url
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Video upload failed", error);
    return NextResponse.json(
      { success: false, message: "Unable to upload video" },
      { status: 500 }
    );
  }
}