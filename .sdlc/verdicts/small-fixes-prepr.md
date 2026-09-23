---
kind: verdict
plan: small-fixes
seat: verifier
pass: 3
passes: 1 at a1a4ffc6 🔴, 2 at 434b5b58 🔴, 3 at 262ae996 🟢
pr: 735
ticket: "#717"
written: 2026-09-22
---

# Pre-PR · small-fixes · passes 1 to 3

Current finding: 🟢 at `262ae996`, in `## Pass 3` below, the block the adapter's `check_gate` reads.
Passes 1 and 2 are history: they graded `a1a4ffc6` and `434b5b58`. For the verdict, read the last block, not this one.

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
