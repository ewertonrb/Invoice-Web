import { redirect } from "next/navigation";
import { CompanyList } from "@/features/companies/company-list";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";

export default async function CompaniesPage() {
  const session = await getSession();
  const company = session?.activeCompany;
  if (!company) redirect("/select-company");
  if (!can(company.role, "company:manage")) redirect("/dashboard");
  return <CompanyList companyId={company.companyId} />;
}
