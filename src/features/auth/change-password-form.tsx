"use client";

import { useState } from "react";
import { changeCurrentPassword } from "./api";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword.length < 8) { setError("Use a password with at least 8 characters."); return; }
    if (mismatch) { setError("Passwords must match."); return; }
    setPending(true);
    try {
      await changeCurrentPassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setSuccess(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not change your password.");
    } finally { setPending(false); }
  }

  return <form onSubmit={submit} className="rounded-2xl border bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Change password</h2><p className="mt-1 text-sm leading-6 text-slate-600">Use your current password to create a new password for this account.</p>{success && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Password changed successfully.</p>}{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}<div className="mt-6 space-y-5"><Field label="Current password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" /><Field label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" minLength={8} /><Field label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" minLength={8} error={mismatch ? "Passwords must match." : undefined} /></div><button type="submit" disabled={pending} className="mt-7 h-11 rounded-xl bg-emerald-700 px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Updating…" : "Change password"}</button></form>;
}

function Field({ label, value, onChange, autoComplete, minLength, error }: { label: string; value: string; onChange: (value: string) => void; autoComplete: string; minLength?: number; error?: string }) {
  return <label className="block text-sm font-medium text-slate-800">{label}<input type="password" value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} minLength={minLength} required className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" aria-invalid={Boolean(error)} />{error && <span role="alert" className="mt-1 block text-xs text-red-700">{error}</span>}</label>;
}
