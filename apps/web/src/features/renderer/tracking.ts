import type { TrackEventInput } from "@airplane/shared";

export async function trackRendererEvent(input: TrackEventInput) {
  await fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    keepalive: true
  }).catch(() => undefined);
}
