import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { runJob } from "@/lib/cron/runner";

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // In development without CRON_SECRET, allow requests from localhost only
    const host = request.headers.get("host") ?? "";
    const hostname = host.split(":")[0];
    return hostname === "localhost" || hostname === "127.0.0.1";
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const spaceIdx = authHeader.indexOf(" ");
  if (spaceIdx === -1) return false;

  const scheme = authHeader.slice(0, spaceIdx);
  const token = authHeader.slice(spaceIdx + 1);

  if (scheme !== "Bearer" || token.length !== cronSecret.length) return false;

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token, "utf-8"),
    Buffer.from(cronSecret, "utf-8")
  );
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobName = request.nextUrl.searchParams.get("job");
  if (!jobName) {
    return NextResponse.json(
      { error: "Missing 'job' parameter" },
      { status: 400 }
    );
  }

  const result = await runJob(jobName);

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}
