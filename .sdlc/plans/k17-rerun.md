---
status: approved
ticket: #710
priority: P1
lane: docs
size: S (U1 S = 1 point)
labels: kind:chore · P1 · size:S · lane:docs · mode:multi
written: 2026-09-19
head: d34b4fb1 (`plan/k17-rerun` = `origin/main`, nothing pushed)
branch: plan/k17-rerun
inputs: sdlc-orchestration `.sdlc/inbox/ultimate-tokens-k17-rerun.md` (54550fd), sdlc-orchestration `.sdlc/verdicts/readiness-u6.md` §Pass 2 (2030671), `.sdlc/questions/k17-rerun-approval.md` Q1, `.sdlc/architecture.md` §6 row K17, `.sdlc/verdicts/architecture.md`, `.sdlc/verdicts/records-refresh-U3.md` rows U3-6 and U3-10, `.sdlc/plans/archive/records-refresh.md` (U2-8, U3 leads, revision row "no pass 6")
---

# The A2 verdict grades K17 against the control the map states today, and its title says which pass is newest and what that pass counts

The plugin repo graded its readiness row C31 🟡 at our `28c2e8cc`. `.sdlc/verdicts/architecture.md` pass 5 grades K17 🔴 at `d46ae48` against the old three-name exception filter. `28c2e8cc` is the commit that widened that filter in the map. No row in the A2 verdict reruns the widened control, and the title still reads `pass 4 · 🟢` above a pass 5 that reads 17 of 18. The owner approved one S plan, one unit, touching only the A2 verdict plus this plan's own plan, handoff, verdict and board rows (approval Q1).

## Measured by the planner at d34b4fb1 (2026-09-19, read-only in the plan worktree, plant in a throwaway shared clone)

| What | Result |
|---|---|
| tracked `test/**/*.mjs` | 55 |
| K17 framework half (`git grep` for six framework imports under `test`) | 0 hits |
| K17 registration half, before the exception filter | 7: `gate-report.mjs`, `repo/fixtures/gate-report-clean.mjs`, `repo/fixtures/gate-report-mismatch.mjs`, `repo/fixtures/gate-report-singlequote.mjs`, `run.mjs`, `smoke/smoke.mjs`, `ui/counts.mjs` |
| after the widened filter, lifted out of the map's K17 cell | 0 |
| after the old three-name filter pass 5 ran | 4: `gate-report.mjs` and the three `repo/fixtures/gate-report-*.mjs` (pass 5's 🔴, reproduced) |
| plant in the clone: `import test from "node:test";` appended to `test/engine/hct.mjs` plus a new tracked `test/engine/zzz.mjs` | 2 hits: `test/engine/hct.mjs:172:import test from "node:test";` and `engine/zzz.mjs`. Equals the map's bite cell (2). Clone reset after, `git status --short` 0 lines |
| `node test/repo/branding.mjs` | `branding: clean (461 files scanned)` |

So the map's K17 row is true at this head. The verdict is what lags. These numbers agree with the plugin Verifier's read-only emulation (7 before, 0 after).

## Root cause, and what fixes it

The archived plan ruled it that way. `records-refresh` U3 corrected the map's K17 cell, and its leads bullet says a U3 rerun that differs from a pass 5 cell "is a handoff row and a U3 verdict row, not a pass 6" (revision row 2026-09-19: "the 18 controls rerun by the builder (handoff, no pass 6)"). U3's scope wall gave it no write to `.sdlc/verdicts/architecture.md`. U3-6 proved the corrected cell, but it graded into `.sdlc/verdicts/records-refresh-U3.md`. No criterion anywhere compared the A2 verdict's newest K17 row with the map's control text, and none compared the title with the newest pass. So a control cell could change in the same PR that left its verdict row grading the old text, and every gate stayed green.

Two criteria close that for this landing: U1-2 (the newest K17 row quotes the filter byte for byte as the map's cell states it, lifted from the map, not copied into this plan) and U1-4 (the title's pass number and count are computed from the file's own headings and newest rows). The pass 6 intro also states the rule in the file itself: a change to a §6 control cell lands with a pass here grading the new text. A standing check script under `.sdlc/checks/` would make that permanent, but it is a new file outside the approved wall, so it is the owner's question Q-A below, not part of this unit.

## Pass number: 6, not 5

| Option | Ruling | Why |
|---|---|---|
| append `## Pass 6 (K17 only)` with one row | chosen | passes 3 and 4 are the file's own precedent: a one-row rerun of the last open convention, each with its own pass number, appended. Pass 5 is a graded reading at `d46ae48` that the plugin's evidence file quotes; it stays as history |
| rewrite pass 5's K17 row in place | refused | it edits a verdict row after it was graded, at a head it was not graded at. U1-6 counts deletions against the merge base so this cannot happen quietly |

The ask's wording was "the title states pass 5 and its real count". The title states both readings: `# Verdict A2 architecture · pass 6 · 🟢 18 of 18 (pass 5: 17 of 18, K17 🔴; pass 6 reruns K17)`. The Conductor's reply to the plugin repo says so in one line.

## Does this edit break the plugin's C31 count

Measured on a fixture (the file at d34b4fb1 plus the §Texts title and a pass 6 with one K17 row):

| Count | At d34b4fb1 | After this unit | Reads as |
|---|---|---|---|
| C31 block as written, whole-file rows (`vr-1`) | 30 | 31 | already a recorded substitution (archived U2-8, and the plugin's pass 2 evidence): passes 1 to 4 and the gaps table share the file |
| archived U2-8 scoped count: from `## Pass 5` to end of file, unique K ids | 18 | 18 | holds, because it counts with `sort -u` |
| the plugin pass 2 worker's count: `grep -c '^\| K[0-9]'` in the pass 5 table | 18 | 18 when bounded to the pass 5 table (`/^## Pass 5/,/^## Pass 6/`); 19 if read from `## Pass 5` to end of file | the one count this edit can move. The reply names the bounded form |
| `grep -c 'exception'`, folded to 1 | 1 | 1 | holds |

U1-5 pins all four, plus the plugin pass 2 worker's own three counts (unfolded exception count 7, own run 19, own plant 19), so the Conductor's reply to the plugin repo can quote them.

## Scope wall

Only these paths change against the merge base:

| Path | Who | What |
|---|---|---|
| `.sdlc/verdicts/architecture.md` | builder-l1 | line 1 (the title), nothing else |
| `.sdlc/verdicts/architecture.md` | verifier-l1 writes, Orchestrator commits | one appended `## Pass 6` section: intro, one table with one K17 row, one Result line |
| `.sdlc/handoffs/k17-rerun-U1.md` | builder-l1 | new |
| `.sdlc/verdicts/k17-rerun-checkability.md`, `.sdlc/verdicts/k17-rerun-U1.md`, `.sdlc/verdicts/k17-rerun-prepr.md`, and any further `.sdlc/(verdicts\|handoffs\|questions)/k17-rerun-*.md` the loop writes (a second pass, a question doc) | criteria reviewer, verifier, pre-land | new; the name prefix is the wall |
| `.sdlc/plans/k17-rerun.md` (then `plans/archive/`), `.sdlc/questions/k17-rerun-approval.md`, `.sdlc/board.md` | planner, Conductor, Orchestrator | this plan, the approval already in the tree, board rows |

Not touched: `.sdlc/architecture.md` (the control is graded as the map states it, so the map must not move), `.sdlc/roadmap.md`, every other plan, `.sdlc/checks/`, everything outside `.sdlc/`. No em dash in any added line. Nothing added quotes the retired maker brand or the pre-rename element identifier; paraphrase both.

## Criteria (plan-level: the standing gates, run by the builder, again by the verifier, again at pre-land)

Every control that edits a file runs in a throwaway clone (`git clone -q --shared . "$CLAUDE_JOB_DIR/tmp/neg"`), never in the unit worktree. Commands are in fenced blocks so nothing depends on table pipe escapes; run them from the repo root with `V=.sdlc/verdicts/architecture.md; A=.sdlc/architecture.md`.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, tree byte-stable | block P1 | `✓ all 48 test files passed`, then `0` | in the clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`, rerun: exit 1, a non-zero FAIL count (measured 1 failing file, `FAIL refs-canonical`, at 3600ad6e; the expected value is non-zero, not a fixed number) |
| P4 | branding gate clean | block P4 | `branding: clean (N files scanned)`, `exit 0` (N is not pinned: it grows with every record this branch adds) | in the clone: `cp docs/reference/references/decision-records.md docs/x.md`, rerun: FAIL (the records exemption is by path) |
| P5 | scope wall: only the wall's paths differ from the merge base, tracked or untracked. The wall admits the A2 verdict, the board, this plan, and any record under `verdicts/`, `handoffs/` or `questions/` whose name starts `k17-rerun-` (checkability, unit verdict, pre-land record, handoff, approval), so a record the loop adds later needs no plan edit | block P5 | `0` | measured 2026-09-20 at 9b2d82dc (bf4ea457 plus the review's amendment, same three changed paths: this plan, the approval, the checkability record): `0`, where the first draft's regex prints `1` for the checkability record. In a shared clone of that head: one byte on `.sdlc/architecture.md` `1`; a new `.sdlc/checks/new.sh` `1`; `.sdlc/verdicts/records-refresh-k17-rerun.md` (the slug not at the start of the name) `1`; a second plan file `.sdlc/plans/k17-rerun-extra.md` `1`; and the loop's own later records together (`verdicts/k17-rerun-U1-p2.md`, `handoffs/k17-rerun-U1.md`, a board line) `0` |

`npm run build` and `npm run smoke` are not unit gates here: no file under the build chain, `src/` or `test/` changes, P5 proves that, and CI runs both on the PR (`build-test`, `panda-smoke`), which Landing watches to `success`.

```sh P1
npm test 2>&1 | tail -1; git status --short | wc -l
```

```sh P4
bash -c 'set -o pipefail; node test/repo/branding.mjs | tail -1; echo "exit $?"'
```

```sh P5
MB=$(git merge-base origin/main HEAD); { git diff --name-only $MB; git ls-files -o --exclude-standard; } | sort -u | grep -vcE '^\.sdlc/(verdicts/architecture\.md|(verdicts|handoffs|questions)/k17-rerun-[A-Za-z0-9-]+\.md|plans/(archive/)?k17-rerun\.md|board\.md)$'
```

## Units

- [x] U1 (S) the A2 verdict's title states the newest pass and its count; the verifier appends pass 6, K17 only, its own run of the map's control at the head and its own plant · grade l1 · reviewer-l1 · verifier-l1

Grade. Docs, l1 by the Orchestrator's table, and it stays l1. The builder has almost nothing to build: one title line, plus a handoff that records its own run of one control as the claim under test. The failure mode the l2 bump exists for (a transcription error nobody can see) has a mechanical catch here: U1-2 lifts the filter from the map and U1-4 computes the title's numbers from the file. The verifier is l1 too: one control, one plant, expected values measured above, and it is opus, so it does not share a family with the sonnet builder. The reason to go higher would be judgment; there is none in this row. Pre-land is the adapter §2.1 pair (reviewer-l3, verifier-l3) as for every plan, and it grades the rows the unit verifier wrote.

### U1 (S, grade l1)

Division of labour (the verifier writes verdict rows, the builder does not):

| Seat | Produces | Not |
|---|---|---|
| builder-l1 | line 1 of `.sdlc/verdicts/architecture.md` per §Texts; `.sdlc/handoffs/k17-rerun-U1.md` with its own K17 run at the unit head (both halves, the 7 names before the filter, the count after, the plant and its hits, `measured at <sha>`) | any other line of any file under `.sdlc/verdicts/`; any edit to `.sdlc/architecture.md`; any fix if the control prints a hit |
| reviewer-l1 | fresh-context read of the diff against U1-4, U1-6, U1-7 and the wall | running the plant (the verifier does) |
| verifier-l1 | `## Pass 6` per §Texts, from its own run and its own plant, the handoff used as the claim under test and never as evidence; `.sdlc/verdicts/k17-rerun-U1.md` grading U1-4 to U1-7, P1, P4, P5, one negative control each | grading U1-1 to U1-3 (its own section; pre-land does) |
| Orchestrator | commits pass 6 verbatim on `plan/k17-rerun` with `Seat: orchestrator` after the U1 merge and before pre-land; the board rows; the ticket | wording any cell of the row |
| pre-land pair | U1-1, U1-2, U1-3 with its own K17 run, U1-5, and P1, P4, P5 again at the branch head | |

Steps.

1. Orchestrator: mint the ticket, `worktrees.py add k17-U1 --plan k17-rerun` (worktree `.worktrees/k17-U1`, branch `unit/k17-U1`). If `origin/main` has moved past d34b4fb1, rebase first and rerun the planner's table above; if `git diff --name-only d34b4fb1 origin/main -- test .sdlc/architecture.md` prints anything, the numbers in this plan are leads, not expected values.
2. Builder: run the K17 control as the map's cell states it (block K17 below), record it in the handoff, run the plant in a throwaway clone, record it, reset the clone. Edit line 1 of the verdict per §Texts. Run U1-4 (it prints `0` then `5 17` until pass 6 exists, which is expected and the handoff says so), U1-6, U1-7, P1, P4, P5. Commit, hand off.
3. Reviewer, then verifier. The verifier runs block K17 itself in a scratch worktree of the unit head and the plant in its own clone, writes pass 6, grades its rows. A hit after the filter means the row is 🔴 with the hit quoted, the title criterion U1-4 goes red, and the unit returns to the Orchestrator as a question (the map is outside the wall); nobody fixes it here.
4. Orchestrator merges the unit, commits pass 6, reruns U1-4 (now `1`, `6 18`), sends the branch to pre-land.

```sh K17
git grep -nE 'from "(vitest|jest|mocha|node:test|uvu|ava)"' -- test
CF=$(grep -E '^[|] K17 [|]' .sdlc/architecture.md | grep -oE 'grep -vxE "[^"]+"' | tr -d '\134')
git ls-files test | grep "\.mjs$" | sed "s#^test/##" | while read f; do grep -q "\"$f\"" test/run.mjs || echo "$f"; done | tee "$CLAUDE_JOB_DIR/tmp/k17-before.txt" | eval "$CF"
wc -l < "$CLAUDE_JOB_DIR/tmp/k17-before.txt"
```

`\134` is `tr`'s octal for a backslash: the filter is lifted out of the map's cell and its table pipe escapes dropped, so what runs is the cell's own filter and not a copy in this plan (the archived U3-6 device). Expected at d34b4fb1: no output from the first three lines, then `7`.

#### Texts

Title, line 1, exactly:

```
# Verdict A2 architecture · pass 6 · 🟢 18 of 18 (pass 5: 17 of 18, K17 🔴; pass 6 reruns K17)
```

Pass 6, appended at the end of the file by the verifier. Fixed parts are the heading, the intro's `at` sha in backticks as the first sha of the section, the column header, the row id, the filter quoted exactly as the map's cell writes it (with the cell's own `\|` escapes), the phrase `7 before the filter, 0 after` if that is what its run prints, the words `own plant`, and the Result line. The section never uses the word `exception` (write `the filter`, `the listed names`): the plugin's evidence counts that word over the whole file and reads 7, and U1-5 holds it there. Everything else is the verifier's own wording:

```
## Pass 6 (U1 of plan k17-rerun, K17 only)

Graded <date> at `<sha>` (branch `unit/k17-U1`). <where the control ran, where the plant ran, that both are this verifier's own>.

<a second paragraph, so the first line carrying a sha carries exactly one>: pass 5 graded K17 at `d46ae48` against the three-name filter; `28c2e8cc` widened the filter in the map and no pass here graded the new text. Rule from this pass on: a change to a §6 control cell lands with a pass in this file grading the new text.

Revision 2: this intro is two paragraphs, not one. U1-3's `grep -m1 -oE` caps the first matching LINE, not the first match, so a one-paragraph intro naming both shas makes `$S` two lines and `git diff` exit `fatal: bad revision`. Pre-land keeps the shas on separate lines.

| # | Convention | State | Evidence | Negative control |
|---|---|---|---|---|
| K17 | Tests use no framework and every test file is in `run.mjs` TESTS | <state> | own run at `<sha>` of the control as the map's K17 cell states it, filter `<the cell's grep -vxE "..." verbatim>`: framework half <n>; registration half 7 before the filter, 0 after; <the seven names>; <handoff figures and whether they agree> | own plant: <what, where, hits quoted> |

Result: 18 of 18 🟢 with K1 to K16 and K18 read from pass 5 at `d46ae48` and K17 from this pass. <anything else seen>.
```

Handoff `.sdlc/handoffs/k17-rerun-U1.md`: the adopt-hygiene handoff shape plus one line `measured at <sha>`, the block K17 output, the seven names, the plant and its hits, and the title diff.

#### Criteria

U1-4 to U1-7 are graded by the unit verifier; U1-1, U1-2, U1-3 and U1-5 by pre-land (the unit verifier wrote what they read). Every "measured" value below is the planner's, 2026-09-19, at d34b4fb1 or on a fixture of it in a throwaway shared clone.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U1-1 | pass 6 exists once, is the last section, holds exactly one K row, it is K17, it is 🟢, no cell is empty | block U1-1 | `1`, nothing, `1`, `1`, `0` | at d34b4fb1: `0`, nothing, `0`, `0`, `0`. Fixture with the row's state set to 🔴: fourth line `0` |
| U1-2 | the cause: the newest K17 row in the verdict quotes the exception filter byte for byte as the map's K17 cell states it at the head | block U1-2 | `1` | at d34b4fb1 the newest K17 row is pass 5's: `0`. In the clone, `ui/counts.mjs` dropped from the map's cell with the fixture verdict unchanged: `0`, so either file moving alone fails |
| U1-3 | the pass was graded at a head whose `test/` and map equal this head's, the row carries the measured counts and an own plant, and the grader's own rerun agrees | block U1-3, then block K17 and the plant run by the grader itself | a sha, `0`, `1`, `1`; the grader's own run prints nothing then `7`; its plant, as the map's bite cell writes it (the import appended to `test/engine/hct.mjs`, plus a new tracked `test/engine/zzz.mjs` with no import in it), prints 2 hits in total: 1 on the framework half (`hct.mjs`) and 1 on the registration half (`engine/zzz.mjs`). A `zzz.mjs` that also carries the import gives 2 and 1; say which plant was run | fixture with the intro sha set to `d814500`: `22` files differ. Before the unit (measured at 9b2d82dc): an empty line, `no sha`, `0`, `0`; both phrase legs read the pass 6 section only, so pass 5's own `own plant` cannot satisfy them. The grader's plant is the control's bite: 0 hits clean, 2 planted |
| U1-4 | the title names the highest `## Pass N` in the file and the count of conventions whose newest row is 🟢, both computed | block U1-4 | `1`, `6 18` | at d34b4fb1: `0`, `5 17` (the defect, measured). Fixture with pass 6 present and the old title: `0`. Fixture with pass 6's state 🔴: `0`, `6 17` |
| U1-5 | the counts the plugin's C31 regrade reads: pass 5 table 18 rows, unique K ids from pass 5 on 18, raw K rows from pass 5 on 19, whole-file rows 31, exception fold 1, then the plugin pass 2 worker's own three counts: the unfolded exception count 7, K rows naming an own run 19, K rows naming an own plant 19 | block U1-5 | `18`, `18`, `19`, `31`, `1`, `7`, `19 19` | before the unit (measured at 9b2d82dc): `18`, `18`, `18`, `30`, `1`, `7`, `18 18`. A fixture with one pass 5 K row deleted prints `17` first. A fixture whose pass 6 uses the word the sixth line counts, once, prints `8` there while the fold still prints `1` |
| U1-6 | passes 1 to 5 are untouched: the only deleted line against the merge base is the old title | block U1-6 | `1`, `0` | at d34b4fb1: `0`, `0`. Fixture with pass 5's K17 state flipped in place: `2`, `1` |
| U1-7 | the builder's handoff is a claim with numbers: measured at a head whose `test/` and map equal this head's, 7 before, 0 after, a plant with its hit count recorded (a line matching `plant ... N hits`, not the bare word) | block U1-7 | `0`, `1`, `1`, `1` | before the unit the file is absent and `grep` errors. A copy with the `measured at` line removed prints `no sha` (revision 2: the unguarded first leg printed `0` on stdout with `fatal: bad revision` on stderr, so `0` could not tell a good handoff from one with no sha at all; U1-7 graded 🟢 at 3600ad6e on the verifier's own diff, not on that leg); a copy naming `d814500` prints `22`. Measured on a scratch handoff: `plant mentioned, nothing recorded` prints `0` on the last line, `own plant: ..., 2 hits` prints `1` |

```sh U1-1
grep -c '^## Pass 6' $V
awk '/^## Pass 6/{f=1;next} f&&/^## /{print "NOT LAST"}' $V
sed -n '/^## Pass 6/,$p' $V | grep -cE '^[|] K'
sed -n '/^## Pass 6/,$p' $V | grep -cE '^[|] K17 [|] [^|]+ [|] 🟢 [|]'
sed -n '/^## Pass 6/,$p' $V | grep -E '^[|] K17 [|]' | awk -F'[|]' '{for(i=2;i<NF;i++) if($i ~ /^ *$/) c++} END{print c+0}'
```

```sh U1-2
CF=$(grep -E '^[|] K17 [|]' $A | grep -oE 'grep -vxE "[^"]+"'); grep -E '^[|] K17 [|]' $V | tail -1 | grep -cF -- "$CF"
```

```sh U1-3
S=$(sed -n '/^## Pass 6/,$p' $V | grep -m1 -oE 'at .[0-9a-f]{7,40}.' | grep -oE '[0-9a-f]{7,40}'); echo "$S"
if [ -n "$S" ]; then git diff --name-only "$S" HEAD -- test $A | wc -l; else echo "no sha"; fi
R=$(sed -n '/^## Pass 6/,$p' $V | grep -E '^[|] K17 [|]'); echo "$R" | grep -c '7 before the filter, 0 after'; echo "$R" | grep -c 'own plant'
```

```sh U1-4
N=$(grep -oE '^## Pass [0-9]+' $V | grep -oE '[0-9]+' | sort -n | tail -1)
G=$(for k in $(seq 1 18); do grep -E "^[|] K$k [|]" $V | tail -1; done | grep -cE '^[|] K[0-9]+ [|] [^|]+ [|] 🟢 [|]')
head -1 $V | grep -c "pass $N · 🟢 $G of 18"; echo "$N $G"
```

```sh U1-5
sed -n '/^## Pass 5/,/^## Pass 6/p' $V | grep -c '^| K[0-9]'
sed -n '/^## Pass 5/,$p' $V | grep -oE '^[|] K([1-9]|1[0-8]) [|]' | sort -u | wc -l
sed -n '/^## Pass 5/,$p' $V | grep -c '^| K[0-9]'
vr=$(grep -c '^| [^-#]' $V); echo $((vr-1))
grep -c 'exception' $V | sed 's/^[2-9]/1/'
grep -c 'exception' $V
echo "$(sed -n '/^## Pass 5/,$p' $V | grep '^| K[0-9]' | grep -c 'own run') $(sed -n '/^## Pass 5/,$p' $V | grep '^| K[0-9]' | grep -c 'own plant')"
```

```sh U1-6
MB=$(git merge-base origin/main HEAD); git diff $MB -- $V | grep -cE '^-[^-]'; git diff $MB -- $V | grep -E '^-[^-]' | grep -vc '^-# Verdict A2 architecture'
```

```sh U1-7
HF=.sdlc/handoffs/k17-rerun-U1.md; S=$(grep -m1 -oE 'measured at .?[0-9a-f]{7,40}' $HF | grep -oE '[0-9a-f]{7,40}$')
if [ -n "$S" ]; then git diff --name-only "$S" HEAD -- test .sdlc/architecture.md | wc -l; else echo "no sha"; fi
grep -c '7 before' $HF; grep -c '0 after' $HF; grep -ciE 'plant.*[0-9]+ hits?' $HF | sed 's/^[1-9][0-9]*$/1/'
```

The `[^|]+` in U1-1 and U1-4 assumes the Convention cell has no pipe in it; the §Texts cell has none. `| K12 count` and `| K13 count` in the Pass 1 gaps table do not match `^[|] K12 [|]`, measured.

## Risks and assumptions

| Risk or assumption | Handling |
|---|---|
| `origin/main` moves under `test/` or the map before the verifier runs | step 1's diff check; U1-3's second line catches a pass graded at a head that differs |
| the verifier's run prints a hit after the filter | the row is 🔴, the unit stops, the Orchestrator asks the owner; the wall forbids touching the map |
| the plugin's regrade counts raw K rows from `## Pass 5` to end of file and reads 19 | U1-5 pins 19 and the bounded 18; the Conductor's reply names the bounded form |
| the verifier has no Write tool | it returns the section text in its verdict and writes it with Bash in its scratch copy for its own checks; the Orchestrator commits it verbatim (records-refresh U2 precedent) |
| `.sdlc/architecture.md`'s rerun note still says a U3 rerun is graded by the U3 verdict | true as history and outside the wall; pass 6's intro states the current reading. Q-A covers whether the map gets a pointer |

## Not in scope, and why

| Left out | Why |
|---|---|
| a fifth standing `.sdlc/checks/` script comparing the A2 verdict with the map | new file outside approval Q1's wall; Q-A |
| any edit to `.sdlc/architecture.md`, the roadmap, or another plan | approval Q1 |
| regrading K1 to K16 and K18 | pass 5 graded them 🟢 at `d46ae48` and U3 reran all 18 at `20298cc`; nothing since touched their cited paths in a way the ask names |
| restructuring the verdict into one live table | discards pass history; refused in the archived plan for the same reason |

## Open question for the owner

| # | Question | Default if unanswered |
|---|---|---|
| Q-A | `.sdlc/checks/` already holds four tracked scripts (baseline, two card checks, doc-drift rows; all four green at 9b2d82dc per the criteria review, and this unit moves none of them). May a later plan add a fifth, `.sdlc/checks/a2-verdict-agrees-check.sh` (blocks U1-2 and U1-4 as a script, run at every pre-land) and one pointer sentence in the map's rerun note? | no. This plan lands with the rule stated in pass 6's intro and the two criteria; the script is a debt row the Conductor files after landing |

## Landing

One PR from `plan/k17-rerun` to `main`, carrying the approval doc, this plan, U1, the verifier's pass 6 (committed by the Orchestrator before pre-land) and the board rows. Title `chore(sdlc): A2 verdict pass 6, K17 rerun against the widened filter, title states the newest pass (#<ticket>)`. The door is `.sdlc/adapter.md` §2.1 as ruled (conflict row X4): pre-land review grades U1-1, U1-2, U1-3, U1-5 and P1, P4, P5 at the branch head with its own K17 run and plant, records the C31 counts of U1-5 in its own row so the plugin repo reads them from one place, and writes `.sdlc/verdicts/k17-rerun-prepr.md` with `verdict: 🟢` and the branch head sha; `adapter.py land --branch plan/k17-rerun --gate .sdlc/verdicts/k17-rerun-prepr.md --dry-run` proves the gate; CI watched to `success` for `build-test` and `panda-smoke`; squash per `shipping-changes` step 7; sync per step 8. Then adapter §5: status `done`, the unit ticked, a revision row, the file moved to `.sdlc/plans/archive/`, board rows landed, ticket closed with `adapter.py close <id> --reason .sdlc/verdicts/k17-rerun-prepr.md`. The Conductor then replies to the plugin repo's inbox ask with the merge sha, the pass number ruling and the U1-5 counts.

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-19 | plan written (draft). Planner measured the K17 control and its plant at d34b4fb1, and every U1 command both at d34b4fb1 and on a fixture verdict (title plus pass 6) in a throwaway shared clone, including each negative control quoted above | inbox ask from the plugin repo's Conductor; approval Q1 |
| 2026-09-20 | revised on the criteria review (`.sdlc/verdicts/k17-rerun-checkability.md` @ 9b2d82dc, P5 🔴, 9 of 10 checkable). P5 and the scope wall now admit every record the loop writes by name prefix (`.sdlc/(verdicts\|handoffs\|questions)/k17-rerun-*.md`) instead of a closed list, re-measured at 9b2d82dc with five controls. All eight gaps taken, each a one-line fix: G1 and G8 add three lines to block U1-5 (own run 19, own plant 19, unfolded count 7) and §Texts bars the counted word from pass 6; G2 scopes U1-3's phrase legs to the pass 6 section; G3 prints `no sha` instead of erroring; G4 makes U1-7 read a recorded hit count; G5 states the plant and its hits per half; G6 rewords Q-A (the checks directory exists, four scripts); G7 unpins P4's N. None left | Conductor relay of the criteria review; a closed allow-list failed on the first record nobody had listed, so the wall is now a naming rule |
| 2026-09-20 | revision 2, on the U1 verdict's three findings (`.sdlc/verdicts/k17-rerun-U1.md`, 5 🟢 2 🟡 0 🔴 at 3600ad6e, the two 🟡 cleared by the Orchestrator's rerun after Pass 6 was committed: U1-4 `1` / `6 18`, U1-5 `18 18 19 31 1 7 19 19`). F1: §Texts' intro is now two paragraphs so U1-3's `grep -m1 -oE` sees one sha per line. F2: U1-7's first leg carries U1-3's `no sha` guard, since unguarded it printed the pass value `0` for a handoff with no sha at all. F3: P1's negative control no longer names a stale FAIL count from a different plant; measured 1 here, and the expected value is non-zero | U1 verdict findings; none of the three changed a graded result |
