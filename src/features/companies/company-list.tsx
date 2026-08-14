"use client";

import { Building2, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { useCompany } from "./hooks";
import { ErrorPanel, PageHeader } from "./ui";
import { CompanyAvatar } from "@/features/images/company-avatar";

export function CompanyList({ companyId }: { companyId: number }) {
  const query = useCompany(companyId);
  return <div className="mx-auto max-w-7xl">
    <PageHeader eyebrow="Company management" title="Companies" description="Manage the company currently selected for this workspace." />
    <div className="mt-8">
      {query.isPending && <Loading />}
      {query.isError && <ErrorPanel message={query.error instanceof Error ? query.error.message : "Please try again."} retry={() => query.refetch()} />}
      {query.isSuccess && !query.data && <Empty />}
      {query.data && <CompanyCard company={query.data} />}
    </div>
  </div>;
}

function CompanyCard({ company }: { company: NonNullable<ReturnType<typeof useCompany>["data"]> }) {
  const updated = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(new Date(company.updatedAt));
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6"><div className="flex min-w-0 gap-4"><CompanyAvatar companyId={company.id} name={company.name} /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-semibold text-slate-950">{company.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${company.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{company.active ? "Active" : "Inactive"}</span></div><p className="mt-1 text-sm text-slate-600">ABN {company.abn}</p></div></div><div className="flex gap-2"><Link href={`/companies/${company.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Eye size={16} aria-hidden="true" />View</Link><Link href={`/companies/${company.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={16} aria-hidden="true" />Edit</Link></div></div>
    <dl className="grid border-t border-slate-200 bg-slate-50/60 sm:grid-cols-2 lg:grid-cols-4"><Datum term="Email" value={company.email} /><Datum term="Phone" value={company.phone || "Not provided"} /><Datum term="Contractor GST" value={company.contractorInvoiceGstEnabled ? "Enabled" : "Disabled"} /><Datum term="Updated" value={updated} /></dl>
  </article>;
}

function Datum({ term, value }: { term: string; value: string }) { return <div className="border-b border-slate-200 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{term}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-800">{value}</dd></div>; }
function Loading() { return <div aria-label="Loading companies" className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"><div className="h-6 w-48 rounded bg-slate-200" /><div className="mt-3 h-4 w-32 rounded bg-slate-100" /><div className="mt-8 grid gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-12 rounded bg-slate-100" />)}</div></div>; }
function Empty() { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Building2 className="mx-auto text-slate-400" aria-hidden="true" /><h2 className="mt-3 font-semibold text-slate-900">No company found</h2><p className="mt-1 text-sm text-slate-600">Create a company to get started.</p></div>; }
