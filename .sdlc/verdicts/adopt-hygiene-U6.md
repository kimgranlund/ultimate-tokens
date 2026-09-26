# Verdict adopt-hygiene U6 · 🟢
verdict: 🟢

Graded by sdlc-verifier on 2026-09-17 (evidence run: adopt-hygiene-U6-verifier-l2-p1, grade l2). Branch `unit/hygiene-U6` @ e26d023 (80ae4d8 is an ancestor via d62207f), worktree `.worktrees/hygiene-U6`, left at status 0. Negative controls ran against 80ae4d8 or a scratch copy at e26d023 (removed after). The handoff and `.sdlc/verdicts/adopt-hygiene-U6-review.md` were not used as evidence.
Tally: 6 rows (5 criteria + scope). 🟢 6 · 🟡 0 · 🔴 0. Three non-blocking notes below.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U6-1 | no live pointer to the pre-archive plan paths; four sites name `docs/plan/archive/` | 🟢 | criterion grep `0`; archive count 4; plain `git grep -n 'docs/plan/plan-2026-09'` with the same exclusions: none; knowledge-04 lines 341-342 read by eye as the archive path | at 80ae4d8: criterion grep 4 files, plain grep 4 hits |
| U6-2 | repointed paths resolve | 🟢 | `ok` twice | old paths: `cat-file -e` exit 128 |
| U6-3 | eval key only on guard and eval steps (U2-9) | 🟢 | actionlint exit 0; node `false`; count `2`; YAML parse: no workflow or job `env`, key absent on checkout, setup-node, `npm ci`, present on steps 3 and 4; guard keeps `exit 1`, `stays green` 0, no step `if:` on secrets; guard with empty key exits 1 | at 80ae4d8: `true`, `1` |
| U6-4 | debt rows, dated adapter amendments, T-0001 names #643 | 🟢 | `1`,`1`,`1`,`1`,`0`; removed lines: adapter 0, debt 0, T-0001 0 (append-only) | at 80ae4d8: `0`,`0`,`0`,`0` |
| U6-5 | `npm test` green, tree clean, branding clean | 🟢 | `all 44 test files passed`; status 0; branding clean (418 files) | scratch: role-table plant FAIL 3, restore + rerun: 44 pass, status 0; brand string planted in `.sdlc/debt.md`: branding 1 failure |
| S | scope | 🟢 | e26d023 touches the 8 files U6 names plus its handoff; nothing under `scripts/`, `test/`, `src/`, `mcp/`, `node_modules`, `.claude/docs/other` | the `80ae4d8...` range also lists orchestrator record commit d62207f files, so the name filter does see extra paths |

Notes (non-blocking):
- The U6-1 grep only catches a wrap right after `export-schema-`; a wrap elsewhere, or before `plan-2026-09`, escapes it. A line-end scan on the head found only the new archive pointer, so nothing is missed today. The plain grep is the stronger check for the next pre-land run.
- The P1 control now yields FAIL 3, not the 17 the plan records; the control still discriminates.
- T-0001 gained 2 lines (a blank plus the #643 line), not one. Cosmetic.
