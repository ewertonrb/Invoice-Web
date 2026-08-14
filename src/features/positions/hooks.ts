"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { createPosition, getActiveProjects, getPosition, getPositions, setPositionActive, updatePosition } from "./api";

export function usePositions(companyId: number, activeOnly: boolean, projectId?: number) { return useQuery({ queryKey: [...queryKeys.positions(companyId), { activeOnly, projectId: projectId ?? null }], queryFn: () => getPositions(activeOnly, projectId), enabled: companyId > 0 }); }
export function usePosition(companyId: number, id: number) { return useQuery({ queryKey: queryKeys.position(companyId, id), queryFn: () => getPosition(id), enabled: companyId > 0 && id > 0 }); }
export function useActiveProjects(companyId: number) { return useQuery({ queryKey: [...queryKeys.projects(companyId), { activeOnly: true }], queryFn: getActiveProjects, enabled: companyId > 0 }); }
export function useCreatePosition(companyId: number) { const client = useQueryClient(); return useMutation({ mutationFn: createPosition, onSuccess: async () => client.invalidateQueries({ queryKey: queryKeys.positions(companyId) }) }); }
export function useUpdatePosition(companyId: number, id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (input: Parameters<typeof updatePosition>[1]) => updatePosition(id, input), onSuccess: async (data) => { client.setQueryData(queryKeys.position(companyId, id), data); await client.invalidateQueries({ queryKey: queryKeys.positions(companyId) }); } }); }
export function useSetPositionActive(companyId: number, id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (active: boolean) => setPositionActive(id, active), onSuccess: async (data, active) => { if (data) client.setQueryData(queryKeys.position(companyId, id), data); else client.setQueryData(queryKeys.position(companyId, id), (current: unknown) => current && typeof current === "object" ? { ...current, active } : current); await client.invalidateQueries({ queryKey: queryKeys.positions(companyId) }); } }); }
