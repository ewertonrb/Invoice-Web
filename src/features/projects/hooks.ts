"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { createProject, getProject, getProjects, setProjectActive, updateProject } from "./api";

export function useProjects(companyId: number, activeOnly: boolean) {
  return useQuery({
    queryKey: [...queryKeys.projects(companyId), { activeOnly }],
    queryFn: () => getProjects(activeOnly),
    enabled: companyId > 0,
  });
}

export function useProject(companyId: number, projectId: number) {
  return useQuery({ queryKey: queryKeys.project(companyId, projectId), queryFn: () => getProject(projectId), enabled: companyId > 0 && projectId > 0 });
}

export function useCreateProject(companyId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: createProject, onSuccess: async () => client.invalidateQueries({ queryKey: queryKeys.projects(companyId) }) });
}

export function useUpdateProject(companyId: number, projectId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateProject>[1]) => updateProject(projectId, input),
    onSuccess: async (project) => {
      client.setQueryData(queryKeys.project(companyId, projectId), project);
      await client.invalidateQueries({ queryKey: queryKeys.projects(companyId) });
    },
  });
}

export function useSetProjectActive(companyId: number, projectId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (active: boolean) => setProjectActive(projectId, active),
    onSuccess: async (project, active) => {
      if (project) client.setQueryData(queryKeys.project(companyId, projectId), project);
      else client.setQueryData(queryKeys.project(companyId, projectId), (current: unknown) => current && typeof current === "object" ? { ...current, active } : current);
      await client.invalidateQueries({ queryKey: queryKeys.projects(companyId) });
    },
  });
}
