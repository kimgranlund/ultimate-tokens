PASS

# Review anchor-gaps U1 (#740) · pass 1 · reviewer-l2

Head `9fa8b602` (code `29cd9c1a`) on `unit/ag-U1`, base `bb13fa50` (`plan/anchor-gaps`), merge-base with `origin/main` `8f5c6dc0`. Every row was rerun in a `git clone -q --shared` copy of the head under a scratch directory outside the repo; controls edited only that clone and were restored by copy. The worktree was not written except for this file.

The fix is correct and does what the plan asks. Every U1 criterion and its control reproduces. One plan-level row (P2's baseline line) is red at the head and has to be closed before the pre-land record; it is not a U1 criterion, so it does not block this unit.

## Criteria rerun

| Id | Result | Output |
|---|---|---|
| U1-1 | 🟢 | `1`, `1`, `1`, `true` |
| U1-2 | 🟢 | `exit 0`; `stored-anchors` count `11`; identity-fixture text `1` |
| U1-2 control 1 (backfill returns its argument) | 🟢 | `exit 1`, `FAIL  stored-anchors, (a) ... got 16 of 16 ramps differing` |
| U1-2 control 2 (equality on `name` only) | 🟢 | `exit 1`, `FAIL  stored-anchors, (b) an edited Primary row must leave 15 of 16 stamped, got 16` |
| U1-3 | 🟢 | `0 of 16 16`; control through `p.hydrate` prints `16 of 16 0` |
| U1-4 | 🟢 | `cam16 16 15 false`; control (raw-row table dropped) prints `cam16 1 1 false` and `persist.mjs` reds on `(d) ... got 1` |
| U1-5 | 🟢 | `1`; numstat `33 2` (the import line and the `hydrateStoredDoc` return line) |
| P1 | 🟢 | `npm test` exit 0, `✓ all 53 test files passed`, `git status --short` `0` after |
| P2 | 🟡 | after `npm ci` in the clone: build exit 0, `wrote figma/plugin/ui.html 4120.3 KB`, tree clean; baseline check prints `STALE ui.html: baseline 4118.0 KB, tree 4120.3 KB` (M1). Control: one closing brace removed from `backfillDefaultAnchors` gives build exit 1, `vite build` reporting `Failed to parse code in '.../src/ui/app-helpers.mjs': "Expected } but found EOF"` |
| P3 | 🟢 | `branding: clean (787 files scanned)`, `0`, `0` (and `0` in the handoff), `em-dash: clean (795 files scanned)`, exit 0 |
| P4 | 🟢 | `0`, `1 1`, `0` (tonal untouched), `0` |
| Bundles | 🟢 | `npm test` regenerates `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` byte-identical to the committed ones (tree clean after the run) |
| Citations | 🟢 | `test/ui/persist.mjs` lines 1 to 484 are byte-identical to the base; `repo/citations.mjs` passes inside `npm test` |

## Correctness, probed directly

| Question | Result |
|---|---|
| Never overwrites a user-set anchor | 🟢 a palette carrying `anchor` is returned as is (`src/ui/app-helpers.mjs:854`) |
| Never anchors a custom palette | 🟢 a planted `Brand` row stays anchorless; matching is by name plus four numbers against the 16 default rows only |
| Edited row left alone | 🟢 hue +1 on Primary: 15 stamped, Primary not |
| Idempotent | 🟢 a second call returns the first result by reference; the input is not mutated; hydrate, serialize, hydrate again gives the same ramps and writes `schemaVersion: 6`, so the backfill never runs twice on a saved set |
| Hydrate order | 🟢 `hueSpace` stamp, then backfill, then `hydrate` (`src/ui/app-helpers.mjs:211-212`); hydrate's clamp sees the stamped hexes |
| Older schema versions | 🟢 stripped default docs at v0 to v4 (with a legacy `keyIntensity` control) stamp 16 and render `0` ramps differing; v5 and v6 docs stamp `0` |
| Raw legacy form renders right | 🟢 max sRGB channel delta against the fresh default is `1` with the anchors (rounding), `38` without them |
| `DEFAULT_PALETTES` leaks mutable state | 🟡 yes, latent (m2) |

## Findings

### Major

M1. P2's baseline line is red at the head, caused by this unit. `.sdlc/baseline.md:30` carries `4118.0 KB`; the head's bundle measures `4120.3 KB`, and the base's bundle checked the same way prints `ok    ui.html: baseline 4118.0 KB, tree 4118.0 KB`, so the growth is this unit's two inlined files. The plan's P2 row says the builder moves the figure with a correction paragraph when the bundle grows, and `.sdlc/baseline.md:284` is the precedent (the unit that made the figure stale repairs it). The handoff skipped it because `node_modules` was absent, but `sh .sdlc/checks/baseline-agrees-check.sh` needs no `node_modules`. Close it before the pre-land record: either a pass-2 commit on this unit, or the Orchestrator's post-merge re-derivation that the plan's G0 paragraph assigns to the merge step (docs-repair and prompt-audit move the same cell, so whichever lands later re-measures anyway).

### Minor

m1. The row form is not gated by the doc's `hueSpace` (`src/ui/app-helpers.mjs:856`). Both tables are tried for every doc. Probe: a pre-v5 `hueSpace: "oklch"` doc with Primary's hue set to `267` (the raw CAM16 value; the OKLCH-form default is `259`) and the other three numbers unedited gets stamped `#0C5DCC`, so the palette renders pinned to the default anchor, 8 degrees from what the user set. The reverse holds for a `cam16` doc hitting an OKLCH-form row. The plan's design says "either" without gating, so this follows the spec. Since `hydrateStoredDoc` always stamps `hueSpace` first, `stored.hueSpace === "cam16" ? DEFAULT_PALETTES : defaultDocument().palettes` would remove the case in one line. Planner's call.

m2. `DEFAULT_PALETTES` is exported mutable (`src/ui/model.mjs:284`). Neither the array nor its rows are frozen or copied. Probe: `DEFAULT_PALETTES[0].chroma = 5` makes the next `defaultDocument().palettes[0].chroma` read `5`. No importer mutates it today (`backfillDefaultAnchors` only reads it, and the gate copies it through `map`). The plan fixed this change at one word, so it is not a defect here. Follow-up: `Object.freeze` the rows and the array (`defaultDocument` spreads each row, so freezing is safe).

### Nit

n1. A palette carrying `sourceAnchor` without `anchor` (a v5+ palette detached by a hue or chroma drag, `src/ui/sections/color.js:1811`) in a doc with no `schemaVersion` is re-anchored. Only a hand-built config can produce that, since every writer goes through `serialize()` (`src/ui/app.js:230`, `src/ui/app.js:2320`). Skipping rows that carry `sourceAnchor` would close it cheaply.

n2. `openConfigAsSet` (`src/ui/app.js:2371`) routes the Figma approximate read, "Open saved palette" and the project restore through the same seam, so the backfill runs there as well. `configFromVariables` (`src/ui/model.mjs`) emits no `schemaVersion`, CAM16 hues, skew 0 and lift 0, so a recovered family whose name and numbers equal a default row exactly gets that row's anchor. That is consistent with the rule, but nothing tests it and the plan does not mention it.

n3. The handoff says `component-inventory.md` cites `app-helpers.mjs` "six times" and then lists nine line numbers.

n4. The CHANGELOG block is dated `2026-09-26`; if landing slips, rename the block to the landing date (the plan asks for the landing date).

A `schemaVersion` stored as the string `"6"` is backfilled. `applyRenameMaps` (`src/ui/persist.js:454`) reads a string version the same way, so this is consistent and not a finding.

## Not rerun

P1's generic role-table control (adapter §1's own control; U1 changes nothing it depends on). `npm run smoke` was not run.
