import { notFound, redirect } from "next/navigation";
import { EditCompany } from "@/features/companies/edit-company";
import { BackLink, PageHeader } from "@/features/companies/ui";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const active = session?.activeCompany;
  if (!active) redirect("/select-company");
  if (!can(active.role, "company:manage")) redirect("/dashboard");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0 || id !== active.companyId) notFound();
  return <div className="mx-auto max-w-4xl"><BackLink href={`/companies/${id}`} /><div className="mt-5"><PageHeader eyebrow="Company management" title="Edit company" description="Update company details and settings. Backend validation remains authoritative." /></div><EditCompany companyId={id} canEditActive={active.role === "ADMIN"} /></div>;
}
