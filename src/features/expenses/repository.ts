import { ObjectId } from "mongodb";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/mongodb";
import type { ExpenseInput } from "./schemas";

const activeExpense = { archivedAt: { $exists: false } };

async function validateEvent(weddingId: string, eventId: string | null | undefined) {
  if (!eventId) return;
  const event = await (await getDb()).collection("events").findOne({ _id: new ObjectId(eventId), weddingId: new ObjectId(weddingId), status: "planned" }, { projection: { _id: 1 } });
  if (!event) throw new ApiError(400, "INVALID_EVENT", "Choose an active event from this wedding.");
}

export async function listExpenses(weddingId: string) {
  return (await getDb()).collection("expenses").find({ weddingId: new ObjectId(weddingId), ...activeExpense }).sort({ expenseDate: -1, createdAt: -1 }).limit(100).toArray();
}

export async function createExpense(weddingId: string, actorUserId: string, input: ExpenseInput) {
  await validateEvent(weddingId, input.eventId);
  const now = new Date();
  const expense = { weddingId: new ObjectId(weddingId), ...input, eventId: input.eventId ? new ObjectId(input.eventId) : null, createdByUserId: new ObjectId(actorUserId), createdAt: now, updatedAt: now };
  const result = await (await getDb()).collection("expenses").insertOne(expense);
  return { ...expense, _id: result.insertedId };
}

export async function getExpense(weddingId: string, expenseId: string) {
  const expense = await (await getDb()).collection("expenses").findOne({ _id: new ObjectId(expenseId), weddingId: new ObjectId(weddingId), ...activeExpense });
  if (!expense) throw new ApiError(404, "NOT_FOUND", "Expense not found.");
  return expense;
}

export async function updateExpense(weddingId: string, expenseId: string, input: Partial<ExpenseInput>) {
  await validateEvent(weddingId, input.eventId);
  const updates = { ...input, ...(input.eventId !== undefined ? { eventId: input.eventId ? new ObjectId(input.eventId) : null } : {}), updatedAt: new Date() };
  const result = await (await getDb()).collection("expenses").findOneAndUpdate(
    { _id: new ObjectId(expenseId), weddingId: new ObjectId(weddingId), ...activeExpense },
    { $set: updates },
    { returnDocument: "after" },
  );
  if (!result) throw new ApiError(404, "NOT_FOUND", "Expense not found.");
  return result;
}

export async function archiveExpense(weddingId: string, expenseId: string) {
  const result = await (await getDb()).collection("expenses").updateOne(
    { _id: new ObjectId(expenseId), weddingId: new ObjectId(weddingId), ...activeExpense },
    { $set: { archivedAt: new Date(), updatedAt: new Date() } },
  );
  if (!result.matchedCount) throw new ApiError(404, "NOT_FOUND", "Expense not found.");
}

export async function getBudgetSummary(weddingId: string) {
  const weddingObjectId = new ObjectId(weddingId);
  const db = await getDb();
  const [wedding, totals, categories, events] = await Promise.all([
    db.collection("weddings").findOne({ _id: weddingObjectId }, { projection: { budgetMinor: 1, currency: 1 } }),
    db.collection("expenses").aggregate([
      { $match: { weddingId: weddingObjectId, ...activeExpense } },
      { $group: { _id: "$paymentStatus", amountMinor: { $sum: "$amountMinor" }, count: { $sum: 1 } } },
    ]).toArray(),
    db.collection("expenses").aggregate([
      { $match: { weddingId: weddingObjectId, ...activeExpense, paymentStatus: { $ne: "cancelled" } } },
      { $group: { _id: "$category", amountMinor: { $sum: "$amountMinor" }, count: { $sum: 1 } } },
      { $sort: { amountMinor: -1 } },
    ]).toArray(),
    db.collection("expenses").aggregate([
      { $match: { weddingId: weddingObjectId, ...activeExpense, eventId: { $ne: null }, paymentStatus: { $ne: "cancelled" } } },
      { $group: { _id: "$eventId", amountMinor: { $sum: "$amountMinor" }, paidMinor: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$amountMinor", 0] } } } },
      { $lookup: { from: "events", localField: "_id", foreignField: "_id", as: "event" } },
      { $unwind: "$event" },
      { $project: { _id: 0, eventId: { $toString: "$_id" }, eventName: "$event.name", amountMinor: 1, paidMinor: 1 } },
      { $sort: { amountMinor: -1 } },
    ]).toArray(),
  ]);
  const byStatus = Object.fromEntries(totals.map((entry) => [entry._id, { amountMinor: entry.amountMinor, count: entry.count }]));
  const paidMinor = byStatus.paid?.amountMinor ?? 0;
  const dueMinor = byStatus.due?.amountMinor ?? 0;
  const estimatedMinor = byStatus.estimated?.amountMinor ?? 0;
  const budgetMinor = wedding?.budgetMinor ?? null;
  return { budgetMinor, currency: wedding?.currency ?? "INR", paidMinor, dueMinor, estimatedMinor, remainingMinor: budgetMinor === null ? null : budgetMinor - paidMinor, totals: byStatus, categories, events };
}
