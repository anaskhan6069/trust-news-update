"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, PenSquare, UserRound } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { SignInModal } from "@/components/auth/SignInModal";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/utils";

export function Header(): JSX.Element {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [signInOpen, setSignInOpen] = React.useState(false);
  const [signUpOpen, setSignUpOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const displayName = user?.name ?? "Reader";

  function openSignIn(): void {
    setSignUpOpen(false);
    setSignInOpen(true);
  }

  function openSignUp(): void {
    setSignInOpen(false);
    setSignUpOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight">
            <span className="text-brand-red">Trust</span>
            <span className="text-brand-black dark:text-white">News</span>
          </Link>

          <div className="hidden md:block">
            <Navbar />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {!isLoading && !isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={openSignIn}>
                  Sign In
                </Button>
                <Button onClick={openSignUp}>Sign Up</Button>
              </>
            ) : null}
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 rounded-md px-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image ?? ""} alt={displayName} />
                    <AvatarFallback>{initials(displayName)}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-32 truncate text-sm font-semibold">{displayName}</span>
                </div>
                <Button asChild>
                  <Link href="/post-news">
                    <PenSquare className="h-4 w-4" />
                    Post News
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => void signOut({ callbackUrl: "/" })}>
                  Sign Out
                </Button>
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="rounded-b-lg">
                <SheetHeader>
                  <SheetTitle>
                    <span className="text-brand-red">Trust</span> News
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 grid gap-6">
                  <Navbar orientation="vertical" onNavigate={() => setMobileOpen(false)} />
                  {isAuthenticated && user ? (
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 rounded-md border p-3">
                        <Avatar>
                          <AvatarImage src={user.image ?? ""} alt={displayName} />
                          <AvatarFallback>{initials(displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button asChild onClick={() => setMobileOpen(false)}>
                        <Link href="/post-news">
                          <PenSquare className="h-4 w-4" />
                          Post News
                        </Link>
                      </Button>
                      <Button variant="outline" onClick={() => void signOut({ callbackUrl: "/" })}>
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMobileOpen(false);
                          openSignIn();
                        }}
                      >
                        <UserRound className="h-4 w-4" />
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          setMobileOpen(false);
                          openSignUp();
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} onSwitchToSignUp={openSignUp} />
      <SignUpModal open={signUpOpen} onOpenChange={setSignUpOpen} onSwitchToSignIn={openSignIn} />
    </>
  );
}
