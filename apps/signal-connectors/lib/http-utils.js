import { CONNECTOR_TIMEOUT_MS } from "./config.js";

export async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONNECTOR_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 commerce-autopilot signal-connectors",
        "Accept": "application/json, text/plain, */*",
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      return await response.json();
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
