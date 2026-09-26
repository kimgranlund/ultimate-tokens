#!/usr/bin/env node
// report-chroma-floor-movement.mjs - #701 chroma-floor U1's own named movement script (the plan's
// blast-radius section; `report-preset-fidelity.mjs --movement` does not exist, per the plan's
// revision 7). Compares the shipped engine's even-mode 25-stop rendered output, for every corpus
// palette (343 curated documents) plus the 16-palette default kit, against the literal pre-unit
// `src/engine/tonal.js` at a named base commit (default: the merge-base with origin/main) - not a
// hand-reconstructed "neutralised" approximation, so there is no risk of the F3-class undercount
// bug the review caught in test/engine/anchor.mjs's own negative control (a shortcut render path
// plus a colliding dedup key). The comparison instead: (a) reads the REAL historical tonal.js blob
// via `git show <base>:src/engine/tonal.js`, (b) patches ONLY its two relative import paths
// (hct.js/okhsl.js) to absolute file URLs so it can load standalone from a data: URL, and (c) wires
// model.mjs's own tonal.js import to that data URL - the buggy/old run then takes the exact
// hydrate()+projectView() render path the real product renders, matching the technique
// test/engine/anchor.mjs's lone-spike control uses (post review round 2, F6).
//
//   node scripts/report-chroma-floor-movement.mjs [<base-ref>]
//
// <base-ref> defaults to `git merge-base HEAD origin/main`. Prints, per family, the count of moved
// even 25-stop cells and the corpus + kit totals (moved / total, max |dC| CAM16 chroma at any moved
// cell, and its witness).
import { execFileSync } from "node:child_process";
import { hydrate } from "../src/ui/persist.js";
import { defaultDocument, projectView } from "../src/ui/model.mjs";
import { cam16FromRgb } from "../src/engine/hct.js";

const REPO_ROOT = new URL("..", import.meta.url);
const baseRef = process.argv[2] ?? execFileSync("git", ["merge-base", "HEAD", "origin/main"], { cwd: REPO_ROOT }).toString().trim();

const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
const presets = [];
for (const slug of CATS) {
  const { PRESETS } = await import(`../src/ui/categories/${slug}.js`);
  for (const preset of PRESETS) presets.push({ slug, preset });
}
const dk = defaultDocument();
const kitLabel = dk.name ?? "Default";

// The real pre-unit tonal.js, read from git history (not reconstructed), patched only so its two
// relative imports resolve from a data: URL.
const oldTonalSrc = execFileSync("git", ["show", `${baseRef}:src/engine/tonal.js`], { cwd: REPO_ROOT }).toString();
const hctUrl = new URL("../src/engine/hct.js", import.meta.url).href;
const okhslUrl = new URL("../src/engine/okhsl.js", import.meta.url).href;
const oldTonalUrl = `data:text/javascript;base64,${Buffer.from(
  oldTonalSrc.replace('from "./hct.js"', `from "${hctUrl}"`).replace('from "./okhsl.js"', `from "${okhslUrl}"`),
).toString("base64")}`;

// model.mjs's own relative imports, rewritten to absolute file URLs so it can load standalone from
// a data: URL - every one EXCEPT tonal.js, which points at the base-commit module above.
const modelSrc = execFileSync("git", ["show", "HEAD:src/ui/model.mjs"], { cwd: REPO_ROOT }).toString();
const modelRewrites = [
  ['"../engine/collections.js"', new URL("../src/engine/collections.js", import.meta.url).href],
  ['"./persist.js"', new URL("../src/ui/persist.js", import.meta.url).href],
  ['"../engine/hct.js"', hctUrl],
  ['"../engine/okhsl.js"', okhslUrl],
  ['"../engine/icon-systems.mjs"', new URL("../src/engine/icon-systems.mjs", import.meta.url).href],
  ['"../engine/motion.mjs"', new URL("../src/engine/motion.mjs", import.meta.url).href],
  ['"../engine/tonal.js"', oldTonalUrl],
  ['"../engine/data-hues.mjs"', new URL("../src/engine/data-hues.mjs", import.meta.url).href],
  ['"../engine/prime.mjs"', new URL("../src/engine/prime.mjs", import.meta.url).href],
  ['"../engine/resolve.mjs"', new URL("../src/engine/resolve.mjs", import.meta.url).href],
  ['"../engine/semantic.js"', new URL("../src/engine/semantic.js", import.meta.url).href],
  ['"../engine/type.mjs"', new URL("../src/engine/type.mjs", import.meta.url).href],
  ['"../engine/geometry.mjs"', new URL("../src/engine/geometry.mjs", import.meta.url).href],
  ['"../engine/exports.js"', new URL("../src/engine/exports.js", import.meta.url).href],
  ['"../engine/ds-export.js"', new URL("../src/engine/ds-export.js", import.meta.url).href],
];
let patchedModel = modelSrc;
for (const [target, url] of modelRewrites) {
  if (!modelSrc.includes(target)) { console.error(`report-chroma-floor-movement: model.mjs import target not found - ${target} moved, update this script`); process.exit(2); }
  patchedModel = patchedModel.replace(`from ${target}`, `from "${url}"`);
}
const OldModel = await import(`data:text/javascript;base64,${Buffer.from(patchedModel).toString("base64")}`);

function hexToRgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function camChroma(hex) { return cam16FromRgb(hexToRgb(hex)).chroma; }

const items = [
  ...presets.map(({ slug, preset }) => ({ slug, kitName: null, source: preset })),
  { slug: "default kit", kitName: kitLabel, source: dk },
];

let total = 0, moved = 0, maxDC = 0, maxWitness = "";
const byFamily = new Map(); // family name -> { total, moved }

for (const { slug, kitName, source } of items) {
  const doc = hydrate({ ...source, toneMode: "even" });
  const afterView = projectView(doc);
  const beforeView = OldModel.projectView(doc);
  for (const p of doc.palettes) {
    const label = `${slug} "${kitName ?? source.name ?? "?"}" ${p.name}`;
    const av = afterView.palettes.find((v) => v.name === p.name);
    const bv = beforeView.palettes.find((v) => v.name === p.name);
    if (!av || !bv) continue;
    const fam = p.name;
    const rec = byFamily.get(fam) ?? { total: 0, moved: 0 };
    for (let i = 0; i < av.fullRamp.length; i++) {
      total++;
      rec.total++;
      const ah = av.fullRamp[i].hex, bh = bv.fullRamp[i].hex;
      if (ah !== bh) {
        moved++;
        rec.moved++;
        const dC = Math.abs(camChroma(ah) - camChroma(bh));
        if (dC > maxDC) { maxDC = dC; maxWitness = `${label} stop ${av.fullRamp[i].stop}`; }
      }
    }
    byFamily.set(fam, rec);
  }
}

console.log(`report-chroma-floor-movement: base ${baseRef}`);
for (const [fam, rec] of [...byFamily].sort()) console.log(`  ${fam}: ${rec.moved} / ${rec.total} moved`);
console.log(`even 25-stop cells moved: ${moved} / ${total}`);
console.log(`max |dC| CAM16 chroma at any moved cell: ${maxDC.toFixed(4)} (${maxWitness})`);
