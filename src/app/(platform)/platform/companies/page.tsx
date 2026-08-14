import Link from "next/link";
import { PlatformCompanyList } from "@/features/platform/platform-company-list";
import { LogoutButton } from "@/features/auth/logout-button";

export default function PlatformCompaniesPage() {
  return <main className="min-h-screen bg-slate-50 p-5 sm:p-8"><div className="mx-auto max-w-7xl"><div className="flex items-center justify-end"><LogoutButton /></div><div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-emerald-700">Platform administration</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Companies</h1><p className="mt-3 max-w-2xl text-slate-600">Create and manage companies across the Invoice Platform.</p></div><Link href="/platform/companies/new" className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800">New company</Link></div><PlatformCompanyList /></div></main>;
}
