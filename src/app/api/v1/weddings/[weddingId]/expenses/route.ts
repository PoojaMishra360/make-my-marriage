import { NextResponse } from "next/server";
import { apiRoute, ApiError } from "@/lib/api/errors";
import { objectId } from "@/lib/api/validation";
import { requireMembership } from "@/lib/auth/authorization";
import { createExpense, listExpenses } from "@/features/expenses/repository";
import { expenseInput } from "@/features/expenses/schemas";

type Context = { params: Promise<{ weddingId: string }> };

export async function GET(request: Request, { params }: Context) {
  return apiRoute(request, async () => {
    const { weddingId } = await params;
    objectId.parse(weddingId);
    await requireMembership(request, weddingId);
    return NextResponse.json({ data: await listExpenses(weddingId), page: { nextCursor: null, hasMore: false } });
  });
}

export async function POST(request: Request, { params }: Context) {
  return apiRoute(request, async () => {
    const { weddingId } = await params;
    objectId.parse(weddingId);
    const member = await requireMembership(request, weddingId);
    const input = expenseInput.parse(await request.json());
    return NextResponse.json(await createExpense(weddingId, member.userId, input), { status: 201 });
  });
}
