import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { WeddingInput } from "./schemas";

export async function createWedding(ownerUserId: string, input: WeddingInput) {
  const db = await getDb();
  const now = new Date();
  const wedding = { ...input, ownerUserId: new ObjectId(ownerUserId), createdAt: now, updatedAt: now, schemaVersion: 1 };
  const result = await db.collection("weddings").insertOne(wedding);
  const weddingId = result.insertedId;
  try {
    await db.collection("memberships").insertOne({ weddingId, userId: new ObjectId(ownerUserId), role: "owner", status: "active", invitedByUserId: null, createdAt: now, updatedAt: now });
  } catch (error) {
    await db.collection("weddings").deleteOne({ _id: weddingId });
    throw error;
  }
  return { ...wedding, _id: weddingId };
}

export async function listWeddingsForUser(userId: string) {
  const db = await getDb();
  const memberships = await db.collection("memberships").find({ userId: new ObjectId(userId), status: "active" }).toArray();
  const ids = memberships.map((membership) => membership.weddingId);
  const weddings = await db.collection("weddings").find({ _id: { $in: ids } }).sort({ createdAt: -1 }).toArray();
  return weddings.map((wedding) => ({ ...wedding, role: memberships.find((membership) => membership.weddingId.equals(wedding._id))?.role }));
}
