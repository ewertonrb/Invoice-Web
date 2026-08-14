import { AcceptInvitation } from "@/features/invitations/accept-invitation";
export default async function AcceptInvitationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token } = await searchParams; return <div className="mx-auto mt-12 max-w-xl px-4"><AcceptInvitation token={token ?? ""} /></div>; }
