"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const adminLoginSchema = z.object({
  email: z.string().email("Enter the admin email"),
  password: z.string().min(1, "Password is required")
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage(): JSX.Element {
  const router = useRouter();
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: AdminLoginValues): Promise<void> {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      adminLogin: "true",
      redirect: false,
      callbackUrl: "/admin/dashboard"
    });

    if (result?.error) {
      form.setError("root", { message: "Wrong admin email or password" });
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-secondary/40">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-red text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Use the credentials configured in your environment variables.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" autoComplete="email" {...form.register("email")} />
                {form.formState.errors.email ? <p className="text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" autoComplete="current-password" {...form.register("password")} />
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
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
