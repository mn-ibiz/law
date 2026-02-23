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

  const ext = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
  const uuid = randomUUID();
  const safeFilename = `${uuid}${ext}`;

  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
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
