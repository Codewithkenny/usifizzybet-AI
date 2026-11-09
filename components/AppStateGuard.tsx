"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import BrandLoader from "@/components/BrandLoader";

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
  const [publicStartupElapsed, setPublicStartupElapsed] = React.useState(false);

  // FIXED: Expanded the whitelist check so guests can freely browse your main product slates
  const isPublicPage =
    pathname === "/" ||
    pathname === "/picks" ||
    pathname === "/safe-bets" ||
    pathname === "/results" ||
    pathname === "/membership" ||
    pathname === "/faq" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/auth/login" ||
    pathname.startsWith("/auth/");

  React.useEffect(() => {
    const timer = window.setTimeout(() => setPublicStartupElapsed(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

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

  if (
    (!isPublicPage && (isLoadingPublicSettings || isLoadingAuth)) ||
    (isPublicPage && !publicStartupElapsed)
  ) {
    return <BrandLoader />;
  }

  if (authError?.type === "user_not_registered") {
    return <UserNotRegisteredError />;
  }

  if (!isPublicPage && authError?.type === "auth_required") {
    return null;
  }

  if (!isPublicPage && authError) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-xl px-5 py-20 text-center text-sm text-destructive"
      >
        {authError.message}
      </div>
    );
  }

  return <>{children}</>;
}
