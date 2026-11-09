import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMembership, hasActiveMembership } from "@/lib/membership";
import {
  enforceRateLimit,
  rateLimitIdentity,
} from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rateLimit = await enforceRateLimit(
    request,
    "membership-status",
    rateLimitIdentity(request, user?.id),
    60,
    60,
  );
  if (rateLimit) return rateLimit;

  if (!user) {
    return NextResponse.json({
      planId: "Free",
      active: false,
      currentPeriodEnd: null,
    });
  }

  try {
    const membership = await getMembership(user.id);
    const active = hasActiveMembership(membership);
    return NextResponse.json({
      planId: active ? membership?.plan_id : "Free",
      active,
      currentPeriodEnd: active ? membership?.current_period_end : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Membership service is unavailable" },
      { status: 503 },
    );
  }
}
