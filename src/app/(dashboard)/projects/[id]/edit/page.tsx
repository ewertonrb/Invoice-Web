import { notFound, redirect } from "next/navigation";
import { EditProject } from "@/features/projects/edit-project";
import { BackLink, PageHeader } from "@/features/projects/ui";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const company = session?.activeCompany;
  if (!company) redirect("/select-company");
  if (!can(company.role, "projects:manage")) redirect("/dashboard");
  const projectId = Number((await params).id);
  if (!Number.isSafeInteger(projectId) || projectId <= 0) notFound();
  return <div className="mx-auto max-w-4xl"><BackLink href={`/projects/${projectId}`} /><div className="mt-5"><PageHeader eyebrow="Project management" title="Edit project" description="Update the project name for the active company." /></div><EditProject companyId={company.companyId} projectId={projectId} /></div>;
}
