"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VerificationState =
  | { status: "loading" }
  | { status: "success"; planId: string; currentPeriodEnd: string }
  | { status: "error"; message: string };

export default function MembershipVerificationPage() {
  const [state, setState] = useState<VerificationState>({ status: "loading" });

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference")
      || new URLSearchParams(window.location.search).get("trxref");
    if (!reference) {
      setState({
        status: "error",
        message: "We couldn't find a payment reference. Please check your account.",
      });
      return;
    }

    fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(async (response) => {
        const result: unknown = await response.json();
        if (
          !response.ok ||
          !result ||
          typeof result !== "object" ||
          !("planId" in result) ||
          typeof result.planId !== "string" ||
          !("currentPeriodEnd" in result) ||
          typeof result.currentPeriodEnd !== "string"
        ) {
          const message =
            result &&
            typeof result === "object" &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "We couldn't verify the payment";
          throw new Error(message);
        }
        setState({
          status: "success",
          planId: result.planId,
          currentPeriodEnd: result.currentPeriodEnd,
        });
      })
      .catch((error: unknown) => {
        console.error("Payment callback verification failed:", error);
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "We couldn't verify the payment",
        });
      });
  }, []);

  return (
    <section className="mx-auto max-w-2xl px-5 py-20 text-center">
      <p className="eyebrow">Membership checkout</p>
      {state.status === "loading" ? (
        <>
          <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">
            Confirming your payment
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please keep this page open while Paystack confirms the transaction.
          </p>
        </>
      ) : state.status === "success" ? (
        <>
          <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">
            Your {state.planId} access is active
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Access ends {new Date(state.currentPeriodEnd).toLocaleDateString("en-NG")}.
            Renew manually whenever you are ready.
          </p>
          <Link
            href="/profile"
            className="mt-7 inline-flex rounded-full bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground"
          >
            View my membership
          </Link>
        </>
      ) : (
        <>
          <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">
            Payment not confirmed
          </h1>
          <p role="alert" className="mt-3 text-sm text-muted-foreground">
            {state.message}
          </p>
          <Link
            href="/membership"
            className="mt-7 inline-flex rounded-full border border-border px-5 py-2.5 font-display text-sm text-foreground"
          >
            Return to membership
          </Link>
        </>
      )}
    </section>
  );
}
