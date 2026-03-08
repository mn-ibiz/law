import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { generateStorageKey, uploadFile } from "@/lib/storage";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema/organizations";
import { plans } from "@/lib/db/schema/organizations";
import { eq, sql } from "drizzle-orm";

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
  "image/webp": [[0x52, 0x49, 0x46, 0x46, -1, -1, -1, -1, 0x57, 0x45, 0x42, 0x50]], // RIFF????WEBP
  "application/msword": [[0xD0, 0xCF, 0x11, 0xE0]], // OLE2
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [[0x50, 0x4B, 0x03, 0x04]], // PK (ZIP)
};

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return true; // No signature to check (e.g., text/plain)
  return signatures.some((sig) =>
    sig.every((byte, i) => buffer.length > i && (byte === -1 || buffer[i] === byte))
  );
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId || !["admin", "attorney"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizationId = session.user.organizationId;

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

  // Check storage quota
  const [org] = await db
    .select({
      storageUsedBytes: organizations.storageUsedBytes,
      maxStorageMb: plans.maxStorageMb,
    })
    .from(organizations)
    .leftJoin(plans, eq(organizations.planId, plans.id))
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (org?.maxStorageMb != null) {
    const maxBytes = org.maxStorageMb * 1024 * 1024;
    const currentUsed = org.storageUsedBytes ?? 0;
    if (currentUsed + file.size > maxBytes) {
      return NextResponse.json(
        { error: "Storage quota exceeded. Please upgrade your plan or delete unused files." },
        { status: 413 }
      );
    }
  }

  // Upload to tenant-isolated storage
  const key = generateStorageKey(organizationId, "documents", ext);
  await uploadFile(key, buffer, file.type);

  // Atomically increment storage usage
  await db
    .update(organizations)
    .set({
      storageUsedBytes: sql`${organizations.storageUsedBytes} + ${file.size}`,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId));

  // Return storageKey as fileUrl for backward compatibility with frontend
  return NextResponse.json({
    fileUrl: key,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });
}
