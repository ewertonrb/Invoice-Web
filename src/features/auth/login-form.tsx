"use client";

import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { AuthSession } from "@/lib/auth/types";
import { safeInternalPath } from "@/lib/auth/redirect";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function submit(formData: FormData) {
    setPending(true); setMessage(null); setFieldErrors({});
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }) });
      const body = await response.json();
      if (!response.ok) { setMessage(body.message || "Could not sign in. Check your details and try again."); setFieldErrors(body.errors || {}); return; }
      const session = body as AuthSession;
      if (session.user.systemRole === "PLATFORM_ADMIN" && session.companies.length === 0) {
        router.replace("/platform/companies"); router.refresh(); return;
      }
      if (session.companies.length === 1) {
        const selected = await fetch("/api/auth/select-company", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId: session.companies[0].companyId }) });
        if (!selected.ok) { router.replace("/select-company"); return; }
      }
      const safeNext = safeInternalPath(searchParams.get("next"));
      router.replace(session.companies.length > 1 ? "/select-company" : safeNext); router.refresh();
    } catch { setMessage("Could not connect to the server. Check your connection and try again."); }
    finally { setPending(false); }
  }

  const inputClass = "h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";
  return <form action={submit} className="space-y-5" aria-busy={pending}>
    {message && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{message}</div>}
    <div><label htmlFor="email" className="text-sm font-semibold text-slate-800">Email address</label><div className="relative mt-2"><Mail aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="email" name="email" type="email" autoComplete="email" required autoFocus aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "email-error" : undefined} placeholder="name@company.com" className={inputClass} /></div>{fieldErrors.email?.[0] && <p id="email-error" className="mt-1.5 text-sm text-red-700">{fieldErrors.email[0]}</p>}</div>
    <div><label htmlFor="password" className="text-sm font-semibold text-slate-800">Password</label><div className="relative mt-2"><LockKeyhole aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "password-error" : undefined} className={`${inputClass} pr-12`} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)} className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>{fieldErrors.password?.[0] && <p id="password-error" className="mt-1.5 text-sm text-red-700">{fieldErrors.password[0]}</p>}</div>
    <div className="flex items-center justify-between gap-4"><span /><Link href="/forgot-password" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">Forgot password?</Link></div><button disabled={pending} className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-semibold text-white shadow-sm transition duration-200 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50">{pending && <LoaderCircle aria-hidden="true" size={18} className="animate-spin motion-reduce:animate-none" />}{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
