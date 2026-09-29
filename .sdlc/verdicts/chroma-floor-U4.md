---
kind: verdict
plan: chroma-floor
unit: U4
ticket: "#701"
branch: unit/cf-U4
base: e10aa5d1
grade: verifier-l1 at pass 1; pass 2 verifier-l2 standing in for verifier-l3 (opus l7 build, same family, ruling b9044bb), run by the Verifier seat itself
pass: 2
written: 2026-09-29
---

# Verdict chroma-floor U4 · 🔴 · the three pins and the floorRef comment are now true, but the head fails `npm test` and one new comment retires a live constant

verdict: 🔴
sha: a28b9b22bf02a4c5281fc14c6d35b0729cf6e503

Graded at `a28b9b22` (code `bbb72843`) against the U4 line of plan revision 21 (`e10aa5d1`), in `git clone -q --shared` clones under the seat's job tmp, old head `d1db4b04` beside it. Records shape check: `verdict.py check` exit `0` on the handoff and on the review.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| npm test, tree clean | 🔴 | fresh clone at `a28b9b22`, no node_modules: `▶ repo/verdict-frontmatter.mjs FAIL`, `MISSING chroma-floor-U4-review.md: no verdict: line`, `✗ 1/54 test file(s) failed`, `npm exit 1`; tree `0`. The unit's own review record (`a28b9b22`) opens with a bare `PASS`, no `verdict:` line | the same gate at `bbb72843` (before the review commit): `✓ verdict-frontmatter: verdicts 192 graded 192 bad 0`, so the red is that record, not the code |
| F4 history comments | 🔴 | `test/engine/anchor.mjs:652` now reads `KNOWN_BASELINE_DUP/EVEN_DIP_BASELINE comments (both since retired)`. `KNOWN_BASELINE_DUP` is live: `git grep -c 'const KNOWN_BASELINE_DUP'` prints `test/engine/tonal.mjs:1`, used by the gate at `:1330` and `:1364`, and its block still cites U3's R2 at `tonal.mjs:1211` (`the anchor's own lifted reading`). Only `EVEN_DIP_BASELINE` is retired (`git grep -c 'const EVEN_DIP_BASELINE'` `0`). `tonal.js:409-410` and `report-preset-fidelity.mjs:20` are true | at `d1db4b04` the line read `comments already cite`, true for `KNOWN_BASELINE_DUP` |
| R1 floorRef comment | 🟢 | `tonal.mjs:1523-1526` names `the largest ceiling among stops 450, 500 and 550 ... one per ramp path`; code `tonal.js:808` and `:936` `const floorRef = Math.max(maxc500, ...450..., ...550...)`, two sites | `git grep -c "anchor stop's own ceiling, so the floor never rises"`: `1` at `d1db4b04`, none at the head |
| R2 okhslLAt pin | 🟢 | `985:export function okhslLAt(lstar) {`; `audit-citations.mjs`: `00-synthesis.md:89 cites src/engine/tonal.js:985 -> matched okhslLAt` and the same `OK` for `04-context-and-messaging.md:71` | at `d1db4b04` both rows print `NEAR ... cites src/engine/tonal.js:983` |
| R3 lift-monotonic pin | 🟢 | `SKILL.md:95` and `acceptance-criteria.md:25` read `735-884`; `sed -n 884,886p` prints `}`, blank, `// ── hpg-tonal-skew-lift-okhsl (#647)`; heading at `735` | at `d1db4b04` both read `722-743`, which ends before the block's `744` opening |
| F1 shoulder wording | 🟢 | `tonal.js:425` `stays clear of stops 400/600 at lift 0; under lift ...`; recomputed with `liftStop`: the first lift at which 400 or 600 enters R is `14.25`, so `about 14` holds | at `d1db4b04` `at lift 0 only` greps `1` at `:425` |
| F3 fixture owner and header | 🟢 | `mode-isolation-gate.mjs:10-12` names the corpus; the fingerprint loop reads every `src/ui/categories/<slug>.js` `PRESETS` plus `defaultDocument()` (`:34-40`); the JSON `owner` equals the capture literal (`true`) | at `d1db4b04` `git grep 'curated corpus'` in both files prints nothing |
| citations | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD a28b9b22)`; the three pins `OK`, no `NEAR` | the two R2 rows are `NEAR` at `d1db4b04` (above) |
| handoff ran block (P8 style) | 🟢 | the block's commands run at `a28b9b22`: `diff` against its first `out ran` exit `0`; at `d1db4b04`: `diff` against its second exit `0` | each changed line differs between the two outputs (`983` / `985`, `722-743` / `735-884`, `caps` / `takes`, `only`) |

### Findings

1. 🔴 The head fails `npm test`: `.sdlc/verdicts/chroma-floor-U4-review.md` has no `verdict:` line, and `test/repo/verdict-frontmatter.mjs` reads every file there. The handoff's `npm test 🟢` was true at `bbb72843` only; the review commit after it turned the gate red, and the review's own `Not run` row skipped `npm test`.
2. 🔴 `anchor.mjs:652` `(both since retired)` is false for `KNOWN_BASELINE_DUP`, a live allow-list with a live gate. The pre-land record's F4 pointed at this line for its `EVEN_DIP_BASELINE` half only; the fix is to retire that half alone.
3. 🟡 The handoff's `ran` block cuts the `04-context-and-messaging.md:71` line at 140 characters, before its `tonal.js:98x` cite, so that line prints the same at both heads and its leg does not bite. `audit-citations.mjs` covers it (row R2).
4. 🟡 (plan) The pre-land record's 🟡 on `floorRef` read at the base or seed hue (`tonal.js:936`, `:946`) is in neither revision 21's U4 line nor a deferral; the handoff's `Left out` names it honestly.

## Pass 2 · 🟡 · every leg bites and holds at the head; the L1 count the plan names is one short of the kept round-1 review

verdict: 🟡
sha: dd356ad0d046e8b851edbdeaaed307224eb251e1

Graded at `dd356ad0` (code `5327c23a`), equal to `git rev-parse unit/cf-U4`, against the U4 line at plan revisions 22 to 24 (`f29ce78c`). Checkers inside the builder's opus family under `b9044bb`. Clones under the seat's job tmp at the head, `5327c23a`, `8407e256`, `a28b9b22` and `d1db4b04`.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| L2 npm test at the HEAD after the review commit | 🟢 | fresh clone at `dd356ad0`, no node_modules: `✓ all 54 test files passed`, `npm exit 0`, tree `0`; `verdict-frontmatter`: `verdicts 192 graded 192 bad 0` | at `a28b9b22`: `✗ 1 verdict-frontmatter gate failure(s)`; scrim sed on `role-table.json`: `node test/engine/semantic.mjs` `FAIL: 1 gate failure(s)`, exit `1` |
| P8 ran block | 🟢 | the block's commands at each of the four heads it names, each `diff` against its own `out ran` exit `0` (`5327c23a`, `8407e256`, `a28b9b22`, `d1db4b04`); the tree between `5327c23a` and the head is the handoff and `review-p2-r2.md` only | the four outputs differ where the legs should (below) |
| L4 okhslLAt pin, no cut | 🟢 | `994:export function okhslLAt(lstar) {`; both docs print `tonal.js:994`; `audit-citations.mjs` `OK ... matched okhslLAt` on both | `983` twice at `d1db4b04`; `993` at `8407e256` against a head line of `993` |
| R3 and the citations gate | 🟢 | `✓ citations: ... STALE 0 across 10 discovered docs (HEAD dd356ad0)`; the two `735-884` pins `OK` | at `d1db4b04` the R2 rows print `NEAR` (pass 1) |
| L3 retired and live constants | 🟢 | `EVEN_DIP_BASELINE`, `LONE_SPIKE_ALLOW`, `DEFAULT_KIT_SPIKE_FINDING` print nothing; `KNOWN_BASELINE_DUP`, `DIP_BASELINE`, `PERCEPTUAL_DIP_BASELINE` print `test/engine/tonal.mjs:1` each; the `since retired` lines name `EVEN_DIP_BASELINE` only (`anchor.mjs:653`, `report-preset-fidelity.mjs:20`) | `git grep -c 'const EVEN_DIP_BASELINE'` at `282fca8d`: `1`; at `a28b9b22` `anchor.mjs:652` read `(both since retired)` |
| F4 anchor.mjs history | 🟢 | `:651-654`: the C6 gate `the live KNOWN_BASELINE_DUP list belongs to` (its failures print `(C6 ii)`, `tonal.mjs:1359-1366`) cites R2 at `:1211`; the retired `EVEN_DIP_BASELINE` block at `282fca8d` (`:1489-1516`) has no `2573208c` or `R2` in `1420-1640` and names `paletteStopsAnchored` and `anchorChromaBasis` | round 1 (`8407e256`) said the retired comment `also did` cite it; the grep above makes that false |
| L5 / F5 floorRef comments | 🟢 | anchored `:807-811`: `seedHue`, `resolvedHue plus its edge rotation`, cam16 exact at hueShift 0, OKLCH per-stop solve (`resolvedHue = solveCam16Hue(...)`), clamped tone gap (`maxc500` at `anchor.lstar` `:800`, `pivotTone` clamped `:789`); plain `:941-944`: `baseHue` solved once at 500 under oklch, stops at `baseHue + shift * dir`; `#766` once, issue `OPEN` `kind:chore,status:backlog,size:S` | at `a28b9b22` the hue count and the `#766` count print `0`, `0` |
| L1 records | 🟡 | `.sdlc/verdicts` `0`; `git log --follow` of `.sdlc/reviews/chroma-floor-U4-review.md` reaches `a28b9b22` (`1`); `.sdlc/reviews` holds `3` U4 records, the plan's L1 names `2` | at `a28b9b22`: `1` in verdicts, `0` in reviews |

### Fates of pass 1
- F1 (npm test red on the review record): fixed. The record is in `.sdlc/reviews/` and the head's suite is green (row L2).
- F2 (`both since retired`): fixed. Only `EVEN_DIP_BASELINE` is called retired, and the new history sentence is true (row F4).
- F3 (the ran block cut the R2 line): fixed by L4's `-no` form with no `cut`.
- F4 (plan, floorRef hue): fixed in the comments, and the behaviour is deferred to #766 (row L5).

### Findings
1. 🟡 (plan) L1 expects `2` in `.sdlc/reviews`. The head has `3`: the round-1 FAIL review (`chroma-floor-U4-review-p2.md`) is kept beside round 2's, as the Orchestrator's note says. The records are true; the plan's figure predates round 2.
2. 🟡 The handoff's 🟡 note says `L4 expects tonal.js:985`. Revision 23 (`701db682`) already reads the line at the head. The note was true of revision 22, which is the one the unit merged, but it is stale against the criteria graded here.
