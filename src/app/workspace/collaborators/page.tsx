"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { developmentHeaders } from "@/lib/auth/development-client";

type Wedding = { _id: string; title: string; coupleNames: string[]; weddingDate: string; city?: string };
type Invitation = { _id: string; displayName: string; email: string; role: string; expiresAt: string; invitationUrl?: string; delivery?: string };
const roleLabels: Record<string, string> = { admin: "Admin", manager: "Manager", collaborator: "Collaborator" };

export default function CollaboratorsPage() {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/v1/weddings", { headers: developmentHeaders() });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message ?? "Could not load your workspace.");
    const current = body.data?.[0] ?? null;
    setWedding(current);
    if (current) {
      const inviteResponse = await fetch(`/api/v1/weddings/${current._id}/invitations`, { headers: developmentHeaders() });
      const inviteBody = await inviteResponse.json();
      if (!inviteResponse.ok) throw new Error(inviteBody.error?.message ?? "Could not load invitations.");
      setInvitations(inviteBody.data ?? []);
    }
  }, []);

  useEffect(() => { load().catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load collaborators.")); }, [load]);

  async function removeInvitation(invitation: Invitation) {
      if (!wedding || !window.confirm(`Remove the pending invitation for ${invitation.displayName}?`)) return;
      setRemovingId(invitation._id); setError(""); setSuccess("");
      try {
        const response = await fetch(`/api/v1/weddings/${wedding._id}/invitations?invitationId=${encodeURIComponent(invitation._id)}`, { method: "DELETE", headers: developmentHeaders() });
        const body = response.status === 204 ? null : await response.json();
        if (!response.ok) throw new Error(body?.error?.message ?? "Could not remove invitation.");
        setInvitations((current) => current.filter((item) => item._id !== invitation._id));
        setSuccess("Pending invitation removed.");
      } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not remove invitation."); }
      finally { setRemovingId(""); }
  }

    async function invite(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!wedding) return;
      setSaving(true); setError(""); setSuccess("");
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      try {
        const response = await fetch(`/api/v1/weddings/${wedding._id}/invitations`, { method: "POST", headers: { ...developmentHeaders(), "content-type": "application/json" }, body: JSON.stringify({ displayName: form.get("displayName"), email: form.get("email"), role: form.get("role") }) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Could not create invitation.");
        setInvitations((current) => [body.invitation, ...current]);
        setSuccess(body.invitation.delivery === "sent" ? "Invitation sent with Resend." : `Development preview created: ${body.invitation.invitationUrl}`);
        formElement.reset();
        setShowForm(false);
      } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create invitation."); }
      finally { setSaving(false); }
    }

    return <main className="setup-page">
      <header className="setup-topbar"><Link href="/dashboard" className="brand">Make My Marriage</Link><Link href="/dashboard" className="setup-back">← Dashboard</Link></header>
      <div className="collaborators-content">
        <p className="eyebrow">{wedding?.title ?? "Wedding workspace"}</p>
        <div className="collaborators-heading"><div><h1>Family collaborators</h1><p className="setup-intro">Invite trusted family members to help plan your celebration.</p></div><button className="landing-button landing-button-small" type="button" onClick={() => setShowForm(true)}>Invite family member +</button></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="collaborators-success" role="status">{success}</p>}
        {showForm && <form className="setup-form collaborators-form" onSubmit={invite}>
          <h2>Invite family member</h2>
          <label>Full name<input name="displayName" required minLength={2} maxLength={100} placeholder="e.g. Priya Patel" /></label>
          <label>Email address<input name="email" type="email" required maxLength={254} placeholder="family@example.com" /></label>
          <label>Workspace role<select name="role" defaultValue="manager"><option value="manager">Manager - planning access</option><option value="admin">Admin - collaborator access</option><option value="collaborator">Collaborator - standard access</option></select></label>
          <div className="form-actions"><button className="landing-button setup-submit" disabled={saving}>{saving ? "Creating invitation..." : "Send invitation"}</button><button type="button" className="text-button" onClick={() => setShowForm(false)}>Cancel</button></div>
        </form>}
        <section className="collaborators-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Private access</p><h2>Invited family</h2></div><span>{invitations.length} pending</span></div>
          {invitations.length === 0 ? <div className="collaborators-empty"><h3>No family members invited yet</h3><p>Invite collaborators to help manage events, guests, tasks, expenses, and photos.</p><button className="landing-button landing-button-small" type="button" onClick={() => setShowForm(true)}>Invite the first member</button></div> : invitations.map((invitation) => <article className="collaborator-row" key={invitation._id}><div className="collaborator-avatar">{invitation.displayName.charAt(0).toUpperCase()}</div><div><h3>{invitation.displayName}</h3><p>{invitation.email} · {roleLabels[invitation.role] ?? invitation.role}</p></div><span className="collaborator-status">{invitation.delivery === "sent" ? "Email sent" : "Development preview"}</span><small>Expires {new Date(invitation.expiresAt).toLocaleDateString("en-IN")}</small><button type="button" className="text-button" onClick={() => void removeInvitation(invitation)} disabled={removingId === invitation._id}>{removingId === invitation._id ? "Removing…" : "Remove"}</button></article>)}
        </section>
      </div>
    </main>;
}
