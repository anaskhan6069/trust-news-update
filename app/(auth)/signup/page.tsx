"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInModal } from "@/components/auth/SignInModal";
import { SignUpModal } from "@/components/auth/SignUpModal";

export default function SignUpPage(): JSX.Element {
  return (
    <React.Suspense fallback={<AuthPageShell message="Create an account to submit stories." />}>
      <SignUpPageContent />
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

function SignUpPageContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [signInOpen, setSignInOpen] = React.useState(false);
  const [signUpOpen, setSignUpOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="max-w-md text-center blur-sm">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-brand-red">Trust</span> News
          </h1>
          <p className="mt-3 text-gray-700 dark:text-gray-300">Create an account to submit stories.</p>
        </div>
      </div>
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
    </div>
  );
}
