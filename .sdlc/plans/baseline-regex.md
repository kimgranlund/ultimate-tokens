---
status: approved
ticket: #718
priority: P1
lane: docs
size: S (U1 S = 1 point)
labels: kind:bug · size:S · lane:docs · P1
written: 2026-09-20
head: bcb7ce02693412f464951b7cbcd3a3beb6474d53 (`plan/baseline-regex` = `origin/main`, nothing pushed)
branch: plan/baseline-regex
inputs: ticket #718 (title, all four comments including the owner ruling of 2026-09-20 and the records-followup U5 verifier's narrowing correction), `.sdlc/checks/baseline-agrees-check.sh`, `.sdlc/adapter.md` §1, `.sdlc/baseline.md`
---

# The time loop reads only the first `N to M s` range in a gate's adapter cell, so a second, disagreeing range is invisible to it

`.sdlc/checks/baseline-agrees-check.sh` was added by #709 (`e9850935`) to stop the adapter's gate time ranges drifting from `.sdlc/baseline.md`. Its time loop matches each gate's adapter cell with a non-global `String.prototype.match`, which returns only the first match. A cell that carries a second `N to M s` range (the shape #718 documents: a historical figure followed by a ruled interim ceiling) is compared only on its first range; the second is never read, so the check cannot flag a cell that states two disagreeing figures. Ticket #718's own corrected scope (records-followup U5 verifier's rerun, note N4) is narrower than the issue's original title: the check is not universally vacuous, and it can and does fail on a single wrong range; the gap is specifically that a second range in the same cell is never checked. This plan fixes exactly that gap, in one file.

Out of scope, named because the issue's owner ruling raised it: giving a ruled ceiling (such as #713's interim 280 to 550 s band) its own labelled, machine-read figure instead of one inferred from `.sdlc/baseline.md`'s three-run Pass table. That is the second half of the owner's "script learns the ceiling" ruling and the `.sdlc/checks/ceiling-counts-check.mjs` work sits inside #681's U7; this plan does not touch that script or that representation question. After this fix ships, a cell that legitimately carries two different KINDS of number in one place (a frozen historical sample and a ruled ceiling) will correctly go `STALE`, because the two numbers really do disagree; that is the issue's own conclusion, not a defect this plan introduces.

## Measured by the planner at `bcb7ce02` (2026-09-20, read-only, then in throwaway clones under `$CLAUDE_JOB_DIR/tmp/`, never in this checkout's tracked tree)

| What | Result |
|---|---|
| the time loop's match call, `.sdlc/checks/baseline-agrees-check.sh:21` | `(row(a, "| " + gate + " |")[5] \|\| "").match(/(\d+) to (\d+) s/)`, no `/g`, so `String.prototype.match` returns the first match only |
| today's clean tree, real script | `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`, `stale total: 0`, exit 0 |
| reproduction (issue's own shape): in a throwaway clone, the `test` gate's adapter cell changed from `56 to 60 s` to `56 to 60 s baseline; INTERIM ceiling: 280 to 550 s wall on a host at load` (a second, disagreeing range added, nothing else touched), real (unfixed) script rerun | still `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`, `stale total: 0`, exit 0: the defect, reproduced. A cell that now states two disagreeing figures still reads clean |
| prototype fix (`matchAll(/(\d+) to (\d+) s/g)`, `ms.every(...)` in place of the single `.match`), same clean-tree clone | all five gates still `ok`, `stale total: 0`, exit 0, no regression |
| prototype fix, same planted clone (the `test` cell above) | `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s`, `stale total: 1`, exit 1 |
| prototype fix, a second, independent plant on the unrelated `build` gate (`1 to 3 s warm`, changed to `1 to 3 s warm; also 9 to 9 s cold`), unfixed script first | unfixed: `ok    time build: baseline 1 to 3 s, adapter 1 to 3 s`, exit 0 (same defect, different row); fixed: `STALE time build: baseline 1 to 3 s, adapter 1 to 3 s, 9 to 9 s`, exit 1: the fix is not a `test`-row special case |
| `node test/repo/branding.mjs` | `branding: clean (589 files scanned)` |
| `pgrep -f 'node .*test/(run\|engine\|ui)' \| wc -l` at write time | 2 to 3 throughout this session (other seats' gates already running) |

Every edited file above was a throwaway `git clone -q --shared` clone under `$CLAUDE_JOB_DIR/tmp/`, reset by deletion after each measurement; `.sdlc/adapter.md` and `.sdlc/baseline.md` in this checkout were touched only transiently (edited, rerun, `git checkout --` immediately after) to prove the reproduction and are unmodified now. This checkout is the shared root working directory several concurrent seats write to, not an isolated worktree; `git status --short` here shows this plan file plus untracked scratch from other, unrelated seats from time to time (see P5), none of it this plan's concern or this unit's to touch.

## Root cause, and what fixes it

`String.prototype.match(re)` without the `g` flag returns the first match and stops; JavaScript gives no error or warning that later matches exist. The loop was written this way in #709 for a cell shape that, at the time, only ever carried one range. #718's report and its four comments establish that a cell can now legitimately carry a second range (a frozen historical sample plus a later ruled figure, or in general any second qualifier a future edit adds), and the loop has no way to see it. The fix reads every `N to M s` occurrence in the cell with `matchAll(/(\d+) to (\d+) s/g)` and requires every one of them to equal the baseline's rounded min and max, not just the first. A single-range cell is unaffected (one match, same comparison as today); a multi-range cell now fails unless every range it states agrees with the baseline.

## Scope wall

Only these paths change against the merge base:

| Path | Who | What |
|---|---|---|
| `.sdlc/checks/baseline-agrees-check.sh` | builder-l1 | the time loop's match/predicate lines only, per §Texts; nothing else in the file |
| `.sdlc/handoffs/baseline-regex-U1.md` | builder-l1 | new |
| `.sdlc/verdicts/baseline-regex-checkability.md`, `.sdlc/verdicts/baseline-regex-U1.md`, `.sdlc/verdicts/baseline-regex-prepr.md`, and any further `.sdlc/(verdicts\|handoffs\|questions)/baseline-regex-*.md` the loop writes | criteria reviewer, verifier, pre-land | new; the name prefix is the wall |
| `.sdlc/plans/baseline-regex.md` (then `plans/archive/`), `.sdlc/board.md` | planner, Orchestrator | this plan, board rows |

Not touched: `.sdlc/adapter.md`, `.sdlc/baseline.md` (both cited, and planted only in throwaway clones for reproduction, never committed), `.sdlc/checks/ceiling-counts-check.mjs` (#681 U7's), `.sdlc/roadmap.md`, every other plan, everything outside `.sdlc/`. No em dash in any added line. Nothing added quotes the retired maker brand or the pre-rename element identifier; paraphrase both.

## Criteria (plan-level: the standing gates, run by the builder, again by the verifier, again at pre-land)

Every control that edits a file runs in a throwaway clone (`git clone -q --shared . "$CLAUDE_JOB_DIR/tmp/neg"`), never in the unit worktree. Commands are in fenced blocks; run them from the repo root with `C=.sdlc/checks/baseline-agrees-check.sh; BASE=$(git merge-base origin/main HEAD)`.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, tree byte-stable | block P1 | `✓ all 48 test files passed`, then `0` | standing repo control (adapter §1, last independently run at `d34b4fb1`, not rerun by this planner: host was at 2 to 3 concurrent test-shaped processes throughout, above the ≤1 slot the host rule allows for a fresh `npm test`): in a throwaway clone, `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`, rerun: exit 1, `refs-canonical` the one failing gate. The builder and verifier each run block P1 fresh in their own unit worktree, where this is not a limitation |
| P4 | branding gate clean | block P4 | `branding: clean (N files scanned)` (N not pinned; measured 589 today), `exit 0` | in the clone: `cp docs/reference/references/decision-records.md docs/x.md`, rerun: `FAIL: 3 branding violation(s) across N files`, N not pinned here either since concurrent seats move it, `exit 1` (measured today; the records exemption is by path) |
| P5 | scope wall: only the wall's paths differ from the merge base, tracked or untracked | block P5, run in the unit worktree (`.worktrees/baseline-regex-U1`), never in this shared root checkout | `0` in the unit worktree, which starts clean and gains only this unit's own paths | this plan was written directly in the shared root checkout, which several other seats' sessions also write to; the block read `1` (`.sdlc/questions/fable-seats-exhausted-2026-09-20.md`, pre-existing) when this plan file was first added, and `2` a few minutes later once an unrelated concurrent seat's own untracked handoff (`.sdlc/handoffs/chroma-floor-revalidation-p1.md`, not this plan's) also landed there; neither belongs to this unit's wall and neither is this unit's to touch or explain. That instability is exactly why P5 must be read from the unit worktree, not this shared checkout: in the clone, one byte on `.sdlc/adapter.md` still reads `1`; a new `.sdlc/checks/new.sh` `1`; `.sdlc/verdicts/k17-rerun-baseline-regex.md` (slug not at the start of the name) `1`; a second plan file `.sdlc/plans/baseline-regex-extra.md` `1` |
| P6 | no em dash added in prose, by the measure `records-followup` U4 established | block P6 | `0` | fixture: a `+` line under `.sdlc/` carrying U+2014 outside a backtick span counts `1`; the same byte inside a backtick span counts `0` (the strip is deliberate, so a code literal containing the glyph is never a false positive; none is added by this unit) |

`npm run build` and `npm run smoke` are not unit gates here: nothing under the build chain, `src/` or `test/` changes, P5 proves that, and CI runs both on the PR (`build-test`, `panda-smoke`), which Landing watches to `success`.

```sh P1
npm test 2>&1 | tail -1; git status --short | wc -l
```

```sh P4
bash -c 'set -o pipefail; node test/repo/branding.mjs | tail -1; echo "exit $?"'
```

```sh P5
{ git diff --name-only $BASE; git ls-files -o --exclude-standard; } | sort -u | grep -vcE '^\.sdlc/(checks/baseline-agrees-check\.sh|(verdicts|handoffs|questions)/baseline-regex-[A-Za-z0-9-]+\.md|plans/(archive/)?baseline-regex\.md|board\.md)$'
```

```sh P6
EM=$'\xe2\x80\x94'
git diff -U0 $BASE -- .sdlc | grep '^+' | perl -pe 's/\x60[^\x60]*\x60//g' | LC_ALL=C grep -o "$EM" | wc -l | tr -d ' '
```

## Units

- [ ] U1 (S) the time loop reads every `N to M s` range in a gate's adapter cell and fails when any one disagrees with the baseline · grade l1 · reviewer-l1 · verifier-l1

Grade. Small and mechanical: a four-line diff inside one `for` loop, with every criterion a grep on the file's own bytes or a real run of the shipped script against a planted clone, computed above and reproduced in both directions (defect present, then absent). There is no design judgment left open by the owner's ruling for this unit; the reconciliation question (how a ruled ceiling gets its own figure) is explicitly out of scope. `l1` matches the two closest precedents for a single-file standing-check fix of this shape and size, `k17-rerun` U1 and `records-tidy` U1, both graded `l1` for the same reason: a transcription error is caught mechanically (U1-1 grep-checks the source bytes; U1-2 and U1-3 run the real script against a real plant), so there is nothing the l2 bump exists for. Pre-land is the adapter §2.1 pair as it now stands (reviewer-l4, verifier-l3, the 2026-09-20 amendment `records-tidy` landed).

### U1 (S, grade l1)

Division of labour (the verifier writes verdict rows, the builder does not):

| Seat | Produces | Not |
|---|---|---|
| builder-l1 | the four-line edit per §Texts; `.sdlc/handoffs/baseline-regex-U1.md` with its own run of blocks U1-1 to U1-3 and P1, P4, P5, P6, `measured at <sha>` | any other line of `.sdlc/checks/baseline-agrees-check.sh`; any edit to `.sdlc/adapter.md`, `.sdlc/baseline.md`, or `.sdlc/checks/ceiling-counts-check.mjs` |
| reviewer-l1 | fresh-context read of the diff against U1-1 to U1-3 and the wall | running the plants (the verifier does) |
| verifier-l1 | `.sdlc/verdicts/baseline-regex-U1.md` grading U1-1 to U1-3, P1, P4, P5, P6, one negative control each, from its own plant runs | grading its own wording |
| Orchestrator | ticket already exists (#718); `worktrees.py add baseline-regex-U1 --plan baseline-regex`; board rows; merge; pre-land dispatch; landing; close-out | wording the fix |
| pre-land pair | U1-1 to U1-3 and P1, P4, P5, P6 again at the branch head, each with its own fresh plant | |

Steps.

1. Orchestrator: `worktrees.py add baseline-regex-U1 --plan baseline-regex` (worktree `.worktrees/baseline-regex-U1`, branch `unit/baseline-regex-U1`). If `origin/main` has moved past `bcb7ce02` under `.sdlc/checks/baseline-agrees-check.sh`, rerun §Measured; the numbers above are leads, not expected values, until then.
2. Builder: apply §Texts (the one four-line replacement inside the time loop), run blocks U1-1 to U1-3 and P1, P4, P5, P6, record them in the handoff, commit, hand off.
3. Reviewer, then verifier, in fresh context. Either running the real script on a fresh plant that disagrees with the criteria's expected `STALE`/exit-1 reading means the fix did not land as specified; the unit returns to the builder.
4. Orchestrator merges the unit and sends the branch to pre-land.

#### Texts

`.sdlc/checks/baseline-agrees-check.sh`, inside the `for` loop, replace these two lines:

```
  const m = (row(a, "| " + gate + " |")[5] || "").match(/(\d+) to (\d+) s/);
  const lo = Math.round(Math.min(...t)), hi = Math.round(Math.max(...t));
  say(t.length === 3 && t.every(Number.isFinite) && !!m && +m[1] === lo && +m[2] === hi,
    `time ${gate}: baseline ${lo} to ${hi} s, adapter ${m ? m[1] + " to " + m[2] + " s" : "none"}`);
```

with exactly:

```
  const ms = [...(row(a, "| " + gate + " |")[5] || "").matchAll(/(\d+) to (\d+) s/g)];
  const lo = Math.round(Math.min(...t)), hi = Math.round(Math.max(...t));
  say(t.length === 3 && t.every(Number.isFinite) && ms.length > 0 && ms.every((m) => +m[1] === lo && +m[2] === hi),
    `time ${gate}: baseline ${lo} to ${hi} s, adapter ${ms.length ? ms.map((m) => m[1] + " to " + m[2] + " s").join(", ") : "none"}`);
```

No other line of the file changes; the header comment's claim ("Reads files and git only: no node_modules, no network") stays true.

#### Criteria

Every "measured" value below is the planner's, 2026-09-20, at `bcb7ce02` or in a throwaway clone of it.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U1-1 | the loop uses a global `matchAll` over the cell and the old single, non-global `match` call is gone | block U1-1 | `1`, `0` | at `bcb7ce02` (before the fix): `0`, `1` |
| U1-2 | reproduction of #718 itself: a clean tree stays all-`ok`/exit 0 after the fix (no regression), and the `test` gate's adapter cell carrying a second, disagreeing range (exactly the shape #718 quotes) now goes `STALE`/exit 1 | block U1-2 | `clean tree exit: 0`; `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s`; `planted tree exit: 1` | before the fix, same two clones (this is #718 itself, reproduced by the planner): `clean tree exit: 0`; `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s`; `planted tree exit: 0` |
| U1-3 | the fix is not a `test`-row special case: the same defect shape planted on the unrelated `build` gate is also caught | block U1-3 | `STALE time build: baseline 1 to 3 s, adapter 1 to 3 s, 9 to 9 s`; exit 1 | before the fix, same clone: `ok    time build: baseline 1 to 3 s, adapter 1 to 3 s`; exit 0 |

**Plant fidelity (checkability read, 3 yellows, 0 reds, `.sdlc/handoffs/baseline-regex-checkability.md`).** `U1-2` and `U1-3` plant their second range into `.sdlc/adapter.md`, a file this unit does not own and other live seats do edit. Every plant must assert it actually changed the clone before the script runs (compare the file hash before and after, or require the substitution count to be 1); a silent no-op must read as a broken plant, never as a failed fix. `P4` no longer pins the branding file count, which drifted from 519 to 520 during the read from unrelated scratch in the shared checkout.

```sh U1-1
grep -cF 'matchAll(/(\d+) to (\d+) s/g)' $C
grep -cF '.match(/(\d+) to (\d+) s/);' $C
```

```sh U1-2
rm -rf "$CLAUDE_JOB_DIR/tmp/u1-neg-test"
git clone -q --shared . "$CLAUDE_JOB_DIR/tmp/u1-neg-test"
cd "$CLAUDE_JOB_DIR/tmp/u1-neg-test"
sh .sdlc/checks/baseline-agrees-check.sh >/dev/null 2>/dev/null; echo "clean tree exit: $?"
sed -i '' 's/56 to 60 s | builder every pass/56 to 60 s baseline; INTERIM ceiling: 280 to 550 s wall on a host at load | builder every pass/' .sdlc/adapter.md
sh .sdlc/checks/baseline-agrees-check.sh 2>&1 | grep 'time test'
sh .sdlc/checks/baseline-agrees-check.sh >/dev/null 2>/dev/null; echo "planted tree exit: $?"
cd - >/dev/null; rm -rf "$CLAUDE_JOB_DIR/tmp/u1-neg-test"
```

```sh U1-3
rm -rf "$CLAUDE_JOB_DIR/tmp/u1-neg-build"
git clone -q --shared . "$CLAUDE_JOB_DIR/tmp/u1-neg-build"
cd "$CLAUDE_JOB_DIR/tmp/u1-neg-build"
sed -i '' 's/1 to 3 s warm | builder when the unit touches/1 to 3 s warm; also 9 to 9 s cold | builder when the unit touches/' .sdlc/adapter.md
sh .sdlc/checks/baseline-agrees-check.sh 2>&1 | grep 'time build'
sh .sdlc/checks/baseline-agrees-check.sh >/dev/null 2>/dev/null; echo "exit: $?"
cd - >/dev/null; rm -rf "$CLAUDE_JOB_DIR/tmp/u1-neg-build"
```

U1-2 and U1-3 clone the unit worktree's own tracked tree (`.` at the point they run, inside the unit worktree or, for the planner and pre-land, this checkout), so they always run the script as it stands then, never a copy pasted into this plan.

## Risks and assumptions

| Risk or assumption | Handling |
|---|---|
| `origin/main` moves under `.sdlc/checks/baseline-agrees-check.sh` before the builder starts | step 1's check; §Texts is a replacement at `bcb7ce02`, not a blind patch |
| host contention blocked an independent `npm test` rerun by the planner (2 to 3 concurrent test-shaped processes throughout this session, above the host rule's ≤1 threshold for a fresh run) | P1's today reading is the standing baseline record (`.sdlc/baseline.md:19`, `.sdlc/adapter.md` §1's own negative control), not re-measured this session; the builder and verifier each run it fresh in their own unit worktree, where the constraint does not apply the same way |
| a future cell states two DIFFERENT authoritative numbers (a frozen historical sample plus a ruled ceiling) with no way to mark which one this check should read | out of scope by the owner's ruling and #681 U7; after this fix, such a cell correctly goes `STALE`, which is the issue's own stated conclusion for that case, not a new defect |
| a cell coincidentally contains a third, unrelated `N to M s`-shaped substring in free text | pre-existing risk of the regex itself, unchanged by this fix; every gate row in the tree today has at most one range, per §Measured |

## Not in scope, and why

| Left out | Why |
|---|---|
| giving a ruled ceiling (such as #713's) its own labelled, machine-read figure | the owner's ruling's second half; `.sdlc/checks/ceiling-counts-check.mjs`'s two by-construction assertions are #681 U7's; team-lead scope explicitly excludes it here |
| editing `.sdlc/adapter.md` or `.sdlc/baseline.md` | both are cited only; every edit to either in this plan's evidence ran in a throwaway clone and was never committed |
| a fourth `.sdlc/checks/` script | not asked for; the existing script's own loop is the fix's whole surface |
| R13's ceiling band (280 to 550 s) itself | context to respect, not to change; this unit does not alter what the interim ceiling states, only whether a check can see a second range at all |

## Landing

One PR from `plan/baseline-regex` to `main`, carrying this plan and the board rows. Title `fix(sdlc): baseline-agrees-check.sh reads every time range in a gate cell, not just the first (#718)`. The door is `.sdlc/adapter.md` §2.1: pre-land dispatches `baseline-regex-prepr-reviewer` (reviewer-l4) and `baseline-regex-prepr-verifier` (verifier-l3), which grade U1-1 to U1-3 and P1, P4, P5, P6 at the branch head with their own plants and write `.sdlc/verdicts/baseline-regex-prepr.md` with `verdict: 🟢` and the branch head sha; `adapter.py land --branch plan/baseline-regex --gate .sdlc/verdicts/baseline-regex-prepr.md --dry-run` proves the gate; CI watched to `success` for `build-test` and `panda-smoke`; squash per `shipping-changes` step 7; sync per step 8. Then adapter §5: status `done`, the unit ticked, a revision row, the file moved to `.sdlc/plans/archive/`, board rows landed, ticket #718 closed with `adapter.py close 718 --reason .sdlc/verdicts/baseline-regex-prepr.md`.

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-20 | plan written (draft). Planner reproduced the defect from ticket #718 directly (the `test` gate's cell planted with a second, disagreeing range; the unfixed script stayed `ok`/exit 0), prototyped and measured the fix in throwaway clones on both a clean tree (no regression) and two independent plants (`test` and `build` gates), and measured every P-row and U1 block above at `bcb7ce02` | dispatch: plan for #718, the time check cannot fail as originally scoped, narrowed by the records-followup U5 verifier's correction to "reads only the first range in a gate cell" |
