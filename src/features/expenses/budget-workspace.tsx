"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { developmentHeaders } from "@/lib/auth/development-client";

type Summary = { budgetMinor: number | null; currency: string; paidMinor: number; dueMinor: number; estimatedMinor: number; remainingMinor: number | null; categories: { _id: string; amountMinor: number; count: number }[]; events: { eventId: string; eventName: string; amountMinor: number; paidMinor: number }[] };
type Expense = { _id: string; eventId?: string | null; description: string; category: string; amountMinor: number; currency: string; paidBy: { type: "user" | "family" | "other"; label: string }; paymentStatus: "estimated" | "due" | "paid" | "cancelled"; expenseDate: string; notes?: string | null };
type Event = { _id: string; name: string };
type Wedding = { budgetMinor?: number; currency?: string };

function money(minor: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(minor / 100);
}
function toMinor(value: FormDataEntryValue | null) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) <= 0) throw new Error("Enter an amount greater than zero.");
  return Math.round(amount * 100);
}

export default function BudgetWorkspace({ weddingId }: { weddingId: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const load = useCallback(async () => {
    setError("");
    const headers = developmentHeaders();
    const [summaryResponse, expenseResponse, eventResponse, weddingResponse] = await Promise.all([
      fetch(`/api/v1/weddings/${weddingId}/budget/summary`, { headers }),
      fetch(`/api/v1/weddings/${weddingId}/expenses`, { headers }),
      fetch(`/api/v1/weddings/${weddingId}/events`, { headers }),
      fetch(`/api/v1/weddings/${weddingId}`, { headers }),
    ]);
    const [summaryBody, expenseBody, eventBody, weddingBody] = await Promise.all([summaryResponse.json(), expenseResponse.json(), eventResponse.json(), weddingResponse.json()]);
    if (!summaryResponse.ok) throw new Error(summaryBody.error?.message ?? "Could not load the budget summary.");
    if (!expenseResponse.ok) throw new Error(expenseBody.error?.message ?? "Could not load expenses.");
    if (!eventResponse.ok) throw new Error(eventBody.error?.message ?? "Could not load wedding events.");
    if (!weddingResponse.ok) throw new Error(weddingBody.error?.message ?? "Could not load wedding settings.");
    setSummary(summaryBody); setExpenses(expenseBody.data ?? []); setEvents(eventBody.data ?? []); setWedding(weddingBody);
  }, [weddingId]);

  useEffect(() => { load().catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load the budget.")); }, [load]);

  async function saveExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setSaving(true); setError(""); setSuccess("");
    try {
      const payload = {
        eventId: String(form.get("eventId") ?? "") || null,
        description: String(form.get("description") ?? "").trim(),
        category: String(form.get("category") ?? "").trim(),
        amountMinor: toMinor(form.get("amount")),
        currency: summary?.currency ?? "INR",
        paidBy: { type: String(form.get("paidByType")), label: String(form.get("paidBy") ?? "").trim() },
        paymentStatus: String(form.get("paymentStatus")),
        expenseDate: String(form.get("expenseDate")),
        notes: String(form.get("notes") ?? "").trim() || null,
      };
      const response = await fetch(editing ? `/api/v1/weddings/${weddingId}/expenses/${editing._id}` : `/api/v1/weddings/${weddingId}/expenses`, { method: editing ? "PATCH" : "POST", headers: { ...developmentHeaders(), "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(body?.error?.message ?? "Could not save this expense.");
      setEditing(null); setSuccess(editing ? "Expense updated." : "Expense added."); element.reset(); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save this expense."); }
    finally { setSaving(false); }
  }

  async function removeExpense(expense: Expense) {
    if (!window.confirm(`Archive “${expense.description}”?`)) return;
    setError(""); setSuccess("");
    try {
      const response = await fetch(`/api/v1/weddings/${weddingId}/expenses/${expense._id}`, { method: "DELETE", headers: developmentHeaders() });
      if (!response.ok) { const body = await response.json(); throw new Error(body.error?.message ?? "Could not remove this expense."); }
      setSuccess("Expense removed from totals."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not remove this expense."); }
  }

  async function saveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`/api/v1/weddings/${weddingId}`, { method: "PATCH", headers: { ...developmentHeaders(), "content-type": "application/json" }, body: JSON.stringify({ budgetMinor: Math.round(Number(form.get("budget")) * 100) }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Could not update the wedding budget.");
      setWedding(body); setSuccess("Wedding budget updated."); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update the wedding budget."); }
    finally { setSaving(false); }
  }

  const currency = summary?.currency ?? "INR";
  const expenseDate = new Date().toISOString().slice(0, 10);

  return <div className="budget-workspace">
    <header className="setup-topbar"><Link href="/dashboard" className="brand">Make My Marriage</Link><Link href="/dashboard" className="setup-back">← Dashboard</Link></header>
    <div className="collaborators-content">
      <p className="eyebrow">Wedding planning</p><h1>Budget &amp; expenses</h1><p className="setup-intro">Record planned costs, amounts due, and payments in one shared ledger.</p>
      {error && <p className="form-error" role="alert">{error}</p>}{success && <p className="collaborators-success" role="status">{success}</p>}
      <section className="dashboard-hero-grid budget-summary-grid">
        <article className="dashboard-metric"><span className="dashboard-card-kicker">WEDDING BUDGET</span><strong>{summary?.budgetMinor == null ? "Not set" : money(summary.budgetMinor, currency)}</strong><p>Overall planning limit</p></article>
        <article className="dashboard-metric"><span className="dashboard-card-kicker">PAID · ACTUAL SPEND</span><strong>{money(summary?.paidMinor ?? 0, currency)}</strong><p>Only paid expenses count as spent.</p></article>
        <article className="dashboard-metric"><span className="dashboard-card-kicker">DUE · UNPAID</span><strong>{money(summary?.dueMinor ?? 0, currency)}</strong><p>Recorded amounts still to be paid.</p></article>
        <article className="dashboard-metric"><span className="dashboard-card-kicker">ESTIMATED</span><strong>{money(summary?.estimatedMinor ?? 0, currency)}</strong><p>Estimates are excluded from actual spend.</p></article>
      </section>
      <section className="dashboard-panel budget-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Wedding-wide limit</p><h2>Set your total budget</h2></div>{summary?.remainingMinor != null && <span>{money(summary.remainingMinor, currency)} remaining after paid expenses</span>}</div>
        <form className="budget-inline-form" onSubmit={saveBudget}><label>Total budget ({currency})<input name="budget" type="number" min="0" step="0.01" required defaultValue={wedding?.budgetMinor != null ? (wedding.budgetMinor / 100).toFixed(2) : ""} placeholder="e.g. 300000" /></label><button className="landing-button landing-button-small" disabled={saving}>{saving ? "Saving…" : "Save budget"}</button></form>
      </section>
      <div className="events-layout budget-layout">
        <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Ledger</p><h2>Expenses</h2></div><span>{expenses.length} records</span></div>
          {expenses.length === 0 ? <div className="collaborators-empty"><h3>No expenses recorded</h3><p>Add an estimate, upcoming bill, or payment to start your ledger.</p></div> : <div className="budget-expense-list">{expenses.map((expense) => <article className="budget-expense-row" key={expense._id}>
            <div className="dashboard-date"><strong>{new Date(`${expense.expenseDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit" })}</strong><small>{new Date(`${expense.expenseDate}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })}</small></div>
            <div className="budget-expense-info"><h3>{expense.description}</h3><p>{[expense.category, events.find((item) => item._id === expense.eventId)?.name, expense.paidBy.label].filter(Boolean).join(" · ")}</p></div>
            <div className="budget-expense-amount"><strong>{money(expense.amountMinor, expense.currency)}</strong><small className={`expense-status expense-status-${expense.paymentStatus}`}>{expense.paymentStatus}</small></div>
            <div className="event-record-actions"><button type="button" onClick={() => setEditing(expense)}>Edit</button><button type="button" onClick={() => void removeExpense(expense)}>Remove</button></div>
          </article>)}</div>}
        </section>
        <section className="event-form-panel"><p className="eyebrow">{editing ? "Update ledger entry" : "New ledger entry"}</p><h2>{editing ? "Edit expense" : "Add an expense"}</h2>
          <form className="setup-form event-form" onSubmit={saveExpense} key={editing?._id ?? "new-expense"}>
            <label>Description<input name="description" required maxLength={200} defaultValue={editing?.description ?? ""} placeholder="e.g. Venue advance" /></label>
            <label>Amount ({currency})<input name="amount" type="number" required min="0.01" step="0.01" defaultValue={editing ? (editing.amountMinor / 100).toFixed(2) : ""} placeholder="0.00" /></label>
            <label>Category<input name="category" required maxLength={80} defaultValue={editing?.category ?? ""} placeholder="e.g. Venue, catering, decor" /></label>
            <label>Event <span className="optional-label">optional</span><select name="eventId" defaultValue={editing?.eventId ?? ""}><option value="">Wedding-wide / unassigned</option>{events.map((item) => <option value={item._id} key={item._id}>{item.name}</option>)}</select></label>
            <label>Payment status<select name="paymentStatus" defaultValue={editing?.paymentStatus ?? "estimated"}><option value="estimated">Estimated</option><option value="due">Due</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select></label>
            <label>Expense date<input name="expenseDate" type="date" required defaultValue={editing?.expenseDate ?? expenseDate} /></label>
            <label>Paid by<input name="paidBy" required maxLength={120} defaultValue={editing?.paidBy.label ?? ""} placeholder="Person or family name" /></label>
            <label>Payer type<select name="paidByType" defaultValue={editing?.paidBy.type ?? "family"}><option value="family">Family</option><option value="user">Workspace member</option><option value="other">Other</option></select></label>
            <label>Notes <span className="optional-label">optional</span><textarea name="notes" rows={2} maxLength={2000} defaultValue={editing?.notes ?? ""} /></label>
            <div className="form-actions"><button className="landing-button setup-submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add expense"}</button>{editing && <button className="text-button" type="button" onClick={() => setEditing(null)}>Cancel</button>}</div>
          </form>
        </section>
      </div>
      {(summary?.categories.length || summary?.events.length) ? <section className="dashboard-columns budget-breakdowns">
        <article className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Where it goes</p><h2>By category</h2></div></div>{summary.categories.map((row) => <div className="dashboard-expense-row" key={row._id}><span>{row._id}</span><b>{money(row.amountMinor, currency)}</b></div>)}</article>
        <article className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Event allocation</p><h2>By event</h2></div></div>{summary.events.map((row) => <div className="dashboard-expense-row" key={row.eventId}><span><strong>{row.eventName}</strong><small>{money(row.paidMinor, currency)} paid</small></span><b>{money(row.amountMinor, currency)}</b></div>)}</article>
      </section> : null}
    </div>
  </div>;
}
