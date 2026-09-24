# Review U9 · 🟡 FIX-FIRST

Fresh-context reviewer, opus high under owner ruling R17 (the Fable allowance is spent). Plan
`preset-intent-fidelity` (#681), unit branch `unit/pif-u9`, diff `65b3bf27..886d9715`, one commit,
15 files. UB = `65b3bf27` (`git merge-base 886d9715 plan/preset-intent-fidelity`). Written
2026-09-23. Nothing in the worktree was edited apart from this untracked record. Every run and
mutation happened in two throwaway `git clone -q --shared` copies at `886d9715` in my session
scratch (`r9` for checks and controls, restored with `git checkout -q .` after each, `t9` for
`npm test`). Host load 3.0 to 3.4 throughout; the node-test guard read `0` before each test process.

I derived all eleven `verdict:` values from the records before opening the builder's handoff.

Verdict in one line: every U9 criterion holds and every control bites, but the new ceiling parse
still has the #718 defect: it compares only the first labelled range and never reads any later
one. The check can also be emptied without a red. Both fixes are a few lines in one file.

## Findings, by severity

| # | Sev | Where | Finding | Fix |
|---|---|---|---|---|
| F1 | 🟡 medium, fix-first | `.sdlc/checks/baseline-agrees-check.sh:23`, `:28` | `cell.match(/ceiling (\d+) to (\d+) s/)` reads the FIRST label only, while `cell.replace(/ceiling \d+ to \d+ s/g, "")` strips EVERY label from the plain-range pass. A second labelled range is therefore read by nobody. This is #718's defect class ("reads only the first range in a gate cell") coming back through the label path. Planted `, revised ceiling 90 to 999 s` after the real label: `ok    ceiling test: baseline 280 to 550 s, adapter 280 to 550 s`, `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`, `stale total: 0`, exit 0 | Use `matchAll` on the label as well and require every labelled range to equal the baseline sentence, the same way `ms.every` treats plain ranges |
| F2 | 🟡 medium, fix-first | `.sdlc/checks/baseline-agrees-check.sh:24` | The check runs in one direction only. A label that exists must agree with the baseline, but nothing requires the label to exist while `.sdlc/baseline.md` still states a ceiling. With the whole `: ceiling 280 to 550 s wall on a host at load under about 10` clause deleted from the adapter, the run printed no `ceiling` line at all, then `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`, `stale total: 0`, exit 0. The adapter can drop the ruled ceiling without anyone seeing it. The same happens for a label with no range (`ceiling 550 s`). U9-3 only covers the case where the word `ceiling` is removed and the bare range stays | When `ceilBase` matches, require a `test` label, and print `STALE ceiling test: baseline 280 to 550 s, adapter none` when it is missing |
| F3 | 🟡 low | `.sdlc/checks/baseline-agrees-check.sh:19` | `b.match(/expected between (\d+) and (\d+) s/)` is not anchored to the `Interim ceiling: **` line (`.sdlc/baseline.md:97`), so the first such phrase anywhere in the file wins. I added one earlier sentence (`Old note: the suite is expected between 280 and 550 s under any load.`) and moved the real line to 600 s. The run printed `ok    ceiling test: baseline 280 to 550 s, adapter 280 to 550 s`, exit 0, which hid a real drift on the baseline side. Today the file has exactly one hit, so nothing is wrong yet | Anchor the match: `/^Interim ceiling: \*\*.*?expected between (\d+) and (\d+) s/m` |
| F4 | ⚪ nit | `.sdlc/checks/baseline-agrees-check.sh:23-26` | A label in a different gate's time cell gets compared against the `npm test` ceiling sentence and reported as that gate's ceiling. With `; ceiling 280 to 550 s` planted in the `build` cell, the run printed `ok    ceiling build: baseline 280 to 550 s, adapter 280 to 550 s`. It fails closed for any other value. Labels outside column 5 are never read (tested on the `Green means` cell), but #718 never read those either, so that part is not a regression | Read the label only for `gate === "test"`, or key the baseline sentence by gate |
| F5 | 🟡 low, record | `.sdlc/baseline.md:210-211`, handoff U9-6 row | The re-wrap puts `labelled` and `figure` on separate lines, so U9-6's own command, `grep -n 'labelled figure' .sdlc/baseline.md`, prints nothing at head. The content is correct and the discriminating half passes (`1` at UB, `0` at head for `#718 is ruled to give this script`). The handoff swaps in `grep -n 'labelled'` and quotes the sentence joined across two lines with `...`, which breaks the verbatim-quote amendment because there is no `altered:` mark | Re-wrap so the phrase sits on one line, or restate the U9-6 command. Mark the handoff quote `altered:` |
| F6 | 🟡 low, record | `.sdlc/handoffs/pif-u9.md` U9-P4, U9-P1, notes | (a) U9-P4 says the handoff is "untouched by the builder" and gives an "exactly" list without it, but `git diff --name-only 65b3bf27` lists `.sdlc/handoffs/pif-u9.md`. The file is in scope; the claim about it is false. (b) The builder's `npm test` log (`scratchpad/pif-u9-npm-test.log`) starts `pre-run: 15:59` on 2026-09-22 and ends `git status --short after:       15 lines`. That run used an uncommitted tree about ten hours before the commit (`Wed Sep 23 02:36:17 2026`), and the handoff reports 14 files, not 15. (c) "Two files (pif-u4, pif-u5, pif-u8, pif-u8-review)" names four files. (d) The controls for U9-P2, U9-P5 and U9-8 are marked "not re-run". I ran all three below, and all three bite | Fix the text while F1 and F2 are being fixed |

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U9-P1 | `npm test` green, no `node_modules`, tree clean after | 🟢 | Clone `t9` at `886d9715`, no `node_modules`: `✓ all 49 test files passed`, `EXIT=0`, `real 291.36`. Start load `3.17 3.38 3.34`, end load `3.22 3.22 3.27` (R13: started under 5, inside the 280 to 550 band). `git status --short \| wc -l` after the run printed `0`. The perl TESTS count printed `49` | Same clone, `role-table.json:84` `"550"` set to `"999"`, then `node test/engine/semantic.mjs`: `  FAIL  refs-canonical  — primary =  550/450 != canonical  999/450`, `FAIL: 1 gate failure(s)`, exit 1. Restored, 0 dirty lines. I ran the single file, not the full suite, to keep host load down |
| U9-P2 | branding clean, `.sdlc/` scanned | 🟢 | `branding: clean (617 files scanned)`, exit 0 | Added `.sdlc/verdicts/zz-ctl.md` containing the retired maker name in uppercase: `FAIL: 1 branding violation(s) across 618 files`, exit 1 (altered: the offending line is not quoted, per X12). File removed, tree clean |
| U9-P3 | no em dash added, raw and stripped | 🟢 | Plan pipe over `65b3bf27`: raw `0`, after backtick strip `0`. The commit message has `0` | `printf '+ a \xe2\x80\x94 b\n' \| perl -CSD -ne '...'` printed `1` |
| U9-P4 | scope wall | 🟢 | `git diff --name-only 65b3bf27` lists `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/checks/baseline-agrees-check.sh`, `.sdlc/handoffs/pif-u9.md` and the eleven verdicts. All are on the declared list. `git diff --name-only 65b3bf27 -- src test scripts figma mcp docs \| wc -l` printed `0`. Grandfather list diff `0` lines | The same listing is the control: it reports `.sdlc/handoffs/pif-u9.md`, which the handoff says is absent (F6a), so the listing can surface a file the claim leaves out |
| U9-P5 | other landing checks unchanged | 🟢 | `card-amendment-check.sh exit 0`, `card-source-range-check.sh exit 0`, `doc-drift-rows-check.sh exit 0`, the two fixed checks `exit 0`. `ceiling-counts: clean` with 12 `ok` lines, the same count at UB and the same count U7-11 recorded | Adapter `284 s` changed to `285 s`: `FAIL  adapter pointer found  (no 'a N-reading series from 284 s to M s')`, `ceiling-counts: 1 failure(s)`, exit 1 |
| U9-1 | baseline check green, labelled line printed | 🟢 | `ok    ceiling test: baseline 280 to 550 s, adapter 280 to 550 s`, `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`, `stale total: 0`, exit 0. At UB the same check printed `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s`, `stale total: 1`, exit 1 | U9-2 to U9-4 below each red this run |
| U9-2 | label disagrees with baseline | 🟢 | Label changed to 560: `STALE ceiling test: baseline 280 to 550 s, adapter 280 to 560 s`, `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`, `stale total: 1`, exit 1. `grep -c 'ceiling 280 to 550 s'` printed `1` at head and `0` at UB | This row is itself the control |
| U9-3 | label removed, #718's red returns | 🟢 | `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s`, no `ceiling` line, `stale total: 1`, exit 1. Byte-identical to the UB line above | This row is itself the control |
| U9-4 | baseline sentence drifts | 🟢 | `STALE ceiling test: baseline 280 to 560 s, adapter 280 to 550 s`, exit 1. With the `Interim ceiling: **` line deleted: `STALE ceiling test: baseline none, adapter 280 to 550 s`, exit 1. `grep -c 'expected between 280 and 550 s'` printed `1`. F3 shows how this row stops being sufficient if a second phrase is ever added | This row is itself the control |
| U9-5 | #718 behaviour survives | 🟢 | (i) `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 56 to 61 s`, exit 1. (ii) `STALE time test: baseline 56 to 60 s, adapter none`, exit 1. (iii) `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s, 56 to 60 s` with `ok    ceiling test: baseline 280 to 550 s, adapter 280 to 550 s`, `stale total: 0`, exit 0. `grep -cF 'matchAll('` printed `1`. Plain ranges are still all read. The first-only read is back on the label path instead (F1) | Plants (i) and (ii) are the controls, and both red |
| U9-6 | pointer sentence credits #681 U9 | 🟡 | `git show 65b3bf27:.sdlc/baseline.md \| grep -c '#718 is ruled to give this script'` printed `1`, and at head `0`. The new sentence at `.sdlc/baseline.md:209-212` reads correctly. The row's own `grep -n 'labelled figure'` command prints nothing at head (F5) | The UB/head grep pair (`1` and then `0`) is the discriminating control |
| U9-7 | frontmatter check green, list untouched | 🟢 | `verdicts 90 graded 43 grandfathered 47 bad 0`, exit 0. UB: `verdicts 90 graded 43 grandfathered 47 bad 11` | Line deleted from `pif-u2.md`: `MISSING pif-u2.md: no verdict: line`, `verdicts 90 graded 43 grandfathered 47 bad 1`, exit 1. Set to `PASS`: `VALUE pif-u2.md: last verdict: PASS is not 🟢, 🟡 or 🔴`, exit 1 |
| U9-8 | eleven values equal each record's final graded state | 🟢 | See my derivation table below, built before I read the handoff. 11 of 11 agree with the file's last `verdict:` line and with the handoff's table | `pif-u2.md` set to `verdict: 🔴`: the check still printed `verdicts 90 graded 43 grandfathered 47 bad 0`, exit 0, while the title reads `# Verdict U2 · 🟢`. So only the derivation catches a wrong legal token |
| U9-9 | no other verdict byte moved | 🟢 | Each of the eleven files: `1` changed line. Deleted lines over `.sdlc/verdicts`: `0`. Every file has exactly one line matching `^verdict:`, so the added line is the last one, which is the line `read_gate` reads. `pif-u5.md:10` sits inside its front matter, and the closing `---` did not move | Appended `extra line` to `pif-u2.md`: the per-file count against `65b3bf27` printed `2`. With the added `verdict:` line deleted it printed `0`. So the count follows the edit and is not stuck at `1` |

## U9-8, my derivation (made before reading the handoff)

| file | derived from (quoted) | my token | file's last `verdict:` |
|---|---|---|---|
| pif-u1.md | `\| Verdict \| **PASS** (2 🟡 concerns, both plan-text / process, neither a code defect) \|` | 🟢 | `verdict: 🟢` |
| pif-u2.md | `# Verdict U2 · 🟢` | 🟢 | `verdict: 🟢` |
| pif-u3.md | `# Verdict U3 · 🟢` | 🟢 | `verdict: 🟢` |
| pif-u4.md | `# Verdict U4 pass 7 (main-merge delta) · 🟡` (the last block) | 🟡 | `verdict: 🟡` |
| pif-u5.md | `# Verdict pif-U5 pass 4 · 🟢 at 6d0755b9`, Overall `The unit is 🟢.` | 🟢 | `verdict: 🟢` |
| pif-u6.md | `**PASS** , with two 🟡 carry-forwards, neither fix-first.` | 🟢 | `verdict: 🟢` |
| pif-u7.md | `🟢 **U7 is green.** 19 of 19 criteria 🟢, 0 🟡, 0 🔴` | 🟢 | `verdict: 🟢` |
| pif-u7-review-1.md | `**FIX-FIRST.** F1 blocks`, all three findings headed `🟡` | 🟡 | `verdict: 🟡` |
| pif-u7-review-2.md | `**PASS.** F1, F2 and F3 are closed` | 🟢 | `verdict: 🟢` |
| pif-u8.md | Regrade at `96f7d99a`: rows Scope, U8-3, U8-6 all `🟢`, after the earlier `Overall: 🟡 pass with attention` | 🟢 | `verdict: 🟢` |
| pif-u8-review.md | `## Pass 2 · 🟢 PASS`, `No new finding.` | 🟢 | `verdict: 🟢` |

One call was close. `pif-u1` and `pif-u6` say PASS while carrying open 🟡 carry-forwards, and
`pif-u4` closes with 0 🔴 yet titles itself 🟡. I read each record's own headline word as its
graded state, which gives 🟢 for the two PASS records and 🟡 for the one that chose 🟡. By the same
rule FIX-FIRST maps to 🟡, because `pif-u8-review.md` titles its FIX-FIRST pass `🟡 FIX-FIRST`. The
handoff reached the same eleven tokens.

## Correctness questions from the dispatch

| Question | Answer |
|---|---|
| Can the label parse hide a real stale range? | 🔴 Yes: a second label (F1), a removed label (F2), and a baseline sentence shadowed by an earlier phrase (F3). A label in another gate's cell fails closed (F4). A label with no range removes the ceiling check without any output (F2) |
| Does #718's behaviour survive? | 🟢 For plain ranges, yes: U9-5's three plants give #718's outputs exactly. F1 brings the same defect back for labels |
| Do the eleven values match? | 🟢 11 of 11, derived independently |
| Did anything outside the scope wall move? | 🟢 No. Only `.sdlc/` files on the declared list changed, and no product file moved |

## Next

The builder fixes F1 and F2, plus F3 if it is cheap, in `baseline-agrees-check.sh`, adds a
control for each (the two-label plant and the label-deleted plant above), and fixes the F5/F6
record text. Re-review is a delta read of those lines, with the U9-2 to U9-5 controls re-run.

verdict: 🟡 FIX-FIRST

## Round 2

Fresh-context reviewer-l3 (opus high, R17), delta `886d9715..1dd3a106`, three files. Written
2026-09-23. Nothing in the worktree was edited apart from this untracked record. Every mutation ran
in `git clone -q --shared` copies at `1dd3a106` under my job scratch (`r2` for checks and controls,
restored with `git checkout -q .` after each, then `git status --short | wc -l` printed `0`; `t2`
for `npm test`, no `node_modules`). Host load 3.5 to 4.6 throughout.

Verdict in one line: F1, F2 and F3 are closed and bite, but the F4 scoping opened a new silent pass
for labelled ranges in every other gate's cell, and F2 by design changes U9-3's output, so the plan
row no longer matches.

### Findings, by severity

| # | Sev | Where | Finding | Fix |
|---|---|---|---|---|
| R2-1 | 🟡 medium, fix-first | `.sdlc/checks/baseline-agrees-check.sh:24`, `:32` | The label read is now scoped to `gate === "test"`, but `cell.replace(/ceiling \d+ to \d+ s/g, "")` still strips labels from EVERY gate's cell. A labelled range in any other cell is read by nobody. Planted `1 to 3 s; ceiling 1 to 2 s` in the `build` cell: `ok    time build: baseline 1 to 3 s, adapter 1 to 3 s`, `stale total: 0`, exit 0. The same plant at `886d9715` printed `STALE ceiling build: baseline 280 to 550 s, adapter 1 to 2 s`, and the same range unlabelled (`1 to 3 s; 1 to 2 s`) at head prints `STALE time build: baseline 1 to 3 s, adapter 1 to 3 s, 1 to 2 s`. So the word `ceiling` is a mute switch for four gates. The handoff's F4 row says "no silent pass either", which is false: its control only planted the matching value `280 to 550 s` | Strip labels only in the test cell: `const plain = gate === "test" ? cell.replace(...) : cell;`. Control: the `ceiling 1 to 2 s` build plant above must print a STALE `time build` line and exit 1. Correct the F4 row's claim |
| R2-2 | 🟡 medium, orchestrator | plan `## U9 criteria` row U9-3 | U9-3 expects `no ceiling line, stale total: 1`. At head the U9-3 sed prints `STALE ceiling test: baseline 280 to 550 s, adapter none`, then the unchanged `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s`, `stale total: 2`, exit 1. This is the F2 fix working as the rework brief asked, so the plan row, not the builder, is out of date. The verifier reading U9-3 literally will red it | The Orchestrator amends U9-3 in a plan revision: expect the `adapter none` ceiling line plus the byte-identical `time test` line, `stale total: 2` |
| R2-3 | 🟡 low, record | handoff, Rework 1 F6 row and "Fresh `npm test`" block | F6(b) asked for a run on the committed rework head. The quoted run spans `08:16:33` to `08:21:23` and its own `git status --short after:` lists ` M .sdlc/baseline.md`, ` M .sdlc/checks/baseline-agrees-check.sh`, ` M .sdlc/handoffs/pif-u9.md`; the commit is dated `Wed Sep 23 09:22:38 2026`. It ran on an uncommitted tree, yet the F6 row says "ran on this rework's committed tree". My own run on `1dd3a106` (below) is green, so the gate holds; the claim is wrong | Say the run was on the working edits, or quote a run on the committed head |
| R2-4 | ⚪ nit, record | handoff U9-6 row | F5's file half is closed (`211:labelled figure to check against, ...`). The record half is not: the U9-6 row still cites `grep -n 'labelled'` and quotes three joined lines behind `...`, with no `altered:` mark | Cite `grep -n 'labelled figure'` and quote line 211 verbatim, or mark the joined quote `altered:` |
| R2-5 | ⚪ nit, process | handoff Rework 1 intro | The U9-P2 and U9-8 controls ran "directly in this worktree". The plan says every file-editing control runs in a throwaway clone, never in a unit worktree. The tree was clean afterwards and nothing leaked (`git diff --name-only 65b3bf27 -- src test scripts figma mcp docs \| wc -l` printed `0`). The U9-8 reading `verdicts 91 graded 44` comes from this untracked review file sitting in that worktree | Run the next rework's controls in a clone |

### Criteria

| # | State | Evidence | Negative control |
|---|---|---|---|
| F1 | 🟢 closed | `matchAll(/ceiling (\d+) to (\d+) s/g)` plus `every`. Planted `, revised ceiling 90 to 999 s` after the real label: `STALE ceiling test: baseline 280 to 550 s, adapter 280 to 550 s, 90 to 999 s`, `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`, `stale total: 1`, exit 1 | The same plant at `886d9715` printed `ok    ceiling test: ...` and exit 0 (round 1), so this plant tells the two versions apart |
| F2 | 🟢 closed | Clause `: ceiling 280 to 550 s wall on a host at load under about 10` deleted (`grep -c` printed `0`): `STALE ceiling test: baseline 280 to 550 s, adapter none`, exit 1. Label changed to `ceiling 550 s`: `STALE ceiling test: baseline 280 to 550 s, adapter none`, exit 1 | Both plants printed no ceiling line and exit 0 at `886d9715` (round 1) |
| F3 | 🟢 closed | Anchor `/^Interim ceiling: \*\*.*?expected between (\d+) and (\d+) s/m`. Decoy at line 2 (`2:Old note: the suite is expected between 280 and 550 s under any load.`) and the real line moved to 600: `STALE ceiling test: baseline 280 to 600 s, adapter 280 to 550 s`, exit 1 | The same plant printed `ok    ceiling test: ...` at `886d9715` (round 1) |
| F4 | 🔴 regressed | Scoped as the brief allowed, but see R2-1: `ceiling 1 to 2 s` in the `build` cell gives `ok    time build: baseline 1 to 3 s, adapter 1 to 3 s`, `stale total: 0` | Unlabelled `1 to 2 s` in the same cell reds: `STALE time build: baseline 1 to 3 s, adapter 1 to 3 s, 1 to 2 s` |
| F5 | 🟡 half | `grep -n 'labelled figure' .sdlc/baseline.md` printed `211:labelled figure to check against, per PR #729's out-of-scope note (#718 made the check read`. The baseline delta is `3` minus and `3` plus lines, and a whitespace-folded diff against `886d9715` is empty (words unchanged). Handoff quote not fixed (R2-4) | `git show 65b3bf27:.sdlc/baseline.md \| grep -c '#718 is ruled to give this script'` printed `1`, and at head `0` |
| F6 | 🟡 mostly | (a) U9-P4 now lists `.sdlc/handoffs/pif-u9.md`. (c) `Four files (pif-u4, pif-u5, pif-u8, pif-u8-review)`. (d) P2, P5 and U9-8 controls now recorded. (b) run was on an uncommitted tree (R2-3) | I reran (d) myself: see U9-P2, U9-P5 and U9-8 rows below, all three bite |
| U9-P1 | 🟢 | Clone `t2` at `1dd3a106`, no `node_modules`: `✓ all 49 test files passed`, `EXIT=0`, `real 298.83`, start load `3.58 3.59 3.47`, end load `4.63 4.25 3.84`, `dirty:        0` after | Not rerun this round; round 1's `refs-canonical` corruption control stands and the delta touches no engine or test file (`git diff --name-only 886d9715..HEAD` lists only three `.sdlc/` files) |
| U9-P2 | 🟢 | `branding: clean (617 files scanned)`, exit 0 | Probe file in `.sdlc/verdicts/zz-ctl.md` with the retired maker name in uppercase: `FAIL: 1 branding violation(s) across 618 files`, exit 1 (altered: the offending line is not quoted). Removed, `0` dirty lines |
| U9-P3 | 🟢 | Plan pipe over `65b3bf27`: raw `0`, stripped `0`; commit message `0` | `printf '+ a \xe2\x80\x94 b\n' \| perl ...` printed `1` |
| U9-P4 | 🟢 | `git diff --name-only 65b3bf27` lists `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/checks/baseline-agrees-check.sh`, `.sdlc/handoffs/pif-u9.md` and the eleven verdicts, all on the declared list. `git diff --name-only 65b3bf27 -- src test scripts figma mcp docs \| wc -l` printed `0`. Delta touches `3` files, all `.sdlc/` | The listing surfaced the handoff file in round 1 when the claim left it out, so it can show an undeclared path |
| U9-P5 | 🟢 | `card-amendment-check.sh exit 0`, `card-source-range-check.sh exit 0`, `doc-drift-rows-check.sh exit 0`, `baseline-agrees-check.sh exit 0`, `verdict-frontmatter-check.sh exit 0`; `ceiling-counts: clean` with `12` ok lines, same as round 1 | `284 s to 1670` set to `285 s to 1670`: `FAIL  adapter pointer found  (no 'a N-reading series from 284 s to M s')`, `ceiling-counts: 1 failure(s)`, `exit 1` |
| U9-1 | 🟢 | `ok    ceiling test: baseline 280 to 550 s, adapter 280 to 550 s`, `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`, `stale total: 0`, `exit 0` | U9-2 and U9-4 red this exact run below |
| U9-2 | 🟢 | `STALE ceiling test: baseline 280 to 550 s, adapter 280 to 560 s`, `ok    time test: ...`, `stale total: 1`, `exit 1`. `grep -c 'ceiling 280 to 550 s'` printed `1` at head, `0` at `65b3bf27` | This row is the control; the sed has no target at UB |
| U9-3 | 🟡 plan drift | `STALE ceiling test: baseline 280 to 550 s, adapter none`, `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s`, `stale total: 2`, `exit 1`. The `time test` line is byte-identical to the plan; the extra ceiling line and total 2 are not (R2-2) | This row is the control; it still reds |
| U9-4 | 🟢 | `STALE ceiling test: baseline 280 to 560 s, adapter 280 to 550 s`, `exit 1`; `Interim ceiling: **` line deleted: `STALE ceiling test: baseline none, adapter 280 to 550 s`, `exit 1`. `grep -c 'expected between 280 and 550 s'` printed `1` | This row is the control |
| U9-5 | 🟢 | (i) `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 56 to 61 s`, exit 1. (ii) `STALE time test: baseline 56 to 60 s, adapter none`, exit 1. (iii) `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s, 56 to 60 s` with `ok    ceiling test: baseline 280 to 550 s, adapter 280 to 550 s`, `stale total: 0`, exit 0 in a real clone. `grep -cF 'matchAll('` printed `2` | Plants (i) and (ii) are #718's controls, both red |
| U9-6 | 🟢 | `211:labelled figure to check against, ...` now prints for the row's own command | `#718 is ruled to give this script`: `1` at UB, `0` at head |
| U9-7 | 🟢 | Clone: `verdicts 90 graded 43 grandfathered 47 bad 0`, `exit 0`; grandfather diff `0`. Worktree at head (read-only run, with this file untracked): `verdicts 91 graded 44 grandfathered 47 bad 0` | `verdict:` line deleted from `pif-u2.md`: `MISSING pif-u2.md: no verdict: line`, `bad 1`, `exit 1`. Set to `PASS`: `VALUE pif-u2.md: last verdict: PASS is not 🟢, 🟡 or 🔴`, `exit 1` |
| U9-8 | 🟢 | No verdict file moved in the delta (`git diff 886d9715..HEAD --stat -- .sdlc/verdicts \| wc -l` printed `0`), so my round 1 derivation of 11 of 11 stands | `pif-u2.md` set to `verdict: 🔴`: `verdicts 90 graded 43 grandfathered 47 bad 0` while the title reads `# Verdict U2 · 🟢` |
| U9-9 | 🟢 | Each of the eleven files printed `1`; deleted lines over `.sdlc/verdicts`: `0` | An extra line gave `2` in round 1, so the count follows the edit |

### Next

The builder fixes R2-1 (one line plus its build-cell control) and the record text in R2-3 and
R2-4. The Orchestrator amends U9-3's expected output in the plan (R2-2). Re-review is a delta read
of line 32 and the two handoff rows.

verdict: 🟡

## Round 3

Fresh-context reviewer-l3 (opus high, R17), delta `d96c3375..1fe7976e`, two files. `d96c3375` is
`1dd3a106` plus plan revision 35. Written 2026-09-23. Nothing in the worktree was edited apart from
this untracked record. Every plant ran in a `git clone -q --shared` copy at `1fe7976e` under my job
scratch (`r3`), restored with `git checkout -q .` after each, then `git status --short | wc -l`
printed `0`. I did not rerun `npm test`. I rely on the builder's run on `f8d5564c` (started
`12:50:45`, commit `12:50:32`; `1fe7976e` changes only `.sdlc/handoffs/pif-u9.md`) and reran the
cheap gates myself, listed below.

Verdict in one line: R2-1, R2-3 and R2-4 are closed, U9-3 matches revision 35, and nothing else
moved.

| # | State | Evidence | Negative control |
|---|---|---|---|
| R2-1 | 🟢 closed | `const plain = gate === "test" ? cell.replace(/ceiling \d+ to \d+ s/g, "") : cell;` at `baseline-agrees-check.sh:32`. Plant `1 to 3 s; ceiling 1 to 2 s` in the `build` cell: `STALE time build: baseline 1 to 3 s, adapter 1 to 3 s, 1 to 2 s`, `stale total: 1`, `exit 1` | The same plant at `1dd3a106` printed `ok    time build: baseline 1 to 3 s, adapter 1 to 3 s`, `stale total: 0` (Round 2). A matching build label `ceiling 1 to 3 s` gives `ok    time build: baseline 1 to 3 s, adapter 1 to 3 s, 1 to 3 s`, so the check still tells right from wrong |
| R2-3 | 🟢 closed | F6 row now reads `ran on the rework 1 working edits (not yet committed at that point)`. A new run is quoted for the committed head: `pre-run: Wed Sep 23 12:50:45 PDT 2026`, `✓ all 49 test files passed`, only the two untracked files in `git status --short after:` | `git log` gives `f8d5564c Wed Sep 23 12:50:32`, before the run's start, and `git diff --name-only f8d5564c..1fe7976e` prints only `.sdlc/handoffs/pif-u9.md`, so the run covers the head's code |
| R2-4 | 🟢 closed | U9-6 row now cites `grep -n 'labelled figure'` and quotes `211:labelled figure to check against, per PR #729's out-of-scope note (#718 made the check read`, which is what the command prints in `r3` | `git show 65b3bf27:.sdlc/baseline.md \| grep -c '#718 is ruled to give this script'` printed `1`; at head `0` |
| U9-3 (rev 35) | 🟢 | `STALE ceiling test: baseline 280 to 550 s, adapter none`, `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s`, `stale total: 2`, `exit 1`. Both lines and the total match revision 35. Nit: the row says the time line comes first "then" the ceiling line, but the check prints the ceiling line first. The row reads line content, so it still holds | This row is the control; the `time test` line is byte-identical to the `33ab0942` reading |
| U9-1, U9-2, U9-4, U9-5 | 🟢 | U9-1: `ok    ceiling test: baseline 280 to 550 s, adapter 280 to 550 s`, `stale total: 0`, `exit 0`. U9-2: `STALE ceiling test: baseline 280 to 550 s, adapter 280 to 560 s`, `exit 1`. U9-4: `STALE ceiling test: baseline 280 to 560 s, adapter 280 to 550 s`, `exit 1`. U9-5 (i) `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 56 to 61 s` exit 1, (ii) `STALE time test: baseline 56 to 60 s, adapter none` exit 1, (iii) `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s, 56 to 60 s` exit 0 | F1 plant `STALE ceiling test: baseline 280 to 550 s, adapter 280 to 550 s, 90 to 999 s` exit 1; F2 plant `STALE ceiling test: baseline 280 to 550 s, adapter none` exit 1 |
| Landing checks | 🟢 | `baseline-agrees-check.sh exit 0`, `card-amendment-check.sh exit 0`, `card-source-range-check.sh exit 0`, `doc-drift-rows-check.sh exit 0`, `verdict-frontmatter-check.sh exit 0` (`verdicts 90 graded 43 grandfathered 47 bad 0`), `ceiling-counts: clean` | The R2-1 and U9-2 plants above red the baseline check this same run |
| Scope wall | 🟢 | Delta touches `.sdlc/checks/baseline-agrees-check.sh` and `.sdlc/handoffs/pif-u9.md` only. `git diff --name-only 65b3bf27 -- src test scripts figma mcp docs \| wc -l` printed `0`. New em dashes on added lines: `0` | The full `git diff --name-only 65b3bf27` listing names `.sdlc/plans/preset-intent-fidelity.md` (revision 35, the Orchestrator's), so the listing does surface each touched path |

No new finding apart from the U9-3 wording nit, which does not need a fix.

verdict: 🟢
