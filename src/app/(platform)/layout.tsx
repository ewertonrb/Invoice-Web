import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/error";
import { getSession } from "@/lib/auth/server";
import { isPlatformAdmin } from "@/lib/auth/types";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  try {
    const session = await getSession();
    if (!session) redirect("/login");
    if (!isPlatformAdmin(session)) redirect(session.activeCompany ? "/dashboard" : "/select-company");
    return <>{children}</>;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/api/auth/clear-session");
    throw error;
  }
}
