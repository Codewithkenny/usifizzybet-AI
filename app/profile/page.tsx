"use client";

import { useAuth } from "@/lib/AuthContext";
import AccountDetailsForm from "@/components/profile/AccountDetailsForm";
import MembershipCard from "@/components/profile/MembershipCard";
import NotificationPrefs from "@/components/profile/NotificationPrefs";
import { planById } from "@/lib/plans";
import { useMembership } from "@/hooks/useMembership";

export default function ProfilePage() {
  const { user } = useAuth();
  const membership = useMembership();
  const plan = planById(membership.active ? membership.planId : "Free");

  return (
    <section className="mx-auto max-w-4xl px-5 py-14 md:py-20">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-3 font-display text-4xl font-medium text-foreground">
        Profile
      </h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <AccountDetailsForm user={user} />
        <MembershipCard
          plan={plan}
          subscription={
            membership.active
              ? {
                  status: "active",
                  current_period_end: membership.currentPeriodEnd ?? undefined,
                }
              : null
          }
        />
        <NotificationPrefs user={user} />
      </div>
    </section>
  );
}
