"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getDashboardSummary } from "./api";

export function useDashboardSummary(companyId: number) {
 
  return useQuery({
    queryKey: queryKeys.dashboard.summary(companyId),
    queryFn: getDashboardSummary,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
