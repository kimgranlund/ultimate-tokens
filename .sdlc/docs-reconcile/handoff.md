---
id: T-0002
title: "docs-reconcile: docs/ to the sdlc-lite schema"
type: chore
status: done
size: XL
priority: P2
depends: []
created: 2026-10-06
---
# docs-reconcile

## Goal
Reconcile `docs/`, `.claude/docs/` and `.sdlc/` to the sdlc-lite docs-schema standard.
Gate: `python3 $SDLC/scripts/docs_check.py` (SDLC=/Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.20.11) reports 0 errors (now 32 errors, 25 warnings: B-2a 12, D-1 9, D-10 1, D-11 12, D-12 6, D-9 17), and `npm test` stays green.

## Intent (user decisions, 2026-10-06)
- Approach: full migration. Move `docs/` content into the nine standard homes (specs, planning, decisions, references, guides, reports, assets, archive, other), updating every path reference (code, tests, generators, skills, agents, hooks, CLAUDE.md files, `.sdlc/` records, docs links) in lockstep.
- Scope: also audit `.claude/docs/other` and `.sdlc/` for stale or duplicated records vs `docs/`. Audit is report only, no moves there.

## Context
- Just ran `onboard.py setup`: created root and docs AGENTS.md/CLAUDE.md and `docs/layout.md` (untracked, uncommitted). Legacy topic folders: docs/{lld,marketing,plan,prd,reference,site,spec,tickets,img,brand-assets}.
- Load-bearing paths: `docs/reference/data/role-table.json` (answer key, deep-equals semanticRoles, parity-gated), `docs/reference/colors/categories/*.json` (read by gen:categories), `docs/reference/{geometry,typography}/*.tokens.json`, `docs/reference/data/*`, `docs/marketing/` (marketing-manager-agent, brand-voice skill), `docs/reference/references/{decision-records,component-inventory}.md` (cited by CLAUDE.md), `docs/img/palette-preview.svg` (README generator).
- `.sdlc/adapter.md` wins over plugin defaults; `.sdlc/` is owned by the older sdlc plugin (board.md, plans, verdicts) and is scanned by `test/repo/branding.mjs`. Do not move `.sdlc/` records; fix only references that the docs move breaks.
- Data files (JSON/CSS/mjs) are D-9 errors outside assets/; schema offers `assets/` or the Kinds table in `docs/layout.md` for listed homes. Prefer a path-preserving resolution where a code consumer would otherwise churn, and say why.

## Constraints
- `.claude/docs/other/` never reaches a commit. No U+2014 anywhere (`node test/repo/em-dash.mjs`). Do not commit or publish; the user approves publishing.
- Run gates (`npm test`, `npm run build`) in a unit worktree, never in a tree another seat edits (adapter.md section 1).
- Docs older than 2026-07-17 `docs/tickets/` is an archive (ADR-017): keep, add nothing.
- Update records a change invalidates in the same change (CLAUDE.md "stale context is a defect").

Lane: full because cross-cutting migration touching code, tests, generators, skills and records in lockstep (XL).

## Decisions (user, 2026-10-06, after architect-L1)
- Data files (docs/reference/data/*, docs/reference/colors/categories/*.json) stay at docs/reference/ with a layout.md Kinds row (kind assets); the other 99 files move per decompose/move-map.tsv.
- Finished .sdlc records (handoffs, verdicts, records, reviews, questions, plans) are not rewritten; publish the old-to-new path map in docs/reports/2026-10-06-docs-reconcile.md. Live .sdlc contracts are fixed.
- .sdlc/plans/archive/ becomes the only live plan archive; edit .sdlc/adapter.md section 5, .claude/CLAUDE.md, project-docs skill to match.
- Builders may make local commits on plan/docs-reconcile in .worktrees/docs-reconcile. No push, no PR, no merge without user approval.
- Do not copy this task folder's *.log into the worktree (the branding gate scans it).

Decomposition: .sdlc/docs-reconcile/decompose/manifest-v1.json (design: architect-L1.md)

## Plan review
- plan defect: step 1 builder-L2 blocked on guard 8 (`git diff -M --name-status ... -- docs/archive docs/tickets docs/plan | grep -v '^R100'` must be empty). onboard.py creates and requires docs/archive/AGENTS.md and docs/archive/CLAUDE.md (status A, not R100), which contradicts Do step 5 and criterion 5. Fix guard 8 to exclude `docs/archive/(AGENTS|CLAUDE).md` (or equivalent), and check every other criterion for the same collision with onboard entry files.
- Builder rule 4 forbids commits on a non-merge step unless the brief asks for WIP commits; the plan's Do step 6 asks for a commit. The user approved local commits on plan/docs-reconcile. The replan must either state explicitly that the step brief asks for the commit (so the builder may make it) or leave the commit to the conductor between steps, and keep criteria independent of the commit.
- State at replan time: all other step 1 criteria (1-6) and guards 7 and 9 passed. The worktree .worktrees/docs-reconcile (branch plan/docs-reconcile) already holds the staged, uncommitted step 1 result (99 R100 renames, layout row, path map, onboard entries). Step 1 as replanned must be idempotent over that tree, or say how to reset it.
- plan defect: step 3 builder-L3 blocked on guard G5 (reports/reviews rename guard). Required D-10 fix retargets five rows of docs/reports/2026-08-20-reactivity.md, dropping rename similarity to 33%, so git reports `D docs/reference/reviews/2026-08-20-reactivity/INDEX.md` + `A docs/reports/2026-08-20-reactivity.md` instead of a rename; the guard filter only excludes the new path. Fix: exclude the old path too (`| grep -v -F 'docs/reference/reviews/2026-08-20-reactivity/INDEX.md'`); do not lower the -M threshold (brand-council then shows as A). Check every other guard in steps 3-5 for the same rename-similarity trap on any file whose content a step edits.
- State at replan: all other step 3 acceptance criteria and guards passed (AC1-4, G6-G10, npm test 54 files). Step 2 and step 3 changes are both present and UNCOMMITTED in .worktrees/docs-reconcile (HEAD ded55e1f = WIP step 1). Replanned step 3 must be idempotent over that tree and its criteria must not depend on a commit boundary. Step 4 and 5 are unbuilt.
