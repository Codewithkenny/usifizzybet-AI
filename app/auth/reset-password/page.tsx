"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      router.push("/login");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to reset password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Lock}
      title="New password"
      subtitle="Enter your new password below"
      footer={
        <Link
          href="/forgot-password"
          className="text-primary font-medium hover:underline"
        >
          Request another reset link
        </Link>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button
          type="submit"
          className="h-12 w-full font-medium"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
