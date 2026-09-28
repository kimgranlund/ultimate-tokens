PASS

# records-gates U3 review, pass 1 (#741)

Branch unit/rc-U3 at 48897448, against plan/records-gates. Reviewer read the diff (4 files: `test/repo/verdict-frontmatter.mjs` new, `test/run.mjs`, `.sdlc/baseline.md`, the handoff) and ran every check itself.

| Criterion | Evidence | State |
|---|---|---|
| G0 list backfilled if any | `sh .sdlc/checks/verdict-frontmatter-check.sh` last line `verdicts 162 graded 162 bad 0`, exit 0; no `.sdlc/verdicts/*.md` in the diff; list empty, so U3 stays S per the plan | 🟢 |
| `test/repo/verdict-frontmatter.mjs` registered | `TESTS` in `test/run.mjs` counts 54 entries; the file sits beside gate-report; the run prints `verdict-frontmatter.mjs pass` | 🟢 |
| Test bites | It runs the check twice: repo root (exit 0, `bad 0`) and a planted os.tmpdir fixture (MISSING and VALUE records, exit 1 read directly, last line `verdicts 2 graded 2 bad 2`). Handoff controls (a) and (b) both turned it red; the leg-b assertions are read in the source | 🟢 |
| Root-derived, cwd-invariant | `node test/repo/verdict-frontmatter.mjs` from the root and from `test/` print the same `✓ verdict-frontmatter: verdicts 162 graded 162 bad 0, planted 2`; ROOT comes from `import.meta.url` | 🟢 |
| Baseline N moved | `baseline-agrees-check.sh`: `ok    tests: baseline 54, test/run.mjs TESTS 54`; baseline diff is the `npm test` row 53 to 54 plus a #741 Correction paragraph | 🟢 |
| `npm test` | Foreground-equivalent run in the worktree (host load 130 to 500): `✓ all 54 test files passed`, exit 0; `git status --short` empty afterward | 🟢 |
| Em dash | `node test/repo/em-dash.mjs`: clean (798 files scanned) | 🟢 |

Findings: none blocking. Minor: the handoff did not re-run a row-left-at-53 control for the baseline; the same class was shown in U1, and the check reads `baseline 54, TESTS 54` here, so it is accepted.

verdict: 🟢
