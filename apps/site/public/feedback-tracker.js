(function () {
  if (typeof window === "undefined") return;
  if (window.__commerceFeedbackTrackerLoaded) return;
  window.__commerceFeedbackTrackerLoaded = true;

  const API_URL = "/api/feedback";
  const SESSION_KEY = "commerce_autopilot_session_id";
  const VISITOR_KEY = "commerce_autopilot_visitor_id";
  const PAGE_KEY = "commerce_autopilot_pageview_sent";
  const firedMilestones = new Set();
  const firedDwells = new Set();

  function uuid() {
    return (window.crypto && window.crypto.randomUUID)
      ? window.crypto.randomUUID()
      : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function getOrCreate(key, useSessionStorage) {
    const store = useSessionStorage ? window.sessionStorage : window.localStorage;
    let value = store.getItem(key);
    if (!value) {
      value = uuid();
      store.setItem(key, value);
    }
    return value;
  }

  const sessionId = getOrCreate(SESSION_KEY, true);
  const visitorId = getOrCreate(VISITOR_KEY, false);

  function classifyPage() {
    const path = window.location.pathname || "/";
    const parts = path.split("/").filter(Boolean);

    if (path === "/") {
      return { pageType: "home", pageSlug: null };
    }

    if (path === "/guides") {
      return { pageType: "guide_index", pageSlug: null };
    }

    if (parts[0] === "guides" && parts[1]) {
      return { pageType: "guide", pageSlug: parts[1] };
    }

    if (parts[0] === "categories" && parts[1]) {
      return { pageType: "category", pageSlug: parts[1] };
    }

    return { pageType: "other", pageSlug: null };
  }

  function referrerType() {
    if (!document.referrer) return "direct";
    try {
      const ref = new URL(document.referrer);
      if (ref.origin === window.location.origin) return "internal";
      return "external";
    } catch {
      return "unknown";
    }
  }

  function send(payload) {
    const body = JSON.stringify({
      eventId: uuid(),
      sessionId,
      visitorId,
      pagePath: window.location.pathname,
      referrerType: referrerType(),
      ...classifyPage(),
      ...payload
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(API_URL, blob);
      return;
    }

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  }

  function sendPageViewOnce() {
    const key = PAGE_KEY + ":" + window.location.pathname;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");

    send({
      eventType: "page_view",
      eventClass: "passive"
    });
  }

  function setupScrollTracking() {
    const milestones = [25, 50, 75, 100];

    function onScroll() {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight) - doc.clientHeight;
      if (scrollHeight <= 0) return;

      const pct = Math.round((scrollTop / scrollHeight) * 100);

      for (const milestone of milestones) {
        if (pct >= milestone && !firedMilestones.has(milestone)) {
          firedMilestones.add(milestone);
          send({
            eventType: "scroll_" + milestone,
            eventClass: "engagement",
            label: String(milestone)
          });

          if (milestone === 100) {
            send({
              eventType: "read_complete",
              eventClass: "engagement"
            });
          }
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupDwellTracking() {
    [15, 30, 60].forEach((seconds) => {
      window.setTimeout(() => {
        if (firedDwells.has(seconds)) return;
        firedDwells.add(seconds);
        send({
          eventType: "dwell_" + seconds + "s",
          eventClass: "engagement",
          label: String(seconds)
        });
      }, seconds * 1000);
    });
  }

  function detectClickType(target) {
    const text = (target.textContent || "").trim().toLowerCase();
    const href = target.href || target.getAttribute("href") || "";
    const currentOrigin = window.location.origin;

    let outbound = false;
    try {
      if (href) outbound = new URL(href, currentOrigin).origin !== currentOrigin;
    } catch {}

    if (outbound) {
      return {
        eventType: "outbound_click",
        eventClass: "action",
        outboundTarget: href
      };
    }

    if (href.includes("/guides/")) {
      return {
        eventType: "internal_guide_click",
        eventClass: "navigation"
      };
    }

    if (href.includes("/categories/")) {
      return {
        eventType: "category_nav_click",
        eventClass: "navigation"
      };
    }

    if (
      text.includes("view deal") ||
      text.includes("shop now") ||
      text.includes("buy now") ||
      text.includes("view on amazon") ||
      text.includes("check price")
    ) {
      return {
        eventType: "cta_click",
        eventClass: "action",
        ctaId: text.replace(/\s+/g, "_")
      };
    }

    if (
      text.includes("browse all guides") ||
      text.includes("related guides") ||
      text.includes("read more")
    ) {
      return {
        eventType: "recommendation_click",
        eventClass: "action"
      };
    }

    return {
      eventType: "generic_click",
      eventClass: "navigation"
    };
  }

  function setupClickTracking() {
    document.addEventListener("click", function (event) {
      const el = event.target.closest("a, button");
      if (!el) return;

      const clickInfo = detectClickType(el);
      if (!clickInfo) return;

      send({
        ...clickInfo,
        label: (el.textContent || "").trim().slice(0, 120)
      });
    });
  }

  sendPageViewOnce();
  setupScrollTracking();
  setupDwellTracking();
  setupClickTracking();
})();
