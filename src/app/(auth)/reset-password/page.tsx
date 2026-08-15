import Image from "next/image";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5 py-10 sm:px-10"><section className="w-full max-w-[440px]"><div className="mb-10 flex items-center justify-center gap-3"><Image src="/images/Invoice-api.png" alt="Invoice Platform" width={40} height={40} className="size-10 rounded-xl object-cover" /><span className="font-semibold text-slate-950">Invoice Platform</span></div><p className="text-center text-sm font-semibold text-emerald-700">Account recovery</p><h1 className="mt-2 text-center text-4xl font-semibold tracking-[-0.035em] text-slate-950">Choose a new password</h1><p className="mt-3 text-center text-base leading-7 text-slate-600">Use a strong password you haven’t used before.</p><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.35)] sm:p-8"><ResetPasswordForm token={token} /></div></section></main>;
}
