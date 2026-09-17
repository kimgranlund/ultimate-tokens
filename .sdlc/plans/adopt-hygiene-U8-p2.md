# adopt-hygiene · U8 pass 2 re-diagnosis (debt closure claims)

Re-diagnosed by sdlc-planner on 2026-09-17 against `unit/hygiene-U8` @ d7cf7f4 (worktree `.worktrees/hygiene-U8`, left at status 0) after `.sdlc/verdicts/adopt-hygiene-U8.md` 🔴 (I1 G2, I2 D2; 🟡 criterion 3, index:52, U7-2 loop). Every row prepr3 §3 told U8 to close was audited against the row's own item and fix cells and the head tree, not the note. Detached scratch worktrees at b44883d and d7cf7f4 (the latter with the corrected notes applied by script) were used for the prototype and removed. The root checkout was not touched.

Edited in place: `.sdlc/plans/adopt-hygiene-prepr3.md` §1 (F9, F13, F14, F16 fix cells), §3 (the whole table plus a preamble), the U8 section's criterion 3 row, its files sentence (two scripts became three), its prototype paragraph, §Checks (`u8check.sh` line 3 replaced; `debt-closure-check.sh` added before `wording-check.sh`), and the "Why these bite" sentence on the debt loop. Nothing else in prepr3 changed. `.sdlc/plans/adopt-hygiene.md` and `.sdlc/board.md` were not edited; their text is in §4 and §5 below.

## 1. Audit: every row prepr3 §3 closed, against its own evidence at d7cf7f4

Result: 4 rows wrongly closed outright (R6, R8, D2, G2), all four are partials, not open rows. The other 13 full closures and the 4 partials already written hold. R12 (a trigger, not a closure) holds.

| Row | Note at d7cf7f4 | Row's own evidence at d7cf7f4 | Finding |
|---|---|---|---|
| R1 | Closed by U1 | `decision-records.md` carries three `Amendment (2026-09-16)` blocks (:158 ADR-010, :290 ADR-013, :394 ADR-016); `lld-muted-base-key-spikes.md:221` names `resolve.mjs`; `go-live-runbook.md:33` names four `flagOf()` consumers; `describe-palette-spec.md:579` amended | closed |
| R4 | Closed by U1 | `docs/plan/` holds only `archive/`; both `plan-2026-09-*.md` read `status: complete`; the overhaul plan carries `**Closed 2026-09-16.**` under Phase 4 | closed |
| R6 | Closed by U1 | `od-004-plugin-free-import-test.md:41` now names root `CHANGELOG.md` (tracked), `docs/spec/CHANGELOG` appears nowhere; but `index.md:50` OD-004 reads `OPEN` and the row's grade cell is `human + L1`: the Figma run is the human half | wrongly closed, partial |
| R7 | Closed by U1 | `## ADR-023` (:669), `## ADR-024` (:682), `docs/prd/prd-0001-app-shell.md` exists | closed |
| R8 | Closed by U2 and U6 | `describe-eval.yml` has a `Require the eval key` step that exits 1 with `::error::ANTHROPIC_API_KEY is not set`; but `gh secret list` prints `NPM_TOKEN` only and `decisions.md` G6 reads "custody undecided"; grade cell `human + L1`: the secret is the human half | wrongly closed, partial |
| R11 | Closed by U2 | `.claude/CLAUDE.md:21` lists `gen:adia-exports` | closed |
| C1 | Closed by U2 | `pages.yml:38-39` `node-version: 22`, `npm ci` | closed |
| D1 | Closed by U3 | `git ls-files .claude/ops` empty; the human ruling the row waited for came as adapter C6 (`rm --cached` all seven) | closed |
| D2 | Closed by U1 | overhaul plan archived, item 2 ticked with a date; items 1, 3, 4 unticked and the plan's own Closed note says they "stand as debt D2"; `cards/PLAN-overhaul.md:1` and `decisions.md:58` (both written by U8) carry them as D2 | wrongly closed, partial |
| D3 | Closed by U2 | `.claude/workflow.json` has `"canonical": ".sdlc/adapter.md"` | closed |
| D4 | Closed by U1 | `.claude/docs/reports` gone from the index; `docs/reference/reviews/2026-08-20-reactivity/` holds 6 files | closed |
| G2 | Closed by U2 | `.gitattributes` marks `figma/plugin/ui.html` and the K9 set `linguist-generated -diff`; `head -c 600 figma/plugin/ui.html` has no generated header (0 hits); the plan's out-of-scope table says "Stays as debt G2 (half)" | wrongly closed, partial |
| G3 | Closed by U2 | `.gitattributes` lists `src/ui/describe-mcp-assets.js`; the row asked for nothing else | closed |
| G4 | Closed by U1 | `README.md:121` names `gen-font-test.mjs` | closed |
| K11 | Closed by U2 | `.claude/CLAUDE.md:66` ratifies the `html:` exception with the live count | closed |
| K18 | Closed by U1 | the §6.1 K18 block greps `test/ui/persist.mjs` for the `schema-rename v4` case (a real test block at :183-193), not a `vN` comment in `persist.js`; the architecture row names the remaining mechanical limit | closed |
| P2 | Closed by U3 (local half; remote stays human) | `git branch -vv` shows 0 `: gone]`; 38 remote branches besides `main` remain | partial, as written |
| C4 | partial (squash-only; delete-on-merge and protection open) | `gh api`: squash true, merge false, rebase false, `delete_branch_on_merge` false, `main` "Branch not protected" | partial, as written |
| P1 | partial (squash policy; delete-on-merge open) | same query | partial, as written |
| R3 | partial (README half; drawer half open) | `README.md:56` "interchange-only"; `drawer.js:38` label `["ui3", "Figma UI3"]` with no interchange word | partial, as written |
| P4 | Closed by A5 | `adapter.md` §5 "The Orchestrator closes a plan on landing" | closed |
| R12 | trigger named | row names "the first plan after #643 that opens `scripts/` or `test/`" and the close comment | as written |

Why the first table got these four wrong: it read the plan's unit file lists (which name the rows a unit touched) as closures, and never read the rows' own grade cells. Three of the four say `human + L1` or `L1 + human` in that cell; D1 says it too but its human half was ruled in adapter C6. G2's remainder is named in the plan's own out-of-scope table.

## 2. Corrected notes (now in prepr3 §3)

The four rows get the partial text below in place of the `Closed by ...` note U8 wrote at d7cf7f4 (the only note the pass 2 builder replaces; every other cell is untouched, and the file stays append-only relative to b44883d):

| Row | Note |
|---|---|
| R6 | `. Results file repointed by U1 in plan adopt-hygiene (#643); the Figma run and the OD-004 decision stay open (human)` |
| R8 | `. Workflow half closed by U2 and U6 in plan adopt-hygiene (#643), the run fails loudly without the key; the secret stays open with G6 (human)` |
| G2 | `. \`.gitattributes\` half closed by U2 in plan adopt-hygiene (#643); the header line stays open behind the P3 wall` |
| D2 | `. Archived and item 2 ticked by U1 in plan adopt-hygiene (#643); Phase 4 items 1, 3, 4 stay open` |

Tally after correction: 13 full closures (R1, R4, R7, R11, C1, D1, D3, D4, G3, G4, K11, K18 by unit; P4 by A5) and 8 partials (R6, R8, G2, D2, P2, C4, P1, R3). No em dash, no bold in any note; the `Row count` line is unchanged.

## 3. The new criterion 3 check (prepr3 §Checks, `debt-closure-check.sh`)

Design: for each of the 21 audited rows the script holds two probes read from the tree, `done_probe` (the closed part is true) and `open_probe` (something the row names is still undone; rows with no open half return false). The note is read only to classify the row: `full` (matches `Closed by U<n>|A5`, `set by U<n>`, `policy since U<n>` and no partial phrase), `partial` (matches `half` or `stays open`), or `open` (no note). Then: full needs done and not open (else `false-close` or `not-done`); partial needs done and open (else `not-done` or `half-gone`); open needs not done (else `no-note`). Probes that need `gh` (C4, P1 merge settings; R8 secret; C4 protection) read the live repository; `NO_GH=1` skips them. Exit 1 if any row printed. `u8check.sh` line 3 calls it from the same directory and appends the R12, em dash, bold, and row-count checks that were already there.

Prototype (2026-09-17):

| Where | Output | Exit |
|---|---|---|
| d7cf7f4 (`.worktrees/hygiene-U8`) | `false-close R6`, `false-close R8`, `false-close D2`, `false-close G2`, `... 4` | 1 |
| b44883d (scratch) | `no-note` for all 20 rows that carry no note there (every audited row but R3, whose partial note U1 wrote), `... 20` | 1 |
| scratch copy of d7cf7f4 with the §2 notes | `... 0` | 0 |
| same, generated header planted in `ui.html`'s first 600 bytes | `half-gone G2` | 1 |
| same, `.gitattributes` removed from index and disk | `not-done G2`, `not-done G3` | 1 |
| same, overhaul Phase 4 items 1, 3, 4 ticked | `half-gone D2` | 1 |
| same, D4's note dropped | `no-note D4` | 1 |
| `u8check.sh` line 3 at d7cf7f4 | the four row lines, then `3 debt disagreeing: 4 R12-trigger: 1 emdash: 0 bold: 0 counts: 7/7 45/45` | |

The script block in prepr3 was extracted back out with `awk` and diffed against the prototyped file: identical.

## 4. Plan revision text for `.sdlc/plans/adopt-hygiene.md` (Orchestrator applies)

U8 section, files sentence: replace `the two check scripts are in its §Checks and are run from the unit worktree root as \`sh <script> origin/main HEAD\` after copying them to \`$CLAUDE_JOB_DIR/tmp\`` with `the three check scripts are in its §Checks and are run from the unit worktree root after copying all three to \`$CLAUDE_JOB_DIR/tmp\` (\`sh u8check.sh\`, which calls \`debt-closure-check.sh\` beside it; \`sh wording-check.sh origin/main HEAD\`)`. Add `.sdlc/records/index.md` line 52 to the index edits (it is already in the file list).

U8 criterion 3 row, replace whole:

`| 3 | every closing note in \`debt.md\` agrees with its row's own evidence: 13 full closures whose evidence is true and nothing named is still open, 8 partials whose closed half is true and whose open half is still open, no closure without a note; R12 names its trigger; the U7 wording block stays green | \`u8check.sh\` line 3 (runs \`debt-closure-check.sh\`, prepr3 §Checks) | no row line, then \`3 debt disagreeing: 0 R12-trigger: 1 emdash: 0 bold: 0 counts: 7/7 45/45\` | at 61a3f90: twenty \`no-note\` lines, \`disagreeing: 20\`; at d7cf7f4: \`false-close R6\`, \`false-close R8\`, \`false-close D2\`, \`false-close G2\`, \`4\`; on a scratch copy of the corrected file: a generated header planted in \`ui.html\` prints \`half-gone G2\`, \`.gitattributes\` removed prints \`not-done G2\` and \`not-done G3\`, ticking overhaul items 1, 3, 4 prints \`half-gone D2\`, dropping D4's note prints \`no-note D4\` |`

U8 criterion 1 row, append to the Command cell `; grep -E '^\| PLAN-overhaul ' .sdlc/records/index.md | grep -c complete`, to Expected `then \`1\``, to the control `then \`0\``. This makes the index:52 fix (§5) a graded line rather than a note.

U7 criterion 2 row (carried under U8-11), the `/Users/` loop: `git grep -l '/Users/' --` becomes `git grep -lE '/Users/[a-z]' --`. The old pattern matches `.sdlc/plans/adopt-hygiene-U7-p2.md`, which carries `/Users/` only inside a quoted grep command (its C6 row), and prints a false `missing`; the new pattern matches a home directory path only (`/Users/kimba/...`) and at d7cf7f4 lists exactly `.sdlc/architecture.md`, `.sdlc/plans/adopt-hygiene.md`, `.sdlc/tickets/T-0001.md`, all named in debt C6, so the loop prints nothing. This is a criterion change, not a note: the row is rerun at every pre-land under U8-11, and a mechanical check with a known false positive teaches the next verifier to read "as written" as "close enough". One token, one revision row, no unit work.

Revision-log row:

`| 2026-09-17 | U8 pass 2: criterion 3 reads each debt row's own evidence (\`debt-closure-check.sh\`) instead of the note string; prepr3 §3 corrected, R6, R8, D2, G2 are partials not closures; criterion 1 also reads the PLAN-overhaul index status; U7 row 2's \`/Users/\` loop matches paths only (\`/Users/[a-z]\`) | verdict .sdlc/verdicts/adopt-hygiene-U8.md 🔴 (I1, I2, criterion 3 certified a false closure); re-diagnosis .sdlc/plans/adopt-hygiene-U8-p2.md |`

## 5. `.sdlc/records/index.md:52`

Replace the PLAN-overhaul row with:

`| PLAN-overhaul | docs/plan/archive/overhaul-plan-2026-08-14.md | plan | 2026-08-14 (closed 2026-09-16) | complete (the file has no status field; the dated Closed note under Phase 4 rules, items 1, 3, 4 carried as debt D2) | cards/PLAN-overhaul.md |`

This matches the two sibling rows (:56, :57), which carry `(closed 2026-09-16)` in the date cell and `complete` in the status cell, and agrees with the card and `decisions.md:58` U8 already wrote.

## 6. Builder scope for pass 2 (U8 worktree, on top of d7cf7f4)

1. `.sdlc/debt.md`: replace the trailing `Closed by ...` note on R6, R8, G2, D2 with the §2 text. Nothing else.
2. `.sdlc/records/index.md:52`: the §5 row.
3. Copy the three scripts from prepr3 §Checks to `$CLAUDE_JOB_DIR/tmp`, run `sh u8check.sh` and `sh wording-check.sh origin/main HEAD`, then the carried rows (U7-2 with the corrected loop), `npm test`, branding.
4. Handoff names the four notes as replacements (the one exception to "append only", justified by the verdict), not appends.
