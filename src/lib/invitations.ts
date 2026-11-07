import { createHash, randomBytes } from "node:crypto";

export function createInvitationToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex") };
}

export function invitationUrl(token: string, request?: Request) {
  const configuredUrl = process.env.APP_URL?.trim();
  const isLocalUrl = configuredUrl ? /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(configuredUrl) : false;
  const requestOrigin = request ? new URL(request.url).origin : undefined;
  const baseUrl = configuredUrl && !(process.env.NODE_ENV === "production" && isLocalUrl)
    ? configuredUrl
    : requestOrigin ?? "http://localhost:3000";

  return `${baseUrl.replace(/\/$/, "")}/invitations/${token}`;
}
