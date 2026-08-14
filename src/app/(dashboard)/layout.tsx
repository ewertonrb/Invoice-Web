import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { ApiError } from "@/lib/api/error";
import { getSession } from "@/lib/auth/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await getSession();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/clear-session");
    }
    throw error;
  }
  if (!session) redirect("/login");
  if (!session.activeCompany) redirect("/select-company");
  return <AppShell session={session}>{children}</AppShell>;
}
