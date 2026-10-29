import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Validasi Magic Bytes audio untuk memastikan isi file benar-benar berkas audio yang sah
function isValidAudioSignature(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  // MP3 dengan header ID3: 'ID3'
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true;
  // MP3 raw frame sync
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true;
  // WAV: 'RIFF....WAVE'
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x41 && buffer[10] === 0x56 && buffer[11] === 0x45
  ) return true;
  // OGG: 'OggS'
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) return true;
  // M4A / MP4 Audio: 'ftyp'
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") return true;

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized: Akses ditolak" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang dipilih" }, { status: 400 });
    }

    // Validasi ekstensi dan tipe MIME audio
    const validExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac"];
    const ext = path.extname(file.name).toLowerCase();
    const isAudioType = file.type.startsWith("audio/") || validExtensions.includes(ext);

    if (!isAudioType || !validExtensions.includes(ext)) {
      return NextResponse.json(
        { error: "Format file tidak valid. Hanya file audio (MP3, WAV, OGG, M4A, AAC) yang diperbolehkan." },
        { status: 400 }
      );
    }

    // Batasi ukuran maksimal 20MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file audio terlalu besar (maksimal 20MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validasi Magic Bytes konten file audio
    if (!isValidAudioSignature(buffer)) {
      return NextResponse.json(
        { error: "Isi file tidak sesuai dengan format file audio yang sah." },
        { status: 400 }
      );
    }

    const audioDir = path.join(process.cwd(), "public", "audio");
    await mkdir(audioDir, { recursive: true });

    const targetFile = path.join(audioDir, "dua_lipa.mp3");
    await writeFile(targetFile, buffer);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      size: file.size,
      message: "File audio berhasil di-upload ke public/audio/dua_lipa.mp3",
    });
  } catch (error: any) {
    console.error("Audio upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah audio: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
