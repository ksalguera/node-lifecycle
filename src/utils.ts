import { Schedule } from "./types.js";

export const CODENAMES: Readonly<Record<number, string>> = {
  18: "Hydrogen",
  20: "Iron",
  22: "Jod",
  24: "Krypton",
} as const;

const toValidDate = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

// ISO → friendly date without TZ drift
export function formatFriendlyDate(isoDate?: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return isoDate;

  const utc = new Date(Date.UTC(y, m - 1, d));
  return utc.toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

/**
 * Return ALL active LTS majors.
 * Normal path: require ltsStart <= now && eol > now.
 * Fallback path (when no majors have an `lts` field at all, e.g. endoflife.date only):
 *   infer LTS = even majors with eol > now, EXCLUDING the highest supported major (assumed Current).
 */
export function findActiveLTS(schedule: Schedule, now = new Date()): number[] {
  const keys = Object.keys(schedule);
  if (keys.length === 0) return [];

  const majors = keys.map(Number).filter(Number.isFinite);
  const anyLtsInfo = majors.some((m) => !!schedule[String(m)]?.lts);

  if (anyLtsInfo) {
    return majors
      .filter((m) => {
        const r = schedule[String(m)];
        if (!r) return false;
        const eol = toValidDate(r.end);
        const ltsStart = toValidDate(r.lts);
        return !!ltsStart && ltsStart <= now && !!eol && eol > now;
      })
      .sort((a, b) => b - a);
  }

  // Fallback inference
  const supported = majors.filter((m) => {
    const e = toValidDate(schedule[String(m)]?.end);
    return !!e && e > now;
  });
  if (!supported.length) return [];

  const highestSupported = Math.max(...supported); // assumed Current
  return supported
    .filter((m) => m !== highestSupported && m % 2 === 0)
    .sort((a, b) => b - a);
}

/**
 * Latest Current (supported & not yet LTS).
 * Fallback (no `lts` fields): the highest supported major.
 */
export function findCurrent(schedule: Schedule, now = new Date()): number | null {
  const keys = Object.keys(schedule);
  if (keys.length === 0) return null;

  const majors = keys.map(Number).filter(Number.isFinite);
  const anyLtsInfo = majors.some((m) => !!schedule[String(m)]?.lts);

  if (anyLtsInfo) {
    const candidates = majors.filter((m) => {
      const r = schedule[String(m)];
      if (!r) return false;
      const eol = toValidDate(r.end);
      const ltsStart = toValidDate(r.lts);
      if (!eol || eol <= now) return false;
      return !ltsStart || ltsStart > now; // not yet LTS
    });
    return candidates.length ? Math.max(...candidates) : null;
  }

  // Fallback: highest supported major
  const supported = majors.filter((m) => {
    const e = toValidDate(schedule[String(m)]?.end);
    return !!e && e > now;
  });
  return supported.length ? Math.max(...supported) : null;
}

export function codenameFor(major?: number | null): string {
  if (!Number.isFinite(major as number)) return "";
  return CODENAMES[major as number] || "";
}
