import { z } from "zod";
import { dateLocal, timeLocal } from "@/lib/api/validation";

const livestream = z.object({ url: z.string().url().refine((url) => new URL(url).protocol === "https:", "Livestream URL must use HTTPS.").nullable(), instructions: z.string().max(1000).nullable() });
export const eventInput = z.object({ name: z.string().trim().min(1).max(120), dateLocal, startTimeLocal: timeLocal.optional(), endTimeLocal: timeLocal.optional(), timeZone: z.string().min(1).max(100), venue: z.object({ name: z.string().max(160).optional(), address: z.string().max(500).optional(), notes: z.string().max(1000).optional() }).default({}), description: z.string().max(4000).optional(), sortOrder: z.number().int().min(0).optional(), budgetMinor: z.number().int().min(0).nullable().optional(), livestream: livestream.optional() });
export type EventInput = z.infer<typeof eventInput>;
