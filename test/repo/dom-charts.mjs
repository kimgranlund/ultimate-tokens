#!/usr/bin/env node
// dom-charts.mjs: the analysis charts are native DOM (renderChart in src/ui/charts/render.mjs over
// the pure src/ui/charts/core.mjs), gated (#727, #728; the native DOM charts ruling, ADR-035).
//
// The html: SVG exception is retired. Every src/ui/sections/*.js holds zero html: attributes and
// zero <svg strings, h() in src/ui/app-helpers.mjs sets no innerHTML (it no longer takes html),
// and src/ui/charts/*.mjs sets no innerHTML and builds no <svg. Icons (src/ui/icons.js) are not
// charts and keep their own innerHTML.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const listDir = (rel, ext) =>
  readdirSync(join(ROOT, rel)).filter((f) => f.endsWith(ext)).sort().map((f) => `${rel}/${f}`);
const SECTION_FILES = listDir("src/ui/sections", ".js");
const CHART_FILES = listDir("src/ui/charts", ".mjs");
const HELPERS = "src/ui/app-helpers.mjs";

let failed = 0;
const FAIL = (msg) => { failed++; console.log(`FAIL ${msg}`); };
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const count = (src, re) => (src.match(re) ?? []).length;

for (const rel of SECTION_FILES) {
  const src = read(rel);
  const html = count(src, /\bhtml:\s*\w/g);
  const svg = count(src, /<svg/g);
  if (html) FAIL(`${rel}: ${html} html: attributes, want 0`);
  if (svg) FAIL(`${rel}: ${svg} <svg strings, want 0`);
}

const helpers = count(read(HELPERS), /innerHTML/g);
if (helpers) FAIL(`${HELPERS}: ${helpers} innerHTML, want 0 (h() takes no html)`);

for (const rel of CHART_FILES) {
  const src = read(rel);
  const inner = count(src, /innerHTML/g);
  const svg = count(src, /<svg/g);
  if (inner) FAIL(`${rel}: ${inner} innerHTML, want 0`);
  if (svg) FAIL(`${rel}: ${svg} <svg strings, want 0`);
}

if (failed) {
  console.log(`FAIL: ${failed}`);
  process.exit(1);
}

console.log("dom-charts: 0 html: attributes, 0 <svg strings in src/ui/sections, h() sets no innerHTML");
process.exit(0);
