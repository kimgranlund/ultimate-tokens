#!/usr/bin/env node
// doc-mutation-lane.mjs — direct `this.doc.` writes are a GATE, not a one-time sweep.
//
// TKT-0455/#458: `edit()`/`commit()`/`editDrag()` (app.js) are the ONE mutation ladder — every
// doc edit should route through them so autosave/undo/liveRefresh stay in sync (this is exactly
// how `selectPalette()` writing `this.doc.selected` directly and never calling save() produced a
// false-dirty save badge, and how `_onReorderUp()` hand-rolling its own commit sequence became a
// second, independently-maintained copy of the ladder — both fixed in #459-462). A NEW direct
// `this.doc.` write outside the ladder reintroduces exactly that risk, silently — this scan makes
// it a build failure instead of something a future reviewer has to notice by eye.
//
// The allowlist below is the ladder's OWN internals plus the doc-lifecycle methods that replace
// `this.doc` wholesale and persist in the same breath (see each entry's comment). It does not
// grow just because a write is "probably fine" — a new lane belongs in the ladder, not the list.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
let failed = 0;
const FAIL = (file, line, msg) => { failed++; console.log(`  ✗ ${file}:${line}: ${msg}`); };

// file -> Set of method names permitted to write `this.doc.` directly.
const ALLOWLIST = new Map([
  ["src/ui/app.js", new Set([
    "edit",     // the ladder's own body — commit()/editDrag() both funnel through this
    "openSet",  // wholesale-replaces `this.doc` (hydrateStoredDoc), then persists in the same call
    "_restore", // undo/redo target — wholesale-replaces `this.doc` (hydrate), then persists in the same call
  ])],
  ["src/ui/sections/color.js", new Set([
    "selectPalette", // self-contained mutate+save()+render() — not undoable state, but must stay
                     // in sync with the save() call right below it (that's the fix TKT-0455 made)
  ])],
]);

const SCAN_FILES = [
  "src/ui/app.js",
  "src/ui/sections/color.js",
  "src/ui/sections/typography.js",
  "src/ui/sections/geometry.js",
  "src/ui/overlays/drawer.js",
  "src/ui/overlays/apply-gate.js",
  "src/ui/overlays/settings.js",
];

// A doc write: `this.doc.<name> =` / `this.doc[<expr>] =` (plain or compound assignment),
// never a comparison (`==`/`===`) and never a read (property access with no trailing `=`).
const WRITE_RE = /this\.doc(?:\.[a-zA-Z_$][\w$]*|\[[^\]]+\])\s*[+\-*/]?=(?!=)/;
// Nearest enclosing method: a 2-space-indented `name(...) {` line (every scanned file is either
// `class X { ... }` or a flat mixin object literal — both use 2-space method indent).
const METHOD_RE = /^  (?:async\s+)?(_?[a-zA-Z][\w$]*)\s*\([^)]*\)\s*\{?\s*$/;

let scanned = 0;
for (const rel of SCAN_FILES) {
  const abs = join(ROOT, rel);
  let src;
  try { src = readFileSync(abs, "utf8"); } catch { continue; }
  scanned++;
  const lines = src.split("\n");
  let currentMethod = null;
  const allowed = ALLOWLIST.get(rel) || new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = METHOD_RE.exec(line);
    if (m) currentMethod = m[1];
    if (WRITE_RE.test(line) && !allowed.has(currentMethod)) {
      FAIL(rel, i + 1, `direct \`this.doc\` write outside ${currentMethod || "(no enclosing method found)"} — route through commit()/editDrag(), or add a NAMED allowlist entry in this file explaining why not`);
    }
  }
}

console.log(failed ? `\nFAIL: ${failed} doc-mutation-lane violation(s) across ${scanned} files` : `doc-mutation-lane: clean (${scanned} files scanned)`);
process.exit(failed ? 1 : 0);
