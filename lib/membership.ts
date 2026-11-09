import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface Membership {
  plan_id: "Pro" | "Elite";
  status: "active" | "expired";
  current_period_end: string;
}

export async function getMembership(userId: string): Promise<Membership | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("membership_subscriptions")
    .select("plan_id, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Unable to load membership:", error.message);
    throw new Error("Membership service is unavailable");
  }

  if (
    !data ||
    (data.plan_id !== "Pro" && data.plan_id !== "Elite") ||
    (data.status !== "active" && data.status !== "expired") ||
    typeof data.current_period_end !== "string"
  ) {
    return null;
  }

  return data as Membership;
}

export function hasActiveMembership(membership: Membership | null): boolean {
  return Boolean(
    membership &&
      membership.status === "active" &&
      Date.parse(membership.current_period_end) > Date.now(),
  );
}
