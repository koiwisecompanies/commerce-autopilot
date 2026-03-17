import { buildFeedbackSummary } from "./lib/summary-builder.js";

const result = buildFeedbackSummary();

console.log("");
console.log("Feedback summarize");
console.log("------------------");
console.log(`Events: ${result.summary.totals.events}`);
console.log(`Sessions: ${result.summary.totals.sessions}`);
console.log(`Guides tracked: ${result.summary.totals.guidesTracked}`);
console.log(`Categories tracked: ${result.summary.totals.categoriesTracked}`);
console.log(`Modifiers tracked: ${result.summary.totals.modifiersTracked}`);
console.log(`Audiences tracked: ${result.summary.totals.audiencesTracked}`);
console.log("");
console.log(`Report: ${result.files.reportFiles.latest}`);
console.log(`State: ${result.files.stateFile}`);
