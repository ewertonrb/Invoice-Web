"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useCompany, useDeactivateCompany } from "./hooks";
import { ErrorPanel } from "./ui";
import { ImageUpload } from "@/features/images/image-upload";

export function CompanyDetail({ companyId }: { companyId: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const company = useCompany(companyId);
  const deactivate = useDeactivateCompany(companyId);
  if (company.isPending) return <div aria-label="Loading company" className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-200" />;
  if (company.isError) return <div className="mt-8"><ErrorPanel message={company.error instanceof Error ? company.error.message : "Please try again."} retry={() => company.refetch()} /></div>;
  const data = company.data;
  return <><ImageUpload endpoint={`/companies/${companyId}/logo`} label="Company logo" />
    {deactivate.error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{deactivate.error instanceof Error ? deactivate.error.message : "Could not deactivate the company."}</p>}
    <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-7">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-semibold text-slate-950">{data.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${data.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{data.active ? "Active" : "Inactive"}</span></div><p className="mt-2 text-sm text-slate-600">ABN {data.abn}</p></div><div className="flex flex-wrap gap-2"><Link href={`/companies/${companyId}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={16} aria-hidden="true" />Edit</Link>{data.active && <button type="button" onClick={() => setConfirming(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 size={16} aria-hidden="true" />Deactivate</button>}</div></div>
      <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2"><Datum term="Email" value={data.email} /><Datum term="Phone" value={data.phone || "Not provided"} /><Datum term="Address" value={data.address || "Not provided"} /><Datum term="Contractor invoice GST" value={data.contractorInvoiceGstEnabled ? "Enabled" : "Disabled"} /><Datum term="Created" value={formatDate(data.createdAt)} /><Datum term="Last updated" value={formatDate(data.updatedAt)} /></dl>
    </article>
    {confirming && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" role="presentation" onKeyDown={(event) => { if (event.key === "Escape" && !deactivate.isPending) setConfirming(false); }} onMouseDown={(event) => { if (event.currentTarget === event.target && !deactivate.isPending) setConfirming(false); }}><div role="alertdialog" aria-modal="true" aria-labelledby="deactivate-title" aria-describedby="deactivate-description" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="deactivate-title" className="text-lg font-semibold text-slate-950">Deactivate {data.name}?</h2><p id="deactivate-description" className="mt-2 text-sm leading-6 text-slate-600">This uses the backend&apos;s DELETE operation, which marks the company inactive. It does not permanently delete company records.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setConfirming(false)} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700">Cancel</button><button type="button" autoFocus disabled={deactivate.isPending} onClick={() => deactivate.mutate(undefined, { onSuccess: () => { setConfirming(false); router.refresh(); } })} className="h-10 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">{deactivate.isPending ? "Deactivating…" : "Deactivate"}</button></div></div></div>}
  </>;
}

function Datum({ term, value }: { term: string; value: string }) { return <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{term}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-900">{value}</dd></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
