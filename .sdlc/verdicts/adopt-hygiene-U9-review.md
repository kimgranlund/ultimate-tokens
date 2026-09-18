---
kind: verdict
unit: U9
plan: adopt-hygiene
sha: 10072b4
base: 5d4492d
pass: 2
reviewed: 2026-09-17
---

# Verdict adopt-hygiene U9 (pass 2 review) · 🟢

Fresh-context review by `U9-reviewer-l4-p1` (reviewer-l4, Fable 5.1, read-only) of `unit/hygiene-U9` @ 10072b4 (two commits over 5d4492d) against `.sdlc/plans/adopt-hygiene.md` §U9 and the four 🔴 rows of `.sdlc/verdicts/adopt-hygiene-prepr.md` (4f30855). Pass 1 (on 5b3b3ae) graded 🟡 with one blocker, B1: `foundations.md:71` still said CI "always `npm install`s". Pass 2 rerun criteria 1, 3, 5, 6 with controls, tested the widened criterion 3 pattern for vacuity, and swept for a sixth occurrence. Every command ran inside `.worktrees/hygiene-U9` (tree clean before and after); planted controls ran in a scratch worktree, since removed. `origin/main` is at 797173e.

Next action (Orchestrator): merge `unit/hygiene-U9` into `sdlc/adopt`, then the pre-land rerun. P3 needs the merge-base reading (A1) or a rebase; nothing on the branch needs to change.

Tally: 0 blocking · 2 attention (both plan-side, carried from pass 1) · 2 minor.

## Pass 2: B1 and the widened pattern

| Check | Result | Control | State |
|---|---|---|---|
| B1 closed | `foundations.md:71` now reads "because it always reinstalls from the lockfile, so CI is not the guard"; the em dash on that line went with the rewrite, no new dash added | `git grep` of the old string at 5b3b3ae finds line 71; at 10072b4 nothing | 🟢 |
| widened pattern, head | `git grep -nE 'CI[^.]{0,60}npm install\|npm install`s\|always[^.]{0,20}npm install\|npm install[^.]{0,60}CI' -- .claude/skills .sdlc ':!.sdlc/verdicts' ':!.sdlc/handoffs' ':!.sdlc/plans'` prints nothing | at 5b3b3ae prints exactly `foundations.md:71` | 🟢 |
| pattern is not vacuous | in a scratch worktree, `CI runs npm install before build.` appended to each of the five substring files (`debt.md`, `survey.md`, `tickets/T-0001.md`, `maintaining-brand-kit-mcp/SKILL.md`, `foundations.md`): the pattern fires once in every one; the pre-fix wording ``because it always `npm install`s`` planted in `debt.md` also fires | the same five files unplanted: 0 | 🟢 |
| no sixth occurrence | the pattern over `.claude`, `.sdlc`, `docs`, `README.md`, `CHANGELOG.md` (verdicts, handoffs, plans excluded) hits two lines, both dated history: `docs/reference/reviews/2026-07-17-cto-platform.md:103` (a review that was true when written; CI did run `npm install` until TKT-0011) and `docs/tickets/tkt-0011.md:13` (the archived ticket whose fix put `npm ci` in `ci.yml`). A looser sweep (`npm install` on a line naming CI, a workflow, or `ci.yml`) adds only `.claude/CLAUDE.md:69` and `foundations.md:66` ("`npm install`/`npm ci` is the source of truth" for `node_modules`), true statements about the developer's own install, and the four true-content lines below. No live record or skill makes the claim | 🟢 |
| the four remaining substring hits | `debt.md:53` (C1 as filed, closed by U2), `survey.md:73,77` (dated survey, excluded by the plan), `T-0001.md:81` (the ticket's own grep pattern), `maintaining-brand-kit-mcp/SKILL.md:28` ("No `npm install`" about the MCP server) | each is about `pages.yml`, a grep pattern, or the MCP server, never `ci.yml` | 🟢 |

## Criteria (§U9), pass 2 rerun

| # | Criterion | Result | Control | State |
|---|---|---|---|---|
| 1 | OD-004 names the repointed record; every path in `.sdlc/records` resolves | `0`; the second loop still prints 75 `missing` lines, all classified in pass 1 (no real stale path; six names with no file anywhere are zip-internal export names, the authorkit `renames.json`, and `index.md:78`'s own "untracked by U3" row) | `docs/spec/CHANGELOG.md` planted back into the card: `1`; reverted | 🟢 on the fact; the loop as written cannot reach "no `missing` line" without rewriting prose, see A3 |
| 2 | (unchanged since pass 1) `0`, then `3`; `decisions.md:21` agrees with lines 40 and 66, `index.md:19`, and the ADR-004 and ADR-023 cards | at 4f30855: `1` | 🟢 |
| 3 | no record or skill claims CI installs with `npm install`; CI runs `npm ci` | substring file count `5` (true content, above); the widened pattern prints nothing; `npm ci` in `ci.yml`: `3` (line 28 plus two comments) | pattern at 5b3b3ae: one line; planted claims: fire in all five files | 🟢 |
| 4 | (unchanged since pass 1) no `missing` line; scoped loop sees `architecture.md`, `plans/adopt-hygiene.md`, `tickets/T-0001.md`, all in C6 | without the plan exclusions `adopt-hygiene-U8-p2.md` reappears | 🟢 |
| 5 | U8 sweep checks stay green | `u8check.sh` nine lines equal to §U8 Expected (`disagreeing: 0`, `emdash: 0 bold: 0`, `counts: 7/7 45/45`, `adr004-names-023: 2`, `stale: 0`, `spec-absent: 0 spec-files: 2`); `wording-check.sh origin/main HEAD` `0, 0`, exit 0 | pass 1: committed em dash plus `**Label:**` line in a scratch worktree: `1, 1`, exit 1 | 🟢 |
| 6 | gates, tree, branding | `✓ all 44 test files passed`, exit 0; porcelain `0`; `branding: clean (431 files scanned)` | pass 1 on 5b3b3ae: planted `scrimX` FAIL count `3`; restored, rerun green | 🟢 |

Plan-level: P2 `0`; P3 `git diff 5d4492d --stat -- src mcp scripts test` `0` (against `origin/main` it is `7`, all from 797173e, A1); P4 clean; P5 `0`.

## The four prepr cells (unchanged since pass 1, reverified against reality)

| Cell | Now says | Reality at 10072b4 | State |
|---|---|---|---|
| `cards/OD-004.md:7` | results go in `CHANGELOG.md` | `HEAD:CHANGELOG.md` exists; `docs/spec/CHANGELOG.md` does not; source record line 41 says `CHANGELOG.md` | 🟢 |
| `decisions.md:21` | superseded by ADR-023 (2026-09-16), closing G2 | line 40 `supersedes ADR-004; closes gap G2`; line 66 G2 `closed 2026-09-16 by ADR-023`; `index.md:19`; `cards/ADR-023.md` dated 2026-09-16, `Supersedes ADR-004`; `cards/ADR-004.md:1,8` name ADR-023 | 🟢 |
| `shipping-changes/SKILL.md:32` | CI runs `npm ci` | `ci.yml:28` `- run: npm ci`, comment at 26 "npm ci, not install" | 🟢 |
| `foundations.md:21` and `:71` | CI runs `npm ci`; CI reinstalls from the lockfile | same line | 🟢 |

## Attention (not blocking, plan-side)

| Id | Where | What | Suggested handling |
|---|---|---|---|
| A1 | plan §Criteria P3 | Expected `0` against `origin/main` no longer holds for any branch off 5d4492d: main took 797173e (#645, six files under `src/ui` and `test/ui`). The branch's own diff behind the wall is `0` | pre-land reads P3 against the merge base (`git diff $(git merge-base origin/main HEAD) --stat -- src mcp scripts test`), or `sdlc/adopt` is rebased onto 797173e first; either way the plan's revision table should say which |
| A2 | plan §U9 file list and criterion 3 | `foundations.md` was edited (lines 21 and 71) and is not in the list; criterion 3's command is the bare substring count with Expected `0`, which the true-content files make unreachable, while the pattern that actually separates claim from mention lives only in the handoff | when the plan is next touched: add `foundations.md` to the §U9 file list and replace criterion 3's first command with the widened pattern (Expected: no line; control: the pre-fix line 71 text) |

## Minor

| Id | Where | What |
|---|---|---|
| M1 | `decisions.md:21` | "had briefly lived as a bare note here before that": "here" reads as this ledger, but the note lived (and still lives, `cards/ADR-004.md:7`) inside ADR-004; "briefly" is three months. Facts that matter are right |
| A3 | plan §U9 criterion 1, second command | the path-resolution loop treats every filename-shaped token in `.sdlc/records` as a root-relative path and prints 75 `missing` lines on prose (basenames, `cards/`-relative siblings, zip-internal names); the real defect count it was built for is 1 at 4f30855 and 0 now. A plan-side rewrite (resolve against `.sdlc/records/` as well as the root, skip basenames without a slash) would make it discriminate; not the unit's to change |

## Other checks

| Check | Result |
|---|---|
| append-only `debt.md` | untouched by the unit (`git diff 5d4492d HEAD --stat`: five files, `debt.md` not among them) |
| scope | `SKILL.md`, `foundations.md`, `cards/OD-004.md`, `decisions.md`, the handoff; nothing behind the P3 wall (`0`) |
| em dashes and bold labels on added lines | `0` and `0` over the whole diff including the handoff |
| branding | gate clean; no retired string in the diff |
| commit hygiene | two content commits; no `package*.json`, `node_modules`, or private-folder path |
| handoff | pass 2 section records B1's cause (four files named for a count of five) and the fix; frontmatter now `base: 5d4492d` instead of a self-referential `sha` (pass 1 M2 closed); branding count corrected to 431 (M3 closed) |
| pass 1 findings | B1 closed; M2, M3 closed; A1, A2, M1 carried |
