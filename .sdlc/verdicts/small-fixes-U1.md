---
kind: verdict
plan: small-fixes
unit: U1
ticket: "#717"
branch: unit/sf-U1
base: plan/small-fixes @ c215331a
grade: verifier-l1 (worker `sf-U1-verifier-l1-p1`, opus medium), graded by the Verifier seat
contract: plan revision 4 (U1-2 expects 6 legs, leg (f) added)
pass: 1
written: 2026-09-22
---

# Verdict small-fixes U1 · 🟡 · 11 🟢, 1 🟡, 0 🔴 on criteria, and one landing hazard in `.sdlc/board.md`

verdict: 🟡
sha: 9478d3067bd10e46bc32d7261e2f6ebb0e7bd3f1

The smoke launcher work is right: it owns its Chrome and its port, it cleans up on every exit path,
and it ignores a stranger on 9333. Every row passes, and every control red on its own plant.
The yellow is P4, which reads non-zero only because `origin/main` moved. The hazard is not in the
smoke work. The unit's `board.md` is five rows short, and merged as it stands, it deletes those rows
without a conflict. The worker ran every row, and every Chrome leg behind the plan's port-9333 guard
(report: `/tmp/v13/sf-U1-verify.md`). I re-derived P4, U1-1, U1-6 and the board trace myself. The
handoff and the review pass `verdict.py check` (exit `0`), a shape check only.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test` green, count agrees, tree stable | 🟢 | worktree: `exit 0`, `✓ all 48 test files passed`, TESTS count `48`, `0` status lines | a clone with `"scrim` renamed in `role-table.json`: `exit 1`, `FAIL  refs-canonical`, `✗ 1/48 test file(s) failed` |
| P2 | `npm run build` green, tree clean after | 🟢 | head clone: `exit 0`, `wrote figma/plugin/ui.html 3780.5 KB`, `0` | the `smoke` script naming a missing file: `exit 1`, `Cannot find module` count `1` |
| P3 | branding clean, no added prose em dash | 🟢 | `branding: clean (553 files scanned)`, `0`, `0`; the listing of third-command matches is empty | a copied ADR file under `.sdlc/verdicts/` gives `FAIL: 3 branding violation(s)`; one planted prose line moves the second figure to `1` and lists itself in the third |
| P4 | scope wall | 🟡 | as written against `origin/main` `5f47723c` it prints `4`, and the `package.json` stat is `1 file changed, 1 insertion(+), 1 deletion(-)`. All four refused names are main-only records (`verdict-frontmatter.md`, its U1 counts question, and my U1 and U2 verdicts), and none of them is reachable from the unit head. The unit's own changes against its merge base `1bb720d9`, through the same filter, print `0`. The plan says the row reads `0` only on a rebased branch, and this branch has not been rebased since `origin/main` moved. The Orchestrator reported `1`; by the time I ran it the figure was `3`, and it is `4` now | the plan's four-name fixture prints `2`. The row is yellow on its precondition, not on the unit's scope |
| P5 | smoke green, launcher ran, this run's Chrome and profile gone | 🟢 | head clone: `exit 0`, `SMOKE PASS` `1`, `PASS: launcher` `1`, then `0`, `0` | the plan plants none for a green run; U1-3 is the row that discriminates |
| U1-1 | no fixed port, port read from the profile file, every exit path handled | 🟢 | mine: `test/smoke/chrome.mjs:0`, `test/smoke/smoke.mjs:0`, `1`, `4`, `4`, `1`. The `4` for signals is not four registrations: two of the four lines are comments. With comments dropped it prints `2`. So I used the row's loop fallback and read the code: `process.on("exit", fn)` plus `for (const sig of Object.keys(SIGNAL_CODES))` over `{ "SIGHUP": 129, "SIGINT": 130, "SIGTERM": 143 }`. All four paths are registered | `origin/main`'s `smoke.mjs` prints `1` on the fixed-port grep, and `chrome.mjs` does not exist there |
| U1-2 | the launcher test is green and every leg ran | 🟢 | `exit 0`, `6`, `0`, and the plan's `PASS: launcher ...` tail line | three one-file clones: without `rmSync`, legs b to f red on the directory; without `SIGTERM`, leg c red on `fake pid ... still alive 2s after SIGTERM`; without `proc.kill`, legs b to e red on the live fake pid |
| U1-2 (f) | a signal before discovery still cleans up | 🟢 | `pass  leaves no process or directory after a signal while discovery is still pending` | `close()` made a no-op until discovery: `FAIL ... fake pid 57611 still alive 2s after SIGTERM`. Blind spot noted below |
| U1-3 | a signalled real-browser run leaves no Chrome, no profile, no fixed port | 🟢 | `exit 143`, `0`, `0`, and `12` matching processes were alive just before the signal, so Chrome was up when it landed | `origin/main` clone, guard `0` first: `exit 143`, old needle `11`, a listener on 9333. All 11 were Chrome Canary. Reaped by the exact `pkill -9 -f 'remote-debugging-port=9333'`, `11` before and `0` after |
| U1-4 | a green run leaves no Chrome and no profile dir | 🟢 | P5's last two figures: `0`, `0` | U1-2's clone (1) reds on `profile dir ... still present` |
| U1-5 | a stranger on 9333 is never consulted | 🟢 | guard `0`, then `exit 0`, `decoy requests: 0`, `1` | `origin/main`: `exit 1`, `decoy requests: 113`, `0`, `smoke threw: Chrome CDP did not come up within 45s (last: HTTP 404)` |
| U1-6 | CI runs the launcher test before the browser | 🟢 | mine: `1`, `1` | `origin/main`'s `package.json` prints `0` for the new script line |

## The landing hazard: `.sdlc/board.md`

| item | state | evidence | negative control |
| --- | --- | --- | --- |
| the unit's `board.md` deletes five rows, and the merge into `plan/small-fixes` would drop them silently | 🔴 if merged as it stands | the unit head has `31` board rows; its merge base, `plan/small-fixes` and `origin/main` have `36`. The unit's board diff against its merge base is five deletions and nothing else: its own row, both records-policy rows and both verdict-frontmatter rows. `git merge-tree --write-tree plan/small-fixes HEAD` exits `0`, so the merge is clean, and the merged board has `31` rows. The rows were lost when merge `5cf7d52f` resolved `board.md` to the unit side, and the unit's first commit `1dde820c` already has `31`. Against `origin/main` the same file conflicts | in a clone, the unit's `board.md` taken from the plan head (`1 file changed, 5 insertions(+)`): the same merge exits `0` with `36` rows. The loss comes entirely from the unit's copy of the board |

The Orchestrator said these rows are restored at the unit merge. That is a statement about a merge
that has not happened yet, so I cannot count it as evidence. It matters because the merge will not
stop to ask. The 🟡 above holds only if the unit merge does not take the unit's `board.md`. Merged
as it stands, this would be 🔴. I will count the board rows on `plan/small-fixes` at pre-land.

## Noted, not graded

- The handoff says the U1-1 signal count reaches `4` from "two lines total ... which already clears
  4 or more without invoking the loop fallback". `grep -c` counts lines: two lines give `2`, and
  the `4` includes two comments. The code is right and the explanation is not, and it is the
  handoff describing its own evidence wrongly.
- Leg (f) cannot see a missing kill. With `proc.kill` removed, (f) still passes: the fake dies on
  its own when its delayed port-file write lands in a directory SIGTERM already removed. Legs b to e
  catch the missing kill, so U1-2 as a whole still does.
- `const { port: PORT } = await ready;` at `smoke.mjs:50` sits outside the `try` at `:61`, so a CDP
  deadline now exits `1` with an uncaught error, not the `SMOKE FAIL` block. The message text
  survives, and `git grep` finds no consumer of `SMOKE FAIL` or `smoke threw` outside `smoke.mjs`.
  It is cosmetic for CI and no row grades it, though the design says the diagnosis path is unchanged.
- A fault of mine. While the worker held the guard, my wait loop's own command text contained
  `remote-debugging-port=9333`, so `pgrep -f` counted my shell. That held U1-5's first attempt at
  `guard: 1`, and the worker waited correctly. It would also have made my shell a target of the
  plan's `pkill -9 -f`, had the two overlapped. They did not. The plan's guard and reap both match
  command text, so any process whose command line merely mentions the needle counts, including the
  seat watching the run.
