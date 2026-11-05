import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a MongoDB ObjectId.");
export const dateLocal = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");
export const timeLocal = z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm.");
export const pagination = z.object({ limit: z.coerce.number().int().min(1).max(100).default(25), cursor: z.string().optional() });
