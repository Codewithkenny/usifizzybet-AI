"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import AppStateGuard from "@/components/AppStateGuard";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppStateGuard>{children}</AppStateGuard>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
