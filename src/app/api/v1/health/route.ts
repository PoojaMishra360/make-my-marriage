import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ status: "ok", service: "saath", databaseConfigured: Boolean(process.env.MONGODB_URI) }); }
