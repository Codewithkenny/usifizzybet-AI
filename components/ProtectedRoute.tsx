"use client"; // Added client boundary since we use useEffect and navigation hooks

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Correct Next.js 14 navigation hook
import { useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";

interface ProtectedRouteProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({
  fallback = <DefaultFallback />,
  children,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoadingAuth,
    authChecked,
    authError,
    checkUserAuth,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  useEffect(() => {
    // Handle unauthenticated state redirects cleanly via the router matrix
    if (authChecked && !isLoadingAuth) {
      if (
        !isAuthenticated ||
        (authError && authError.type !== "user_not_registered")
      ) {
        router.replace("/login");
      }
    }
  }, [authChecked, isLoadingAuth, isAuthenticated, authError, router]);

  // Show loading spine while validation completes
  if (isLoadingAuth || !authChecked) {
    return <>{fallback}</>;
  }

  // Handle specific user status errors
  if (authError && authError.type === "user_not_registered") {
    return <UserNotRegisteredError />;
  }

  // Final validation checkpoint block
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>; // Replaces <Outlet /> to seamlessly render nested routes
}
