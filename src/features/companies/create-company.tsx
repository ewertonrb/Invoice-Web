"use client";

import { useRouter } from "next/navigation";
import { CompanyForm } from "./company-form";
import { useCreateCompany } from "./hooks";

export function CreateCompany({ activeCompanyId }: { activeCompanyId: number }) {
  const router = useRouter();
  const mutation = useCreateCompany(activeCompanyId);
  return <CompanyForm submitLabel="Create company" pending={mutation.isPending} serverError={mutation.error} onSubmit={(values) => mutation.mutate(values, { onSuccess: () => router.push("/companies") })} />;
}
