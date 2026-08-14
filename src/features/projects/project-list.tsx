"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Eye, Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useProjects } from "./hooks";
import { PageHeader, ProjectError } from "./ui";

export function ProjectList({ companyId }: { companyId: number }) {
  const [activeOnly, setActiveOnly] = useState(true);
  const [search, setSearch] = useState("");
  const query = useProjects(companyId, activeOnly);
  const projects = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return term ? (query.data ?? []).filter((project) => project.name.toLocaleLowerCase().includes(term)) : (query.data ?? []);
  }, [query.data, search]);
  return <div className="mx-auto max-w-7xl">
    <PageHeader eyebrow="Project management" title="Projects" description="Manage projects for the active company and keep operational records correctly scoped." action={<Link href="/projects/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"><Plus size={18} aria-hidden="true" />New project</Link>} />
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-md"><span className="sr-only">Search projects by name</span><Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></label>
      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} className="size-5 rounded border-slate-300 accent-emerald-700" />Active only</label>
    </div>
    <div className="mt-5">
      {query.isPending && <Loading />}
      {query.isError && <ProjectError message={query.error instanceof Error ? query.error.message : "Please try again."} retry={() => query.refetch()} />}
      {query.isSuccess && projects.length === 0 && <Empty filtered={Boolean(search.trim())} />}
      {projects.length > 0 && <div className="grid gap-4 lg:grid-cols-2">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>}
    </div>
  </div>;
}

function ProjectCard({ project }: { project: NonNullable<ReturnType<typeof useProjects>["data"]>[number] }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-6"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><BriefcaseBusiness size={21} aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-semibold text-slate-950">{project.name}</h2><Status active={project.active} /></div><p className="mt-1 truncate text-sm text-slate-600">{project.companyName}</p></div></div><dl className="mt-5 border-t border-slate-100 pt-4"><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Updated</dt><dd className="mt-1 text-sm font-medium text-slate-800">{formatDate(project.updatedAt)}</dd></dl><div className="mt-5 flex flex-wrap gap-2"><Link href={`/projects/${project.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Eye size={16} aria-hidden="true" />View</Link><Link href={`/projects/${project.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={16} aria-hidden="true" />Edit</Link></div></article>;
}

function Status({ active }: { active: boolean }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{active ? "Active" : "Inactive"}</span>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(new Date(value)); }
function Loading() { return <div aria-label="Loading projects" className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />)}</div>; }
function Empty({ filtered }: { filtered: boolean }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><BriefcaseBusiness className="mx-auto text-slate-400" aria-hidden="true" /><h2 className="mt-3 font-semibold text-slate-900">{filtered ? "No matching projects" : "No projects found"}</h2><p className="mt-1 text-sm text-slate-600">{filtered ? "Try a different project name." : "Create a project to get started."}</p></div>; }
