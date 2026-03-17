import fs from "fs";
import path from "path";
import { EVENTS_DIR, RAPID_DUPLICATE_WINDOW_MS } from "./config.js";
import { normalizeEvent } from "./event-schema.js";
import { enrichGuideEvent } from "./page-utils.js";

function listEventFiles() {
  if (!fs.existsSync(EVENTS_DIR)) return [];
  return fs.readdirSync(EVENTS_DIR)
    .filter((file) => file.endsWith(".jsonl"))
    .sort()
    .map((file) => path.join(EVENTS_DIR, file));
}

export function readAllEvents() {
  const files = listEventFiles();
  const events = [];

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

    for (const line of lines) {
      try {
        const record = JSON.parse(line);
        events.push(enrichGuideEvent(normalizeEvent(record)));
      } catch {
        // ignore malformed line
      }
    }
  }

  return dedupeRapidNoise(events).sort((a, b) => a.ts.localeCompare(b.ts));
}

function dedupeRapidNoise(events) {
  const seen = new Map();
  const kept = [];

  for (const event of events.sort((a, b) => a.ts.localeCompare(b.ts))) {
    const ts = new Date(event.ts).getTime();
    const key = [
      event.sessionId,
      event.eventType,
      event.pagePath,
      event.label || "",
      event.outboundTarget || ""
    ].join("|");

    const previous = seen.get(key);

    if (previous && (ts - previous) <= RAPID_DUPLICATE_WINDOW_MS) {
      continue;
    }

    seen.set(key, ts);
    kept.push(event);
  }

  return kept;
}
