---
kind: re-diagnosis
plan: docs-repair
unit: U2
ticket: "#751"
head: be13a210 (unit/dr-U2), B = 282fca8d, unit base 5d8b1c30
written: 2026-09-29
measured-at: a throwaway `--shared` clone of the repo checked out at be13a210 (and at e7058994 for the P8 fixture control) under the job's tmp dir; the unit worktree was not touched
inputs: `.sdlc/verdicts/docs-repair-U2.md` (pass 1, 🔴), review r2 at be13a210, `.sdlc/handoffs/docs-repair-U2.md` at 0c6454b9 and f9b61c87, the plan at 7cba788a, `docs-repair-U1-rediagnosis.md` (U1-8, shape), `prompt-audit-U6-rediagnosis.md` (U6-10, the handoff-equals-tree row)
plan-edits: revision 12 (P8, U2-6, the U2 steps, the grade rows, Landing)
---

# U2 re-diagnosis: a handoff is edited as a document, and no row reads it against the tree

## 1. Root cause

The handoff's Ran table was never re-run. `git diff 0c6454b9 f9b61c87 -- .sdlc/handoffs/docs-repair-U2.md` changes six lines: the title, the three header cells that carried `4095ddbf` (now `e7058994`), two new rows, and the Ran table's column header. No Ran cell moved. Round 2 was a sha substitution on a round 1 record, so U2-1's `2` (true at 4095ddbf, `5` at e7058994) rode along, and U2-5's swapped pair (`this.view` 1, `colorMode` 2; the tree says 2 and 1 at every U2 commit) was a transcription slip in round 1 that the same edit preserved. Review r2 measured the U2-5 pair, wrote the true values in a "1 low" finding, and passed the unit; the builder did not touch the cell, because nothing said a false record blocks.

Why it keeps happening (U1 F2, prompt-audit U7 F1, now U2 F1, all this evening):

- A handoff is prose about a run, and every seat treats it as prose. The builder edits the file after a review round the way it edits a doc: change the words the review named, bump the sha. Re-running the rows is a step nobody's brief lists, so it happens only when the builder decides to.
- The plan's rows read the tree, never the record. U2-1 to U2-5 hold at every U2 commit; P7 proves the head named is real and that no figure-producing file moved after it. Nothing compares a stated figure with the figure the tree gives at that head. A record that says `2` where the tree says `5` is green on every row the plan has.
- The expectations are floors (`1 or more`), so a false figure still satisfies the row; reviewers rate it low and pass. Three units in one evening at three grades (l2, l3, l5) says the grade is not the cause; the missing check is.

U6-10 on prompt-audit is the first row of this kind (three needles: two gate lines and a sha). It is a needle row, so it reads three figures; U2's defect sits in the per-criterion cells it does not reach. P8 below generalises it: the handoff carries the run as a machine-readable pair, the plan's commands and their verbatim output at the named head, and the check re-runs the commands at that head and diffs.

## 2. Pass 2 brief for the builder

Scope: `docs/reference/references/glossary.md` (three word fixes, F3) and the handoff. Every plan row U2-1 to U2-5 is 🟢 at be13a210 and stays 🟢. Two commits: commit A carries the glossary; commit B carries the handoff, whose Branch field names commit A and whose `~~~sh ran` and `~~~out ran` blocks were generated at commit A (P7, P8). Merge `plan/docs-repair` into the unit first so the plan copy carries P8 and U2-6.

| # | Where | Fix |
|---|---|---|
| F3a | glossary `Section` row | `this.section` is the ui-session field that is never persisted (`persist.js` carries no `section` key); the frame around it is invariant. Say that; do not attach `never persisted` to the frame |
| F3b | glossary `Inspector` row | `.seg-example` pins a live example beneath the tabs: `exampleArtifacts` (Color, `app.js`), `typeExampleCard` (`typography.js`), `geomExampleCard` (`geometry.js`). Not `live control`; that phrase is `geometry.js:704`'s comment, and a comment is not a source (U1 re-diagnosis §1) |
| F3c | glossary `Analysis card` row | built by the section's card method, `analysisCards`, `typeAnalysisCards` or `geomAnalysisCards`, which `renderLeftPane` (`app.js`) picks by `this.section`. Sections own no `renderLeftPane` |
| F1 | handoff | headed pass 2; `## Ran` holds a `~~~sh ran` block (P8's shape) and the `~~~out ran` block that `bash` printed for it at commit A. The old Ran table goes; the summary `Ran` cell names commit A |

Out of pass 2, recorded here so nobody re-derives it:

- F2 (`all ten` in the `hpg-export-disabled-palette` and `hpg-export-theme-invariant` contract checks). These are the spec's acceptance criteria, and a criterion states the requirement, not the sample its gate happens to take; the count is right, and `all five` at B had the same shape. Narrowing the sentence to the gate's sample would weaken the spec to fit its tests; widening the gate is test work outside the docs lane. Left as a 🟡 in the pre-land record with a note that `test/engine/exports.mjs` samples two formats for disabled and five for theme.
- F4 (P6 plan-wide `2`) is U1's `ui-plan.md`, already fixed on `unit/dr-U1`.
- The verdict's note (`5 formats non-empty` comment in `test/engine/exports.mjs`, the old product name in three `spec-draft.md` lines) stays outside U2's steps.

Then: U2-1 to U2-6, P3, P4, P7, P8 and `npm test` at commit A; `git status --short` empty after.

## 3. New rows

Commands run in the verifier's clone of the unit branch. `F` is the seat's scratch directory. No cell carries a pipe character: blocks are cut with `awk`, fields are read by position. Each control was run at be13a210 (P8 (b) at e7058994) and prints what the last column says.

| Id | Criterion | Command | Expected | Negative control | At be13a210 |
|---|---|---|---|---|---|
| P8 | every figure a handoff states reproduces at the head it names: the handoff carries the unit's criterion commands as a `~~~sh ran` block (first line `git rev-parse --short=8 HEAD`, then each plan row's command under a `# <id>` line, in plan order, then `# P3` and `tail -1 <(node test/repo/branding.mjs)`) and their verbatim output as a `~~~out ran` block, and the verifier's re-run at that head diffs empty (from this re-diagnosis; run per unit, `<unit>` its id; applies to every handoff written after revision 12, U3, U4 and U5 are merged and carried by P7 alone) | `U=<unit>; HF=.sdlc/handoffs/docs-repair-$U.md; cp "$HF" "$F/hf"; H=$(awk '$2=="Branch"{print $(NF-1); exit}' "$F/hf"); [ -n "$H" ] && echo "H=$H"; git checkout -q "$H"; awk '/^~~~sh ran/{f=1;next} /^~~~/{f=0} f' "$F/hf" > "$F/ran.sh"; awk '/^~~~out ran/{f=1;next} /^~~~/{f=0} f' "$F/hf" > "$F/ran.exp"; [ -s "$F/ran.sh" ] && [ -s "$F/ran.exp" ] && echo HAS-RAN; [ -s "$F/ran.sh" ] && [ -s "$F/ran.exp" ] || echo NO-RAN; for id in $(awk -v u="$U" '$2 ~ "^"u"-[0-9]+$"{print $2}' .sdlc/plans/docs-repair.md); do printf '%s ' "$(grep -c "^# $id\$" "$F/ran.sh")"; done; echo; bash "$F/ran.sh" > "$F/ran.act" 2>&1; diff "$F/ran.exp" "$F/ran.act"; echo "diff $?"; git checkout -q -` | `H=<sha>` (the Branch field's sha), `HAS-RAN`, one `1` per unit row of the plan (the block carries every row, in order), no diff lines, `diff 0`. The first output line is the sha itself, so a block pasted from an earlier head diffs on line 1 before any figure does. The verifier also reads `ran.sh` once against the plan's rows: the commands are the plan's rows with the cell escape removed | two. (a) the handoff as committed at be13a210 (no blocks): `H=e7058994`, `NO-RAN`, `0 0 0 0 0`, `diff 0` on two empty files. (b) a fixture handoff whose `~~~sh ran` block is U2-1 to U2-5 plus P3 and whose `~~~out ran` block transcribes the committed Ran table's cells (U2-1 `2 2 3 0 1`, U2-5 `1 1 1 1 1 2`, `736 files scanned`), run at e7058994: `diff` prints `> 5` at line 2, `< 2` at line 3, `< 1` at line 30, `< branding: clean (736 files scanned)` against `> 1` and `> branding: clean (738 files scanned)`, then `diff 1`. Those are F1's two cells and the verdict's note, found by the row | (a) `H=e7058994`, `NO-RAN`, `0 0 0 0 0`; (b) four hunks, `diff 1` |
| U2-6 | the three glossary rows F3 names say what the code does, anchored on code lines, not comments | `G=docs/reference/references/glossary.md; grep -c 'frame is invariant and never persisted' $G; awk '$2=="**Section**" && /never persisted/ {n++} END{print n+0}' $G; grep -c -w section src/ui/persist.js; grep -c 'live control' $G; grep -c 'ExampleCard' $G; grep -c 'exampleArtifacts(view)' src/ui/app.js; grep -c 'typeExampleCard(view)' src/ui/sections/typography.js; grep -c 'geomExampleCard(view)' src/ui/sections/geometry.js; grep -c "section's \x60renderLeftPane\x60 body" $G; grep -c 'AnalysisCards' $G; grep -c 'this.typeAnalysisCards(view)' src/ui/app.js; grep -c 'this.geomAnalysisCards(view)' src/ui/app.js` | `0`, `1`, `0`, `0`, `1` or more, `1` or more, `1` or more, `1` or more, `0`, `1` or more, `1`, `1` (the three code legs anchor the names the rows use; `persist.js` free of `section` is the anchor for `never persisted`) | the file at be13a210 prints `1`, `1`, `0`, `1`, `0`, `3`, `2`, `2`, `1`, `0`, `1`, `1`: the three doc legs that must be `0` are `1` and the two name legs that must be `1` or more are `0` | `1`, `1`, `0`, `1`, `0`, `3`, `2`, `2`, `1`, `0`, `1`, `1` |

P8 sits beside P7 in the plan's Landing list. P7 says the head is real and unmoved; P8 says the figures are that head's. A handoff for a unit whose plan rows need `$B` or `$F` (none of U2's do) sets them at the top of its `~~~sh ran` block.

## 4. Revisions row

Written into the plan verbatim:

`| 2026-09-29 | revision 12: U2 pass 2 from the re-diagnosis at be13a210 (.sdlc/plans/docs-repair-U2-rediagnosis.md). Root cause: the round 2 handoff was a sha substitution on the round 1 record (six header lines changed, no Ran cell), and no plan row compares a stated figure with the tree at the head it names; P7 proves the head, not the figures, and floor expectations let a false cell pass review as low. Third unit tonight (U1 F2, prompt-audit U7 F1). The plan gains P8 (every handoff carries its criterion commands and their verbatim output as a ~~~sh ran and ~~~out ran pair, re-run at the named head and diffed; the fixture built from U2's committed cells diffs in four hunks at e7058994), permanent, in the Landing list, for every handoff after this revision. U2 gains U2-6 (the Section, Inspector and Analysis card glossary rows anchored on persist.js, the three example-card methods and the three card methods; F3). F2 stays out: a contract check states the requirement, not its gate's sample. Pass 2 is three word fixes and a re-generated handoff, two commits, the doc at commit A and the handoff at A. Grade: builder-l4 (sonnet, xhigh), reviewer-l2, verifier-l2 | planner, re-diagnosis of verdict pass 1 at be13a210 |`

## 5. Builder grade

builder-l4 (sonnet, xhigh), reviewer-l2, verifier-l2, as dispatched.

Why: the edit is three sentences and a generated block; the discipline pass 1 lacked is now a row (P8) that reds on a pasted run, so the seat above pass 1's L2 buys care in reading `persist.js` and the three section files for F3, and the l2 reviewer runs P8 before reading anything else. The dispatch says: "commit the glossary first; generate both `ran` blocks with `bash` at that commit and paste them unedited; run P8 on your own handoff before committing it".
