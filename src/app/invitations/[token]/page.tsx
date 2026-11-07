import { createHash } from "node:crypto";
import Link from "next/link";
import { getDb } from "@/lib/db/mongodb";
import InvitationActions from "./invitation-actions";

type InvitationPageProps = { params: Promise<{ token: string }> };

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;
  const validToken = /^[a-f0-9]{64}$/i.test(token);
  const invitation = validToken
    ? await (await getDb()).collection("invitations").findOne({ tokenHash: createHash("sha256").update(token).digest("hex") }, { projection: { displayName: 1, email: 1, expiresAt: 1, status: 1 } })
    : null;
  const isAvailable = invitation?.status === "pending" && invitation.expiresAt > new Date();

  return <main className="invitation-page">
    <header className="setup-topbar"><Link href="/" className="brand">Make My Marriage</Link><Link href="/login" className="setup-back">Sign in</Link></header>
    <section className="invitation-card">
      <p className="landing-kicker">Family workspace invitation</p>
      {isAvailable ? <>
        <h1>You&apos;re invited, {invitation.displayName}.</h1>
        <p>Join the private wedding workspace using the account connected to {invitation.email}.</p>
        <InvitationActions token={token} />
        <small>This invitation expires in 7 days and can only be accepted by the invited email address.</small>
      </> : <>
        <h1>This invitation is no longer available.</h1>
        <p>The link may have expired, already been accepted, or been removed by the workspace owner.</p>
        <Link className="landing-button" href="/">Return home</Link>
      </>}
    </section>
  </main>;
}
