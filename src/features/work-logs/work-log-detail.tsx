"use client";

import Link from "next/link";
import { useState } from "react";
import { useApproveWorkLog, useCancelWorkLog, useRejectWorkLog, useWorkLog } from "./hooks";
import { formatWorkedHours } from "./format";
import { WorkerAvatar } from "@/features/workers/worker-avatar";

export function WorkLogDetail({ companyId, id, canReview, canEdit }: { companyId: number; id: number; canReview: boolean; canEdit: boolean }) {
  const query = useWorkLog(companyId, id);
  if (query.isPending) return <div className="mt-8 h-96 animate-pulse rounded-2xl bg-slate-200" />;
  if (query.isError) return <p role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-red-800">{query.error.message}</p>;
  return <Loaded companyId={companyId} id={id} canReview={canReview} canEdit={canEdit} log={query.data} />;
}

function Loaded({ companyId, id, canReview, canEdit, log }: { companyId: number; id: number; canReview: boolean; canEdit: boolean; log: NonNullable<ReturnType<typeof useWorkLog>["data"]> }) {
  const [reason, setReason] = useState("");
  const approve = useApproveWorkLog(companyId, id);
  const reject = useRejectWorkLog(companyId, id);
  const cancel = useCancelWorkLog(companyId, id);
  const actionError = approve.error?.message || reject.error?.message || cancel.error?.message;
  const editable = log.status === "REJECTED" || log.status === "PENDING_APPROVAL";

  return <article className="mt-8 rounded-2xl border bg-white p-5 sm:p-7">
    <div className="flex justify-between gap-4 border-b pb-6">
      <div className="flex items-center gap-3"><WorkerAvatar companyId={companyId} workerProfileId={log.workerProfileId} name={log.workerName} /><div><h2 className="text-2xl font-semibold">{log.workerName}</h2><p className="mt-1 text-slate-600">{log.projectName} · {log.positionName} · {log.workDate}</p></div></div>
      <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{log.status}</span>
    </div>
    {log.status === "REJECTED" && <section aria-labelledby="rejection-heading" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"><h3 id="rejection-heading" className="font-semibold text-red-900">Correction required</h3><p className="mt-1 text-sm text-red-800">{log.rejectionReason || "The reviewer requested changes to this work log."}</p></section>}
    <dl className="mt-6 grid gap-5 sm:grid-cols-3"><Data term="Regular hours" value={log.regularHours} /><Data term="Overtime 1.5" value={log.overtime15Hours} /><Data term="Overtime 2.0" value={log.overtime20Hours} /><Data term="Worked duration" value={log.workTime?.workedMinutes == null ? "Not calculated" : `${log.workTime.workedMinutes} minutes`} /><Data term="Travel hours" value={log.travel?.travelHours || "0"} /><Data term="Kilometres" value={log.travel?.kilometres || "0"} /></dl>
    <FinancialSnapshot snapshot={log.financialSnapshot} />
    {canEdit && editable && <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6"><Link href={`/work-logs/${id}/edit`} className="inline-flex h-11 items-center rounded-xl bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800">{log.status === "REJECTED" ? "Correct and resubmit" : "Edit work log"}</Link>{log.status === "REJECTED" && <p className="text-sm text-slate-600">Saving your changes will send this work log back for approval.</p>}</div>}
    {canReview && log.status === "PENDING_APPROVAL" && <div className="mt-8 flex flex-wrap gap-3 border-t pt-6"><button type="button" disabled={approve.isPending} onClick={() => approve.mutate()} className="h-11 rounded-xl bg-emerald-700 px-5 font-semibold text-white">Approve</button><textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason" className="h-11 rounded-xl border p-3" /><button type="button" disabled={reject.isPending || !reason.trim()} onClick={() => reject.mutate(reason)} className="h-11 rounded-xl bg-red-700 px-5 font-semibold text-white">Reject</button></div>}
    {actionError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{actionError}</p>}
    {log.status === "PENDING_APPROVAL" && <button type="button" disabled={cancel.isPending} onClick={() => cancel.mutate()} className="mt-4 text-sm font-semibold text-red-700">Cancel submission</button>}
  </article>;
}

function FinancialSnapshot({ snapshot }: { snapshot: Record<string, unknown> | null }) {
  if (!snapshot) return <section className="mt-8 border-t pt-6"><h3 className="font-semibold">Financial snapshot</h3><p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Snapshot not available. It is created by the backend when the work log is approved.</p></section>;
  const money = (value: unknown) => typeof value === "number" || typeof value === "string" ? new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(value)) : "—";
  const rateRows: [string, unknown][] = [["Regular", snapshot.regularRate], ["Overtime 1.5", snapshot.overtime15Rate], ["Overtime 2.0", snapshot.overtime20Rate], ["Saturday", snapshot.saturdayRate], ["Sunday", snapshot.sundayRate], ["Public holiday", snapshot.publicHolidayRate], ["Travel", snapshot.travelRate], ["Kilometre", snapshot.kilometreRate], ["LAFHA", snapshot.lafhaRate]];
  const amountRows: [string, unknown][] = [["Regular", snapshot.regularAmount], ["Overtime 1.5", snapshot.overtime15Amount], ["Overtime 2.0", snapshot.overtime20Amount], ["Saturday", snapshot.saturdayAmount], ["Sunday", snapshot.sundayAmount], ["Public holiday", snapshot.publicHolidayAmount], ["Travel", snapshot.travelAmount], ["Kilometre", snapshot.kilometreAmount], ["LAFHA", snapshot.lafhaAmount]];
  return <section className="mt-8 border-t pt-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">Financial snapshot</h3><p className="mt-1 text-xs text-slate-500">Read-only values calculated and frozen by the backend.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{snapshot.gstApplied ? "GST applied" : "GST not applied"}</span></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Summary label="Subtotal" value={money(snapshot.subtotalAmount)} /><Summary label="GST" value={money(snapshot.gstAmount)} /><Summary label="Total" value={money(snapshot.totalAmount)} emphasis /></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><SnapshotTable title="Rates" rows={rateRows} /><SnapshotTable title="Amounts" rows={amountRows} /></div></section>;
}

function SnapshotTable({ title, rows }: { title: string; rows: [string, unknown][] }) { return <div className="rounded-xl border"><h4 className="border-b bg-slate-50 px-4 py-3 text-sm font-semibold">{title}</h4><dl className="divide-y">{rows.filter(([, value]) => value !== null && value !== undefined).map(([label, value]) => <div key={label} className="flex justify-between gap-4 px-4 py-2 text-sm"><dt className="text-slate-600">{label}</dt><dd className="font-medium">{formatMoney(value)}</dd></div>)}</dl></div>; }
function formatMoney(value: unknown) { return typeof value === "number" || typeof value === "string" ? new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(value)) : "—"; }
function Summary({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) { return <div className={`rounded-xl p-4 ${emphasis ? "bg-emerald-700 text-white" : "bg-slate-50"}`}><p className="text-xs uppercase opacity-75">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }
function Data({ term, value }: { term: string; value: string }) { const displayValue = term === "Worked duration" && value.endsWith(" minutes") ? formatWorkedHours(Number(value.replace(" minutes", ""))) : value; return <div><dt className="text-xs uppercase text-slate-500">{term}</dt><dd className="mt-1 font-medium">{displayValue}</dd></div>; }
