import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";
import { InvoiceDetail } from "@/features/invoices/invoice-detail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const session = await getSession(); if (!session?.activeCompany) redirect("/select-company"); const id = Number((await params).id); if (!Number.isSafeInteger(id) || id <= 0) notFound(); return <InvoiceDetail companyId={session.activeCompany.companyId} id={id} canManage={can(session.activeCompany.role, "invoices:manage")} />; }
