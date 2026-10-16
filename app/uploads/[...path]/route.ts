import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { isSafePath } from "@/lib/security";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Validasi ketat untuk mencegah serangan Path Traversal
    for (const segment of segments) {
      if (
        segment.includes("..") ||
        segment.includes("/") ||
        segment.includes("\\") ||
        segment.includes("\0") ||
        segment.startsWith(".")
      ) {
        return new NextResponse("Invalid File Path", { status: 400 });
      }
    }

    const relativePath = path.join(...segments);
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    const fullPath = path.resolve(uploadsDir, relativePath);

    // Pastikan path target berada aman di dalam folder uploads
    if (!isSafePath(uploadsDir, fullPath)) {
      return new NextResponse("Forbidden: Access Denied", { status: 403 });
    }

    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const ext = path.extname(fullPath).toLowerCase();
    // Hanya izinkan ekstensi yang terdaftar di MIME_MAP
    if (!MIME_MAP[ext]) {
      return new NextResponse("Forbidden: Unsupported File Type", { status: 403 });
    }

    const contentType = MIME_MAP[ext];
    const fileBuffer = await readFile(fullPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return new NextResponse("File Not Found", { status: 404 });
    }
    console.error("Upload serve error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
