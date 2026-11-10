import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { readSessionUserId } from "@/lib/auth/credentials";
import { getDb } from "@/lib/db/mongodb";

export default async function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  if (!ObjectId.isValid(eventId)) notFound();
  const cookieStore = await cookies();
  const session = cookieStore.get("mmm_session")?.value;
  const request = new Request("http://localhost", { headers: { cookie: session ? `mmm_session=${session}` : "" } });
  const userId = readSessionUserId(request);
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/events/${eventId}`)}`);
  const db = await getDb();
  const event = await db.collection("events").findOne({ _id: new ObjectId(eventId), status: "planned" });
  if (!event) notFound();
  const membership = await db.collection("memberships").findOne({ weddingId: event.weddingId, userId: new ObjectId(userId), status: "active" });
  if (!membership) notFound();
  const wedding = await db.collection("weddings").findOne({ _id: event.weddingId }, { projection: { title: 1 } });

  return (
    <main className="setup-page">
      <header className="setup-topbar">
        <Link href="/dashboard" className="brand">
          Make My Marriage
        </Link>
        <Link
          href={`/weddings/${event.weddingId.toHexString()}/events`}
          className="setup-back"
        >
          ← Wedding events
        </Link>
      </header>
      <section className="invitation-card">
        <p className="landing-kicker">{wedding?.title ?? "Wedding workspace"}</p>
        <h1>{event.name}</h1>
        <p>
          {new Date(`${event.dateLocal}T00:00:00`).toLocaleDateString("en-IN", {
            dateStyle: "full",
          })}
          {event.startTimeLocal ? ` · ${event.startTimeLocal}` : ""}
          {event.endTimeLocal ? `–${event.endTimeLocal}` : ""}
        </p>
        {event.venue?.name && <h2>{event.venue.name}</h2>}
        {event.venue?.address && <p>{event.venue.address}</p>}
        {event.description && <p>{event.description}</p>}
        {event.venue?.notes && (
          <p>
            <strong>Venue notes:</strong> {event.venue.notes}
          </p>
        )}
        {event.budgetMinor != null && (
          <p>
            <strong>Planned event budget:</strong> ₹
            {(event.budgetMinor / 100).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </p>
        )}
        {event.livestream?.url && (
          <p>
            <a
              href={event.livestream.url}
              target="_blank"
              rel="noreferrer"
            >
              Open livestream ↗
            </a>
          </p>
        )}
        {event.livestream?.instructions && <p>{event.livestream.instructions}</p>}
        <Link
          className="landing-button"
          href={`/weddings/${event.weddingId.toHexString()}/events`}
        >
          Manage event details
        </Link>
      </section>
    </main>
  );
}
