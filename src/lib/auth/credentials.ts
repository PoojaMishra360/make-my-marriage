import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { ObjectId } from "mongodb";

const sessionCookieName = "mmm_session";
const developmentSessionSecret = "make-my-marriage-development-session-secret";

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be configured in production.");
  return secret ?? developmentSessionSecret;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHex] = storedHash.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function signUserId(userId: string) {
  return createHmac("sha256", getSessionSecret()).update(userId).digest("hex");
}

export function createSessionValue(userId: ObjectId) {
  const value = userId.toHexString();
  return `${value}.${signUserId(value)}`;
}

export function readSessionUserId(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${sessionCookieName}=`));
  const value = sessionCookie?.slice(sessionCookieName.length + 1);
  const [userId, signature] = value?.split(".") ?? [];
  if (!userId || !signature || !ObjectId.isValid(userId)) return null;
  const expected = signUserId(userId);
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  return userId;
}

export function sessionCookieHeader(userId: ObjectId) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=${createSessionValue(userId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

export function clearSessionCookieHeader() {
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
