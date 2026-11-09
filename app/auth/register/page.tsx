"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithGoogle, registerWithEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { session } = await registerWithEmail(email, password);
      if (session) {
        router.push(returnTo);
      } else {
        setConfirmationSent(true);
      }
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle(returnTo);
    } catch (oauthError) {
      setError(
        oauthError instanceof Error
          ? oauthError.message
          : "Unable to sign in with Google",
      );
    }
  };

  const loginPath =
    "/login" +
    (returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : "");

  return (
    <AuthLayout
      icon={confirmationSent ? Mail : UserPlus}
      title={confirmationSent ? "Check your email" : "Create your account"}
      subtitle={
        confirmationSent
          ? `Use the confirmation link we sent to ${email}.`
          : "Sign up to get started"
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={loginPath}
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      {confirmationSent ? (
        <p className="text-center text-sm text-muted-foreground">
          Once your email is confirmed, you can log in and access your account.
        </p>
      ) : (
        <>
          <Button
            variant="outline"
            className="mb-6 h-12 w-full text-sm font-medium"
            onClick={handleGoogle}
            type="button"
          >
            <GoogleIcon className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">or</span>
            </div>
          </div>

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
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-12 pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="h-12 w-full font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
