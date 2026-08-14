import { UserAvatar } from "@/features/images/user-avatar";

export function WorkerAvatar({ companyId, workerProfileId, name, size = "md" }: { companyId: number; workerProfileId: number; name: string; size?: "sm" | "md" }) {
  return <UserAvatar src={`/api/backend/companies/${companyId}/workers/${workerProfileId}/avatar?v=1`} name={name} size={size === "sm" ? 40 : 48} className={size === "sm" ? "size-10" : "size-12"} />;
}
