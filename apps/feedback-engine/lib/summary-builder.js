import { readAllEvents } from "./event-reader.js";
import { buildSessions } from "./session-utils.js";
import { scoreGuide } from "./guide-scorer.js";
import { loadSignalContext } from "./signal-joiner.js";
import { writeSummaryFiles, writeReport, writeState } from "./report-service.js";

function ensureBucket(map, key, seed) {
  if (!map.has(key)) {
    map.set(key, structuredClone(seed));
  }
  return map.get(key);
}

function metricSeed() {
  return {
    views: 0,
    sessions: 0,
    uniqueSessions: new Set(),
    ctaClicks: 0,
    outboundClicks: 0,
    recommendationClicks: 0,
    deepEngagementSessions: 0,
    readCompleteSessions: 0,
    bounceLikeSessions: 0,
    multiPageSessions: 0,
    highIntentSessions: 0
  };
}

function finalizeBucket(bucket) {
  return {
    ...bucket,
    sessions: bucket.uniqueSessions.size
  };
}

export function buildFeedbackSummary() {
  const events = readAllEvents();
  const sessions = buildSessions(events);
  const signalContext = loadSignalContext();

  const guideMap = new Map();
  const categoryMap = new Map();
  const modifierMap = new Map();
  const audienceMap = new Map();

  for (const session of sessions) {
    const touchedGuides = new Set();
    const touchedCategories = new Set();
    const touchedModifiers = new Set();
    const touchedAudiences = new Set();

    for (const event of session.events) {
      if (event.pageType === "guide" && event.pageSlug) {
        const guide = ensureBucket(guideMap, event.pageSlug, {
          slug: event.pageSlug,
          title: event.guideTitle || event.pageSlug,
          category: event.category || "unknown",
          modifier: event.modifier || "core",
          audience: event.audience || "general",
          topicFamily: event.topicFamily || "unknown",
          ...metricSeed()
        });

        if (event.eventType === "page_view") guide.views += 1;
        if (event.eventType === "cta_click") guide.ctaClicks += 1;
        if (event.eventType === "outbound_click") guide.outboundClicks += 1;
        if (event.eventType === "recommendation_click") guide.recommendationClicks += 1;

        touchedGuides.add(event.pageSlug);

        if (event.category) touchedCategories.add(event.category);
        touchedModifiers.add(event.modifier || "core");
        touchedAudiences.add(event.audience || "general");
      }

      if (event.pageType === "category" && event.pageSlug) {
        touchedCategories.add(event.pageSlug);
      }
    }

    for (const slug of touchedGuides) {
      const guide = guideMap.get(slug);
      guide.uniqueSessions.add(session.sessionId);
      if (session.metrics.deepScroll || session.metrics.dwell60) guide.deepEngagementSessions += 1;
      if (session.metrics.readComplete) guide.readCompleteSessions += 1;
      if (session.metrics.sessionClass === "bounce_like") guide.bounceLikeSessions += 1;
      if (session.metrics.pageCount >= 2) guide.multiPageSessions += 1;
      if (session.metrics.hasHighIntent) guide.highIntentSessions += 1;
    }

    for (const category of touchedCategories) {
      const bucket = ensureBucket(categoryMap, category, {
        category,
        ...metricSeed()
      });
      bucket.uniqueSessions.add(session.sessionId);

      if (session.metrics.pageCount >= 2) bucket.multiPageSessions += 1;
      if (session.metrics.hasHighIntent) bucket.highIntentSessions += 1;
      if (session.metrics.deepScroll || session.metrics.dwell60) bucket.deepEngagementSessions += 1;
      if (session.metrics.readComplete) bucket.readCompleteSessions += 1;
      if (session.metrics.sessionClass === "bounce_like") bucket.bounceLikeSessions += 1;
    }

    for (const modifier of touchedModifiers) {
      const bucket = ensureBucket(modifierMap, modifier, {
        modifier,
        ...metricSeed()
      });
      bucket.uniqueSessions.add(session.sessionId);

      if (session.metrics.pageCount >= 2) bucket.multiPageSessions += 1;
      if (session.metrics.hasHighIntent) bucket.highIntentSessions += 1;
      if (session.metrics.deepScroll || session.metrics.dwell60) bucket.deepEngagementSessions += 1;
      if (session.metrics.readComplete) bucket.readCompleteSessions += 1;
      if (session.metrics.sessionClass === "bounce_like") bucket.bounceLikeSessions += 1;
    }

    for (const audience of touchedAudiences) {
      const bucket = ensureBucket(audienceMap, audience, {
        audience,
        ...metricSeed()
      });
      bucket.uniqueSessions.add(session.sessionId);

      if (session.metrics.pageCount >= 2) bucket.multiPageSessions += 1;
      if (session.metrics.hasHighIntent) bucket.highIntentSessions += 1;
      if (session.metrics.deepScroll || session.metrics.dwell60) bucket.deepEngagementSessions += 1;
      if (session.metrics.readComplete) bucket.readCompleteSessions += 1;
      if (session.metrics.sessionClass === "bounce_like") bucket.bounceLikeSessions += 1;
    }
  }

  for (const event of events) {
    if (event.pageType === "guide" && event.pageSlug) {
      const guide = guideMap.get(event.pageSlug);
      if (!guide) continue;

      if (event.eventType === "page_view") {
        const category = categoryMap.get(event.category || "unknown");
        if (category) category.views += 1;

        const modifier = modifierMap.get(event.modifier || "core");
        if (modifier) modifier.views += 1;

        const audience = audienceMap.get(event.audience || "general");
        if (audience) audience.views += 1;
      }

      if (event.eventType === "cta_click") {
        const category = categoryMap.get(event.category || "unknown");
        if (category) category.ctaClicks += 1;

        const modifier = modifierMap.get(event.modifier || "core");
        if (modifier) modifier.ctaClicks += 1;

        const audience = audienceMap.get(event.audience || "general");
        if (audience) audience.ctaClicks += 1;
      }

      if (event.eventType === "outbound_click") {
        const category = categoryMap.get(event.category || "unknown");
        if (category) category.outboundClicks += 1;

        const modifier = modifierMap.get(event.modifier || "core");
        if (modifier) modifier.outboundClicks += 1;

        const audience = audienceMap.get(event.audience || "general");
        if (audience) audience.outboundClicks += 1;
      }

      if (event.eventType === "recommendation_click") {
        const category = categoryMap.get(event.category || "unknown");
        if (category) category.recommendationClicks += 1;

        const modifier = modifierMap.get(event.modifier || "core");
        if (modifier) modifier.recommendationClicks += 1;

        const audience = audienceMap.get(event.audience || "general");
        if (audience) audience.recommendationClicks += 1;
      }
    }
  }

  const guides = Array.from(guideMap.values()).map((guide) => {
    const finalized = finalizeBucket(guide);
    const scores = scoreGuide(finalized);
    const marketCategory = signalContext.categoryMap.get(finalized.category);
    return {
      ...finalized,
      ...scores,
      marketCategorySignal: marketCategory?.avgMarketSignalScore ?? null
    };
  }).sort((a, b) => b.healthScore - a.healthScore);

  const categories = Array.from(categoryMap.values()).map((category) => {
    const finalized = finalizeBucket(category);
    return {
      ...finalized,
      engagementRate: Number(((finalized.deepEngagementSessions + finalized.readCompleteSessions) / Math.max(finalized.sessions, 1)).toFixed(2)),
      actionRate: Number(((finalized.outboundClicks + finalized.ctaClicks + finalized.recommendationClicks) / Math.max(finalized.views, 1)).toFixed(2)),
      highIntentRate: Number((finalized.highIntentSessions / Math.max(finalized.sessions, 1)).toFixed(2)),
      marketSignal: signalContext.categoryMap.get(category.category)?.avgMarketSignalScore ?? null
    };
  }).sort((a, b) => b.highIntentRate - a.highIntentRate);

  const modifiers = Array.from(modifierMap.values()).map((modifier) => {
    const finalized = finalizeBucket(modifier);
    return {
      ...finalized,
      engagementRate: Number(((finalized.deepEngagementSessions + finalized.readCompleteSessions) / Math.max(finalized.sessions, 1)).toFixed(2)),
      actionRate: Number(((finalized.outboundClicks + finalized.ctaClicks + finalized.recommendationClicks) / Math.max(finalized.views, 1)).toFixed(2)),
      highIntentRate: Number((finalized.highIntentSessions / Math.max(finalized.sessions, 1)).toFixed(2))
    };
  }).sort((a, b) => b.highIntentRate - a.highIntentRate);

  const audiences = Array.from(audienceMap.values()).map((audience) => {
    const finalized = finalizeBucket(audience);
    return {
      ...finalized,
      engagementRate: Number(((finalized.deepEngagementSessions + finalized.readCompleteSessions) / Math.max(finalized.sessions, 1)).toFixed(2)),
      actionRate: Number(((finalized.outboundClicks + finalized.ctaClicks + finalized.recommendationClicks) / Math.max(finalized.views, 1)).toFixed(2)),
      highIntentRate: Number((finalized.highIntentSessions / Math.max(finalized.sessions, 1)).toFixed(2))
    };
  }).sort((a, b) => b.highIntentRate - a.highIntentRate);

  const actionSignals = {
    winners: guides.filter((guide) => guide.actionClass === "winner").slice(0, 20),
    frictionPoints: guides.filter((guide) => guide.actionClass === "friction_point").slice(0, 20),
    quietOpportunities: guides.filter((guide) => guide.actionClass === "quiet_opportunity").slice(0, 20),
    misfires: guides.filter((guide) => guide.actionClass === "misfire").slice(0, 20),
    expandCandidates: guides.filter((guide) => guide.actionClass === "expand_candidate").slice(0, 20),
    boostModifiers: modifiers.filter((item) => item.highIntentRate >= 0.35 || item.actionRate >= 0.2).slice(0, 15),
    weakModifiers: modifiers.filter((item) => item.views >= 2 && item.actionRate === 0).slice(0, 15),
    boostAudiences: audiences.filter((item) => item.highIntentRate >= 0.35 || item.actionRate >= 0.2).slice(0, 15),
    weakAudiences: audiences.filter((item) => item.views >= 2 && item.actionRate === 0).slice(0, 15),
    accelerateCategories: categories.filter((item) => item.highIntentRate >= 0.3 || item.actionRate >= 0.18).slice(0, 10),
    inspectCategories: categories.filter((item) => item.views >= 2 && item.actionRate < 0.05).slice(0, 10)
  };

  const summary = {
    generatedAt: new Date().toISOString(),
    totals: {
      events: events.length,
      sessions: sessions.length,
      guidesTracked: guides.length,
      categoriesTracked: categories.length,
      modifiersTracked: modifiers.length,
      audiencesTracked: audiences.length
    },
    guides,
    categories,
    modifiers,
    audiences,
    actionSignals
  };

  const guideFiles = writeSummaryFiles("guide-feedback", { generatedAt: summary.generatedAt, guides });
  const categoryFiles = writeSummaryFiles("category-feedback", { generatedAt: summary.generatedAt, categories });
  const modifierFiles = writeSummaryFiles("modifier-feedback", { generatedAt: summary.generatedAt, modifiers });
  const audienceFiles = writeSummaryFiles("audience-feedback", { generatedAt: summary.generatedAt, audiences });
  const pageHealthFiles = writeSummaryFiles("page-health", {
    generatedAt: summary.generatedAt,
    pages: guides.map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      category: guide.category,
      healthScore: guide.healthScore,
      commercialIntentScore: guide.commercialIntentScore,
      actionClass: guide.actionClass
    }))
  });
  const actionSignalFiles = writeSummaryFiles("action-signals", {
    generatedAt: summary.generatedAt,
    actionSignals
  });

  const report = {
    generatedAt: summary.generatedAt,
    totals: summary.totals,
    topWinners: actionSignals.winners.slice(0, 10),
    topFrictionPoints: actionSignals.frictionPoints.slice(0, 10),
    topQuietOpportunities: actionSignals.quietOpportunities.slice(0, 10),
    topCategories: categories.slice(0, 10),
    topModifiers: modifiers.slice(0, 10),
    topAudiences: audiences.slice(0, 10),
    files: {
      guideFiles,
      categoryFiles,
      modifierFiles,
      audienceFiles,
      pageHealthFiles,
      actionSignalFiles
    }
  };

  const reportFiles = writeReport(report);
  const stateFile = writeState(summary);

  return {
    events,
    sessions,
    summary,
    report,
    files: {
      guideFiles,
      categoryFiles,
      modifierFiles,
      audienceFiles,
      pageHealthFiles,
      actionSignalFiles,
      reportFiles,
      stateFile
    }
  };
}
