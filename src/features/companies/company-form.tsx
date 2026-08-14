"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { ApiError } from "@/lib/api/error";
import { companySchema, type CompanyInput } from "./schemas";

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100";

export function CompanyForm({ defaultValues, submitLabel, pending, serverError, onSubmit, canEditActive = true }: {
  defaultValues?: Partial<CompanyInput>;
  submitLabel: string;
  pending: boolean;
  serverError?: unknown;
  onSubmit: (values: CompanyInput) => void | Promise<void>;
  canEditActive?: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", abn: "", email: "", phone: "", address: "", active: true, contractorInvoiceGstEnabled: false, ...defaultValues },
  });
  const apiError = serverError instanceof ApiError ? serverError : null;
  const fieldError = (name: keyof CompanyInput): string | undefined => {
    const message = errors[name]?.message;
    return typeof message === "string" ? message : apiError?.fields[name];
  };

  return <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-7">
    {Boolean(serverError) && <div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{apiError?.message || "Could not save the company. Please try again."}</div>}
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Company name" required error={fieldError("name")}><input {...register("name")} autoComplete="organization" className={inputClass} aria-invalid={Boolean(fieldError("name"))} /></Field>
      <Field label="ABN" required error={fieldError("abn")}><input {...register("abn")} inputMode="numeric" className={inputClass} aria-invalid={Boolean(fieldError("abn"))} /></Field>
      <Field label="Email" required error={fieldError("email")}><input {...register("email")} type="email" autoComplete="email" className={inputClass} aria-invalid={Boolean(fieldError("email"))} /></Field>
      <Field label="Phone" error={fieldError("phone")}><input {...register("phone")} type="tel" autoComplete="tel" className={inputClass} aria-invalid={Boolean(fieldError("phone"))} /></Field>
      <div className="sm:col-span-2"><Field label="Address" error={fieldError("address")}><input {...register("address")} autoComplete="street-address" className={inputClass} aria-invalid={Boolean(fieldError("address"))} /></Field></div>
    </div>
    <fieldset className="mt-7 space-y-4 border-t border-slate-200 pt-6">
      <legend className="sr-only">Company settings</legend>
      {canEditActive && <Toggle register={register("active")} label="Company active" description="Inactive companies cannot be used for ongoing operations." />}
      <Toggle register={register("contractorInvoiceGstEnabled")} label="Apply GST to eligible contractor invoices" description="GST is applied only when this company setting is enabled and the worker is registered for GST." />
      <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Changing the GST setting affects newly approved work logs only. Existing financial snapshots and invoices remain unchanged.</p>
    </fieldset>
    <div className="mt-7 flex justify-end"><button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Saving…" : submitLabel}</button></div>
  </form>;
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-800"><span>{label}{required && <span aria-hidden="true" className="text-red-600"> *</span>}</span>{children}{error && <span role="alert" className="mt-1.5 block text-xs font-medium text-red-700">{error}</span>}</label>;
}

function Toggle({ register, label, description }: { register: UseFormRegisterReturn; label: string; description: string }) {
  return <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4"><input {...register} type="checkbox" className="mt-0.5 size-5 rounded border-slate-300 accent-emerald-700" /><span><span className="block text-sm font-semibold text-slate-900">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{description}</span></span></label>;
}
