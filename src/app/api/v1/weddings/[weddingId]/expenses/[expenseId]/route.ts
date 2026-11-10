import { NextResponse } from "next/server";
import { apiRoute, ApiError } from "@/lib/api/errors";
import { objectId } from "@/lib/api/validation";
import { requireMembership } from "@/lib/auth/authorization";
import { archiveExpense, getExpense, updateExpense } from "@/features/expenses/repository";
import { expenseInput } from "@/features/expenses/schemas";

type Context = { params: Promise<{ weddingId: string; expenseId: string }> };

async function authorize(request: Request, context: Context) {
  const { weddingId, expenseId } = await context.params;
  objectId.parse(weddingId);
  objectId.parse(expenseId);
  await requireMembership(request, weddingId);
  return { weddingId, expenseId };
}

export async function GET(request: Request, context: Context) {
  return apiRoute(request, async () => {
    const { weddingId, expenseId } = await authorize(request, context);
    return NextResponse.json(await getExpense(weddingId, expenseId));
  });
}

export async function PATCH(request: Request, context: Context) {
  return apiRoute(request, async () => {
    const { weddingId, expenseId } = await authorize(request, context);
    const input = expenseInput.partial().parse(await request.json());
    if (!Object.keys(input).length) throw new ApiError(400, "VALIDATION_ERROR", "Provide at least one expense field to update.");
    return NextResponse.json(await updateExpense(weddingId, expenseId, input));
  });
}

export async function DELETE(request: Request, context: Context) {
  return apiRoute(request, async () => {
    const { weddingId, expenseId } = await authorize(request, context);
    await archiveExpense(weddingId, expenseId);
    return new Response(null, { status: 204 });
  });
}
