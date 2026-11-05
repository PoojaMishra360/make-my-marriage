import { NextResponse } from "next/server";
import { apiRoute } from "@/lib/api/errors";
import { objectId } from "@/lib/api/validation";
import { requireMembership } from "@/lib/auth/authorization";
import { createEvent, listEvents } from "@/features/events/repository";
import { eventInput } from "@/features/events/schemas";

export async function GET(request: Request, { params }: { params: Promise<{ weddingId: string }> }) { return apiRoute(request, async () => { const { weddingId } = await params; objectId.parse(weddingId); await requireMembership(request, weddingId); return NextResponse.json({ data: await listEvents(weddingId), page: { nextCursor: null, hasMore: false } }); }); }
export async function POST(request: Request, { params }: { params: Promise<{ weddingId: string }> }) { return apiRoute(request, async () => { const { weddingId } = await params; objectId.parse(weddingId); const member = await requireMembership(request, weddingId); const event = await createEvent(weddingId, member.userId, eventInput.parse(await request.json())); return NextResponse.json(event, { status: 201 }); }); }
