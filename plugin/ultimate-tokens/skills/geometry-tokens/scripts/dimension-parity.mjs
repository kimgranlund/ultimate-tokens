#!/usr/bin/env node
// dimension-parity.mjs, the DRIFT GATE between geometry-tokens and the product's geometry engine.
// Every --size-* cell primitive, every resolved role (--control-* / --chip-* / --radius-control…) and
// every --radius-* / --space-* / --inset-* / --gap-* / --border-* / --focus-* token named in the skill
// must be a REAL dimension the engine emits (the 27 cells x 16 fields, the 15 roles, the container
// tier). The engine emits no utility classes, so a concrete `.control-*` class is an error. A
// `## Migrating …` section names retired tokens on purpose and is exempt. Runs in the product repo's
// npm test; outside the repo it exits 0. Sibling of color-tokens' role-parity + type's voice-parity,
// the same anti-drift mechanization.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(HERE, "..");
const ENGINE = join(HERE, "../../../../../src/engine/geometry.mjs");
if (!existsSync(ENGINE)) { console.log("dimension-parity: geometry engine not found (outside the product repo), skipping"); process.exit(0); }

const { geomScale, geomResolverCSS } = await import(ENGINE);
const s = geomScale({});
const camel = (k) => k.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const CELLS = Object.keys(s.cells); // the 27 `{tier}-{scale}-{size}` cells
const FIELDS = new Set(Object.keys(s.cell).filter((k) => k !== "name").map(camel)); // the 16 per-cell fields
// the resolved roles, read off the resolver the CSS export ships (never a hand list)
const ROLES = new Set([...geomResolverCSS(s).matchAll(/^\s*(--(?:control|chip|radius)-[a-z-]+):/gm)].map((m) => m[1]));
const RADII = new Set(Object.keys(s.radii)); // none xs sm md lg xl full
const SPACE = new Set(Object.keys(s.space)); // 0..9
const INSETS = new Set(Object.keys(s.insets).map(camel));
const GAPS = new Set(Object.keys(s.gaps).map(camel));
const BORDERS = new Set(Object.keys(s.borders).map(camel));
const FOCUS = new Set(Object.keys(s.focus).map(camel)); // ring-width, ring-offset

const files = ["SKILL.md", ...readdirSync(join(SKILL_DIR, "references")).filter((f) => f.endsWith(".md")).map((f) => "references/" + f)];
let failed = false;
const err = (f, tok, why) => { console.error(`✗ ${f}: ${tok}, ${why}`); failed = true; };

// match a whole token including a trailing `}` (a plain \b would stop before the brace).
const each = (text, re, fn) => { for (const m of text.matchAll(re)) fn(m); };
// the text outside any `## Migrating …` section (that section names the retired tokens on purpose)
const live = (text) => text.split(/^(?=## )/m).filter((sec) => !/^## Migrating/.test(sec)).join("");

for (const f of files) {
  const text = live(readFileSync(join(SKILL_DIR, f), "utf8"));
  // --size-<cell>-<field>, or the placeholder forms --size-{tier}-{scale}-{size}-<field> / --size-{cell}-<field>
  each(text, /--size-([a-z0-9{}-]*[a-z0-9}])/g, (m) => {
    const rest = m[1];
    if (rest.includes("{")) {
      const field = rest.replace(/^(\{[a-z]+\}-)+/, "");
      const head = rest.slice(0, rest.length - field.length);
      if (!/^(\{(tier|scale|size)\}-){3}$|^\{cell\}-$/.test(head)) return err(f, m[0], "unknown size placeholder (use {tier}-{scale}-{size}- or {cell}-, then a field)");
      if (field !== "{field}" && !FIELDS.has(field)) err(f, m[0], `unknown cell field "${field}"`);
      return;
    }
    const cell = CELLS.find((c) => rest === c || rest.startsWith(c + "-"));
    if (!cell) return err(f, m[0], "unknown cell (engine: {tier}-{scale}-{size})");
    const field = rest.slice(cell.length + 1);
    if (field && !FIELDS.has(field)) err(f, m[0], `unknown cell field "${field}"`);
  });
  each(text, /--(control|chip)-([a-z{}-]*[a-z}])/g, (m) => { if (!m[2].includes("{") && !ROLES.has(m[0])) err(f, m[0], `unknown role (engine: ${[...ROLES].filter((r) => !r.startsWith("--radius")).join(" ")})`); });
  each(text, /--radius-([a-z]+)\b/g, (m) => { if (!RADII.has(m[1]) && !ROLES.has(m[0])) err(f, m[0], `unknown radius (engine: ${[...RADII].join("/")}, roles control/mark/inset/card)`); });
  each(text, /--space-(\d+)\b/g, (m) => { if (!SPACE.has(m[1])) err(f, m[0], `space step ${m[1]} out of range (0–${SPACE.size - 1})`); });
  each(text, /--inset-([a-z-]+)\b/g, (m) => { if (m[1] !== "{name}" && !INSETS.has(m[1])) err(f, m[0], `unknown inset (engine: ${[...INSETS].join("/")})`); });
  each(text, /--gap-([a-z-]+)\b/g, (m) => { if (m[1] !== "{name}" && !GAPS.has(m[1])) err(f, m[0], `unknown gap (engine: ${[...GAPS].join("/")})`); });
  each(text, /--border-([a-z-]+)\b/g, (m) => { if (!BORDERS.has(m[1])) err(f, m[0], `unknown border (engine: ${[...BORDERS].join("/")})`); });
  each(text, /--focus-([a-z-]+)\b/g, (m) => { if (!FOCUS.has(m[1])) err(f, m[0], `unknown focus token (engine: ${[...FOCUS].join("/")})`); });
  // the engine emits no utility classes
  each(text, /\.control-([a-z0-9{}-]+)/g, (m) => err(f, m[0], "the engine emits no .control-* class (bind the --control-* roles)"));
}

if (ROLES.size !== 15) err("engine", `${ROLES.size} roles`, "expected the 15 resolver roles (control x8, chip x3, radius x4)");
console.log(failed ? "dimension-parity FAIL" : `dimension-parity PASS, every dimension token in ${files.length} files matches the engine (${CELLS.length} cells x ${FIELDS.size} fields, ${ROLES.size} roles)`);
process.exit(failed ? 1 : 0);
