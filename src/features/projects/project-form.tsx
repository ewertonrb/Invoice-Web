"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiError } from "@/lib/api/error";
import { projectSchema, type ProjectInput } from "./schemas";

export function ProjectForm({ defaultValues, submitLabel, pending, serverError, onSubmit }: {
  defaultValues?: Partial<ProjectInput>;
  submitLabel: string;
  pending: boolean;
  serverError?: unknown;
  onSubmit: (values: ProjectInput) => void | Promise<void>;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectInput>({ resolver: zodResolver(projectSchema), defaultValues: { name: "", ...defaultValues } });
  const apiError = serverError instanceof ApiError ? serverError : null;
  const error = errors.name?.message || apiError?.fields.name;
  return <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-7">
    {Boolean(serverError) && <div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{apiError?.message || "Could not save the project. Please try again."}</div>}
    <label className="block text-sm font-medium text-slate-800"><span>Project name<span aria-hidden="true" className="text-red-600"> *</span></span><input {...register("name")} autoComplete="off" aria-invalid={Boolean(error)} aria-describedby={error ? "project-name-error" : undefined} className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />{error && <span id="project-name-error" role="alert" className="mt-1.5 block text-xs font-medium text-red-700">{error}</span>}</label>
    <p className="mt-3 text-xs leading-5 text-slate-500">The active company is applied automatically. Project status is managed from the project details page.</p>
    <div className="mt-7 flex justify-end"><button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Saving…" : submitLabel}</button></div>
  </form>;
}
