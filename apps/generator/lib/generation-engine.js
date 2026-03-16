import fs from "fs-extra";
import { normalizeTopic, parseCommaSeparatedTopics, validateTopic } from "./topic-utils.js";
import { buildGuide } from "./guide-builder.js";
import { loadGuides, saveGuides, hasDuplicateBySlug, hasDuplicateByTitle } from "./guide-store.js";
import { writeRunReport } from "./report-utils.js";

export async function loadTopicsFromFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => normalizeTopic(line))
    .filter(Boolean);
}

export function loadTopicsFromCsv(raw) {
  return parseCommaSeparatedTopics(raw);
}

export async function runGeneration({
  topics = [],
  source = "manual",
  dryRun = false
}) {
  const startedAt = new Date().toISOString();

  const originalGuides = await loadGuides();
  const workingGuides = [...originalGuides];

  const report = {
    startedAt,
    source,
    dryRun,
    totals: {
      received: topics.length,
      processed: 0,
      created: 0,
      skippedDuplicates: 0,
      failedValidation: 0
    },
    created: [],
    skippedDuplicates: [],
    failedValidation: []
  };

  const seenSlugsThisRun = new Set();

  for (const rawTopic of topics) {
    report.totals.processed += 1;

    const topic = normalizeTopic(rawTopic);
    const validation = validateTopic(topic);

    if (!validation.valid) {
      report.totals.failedValidation += 1;
      report.failedValidation.push({
        topic,
        errors: validation.errors
      });
      continue;
    }

    const { slug } = validation;

    if (
      seenSlugsThisRun.has(slug) ||
      hasDuplicateBySlug(workingGuides, slug) ||
      hasDuplicateByTitle(workingGuides, topic)
    ) {
      report.totals.skippedDuplicates += 1;
      report.skippedDuplicates.push({
        topic,
        slug
      });
      continue;
    }

    const guide = buildGuide(topic);
    seenSlugsThisRun.add(slug);
    workingGuides.push(guide);

    report.totals.created += 1;
    report.created.push({
      topic,
      slug,
      category: guide.category
    });
  }

  if (!dryRun && report.totals.created > 0) {
    await saveGuides(workingGuides);
  }

  report.finishedAt = new Date().toISOString();
  report.files = await writeRunReport(report);

  return report;
}
