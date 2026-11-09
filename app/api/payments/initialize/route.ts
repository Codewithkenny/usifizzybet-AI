import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";
import { enforceRateLimit, rateLimitIdentity } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { readBoundedText, readJsonBody } from "@/lib/requestBody";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Sign in to continue" }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit(
    request,
    "payment-initialize",
    rateLimitIdentity(request, user.id),
    5,
    60,
  );
  if (rateLimit) return rateLimit;

  const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!baseUrl || !secretKey) {
    return NextResponse.json(
      { error: "Payment service is not configured" },
      { status: 503 },
    );
  }
  try {
    if (new URL(request.headers.get("origin") || "").origin !== new URL(baseUrl).origin) {
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
  const planId = isRecord(body.value) ? body.value.planId : null;
  if (planId !== "Pro" && planId !== "Elite") {
    return NextResponse.json({ error: "Choose a valid plan" }, { status: 400 });
  }

  const plan = PLANS.find((item) => item.id === planId);
  if (!plan?.price || !Number.isSafeInteger(plan.price)) {
    return NextResponse.json({ error: "Plan is unavailable" }, { status: 400 });
  }

  const reference = `usif_${randomUUID().replace(/-/g, "")}`;
  const amountKobo = plan.price * 100;
  let admin;
  try {
    admin = createAdminClient();
    const { error } = await admin.from("membership_payments").insert({
      reference,
      user_id: user.id,
      plan_id: plan.id,
      amount_kobo: amountKobo,
      currency: "NGN",
    });
    if (error) {
      console.error("Unable to create payment record:", error.message);
      return NextResponse.json(
        { error: "Unable to start checkout" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Payment service is unavailable:", error);
    return NextResponse.json(
      { error: "Payment service is unavailable" },
      { status: 503 },
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountKobo,
        currency: "NGN",
        reference,
        callback_url: new URL("/membership/verify", baseUrl).toString(),
        metadata: {
          plan_id: plan.id,
          user_id: user.id,
          cancel_action: new URL("/membership", baseUrl).toString(),
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error("Paystack checkout initialization failed:", error);
    return NextResponse.json(
      { error: "Unable to reach the payment provider. Please retry." },
      { status: 502 },
    );
  }

  const responseBody = await readBoundedText(response, 64_000);
  let result: unknown = null;
  try {
    result = responseBody === null ? null : JSON.parse(responseBody);
  } catch {
    result = null;
  }
  if (
    !response.ok ||
    !isRecord(result) ||
    result.status !== true ||
    !isRecord(result.data) ||
    typeof result.data.authorization_url !== "string" ||
    result.data.reference !== reference
  ) {
    console.error("Paystack rejected checkout initialization:", response.status);
    const { error } = await admin
      .from("membership_payments")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("reference", reference)
      .eq("status", "pending");
    if (error) {
      console.error("Unable to mark payment as failed:", error.message);
    }
    return NextResponse.json(
      { error: "The payment provider could not start checkout" },
      { status: 502 },
    );
  }

  return NextResponse.json({ authorizationUrl: result.data.authorization_url });
}
