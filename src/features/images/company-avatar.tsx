"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";

export function CompanyAvatar({ companyId, name }: { companyId: number; name: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-700" aria-label={`${name} logo`}>
    {!failed && <img src={`/api/backend/companies/${companyId}/logo?v=1`} alt="" className="size-full object-cover" onError={() => setFailed(true)} />}
    {failed && <Building2 size={22} aria-hidden="true" />}
  </div>;
}
