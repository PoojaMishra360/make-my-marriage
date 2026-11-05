import { z } from "zod";
import { dateLocal } from "@/lib/api/validation";

export const weddingInput = z.object({ coupleNames: z.array(z.string().trim().min(1).max(100)).min(1).max(4), weddingDate: dateLocal, timeZone: z.string().min(1).max(100), city: z.string().max(160).optional(), currency: z.string().length(3).default("INR"), budgetMinor: z.number().int().min(0).optional() });
