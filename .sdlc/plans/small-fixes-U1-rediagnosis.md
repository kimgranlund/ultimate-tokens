---
kind: rediagnosis
plan: small-fixes
unit: U1
ticket: "#717"
pass: 2
seat: planner (worker `sf-U1-planner-p2`)
head: a1a4ffc6 (`plan/small-fixes`, PR #735, CI run 35785765215 red)
written: 2026-09-22
inputs: `.sdlc/verdicts/small-fixes-prepr.md` (B1, B2, P5), `.sdlc/verdicts/small-fixes-U1.md` (pass-2 correction), `.sdlc/verdicts/small-fixes-U1-review.md` (both rounds), `.sdlc/handoffs/small-fixes-U1.md`, `.sdlc/plans/small-fixes.md` (revisions 3 to 4), `gh run view 35785765215 --log-failed`, the four smoke files and `package.json` at a1a4ffc6
---

# Re-diagnosis small-fixes U1 · pass 2 · why leg (f) is red on Linux and green on every Mac

Every command below ran from a `git clone -q --shared` of the plan worktree checked out at `a1a4ffc6`
(`clone asis at a1a4ffc6`), under `/Users/kimba/.claude/jobs/8c58a81c/tmp/sfp2/`, never in a worktree.
Real Linux came from Docker Desktop (`node:24`, `Linux v24.21.0`), started for this pass; the Mac is
`node v24.18.0` with `TMPDIR=/var/folders/0b/.../T/`.

## 1. Root cause

| # | Claim | State | Command | Output |
|---|---|---|---|---|
| RD1 | The mechanism: Node stringifies a non-string `process.env` assignment, so restoring an unset variable stores the text `"undefined"` | 🟢 | `env -u TMPDIR node -e 'const os=require("os"); const prev=process.env.TMPDIR; process.env.TMPDIR="/x"; process.env.TMPDIR=prev; console.log("restored:", JSON.stringify(process.env.TMPDIR), "os.tmpdir():", os.tmpdir())'` | `restored: "undefined" os.tmpdir(): undefined` |
| RD2 | Same probe with `TMPDIR` set (every Mac) | 🟢 | as RD1 with `TMPDIR=/tmp/x` | `restored: "/tmp/x" os.tmpdir(): /tmp/x` |
| RD3 | Node documents this as deprecated behaviour, so a future Node throws at `launcher.mjs:153` instead of poisoning | 🟢 | `node --pending-deprecation -e 'process.env.X = undefined'` | `DEP0104] DeprecationWarning: Assigning any value other than a string, number, or boolean to a process.env property is deprecated` |
| RD4 | The CI failure reproduces on this Mac with nothing but `TMPDIR` unset | 🟢 | `env -u TMPDIR node test/smoke/launcher.mjs; echo exit $?; grep -c '^  pass  '` | `exit 1`, `5`, `FAIL  leaves no process or directory after a signal while discovery is still pending: child never printed a pid/dir line`, `FAIL: launcher (1/6 legs failed)` (the CI log's lines, byte for byte) |
| RD5 | The same clone with `TMPDIR` set is green | 🟢 | `node test/smoke/launcher.mjs; echo exit $?; grep -c '^  pass  '` | `exit 0`, `6`, `PASS: launcher discovers its port from DevToolsActivePort and leaves no process on close, SIGTERM, SIGINT or deadline` |
| RD6 | It reproduces on real Linux, `TMPDIR` unset there by default | 🟢 | `docker run --rm -v "$S/asis:/w" -w /w node:24 sh -c 'echo "TMPDIR=${TMPDIR:-<unset>} $(uname -s) $(node --version)"; node test/smoke/launcher.mjs; echo "exit $?"'` | `TMPDIR=<unset> Linux v24.21.0`, `5` pass lines, the same `FAIL` line, `exit 1` |
| RD7 | What the leg (f) child actually dies of; the parent never shows it | 🟢 | `TMPDIR=undefined node test/smoke/launcher.mjs --child-before-discovery 2>&1 \| grep -m2 -E 'Error\|ENOENT'` | `Error: ENOENT: no such file or directory, mkdtemp 'undefined/ultimate-tokens-smoke-XXXXXX'`, `code: 'ENOENT'` |
| RD8 | GitHub's `ubuntu-latest` has no `TMPDIR` (the reason no Mac saw it) | 🟢 | the failing run: legs a to e `pass` then `FAIL ... child never printed a pid/dir line` at `21:20:21`, 30 ms after leg (e); RD6 shows the identical outcome under an unset `TMPDIR` and RD5 the opposite under a set one | `gh run view 35785765215 --log-failed`, last 9 lines |

The chain, in order: leg (e) (`launcher.mjs:141-153`) sets `process.env.TMPDIR` to a scratch dir and
restores it in `finally` by plain assignment. On a host where `TMPDIR` was never set, `prevTmpdir` is
`undefined`, and the restore writes the string `"undefined"` into the launcher's own environment.
Leg (f) (`launcher.mjs:128-134`) then spawns its child with `env: { ...process.env, ... }`
(`launcher.mjs:96`), so the child inherits `TMPDIR=undefined`; its `launchChrome` calls
`mkdtempSync(join(tmpdir(), ...))` (`chrome.mjs:25`), which is `mkdtemp 'undefined/ultimate-tokens-smoke-XXXXXX'`,
`ENOENT`, before the fixture is even spawned. The child dies on an unhandled rejection with its
stderr piped and never read (`launcher.mjs:96`, `stdio: ["ignore","pipe","pipe"]`, no `stderr` listener),
so the parent's 5 s timer fires and prints `child never printed a pid/dir line`. Leg (f) is the only
leg that runs after (e), which is why exactly one leg is red and why the red names the wrong cause.

The root cause is therefore not "line 153" but "leg (e) mutates process-global state and leg (f) inherits
it, and the one place that mutation is undone is wrong for an unset variable". The fix at line 153 is
sufficient; the class is worth naming because a second leg that reads `process.env` after (e) would hit
the same thing.

### The other Mac assumptions, checked

| # | Assumption | State | Evidence |
|---|---|---|---|
| A1 | `TMPDIR` set | 🔴 | RD1 to RD8: the only one that fails |
| A2 | `/var/folders` paths | 🟢 none | `grep -n -E '/var/folders' test/smoke/*.mjs test/smoke/fixtures/*.mjs` prints nothing; every path is `join(tmpdir(), ...)` |
| A3 | `pgrep` flags | 🟡 | `pgrep -f <needle>` at `launcher.mjs:161` is procps-compatible and `node:24` ships `/usr/bin/pgrep` (`command -v pgrep`). But the predicate is vacuous when `pgrep` is absent: see 4.1 |
| A4 | signal semantics (`SIGHUP`/`SIGINT`/`SIGTERM`, `128+n` exit codes, `kill(pid, 0)` as liveness) | 🟢 | RD6/RD8: legs (c) and (d) `pass` on Linux in CI and in Docker |
| A5 | `process.execPath` as the fake browser | 🟢 | legs (a) to (e) `pass` on Linux (RD6) |
| A6 | path separators | 🟢 | only `join`/`resolve` from `node:path`; no literal `/` joins in the four files (`grep -n '"/' test/smoke/chrome.mjs test/smoke/launcher.mjs` prints only the URL literals `/json/version`, `/devtools/browser/fake`) |
| A7 | reaping of the SIGKILLed fake by whoever inherits it | 🟢 not observed | Docker without `--init` and the GitHub VM both passed legs (c), (d); with `--init`-less containers a zombie would still answer `kill(pid, 0)`, but neither host showed it |

What I could reproduce: the whole CI failure, on the Mac (RD4) and on real Linux (RD6), plus the green
after the fix on both (F1, F2). What I could not: anything involving a real Linux Chrome (P5's CI leg,
the plan's Risk row 1, helper-process lifetimes under `SIGKILL` on the runner). No Linux Chrome exists
on this host and the `node:24` image has none; those stay CI-only, see §3.

## 2. Why no criterion caught it

| # | Row | Ran where | What it could see |
|---|---|---|---|
| G1 | U1-2 (`node test/smoke/launcher.mjs`, 6 legs) | builder, reviewer round 1 and 2, verifier: all on this Mac, `TMPDIR` set by the OS | never the unset case. The plan says (line 104) `Rows U1-1, U1-2 and U1-6 run on any host and in CI`, a claim no row evidenced on a second host |
| G2 | U1-2's four negative controls (`rmSync`, `SIGTERM`, `proc.kill`, leg (f)'s own) | Mac clones | all edit `chrome.mjs`/`launcher.mjs` logic; none varies the environment |
| G3 | P5 (`npm run smoke` green `...in CI by the build-test job's smoke step`) | local only; the verdict's row P5 cites `head clone: exit 0, SMOKE PASS 1, PASS: launcher 1` and no run id | the CI leg named in the row's own text was never run: `gh run list --branch unit/sf-U1 --limit 3` prints nothing, because `ci.yml` triggers on `push: branches: [main]` and `pull_request` only, and the draft PR was opened after the verdict (plan line 138, `Draft at the verified unit`) |
| G4 | Risk row 1 (`the first CI run of the draft PR is U1-2's and P5's CI leg`) | nowhere | the plan itself scheduled the only cross-host evidence after the verdict, then the verdict graded the row as if it had happened |
| G5 | U1-6 (`grep -c 'npm run smoke' .github/workflows/ci.yml`) | Mac | proves the script line exists, not that it passes anywhere |
| G6 | leg (e)'s own assertion | Mac, and it `pass`ed on Linux too | the leg restores state after its assertions; a leg cannot see the damage it leaves for the next leg. The poison is only visible to the leg after it |

So: every row ran only on a Mac (G1, G2, G5, G6); P5 names CI and was never evidenced (G3); the pass-1
verdict's `🟢` on P5 rests on a local run, which the Verifier's pass-2 correction already states. The
criteria gap has two parts: no row varies the host environment, and a row that names CI had no rule
requiring a run id on the graded sha.

## 3. The repair

### 3.1 The fix

| # | Change | Where | Why this shape |
|---|---|---|---|
| X1 | restore `TMPDIR` by deleting it when it was unset: `if (prevTmpdir === undefined) delete process.env.TMPDIR; else process.env.TMPDIR = prevTmpdir;` | `test/smoke/launcher.mjs:153` | one line, the exact defect; verified F1 to F3 below |
| X2 | surface the child's stderr in a signal leg's FAIL line (collect `child.stderr` into a buffer, append its last line to the `child never printed a pid/dir line` error) | `launcher.mjs:96-118` | the CI log would have said `ENOENT: ... mkdtemp 'undefined/...'` instead of a symptom; cost is four lines, no behaviour change on green |
| X3 | (optional, same class) leg (e) stops mutating `process.env` at all: give `launchChrome` a `{ tmpRoot }` option defaulting to `tmpdir()` and pass `scratch` | `chrome.mjs:24-25`, `launcher.mjs:141-153` | removes the state leak between legs entirely; touches the launcher's public shape, so only if the owner wants it; X1 alone closes the red |

Fix verified in a clone with only X1 applied (`git diff --stat`: `1 file changed, 1 insertion(+), 1 deletion(-)`):

| # | Check | State | Command | Output |
|---|---|---|---|---|
| F1 | Mac, `TMPDIR` unset | 🟢 | `env -u TMPDIR node test/smoke/launcher.mjs; echo exit $?; grep -c '^  pass  '` | `exit 0`, `6`, `PASS: launcher ...`; `ls -d /tmp/ultimate-tokens-smoke-* /tmp/launcher-legE-*` before `0` after `0` |
| F2 | real Linux, `TMPDIR` unset | 🟢 | `docker run --rm -v "$S/fix:/w" -w /w node:24 sh -c 'node test/smoke/launcher.mjs; echo "exit $?"; ls -d /tmp/ultimate-tokens-smoke-* /tmp/launcher-legE-* 2>/dev/null \| wc -l; ps -eo pid,args \| grep -c "[f]ake-chrome"'` | `6` pass, `exit 0`, `0` dirs, `0` processes |
| F3 | Mac and Linux, `TMPDIR` set (no regression) | 🟢 | `node test/smoke/launcher.mjs` on the Mac; `docker run --rm -e TMPDIR=/tmp ...` | `exit 0`, `6`; `exit 0` |
| F4 | negative control: the pass-1 line 153 | 🟢 reds | RD4 and RD6 are that control: the unfixed clone under `env -u TMPDIR` prints `exit 1`, `5`, the (f) `FAIL` line | as RD4/RD6 |

### 3.2 The criteria change (proposed rows for plan revision 6)

`S` is the seat's scratch dir, `C` a clone at the unit head. Every row below is host-independent unless
it says Linux.

| # | Criterion | Command | Expected | Negative control | Today (a1a4ffc6) |
|---|---|---|---|---|---|
| U1-7 | the launcher is green with `TMPDIR` unset, and leaves nothing under the default temp root | `env -u TMPDIR node test/smoke/launcher.mjs > "$S/u.log" 2>&1; echo "exit $?"; grep -c '^  pass  ' "$S/u.log"; ls -d "$(env -u TMPDIR node -p 'require("os").tmpdir()')"/ultimate-tokens-smoke-* "$(env -u TMPDIR node -p 'require("os").tmpdir()')"/launcher-legE-* 2>/dev/null \| wc -l` | `exit 0`, `6`, `0` | in `C`, `launcher.mjs:153` reverted to `process.env.TMPDIR = prevTmpdir;` (the pass-1 line): `exit 1`, `5`, and the log's FAIL line names leg (f) | `exit 1`, `5` (RD4) |
| U1-8 | the launcher is green on Linux, `TMPDIR` unset | `docker run --rm -v "$PWD:/w" -w /w node:24 sh -c 'node test/smoke/launcher.mjs; echo "exit $?"' > "$S/lx.log" 2>&1; tail -1 "$S/lx.log"; grep -c '^  pass  ' "$S/lx.log"` (Docker Desktop must be up: `docker info >/dev/null && echo up`) | `exit 0`, `6` | the same clone as U1-7's control: `exit 1`, `5` | `exit 1`, `5` (RD6) |
| U1-9 | a signal-leg red names the child's own error, not the symptom | in `C`, with `TMPDIR=/nonexistent` exported for the child only (edit `legF`'s `env` to add `TMPDIR: "/nonexistent"`): `node test/smoke/launcher.mjs 2>&1 \| grep -c 'ENOENT'` | `1` or more (the FAIL line carries the child's stderr) | the head as it stands prints `0` and `child never printed a pid/dir line` | `0` (RD7 shows the text exists only on the child's swallowed stderr) |
| U1-10 | leg (e) cannot pass by `pgrep` being absent | `PATH=/usr/bin:/bin:/nonexistent` is not enough on a host that has `pgrep`; run in Docker: `docker run --rm -v "$PWD:/w" -w /w node:24 sh -c 'mv /usr/bin/pgrep /usr/bin/pgrep.h; node test/smoke/launcher.mjs 2>&1 \| grep -E "deadline"'` | a `FAIL` line naming leg (e) with `pgrep` in its text | the head prints `pass  leaves no process or directory after a deadline with no DevToolsActivePort` with `pgrep` hidden (4.1) | `pass` (vacuous) |
| P5 (split) | P5a local: as today, the last two figures read. P5b CI: `build-test` green on the graded sha | P5b: `gh run list --branch plan/small-fixes --json headSha,databaseId,conclusion --jq '.[] \| select(.headSha=="<sha>")'` then `gh run view <id> --log \| grep -c '  pass  '; gh run view <id> --log \| grep -c 'PASS: launcher'; gh run view <id> --log \| grep -c 'SMOKE PASS'` | a run on the exact sha with `conclusion: success`, then `6`, `1`, `1` | the parent's run `35785765215`: `success` absent, `5`, `0`, `0`; a sha with no run prints nothing, which is 🔴 by the rule below | `failure`, `5`, `0`, `0` |

Rule for P5b, to write into the plan's Criteria preamble: a row whose text names CI is 🔴 until the
verdict cites a run id whose `headSha` equals the graded sha. A run on a later merge commit does not
count for the unit verdict; it counts for pre-land. This is the rule the Verifier applied in the
pass-2 correction, made a written precondition rather than a seat's discretion.

### 3.3 Must P5's CI leg be evidenced from a CI run on the unit head before a verdict, and how

Yes. `ci.yml` runs on `push` to `main` and on `pull_request` only, so a unit branch never runs CI by
itself (`gh run list --branch unit/sf-U1` is empty). Two ways to get a run on the unit head, either
is enough:

| Option | How | Cost | Recommended |
|---|---|---|---|
| O1 | open the draft PR from `plan/small-fixes` at the unit merge commit, before the Verifier grades; the unit verdict cites that run id and its `headSha` (C1's blob-parity check already ties the merge to the unit head) | one PR that would be opened anyway, opened one step earlier; the plan's Landing line moves from `Draft at the verified unit` to `Draft at the merged unit, before the verdict` | yes |
| O2 | a throwaway draft PR from `unit/sf-U1` itself, closed at the unit merge | an extra PR per unit | only if the plan branch cannot be merged before the verdict |
| O3 | `workflow_dispatch` on `ci.yml` | edits `.github/`, which the scope wall refuses | no |

Until such a run exists, U1-8 (Docker) is the local stand-in for the launcher half; nothing local
stands in for the real-Chrome half (Risk row 1, N3), which is why P5b stays a hard precondition.

## 4. Likely wrong on Linux CI, not yet observed

| # | Item | State | Evidence | What would show it |
|---|---|---|---|---|
| 4.1 | leg (e)'s process check is vacuous when `pgrep` is missing or fails to exec: `catch { return true; }` at `launcher.mjs:162` treats `ENOENT` the same as "no match" | 🟡 demonstrated | `node -e '... process.env.PATH="/nonexistent"; try { execFileSync("pgrep",...) } catch(e) { console.log("caught:", e.code) }'` prints `caught: ENOENT`, `noProc = true`; on Linux with `pgrep` moved away the leg still prints `pass` (R-series run 11) | U1-10; fix: rethrow unless `e.status === 1` |
| 4.2 | the signal legs swallow the child's stderr, so any Linux-only crash in the child shows as `child never printed a pid/dir line` | 🟡 demonstrated | RD7 versus the CI log | X2, U1-9 |
| 4.3 | leg (f) degrades to leg (c) on a slow runner: the fixture's 3 s delay starts at `listen`, the parent's 1 s starts at the pid line; if fixture start-up exceeds ~2 s the signal lands after discovery and (f) proves nothing about the pending window | 🟡 not observed | `fake-chrome.mjs:33-39`, `launcher.mjs:131-132`; the CI run shows (a) to (e) taking `0.5-1.6 s` each, so the margin held there | have the child's signal handler print `pending` or `discovered` (from a flag set when `ready` settles) before exiting, and have (f) assert `pending`; N1's timing dependence is the same class |
| 4.4 | a real Linux Chrome's helpers (crashpad, zygote, GPU) can outlive the browser's `SIGKILL` and recreate files under the profile dir after `rmSync` (`chrome.mjs:42-43`, no wait between the two) | 🟡 not testable here | no Linux Chrome on this host; P5's CI leg does not read the directory figures (the runner is discarded), so CI cannot show it either | the plan's Risk row 3 already names the `SIGTERM` then `SIGKILL` fallback; a CI-side `ls -d "$RUNNER_TEMP"/ultimate-tokens-smoke-*` after smoke would need `.github/` edits, out of scope |
| 4.5 | an early Chrome crash on the runner costs the full 45 s and loses the exit code (`ready` has no `proc` exit listener) | 🟡 carried (N3) | pre-land N3 | a `proc.once("exit")` that rejects `ready` early; the likeliest first failure once the launcher is green in CI |
| 4.6 | `await ready` at `smoke.mjs:50` sits outside the `try`, so a CDP deadline is an uncaught rejection, exit `1`, no `SMOKE FAIL` line | 🟡 carried (N2) | pre-land N2 | cosmetic for CI's exit code; matters only to a reader of the log |
| 4.7 | `DEP0104`: a later Node throws on the pass-1 line 153 shape | 🟢 closed by X1 | RD3 | none after X1 |

## Summary for the Orchestrator

| Field | Value |
|---|---|
| Root cause | `launcher.mjs:153` restores an unset `TMPDIR` as the string `"undefined"` (Node `DEP0104` coercion); leg (f)'s child inherits it and dies in `mkdtemp 'undefined/...'` with its stderr unread. Reproduced on the Mac (`env -u TMPDIR`) and on real Linux (Docker `node:24`); fixed by one line, green on both |
| Criteria gap | every row ran on a Mac with `TMPDIR` set; P5 names a CI leg that had no run (`ci.yml` triggers on PRs and `main` only, and the draft PR came after the verdict) |
| Proposed rows | U1-7 (`env -u TMPDIR`, control: the pass-1 line), U1-8 (Docker Linux), U1-9 (child stderr in the FAIL line), U1-10 (`pgrep` absent reds leg (e)), P5 split into P5a local and P5b CI-by-run-id on the graded sha, draft PR opened before the unit verdict |
| Next | Orchestrator: revision 6 with the rows above; builder pass 2 applies X1 and X2 (X3 at the owner's call); verifier reruns U1-2, U1-7, U1-8 and cites a run id for P5b before grading |
