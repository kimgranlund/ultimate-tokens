---
status: approved
ticket: #712
priority: P1
lane: docs
size: S (U1 S = 1 point)
labels: kind:chore · P1 · size:S · lane:docs · mode:multi
written: 2026-09-20
head: 730ff941 (`plan/records-tidy` = `origin/main`, nothing pushed)
branch: plan/records-tidy
inputs: `.sdlc/questions/records-tidy-approval.md` Q1, `.sdlc/verdicts/k17-rerun-prepr.md` §Concerns rows 2, 4, 6, `.sdlc/plans/archive/k17-rerun.md` (shape, Q-A, block U1-5), `.sdlc/architecture.md` §6 row K17, `.sdlc/verdicts/architecture.md` pass 6, sdlc plugin `skills/pre-land-review/SKILL.md` lines 12, 13, 40
---

# Three record lines that k17-rerun's pre-land review found stale say what the tree says today

k17-rerun landed (PR #711, squash `41b2877e`). Its pre-land record left three one-line record defects with the Conductor, each outside that plan's wall: the map's rerun note still points at pass 5 as K17's current reading, the debt row for K17 still says the control filters 3 files, and adapter §2.1 names a pre-land reviewer grade the plugin skill and the last two landings did not use. The owner approved one S plan, one unit, exactly those three lines plus this plan's own records (approval Q1).

## Measured by the planner at 730ff941 (2026-09-20, read-only in the plan worktree)

| What | Result |
|---|---|
| `.sdlc/architecture.md` line 18 is one line, the whole rerun note; it ends `where U3's rerun differs from a pass 5 cell, the handoff row says so and the U3 verdict grades it.` and earlier says `pass 5 is the current reading` | 1 hit each |
| highest `## Pass N` heading in `.sdlc/verdicts/architecture.md` | 6 (`## Pass 6 (U1 of plan k17-rerun, K17 only)`, graded at `3600ad6e`) |
| `.sdlc/debt.md` line 92 (row `K17` of §Architecture exceptions) says `the control filters 3 files by name` | 1 hit |
| the map's K17 cell filter, lifted with `grep -oE 'grep -vxE "[^"]+"'` | `grep -vxE "run.mjs\|smoke/smoke.mjs\|ui/counts.mjs\|gate-report.mjs\|repo/fixtures/gate-report-(clean\|mismatch\|singlequote).mjs"` (7 names, since `28c2e8cc`) |
| that filter string in `.sdlc/debt.md` | 0 hits |
| `reviewer-l3` in `.sdlc/adapter.md` | 1 (line 58, §2.1 item 1); `reviewer-l4` 0 |
| the plugin's `pre-land-review` skill | line 12 `reviewer-l4` (fable), line 13 `verifier-l3` (fable), line 40: the pair never shares a family with the builders |
| what ran at the last two pre-lands | `records-refresh-prepr.md` line 5 and `k17-rerun-prepr.md` line 17: `reviewer-l4` and `verifier-l3` both times |
| every other `reviewer-l3` under `.sdlc/` | `plans/archive/k17-rerun.md:102`, `plans/archive/adopt-hygiene.md:35,36,41`, `verdicts/adopt-hygiene-U1-review.md:7`, `verdicts/k17-rerun-prepr.md:56`, `questions/adopt-hygiene-prepr.md:5,6`, `questions/survey-2026-09-18-approval.md:121,130`, `tickets/T-0001.md:1`. All archived plans, graded verdicts, answered questions or a ticket status note: history, none a live claim. Only the adapter line is in scope |
| block U1-5 of the archived k17-rerun plan (the C31 counts the plugin repo reads) | `18`, `18`, `19`, `31`, `1`, `7`, `19 19` |
| existing `.sdlc/checks/` | four scripts: `baseline-agrees-check.sh` (adapter vs baseline time ranges), `card-amendment-check.sh`, `card-source-range-check.sh`, `doc-drift-rows-check.sh` (map §8 rows only). None reads `.sdlc/verdicts/architecture.md` |
| `node test/repo/branding.mjs` | `branding: clean (469 files scanned)` |
| P5 block below, at this head with the approval doc untracked | `0` |

## Root cause, and what fixes it

Each line is a copy of a fact that lived somewhere else and moved. The rerun note copied "pass 5 is current" from the records-refresh plan; pass 6 appended a newer K17 row. The debt row copied "3 files" from the map's old cell; `28c2e8cc` widened the cell to 7 and no criterion compared the two. Adapter §2.1 copied the pre-land grades from an early draft of the plugin skill; the skill moved the reviewer to l4 for the cross-family rule and the adapter, which wins over plugin defaults, kept saying l3 while l4 ran. The fix is the same for all three: the line names its source and the value the source holds today, so the next drift is a grep, not a reading.

## Q-A of plan k17-rerun, answered here

Q-A asked whether a later plan may add `.sdlc/checks/a2-verdict-agrees-check.sh` and a pointer sentence in the map. Answer: no script; the pointer names the newest pass. The owner's Q1 wall holds three lines, no new file, and there is no one-line way inside an existing check: all four scripts state their subject in their header comment and none opens the A2 verdict, so adding the map-vs-verdict predicate to one changes that check's contract and is a file outside the wall. U1-1's third leg runs the predicate once at this landing (the pass number the note names equals the highest pass heading in the verdict), and the note's rule reads "the newest pass in that file", so a pass 7 makes the named number a dated fact and leaves the rule true. If the Conductor wants it standing, that is a debt row after landing, not this plan.

## Scope wall

Only these paths change against the merge base:

| Path | Who | What |
|---|---|---|
| `.sdlc/architecture.md` | builder-l1 | line 18, nothing else |
| `.sdlc/debt.md` | builder-l1 | line 92, nothing else |
| `.sdlc/adapter.md` | builder-l1 | line 58 in place, plus one `**Amendment (date).**` paragraph after §2.1 item 4 (the §4 precedent of 2026-09-19: rows renumbered in place, the amendment says so) |
| `.sdlc/handoffs/records-tidy-U1.md` | builder-l1 | new |
| `.sdlc/verdicts/records-tidy-checkability.md`, `.sdlc/verdicts/records-tidy-U1.md`, `.sdlc/verdicts/records-tidy-prepr.md`, and any further `.sdlc/(verdicts\|handoffs\|questions)/records-tidy-*.md` the loop writes | criteria reviewer, verifier, pre-land | new; the name prefix is the wall |
| `.sdlc/plans/records-tidy.md` (then `plans/archive/`), `.sdlc/questions/records-tidy-approval.md`, `.sdlc/board.md` | planner, Conductor, Orchestrator | this plan, the approval already in the tree, board rows |

Not touched: `.sdlc/verdicts/architecture.md` (U1-4 pins it), `.sdlc/roadmap.md`, every other plan, `.sdlc/checks/`, every other line of the three edited files, everything outside `.sdlc/`. No em dash in any added line. Nothing added quotes the retired maker brand or the pre-rename element identifier; paraphrase both.

## Criteria (plan-level: the standing gates, run by the builder, again by the verifier, again at pre-land)

Every control that edits a file runs in a throwaway clone (`git clone -q --shared . "$CLAUDE_JOB_DIR/tmp/neg"`), never in the unit worktree. Commands are in fenced blocks; run them from the repo root with `A=.sdlc/architecture.md; D=.sdlc/debt.md; AD=.sdlc/adapter.md; V=.sdlc/verdicts/architecture.md; MB=$(git merge-base origin/main HEAD)`.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, tree byte-stable | block P1 | `✓ all 48 test files passed`, then `0` | in the clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`, rerun: exit 1 and a non-zero FAIL count (k17-rerun measured `FAIL refs-canonical`, 1 file) |
| P4 | branding gate clean | block P4 | `branding: clean (N files scanned)`, `exit 0` (N not pinned; it grows with each record) | in the clone: `cp docs/reference/references/decision-records.md docs/x.md`, rerun: FAIL (the records exemption is by path) |
| P5 | scope wall: only the wall's paths differ from the merge base, tracked or untracked; the wall admits the three record files, the board, this plan, and any record under `verdicts/`, `handoffs/` or `questions/` whose name starts `records-tidy-` | block P5 | `0` | measured at 730ff941 with the approval doc untracked: `0`. In the clone: one byte on `$V` prints `1`; a new `.sdlc/checks/new.sh` `1`; `.sdlc/verdicts/k17-rerun-records-tidy.md` (slug not at the start) `1`; a second plan file `.sdlc/plans/records-tidy-extra.md` `1`; the loop's own later records together (`verdicts/records-tidy-U1.md`, `handoffs/records-tidy-U1.md`, a board line) `0` |

`npm run build` and `npm run smoke` are not unit gates here: nothing under the build chain, `src/` or `test/` changes, P5 proves that, and CI runs both on the PR (`build-test`, `panda-smoke`), which Landing watches to `success`.

```sh P1
npm test 2>&1 | tail -1; git status --short | wc -l
```

```sh P4
bash -c 'set -o pipefail; node test/repo/branding.mjs | tail -1; echo "exit $?"'
```

```sh P5
{ git diff --name-only $MB; git ls-files -o --exclude-standard; } | sort -u | grep -vcE '^\.sdlc/(architecture\.md|debt\.md|adapter\.md|(verdicts|handoffs|questions)/records-tidy-[A-Za-z0-9-]+\.md|plans/(archive/)?records-tidy\.md|board\.md)$'
```

## Units

- [!] U1 (S) the rerun note points at the newest pass, the K17 debt row quotes the map's seven-name filter, adapter §2.1 says reviewer-l4 with an amendment saying why · grade l1 · reviewer-l1 · verifier-l1

Grade. Docs, l1 by the Orchestrator's table, and it stays l1: three lines whose exact replacement text is in §Texts, each with a grep that reads 0 before and 1 after and a deletion count against the merge base. The transcription failure l2 exists for is caught mechanically (U1-2 lifts the filter from the map, U1-1 computes the pass number from the verdict). The verifier is l1 (opus), so it shares no family with the sonnet builder. Pre-land is the adapter §2.1 pair as this very branch amends it: `reviewer-l4` and `verifier-l3`, both fable, the pair the plugin skill names and the pair that ran on records-refresh and k17-rerun, so the record and the run agree from this landing on.

### U1 (S, grade l1)

| Seat | Produces | Not |
|---|---|---|
| builder-l1 | the three edits per §Texts; `.sdlc/handoffs/records-tidy-U1.md` with `measured at <sha>`, the before/after output of blocks U1-1 to U1-4 and the U1-2 filter string it lifted | any other line of the three files; any edit to `$V`, the roadmap, `.sdlc/checks/`; rewording §Texts |
| reviewer-l1 | fresh-context read of the diff against U1-1 to U1-5 and the wall | |
| verifier-l1 | `.sdlc/verdicts/records-tidy-U1.md` grading U1-1 to U1-5, P1, P4, P5, one negative control each | |
| Orchestrator | ticket, worktree, board rows, merge, pre-land dispatch, landing, close-out | wording any of the three lines |
| pre-land pair | U1-1 to U1-5 and P1, P4, P5 again at the branch head; the reviewer greps `reviewer-l3` across `.sdlc/` and confirms every remaining hit is one of the history files listed in §Measured | |

Steps.

1. Orchestrator: mint the ticket, fill the `ticket:` line above, `worktrees.py add records-tidy-U1 --plan records-tidy`. If `origin/main` has moved past 730ff941, rebase first and rerun §Measured; if `git diff --name-only 730ff941 origin/main -- .sdlc/architecture.md .sdlc/debt.md .sdlc/adapter.md .sdlc/verdicts/architecture.md` prints anything, the three §Texts lines are leads, not replacements, and the unit returns here.
2. Builder: apply §Texts (three one-line replacements and one inserted paragraph), run blocks U1-1 to U1-5, P1, P4, P5, record them in the handoff, commit, hand off.
3. Reviewer, then verifier, in fresh context. Any grep off by one means the replacement text was retyped, not pasted; the unit returns to the builder.
4. Orchestrator merges the unit and sends the branch to pre-land.

#### Texts

`.sdlc/architecture.md` line 18. Replace the whole line with exactly:

```
Rerun note (U2 of plan records-refresh, 2026-09-19; re-measured by U3, 2026-09-19; K17 regraded by plan k17-rerun, 2026-09-20). The 18 controls of §6 and §6.1 were rerun at `20298cc` (the `origin/main` head `.sdlc/baseline.md` cites) by U3 (`.sdlc/handoffs/records-refresh-U3.md`), after U2 ran them at `d814500` for `.sdlc/verdicts/architecture.md` pass 5, which graded one row each; §8 was measured at `20298cc`. #706 (`d814500..20298cc`) changed the toolchain the baseline describes, which is why U3 re-measured; pass 5 stays graded at `d814500`, and U3 corrected the K17 exception list pass 5 found stale. The claims of §1 to §5 and the recorded HEAD and bite cells of §6 stay as written at `f9e20c5`. Where the newest row for a convention in `.sdlc/verdicts/architecture.md` differs from a §6 cell, that row is the current reading and the cell is history: pass 5 at `d814500` for K1 to K16 and K18, and pass 6 of `.sdlc/verdicts/architecture.md` (plan k17-rerun, graded at `3600ad6e`, landed `41b2877e`) for K17, which reran the widened seven-name filter and reads 🟢. U3's earlier rerun of K17 is graded in `.sdlc/verdicts/records-refresh-U3.md` and is superseded by pass 6. Rule: a change to a §6 control cell lands with a pass in that file grading the new text, and the newest pass in that file is the current reading; no script checks this pointer, it names the newest pass by hand.
```

`.sdlc/debt.md` line 92. Replace the whole line with exactly (the filter is the map's K17 cell byte for byte, `\|` escapes included; U1-2 lifts it from the map and compares):

```
| K17 | `run.mjs` TESTS is a hand-kept list and the control filters 7 files by name, the map's K17 cell as of `28c2e8cc`: `grep -vxE "run.mjs\|smoke/smoke.mjs\|ui/counts.mjs\|gate-report.mjs\|repo/fixtures/gate-report-(clean\|mismatch\|singlequote).mjs"` (3 names until that commit); a new test file that is not listed never runs and nothing says so | `test/run.mjs:12-21` (33 commits) | architecture K17 exceptions | S | L2 | add a listing self-check to `run.mjs`: every `test/**/*.mjs` is in TESTS or a named allowlist. Pass 6 of `.sdlc/verdicts/architecture.md` grades the seven-name control 🟢 at `3600ad6e` |
```

`.sdlc/adapter.md` line 58. Replace the whole line with exactly:

```
1. **Pre-land review first.** After the last unit on `plan/<slug>` verifies, the Verifier seat dispatches `<plan>-prepr-reviewer` (reviewer-l4) and `<plan>-prepr-verifier` (verifier-l3) per `pre-land-review` and writes `.sdlc/verdicts/<plan>-prepr.md` with `verdict: 🟢` and `sha: <plan branch head>`. The verifier's baseline gates for this repo are test and build, plus smoke when `src/ui/` changed (section 1).
```

`.sdlc/adapter.md`, inserted after item 4 of §2.1 (the `**Ticket close.**` line) and its following blank line, before `### 2.2`, as one paragraph followed by one blank line, with `<date>` the day of the edit in `YYYY-MM-DD`:

```
**Amendment (<date>).** Item 1 said `reviewer-l3` until this date and says `reviewer-l4` now, edited in place. The plugin's `pre-land-review` skill names `reviewer-l4` (fable) beside `verifier-l3` (fable) so that the pre-land pair never shares a model family with any builder grade (l1 to l4 sonnet, l5 to l7 opus; `reviewer-l3` is opus and would share a family with l5 to l7), and l4 is what ran at the records-refresh and k17-rerun pre-lands (`.sdlc/verdicts/records-refresh-prepr.md`, `.sdlc/verdicts/k17-rerun-prepr.md`). This file wins over plugin defaults, so the stricter pair is now the ruled one, not an accident of dispatch. Records written before this date that say `reviewer-l3` for a pre-land are history and were not rewritten.
```

#### Criteria

Every "measured" value below is the planner's, 2026-09-20, at 730ff941 or on a fixture of it in a throwaway shared clone.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U1-1 | the rerun note no longer says the U3 verdict grades the K17 rerun, names the newest pass of the A2 verdict as the current reading, and the pass number it names is the highest `## Pass N` heading in that file; line 18 is the only deleted line of the map | block U1-1 | `0`, `1`, `1`, `1`, `1` | at 730ff941: `1`, `0`, `0`, `0`, `0`. Fixture with §Texts pasted but `pass 6 of` retyped as `pass 5 of`: third line `0`. Fixture with a second map line edited: fourth line `2` |
| U1-2 | the K17 debt row quotes the map's K17 filter byte for byte, no longer says 3 files, and line 92 is the only deleted line of debt.md | block U1-2 | `1`, `0`, `1`, `1` | at 730ff941: `0`, `1`, `0`, `0`. In the clone, `ui/counts.mjs` dropped from the map's cell with the debt row unchanged: first line `0`, so either file moving alone fails |
| U1-3 | adapter §2.1 item 1 says `reviewer-l4`, no `reviewer-l3` remains in the adapter outside the amendment paragraph that records the rename, one dated amendment paragraph names the change and the skill, line 58 is the only deleted line and the two added non-blank lines are item 1 and the amendment | block U1-3 | `0`, `2`, `1`, `1`, `2`, `1` | at 730ff941: `1`, `0`, `0`, `0`, `0`, `0`. Fixture with the amendment added and line 58 untouched: `1`, `1`, `1`, `0`, `1`, `0`. Fixture whose amendment omits the skill name: third line `0`. Fixture with a second `reviewer-l3` sentence added outside the amendment: first line `1` |
| U1-4 | the A2 verdict is untouched and the seven C31 counts the plugin repo reads hold | block U1-4 | empty line, then `18`, `18`, `19`, `31`, `1`, `7`, `19 19` | fixture with one pass 5 K row deleted: a non-empty first line and `17` second. The block is k17-rerun's U1-5 verbatim, whose controls stand |
| U1-5 | no other tracked record under `.sdlc/` gained or lost a `reviewer-l3`: the per-file hit list in the working tree equals the merge base's outside the adapter | block U1-5 | `0` | a history file rewritten in the clone's working tree, uncommitted (`sed -i '' 's/reviewer-l3/reviewer-l4/' .sdlc/plans/archive/k17-rerun.md`): `1`, and `1` again once committed. A staged `.sdlc/verdicts/records-tidy-x.md` saying `reviewer-l3`: `0` (excluded by name, and inside the wall) |

```sh U1-1
grep -c 'the U3 verdict grades it' $A
grep -c 'the newest pass in that file is the current reading' $A
N=$(grep -oE '^## Pass [0-9]+' $V | grep -oE '[0-9]+' | sort -n | tail -1); sed -n '18p' $A | grep -c "pass $N of"
git diff $MB -- $A | grep -cE '^-[^-]'
git diff $MB -- $A | grep -E '^-[^-]' | grep -c '^-Rerun note (U2 of plan records-refresh, 2026-09-19; re-measured by U3, 2026-09-19)\. '
```

```sh U1-2
CF=$(grep -E '^[|] K17 [|]' $A | grep -oE 'grep -vxE "[^"]+"'); grep -E '^[|] K17 [|]' $D | grep -cF -- "$CF"
grep -c 'the control filters 3 files by name' $D
git diff $MB -- $D | grep -cE '^-[^-]'
git diff $MB -- $D | grep -E '^-[^-]' | grep -c 'the control filters 3 files by name'
```

```sh U1-3
grep -v '^\*\*Amendment (' $AD | grep -c 'reviewer-l3'
grep -c 'reviewer-l4' $AD
grep -cE '^\*\*Amendment \(20[0-9]{2}-[0-9]{2}-[0-9]{2}\)\.\*\* Item 1 said .reviewer-l3. until this date and says .reviewer-l4. now.*pre-land-review' $AD
git diff $MB -- $AD | grep -cE '^-[^-]'
git diff $MB -- $AD | grep -cE '^\+[^+]'
git diff $MB -- $AD | grep -E '^-[^-]' | grep -c '(reviewer-l3) and'
```

```sh U1-4
git diff $MB --stat -- $V
sed -n '/^## Pass 5/,/^## Pass 6/p' $V | grep -c '^| K[0-9]'
sed -n '/^## Pass 5/,$p' $V | grep -oE '^[|] K([1-9]|1[0-8]) [|]' | sort -u | wc -l
sed -n '/^## Pass 5/,$p' $V | grep -c '^| K[0-9]'
vr=$(grep -c '^| [^-#]' $V); echo $((vr-1))
grep -c 'exception' $V | sed 's/^[2-9]/1/'
grep -c 'exception' $V
echo "$(sed -n '/^## Pass 5/,$p' $V | grep '^| K[0-9]' | grep -c 'own run') $(sed -n '/^## Pass 5/,$p' $V | grep '^| K[0-9]' | grep -c 'own plant')"
```

```sh U1-5
diff <(git grep -c 'reviewer-l3' $MB -- .sdlc | sed "s/^$MB://" | grep -v '^\.sdlc/adapter\.md') <(git grep -c 'reviewer-l3' -- .sdlc | grep -v '^\.sdlc/adapter\.md' | grep -v '^\.sdlc/\(verdicts\|handoffs\|questions\)/records-tidy-' | grep -v '^\.sdlc/plans/\(archive/\)\?records-tidy\.md') | grep -c '^[<>]'
```

U1-5's second side is `git grep` with no revision: the working tree of tracked files, so an uncommitted edit counts and the control fires before any commit. An untracked file is not read (it is not yet a record; P5 owns untracked paths). This plan's own loop records are excluded by name because the plan and the pre-land review may name the old grade when they describe the change.

## Risks and assumptions

| Risk or assumption | Handling |
|---|---|
| `origin/main` moves one of the four files before the builder edits | step 1's diff check; §Texts are replacements only at 730ff941 |
| the builder retypes a §Texts line | U1-1 line 3 and U1-2 line 1 compute against the other file; U1-3 line 3 pins the amendment's opening words |
| a pass 7 lands later and the note names pass 6 | the note's rule says "the newest pass in that file"; the number is a dated fact, per Q-A above. A standing check is the Conductor's debt row, not this plan |
| the amendment date is not 2026-09-20 | U1-3 accepts any `YYYY-MM-DD`; the builder writes the day of the edit |
| the criteria reviewer or pre-land reviewer writes `reviewer-l3` when describing the change | inside the wall by name prefix and excluded from U1-5; the adapter itself reads 0 |

## Not in scope, and why

| Left out | Why |
|---|---|
| a fifth `.sdlc/checks/` script comparing the A2 verdict with the map | approval Q1; Q-A answered above: no script, the pointer names the newest pass |
| the ten history files that say `reviewer-l3` | archived plans, graded verdicts, answered questions, a ticket status note; none is a live claim, and the amendment says so |
| any other stale line in the three files | approval Q1 names three lines |
| `.sdlc/roadmap.md` | the Conductor's; k17-rerun landed without a roadmap row and this plan follows that precedent unless the Conductor adds one in its own commit |

## Landing

One PR from `plan/records-tidy` to `main`, carrying the approval doc, this plan, U1 and the board rows. Title `chore(sdlc): records tidy, three stale lines after k17-rerun (#<ticket>)`. The door is `.sdlc/adapter.md` §2.1 as ruled (conflict row X4): pre-land dispatches `records-tidy-prepr-reviewer` (reviewer-l4) and `records-tidy-prepr-verifier` (verifier-l3), which grade U1-1 to U1-5 and P1, P4, P5 at the branch head and write `.sdlc/verdicts/records-tidy-prepr.md` with `verdict: 🟢` and the branch head sha; the record and its reviewer record stay uncommitted on the branch while the gate reads them (k17-rerun's close-out convention for concern 7) and are committed in the close-out. `adapter.py land --branch plan/records-tidy --gate .sdlc/verdicts/records-tidy-prepr.md --dry-run` proves the gate; PR body filled with the plan summary and the verdict table before ready; CI watched to `success` for `build-test` and `panda-smoke`; squash per `shipping-changes` step 7; sync per step 8. Then adapter §5: status `done`, the unit ticked, a revision row `| <date> | closed on landing of PR #<n> | last unit verified |`, the file moved to `.sdlc/plans/archive/`, board rows landed, ticket closed with `adapter.py close <id> --reason .sdlc/verdicts/records-tidy-prepr.md`.

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-20 | plan written (draft). Planner measured the three lines, the map's K17 filter, the verdict's highest pass, the adapter's grade words, every other `reviewer-l3` under `.sdlc/`, the C31 counts and the wall at 730ff941, and each U1 block on fixtures in a throwaway shared clone | k17-rerun pre-land concerns 2, 4, 6; approval Q1 |
| 2026-09-20 | revised on the criteria review (`.sdlc/verdicts/records-tidy-checkability.md` @ 8916482f, 6 of 8, U1-3 and U1-5 🔴). U1-3's first leg now counts `reviewer-l3` outside the amendment paragraph, since the amendment names the old grade and made `0` unreachable; re-measured `0 2 1 1 2 1` after, `1 0 0 0 0 0` before, `1 1 1 0 1 0` with line 58 untouched. U1-5's second side reads the working tree instead of `HEAD`, so its control fires uncommitted; re-measured `0` after and `1` on the rewritten history file, committed or not | criteria review findings; neither changed the texts or the wall |
