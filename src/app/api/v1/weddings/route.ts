import { NextResponse } from "next/server";
import { apiRoute } from "@/lib/api/errors";
import { requireDevelopmentUser } from "@/lib/auth/authorization";
import { weddingInput } from "@/features/weddings/schemas";
import { createWedding, listWeddingsForUser } from "@/features/weddings/repository";

export async function GET(request: Request) {
  return apiRoute(request, async () => {
    const userId = requireDevelopmentUser(request);
    return NextResponse.json({ data: await listWeddingsForUser(userId) });
  });
}

export async function POST(request: Request) {
  return apiRoute(request, async () => {
    const userId = requireDevelopmentUser(request);
    const wedding = await createWedding(userId, weddingInput.parse(await request.json()));
    return NextResponse.json(wedding, { status: 201 });
  });
}
