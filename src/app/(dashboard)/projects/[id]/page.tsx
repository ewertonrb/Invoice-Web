import { notFound, redirect } from "next/navigation";
import { ProjectDetail } from "@/features/projects/project-detail";
import { BackLink, PageHeader } from "@/features/projects/ui";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const company = session?.activeCompany;
  if (!company) redirect("/select-company");
  if (!can(company.role, "projects:manage")) redirect("/dashboard");
  const projectId = Number((await params).id);
  if (!Number.isSafeInteger(projectId) || projectId <= 0) notFound();
  return <div className="mx-auto max-w-5xl"><BackLink /><div className="mt-5"><PageHeader eyebrow="Project management" title="Project details" description="Review the project overview and operational status." /></div><ProjectDetail companyId={company.companyId} projectId={projectId} /></div>;
}
