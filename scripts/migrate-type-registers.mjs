#!/usr/bin/env node
// migrate-type-registers.mjs — ONE-OFF migration (2026-07-30, #405): rename every spec palette's
// 5-slot `type.slots` design to the register shape (`type.registers`, intended-use.md Layer 3) and
// fold `type.faces` into the owning register's `voices` sub-map. Pure rename-preserving-values —
// the regenerated presets must be BYTE-IDENTICAL (`npm run gen:categories && git diff --exit-code
// src/ui/categories/`). Kept committed as the executable record of the rename (squash-merge would
// erase an add-then-delete from history). Idempotent; `--check` greps for surviving retired shapes
// and exits 1. NOT wired into npm scripts — run by hand: `node scripts/migrate-type-registers.mjs`.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SPECDIR = join(HERE, "..", "docs", "reference", "colors", "categories");
// slot → register (1:1, same order) + which register owns each secondary voice a `faces` entry names.
const REGISTER_OF_SLOT = { display: "anthemic", heading: "contextual", body: "functional", ui: "actionable", mono: "data" };
const OWNER_OF_VOICE = {
  "Sub-heading": "contextual",
  "Lead": "functional", "Title": "functional", "Sub-title": "functional",
  "UI-control": "actionable", "UI-widget": "actionable",
  "Body-mono": "data", "Label-mono": "data", "Tiny-mono": "data",
};

const check = process.argv.includes("--check");
const files = readdirSync(SPECDIR).filter((f) => f.endsWith(".json")).sort();
let migrated = 0, dirty = 0;

for (const f of files) {
  const path = join(SPECDIR, f);
  const raw = readFileSync(path, "utf8");
  const doc = JSON.parse(raw);
  const hadNewline = raw.endsWith("\n");
  // the stringify round-trip must be byte-faithful BEFORE we transform, or the diff would carry
  // unrelated reformatting noise — abort rather than guess.
  const roundTrip = JSON.stringify(doc, null, 2) + (hadNewline ? "\n" : "");
  if (roundTrip !== raw) { console.error(`ABORT ${f}: not stringify-round-trip-stable — migrate by hand`); process.exit(2); }

  let touched = 0;
  for (const vol of doc.volumes || []) {
    for (const p of vol.palettes || []) {
      const t = p.type;
      if (!t || typeof t !== "object" || (!t.slots && !t.faces)) continue;
      if (check) { console.error(`${f}: "${p.kicker || p.title}" still carries type.slots/type.faces`); dirty++; continue; }
      // rebuild `type` iterating its own keys so every other key keeps its position.
      const next = {};
      for (const key of Object.keys(t)) {
        if (key === "slots") {
          const registers = {};
          for (const slot of Object.keys(t.slots)) registers[REGISTER_OF_SLOT[slot] || slot] = t.slots[slot];
          next.registers = registers;
        } else if (key !== "faces") next[key] = t[key];
      }
      if (t.faces && typeof t.faces === "object") {
        for (const [voice, fam] of Object.entries(t.faces)) {
          const owner = OWNER_OF_VOICE[voice];
          if (!owner) { console.error(`ABORT ${f}: faces voice "${voice}" has no owning register`); process.exit(2); }
          if (!next.registers?.[owner]) { console.error(`ABORT ${f}: faces voice "${voice}" but no ${owner} register`); process.exit(2); }
          next.registers[owner].voices = { ...(next.registers[owner].voices || {}), [voice]: { font: fam } };
        }
      }
      p.type = next;
      touched++;
    }
  }
  if (touched) {
    writeFileSync(path, JSON.stringify(doc, null, 2) + (hadNewline ? "\n" : ""));
    console.log(`  ${basename(f)}: ${touched} palette(s) migrated`);
    migrated += touched;
  }
}

if (check) {
  if (dirty) { console.error(`\nFAIL: ${dirty} palette(s) still on the retired shape`); process.exit(1); }
  console.log("clean: no retired type.slots/type.faces shapes remain");
} else {
  console.log(migrated ? `\n${migrated} palette(s) migrated — now run: npm run gen:categories && git diff --exit-code src/ui/categories/` : "nothing to migrate (already register-shaped)");
}
