import semver from "semver";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Schedule, Classification, ReleaseInfo } from "./types.js";

/* ---------------- cache helpers ---------------- */

const DEFAULT_TTL_MS = Number(process.env.NODE_EOL_CACHE_TTL ?? 24 * 60 * 60 * 1000); // 24h

function cacheDir(): string {
  const home = os.homedir();
  const xdg = process.env.XDG_CACHE_HOME || (home ? path.join(home, ".cache") : "");
  return process.env.NODE_EOL_CACHE_DIR || (xdg ? path.join(xdg, "node-lifecycle") : path.join(os.tmpdir(), "node-lifecycle"));
}

function cachePath(name: string): string {
  return path.join(cacheDir(), name);
}

async function readCache(name: string, ttlMs: number): Promise<any | null> {
  try {
    const p = cachePath(name);
    const stat = await fs.stat(p);
    const age = Date.now() - stat.mtimeMs;
    if (age > ttlMs) return null;
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCache(name: string, data: unknown): Promise<void> {
  try {
    await fs.mkdir(cacheDir(), { recursive: true });
    await fs.writeFile(cachePath(name), JSON.stringify(data), "utf8");
  } catch {
    /* ignore cache write errors */
  }
}

/* ---------------- fetchers ---------------- */

async function fetchJson(url: string): Promise<any> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

async function fetchWG(ttlMs: number): Promise<Schedule> {
  const url = "https://raw.githubusercontent.com/nodejs/Release/HEAD/schedule.json";
  const cacheName = "schedule.wg.json";
  const cached = await readCache(cacheName, ttlMs);
  if (cached) return cached as Schedule;
  const data = (await fetchJson(url)) as Schedule;
  await writeCache(cacheName, data);
  return data;
}

// Minimal type for endoflife.date entries we care about
type EoLEntry = { cycle?: string | number; eol?: string | null };

function normalizeEndOfLife(arr: EoLEntry[]): Schedule {
  const out: Schedule = {};
  for (const line of arr) {
    const majorNum = Number(line.cycle);
    const eol = line.eol ?? undefined;
    if (!Number.isFinite(majorNum) || !eol) continue;
    out[String(majorNum)] = { end: eol } as ReleaseInfo;
  }
  return out;
}

async function fetchEoL(ttlMs: number): Promise<Schedule> {
  const url = "https://endoflife.date/api/nodejs.json";
  const cacheName = "schedule.eol.json";
  const cached = await readCache(cacheName, ttlMs);
  if (cached) return cached as Schedule;
  const payload = (await fetchJson(url)) as EoLEntry[];
  const normalized = normalizeEndOfLife(payload);
  await writeCache(cacheName, normalized);
  return normalized;
}

/* ---------------- API ---------------- */

export async function getSchedule(opts?: { cacheTtlMs?: number }): Promise<Schedule> {
  const ttlMs = opts?.cacheTtlMs ?? DEFAULT_TTL_MS;
  try {
    const wg = await fetchWG(ttlMs);
    try {
      const eol = await fetchEoL(ttlMs);
      return { ...eol, ...wg }; // WG overrides EoL
    } catch {
      return wg;
    }
  } catch {
    try {
      return await fetchEoL(ttlMs);
    } catch {
      return {};
    }
  }
}

// Date-only (UTC) diff in days; returns +Infinity if target is invalid/missing
function daysUntil(iso?: string, now = new Date()): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return Number.POSITIVE_INFINITY;
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const targetUtc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.ceil((targetUtc - todayUtc) / 86400000);
}

export function classify(nodeVersion: string, schedule: Schedule): Classification {
  const coerced = semver.coerce(nodeVersion);
  if (!coerced) return { major: NaN, status: "unknown" };

  const major = semver.major(coerced);
  const rel = schedule[String(major)];

  // Missing release line entirely
  if (!rel) return { major, status: "unknown" };

  const now = new Date();

  // If no end date or invalid date → unknown
  if (!rel.end || Number.isNaN(new Date(rel.end).getTime())) {
    return { major, status: "unknown" };
  }

  const eolDays = daysUntil(rel.end, now);
  const isEol = eolDays <= 0;

  let status: Classification["status"];
  if (isEol) {
    status = "eol";
  } else if (rel.maintenance && new Date(rel.maintenance) <= now) {
    status = "maintenance";
  } else if (rel.lts && new Date(rel.lts) <= now) {
    status = "active-lts";
  } else {
    status = "current";
  }

  return { major, status, eol: rel.end, daysToEol: Number.isFinite(eolDays) ? eolDays : undefined };
}
