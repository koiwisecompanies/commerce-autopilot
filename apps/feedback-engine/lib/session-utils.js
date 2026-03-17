import { eventPageIdentity } from "./page-utils.js";

export function buildSessions(events = []) {
  const map = new Map();

  for (const event of events) {
    const id = event.sessionId || "unknown-session";
    if (!map.has(id)) {
      map.set(id, []);
    }
    map.get(id).push(event);
  }

  const sessions = [];

  for (const [sessionId, sessionEvents] of map.entries()) {
    const ordered = sessionEvents.sort((a, b) => a.ts.localeCompare(b.ts));
    sessions.push({
      sessionId,
      events: ordered,
      metrics: summarizeSession(ordered)
    });
  }

  return sessions;
}

function summarizeSession(events) {
  const pageIds = new Set(events.map((event) => eventPageIdentity(event)));
  const guideIds = new Set(events.filter((event) => event.pageType === "guide" && event.pageSlug).map((event) => event.pageSlug));
  const outboundClicks = events.filter((event) => event.eventType === "outbound_click").length;
  const ctaClicks = events.filter((event) => event.eventType === "cta_click").length;
  const recommendationClicks = events.filter((event) => event.eventType === "recommendation_click").length;
  const readComplete = events.some((event) => event.eventType === "read_complete");
  const dwell60 = events.some((event) => event.eventType === "dwell_60s");
  const deepScroll = events.some((event) => event.eventType === "scroll_75" || event.eventType === "scroll_100");
  const hasHighIntent = outboundClicks > 0 || (ctaClicks > 0 && deepScroll) || (ctaClicks > 0 && dwell60);

  let sessionClass = "bounce_like";

  if (guideIds.size >= 2 && outboundClicks > 0) {
    sessionClass = "comparison_session";
  } else if (outboundClicks > 0) {
    sessionClass = "high_intent_outbound_session";
  } else if (guideIds.size >= 2) {
    sessionClass = "deep_research_session";
  } else if (pageIds.size >= 2) {
    sessionClass = "category_exploration_session";
  }

  return {
    pageCount: pageIds.size,
    guideCount: guideIds.size,
    outboundClicks,
    ctaClicks,
    recommendationClicks,
    deepScroll,
    dwell60,
    readComplete,
    hasHighIntent,
    sessionClass
  };
}
