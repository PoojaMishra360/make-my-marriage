import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { readSessionUserId } from "@/lib/auth/credentials";
import { getDb } from "@/lib/db/mongodb";
import BudgetWorkspace from "@/features/expenses/budget-workspace";

const sections = {
  guests: { title: "Guest list", description: "Guest records, households, and event-specific RSVPs will be managed here." },
  tasks: { title: "Tasks & shopping", description: "Create tasks, assign family members, and track shopping deadlines here." },
  budget: { title: "Budget & expenses", description: "Set budgets and record event expenses and receipts here." },
} as const;

type Section = keyof typeof sections;

export default async function PlanningSectionPage({ params }: { params: Promise<{ weddingId: string; section: string }> }) {
  const { weddingId, section } = await params;
  if (!ObjectId.isValid(weddingId) || !Object.hasOwn(sections, section)) notFound();
  const cookieStore = await cookies();
  const session = cookieStore.get("mmm_session")?.value;
  const request = new Request("http://localhost", { headers: { cookie: session ? `mmm_session=${session}` : "" } });
  const userId = readSessionUserId(request);
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/weddings/${weddingId}/planning/${section}`)}`);
  const db = await getDb();
  const membership = await db.collection("memberships").findOne({ weddingId: new ObjectId(weddingId), userId: new ObjectId(userId), status: "active" });
  if (!membership) notFound();
  if (section === "budget") return <BudgetWorkspace weddingId={weddingId} />;
  const content = sections[section as Section];
  return <main className="setup-page">
    <header className="setup-topbar"><Link href="/dashboard" className="brand">Make My Marriage</Link><Link href="/dashboard" className="setup-back">← Dashboard</Link></header>
    <section className="invitation-card"><p className="landing-kicker">Wedding workspace</p><h1>{content.title}</h1><p>{content.description}</p><p className="muted">This planning module is not implemented yet. Your data will not be saved here.</p><Link className="landing-button" href={`/weddings/${weddingId}/events`}>Open wedding events</Link></section>
  </main>;
}
