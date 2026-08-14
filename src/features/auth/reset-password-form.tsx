"use client";

import Link from "next/link";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";

export function ResetPasswordForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : "This password reset link is missing or invalid.");

  async function submit(formData: FormData) {
    setPending(true); setError(null);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: formData.get("password"), confirmPassword: formData.get("confirmPassword") }) });
      const body = response.status === 204 ? null : await response.json();
      if (!response.ok) { setError(body?.message || "This password reset link is invalid or expired."); return; }
      setDone(true);
    } catch { setError("Could not connect to the server. Check your connection and try again."); }
    finally { setPending(false); }
  }

  if (done) return <div role="status" className="space-y-4 text-center"><div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">Your password has been updated successfully.</div><Link href="/login" className="inline-flex h-11 items-center rounded-xl bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800">Continue to sign in</Link></div>;
  const inputClass = "h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";
  return <form action={submit} className="space-y-5" aria-busy={pending}>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{error}</div>}
    <div><label htmlFor="password" className="text-sm font-semibold text-slate-800">New password</label><div className="relative mt-2"><LockKeyhole aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" className={inputClass} /></div></div>
    <div><label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-800">Confirm new password</label><div className="relative mt-2"><LockKeyhole aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className={inputClass} /></div></div>
    <button disabled={pending || !token} className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-semibold text-white shadow-sm transition duration-200 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50">{pending && <LoaderCircle aria-hidden="true" size={18} className="animate-spin motion-reduce:animate-none" />}{pending ? "Updating…" : "Update password"}</button>
    <p className="text-center text-sm text-slate-600"><Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">Back to sign in</Link></p>
  </form>;
}
