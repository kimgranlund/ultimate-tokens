PASS

# Review, okl-memo U1 (ticket #738), pass 1, round 2 (reviewer-l2)

Fresh-context reviewer. Branch `unit/okl-U1` @ `83b65c6c`, diff base `B=b747c2c8` (`git merge-base origin/main 83b65c6c`). Criteria: `.sdlc/plans/okl-memo.md` revision 4. Round 1 record: `.sdlc/verdicts/okl-memo-U1-review.md` (FIX-FIRST at `de36c00e`). New diff reviewed: `de36c00e..83b65c6c`. Every run below was made by this reviewer in a `git clone -q --shared` scratch clone at `83b65c6c` under `$TMPDIR`, removed after; nothing ran in the worktree.

## Round 1 findings

| State | Finding | Evidence at 83b65c6c | Negative control |
|---|---|---|---|
| 🟢 | 1, U1-2 control vacuous | `.sdlc/handoffs/okl-memo-U1.md:54` now carries the biting control (bare-array branch corrupts hex 0 when `poison.length`): `exit 1`, `1/200`. Rerun here: `exit 1`, `determinism ...: 1/200 palettes shifted hex by call order`. Positive: `node test/engine/prime.mjs` `exit 0`, `0/200` | worker's bare-array branch poisoned in the clone: `exit 1`, `1/200` |
| 🟢 | 2, worker defaults masked a missing `cases` | `test/engine/prime-determinism-worker.mjs:35` reads `const { poison, cases, prelstars, ramps } = JSON.parse(raw);`, no defaults. `test/engine/tonal.mjs:2009` sends `poison: [], cases: []`. Rerun here: `echo '{"poison":[]}' \| node test/engine/prime-determinism-worker.mjs` throws `TypeError: Cannot read properties of undefined (reading 'map')` at `:41`, `exit 1`. `node test/engine/tonal.mjs` `exit 0`, `pass  okl-order`, `0/24` | `{"poison":[]}` payload: `exit 1`, `TypeError` |
| 🟢 | 3, stale `hct.js` sentence | `src/engine/hct.js:278` to `:279` now say the memo existed "until #738 deleted it". The file's diff against `B` is two comment lines each way; no em dash in the added lines (count `0`) | a code line added to `hct.js`: P4's middle command prints `1` |
| 🟢 | 4, handoff overclaimed controls | `.sdlc/handoffs/okl-memo-U1.md` "Left out" names the three rows not run live by the builder (U1-7, P3, P4) instead of claiming all rows had a control | read against round 1's finding 4 text; no command |
| 🟢 | 5, info | no change owed; gate order unchanged, `node test/engine/tonal.mjs` prints `pass  okl-order` once | round 1's memo-restored control (`exit 1`, `24/24`), not rerun this round |

## Criteria rerun

| State | Criterion | Evidence | Negative control |
|---|---|---|---|
| 🟢 | P4 (revision 4, three commands) | `0`, `0`, `0` | appended `export const __x = 1;` to `hct.js`: the middle command prints `1` |
| 🟢 | P3 | `branding: clean (713 files scanned)`, em-dash counts `0`, `0` | not run |
| 🟢 | U1-2 | `exit 0`, `0/200` | `exit 1`, `1/200` |
| 🟢 | U1-5 gate green | `exit 0`, `pass  okl-order` | round 1's memo-restored control stands; the test change is only the two explicit keys |

## Findings, ranked

1. Low, routed to the Orchestrator. `.sdlc/plans/okl-memo.md:104`: P4's Expected cell still reads `` `0`, `0` `` although revision 4 added a third command, and the history row (`:159`) states `0`, `0`, `0`. The plan belongs to the Orchestrator, so this is not the builder's defect. Fix the cell before verification so the verifier matches three numbers.
2. Info. The regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` changed only because `hct.js`'s comment changed. That is expected. P2 was not rerun here; per the dispatch, `npm test` did not run in the worktree.

verdict: 🟢
