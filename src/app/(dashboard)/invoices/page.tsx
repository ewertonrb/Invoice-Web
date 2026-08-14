import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";
import { InvoiceList } from "@/features/invoices/invoice-list";
export default async function Page() { const session = await getSession(); if (!session?.activeCompany) redirect("/select-company"); return <InvoiceList companyId={session.activeCompany.companyId} canManage={can(session.activeCompany.role, "invoices:manage")} />; }
