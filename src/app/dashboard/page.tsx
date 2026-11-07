import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { demoDashboard } from "@/features/dashboard/demo-data";
import { LogoutButton } from "@/app/components/logout-button";
import { readSessionUserId } from "@/lib/auth/credentials";
import { getDb } from "@/lib/db/mongodb";

function formatMoney(minor: number) {
  return `₹${(minor / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mmm_session")?.value;
  const request = new Request("http://localhost", { headers: { cookie: session ? `mmm_session=${session}` : "" } });
  const userId = readSessionUserId(request);
  if (!userId) redirect("/login");
  const user = await (await getDb()).collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { displayName: 1 } });
  if (!user) redirect("/login");
  const workspace = await (await getDb()).collection("memberships").findOne({ userId: new ObjectId(userId), status: "active" }, { projection: { _id: 1 } });
  if (!workspace) redirect("/workspace/new");

  const totalGuests = demoDashboard.guests.confirmed + demoDashboard.guests.awaiting + demoDashboard.guests.declined;
  const responseRate = Math.round((demoDashboard.guests.confirmed / totalGuests) * 100);

  return <main className="dashboard-page">
    <header className="dashboard-topbar">
      <Link className="dashboard-brand" href="/">Make My Marriage</Link>
      <nav className="dashboard-nav" aria-label="Workspace navigation"><Link className="dashboard-nav-active" href="/dashboard">Overview</Link><Link href="/workspace/new">Events</Link><Link href="/workspace/new">Guests</Link><Link href="/workspace/new">Tasks</Link><Link href="/workspace/new">Budget</Link></nav>
      <div className="dashboard-account"><span>{user.displayName}</span><LogoutButton /></div>
    </header>
    <div className="dashboard-content">
      <div className="dashboard-notice"><strong>Development dashboard</strong><span>Sample planning data is shown here. Your account and sessions are connected to MongoDB.</span></div>
      <section className="dashboard-heading"><div><p className="landing-kicker">Aarav &amp; Meera&apos;s wedding · {demoDashboard.wedding.city}</p><h1>Good morning, {user.displayName}.</h1><p>Here is the shape of your celebration at a glance.</p></div><div className="dashboard-heading-actions"><Link className="landing-button landing-button-small" href="/workspace/new">Add to workspace <span aria-hidden="true">+</span></Link><Link className="dashboard-public-link" href="/">Public view ↗</Link></div></section>
      <section className="dashboard-hero-grid"><article className="dashboard-next panel-next"><div className="dashboard-card-kicker">NEXT CELEBRATION <span>3 DAYS TO GO</span></div><h2>Mehendi Ceremony</h2><p>Garden Terrace · Jaipur, Rajasthan</p><div className="dashboard-next-meta"><span>12 February 2027</span><span>11:00 onwards</span></div><Link className="dashboard-card-link" href="/events/mehendi">Open event workspace →</Link></article><article className="dashboard-metric"><span className="dashboard-card-kicker">GUEST LIST</span><strong>{demoDashboard.guests.confirmed} <small>of {totalGuests}</small></strong><div className="dashboard-progress"><span style={{ width: `${responseRate}%` }} /></div><p>{responseRate}% confirmed · {demoDashboard.guests.awaiting} awaiting response</p></article><article className="dashboard-metric"><span className="dashboard-card-kicker">BUDGET &amp; EXPENSES</span><strong>{formatMoney(demoDashboard.budget.spentMinor)} <small>spent</small></strong><div className="dashboard-progress dashboard-progress-green"><span style={{ width: "61%" }} /></div><p>{formatMoney(demoDashboard.budget.remainingMinor)} remaining · sample data</p></article></section>
      <section className="dashboard-columns"><article className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Upcoming</p><h2>Wedding events</h2></div><Link href="/workspace/new">View all →</Link></div>{demoDashboard.upcomingEvents.map((event) => <div className="dashboard-event-row" key={event.id}><div className="dashboard-date"><strong>{new Date(`${event.dateLocal}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit" })}</strong><small>{new Date(`${event.dateLocal}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })}</small></div><div><h3>{event.name}</h3><p>{event.startTimeLocal} · {event.venue.name}</p></div><Link href={`/events/${event.id}`}>Details</Link></div>)}</article><article className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Action items</p><h2>Tasks &amp; shopping</h2></div><Link href="/workspace/new">Add task +</Link></div><div className="dashboard-stat-line"><strong>{demoDashboard.tasks.open}</strong><span>open tasks</span><strong>{demoDashboard.tasks.dueSoon}</strong><span>due soon</span></div><div className="dashboard-task-row"><span className="dashboard-check">✓</span><span><strong>Confirm mehendi artist</strong><small>Due tomorrow · Meera P.</small></span></div><div className="dashboard-task-row"><span className="dashboard-check"/><span><strong>Pick up sherwani and safa trials</strong><small>Due 10 February · Aarav S.</small></span></div></article></section>
      <section className="dashboard-columns"><article className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Recent ledger</p><h2>Budget &amp; expenses</h2></div><Link href="/workspace/new">Add expense +</Link></div>{demoDashboard.recentExpenses.map((expense) => <div className="dashboard-expense-row" key={expense.id}><span className="dashboard-expense-icon">₹</span><span><strong>{expense.description}</strong><small>{expense.eventName} · {expense.paymentStatus}</small></span><b>{formatMoney(expense.amountMinor)}</b></div>)}</article><article className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Family updates</p><h2>Latest activity</h2></div><Link href="/workspace/new">See all →</Link></div><div className="dashboard-update"><span className="dashboard-update-dot"/><p>Meera added a receipt for Mehendi decor<small>14 minutes ago · sample activity</small></p></div><div className="dashboard-update"><span className="dashboard-update-dot dashboard-update-dot-green"/><p>24 guests confirmed for Sangeet<small>1 hour ago · sample activity</small></p></div><div className="dashboard-update"><span className="dashboard-update-dot dashboard-update-dot-rose"/><p>Aarav updated the airport pickup roster<small>3 hours ago · sample activity</small></p></div></article></section>
    </div>
  </main>;
}
