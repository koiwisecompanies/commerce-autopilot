import {
  GOOGLE_SUGGEST_URL,
  DDG_SUGGEST_URL,
  REDDIT_SEARCH_URL,
  HN_SEARCH_URL,
  MAX_RESULTS_PER_SOURCE,
  DEFAULT_CATEGORY_FROM_PACK
} from "./config.js";
import { fetchJson } from "./http-utils.js";

function buildRawRecord({ source, packName, seed, rawText, url = null }) {
  return {
    source,
    packName,
    category: DEFAULT_CATEGORY_FROM_PACK[packName] || packName,
    seed,
    rawText,
    url,
    capturedAt: new Date().toISOString()
  };
}

async function googleSuggest(packName, seed) {
  const query = encodeURIComponent(seed);
  const url = `${GOOGLE_SUGGEST_URL}?client=firefox&q=${query}`;
  const json = await fetchJson(url);

  const suggestions = Array.isArray(json?.[1]) ? json[1] : [];

  return suggestions
    .slice(0, MAX_RESULTS_PER_SOURCE)
    .map((item) => buildRawRecord({
      source: "google_suggest",
      packName,
      seed,
      rawText: item
    }));
}

async function youtubeSuggest(packName, seed) {
  const query = encodeURIComponent(seed);
  const url = `${GOOGLE_SUGGEST_URL}?client=firefox&ds=yt&q=${query}`;
  const json = await fetchJson(url);

  const suggestions = Array.isArray(json?.[1]) ? json[1] : [];

  return suggestions
    .slice(0, MAX_RESULTS_PER_SOURCE)
    .map((item) => buildRawRecord({
      source: "youtube_suggest",
      packName,
      seed,
      rawText: item
    }));
}

async function duckduckgoSuggest(packName, seed) {
  const query = encodeURIComponent(seed);
  const url = `${DDG_SUGGEST_URL}?q=${query}&type=list`;
  const json = await fetchJson(url);

  const suggestions = Array.isArray(json) ? json : [];

  return suggestions
    .slice(0, MAX_RESULTS_PER_SOURCE)
    .map((item) => buildRawRecord({
      source: "duckduckgo_suggest",
      packName,
      seed,
      rawText: item?.phrase || ""
    }))
    .filter((item) => item.rawText);
}

async function redditDiscussion(packName, seed) {
  const query = encodeURIComponent(`"${seed}"`);
  const url = `${REDDIT_SEARCH_URL}?q=${query}&limit=${MAX_RESULTS_PER_SOURCE}&sort=top&t=month`;
  const json = await fetchJson(url);

  const posts = Array.isArray(json?.data?.children) ? json.data.children : [];

  return posts.map((item) => {
    const data = item?.data || {};
    return buildRawRecord({
      source: "reddit_discussion",
      packName,
      seed,
      rawText: data.title || "",
      url: data.permalink ? `https://www.reddit.com${data.permalink}` : null
    });
  }).filter((item) => item.rawText);
}

async function hackerNewsDiscussion(packName, seed) {
  const query = encodeURIComponent(seed);
  const url = `${HN_SEARCH_URL}?query=${query}&tags=story&hitsPerPage=${MAX_RESULTS_PER_SOURCE}`;
  const json = await fetchJson(url);

  const hits = Array.isArray(json?.hits) ? json.hits : [];

  return hits.map((hit) => buildRawRecord({
    source: "hackernews_discussion",
    packName,
    seed,
    rawText: hit.title || "",
    url: hit.url || null
  })).filter((item) => item.rawText);
}

export function getConnectorFunctions() {
  return {
    google_suggest: googleSuggest,
    youtube_suggest: youtubeSuggest,
    duckduckgo_suggest: duckduckgoSuggest,
    reddit_discussion: redditDiscussion,
    hackernews_discussion: hackerNewsDiscussion
  };
}
