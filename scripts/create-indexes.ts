import { getDb } from "../src/lib/db/mongodb";

async function main() {
  const db = await getDb();
  await Promise.all([
    db.collection("users").createIndex({ emailNormalized: 1 }, { unique: true }),
    db.collection("memberships").createIndex({ weddingId: 1, userId: 1 }, { unique: true }),
    db.collection("memberships").createIndex({ userId: 1, status: 1 }),
    db.collection("events").createIndex({ weddingId: 1, status: 1, dateLocal: 1, sortOrder: 1 }),
    db.collection("guestGroups").createIndex({ weddingId: 1, familySide: 1, name: 1 }),
    db.collection("guests").createIndex({ weddingId: 1, guestGroupId: 1, displayName: 1 }),
    db.collection("eventInvitations").createIndex({ eventId: 1, guestId: 1 }, { unique: true }),
    db.collection("eventInvitations").createIndex({ weddingId: 1, eventId: 1, rsvpStatus: 1 }),
    db.collection("rsvpLinks").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("rsvpLinks").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("tasks").createIndex({ weddingId: 1, status: 1, dueAt: 1 }),
    db.collection("expenses").createIndex({ weddingId: 1, expenseDate: -1 }),
    db.collection("expenses").createIndex({ weddingId: 1, eventId: 1, category: 1 }),
    db.collection("mediaAssets").createIndex({ weddingId: 1, eventId: 1, purpose: 1, createdAt: -1 }),
    db.collection("invitationDeliveries").createIndex({ idempotencyKey: 1 }, { unique: true }),
    db.collection("activityEvents").createIndex({ weddingId: 1, createdAt: -1 })
  ]);
  console.log("Saath indexes are ready.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
