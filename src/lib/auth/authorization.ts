import { ObjectId } from "mongodb";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/mongodb";

/** Replace this adapter after choosing the documented passwordless auth provider. */
export async function requireMembership(_request: Request, weddingId: string) {
  const userId = _request.headers.get("x-development-user-id");
  if (!userId || !ObjectId.isValid(userId)) throw new ApiError(401, "AUTH_REQUIRED", "Sign in is required.");
  const membership = await (await getDb()).collection("memberships").findOne({ weddingId: new ObjectId(weddingId), userId: new ObjectId(userId), status: "active" });
  if (!membership) throw new ApiError(403, "FORBIDDEN", "You do not have access to this wedding.");
  return { userId, role: membership.role as "owner" | "collaborator" };
}
