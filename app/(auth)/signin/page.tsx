"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInModal } from "@/components/auth/SignInModal";
import { SignUpModal } from "@/components/auth/SignUpModal";

export default function SignInPage(): JSX.Element {
  return (
    <React.Suspense fallback={<AuthPageShell message="Sign in to continue." />}>
      <SignInPageContent />
    </React.Suspense>
  );
}

function AuthPageShell({ message }: { message: string }): JSX.Element {
  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="max-w-md text-center blur-sm">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-brand-red">Trust</span> News
          </h1>
          <p className="mt-3 text-gray-700 dark:text-gray-300">{message}</p>
        </div>
      </div>
    </div>
  );
}

function SignInPageContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [signInOpen, setSignInOpen] = React.useState(true);
  const [signUpOpen, setSignUpOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="max-w-md text-center blur-sm">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-brand-red">Trust</span> News
          </h1>
          <p className="mt-3 text-gray-700 dark:text-gray-300">Sign in to continue.</p>
        </div>
      </div>
      <SignInModal
        open={signInOpen}
        callbackUrl={callbackUrl}
        onOpenChange={(open) => {
          setSignInOpen(open);
          if (!open) {
            router.push("/");
          }
        }}
        onSwitchToSignUp={() => {
          setSignInOpen(false);
          setSignUpOpen(true);
        }}
      />
      <SignUpModal
        open={signUpOpen}
        callbackUrl={callbackUrl}
        onOpenChange={(open) => {
          setSignUpOpen(open);
          if (!open) {
            router.push("/");
          }
        }}
        onSwitchToSignIn={() => {
          setSignUpOpen(false);
          setSignInOpen(true);
        }}
      />
    </div>
  );
}
