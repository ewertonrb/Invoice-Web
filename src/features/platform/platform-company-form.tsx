"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api/error";
import { provisionPlatformCompany } from "./api";
import { platformCompanySchema, type PlatformCompanyInput } from "./schemas";

const input = "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";
export function PlatformCompanyForm() {
  const router = useRouter(); const [pending, setPending] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit(form: HTMLFormElement) {
    setPending(true); setError(null); const data = Object.fromEntries(new FormData(form));
    const values: PlatformCompanyInput = { name: String(data.name), abn: String(data.abn), email: String(data.email), phone: String(data.phone || ""), address: String(data.address || ""), contractorInvoiceGstEnabled: data.gst === "on", active: true, ownerFirstName: String(data.ownerFirstName), ownerLastName: String(data.ownerLastName), ownerEmail: String(data.ownerEmail), temporaryPassword: String(data.temporaryPassword || "") || undefined };
    const parsed = platformCompanySchema.safeParse(values); if (!parsed.success) { setError("Review the required fields and password (minimum 12 characters when provided)."); setPending(false); return; }
    try { await provisionPlatformCompany(parsed.data); router.push("/platform/companies"); router.refresh(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : "Could not create the company."); } finally { setPending(false); }
  }
  return <form onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget); }} className="mt-8 space-y-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">{error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</div>}<Section title="Company details"><Field name="name" label="Company name" required /><Field name="abn" label="ABN" required /><Field name="email" label="Company email" type="email" required /><Field name="phone" label="Phone" /><Field name="address" label="Address" /><label className="flex items-center gap-3 text-sm font-medium"><input name="gst" type="checkbox" className="size-5 accent-emerald-700" />Enable contractor invoice GST</label></Section><Section title="Company owner"><div className="grid gap-5 sm:grid-cols-2"><Field name="ownerFirstName" label="First name" required /><Field name="ownerLastName" label="Last name" required /></div><Field name="ownerEmail" label="Owner email" type="email" required /><Field name="temporaryPassword" label="Temporary password" type="password" hint="Required only when this email does not already belong to a user. Minimum 12 characters." /></Section><div className="flex justify-end"><button disabled={pending} className="h-11 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{pending ? "Creating…" : "Create company"}</button></div></form>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-5"><h2 className="border-b border-slate-200 pb-3 text-lg font-semibold text-slate-950">{title}</h2>{children}</section>; }
function Field({ name, label, type = "text", required, hint }: { name: string; label: string; type?: string; required?: boolean; hint?: string }) { return <label className="block text-sm font-medium text-slate-800">{label}{required && <span className="text-red-600"> *</span>}<input name={name} type={type} required={required} className={input} />{hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}</label>; }
