---
kind: verdict
plan: chroma-floor
unit: U4
ticket: "#701"
branch: unit/cf-U4
base: e10aa5d1
grade: verifier-l1, run by the Verifier seat itself (opus, outside the sonnet builder's family)
pass: 1
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
