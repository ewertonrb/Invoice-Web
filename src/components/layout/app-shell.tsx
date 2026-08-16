"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building2, BriefcaseBusiness, CalendarDays, ClipboardCheck, FileText, Gauge, Menu, Receipt, Settings, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LogoutButton } from "@/features/auth/logout-button";
import { NotificationBell } from "@/features/notifications/notification-bell";
import type { AuthSession } from "@/lib/auth/types";
import { isPlatformAdmin } from "@/lib/auth/types";
import { can, type Permission } from "@/lib/permissions";

const items: Array<{ href: string; label: string; icon: typeof Gauge; permissions?: Permission[] }> = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/companies", label: "Companies", icon: Building2, permissions: ["company:manage"] },
  { href: "/projects", label: "Projects", icon: BriefcaseBusiness, permissions: ["projects:manage"] },
  { href: "/positions", label: "Positions", icon: Receipt, permissions: ["rates:manage"] },
  { href: "/rates", label: "Rate tables", icon: Receipt, permissions: ["rates:view"] },
  { href: "/workers", label: "Workers", icon: Users, permissions: ["workers:manage"] },
  { href: "/invitations", label: "Invitations", icon: Users, permissions: ["workers:manage"] },
  { href: "/work-logs", label: "Timesheets", icon: ClipboardCheck, permissions: ["workLogs:own", "workLogs:review"] },
  { href: "/shifts", label: "Shifts", icon: CalendarDays, permissions: ["shifts:view"] },
  { href: "/invoices", label: "Invoices", icon: FileText, permissions: ["invoices:view"] },
  { href: "/settings", label: "My Profile", icon: Settings, permissions: ["company:manage"] },
  { href: "/profile", label: "My profile", icon: Settings, permissions: ["profile:own"] },
];

export function AppShell({ session, children }: { session: AuthSession; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLElement>(null);
  const company = session.activeCompany!;
  const navigation = items.filter((item) => !item.permissions || item.permissions.some((permission) => can(company.role, permission)));

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }

      if (event.key === "Tab") {
        const focusable = mobileNavigationRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const sidebar = <><div className="flex h-16 items-center border-b border-slate-800 px-6"><Image src="/images/Invoice-api.png" alt="Invoice Platform" width={36} height={36} className="size-9 rounded-xl object-cover" /><strong className="ml-3 text-white">Invoice Platform</strong></div><nav className="flex-1 space-y-1 p-3">{isPlatformAdmin(session) && <Link href="/platform/companies" onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${pathname.startsWith("/platform") ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}><Building2 size={19} />Platform companies</Link>}{navigation.map(({ href, label, icon: Icon }) => { const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}><Icon size={19} />{label}</Link>; })}</nav><div className="border-t border-slate-800 p-4 text-xs text-slate-400"><span className="block truncate font-medium text-slate-200">{session.user.name} {session.user.surname}</span><span className="block truncate">{session.user.email}</span></div></>;

  return <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]"><aside className="hidden min-h-screen flex-col bg-slate-950 lg:flex">{sidebar}</aside>{open && <div className="fixed inset-0 z-50 flex lg:hidden"><button aria-label="Close navigation menu" tabIndex={-1} className="absolute inset-0 bg-slate-950/50" onClick={() => { setOpen(false); menuButtonRef.current?.focus(); }} /><aside ref={mobileNavigationRef} id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Main navigation" className="relative flex h-full w-[280px] flex-col bg-slate-950"><button ref={closeButtonRef} type="button" aria-label="Close navigation menu" onClick={() => { setOpen(false); menuButtonRef.current?.focus(); }} className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"><X aria-hidden="true" /></button>{sidebar}</aside></div>}<div className="min-w-0"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6"><button ref={menuButtonRef} type="button" aria-label="Open navigation menu" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 lg:hidden"><Menu aria-hidden="true" /></button><div className="hidden sm:block"><span className="block text-xs text-slate-500">Active company</span><strong className="text-sm text-slate-900">{company.companyName}</strong></div><div className="flex items-center gap-4"><NotificationBell companyId={company.companyId} /><Link href="/select-company" className="hidden text-sm font-medium text-emerald-700 sm:block">Switch company</Link><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{company.role}</span><LogoutButton /></div></header><main className="p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
