"use client";

import { useEffect, useState } from "react";

interface MembershipState {
  planId: "Free" | "Pro" | "Elite";
  active: boolean;
  currentPeriodEnd: string | null;
  loading: boolean;
}

export function useMembership(): MembershipState {
  const [membership, setMembership] = useState<MembershipState>({
    planId: "Free",
    active: false,
    currentPeriodEnd: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    fetch("/api/membership/status", { cache: "no-store" })
      .then(async (response) => {
        const data: unknown = await response.json();
        if (!response.ok || !data || typeof data !== "object") {
          throw new Error("Unable to load membership status");
        }
        const result = data as Record<string, unknown>;
        if (
          (result.planId !== "Free" &&
            result.planId !== "Pro" &&
            result.planId !== "Elite") ||
          typeof result.active !== "boolean" ||
          (result.currentPeriodEnd !== null &&
            typeof result.currentPeriodEnd !== "string")
        ) {
          throw new Error("Membership status was invalid");
        }
        if (active) {
          setMembership({
            planId: result.planId,
            active: result.active,
            currentPeriodEnd: result.currentPeriodEnd,
            loading: false,
          });
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load membership status:", error);
        if (active) {
          setMembership({
            planId: "Free",
            active: false,
            currentPeriodEnd: null,
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return membership;
}
