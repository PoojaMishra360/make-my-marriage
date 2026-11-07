import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { EventInput } from "./schemas";
import { ApiError } from "@/lib/api/errors";

export async function listEvents(weddingId: string) { return (await getDb()).collection("events").find({ weddingId: new ObjectId(weddingId), status: "planned" }).sort({ dateLocal: 1, sortOrder: 1 }).toArray(); }

export async function createEvent(weddingId: string, actorUserId: string, input: EventInput) {
  const now = new Date();
  const collection = (await getDb()).collection("events");
  const sortOrder = input.sortOrder ?? await collection.countDocuments({ weddingId: new ObjectId(weddingId), status: "planned" }) * 10;
  const event = { weddingId: new ObjectId(weddingId), ...input, sortOrder, status: "planned", createdByUserId: new ObjectId(actorUserId), createdAt: now, updatedAt: now, schemaVersion: 1 };
  const result = await collection.insertOne(event);
  return { ...event, _id: result.insertedId };
}

export async function updateEvent(weddingId: string, eventId: string, input: Partial<EventInput>) {
  const result = await (await getDb()).collection("events").findOneAndUpdate(
    { _id: new ObjectId(eventId), weddingId: new ObjectId(weddingId), status: "planned" },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!result) throw new ApiError(404, "NOT_FOUND", "Event not found.");
  return result;
}

export async function archiveEvent(weddingId: string, eventId: string) {
  const result = await (await getDb()).collection("events").updateOne(
    { _id: new ObjectId(eventId), weddingId: new ObjectId(weddingId), status: "planned" },
    { $set: { status: "archived", updatedAt: new Date() } },
  );
  if (!result.matchedCount) throw new ApiError(404, "NOT_FOUND", "Event not found.");
}
