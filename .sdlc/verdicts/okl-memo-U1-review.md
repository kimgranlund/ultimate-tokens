FIX-FIRST

# Review, okl-memo U1 (ticket #738), pass 1 (reviewer-l2)

Fresh-context reviewer. Worktree `.worktrees/okl-U1`, branch `unit/okl-U1` @ `de36c00e`. Diff base `B=b747c2c8` (`git merge-base origin/main de36c00e`). Criteria: `.sdlc/plans/okl-memo.md` revision 3 (P1 to P4, U1-1 to U1-7, the scope wall). Handoff: `.sdlc/handoffs/okl-memo-U1.md`. Every run and control below was made by this reviewer in a `git clone -q --shared` scratch clone checked out at `de36c00e` under `$TMPDIR`, removed after; nothing ran in the worktree.

| State | Criterion | Evidence (this reviewer's own runs) | Negative control |
|---|---|---|---|
| 🟢 | U1-1 memo gone | `0`, `0`, `  return rgbToOkhsl(hctToRgb(0, 0, lstar).rgb).l;`, `0` | file at base prints `4`, `1`, `const k = lstar.toFixed(2);`, `1` (read in the diff) |
| 🟡 | U1-2 worker keeps `prime.mjs` contract | `node test/engine/prime.mjs` exit `0`, `determinism ...: 0/200 palettes shifted hex by call order` (SAMPLED), `test/engine/prime.mjs` diff `0` lines | plan's control is vacuous (finding 1); replacement control run and bites: exit `1`, `1/200` |
| 🟢 | U1-3 corpus neutral | not rerun; handoff `cmp 0`, `11340`, control `cmp 1` | relied on builder |
| 🟢 | U1-4 cost | `grep -c 'okhslLAt(' src/engine/tonal.js` prints `6`; timing relied on builder (`0.70` to `0.84` us, control `5.80` to `6.37`) | relied on builder |
| 🟢 | U1-5 `okl-order` bites both ways | `node test/engine/tonal.mjs` exit `0`, pass line count `1` | memo restored byte-identical to base (`git diff b747c2c8 --numstat -- src/engine/tonal.js` empty): exit `1`, FAIL count `1`, line with `5.26499` and `24/24` count `1`. Same clone plus the render half's poison emptied (`runOklOrderWorker([])` twice): exit `1`, function-level FAIL naming `5.26499`, `24/24` count `0` |
| 🟢 | U1-6 skill lines | `toFixed` `0` in all four files, `memoized in` `0`, `#738` in SKILL.md `1` | base counts read in the diff (`1,1,3,1`, `1`, `0`) |
| 🟢 | U1-7 source diff | numstat `3 5`, removed lines `5`; A=3 is the body line plus two comment lines, within `1` to `4` | re-key (`const k = lstar;`) on the base file: numstat `1 1`. The builder had not run this live; now it has been run |
| 🟢 | P1 | `npm test` not rerun (dispatch); `test/repo/citations.mjs` rerun: `STALE 0 across 10 discovered docs`, `tonal.mjs` and `prime.mjs` green above | builder's role-table control, relied on |
| 🟢 | P2 | relied on builder (`exit 0`, `wrote figma/plugin/ui.html`, paren control reds at `gen:categories`) | relied on builder |
| 🟢 | P3 | `branding: clean (712 files scanned)`, em-dash counts `0` and `0` | not run (handoff says so too) |
| 🟢 | P4 | `0`, `0`; `00-synthesis.md` numstat `1 1`, one line as revision 3 admits; the synthesis line's new cite `tonal.js:928` is the `export function okhslLAt` line | planner's fixture |

## Findings, ranked

1. Medium. U1-2 has no real negative control as written. `test/engine/prime.mjs:302` to `:309` (`runDeterminismWorker`) returns `JSON.parse(out)` with no shape check, and `:314` to `:315` compare `detClean[i] !== detPoisoned[i]`; an object output makes both sides `undefined` for every `i`, so the plan's control (worker always emits `{hexes, ramps}`) passes at `0/N`. The handoff's Note is correct on this. A control that bites without touching `test/engine/prime.mjs`: in the clone, change the worker's bare-array branch (`test/engine/prime-determinism-worker.mjs:51`) to `process.stdout.write(JSON.stringify(poison.length ? hexes.map((h, i) => (i === 0 ? h + "X" : h)) : hexes));`. Run by this reviewer: `node test/engine/prime.mjs` exit `1`, `determinism ...: 1/200 palettes shifted hex by call order`, a `c:` FAIL. It proves `prime.mjs` still reads the worker's bare array element by element through the new code path. The builder must add this control and its result to the handoff's U1-2 row, replacing the vacuous one, so the verifier has a biting control to rerun.

2. Medium. The worker change weakens `prime.mjs`'s determinism gate in one path. `test/engine/prime-determinism-worker.mjs:35` now reads `const { poison = [], cases = [], prelstars, ramps } = JSON.parse(raw);`. Fed `{"poison":[]}` (no `cases` key), the old worker threw `TypeError: Cannot read properties of undefined (reading 'map')` and exited `1`; the new one prints `[]` and exits `0` (both run by this reviewer). With `prime.mjs` unchanged it always sends `cases`, so today's gate is not vacuous; but a future edit that drops or renames `cases` in `runDeterminismWorker` would turn the gate into a silent `0/N` pass through the same missing shape check as finding 1, where it used to throw. Fix in scope: drop the two defaults and have `test/engine/tonal.mjs:2009` send `{ poison: [], cases: [], prelstars, ramps: RAMPS_24 }`, or keep the defaults only when `ramps` is present. Either restores the old fail-loud contract the plan's U1-2 promises ("byte-identical to today").

3. Low, routed to the Orchestrator. `src/engine/hct.js:278` to `:279` now say "tonal.js still keeps a bucketed `_okL` memo on `lstar.toFixed(2)`, the same defect class, tracked as #738", which is false after U1. The plan's Not-in-scope row ruled the `hct.js:276` sentence needs no edit, but it read only the "genuinely pure again" clause; the next sentence names the memo directly. The builder correctly left `hct.js` alone (P4 forbids it) and flagged it. The Orchestrator should either admit a comment-only edit of those two lines by plan revision (the stale-record rule) or file the follow-up before landing; the scope wall means this is not the builder's defect.

4. Low. The handoff's "Left out" line says every row "ran with a real control". Three did not: U1-7's re-key control was "not tested live" (now run here, `1 1`), P3's control was "not separately re-run", and P4's is the planner's. Reword that line when the handoff is revised for finding 1.

5. Info. The gate runs the render half before the function half, the reverse of the plan's design section. The handoff and the test comment give the reason (FAIL keeps the first message per gate id), and U1-5's pinned needles hold in both controls above, so no change is owed. `docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71` still cites `_okL` at `tonal.js:922`; it was stale before U1 and stays outside the scope wall, as the handoff says.

## What the builder does next

Finding 2: an in-scope code fix (worker defaults, or explicit `cases: []` from `tonal.mjs`), then `npm test` again. Findings 1 and 4 are handoff edits. Finding 3 goes to the Orchestrator, not the builder.

verdict: 🟡
