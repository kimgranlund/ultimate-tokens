# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/sf-U1 @ 1dde820c04ad8de064fad4d0b356c2384a87a841 |
| Files | test/smoke/chrome.mjs (new), test/smoke/launcher.mjs (new), test/smoke/fixtures/fake-chrome.mjs (new), test/smoke/smoke.mjs, package.json (`scripts.smoke`) |
| npm test | 🟢 `✓ all 48 test files passed`, tree clean after |
| npm run build | 🟢 `wrote figma/plugin/ui.html 3780.5 KB`, tree clean after |
| branding | 🟢 `branding: clean (549 files scanned)` |
| Left out | nothing in scope; Q1 (registering launcher.mjs in test/run.mjs TESTS) defaults to no per the plan |

Note for the U1-1 grep row: the four SIGINT/SIGTERM/SIGHUP/exit registrations are one `for` loop over
`Object.keys(SIGNAL_CODES)` in `chrome.mjs`, plus the literal `process.on("exit", fn)` line and the
`SIGNAL_CODES` object literal itself, so the raw grep count is `4` (all four quoted names land on two
lines total, the object literal and the `exit` call), which already clears "4 or more" without
invoking the loop fallback.

The `SMOKE PASS` line, quoted byte for byte from a green run's own stdout:

`SMOKE PASS — gallery · category · editor · export dialog all render in a real browser`

Its new source line in `test/smoke/smoke.mjs` is **296** (was `:293` before this unit; the #709 owner
decides whether `.sdlc/plans/records-followup.md:43` and `.sdlc/questions/records-followup-repoint.md`
get repointed before or after #720 lands, per the plan's Not in scope).

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
