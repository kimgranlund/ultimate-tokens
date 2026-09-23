---
kind: review
plan: small-fixes
unit: U1
ticket: "#717"
pass: 2
grade: reviewer-l4 (worker `sf-U1-reviewer-l4-p2`)
head: 1e25556d (`unit/sf-U1p2`, code head `1d97d568`, base `b57b4658`)
scope: the pass-2 diff `git diff b57b4658..1e25556d` (`test/smoke/chrome.mjs`, `launcher.mjs`, `smoke.mjs`, the handoff)
written: 2026-09-22
---

# Review U1 pass 2 · 🔴 FIX-FIRST

Every command ran from `git clone -q --shared` clones under `/Users/kimba/.claude/jobs/8c58a81c/tmp/sfp2r/` (`C`, `B` at `1e25556d`; `p1`, `np1` at `b57b4658`; `old` at `origin/main` `70c2d5e5`; `n1` to `n43` at `1e25556d` with the one-line edit each row names, every `git diff --stat` reading `1 file changed`). The worktree was never edited: `git status --short | wc -l` prints `0` at `1e25556d`. `T` is a fresh `mktemp -d` per real-browser run, `S` the clone root. Docker Desktop was up (`docker info`), the image `node:24` printed `TMPDIR=<unset> Linux v24.21.0`. The 9333 guard printed `0` before every Chrome row.

## The one red

The pass-2 code is right for what it set out to fix (every row below that names Linux, `TMPDIR`, stderr or `pgrep` is 🟢). The red is on rows the plan already carried: a real-Chrome run, signalled or green, leaves its profile directory behind about one time in four on this Mac, at the head and at the pass-1 head alike. `close()` (`chrome.mjs:40-44`) sends `SIGKILL` to the browser and calls `rmSync` in the same tick; a Chrome helper (the network service, which is its own process and not the one `SIGKILL`ed) is still writing `Default/TransportSecurity` or `Default/Network Persistent State` through its atomic-write temp file, recreates `Default/` mid-deletion, `rmSync` gets `ENOTEMPTY` and the `catch { /* already gone */ }` swallows it. Five seconds later no process matches the needle (the helper did exit) and the directory holds exactly that one temp file. This is the plan's Risk row 3 and the re-diagnosis 4.4, which called it "not testable here": it is, and it fires here.

| Run | Where | Signalled runs leaving a dir | Green runs leaving a dir | What was left |
|---|---|---|---|---|
| R1 | head `B`, first U1-3 run, under the load of a parallel `npm run build` | `1` of `1` | | `Default/.com.google.Chrome.canary.Network Persistent State.5NKQvN` |
| R2 | head `B`, U1-5's green run, same load | | `1` of `1` | `Default/.com.google.Chrome.canary.TransportSecurity.sNCFnz` |
| R3 | head `B`, serial, host load average `5` to `6` | `0` of `5` | `1` of `3` | `Default/.com.google.Chrome.canary.TransportSecurity.MHMNPA` |
| R4 | pass 1 `p1` (`dist/` copied from `B`), serial | `2` of `6` | | `TransportSecurity.j74LeN`; `TransportSecurity.M8LLsd` and `Network Persistent State.Hq1oh7` in one dir |

Total: `5` of `17` real-Chrome runs left a directory, every one with `0` processes at 5 s and `exit 143` or `exit 0` as expected. The rows U1-3, U1-4 and P5a expect `0` directories, so a single run reading `0` (as pass 1's builder, reviewer and verifier each measured once) is not evidence the row holds; it holds three runs in four.

Fix direction, for the builder (the plan's Risk row 3 already names the first half): `close()` must stay synchronous (the signal path calls `process.exit` right after it), so after `proc.kill("SIGKILL")` retry `rmSync` while `existsSync(dir)` with a short blocking wait between tries (`Atomics.wait` on a `SharedArrayBuffer`, ~50 ms, up to ~2 s), and stop swallowing the last error. `SIGTERM` first then `SIGKILL` alone does not close it: the helper is not the process being signalled. Whichever shape, U1-3 and U1-4 need a repeat count in their Expected cell (`0` of `5`, say), because a race is only measured by repetition.

## Criteria at `1e25556d`

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, count agrees, tree byte-stable | 🟢 | in `C` (no `node_modules`): `✓ all 48 test files passed`, `48`, `0` | clone `np`, `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json` (`1 file changed, 7 insertions(+), 7 deletions(-)`): `exit 1`, `▶ engine/semantic.mjs      FAIL` |
| P2 | `npm run build` green, tree clean after | 🟢 | in `B` with `node_modules` symlinked read-only from the root checkout: `exit 0`, `wrote figma/plugin/ui.html 3780.5 KB`, `0` | clone `np2`, `smoke` script gains `node test/smoke/missing.mjs &&` (`1 file changed, 1 insertion(+), 1 deletion(-)`): `npm run smoke` `exit 1`, `Cannot find module` count `1` |
| P3 | branding clean, no added prose em dash | 🟢 | in the worktree at `1e25556d`: `branding: clean (561 files scanned)`, `0`, `0`; the third command's listing is empty (the `SMOKE PASS` quotes live in the excluded handoff) | the second command's perl on a one-line file holding a bare U+2014 (`dash.txt` under `S`) prints `1`, and on this document prints `0` (`branding: clean (562 files scanned)` with this file present); the copied-record control was not rerun, the commands are unchanged since pass 1 |
| P4 | scope wall against `origin/main` | 🟡 as measured | `origin/main` at `70c2d5e5`: filter prints `2`, `.sdlc/plans/verdict-frontmatter.md` and `.sdlc/verdicts/verdict-frontmatter-U3.md`, both main's own; `package.json` stat ` 1 file changed, 1 insertion(+), 1 deletion(-)`. The pass-2 diff `git diff --name-only b57b4658..1e25556d` lists exactly `.sdlc/handoffs/small-fixes-U1.md`, `test/smoke/chrome.mjs`, `test/smoke/launcher.mjs`, `test/smoke/smoke.mjs`, all in scope | the plan's four-name fixture printed `2` at revision 2 and the filter text is unchanged (diffed by eye against the plan row); the `2` here is the branch behind main, the Orchestrator's rebase, not a scope hit |
| P5a | `npm run smoke` green locally, launcher ran, this run's Chrome and profile gone | 🟡 | in `B`, `TMPDIR="$T"`: `exit 0`, `1`, `1`, `0`, `0`, the line `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser` at `smoke.mjs:299`. Green on this run; R2 and R3 show the last figure reads `1` on `2` of `4` green runs | U1-3's `origin/main` control: `11` Chrome processes after a signalled run |
| P5b | `build-test` green on the graded sha | ⚪ | not graded here, pre-land per revision 6 | none |
| U1-1 | no fixed port, discovery from the profile file, every exit path handled | 🟢 | worktree greps: `test/smoke/chrome.mjs:0`, `test/smoke/smoke.mjs:0`, `1`, `4`, `5`, `1` (the fifth is `5` because `proc.once("exit", ...)` at `chrome.mjs:51` matches `"exit"`; the four registrations are still `onExit`'s `process.on("exit")` plus the `SIGNAL_CODES` loop at `chrome.mjs:81-86`) | clone `old` at `70c2d5e5`: first grep `1`, `ls: test/smoke/chrome.mjs: No such file or directory` |
| U1-2 | launcher green, every leg ran | 🟢 | in `C`: `exit 0`, `6`, `0`, `PASS: launcher discovers its port from DevToolsActivePort and leaves no process on close, SIGTERM, SIGINT or deadline` | four clones, each `exit 1`: `n1` `rmSync` line deleted, `5` FAIL on `profile dir ... still present` (b, c, d, e, f); `n2` `"SIGTERM": 143` renamed `"SIGTERMX"`, `2` FAIL `fake pid 10428 still alive 2s after SIGTERM (child exit SIGTERM)` (c, f); `n3` `proc.kill` line deleted, `4` FAIL on the fake pid (b, c, d, e); `n4` `onExit(close)` in `childBeforeDiscoveryMain` made `onExit(() => {})`, `1` FAIL `fake pid 11321 still alive 2s after SIGTERM (child exit 143)` (f only) |
| U1-3 | a signalled real-browser run leaves no Chrome and no profile, no fixed port | 🔴 | in `B`: `exit 143`, `0`, then `1` on the first run (R1), `0` of `5` on the serial reruns (R3); expected `0` every time. Row read as red on the run the plan's command produced; see The one red | clone `old` at `70c2d5e5` with `dist/` copied from `B`: `exit 143`, `11` on `pgrep -f 'remote-debugging-port=9333'`; reaped by `pkill -9 -f 'remote-debugging-port=9333'`, count after `0` |
| U1-4 | a green run leaves no Chrome and no profile directory | 🔴 | P5a's figures `0`, `0` on that run; the green runs of R2 and R3: `0` processes every time, `1` directory on `2` of `4` | `n1` (`rmSync` deleted): every leg reds on the directory, so the launcher-level figure discriminates; the real-browser figure here reds on its own without any edit |
| U1-5 | a stranger on 9333 is never consulted | 🟢 | guard `0`; in `B`: `exit 0`, `decoy requests: 0`, `1` | clone `old`: `exit 1`, `decoy requests: 113`, `0`, `  smoke threw: Chrome CDP did not come up within 45s (last: HTTP 404)`; 9333 count after `0` |
| U1-6 | CI runs the launcher before the browser | 🟢 | `1`, `1` | P2's control (the script line is live) |
| U1-7 | launcher green with `TMPDIR` unset, nothing left under the default root | 🟢 | in `C` under `bash`, `env -u TMPDIR`: `exit 0`, `6`, root `/tmp`, `0`; `mkdir /tmp/launcher-legE-probe` makes the same `ls` print `1`, so the count sees a leftover | clone `n7`, restore made `if (v === undefined && k !== "TMPDIR") delete process.env[k];` (the pass-1 behaviour for `TMPDIR`): `exit 1`, `5`, `  FAIL  leaves no process or directory after a signal while discovery is still pending: child never printed a pid/dir line (child exit 1; child stderr: Error: ENOENT: no such file or directory, mkdtemp 'undefined/ultimate-tokens-smoke-XXXXXX')` |
| U1-8 | launcher green on Linux, `TMPDIR` unset | 🟢 | `docker run --rm -v "$PWD:/w" -w /w node:24` on `C`: `TMPDIR=<unset> Linux v24.21.0`, `6` pass, `exit 0`, `0` dirs under `/tmp`, `0` `fake-chrome` processes | the same `docker run` on `n7`: `exit 1`, `5`, the same `mkdtemp 'undefined/...'` FAIL line |
| U1-9 | a signal-leg red names the child's own error | 🟢 | clone `n9`, `legF`'s env gains `TMPDIR: "/nonexistent"`: `grep -c 'ENOENT'` `1`, the line `child never printed a pid/dir line (child exit 1; child stderr: Error: ENOENT: no such file or directory, mkdtemp '/nonexistent/ultimate-tokens-smoke-XXXXXX')` | the same edit on `np1` at `b57b4658`: `0`, `child never printed a pid/dir line` and nothing after it |
| U1-10 | leg (e) cannot pass by `pgrep` being absent | 🟢 | `docker run ... 'mv /usr/bin/pgrep /usr/bin/pgrep.h; node test/smoke/launcher.mjs 2>&1 \| grep -E "deadline"'` on `C`: `  FAIL  leaves no process or directory after a deadline with no DevToolsActivePort: pgrep could not check for a leftover process (ENOENT), so this leg cannot pass` | the same on `p1` at `b57b4658`: `  pass  leaves no process or directory after a deadline with no DevToolsActivePort` |

## Beyond the rows

| # | Question | State | Evidence | Negative control |
|---|---|---|---|---|
| B1 | Does every save-and-restore of an env var restore unset as unset? | 🟢 | `grep -n 'process.env' test/smoke/*.mjs test/smoke/fixtures/*.mjs`: the only writes are `setEnv` (`launcher.mjs:32-37`); the rest are reads (`fake-chrome.mjs:36-39`, `smoke.mjs:28`) or spreads into a child's `env` (`launcher.mjs:113,167`). `setEnv` snapshots `process.env[k]` before `Object.assign`, restore deletes on `undefined`, reassigns otherwise; a caller-set `FAKE_CHROME_MUTE` now survives leg (e), which the pass-1 `delete` lost | U1-7's `n7` control is the restore with the delete removed for one key: red |
| B2 | Does leg (f) still test a signal arriving before discovery, with discovery read from stderr and no signal listener in the child? | 🟢 | the child still installs `onExit(close)` in the launch tick and never awaits `ready` (`launcher.mjs:69-74`); the parent signals at `1000` ms against a fixture that writes the port at `3000` ms, and now refuses a run where the `discovery finished` line reached it before the signal. The "no listener" is right: `onExit` itself installs the `SIGTERM` handler under test, and a second listener in the child would keep Node alive when `onExit` is missing | `n4` (`onExit` made a no-op): leg (f) alone reds, `fake pid 11321 still alive 2s after SIGTERM`; `n43` (fixture delay `3000` made `0`): leg (f) reds `discovery had already finished when SIGTERM was sent, so this leg proved nothing about the pending window` |
| B3 | 4.5, early browser exit rejects `ready` at once | 🟢 | probe `launchChrome(process.execPath, ["-e","process.exit(3)"])` then `/nonexistent/chrome`, `deadlineMs: 3000`, on `C`: `405ms Chrome exited before CDP came up (code 9)`, `808ms Chrome exited before CDP came up (spawn /nonexistent/chrome ENOENT)`; `grep -c -E 'proc\.(on\|once)\("(exit\|error)"'` `2` | same probe on `p1`: `3216ms Chrome CDP did not come up within 3s (last: no response)`, then the process dies on an unhandled `Error: spawn /nonexistent/chrome ENOENT` |
| B4 | 4.6, a start-up failure prints `SMOKE FAIL` | 🟢 | `B`, `CHROME_BIN=/usr/bin/false`: `exit 1`, `SMOKE FAIL (1):`, `  smoke threw: Chrome exited before CDP came up (code 1)`, `0` dirs under `T` | `p1` with `dist/` copied: `exit 1` after the 45 s deadline, `0` `SMOKE FAIL` lines, the raw `throw new Error(...)` stack |
| B5 | Other Linux-only differences (re-diagnosis section 4) | 🟢 none new | `pgrep -f` is procps-compatible and U1-8 exercised it on Linux; `e.status === 1` is procps's no-match code as well as BSD's; no `/proc`, no `ps` flags, no literal `/tmp` (`grep -n -E '/var/folders\|/proc\|/tmp' test/smoke/*.mjs` prints nothing); `child.on("close", (code, sig))` yields `code ?? sig`, which on Linux is `143` for the handled `SIGTERM` (U1-8's legs c, d, f pass) and the signal name for an unhandled one (`n2`'s `child exit SIGTERM`); the profile path is `os.tmpdir()` plus 28 chars, far under the 108-byte socket limit Chrome's `SingletonSocket` needs on Linux | `n2` is the unhandled-signal case: the exit cell reads `SIGTERM`, not a number, and the leg still reds on the pid |
| B6 | `runSignalLeg`'s 5 s timeout now `SIGKILL`s the child | 🟡 minor, not blocking | a child killed by `SIGKILL` never runs `onExit`, so the fake it spawned outlives the leg (the leg is already red at that point). Controls leaked `8` fakes this pass, reaped with `pkill -9 -f 'sfp2r/[a-z0-9]+/test/smoke/fixtures/fake-chrome.mjs'`, count after `0`. A `SIGTERM` first, or reading the fake pid from `buf` and killing it, would leave a red run clean; pass 1 left the child itself running, so this is no worse | `n4`'s red leg (f) left one fake alive at pid `11321`, gone only at the reap |
| B7 | Handoff claims against what I measured | 🟢 | every figure in the handoff's pass-2 table reproduced, including U1-1's `5` and the `SMOKE PASS` line number `299`; the handoff's U1-3 and U1-4 read `0` from one run each, which R1 to R4 show is the majority outcome, not the only one | the same two claims read against the pass-1 clone `p1`: `grep -n 'SMOKE PASS' test/smoke/smoke.mjs` prints `297`, not the handoff's `299`, and U1-1's fourth grep prints `4`, not `5`, so the figures are the head's and not carried over |

## Hygiene

| Item | Value |
|---|---|
| Clones | `/Users/kimba/.claude/jobs/8c58a81c/tmp/sfp2r/{C,B,old,p1,np,np1,np2,n1,n2,n3,n4,n7,n9,n43}`, `B`, `np2` with a `node_modules` symlink to the root checkout, never written through it |
| Fakes reaped | `8` by `pkill -9 -f 'sfp2r/[a-z0-9]+/test/smoke/fixtures/fake-chrome.mjs'`, then `0` |
| Real Chrome reaped | U1-3 control `11`, U1-5 control `0`, both by `pkill -9 -f 'remote-debugging-port=9333'`; 9333 count `0` before and after every Chrome row |
| Leftover profile dirs | the `5` directories from R1 to R4 are left in place under `$S/tmp-*` as the evidence for the red; remove with the clone root |
| Worktree | untouched, `git status --short \| wc -l` `0` at `1e25556d` before this file was written |

## Findings

| # | Severity | Finding | Where | Next |
|---|---|---|---|---|
| F1 | 🔴 | `close()` races Chrome's helpers: `rmSync` right after `SIGKILL` leaves the profile dir with one atomic-write temp file on `5` of `17` real-Chrome runs (head and pass 1 alike), so U1-3, U1-4 and P5a's last figure read `1` about one time in four | `chrome.mjs:40-44` | builder: retry `rmSync` while the dir exists, synchronously, with a bounded wait; plan: U1-3 and U1-4 gain a repeat count |
| F2 | 🟡 | a signal leg that times out `SIGKILL`s the child and leaves its fake alive | `launcher.mjs:121-125` | builder's call; a `SIGTERM` first or killing the parsed fake pid |
| F3 | 🟡 | P4 reads `2` against `origin/main` `70c2d5e5`, both files main's own | branch behind main | Orchestrator rebase before pre-land |

verdict: 🔴

# Round 2 · rework at `73d5f6f4` · 🟢 PASS

Graded the unit diff `git diff 975ef805..73d5f6f4`: `test/smoke/chrome.mjs`, `test/smoke/launcher.mjs`, the handoff. Code head `aa7530ad`. Clones under the same `S`: `H`, `BH` (built, `node_modules` symlinked read-only) and `m1` to `m43`, `m12`, `mp` at `73d5f6f4`; `c12`, `B`, `C` at `1e25556d`; `old` at `origin/main` `3e1483e4` (`dist/` copied from `BH`); `p1`, `np1` at `b57b4658`. The worktree stayed untouched (`git status --short` lists only this file). The 9333 guard printed `0` before every Chrome row; fake fixtures reaped by clone path before the U1-12 rows (`fakes zero 0`).

## The questions asked

| # | Question | State | Evidence |
|---|---|---|---|
| Q1 | Is the retry bounded, synchronous, unable to hang `close()` or an exit handler? | 🟢 | `removeDir` (`chrome.mjs:27-39`) is a `for` over `waited <= 2000` in steps of 50 with one `pauseSync(50)` per iteration: at most 41 iterations, about 2.05 s plus `rmSync` time, then it returns after printing on stderr; there is no branch that does not advance `waited`. `pauseSync` is `Atomics.wait` on a fresh `SharedArrayBuffer`, which Node permits on the main thread and which needs no event loop, so it runs inside `process.on("exit")` and the signal handlers `onExit` installs. The happy path costs three gone checks, 150 ms per `close()`: the launcher's six legs took `real 5.98` s at the head against about 5 s before. A `rmSync` that throws every time (a permanent `EACCES`) still exits the loop at 2 s. Nothing awaits, nothing is unref'd, so an exit handler cannot be skipped past it |
| Q2 | Does the group kill hold when the spawn failed or the browser is already gone? | 🟢 | `process.kill(-proc.pid, ...)` with an undefined `pid` throws and falls back to `proc.kill`, then `removeDir`: the 4.5 probe on `H` prints `561ms Chrome exited before CDP came up (code 9)` and `1125ms Chrome exited before CDP came up (spawn /nonexistent/chrome ENOENT)`, no unhandled error, `git status` `0` after |
| Q3 | Linux: `detached: true` plus `kill(-pid)` against the fake | 🟢 | U1-8 below runs both in `node:24`; the fake is the group leader and `pgrep -f` at leg (e) still prints nothing |

## Criteria at `73d5f6f4`

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green, no `node_modules`, count, tree stable | 🟢 | `H`: `✓ all 48 test files passed`, `48`, `0`, `ls: node_modules: No such file or directory` | `mp` (`scrim` to `scrimX`, `7 insertions(+), 7 deletions(-)`): `exit 1`, `▶ engine/semantic.mjs      FAIL` |
| P2 | `npm run build` green, tree clean | 🟢 | `BH`: `exit 0`, `wrote figma/plugin/ui.html 3780.5 KB`, `0` | `np2` at `73d5f6f4`, `smoke` gains `node test/smoke/missing.mjs &&` (`1 file changed, 1 insertion(+), 1 deletion(-)`): `exit 1`, `Cannot find module` count `1` |
| P3 | branding clean, no added prose em dash | 🟢 | `branding: clean (563 files scanned)`, `0`, `1`; the one line listed by the third command is this review's own P5a cell in round 1, quoting `SMOKE PASS` inside a backtick span, the program quote the plan allows | the perl on `dash.txt` (one prose U+2014) prints `1`; on this file after the round-2 append, outside backticks, `0` |
| P4 | scope wall | 🟡 as measured | against `origin/main` `3e1483e4`: `12` paths, every one a `verdict-frontmatter` record or `.sdlc/adapter.md`, `.sdlc/roadmap.md`, `.sdlc/checks/verdict-frontmatter-*`, main's own; `package.json` ` 1 file changed, 1 insertion(+), 1 deletion(-)`. The unit diff `git diff --name-only 975ef805..73d5f6f4` is exactly `.sdlc/handoffs/small-fixes-U1.md`, `test/smoke/chrome.mjs`, `test/smoke/launcher.mjs` | the plan's four-name fixture printed `2` at revision 2; the filter text is unchanged (compared by eye against the plan row); the `12` is the branch behind main, not a scope hit |
| P5a | `npm run smoke` green locally, Chrome and profile gone | 🟢 | `BH`, `TMPDIR="$T2"`: `exit 0`, `1`, `1`, `0`, `0`; `SMOKE PASS` at `smoke.mjs:299`; tree `0` | U1-3's `origin/main` control: `11` Chrome processes after a signalled run |
| P5b | CI on the graded sha | ⚪ | pre-land | none run: pre-land's row |
| U1-1 | no fixed port, discovery, exit paths | 🟢 | `test/smoke/chrome.mjs:0`, `test/smoke/smoke.mjs:0`, `1`, `4`, `5`, `1` | `old` at `3e1483e4`: first grep `1`, `ls: test/smoke/chrome.mjs: No such file or directory` (round 1's `70c2d5e5` clone read the same) |
| U1-2 | launcher green, every leg | 🟢 | `H`: `exit 0`, `6`, `0`, `PASS: launcher discovers its port from DevToolsActivePort and leaves no process on close, SIGTERM, SIGINT or deadline`, `real 5.98` | each `1 file changed`, each `exit 1`: `m1` (the `rmSync` line inside `removeDir` deleted): `5` FAIL on `profile dir ... still present`, and stderr carries `chrome.mjs: profile dir ... still present 2s after close()`, `real 18.17` (the 2 s bound paid five times, which shows the loop is bounded); `m2` (`"SIGTERMX"`): `2` FAIL `fake pid 3179 still alive 2s after SIGTERM (child exit SIGTERM)` (c, f); `m3` (group kill made `process.kill(-proc.pid, 0)`, so `close()` kills nothing): `4` FAIL on the fake pid (b, c, d, e); `m4` (`onExit(() => {})` in `childBeforeDiscoveryMain`): `1` FAIL `fake pid 4035 still alive 2s after SIGTERM (child exit 143)` (f only); `m43` (delay `"0"`): `discovery had already finished when SIGTERM was sent, so this leg proved nothing about the pending window` |
| U1-3 | signalled real-browser run: no Chrome, no profile, no fixed port | 🟢 | `BH`: `exit 143`, `0`, `0` | `old` with `dist/` copied: `exit 143`, `11` by `pgrep -f 'remote-debugging-port=9333'`; reaped by `pkill -9 -f 'remote-debugging-port=9333'`, `after reap 0` |
| U1-4 | green run: no Chrome, no profile | 🟢 | P5a's `0`, `0`; U1-11's `0` of `30` | U1-11's control, and `m1` at launcher level |
| U1-5 | a stranger on 9333 is never consulted | 🟢 | `BH`: `exit 0`, `decoy requests: 0`, `1` | `old`: `exit 1`, `decoy requests: 113`, `0`, `  smoke threw: Chrome CDP did not come up within 45s (last: HTTP 404)`; `9333 after 0` |
| U1-6 | CI runs the launcher before the browser | 🟢 | `1`, `1` | P2's control |
| U1-7 | launcher green with `TMPDIR` unset | 🟢 | `H` under `bash`, `env -u TMPDIR`: `exit 0`, `6`, `0` under `/tmp` | `m7` (`TMPDIR`-only plain restore): `exit 1`, `5`, `child never printed a pid/dir line (child exit 1; child stderr: Error: ENOENT: no such file or directory, mkdtemp 'undefined/ultimate-tokens-smoke-XXXXXX')` |
| U1-8 | launcher green on Linux, `TMPDIR` unset | 🟢 | `docker run ... node:24` on `H`: `TMPDIR=<unset> Linux v24.21.0`, `6` pass, `exit 0`, `0` dirs under `/tmp`, `0` `fake-chrome` processes; this is the `detached` spawn and `kill(-pid)` on Linux | `m7` under the same `docker run`: `exit 1`, `5` |
| U1-9 | a signal-leg red names the child's error | 🟢 | `m9` (`TMPDIR: "/nonexistent"` in `legF`'s env): `grep -c 'ENOENT'` `1`, `child stderr: Error: ENOENT: no such file or directory, mkdtemp '/nonexistent/ultimate-tokens-smoke-XXXXXX'` | `np1` at `b57b4658`, same edit, rerun: `exit 1`, `0` |
| U1-10 | leg (e) cannot pass by `pgrep` being absent | 🟢 | `docker run ... 'mv /usr/bin/pgrep /usr/bin/pgrep.h; ...'` on `H`: `  FAIL  leaves no process or directory after a deadline with no DevToolsActivePort: pgrep could not check for a leftover process (ENOENT), so this leg cannot pass` | `p1` at `b57b4658`, rerun: `  pass  leaves no process or directory after a deadline with no DevToolsActivePort` |
| U1-11 | `close()` removes the profile dir every time | 🟢 head, 🟡 control | `BH`, twenty consecutive green runs, own `T` each: `HEAD LEAKS 0 of 20`, every run `exit 0 procs 0 dirs 0`, `0` `still present 2s after close` lines; then ten more interleaved with a background `npm run build` loop (load average `33`): `loaded head 0 of 10`. `0` of `30` dirs, `0` of `30` processes at 5 s | `B` at `1e25556d`, twenty runs: `CONTROL LEAKS 0 of 20` dirs, but `procs 3` on run 10 and `procs 4` on run 19 (Chrome helpers alive 5 s after a green run, reaped by `pkill -9 -f "user-data-dir=$S/u11c-"`); ten more under the same build load: `control 0 of 10` dirs, `procs 3` on run 1. The dir figure the plan's control names did not fire in this round's `30` (it fired `5` of `17` in round 1 and `3` of `20` for the builder), so as a control it is a chance event; the process figure fired `3` of `30` at `1e25556d` and `0` of `30` at the head, which is what separates the two shas here |
| U1-12 | a timed-out signal leg leaves no fake Chrome | 🟢 | `m12`, `childMain`'s `onExit(close)` made `process.on("SIGTERM", () => {}); process.on("SIGINT", () => { close(); process.exit(130); });` so only leg (c) hangs: leg (c) `FAIL  --child had not exited 5s after start, SIGTERM sent at 200ms`, the other five pass, then `pgrep -f fake-chrome.mjs \| wc -l` `0`, launcher children `0` | `c12` at `1e25556d`, same edit, same FAIL line, then `1` (clone-scoped `1`); reaped. A first version of this edit that also dropped leg (d)'s handler read `1` at both shas, the surviving fake being leg (d)'s, so the edit above hangs one leg only |

## Beyond the rows

| # | Item | State | Evidence | Negative control |
|---|---|---|---|---|
| R1 | `runSignalLeg`'s timeout calls `rmSync(dir, ...)` bare (`launcher.mjs:126`); a throw there (an `ENOTEMPTY` race with the fake it just `SIGKILL`ed) is an uncaught exception inside a timer, exit `1` with a stack instead of the leg's own FAIL line | 🟡 minor, not blocking | the fake is a single Node process with no helpers, so the race `removeDir` guards against does not exist for it; `force: true` covers a missing dir. A `try` around it, or `removeDir` exported and reused, closes the gap for free | `m12` and `c12` both took this path with the fake already dead: no throw, the leg's own FAIL line printed |
| R2 | `detached: true` moves the browser out of the launcher's terminal group, so a terminal `Ctrl-C` no longer reaches Chrome directly, only through `onExit` | 🟢 by design | U1-3 and legs (c), (d), (f) are exactly that path: `exit 143`, `0`, `0` | `m4` (no `onExit` in the pending-discovery child): the fake survives, which is the dependency stated |
| R3 | 4.5 and 4.6 still hold after the `close()` change | 🟢 | 4.5 as Q2; 4.6 on `BH` with `CHROME_BIN=/usr/bin/false`: `exit 1`, `SMOKE FAIL (1):`, `  smoke threw: Chrome exited before CDP came up (code 1)`, `0` dirs | `p1` (round 1): `exit 1` after 45 s, `0` `SMOKE FAIL` lines |
| R4 | Handoff figures | 🟢 | reproduced: U1-11 `0` of `20`, U1-12 `0` against `2` (mine `1`, one leg hung not two), `real` cost of `close()` about 150 ms, `SMOKE PASS` at `299` | the handoff's U1-11 control `3` of `20` versus my `0` of `30`: the same code, a different hour; the disagreement is the row's control, not the claim |

## Hygiene (round 2)

| Item | Value |
|---|---|
| Fakes | `8` reaped by `pkill -9 -f 'sfp2r/[a-z0-9]+/test/smoke/fixtures/fake-chrome.mjs'` after the U1-2 controls, then per clone after `m12`/`c12`; count `0` |
| Chrome | U1-3 control `11` reaped by the plan's exact pattern; control-run helpers `3`, `4`, `3` reaped by `pkill -9 -f "user-data-dir=$S/u11c-"` and `u11cL-`; 9333 `0` after every row |
| Profile dirs | none left by the head in this round; round 1's `5` remain under `$S/tmp-*` |

## Findings (round 2)

| # | Severity | Finding | Next |
|---|---|---|---|
| F1 | 🟢 closed | `close()` kills the process group and `removeDir` retries, bounded at 2 s, synchronous; `0` of `30` leaks at the head, `0` processes at 5 s | none |
| F2 | 🟢 closed | a timed-out signal leg kills the fake it knows, `SIGTERM`s the child, `SIGKILL` at 1 s or at exit | none |
| F4 | 🟡 | U1-11's control (a dir left at `1e25556d`) is a chance event: `0` of `30` this round; the process count at 5 s discriminated `3` of `30`. Suggest the plan's row read both figures | planner, at leisure; no code change |
| F5 | 🟡 minor | bare `rmSync` inside the timeout handler (`launcher.mjs:126`) | builder's call, not blocking |
| F3 | 🟡 | P4 `12` main-only paths | Orchestrator rebase before pre-land |

verdict: 🟢
