"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";

function buildReturnTo(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  params.delete("returnTo");

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function AppStateGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } =
    useAuth();

  const pathname = usePathname();

  // FIXED: Expanded the whitelist check so guests can freely browse your main product slates
  const isPublicPage =
    pathname === "/" ||
    pathname === "/picks" ||
    pathname === "/safe-bets" ||
    pathname === "/results" ||
    pathname === "/membership" ||
    pathname === "/faq" ||
    pathname === "/auth/login" ||
    pathname.startsWith("/auth/");

  React.useEffect(() => {
    if (isPublicPage) return;

    if (
      !isLoadingPublicSettings &&
      !isLoadingAuth &&
      authError?.type === "auth_required"
    ) {
      const returnTo = buildReturnTo(
        pathname,
        typeof window === "undefined" ? "" : window.location.search,
      );

      navigateToLogin(returnTo);
    }
  }, [
    isPublicPage,
    isLoadingPublicSettings,
    isLoadingAuth,
    authError,
    pathname,
    navigateToLogin,
  ]);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
      </div>
    );
  }

  if (authError?.type === "user_not_registered") {
    return <UserNotRegisteredError />;
  }

  if (!isPublicPage && authError?.type === "auth_required") {
    return null;
  }

  return <>{children}</>;
}
