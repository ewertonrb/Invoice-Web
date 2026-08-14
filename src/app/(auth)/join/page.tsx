import { JoinLink } from "@/features/invitations/join-link";
import { getSession } from "@/lib/auth/server";
export default async function JoinPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token = "" } = await searchParams; const session = await getSession().catch(() => null); return <div className="mx-auto mt-12 max-w-xl px-4"><JoinLink token={token} user={session?.user ?? null} /></div>; }
