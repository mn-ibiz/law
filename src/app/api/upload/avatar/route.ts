import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF
};

const ALLOWED_EXTENSIONS = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some((sig) =>
    sig.every((byte, i) => buffer.length > i && buffer[i] === byte)
  );
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json(
      { error: "Image exceeds 2MB size limit" },
      { status: 400 }
    );
  }

  const rawExt = file.name.includes(".")
    ? `.${file.name.split(".").pop()?.toLowerCase()}`
    : "";
  const ext =
    /^\.[a-z0-9]+$/.test(rawExt) && ALLOWED_EXTENSIONS.has(rawExt)
      ? rawExt
      : "";

  if (!ext) {
    return NextResponse.json(
      { error: "File extension not allowed" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!verifyMagicBytes(buffer, file.type)) {
    return NextResponse.json(
      { error: "File contents do not match declared file type" },
      { status: 400 }
    );
  }

  const uuid = randomUUID();
  const safeFilename = `${uuid}${ext}`;

  const avatarsDir = join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(avatarsDir, { recursive: true });

  await writeFile(join(avatarsDir, safeFilename), buffer);

  const origin = request.headers.get("origin") ?? request.nextUrl.origin;
  const fileUrl = `${origin}/uploads/avatars/${safeFilename}`;

  return NextResponse.json({ fileUrl });
}
