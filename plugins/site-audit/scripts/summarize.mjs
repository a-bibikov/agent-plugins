#!/usr/bin/env node
/**
 * Turns a JSON report of search-auditor or ai-search-auditor into a short list to work from: the score, then every
 * check that found something — errors first — with what is wrong, why it matters, how to fix it and where.
 * The full report stays in the file; this keeps the context small.
 *
 *   node summarize.mjs report.json [--all]     --all also lists the checks that were not run, with the reason
 */
import { readFileSync } from "node:fs";

const [file, ...flags] = process.argv.slice(2);
if (!file) {
  console.error("usage: summarize.mjs <report.json> [--all]");
  process.exit(2);
}
const r = JSON.parse(readFileSync(file, "utf8"));
const LEVELS = ["error", "warn", "info"];
const MAX_PLACES = 6;

console.log(`${r.site} — ${r.score}/100 (${r.grade}), ${r.checked} of ${r.total} checks run, ${r.pages.length} pages`);
console.log(`errors ${r.counts.error} · warnings ${r.counts.warn} · notes ${r.counts.info}${r.capped ? " · grade capped: too few checks could run" : ""}`);

// One block per check and level: a check can report an error on one page and a note on another.
const groups = new Map();
for (const f of r.findings) {
  const key = `${f.rule}|${f.level}`;
  if (!groups.has(key)) groups.set(key, { ...f, places: [], messages: new Set() });
  const g = groups.get(key);
  g.places.push(f.where);
  g.messages.add(f.message);
}
const order = [...groups.values()].sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.rule.localeCompare(b.rule, "en", { numeric: true }));
for (const g of order) {
  const site = r.site.replace(/\/$/, "");
  const places = [...new Set(g.places.map((p) => p.replace(site, "") || "/"))];
  console.log(`\n[${g.level}] ${g.rule} ${g.title} — ${places.length} place${places.length === 1 ? "" : "s"}`);
  for (const m of [...g.messages].slice(0, 3)) console.log(`  found: ${m}`);
  if (g.messages.size > 3) console.log(`  …and ${g.messages.size - 3} more messages`);
  console.log(`  where: ${places.slice(0, MAX_PLACES).join(", ")}${places.length > MAX_PLACES ? `, …and ${places.length - MAX_PLACES} more` : ""}`);
  if (g.why) console.log(`  why:   ${g.why}`);
  if (g.fix) console.log(`  fix:   ${g.fix}`);
}
if (!groups.size) console.log("\nNothing found.");

const skipped = r.rules.filter((x) => x.skipped);
if (skipped.length) {
  console.log(`\nNot checked: ${skipped.length}${flags.includes("--all") ? "" : " (run with --all to list them)"}`);
  if (flags.includes("--all")) for (const x of skipped) console.log(`  ${x.id} ${x.title} — ${x.skipped}`);
}
