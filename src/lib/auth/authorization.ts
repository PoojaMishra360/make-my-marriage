import { ObjectId } from "mongodb";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/mongodb";
import { readSessionUserId } from "./credentials";

export type WorkspaceRole = "owner" | "admin" | "manager" | "collaborator";

/** Development identity only. Replace with a verified provider session before production use. */
export function requireDevelopmentUser(request: Request) {
  if (process.env.NODE_ENV === "production") throw new ApiError(503, "AUTH_NOT_CONFIGURED", "Sign-in is not configured yet.");
  const userId = readSessionUserId(request) ?? request.headers.get("x-development-user-id");
  if (!userId || !ObjectId.isValid(userId)) throw new ApiError(401, "AUTH_REQUIRED", "Sign in is required.");
  return userId;
}

export async function requireMembership(request: Request, weddingId: string) {
  const userId = requireDevelopmentUser(request);
  const membership = await (await getDb()).collection("memberships").findOne({ weddingId: new ObjectId(weddingId), userId: new ObjectId(userId), status: "active" });
  if (!membership) throw new ApiError(403, "FORBIDDEN", "You do not have access to this wedding.");
  return { userId, role: membership.role as WorkspaceRole };
}

export async function requireOwner(request: Request, weddingId: string) {
  const member = await requireMembership(request, weddingId);
  if (member.role !== "owner") throw new ApiError(403, "OWNER_REQUIRED", "Only the wedding owner can manage collaborators.");
  return member;
}

export async function requireAdmin(request: Request, weddingId: string) {
  const member = await requireMembership(request, weddingId);
  if (member.role !== "owner" && member.role !== "admin") throw new ApiError(403, "ADMIN_REQUIRED", "Only the owner or an admin can manage collaborators.");
  return member;
}
