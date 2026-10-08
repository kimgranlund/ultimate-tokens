#!/usr/bin/env node
// dom-charts.mjs: the analysis charts move from SVG strings to native DOM (renderChart in
// src/ui/charts/render.mjs), gated (#727, #728; the native DOM charts ruling).
//
// (a) The allowlist. src/ui/sections/{color,geometry,typography}.js still pass raw SVG strings to
// h("div", { html: svg }), the one place innerHTML is set, from the chart functions named in ALLOW
// below. Per file, the html: count and the <svg count each equal the file's ALLOW length, every
// html: hit sits inside an ALLOW method (the nearest preceding two-space-indented `name(...) {`
// header), and every ALLOW name still has such a header. Each port to renderChart removes its name;
// the list only shrinks, never add one.
//
// (b) The fill: none rule. An SVG line chart's <path> fills by closing (an open path draws its
// own wedge) unless its class rules fill: none, and that rule must be qualified under .an-svg so
// a shared series-color class can't override it. Every <path class="..."> class the three
// section files use, other than the documented AREA classes (a filled band, stroke: none), must
// have such a rule in src/ui/styles.css. It shrinks to nothing as the ports remove the paths.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
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

// (a) the allowlist: per section file, the chart functions still on SVG strings
const ALLOW = {
  "src/ui/sections/color.js": [],
  "src/ui/sections/geometry.js": [],
  "src/ui/sections/typography.js": [],
};
const HEADER = /^  (?:async\s+)?([A-Za-z_$][\w$]*)\s*\(.*\)\s*\{\s*$/;
const KEYWORDS = new Set(["if", "for", "while", "switch", "catch", "function", "return"]);

const sectionSrc = {};
const htmlBySection = {};
let htmlCount = 0;
for (const rel of SECTION_FILES) {
  const src = readFileSync(join(ROOT, rel), "utf8");
  sectionSrc[rel] = src;
  const allow = ALLOW[rel];
  const lines = src.split("\n");
  const headers = lines.map((l) => { const m = l.match(HEADER); return m && !KEYWORDS.has(m[1]) ? m[1] : null; });
  const htmlLines = lines.flatMap((l, i) => (l.match(/\bhtml:\s*\w/g) ?? []).map(() => i));
  const svgCount = (src.match(/<svg/g) ?? []).length;
  htmlBySection[rel] = htmlLines.length;
  htmlCount += htmlLines.length;

  if (htmlLines.length !== allow.length)
    FAIL(`${rel}: ${htmlLines.length} html: attributes, ALLOW lists ${allow.length} chart functions`);
  if (svgCount !== allow.length)
    FAIL(`${rel}: ${svgCount} <svg strings, ALLOW lists ${allow.length} chart functions`);
  for (const i of htmlLines) {
    let j = i;
    while (j >= 0 && !headers[j]) j--;
    const owner = j >= 0 ? headers[j] : null;
    if (!owner || !allow.includes(owner))
      FAIL(`${rel}:${i + 1}: html: inside ${owner ? owner + "()" : "no method"}, which is not in ALLOW`);
  }
  for (const name of allow)
    if (!headers.includes(name)) FAIL(`${rel}: ALLOW names ${name}, which has no method header; remove it from ALLOW`);
}
const allowCount = Object.values(ALLOW).reduce((n, a) => n + a.length, 0);

// (b) the fill: none rule, per class, in order of first appearance across the three files
const stylesSrc = readFileSync(STYLES, "utf8");

function findRule(cls) {
  const re = new RegExp(`^\\.an-svg \\.${escapeRe(cls)}(?![\\w-])[^\\n]*\\{[^}]*\\}`, "m");
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

const [nc, ng, nt] = SECTION_FILES.map((rel) => htmlBySection[rel]);
console.log(
  `dom-charts: ${htmlCount} html: attributes in ${allowCount} allowlisted chart functions (color ${nc}, geometry ${ng}, typography ${nt}), ${lineClasses.length} line classes qualified with fill: none`
);
process.exit(0);
