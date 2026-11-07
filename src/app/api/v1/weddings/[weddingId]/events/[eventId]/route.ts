import { NextResponse } from "next/server";
import { apiRoute, ApiError } from "@/lib/api/errors";
import { objectId } from "@/lib/api/validation";
import { requireMembership } from "@/lib/auth/authorization";
import { archiveEvent, updateEvent } from "@/features/events/repository";
import { eventInput } from "@/features/events/schemas";

type Context = { params: Promise<{ weddingId: string; eventId: string }> };

async function authorizedIds(request: Request, context: Context) {
  const { weddingId, eventId } = await context.params;
  objectId.parse(weddingId);
  objectId.parse(eventId);
  await requireMembership(request, weddingId);
  return { weddingId, eventId };
}

export async function PATCH(request: Request, context: Context) {
  return apiRoute(request, async () => {
    const { weddingId, eventId } = await authorizedIds(request, context);
    const input = eventInput.partial().parse(await request.json());
    if (!Object.keys(input).length) throw new ApiError(400, "VALIDATION_ERROR", "Provide at least one event field to update.");
    return NextResponse.json(await updateEvent(weddingId, eventId, input));
  });
}

export async function DELETE(request: Request, context: Context) {
  return apiRoute(request, async () => {
    const { weddingId, eventId } = await authorizedIds(request, context);
    await archiveEvent(weddingId, eventId);
    return new Response(null, { status: 204 });
  });
}
