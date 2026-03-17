import fs from "fs-extra";

export async function readJsonSafe(filePath, fallback) {
  const exists = await fs.pathExists(filePath);
  if (!exists) {
    return fallback;
  }
  return fs.readJSON(filePath);
}

export async function readTextSafe(filePath, fallback = "") {
  const exists = await fs.pathExists(filePath);
  if (!exists) {
    return fallback;
  }
  return fs.readFile(filePath, "utf8");
}

export function avg(values) {
  const valid = values.filter((v) => Number.isFinite(v));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
