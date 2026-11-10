import { z } from "zod";
import { dateLocal, objectId } from "@/lib/api/validation";

export const expenseInput = z.object({
  eventId: objectId.nullable().optional(),
  description: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(80),
  amountMinor: z.number().int().positive().max(100_000_000_000),
  currency: z.string().regex(/^[A-Z]{3}$/).default("INR"),
  paidBy: z.object({ type: z.enum(["user", "family", "other"]), label: z.string().trim().min(1).max(120) }),
  paymentStatus: z.enum(["estimated", "due", "paid", "cancelled"]),
  expenseDate: dateLocal,
  notes: z.string().max(2000).nullable().optional(),
});

export type ExpenseInput = z.infer<typeof expenseInput>;
