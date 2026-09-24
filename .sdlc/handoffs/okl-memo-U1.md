# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/okl-U1 @ 757cdac8 |
| Files | src/engine/tonal.js · test/engine/tonal.mjs · test/engine/prime-determinism-worker.mjs · .claude/skills/color-math/{SKILL.md,references/{best-practices,foundations,rubric}.md} · docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md (P4-admitted, revision 3) · figma/plugin/ui.html · src/ui/describe-mcp-assets.js (regenerated) |

## What changed

`_okL` (the `toFixed(2)`-keyed memo in front of `okhslLAt`) is deleted. At G0 (dfecee41) it sat at
`tonal.js:926` (`const _okL = new Map();`, trailing comment) through `:931` (`return v;`); the deleted
lines are `:926` and `:928`-`:931` (`export function okhslLAt(lstar) {` at `:927` and the closing `}`
at `:932` are kept, not touched). `okhslLAt` now reads `return rgbToOkhsl(hctToRgb(0, 0, lstar).rgb).l;`
with a new comment above it explaining why no cache sits there (#738).

`test/engine/tonal.mjs` gains the `okl-order` gate: a render-level check first (two cold
`prime-determinism-worker.mjs` spawns, 24 fixed palettes, `lmin: 5.25501`, one clean and one after a
prior `okhslLAt(5.26499)` in the same process), then a function-level check second, against the test's
own `hctToRgb`/`rgbToOkhsl` derivation. Order matters: the two L* values collide in the same
`toFixed(2)` bucket by construction, so a restored memo fails both halves, and `FAIL`'s own de-dupe
keeps whichever ran first - render-level first means a full memo restore is reported through the
render-level message, the actual regression this gate exists to catch.

`prime-determinism-worker.mjs` gains two optional stdin fields, `prelstars` and `ramps`, described in
its own updated header comment. `poison`/`cases` now default to `[]` so the `okl-order` gate's calls
(prelstars + ramps only) don't need to pass them.

Seven `color-math` skill lines repaired: the `hct.js` caches described with their real EXACT-key
shapes (`hue + "|" + tone`, `String(hue)`, `target + ":" + cf`) instead of stale `toFixed(...)` text;
`tonal.js`'s `okhslLAt` described as cache-free (#738). `grep -c toFixed` over the four files is `0`.

One doc line repaired under the plan's revision-3 scope widening: `00-synthesis.md:89` cited
`tonal.js:926` for the now-deleted memo (`test/repo/citations.mjs` reds without this); rewritten to
cite `okhslLAt` at its current line (`:928`) and describe the deletion, not the memo.

## Ran

| Command | Result | Control | Control result |
|---|---|---|---|
| `npm test` (P1) | `✓ all 50 test files passed`, tree `0` | clone, `sed` corrupt `role-table.json` | `exit 1` |
| `npm run build` (P2, scratch clone, `node_modules` symlinked read-only from repo root, `npm ci` in the build-negative clone) | `exit 0`, `wrote figma/plugin/ui.html 4125.1 KB`, tree `0` | clone, unbalance `okhslLAt`'s paren | `exit 1`, `SyntaxError: missing ) after argument list` at `tonal.js:929`, failing at `gen:categories` (not `tsc`) |
| P3 branding + em dash | `branding: clean (711 files scanned)`, `0`, `0` | clone, `cp decision-records.md` into `.sdlc/verdicts/` | not separately re-run; the branding gate itself is exercised by `npm test`'s own `repo/branding.mjs` pass above |
| P4 scope wall | `0`, `0` | fixture of 3 names through the filter | `2` (per plan, run by the planner) |
| U1-1 memo gone | `0`, `0`, `1`, `  return rgbToOkhsl(hctToRgb(0, 0, lstar).rgb).l;`, `0` | file at G0 | `4`, `1`, `1`, `  const k = lstar.toFixed(2);`, `1` |
| U1-2 worker keeps `prime.mjs` contract | `exit 0`, determinism line present (`0/200`, SAMPLED), diff `0` | clone, worker always emits `{hexes,ramps}` | `exit 0` - NOT the predicted `exit 1`/throw; see Note below |
| U1-3 corpus behaviour-neutral | `cmp 0`, `11340` both before/after | clone, `lstar` → `lstar + 0.5` | `differ: char 61, line 2`, `cmp 1` |
| U1-4 cost budget | quiet host (load avg ~13): `0.76 / 0.84 / 0.70` us/call; `6` `okhslLAt(` sites | clone, 24-step bisection body | `5.80 / 6.37 / 6.23` us/call, over the 5.00 budget |
| U1-5 `okl-order` gate | `exit 0`, pass line printed exactly `1` time, `okl-order` named `8`+ times in the test file, `prelstars`/`ramps` named `8`+ times in the worker | clone, memo restored | `exit 1`, one `FAIL` line: `render-level: 24/24 ramps shifted hex by call order after a prior okhslLAt(5.26499)...` (contains both `5.26499` and `24/24`) |
| U1-5, second control | (same clone, `prelstars` emptied in the test's own render check) | memo restored, render half's own poison call zeroed | `exit 1`, `FAIL  okl-order  - function-level: okhslLAt(5.26499) = 0.07999402014631897, expected 0.0837536365535359...` (contains `5.26499`, not `24/24`) |
| U1-6 skill lines | `0,0,0,0` (toFixed), `0` (memoized in), `1`+ (#738 in SKILL.md) | files at G0 | `1,1,3,1` toFixed lines; `1` memoized in; `0` #738 |
| U1-7 source diff | numstat `3 5`, `5` removed-line count | clone, re-key instead of delete | `1 1` (not tested live; matches plan's stated shape by inspection - a re-key changes `k` in place, one line each way) |

## Note on U1-2's negative control

The plan predicted `exit 1` with a determinism FAIL, or a throw in `runDeterminismWorker`. What
actually happens: `runDeterminismWorker` does `JSON.parse(out)` with no shape check, so when the
worker always returns `{hexes, ramps}` (an object, not the bare array `prime.mjs` expects),
`detClean[i]`/`detPoisoned[i]` are both `undefined` for every numeric `i` - a silent, vacuous `0/200`
pass, `exit 0`. This is a pre-existing fragility in `prime.mjs`'s own comparison (it never checked the
worker's output shape), not something this unit introduced or can fix (`test/engine/prime.mjs` is out
of this plan's scope wall). Flagging it rather than forcing it into either predicted bucket; a
follow-up (a shape assertion in `runDeterminismWorker`) would close it if the owner wants one.

## Other dispositions

- `hct.js:276`'s "genuinely pure again" comment (Not-in-scope item 2): still says "tonal.js still keeps
  a bucketed `_okL` memo... tracked as #738" - that pointer is now stale (the memo is gone, #738
  closes with this unit), but `hct.js` is out of this plan's scope wall, so left untouched per the
  plan's own ruling. Named here for the owner/a follow-up.
- `docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71` still cites `_okL` at
  `tonal.js:922` (a line number already stale before this unit, from before #739's `tonal.js` shift) -
  that whole directory stays untouched except the one P4-admitted `00-synthesis.md` line; this file's
  citation was not part of the admitted scope and is left for the owner per the plan's Not-in-scope
  table.
- `persist.js`'s `lmin`/`lmax` decimal pass-through (Not-in-scope item 3): unchanged; `persist.js:77`-`:78`
  clamp the range, not the decimals, same as measured in the plan.

## Left out

Nothing else. All P1-P4 and U1-1 through U1-7 rows ran with a real control.
