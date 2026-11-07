import { ObjectId } from "mongodb";
import { z } from "zod";
import { NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { apiRoute, ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/mongodb";
import { clearSessionCookieHeader, hashPassword, normalizeEmail, readSessionUserId, sessionCookieHeader, verifyPassword } from "@/lib/auth/credentials";

const signInCredentials = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

const signUpCredentials = signInCredentials.extend({ displayName: z.string().trim().min(2).max(100) });

export async function POST(request: Request) {
  return apiRoute(request, async () => {
    const action = new URL(request.url).searchParams.get("action") ?? "sign-in";
    if (action === "logout") {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set("Set-Cookie", clearSessionCookieHeader());
      return response;
    }
    if (process.env.NODE_ENV === "production") throw new ApiError(503, "AUTH_NOT_CONFIGURED", "Production sign-in is not configured yet.");
    let body: unknown;
    try { body = await request.json(); } catch { throw new ApiError(400, "INVALID_JSON", "Send a valid JSON request body."); }
    const users = (await getDb()).collection("users");

    if (action === "sign-up") {
      const input = signUpCredentials.parse(body);
      const emailNormalized = normalizeEmail(input.email);
      const existing = await users.findOne({ emailNormalized });
      if (existing) throw new ApiError(409, "EMAIL_IN_USE", "An account with this email already exists.");
      const user = { email: input.email.trim(), emailNormalized, displayName: input.displayName ?? input.email.split("@")[0], passwordHash: hashPassword(input.password), createdAt: new Date(), schemaVersion: 1 };
      let result;
      try { result = await users.insertOne(user); } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) throw new ApiError(409, "EMAIL_IN_USE", "An account with this email already exists.");
        throw error;
      }
      const response = NextResponse.json({ user: { id: result.insertedId, displayName: user.displayName, email: user.email } }, { status: 201 });
      response.headers.set("Set-Cookie", sessionCookieHeader(result.insertedId));
      return response;
    }

    if (action !== "sign-in") throw new ApiError(400, "INVALID_AUTH_ACTION", "Unsupported authentication action.");
    const input = signInCredentials.parse(body);
    const emailNormalized = normalizeEmail(input.email);
    const user = await users.findOne({ emailNormalized });
    if (!user || typeof user.passwordHash !== "string" || !verifyPassword(input.password, user.passwordHash)) throw new ApiError(401, "INVALID_CREDENTIALS", "The email or password is not correct.");
    const response = NextResponse.json({ user: { id: user._id, displayName: user.displayName, email: user.email } });
    response.headers.set("Set-Cookie", sessionCookieHeader(user._id as ObjectId));
    return response;
  });
}

export async function GET(request: Request) {
  return apiRoute(request, async () => {
    const userId = readSessionUserId(request);
    if (!userId) throw new ApiError(401, "AUTH_REQUIRED", "Sign in is required.");
    const user = await (await getDb()).collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { displayName: 1, email: 1 } });
    if (!user) throw new ApiError(401, "AUTH_REQUIRED", "Sign in is required.");
    return NextResponse.json({ user: { id: user._id, displayName: user.displayName, email: user.email } });
  });
}
