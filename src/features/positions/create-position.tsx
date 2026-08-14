"use client";
import { useRouter } from "next/navigation";
import { useCreatePosition } from "./hooks";
import { PositionForm } from "./position-form";
export function CreatePosition({ companyId }: { companyId: number }) { const router = useRouter(); const mutation = useCreatePosition(companyId); return <PositionForm companyId={companyId} submitLabel="Create position" pending={mutation.isPending} serverError={mutation.error} onSubmit={(values) => mutation.mutate(values, { onSuccess: (data) => router.push(`/positions/${data.id}`) })} />; }
