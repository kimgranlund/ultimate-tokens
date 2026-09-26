# Handoff U3 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rc-U3 @ (this commit) |
| Files | `test/repo/verdict-frontmatter.mjs` (new), `test/run.mjs`, `.sdlc/baseline.md` |
| Ran | G0 ✅ (list empty) · `npm test` ✅ `all 54 test files passed`, tree clean outside this unit's own two touched files · U3-1 ✅ · U3-2 (no-op, list empty) · U3-3 ✅ (bites both negative controls) · U3-4 ✅ · U3-5 ✅ |
| Left out | the backfill half of step 2; the G0 list is empty, so no `.sdlc/verdicts/*.md` file is touched and the unit stays S, not M |

## G0 (rerun at the start of this unit, U1 already merged)

`gh issue view 730` → `CLOSED COMPLETED`; em-dash in `TESTS` → `1`; card-source-range `[: ]` → `1`; ADR colon headings → `25`; `TESTS` length → `53`; `verdict-frontmatter-check.sh` over `origin/main`'s archived verdicts → `verdicts 162 graded 162 bad 0`, one line, no `MISSING`/`VALUE` rows above it. **List is empty**: reported to the Orchestrator before proceeding; U3 stays S per the plan's own rule.

## Criteria

| Id | Command | Expected | Got | Negative control | Control result |
|---|---|---|---|---|---|
| U3-1 | check tail -1, exit, `git ls-files` count | `verdicts M graded M bad 0`, exit 0 | `verdicts 162 graded 162 bad 0`, exit 0, `162` tracked files | clone, delete `gate-split-U1.md`'s last `verdict:` line | `bad 1`, exit 1, `MISSING gate-split-U1.md: no verdict: line` |
| U3-2 | backfill placement | n/a, list empty | skipped, list empty (documented above) | n/a | n/a |
| U3-3 | test registered + green + bites | `1` registered, exit 0, `✓ verdict-frontmatter:` line with `bad 0` and `planted 2`, `9` for the MISSING/VALUE/tmpdir grep | matched: `✓ verdict-frontmatter: verdicts 162 graded 162 bad 0, planted 2` | (a) clone, plant `.sdlc/verdicts/zz-planted.md` with no `verdict:` line | exit 1, `✗ repo: expected exit 0, got 1; output:\nMISSING zz-planted.md: no verdict: line\n...` |
| U3-3 control (b) | same clone, flip the shell check's `process.exit(bad ? 1 : 0)` to `process.exit(0)` | exit 1, FAIL naming the planted leg's wrong exit | `✗ planted: expected exit 1, got 0 (the planted leg exited 0 despite bad records); ...` | | |
| U3-4 | `baseline-agrees-check.sh` tests line, `#741` grep | `ok tests: baseline 54, TESTS 54`, `1` or more | matched, `#741` count `2` | (not re-run; the row-left-at-53 control is the same class U1 already demonstrated for its own row) | |
| U3-5 | root-derived vs cwd invariance, timed | `exit 0` under 1 s each, same last line from `test/` | three standalone runs on this loaded host: 0.69 / 0.57 / 0.59 s, both cwd forms identical last line | n/a (the `process.cwd()` swap control is a code-shape argument the design states; not separately planted since the test already resolves `ROOT` via `fileURLToPath(import.meta.url)`, never `process.cwd()`) | |

## What changed

`test/repo/verdict-frontmatter.mjs` (new): spawns `sh .sdlc/checks/verdict-frontmatter-check.sh` with `execFileSync`, twice: once at the repo root (leg a), once in an `os.tmpdir()` fixture holding `missing.md` (no `verdict:` line) and `value.md` (`verdict: PASS`, not a token) (leg b). Reads the check's actual exit code, not just its printed text, so a check that prints the right MISSING/VALUE/bad-count lines but exits 0 anyway still fails leg b. `ROOT` is derived from `fileURLToPath(import.meta.url)`, so the repo leg runs with `cwd: ROOT` regardless of where `node` itself was invoked from.

`test/run.mjs`: `"repo/verdict-frontmatter.mjs"` registered in `TESTS` right after `"repo/gate-report.mjs"`, per the design.

`.sdlc/baseline.md`: the `npm test` row's summary cell moves `all 53` → `all 54 test files passed`; a new Correction paragraph (#741) states the N move, the added file's own measured cost (under 1 s), and that the three quoted seconds (167.45 · 185.81 · 268.26) carry forward unchanged, on the gate-split U1 precedent, a single fast added test doesn't reopen a timed reading. One confirming `npm test` run in this worktree is quoted there too (461.45 s, host load 57.58, not a figure of record, evidence only that the tree stays byte-stable outside this unit's own two files).

## Scope

This unit's own diff against `origin/main`: `.sdlc/baseline.md`, `test/run.mjs`, `test/repo/verdict-frontmatter.mjs`, all inside the plan's scope wall; `git diff --name-only` against the merge-base also carries `.sdlc/plans/prompt-audit.md` and `.sdlc/reviews/records-gates-U1-review.md`, both already on `plan/records-gates` before this unit started (U1's own merge); not touched by U3 and out of this unit's own accounting.

No em dash added (`node test/repo/em-dash.mjs`: `em-dash: clean (796 files scanned)`, exit 0); `node test/repo/branding.mjs`: `branding: clean (789 files scanned)`.
