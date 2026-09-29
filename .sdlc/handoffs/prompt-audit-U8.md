# prompt-audit U8 handoff: the docs-repair carve-out

Branch unit/pa-U8, code commit 0a5aaa6a, on plan/prompt-audit @ 45221b04 (origin/main merged, so step 1 is done). $B is origin/main, 5cfd2b08. Every figure below was run at 0a5aaa6a unless it says otherwise.

## Status

| State | Item |
|---|---|
| 🟢 | U8-1, U8-2, U8-3 meet their Expected values (table below) |
| 🟢 | `doc-drift-rows-check.sh` last line at head equals $B: `rows 56 drifted 11 holds 45 undetermined 0 bad 0` |
| 🟡 | `npm test` is 🔴 on one file, not this unit's: `repo/verdict-frontmatter.mjs` prints `bad 9` (nine prompt-audit-*-review*.md verdicts have no `verdict:` line). Identical with this unit's edits stashed, so it is present at 45221b04. Owner: whoever wrote those verdicts (U2, U6, U7, U10 reviewers) or the Orchestrator |
| 🟡 | `baseline-agrees-check.sh` prints `stale total: 2` (ui.html 4130.3 KB vs tree 4137.0 KB; test time 167 to 268 s vs adapter 80 to 89 s), identical with this unit's edits stashed. `npm test` did not regenerate the bundle here (tree stayed clean), so no Correction paragraph was added; the ui.html figure moved with U3's embedded-source rewrite on the plan branch |
| 🟢 | em-dash gate `clean (942 files scanned)`, branding `clean (934 files scanned)`, tree clean |

## Findings

| Id | Fate | Note |
|---|---|---|
| SA1 | applied | `docs/reference/SKILL.md` says `Twenty-nine`. Proof: U8-2 legs 1 and 2; the contract block holds 29 `{ "id": "hpg-` entries between `"acceptance_criteria": [` and its close (python count printed `29`) |
| SA2 | applied | the ADR-017 bullet of `.claude/CLAUDE.md` names `/file-bug`/`/file-feature`, drops Scribe, "now", "used to" and the TKT-0031 range, in the same five lines. Proof: U8-1 legs 1 to 4 |
| SA3 | applied | the `TKT-0015` split clause is gone from line 30. Proof: U8-1 leg 1 prints `0` (was `3` at 45221b04) |
| SA7 | applied | "the count grew from 27 when ..." is cut; `29/29 covered, 6 tickets` stays. Proof: U8-2 legs 3 and 4 |
| SA8 | applied | step 2 of the regenerate list is a condition ("If the role table is reproduced in more than one implementation, check that they agree"); the "three implementations agree" phrase at First Principle 4 is untouched. Proof: U8-2 leg 5 |
| SB10 | applied | two citations in U9's scanner shape. Proof: U8-3 |

## Criteria

| Id | Command | Output at head | Negative control at 45221b04 |
|---|---|---|---|
| U8-1 | the plan's command, legs in order | `0`, `2`, `117`, `117`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0` (head), the same line from an archive of $B, `0`, `0`, `0`, `0`, `0` | `3`, `1`, `117` at the parent. Row control: restoring the old DD32 row makes the check print `QUOTE DD32: not found at .claude/CLAUDE.md:30` and `bad 1` |
| U8-2 | the plan's command | `0`, `1`, `1`, `0`, `0`, `6`, `0` | `Twenty-seven` `1`, `count grew from 27` `1` |
| U8-3 | the plan's command | `0`, `1`, `1`, `1`, `1` | the old `(`src/ui/app.js`)` citation `1` |

Note: the "0 blank leg" of U8-1 (the clone control of a blank line above Layout) was not run; the row-restore control above is the one that bit.

## Claim proof

Only sentences changed here carry claims.

| Sentence | Claim | Command at head | Prior sha 45221b04 |
|---|---|---|---|
| CLAUDE.md L49 to 53 | issues go through `gh issue create` (ADR-017 exists) | `grep -c '^## ADR-017' docs/reference/references/decision-records.md` prints `1` | same |
| same | `/file-bug` and `/file-feature` are the intake commands | `grep -n '/file-bug' .claude/CLAUDE.md` hits lines 50 and 101 (the SDLC section) | line 101 only |
| same | `docs/tickets/` is an archive of file tickets | `git ls-files docs/tickets \| wc -l` prints `31`; `ls docs/tickets \| grep -c '^tkt-'` prints `31` | same |
| same | the labels carry machine-read fields | unchanged claim, kept from the original sentence | n/a |
| CLAUDE.md L30 | ds-export is undocumented elsewhere | `grep -c ds-export README.md` prints `0` | same |
| docs/reference/SKILL.md L48 | twenty-nine criteria | python count of `{ "id": "hpg-` in the `acceptance_criteria` array prints `29` | same |
| SKILL.md L73 to 74 | `29/29 covered, 6 tickets` | kept verbatim from the original; the sentence's only removed clause was the history | present |
| SKILL.md step 2 | the parity checklist exists at `rubrics/parity-checklist.md` | `git ls-files docs/reference/rubrics/parity-checklist.md` names it | same |
| section skill L80 | setters live in the two section files | `grep -n '^  setTypeTokenOverride\|^  setGeomTokenOverride' src/ui/sections/*.js src/ui/app.js` prints typography.js:420 and geometry.js:41 and nothing from app.js | same (the old app.js citation was the wrong home) |
| architecture.md DD10, DD32, DD56 | each doc-cell quote sits on its cited line | `sh .sdlc/checks/doc-drift-rows-check.sh` prints no `QUOTE` line | the old quotes sat on 53, 30, 50 |

Rows re-pointed: DD10 (`:53` "add nothing to it, new work is an issue."), DD32 (`:30` "undocumented elsewhere, not one of the 10)"), DD56 (`:50`). Their code cells name what was read: `git ls-files docs/tickets`, `grep -c ds-export README.md` with `src/engine/ds-export.js:3`, and the `docs/tickets` archive plus ADR-017. No other architecture.md line changed (U8-1 leg 6 prints `0`).
