import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "qaf-support-ai", mode: "local" });
}
