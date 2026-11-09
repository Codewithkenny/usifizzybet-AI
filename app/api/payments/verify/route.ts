import { NextRequest, NextResponse } from "next/server";
import {
  fulfillPaystackPayment,
  verifyPaystackPayment,
} from "@/lib/payments/paystack";
import { enforceRateLimit, rateLimitIdentity } from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";
import { readJsonBody } from "@/lib/requestBody";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to verify payment" }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit(
    request,
    "payment-verify",
    rateLimitIdentity(request, user.id),
    10,
    60,
  );
  if (rateLimit) return rateLimit;

  const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  try {
    if (
      !baseUrl ||
      new URL(request.headers.get("origin") || "").origin !==
        new URL(baseUrl).origin
    ) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const body = await readJsonBody(request, 1024);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.error },
      { status: body.status },
    );
  }
  const reference = isRecord(body.value) ? body.value.reference : null;
  if (typeof reference !== "string" || !/^usif_[a-f0-9]{32}$/.test(reference)) {
    return NextResponse.json({ error: "Invalid payment reference" }, { status: 400 });
  }

  try {
    const transaction = await verifyPaystackPayment(reference);
    const membership = await fulfillPaystackPayment(
      reference,
      transaction,
      user.id,
    );
    return NextResponse.json({
      success: true,
      planId: membership.plan_id,
      currentPeriodEnd: membership.current_period_end,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    const message =
      error instanceof Error ? error.message : "Unable to verify payment";
    const status =
      message === "Payment reference not found"
        ? 404
        : message === "Paystack did not confirm a successful payment"
          ? 400
          : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
