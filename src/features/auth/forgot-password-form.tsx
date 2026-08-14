"use client";

import Link from "next/link";
import { LoaderCircle, Mail } from "lucide-react";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [developmentUrl, setDevelopmentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setPending(true); setMessage(null); setDevelopmentUrl(null); setError(null);
    try {
      const response = await fetch("/api/auth/password-reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: formData.get("email") }) });
      const body = await response.json();
      if (!response.ok) { setError(body.message || "Could not start password recovery."); return; }
      setMessage(body.message);
      setDevelopmentUrl(body.developmentResetUrl || null);
    } catch { setError("Could not connect to the server. Check your connection and try again."); }
    finally { setPending(false); }
  }

  const inputClass = "h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";
  return <form action={submit} className="space-y-5" aria-busy={pending}>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{error}</div>}
    {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">{message}{developmentUrl && <><span className="mt-2 block font-semibold">Development link:</span><Link href={developmentUrl.replace(/^https?:\/\/[^/]+/, "")} className="mt-1 block break-all underline">{developmentUrl}</Link></>}</div>}
    <div><label htmlFor="email" className="text-sm font-semibold text-slate-800">Email address</label><div className="relative mt-2"><Mail aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="email" name="email" type="email" autoComplete="email" required autoFocus placeholder="name@company.com" className={inputClass} /></div></div>
    <button disabled={pending} className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-semibold text-white shadow-sm transition duration-200 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50">{pending && <LoaderCircle aria-hidden="true" size={18} className="animate-spin motion-reduce:animate-none" />}{pending ? "Sending…" : "Send reset link"}</button>
    <p className="text-center text-sm text-slate-600"><Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">Back to sign in</Link></p>
  </form>;
}
