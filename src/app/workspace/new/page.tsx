"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { developmentHeaders } from "@/lib/auth/development-client";

type Wedding = { _id: string; coupleNames: string[]; weddingDate: string; city?: string };

export default function CreateWeddingPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/v1/weddings", { headers: developmentHeaders() })
      .then(async (response) => response.ok ? response.json() : null)
      .then((body) => body && setWeddings(body.data ?? []))
      .catch(() => setError("Could not load your saved workspaces."));
  }, []);

  async function createWedding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const coupleNames = [String(form.get("nameOne") ?? "").trim(), String(form.get("nameTwo") ?? "").trim()].filter(Boolean);
    const payload = {
      coupleNames,
      weddingDate: String(form.get("weddingDate")),
      timeZone: "Asia/Kolkata",
      city: String(form.get("city") ?? "").trim() || undefined,
      currency: "INR",
    };
    try {
      const response = await fetch("/api/v1/weddings", { method: "POST", headers: { ...developmentHeaders(), "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not create your wedding workspace.");
      window.location.assign(`/weddings/${body._id}/events`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create your wedding workspace.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="setup-page">
    <header className="setup-topbar"><Link href="/" className="brand">Make My Marriage</Link><span>Workspace setup</span></header>
    <div className="setup-content">
      <p className="eyebrow">A place to plan together</p>
      <h1>Start with your wedding</h1>
      <p className="setup-intro">Add the basics now. You can update them and build your event schedule next.</p>
      <div className="dev-notice"><strong>Signed-in development workspace</strong><span>Your account session is stored in a secure HTTP-only cookie and workspace data is saved to MongoDB.</span></div>
      <form className="setup-form" onSubmit={createWedding}>
        <label>First name<input name="nameOne" autoComplete="given-name" maxLength={100} required placeholder="e.g. Aarav" /></label>
        <label>Second name <span className="optional-label">optional</span><input name="nameTwo" maxLength={100} placeholder="e.g. Meera" /></label>
        <label>Wedding date<input name="weddingDate" type="date" required /></label>
        <label>City <span className="optional-label">optional</span><input name="city" maxLength={160} placeholder="e.g. Jaipur" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="landing-button setup-submit" disabled={saving}>{saving ? "Creating workspace…" : "Create wedding workspace →"}</button>
      </form>
      {weddings.length > 0 && <section className="saved-workspaces"><h2>Your saved workspaces</h2>{weddings.map((wedding) => <Link key={wedding._id} href={`/weddings/${wedding._id}/events`}><span><strong>{wedding.coupleNames.join(" & ")}</strong><small>{wedding.city ? `${wedding.city} · ` : ""}{wedding.weddingDate}</small></span><span aria-hidden="true">→</span></Link>)}</section>}
    </div>
  </main>;
}
