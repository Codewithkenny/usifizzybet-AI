"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface UserProfileData {
  display_name?: string | null;
  full_name?: string | null;
  email?: string | null;
}

interface AccountDetailsFormProps {
  user: UserProfileData | null | undefined;
}

export default function AccountDetailsForm({ user }: AccountDetailsFormProps) {
  const [displayName, setDisplayName] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    setDisplayName(user?.display_name || user?.full_name || "");
  }, [user?.display_name, user?.full_name]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await base44.auth.updateMe({ display_name: displayName.trim() });
      setSaved(true);
    } catch (error) {
      console.error("Failed to update profile metrics:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <p className="eyebrow">Account details</p>
      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="display_name"
            className="text-xs text-muted-foreground"
          >
            Display name
          </Label>
          <Input
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How your name appears"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            value={user?.email || ""}
            readOnly
            className="text-muted-foreground"
          />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button
          onClick={save}
          disabled={saving}
          className="font-display font-semibold"
        >
          {saving ? "Saving…" : "Save details"}
        </Button>
        {saved && <span className="text-xs text-primary">Saved</span>}
      </div>
    </section>
  );
}
