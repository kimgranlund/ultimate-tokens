#!/usr/bin/env node
// smoke-panda.mjs — REQ-070..072 (docs/spec/spec-panda-park-ui-exports.md): the one leg that
// proves the Panda + Park UI presets survive a REAL `panda cssgen` run, not just the pure-engine
// gates in test/engine/exports.mjs. Writes both preset modules for the default document to a
// scratch dir with a minimal panda.config.mjs, then runs `npx --yes @pandacss/dev@<pinned>
// cssgen tokens` there over the network. NEVER run by `npm test` (H-4: npm test stays
// zero-dependency; this is a separate, network-using leg) — invoke by hand or via the
// `panda-smoke` CI job.
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const { exportPanda, exportPandaModule, exportParkUi, exportParkUiModule } = await import(
  resolve(ROOT, "src/engine/exports.js")
);
const { typeScale, DEFAULT_TYPE } = await import(resolve(ROOT, "src/engine/type.mjs"));
const { geomScale } = await import(resolve(ROOT, "src/engine/geometry.mjs"));
const { defaultDocument, stateOf } = await import(resolve(ROOT, "src/ui/model.mjs"));

// Pinned version (PF-6: no zero-install validator exists for a Panda config/preset — this script
// IS the validator). Bump deliberately; a floating range would make a green run non-reproducible.
const PANDA_VERSION = "1.12.1";

const state = stateOf(defaultDocument());
const typeScl = typeScale(DEFAULT_TYPE);
const geomScl = geomScale({});

const pandaPreset = exportPanda(state, { type: typeScl, geometry: geomScl });
const parkPreset = exportParkUi(state, { geometry: geomScl });

if (typeof parkPreset === "string") {
  console.error("smoke-panda: exportParkUi returned the no-driver sentinel for the default document — cannot proceed");
  process.exit(1);
}

const pandaModule = exportPandaModule(pandaPreset);
const parkModule = exportParkUiModule(parkPreset);

const scratch = mkdtempSync(join(tmpdir(), "ut-panda-smoke-"));
writeFileSync(join(scratch, "panda.preset.mjs"), pandaModule);
writeFileSync(join(scratch, "parkui.preset.mjs"), parkModule);

// Minimal config: both presets plus Panda's own base preset, no `include` (no source files to
// scan — this only needs the token layer's generated CSS, never a component's usage). A plain
// object, not `defineConfig({...})` — that helper is a no-op typing wrapper (same reasoning as
// this repo's own `exportPandaModule` comment) and importing `@pandacss/dev` here would need it
// resolvable from THIS scratch dir's own node_modules, which npx never populates locally.
const config = [
  "import panda from './panda.preset.mjs';",
  "import parkui from './parkui.preset.mjs';",
  "export default {",
  "  presets: ['@pandacss/preset-panda', panda, parkui],",
  "  include: [],",
  "  outdir: 'out',",
  "};",
  "",
].join("\n");
writeFileSync(join(scratch, "panda.config.mjs"), config);

console.log(`smoke-panda: scratch dir ${scratch}`);
console.log(`smoke-panda: running npx --yes @pandacss/dev@${PANDA_VERSION} cssgen tokens ...`);

try {
  execFileSync("npx", ["--yes", `@pandacss/dev@${PANDA_VERSION}`, "cssgen", "tokens"], {
    cwd: scratch,
    stdio: "inherit",
  });
} catch (e) {
  console.error(`smoke-panda: codegen failed: ${e.message}`);
  process.exit(1);
}

const cssPath = join(scratch, "out", "styles.css");
if (!existsSync(cssPath)) {
  console.error(`smoke-panda: expected CSS output missing at ${cssPath}`);
  process.exit(1);
}
const css = readFileSync(cssPath, "utf8");

const NEEDLES = [
  "--colors-primary-500",
  "--colors-primary-on-surface",
  "--colors-accent-9",
  "--colors-accent-a3",
  "--colors-gray-12",
  "--colors-fg-default",
];

const fails = [];
for (const n of NEEDLES) {
  const found = css.includes(n);
  console.log((found ? "  ✓ " : "  ✗ ") + n);
  if (!found) fails.push(n);
}
const hasDarkRule = /\.dark\s*\{[^}]*--colors-primary-on-surface/.test(css) || (css.includes(".dark") && css.includes("--colors-primary-on-surface"));
console.log((hasDarkRule ? "  ✓ " : "  ✗ ") + ".dark rule for --colors-primary-on-surface");
if (!hasDarkRule) fails.push(".dark rule for --colors-primary-on-surface");

if (fails.length) {
  console.error(`smoke-panda: FAIL — missing: ${fails.join(", ")}`);
  process.exit(1);
}

console.log(`smoke-panda: PASS — ${NEEDLES.length + 1}/${NEEDLES.length + 1} assertions held. CSS at ${cssPath}`);
