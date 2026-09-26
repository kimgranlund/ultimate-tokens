---
kind: handoff
plan: rule-gates
unit: U5
branch: unit/rg-U5
written: 2026-09-25
pass: 1
---

# rule-gates U5: figures of record (partial, stopped on the quiet-host clock)

Head sha: `e8a56d7e`. Base: `047b2951` (unit/rg-U5 cut from `plan/rule-gates`, U1 to U4 and U6
merged, the gate registered in `npm test`).

## Step 0: merge and sweep

`git merge --no-ff origin/main` at `db33b460` (commit `c2b58d50`). Every content conflict resolved
by taking main's side (`.claude/skills/color-math/references/best-practices.md`,
`.claude/skills/color-math/references/foundations.md`, `.claude/skills/shipping-changes/SKILL.md`,
`.github/workflows/ci.yml`, `docs/reference/references/decision-records.md`,
`docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md`, `src/engine/okhsl.js`,
`src/ui/describe-mcp-assets.js`, `test/engine/anchor.mjs`, `test/engine/curated-contrast.mjs`,
`test/engine/prime.mjs`, `figma/plugin/ui.html`): a diff of this branch's own edits to each of
those files against `git merge-base HEAD origin/main` (`ae4206ac`) showed 1:1 line replacement with
no functional change, i.e. this plan's own em-dash sweep of the pre-#713/#738 content, since
superseded by main's real work (#713's FULL/SAMPLED split, #738's `okhslLAt` memo removal). Taking
main's side and re-sweeping was cheaper and safer than a hunk-by-hunk merge of stale punctuation
fixes against new logic.

`.sdlc/board.md`: kept this branch's own rule-gates rows (U4 already merged and verified here,
state 🟢) over main's separate, stale copy of the same rows (state 🔵, still building on main's
side); main's own `chroma-floor` and `docs-repair` rows, auto-merged with no conflict, are
untouched.

Swept in a separate commit (`e8a56d7e`): `node test/repo/em-dash.mjs --fix --sample`, then `npm
test` regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` from the swept
sources. One line the guard refused, hand-rewritten (R0 (g), a line-start dash joined to its
sentence):

- `test/engine/prime.mjs:555`, before: `` them\n//      — both measured unclipped (min room 9 exactly) `` on the integrated tree.
- after: `` them,\n//      both measured unclipped (min room 9 exactly) `` on the integrated tree.

`node test/repo/em-dash.mjs | tail -1` reads `em-dash: clean (762 files scanned)`. `git status
--short | wc -l` is `0` after both commits.

## U5 steps 2 to 5: not reached

`TESTS.length` on this branch is confirmed at `52` (perl one-liner against `test/run.mjs`).

The quiet-host rule (`.sdlc/adapter.md` §1: load under 5 at the start of every counted run) was
polled continuously for about 85 minutes (`uptime` every 10 s), never once below `18.46` (the
single lowest reading across the whole window); the host spent most of the window between 30 and
230, another builder's own heavy-run count read `0` throughout (`pgrep -fl
'test/(run|engine|ui|repo)|smoke' | grep -cE '^[0-9]+ (/[^ ]*/)?node '` was `0` before this seat's
one uncounted correctness run), so the load is background contention from the many other agents on
this host, not a process this seat could clear. Per the brief ("If no quiet slot comes within about
90 minutes of polling, stop, commit what you have, and report"), stopping here without the three
counted `npm test` runs.

One uncounted `npm test` ran during the merge/sweep step, for correctness only (not a timing run,
load was `99.82 81.49 54.67` at start): exit `0`, `✓ all 52 test files passed`, tree clean after.
Not used for any figure below; U5-2's three runs are still owed.

## Criteria

| # | Result |
|---|---|
| U5-1 (P7) | `sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"` → `STALE tests: baseline 50, test/run.mjs TESTS 52`; `STALE ui.html: baseline 4125.3 KB, tree 4120.9 KB`; every `time` row `ok`; `note head:` (tree moved outside `.sdlc/` since the baseline ran, expected); `ok head:` (in origin/main's history); `stale total: 2`; `exit 1`. Not green: this is the very staleness U5 exists to repair, and it cannot close without the three quiet runs |
| U5-2 | Not run: no quiet slot in ~85 minutes of polling. `TESTS.length` confirmed `52`; the three-run Runs table, `.sdlc/baseline.md`'s `npm test` row and its three figures, and `.sdlc/adapter.md` §1's test-row range are all still owed |

## Left for the next pass

1. Three quiet `npm test` runs (load under 5 at start each, `.worktrees/rg-U5`, no `node_modules`),
   Runs table with load/hot/pgrep before and after, exit, wall, last line, `git status --short`
   count, as gate-split U6-3 reads it.
2. `.sdlc/baseline.md`: the `npm test` row's `3/3`, the three seconds, the summary span (`✓ all 52
   test files passed`), `ref` moved to this unit's base, a `supersedes` note on the prior row.
3. `.sdlc/adapter.md` §1 test row: the time range only, rounded per the check script.
4. `sh .sdlc/checks/baseline-agrees-check.sh` green, `stale total: 0`.
5. The `ui.html` KB figure is also stale (`4125.3` vs `4120.9` at this head) and needs its own
   correction paragraph in `baseline.md` per the U7/U10 precedent, named to whichever commit's
   source edit moved it (likely #738's `okhslLAt` change, `src/engine/tonal.js`, inlined by
   `gen-figma-ui`); not yet attributed here, since the three build runs that would confirm the
   figure were not taken either.

No question for the owner: the brief's own stop condition fired, this is a status report, not a
ruling to ask for.

## Second polling window (owner R47, "window open")

Resumed on the team lead's word that the window was open and load was falling. Polled load, the
heavy-run pgrep count, and the hot-process count every 10 s for about 118 minutes (the team lead's
2-hour cap). The heavy-run count never reached `0` for more than a few checks running (it moved
between `0` and `9` across the window, `1` other agent's own concurrent gate runs on this host); the
lowest single load reading was `16.39`, momentarily, immediately followed by a climb back past `40`.
No 10-second sample cleared all three conditions (load under 5, heavy-run `0`, hot `0`) at once.
Stopping at the cap; no code or record changed in this window, so no new commit. Same three owed
items as above (Runs table, baseline row, adapter range), still gated on a quiet slot.
