import { notFound, redirect } from "next/navigation";
import { CompanyDetail } from "@/features/companies/company-detail";
import { BackLink, PageHeader } from "@/features/companies/ui";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const active = session?.activeCompany;
  if (!active) redirect("/select-company");
  if (!can(active.role, "company:manage")) redirect("/dashboard");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0 || id !== active.companyId) notFound();
  return <div className="mx-auto max-w-5xl"><BackLink /><div className="mt-5"><PageHeader eyebrow="Company management" title="Company details" description="Review contact details, operational status, and the contractor GST policy." /></div><CompanyDetail companyId={id} /></div>;
}
