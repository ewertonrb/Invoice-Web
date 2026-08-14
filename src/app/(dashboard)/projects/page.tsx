import { redirect } from "next/navigation";
import { ProjectList } from "@/features/projects/project-list";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";

export default async function ProjectsPage() {
  const session = await getSession();
  const company = session?.activeCompany;
  if (!company) redirect("/select-company");
  if (!can(company.role, "projects:manage")) redirect("/dashboard");
  return <ProjectList companyId={company.companyId} />;
}
