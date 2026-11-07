"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { href: "/picks", label: "Today's picks" },
  { href: "/safe-bets", label: "SafeBets" },
  { href: "/results", label: "Results" },
  { href: "/membership", label: "Membership" },
  { href: "/faq", label: "FAQ" },
];

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary font-display text-sm font-bold text-primary-foreground">
        U
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
        usiffizybet
        <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
          AI
        </span>
      </span>
    </Link>
  );
}

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname(); // Native Next.js path tracker

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return `text-[13px] transition-colors lg:text-sm ${
      isActive
        ? "text-foreground font-medium"
        : "text-muted-foreground hover:text-foreground"
    }`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Brand />
        <nav className="hidden items-center gap-4 md:flex lg:gap-5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={getLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex lg:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border font-display text-xs font-semibold text-foreground bg-background"
                >
                  {(user.display_name || user.full_name || user.email || "M")
                    .charAt(0)
                    .toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="font-display font-semibold">
                <Link href="/register">Unlock picks</Link>
              </Button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border px-5 pb-5 pt-3 md:hidden bg-background">
          <div className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground"
              >
                Profile
              </Link>
            )}
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground"
              >
                Dashboard
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground"
              >
                Admin dashboard
              </Link>
            )}
            <div className="mt-2 flex gap-2">
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="flex-1"
                >
                  Log out
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link href="/register">Unlock picks</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
