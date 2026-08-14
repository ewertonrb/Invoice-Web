"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ApiError, toApiError } from "@/lib/api/error";
import type { CurrentUser } from "@/lib/auth/types";

const infoSchema = z.object({ companyName: z.string(), role: z.literal("WORKER"), remainingUses: z.number(), expiresAt: z.string(), valid: z.boolean() });
const acceptedSchema = z.object({ companyName: z.string(), membershipStatus: z.literal("ACTIVE"), remainingUses: z.number() }).passthrough();

async function call(path: string, init?: RequestInit) {
  let response: Response;
  try { response = await fetch(`/api/public-join-links${path}`, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) }, cache: "no-store" }); }
  catch { throw new ApiError(503, "Could not connect to the server."); }
  if (!response.ok) throw await toApiError(response);
  return response.json();
}

type Info = z.infer<typeof infoSchema>;

export function JoinLink({ token, user }: { token: string; user: CurrentUser | null }) {
  const [info, setInfo] = useState<Info>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(Boolean(token));
  const [joining, setJoining] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [joined, setJoined] = useState(false);
  const returnTo = `/join?token=${encodeURIComponent(token)}`;

  useEffect(() => {
    let current = true;
    if (!token) return;
    call(`?token=${encodeURIComponent(token)}`).then((data) => { if (current) setInfo(infoSchema.parse(data)); }).catch((reason) => { if (current) setError(reason instanceof Error ? reason.message : "This link is unavailable."); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [token]);

  async function register(formData: FormData) {
    setRegistering(true); setError(undefined);
    try {
      const result = await call("/register", { method: "POST", body: JSON.stringify({ name: formData.get("name"), surname: formData.get("surname"), email: formData.get("email"), password: formData.get("password"), token }) });
      const joinedResult = acceptedSchema.parse(result);
      const selected = await fetch("/api/auth/select-company", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId: result.companyId }) });
      if (!selected.ok) throw new ApiError(selected.status, "Account created, but the company could not be selected.");
      setJoined(true);
      void joinedResult;
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create the account."); }
    finally { setRegistering(false); }
  }

  async function accept() {
    setJoining(true); setError(undefined);
    try { acceptedSchema.parse(await call("/accept", { method: "POST", body: JSON.stringify({ token }) })); setJoined(true); }
    catch (reason) { if (reason instanceof ApiError && reason.status === 401) { window.location.replace(`/api/auth/clear-session?next=${encodeURIComponent(returnTo)}`); return; } setError(reason instanceof Error ? reason.message : "Could not join the company."); }
    finally { setJoining(false); }
  }

  if (!token) return <State title="Invalid link" text="This join link has no token." />;
  if (loading) return <div aria-label="Validating join link" className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (error && !info) return <State title="Join link unavailable" text={error} />;
  if (!info?.valid) return <State title="Join link unavailable" text="This link is expired, disabled, or has reached its usage limit." />;
  if (joined) return <State title="Company joined" text={`Your membership with ${info.companyName} is active.`} />;

  return <div className="rounded-2xl border bg-white p-7">
    <h1 className="text-2xl font-semibold">Join {info.companyName}</h1>
    <p className="mt-2 text-slate-600">Public Worker link · {info.remainingUses} uses remaining · expires {new Date(info.expiresAt).toLocaleString("en-AU")}.</p>
    {!user ? <form action={register} className="mt-7 space-y-4">
      <p className="text-sm text-slate-600">Create your account to join this company as a worker.</p>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <input name="name" required minLength={2} placeholder="First name" className={inputClass} />
      <input name="surname" required minLength={2} placeholder="Surname" className={inputClass} />
      <input name="email" required type="email" placeholder="Email address" className={inputClass} />
      <input name="password" required minLength={8} type="password" placeholder="Password (minimum 8 characters)" className={inputClass} />
      <button disabled={registering} className="h-11 w-full rounded-xl bg-emerald-700 px-5 font-semibold text-white disabled:opacity-60">{registering ? "Creating account…" : "Create account and join"}</button>
      <p className="text-center text-sm text-slate-500">Already have an account? <Link href={`/login?next=${encodeURIComponent(returnTo)}`} className="font-semibold text-emerald-700">Sign in</Link></p>
    </form> : <div className="mt-7">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <p className="rounded-xl bg-slate-50 p-4 text-sm">Joining as <strong>{user.name} {user.surname}</strong><br />{user.email}</p>
      <button type="button" disabled={joining} onClick={() => void accept()} className="mt-4 h-11 rounded-xl bg-emerald-700 px-5 font-semibold text-white disabled:opacity-60">{joining ? "Joining…" : "Join company"}</button>
    </div>}
  </div>;
}

const inputClass = "h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";

function State({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border bg-white p-8 text-center"><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-2 text-slate-600">{text}</p><Link href="/login" className="mt-5 inline-flex font-semibold text-emerald-700">Go to login</Link></div>; }
