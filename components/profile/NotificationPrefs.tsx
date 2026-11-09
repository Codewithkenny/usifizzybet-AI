"use client"; // Required since we manage switch toggles and stateful API client calls

import * as React from "react";
import { useEffect, useState } from "react";
import { usifizzyClient } from "@/api/usifizzyClient";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface NotificationOption {
  key: "notify_daily_picks" | "notify_result_alerts" | "notify_weekly_digest";
  label: string;
  hint: string;
}

const OPTIONS: NotificationOption[] = [
  {
    key: "notify_daily_picks",
    label: "Daily slate",
    hint: "When new picks for the day go live.",
  },
  {
    key: "notify_result_alerts",
    label: "Result alerts",
    hint: "When a pick is graded won or lost.",
  },
  {
    key: "notify_weekly_digest",
    label: "Weekly digest",
    hint: "A weekly summary of the model's record.",
  },
];

interface UserNotificationData {
  notify_daily_picks?: boolean | null;
  notify_result_alerts?: boolean | null;
  notify_weekly_digest?: boolean | null;
}

interface NotificationPrefsProps {
  user: UserNotificationData | null | undefined;
}

type PrefsState = Record<NotificationOption["key"], boolean>;

export default function NotificationPrefs({ user }: NotificationPrefsProps) {
  const [prefs, setPrefs] = useState<PrefsState>({
    notify_daily_picks: true,
    notify_result_alerts: true,
    notify_weekly_digest: false,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setPrefs({
      notify_daily_picks: user?.notify_daily_picks !== false,
      notify_result_alerts: user?.notify_result_alerts !== false,
      notify_weekly_digest: user?.notify_weekly_digest === true,
    });
  }, [
    user?.notify_daily_picks,
    user?.notify_result_alerts,
    user?.notify_weekly_digest,
  ]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setErrorMessage("");
    try {
      await usifizzyClient.auth.updateMe(prefs);
      setSaved(true);
    } catch (error) {
      console.error("Failed to update notification parameters:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save preferences",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <p className="eyebrow">Notifications</p>
      <div className="mt-4 space-y-4">
        {OPTIONS.map((option) => (
          <div
            key={option.key}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {option.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {option.hint}
              </p>
            </div>
            <Switch
              checked={!!prefs[option.key]}
              onCheckedChange={(value) =>
                setPrefs((prev) => ({ ...prev, [option.key]: value }))
              }
              aria-label={option.label}
            />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button
          onClick={save}
          disabled={saving}
          className="font-display font-semibold"
        >
          {saving ? "Saving…" : "Save preferences"}
        </Button>
        {saved && <span className="text-xs text-primary">Saved</span>}
      </div>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
