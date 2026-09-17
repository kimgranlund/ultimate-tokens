# adopt-hygiene · pre-land re-diagnosis 3 (full staleness sweep, U8)

Re-diagnosed by sdlc-planner on 2026-09-17 against `sdlc/adopt` @ 61a3f90 (b44883d plus the 🔴 record) and the three pre-land records (29a2c06, 80ae4d8, b44883d). Read-only; the root checkout was not touched (0 dirty paths, head unchanged). Every check below was prototyped: run at the head (fails as stated) and in a detached scratch worktree carrying the U8 edits (passes as stated); the scratch worktree was removed afterwards.

## Why the loop did not close

Three records in a row each found one more stale statement because each fix unit repaired the lines the last record named and nothing swept the rest. The plan changed about fifteen facts across five units; each fact has readers in six live records (`index.md`, `decisions.md`, `debt.md`, `adapter.md`, `architecture.md`, the cards) plus the harness skills, and no criterion ever asked "does every live record agree with the head". U8 is that criterion: one fact table, one grep per fact, one wording sweep over every added line, all mechanical, all with a b44883d control.

Two record classes are declared history and left alone, with the reason: `.sdlc/survey.md` and `.sdlc/baseline.md` are dated snapshots of `origin/main` @ 7faf3aa (frontmatter `surveyed_at` / `ran` and `head`), they are the graded inputs of `.sdlc/verdicts/survey.md`, and rewriting them would invalidate that grade. `.sdlc/questions/*`, `.sdlc/tickets/T-0001.md`, `.sdlc/plans/*-p*.md`, `.sdlc/verdicts/*`, `.sdlc/handoffs/*`, `docs/plan/archive/*`, `docs/tickets/*`, `CHANGELOG.md` are history by the plan's own exclusion lists. Everything else under `.sdlc/`, `.claude/`, `docs/`, `README.md`, `CLAUDE.md` is live.

## 1. Facts the plan changed, and every live statement they made false

| # | Fact (unit) | Live statement now false | Fix in U8 |
|---|---|---|---|
| F1 | `.claude/ops/` untracked (U3) | `.sdlc/records/index.md:77` lists the four ops files as records | reword the row: untracked by U3, on disk and ignored, no longer a record |
| F2 | squash-merge only on GitHub (U3) | `.sdlc/adapter.md:42` §2 Merge row "not enforced: the repo allows squash, merge commit, and rebase" (no amendment); `.sdlc/debt.md` C4 and P1 read open | append one dated amendment under the §2 table; closing notes on C4 (partial) and P1 |
| F3 | four ignore rules added (U2) | `.sdlc/adapter.md:82` `.sdlc/runtime/` row "the repo's `.gitignore` does not list it yet"; the §3 amendment at :86 names only `.worktrees/` | append a second dated amendment under §3 naming the three `.sdlc/` rules. New, not in the b44883d record |
| F4 | `.sdlc/config.json` preset github (U2) | none left (`adapter.md:68` amendment covers :60) | none |
| F5 | PRD-0001 added (U1) | `index.md:80` "No PRD, RFC, RDD, or IDR files exist"; `decisions.md:65` gap G1 reads open | reword :80; G1 row gets a closing note |
| F6 | ADR-023 and ADR-024 added (U1) | `index.md:19` ADR-004 "superseded (by: unstated in heading)"; `cards/ADR-004.md:1` and `:8` "no ADR id named"; `decisions.md:37` ADR-020 "verifier: confirm the split"; `decisions.md:66-67` gaps G2, G3 read open | name ADR-023 in the index row and the card; ADR-020 row cites ADR-024; G2, G3 closing notes. Card and ADR-020 lines are new |
| F7 | ADR-013 and ADR-016 amended (U1, R1) | `decisions.md:30` "with no amendment note in ADR-013 (gap G4)"; `decisions.md:33` ADR-016 row silent on the Geometry rename; `decisions.md:68` G4 reads open | append to the two lineage rows; G4 closing note. New |
| F8 | runbook amended: four `flagOf()` consumers (U1) | `decisions.md:50` "verifier: ... whether `flagOf()` has consumers" | append the answer to the row. New |
| F9 | legacy plans closed and archived (U1) | `cards/PLAN-adia-exports.md:1` and `cards/PLAN-export-schema.md:1` title status `active`; `cards/PLAN-overhaul.md:1` "none stated (plan-only; nothing here is executed)"; `decisions.md:58` PLAN-overhaul "Phase 4 open ... 4 closeout items unticked"; `decisions.md:69` G5 reads open; `debt.md` R4, D2 read open | card title statuses; PLAN-overhaul row; G5 note; R4 closing note, D2 partial note (items 1, 3, 4 stay open). Cards and the overhaul row are new |
| F10 | reactivity report moved to `docs/reference/reviews/2026-08-20-reactivity/` (U1) | `index.md:75` lists only the 2026-07-17 reviews; `debt.md` D4 reads open | add the review row; D4 closing note. Index row is new |
| F11 | K18 control reworded to the snapshot case (U1) | `.sdlc/architecture.md:112` K18 table row still describes the old script ("require a `vN` mention ... flag any `RENAME_MAPS`"), its control message, and its `v5` comment limit | reword the three cells to match the §6.1 script. New |
| F12 | `shipping-changes` rewritten: hooks exist, no pinned model (U2, C5, C8) | `.claude/skills/shipping-changes/references/foundations.md:59-62` "The guards exist because there are no hooks ... There are no local git hooks in this repo"; `references/rubric.md:11` H4 pins `Claude Opus 4.8 (1M context)` | rewrite the §4 heading and sentence; H4 names the running model's line. New (U2-4 grepped SKILL.md only) |
| F13 | describe-eval fails loudly without the key (U2, U6) | `debt.md` R8 reads open; `decisions.md:70` G6 "custody undecided" is still true but silent on the loud failure; `.sdlc/board.md:8` U2 Next "🟡 U2-9 key at job-level env, follow-up" | R8 partial note (the secret stays human); G6 appended; board cell (Orchestrator, at merge). Board cell is new |
| F14 | CLAUDE.md, pages.yml, `.gitattributes`, `workflow.json`, README, K11 (U2, U1) | `debt.md` R11, C1, G2, G3, D3, R3 (README half), K11 read open | closing notes; G2 and R3 partial (the header line and the drawer half stay open) |
| F15 | local branches pruned (U3) | `debt.md` P2 reads open | closing note (local half; remote stays human) |
| F16 | OD-004 repointed, R1 amendments, PRD/ADR stubs (U1) | `debt.md` R6, R1, R7 read open | closing notes; R6 partial (the Figma run stays human) |
| F17 | adapter §8 inheritance table all landed (U1, U2, U3) | `adapter.md:165-174` every row still reads as a to-do ("if C6 is approved") | append one dated amendment after the table. New |
| F18 | `docs/spec/` holds two specs (pre-existing, the U1 edit sat in the same table) | `.claude/skills/project-docs/SKILL.md:24` "`docs/spec/` (SPEC-*) not present yet" | name the two files |
| F19 | plan grew from three to seven units (U4 to U7) | `.sdlc/plans/adopt-hygiene.md:17` "grouped into three units", `:19` "in force for all three units", `:165` "the three unit commits" | reword the three lines. New |
| F20 | R12 has no owner or trigger (U6) | `debt.md` R12 "waits for a unit that can" | name the trigger: the first plan after #643 that opens `scripts/` or `test/`, and the #643 close comment (Landing) |
| F21 | bgIsolation dropped (U5), `nonoun` declared (U7), ticket #643 (U4/U5) | no live statement contradicts the head (debt C5 carries its U7 note; `T-0001` is history) | none |

Debt rows with no live contradiction and nothing to close: C5, C6, C7, R12 (U7 and U6 wrote them current).

## 2. Added lines with an em dash or a bold inline label

(`[dash]` below stands for U+2014, so this record carries none.)

Source: `git diff -U0 origin/main...sdlc/adopt` outside `.sdlc/verdicts`, `.sdlc/handoffs`, `.sdlc/plans/*-p*.md`, `.sdlc/questions`, `.sdlc/tickets`. 31 added lines carry U+2014 (the b44883d record's "about 28" counted differently; the `.sdlc/plans/adopt-hygiene-U2-p2.md:20` hit is history). 9 are plan-authored and get fixed; 22 are kept, each for one of four reasons the sweep script encodes.

### 2a. Fix (9 lines)

| File:line | Text at the dash | Replacement |
|---|---|---|
| `.claude/skills/shipping-changes/SKILL.md:18` | "via `core.hooksPath` [dash] the" | "via `core.hooksPath`; the" |
| `.claude/skills/shipping-changes/SKILL.md:19` | "not enforced pre-commit) [dash] and" (origin/main had "pre-commit), and", so the dash is new) | "not enforced pre-commit); and" |
| `README.md:56` | "(Material, interchange-only [dash] not a native Figma format)" | "(Material, interchange-only, not a native Figma format)" |
| `docs/lld/lld-muted-base-key-spikes.md:221` | "`src/engine/resolve.mjs` [dash] the group-chroma resolvers" | "`src/engine/resolve.mjs`, the group-chroma resolvers" |
| `docs/plan/archive/overhaul-plan-2026-08-14.md:75` | "memory/`) [dash] verified 2026-09-16:" (a line U1 added; the file is archived but the line is this plan's) | "memory/`); verified 2026-09-16:" |
| `docs/prd/prd-0001-app-shell.md:8` | "# PRD-0001 [dash] App shell" | "# PRD-0001: App shell" (U1-8 greps frontmatter and goals, not the heading) |
| `docs/reference/references/decision-records.md:397` | "(a revert [dash] the mode axis" (inside the U1 amendment to ADR-016, not yet on `main`, so P5 stays 0) | "(a revert: the mode axis" |
| `docs/site/go-live-runbook.md:34` | "the only unwired flag [dash] it still gates nothing" | "the only unwired flag; it still gates nothing" |
| `.sdlc/records/cards/PRD-0001.md:7` | "tracked as debt (A6 [dash] ..." | comma |

### 2b. Keep (22 lines), by reason

| Reason | Lines | Why it stays |
|---|---|---|
| ADR heading grammar `## ADR-NNN [dash] title`, ratified in adapter §6 and used by ADR-001..022 on `main` | `decision-records.md:669`, `:682`; `adapter.md:121`, `:127`, `:128` (quote the grammar in backticks) | the format predates the plan; changing two headings would split the file's grammar |
| Card title line quotes the source document's own title (`# ID · TYPE [dash] title · date · status`) | 11 lines: `cards/LLD-app-shell.md:1`, `LLD-muted-base.md:1`, `PLAN-export-schema.md:1`, `PLAN-overhaul.md:1`, `SITE-describe-palette.md:1`, `SITE-licensing.md:1`, `SITE-mcp-hosting.md:1`, `SITE-runbook.md:1`, `SITE-storage-sync.md:1`, `SPEC-muted-base.md:1` and `SITE-describe-palette.md:8` | the dash is the source title's (`docs/site/describe-palette-spec.md:482` reads "settled [dash] do not relitigate"); a card paraphrasing a title stops being a citation |
| Dash already on origin/main in the same line; the plan changed the words around it | `.claude/CLAUDE.md:21` (Commands bullet grammar, every bullet in that section), `project-docs/SKILL.md:23`, `:27` (table cells "[dash] not present yet" became "[dash] one stub" / "[dash] closed plans"), `shipping-changes/SKILL.md:65` (the `## Guards (every commit [dash]` heading), `overhaul-plan-2026-08-14.md:93` ("generated only [dash] nothing above", dated by U1), `test/repo/branding.mjs:41` (comment, one `SKIP_DIRS` line the wall allows) | the diff shows the whole line as added; the dash is not plan-authored, and removing it would rewrite text the plan did not touch |

Bold inline labels on added lines: 44. Fix 3, all in `.sdlc/plans/adopt-hygiene.md`: `:19` `**Scope wall (in force for all three units).**`, `:21` `**Branding rule (adapter C12).**`, `:163` `**Before mobilizing (X1).**` (unbold, keep the words; :19 also loses "three"). Keep the rest: `- **Amendment (date).**` and `**Closed 2026-09-16.**` follow the files' own `- **Update (date).**` marker (the plan says so at §U1); ADR `**Context.**`..`**Status.**` and PRD `**Why this exists.**`/`**Goals.**`/`**Status.**` are the human-ruled stub texts (adapter §6, Q7); `.claude/CLAUDE.md:66` matches every other Conventions bullet and C9 caps CLAUDE.md edits; `.sdlc/adapter.md:14`, `:53-56` sit in the append-only adapter (U6-4 requires 0 deletions vs 80ae4d8, so a reword is out); `docs/plan/archive/plan-2026-09-adia-derived-export-artifacts.md:205-239` are pre-existing step lines whose "todo" became "done"; `.sdlc/tickets/T-0001.md` and the `-p2` files are history.

## 3. Debt rows the plan closed (one plain note each, appended to the last cell)

Corrected on 2026-09-17 by the U8 pass 2 re-diagnosis (`.sdlc/plans/adopt-hygiene-U8-p2.md`): the first version of this table closed R6, R8, D2, and G2 outright. Each of those rows has a half the plan left open (the row's own grade cell says `human + L1`, or the plan's own out-of-scope table names the remainder), so they are partials. Every note is appended to the last cell; nothing is deleted or reworded.

| Row | Note to append |
|---|---|
| R1, R4, R7, D4, G4, K18 | `. Closed by U1 in plan adopt-hygiene (#643)` |
| R11, C1, D3, G3, K11 | `. Closed by U2 in plan adopt-hygiene (#643)` |
| D1 | `. Closed by U3 in plan adopt-hygiene (#643)` |
| P2 (partial) | `. Closed by U3 (local half; the remote sweep stays human) in plan adopt-hygiene (#643)` |
| R6 (partial) | `. Results file repointed by U1 in plan adopt-hygiene (#643); the Figma run and the OD-004 decision stay open (human)` |
| R8 (partial) | `. Workflow half closed by U2 and U6 in plan adopt-hygiene (#643), the run fails loudly without the key; the secret stays open with G6 (human)` |
| G2 (partial) | `. \`.gitattributes\` half closed by U2 in plan adopt-hygiene (#643); the header line stays open behind the P3 wall` |
| D2 (partial) | `. Archived and item 2 ticked by U1 in plan adopt-hygiene (#643); Phase 4 items 1, 3, 4 stay open` |
| C4 (partial) | `. Squash-only set by U3; \`delete_branch_on_merge\` and protection stay open` |
| P1 (partial) | `. Squash is policy since U3; delete-branch-on-merge stays open with C4` |
| R3 (partial) | `. README half closed by U1; the drawer half stays open` |
| P4 | `. Closed by A5: adapter.md §5 names the Orchestrator` |
| R12 | replace "so it waits for a unit that can" with "so it waits for the first plan after #643 that opens `scripts/` or `test/`; the Orchestrator names R12 in the close comment on #643 (Landing) and adds it to that plan" |

That is 13 full closures (12 by unit plus P4) and 8 partials. For the four rows that the first version of this table closed outright, the builder at d7cf7f4 wrote `Closed by ...`; the pass 2 builder replaces that trailing note with the partial text above (the only edit to a note U8 itself wrote; every other cell stays as it is). No row is deleted or renumbered; the `Row count:` line stays `7 / 7`, `45 / 45`; the U7 row 2 block stays green (no em dash, no bold in the file).

## 4. Landing and close-out items (not U8)

Add to the plan's `## Landing` section, after "Then it applies §5 to this plan itself ...":

> The close-out commit that archives this plan also: (1) repoints `docs/site/describe-palette-spec.md:579` from `.sdlc/plans/adopt-hygiene.md` to `.sdlc/plans/archive/adopt-hygiene.md` (check: `grep -c 'plans/archive/adopt-hygiene.md' docs/site/describe-palette-spec.md` prints `1` and `git cat-file -e HEAD:.sdlc/plans/archive/adopt-hygiene.md` succeeds; before the move both fail); (2) flips this plan's status from `approved` to `done` (the plan never carried `active`; §5's "active to done" applies from `approved`); (3) moves every `.sdlc/board.md` row to 🟢 with a Next cell that names the PR. After the merge, the local branch sweep: `git branch -D sdlc/adopt unit/hygiene-U1 unit/hygiene-U2 unit/hygiene-U3 unit/hygiene-U4 unit/hygiene-U5 unit/hygiene-U6 unit/hygiene-U7 unit/hygiene-U8` (all squash-merged, so `-d` refuses), after which `git branch | wc -l` prints `28` and U3-4 is met as written (the head count 36 is 28 plus `sdlc/adopt` and seven unit branches; U8 adds one more). U3-5 (remote count 40, two deletes before the plan) stays a carried 🟡 with nothing to do. R12 trigger: the `adapter.py close 643` reason comment names debt R12 (`gh issue view 643 --comments | grep -c R12` prints `1` or more) so the first plan that opens `scripts/` or `test/` picks it up.

## 5. U8 section (paste into `.sdlc/plans/adopt-hygiene.md` after §U7)

Units line: `- [ ] U8 (S) staleness and wording sweep: every live record agrees with the head · grade l2 · reviewer-l1 · verifier-l2`. Frontmatter size: `U8 S`, 10 points.

Orchestrator before dispatch: add the units line, this section, the Landing paragraph in §4, and the revision row in §6. Orchestrator at merge, in the board commit (`Seat: orchestrator`, builders never stage the board): U8 row added, U2 Next cell changed from "🟡 U2-9 key at job-level env, follow-up; pre-land needs fresh verifier-l3" to "merged; U2-9 key scope closed by U6-3".

### U8 staleness and wording sweep (S, grade l2)

Added after `.sdlc/verdicts/adopt-hygiene-prepr.md` 🔴 on b44883d; re-diagnosis `.sdlc/plans/adopt-hygiene-prepr3.md` (fact table §1, kept-list §2b, note texts §3). Files: `.sdlc/records/index.md`, `.sdlc/records/decisions.md`, `.sdlc/records/cards/{ADR-004,PLAN-adia-exports,PLAN-export-schema,PLAN-overhaul,PRD-0001}.md`, `.sdlc/debt.md` (note text appended to existing rows only), `.sdlc/adapter.md` (three appended amendment lines, nothing deleted), `.sdlc/architecture.md` (K18 table row only), `.sdlc/plans/adopt-hygiene.md` (lines 17, 19, 21, 163, 165 wording only), `.claude/skills/shipping-changes/SKILL.md` (lines 18 to 19), `.claude/skills/shipping-changes/references/{foundations,rubric}.md`, `.claude/skills/project-docs/SKILL.md` (SPEC row), `README.md:56`, `docs/lld/lld-muted-base-key-spikes.md:221`, `docs/plan/archive/overhaul-plan-2026-08-14.md:75`, `docs/prd/prd-0001-app-shell.md:8`, `docs/reference/references/decision-records.md:397`, `docs/site/go-live-runbook.md:34`. Not touched: `.sdlc/survey.md`, `.sdlc/baseline.md` (dated snapshots), `.claude/CLAUDE.md` (C9), `.sdlc/board.md` (Orchestrator), anything behind the P3 wall. Every replacement text is in `adopt-hygiene-prepr3.md` §1 to §3; the three check scripts are in its §Checks and are run from the unit worktree root after copying all three to `$CLAUDE_JOB_DIR/tmp` (`sh u8check.sh`, which calls `debt-closure-check.sh` beside it; `sh wording-check.sh origin/main HEAD`).

| # | Criterion | Command | Expected | Negative control (measured at 61a3f90, whose tree equals b44883d outside `.sdlc/verdicts`) |
|---|---|---|---|---|
| 1 | records index agrees with the head: ADR-004 names ADR-023, PRD gap closed, ops row marked untracked, reactivity review listed | `u8check.sh` line 1 | `1 index stale: 0 reactivity: 1 ops-untracked: 1` | `2 0 0` |
| 2 | adapter carries three appended amendments (§2 Merge, §3 ignore rules, §8 landed) and no deletion since 80ae4d8 (U6-4 carried) | `u8check.sh` line 2 | `s2: 1 s3-ignores: 1 s8: 1 deletions-vs-80ae4d8: 0` | `0 0 0 0`; a reword of any adapter line makes the last count non-zero |
| 3 | every closing note in `debt.md` agrees with its row's own evidence: 13 full closures whose evidence is true and nothing named is still open, 8 partials whose closed half is true and whose open half is still open, no closure without a note; R12 names its trigger; the U7 wording block stays green | `u8check.sh` line 3 (runs `debt-closure-check.sh`, §Checks) | no row line, then `3 debt disagreeing: 0 R12-trigger: 1 emdash: 0 bold: 0 counts: 7/7 45/45` | at 61a3f90: twenty `no-note` lines (every audited row but R3), `disagreeing: 20`; at d7cf7f4: `false-close R6`, `false-close R8`, `false-close D2`, `false-close G2`, `disagreeing: 4`; on a scratch copy of the corrected file: a generated header planted in the first 600 bytes of `ui.html` prints `half-gone G2`; `.gitattributes` removed prints `not-done G2` and `not-done G3`; ticking overhaul Phase 4 items 1, 3, 4 prints `half-gone D2`; dropping D4's note prints `no-note D4` |
| 4 | decisions ledger: gaps G1 to G5 closed with a date, ADR-013/ADR-016/ADR-020/SITE-runbook/PLAN-overhaul rows updated, G6 notes the loud failure | `u8check.sh` line 4 | `gaps-closed: 5 rows: 1 1 1 1 1 G6: 1` | `0 0 0 0 0 0 0` |
| 5 | cards: the two legacy plan cards no longer read `active`, PLAN-overhaul reads closed, ADR-004's card names ADR-023 | `u8check.sh` line 5 | `active: 0 overhaul-closed: 1 adr004-names-023: 2` | `2 0 0` |
| 6 | architecture K18 table row describes the §6.1 script as written; the script still passes | `u8check.sh` line 6 | `vN: 0 snapshot: 1 script: 0` | `1 1 0` |
| 7 | the plan no longer says three units and has no bold lead-in paragraph; U8 is on the units list | `u8check.sh` line 7 | `three-units: 0 bold-lead: 0 U8-listed: 1` | `3 3 0` |
| 8 | shipping-changes skill and its references carry no "no hooks" claim and no pinned model | `u8check.sh` line 8 | `stale: 0` | `3` |
| 9 | project-docs SPEC row names the two spec files that exist | `u8check.sh` line 9 | `spec-absent: 0 spec-files: 2` | `1 2` |
| 10 | no plan-authored em dash and no plan-authored bold inline label on any added line (kept list §2b encoded as the script's exclusions) | `sh wording-check.sh origin/main HEAD; echo "exit $?"` | prints only `plan-authored em dashes: 0, bold labels: 0`, `exit 0` | at 61a3f90: the nine §2a lines and the three plan labels print, `9, 3`, `exit 1`; on a scratch copy of the fixed tree, one dash restored in `README.md:56` prints that line and `1, 0` |
| 11 | plan criteria that must stay green: P1 to P5, U1-7, U1-8, U1-11, U1-12, U2-4, U6-1, U6-4, U7-2 | those rows as written | as written | as written (U6-4 is the append-only guard for row 2 here) |
| 12 | gates green, tree clean, branding clean | `npm test 2>&1 \| tail -1; git status --porcelain \| wc -l; node test/repo/branding.mjs \| tail -1` | `all 44 test files passed`, `0`, `clean (N files scanned)` | P1 control, then rerun `npm test` so generated files settle |
| 13 | Orchestrator at merge: board U2 cell closed, U8 row present | `grep -c 'follow-up' .sdlc/board.md; grep -c 'U8' .sdlc/board.md` | `0`, `1` or more | b44883d: `1`, `0` |

Prototype (2026-09-17, detached scratch worktree of 61a3f90 with the §1 to §3 edits applied by script, then removed): rows 1 to 10 printed exactly the Expected column; at 61a3f90 they printed exactly the Negative control column. Row 3 was re-prototyped in pass 2 (2026-09-17, `.sdlc/plans/adopt-hygiene-U8-p2.md`): `debt-closure-check.sh` run in scratch worktrees at b44883d and d7cf7f4 and on a scratch copy of d7cf7f4 with the corrected §3 notes, printing the Negative control column and `0` respectively; the four flipped-reality controls printed the lines named. Rows 11 to 13 were not rerun in the scratch (row 2's deletion count and row 3's U7 block are included in the prototype output; `npm test` is the builder's and verifier's own run).

## Checks

`u8check.sh` (run from the checkout root; each line is one criterion row):

```sh
#!/bin/sh
X=":!.sdlc/verdicts :!.sdlc/handoffs :!.sdlc/plans/*-p*.md :!.sdlc/questions :!.sdlc/tickets :!.sdlc/survey.md :!.sdlc/baseline.md :!docs/plan/archive :!CHANGELOG.md :!docs/tickets"
echo "1 index stale: $(grep -c 'unstated in heading\|^No PRD' .sdlc/records/index.md) reactivity: $(grep -c '2026-08-20-reactivity' .sdlc/records/index.md) ops-untracked: $(grep -E '^\| \.claude/ops' .sdlc/records/index.md | grep -c untracked)"
echo "2 adapter amendments s2: $(awk '/^## 2\. /,/^### 2\.1/' .sdlc/adapter.md | grep -c 'Amendment (2026-09-17)') s3-ignores: $(awk '/^## 3\. /,/^## 4\. /' .sdlc/adapter.md | grep -c 'Amendment.*fake-tickets') s8: $(awk '/^## 8\. /,0' .sdlc/adapter.md | grep -c 'Amendment (2026-09-17)') deletions-vs-80ae4d8: $(git diff 80ae4d8 -- .sdlc/adapter.md | grep -cE '^-[^-]')"
DC=$(sh "$(dirname "$0")/debt-closure-check.sh"); echo "$DC" | grep -v '^debt closure'
echo "3 debt disagreeing: $(echo "$DC" | tail -n1 | tr -dc '0-9') R12-trigger: $(grep -E '^\| R12 ' .sdlc/debt.md | grep -c '#643') emdash: $(grep -c $'\xe2\x80\x94' .sdlc/debt.md) bold: $(grep -cE '\*\*[^*]+\*\*' .sdlc/debt.md) counts: $(grep -oE 'Config smells [0-9]+' .sdlc/debt.md | tr -dc '0-9')/$(grep -cE '^\| C[0-9]+ ' .sdlc/debt.md) $(grep -oE 'total [0-9]+' .sdlc/debt.md | tr -dc '0-9')/$(grep -cE '^\| [HRCGDKP][0-9]+ ' .sdlc/debt.md)"
echo "4 decisions gaps-closed: $(awk '/^## Gaps/,/^## Human/' .sdlc/records/decisions.md | grep -cE '^\| G[1-5] .*closed 2026-09-16') rows: $(grep -E '^\| ADR-013 ' .sdlc/records/decisions.md | grep -c 'closing G4') $(grep -E '^\| ADR-016 ' .sdlc/records/decisions.md | grep -c 'amended 2026-09-16') $(grep -E '^\| ADR-020 ' .sdlc/records/decisions.md | grep -c 'ADR-024') $(grep -E '^\| SITE-runbook ' .sdlc/records/decisions.md | grep -c 'amended 2026-09-16') $(grep -E '^\| PLAN-overhaul ' .sdlc/records/decisions.md | grep -c 'closed 2026-09-16') G6: $(grep -E '^\| G6 ' .sdlc/records/decisions.md | grep -c 'fails loudly')"
echo "5 cards active: $(cat .sdlc/records/cards/PLAN-adia-exports.md .sdlc/records/cards/PLAN-export-schema.md | grep -E '^# ' | grep -c '· active') overhaul-closed: $(head -n1 .sdlc/records/cards/PLAN-overhaul.md | grep -c 'closed 2026-09-16') adr004-names-023: $(grep -c 'ADR-023' .sdlc/records/cards/ADR-004.md)"
echo "6 architecture K18 vN: $(grep -E '^\| K18 ' .sdlc/architecture.md | grep -c 'vN` mention') snapshot: $(grep -E '^\| K18 ' .sdlc/architecture.md | grep -c 'test/ui/persist.mjs') script: $(sed -n '/^K18:/,/^```$/p' .sdlc/architecture.md | sed '1d;2d;$d' | bash | wc -l | tr -d ' ')"
echo "7 plan three-units: $(grep -c 'three units a `\|all three units\|three unit commits' .sdlc/plans/adopt-hygiene.md) bold-lead: $(grep -cE '^\*\*[^*]+\*\*' .sdlc/plans/adopt-hygiene.md) U8-listed: $(grep -c '^- \[.\] U8 ' .sdlc/plans/adopt-hygiene.md)"
echo "8 shipping refs stale: $(cat .claude/skills/shipping-changes/references/foundations.md .claude/skills/shipping-changes/references/rubric.md .claude/skills/shipping-changes/SKILL.md | grep -c 'no local git hooks\|there are no hooks\|Opus 4.8')"
echo "9 project-docs spec-absent: $(grep 'docs/spec/' .claude/skills/project-docs/SKILL.md | grep -c 'not present yet') spec-files: $(ls docs/spec/*.md | wc -l | tr -d ' ')"
```

`debt-closure-check.sh` (called by `u8check.sh` line 3 from the same directory; each row's closed part and open part are read from the tree, the note only tells the script which of the two must hold):

```sh
#!/bin/sh
# debt-closure-check.sh: every closing note in .sdlc/debt.md is checked against the row's own evidence,
# not against the note string. Run from the checkout root. Prints one line per row whose note and
# reality disagree, then a summary; exit 1 if any row printed.
#   false-close <id>   the note reads as a full closure but part of the row is still open
#   not-done <id>      the note claims a closure (full or partial) whose closed part is not true
#   half-gone <id>     a partial note names an open half that is no longer open
#   no-note <id>       the row's closed part is true and the row carries no closing note
# Probes that need gh (C4, P1, R8) read the live repository; set NO_GH=1 to skip them.
DR=docs/reference/references/decision-records.md
OV=docs/plan/archive/overhaul-plan-2026-08-14.md
note() { grep -E "^\| $1 " .sdlc/debt.md | awk -F'|' '{print $(NF-1)}'; }
# closed part of the row, true when the unit did what the note says
done_probe() { case $1 in
  R1) [ "$(grep -c 'Amendment (2026-09-16)' $DR)" -ge 3 ] && grep -q 'resolve.mjs' docs/lld/lld-muted-base-key-spikes.md \
      && grep -q 'flagOf()` consumers' docs/site/go-live-runbook.md && grep -q 'Amendment (2026-09-16)' docs/site/describe-palette-spec.md ;;
  R3) grep -q 'interchange-only' README.md ;;
  R4) ! ls docs/plan/*.md >/dev/null 2>&1 && [ -z "$(grep -L '^status: complete' docs/plan/archive/plan-2026-09-*.md)" ] && grep -q 'Closed 2026-09-16' $OV ;;
  R6) ! grep -q 'docs/spec/CHANGELOG' docs/reference/references/od-004-plugin-free-import-test.md $DR && git ls-files --error-unmatch CHANGELOG.md >/dev/null 2>&1 ;;
  R7) grep -q '^## ADR-023 ' $DR && grep -q '^## ADR-024 ' $DR && [ -f docs/prd/prd-0001-app-shell.md ] ;;
  R8) grep -q 'ANTHROPIC_API_KEY is not set' .github/workflows/describe-eval.yml && grep -q 'exit 1' .github/workflows/describe-eval.yml ;;
  R11) grep -q 'gen:adia-exports' .claude/CLAUDE.md ;;
  C1) grep -q 'node-version: 22' .github/workflows/pages.yml && grep -q 'npm ci' .github/workflows/pages.yml && ! grep -q 'npm install' .github/workflows/pages.yml ;;
  C4|P1) [ -n "$NO_GH" ] || [ "$(gh api repos/:owner/:repo --jq '[.allow_squash_merge,.allow_merge_commit,.allow_rebase_merge]' 2>/dev/null)" = "[true,false,false]" ] ;;
  D1) [ -z "$(git ls-files .claude/ops)" ] ;;
  D2) [ "$(awk '/^## Phase 4/,/^\*\*Closed/' $OV | grep -c '^- \[x\]')" -ge 1 ] && grep -q 'Closed 2026-09-16' $OV ;;
  D3) [ ! -f .claude/workflow.json ] || grep -q '"canonical": ".sdlc/adapter.md"' .claude/workflow.json ;;
  D4) [ -z "$(git ls-files .claude/docs/reports)" ] && ls docs/reference/reviews/2026-08-20-reactivity/*.md >/dev/null 2>&1 ;;
  G2) grep -q '^figma/plugin/ui.html linguist-generated -diff' .gitattributes 2>/dev/null ;;
  G3) grep -q '^src/ui/describe-mcp-assets.js linguist-generated -diff' .gitattributes 2>/dev/null ;;
  G4) grep -q 'gen-font-test' README.md || [ ! -e scripts/gen-font-test.mjs ] ;;
  K11) grep 'html:' .claude/CLAUDE.md | grep -q 'exception' ;;
  K18) sed -n '/^K18:/,/^```$/p' .sdlc/architecture.md | grep -q 'test/ui/persist.mjs' ;;
  P2) [ "$(git branch -vv | grep -c ': gone\]')" -eq 0 ] ;;
  P4) awk '/^## 5\. /,/^## 6\. /' .sdlc/adapter.md | grep -q 'The Orchestrator closes a plan' ;;
  *) return 2 ;;
esac; }
# open part of the row: true while something the row names is still undone (rows with no open half return 1)
open_probe() { case $1 in
  R3) grep 'Figma UI3' src/ui/overlays/drawer.js | grep -qvi 'interchange' ;;
  R6) grep -E '^\| OD-004 ' .sdlc/records/index.md | grep -q 'OPEN' ;;
  R8) [ -n "$NO_GH" ] && return 1; ! gh secret list 2>/dev/null | grep -q '^ANTHROPIC_API_KEY' ;;
  C4) [ -n "$NO_GH" ] && return 1; [ "$(gh api repos/:owner/:repo --jq '.delete_branch_on_merge' 2>/dev/null)" = "false" ] || ! gh api repos/:owner/:repo/branches/main/protection >/dev/null 2>&1 ;;
  P1) [ -n "$NO_GH" ] && return 1; [ "$(gh api repos/:owner/:repo --jq '.delete_branch_on_merge' 2>/dev/null)" = "false" ] ;;
  D2) [ "$(awk '/^## Phase 4/,/^\*\*Closed/' $OV | grep -c '^- \[ \]')" -ge 1 ] ;;
  G2) ! head -c 600 figma/plugin/ui.html | grep -qi 'generated' ;;
  P2) git branch -r | grep -vqE 'origin/(HEAD|main)$' ;;
  *) return 1 ;;
esac; }
bad=0
for id in R1 R3 R4 R6 R7 R8 R11 C1 C4 D1 D2 D3 D4 G2 G3 G4 K11 K18 P1 P2 P4; do
  n=$(note $id); kind=open
  echo "$n" | grep -qE 'half|stays? open|stay open' && kind=partial
  [ $kind = open ] && echo "$n" | grep -qE 'Closed by (U[0-9]|A5)|set by U[0-9]|policy since U[0-9]' && kind=full
  done_probe $id; d=$?; open_probe $id; o=$?
  case $kind in
    full)    [ $d -eq 0 ] || { echo "not-done $id"; bad=$((bad+1)); }; [ $o -ne 0 ] || { echo "false-close $id"; bad=$((bad+1)); } ;;
    partial) [ $d -eq 0 ] || { echo "not-done $id"; bad=$((bad+1)); }; [ $o -eq 0 ] || { echo "half-gone $id"; bad=$((bad+1)); } ;;
    open)    [ $d -ne 0 ] || { echo "no-note $id"; bad=$((bad+1)); } ;;
  esac
done
echo "debt closure rows disagreeing with their evidence: $bad"; [ $bad -eq 0 ]
```

`wording-check.sh` (the dash is spelled as bytes, so the plan and this file carry none):

```sh
#!/bin/sh
BASE=${1:-origin/main}; HEAD=${2:-HEAD}; D=$(printf '\342\200\224')
added() { git diff -U0 "$BASE...$HEAD" -- . ':!.sdlc/verdicts' ':!.sdlc/handoffs' ':!.sdlc/plans/*-p*.md' ':!.sdlc/questions' ':!.sdlc/tickets' \
  | awk '/^\+\+\+ /{f=substr($0,7);next} /^@@ /{split($0,a," ");split(a[3],b,",");n=substr(b[1],2)+0;next} /^\+/{print f":"n":"substr($0,2);n++;next} /^-/{next} {n++}'; }
# kept: ADR heading grammar and lines quoting it; card title lines; a dash inside a double-quoted source phrase;
# seven dashes origin/main already carries on the same line (prepr3 §2b)
dashes=$(added | grep "$D" \
  | grep -vE "^[^:]+:[0-9]+:(## ADR-[0-9]{3} $D |# [A-Z]+-[A-Za-z0-9-]+ · )" | grep -vE "\`## ADR-(NNN|[0-9]{3}) $D " \
  | grep -vE "\"[^\"]*$D[^\"]*\"" \
  | grep -vE "\`gen:type-fonts\` $D|outcomes $D the why|\(PRD-\*\) $D|\(PLAN-\*\) $D|\(SPEC-\*\) $D|## Guards \(every commit $D|generated only $D|of the repo $D never gate")
# kept: dated amendment and closing markers; ADR and PRD section labels; CLAUDE.md bullets (C9); the append-only adapter;
# archived legacy plans (pre-existing lines); the local ticket copy
labels=$(added | grep -E '^[^:]+:[0-9]+:(- |[0-9]+\. )?\*\*[^*]+[.:]\*\*' \
  | grep -vE ':(- )?\*\*(Amendment|Closed) \(?20' \
  | grep -vE '\*\*(Context|Decision|Rationale|Consequences|Status|Why this exists|Goals)\.\*\*' \
  | grep -vE '^(\.claude/CLAUDE\.md:|\.sdlc/adapter\.md:|docs/plan/archive/|\.sdlc/tickets/)')
[ -n "$dashes" ] && echo "$dashes" | cut -c1-120; [ -n "$labels" ] && echo "$labels" | cut -c1-120
nd=$(printf '%s' "$dashes" | grep -c .); nl=$(printf '%s' "$labels" | grep -c .)
echo "plan-authored em dashes: $nd, bold labels: $nl"; [ "$nd" -eq 0 ] && [ "$nl" -eq 0 ]
```

Why these bite where the earlier rounds did not: each fact grep reads the sentence the fact made false (or the note that closes it), not a count of some other string; the debt script reads each row's own evidence, so a note that closes a row whose open half is still true prints `false-close`, a note whose closed half is not in the tree prints `not-done`, and a row that is done with no note prints `no-note`; the adapter check pairs "amendment present" with "no deletion", so a fix that rewrites instead of appending fails; the wording script starts from every added line and subtracts an enumerated kept list, so a new dash or label anywhere the plan wrote shows up and a kept exception cannot hide a new one on the same file.

## Replacement texts (for the builder, exact)

`.sdlc/records/index.md`

- `:19` cell `superseded (by: unstated in heading)` becomes `superseded by ADR-023 (the heading names no id; ADR-023 records the supersession)`.
- after `:75` insert `| docs/reference/reviews/2026-08-20-reactivity/*.md | review (6), moved from \`.claude/docs/reports/\` by U1 | 2026-08-20 | 2026-08-20 |`.
- `:77` becomes `| .claude/ops/plan.md, .claude/ops/reports/*.md | ops (4), untracked by U3 on 2026-09-17 (on disk, ignored, no longer a record) | 2026-07-25 | 2026-07-29 |`.
- `:80` becomes `No RFC, RDD, or IDR files exist. The PRD gap (G1: \`app-shell-patterns.md\` and \`storage-and-sync-spec.md\` cited PRD goals with no source document) closed on 2026-09-16 with the PRD-0001 stub above.`

`.sdlc/adapter.md` (append only)

- after the §2 table (line 47): `**Amendment (2026-09-17).** U3 set the repository to squash-merge only (\`allow_merge_commit\` and \`allow_rebase_merge\` false, ruling P1), so the Merge row's "not enforced" no longer holds; \`main\` still has no branch protection.`
- after line 86: `**Amendment (2026-09-17, second).** U2 also added \`.sdlc/runtime/\`, \`.sdlc/.fake-tickets/\`, and \`.sdlc/.fake-releases/\` to \`.gitignore\`, closing the \`.sdlc/runtime/\` row above.`
- end of file: `**Amendment (2026-09-17).** Every row above landed: CLAUDE.md, \`.gitignore\`, \`SKIP_DIRS\`, \`shipping-changes\`, and \`.sdlc/config.json\` by U2; \`.claude/ops/\` by U3; the legacy plans and the records by U1.`

`.sdlc/records/decisions.md`

- `:30` append `; amended 2026-09-16 to fifteen voices (U1), closing G4`.
- `:33` append `; amended 2026-09-16 (U1): the collection set is Color Roles, Type Primitives, Geometry (#491, G8)`.
- `:37` `(verifier: confirm the split is still that)` becomes `; the split is ruled by ADR-024 (2026-09-16)`.
- `:50` `verifier: current \`TIERS_ENFORCED\` value and whether \`flagOf()\` has consumers` becomes `amended 2026-09-16 (U1): four \`flagOf()\` consumers are wired, \`hostedMcp\` is the only unwired flag`.
- `:58` becomes `| PLAN-overhaul (2026-08-14) | Wave 1 executed, closed 2026-09-16 | rename 3 agents + 1 skill; 6 gerund skills grandfathered | PRs #439–#442 done; closed and archived by U1 (\`docs/plan/archive/\`): item 2 ticked, items 1, 3, 4 carried as debt D2 |`.
- Gaps rows, appended before the closing `|`: G1 `; closed 2026-09-16 by the PRD-0001 stub (U1)`; G2 `; closed 2026-09-16 by ADR-023 (U1)`; G3 `; closed 2026-09-16 by ADR-024 (U1)`; G4 `; closed 2026-09-16 by the ADR-013 amendment (U1)`; G5 `; closed 2026-09-16: all three plans archived by U1, adapter.md §5 names the closer`; G6 `; since U2 and U6 the workflow fails loudly without it`.

Cards

- `ADR-004.md:1` `SUPERSEDED (2026-06-17, see the 500-ramp revision; historical decision kept for provenance)` becomes `SUPERSEDED (2026-06-17 by the 500-ramp revision, recorded as ADR-023 on 2026-09-16; historical decision kept for provenance)`; `:8` `(no ADR id named)` becomes `, recorded as ADR-023 (2026-09-16)`.
- `PLAN-adia-exports.md:1` trailing `· active` becomes `· complete (closed 2026-09-16)`; `PLAN-export-schema.md:1` `· active (ratified 2026-09-11)` becomes `· complete (ratified 2026-09-11, closed 2026-09-16)`; `PLAN-overhaul.md:1` `· none stated (plan-only; "nothing here is executed")` becomes `· closed 2026-09-16 (Wave 1 executed; Phase 4 items 1, 3, 4 carried as debt D2)`.

`.sdlc/architecture.md:112` (K18 row): control cell `script K18 in §6.1 (require the \`schema-rename vN\` snapshot case in \`test/ui/persist.mjs\` for the current N)`; negative-control cell message `no test/ui/persist.mjs snapshot case for CURRENT_SCHEMA_VERSION 5`; exceptions cell `Mechanical limit: a \`schema-rename v5\` comment in \`persist.mjs\` with no assertion under it would pass.`

`.sdlc/plans/adopt-hygiene.md`: `:17` `grouped into three units a \`builder-l1\` can each finish in one pass.` becomes `grouped into three units at approval (seven after the pre-land rounds U4 to U7, eight with the U8 sweep), each sized for one pass.`; `:19` starts `Scope wall, in force for every unit. Nothing`; `:21` starts `Branding rule (adapter C12). \`test/repo`; `:163` starts `Before mobilizing (X1). \`.sdlc/\``; `:165` `plus the three unit commits` becomes `plus the unit commits`.

`.claude/skills/shipping-changes/references/foundations.md`: `:59` heading `## 4. The guards are manual because hooks cover only privacy and the sdlc board`; `:61-62` become `The only hooks are the \`PreToolUse\` privacy guard and, under sdlc, the plugin's board hooks via \`core.hooksPath\` (\`.sdlc/adapter.md\` §3). Every content guard below is a convention plus CI plus the test gate, so you are the enforcement at commit time:` (the old line's dash goes with it). `references/rubric.md:11`: `Commit ends with the \`Co-Authored-By: Claude Opus 4.8 (1M context)\` trailer` becomes `Commit ends with the \`Co-Authored-By\` trailer naming the running model (the harness attribution line)`.

`.claude/skills/project-docs/SKILL.md:24` cell becomes `\`docs/spec/\` (SPEC-*) [dash] two: \`spec-muted-base-key-spikes.md\`, \`spec-panda-park-ui-exports.md\`` (`[dash]` here is the row's existing U+2014, already on origin/main; keep it as is, only the words after it change).

## 6. Revision-log row

`| 2026-09-17 | U8 added (staleness and wording sweep): one fact table for every change U1 to U7 made, one grep per fact over every live record, an added-line wording sweep with an enumerated kept list, and a Landing paragraph for the spec repoint, the branch sweep, and the R12 trigger; plan wording fixed (three units, bold lead-ins) | pre-land record 🔴 on b44883d, third stale-record blocker in a row; re-diagnosis .sdlc/plans/adopt-hygiene-prepr3.md |`
