"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { createCompany, deactivateCompany, getCompany, updateCompany } from "./api";

export function useCompany(companyId: number) {
  return useQuery({ queryKey: queryKeys.company(companyId), queryFn: () => getCompany(companyId), enabled: companyId > 0 });
}

export function useCreateCompany(activeCompanyId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: createCompany, onSuccess: async () => client.invalidateQueries({ queryKey: queryKeys.company(activeCompanyId) }) });
}

export function useUpdateCompany(companyId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: Parameters<typeof updateCompany>[1]) => updateCompany(companyId, input), onSuccess: (company) => client.setQueryData(queryKeys.company(companyId), company) });
}

export function useDeactivateCompany(companyId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: () => deactivateCompany(companyId), onSuccess: async () => client.invalidateQueries({ queryKey: queryKeys.company(companyId) }) });
}
