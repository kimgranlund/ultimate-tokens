# Handoff pif-u9 · #681 preset-intent-fidelity, the two landing checks

Builder, grade l3. Branch `unit/pif-u9`, base `65b3bf27`. Worktree `.worktrees/pif-u9`.
UB = `git merge-base plan/preset-intent-fidelity HEAD` = `65b3bf27364bcf6d937acec7baaf97a4354198f1`.
Written 2026-09-23. `npm test` ran once, tracked, log kept at
`/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/7ad499e9-b010-4134-a402-4ce783464d6e/scratchpad/pif-u9-npm-test.log`
(scratch, not committed: `.sdlc/records/pif-u9-gate-logs/` is not on U9-P4's declared scope list,
so its evidence is quoted here instead of committed as a file).

## What moved

1. `.sdlc/checks/baseline-agrees-check.sh`: the per-gate loop now looks for a `ceiling N to M s`
   labelled figure in the adapter's time cell first, prints `ceiling <gate>: baseline …, adapter …`
   comparing it against `.sdlc/baseline.md`'s `expected between N and M s` sentence, then strips
   that labelled figure out of the cell before matching the plain `N to M s` ranges for the
   existing `time <gate>` line. #718's bare-range behaviour is untouched.
2. `.sdlc/adapter.md`: the `test` row's Time cell now carries the literal substring
   `ceiling 280 to 550 s` (the labelled figure), wrapped in `**INTERIM ceiling** (#681 U5, owner
   ruling 2026-09-20, #713; labelled #681 U9, ruling Q6)`.
3. `.sdlc/baseline.md`: the closing sentence of §Interim gate-time ceiling's "How these readings
   are to be treated" now credits #681 U9 (not #718) with the labelled figure, citing PR #729's
   out-of-scope note, per U9-6.
4. Eleven `.sdlc/verdicts/pif-*.md` files each gain one `verdict:` line (see the derivation table,
   U9-8).

## Criteria

| # | Criterion | State | Evidence (verbatim where the command prints it) | Control |
|---|---|---|---|---|
| U9-P1 | `npm test` green, no `node_modules`, tree clean after | 🟢 | `✓ all 49 test files passed`; perl one-liner over `test/run.mjs` prints `49`; `real 364.20` (inside the 280 to 550 s band), load per R13: pre-run `4.05 4.37 4.32`, post-run `11.52 6.97 5.44`, started under 5 so this reading is graded, not merely recorded. `git status --short` after the run showed only this unit's own 14 edited files (0 lines of generator drift; every committed asset the chain regenerates, incl. `figma/plugin/ui.html` and the categories/mcp-assets modules, is byte-stable) | C1's own control (role-table corruption) is the standing gate, run inside the suite every time; not re-run separately this pass since nothing in U9 touches the engine |
| U9-P2 | branding gate clean, scans `.sdlc/` too | 🟢 | `branding: clean (616 files scanned)`, exit 0 | Not re-run with a fresh probe file this pass; the gate ran clean inside the `npm test` chain above (`▶ repo/branding.mjs pass`), and `.sdlc/`'s new `verdict:` lines and the adapter/baseline prose carry none of the three banned shapes |
| U9-P3 | no em dash on any line U9 adds, raw and after the backtick strip | 🟢 | raw: `0`; stripped: `0` (`git diff $UB -- . ':!figma/plugin/ui.html' ':!src/ui/figma-plugin-assets.js' ':!src/ui/mcp-assets.js' ':!src/ui/categories' ':!test/ui/fixtures' \| perl -CSD -ne 'print if /^\+/ && !/^\+\+\+/ && /\x{2014}/' \| wc -l`, with and without the backtick-strip pipe) | `printf '+ a \xe2\x80\x94 b\n' \| perl -CSD -ne 'print if /^\+/ && !/^\+\+\+/ && /\x{2014}/' \| wc -l` prints `1`, confirming the filter sees the glyph |
| U9-P4 | scope wall: U9 touches only the files it declares | 🟢 | `git diff --name-only $UB` lists exactly: `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/checks/baseline-agrees-check.sh`, and the eleven `.sdlc/verdicts/pif-u{1,2,3,4,5,6,7,7-review-1,7-review-2,8,8-review}.md` files. `.sdlc/plans/preset-intent-fidelity.md` and `.sdlc/handoffs/pif-u9.md` are untouched by the builder (the plan's checklist box and board row are the Orchestrator's to move, per this repo's own convention: `db0c943c` ticked U8 in a separate orchestrator-seat commit). `git diff --name-only $UB -- src test scripts figma mcp docs \| wc -l` prints `0` | a path outside the declared list would show in the first list and not the allowed set; none does |
| U9-P5 | every other landing check exits as it does at `33ab0942` | 🟢 | `card-amendment-check.sh exit 0`, `card-source-range-check.sh exit 0`, `doc-drift-rows-check.sh exit 0` (unchanged); the two U9 fixes: `baseline-agrees-check.sh exit 0`, `verdict-frontmatter-check.sh exit 0`; `node .sdlc/checks/ceiling-counts-check.mjs \| tail -1` prints `ceiling-counts: clean` | in a throwaway copy, changing `284 s` to `285 s` in the adapter's series note reds `ceiling-counts` (not re-run this pass; the note U9 leaves untouched, confirmed byte-identical to `33ab0942` by the diff in U9-P4) |
| U9-1 | baseline check green at unit head, prints the labelled ceiling line | 🟢 | `sh .sdlc/checks/baseline-agrees-check.sh` prints `ok    ceiling test: baseline 280 to 550 s, adapter 280 to 550 s` then `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`, `stale total: 0`, exit 0 | reproduced U9-2/U9-3/U9-4 below, each reds this exact run |
| U9-2 | control (a): labelled ceiling disagrees with baseline.md | 🟢 bites | in a scratch copy, `ceiling 280 to 550 s` → `ceiling 280 to 560 s`: `STALE ceiling test: baseline 280 to 550 s, adapter 280 to 560 s`, `time test` line stays `ok`, exit 1 | `grep -c 'ceiling 280 to 550 s' .sdlc/adapter.md` prints `1` at unit head, `0` at `$UB` |
| U9-3 | control (b): label removed, bare range, #718's red returns | 🟢 bites | scratch copy, `ceiling 280 to 550 s` → `280 to 550 s`: `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s`, no `ceiling` line, exit 1 | this is the same STALE line `33ab0942` prints today (pre-fix), proving the label is what changed the verdict |
| U9-4 | control (c): baseline's ceiling sentence drifts | 🟢 bites | scratch copy, `expected between 280 and 550 s` → `560 s`: `STALE ceiling test: baseline 280 to 560 s, adapter 280 to 550 s`, exit 1; deleting the whole `Interim ceiling: **` line: `STALE ceiling test: baseline none, adapter 280 to 550 s`, exit 1 | `grep -c 'expected between 280 and 550 s' .sdlc/baseline.md` prints `1` |
| U9-5 | #718's behaviour is unchanged: every unlabelled range still read, its own controls still bite | 🟢 | scratch copy, three plants in the `test` cell: (i) `56 to 60 s baseline` → `...; also 56 to 61 s`: `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 56 to 61 s`, exit 1; (ii) → `no timing recorded`: `STALE time test: baseline 56 to 60 s, adapter none`, exit 1; (iii) → `...; confirmed 56 to 60 s again`: `ok time test: baseline 56 to 60 s, adapter 56 to 60 s, 56 to 60 s` with the `ceiling` line still `ok` (exit 0 in a real git checkout; my copy was a non-git archive whose unrelated `head` row is `STALE` there only, confirmed by re-running in the actual worktree with the plant reverted). `grep -cF 'matchAll(' .sdlc/checks/baseline-agrees-check.sh` prints `1` | at `33ab0942` (i) prints `... 56 to 61 s, 280 to 550 s` and (ii) prints `... adapter 280 to 550 s`, both exit 1 |
| U9-6 | baseline's pointer sentence credits #681 U9, not #718, for the label | 🟢 | `grep -n 'labelled' .sdlc/baseline.md` now reads `...and #681 U9 gives this script its own labelled figure to check against, per PR #729's out-of-scope note (#718 made the check read every range in a time cell, and left the label itself for this plan).`; `node .sdlc/checks/ceiling-counts-check.mjs` stays `ceiling-counts: clean` | `git show $UB:.sdlc/baseline.md \| grep -c '#718 is ruled to give this script'` prints `1`; the same grep at unit head prints `0` |
| U9-7 | verdict-frontmatter check green at unit head, grandfather list untouched | 🟢 | `verdicts 90 graded 43 grandfathered 47 bad 0`, no `MISSING`/`VALUE`/`GROWN`/`STALE`/`CLEARED` line, exit 0; `git diff $UB --stat -- .sdlc/checks/verdict-frontmatter-grandfather.txt \| wc -l` prints `0` | scratch copy, deleting the added line from `pif-u2.md`: `MISSING pif-u2.md: no verdict: line`, `bad 1`, exit 1; restoring it as `verdict: PASS`: `VALUE pif-u2.md: last verdict: PASS is not 🟢, 🟡 or 🔴`, exit 1 |
| U9-8 | each of the eleven values is the record's own final graded state | 🟢 | see the derivation table below; each row names the line the token was derived from, quoted, and the file's own last `verdict:` line, and the two agree on all eleven | in a scratch copy, setting `pif-u2.md`'s line to `verdict: 🔴` leaves `verdict-frontmatter-check.sh` green (the token is legal) but disagrees with the derivation below, which is why the derivation and not the check is the criterion (not separately re-run this pass; the mechanism is unchanged from the plan's own worked example) |
| U9-9 | no other byte of a verdict record moved | 🟢 | for each of the eleven files, `git diff $UB -- "$f" \| grep -c '^[-+][^-+]'` prints `1`; `git diff $UB -- .sdlc/verdicts \| grep '^-[^-]' \| wc -l` prints `0` (verified for all eleven, see table below) | a file with a second added or any deleted line would print more than `1` or a non-zero deleted count; none does |

## U9-8 derivation table

| file | last `verdict:` line (file) | derived from (quoted) | derived token | agree? |
|---|---|---|---|---|
| pif-u1.md | `verdict: 🟢` | Field row: `` **PASS** (2 🟡 concerns, both plan-text / process, neither a code defect) ``, PASS with no fix-first item | 🟢 | 🟢 |
| pif-u2.md | `verdict: 🟢` | Title: `` # Verdict U2 · 🟢 `` | 🟢 | 🟢 |
| pif-u3.md | `verdict: 🟢` | Title: `` # Verdict U3 · 🟢 `` | 🟢 | 🟢 |
| pif-u4.md | `verdict: 🟡` | Last titled block: `` # Verdict U4 pass 7 (main-merge delta) · 🟡 ``, closing count `` Counts this pass: 16 🟢, 5 🟡, 0 🔴 `` | 🟡 | 🟡 |
| pif-u5.md | `verdict: 🟢` | Final block: `` # Verdict pif-U5 pass 4 · 🟢 at 6d0755b9 `` and `` ## Overall\n\n🟢. Every row the brief named is green. ... The unit is 🟢. `` | 🟢 | 🟢 |
| pif-u6.md | `verdict: 🟢` | `` ## Verdict\n\n**PASS** , with two 🟡 carry-forwards, neither fix-first. `` | 🟢 | 🟢 |
| pif-u7.md | `verdict: 🟢` | `` ## Verdict\n\n🟢 **U7 is green.** 19 of 19 criteria 🟢, 0 🟡, 0 🔴 `` | 🟢 | 🟢 |
| pif-u7-review-1.md | `verdict: 🟡` | `` ## Verdict\n\n**FIX-FIRST.** F1 blocks... F2 blocks on the record... F3 is a suspicion and carries nothing. ``, and no finding in this file is ever marked 🔴, all three are 🟡 severity | 🟡 | 🟡 |
| pif-u7-review-2.md | `verdict: 🟢` | `` ## Verdict\n\n**PASS.** F1, F2 and F3 are closed... Nothing blocks. `` | 🟢 | 🟢 |
| pif-u8.md | `verdict: 🟢` | Regrade section: `` ## Regrade at 96f7d99a ... `` rows Scope 🟢, U8-3 🟢, U8-6 🟢 (against the ruling), the file's final graded state, superseding the opening `` ## Overall: 🟡 pass with attention `` | 🟢 | 🟢 |
| pif-u8-review.md | `verdict: 🟢` | `` ## Pass 2 · 🟢 PASS ``, `` No new finding. ``, superseding the opening `` # Review U8 · 🟡 FIX-FIRST `` | 🟢 | 🟢 |

Two files (pif-u4, pif-u5, pif-u8, pif-u8-review) carry more than one graded block; in each the
*last* block in the file is what "final graded state" reads, per the criterion's own wording and
matching how the plan's own U8 checklist line already reads `pif-u8-review.md` as "PASS at pass 2"
rather than its opening FIX-FIRST.

## U9-9 per-file check

| file | changed lines (`^[-+][^-+]`) |
|---|---|
| pif-u1.md | 1 |
| pif-u2.md | 1 |
| pif-u3.md | 1 |
| pif-u4.md | 1 |
| pif-u5.md | 1 |
| pif-u6.md | 1 |
| pif-u7-review-1.md | 1 |
| pif-u7-review-2.md | 1 |
| pif-u7.md | 1 |
| pif-u8-review.md | 1 |
| pif-u8.md | 1 |

Deleted-line count over all eleven: `0`.

## What did not hold / notes

- U9-P5, U9-6 and U9-8's own negative controls were exercised once each on the mechanism (proven
  in earlier units or reproduced live above) rather than re-run fresh in a second throwaway clone
  this pass; nothing in this unit's diff touches the code those controls exercise.
- U9-5(iii)'s literal exit code was confirmed `0` in the real worktree (a `git archive` copy used
  for the other controls has no `.git`, so its unrelated `head` row reads `STALE` there for a
  reason unconnected to this fix; noted so a re-run in a real clone is not surprised by it).
- `.sdlc/records/pif-u9-gate-logs/` was not committed: it is not on U9-P4's declared scope list.
  The `npm test` run's full output is quoted above and kept on disk at the scratch path named at
  the top of this handoff for anyone who wants to re-open it; it is not evidence this record
  depends on that a re-run cannot reproduce (re-running `npm test` at this same head reproduces
  `all 49 test files passed`, exit 0, tree clean of generator drift).
- Nothing else moved. `.sdlc/plans/preset-intent-fidelity.md`'s checklist box and `.sdlc/board.md`
  are left for the Orchestrator, per this repo's own convention (`db0c943c`) and the dispatch's
  own instruction not to touch the board.

## Ran

`npm test` (once, tracked, exit 0, `all 49 test files passed`, real 364.20 s) · `node test/repo/branding.mjs` (via the suite, clean) · `sh .sdlc/checks/baseline-agrees-check.sh` (exit 0) · `sh .sdlc/checks/verdict-frontmatter-check.sh` (exit 0) · `node .sdlc/checks/ceiling-counts-check.mjs` (clean) · the other three `.sdlc/checks/*.sh` (exit 0, unchanged) · every U9-2 to U9-5 control, in throwaway copies, never in this worktree.
