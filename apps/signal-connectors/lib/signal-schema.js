export function buildSignalRecord({
  source,
  sourceType,
  packName,
  category,
  seed,
  rawText,
  candidateTopic,
  modifier,
  audience,
  freshnessScore,
  confidenceScore,
  marketSignalScore,
  capturedAt,
  url = null
}) {
  return {
    source,
    sourceType,
    packName,
    category,
    seed,
    rawText,
    candidateTopic,
    modifier,
    audience,
    freshnessScore,
    confidenceScore,
    marketSignalScore,
    capturedAt,
    url
  };
}
