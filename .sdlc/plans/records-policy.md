---
status: proposed
ticket: #722, #721
priority: P2
lane: docs
size: S + S (U1 S = 1 point, U2 S = 1 point; 2 points)
labels: kind:bug · size:small (#722); kind:feature · size:small (#721)
written: 2026-09-22
depends: U1 none. U2 waits for #681 on `origin/main` (gate G0 below decides it by command; #681 adds ADR-026, so this plan's ADR is 027 and appends after it)
head: 88905891 (`origin/main`; `plan/records-policy` is cut from it, local only, never pushed by the planner)
measured-at: 88905891, in the planner's scratch worktree, 2026-09-22
branch: plan/records-policy
inputs: tickets #722 and #721; the triage `issue-triage-2026-09-22.md` rows for both; the owner answers of 2026-09-22 (records-policy planned and started now; ADR ratification stays the owner's); `scripts/gen-adia-derived-exports.mjs` (the BUMP POLICY block, lines 32 to 40 at the head); `docs/reference/references/decision-records.md` (ends at ADR-025 on main, ADR-026 on `plan/preset-intent-fidelity`); `.sdlc/adapter.md` §6 (ADR shape and append rule) and §1 (a handoff's `Ran` row is evidence for the reviewer, never for the verdict); `.sdlc/records/{index,decisions}.md` and `cards/ADR-024.md` (card and row shapes); `git show plan/preset-intent-fidelity:.sdlc/handoffs/pif-u5.md` §3.1 and the same branch's generator comment for 1.2.0 (the case #722 says the policy cannot reach)
---

# Two record fixes: the bump policy names the engine-moved case, and ADR-027 rules where a seat's evidence comes from

Two tickets, one lane, no source under `src/`. U1 rewrites one comment block in a generator so the ruling #681 already made (`minor` at 1.2.0) can be read from the policy instead of re-derived. U2 appends ADR-027 to the decision records as PROPOSED, with the card and ledger rows the records index expects, after #681 has landed ADR-026. The ADR lands as a proposal: the owner ratifies it by editing its Status line, and no seat in this plan does that.

Scope wall. Paths this plan may change: `scripts/gen-adia-derived-exports.mjs` (the BUMP POLICY comment block only; no code line, no version string), `docs/reference/references/decision-records.md` (append only: one new section before the Quick map, one Quick map row), `.sdlc/records/cards/ADR-027.md` (new), `.sdlc/records/index.md` and `.sdlc/records/decisions.md` (one row each), this plan, its handoffs, verdicts and questions. Nothing under `src/`, `test/`, `docs/reference/data/`. The generator's output is byte-identical before and after U1: the block is a comment.

Prose rules for every line this plan adds. No em dash (U+2014) outside an inline backtick span that quotes program output; the ADR heading uses ` - ` the way ADR-026 does on the #681 branch, not the older headings' glyph. No bold inline labels. The retired maker brand is paraphrased, never quoted, anywhere under `.sdlc/`. `grep -P` is absent on this host: PCRE runs through `perl`.

Criteria ids: P rows for the plan, numbered rows per unit, cited as U2-3. G0 is U2's start gate.

## Measured by the planner on 2026-09-22 at 88905891

| What | Command | Printed |
|---|---|---|
| The policy block has no engine case and one `minor` line | `awk '/BUMP POLICY/,/DO NOT EDIT/' scripts/gen-adia-derived-exports.mjs \| grep -v 'DO NOT EDIT' > /tmp/blk.txt; wc -l < /tmp/blk.txt; grep -c 'engine' /tmp/blk.txt; grep -c '^//   minor' /tmp/blk.txt; grep -c 'contract' /tmp/blk.txt` | `9`, `0`, `1`, `0` |
| The generator is byte-stable at the head | `node scripts/gen-adia-derived-exports.mjs; git status --short \| wc -l` | two `wrote` lines at 1.1.0, then `0` |
| No ADR-027 anywhere, no ADR-026 on main | `grep -c '^## ADR-027 ' docs/reference/references/decision-records.md; git show origin/main:docs/reference/references/decision-records.md \| grep -c '^## ADR-026 '` | `0`, `0` |
| ADR-026 exists on the #681 branch, hyphen heading | `git show plan/preset-intent-fidelity:docs/reference/references/decision-records.md \| grep -n '^## ADR-02[56] \|^## Quick map' \| cut -d: -f1 \| tr '\n' ' '` | `696 730 770` |
| ADR-025 was never carded or indexed | `ls .sdlc/records/cards \| grep -c ADR-025; grep -c '^| ADR-025' .sdlc/records/index.md .sdlc/records/decisions.md` | `0`, `0` and `0` (see Q2) |
| The #681 branch edits the same generator file, 20 lines below the policy block | `git diff origin/main...plan/preset-intent-fidelity -- scripts/gen-adia-derived-exports.mjs \| grep '^@@'` | `@@ -62,8 +62,13 @@` (the policy block is lines 32 to 40, so the two hunks do not touch; U1 does not wait for #681) |

## Units

- [ ] U1 (S) the BUMP POLICY block gains the engine-moved re-export case, worded on the consumer's contract · builder l2, reviewer l1, verifier l1
- [ ] U2 (S) ADR-027 appended as PROPOSED after ADR-026, with card and ledger rows · builder l5, reviewer l2, verifier l2 · blocked until G0 prints green

Grades. U1 is one comment block with a one-line answer key (the 1.2.0 comment on the #681 branch), so l2 with the lightest reviewer. U2 is judgement work: the ADR text has to hold up as a rule every seat reads, and the failure mode #721 describes was committed by seats issuing standards, so the builder is opus (l5) and the reviewer and verifier are l2, the same pairing the records-followup re-diagnosis gave for "a plausible heuristic nobody measured".

## Plan-level criteria

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| P1 | `npm test` green in the unit worktree, tree clean after | `npm test 2>&1 \| tail -1; git status --short \| wc -l` | `✓ all N test files passed` where N equals `.sdlc/baseline.md`'s figure at the head, then `0` | an unclosed `/*` planted on the `minor` comment line makes the generator a parse error and reds the run at `adia-derived-exports` (predicted from the file's import chain, not run by the planner: the verifier runs it once) | green at 88905891 per `.sdlc/baseline.md`; not rerun by the planner |
| P2 | branding clean, and no added line carries an em dash outside a backtick span | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1'; git diff $(git merge-base plan/records-policy HEAD) \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' \| wc -l` | `branding: clean (N files scanned)`, then `0` | one added prose line with the glyph makes the second figure `1`; a card under `.sdlc/records/` quoting the retired maker name from ADR-015 reds the first | clean, `0` |
| P3 | scope wall | `git diff --name-only $(git merge-base plan/records-policy HEAD) \| grep -v -E -e '^scripts/gen-adia-derived-exports\.mjs$' -e '^docs/reference/references/decision-records\.md$' -e '^\.sdlc/records/cards/ADR-027\.md$' -e '^\.sdlc/records/(index\|decisions)\.md$' -e '^\.sdlc/(plans\|handoffs\|verdicts\|questions\|board)' \| wc -l; git diff --name-only $(git merge-base plan/records-policy HEAD) -- src test docs/reference/data \| wc -l` | `0`, `0` | a fixture of two names (`src/engine/exports.js`, `.sdlc/records/cards/ADR-027.md`) piped through the first filter prints `1` (run by the planner) | `0`, `0` at 88905891 |
| P4 | the generator's committed outputs are byte-identical before and after this plan | `node scripts/gen-adia-derived-exports.mjs >/dev/null; git status --short -- docs/reference/data \| wc -l; git diff --stat $(git merge-base plan/records-policy HEAD) -- docs/reference/data \| wc -l` | `0`, `0` | in a scratch copy, edit `version: "1.1.0"` to `"1.1.1"` for one artifact and rerun: the first figure prints `1` | `0`, `0` |

## U1: the BUMP POLICY block reaches `minor` for an engine-moved re-export (#722)

The block lists patch, minor and major. #681 performed a bump none of them describes: same document, same `EXPORT_SCHEMA_VERSION`, same source tag, token values moved because the engine under them changed. Plan revision 28 of #681 ruled it `minor` and recorded the reasoning in the generator's 1.2.0 comment on that branch and in `pif-u5.md` §3.1. U1 puts that case into the policy so the next reader finds it there.

Text to paste, replacing the current `minor` line and its continuation (two comment lines) with three, and adding one closing line after `major`; every other line of the block stays byte for byte:

```
//   minor  the same document re-exported under a bumped EXPORT_SCHEMA_VERSION, a new
//          `adia-brand-document` tag, OR with token values moved by an engine change under an
//          unchanged document, schema and tag (#681 at 1.2.0): a consumer re-pins, its contract holds.
//   major  a shape change a consumer's byte-compare cannot absorb (format keys renamed/removed).
//   The distinguishing question is whether a consumer's CONTRACT changed, never whether a version
//   string did: bytes moved under the same keys is minor, a key gone or renamed is major.
```

The builder reads `git show plan/preset-intent-fidelity:.sdlc/handoffs/pif-u5.md` §3.1 and the 1.2.0 comment on that branch before editing, and does not touch the `ARTIFACTS` table, the `1.1.0` comment, or any version string: those move with #681, and the two hunks are 20 lines apart (measured above), so #681 merges over U1 without a conflict.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-1 | the block names the engine-moved case under `minor` | `awk '/BUMP POLICY/,/DO NOT EDIT/' scripts/gen-adia-derived-exports.mjs \| grep -v 'DO NOT EDIT' > /tmp/blk.txt; grep -c '^//   minor' /tmp/blk.txt; grep -c 'engine change' /tmp/blk.txt; grep -c '#681' /tmp/blk.txt` | `1`, `1`, `1` | in a scratch copy, restore the block from `origin/main`: `1`, `0`, `0` | `1`, `0`, `0` |
| U1-2 | the distinguishing question is the consumer's contract, stated once, and not a version string | `grep -c 'CONTRACT changed' /tmp/blk.txt; grep -c 'never whether a version' /tmp/blk.txt` | `1`, `1` | delete the closing two lines: `0`, `0` | `0`, `0` |
| U1-3 | the case is a comment and nothing else moved in the file | `git diff $(git merge-base plan/records-policy HEAD) -- scripts/gen-adia-derived-exports.mjs \| grep '^[-+]' \| grep -v '^[-+][-+]' \| grep -v -c '^[-+]//'` | `0` (every changed line is a `//` comment line) | change `version: "1.1.0"` on one artifact row: `2` | `0` (no diff yet) |
| U1-4 | the `patch`, `major` and per-artifact-tag lines are byte-identical to main | `diff <(git show origin/main:scripts/gen-adia-derived-exports.mjs \| grep -E '^//   (patch\|major\|Any change\|file is untouched\|docs/reference)') <(grep -E '^//   (patch\|major\|Any change\|file is untouched\|docs/reference)' scripts/gen-adia-derived-exports.mjs) \| wc -l` | `0` | reword the `major` line: `4` | `0` |
| U1-5 | the reviewer reads the ruled case at its source, not this plan's paraphrase: the review names the line of the 1.2.0 comment on the #681 branch and the handoff section it read, and states that the new `minor` text reaches `minor` for that case | `grep -c 'pif-u5.md' .sdlc/verdicts/records-policy-U1-review.md; grep -c '1.2.0' .sdlc/verdicts/records-policy-U1-review.md` | `1` or more, `1` or more | a review that cites only this plan prints `0`, `0` | no review yet |

## U2: ADR-027 appended as PROPOSED (#721)

Start gate G0, run by the Orchestrator before dispatch: `git fetch origin; git show origin/main:docs/reference/references/decision-records.md | grep -c '^## ADR-026 '` prints `1` (today `0`). Then `git merge origin/main` into `plan/records-policy` (U1 has no conflict with #681 by the hunk measurement above; if the merge reports one anyway, the Orchestrator stops and files a question rather than resolving it by hand). No unit starts before G0 prints green; a green G0 is recorded in the U2 handoff with the sha it read.

ADR number: 027, because #681 lands 026. If, when G0 runs, `grep -c '^## ADR-027 '` on `origin/main` prints `1` (another lane took the number), the builder takes the next free number, renames the card and rows to match, and the revision log records the move; the criteria below read the heading by its text, not its number, wherever that is possible.

Heading: `## ADR-027 - A seat cites only what it measured, at the ref it is writing about`, written with a plain hyphen, which is the ADR-026 precedent on the #681 branch. Body follows the file's five-part shape. Text to paste, the builder tightening wording but keeping every needle the criteria grep:

- **Context.** Over one review round of #681 U5, four defects arose from three seats through one mechanism: a figure or a judgement carried forward from a summary of a measurement rather than from the measurement. A reviewer blessed an `adapter.md` edit for conforming to a convention it had not read; a lane lead built a scope addendum from a recon's summary and dropped the recon's own caveat that it had measured the plan tip and not the unit branch, producing an instruction that would have regressed an owner ruling and broken a gate; a ledger's "every re-pin below is listed individually" and a handoff's "the merge is uncommitted" were both true of an earlier state and carried forward unchecked. A fifth instance followed at a line that is a preserved historical record, read twice at the wrong ref. A sharper second form appeared in the same plan: a constraint discovered while doing something else was recorded and obeyed and nobody asked why it existed. A reviewer correctly warned a builder not to cut a `56 to 60 s` prefix because the gate would exit 1; that warning and #718 ("the gate is pinned to a dead figure") are one sentence read from two ends. One control caught every instance: re-run the thing against the tree it describes. For the second form: ask why a constraint exists before obeying it.
- **Decision.** Three rules, binding on every seat that writes a record under `.sdlc/` or a review, verdict, brief or handoff anywhere in the repo. (1) A seat that cites a figure or a state is the seat that measured it, at the ref the record names, by a command the record shows; a record that cannot show the command cites the sha it read instead of asserting. (2) A summary of a measurement is a lead, never evidence: a handoff's `Ran` row, a recon's bullet, a review's blessing, a checklist tick or a board cell is where a seat starts, and the seat reruns before it relies. (3) A constraint inherited from another seat is interrogated before it is obeyed: the record that obeys it states why the constraint exists, or files the question and says the constraint is unexplained.
- **Rationale.** The six defects share no file and no seat; they share a shortcut, and every seat in the hierarchy took it, including the seat issuing the standards. `.sdlc/adapter.md` §1 already rules the special case ("a handoff's `Ran` row is evidence for the reviewer, never for the verdict"); this ADR generalises it to every record kind, because the pattern did not stay inside verdicts. Re-running is cheap next to a rolled-back owner ruling, and a constraint whose reason is unknown is as likely to be a defect (#718) as a rule.
- **Consequences.** A verdict or review row carries the command and its printed output at the sha the record names, which the verbatim-quote rule (adapter §3, 2026-09-19) already shapes. A brief, scope addendum or recon that summarises another seat's finding keeps that seat's caveats with it or cites the finding by path and sha. A record that rests on an inherited constraint names its source, and a constraint without a reason becomes a question, not a rule. This ADR proposes no new gate: what a check can enforce is #723's work (`verdict:` front matter as the machine-readable state). #718 and #719 stand as the two recorded instances.
- **Status.** PROPOSED 2026-09-22 (#721; drafted by plan `records-policy` U2 after #681 landed ADR-026). Ratification is the owner's: the owner edits this line to DECIDED, or amends the text under the file's amendment shape; no plan seat does either.

Also in U2: a Quick map row `| ADR-027 | rerunning a measurement another seat already recorded looks like waste | the recorded figure is a lead, not evidence; six defects in one plan came from trusting one (#721) |`; the card `.sdlc/records/cards/ADR-027.md` in the `cards/ADR-024.md` shape (title line with `PROPOSED`, the six-row field table, `Source` as the line range at the head); one row each in `.sdlc/records/index.md` (status `proposed`) and `.sdlc/records/decisions.md` (state `proposed`, lineage "generalises adapter §1's Ran-row rule; instances #718, #719").

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U2-1 | ADR-027 sits after ADR-026 and before the Quick map, and the file is append-only above it | `grep -n '^## ADR-026 \|^## ADR-027 \|^## Quick map' docs/reference/references/decision-records.md \| cut -d: -f2 \| cut -c1-12 \| tr '\n' ' '; git diff $(git merge-base plan/records-policy HEAD) -- docs/reference/references/decision-records.md \| grep '^-' \| grep -v '^---' \| wc -l` | `## ADR-026 - ## ADR-027 - ## Quick map`, then `0` | delete one line of ADR-025 in a scratch copy: the second figure prints `1`; place the section after the Quick map: the order prints `## ADR-026 - ## Quick map ## ADR-027 -` | `origin/main` prints `## Quick map` alone; after #681, `## ADR-026 - ## Quick map` |
| U2-2 | the heading is the hyphen form and carries no U+2014 | `grep -c '^## ADR-027 - A seat cites only what it measured, at the ref it is writing about$' docs/reference/references/decision-records.md; grep '^## ADR-027' docs/reference/references/decision-records.md \| perl -CSD -ne 'print if /\x{2014}/' \| wc -l` | `1`, `0` | write the heading with the older glyph: `0`, `1` | `0`, `0` |
| U2-3 | the three rules and the control are in the text | `sed -n '/^## ADR-027 /,/^## Quick map/p' docs/reference/references/decision-records.md > /tmp/adr.txt; grep -c 'a lead, never evidence' /tmp/adr.txt; grep -c 'interrogated before it is obeyed' /tmp/adr.txt; grep -c 're-run the thing against the tree it describes' /tmp/adr.txt; grep -c 'PROPOSED' /tmp/adr.txt` | `1`, `1`, `1`, `1` or more | drop rule (3) from the Decision: the second figure prints `0` | `/tmp/adr.txt` empty, all `0` |
| U2-4 | the Status line says the owner ratifies and the plan does not | `grep -c 'Ratification is the owner' /tmp/adr.txt; grep -c 'DECIDED 2026' /tmp/adr.txt` | `1`, `0` | a builder that writes `DECIDED 2026-09-22` prints `1`, `1` | `0`, `0` |
| U2-5 | Quick map row, card, and ledger rows exist | `grep -c '^| ADR-027 ' docs/reference/references/decision-records.md; ls .sdlc/records/cards/ADR-027.md \| wc -l; grep -c '^| ADR-027 ' .sdlc/records/index.md; grep -c '^| ADR-027' .sdlc/records/decisions.md` | `1`, `1`, `1`, `1` | `origin/main`: `0`, `ls` errors, `0`, `0` | `0`, error, `0`, `0` |
| U2-6 | the card's `Source` range is true at the head: its first line is the ADR-027 heading | `R=$(grep '^| Source' .sdlc/records/cards/ADR-027.md \| sed -E 's/.*:([0-9]+)-([0-9]+).*/\1/'); sed -n "${R}p" docs/reference/references/decision-records.md \| cut -c1-12` | `## ADR-027 ` | a card whose range is copied from ADR-024's (`682-694`) prints `## ADR-024 -` or a body line | no card |
| U2-7 | the card and rows carry the word `proposed`, not `decided` | `grep -ic 'proposed' .sdlc/records/cards/ADR-027.md; grep '^| ADR-027 ' .sdlc/records/index.md \| grep -c 'proposed'; grep '^| ADR-027 ' .sdlc/records/index.md \| grep -c 'decided'` | `1` or more, `1`, `0` | a row copied from ADR-024's prints `0`, `0`, `1` | no card |
| U2-8 | G0 was read by command and recorded with its sha | `grep -c 'ADR-026' .sdlc/handoffs/records-policy-U2.md; grep -cE '\b[0-9a-f]{8,40}\b' .sdlc/handoffs/records-policy-U2.md` | `1` or more, `1` or more | a handoff saying "after #681 landed" with no sha prints `1`, `0` | no handoff |

## Landing

One PR for both units, cut after U2 verifies; U1 alone may ride a draft PR at first verified unit per adapter §2.1 item 2. Pre-land needs `.sdlc/verdicts/records-policy-prepr.md` with `verdict: 🟢` and `sha:` at the branch head (adapter §2.1), then `build-test`, `panda-smoke`, `corpus-contrast` green (and `sweeps` if #713 has landed). Close per adapter §5: status `done`, units ticked, file to `.sdlc/plans/archive/`, `adapter.py close 722` and `close 721` against the pre-land record. The ticket #721 stays linked from the ADR's Status line so the owner's ratification edit has one place to go.

If #723's mandate (plan `verdict-frontmatter`) lands before this plan's verdicts are written, every new verdict here carries `verdict:` in its head; writing it that way from the start costs nothing, so the seats do it regardless of landing order.

## Owner questions

| Id | Question | Recommendation |
|---|---|---|
| Q1 | ADR-027's Status is PROPOSED and ratification is an owner edit to one line. Does the owner want to ratify in the PR review (a review comment saying "ratify" lets the Orchestrator flip the line before merge, in the same PR), or after landing in a follow-up commit of the owner's own? | after landing, by the owner's own commit: the ADR then lands exactly as reviewed, and the ratification carries the owner's name in git |
| Q2 | ADR-025 has no card and no index or decisions row (measured above); ADR-026 lands with #681 and will not have them either. U2 cards ADR-027 alone. Card 025 and 026 in the same unit (two more cards, four rows, still S), or leave them to a records sweep? | same unit: the index says "ADRs (carded)" and three uncarded ADRs in a row make the records index stale, which the user contract calls a defect equal to a bug |

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-22 | plan written, status proposed | triage plan group 2; owner started all four groups |
