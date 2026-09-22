#!/usr/bin/env node
// svg-rules.mjs: the entry file's two SVG-chart rules, gated (#727, #728).
//
// (a) The `html:` count. src/ui/sections/{color,geometry,typography}.js pass raw SVG strings to
// h("div", { html: svg }), the one documented place innerHTML is set (see .claude/CLAUDE.md).
// The count and the exception's stated number must agree, or the exception moved without the
// doc catching up (or vice versa).
//
// (b) The fill: none rule. An SVG line chart's <path> fills by closing (an open path draws its
// own wedge) unless its class rules fill: none, and that rule must be qualified under .an-svg so
// a shared series-color class can't override it. Every <path class="..."> class the three
// section files use, other than the documented AREA classes (a filled band, stroke: none), must
// have such a rule in src/ui/styles.css.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CLAUDE_MD = join(ROOT, ".claude", "CLAUDE.md");
const STYLES = join(ROOT, "src", "ui", "styles.css");
const SECTION_FILES = [
  "src/ui/sections/color.js",
  "src/ui/sections/geometry.js",
  "src/ui/sections/typography.js",
];

// Classes whose path is a filled band, not a line: stroke: none, fill deliberately not none.
const AREA_CLASSES = new Set(["lc-ceiling"]);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let failed = 0;
const FAIL = (msg) => { failed++; console.log(`FAIL ${msg}`); };

// (a) the html: count
const claudeMd = readFileSync(CLAUDE_MD, "utf8");
const stateMatch = claudeMd.match(/SVG-chart exception: (\d+) live attributes/);
if (!stateMatch) {
  console.log("FAIL html: .claude/CLAUDE.md no longer states the SVG-chart exception count");
  process.exit(1);
}
const stated = Number(stateMatch[1]);

const sectionSrc = {};
let htmlCount = 0;
for (const rel of SECTION_FILES) {
  const src = readFileSync(join(ROOT, rel), "utf8");
  sectionSrc[rel] = src;
  const hits = src.match(/\bhtml:\s*\w/g);
  if (hits) htmlCount += hits.length;
}

if (htmlCount !== stated)
  FAIL(`html: ${htmlCount} html: attributes, .claude/CLAUDE.md states ${stated}`);

// (b) the fill: none rule, per class, in order of first appearance across the three files
const stylesSrc = readFileSync(STYLES, "utf8");

function findRule(cls) {
  const re = new RegExp(`^\\.an-svg \\.${escapeRe(cls)}\\b[^\\n]*\\{[^}]*\\}`, "m");
  const m = stylesSrc.match(re);
  return m ? m[0] : null;
}

const seen = new Set();
const lineClasses = [];
let areaClassCount = 0;
for (const rel of SECTION_FILES) {
  const re = /<path\s+class="([a-zA-Z0-9_-]+)/g;
  let m;
  while ((m = re.exec(sectionSrc[rel]))) {
    const cls = m[1];
    if (seen.has(cls)) continue;
    seen.add(cls);
    if (AREA_CLASSES.has(cls)) { areaClassCount++; continue; }
    lineClasses.push(cls);
  }
}

for (const cls of lineClasses) {
  const rule = findRule(cls);
  if (!rule) { FAIL(`${cls}: no qualified rule .an-svg .${cls}`); continue; }
  if (!/fill:\s*none/.test(rule)) FAIL(`${cls}: rule lacks fill: none`);
}

if (failed) {
  console.log(`FAIL: ${failed}`);
  process.exit(1);
}

console.log(
  `svg-rules: ${htmlCount} html: attributes (stated ${stated}), ${lineClasses.length} line classes qualified with fill: none, ${areaClassCount} area class`
);
process.exit(0);
