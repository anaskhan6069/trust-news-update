import { redirect } from "next/navigation";
import { DashboardClient } from "@/app/admin/dashboard/DashboardClient";
import { auth } from "@/lib/auth";

export default async function AdminDashboardPage(): Promise<JSX.Element> {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect("/admin/login");
  }

  return <DashboardClient />;
}
