# Handoff U2 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/sf-U2 off plan/small-fixes @ 262ae996; code at b5b8dc47 (8fb69991 the grandchild, 7ac1377e leg (b) closes on a failed read, b5b8dc47 the review F1 fix), this handoff on top. See Rework at the end |
| Files | test/smoke/fixtures/fake-chrome.mjs, test/smoke/launcher.mjs. chrome.mjs and smoke.mjs not touched |
| npm test | 🟢 exit 0, `✓ all 48 test files passed` |
| npm run smoke | 🟢 exit 0, launcher `PASS:` line then `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser`; tree `0` after, node_modules symlink removed |
| Left out | nothing in scope |

## What changed

| File | Change |
|---|---|
| fake-chrome.mjs | Right after arg validation, under every `FAKE_CHROME_*` mode, one statement spawns `node -e "setTimeout(() => {}, 60000)" fake-chrome-grandchild` (not detached, stdio ignored, so it shares the fake's process group) and writes its pid to `fake-chrome-grandchild.pid` in the profile dir. One statement, so deleting it removes the grandchild and the file together. The 60 s self-exit cap means a red run cannot leave an orphan for good, and it is far longer than any 2 s check |
| launcher.mjs | `readGrandchild(leg, dir)` FAILs on a missing file, an unparseable pid, or a grandchild already dead before the cleanup (no vacuous pass). `assertGrandchildGone` FAILs with `leg (<x>): grandchild pid <n> still alive 2s after <what>`. Leg (b) reads after `ready`, inside a try whose finally calls `close()`. Legs (c), (d), (f) read in the parent once the child prints its line, poll up to 3 s for the file, then signal (a failed read still signals, so the child cleans up). Leg (e) polls while the launch is pending, stopping when `ready` settles. The signal-leg timeout path now kills the fake by group and the grandchild by pid, so the test itself orphans nothing. Leg (a) is unchanged. Still six legs, the final `PASS:` line byte for byte |

## Ran

| # | Command | Evidence | Negative control | Control evidence | State |
|---|---|---|---|---|---|
| U2-1 | U1-2's command at the head | `exit 0`, `6`, `0`, `PASS: launcher discovers its port from DevToolsActivePort and leaves no process on close, SIGTERM, SIGINT or deadline` | parent-only mutant (U2-2) | `exit 1`, 5 FAIL | 🟢 |
| U2-2 | clone, `chrome.mjs:66` to `try { proc.kill("SIGKILL"); } catch {`, `git diff --stat` `1 file changed, 1 insertion(+), 1 deletion(-)`; launcher run | `exit 1`; FAIL count `5`, FAIL lines with `grandchild` `5`. Lines: `leg (b): grandchild pid 47565 still alive 2s after close()`, `leg (c): grandchild pid 47751 still alive 2s after SIGTERM`, `leg (d): grandchild pid 47999 still alive 2s after SIGINT`, `leg (e): grandchild pid 48136 still alive 2s after the deadline`, `leg (f): grandchild pid 48287 still alive 2s after SIGTERM`. Rerun with the final launcher (7ac1377e): `exit 1`, `5`, `5` | same mutant at 262ae996 (clone, `1 file changed`) | `exit 0`, `6` pass, `0` FAIL (the critic's finding reproduced) | 🟢 |
| U2-3 | `pgrep -f fake-chrome-grandchild \| wc -l` right after the launcher exits | mutant: `6` (legs b to f plus leg a, which does not assert); head: `0`. 62 s after the mutant run: `0` (the cap reaped them) | clone with the fixture's spawn statement deleted (`1 file changed, 1 deletion(-)`) | `exit 1`, 5 FAIL of the form `leg (b): grandchild pid file missing in <dir> (ENOENT)`, one per leg b to f. First run of this control found leg (b) threw before `close()` and left a fake running (reaped by exact clone path; its profile dir removed); fixed in 7ac1377e, rerun: `exit 1`, `5` missing-file FAILs, `0` fakes left | 🟢 |
| U2-4 | U1-7: `env -u TMPDIR node test/smoke/launcher.mjs`; U1-8: Docker `node:24` (`docker info`: up) | U1-7: `exit 0`, `6`, `0`; U1-8: `exit 0`, `6` | U2-2 mutant in Docker `node:24` | `exit 1`, 5 FAIL, each `grandchild pid <n> still alive 2s after ...` (pids 39, 61, 83, 98, 121) | 🟢 |
| U2-5 | `git fetch -q origin; git diff --stat origin/plan/small-fixes...HEAD -- . ':!.sdlc'` | `test/smoke/fixtures/fake-chrome.mjs \| 12`, `test/smoke/launcher.mjs \| 76`, `2 files changed, 74 insertions(+), 14 deletions(-)` | mutant clone working tree vs `origin/plan/small-fixes` (262ae996) | `3 files changed`, `test/smoke/chrome.mjs \| 2 +-` the third | 🟢 |
| U2-6 | `npm test; npm run smoke; git status --short \| wc -l` (node_modules symlinked, then removed) | exit 0, exit 0 with `SMOKE PASS`, `0`; `pgrep -f fake-chrome-grandchild` `0` after | P2's control (not rerun here; U1 recorded it) | not rerun | 🟢 |

## Notes for the reviewer

| Item | Detail |
|---|---|
| Orphans under the mutant | Deliberately not reaped by the test: U2-3 reads them after the launcher exits. The fixture's 60 s cap bounds them |
| Zombie risk on Linux | `isAlive` uses `kill(pid, 0)`, which reads a zombie as alive. The Docker rows need a PID 1 that reaps (`sh -c` as U1-8 runs it, or `--init`); see the F2 answer below |
| Leg (e) timing | The pid file must appear within the 1500 ms deadline. It is written at fixture startup; no flake seen in the runs above |
| Scratch | clones under `$TMPDIR/sfU2-HSl7` (`mut`, `old`, `nospawn`), never inside the repo. 31 older `ultimate-tokens-smoke-*` dirs in `$TMPDIR` predate this unit (none newer than 20 min at check) and were left alone |

## Rework (review FIX-FIRST at 310a58a8)

| Finding | Answer |
|---|---|
| F1, the pid-file read race | Fixed in `launcher.mjs` only (b5b8dc47). `grandchildWritten(dir)` is true only when the file parses as `^\d+\s*$`; `waitForGrandchild` (legs c, d, f) and leg (e)'s pending-launch poll wait on it instead of `existsSync`. The fixture keeps its one-statement write: a tmp-then-rename there would take two statements and break U2-3's spawn-deleted control. The spawn-deleted control still reds on `ENOENT` (the bounded wait ends and the read throws) |
| F1 control | A clone at 7ac1377e whose fixture writes the pid file empty, then the pid 300 ms later (`1 file changed, 1 insertion(+), 1 deletion(-)`), standing in for a fixture preempted between open and write. Old launcher: `exit 1`, `leg (e): grandchild pid file reads ""`, `leg (f): grandchild pid file reads ""`. The b5b8dc47 launcher in the same clone: `exit 0`, `6` pass, `0` FAIL, `0` fakes and `0` grandchildren left |
| F2, reaping PID 1 | Agreed, no code change. Legs (b) to (f) all read a reparented process's liveness with `kill(pid, 0)`, so any Linux run needs a PID 1 that reaps: a VM init (CI), `sh -c` (U1-8's command) or `docker run --init`. `node` as PID 1 reds (b) to (f) on zombies. The plan base already needed this for (c), (d) and (f) through the fake; U2 extends it to (b) and (e) |
| F3, leg (e) start-up | Agreed, kept at 1500 ms. The grandchild's pid is written right after arg validation, before `listen`, so it lands in about one Node start-up (20 ms here, per the review); a slow start reds on `pid file missing`, never passes. If a CI run ever reds there, raise leg (e)'s `deadlineMs`, not the poll |

Rerun at b5b8dc47:

| # | Evidence | Control evidence | State |
|---|---|---|---|
| U2-1 | `exit 0`, `6`, `0`, `PASS: launcher discovers its port from DevToolsActivePort and leaves no process on close, SIGTERM, SIGINT or deadline`; `pgrep -f fake-chrome-grandchild` `0` after | mutant below | 🟢 |
| U2-2 | mutant clone (`chrome.mjs` `1 file changed, 1 insertion(+), 1 deletion(-)`): `exit 1`, `5` FAIL, `5` with `grandchild`: `leg (b): grandchild pid 24521 still alive 2s after close()`, `leg (c): grandchild pid 24671 still alive 2s after SIGTERM`, `leg (d): grandchild pid 25169 still alive 2s after SIGINT`, `leg (e): grandchild pid 26022 still alive 2s after the deadline`, `leg (f): grandchild pid 26333 still alive 2s after SIGTERM` | same mutant at 262ae996: `exit 0`, `6` pass | 🟢 |
| U2-3 | right after the mutant run `6`; at the head `0` | spawn statement deleted: `exit 1`, `5` `grandchild pid file missing`, `0` fakes left | 🟢 |
| U2-4 | U1-7: `exit 0`, `6`, `0`; U1-8 Docker `node:24` `sh -c`: `exit 0`, `6` | mutant in Docker: `exit 1`, `5` grandchild FAILs | 🟢 |
| U2-5 | `git diff --stat origin/plan/small-fixes...HEAD -- . ':!.sdlc'`: `2 files changed, 78 insertions(+), 14 deletions(-)`, only `fake-chrome.mjs` and `launcher.mjs` | mutant clone shows `chrome.mjs` as a third file (pass 1) | 🟢 |
| U2-6 | `npm test` exit 0 `✓ all 48 test files passed`; `npm run smoke` exit 0, `SMOKE PASS` line present; `git status --short` empty after, node_modules symlink removed | P2's control, not rerun | 🟢 |

Scratch for the rework: `$TMPDIR/sfU2r-jLRs` (`gap`, `mut`, `old`, `nospawn`). The shell died once with exit 144 during the nospawn step; that step was rerun on its own and is the row above.
