# Review small-fixes U1 · 🔁 FIX-FIRST

Reviewed `b8c204e4` (code at `1dde820c`) against `plan/small-fixes` (`2941e16a`) and the plan's own P/U1 rows, all reproduced fresh (not trusted from the handoff's quoted output).

## Findings

| # | Severity | Finding |
|---|---|---|
| 1 | 🔴 blocking | `test/smoke/smoke.mjs:44-48` leaks the spawned Chrome process (and its profile directory) if a `SIGINT`/`SIGTERM`/`SIGHUP` lands while `launchChrome()` is still awaiting discovery. `onExit(() => closeChrome())` is registered before the `await`, but `closeChrome` only becomes the real `close` after the promise resolves (`closeChrome = close;` on the next line). A signal that arrives during that window runs the still-no-op `closeChrome()`, then `chrome.mjs:64`'s `process.exit(...)` tears the process down before the internal poll loop or its own deadline `close()` ever runs. This is exactly the "close racing a still-starting Chrome" class this review was asked to hunt for, and it directly contradicts both the plan's Risks row ("`onExit` is installed before the launch and `close()` reads `proc` and `dir` from closure state set at spawn time") and the comment at `smoke.mjs:44-45` ("a signal landing during the 45s CDP start-up wait below is still cleaned up"); neither is true for this code shape. Reproduced live: a delayed fixture (3s to discover, `SIGTERM` sent at 1s) left the fake-chrome process and its `ultimate-tokens-smoke-*` profile directory orphaned after the parent exited; killed and swept during this review. |
| 2 | 🟡 note | U1-3's own criterion (`SIGTERM` at t+5s) does not reliably exercise finding 1: the plan's own measured discovery time for real Canary was ~8.5s in one run, so a `SIGTERM` at 5s can land inside the vulnerable window on a slower run and the criterion would then red; it happened to stay green in my rerun (discovery beat 5s this time), so the criterion is not proof the bug is absent, only that it did not fire on this pass. U1-2's legs (c)/(d) do not cover it either: `launcher.mjs`'s `childMain()` calls `onExit(close)` only *after* `await launchChrome(...)` resolves, so the signal is always sent to a child that already has the real `close` wired; the unresolved-promise window is untested anywhere in this unit. |

## Rows re-run (all reproduced independently, not from the handoff's quotes)

| Row | Result | Matches handoff |
|---|---|---|
| P1 `npm test` | `✓ all 48 test files passed`, tree clean | yes |
| P2 `npm run build` | `exit 0`, `wrote figma/plugin/ui.html 3780.5 KB`, tree clean | yes |
| P3 branding + em-dash | `branding: clean (550 files scanned)`, `0`, `0` | yes (file count differs by scan-time drift only, as the plan itself notes for this figure) |
| P4 scope wall vs `origin/main` | `2` (`.sdlc/plans/records-policy.md`, `.sdlc/plans/verdict-frontmatter.md` only) | yes, matches the plan's own account of sibling-unit drift; nothing else appears; this unit's own file set is scope-clean |
| U1-1 greps | `0`,`0`,`1`,`3`,`4`,`1` | yes |
| U1-2 launcher (green) | `exit 0`, 5/5 pass | yes |
| U1-2 control (1) (delete `rmSync` in `close()`) | `1 file changed`; `exit 1`, 4/5 legs FAIL on the profile dir | yes |
| U1-3 signalled real-browser run (guarded: 9333 empty first) | `exit 143`, `0` processes, `0` dirs 5s later | yes, but see finding 2, timing-dependent, not a structural guarantee |
| U1-5 decoy on 9333 (guarded: 9333 empty first) | `exit 0`, `decoy requests: 0`, `1` PASS line | yes |
| U1-6 greps | `1`, `1` | yes |

Controls that edited a file ran in a `git clone -q --shared` from `b8c204e4` (verified `git log -1 --format=%h` = `b8c204e4`), never in the worktree. Fresh `TMPDIR` per real-browser row; `pgrep -f 'remote-debugging-port=9333' | wc -l` printed `0` before each guarded row. All orphaned fake-chrome/Canary processes and `ultimate-tokens-smoke-*` directories created during this review (the repro for finding 1, and control (1)'s deliberate leak) were reaped and swept.

## Other process-lifecycle checks (no issue found)

- Double-invocation of `close()` from `process.exit()` re-triggering the `"exit"` listener: harmless, `closed` flag makes `close()` idempotent (`chrome.mjs:27-32`).
- `exit`/signal handlers never `await`: `close()` is fully synchronous (`proc.kill` + `rmSync`), so nothing is silently dropped by Node's synchronous-only `"exit"` event contract.
- `DevToolsActivePort` read-before-complete: guarded by parsing the first line as an integer and retrying on parse failure (`chrome.mjs:44-49`), not just existence.
- A deadline reached internally by `launchChrome` itself does clean up correctly (leg (e), reproduced green); the gap is specifically the caller-side window before the promise resolves, not the internal deadline path.

## Verdict

🔁 FIX-FIRST on finding 1. Every plan row as written passes, but the plan's own stated risk ("signal during the start-up wait") is not actually closed by this implementation: `smoke.mjs` needs `close` reachable before the `await` (e.g. `launchChrome` returning `{ close, ready }` synchronously, or `chrome.mjs` tracking spawned-but-undiscovered processes for `onExit` to reach directly) so a signal landing before discovery still kills the browser it spawned.

## Round 2 · re-review at `85f6e1e5` · 🟢 PASS

Reviewed the rework delta (`800b2c99..85f6e1e5`: `git diff 800b2c99..85f6e1e5 -- test/ package.json .sdlc/handoffs`), everything reproduced fresh, nothing trusted from the rework handoff's own quotes.

### The fix for finding 1

`launchChrome()` now returns `{ proc, dir, close, ready }` synchronously (`test/smoke/chrome.mjs`), not a `Promise` of the whole object; `close` is reachable in the same tick the function returns, before discovery even starts. `smoke.mjs` calls `onExit(close)` in that same tick, then `await ready` for the port. This closes the exact gap finding 1 named: `close` is no longer gated behind the promise that discovery itself determines.

I re-ran my own finding-1 repro against the fixed code (a delayed fixture, 3s to discover `DevToolsActivePort`, `SIGTERM` sent at 1s, well inside the old vulnerable window): the parent died on the signal, and no fake-chrome process or `ultimate-tokens-smoke-*` profile directory survived. The leak is closed at the mechanism level, not just on the one criterion that happened to dodge it in pass 1.

### Leg (f) and its controls, rerun fresh in throwaway clones off `85f6e1e5`

| Check | Result | Matches handoff |
|---|---|---|
| `node test/smoke/launcher.mjs` (green) | `exit 0`, 6/6 pass, tail line unchanged | yes |
| U1-2 control (1): delete `rmSync` in `close()` | `1 file changed`; `exit 1`, legs (b)(c)(d)(e)(f) FAIL on the dir | yes, leg (f) now among the failing legs |
| U1-2 control (2): drop `SIGTERM` from `SIGNAL_CODES` | `1 file changed`; `exit 1`, legs (c) and (f) FAIL on the fake pid, nothing else | yes |
| U1-2 control (3): skip `proc.kill` in `close()` | `1 file changed`; `exit 1`, legs (b)(c)(d)(e)(f) FAIL on the fake pid | yes |
| leg (f)'s own control: `childBeforeDiscoveryMain` reverted to print the pid/dir line first, then `await ready`, then `onExit(close)` (mirroring the pass-1 bug shape) | `exit 1`, only leg (f) FAILs: `fake pid ... still alive 2s after SIGTERM` | yes, and this is the reproduction that matters: the same mutation that caused finding 1 now fails exactly one leg, the one built to catch it |

### Other rows rerun fresh

| Row | Result | Matches handoff |
|---|---|---|
| U1-1 greps | `0`, `0`, `1`, `4`, `4`, `1` (`DevToolsActivePort` now `4`, up from `3`: the new `ready`-shape comment/closure adds a line) | yes |
| P3 branding + em-dash | `branding: clean (553 files scanned)`, added-line em-dash count `0` | yes |
| U1-3 signalled real-browser run (guarded: `pgrep -f 'remote-debugging-port=9333'` printed `0` first) | `exit 143`, `0` processes, `0` directories 5s later | yes |
| P4 scope wall vs `origin/main` | `1` (`.sdlc/plans/verdict-frontmatter.md` only), not the handoff's claimed `0` | see note below |

P4 note: the rework's merge (`c215331a`, 2026-09-22T13:30) brought the branch level with `origin/main` at that moment, but `origin/main` moved again afterward (`40cf8567`, 13:42, a `verdict-frontmatter` revision) before I ran this check, so one file reappears. This is the same class of drift pass 1's P4 flagged as 🟡: a sibling unit landing on `main` between measurement and rerun, not a defect in this unit's own file set (`git diff --name-only origin/main..85f6e1e5` shows nothing else outside the scope wall). Informational for the Orchestrator's pre-land rebase, not a review blocker.

### Verdict

🟢 PASS. Finding 1 is fixed at the mechanism level (verified by reproduction, not just by the new leg), leg (f) and all three original controls discriminate correctly against `85f6e1e5`, and every other row I reran reproduces the rework handoff's account. No new findings.

verdict: 🟢
