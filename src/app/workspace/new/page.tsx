"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { developmentHeaders } from "@/lib/auth/development-client";

type Wedding = { _id: string; title: string; coupleNames: string[]; weddingDate: string; city?: string; timeZone?: string; currency?: string };

export default function CreateWeddingPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Wedding | null>(null);

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
      title: String(form.get("title") ?? "").trim(),
      coupleNames,
      weddingDate: String(form.get("weddingDate")),
      timeZone: "Asia/Kolkata",
      city: String(form.get("city") ?? "").trim() || undefined,
      currency: "INR",
    };
    try {
      const response = await fetch(editing ? `/api/v1/weddings/${editing._id}` : "/api/v1/weddings", { method: editing ? "PATCH" : "POST", headers: { ...developmentHeaders(), "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? `Could not ${editing ? "update" : "create"} your wedding workspace.`);
      if (editing) {
        setWeddings((current) => current.map((item) => item._id === editing._id ? body : item));
        setEditing(null);
      } else window.location.assign("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Could not ${editing ? "update" : "create"} your wedding workspace.`);
    } finally {
      setSaving(false);
    }
  }

  return <main className="setup-page">
    <header className="setup-topbar"><Link href="/" className="brand">Make My Marriage</Link><span>Workspace setup</span></header>
    <div className="setup-content">
      <p className="eyebrow">A place to plan together</p>
      <h1>{editing ? "Edit your wedding" : "Start with your wedding"}</h1>
      <p className="setup-intro">{editing ? "Update the title, couple names, date, or city for this wedding workspace." : "Add the title, couple names, date, and city now. You can build your event schedule next."}</p>
      <div className="dev-notice"><strong>Signed-in development workspace</strong><span>Your account session is stored in a secure HTTP-only cookie and workspace data is saved to MongoDB.</span></div>
      <form className="setup-form" onSubmit={createWedding} key={editing?._id ?? "new-wedding"}>
        <label>Wedding title<input name="title" maxLength={160} required defaultValue={editing?.title ?? ""} placeholder="e.g. Aarav & Meera's Wedding" /></label>
        <label>Groom name<input name="nameOne" autoComplete="given-name" maxLength={100} required defaultValue={editing?.coupleNames[0] ?? ""} placeholder="e.g. Aarav" /></label>
        <label>Bride name<input name="nameTwo" autoComplete="off" maxLength={100} required defaultValue={editing?.coupleNames[1] ?? ""} placeholder="e.g. Meera" /></label>
        <label>Wedding date<input name="weddingDate" type="date" required defaultValue={editing?.weddingDate ?? ""} /></label>
        <label>City <span className="optional-label">optional</span><input name="city" maxLength={160} defaultValue={editing?.city ?? ""} placeholder="e.g. Jaipur" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button className="landing-button setup-submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save wedding changes" : "Create wedding workspace →"}</button>{editing && <button type="button" className="text-button" onClick={() => { setEditing(null); setError(""); }}>Cancel</button>}</div>
      </form>
      {weddings.length > 0 && <section className="saved-workspaces"><h2>Your saved workspaces</h2>{weddings.map((wedding) => <div className="saved-workspace-row" key={wedding._id}><Link href={`/weddings/${wedding._id}/events`}><span><strong>{wedding.title}</strong><small>{wedding.coupleNames.join(" & ")} · {wedding.city ? `${wedding.city} · ` : ""}{wedding.weddingDate}</small></span><span aria-hidden="true">→</span></Link><button type="button" className="text-button" onClick={() => { setEditing(wedding); setError(""); }}>Edit</button></div>)}</section>}
    </div>
  </main>;
}
