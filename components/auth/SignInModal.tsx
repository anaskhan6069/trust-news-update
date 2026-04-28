"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toaster";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

type SignInValues = z.infer<typeof signInSchema>;

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp?: () => void;
  callbackUrl?: string;
}

export function SignInModal({ open, onOpenChange, onSwitchToSignUp, callbackUrl = "/" }: SignInModalProps): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: SignInValues): Promise<void> {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl
    });

    if (result?.error) {
      form.setError("root", { message: "Invalid email or password" });
      return;
    }

    toast({ title: "Signed in", description: "Welcome back to Trust News.", variant: "success" });
    onOpenChange(false);
    router.push(callbackUrl);
    router.refresh();
  }

  function handleGoogleSignIn(): void {
    setIsGoogleLoading(true);
    void signIn("google", { callbackUrl });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to Trust News</DialogTitle>
          <DialogDescription>Use your account to post news and follow submissions.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input id="signin-email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input id="signin-password" type="password" autoComplete="current-password" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          {form.formState.errors.root ? (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Spinner /> : null}
            Sign In
          </Button>
        </form>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
          {isGoogleLoading ? <Spinner /> : <FcGoogle className="h-5 w-5" />}
          Continue with Google
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <button type="button" className="font-semibold text-blue-600 hover:underline dark:text-blue-400" onClick={onSwitchToSignUp}>
            Sign up
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
