"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { ApiError } from "@/lib/api/error";
import { useRatePositions } from "./hooks";
import { calculationFor, rateSchema, rateTypes, type RateInput } from "./schemas";
import { label } from "./ui";

const control = "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";

export function RateForm({ companyId, currentPosition, defaultValues, pending, serverError, submitLabel, onSubmit }: { companyId: number; currentPosition?: { id: number; projectName: string; positionName: string; active: boolean }; defaultValues?: Partial<RateInput>; pending: boolean; serverError?: unknown; submitLabel: string; onSubmit: (data: RateInput) => void }) {
  const positions = useRatePositions(companyId, true);
  const form = useForm<RateInput>({ resolver: zodResolver(rateSchema), defaultValues: { projectPositionId: defaultValues?.projectPositionId, effectiveFrom: defaultValues?.effectiveFrom ?? "", effectiveTo: defaultValues?.effectiveTo ?? "", items: defaultValues?.items ?? [{ rateType: "REGULAR", calculationType: "BASE_RATE", value: "", description: "" }] } });
  const items = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const apiError = serverError instanceof ApiError ? serverError : null;
  const error = form.formState.errors;

  return <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
    {Boolean(serverError) && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{apiError?.message || "Could not save the rate table."}</p>}
    {positions.isError && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>Could not load active positions.</p><button type="button" onClick={() => positions.refetch()} className="mt-3 rounded-lg bg-red-700 px-3 py-2 font-semibold text-white">Try again</button></div>}
    <div className="grid gap-5 sm:grid-cols-3">
      <Field label="Position" error={error.projectPositionId?.message?.toString()} id="rate-position-error"><select {...form.register("projectPositionId")} disabled={positions.isPending || positions.isError} className={control} aria-invalid={Boolean(error.projectPositionId)} aria-describedby={error.projectPositionId ? "rate-position-error" : undefined}><option value="">Select a position</option>{currentPosition && !positions.data?.some((position) => position.id === currentPosition.id) && <option value={currentPosition.id}>{currentPosition.projectName} — {currentPosition.positionName} (current{currentPosition.active ? "" : ", inactive"})</option>}{positions.data?.map((position) => <option key={position.id} value={position.id}>{position.projectName} — {position.positionName}</option>)}</select></Field>
      <Field label="Effective from" error={error.effectiveFrom?.message?.toString()} id="rate-from-error"><input type="date" {...form.register("effectiveFrom")} className={control} aria-invalid={Boolean(error.effectiveFrom)} aria-describedby={error.effectiveFrom ? "rate-from-error" : undefined} /></Field>
      <Field label="Effective to" error={error.effectiveTo?.message?.toString()} id="rate-to-error"><input type="date" {...form.register("effectiveTo")} className={control} aria-invalid={Boolean(error.effectiveTo)} aria-describedby={error.effectiveTo ? "rate-to-error" : undefined} /><span className="mt-1 block text-xs text-slate-500">Leave blank for an open-ended period.</span></Field>
    </div>
    <fieldset><legend className="text-lg font-semibold text-slate-950">Rate items</legend><p className="mt-1 text-sm text-slate-600">Values are configuration inputs only. Final financial calculations are performed by the backend.</p>{typeof error.items?.message === "string" && <p role="alert" className="mt-2 text-sm text-red-700">{error.items.message}</p>}
      <div className="mt-4 space-y-4">{items.fields.map((item, index) => { const type = watchedItems?.[index]?.rateType ?? "REGULAR"; const itemError = error.items?.[index]; return <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Rate type" error={itemError?.rateType?.message} id={`rate-${index}-type-error`}><select {...form.register(`items.${index}.rateType`, { onChange: (event) => form.setValue(`items.${index}.calculationType`, calculationFor(event.target.value)) })} className={control} aria-invalid={Boolean(itemError?.rateType)} aria-describedby={itemError?.rateType ? `rate-${index}-type-error` : undefined}>{rateTypes.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></Field>
        <Field label="Calculation" error={itemError?.calculationType?.message} id={`rate-${index}-calculation-error`}><input readOnly {...form.register(`items.${index}.calculationType`)} value={calculationFor(type)} className={`${control} bg-slate-50`} aria-invalid={Boolean(itemError?.calculationType)} aria-describedby={itemError?.calculationType ? `rate-${index}-calculation-error` : undefined} /></Field>
        <Field label="Value" error={itemError?.value?.message} id={`rate-${index}-value-error`}><input inputMode="decimal" {...form.register(`items.${index}.value`)} className={control} aria-invalid={Boolean(itemError?.value)} aria-describedby={itemError?.value ? `rate-${index}-value-error` : undefined} /></Field>
        <Field label="Description" error={itemError?.description?.message} id={`rate-${index}-description-error`}><input {...form.register(`items.${index}.description`)} className={control} aria-invalid={Boolean(itemError?.description)} aria-describedby={itemError?.description ? `rate-${index}-description-error` : undefined} /></Field>
      </div><button type="button" disabled={items.fields.length === 1} onClick={() => items.remove(index)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-700 disabled:opacity-40"><Trash2 size={16} aria-hidden="true" />Remove item</button></div>; })}</div>
      <button type="button" onClick={() => items.append({ rateType: "OVERTIME_1_5", calculationType: "MULTIPLIER", value: "", description: "" })} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold"><Plus size={16} aria-hidden="true" />Add rate item</button>
    </fieldset>
    <div className="flex justify-end"><button type="submit" disabled={pending || positions.isPending || positions.isError} className="h-11 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : submitLabel}</button></div>
  </form>;
}

function Field({ label: text, error, id, children }: { label: string; error?: string; id: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-800">{text}{children}{error && <span id={id} role="alert" className="mt-1 block text-xs text-red-700">{error}</span>}</label>; }
