---
kind: rediagnosis
plan: prompt-audit
unit: U7
ticket: "#758"
after: .sdlc/verdicts/prompt-audit-U7.md pass 1, 🔴 at 8e8aa3ad
written: 2026-09-29
seat: planner, dispatched by the Orchestrator
plan-edits: none (the plan is at its revision cap; the rows below are proposals)
---

# U7 re-diagnosis: the Low labels were counted by hand and the second review checked the first

Every skill file is right at 8e8aa3ad. The false record is the handoff, and every one of F2 to F6 sits on a line U7's own hunks touched, so pass 2 is one builder round over the handoff plus five one-line fixes inside the wall. Nothing goes to a follow-up.

## 1. Root cause

The SC ids exist nowhere but in a counting rule. The evidence table (`prompt-audit-evidence.md` lines 536 to 569) has no id column; the header says slice C's rows are `SC1 to SC34` in table order, so `SCn` is line `535+n`. Three things then let a swapped label through:

| Step | What happened | Why the check did not bite |
|---|---|---|
| Review r1, Low finding 4 | The reviewer named the Low rows by paraphrase ("routing frontmatter, the shipping frontmatter, caps, `vmsyntax`, figma references, ...") and wrote `SC32 is the vmsyntax incident date`. In table order `vmsyntax` is line 566, SC31; the figma references row is 567, SC32 | The reviewer's own mapping table (r1 lines 32 to 60) stops at SC27. The Low rows were never mapped to a line |
| Builder round 2 | Copied the reviewer's `SC32` for `vmsyntax`, put `SC31` on the references row, and listed SC31 under Left out | The Low rows are a prose sentence (handoff `:70`) and a Left-out table, not `\| SCnn \|` rows, so nothing greppable carried them |
| Review r2, row 4 | "The handoff lists SC28, SC29, SC32 and SC33 as applied beyond scope" | The control was r1's own finding 4, not the evidence file. A review that checks the handoff against the previous review checks a label against its source of error |

P5 could not see it either: it counts the 27 High and Medium ids for presence, not correspondence, and it does not read SC28 to SC34 at all.

## 2. Pass 2 builder brief

Branch `unit/pa-U7` from 8e8aa3ad, same wall (the eleven files plus the U7 records). No source, test, script or generated file changes.

1. Handoff `.sdlc/handoffs/prompt-audit-U7.md`. Replace the Low sentence at `:70` and the Left-out rows `:77` and `:78` with seven table rows `SC28` to `SC34` in the Findings table, fate `applied, Low` for SC28, SC29, SC31, SC33 and `left out, Low` for SC30, SC32, SC34 (P5's ERE matches `applied |`, not `applied, Low |`, so its count stays 27). Every SC row's Note, SC1 to SC34, quotes at least one backtick span verbatim from evidence line `535+n` (the Location path or a needle from the Evidence column); 17 of the 27 rows already do, the ten that do not are SC9, SC11 to SC16, SC21, SC25, SC26. Rewrite the Questions paragraph: revision 7 (`bee7574d`) already relabelled the Re-verification table, so state that it is fixed.
2. `maintaining-brand-kit-mcp/references/foundations.md` (F2). U7 deleted the sentence that corrected `typed`; correct the shape lines instead: drop `typed` from the type shape at `:19` and the geometry shape at `:134`, and write the category count as `15 voices` at `:17`. Fact: `brandKit(defaultDocument()).type.categories` has 15 keys and `.geometry` has no `typed` key.
3. `maintaining-figma-plugins/SKILL.md` (F3, F4). `:88`: the `priorLibraryUpliftVM` fallback runs only when the reconcile report is empty (no aliases and no deprecates); a non-empty report asks or reads `false`. State that condition. `:109`: the `bodyClassSiblingDefaults` set is `BODY_CLASS_VOICES` (`src/engine/type.mjs`), which also holds `UI-control` and `UI-widget`; name the constant instead of the `Body*/Label*/Tiny*/Lead` gloss.
4. `project-docs/SKILL.md` (F5). The Now / Next / Later row: `.sdlc/roadmap.md` is a generated open-issue snapshot (`status: generated`), no horizons document exists. Say so without adding a second `not present yet` (U7-2 expects exactly one).
5. Rerun U7-1 to U7-6, P3 to P6, and the rows below. `npm test` green, tree clean.

## 3. Proposed criteria rows

Commands run in the unit worktree. `E=.sdlc/plans/prompt-audit-evidence.md`, `H=.sdlc/handoffs/prompt-audit-U7.md`, `S=.claude/skills`. Each negative control was run at 8e8aa3ad and prints what the last column says.

| Id | Criterion | Command | Expected | Negative control | At 8e8aa3ad |
|---|---|---|---|---|---|
| U7-7 | every SC id in the handoff points at its own evidence line | `sed -n '536p' $E \| grep -c 'maintaining-brand-kit-mcp/SKILL.md:42-43'; sed -n '569p' $E \| grep -c 'type-scale/SKILL.md:33-34'; bt=$(printf '\x60'); for n in $(seq 1 34); do id=SC$n; row=$(grep -F -- "\| $id \| " $H) \|\| { echo "MISSING $id"; continue; }; ev=$(sed -n "$((535+n))p" $E); ok=0; while IFS= read -r nd; do [ -n "$nd" ] && grep -q -F -- "$nd" <<<"$ev" && ok=1; done < <(grep -o -E "$bt[^$bt]+$bt" <<<"$row" \| tr -d "$bt"); [ $ok = 1 ] \|\| echo "NOMATCH $id"; done` (the pipes in the two `-F` needles are literal, the cell escapes them for the table) | `1`, `1`, then nothing | a fixture of the pass 2 handoff with the SC31 and SC32 ids swapped prints `NOMATCH SC31` and `NOMATCH SC32` | `1`, `1`, then `NOMATCH` on SC9, SC11 to SC16, SC21, SC25, SC26 and `MISSING` on SC28 to SC34 (17 lines) |
| U7-8 | each Low fate matches the tree | `grep -c -F '/doc-forge' $S/project-docs/SKILL.md; grep -c -F 'build · test · smoke' $S/shipping-changes/SKILL.md; grep -c -F 'Do NOT hand-edit it' $S/type-scale/SKILL.md; grep -c -F 'real incident 2026-06-17' $S/maintaining-figma-plugins/SKILL.md; grep -c -F '#492' $S/maintaining-figma-plugins/references/foundations.md; grep -c -F 'migrated from' $S/project-docs/SKILL.md; grep -c -F 'ratified 2026-07-10' $S/type-scale/SKILL.md; for id in SC28 SC29 SC31 SC33; do grep -c -F -- "\| $id \| applied, Low \|" $H; done; for id in SC30 SC32 SC34; do grep -c -F -- "\| $id \| left out, Low \|" $H; done; grep -c -E 'SC31.*not in scope' $H` | `0 0 1 0 6 0 1` (the tree, in SC28 to SC34 order: applied rows `0`, left-out rows `1` or more), then `1` seven times, then `0` | moving SC31 to `left out, Low` in a fixture prints `0` on its applied grep while the tree still prints `0` for its needle | the tree prints `0 0 1 0 6 0 1`; the seven row greps print `0`; the last prints `1` (line 78) |
| U7-9 | the MCP foundations shape blocks match `brandKit` | `M=$S/maintaining-brand-kit-mcp/references/foundations.md; grep -c -w 'typed' $M; grep -c -F '{7 voices}' $M; grep -c -F '15 voices' $M; node --input-type=module -e "import {brandKit,defaultDocument} from './src/ui/model.mjs'; const k=brandKit(defaultDocument()); console.log(Object.keys(k.type.categories).length, 'typed' in k.geometry)"` | `0`, `0`, `1`, `15 false` | restoring `typed:true` on line 19 prints `1` on the first grep | `2`, `1`, `0`, `15 false` |
| U7-10 | the figma skill states the fallback's condition and the body-class set by its constant | `F=$S/maintaining-figma-plugins/SKILL.md; grep -c -i -E 'empty report\|report is empty' $F; grep -c 'else useLibrary = priorLibraryUpliftVM' figma/plugin/code.js; grep -c -F 'Body*/Label*/Tiny*/Lead' $F; grep -c 'BODY_CLASS_VOICES' $F; grep -c '^export const BODY_CLASS_VOICES' src/engine/type.mjs` | `1` or more, `2`, `0`, `1` or more, `1` | `sed -i '' 's/BODY_CLASS_VOICES/Body*\/Label*\/Tiny*\/Lead/' $F` on a copy prints `1` on the third grep and `0` on the fourth | `0`, `2`, `1`, `0`, `1` |
| U7-11 | project-docs describes the roadmap as what it is | `P=$S/project-docs/SKILL.md; grep -c 'open-issue snapshot' $P; grep -c 'not present yet' $P; grep -c '.sdlc/roadmap.md' $P; grep -c '^status: generated' .sdlc/roadmap.md` | `1`, `1`, `1` or more, `1` | the row rewritten as `not present yet` prints `2` on the second grep, which also reddens U7-2 | `0`, `1`, `1`, `1` |
| U7-12 | the handoff's plan question is current | `grep -c -E 'SC7 to SC10\|SC11 to SC26' $H; git show origin/plan/prompt-audit:.sdlc/plans/prompt-audit.md \| grep -c 'SC6 (make11)'` (the unit branch was cut before `bee7574d`, so the plan is read off the plan branch) | `0`, `1` | the paragraph restored from 8e8aa3ad prints `1` | `1`, `1` |

U7-7 is the check the question asked for: a label is a line number, so the row must quote something that lives on that line. It also fails loudly if the evidence file is ever renumbered (the two pins on 536 and 569). If the plan is reopened, U7-7 belongs in P5 for every unit whose ids are positional (SA, SB, SC).
