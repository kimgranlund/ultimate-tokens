#!/usr/bin/env node
// audit-mirrors.mjs -- generative enumeration of figma/plugin/ui.html's mirrors of every
// source line this plan touches. Run from the repo root: node audit-mirrors.mjs
// Read-only. Replaces the hand-listed grep table of rounds 8/9.
//
// SOURCE SET (derived, not listed): every line of the bundled UI sources that either
//   (a) mentions the identifier `canvasView`, or
//   (b) enumerates >=2 of the canvasView VALUES (derived from src/) without naming radix.
// For each, the exact trimmed text is searched in the bundle. A source line with no
// bundle hit is reported too: that is what makes the enumeration falsifiable.

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const BUNDLE = "figma/plugin/ui.html";
const read = (p) => { const t = readFileSync(p, "utf8").split("\n"); if (t.at(-1) === "") t.pop(); return t; };
const tracked = execSync("git ls-files", { encoding: "utf8" }).trim().split("\n");
const SRC = tracked.filter((p) => /^src\/(ui|engine)\/.*\.(js|mjs)$/.test(p));

const values = new Set();
for (const p of SRC) for (const l of read(p)) for (const m of l.matchAll(/canvasView\s*(?:===|!==)\s*"([a-z]+)"/g)) values.add(m[1]);
{
  const color = read("src/ui/sections/color.js");
  const seg = color.findIndex((l) => l.includes('cls: "canvas-seg"'));
  for (let i = seg; i >= 0 && i > seg - 30; i--) { const m = color[i].match(/\{ id: "([a-z]+)", label: "[^"]+"/); if (m) values.add(m[1]); }
}
const VALUES = [...values].sort();

const bundle = read(BUNDLE);
const bundleIndex = bundle.map((l) => l.trim());

const rows = [];
for (const p of SRC) {
  const lines = read(p);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i], t = raw.trim(), lc = raw.toLowerCase();
    const named = VALUES.filter((v) => lc.includes(v));
    const isIdent = raw.includes("canvasView");
    const isEnum = named.length >= 2 && !lc.includes("radix");
    if (!isIdent && !isEnum) continue;
    if (t.length < 8) { rows.push({ src: `${p}:${i + 1}`, kind: isIdent ? "identifier" : "enumeration", text: t, hits: ["(too short to match uniquely)"] }); continue; }
    const hits = [];
    for (let j = 0; j < bundleIndex.length; j++) if (bundleIndex[j].includes(t)) hits.push(`${BUNDLE}:${j + 1}`);
    rows.push({ src: `${p}:${i + 1}`, kind: isIdent ? (isEnum ? "identifier+enumeration" : "identifier") : "enumeration", text: t, hits });
  }
}

// the reverse direction: enumerations that exist in the bundle with no source counterpart
const mirrored = new Set(rows.flatMap((r) => r.hits));
const bundleOnly = [];
for (let j = 0; j < bundle.length; j++) {
  const lc = bundle[j].toLowerCase();
  const named = VALUES.filter((v) => lc.includes(v));
  const hit = bundle[j].includes("canvasView") || (named.length >= 2 && !lc.includes("radix"));
  if (hit && !mirrored.has(`${BUNDLE}:${j + 1}`)) bundleOnly.push({ line: j + 1, text: bundle[j].trim().slice(0, 140) });
}

console.log(`HEAD ${execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim()}`);
console.log(`canvasView values derived from src/: [${VALUES.join(", ")}]`);
console.log(`bundle: ${BUNDLE} (${bundle.length} lines)\n`);
console.log(`SOURCE LINES IN THE PLAN'S OWN CLASSES: ${rows.length}`);
for (const r of rows) console.log(`  ${r.src}  [${r.kind}]  -> ${r.hits.length ? r.hits.join(", ") : "NO BUNDLE MIRROR"}\n      ${r.text.slice(0, 130)}`);
console.log(`\nMIRRORED BUNDLE LINES (distinct): ${mirrored.size}`);
console.log(`  ${[...mirrored].sort((a, b) => +a.split(":")[1] - +b.split(":")[1]).join(", ")}`);
console.log(`\nSOURCE LINES WITH NO MIRROR: ${rows.filter((r) => !r.hits.length).length}`);
for (const r of rows.filter((r) => !r.hits.length)) console.log(`  ${r.src}  ${r.text.slice(0, 120)}`);
console.log(`\nBUNDLE-ONLY HITS (in a plan class, no source counterpart): ${bundleOnly.length}`);
for (const b of bundleOnly) console.log(`  ${BUNDLE}:${b.line}  ${b.text}`);
