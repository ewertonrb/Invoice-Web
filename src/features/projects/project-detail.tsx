"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Archive, Pencil, RotateCcw } from "lucide-react";
import { useProject, useSetProjectActive } from "./hooks";
import { ProjectError } from "./ui";

export function ProjectDetail({ companyId, projectId }: { companyId: number; projectId: number }) {
  const [nextStatus, setNextStatus] = useState<boolean | null>(null);
  const statusTriggerRef = useRef<HTMLButtonElement>(null);
  const project = useProject(companyId, projectId);
  const status = useSetProjectActive(companyId, projectId);
  if (project.isPending) return <div aria-label="Loading project" className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-200" />;
  if (project.isError) return <div className="mt-8"><ProjectError message={project.error instanceof Error ? project.error.message : "Please try again."} retry={() => project.refetch()} /></div>;
  const data = project.data;
  return <>
    {status.error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{status.error instanceof Error ? status.error.message : "Could not update the project status."}</p>}
    <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-7">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-semibold text-slate-950">{data.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${data.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{data.active ? "Active" : "Inactive"}</span></div><p className="mt-2 text-sm text-slate-600">{data.companyName}</p></div><div className="flex flex-wrap gap-2"><Link href={`/projects/${projectId}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={16} aria-hidden="true" />Edit</Link><button ref={statusTriggerRef} type="button" onClick={() => setNextStatus(!data.active)} className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${data.active ? "border-red-200 text-red-700 hover:bg-red-50" : "border-emerald-200 text-emerald-800 hover:bg-emerald-50"}`}>{data.active ? <Archive size={16} aria-hidden="true" /> : <RotateCcw size={16} aria-hidden="true" />}{data.active ? "Deactivate" : "Reactivate"}</button></div></div>
      <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2"><Datum term="Company" value={data.companyName} /><Datum term="Status" value={data.active ? "Active" : "Inactive"} /><Datum term="Created" value={formatDate(data.createdAt)} /><Datum term="Last updated" value={formatDate(data.updatedAt)} /></dl>
    </article>
    {nextStatus !== null && <ConfirmStatus active={nextStatus} name={data.name} pending={status.isPending} onCancel={() => { setNextStatus(null); requestAnimationFrame(() => statusTriggerRef.current?.focus()); }} onConfirm={() => status.mutate(nextStatus, { onSuccess: () => { setNextStatus(null); requestAnimationFrame(() => statusTriggerRef.current?.focus()); } })} />}
  </>;
}

function ConfirmStatus({ active, name, pending, onCancel, onConfirm }: { active: boolean; name: string; pending: boolean; onCancel: () => void; onConfirm: () => void }) {
  const verb = active ? "Reactivate" : "Deactivate";
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !pending) onCancel(); if (event.key !== "Tab") return; const items = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'); if (!items?.length) return; const first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }; document.addEventListener("keydown", handleKey); return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", handleKey); }; }, [onCancel, pending]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !pending) onCancel(); }}><div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="project-status-title" aria-describedby="project-status-description" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="project-status-title" className="text-lg font-semibold text-slate-950">{verb} {name}?</h2><p id="project-status-description" className="mt-2 text-sm leading-6 text-slate-600">{active ? "This project will become available for ongoing operations again." : "This marks the project inactive without deleting its historical records."}</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} disabled={pending} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 disabled:opacity-60">Cancel</button><button type="button" autoFocus disabled={pending} onClick={onConfirm} className={`h-10 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60 ${active ? "bg-emerald-700 hover:bg-emerald-800" : "bg-red-700 hover:bg-red-800"}`}>{pending ? "Updating…" : verb}</button></div></div></div>;
}

function Datum({ term, value }: { term: string; value: string }) { return <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{term}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-900">{value}</dd></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
