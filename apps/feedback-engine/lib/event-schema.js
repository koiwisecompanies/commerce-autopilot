export function normalizeEvent(record = {}) {
  return {
    eventId: String(record.eventId || ""),
    sessionId: String(record.sessionId || "unknown-session"),
    visitorId: String(record.visitorId || "unknown-visitor"),
    eventType: String(record.eventType || "unknown"),
    eventClass: String(record.eventClass || "unknown"),
    pageType: String(record.pageType || "other"),
    pagePath: String(record.pagePath || "/"),
    pageSlug: record.pageSlug ? String(record.pageSlug) : null,
    guideSlug: record.guideSlug ? String(record.guideSlug) : null,
    category: record.category ? String(record.category) : null,
    topicFamily: record.topicFamily ? String(record.topicFamily) : null,
    modifier: record.modifier ? String(record.modifier) : null,
    audience: record.audience ? String(record.audience) : null,
    ctaId: record.ctaId ? String(record.ctaId) : null,
    outboundTarget: record.outboundTarget ? String(record.outboundTarget) : null,
    merchantId: record.merchantId ? String(record.merchantId) : null,
    affiliateRouteId: record.affiliateRouteId ? String(record.affiliateRouteId) : null,
    sourceChannel: record.sourceChannel ? String(record.sourceChannel) : null,
    referrerType: record.referrerType ? String(record.referrerType) : "unknown",
    label: record.label ? String(record.label) : null,
    ts: String(record.ts || new Date().toISOString())
  };
}
