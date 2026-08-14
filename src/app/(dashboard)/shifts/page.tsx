import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";
import { ShiftPage } from "@/features/shifts/shift-page";

export default async function ShiftsPage() {
  const session = await getSession();
  const company = session?.activeCompany;
  if (!company) redirect("/select-company");
  if (!can(company.role, "shifts:view")) redirect("/dashboard");
  return <ShiftPage companyId={company.companyId} canManage={can(company.role, "shifts:manage")} />;
}
