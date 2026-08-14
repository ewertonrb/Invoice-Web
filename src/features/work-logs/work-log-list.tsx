"use client";

import Link from "next/link";
import { useState } from "react";
import { useMyProfile } from "@/features/workers/hooks";
import { useWorkLogs } from "./hooks";
import { workLogStatuses } from "./schemas";
import { formatWorkedHours } from "./format";
import { WorkerAvatar } from "@/features/workers/worker-avatar";

export function WorkLogList({ companyId, ownOnly = false, canCreate = ownOnly }: { companyId: number; ownOnly?: boolean; canCreate?: boolean }) {
  const [status, setStatus] = useState("");
  const profile = useMyProfile(companyId);
  const query = useWorkLogs(companyId, status || undefined, ownOnly ? profile.data?.id : undefined);

  return <div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><h1 className="text-3xl font-semibold">Work logs</h1><p className="mt-2 text-slate-600">Review work submissions and their immutable financial snapshots.</p></div>{canCreate && <Link href="/work-logs/new" className="h-11 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white">New work log</Link>}</div><label className="mt-7 block max-w-xs text-sm font-medium">Status<select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3"><option value="">All statuses</option>{workLogStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>{query.isPending && <div aria-label="Loading work logs" className="mt-5 h-64 animate-pulse rounded-2xl bg-slate-200" />}{query.isError && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-5 text-red-800">{query.error.message}</p>}<div className="mt-5 grid gap-4 lg:grid-cols-2">{query.data?.map((log) => { const editable = ownOnly && (log.status === "REJECTED" || log.status === "PENDING_APPROVAL"); return <article key={log.id} className={`rounded-2xl border bg-white p-5 ${log.status === "REJECTED" && ownOnly ? "border-red-200" : "border-slate-200"}`}><div className="flex justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><WorkerAvatar companyId={companyId} workerProfileId={log.workerProfileId} name={log.workerName} size="sm" /><div className="min-w-0"><h2 className="font-semibold">{log.workerName}</h2><p className="text-sm text-slate-600">{log.projectName} · {log.positionName}</p></div></div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${log.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"}`}>{log.status}</span></div>{log.status === "REJECTED" && ownOnly && <p className="mt-4 text-sm text-red-800">Correction requested: {log.rejectionReason || "reviewer feedback available in the details"}</p>}<dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><Data term="Work date" value={log.workDate} /><Data term="Regular hours" value={log.regularHours} /><Data term="Duration" value={formatWorkedHours(log.workTime?.workedMinutes)} /><Data term="Submitted" value={log.submittedAt || "—"} /></dl><div className="mt-5 flex flex-wrap gap-3"><Link href={`/work-logs/${log.id}`} className="inline-flex rounded-xl border px-4 py-2 text-sm font-semibold">View details</Link>{editable && <Link href={`/work-logs/${log.id}/edit`} className="inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">{log.status === "REJECTED" ? "Correct and resubmit" : "Edit"}</Link>}</div></article>; })}</div></div>;
}

function Data({ term, value }: { term: string; value: string }) { return <div><dt className="text-xs uppercase text-slate-500">{term}</dt><dd className="mt-1 font-medium">{value}</dd></div>; }
