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

const signUpSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type SignUpValues = z.infer<typeof signUpSchema>;

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn?: () => void;
  callbackUrl?: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
}

export function SignUpModal({ open, onOpenChange, onSwitchToSignIn, callbackUrl = "/" }: SignUpModalProps): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: SignUpValues): Promise<void> {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });
    const data = (await response.json()) as SignupResponse;

    if (!response.ok || !data.success) {
      form.setError("root", { message: data.message || "Unable to create account" });
      return;
    }

    const signInResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl
    });

    if (signInResult?.error) {
      toast({ title: "Account created", description: "Please sign in with your new credentials.", variant: "success" });
      onSwitchToSignIn?.();
      return;
    }

    toast({ title: "Account created", description: "You are signed in and ready to post.", variant: "success" });
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
          <DialogTitle>Create your Trust News account</DialogTitle>
          <DialogDescription>Submit news for editorial approval in a few steps.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="signup-name">Name</Label>
            <Input id="signup-name" autoComplete="name" {...form.register("name")} />
            {form.formState.errors.name ? <p className="text-sm text-red-600">{form.formState.errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input id="signup-email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? <p className="text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input id="signup-password" type="password" autoComplete="new-password" {...form.register("password")} />
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
            Sign Up
          </Button>
        </form>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
          {isGoogleLoading ? <Spinner /> : <FcGoogle className="h-5 w-5" />}
          Continue with Google
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button type="button" className="font-semibold text-blue-600 hover:underline dark:text-blue-400" onClick={onSwitchToSignIn}>
            Sign in
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
