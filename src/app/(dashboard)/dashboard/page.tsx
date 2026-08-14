import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/error";
import { getSession } from "@/lib/auth/server";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
export default async function DashboardPage() { let session; try { session = await getSession(); } catch (error) { if (error instanceof ApiError && error.status === 401) redirect("/api/auth/clear-session"); throw error; } if (!session?.activeCompany) redirect("/select-company"); return <DashboardOverview companyId={session.activeCompany.companyId} role={session.activeCompany.role} userName={session.user.name} />; }
