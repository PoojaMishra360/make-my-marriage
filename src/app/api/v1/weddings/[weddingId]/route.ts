import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { apiRoute, ApiError } from "@/lib/api/errors";
import { objectId } from "@/lib/api/validation";
import { requireMembership } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db/mongodb";
import { weddingInput } from "@/features/weddings/schemas";

export async function GET(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  return apiRoute(request, async () => {
    const { weddingId } = await params;
    objectId.parse(weddingId);
    await requireMembership(request, weddingId);
    const wedding = await (await getDb()).collection("weddings").findOne({ _id: new ObjectId(weddingId) });
    if (!wedding) throw new ApiError(404, "NOT_FOUND", "Wedding not found.");
    return NextResponse.json(wedding);
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  return apiRoute(request, async () => {
    const { weddingId } = await params;
    objectId.parse(weddingId);
    await requireMembership(request, weddingId);
    const input = weddingInput.partial().parse(await request.json());
    if (!Object.keys(input).length) throw new ApiError(400, "VALIDATION_ERROR", "Provide at least one wedding field to update.");
    const result = await (await getDb()).collection("weddings").findOneAndUpdate(
      { _id: new ObjectId(weddingId) }, { $set: { ...input, updatedAt: new Date() } }, { returnDocument: "after" },
    );
    if (!result) throw new ApiError(404, "NOT_FOUND", "Wedding not found.");
    return NextResponse.json(result);
  });
}
