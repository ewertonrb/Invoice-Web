import { Suspense } from "react";
import Image from "next/image";
import { CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/features/auth/login-form";

const benefits = [
  { icon: FileCheck2, text: "One workflow from approved work to paid invoice" },
  { icon: ShieldCheck, text: "Company-scoped access and role-based permissions" },
  { icon: CheckCircle2, text: "Reliable financial snapshots managed by the API" },
];

export default function LoginPage() {
  return <main className="min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
    <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col xl:px-20 xl:py-14"><div aria-hidden="true" className="pointer-events-none absolute -left-36 top-1/3 size-[420px] rounded-full bg-emerald-600/15 blur-3xl" /><div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full border border-emerald-400/20" /><div className="relative flex items-center gap-3"><Image src="/images/Invoice-api.png" alt="Invoice Platform" width={40} height={40} className="size-10 rounded-xl object-cover" /><span className="text-sm font-semibold tracking-wide">Invoice Platform</span></div><div className="relative my-auto max-w-xl py-16"><span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Operations workspace</span><h1 className="mt-7 text-balance text-5xl font-semibold leading-[1.12] tracking-[-0.04em] xl:text-6xl">Keep every hour, approval, and invoice in sync.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">A secure workspace for labour-hire teams to move from work logs to accurate invoices without losing context.</p><ul className="mt-10 space-y-4">{benefits.map(({ icon: Icon, text }) => <li key={text} className="flex items-center gap-3 text-sm text-slate-200"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-emerald-300"><Icon size={17} aria-hidden="true" /></span>{text}</li>)}</ul></div><p className="relative text-xs text-slate-500">Secure access for owners, managers, finance teams, and workers.</p></section>
    <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-10 lg:px-14"><div className="w-full max-w-[440px]"><div className="mb-10 flex items-center gap-3 lg:hidden"><Image src="/images/Invoice-api.png" alt="Invoice Platform" width={40} height={40} className="size-10 rounded-xl object-cover" /><span className="font-semibold text-slate-950">Invoice Platform</span></div><p className="text-sm font-semibold text-emerald-700">Welcome back</p><h2 className="mt-2 text-4xl font-semibold tracking-[-0.035em] text-slate-950">Sign in to your workspace</h2><p className="mt-3 text-base leading-7 text-slate-600">Enter the credentials linked to your account.</p><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.35)] sm:p-8"><Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}><LoginForm /></Suspense></div><p className="mt-6 text-center text-xs leading-5 text-slate-500">Your session is stored securely and scoped to the company you select.</p></div></section>
  </main>;
}
