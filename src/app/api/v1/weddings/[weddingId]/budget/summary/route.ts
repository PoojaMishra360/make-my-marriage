import { NextResponse } from "next/server";
import { apiRoute } from "@/lib/api/errors";
import { objectId } from "@/lib/api/validation";
import { requireMembership } from "@/lib/auth/authorization";
import { getBudgetSummary } from "@/features/expenses/repository";

type Context = { params: Promise<{ weddingId: string }> };

export async function GET(request: Request, { params }: Context) {
  return apiRoute(request, async () => {
    const { weddingId } = await params;
    objectId.parse(weddingId);
    await requireMembership(request, weddingId);
    return NextResponse.json(await getBudgetSummary(weddingId));
  });
}
