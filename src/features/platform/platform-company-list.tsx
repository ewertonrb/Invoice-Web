"use client";

import { useEffect, useState } from "react";
import { listPlatformCompanies, setPlatformCompanyActive } from "./api";

type Company = { id: number; name: string; abn: string; email: string; active: boolean; address?: string | null };
export function PlatformCompanyList() { const [companies, setCompanies] = useState<Company[]>([]); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { void listPlatformCompanies().then((items) => setCompanies(items as Company[])).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load companies.")).finally(() => setLoading(false)); }, []);
  async function toggle(company: Company) { try { const updated = await setPlatformCompanyActive(company.id, !company.active) as Company; setCompanies((current) => current.map((item) => item.id === company.id ? updated : item)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update company."); } }
  if (loading) return <div className="mt-8 h-48 animate-pulse rounded-2xl bg-white" />;
  return <div className="mt-8">{error && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</div>}{!companies.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No companies registered yet.</div> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-200">{companies.map((company) => <article key={company.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-slate-950">{company.name}</h2><p className="mt-1 text-sm text-slate-600">ABN {company.abn} · {company.email}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${company.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{company.active ? "Active" : "Inactive"}</span><button onClick={() => void toggle(company)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{company.active ? "Deactivate" : "Activate"}</button></div></article>)}</div></div>}</div>;
}
