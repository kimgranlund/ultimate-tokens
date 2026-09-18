---
kind: review
plan: adopt-hygiene
unit: U6
pass: 1
diff: d62207f..unit/hygiene-U6 (head e26d023)
reviewer: reviewer (fresh context)
date: 2026-09-17
verdict: 🟢 pass
---

# U6 review: pre-land fixes, round 2

Fresh-context review against `.sdlc/plans/adopt-hygiene.md` §U6 (5 rows), the findings in `.sdlc/verdicts/adopt-hygiene-prepr.md`, and the handoff `.sdlc/handoffs/adopt-hygiene-U6.md`. Every command below was run by me in `.worktrees/hygiene-U6`. Workflow plants ran on scratch copies in the job tmp dir; the branding and role-table plants ran in the worktree and were restored (`rm`, `git checkout`), then `npm test` rerun. `git status --porcelain` was `0` at the end.

## Criteria (5/5 pass)

| # | Criterion | State | Result | Negative control |
|---|---|---|---|---|
| 1 | no live pointer outside the wall names the pre-archive paths; four sites name `docs/plan/archive/` | 🟢 | `0`, `4` | same grep against `d62207f`: 4 files (both cards, knowledge-04, spec-panda) |
| 2 | repointed paths resolve | 🟢 | `ok`, `ok` | `git cat-file -e HEAD:docs/plan/plan-2026-09-export-schema-revision.md`: fatal, exit 128 |
| 3 | eval key only in guard and eval steps | 🟢 | actionlint `exit 0`, `false`, `2`; U2 row 9 rerun: `exit 0`, `1`, `0`, `yaml ok`, `0`, `0` | `d62207f`: `true`, `1`. Job-level `env:` re-planted on head: `true`. Step-level `if: ${{ secrets.ANTHROPIC_API_KEY != '' }}` planted: actionlint `context "secrets" is not allowed here`, exit 1 |
| 4 | debt rows, adapter amendments, T-0001 names #643 | 🟢 | `1`, `1`, `1`, `1`, `0`; deleted lines across adapter, debt, T-0001 vs `d62207f`: `0` | `80ae4d8`: `0`, `0`, `0`, `0` |
| 5 | gates green, tree clean, branding clean | 🟢 | `npm test` exit 0, `✓ all 44 test files passed`, `repo/branding.mjs pass`; status `0` | `"scrim`→`"scrimX` in role-table: exit 1, `✗ 1/44`; restored, rerun green, status `0` (the first rerun already settled; the P1 two-run gap did not reproduce this time). `29a2c06` U1 review copied to `docs/x.md`: `FAIL: 2 branding violation(s)`; removed, `clean (418 files scanned)` |

## Extra checks

| Check | State | Evidence |
|---|---|---|
| criterion 3, YAML-parsed | 🟢 | `ruby -ryaml`: workflow-level `env` nil; job `describe-eval` `env` nil; step envs `[nil, nil, nil, {KEY}, {KEY}]` for checkout, setup-node, `npm ci`, "Require the eval key", "Run the golden-description eval". `npm ci` no longer sees the key |
| guard still bites | 🟢 | guard `run` body extracted from the parsed YAML: empty key exit 1, unset exit 1, set key exit 0 |
| repo-wide pointer sweep, incl. wrapped | 🟢 | `git grep 'adia-derived-export-artifacts\|export-schema-revision'` minus archive paths leaves only: excluded history (`.sdlc/verdicts`, `.sdlc/handoffs`), `.sdlc/debt.md:39` (R4 evidence, excluded), and `scripts/gen-adia-derived-exports.mjs:3`, `test/engine/adia-derived-exports.mjs:6` (behind the wall, now debt R12). Line-tail grep for `docs/plan/`, `plan-2026-09-*` at end of line and line-head grep for `schema-revision.md`/`artifacts.md`: only knowledge-04:341-342, which is the repointed wrap. No relative `plan/plan-2026-09` links |
| adapter/debt/T-0001 append-only | 🟢 | `git diff d62207f -- .sdlc/adapter.md .sdlc/debt.md .sdlc/tickets/T-0001.md \| grep -E '^-[^-]'`: 0 |
| §2.2 amendment true | 🟢 | `.sdlc/config.json` is byte-for-byte the §2.2 JSON; first added in 04b93f0 (U2); U2 verdict U2-11 🟢 |
| §3 amendment true | 🟢 | `.gitignore:18` `.worktrees/`; `branding.mjs:41` SKIP_DIRS has `.worktrees` (U2 verdict U2-6); `git ls-files .claude/ops` 0 (U3-1, commit subject names C6); live `gh api` `[true,false,false]` (U3-3) |
| debt C5 true | 🟢 | `enabledPlugins` has `sdlc@nonoun: true`; `extraKnownMarketplaces` keys are `nonoun-plugins`, `adia` only. Matches question default A |
| debt C6 true | 🟢 | `/Users/` hits in architecture, plans/adopt-hygiene, tickets/T-0001 as listed (plus debt.md itself, see minor) |
| scope | 🟢 | changed: the 8 files §U6 lists plus the handoff. `git diff --stat d62207f..HEAD -- scripts test src mcp .claude`: 0 lines |
| branding strings | 🟢 | branding gate clean on head; this record adds none |

## Findings

| Severity | Finding | Where |
|---|---|---|
| 🟡 minor | debt row C6's list of files with absolute home paths omits `.sdlc/debt.md` itself, which carries one hit; the row's own `git grep` evidence command shows 4 files, not 3 | `.sdlc/debt.md` C6 |
| 🟡 minor | the new debt IDs C5 and C6 reuse labels that mean different things one file over: the §3 amendment in the same change says "(C6)" for adapter conflict C6 (`.claude/ops/`), while debt C6 is home paths. Debt's C-series predates U6, so this is a reading hazard, not an error | `.sdlc/debt.md:57-58`; `.sdlc/adapter.md:86` |
| ⚪ nit | spec-panda still calls the plan "Sibling in flight ... on branch `docs/569-export-plan`" while pointing at the archive path; the pointer resolves, the surrounding tense is historical | `docs/spec/spec-panda-park-ui-exports.md:34` |
| ⚪ nit | debt R4 still cites the pre-archive paths as evidence and is not marked closed after U1; debt.md is excluded from criterion 1 and R4 predates U6 | `.sdlc/debt.md:39` |
| ⚪ nit | the handoff's criterion 3 note is right: the node check is text-based and a comment naming the key before `steps:` flips it. The YAML parse above confirms the green is real, not a wording accident | handoff "Notes" |

0 blocking. `docs/site/describe-palette-spec.md:579` is out of U6 by the plan's own file list (close-out commit).
