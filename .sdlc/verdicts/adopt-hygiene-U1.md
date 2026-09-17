# Verdict adopt-hygiene U1 · 🔴

Graded by sdlc-verifier on 2026-09-16. Branch `unit/hygiene-U1` @ 9b7051e, worktree `.worktrees/hygiene-U1`. I ran every command myself in that worktree (no Agent tool in this seat, so no verifier-l1 worker). Negative controls ran against `origin/main` or the base `b885e67` (for `.sdlc/` paths that `origin/main` does not have), or as edits in the worktree that I reverted. The tree was back to 0 dirty paths afterwards. I did not use the handoff's `Ran` row or the review as evidence.
Tally: 17 criteria. 🟢 15 · 🟡 1 · 🔴 1. The one 🔴 is a factual error in a closing record. The grep checks pass, but the record names a PR that does not exist and ties it to the wrong step.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U1-1 | ADR-010/013/016 each one dated amendment | 🟢 | loop prints 1, 1, 1 | same loop on `origin/main` file: 0, 0, 0 |
| U1-2 | ADR-023, ADR-024 between ADR-022 and Quick map | 🟢 | order ADR-022, ADR-023, ADR-024, Quick map | `origin/main`: ADR-022, Quick map |
| U1-3 | Supersedes ADR-004 / Amends ADR-010 wording | 🟢 | 1 and 1 | `origin/main`: 0 and 0 |
| U1-4 | LLD, runbook, describe spec amendments; `resolve.mjs` | 🟢 | 1 per file; `resolve.mjs` 1 | `origin/main`: 0, 0, 0; `resolve.mjs` 0 |
| U1-5 | OD-004 repointed to root CHANGELOG | 🟢 | `docs/spec/CHANGELOG.md` 0; `CHANGELOG.md` 1; root `CHANGELOG.md` exists | `origin/main`: old path 1; `ls docs/spec/CHANGELOG.md` errors |
| U1-6 | two plans closed, archived, revision row names landing PRs | 🔴 | Grep checks pass: `docs/plan/*.md` 0, archive 3, `complete` 2, `todo` 0 and 0. Gap: the archived export-schema plan's revision row says "PRs #578 (E1)". #578 is not a PR (`gh pr view 578` cannot resolve it). It is the E7 docs-of-record issue ("E7 docs of record for the export-schema revision", closed), so the row credits E1 to the wrong number and cites no landing for E1 or E7. The adia plan's row says "PR #631". #631 is an issue (`gh pr view 631` cannot resolve it); the change landed as commit `14c4260` with no PR number. The handoff says these were "independently verified" | `origin/main`: two files in `docs/plan/`, no archive, `todo` 8 and 7. The E3 to E6 SHA pairs in the row check out: `5a0e438`/`620ac4b`, `918125f`/`f291597`, `8108717`/`1937f95`, `28b6116`/`44c84f3` are all on `main` with matching subjects |
| U1-7 | PLAN-overhaul archived, item 2 only ticked, D2 closing line | 🟡 | `moved`; `Closed 2026-09-16` 1; the stale-path grep prints **1**, not 0. The one match is `.sdlc/handoffs/adopt-hygiene-U1.md:27`, where the handoff describes the move. The plan's exclusion list does not cover `.sdlc/handoffs`, and no live pointer is left. Item 2's tick holds: the four pre-rename names match 0 standalone hits in tracked `.claude/`. Items 1, 3, 4 are unticked | base `b885e67`: file exists under `.claude/`, the same grep prints 3 |
| U1-8 | PRD stub frontmatter + G7; project-docs updated | 🟢 | 4, 2, 0 | `origin/main`: no `docs/prd` tree entries (0); project-docs grep 2 |
| U1-9 | cards + ledger rows | 🟢 | 3, 3, 3 | base `b885e67`: cards 0, index 0, decisions 0 |
| U1-10 | README interchange + gen-font-test; drawer/scripts untouched | 🟢 | 1, 1, 0 | `origin/main`: 0 and 0 |
| U1-11 | reactivity report moved, no tracked pointer | 🟢 | `moved`; reviews reactivity 1 (6 files); pointer grep 0 | `origin/main`: 6 files under `.claude/docs/reports/reactivity-2026-08-20`, 0 in reviews |
| U1-12 | K18 control requires persist.mjs snapshot case | 🟢 | grep 1; block prints nothing | `CURRENT_SCHEMA_VERSION` set to 5 in `src/ui/persist.js`, block printed "no test/ui/persist.mjs snapshot case for CURRENT_SCHEMA_VERSION 5"; restored. Base K18 block grep 0 |
| P1 | `npm test` green, tree stable | 🟢 | `✓ all 44 test files passed`; status 0 | `"scrim` to `"scrimX` in role-table.json: FAIL count 3; restored, tests re-run green, status 0 |
| P2 | private folder + node_modules untracked | 🟢 | 0 | `origin/main` tree `.claude/ops/` grep: 7 |
| P3 | scope wall | 🟢 | 0 | `// probe` appended to `src/engine/motion.mjs`: 2; restored |
| P4 | branding gate clean | 🟢 | `branding: clean (398 files scanned)`, exit 0 | copy of decision-records.md to `docs/x.md`: FAIL printed; removed |
| P5 | no rewritten record | 🟢 | 0 | deleted line 1 of decision-records.md: 1; restored |

## Gap for the next pass

- U1-6: the two revision rows name issue numbers as landing PRs and tie #578 to E1. Every number in those rows must match a real landing (PR or commit) for the step it names.
- U1-7 (non-blocking): the stale-path grep catches the handoff's own description of the move. Either the handoff wording or the plan's exclusion list decides that, and the Orchestrator owns which.
