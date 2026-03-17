import type { APIRoute } from "astro";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const FEEDBACK_EVENTS_DIR = path.resolve(process.cwd(), "../feedback-engine/events");

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();

    if (!payload || typeof payload !== "object") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const record = {
      eventId: String(payload.eventId || crypto.randomUUID()),
      sessionId: String(payload.sessionId || "unknown-session"),
      visitorId: String(payload.visitorId || "unknown-visitor"),
      eventType: String(payload.eventType || "unknown"),
      eventClass: String(payload.eventClass || "unknown"),
      pageType: String(payload.pageType || "other"),
      pagePath: String(payload.pagePath || "/"),
      pageSlug: payload.pageSlug ? String(payload.pageSlug) : null,
      guideSlug: payload.guideSlug ? String(payload.guideSlug) : null,
      category: payload.category ? String(payload.category) : null,
      topicFamily: payload.topicFamily ? String(payload.topicFamily) : null,
      modifier: payload.modifier ? String(payload.modifier) : null,
      audience: payload.audience ? String(payload.audience) : null,
      ctaId: payload.ctaId ? String(payload.ctaId) : null,
      outboundTarget: payload.outboundTarget ? String(payload.outboundTarget) : null,
      merchantId: payload.merchantId ? String(payload.merchantId) : null,
      affiliateRouteId: payload.affiliateRouteId ? String(payload.affiliateRouteId) : null,
      sourceChannel: payload.sourceChannel ? String(payload.sourceChannel) : null,
      referrerType: payload.referrerType ? String(payload.referrerType) : "unknown",
      label: payload.label ? String(payload.label) : null,
      ts: new Date().toISOString()
    };

    await mkdir(FEEDBACK_EVENTS_DIR, { recursive: true });

    const fileName = `${new Date().toISOString().slice(0, 10)}.jsonl`;
    const outFile = path.join(FEEDBACK_EVENTS_DIR, fileName);

    await appendFile(outFile, JSON.stringify(record) + "\n", "utf8");

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
