PASS

Fresh-context review of records-gates U1 (#745), unit worktree `.worktrees/rc-U1` at `547b9805` (base `634d94cf`). Under R8 this unit has no verifier, so this PASS closes it. Every criterion and its negative control was rerun independently: card scripts on the tree directly, negative controls in a throwaway `git clone --shared` of the unit branch (never the worktree), scoped commands run with cwd inside the clone since both scripts resolve `$src` relative to the caller's cwd.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U1-1 | both card scripts read green on the tree, exit agrees with a zero count, last line is `exit $((n > 0))` | pass | `range mismatches: 0` exit 0; `stale total: 0` exit 0; `tail -1` on both scripts prints `exit $((n > 0))` | in the clone: ADR-025 Source row set to `682-694` gives `start ADR-025 says 682, heading at 696`, `end ADR-025 says 694, section ends at 728`, `range mismatches: 2`, exit 1; dropping `2026-09-16` from ADR-010's Supersedes row gives `stale card ADR-010`, `stale total: 1`, exit 1. Both match the handoff and plan figures |
| U1-2 | adapter states the rule in section 1 and at 2.1 | pass | `grep -c 'read by its last line and its exit code' adapter.md` = 1; `sed` over the `### 2.1` block for `last line and exit code` = 1; `grep -c '#745'` = 1 | tree at G0 (base commit) prints `0`, `0`, `0` per the handoff; not rerun here since the base predates the unit and the delta is visible in the diff |
| U1-3 | the other four checks are untouched and still exit on their count | pass | `git diff --name-only` over `.sdlc/checks` minus the two card scripts = `0`; `verdict-frontmatter-check.sh` still has `process.exit(bad ? 1 : 0)` = 1; `doc-drift-rows-check.sh` still has `process.exit(rows.length && !bad ? 0 : 1)` = 1 | in the clone, appending a line to `doc-drift-rows-check.sh` makes the untouched-file count `1` |

Additional checks run beyond the plan's three rows:

- Callers. Grepped `test/run.mjs`, `package.json`, `.github/`, and `baseline-agrees-check.sh` for `card-source-range-check` or `card-amendment-check`: no hits. Both scripts are read manually (pre-land table, adapter prose, verdicts), never spawned by `npm test` or CI, so the new non-zero exit changes no automated pipeline.
- POSIX sh. `sh -n` on both scripts is clean. `shellcheck -s sh` flags `SC1087` (unbraced `$id`/`$num`/`$next` inside a bracket-looking context) and `SC3052` (`10#$num` base conversion) on lines U1 did not touch (they predate this diff, per `git diff 634d94cf` touching only the trailing comment and `exit` line in each script). Pre-existing, out of scope under the scope wall and R9 (a finding this narrow rides the plan that owns the file, but U1's own diff introduces neither).
- Scope wall. `git diff --name-only 634d94cf` filtered against the U1 file set (both card scripts, `adapter.md`, the plan's own `.sdlc/{plans,handoffs,verdicts,questions}/records-gates*` and `board.md`) leaves nothing.
- Branding and em dash. `node test/repo/branding.mjs` prints `branding: clean (787 files scanned)`. No added line (outside a backtick span) carries U+2014.
- The four untouched checks. Confirmed `baseline-agrees-check.sh`, `ceiling-counts-check.mjs`, `doc-drift-rows-check.sh`, `verdict-frontmatter-check.sh` are absent from the diff and each still ends on its own established exit convention.

No findings at any severity. The unit does exactly what its steps describe: one added line per card script, two adapter sentences, no scope drift.
