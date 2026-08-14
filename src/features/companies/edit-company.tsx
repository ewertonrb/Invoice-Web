"use client";

import { useRouter } from "next/navigation";
import { CompanyForm } from "./company-form";
import { ErrorPanel } from "./ui";
import { useCompany, useUpdateCompany } from "./hooks";

export function EditCompany({ companyId, canEditActive = false }: { companyId: number; canEditActive?: boolean }) {
  const router = useRouter();
  const company = useCompany(companyId);
  const mutation = useUpdateCompany(companyId);
  if (company.isPending) return <div aria-label="Loading company" className="mt-8 h-96 animate-pulse rounded-2xl bg-slate-200" />;
  if (company.isError) return <div className="mt-8"><ErrorPanel message={company.error instanceof Error ? company.error.message : "Please try again."} retry={() => company.refetch()} /></div>;
  return <CompanyForm canEditActive={canEditActive} defaultValues={{ ...company.data, phone: company.data.phone || "", address: company.data.address || "" }} submitLabel="Save changes" pending={mutation.isPending} serverError={mutation.error} onSubmit={(values) => {
    if (canEditActive) {
      mutation.mutate(values, { onSuccess: () => router.push(`/companies/${companyId}`) });
      return;
    }
    const { active, ...ownerValues } = values;
    void active;
    mutation.mutate({ ...ownerValues }, { onSuccess: () => router.push(`/companies/${companyId}`) });
  }} />;
}
