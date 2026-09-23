# Handoff U2 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/sf-U2 off plan/small-fixes @ 262ae996; code at 7ac1377e (8fb69991 the grandchild, 7ac1377e leg (b) closes on a failed read), this handoff on top |
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
| Zombie risk on Linux | `isAlive` uses `kill(pid, 0)`, which reads a zombie as alive. Docker `node:24` at the head passes 6 of 6, so the orphaned grandchild is reaped in time there |
| Leg (e) timing | The pid file must appear within the 1500 ms deadline. It is written at fixture startup; no flake seen in the runs above |
| Scratch | clones under `$TMPDIR/sfU2-HSl7` (`mut`, `old`, `nospawn`), never inside the repo. 31 older `ultimate-tokens-smoke-*` dirs in `$TMPDIR` predate this unit (none newer than 20 min at check) and were left alone |
