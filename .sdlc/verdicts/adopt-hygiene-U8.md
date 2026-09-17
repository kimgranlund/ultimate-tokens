# Verdict adopt-hygiene U8 · 🔴

Graded by sdlc-verifier on 2026-09-17 (evidence run: adopt-hygiene-U8-verifier-l2-p1, grade l2; the two 🔴 rows re-read by me). Branch `unit/hygiene-U8` @ d7cf7f4, merge-base 0aec4a8 (b44883d plus two orchestrator record commits); the plan copy is byte-identical on the branch and `sdlc/adopt`. Worktree `.worktrees/hygiene-U8` left at status 0; controls in detached scratch worktrees at b44883d, 61a3f90, and a mutable copy of head (removed). The handoff, the review, and `.sdlc/plans/adopt-hygiene-prepr3.md` were not used as evidence.
Tally: 20 rows (13 criteria + 7 independent). 🟢 15 · 🟡 3 · 🔴 2. All 13 plan rows pass and each check script was shown to fail at b44883d. The unit fails on two debt rows it marks closed that are not closed; both claims were prescribed by the re-diagnosis, so the correction belongs there first.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U8-1 | records index agrees with the head | 🟢 | `1 index stale: 0 reactivity: 1 ops-untracked: 1`; by eye: `:19` names ADR-023, `:75` reactivity row, `:77` ops untracked, `:80` PRD gap closed | b44883d and 61a3f90: `2 0 0`; restoring the PRD sentence on a scratch copy: `1 1 1` |
| U8-2 | adapter carries three appended amendments, no deletion since 80ae4d8 | 🟢 | `s2: 1 s3-ignores: 1 s8: 1 deletions-vs-80ae4d8: 0`; diff +10/-0; live `[true,false,false,false]` matches the §2 amendment text | b44883d: `0 0 0 0`; rewording the §2 Merge row: `deletions-vs-80ae4d8: 1` |
| U8-3 | 17 closed debt rows name their unit, 3 partials, R12 trigger, wording block green | 🟡 | `open-of-17: [] partials: 3 R12-trigger: 1 emdash: 0 bold: 0 counts: 7/7 45/45`; 21 of 22 changed rows are pure appends. Concern: the check greps for the note string only, so it certifies the two false closures below | b44883d: full 17-id bracket; dropping D4's note: `[D4 ]`; planted dash and bold: `emdash: 1 bold: 1` |
| U8-4 | decisions ledger gaps and rows updated | 🟢 | `gaps-closed: 5 rows: 1 1 1 1 1 G6: 1` | b44883d: all `0` |
| U8-5 | cards not `active`; PLAN-overhaul closed; ADR-004 names ADR-023 | 🟢 | `active: 0 overhaul-closed: 1 adr004-names-023: 2` | b44883d: `2 0 0` |
| U8-6 | architecture K18 row describes the §6.1 script; script passes | 🟢 | `vN: 0 snapshot: 1 script: 0`; block silent at `CURRENT_SCHEMA_VERSION = 4` | b44883d: `1 1 0`; bump to 5: the missing-case line |
| U8-7 | plan no longer says three units, no bold lead-in, U8 listed | 🟢 | `three-units: 0 bold-lead: 0 U8-listed: 1` | b44883d: `3 3 0` |
| U8-8 | shipping-changes: no "no hooks" claim, no pinned model | 🟢 | `stale: 0`; foundations names the `PreToolUse` guard and `core.hooksPath` hooks; rubric H4 names the trailer | b44883d: `3` |
| U8-9 | project-docs SPEC row names the two spec files | 🟢 | `spec-absent: 0 spec-files: 2` | b44883d: `1 2` |
| U8-10 | no plan-authored em dash or bold label on any added line | 🟢 | `plan-authored em dashes: 0, bold labels: 0`, exit 0 | b44883d: nine §2a lines plus three labels, `9, 3`, exit 1; restoring one README dash: `1, 0` |
| U8-11 | carried rows stay green | 🟡 | P1 44 pass and 0; P2 0; P3 0; P4 clean (427); P5 0; U1-7, U1-8, U1-11, U1-12, U2-4, U6-1, U6-4, U7-2 all at expected values. Concern: U7-2's `/Users/` loop prints a false `missing .sdlc/plans/adopt-hygiene-U7-p2.md` (the file matches only as a quoted grep pattern); it already fires at b44883d, so it is not U8's defect, but the handoff's "all as written" is inaccurate | role-table plant: `1/44` failed; motion.mjs probe: 2; `docs/x.md` copy: FAIL 3; origin/main ops tree 7 |
| U8-12 | gates green, tree clean, branding clean | 🟢 | `✓ all 44 test files passed`; status 0; `branding: clean (427 files scanned)` | role-table plant above |
| U8-13 | board U2 cell closed, U8 row present | 🟢 | `follow-up` 0, `U8` 1 | b44883d: `1`, `0` |
| I1 | debt G2 marked "Closed by U2" | 🔴 | G2's fix cell names the `.gitattributes` entries and a header line in `gen-figma-ui.mjs`; the plan keeps that half out of scope ("Stays as debt G2 (half)"), and `head -c 600 figma/plugin/ui.html` still has no generated header (count 0), so the row's own evidence sentence is still true while the row reads closed | at b44883d the row has no closing note, so the false claim is new at d7cf7f4 |
| I2 | debt D2 marked "Closed by U1" | 🔴 | `docs/plan/archive/overhaul-plan-2026-08-14.md:79-81` says items 1, 3, 4 were never re-run and "stand as debt D2"; U8 wrote the same carry into `cards/PLAN-overhaul.md` and `decisions.md`, then closed D2, so the carried items have no open record | at b44883d D2 has no closing note and the pointers resolve |
| I3 | index PLAN-overhaul row status | 🟡 | `.sdlc/records/index.md:52` reads status `none` beside a card that reads closed and two sibling rows that read complete; true of the source frontmatter, stale beside its own card | unchanged from b44883d; U8 edited four other lines of this file |
| I4 | em dashes on U8-added lines | 🟢 | 3 added lines, all in the ratified kept classes (a dash already on `origin/main`, two card titles quoting source titles); recount over `origin/main...unit/hygiene-U8` outside verdicts and handoffs: 24 lines, zero plan-authored | at b44883d the same recount includes the nine lines this sweep fixed |
| I5 | bold labels added by U8 | 🟢 | 6 lines: three ratified adapter amendment markers and three pre-existing emphases; no new restating label | `wording-check.sh`: `bold labels: 0` at head, `3` at b44883d |
| I6 | ADR heading format and P5 intact | 🟢 | all 24 `## ADR-` headings match the format; 0 deleted lines in `decision-records.md` | any deletion makes the count non-zero |

## Gaps for the next pass
1. 🔴 `.sdlc/debt.md` G2: the row is closed while its second half (the generator header line) is deliberately out of scope. Reopen as a partial, the way the three other partials read.
2. 🔴 `.sdlc/debt.md` D2: the row is closed while the archived overhaul plan and the card and ledger lines U8 wrote in the same commit carry items 1, 3, 4 as open D2 debt. One of the two must change; the carried items need an open record.
3. Both claims come from `.sdlc/plans/adopt-hygiene-prepr3.md` §3, so correct the re-diagnosis first, then the two rows.
4. 🟡 Criterion 3's check reads only for the note string, so it cannot detect a false closure; a closure check that reads each row's own evidence would.
5. 🟡 `.sdlc/records/index.md:52` PLAN-overhaul status reads `none`; U7-2's `/Users/` loop has a false positive (pre-existing).
