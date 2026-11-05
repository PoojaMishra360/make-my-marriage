import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { EventInput } from "./schemas";

export async function listEvents(weddingId: string) { return (await getDb()).collection("events").find({ weddingId: new ObjectId(weddingId), status: "planned" }).sort({ dateLocal: 1, sortOrder: 1 }).toArray(); }

export async function createEvent(weddingId: string, actorUserId: string, input: EventInput) {
  const now = new Date(); const event = { weddingId: new ObjectId(weddingId), ...input, status: "planned", createdByUserId: new ObjectId(actorUserId), createdAt: now, updatedAt: now, schemaVersion: 1 };
  const result = await (await getDb()).collection("events").insertOne(event);
  return { ...event, _id: result.insertedId };
}
