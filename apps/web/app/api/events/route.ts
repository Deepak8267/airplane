import { trackEventSchema } from "@airplane/shared";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = trackEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
  }

  // Production wiring calls Supabase RPC `track_event` here with service-side validation.
  return NextResponse.json({ ok: true });
}
