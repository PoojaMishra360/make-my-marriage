import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { apiRoute, ApiError } from "@/lib/api/errors";
import { requireDevelopmentUser } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db/mongodb";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  return apiRoute(request, async () => {
    const userId = requireDevelopmentUser(request);
    const { token } = await params;
    if (!/^[a-f0-9]{64}$/i.test(token)) throw new ApiError(400, "INVALID_INVITATION", "This invitation link is invalid.");

    const db = await getDb();
    const invitation = await db.collection("invitations").findOne({ tokenHash: createHash("sha256").update(token).digest("hex") });
    if (!invitation || invitation.status !== "pending" || invitation.expiresAt <= new Date()) throw new ApiError(410, "INVITATION_EXPIRED", "This invitation is no longer available.");

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { email: 1 } });
    if (!user || user.email.toLowerCase() !== invitation.emailNormalized) throw new ApiError(403, "INVITATION_EMAIL_MISMATCH", "Sign in with the email address that received this invitation.");

    const existingMembership = await db.collection("memberships").findOne({ weddingId: invitation.weddingId, userId: new ObjectId(userId), status: "active" });
    if (!existingMembership) {
      await db.collection("memberships").insertOne({ weddingId: invitation.weddingId, userId: new ObjectId(userId), role: invitation.role, status: "active", invitedByUserId: invitation.invitedByUserId, createdAt: new Date(), updatedAt: new Date() });
    }
    await db.collection("invitations").updateOne({ _id: invitation._id, status: "pending" }, { $set: { status: "accepted", acceptedAt: new Date(), acceptedByUserId: new ObjectId(userId) } });

    return NextResponse.json({ weddingId: invitation.weddingId.toHexString() });
  });
}
