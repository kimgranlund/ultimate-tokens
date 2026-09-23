---
kind: verdict
plan: small-fixes
seat: verifier
pass: 4
passes: 1 at a1a4ffc6 🔴, 2 at 434b5b58 🔴, 3 at 262ae996 🟢, 4 at f7b63f3e 🟢
pr: 735
ticket: "#717"
written: 2026-09-22
---

# Pre-PR · small-fixes · passes 1 to 4

Current finding: 🟢 at `f7b63f3e`, in `## Pass 4` below, the block the adapter's `check_gate` reads.
Passes 1 to 3 are history: they graded `a1a4ffc6`, `434b5b58` and `262ae996`; pass 3 was voided by the critic's CHANGES at `262ae996`, closed by U2. For the verdict, read the last block, not this one.

## Pass 1, at `a1a4ffc6`

verdict: 🔴
sha: a1a4ffc65ef20523982d0757feae360ee8a8c094

`plan/small-fixes` at `a1a4ffc6`, draft PR #735. The pair ran per `pre-land-review`, both fresh
context and labelled substitutes under the Conductor's R17: `reviewer-l4` as `reviewer-l3` and
`verifier-l3` as `verifier-l2`, each at opus high. Reports: `/tmp/v13/sf-prepr-review.md` and
`/tmp/v13/sf-prepr-verify.md`. Every Chrome leg ran behind the port-9333 guard, one at a time. The
review leg found the blocker, and I confirmed it from the CI log and a Node probe of my own.

It does not land: CI `build-test` is red on this exact head. The cause is one line in the test
harness, and it only shows where `TMPDIR` is unset, which is every Linux CI runner and no Mac.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| B1 | CI's three required jobs pass at this head | 🔴 | mine: `gh api .../commits/a1a4ffc6.../check-runs` gives `build-test completed failure`, and `panda-smoke` and `corpus-contrast` `success`. Run `35785765215`, smoke step: legs a to e `pass`, then `FAIL: launcher (1/6 legs failed)` and `FAIL  leaves no process or directory after a signal while discovery is still pending: child never printed a pid/dir line`. `smoke.mjs` never ran in CI | the parent `2f08e010` has all four `success`, so the call separates heads |
| B2 | the cause, U1-2 on Linux | 🔴 | `test/smoke/launcher.mjs:153` restores `process.env.TMPDIR = prevTmpdir`, and when `TMPDIR` was unset Node stores the string `"undefined"`. Mine: `env -u TMPDIR node -e '...'` prints `restored: "undefined"  os.tmpdir(): undefined`. Leg (f)'s child then fails `mkdtempSync` before it prints anything. Verify leg: `env -u TMPDIR node test/smoke/launcher.mjs` gives 5 `pass` and the same `FAIL` line as CI, exit `1` | mine: with `TMPDIR` set, the same restore gives `"/tmp/x"`. Verify leg: a clone with the restore written as `if (prevTmpdir === undefined) delete process.env.TMPDIR; else ...` gives 6 `pass`, exit `0`, under `env -u TMPDIR`. So the diagnosis is exact, not just plausible |
| B3 | P4 scope wall | 🔴 | as written it prints `2`: `.sdlc/plans/verdict-frontmatter.md` and `.sdlc/verdicts/verdict-frontmatter-prepr.md`, both from main commits (`79f8a4ed`, `50a2b03d`) after this branch last merged main. The branch edits neither. The row reads `0` only on a branch containing main, so it clears with the next main merge, which the fix needs anyway | the plan's four-name fixture prints `2` |
| P1 | `npm test` green with no `node_modules` | 🟢 | `✓ all 48 test files passed`, TESTS `48`, `0` status lines | `"scrim` renamed in a clone: `FAIL  refs-canonical`, exit `1` |
| P2 | `npm run build` green | 🟢 | exit `0`, `wrote figma/plugin/ui.html 3780.5 KB`, `0` | a missing script path: `Cannot find module`, exit `1` |
| P3 | branding, no added prose em dash | 🟢 | `branding: clean (557 files scanned)`, `0`, empty listing | a copied ADR under `.sdlc/verdicts/` gives `FAIL: 3 branding violation(s)` |
| P5 | smoke green locally and in CI | 🔴 | local: exit `0`, `SMOKE PASS` `1`, `PASS: launcher` `1`, `0`, `0`. The CI leg is B1: `PASS: launcher` `0`, `SMOKE PASS` `0` | the parent's CI log has `SMOKE PASS`, so the grep finds it where it exists |
| U1-1 | no fixed port, every exit path | 🟢 | `test/smoke/smoke.mjs:0`, `test/smoke/chrome.mjs:0`, `1`, `4`, `4`, `1`; the loop at `chrome.mjs:73-74` read | `origin/main`'s `smoke.mjs` prints `1` |
| U1-3 | a signalled run leaves no Chrome and no profile | 🟢 | guard `0`, `12` processes alive before the signal, `exit 143`, then `0`, `0` | `origin/main` clone: `exit 143`, `11` on the old needle. Reaped by the exact `pkill -9 -f 'remote-debugging-port=9333'` after a per-pid Chrome check: `9` before, `0` after |
| U1-4 | a green run leaves nothing | 🟢 | `0`, `0` | without `rmSync`: legs b to f red on the directory |
| U1-5 | a stranger on 9333 is never consulted | 🟢 | `exit 0`, `decoy requests: 0`, `1` | `origin/main`: `exit 1`, `decoy requests: 113` |
| U1-6 | CI runs the launcher before the browser | 🟢 | `1`, `1`, and the CI log shows the new script line running | `origin/main`'s `package.json` prints `0` |
| C1 | nothing ungraded lands | 🟢 | mine: all 7 blobs at `a1a4ffc6` equal the blobs at `9478d306`, the unit head I graded | a blob compared against a non-graded commit differs |
| C2 | the board is intact | 🟢 | mine: `board.md` at the head is byte-identical to `origin/main`, holds the five rows the unit's copy lacked, and is not in the PR diff. The small-fixes U1 hazard is closed | the unit head `9478d306` still counts `31` data rows against `36`, so the count separates the two |
| C3 | the merge onto main | 🟢 | `git merge-tree --write-tree origin/main a1a4ffc6`: exit `0`, no conflicts | a planted conflicting `smoke.mjs` commit gives `CONFLICT (content)`, exit `1` |
| C4 | every `.sdlc/checks/*.sh`, per adapter §2.1 | 🟢 | baseline-agrees `stale total: 0`, card-amendment `stale total: 0`, card-source-range `range mismatches: 0`, doc-drift-rows `bad 0` | each one reds on a planted fault, but see N4 on exit codes |

## What unblocks

Leg (f) passing on a host with `TMPDIR` unset, shown by a green `build-test` on a new head whose
smoke step prints 6 `pass` lines, `PASS: launcher` and `SMOKE PASS`; then a main merge so P4 reads
`0`. The CI leg of P5, and the plan's Risk row 1 (whether the runner's Chrome writes
`DevToolsActivePort` under port 0), have never been exercised, because smoke never reached the
browser in CI.

## Carried, none blocking

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | leg (f) cannot see a missing kill, and the records say it can | 🟡 | review leg: with `proc.kill` removed, the fake dies on its own when its delayed port-file write hits the removed directory, near the parent's liveness deadline. So the handoff's and round-2 review's claim that control (3) reds leg (f) is timing-dependent: the unit verification saw (f) pass, and this pass's `c3` saw it fail. Legs b to e catch a missing kill either way | both outcomes are on record from the same control, which is itself the evidence the leg is not deterministic |
| N2 | a start-up deadline no longer prints `SMOKE FAIL` | 🟡 | `await ready` at `smoke.mjs:50` sits outside the `try` at `:61`, so the deadline is an uncaught error, exit `1`. Nothing parses the old text (`git grep` finds no consumer). This is the design's `diagnosis path unchanged` held in substance, not in form | exit is still `1` and cleanup still ran (`left: 0 dirs: 0` at the unit verification) |
| N3 | a Chrome that dies before writing its port file costs the full 45 s | 🟡 | review leg: `ready` has no `proc` exit listener, so an early crash, the likeliest Linux CI failure once B1 is fixed, reports `(last: no response)` after 45 s with the exit code lost. The old code also waited 45 s, so this is not a regression. Mine: a grep for a `proc.on`/`proc.once` listener on `exit` or `error` in `chrome.mjs` at the head returns `0` | the same grep shape finds the `process.on("exit"` listener (`1`), so it detects a listener where one exists |
| N4 | two checks cannot red by exit code | 🟡 | verify leg: `card-amendment-check.sh` and `card-source-range-check.sh` print a stale count but exit `0`, because neither has an `exit $n`. Adapter §2.1 now makes every check a pre-land step, so whoever reads exit codes alone misses these two. This predates this PR, which touches neither | a planted stale card prints `stale total: 1` and exit `0`, which is the finding |
| N5 | the plan's design text is stale | 🟡 | review leg: the design says `launchChrome` resolves `{ proc, port, dir, close }` and that `onExit` comes first; the shipped shape is `{ proc, dir, close, ready }`, returned synchronously, with `onExit(close)` in the same tick. Mine: the plan at the head carries `{ proc, port, dir, close }` once, and `chrome.mjs` returns `{ proc, dir, close, ready }` | the shipped shape `proc, dir, close, ready` occurs `0` times anywhere in the plan, so no revision row records it in those words, which is narrower than the review leg's `revision 4 records the change` |

## Housekeeping from this pass

The verify leg's planted controls left nine orphaned fixture processes (`node .../sfv13/c2`, `c3`,
`c4` `.../fake-chrome.mjs`, ppid `1`). Its dispatch forbade it to kill them. They were my seat's
own, so I checked each pid's command line against that path and ended exactly those nine with
`SIGTERM`: nine terminated, `0` left. Eight `ultimate-tokens-smoke-*` directories from the same
controls remain in `$TMPDIR`. Removing them needs a recursive delete this seat was denied earlier,
so they are left for the owner.

## A correction to my small-fixes U1 verdict

That verdict graded P5 🟢 on the local run alone. The row names a CI leg in `build-test`, which I
never evidenced; the unit branch had no CI run. By this seat's rule, a criterion that cannot be
evidenced is 🔴, not 🟢. The smoke files at this head are byte-identical to `9478d306` (C1), so the
CI red is the unit's own content. The correction is appended to `.sdlc/verdicts/small-fixes-U1.md`
as its own dated pass.

## Pass 2, at `434b5b58`

verdict: 🔴
sha: 434b5b586acba1f87b9d15b3418d61e56e6f14f0

`plan/small-fixes` at `434b5b58`, U1 pass 2 merged as `cb759265`, draft PR #735. A fresh pair ran,
labelled under R17: `reviewer-l4` as `reviewer-l3` and `verifier-l3` as `verifier-l2`, both at opus
high. Reports: `/tmp/v13/sf-prepr2-review.md` and `/tmp/v13/sf-prepr2-verify.md`. The Chrome legs ran
behind the port-9333 guard. The code is fixed and green on Linux, but one pre-land row is red: the
branch adds a record that fails the verdict-frontmatter check, so landing it would turn main's check red.

### Blocker

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| B1 | every `.sdlc/checks/*.sh` green at the head (adapter §2.1 item 1) | 🔴 | verify leg, and mine in the plan worktree: `MISSING small-fixes-U1-review.md: no verdict: line`, `verdicts 82 graded 35 grandfathered 47 bad 1`, exit `1`. The file is the pass-1 FIX-FIRST review (`# Review small-fixes U1 · 🔁 FIX-FIRST`), added at `800b2c99` and absent at the pin `f685529f`, so it is graded, correctly. `origin/main` gives `bad 0`, and the squash tree equals the head tree, so the landing would carry `bad 1` to main | the verify leg's clone with one `verdict:` line added to that file: `bad 0`, exit `0`. So the one missing line is the whole of the red |

What unblocks: that file gets a `verdict:` line that states its own grade, then pre-land reruns on the
new head. The five code paths need not move, so the custody row should carry over.

### Everything else at `434b5b58`

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| C1 | nothing ungraded lands | 🟢 | mine: the 5 code paths at `434b5b58` have the same blobs as at `a9c574da`, the unit head graded 🟢 in `small-fixes-U1-p2.md`; the diff vs `origin/main` is those 5 plus 3 records | the pass-1 head `a1a4ffc6` differs on `launcher.mjs`, so the equality is specific |
| P1 | `npm test` | 🟢 | `✓ all 48 test files passed`, `48`, `0` | `scrim` to `scrimX`: `exit 1`, `FAIL  refs-canonical` |
| P2 | `npm run build` | 🟢 | `exit 0`, `wrote figma/plugin/ui.html 3780.5 KB`, `0` | a missing smoke script: `exit 1`, `Cannot find module` `1` |
| P3 | branding, no added prose dash | 🟢 | `branding: clean (575 files scanned)`, `0`; the one raw match is a backtick quote of the `SMOKE PASS` line | the plan's two plants each red |
| P4 | scope wall | 🟢 | `0`; `package.json` `1 file changed, 1 insertion(+), 1 deletion(-)` | the four-name fixture prints `2` |
| P5a | local smoke green, nothing left | 🟢 | `exit 0`, `SMOKE PASS` `1`, `PASS: launcher` `1`, procs `0`, dirs `0` | the plan gives a green run no control; U1-3's main run left `11` Chrome processes |
| P5b | CI `build-test` green on this sha | 🟢 | run `35800544251`, headSha `434b5b58`: `build-test`, `panda-smoke`, `corpus-contrast` `success`; smoke step: launcher `pass` `6`, `PASS: launcher` `1`, `SMOKE PASS` `1`. Mine: the same three `completed success` at `434b5b58` | run `35785765215` at `a1a4ffc6`: `failure`, `FAIL: launcher (1/6 legs failed)`, `SMOKE PASS` `0` |
| U1 | U1-1 to U1-12 | 🟢 | `12` rows, `12` 🟢, each rerun at the head; U1-11 at the full `20` per side: `0` of `20` leaking | each red on its plant; U1-11 at `1e25556d`: `2` of `20` leaking by processes |
| X1 | PR state | 🟢 | `434b5b58`, draft, `MERGEABLE`, `CLEAN` | the head sha compared with the target: equal |
| X2 | merge onto main | 🟢 | `git merge-tree --write-tree`: exit `0` | a planted conflict: exit `1` |
| X3 | the four other checks | 🟢 | each prints its clean figure; `card-amendment` and `card-source-range` exit `0` even when stale, so the figure is the reading | each reds its figure on a planted fault |

### Pass 1's findings, where they stand

The review leg read each at the head. Finding 1, the Linux blocker, is fixed: `setEnv` at
`launcher.mjs:31-40` deletes a variable that was unset, and CI above shows it. Findings 3, 4, 5 and 7
are fixed. Finding 6 still holds, and finding 8 is unchanged and not a gate. Finding 2 still stands in
the code (the fake's delayed write at `fake-chrome.mjs:35,39` has no `try`), and legs b to e still catch a missing kill.

### Carried, none blocking

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | F5, the bare `rmSync` at `launcher.mjs:126` | 🟡 | neither leg found a path at the head that reaches a throw; forced in the U1 pass-2 run, it loses leg c's FAIL line and the child's SIGTERM, and `0` fakes leak | without the injected fault the hung-leg path takes line 126 and prints its FAIL line, `0` fakes |
| N2 | the plan's Design text is stale | 🟡 | `small-fixes.md:56,59` still say `{ proc, port, dir, close }` and `onExit` before `launchChrome`, and `:136` names a single `rmSync`; the code returns `{ proc, dir, close, ready }` and calls `onExit(close)` after | the code at `chrome.mjs` matches neither sentence, read at the head |
| N3 | the handoff's pass-1 claims are not retracted | 🟡 | `small-fixes-U1.md:101` still says control (3) reds leg (f), and `:12-16` give a "two lines total" count; both were shown false in pass 1 | pass 1's verify leg ran control (3) and leg (f) passed |

### A correction to my small-fixes U1 pass 2 verdict

`small-fixes-U1-p2.md` graded `a9c574da` 🟢 on the unit's contract rows, and every one of them holds.
But that head already failed the verdict-frontmatter check: in the U1 run's clone at `a9c574da`
it prints `MISSING small-fixes-U1-review.md: no verdict: line`, `verdicts 81 graded 34 grandfathered 47 bad 1`.
The check was not a unit row, so the unit grade stands. I ran the check only against my own
record's name, not across the tree, so I missed the file. From now on, every unit verdict runs the
full check at the graded head.

Housekeeping: the leg's clones `/tmp/sfp2p-1790122024` and `/tmp/sfp2p-1790122024-F` are still on
disk because their delete was refused. The leg's final count: `0` smoke processes, `0` fakes, `0` on
the 9333 guard.

verdict: 🔴
sha: 434b5b586acba1f87b9d15b3418d61e56e6f14f0

## Pass 3, at `262ae996`

verdict: 🟢
sha: 262ae9966be8f89392d0e9a6eeb24d042980f8e6

`plan/small-fixes` at `262ae996`, draft PR #735. The only change since pass 2 is one record:
`git diff --numstat 434b5b58 262ae996` gives `2 0 .sdlc/verdicts/small-fixes-U1-review.md`. That is a
two-line delta to a record with no code in it, so I ran this pass myself at grade L2, which matches
my own model. I reran every row the delta could move, plus CI, in a clone at `262ae996`. Pass 2's
Chrome and unit rows carry over on custody: the five code blobs are unchanged.

The added line is `verdict: 🟢`, and it is truthful. The title reads `🔁 FIX-FIRST`, but the record's
last block, `## Round 2 · re-review at 85f6e1e5 · 🟢 PASS`, closes on `🟢 PASS`, which re-grades the
title. The record's own final grade is 🟢.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| B1 | pass 2's blocker: every `.sdlc/checks/*.sh` green | 🟢 | `verdicts 82 graded 35 grandfathered 47 bad 0`, exit `0`; the other four print `stale total: 0`, `stale total: 0`, `range mismatches: 0`, `bad 0`, each exit `0` | the added line deleted in a clone (`1 file changed, 1 deletion(-)`): `MISSING small-fixes-U1-review.md: no verdict: line`, `bad 1`, exit `1` |
| C1 | nothing ungraded lands | 🟢 | the 5 code paths at `262ae996` have the same blobs as at `a9c574da` (`same` ×5); the delta since `434b5b58` is the one record | pass 2's: `a1a4ffc6` differs on `launcher.mjs` |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 48 test files passed`, exit `0`, tree `0` | pass 2's `scrim` plant, same test path at the same code: `exit 1` |
| P3 | branding | 🟢 | `branding: clean (575 files scanned)`; the delta adds no dash | pass 2's plant: `FAIL: 3` |
| P4 | scope wall | 🟢 | `origin/main` moved to `24c22dd6` (2 records commits, `3e99fdca` and `24c22dd6`); against the merge base `b641c159` the filter prints `0` | the four-name fixture prints `2` (pass 2) |
| P5b | CI green on this sha | 🟢 | run `35803212101`, headSha `262ae996`, `success`: `build-test`, `panda-smoke`, `corpus-contrast` `success`; build-test log: launcher `pass` `6`, `PASS: launcher` `1`, `SMOKE PASS` `1`, `FAIL: launcher` `0` | run `35785765215` at `a1a4ffc6`: `FAIL: launcher (1/6 legs failed)`, `SMOKE PASS` `0` |
| X1 | PR state | 🟢 | `262ae996`, draft, `MERGEABLE`, `CLEAN` | the head sha compared with the target: equal |
| X2 | merge onto the moved main | 🟢 | `git merge-tree --write-tree origin/main 262ae996`: exit `0`, tree `7f1f9292` | main plus a planted `const PORT = 9334` commit (`7ef89a10`): `CONFLICT` `1`, exit `1` |
| X3 | the post-squash tree | 🟢 | tree `7f1f9292` read into a scratch worktree: `verdicts 83 graded 36 grandfathered 47 bad 0` | the B1 control shows the same check reds a missing line |
| U1 | P2, P5a, U1-1 to U1-12 | 🟢 | carried from pass 2 on custody: `12` unit rows 🟢, U1-11 `0` of `20` | pass 2's controls, same blobs |

Carried unchanged from pass 2, none blocking: N1 (F5, the bare `rmSync` at `launcher.mjs:126`), N2
(the plan's stale Design text at `small-fixes.md:56,59,136`), N3 (the handoff's unretracted pass-1
claims). They belong to the plan's close-out.

verdict: 🟢
sha: 262ae9966be8f89392d0e9a6eeb24d042980f8e6

## Pass 4, at `f7b63f3e`

verdict: 🟢
sha: f7b63f3e08b418d0cb6b9f4b3649d31813659569

`plan/small-fixes` at `f7b63f3e` (U1 merged `cb759265`, U2 merged `f7b63f3e`), draft PR #735, plan revision 9 as on main `e379a38b`. Graded by a verifier-l3 seat, read-only, in its own detached worktree `scratchpad/sfp4-wt-Q7mv` at the head with no `node_modules` for `npm test` and a symlink to the root checkout's `node_modules` for build and smoke, removed after; clones under `scratchpad/sfp4-F-Q7mv` (`mut`, `nospawn`, `old` at the head; `old` re-pointed to `262ae996` for the critic reproduction; `main` at `origin/main` `5ff67416`; `p2h` at `1e25556d`; `sqw` holding the squash tree), each made from a commit (`git -C <clone> log -1 --format=%h` printed the expected sha), all removed by exact name after. Every real-browser and launcher run under its own `TMPDIR=$(mktemp -d "$F/tmp-XXXX")`. Diffs are the three-dot `origin/main...f7b63f3e` (merge base `b641c159`). Load `9.64 5.88 4.93` at start (19:45), `4.97 4.86 4.67` at end (20:11). Host after: fakes `0`, grandchildren `0`, port-9333 Chrome `0`, smoke Chrome `0`, root tree `0` status lines, no `sfp4` worktree or directory left. Every row below was rerun at the head, none copied from a unit verdict.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | 🟢 | `exit 0`, `✓ all 48 test files passed`, TESTS `48`, `git status --short \| wc -l` `0` | pass 2's `scrim` plant on the same runner: `exit 1`, `FAIL  refs-canonical`; this pass's P2 control below shows the same `npm` chain reds on a missing file, `exit 1` |
| P2 | `npm run build` green, tree clean after | 🟢 | `exit 0`, `wrote figma/plugin/ui.html 3780.5 KB`, `0` | clone `mut` at `f7b63f3e` with `node test/smoke/missing.mjs &&` spliced into `scripts.smoke` (`1 file changed, 1 insertion(+), 1 deletion(-)`): `npm run smoke` `exit 1`, `Cannot find module` `1` |
| P3 | branding clean, no added prose line carries an em dash | 🟢 | `branding: clean (577 files scanned)`, pipe status `0`; backtick-stripped dash count over added lines `0`; the raw listing (handoffs excluded) has one line, the U1 pass-2 review's P5a cell quoting the `SMOKE PASS` line of `smoke.mjs:299` inside a backtick span, a program quote; the U2 delta adds no dash outside a backtick span | the raw listing does match the one quoted line, so the filter finds a dash where one exists; pass 2's copied-ADR plant reds the branding scan (`FAIL: 3`) |
| P4 | scope wall: the unit files, the plan's own records, the board, nothing else | 🟢 | `git diff --name-only origin/main...f7b63f3e` through the plan's filter: `0`; the 10 files are `package.json`, the 4 `test/smoke/` files, and 5 `.sdlc/{handoffs,verdicts}/small-fixes-*` records; `package.json` `1 file changed, 1 insertion(+), 1 deletion(-)` | the plan's four-name fixture through the same filter prints `2` |
| P5a | `npm run smoke` green locally, the launcher ran, this run's Chrome and profile gone | 🟢 | `TMPDIR="$T" npm run smoke`: `exit 0`, `SMOKE PASS` `1` (log line 139, source `smoke.mjs:299`), `PASS: launcher` `1`; 5 s later procs `0`, dirs `0`, grandchildren `0`; tree `0` | U1-3's `origin/main` control: `11` Chrome processes after a signalled run; U1-11 control B: `11` processes 5 s after a green run with the kill skipped |
| P5b | CI green on this sha | 🟢 | `gh pr view 735` headRefOid `f7b63f3e08b418d0cb6b9f4b3649d31813659569`; run `35811559304` `completed success`, check-runs at the sha: `build-test` `success`, `panda-smoke` `success`, `corpus-contrast` `success` (`deploy` skipped); the `build-test` log (536 lines): launcher `  pass  ` `6`, `PASS: launcher` `1`, `SMOKE PASS` `1`, `FAIL: launcher` `0`, `all 48 test files passed` `1` | run `35785765215` at `a1a4ffc6`: `failure` (the pass-1 red), so the same read separates heads |
| U1-1 | no fixed port, discovery from the profile file, every exit path handled | 🟢 | `test/smoke/smoke.mjs:0`, `test/smoke/chrome.mjs:0`, `1`, `4`, `5`, `1`; `chrome.mjs:106` `SIGNAL_CODES = { "SIGHUP": 129, "SIGINT": 130, "SIGTERM": 143 }` registered in one loop | `origin/main`'s `smoke.mjs` prints `1` on the first grep (`const PORT = 9333`) |
| U1-2 | the launcher test is green and every leg ran | 🟢 | `exit 0`, `6`, `0`, `PASS: launcher discovers its port from DevToolsActivePort and leaves no process on close, SIGTERM, SIGINT or deadline`; after: grandchildren `0`, fakes `0`, dirs `0` | three clones at the head, `1 file changed` each: (1) `removeDir`'s `rmSync` replaced by `lastErr = null`: `exit 1`, `pass=1 FAIL=5`, every FAIL on `profile dir ... still present`, `5` dirs left; (2) `"SIGTERM": 143` dropped from `SIGNAL_CODES`: `exit 1`, `pass=4 FAIL=2`, legs (c) and (f) `fake pid ... still alive 2s after SIGTERM`; (3) the kill in `close()` skipped: `exit 1`, `pass=1 FAIL=5`, `fake pid ... still alive` on (b) to (e) and `grandchild pid ... still alive` on (f) |
| U1-3 | a signalled real-browser run leaves no Chrome and no profile | 🟢 | guard 9333 `0`; `12` processes alive before the signal; `exit 143`; 5 s later procs `0`, dirs `0` | the `origin/main` clone, built, same run: `exit 143`, old needle `11`; reaped by `pkill -9 -f 'remote-debugging-port=9333'`, `0` after |
| U1-4 | a green run leaves no Chrome and no profile directory | 🟢 | P5a's last two figures `0`, `0`; U1-11's twenty green runs `0` dirs and `0` procs each | U1-11 control A (no `rmSync`) leaves dirs `1`; control B (no kill) leaves dirs `1`, procs `11` |
| U1-5 | a stranger on 9333 is never consulted | 🟢 | guard `0`; decoy up; `exit 0`, `decoy requests: 0`, `SMOKE PASS` `1` | the `origin/main` clone against the same decoy: `exit 1`, `decoy requests: 113`, `SMOKE PASS` `0`, `smoke threw: Chrome CDP did not come up within 45s (last: HTTP 404)` |
| U1-6 | CI runs the launcher test before the browser | 🟢 | `package.json` script grep `1`; `ci.yml` `npm run smoke` `1`; the CI log shows 6 launcher legs before `SMOKE PASS` | `origin/main`'s `package.json` prints `0`; P2's control reds the chain on a missing file |
| U1-7 | the launcher is green with `TMPDIR` unset, nothing under the default temp root | 🟢 | `env -u TMPDIR node test/smoke/launcher.mjs`: `exit 0`, `6`, leftovers under `/tmp` `0` | U1-9's clone gives leg (f)'s child `TMPDIR=/nonexistent`: `exit 1`, `mkdtemp '/nonexistent/...'` `ENOENT`, so a temp root the child cannot use reds the run rather than passing |
| U1-8 | the launcher is green on Linux, `TMPDIR` unset | 🟢 | `docker info` up; `docker run --rm ... node:24 sh -c 'node test/smoke/launcher.mjs'`: `exit 0`, `6` | the U2-2 mutant in the same image: `exit 1`, `pass=1 FAIL=5`, `grandchild` `5` |
| U1-9 | a signal-leg red names the child's own error | 🟢 | clone with `TMPDIR: "/nonexistent"` in leg (f)'s child env (`1 file changed`): `exit 1`, `ENOENT` `1`, the FAIL line carries `child stderr: Error: ENOENT: no such file or directory, mkdtemp '/nonexistent/ulti...` | the unedited head under the same `TMPDIR`: `ENOENT` `0` |
| U1-10 | leg (e) cannot pass with `pgrep` absent | 🟢 | Docker `node:24` with `/usr/bin/pgrep` moved away: `FAIL  leaves no process or directory after a deadline with no DevToolsActivePort: pgrep could not check for a leftover process (ENOENT), so this leg cannot pass` | the same image with `pgrep` in place (U1-8): leg (e) `pass`, `6` of `6` |
| U1-11 | close() leaves no profile directory and no Chrome process, every time | 🟢 | twenty consecutive real-Chrome green runs at the head, each with its own `T`: every run `exit 0`, `SMOKE PASS` `1`, dirs `0`, procs `0`; `0` of `20` leaking (runs 1 to 10 and 11 to 20 as two sequences) | the plan's timing control, twenty runs at `1e25556d`: `0` of `20` this pass (it fired `2` of `20` in pass 2, `3` of `30` in the round-2 review; N5 below). Two deterministic real-Chrome controls at the head, one run each, same command shape: A, `removeDir`'s `rmSync` removed: `exit 0`, `SMOKE PASS` `1`, dirs `1`, procs `0`; B, the kill in `close()` skipped: dirs `1`, procs `11`, reaped by this run's own needle to `0` |
| U1-12 | a signal leg that times out leaves no fake Chrome behind | 🟢 | clone at the head whose `--child` swallows `SIGTERM` and `SIGINT` instead of calling `onExit(close)` (`1 file changed`): `exit 1`, legs (c) and (d) FAIL `--child had not exited 5s after start`; 2 s later fakes `0`, grandchildren `0` | the same edit at `1e25556d` (`p2h`): `exit 1`, the same two FAIL lines, fakes `2`; reaped by exact pattern |
| U2-1 | the launcher stays green with the grandchild asserts | 🟢 | U1-2's figures at the head: `exit 0`, `6`, `0`, the `PASS:` line byte for byte; `env -u TMPDIR` `exit 0`, `6`; Docker `exit 0`, `6` | U2-2's mutant: `exit 1`, `pass=1 FAIL=5` |
| U2-2 | the parent-only kill reds on every exit path (the critic's CHANGES point, closed) | 🟢 | clone `mut` at `f7b63f3e`, `chrome.mjs:66` `process.kill(-proc.pid, "SIGKILL")` replaced by `proc.kill("SIGKILL")` (`1 file changed, 1 insertion(+), 1 deletion(-)`): `exit 1`, `pass=1 FAIL=5 grandchildFAIL=5`: `leg (b): grandchild pid 67636 still alive 2s after close()`, `leg (c): ... after SIGTERM`, `leg (d): ... after SIGINT`, `leg (e): ... after the deadline`, `leg (f): ... after SIGTERM` | clone `old` at `262ae996` with the same one-line mutant (`1 file changed, 1 insertion(+), 1 deletion(-)`): `exit 0`, `pass=6 FAIL=0`, the critic's finding reproduced at the sha it was filed on |
| U2-3 | the grandchild is really spawned and really in the group | 🟢 | `pgrep -f fake-chrome-grandchild \| wc -l` right after the mutant run: `6` (reaped by `pkill -9 -f fake-chrome-grandchild`, `0` after); after every head run `0`; it read `0` before the suite | clone `nospawn` with the fixture's spawn statement deleted (`1 file changed, 1 deletion(-)`): `exit 1`, `pass=1 FAIL=5`, `pid file missing` `5`; after: grandchildren `0`, fakes `0`, dirs `0` |
| U2-4 | U1-7 and U1-8 still hold | 🟢 | `env -u TMPDIR`: `exit 0`, `6`, `0`; Docker `node:24` via `sh -c`: `exit 0`, `6` | the mutant in Docker: `exit 1`, `pass=1 FAIL=5 grandchild=5` |
| U2-5 | scope of the unit | 🟢 | `git diff --stat 262ae996...f7b63f3e -- . ':!.sdlc'`: `test/smoke/fixtures/fake-chrome.mjs \| 12`, `test/smoke/launcher.mjs \| 80`, `2 files changed, 78 insertions(+), 14 deletions(-)` | the `mut` clone's working tree: `1 file changed` on `test/smoke/chrome.mjs`, which the same diff would list as a third file |
| U2-6 | `npm test` and `npm run smoke` green on the head, tree clean after | 🟢 | P1 and P5a above; `git status --short \| wc -l` `0` after each | P2's control: `exit 1`, `Cannot find module` `1` |
| C1 | nothing ungraded lands | 🟢 | the 5 code blobs at `f7b63f3e` equal the blobs at `0dd91819`, the U2 unit head graded 🟢 in `small-fixes-U2.md` (`same` ×5); `smoke.mjs`, `chrome.mjs`, `package.json` also equal `262ae996` (pass 3) | `launcher.mjs` and `fake-chrome.mjs` read `DIFF` against `262ae996`, so the comparison separates the U2 delta from the pass-3 blobs |
| X1 | PR head and state | 🟢 | `gh pr view 735`: headRefOid `f7b63f3e08b418d0cb6b9f4b3649d31813659569`, `OPEN`, draft, base `main`, `MERGEABLE`, `CLEAN`; re-read after the last run, unchanged | pass 3's head `262ae996` differs from the target sha, so the string compare is not vacuous |
| X2 | merge onto main | 🟢 | `git merge-tree --write-tree origin/main f7b63f3e`: `exit 0`, tree `ed4af25c` | `origin/main` plus a planted `const PORT = 9334` commit (`0cf95c6e`) merged with the head: `exit 1` (the branch deletes that line) |
| X3 | every `.sdlc/checks/*.sh` green at the head and on the squash tree | 🟢 | at the head: `stale total: 0`, `stale total: 0`, `range mismatches: 0`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, `verdicts 83 graded 36 grandfathered 47 bad 0`, each `exit 0`; tree `ed4af25c` read into a scratch worktree (`git write-tree` confirms it): the same five, `verdicts 87 graded 40 grandfathered 47 bad 0`, each `exit 0` | in the squash worktree with the `verdict: 🟢` line dropped from `small-fixes-U2-review.md`: `MISSING small-fixes-U2-review.md: no verdict: line`, `bad 1`, `exit 1` |
| X4 | no `.claude/docs/other`, no `node_modules` in the diff | 🟢 | `git diff --name-only origin/main...f7b63f3e \| grep -c -E '^(\.claude/docs/other\|node_modules)/'` `0` | a three-name fixture with one path from each forbidden root through the same grep prints `2` |

The critic's CHANGES point at `262ae996` (issuecomment-5787113504) is closed: U2-2 shows the group-kill reverted to a parent-only kill reds five legs at the head, each naming the grandchild, and the same mutant at `262ae996` passes 6 of 6, which is the finding as filed.

### Carried, none blocking

| # | Item | State | Evidence | Negative control |
|---|---|---|---|---|
| N1 | F5, the bare `rmSync` in the launcher's timeout handler | 🟡 | now at `launcher.mjs:163`, inside the `if (fakePid != null)` block; U1-12 shows the timeout path leaves `0` fakes at the head | U1-12's control at `1e25556d` leaves `2` |
| N2 | the plan's Design text is stale | 🟡 | `small-fixes.md` Design still says `{ proc, port, dir, close }` and `onExit` before `launchChrome`; `chrome.mjs` returns `{ proc, dir, close, ready }` | `proc, dir, close, ready` occurs `0` times in the plan |
| N3 | the U1 handoff's pass-1 claims are not retracted | 🟡 | `small-fixes-U1.md` still says control (3) reds leg (f) | this pass's control (3) did red leg (f), on the grandchild, so the claim is now true for a different reason |
| N4 | bold inline labels in a record | 🟡 | 7 added lines carry `**`; 4 in `.sdlc/handoffs/small-fixes-U1.md` are labels (`**The fix**`, `**Leg (f)**`, `**Everything below this line ...**`, `**297**`), present since pass 2; the other 3 are backtick spans quoting the literal. Not a plan row; close-out prose | the U2 delta's own added lines carry `0` labels, the same grep over the U2 range |
| N5 | U1-11's plan control did not fire this pass | 🟡 | twenty runs at `1e25556d` on this host at load 4 to 5: `0` of `20` leaking; the race the row targets is timing-dependent, as revision 8 already says | the two deterministic controls in the U1-11 row bite on one run each, so the row's readings are live |

The review side of this pass: `reviewer-l4` (small-fixes-prepr-reviewer-l4-p4), fresh context on `origin/main...f7b63f3e`, `verdict: PASS` read as 🟢, 10 gate rows 🟢 and 6 close-out notes 🟡: the stale second-poll comment at `smoke.mjs:64-74`, the double `child_process` import in `launcher.mjs`, and the stale plan Design text (N2 above). CI run `35811559304` is green on all three jobs at `f7b63f3e`.

verdict: 🟢
sha: f7b63f3e08b418d0cb6b9f4b3649d31813659569
