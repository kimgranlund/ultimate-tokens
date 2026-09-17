---
kind: review
plan: adopt-hygiene
unit: U1
pass: 2
diff: b885e67..unit/hygiene-U1 (head 89c9538); pass 2 delta 9b7051e..89c9538
reviewer: reviewer-l3 (fresh context)
date: 2026-09-16
verdict: 🟢 pass
---

# U1 review, pass 2: records, plans, stubs, moved docs

Fresh-context review against the root checkout's `.sdlc/plans/adopt-hygiene.md` §U1 (rows 6 and 7 as revised), plan-level P1 to P5, the pass 1 verdict `.sdlc/verdicts/adopt-hygiene-U1.md`, and the re-diagnosis `.sdlc/plans/adopt-hygiene-U1-p2.md`. I ran every command below in `.worktrees/hygiene-U1` after `git fetch origin` (`origin/main` = `7faf3aa`). I did not trust the landing table: every PR, SHA, tag and issue was checked again from `gh` and git. All plants went into scratch copies or were restored, and `git status --short` was `0` at the end. The pass 1 review that used to be in this file (🟢 at 9b7051e) is superseded: it passed the two rows the verifier found wrong.

## Pass 1 gaps

| Gap | State | Evidence |
|---|---|---|
| 🔴 row 6: revision rows cite tickets as PRs and branch tips as landings | 🟢 closed | both rows were replaced. Every cited number and SHA was confirmed independently (table below). The resolver prints nothing |
| 🟡 row 7: stale-path grep printed `1` | 🟢 closed | the plan now excludes `.sdlc/handoffs`, and the grep prints `0`. Without that exclusion, the only hit at 89c9538 is `.sdlc/handoffs/adopt-hygiene-U1.md:1`, which describes the move and is not a live pointer |

## Independent landing check

| Row cites | `gh` / git result | Pairing | State |
|---|---|---|---|
| PR #592, `9a9b9b2` (E1) | MERGED 2026-09-11T18:46Z, mergeCommit `9a9b9b2`, title names #572 | matches | 🟢 |
| PR #593, `bdc3b59` (E2) | MERGED 19:13Z, `bdc3b59`, #573 | matches | 🟢 |
| PR #580, `620ac4b` (E3) | MERGED 18:24Z, `620ac4b`, #574; `commits/620ac4b/pulls` → 580 | matches | 🟢 |
| PR #583, `f291597` (E4) | MERGED 18:25Z, `f291597`, #575; commit → 583 | matches | 🟢 |
| PR #581, `1937f95` (E5) | MERGED 18:24Z, `1937f95`, #576; commit → 581 | matches | 🟢 |
| PR #595, `44c84f3` (E6) | MERGED 19:49Z, `44c84f3`, #577; commit → 595 | matches | 🟢 |
| PR #604, PR #605, `848b80d`, `e026007` (E7) | both MERGED 2026-09-11 (22:55Z, 23:09Z) with those merge commits. #604 lists #578 in `closingIssuesReferences`, and #578's closing comment says "Closed by #604 (merged, 848b80d)" | matches | 🟢 |
| "each squash-merged to `main` 2026-09-11" | all eight `mergedAt` dates are 2026-09-11 | | 🟢 |
| PR #633, `14c4260` (adia 1 to 6) | MERGED 2026-09-13T05:43:50Z, mergeCommit `14c4260` | matches | 🟢 |
| tags at `14c4260` (adia 7) | `git rev-list -n1` on both `adia-oklch-export@1.0.0` and `adia-radix-export@1.0.0` gives `14c4260` | | 🟢 |
| issue #618, issue #631 (adia 8) | both CLOSED issues. #631 has `## Findings (2026-09-13 ...)` at 01:52Z and "Merged and tagged" at 05:44:18Z. #618 has the 05:44:20Z comment naming both tags | | 🟢 |
| all nine backticked SHAs | `git merge-base --is-ancestor <sha> origin/main` true for each | | 🟢 |
| old tips `5a0e438` `918125f` `8108717` `28b6116` | not ancestors of `origin/main`, so they are rightly dropped | | 🟢 |
| #578, #631 as PRs | `gh pr view` cannot resolve either one (both are issues) | | 🟢 dropped |

## Criteria (12/12 pass)

| # | Criterion | State | Result | Negative control |
|---|---|---|---|---|
| 1 | ADR-010/013/016 amendments | 🟢 | 1, 1, 1 | origin/main 0, 0, 0 |
| 2 | ADR-023, ADR-024 before Quick map | 🟢 | ADR-022, ADR-023, ADR-024, Quick map | origin/main ADR-023/024 heading count 0 |
| 3 | Supersedes / Amends lines | 🟢 | 1, 1 | origin/main 0 (headings absent) |
| 4 | LLD, runbook, describe spec amendments | 🟢 | 1 per file; `resolve.mjs` 1 | not re-planted (the pass 1 verifier's control stands; pass 2 does not touch these files) |
| 5 | OD-004 repointed | 🟢 | 0, 1 | origin/main `docs/spec/CHANGELOG.md` 1 |
| 6 | plans closed, archived, revision rows resolve (revised) | 🟢 | `0`, `3`, `2`, `0` and `0`; the resolver prints nothing. Its loop body is byte-identical to the block in the p2 file | the resolver on the rows at 9b7051e prints 6 lines (`PR #631`, `2 untyped #N`, four tips). On a scratch copy with `PR #592` changed to `PR #578` it prints exactly 1 line. Untyping `#633` prints 1, and swapping `620ac4b` for `5a0e438` prints 1. origin/main has both plans in `docs/plan/`, no archive, `todo` 8 and 7 |
| 7 | overhaul plan archived (revised) | 🟢 | `moved`, `1`, `0` | base `b885e67` prints `3`. At 89c9538 without `:!.sdlc/handoffs` it prints 1 match (the handoff) |
| 8 | PRD stub, project-docs cells | 🟢 | 4, 2, 0 | origin/main project-docs `not present yet` 2 |
| 9 | cards and ledger rows | 🟢 | 3, 3, 3 | not re-planted; `.sdlc/` is absent on origin/main |
| 10 | README interchange, gen-font-test, drawer untouched | 🟢 | 1, 1, 0 | origin/main `gen-font-test` 0 |
| 11 | reactivity report moved | 🟢 | `moved`, 1, 0 | origin/main `.claude/docs/reports` tracked files 6 |
| 12 | K18 control | 🟢 | 1; the block prints nothing | with `CURRENT_SCHEMA_VERSION = 5` planted: `no test/ui/persist.mjs snapshot case for CURRENT_SCHEMA_VERSION 5`, restored |
| P1 | `npm test` green, tree byte-stable | 🟢 | `✓ all 44 test files passed`, exit 0; status 0 | role-table `"scrim` → `"scrimX`: FAIL count 3. Restored, rerun green, status 0 |
| P2 | private folder and `node_modules` untracked | 🟢 | 0 | origin/main `.claude/ops/` ls-tree 7 |
| P3 | scope wall | 🟢 | 0 | `// probe` in `src/engine/motion.mjs`: 2, restored |
| P4 | branding clean | 🟢 | `clean (398 files scanned)`, exit 0 | `docs/x.md` copy of the records file: FAIL (the retired maker brand and its domain), removed |
| P5 | no rewritten record | 🟢 | 0 | not re-planted (pass 2 does not touch the file) |

## Beyond the criteria

- Scope: the pass 2 delta touches three files: `plan-2026-09-export-schema-revision.md` (1 line), `plan-2026-09-adia-derived-export-artifacts.md` (1 line), and the handoff (+42/-5). Both plan edits replace only the `| 2026-09-16 |` row, and each new row is character-identical to the p2 file's prescribed text. `.claude/settings.json` is not in the full diff.
- Handoff: it has a `pass: 2` frontmatter field and a new `## Pass 2` section. It openly withdraws pass 1's false "independently verified" claim, and it removes that claim from pass 1's "Left out". What it says it ran matches my results (398 files, 6 lines, 1 line).
- The commit trailer on 89c9538 is `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## Findings

| Severity | Finding | Where |
|---|---|---|
| Blocking | none | |
| 🟡 minor | The resolver checks each fact on its own but never checks that a SHA belongs to the PR next to it. A row reading `PR #580 (E3, 9a9b9b2)` would still print nothing, because both halves resolve. It also only extracts 7-hex SHAs in backticks, so an 8+ character or unbackticked SHA is never checked. I checked the pairings by hand (table above) and all are correct. Suggested follow-up: for each `PR #N (…, \`sha\`)` pair, compare with `gh pr view N --json mergeCommit` | `.sdlc/plans/adopt-hygiene-U1-p2.md` resolver block |
| 🟡 minor | P1's negative control dirties two generated files (`figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`). The plan's restore step names only `role-table.json`, so following it as written leaves `git status` at 2. `git checkout` on those two files or a rerun of `npm test` fixes it | plan P1 negative control |
| ⚪ nit | Row 7's origin/main control says `.sdlc/records/index.md` "still cites the old path", but `.sdlc/` does not exist on origin/main. The base `b885e67` control (prints 3) is the one that actually bites. This wording is from before pass 2 | plan §U1 row 7 |
| ⚪ nit | PR #604's title is "K6: docs of record, 8 formats to 10 (#591)", which does not suggest E7. The row is still right: #604 closes #578, and #578's close comment names it | `plan-2026-09-export-schema-revision.md:221` |

## Verdict

🟢 **Pass.** Both pass 1 gaps are closed. Every PR number, merge SHA, tag and issue in the two revision rows checks out against `gh` and a freshly fetched `origin/main`, and each SHA pairs with its PR. All 12 U1 rows and P1 to P5 hold on my own runs, and every negative control bites, including the resolver's. The pass 2 delta is limited to the two rows and the handoff. There are 0 blocking findings, 2 minor (resolver pairing blind spot, P1 control restore), and 2 nits.
