import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { Resend } from "resend";
import { apiRoute, ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/mongodb";
import { objectId } from "@/lib/api/validation";
import { requireAdmin } from "@/lib/auth/authorization";
import { createInvitationToken, invitationUrl } from "@/lib/invitations";

const invitationInput = z.object({ displayName: z.string().trim().min(2).max(100), email: z.string().email().max(254), role: z.enum(["admin", "manager", "collaborator"]).default("manager") });

export async function GET(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  return apiRoute(request, async () => {
    const { weddingId } = await params;
    objectId.parse(weddingId);
    await requireAdmin(request, weddingId);
    const invitations = await (await getDb()).collection("invitations").find({ weddingId: new ObjectId(weddingId), status: "pending" }, { projection: { tokenHash: 0 } }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ data: invitations });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  return apiRoute(request, async () => {
    const { weddingId } = await params;
    objectId.parse(weddingId);
    const owner = await requireAdmin(request, weddingId);
    const input = invitationInput.parse(await request.json());
    if (input.role === "admin" && owner.role !== "owner") throw new ApiError(403, "OWNER_REQUIRED", "Only the owner can invite another admin.");
    const db = await getDb();
    const ownerUser = await db.collection("users").findOne({ _id: new ObjectId(owner.userId) }, { projection: { email: 1 } });
    const weddingObjectId = new ObjectId(weddingId);
    const emailNormalized = input.email.trim().toLowerCase();
    const existingInvite = await db.collection("invitations").findOne({ weddingId: weddingObjectId, emailNormalized, status: "pending" });
    if (existingInvite) throw new ApiError(409, "INVITATION_EXISTS", "This email already has a pending invitation.");
    const { token, tokenHash } = createInvitationToken();
    const invitation = { weddingId: weddingObjectId, email: input.email.trim(), emailNormalized, displayName: input.displayName, role: input.role, tokenHash, status: "pending", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), invitedByUserId: new ObjectId(owner.userId), createdAt: new Date() };
    const result = await db.collection("invitations").insertOne(invitation);
    const url = invitationUrl(token, request);
    let delivery: "sent" | "development_preview" = "development_preview";
    if (process.env.RESEND_API_KEY) {
      const fromAddress = process.env.RESEND_FROM_EMAIL?.trim();
      if (!fromAddress) {
        await db.collection("invitations").deleteOne({ _id: result.insertedId });
        throw new ApiError(500, "RESEND_FROM_EMAIL_MISSING", "Set RESEND_FROM_EMAIL to a verified sender address in Resend, for example: Make My Marriage <noreply@yourdomain.com>");
      }
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailResult = await resend.emails.send({
          from: fromAddress,
          to: [invitation.email],
          replyTo: ownerUser?.email,
          subject: `${invitation.displayName}, you are invited to a wedding workspace`,
          text: `${invitation.displayName}, you have been invited to collaborate on a wedding workspace. Accept the invitation here: ${url}\n\nThis link expires in 7 days.`,
          html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#242126;max-width:560px"><p>${invitation.displayName},</p><p>You have been invited to collaborate on a private wedding workspace.</p><p><a href="${url}" style="display:inline-block;padding:12px 18px;background:#522f46;color:#fff;text-decoration:none;border-radius:6px">Accept invitation</a></p><p style="color:#776e74;font-size:13px">This link expires in 7 days. If you were not expecting this invitation, you can ignore this email.</p></div>`,
        });
        if (emailResult.error) throw new Error(emailResult.error.message);
        delivery = "sent";
      } catch (error) {
        await db.collection("invitations").deleteOne({ _id: result.insertedId });
        const message = error instanceof Error && error.message ? error.message : "The invitation could not be sent. Check the Resend sender configuration and try again.";
        throw new ApiError(502, "EMAIL_DELIVERY_FAILED", `The invitation could not be sent. ${message}`);
      }
    }
    return NextResponse.json({ invitation: { ...invitation, _id: result.insertedId, token: process.env.RESEND_API_KEY ? undefined : token, invitationUrl: process.env.RESEND_API_KEY ? undefined : url, delivery } }, { status: 201 });
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  return apiRoute(request, async () => {
    const { weddingId } = await params;
    objectId.parse(weddingId);
    await requireAdmin(request, weddingId);
    const invitationId = new URL(request.url).searchParams.get("invitationId");
    objectId.parse(invitationId ?? "");
    const result = await (await getDb()).collection("invitations").updateOne(
      { _id: new ObjectId(invitationId as string), weddingId: new ObjectId(weddingId), status: "pending" },
      { $set: { status: "revoked", revokedAt: new Date() } },
    );
    if (!result.matchedCount) throw new ApiError(404, "NOT_FOUND", "Pending invitation not found.");
    return new Response(null, { status: 204 });
  });
}
