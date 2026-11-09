import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { readBoundedText } from "@/lib/requestBody";

interface PaystackVerification {
  reference: string;
  transactionId: string;
  amountKobo: number;
  currency: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function verifyPaystackPayment(
  reference: string,
): Promise<PaystackVerification> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Paystack is not configured");

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    console.error("Paystack verification returned HTTP", response.status);
    throw new Error("Unable to verify payment with Paystack");
  }

  const body = await readBoundedText(response, 64_000);
  if (body === null) {
    throw new Error("Paystack verification response exceeded the size limit");
  }
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error("Paystack returned invalid JSON");
  }
  if (
    !isRecord(payload) ||
    payload.status !== true ||
    !isRecord(payload.data) ||
    payload.data.status !== "success" ||
    payload.data.reference !== reference ||
    typeof payload.data.id !== "number" ||
    !Number.isSafeInteger(payload.data.id) ||
    typeof payload.data.amount !== "number" ||
    !Number.isSafeInteger(payload.data.amount) ||
    typeof payload.data.currency !== "string"
  ) {
    throw new Error("Paystack did not confirm a successful payment");
  }

  return {
    reference,
    transactionId: String(payload.data.id),
    amountKobo: payload.data.amount,
    currency: payload.data.currency,
  };
}

export async function fulfillPaystackPayment(
  reference: string,
  transaction: PaystackVerification,
  ownerId?: string,
) {
  const admin = createAdminClient();
  let query = admin
    .from("membership_payments")
    .select("user_id, plan_id, amount_kobo, currency")
    .eq("reference", reference);
  if (ownerId) query = query.eq("user_id", ownerId);

  const { data: payment, error: paymentError } = await query.maybeSingle();
  if (paymentError) {
    console.error("Unable to load payment record:", paymentError.message);
    throw new Error("Unable to verify payment");
  }
  if (!payment) throw new Error("Payment reference not found");
  if (
    payment.amount_kobo !== transaction.amountKobo ||
    payment.currency !== transaction.currency
  ) {
    throw new Error("Verified payment amount does not match the order");
  }

  const { data, error } = await admin.rpc("fulfill_paystack_payment", {
    p_reference: reference,
    p_transaction_id: transaction.transactionId,
    p_amount_kobo: transaction.amountKobo,
    p_currency: transaction.currency,
  });
  if (error || !Array.isArray(data) || !data[0]) {
    console.error("Unable to activate membership:", error?.message);
    throw new Error("Unable to activate membership");
  }

  const membership = data[0] as {
    plan_id?: unknown;
    current_period_end?: unknown;
  };
  if (
    (membership.plan_id !== "Pro" && membership.plan_id !== "Elite") ||
    typeof membership.current_period_end !== "string"
  ) {
    throw new Error("Membership service returned an invalid response");
  }
  return membership;
}
