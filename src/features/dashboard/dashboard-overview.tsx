"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, ClipboardCheck, FileText, Plus, Users } from "lucide-react";
import { useMyProfile, useWorkers } from "@/features/workers/hooks";
import { useDashboardSummary } from "./hooks";
import { can } from "@/lib/permissions";
import type { CompanyRole } from "@/lib/auth/types";
import { WorkerAvatar } from "@/features/workers/worker-avatar";

const modules = [
  { title: "Work logs", description: "Create, review, and approve recorded work.", href: "/work-logs", icon: ClipboardCheck },
  { title: "Invoices", description: "Preview periods and manage invoice status.", href: "/invoices", icon: FileText },
  { title: "Shifts", description: "Review available shifts and manage your assignments.", href: "/shifts", icon: CalendarDays },
  { title: "Workers", description: "Manage profiles and company memberships.", href: "/workers", icon: Users },
  { title: "Projects", description: "Configure projects, positions, and rates.", href: "/projects", icon: BriefcaseBusiness },
];

export function DashboardOverview({ companyId, role, userName }: { companyId: number; role: CompanyRole; userName: string }) {
  const worker = role === "WORKER";
  const reviewer = can(role, "workLogs:review");
  const profile = useMyProfile(companyId, !reviewer);
  const summary = useDashboardSummary(companyId);
  const workers = useWorkers(companyId, true, undefined, reviewer);
  const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
  const hasError = summary.isError || profile.isError || workers.isError;
  const loading = summary.isLoading;
  const value = (display: string | number) => loading ? null : summary.isError ? "—" : String(display);
  const amount = () => loading ? null : summary.isError ? "—" : money.format(summary.data?.outstandingAmount ?? 0);

  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-semibold text-emerald-700">Operations overview</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">Good to see you, {userName}.</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Lets Go Work!</p></div>
      {can(role, "workLogs:own") && <Link href="/work-logs/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"><Plus size={18} aria-hidden="true" />New work log</Link>}
    </div>

    {hasError && <div role="alert" className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-red-50 p-4 text-sm text-red-800"><span>Some dashboard information could not be loaded. Please try again.</span><button type="button" onClick={() => summary.refetch()} className="font-semibold underline">Retry</button></div>}

    <section aria-labelledby="status-heading" className="mt-8"><div className="mb-4 flex items-center justify-between"><h2 id="status-heading" className="text-base font-semibold text-slate-950">Today at a glance</h2><span className="text-xs font-medium text-slate-500">{worker ? "Your work" : "Active company data"}</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {worker ? <>
        <Metric label="Available shifts" value={value(summary.data?.availableShifts ?? 0)} href="/shifts" />
        <Metric label="My shifts" value={value(summary.data?.myShifts ?? 0)} href="/shifts" />
        <Metric label="My draft invoices" value={value(summary.data?.draftInvoices ?? 0)} href="/invoices" />
        <Metric label="My outstanding" value={amount()} href="/invoices" />
      </> : <>
        <Metric label="Pending review" value={value(summary.data?.pendingReview ?? 0)} href="/work-logs" />
        <Metric label="Ready to invoice" value={value(summary.data?.readyToInvoice ?? 0)} href="/work-logs" />
        <Metric label="Draft invoices" value={value(summary.data?.draftInvoices ?? 0)} href="/invoices" />
        <Metric label="Outstanding" value={amount()} href="/invoices" />
      </>}
    </div></section>

    <section className="mt-10"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-semibold text-slate-950">Your workspace</h2><p className="mt-1 text-sm text-slate-600">{worker ? "Your shifts and invoices for the active company." : "Live operational areas for the active company."}</p></div>{reviewer && <span className="text-sm text-slate-500">{workers.data?.length ?? 0} active workers</span>}</div><div className="grid gap-4 md:grid-cols-2">{(worker ? modules.filter(({ href }) => href === "/invoices" || href === "/shifts") : modules).map(({ title, description, href, icon: Icon }) => <Link key={title} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] transition hover:border-emerald-200 hover:shadow-[0_16px_36px_-24px_rgba(3,105,161,0.38)]"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={21} aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-950">{title}</h3><ArrowRight size={18} aria-hidden="true" className="text-slate-400 transition group-hover:text-emerald-700" /></div><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div></div></Link>)}</div></section>

    {reviewer && <section aria-labelledby="workers-heading" className="mt-10"><div className="mb-4 flex items-center justify-between"><h2 id="workers-heading" className="text-xl font-semibold text-slate-950">Active workers</h2><Link href="/workers" className="text-sm font-semibold text-emerald-700">View all</Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(workers.data ?? []).slice(0, 6).map((worker) => <Link key={worker.workerProfileId} href={`/workers/${worker.workerProfileId}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-200"><WorkerAvatar companyId={companyId} workerProfileId={worker.workerProfileId} name={worker.fullName} size="md" /><span className="min-w-0"><strong className="block truncate text-sm text-slate-950">{worker.fullName}</strong><span className="block truncate text-xs text-slate-500">{worker.email}</span></span></Link>)}</div></section>}
  </div>;
}

function Metric({ label, value, href }: { label: string; value: string | null; href: string }) {
  return <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] transition hover:border-emerald-200"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>{value === null ? <div aria-label={`${label} loading`} className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200" /> : <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-950">{value}</p>}<span className="mt-2 block text-xs font-medium text-emerald-700">View details →</span></Link>;
}
