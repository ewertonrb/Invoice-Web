import { redirect } from "next/navigation";
import { ProfileForm } from "@/features/workers/profile-form";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";
import { ImageUpload } from "@/features/images/image-upload";
import { ChangePasswordForm } from "@/features/auth/change-password-form";

export default async function ProfilePage() {
  const session = await getSession();
  const company = session?.activeCompany;
  if (!company) redirect("/select-company");
  if (!can(company.role, "profile:own") && !can(company.role, "workLogs:own")) redirect("/dashboard");
  return <div className="mx-auto max-w-5xl"><h1 className="text-3xl font-semibold">My worker profile</h1><p className="mb-7 mt-2 text-slate-600">Maintain the contractor details supported by the backend. TFN is not collected by this application.</p><ImageUpload endpoint="/users/me/avatar" label="Profile image" fallbackSrc="/images/default-avatar.png" /><ProfileForm companyId={company.companyId} /><div className="mt-8"><ChangePasswordForm /></div></div>;
}
