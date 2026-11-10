import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { LogoutButton } from "@/app/components/logout-button";
import { getBudgetSummary, listExpenses } from "@/features/expenses/repository";
import { readSessionUserId } from "@/lib/auth/credentials";
import { getDb } from "@/lib/db/mongodb";

function formatMoney(minor: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(minor / 100);
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mmm_session")?.value;
  const request = new Request("http://localhost", { headers: { cookie: session ? `mmm_session=${session}` : "" } });
  const userId = readSessionUserId(request);
  if (!userId) redirect("/login");
  const db = await getDb();
  const [user, workspace] = await Promise.all([
    db.collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { displayName: 1 } }),
    db.collection("memberships").findOne({ userId: new ObjectId(userId), status: "active" }, { projection: { weddingId: 1 } }),
  ]);
  if (!user) redirect("/login");
  if (!workspace) redirect("/workspace/new");
  const [wedding, events, budgetSummary, recentExpenses] = await Promise.all([
    db.collection("weddings").findOne({ _id: workspace.weddingId }, { projection: { title: 1, coupleNames: 1, weddingDate: 1, city: 1, budgetMinor: 1, currency: 1 } }),
    db.collection("events").find({ weddingId: workspace.weddingId, status: "planned" }).sort({ dateLocal: 1, sortOrder: 1 }).limit(5).toArray(),
    getBudgetSummary(workspace.weddingId.toHexString()),
    listExpenses(workspace.weddingId.toHexString()),
  ]);
  if (!wedding) redirect("/workspace/new");

  const weddingId = workspace.weddingId.toHexString();
  const eventsHref = `/weddings/${weddingId}/events`;
  const planningHref = (section: string) => `/weddings/${weddingId}/planning/${section}`;
  const nextEvent = events[0];
  const nextDate = nextEvent ? new Date(`${nextEvent.dateLocal}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null;

  return <main className="dashboard-page">
    <header className="dashboard-topbar">
      <Link className="dashboard-brand" href="/">Make My Marriage</Link>
      <nav className="dashboard-nav" aria-label="Workspace navigation"><Link className="dashboard-nav-active" href="/dashboard">Overview</Link><Link href={eventsHref}>Events</Link><Link href={planningHref("guests")}>Guests</Link><Link href={planningHref("tasks")}>Tasks</Link><Link href={planningHref("budget")}>Budget</Link><Link href="/workspace/collaborators">Family</Link></nav>
      <div className="dashboard-account"><span>{user.displayName}</span><LogoutButton /></div>
    </header>
    <div className="dashboard-content">
      <section className="dashboard-heading"><div><p className="landing-kicker">{wedding.title} · {wedding.city ?? "Wedding workspace"}</p><h1>Good morning, {user.displayName}.</h1><p>{wedding.coupleNames.join(" & ")} · {wedding.weddingDate}</p></div><div className="dashboard-heading-actions"><Link className="landing-button landing-button-small" href={eventsHref}>Add to workspace <span aria-hidden="true">+</span></Link><Link className="dashboard-public-link" href="/">Preview workspace ↗</Link></div></section>
      <section className="dashboard-hero-grid">
        <article className="dashboard-next panel-next"><div className="dashboard-card-kicker">{nextEvent ? "NEXT CELEBRATION" : "YOUR CELEBRATION"}</div><h2>{nextEvent?.name ?? "Start your event schedule"}</h2><p>{nextEvent ? [nextEvent.venue?.name, nextEvent.venue?.address].filter(Boolean).join(" · ") || "Add venue details to this event" : "Add ceremonies and gatherings to your wedding plan."}</p><div className="dashboard-next-meta"><span>{nextDate ?? "No upcoming events"}</span><span>{nextEvent?.startTimeLocal ?? "Your schedule"}</span></div><Link className="dashboard-card-link" href={nextEvent ? `/events/${nextEvent._id.toHexString()}` : eventsHref}>{nextEvent ? "Open event workspace →" : "Create your first event →"}</Link></article>
        <Link className="dashboard-metric" href={planningHref("guests")}><span className="dashboard-card-kicker">GUEST LIST</span><strong>Plan your guests</strong><p>Guest and RSVP management is the next planning module.</p><span className="dashboard-card-link">Open guest list →</span></Link>
        <Link className="dashboard-metric" href={planningHref("budget")}><span className="dashboard-card-kicker">BUDGET &amp; EXPENSES</span><strong>{formatMoney(budgetSummary.paidMinor, budgetSummary.currency)} <small>paid</small></strong><p>{budgetSummary.budgetMinor === null ? "Set your wedding budget" : `${formatMoney(budgetSummary.remainingMinor ?? 0, budgetSummary.currency)} remaining of ${formatMoney(budgetSummary.budgetMinor, budgetSummary.currency)}`}</p><span className="dashboard-card-link">Open budget →</span></Link>
      </section>
      <section className="dashboard-columns">
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><p className="landing-kicker">Upcoming</p><h2>Wedding events</h2></div><Link href={eventsHref}>View all →</Link></div>
          {events.length === 0 ? <div className="collaborators-empty"><h3>No events added yet</h3><p>Create the first celebration in your schedule.</p><Link className="landing-button landing-button-small" href={eventsHref}>Add an event +</Link></div> : events.map((event) => <div className="dashboard-event-row" key={event._id.toHexString()}>
            <div className="dashboard-date"><strong>{new Date(`${event.dateLocal}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit" })}</strong><small>{new Date(`${event.dateLocal}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })}</small></div>
            <div><h3>{event.name}</h3><p>{[event.startTimeLocal, event.venue?.name, event.venue?.address].filter(Boolean).join(" · ") || "Event details can be added"}</p></div>
            <Link href={`/events/${event._id.toHexString()}`}>Details</Link>
          </div>)}
        </article>
        <article className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Action items</p><h2>Tasks &amp; shopping</h2></div><Link href={planningHref("tasks")}>Open tasks →</Link></div><div className="dashboard-stat-line"><strong>—</strong><span>open tasks</span><strong>—</strong><span>due soon</span></div><p className="muted">Task tracking is not available yet. Your family can still coordinate access from the collaborators page.</p><Link className="dashboard-card-link" href="/workspace/collaborators">Invite family →</Link></article>
      </section>
      <section className="dashboard-columns">
        <article className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Recent ledger</p><h2>Budget &amp; expenses</h2></div><Link href={planningHref("budget")}>Open budget →</Link></div>{recentExpenses.length === 0 ? <p className="muted">No expense records yet. Add the first entry to start your ledger.</p> : recentExpenses.slice(0, 3).map((expense) => <div className="dashboard-expense-row" key={expense._id.toHexString()}><span><strong>{expense.description}</strong><small>{expense.category} · {expense.paymentStatus}</small></span><b>{formatMoney(expense.amountMinor, expense.currency)}</b></div>)}</article>
        <article className="dashboard-panel"><div className="dashboard-panel-heading"><div><p className="landing-kicker">Family updates</p><h2>Latest activity</h2></div><Link href="/workspace/collaborators">Manage family →</Link></div><p className="muted">Activity history is not available yet. Pending invitations and collaborators are managed in Family.</p></article>
      </section>
    </div>
  </main>;
}
