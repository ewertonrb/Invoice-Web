"use client";
import { useRouter } from "next/navigation";
import { usePosition, useUpdatePosition } from "./hooks";
import { PositionForm } from "./position-form";
import { PositionError } from "./ui";
export function EditPosition({ companyId, positionId }: { companyId: number; positionId: number }) { const router = useRouter(); const query = usePosition(companyId, positionId); const mutation = useUpdatePosition(companyId, positionId); if (query.isPending) return <div aria-label="Loading position" className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-200" />; if (query.isError) return <div className="mt-8"><PositionError message={query.error instanceof Error ? query.error.message : "Please try again."} retry={() => query.refetch()} /></div>; return <PositionForm companyId={companyId} defaultValues={{ projectId: query.data.projectId, positionName: query.data.positionName }} submitLabel="Save changes" pending={mutation.isPending} serverError={mutation.error} onSubmit={(values) => mutation.mutate(values, { onSuccess: () => router.push(`/positions/${positionId}`) })} />; }
