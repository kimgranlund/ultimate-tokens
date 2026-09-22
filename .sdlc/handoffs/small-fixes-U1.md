# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/sf-U1 @ 7954e177 (pass 1 head `b8c204e4`; see Rework below for the review-fix commits) |
| Files | test/smoke/chrome.mjs (new), test/smoke/launcher.mjs (new), test/smoke/fixtures/fake-chrome.mjs (new), test/smoke/smoke.mjs, package.json (`scripts.smoke`) |
| npm test | 🟢 `✓ all 48 test files passed`, tree clean after |
| npm run build | 🟢 `wrote figma/plugin/ui.html 3780.5 KB`, tree clean after |
| branding | 🟢 `branding: clean (553 files scanned)` |
| Left out | nothing in scope; Q1 (registering launcher.mjs in test/run.mjs TESTS) defaults to no per the plan |

Note for the U1-1 grep row: the four SIGINT/SIGTERM/SIGHUP/exit registrations are one `for` loop over
`Object.keys(SIGNAL_CODES)` in `chrome.mjs`, plus the literal `process.on("exit", fn)` line and the
`SIGNAL_CODES` object literal itself, so the raw grep count is `4` (all four quoted names land on two
lines total, the object literal and the `exit` call), which already clears "4 or more" without
invoking the loop fallback.

The `SMOKE PASS` line, quoted byte for byte from a green run's own stdout:

`SMOKE PASS — gallery · category · editor · export dialog all render in a real browser`

Its new source line in `test/smoke/smoke.mjs` is **297** as of the rework commit (was **296** at pass
1, before the fix added one line; `:293` before this unit; the #709 owner decides whether
`.sdlc/plans/records-followup.md:43` and `.sdlc/questions/records-followup-repoint.md` get repointed
before or after #720 lands, per the plan's Not in scope).

**Everything below this line is the pass-1 record, left as filed.** See "Rework (review round 2,
builder pass 1)" at the end
for the review finding, the fix, leg (f), and every row rerun fresh against the rework head.

## Plan-level criteria (P1-P5)

| # | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| P1 | `npm test 2>&1 \| tail -1; perl -0ne '...' test/run.mjs; git status --short \| wc -l` | `` `✓ all 48 test files passed` ``, `` `48` ``, `` `0` `` | clone at `1dde820c`, `scrimX` edit to role-table.json: `` `exit 1` `` and `` `  FAIL  refs-canonical  — ordered key set != canonical` `` | 🟢 |
| P2 | `npm run build > ...; echo exit $?; tail -1; git status --short \| wc -l` | `` `exit 0` ``, `` `wrote figma/plugin/ui.html 3780.5 KB` ``, `` `0` `` | clone at `1dde820c`, `smoke` script gains `node test/smoke/missing.mjs &&`: `` `exit 1` ``, `` `1` `` match on `Cannot find module` | 🟢 |
| P3 | `branding.mjs \| tail -1`; added-line em-dash count (excluding backtick spans); added-line em-dash count over the full diff | `` `branding: clean (549 files scanned)` ``, `` `0` ``, `` `0` `` (no added line outside a backtick span carries U+2014; this handoff's own two program-output quotes above are the only matches, both inside backtick spans) | not run (destructive to this handoff's own tree); reasoning: every added source line was swept for U+2014 and fixed in `chrome.mjs`, `launcher.mjs`, `fake-chrome.mjs` before commit | 🟢 |
| P4 | `git diff --name-only origin/main \| grep -v -E ... \| wc -l`; `git diff origin/main --stat -- package.json \| tail -1` | `` `2` `` (not `0`: branch carries `.sdlc/plans/records-policy.md` and `.sdlc/plans/verdict-frontmatter.md` from sibling units activated on `main` ahead of this rebase; the plan's own "Today" row for P4 names exactly this pre-rebase condition and says it reads `0` only after the Orchestrator rebases); `` `1 file changed, 1 insertion(+), 1 deletion(-)` ``; four-name fixture control reproduced `` `2` `` | 🟡 (unit's own diff is scope-clean; the `2` is branch-behind-main drift the plan assigns to the Orchestrator's rebase step, not this unit) |
| P5 | `TMPDIR="$T" npm run smoke > ...; echo exit $?; grep -c SMOKE PASS; grep -c PASS: launcher; sleep 5; pgrep count; ls count` | `` `exit 0` ``, `` `1` ``, `` `1` ``, `` `0` ``, `` `0` `` | the plan assigns P5 no control of its own (a green run cannot red before the fix); U1-3's signalled run against `origin/main`, `` `11` `` leaked processes reaped, is the discriminating control for this row | 🟢 |

## Unit criteria (U1-1 to U1-6)

| # | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| U1-1 | five greps over `smoke.mjs`/`chrome.mjs` per the plan | `` `test/smoke/smoke.mjs:0` ``, `` `test/smoke/chrome.mjs:0` ``, `` `1` ``, `` `3` ``, `` `4` ``, `` `1` `` (`DevToolsActivePort` is `3` not `1`, comfortably `1` or more) | not separately run; the "today" row in the plan already shows the pre-fix state | 🟢 |
| U1-2 | `node test/smoke/launcher.mjs > ...; echo exit $?; pass count; FAIL count; tail -1` | `` `exit 0` ``, `` `5` ``, `` `0` ``, `` `PASS: launcher discovers its port from DevToolsActivePort and leaves no process on close, SIGTERM, SIGINT or deadline` `` | control (1) delete `rmSync` in `close()`: `1 file changed`, `` `exit 1` ``, legs (b)(c)(d)(e) FAIL on the dir · control (2) drop `SIGTERM` from `SIGNAL_CODES`: `1 file changed`, `` `exit 1` ``, only leg (c) FAILs on the fake pid · control (3) delete `proc.kill` in `close()`: `1 file changed`, `` `exit 1` ``, legs (b)(c)(d)(e) FAIL on the fake pid | 🟢 |
| U1-3 | `npm run build`, then background `TMPDIR="$T" node test/smoke/smoke.mjs`, `SIGTERM` at 5s, wait, `pgrep`/`ls` at t+5s after | node process gone from `ps` within ~1s of `SIGTERM` (the run's own log stops mid-flight, no SMOKE PASS/FAIL line, matching a mid-run kill); `` `0` `` processes, `` `0` `` directories 5s later. Ran only after `pgrep -f 'remote-debugging-port=9333' \| wc -l` printed `0` | clone of `origin/main` (`6281cebd`), built, same signalled run with the old needle: `` `11` `` Chrome processes alive, `lsof -iTCP:9333` showed the listener; reaped with `pkill -9 -f 'remote-debugging-port=9333'`, `` `11` `` reaped, `` `0` `` remaining after | 🟢 |
| U1-4 | P5's last two figures | `` `0` ``, `` `0` `` | U1-2 control (1) reds the directory at launcher level (not re-run at real-browser level) | 🟢 |
| U1-5 | decoy HTTP server on 9333, then `TMPDIR="$T" node test/smoke/smoke.mjs`, guarded by the same 9333-empty check | `` `exit 0` ``, `` `decoy requests: 0` ``, `` `1` `` | clone of `origin/main`, same decoy: `` `exit 1` ``, `` `decoy requests: 113` ``, `` `0` ``, FAIL line `` `smoke threw: Chrome CDP did not come up within 45s (last: HTTP 404)` `` (byte-for-byte match to the plan's own figures) | 🟢 |
| U1-6 | two greps over `package.json`/`.github/workflows/ci.yml` | `` `1` ``, `` `1` `` | P2's control | 🟢 |

## Scratch/clone hygiene

Six throwaway clones were made under this seat's own scratchpad (`neg-p1`, `neg-p2`, `neg-c1`,
`neg-c2`, `neg-c3`, `old`), each from `git log -1 --format=%h` = `1dde820c` (or `6281cebd` for `old`,
deliberately checked out to `origin/main`). Controls (1) and (3) for U1-2 disable the launcher's own
cleanup by design, so their fake-chrome fixture processes were orphaned on purpose; 6 were reaped with
`pkill -9 -f 'fixtures/fake-chrome.mjs'` right after. None of this touched the unit worktree.

## Rework (review round 2, builder pass 1): review finding 1

`.sdlc/verdicts/small-fixes-U1-review.md` (🔁 FIX-FIRST at `b8c204e4`): `smoke.mjs` wired
`onExit(() => closeChrome())` before `launchChrome()` resolved, but `closeChrome` stayed a no-op
until the promise settled and assigned the real `close`. A signal landing during the CDP discovery
wait ran the no-op, leaked the browser and its profile directory, and `process.exit(...)` tore the
process down before `chrome.mjs`'s own deadline path could run.

First step: `git -C .worktrees/sf-U1 merge --no-ff plan/small-fixes` brought in revision 4
(`c215331a`, `.sdlc/plans/small-fixes.md` now `sha256` unlisted but readable at that commit) without
a rebase, since the branch had no conflicting edits of its own; `.sdlc/board.md` was excluded from
that merge commit (restored to this branch's own copy before committing) since it is
Orchestrator-only, per the dispatch and the plan's scope wall. Merge landed at `5cf7d52f`.

**The fix** (`46ed85e4`): `launchChrome()` in `test/smoke/chrome.mjs` now returns
`{ proc, dir, close, ready }` synchronously, not a `Promise` of the whole object; `close()` is
reachable the instant `launchChrome()` returns, and `ready` is a separate `Promise<{ port }>` for
discovery. `smoke.mjs` calls `onExit(close)` in the same tick as `launchChrome(...)`, before
`await ready`. `launcher.mjs`'s legs (a), (b) and (e) and the `--child` entry (legs c, d) were
adapted to the new shape; nothing about what those five legs assert changed. A second commit
(`7954e177`) dropped one em dash a P3 rerun caught in the fix's own new comment.

**Leg (f)** (added by plan revision 4): `test/smoke/fixtures/fake-chrome.mjs` gained
`FAKE_CHROME_DELAY_MS`, delaying its `DevToolsActivePort` write instead of skipping it (that's
still `FAKE_CHROME_MUTE`, leg (e)'s knob, untouched). `launcher.mjs` gained a third entry point,
`--child-before-discovery` (`childBeforeDiscoveryMain`), which installs `onExit(close)` in the same
tick as the launch and prints `<fake pid> <dir>` immediately, never awaiting `ready` itself, the
same shape as the fixed `smoke.mjs`. Leg (f) spawns that child with `FAKE_CHROME_DELAY_MS=3000`,
waits 1s (well inside the 3s discovery delay), sends `SIGTERM`, and asserts the fake pid and its
profile dir are gone within 2s: the exact window finding 1 identified.

### Rows rerun fresh against `7954e177` (nothing trusted from pass 1's quotes)

| # | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| P1 | as pass 1 | `` `✓ all 48 test files passed` ``, `` `48` ``, `` `0` `` | not rerun this pass (unchanged code path; pass 1's control still applies) | 🟢 |
| P2 | as pass 1 | `` `exit 0` ``, `` `wrote figma/plugin/ui.html 3780.5 KB` ``, `` `0` `` | not rerun this pass | 🟢 |
| P3 | as pass 1 | `` `branding: clean (553 files scanned)` ``, `` `0` ``, `` `0` `` (the fix's own first draft added one prose em dash in `smoke.mjs`; caught by this exact rerun and fixed in `7954e177` before this row is reported green) | this rerun itself is the control: it reproduced the violation once, live, before the fix | 🟢 |
| P4 | as pass 1, but now post-merge | `` `0` `` (was `` `2` `` pass 1; the merge in this rework brought the branch level with `origin/main`, closing the gap the pass-1 handoff flagged 🟡); `` `1 file changed, 1 insertion(+), 1 deletion(-)` ``; four-name fixture control reproduced `` `2` `` | 🟢 (pass 1's 🟡 is resolved, not carried forward) |
| P5 | as pass 1 | `` `exit 0` ``, `` `1` ``, `` `1` ``, `` `0` ``, `` `0` `` | unchanged from pass 1 | 🟢 |
| U1-1 | as pass 1 | `` `test/smoke/smoke.mjs:0` ``, `` `test/smoke/chrome.mjs:0` ``, `` `1` ``, `` `4` `` (was `3`: the new `ready` closure adds one more line containing `DevToolsActivePort`), `` `4` ``, `` `1` `` | not separately run | 🟢 |
| U1-2 | `node test/smoke/launcher.mjs`; pass count now expected `6` per revision 4 | `` `exit 0` ``, `` `6` ``, `` `0` ``, same `PASS:` tail line | four clones from `7954e177`: control (1) delete `rmSync`: `1 file changed`, `exit 1`, legs (b)(c)(d)(e)(f) FAIL on the dir (leg (f) now participates, it shares `close()`) · control (2) drop `SIGTERM` from `SIGNAL_CODES`: `1 file changed`, `exit 1`, legs (c) AND (f) FAIL on the fake pid (both are SIGTERM legs now; the plan's pre-revision-4 wording named only leg (c) since leg (f) did not yet exist) · control (3) skip `proc.kill`: `1 file changed`, `exit 1`, legs (b)(c)(d)(e)(f) FAIL on the fake pid · **leg (f)'s own control**: in a clone, `childBeforeDiscoveryMain` reverted to register the real `close` only after `await ready` (mirroring the original bug shape) while still printing `<fake pid> <dir>` before that await: `1 file changed, 5 insertions(+), 2 deletions(-)`, `exit 1`, only leg (f) FAILs, `fake pid ... still alive 2s after SIGTERM` | 🟢 |
| U1-3 | as pass 1, run in the foreground this time (`&`/`wait` in one Bash call, no background monitor) | `` `exit 143` ``, `` `0` `` processes, `` `0` `` dirs 5s later. Guard printed `0` first | not rerun against `origin/main` this pass (pass 1 already reproduced the 11-process leak and reaped it; unchanged old-code path) | 🟢 |
| U1-4 | P5's last two figures | `` `0` ``, `` `0` `` | U1-2 control (1), now also reding leg (f) | 🟢 |
| U1-5 | as pass 1, foreground | `` `exit 0` ``, `` `decoy requests: 0` ``, `` `1` `` | not rerun against `origin/main` this pass | 🟢 |
| U1-6 | as pass 1 | `` `1` ``, `` `1` `` | P2's control | 🟢 |

Five throwaway clones this pass (`neg-c1`, `neg-c2`, `neg-c3`, `neg-f`, plus the merge itself was done
in the worktree, not a clone), each verified at `git log -1 --format=%h` = `7954e177`. Controls (1),
(3) and leg (f)'s own control disable cleanup by design; 8 orphaned fake-chrome processes were reaped
with `pkill -9 -f 'fixtures/fake-chrome.mjs'` afterward. `npm test`, `npm run build`, and every
real-Chrome row ran in the foreground this pass (no `run_in_background`, no idle wait on a monitor),
per the team lead's standing note; one earlier background launch of the U1-3 leg was stopped before
it produced any output and left nothing behind (`pgrep` confirmed 0 before the foreground rerun).

## Pass 2 (builder-l7)

| Field | Value |
|---|---|
| Branch | `unit/sf-U1p2` off `plan/small-fixes` at `b57b4658`; code head `1d97d568` (two commits: `ff4d4999` the fix, `1d97d568` a rework of my own leg (f) change that a control exposed, below) |
| Files | `test/smoke/launcher.mjs`, `test/smoke/chrome.mjs`, `test/smoke/smoke.mjs` |
| npm test | 🟢 `✓ all 48 test files passed`, tree clean after |
| npm run build | 🟢 `wrote figma/plugin/ui.html 3780.5 KB`, tree clean after |
| branding | 🟢 see P3 |
| Not claimed | P5b (CI on the graded sha), graded at pre-land |

### What changed and why

| # | Change | Where | Closes |
|---|---|---|---|
| X1 | `setEnv(vars)` sets env keys and returns a `restore()` that deletes every key that was unset and reassigns the rest. Leg (e) uses it for both `TMPDIR` and `FAKE_CHROME_MUTE`; it was the only save-and-restore of `process.env` in the launcher, the fixture, `chrome.mjs` and `smoke.mjs` (`grep -n 'process.env' test/smoke/*.mjs test/smoke/fixtures/*.mjs`: the rest are reads or a spread into a child's `env`). The pass-1 `delete` of `FAKE_CHROME_MUTE` also lost a value set by the caller; `restore()` keeps it | `launcher.mjs` `setEnv`, `legE` | RD1 to RD8, B1 |
| X2 | signal legs collect the child's stderr; every FAIL line of a signal leg carries `child exit <code or signal>; child stderr: <first line naming an Error, else the last line>`. The 5 s timeout now kills the child it gave up on, and says whether the signal had already been sent | `launcher.mjs` `runSignalLeg`, `childStderr`, `legSignal` | 4.2, U1-9 |
| X3 | not taken: `launchChrome` keeps its shape; X1 closes the leak between legs and the re-diagnosis leaves X3 to the owner | none | none |
| 4.1 | leg (e)'s `pgrep` catch returns "no process" only on `e.status === 1`; `ENOENT` or exit 2/3 throws `pgrep could not check for a leftover process (...), so this leg cannot pass` | `launcher.mjs` `legE` | U1-10 |
| 4.3 | leg (f) now refuses a run where discovery finished before the signal: the child writes `discovery finished` to stderr when `ready` resolves, the parent snapshots stderr when it sends `SIGTERM`, and a snapshot with that line is a FAIL (`discovery had already finished when SIGTERM was sent, so this leg proved nothing about the pending window`). My first version (`ff4d4999`) added a `SIGTERM` listener in the child instead; U1-2 control (2) showed that listener suppressed Node's default exit and turned a leaked fake into a 5 s timeout, so `1d97d568` replaced it with the stderr line and adds no signal listener | `launcher.mjs` `childBeforeDiscoveryMain`, `legF` | 4.3 |
| 4.5 | `launchChrome` listens for the browser's `exit` and `error`; `ready` rejects at the next poll with `Chrome exited before CDP came up (<code, signal or spawn error>)` instead of waiting out the deadline, and rejects `Chrome was closed before CDP came up` once `close()` ran. The `error` listener also stops a failed spawn from crashing the caller as an unhandled `ChildProcess` error | `chrome.mjs` | pre-land N3 |
| 4.6 | `smoke.mjs` awaits `ready` inside its `try`, so a start-up failure prints a `SMOKE FAIL` line and still runs `finally` | `smoke.mjs` | pre-land N2 |
| 4.4 | not addressed: a real Linux Chrome's helpers outliving `SIGKILL` needs a Linux Chrome, which neither this host nor `node:24` has, and CI does not read the directory figures. Stays with the plan's Risk row 3 | none | carried |
| 4.7 | closed by X1: no non-string is ever assigned to `process.env` now | none | DEP0104 |

The `SMOKE PASS` line moved from `smoke.mjs:297` to `smoke.mjs:299` (two added lines above it, 4.6), for the #709 owner per Not in scope. Quoted from this pass's P5a run: `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser`

### Criteria at `1d97d568`

`S` and `F` are `/Users/kimba/.claude/jobs/8c58a81c/tmp/p3`. Every control ran in its own `git clone -q --shared` of the worktree checked out at `1d97d568` (or `b57b4658`, the pass-1 head, where the row names "pass 1"; or `origin/main` at `62ee7782`), each with the one-line diff stated; none ran in the worktree.

| # | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| P1 | `npm test 2>&1 \| tail -1; perl ... test/run.mjs; git status --short \| wc -l` | `✓ all 48 test files passed`, `48`, `0` | clone, `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json` (`1 file changed, 7 insertions(+), 7 deletions(-)`): `exit 1`, first FAIL `▶ engine/semantic.mjs      FAIL` | 🟢 |
| P2 | `npm run build > "$F/b.log" 2>&1; echo "exit $?"; tail -1 "$F/b.log"; git status --short \| wc -l` | `exit 0`, `wrote figma/plugin/ui.html 3780.5 KB`, `0` | clone with `node_modules` symlinked from the root checkout (read only), `smoke` script gains `node test/smoke/missing.mjs &&` (`1 file changed, 1 insertion(+), 1 deletion(-)`): `exit 1`, `1` | 🟢 |
| P3 | the plan's three commands | see the P3 row after the handoff commit, at the end of this section | as plan | see below |
| P4 | the plan's filter; `git diff origin/main --stat -- package.json \| tail -1` | `0`, ` 1 file changed, 1 insertion(+), 1 deletion(-)` | not rerun: the filter is unchanged since pass 1's four-name fixture printed `2` | 🟢 |
| P5a | `TMPDIR="$T" npm run smoke > "$F/sm.log" 2>&1; echo "exit $?"; grep -c '^SMOKE PASS'; grep -c '^PASS: launcher'; sleep 5; pgrep ... \| wc -l; ls -d ... \| wc -l` | `exit 0`, `1`, `1`, `0`, `0` | the plan gives a green run no control of its own; its discriminating control is U1-3's `origin/main` run: `11` Chrome processes left behind a signalled run | 🟢 |
| P5b | not run by this seat | none | none | ⚪ pre-land |
| U1-1 | the plan's five greps | `test/smoke/smoke.mjs:0`, `test/smoke/chrome.mjs:0`, `1`, `4`, `5`, `1` (the fourth is `5` now: `proc.once("exit", ...)` in 4.5 adds a line with `"exit"`) | the first grep on the `origin/main` clone `62ee7782`: `1`, and `ls test/smoke/chrome.mjs`: `No such file or directory` | 🟢 |
| U1-2 | `node test/smoke/launcher.mjs > "$F/l.log" 2>&1; echo "exit $?"; grep -c '^  pass  '; grep -c '^  FAIL'; tail -1` | `exit 0`, `6`, `0`, `PASS: launcher discovers its port from DevToolsActivePort and leaves no process on close, SIGTERM, SIGINT or deadline` | each `1 file changed`, each `exit 1`: (1) `rmSync` line deleted: legs (b) (c) (d) (e) (f) FAIL on the dir, e.g. `profile dir .../ultimate-tokens-smoke-93xXpm still present after SIGTERM (child exit 143)`; (2) `"SIGTERM"` renamed `"SIGTERMX"` in `SIGNAL_CODES`: legs (c) and (f) FAIL, `fake pid 33352 still alive 2s after SIGTERM (child exit SIGTERM)`; (3) `proc.kill` line deleted: legs (b) (c) (d) (e) FAIL on the fake pid; (f-rev4) `onExit(close)` in `childBeforeDiscoveryMain` made `onExit(() => {})`: only leg (f), `fake pid 34148 still alive 2s after SIGTERM (child exit 143)` | 🟢 |
| U1-3 | the plan's signalled run, after the guard `pgrep -f 'remote-debugging-port=9333' \| wc -l` printed `0` | `exit 143`, `0`, `0` | `origin/main` clone `62ee7782`, `dist/` copied from the worktree's fresh build (the old `smoke.mjs` reads only `dist/ultimate-tokens.html`): `exit 143`, `11` Chrome processes; `pkill -9 -f 'remote-debugging-port=9333'`, then `0` | 🟢 |
| U1-4 | P5a's last two figures | `0`, `0` | U1-2 control (1) | 🟢 |
| U1-5 | the plan's decoy run, guard `0` first | `exit 0`, `decoy requests: 0`, `1` | same `origin/main` clone: `exit 1`, `decoy requests: 113`, `0`, `  smoke threw: Chrome CDP did not come up within 45s (last: HTTP 404)`; `0` Chrome reaped after | 🟢 |
| U1-6 | the plan's two greps | `1`, `1` | P2's control | 🟢 |
| U1-7 | the plan's command, run under `bash` (zsh aborts the `ls` on an unmatched glob, which would print `0` for the wrong reason) | `exit 0`, `6`, `0`; the default root is `/tmp`, and `mkdir /tmp/launcher-legE-probe` then the same `ls` prints `1`, so the count can see a leftover | clone, `setEnv`'s restore made plain assignment for `TMPDIR` only (`if (v === undefined && k !== "TMPDIR") delete process.env[k];`, the pass-1 behaviour): `exit 1`, `5`, `  FAIL  leaves no process or directory after a signal while discovery is still pending: child never printed a pid/dir line (child exit 1; child stderr: Error: ENOENT: no such file or directory, mkdtemp 'undefined/ultimate-tokens-smoke-XXXXXX')` | 🟢 |
| U1-8 | `docker info >/dev/null && echo up`; the plan's `docker run ... node:24` in a clone at `1d97d568` | `up`, `exit 0`, `6`; a second run printing the container's env first read `TMPDIR=<unset> Linux` | U1-7's clone under the same `docker run`: `exit 1`, `5`, the same FAIL line as U1-7's control | 🟢 |
| U1-9 | clone at `1d97d568`, `legF`'s env gains `TMPDIR: "/nonexistent"`: `node test/smoke/launcher.mjs 2>&1 \| grep -c 'ENOENT'` | `1`, the line: `  FAIL  leaves no process or directory after a signal while discovery is still pending: child never printed a pid/dir line (child exit 1; child stderr: Error: ENOENT: no such file or directory, mkdtemp '/nonexistent/ultimate-tokens-smoke-XXXXXX')` | the same one-line edit on pass 1 `b57b4658`: `0`, `  FAIL  leaves no process or directory after a signal while discovery is still pending: child never printed a pid/dir line` | 🟢 |
| U1-10 | the plan's `docker run ... mv /usr/bin/pgrep /usr/bin/pgrep.h ...` on a clone at `1d97d568` | `  FAIL  leaves no process or directory after a deadline with no DevToolsActivePort: pgrep could not check for a leftover process (ENOENT), so this leg cannot pass` | the same on pass 1 `b57b4658`: `  pass  leaves no process or directory after a deadline with no DevToolsActivePort` | 🟢 |

### Checks for the extra fixes (not plan rows)

| # | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| 4.3 | clone, `legF`'s `FAKE_CHROME_DELAY_MS: "3000"` made `"0"` | `exit 1`, `  FAIL  leaves no process or directory after a signal while discovery is still pending: discovery had already finished when SIGTERM was sent, so this leg proved nothing about the pending window` | the head passes leg (f) on the Mac, with `TMPDIR` unset, and on Linux (U1-2, U1-7, U1-8) | 🟢 |
| 4.5 | `node --input-type=module -e "$probe" <chrome.mjs>`: `launchChrome(process.execPath, ["-e","process.exit(3)"], { deadlineMs: 3000 })`, then `/nonexistent/chrome` | `406ms Chrome exited before CDP came up (code 9)` (Node exits 9 on the Chrome flags after `-e`: still an early exit, reported with its code), `813ms Chrome exited before CDP came up (spawn /nonexistent/chrome ENOENT)`; pre-land N3's grep `grep -c -E 'proc\.(on\|once)\("(exit\|error)"' test/smoke/chrome.mjs` prints `2` | the same probe on pass 1: `3218ms Chrome CDP did not come up within 3s (last: no response)`, then the process dies on `Error: spawn /nonexistent/chrome ENOENT` (unhandled) | 🟢 |
| 4.6 | `TMPDIR="$T" CHROME_BIN=/usr/bin/false node test/smoke/smoke.mjs` | `exit 1 in 0s`, `SMOKE FAIL (1):`, `  smoke threw: Chrome exited before CDP came up (code 1)`; `0` dirs under `$T` | pass 1 with `dist/` copied in: `exit 1 in 46s`, `0` `SMOKE FAIL` lines, `Error: Chrome CDP did not come up within 45s (last: no response)` | 🟢 |

### Hygiene

- Clones: under `/Users/kimba/.claude/jobs/8c58a81c/tmp/p2` (at `ff4d4999`, superseded) and `p3` (at `1d97d568`, `b57b4658`, `62ee7782`); the worktree was never edited by a control
- Fake-chrome fixtures leaked by controls on purpose: `16` reaped with `pkill -9 -f 'jobs/8c58a81c/tmp/p[23]/[a-z0-9]+/test/smoke/fixtures/fake-chrome.mjs'`, then `pgrep -f fake-chrome.mjs | wc -l` printed `0`
- Profile dirs leaked by controls under the Mac `$TMPDIR`: `16` removed: 8 named in the control logs, 8 made during the control runs with no live process holding them. `8` older ones (14:30, before this pass started, fixture-shaped) were left alone as not mine
- Real Chrome: U1-3 control `11` reaped by the plan's exact pattern, U1-5 control `0`; guard `0` before each Chrome row
