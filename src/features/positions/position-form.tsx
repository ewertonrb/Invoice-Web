"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiError } from "@/lib/api/error";
import { useActiveProjects } from "./hooks";
import { positionSchema, type PositionInput } from "./schemas";

const control = "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100";
export function PositionForm({ companyId, defaultValues, submitLabel, pending, serverError, onSubmit }: { companyId: number; defaultValues?: Partial<PositionInput>; submitLabel: string; pending: boolean; serverError?: unknown; onSubmit: (values: PositionInput) => void | Promise<void> }) {
  const projects = useActiveProjects(companyId);
  const { register, handleSubmit, formState: { errors } } = useForm<PositionInput>({ resolver: zodResolver(positionSchema), defaultValues: { projectId: defaultValues?.projectId, positionName: defaultValues?.positionName ?? "" } });
  const apiError = serverError instanceof ApiError ? serverError : null;
  const fieldError = (name: keyof PositionInput) => errors[name]?.message?.toString() || apiError?.fields[name];
  return <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-7">
    {Boolean(serverError) && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{apiError?.message || "Could not save the position. Please try again."}</p>}
    {projects.isError && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">Could not load active projects.</p>}
    <div className="grid gap-5 sm:grid-cols-2"><Field label="Project" error={fieldError("projectId")} errorId="position-project-error"><select {...register("projectId")} disabled={projects.isPending || projects.isError} className={control} aria-invalid={Boolean(fieldError("projectId"))} aria-describedby={fieldError("projectId") ? "position-project-error" : undefined}><option value="">Select a project</option>{projects.data?.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field><Field label="Position name" error={fieldError("positionName")} errorId="position-name-error"><input {...register("positionName")} className={control} aria-invalid={Boolean(fieldError("positionName"))} aria-describedby={fieldError("positionName") ? "position-name-error" : undefined} /></Field></div>
    {projects.isSuccess && projects.data.length === 0 && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Create or reactivate a project before adding a position.</p>}
    <div className="mt-7 flex justify-end"><button type="submit" disabled={pending || !projects.data?.length} className="h-11 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{pending ? "Saving…" : submitLabel}</button></div>
  </form>;
}
function Field({ label, error, errorId, children }: { label: string; error?: string; errorId: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-800"><span>{label}<span aria-hidden="true" className="text-red-600"> *</span></span>{children}{error && <span id={errorId} role="alert" className="mt-1.5 block text-xs font-medium text-red-700">{error}</span>}</label>; }
