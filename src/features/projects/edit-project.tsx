"use client";

import { useRouter } from "next/navigation";
import { ProjectForm } from "./project-form";
import { ProjectError } from "./ui";
import { useProject, useUpdateProject } from "./hooks";

export function EditProject({ companyId, projectId }: { companyId: number; projectId: number }) {
  const router = useRouter();
  const project = useProject(companyId, projectId);
  const mutation = useUpdateProject(companyId, projectId);
  if (project.isPending) return <div aria-label="Loading project" className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (project.isError) return <div className="mt-8"><ProjectError message={project.error instanceof Error ? project.error.message : "Please try again."} retry={() => project.refetch()} /></div>;
  return <ProjectForm defaultValues={{ name: project.data.name }} submitLabel="Save changes" pending={mutation.isPending} serverError={mutation.error} onSubmit={(values) => mutation.mutate(values, { onSuccess: () => router.push(`/projects/${projectId}`) })} />;
}
