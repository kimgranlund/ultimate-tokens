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
