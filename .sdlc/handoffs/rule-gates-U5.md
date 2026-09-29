---
kind: handoff
plan: rule-gates
unit: U5
branch: unit/rg-U5
written: 2026-09-26
pass: 3
---

# rule-gates U5: figures of record

Head sha: `72efa36a`. Base: `047b2951` (unit/rg-U5 cut from `plan/rule-gates`, U1 to U4 and U6
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

## Second polling window (owner R47, "window open")

Resumed on the team lead's word that the window was open and load was falling. Polled load, the
heavy-run pgrep count, and the hot-process count every 10 s for about 118 minutes (the team lead's
2-hour cap). The heavy-run count never reached `0` for more than a few checks running (it moved
between `0` and `9` across the window, other agents' own concurrent gate runs on this host); the
lowest single load reading was `16.39`, momentarily, immediately followed by a climb back past `40`.
No 10-second sample cleared all three conditions (load under 5, heavy-run `0`, hot `0`) at once.
Stopped at the cap; no code or record changed in this window, so no new commit that pass.

## Third window: owner ruling (`.sdlc/questions/rule-gates-U5-load.md`), count runs under load

The owner ruled (`.sdlc/questions/rule-gates-U5-load.md`, 2026-09-25): U5 may count three green `npm test` runs
taken under load; the heavy-run count (not the 1-minute load average) still has to read `0`
immediately before each run starts. That condition is far easier to clear than load under 5 on this
host, and did clear three times, each within a few minutes of polling. All three ran in
`.worktrees/rg-U5`, no `node_modules`, none overlapping (clock spans below don't touch):

| run | start (UTC) | end (UTC) | load before | load after | hot before | hot after | exit | wall (s) | last line | git status lines |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-09-26 06:17:20 | 2026-09-26 06:19:51 | 6.83 9.46 15.44 | 9.24 9.29 14.38 | 1 | 2 | 0 | 151 | `✓ all 52 test files passed` | 0 |
| 2 | 2026-09-26 06:21:23 | 2026-09-26 06:23:09 | 6.50 8.43 13.54 | 7.13 8.05 12.79 | 0 | 2 | 0 | 106 | `✓ all 52 test files passed` | 0 |
| 3 | 2026-09-26 07:10:20 | 2026-09-26 07:15:37 | 94.40 120.40 90.39 | 49.62 72.09 76.74 | 3 | 4 | 0 | 317 | `✓ all 52 test files passed` | 0 |

Heavy-run count was `0` immediately before each run (confirmed by the same pgrep line the brief
names, read right before `npm test` started). All three exit `0`, all three tree-clean after. Run
3's load climbed past 90 mid-search and mid-run (other agents' own concurrent gate runs, not this
seat's), which is the source of its much longer wall time; per the load ruling the wall time counts
regardless.

`.sdlc/baseline.md` updated: the `npm test` row's three figures (151, 106, 317 s), its `3/3`/`0`
columns, and its summary span citing `.sdlc/questions/rule-gates-U5-load.md` and R53 and this
handoff; a new superseded-note section for
the #713 U6c-8 quiet-host figures it replaces; the `npm run build` row's `ui.html` KB figure moved
4125.3 to 4120.9 KB (the em-dash sweep's own byte shrink, confirmed byte-identical on all three
runs); a Correction paragraph with the full per-run table and both ruling citations; the `host:`
frontmatter line notes the one exception. `.sdlc/adapter.md` §1's quiet-host test figure (80 to 89
s) is left unchanged, per owner ruling R53 (`.sdlc/runtime/owner-rulings-2026-09-22.md`): the
resulting `STALE time test` line is the documented exception, not a defect.

## Criteria

| # | Result |
|---|---|
| U5-1 (P7) | `sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"` → `ok tests: baseline 52, test/run.mjs TESTS 52`; `ok ui.html: baseline 4120.9 KB, tree 4120.9 KB`; `STALE time test: baseline 106 to 317 s, adapter 80 to 89 s` (the documented R53 exception); every other `time` row `ok`; `note head:` (tree moved outside `.sdlc/` since the baseline ran, expected); `ok head:` (in origin/main's history); `stale total: 1`; `exit 1`. Every line but the one documented exception reads `ok`, matching the team lead's instruction exactly |
| U5-2 | Three `npm test` runs taken under load per the owner ruling recorded in `.sdlc/questions/rule-gates-U5-load.md`, heavy-run count `0` before each, none overlapping; table above. `TESTS.length` confirmed `52`. `.sdlc/baseline.md`'s `npm test` row and `.sdlc/adapter.md` §1's test-row range both updated (adapter's own figure held unchanged per R53) |

`node test/repo/em-dash.mjs | tail -1` → `em-dash: clean (763 files scanned)`.
`node test/repo/branding.mjs | tail -1` → `branding: clean (755 files scanned)`.
`git status --short | wc -l` → `0` after every commit in this pass.

No question for the owner: both rulings this pass needed (`.sdlc/questions/rule-gates-U5-load.md`,
R53) already exist and are cited above.

## Pass 3: verdict 🔴 (`.sdlc/verdicts/rule-gates-U5.md`), main's merge undid one U4 hand rewrite

The verifier found `docs/reference/references/decision-records.md:7`: U4's hand rewrite (`a9cec2ef`)
read `**OVERRIDE**: t`, but Step 0's merge took main's untouched side there (main still carried the
raw glyph, since main predates U4's sweep), and the re-sweep's `--fix` then applied the generic R2
comma rule instead of U4's chosen colon, producing `**OVERRIDE**, t`. Restored the colon by hand.

Checked every file Step 0's merge conflicted in for the same failure mode: a line where main's
untouched side happened to sit at the same spot as one of U4's HAND rewrites (not an auto-fixed
one), so taking main's side and re-sweeping silently downgraded a chosen rewrite to the generic
rule. Method: `diff <(git show f06609ed:"$file") "$file" | grep '^<'` for all eleven conflicted
files, reading every line that shows as present in U4's pre-merge state (`f06609ed`) but missing
from the current tree. Every removed line traces to one of two expected causes, not a third: (a)
main's own #713/#738 restructuring genuinely replaced that logic (`test/engine/anchor.mjs`,
`curated-contrast.mjs`, `prime.mjs`, the color-math skill references, `shipping-changes/SKILL.md`,
`00-synthesis.md`, all already named in the merge commit as taking main's side because the content
was substantively newer, not just re-punctuated), or (b) it was the OVERRIDE line above. `.github/
workflows/ci.yml`, `src/engine/okhsl.js` and `figma/plugin/ui.html` show no removed lines at all.
Cross-checked against the U4 handoff's own before/after pairs that fall inside these eleven files:
only two exist tree-wide (`test/engine/prime.mjs`'s "them, / both measured unclipped" pair, already
verified matching at `test/engine/prime.mjs:555` in pass 1, and the OVERRIDE line above); no other
hand-rewritten pair from U4 (the E1 to E4 enumerations, the refused-list rewrites, the five
half-rewritten lines, the ~20 over-refusals) falls inside any of the eleven conflicted files, so
there is nothing else in that set to check. No other reverted pair found, matching the verifier's
own finding.

`node test/repo/em-dash.mjs | tail -1` → `em-dash: clean (763 files scanned)`.
`node test/repo/branding.mjs | tail -1` → `branding: clean (755 files scanned)`.
