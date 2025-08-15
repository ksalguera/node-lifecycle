#!/usr/bin/env node
import { getSchedule, classify } from "./index.js";
import {
  findActiveLTS,
  findCurrent,
  formatFriendlyDate,
  codenameFor,
} from "./utils.js";

/* ---------------- Arg Passing ---------------- */
function getArg(name: string): string | undefined {
  const pfx = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(pfx));
  return hit ? hit.slice(pfx.length) : undefined;
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

function printHelp() {
  console.log(
`Usage: node-lifecycle [--warn-days=N] [--version=X.Y.Z] [--cache-ttl=SECS] [--no-fail]

Checks the Node.js version lifecycle (current/LTS/maintenance/EOL).

Flags:
  --warn-days=N     Warn (exit 1) if EOL is within N days (default: 180).
  --version=VER     Check this specific version (default: process.version).
  --cache-ttl=SECS  Schedule cache TTL in seconds (default: 86400 via env or built-in).
  --no-fail         Do not fail (exit 2) on EOL; print ❌ but exit 0.
  --help            Show this help message.

Exit codes:
  0 = OK (supported)
  1 = Warning (within warn-days of EOL)
  2 = EOL (unless --no-fail, then 0)
`
  );
}

/* ---------------- Flags ---------------- */

if (hasFlag("help")) { printHelp(); process.exit(0); }

const argVersion = getArg("version");

// --warn-days (default 180)
const warnDaysRaw = getArg("warn-days");
const warnDays = warnDaysRaw === undefined ? 180 : Number(warnDaysRaw);
if (!Number.isFinite(warnDays) || warnDays < 0) {
  console.error(`Invalid --warn-days value: ${warnDaysRaw}`);
  process.exit(2);
}

const noFail = hasFlag("no-fail");

// --cache-ttl in seconds → ms
const cacheTtlRaw = getArg("cache-ttl");
const cacheTtlMs =
  cacheTtlRaw === undefined
    ? undefined
    : (Number(cacheTtlRaw) >= 0 ? Number(cacheTtlRaw) * 1000 : undefined);

if (cacheTtlRaw !== undefined && cacheTtlMs === undefined) {
  console.error(`Invalid --cache-ttl value: ${cacheTtlRaw}`);
  process.exit(2);
}

async function main() {
  const schedule = await getSchedule({ cacheTtlMs });
  const runtime = argVersion ?? process.version;
  const result = classify(runtime, schedule);

  // helper to build recommendation list
  const buildRecommendations = () => {
    const rec: string[] = [];
    const ltsList = findActiveLTS(schedule); // e.g., [22, 20]
    const topLts = ltsList[0];               // highest active LTS
    const current = findCurrent(schedule);   // e.g., 24

    // Only recommend LTS if it's newer than the user's major
    if (Number.isFinite(topLts) && topLts > result.major) {
      const name = codenameFor(topLts);
      rec.push(`LTS v${topLts}${name ? ` (“${name}”)` : ""}`);
    }

    // Always recommend Current unless they're already on it
    if (current && current !== result.major) {
      const name = codenameFor(current);
      rec.push(`Current v${current}${name ? ` (“${name}”)` : ""}`);
    }

    return rec;
  };

  // EOL → fail (unless --no-fail)
  if (result.status === "eol") {
    const eolPretty = formatFriendlyDate(result.eol);
    console.error(`❌ Node ${runtime} (major ${result.major}) is EOL as of ${result.eol} (${eolPretty}).`);
    const rec = buildRecommendations();
    if (rec.length) console.error(`Recommendation: Update to ${rec.join(" or ")}.`);
    process.exit(noFail ? 0 : 2);
  }

  // Unknown line → warn (non-fatal)
  if (result.status === "unknown") {
    console.warn(`⚠️  Node ${runtime} → unknown release line (no schedule data).`);
    process.exit(1);
  }

  // Near-EOL window
  if (typeof result.daysToEol === "number" && result.daysToEol <= warnDays) {
    const eolPretty = formatFriendlyDate(result.eol);
    console.warn(`⚠️  Node ${runtime} (major ${result.major}) → ${result.status}. EOL ${result.eol} (${eolPretty}) in ${result.daysToEol} days.`);
    const rec = buildRecommendations();
    if (rec.length) console.warn(`Consider upgrading to ${rec.join(" or ")}.`);
    process.exit(1);
  }

  // Supported OK
  const eolPretty = formatFriendlyDate(result.eol);
  const code = codenameFor(result.major);
  const suffix = code ? ` (“${code}”)` : "";
  console.log(`✅ Node ${runtime} (major ${result.major})${suffix} → ${result.status}. EOL ${result.eol} (${eolPretty}) in ${result.daysToEol} days.`);
  process.exit(0);
}

main();