<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- `.claude/CLAUDE.md`: Layout bullet rewritten. `docs/reference/` is now described as runtime-read data only, and the bullet names `docs/references/`, `docs/specs/marketing/`, `docs/archive/tickets/`, `docs/specs/site/`, `docs/specs/`, `docs/assets/` and `docs/reports/`. Line 9 canonical-specs pointer updated. The plan-closure line (103) names only `.sdlc/plans/archive/`. The ADR path is now `docs/references/decision-records.md`. The trailing comment says `docs/references/` and `.claude/docs/other`.
- `.claude/agents/marketing-manager-agent.md`: marketing corpus is now `docs/specs/marketing/` (index `index.md`).
- `.claude/agents/palette-researcher-agent.md`: typography and rubric paths mapped.
- `.claude/skills/adding-export-formats/{SKILL.md,references/foundations.md,references/rubric.md}`: knowledge-04 path mapped.
- `.claude/skills/adding-semantic-roles/{SKILL.md,references/best-practices.md,references/foundations.md}`: paths mapped. Bare `docs/reference` prose mentions changed to `docs/references`. The sweep greps now read `docs/references docs/reference`.
- `.claude/skills/building-editor-sections/SKILL.md`: app-shell and component-inventory paths mapped.
- `.claude/skills/color-math/{SKILL.md,references/foundations.md}`: knowledge and neutral-derivation paths mapped, including the `knowledge-0{1,2,6}-*.md` glob.
- `.claude/skills/figma-file-migration/{SKILL.md,references/scenario-playbook.md}`: tkt-0009 is now `docs/archive/tickets/`.
- `.claude/skills/geometry-system/{SKILL.md,references/foundations.md}`: geometry README path mapped.
- `.claude/skills/maintaining-brand-kit-mcp/{SKILL.md,references/foundations.md}`: mcp-hosting-spec path mapped.
- `.claude/skills/maintaining-figma-plugins/{SKILL.md,references/foundations.md}`: knowledge-05 path mapped.
- `.claude/skills/project-docs/SKILL.md`: consult table rewritten to the new homes. Line 27 now says closed plans archive to `.sdlc/plans/archive/` and pre-2026-10-06 closed plans are read-only in `docs/archive/plans/`. `docs/specs/` dropped from the near-miss list.
- `.claude/skills/type-scale/{SKILL.md,references/best-practices.md,references/foundations.md,references/rubric.md}`: typography paths mapped, plus one bare mention.
- `.claude/skills/ultimate-tokens-brand-voice/{SKILL.md,scripts/voice-check.mjs}`: marketing paths mapped (the `.mjs` hit is a comment).
- `.sdlc/adapter.md`: section 5 step 1 drops the `docs/plan/` clause and step 3 is the single `.sdlc/plans/archive/` sentence. Row X10 now says closed pre-2026-10-06 plans are read-only in `docs/archive/plans/` and new plans live only in `.sdlc/plans/`. Lines 200, 208, 244, 245 and 261 mapped.
- `.sdlc/architecture.md`: decision-records, mcp-hosting, site/lld/img and tickets paths mapped (T3, T7, XC6, K7, DD10, DD55, DD56).
- `.sdlc/baseline.md`: line 98 mapped.
- `.sdlc/survey.md`: line 168 mapped.
- `.sdlc/debt.md`: R1, R2, R4, R6, R7, R12, D2, D4, DP4 and line 122 mapped. The R6 evidence command is now `git show --name-status --no-renames df2ef6f | grep 'spec/CHANGELOG'`.
- `.sdlc/checks/card-amendment-check.sh`: `DR=docs/references/decision-records.md`. A missing card source is translated through `docs/assets/docs-reconcile-path-map.tsv` before the existence test.
- `docs/references/decision-records.md`: ADR-028 inserted before `## Quick map`, and one ADR-028 Quick map row appended. Lines added only.

## Checks
- AC1, `! git grep ... -- .claude AGENTS.md CLAUDE.md`: exit 0, no hits.
- AC2, every `docs/` path in `.claude/CLAUDE.md` exists: exit 0. A `docs/other` hit was already in the trailing comment at HEAD; it now reads `.claude/docs/other`.
- AC3, `! git grep ...` over the live `.sdlc` contracts: exit 0, no hits. Re-run after the R6 fix, still exit 0.
- AC4, section 5 steps 1 and 3 name `.sdlc/plans/archive/` and no `docs/`: exit 0.
- AC5, `sh .sdlc/checks/card-amendment-check.sh`: `stale total: 0`, exit 0. The `sh -x` trace count for the decision-records awk line is 27.
- AC6, ADR-028 before Quick map: exit 0.
- AC7, ADR-028 cites `docs/layout.md`, `docs/reference/data`, `docs/assets/docs-reconcile-path-map.tsv` and `.sdlc/plans/archive/`: exit 0.
- G8, no removed lines in the decision-records diff against the merge-base: exit 0.
- G9, frozen paths unchanged against the merge-base: exit 0.
- G10, `.claude/docs/other` untracked: exit 0.
- `node test/repo/em-dash.mjs`: clean (1249 files). `node test/repo/branding.mjs`: clean (1241 files). `node test/repo/citations.mjs`: STALE 0 across 10 docs.
- `npm test`: exit 0, all 54 test files passed. Tree status went from 57 to 91 entries, which is exactly this step's 34 files, so npm test added no drift.
- `python3 $SDLC/scripts/docs_check.py` (informational): 0 errors, 24 warnings (B-2a 12, D-10 2, D-11 10).

## Notes
- Tree state: HEAD is still `ded55e1f WIP step 1`. Steps 2, 3 and 4 are all uncommitted in W. I made no commit because the brief did not ask for WIP commits. A verifier diffing against HEAD sees all three steps at once.
- ADR-028 cites `docs/reports/2026-10-06-docs-reconcile.md`, which step 5 creates. The citations gate passes because it only parses `file:line` citations, so a path without a line number is not checked.
- Bare `docs/reference` mentions triaged by hand (current line numbers):
  - `.claude/CLAUDE.md` 9, 42-50, 119
  - `project-docs/SKILL.md` 30
  - `adding-semantic-roles/SKILL.md` 18, 70, 82, 100
  - `adding-semantic-roles/references/best-practices.md` 69
  - `type-scale/references/rubric.md` 7
  - `.sdlc/debt.md` D4 and line 122, both now `docs/reports/`
- `.sdlc/architecture.md` DD55 and DD56: the quoted CLAUDE.md text was mapped to the new paths, but the rows still say "at `20298cc`" and cite `.claude/CLAUDE.md:46` and `:50`. Those lines are now 48 and 52. Nothing gates `.sdlc` line citations, so I left the numbers alone.
- `.sdlc/survey.md` lines 156-166 list the old folders without trailing slashes, so the RE does not match them. I left them as a dated inventory. Line 168's ADR count (24, highest ADR-024) is still stale and is step 5's named audit example.
- R6 evidence: `git show --stat df2ef6f` reports the file as a rename to `.claude/docs/spec/CHANGELOG.md`. The new command adds `--no-renames`, so it prints `D docs/spec/CHANGELOG.md`. I ran it before writing it into the row.
