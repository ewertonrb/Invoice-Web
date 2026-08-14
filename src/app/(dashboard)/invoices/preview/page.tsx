import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";
import { InvoicePreview } from "@/features/invoices/invoice-preview";
export default async function Page() { const session = await getSession(); if (!session?.activeCompany) redirect("/select-company"); if (!can(session.activeCompany.role, "invoices:manage")) redirect("/invoices"); return <InvoicePreview companyId={session.activeCompany.companyId} />; }
