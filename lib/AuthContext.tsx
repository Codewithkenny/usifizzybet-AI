"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usifizzyClient } from "@/api/usifizzyClient";
import { createClient } from "@/lib/supabase/client";
import { safeReturnToPath } from "@/lib/authReturnTo";

interface UserProfile {
  id: string;
  email: string;
  display_name?: string | null;
  full_name?: string | null;
  username?: string;
  avatar_url?: string;
  notify_daily_picks?: boolean;
  notify_result_alerts?: boolean;
  notify_weekly_digest?: boolean;
  role?: string;
}

interface AuthErrorType {
  type: string;
  message: string;
}

interface AppPublicSettings {
  id: string | number;
  public_settings?: Record<string, unknown>;
}

interface AuthContextInterface {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: AuthErrorType | null;
  appPublicSettings: AppPublicSettings | null;
  authChecked: boolean;
  logout: (shouldRedirect?: boolean) => Promise<void>;
  navigateToLogin: (returnTo?: string) => void;
  checkUserAuth: () => Promise<void>;
  checkAppState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }
  return undefined;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState<AuthErrorType | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] =
    useState<AppPublicSettings | null>(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await usifizzyClient.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      const status = getErrorStatus(error);
      if (status !== 401 && status !== 403) {
        console.error("User auth check failed:", error);
      }
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(
        status === 401 || status === 403
          ? {
              type: "auth_required",
              message: "Authentication required",
            }
          : {
              type: "unknown",
              message: getErrorMessage(error, "Unable to verify your account"),
            },
      );
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const checkAppState = useCallback(async () => {
    setIsLoadingPublicSettings(true);
    try {
      const publicSettings = await usifizzyClient.app.getPublicSettings();
      setAppPublicSettings(publicSettings);
      await checkUserAuth();
    } catch (error) {
      console.error("App state check failed:", error);
      setAuthError({
        type: "unknown",
        message: getErrorMessage(error, "Failed to load app settings"),
      });
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } finally {
      setIsLoadingPublicSettings(false);
    }
  }, [checkUserAuth]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser((currentUser) => ({
          ...currentUser,
          id: session.user.id,
          email: session.user.email ?? "",
        }));
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: "auth_required",
          message: "Authentication required",
        });
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    void checkAppState();
    return () => subscription.unsubscribe();
  }, [checkAppState]);

  const logout = useCallback(async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    try {
      if (typeof window !== "undefined") {
        await usifizzyClient.auth.logout(
          shouldRedirect ? window.location.href : undefined,
        );
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthError({
        type: "logout_failed",
        message: getErrorMessage(error, "Unable to log out"),
      });
    }
  }, []);

  const navigateToLogin = useCallback((returnTo?: string) => {
    if (typeof window === "undefined") return;
    const safeReturnTo = safeReturnToPath(returnTo ?? "/");
    const loginUrl = new URL("/auth/login", window.location.origin);
    loginUrl.searchParams.set("returnTo", safeReturnTo);
    window.location.href = loginUrl.toString();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextInterface => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
