import Link from "next/link";
import { PlatformCompanyForm } from "@/features/platform/platform-company-form";
import { LogoutButton } from "@/features/auth/logout-button";

export default function NewPlatformCompanyPage() {
  return <main className="min-h-screen bg-slate-50 p-5 sm:p-8"><div className="mx-auto max-w-4xl"><div className="flex items-center justify-between gap-4"><Link href="/platform/companies" className="text-sm font-semibold text-emerald-700">← Back to companies</Link><LogoutButton /></div><div className="mt-5"><p className="text-sm font-semibold text-emerald-700">Platform administration</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Create company</h1><p className="mt-3 text-slate-600">The owner will receive access to the new company immediately.</p></div><PlatformCompanyForm /></div></main>;
}
