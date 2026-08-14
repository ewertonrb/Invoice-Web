"use client";
import { useRouter } from "next/navigation";
import { RateForm } from "./rate-form";
import { RateError } from "./ui";
import { useRate, useUpdateRate } from "./hooks";

export function EditRate({ companyId, rateId }: { companyId: number; rateId: number }) {
  const router = useRouter();
  const query = useRate(companyId, rateId);
  const mutation = useUpdateRate(companyId, rateId);
  if (query.isPending) return <div className="mt-8 h-96 animate-pulse rounded-2xl bg-slate-200" />;
  if (query.isError) return <div className="mt-8"><RateError error={query.error} retry={() => query.refetch()} /></div>;
  const rate = query.data;
  return <RateForm companyId={companyId} currentPosition={{ id: rate.projectPositionId, projectName: rate.projectName, positionName: rate.positionName, active: false }} defaultValues={{ projectPositionId: rate.projectPositionId, effectiveFrom: rate.effectiveFrom, effectiveTo: rate.effectiveTo ?? "", items: rate.items.map(({ rateType, calculationType, value, description }) => ({ rateType, calculationType, value, description: description ?? "" })) }} pending={mutation.isPending} serverError={mutation.error} submitLabel="Save changes" onSubmit={(data) => mutation.mutate(data, { onSuccess: () => router.push(`/rates/${rateId}`) })} />;
}
