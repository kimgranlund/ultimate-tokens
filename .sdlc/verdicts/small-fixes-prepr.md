---
kind: verdict
plan: small-fixes
seat: verifier
pass: 1
pr: 735
ticket: "#717"
written: 2026-09-22
---

# Pre-PR · small-fixes · pass 1 · 🔴 at `a1a4ffc6`

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
