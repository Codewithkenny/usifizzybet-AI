"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { usifizzyClient } from "@/api/usifizzyClient"; // Clean native import
import { appParams } from "@/lib/app-params";

interface UserProfile {
  id: string | number;
  email: string;
  display_name?: string | null;
  full_name?: string | null;
  role?: string;
  [key: string]: any;
}

interface AuthErrorType {
  type: string;
  message: string;
}

interface AppPublicSettings {
  id: string | number;
  public_settings?: any;
  [key: string]: any;
}

interface AuthContextInterface {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: AuthErrorType | null;
  appPublicSettings: AppPublicSettings | null;
  authChecked: boolean;
  logout: (shouldRedirect?: boolean) => void;
  navigateToLogin: (returnTo?: string) => void;
  checkUserAuth: () => Promise<void>;
  checkAppState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] =
    useState<boolean>(true);
  const [authError, setAuthError] = useState<AuthErrorType | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [appPublicSettings, setAppPublicSettings] =
    useState<AppPublicSettings | null>(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      try {
        const publicSettings = await usifizzyClient.app.getPublicSettings();
        setAppPublicSettings(publicSettings);

        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError: any) {
        console.error("App state check failed:", appError);

        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === "auth_required") {
            setAuthError({
              type: "auth_required",
              message: "Authentication required",
            });
          } else if (reason === "user_not_registered") {
            setAuthError({
              type: "user_not_registered",
              message: "User not registered for this app",
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message || "Access Forbidden",
            });
          }
        } else {
          setAuthError({
            type: "unknown",
            message: appError.message || "Failed to load app",
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error: any) {
      console.error("Unexpected error during initialization:", error);
      setAuthError({
        type: "unknown",
        message: error.message || "An unexpected error occurred",
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await usifizzyClient.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error: any) {
      console.error("User auth check failed:", error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);

      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: "auth_required",
          message: "Authentication required",
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    if (typeof window !== "undefined") {
      if (shouldRedirect) {
        usifizzyClient.auth.logout(window.location.href);
      } else {
        usifizzyClient.auth.logout();
      }
    }
  };

  const navigateToLogin = (returnTo?: string) => {
    if (typeof window === "undefined") return;

    const safeReturnTo = returnTo && returnTo.startsWith("/") ? returnTo : "/";

    const loginUrl = new URL("/auth/login", window.location.origin);
    loginUrl.searchParams.set("returnTo", safeReturnTo);

    window.location.href = loginUrl.toString();
  };
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
