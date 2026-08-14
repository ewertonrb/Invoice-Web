import { redirect } from "next/navigation";
import { ImageUpload } from "@/features/images/image-upload";
import { ProfileForm } from "@/features/workers/profile-form";
import { getSession } from "@/lib/auth/server";
import { can } from "@/lib/permissions";
import { ChangePasswordForm } from "@/features/auth/change-password-form";

export default async function SettingsPage() {
  const session = await getSession();
  const company = session?.activeCompany;
  if (!company) redirect("/select-company");
  if (!can(company.role, "company:manage")) redirect("/dashboard");

  return <div className="mx-auto max-w-5xl">
    <p className="text-sm font-semibold text-emerald-700">Administration</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Settings</h1>
    <p className="mt-2 max-w-2xl text-slate-600">Manage the personal details associated with your account. All contractor fields are optional.</p>
    <section aria-labelledby="personal-settings-heading" className="mt-8">
      <h2 id="personal-settings-heading" className="text-xl font-semibold text-slate-950">Personal details</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Optional contractor details for your own account. You can complete these later and still manage the company normally.</p>
      <ImageUpload endpoint="/users/me/avatar" label="Profile image" fallbackSrc="/images/default-avatar.png" />
      <ProfileForm companyId={company.companyId} />
      <div className="mt-8"><ChangePasswordForm /></div>
    </section>
  </div>;
}
