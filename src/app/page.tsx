import Link from "next/link";
import { demoDashboard } from "@/features/dashboard/demo-data";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function DashboardPage() {
  const { wedding, upcomingEvents, guests, tasks, budget, recentExpenses } = demoDashboard;
  return <main className="shell"><header className="topbar"><Link href="/" className="brand">Saath</Link><span>Planning together</span><button className="avatar" aria-label="Profile">MP</button></header>
    <section className="hero"><p className="eyebrow">{wedding.city} · {wedding.weddingDate}</p><h1>{wedding.coupleNames.join(" & ")}</h1><p>Your shared wedding plan, all in one calm place.</p><div className="actions"><button>Add event</button><button className="secondary">Invite family</button></div></section>
    <section className="metrics" aria-label="Wedding summary"><article><span>Guest RSVPs</span><strong>{guests.confirmed} <small>confirmed</small></strong><p>{guests.awaiting} awaiting · {guests.declined} declined</p></article><article><span>Tasks to do</span><strong>{tasks.open}</strong><p>{tasks.dueSoon} due soon · {tasks.overdue} overdue</p></article><article><span>Budget remaining</span><strong>{money.format(budget.remainingMinor / 100)}</strong><p>{money.format(budget.spentMinor / 100)} recorded as spent</p></article></section>
    <section className="grid"><article className="panel events"><div className="panel-title"><div><p className="eyebrow">Schedule</p><h2>Upcoming events</h2></div><button className="text-button">View all</button></div>{upcomingEvents.map(event => <Link href={`/events/${event.id}`} className="event-row" key={event.id}><div className="date-badge"><b>{event.dateLocal.slice(-2)}</b><span>FEB</span></div><div><h3>{event.name}</h3><p>{event.startTimeLocal} · {event.venue.name}</p></div><span aria-hidden>→</span></Link>)}</article>
      <article className="panel"><div className="panel-title"><div><p className="eyebrow">Finance</p><h2>Recent expenses</h2></div><button className="text-button">View all</button></div>{recentExpenses.map(expense => <div className="expense-row" key={expense.id}><div><h3>{expense.description}</h3><p>{expense.eventName} · {expense.paymentStatus}</p></div><strong>{money.format(expense.amountMinor / 100)}</strong></div>)}</article>
    </section>
    <section className="panel tasks"><div className="panel-title"><div><p className="eyebrow">Next up</p><h2>Tasks needing attention</h2></div><button className="text-button">Open tasks</button></div><div className="task"><span className="checkbox"/><div><h3>Confirm mehendi décor</h3><p>Assigned to Meera · Due tomorrow</p></div><span className="tag">Mehendi</span></div></section>
  </main>;
}
