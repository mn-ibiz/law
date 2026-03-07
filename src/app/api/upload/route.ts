import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

// Map of allowed extensions to their expected MIME types for validation
const ALLOWED_EXTENSIONS = new Map([
  [".pdf", "application/pdf"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".txt", "text/plain"],
]);

// Magic bytes for file type verification
const MAGIC_BYTES: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png": [[0x89, 0x50, 0x4E, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF
  "application/msword": [[0xD0, 0xCF, 0x11, 0xE0]], // OLE2
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [[0x50, 0x4B, 0x03, 0x04]], // PK (ZIP)
};

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return true; // No signature to check (e.g., text/plain)
  return signatures.some((sig) =>
    sig.every((byte, i) => buffer.length > i && buffer[i] === byte)
  );
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !["admin", "attorney"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Accepted: PDF, Word, JPEG, PNG, WebP, Plain Text" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 10MB size limit" },
      { status: 400 }
    );
  }

  // Extract and validate file extension
  const rawExt = file.name.includes(".") ? `.${file.name.split(".").pop()?.toLowerCase()}` : "";
  const ext = /^\.[a-z0-9]+$/.test(rawExt) && ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : "";

  if (!ext) {
    return NextResponse.json(
      { error: "File extension not allowed" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Verify file contents match declared MIME type via magic bytes
  if (!verifyMagicBytes(buffer, file.type)) {
    return NextResponse.json(
      { error: "File contents do not match declared file type" },
      { status: 400 }
    );
  }

  const uuid = randomUUID();
  const safeFilename = `${uuid}${ext}`;

  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  await writeFile(join(uploadsDir, safeFilename), buffer);

  const origin = request.headers.get("origin") ?? request.nextUrl.origin;
  const fileUrl = `${origin}/uploads/${safeFilename}`;

  return NextResponse.json({
    fileUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });
}
