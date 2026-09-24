---
kind: verdict
plan: small-fixes
unit: U1
ticket: "#717"
branch: unit/sf-U1p2
base: plan/small-fixes @ bbaf8a6b
grade: verifier-l3, the evidence run dispatched by the Verifier seat, which re-derived the rows marked mine
contract: plan revisions 6 to 8, P1 to P4, P5a, U1-1 to U1-12; P5b is pre-land's
pass: 2
written: 2026-09-22
---

# Verdict small-fixes U1 pass 2 · 🟢 · 17 of 17 rows 🟢, P5b left to pre-land, review F5 carried 🟡

verdict: 🟢
sha: a9c574da59e43946ad423c37b41faee8e42d26cb

`unit/sf-U1p2` at `a9c574da`. The evidence run's full report is at `/tmp/v13/sfp2-verify.md`, with
clones and logs in `/tmp/sfp2v-1790119818`. The worktree was only read and is still clean.

What was graded. `git diff --stat 73d5f6f4 a9c574da -- test/ package.json` is empty, so the code is
exactly what review round 2 passed. The 15 paths changed since then are all `.sdlc/` records. The
shape check (`verdict.py check`) exits `0` on the handoff and both U1 review records.

Revision 8, written before any pass-2 verdict (`de18ef0a`, 16:28, after the 15:49 unit head), makes
U1-11 count a leak as a directory or a process. It is stricter on the head, which must now read
`0` on both counts, and it repairs the control rather than bending it: at `1e25556d` this run found
directories `0` of `20`, so a directory-only control would not have reddened.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test` green, no `node_modules`, count agrees, tree stable | 🟢 | `exit 0`, `✓ all 48 test files passed`, TESTS `48`, tree `0` | `scrim` to `scrimX` in `role-table.json`: `exit 1`, `engine/semantic.mjs FAIL` |
| P2 | `npm run build` green, tree clean | 🟢 | `exit 0`, `wrote figma/plugin/ui.html 3780.5 KB`, `0` | a smoke script naming a missing file: `exit 1`, `Cannot find module` `1` |
| P3 | branding clean, no added prose em dash | 🟢 | `branding: clean (570 files scanned)`, `0`; the third command lists `1` line, a backtick quote of the `SMOKE PASS` line | a copy of `decision-records.md` as a verdict: `FAIL: 3 branding violation(s)`; one added prose dash line: `1` and `2` |
| P4 | scope wall | 🟢 | run: filter `0` against `origin/main` `de18ef0a`, which the branch contained; `package.json` `1 file changed, 1 insertion(+), 1 deletion(-)`. Mine, later: `origin/main` moved to `f141fd89` (2 commits, 4 records of other plans), the two-dot filter lists those 4, the three-dot filter prints `0`, `git merge-tree` exit `0` | the four-name fixture prints `2` |
| P5a | local `npm run smoke` green, nothing left | 🟢 | `exit 0`, `SMOKE PASS` `1`, `PASS: launcher` `1`, procs `0`, dirs `0` at +5 s | the plan gives a green run no control; U1-3's main run (`9` Chrome processes) and U1-11's control (`3` of `20`) are the discriminating rows |
| U1-1 | no fixed port, discovery from the profile file, every exit path | 🟢 | `test/smoke/smoke.mjs:0`, `test/smoke/chrome.mjs:0`, `1`, `4`, `5`, `1`; the registrations are the `exit` call and the loop at `chrome.mjs:109-111` | `origin/main` smoke.mjs: `1` (`const PORT = 9333`, `:44`); `chrome.mjs` absent |
| U1-2 | the launcher test green, every leg ran | 🟢 | run and mine: `exit 0`, pass `6`, FAIL `0`, the plan's `PASS: launcher ...` line | four one-line clones, each `exit 1`: `rmSync` removed (pass `1`, b to f red on dir), `SIGTERM` entry renamed (pass `4`, c and f red on the live fake), `kill` made a probe (pass `2`), leg f's `onExit(close)` a no-op (pass `5`, f red) |
| U1-3 | a signalled real run leaves nothing | 🟢 | `exit 143`, procs `0`, dirs `0` at +5 s | `origin/main` built: `exit 143`, `9` processes on the old needle, `1` listener; reaped `9` |
| U1-4 | a green run leaves nothing | 🟢 | P5a `0`, `0`; U1-11 head `0` of `20` both counts | U1-11 control `3` of `20` processes; the `rmSync` clone at launcher level |
| U1-5 | a stranger on 9333 is never consulted | 🟢 | `exit 0`, `decoy requests: 0`, `SMOKE PASS` `1` | `origin/main`: `exit 1`, `decoy requests: 113`, `smoke threw: Chrome CDP did not come up within 45s (last: HTTP 404)` |
| U1-6 | CI runs the launcher before the browser | 🟢 | `1`, `1` | P2's control, the script line is live |
| U1-7 | green with `TMPDIR` unset, nothing left under the default root | 🟢 | run and mine: `exit 0`, pass `6`, leftovers `0`; a planted probe dir makes the count `1` | pass 1's line restored: `exit 1`, `5`, the FAIL line carries `mkdtemp 'undefined/ultimate-tokens-smoke-XXXXXX'` |
| U1-8 | green on Linux, `TMPDIR` unset | 🟢 | `node:24` container, `TMPDIR=<unset> Linux v24.21.0`: pass `6`, `exit 0` | the U1-7 control clone in the same container: `exit 1`, `5` |
| U1-9 | a signal-leg red names the child's own error | 🟢 | `TMPDIR: "/nonexistent"` for leg f: `ENOENT` `1`, in the FAIL line | the same edit at `b57b4658`: `0`, the line stops at `child never printed a pid/dir line` |
| U1-10 | leg (e) cannot pass with `pgrep` absent | 🟢 | container with `pgrep` moved: `FAIL ... pgrep could not check for a leftover process (ENOENT), so this leg cannot pass` | the same at `b57b4658`: `pass  leaves no process or directory after a deadline` |
| U1-11 | nothing left, 20 of 20 (revision 8) | 🟢 | 20 consecutive real runs, own `T` each: `exit 0` `20` of `20`, dirs `0` of `20`, procs `0` of `20` | the same 20 at `1e25556d`: dirs `0`, procs `3` of `20` (runs 15, 19, 20), so `3` of `20` on either count |
| U1-12 | a timed-out signal leg leaves no fake | 🟢 | leg (c) made to hang: its FAIL line, then fake-chrome `0`, launcher children `0` | the same edit at `1e25556d`: `1` fake alive |
| P5b | `build-test` green on the graded sha | out of scope | revision 6 moves it to pre-land; not graded here | none |

## Carried

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| F5 | the bare `rmSync` in the timeout handler, `launcher.mjs:126` | 🟡 | the head cannot reach a throw: the fake is killed at `:125` and is the only writer. Forced in a clone (the child ignores SIGTERM, a file in `dir` gets `chflags uchg`): uncaught `ENOTEMPTY`, `exit 1`, leg (c)'s FAIL line lost, legs d to f never run, `child.kill("SIGTERM")` at `:128` never reached. The fake still does not leak (`0`); a child holding another handle stays alive (`1`) | without the injected flag, the same hung-leg path (the U1-12 clone) takes line 126 and prints its FAIL line normally, `0` fakes |

Housekeeping: the run reaped every process its controls orphaned, by pid under its clone path, and
removed its own profile dirs. Final count: `0` fake-chrome processes, `0` smoke processes, `0` on the
9333 guard. The Mac `TMPDIR` still holds `31` `ultimate-tokens-smoke-*` dirs from older seats, as
before this run.

verdict: 🟢
sha: a9c574da59e43946ad423c37b41faee8e42d26cb
