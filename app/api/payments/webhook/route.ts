import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  fulfillPaystackPayment,
  verifyPaystackPayment,
} from "@/lib/payments/paystack";
import { readBoundedText } from "@/lib/requestBody";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payment service is not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("x-paystack-signature");
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let rawBody: string | null;
  try {
    rawBody = await readBoundedText(request, 64_000);
  } catch (error) {
    console.error("Unable to read Paystack webhook body:", error);
    return NextResponse.json(
      { error: "Unable to read request body" },
      { status: 400 },
    );
  }
  if (rawBody === null) {
    return NextResponse.json({ error: "Request is too large" }, { status: 413 });
  }

  const expected = createHmac("sha512", secretKey).update(rawBody).digest();
  const supplied = Buffer.from(signature, "hex");
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
  }
  if (!isRecord(event) || event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }
  const data = event.data;
  const reference = isRecord(data) ? data.reference : null;
  if (typeof reference !== "string" || !/^usif_[a-f0-9]{32}$/.test(reference)) {
    return NextResponse.json({ error: "Invalid payment reference" }, { status: 400 });
  }

  try {
    const transaction = await verifyPaystackPayment(reference);
    await fulfillPaystackPayment(reference, transaction);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook processing failed:", error);
    return NextResponse.json(
      { error: "Unable to process payment event" },
      { status: 503 },
    );
  }
}
