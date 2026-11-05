import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string>) { super(message); }
}

export function requestId(request: Request) { return request.headers.get("x-request-id") ?? crypto.randomUUID(); }

export function errorResponse(error: unknown, request: Request) {
  const id = requestId(request);
  if (error instanceof ZodError) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "The request could not be completed.", requestId: id, fields: Object.fromEntries(error.issues.map((issue) => [issue.path.join("."), issue.message])) } }, { status: 400, headers: { "x-request-id": id } });
  if (error instanceof ApiError) return NextResponse.json({ error: { code: error.code, message: error.message, requestId: id, ...(error.fields ? { fields: error.fields } : {}) } }, { status: error.status, headers: { "x-request-id": id } });
  console.error("Unhandled API error", { requestId: id, error });
  return NextResponse.json({ error: { code: "SERVICE_UNAVAILABLE", message: "The request could not be completed.", requestId: id } }, { status: 503, headers: { "x-request-id": id } });
}

export async function apiRoute(request: Request, handler: () => Promise<Response>) { try { return await handler(); } catch (error) { return errorResponse(error, request); } }
