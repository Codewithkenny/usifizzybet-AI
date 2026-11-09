import "server-only";

import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export function rateLimitIdentity(
  request: NextRequest,
  userId?: string,
): string {
  if (userId) return `user:${userId}`;

  const address =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `ip:${address || "unknown"}`;
}

export async function enforceRateLimit(
  request: NextRequest,
  scope: string,
  identity: string,
  limit: number,
  windowSeconds: number,
): Promise<NextResponse | null> {
  const bucketKey = createHash("sha256")
    .update(`${scope}:${identity}`)
    .digest("hex");

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("consume_rate_limit", {
      p_bucket_key: bucketKey,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error || !Array.isArray(data) || !data[0]) {
      throw new Error(error?.message ?? "Rate limiter returned no result");
    }

    const result = data[0] as {
      allowed?: unknown;
      retry_after_seconds?: unknown;
    };
    if (typeof result.allowed !== "boolean") {
      throw new Error("Rate limiter returned an invalid result");
    }
    if (result.allowed) return null;

    const retryAfter =
      typeof result.retry_after_seconds === "number"
        ? Math.max(1, Math.ceil(result.retry_after_seconds))
        : windowSeconds;
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  } catch (error) {
    console.error("Rate limiter is unavailable:", error);
    return NextResponse.json(
      { error: "Service is temporarily unavailable" },
      { status: 503 },
    );
  }
}
