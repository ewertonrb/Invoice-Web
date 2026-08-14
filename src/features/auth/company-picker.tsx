"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { CompanyMembership } from "@/lib/auth/types";
import { clearCompanyScopedCache } from "@/lib/api/query-keys";

export function CompanyPicker({ companies }: { companies: CompanyMembership[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function select(companyId: number) {
    setPendingId(companyId); setMessage(null);
    try {
      const response = await fetch("/api/auth/select-company", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId }) });
      if (!response.ok) { const body = await response.json().catch(() => ({})); setMessage(body.message || "Could not select the company."); return; }
      await clearCompanyScopedCache(queryClient);
      router.replace("/dashboard"); router.refresh();
    } catch { setMessage("Could not connect to the server."); }
    finally { setPendingId(null); }
  }
  return <div className="space-y-3">{message && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}{companies.map((company) => <button key={company.membershipId} onClick={() => select(company.companyId)} disabled={pendingId !== null} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-emerald-500 disabled:opacity-60"><span><strong className="block">{company.companyName}</strong><span className="text-sm text-slate-500">{company.role}</span></span><span className="text-emerald-700">{pendingId === company.companyId ? "Opening…" : "Continue →"}</span></button>)}</div>;
}
