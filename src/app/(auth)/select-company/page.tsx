import { redirect } from "next/navigation";
import { CompanyPicker } from "@/features/auth/company-picker";
import { ApiError } from "@/lib/api/error";
import { getSession } from "@/lib/auth/server";
import { isPlatformAdmin } from "@/lib/auth/types";

export default async function SelectCompanyPage() {
  let session;
  try {
    session = await getSession();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/clear-session");
    }
    throw error;
  }
  if (!session) redirect("/login");
  if (isPlatformAdmin(session) && !session.companies.length) redirect("/platform/companies");
  if (!session.companies.length) return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="max-w-md rounded-3xl bg-white p-10 shadow-xl"><h1 className="text-2xl font-semibold">No companies available</h1><p className="mt-3 text-slate-600">Your account does not have an active company membership yet. Contact an administrator.</p></div></main>;
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="w-full max-w-xl"><p className="text-sm font-semibold text-emerald-700">Invoice Platform</p><h1 className="mt-2 text-3xl font-semibold">Choose a company</h1><p className="mb-8 mt-2 text-slate-600">The selected context defines the data and permissions available in this session.</p><CompanyPicker companies={session.companies} /></div></main>;
}
