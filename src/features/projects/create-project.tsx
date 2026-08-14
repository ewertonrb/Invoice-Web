"use client";

import { useRouter } from "next/navigation";
import { ProjectForm } from "./project-form";
import { useCreateProject } from "./hooks";

export function CreateProject({ companyId }: { companyId: number }) {
  const router = useRouter();
  const mutation = useCreateProject(companyId);
  return <ProjectForm submitLabel="Create project" pending={mutation.isPending} serverError={mutation.error} onSubmit={(values) => mutation.mutate(values, { onSuccess: (project) => router.push(`/projects/${project.id}`) })} />;
}
