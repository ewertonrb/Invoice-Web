import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";

export default async function NewCompanyPage() {
  const session = await getSession();
  if (!session?.activeCompany) redirect("/select-company");
  redirect("/dashboard");
}
