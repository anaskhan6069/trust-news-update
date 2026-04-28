"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function useAuth() {
  const session = useSession();

  return {
    session: session.data,
    user: session.data?.user,
    status: session.status,
    isAuthenticated: session.status === "authenticated",
    isLoading: session.status === "loading",
    signIn,
    signOut
  };
}
