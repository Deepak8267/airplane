import { trackEventSchema } from "@airplane/shared";
import type { Json } from "@airplane/supabase";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = trackEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
  }

  const { error } = await supabase.rpc("track_event", {
    input_experience_id: parsed.data.experienceId,
    input_visitor_id: parsed.data.visitorId,
    input_session_id: parsed.data.sessionId,
    input_event_type: parsed.data.eventType,
    input_page_id: parsed.data.pageId ?? null,
    input_metadata: (parsed.data.metadata ?? {}) as Json
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
