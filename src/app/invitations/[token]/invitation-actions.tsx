"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type InvitationActionsProps = { token: string };

export default function InvitationActions({ token }: InvitationActionsProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const next = `/invitations/${token}`;

  async function accept() {
    setAccepting(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/invitations/${token}/accept`, { method: "POST" });
      const body = await response.json();
      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      if (!response.ok) throw new Error(body.error?.message ?? "Could not accept this invitation.");
      router.push("/dashboard");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not accept this invitation.");
    } finally {
      setAccepting(false);
    }
  }

  return <div className="invitation-actions">
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="landing-button" type="button" onClick={accept} disabled={accepting}>{accepting ? "Joining workspace..." : "Accept invitation"}</button>
    <Link className="text-button invitation-signin" href={`/login?next=${encodeURIComponent(next)}`}>Sign in with another account</Link>
  </div>;
}
