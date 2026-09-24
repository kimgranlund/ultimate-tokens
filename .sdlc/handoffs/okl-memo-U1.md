# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/okl-U1 @ 961495a0 |
| Files | src/engine/tonal.js · src/engine/hct.js (comment lines only, P4-admitted revision 4) · test/engine/tonal.mjs · test/engine/prime-determinism-worker.mjs · .claude/skills/color-math/{SKILL.md,references/{best-practices,foundations,rubric}.md} · docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md (P4-admitted, revision 3) · figma/plugin/ui.html · src/ui/describe-mcp-assets.js (regenerated) |
| Pass | 2 (review FIX-FIRST at de36c00e, `.sdlc/verdicts/okl-memo-U1-review.md`) |

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
its own updated header comment. `poison`/`cases` carry no default (pass 2, review finding 2): a stdin
payload missing `cases` throws the same `TypeError` it always did, so a future edit that drops or
renames the field in either caller still fails loud instead of silently reading `0/N`.
`test/engine/tonal.mjs`'s own calls now send `poison: [], cases: []` explicitly alongside
`prelstars`/`ramps`.

`src/engine/hct.js:278`-`:279` (comment lines only, pass 2, review finding 3, plan revision 4):
repaired the stale "tonal.js still keeps a bucketed `_okL` memo... tracked as #738" sentence, false
since U1's own commit deleted that memo. P4 gained a middle command counting `hct.js`'s non-comment
diff lines, `0`.

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
| P3 branding + em dash | `branding: clean (713 files scanned)`, `0`, `0` | clone (pass 2, run by this builder), `cp decision-records.md .sdlc/verdicts/x.md` | `FAIL: 3 branding violation(s) across 714 files`, `exit 1` |
| P4 scope wall (revision 5: three commands, `hct.js` comment-only) | `0`, `0`, `0` | fixture of 3 names through the first filter (pass 2, run by this builder) | `1`, matching the plan's revision-5 expected value |
| U1-1 memo gone | `0`, `0`, `1`, `  return rgbToOkhsl(hctToRgb(0, 0, lstar).rgb).l;`, `0` | file at G0 | `4`, `1`, `1`, `  const k = lstar.toFixed(2);`, `1` |
| U1-2 worker keeps `prime.mjs` contract | `exit 0`, determinism line present (`0/200`, SAMPLED), diff `0` | clone (pass 2, review's replacement for finding 1): worker's bare-array branch corrupts hex 0 only when `poison.length` (`hexes.map((h,i)=>i===0?h+"X":h)`) | `exit 1`, `determinism ...: 1/200 palettes shifted hex by call order` (matches the reviewer's own rerun) |
| U1-3 corpus behaviour-neutral | `cmp 0`, `11340` both before/after | clone, `lstar` → `lstar + 0.5` | `differ: char 61, line 2`, `cmp 1` |
| U1-4 cost budget | quiet host (load avg ~13): `0.76 / 0.84 / 0.70` us/call; `6` `okhslLAt(` sites | clone, 24-step bisection body | `5.80 / 6.37 / 6.23` us/call, over the 5.00 budget |
| U1-5 `okl-order` gate | `exit 0`, pass line printed exactly `1` time, `okl-order` named `8`+ times in the test file, `prelstars`/`ramps` named `8`+ times in the worker | clone, memo restored | `exit 1`, one `FAIL` line: `render-level: 24/24 ramps shifted hex by call order after a prior okhslLAt(5.26499)...` (contains both `5.26499` and `24/24`) |
| U1-5, second control | (same clone, `prelstars` emptied in the test's own render check) | memo restored, render half's own poison call zeroed | `exit 1`, `FAIL  okl-order  - function-level: okhslLAt(5.26499) = 0.07999402014631897, expected 0.0837536365535359...` (contains `5.26499`, not `24/24`) |
| U1-6 skill lines | `0,0,0,0` (toFixed), `0` (memoized in), `1`+ (#738 in SKILL.md) | files at G0 | `1,1,3,1` toFixed lines; `1` memoized in; `0` #738 |
| U1-7 source diff | numstat `3 5`, `5` removed-line count | clone at G0 (pass 2, run by this builder): `const k = lstar.toFixed(2);` → `const k = lstar;` | numstat `1 1` |

## Pass 1 to pass 2, review findings closed

- Finding 1 (medium, U1-2's control was vacuous): the plan's own control (worker always emits
  `{hexes,ramps}`) turned out to pass at `0/N`, because `runDeterminismWorker` (`test/engine/prime.mjs`,
  untouched, out of scope) does `JSON.parse(out)` with no shape check, so an object output compares as
  `undefined !== undefined` for every case. Pass 1's handoff flagged this instead of forcing it into a
  predicted bucket; the reviewer confirmed it and supplied a replacement control that bites without
  touching `prime.mjs` (corrupt the worker's bare-array branch's first hex when `poison.length`). Rerun
  in pass 2, U1-2's row above now carries that control: `exit 1`, `1/200`, matching the reviewer's own
  number exactly.
- Finding 2 (medium, the worker's `poison = []`/`cases = []` defaults masked the same class of bug as
  finding 1): dropped. `prime-determinism-worker.mjs` now destructures `{ poison, cases, prelstars,
  ramps }` with no defaults, restoring the old fail-loud contract (a stdin payload missing `cases`
  throws `TypeError: Cannot read properties of undefined (reading 'map')`, verified live). The
  `okl-order` gate's own worker calls now send `poison: [], cases: []` explicitly.
- Finding 3 (low, routed to the Orchestrator, closed by plan revision 4): `hct.js:278`-`:279` said
  "tonal.js still keeps a bucketed `_okL` memo... tracked as #738", false since U1's first commit.
  P4 admitted `hct.js` for comment lines only (a middle command counts non-comment diff lines, `0`);
  the sentence now says the memo existed and #738 deleted it. `hct.js:276`'s own "genuinely pure
  again" clause (Not-in-scope item 2, pass 1) needed no edit and still doesn't.
- Finding 4 (low, reword "Left out"): done below. U1-7's and P3's own controls are now run live by
  this builder (pass 2, rows above); neither was reused from the reviewer's or planner's numbers.
- Finding 5 (info, no change owed): the gate's render-before-function order and its reason (`FAIL`'s
  own de-dupe) hold; the reviewer's own reruns of both U1-5 controls matched pass 1's numbers exactly.
  `docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71` still cites `_okL` at
  `tonal.js:922` (stale before this unit, from before #739's `tonal.js` shift); that whole directory
  stays untouched except the one P4-admitted `00-synthesis.md` line, per the plan's Not-in-scope table.

## Other dispositions

- `persist.js`'s `lmin`/`lmax` decimal pass-through (Not-in-scope item 3): unchanged; `persist.js:77`-`:78`
  clamp the range, not the decimals, same as measured in the plan.

## Left out

Nothing in scope. Every P1-P4 and U1-1 through U1-7 row above ran with a real control this builder
ran itself, including P4's fixture control (`src/engine/hct.js`, `test/engine/prime.mjs`,
`src/engine/tonal.js` through the filter): it prints `1`, matching the plan's revision-5 expected
value (`hct.js` is excluded by the same pattern that admits it for editing, so only
`test/engine/prime.mjs` is left unmatched).
