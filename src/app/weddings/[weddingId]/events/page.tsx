"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { developmentHeaders } from "@/lib/auth/development-client";

type Wedding = { _id: string; coupleNames: string[]; weddingDate: string; city?: string };
type EventRecord = { _id: string; name: string; dateLocal: string; startTimeLocal?: string; endTimeLocal?: string; timeZone: string; venue?: { name?: string; address?: string; notes?: string }; description?: string; sortOrder: number };

export default function WeddingEventsPage({ params }: { params: Promise<{ weddingId: string }> }) {
  const [weddingId, setWeddingId] = useState("");
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [editing, setEditing] = useState<EventRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { params.then(({ weddingId: id }) => setWeddingId(id)); }, [params]);
  const load = useCallback(async () => {
    if (!weddingId) return;
    setLoading(true);
    setError("");
    try {
      const [weddingResponse, eventsResponse] = await Promise.all([
        fetch(`/api/v1/weddings/${weddingId}`, { headers: developmentHeaders() }),
        fetch(`/api/v1/weddings/${weddingId}/events`, { headers: developmentHeaders() }),
      ]);
      const weddingBody = await weddingResponse.json();
      const eventsBody = await eventsResponse.json();
      if (!weddingResponse.ok) throw new Error(weddingBody.error?.message ?? "Could not load this wedding.");
      if (!eventsResponse.ok) throw new Error(eventsBody.error?.message ?? "Could not load its events.");
      setWedding(weddingBody);
      setEvents(eventsBody.data ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load this wedding.");
    } finally { setLoading(false); }
  }, [weddingId]);
  useEffect(() => { void load(); }, [load]);

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!weddingId) return;
    setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name")).trim(), dateLocal: String(form.get("dateLocal")),
      startTimeLocal: String(form.get("startTimeLocal") ?? "") || undefined,
      endTimeLocal: String(form.get("endTimeLocal") ?? "") || undefined,
      timeZone: "Asia/Kolkata",
      venue: { name: String(form.get("venueName") ?? "").trim() || undefined, address: String(form.get("address") ?? "").trim() || undefined, notes: String(form.get("notes") ?? "").trim() || undefined },
      description: String(form.get("description") ?? "").trim() || undefined,
    };
    try {
      const response = await fetch(editing ? `/api/v1/weddings/${weddingId}/events/${editing._id}` : `/api/v1/weddings/${weddingId}/events`, {
        method: editing ? "PATCH" : "POST", headers: { ...developmentHeaders(), "content-type": "application/json" }, body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not save this event.");
      setEditing(null);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save this event."); }
    finally { setSaving(false); }
  }

  async function archiveEvent(eventItem: EventRecord) {
    if (!window.confirm(`Remove “${eventItem.name}” from this event schedule?`)) return;
    const response = await fetch(`/api/v1/weddings/${weddingId}/events/${eventItem._id}`, { method: "DELETE", headers: developmentHeaders() });
    if (!response.ok) { const body = await response.json(); setError(body.error?.message ?? "Could not remove the event."); return; }
    await load();
  }

  return <main className="setup-page">
    <header className="setup-topbar"><Link href="/" className="brand">Make My Marriage</Link><Link href="/workspace/new" className="setup-back">← All workspaces</Link></header>
    <div className="events-content">
      <div className="dev-notice"><strong>Local development preview</strong><span>Changes save to MongoDB. Email sign-in and family access are not connected yet.</span></div>
      {wedding && <><p className="eyebrow">Wedding workspace · {wedding.weddingDate}{wedding.city ? ` · ${wedding.city}` : ""}</p><h1>{wedding.coupleNames.join(" & ")}</h1><p className="setup-intro">Set up the celebrations in your wedding schedule.</p></>}
      <div className="events-layout">
        <section className="events-list-panel"><div className="events-list-heading"><div><p className="eyebrow">Your schedule</p><h2>Wedding events</h2></div><span>{events.length} {events.length === 1 ? "event" : "events"}</span></div>
          {loading ? <p className="muted">Loading your wedding…</p> : events.length === 0 ? <div className="empty-events"><span aria-hidden="true">✳</span><h3>Your event schedule starts here</h3><p>Add a ceremony, gathering, or any celebration. You can change the names and dates whenever you need.</p></div> : <div className="event-record-list">{events.map((item, index) => <article className="event-record" key={item._id}>
            <div className="event-date-chip"><strong>{new Date(`${item.dateLocal}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit" })}</strong><small>{new Date(`${item.dateLocal}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })}</small></div>
            <div className="event-record-info"><h3>{item.name}</h3><p>{[item.startTimeLocal, item.venue?.name, item.venue?.address].filter(Boolean).join(" · ") || "Event details can be added"}</p></div>
            <div className="event-record-actions"><button type="button" onClick={() => setEditing(item)}>Edit</button><button type="button" aria-label={`Remove ${item.name}`} onClick={() => void archiveEvent(item)}>Remove</button></div>
          </article>)}</div>}
        </section>
        <section className="event-form-panel"><p className="eyebrow">{editing ? "Update details" : "Build your schedule"}</p><h2>{editing ? "Edit event" : "Add an event"}</h2>
          <form className="setup-form event-form" onSubmit={saveEvent} key={editing?._id ?? "new-event"}>
            <label>Event name<input name="name" required maxLength={120} defaultValue={editing?.name ?? ""} placeholder="e.g. Mehendi, Reception" /></label>
            <label>Date<input name="dateLocal" type="date" required defaultValue={editing?.dateLocal ?? ""} /></label>
            <div className="time-fields"><label>Starts at<input name="startTimeLocal" type="time" defaultValue={editing?.startTimeLocal ?? ""} /></label><label>Ends at <span className="optional-label">optional</span><input name="endTimeLocal" type="time" defaultValue={editing?.endTimeLocal ?? ""} /></label></div>
            <label>Venue name <span className="optional-label">optional</span><input name="venueName" maxLength={160} defaultValue={editing?.venue?.name ?? ""} /></label>
            <label>Address <span className="optional-label">optional</span><input name="address" maxLength={500} defaultValue={editing?.venue?.address ?? ""} /></label>
            <label>Notes <span className="optional-label">optional</span><textarea name="description" rows={3} maxLength={4000} defaultValue={editing?.description ?? editing?.venue?.notes ?? ""} placeholder="Anything family should know" /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-actions"><button className="landing-button setup-submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add event →"}</button>{editing && <button type="button" className="text-button" onClick={() => setEditing(null)}>Cancel</button>}</div>
          </form>
        </section>
      </div>
    </div>
  </main>;
}
