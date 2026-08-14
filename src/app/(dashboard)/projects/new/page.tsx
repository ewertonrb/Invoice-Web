import { redirect } from "next/navigation";
import { CreateProject } from "@/features/projects/create-project";
import { BackLink, PageHeader } from "@/features/projects/ui";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";

export default async function NewProjectPage() {
  const session = await getSession();
  const company = session?.activeCompany;
  if (!company) redirect("/select-company");
  if (!can(company.role, "projects:manage")) redirect("/dashboard");
  return <div className="mx-auto max-w-4xl"><BackLink /><div className="mt-5"><PageHeader eyebrow="Project management" title="Create project" description="Add a project to the active company." /></div><CreateProject companyId={company.companyId} /></div>;
}
