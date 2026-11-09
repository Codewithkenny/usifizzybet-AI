"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import type { PlanId } from "@/lib/plans";

interface CheckoutButtonProps {
  planId: PlanId;
  label: string;
}

export default function CheckoutButton({
  planId,
  label,
}: CheckoutButtonProps) {
  const { user, isLoadingAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (planId === "Free") {
    return (
      <Button className="mt-6 w-full font-display font-semibold" asChild>
        <Link href="/register">Create free account</Link>
      </Button>
    );
  }

  if (!user && !isLoadingAuth) {
    return (
      <Button className="mt-6 w-full font-display font-semibold" asChild>
        <Link href="/register?returnTo=%2Fmembership">
          Sign in to choose {planId}
        </Link>
      </Button>
    );
  }

  const startCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const result: unknown = await response.json();
      if (
        !response.ok ||
        !result ||
        typeof result !== "object" ||
        !("authorizationUrl" in result) ||
        typeof result.authorizationUrl !== "string"
      ) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to start checkout";
        throw new Error(message);
      }

      const checkoutUrl = new URL(result.authorizationUrl);
      if (
        checkoutUrl.protocol !== "https:" ||
        checkoutUrl.hostname !== "checkout.paystack.com"
      ) {
        throw new Error("Payment provider returned an invalid checkout URL");
      }
      window.location.assign(checkoutUrl.toString());
    } catch (checkoutError) {
      console.error("Unable to start membership checkout:", checkoutError);
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <Button
        className="w-full font-display font-semibold"
        onClick={startCheckout}
        disabled={loading || isLoadingAuth}
      >
        {loading ? "Connecting to Paystack…" : label}
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-xs leading-relaxed text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
