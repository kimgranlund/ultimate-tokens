---
status: proposed
ticket: #723
priority: P2
lane: docs (`.sdlc/checks/`, `.sdlc/adapter.md`, one new list file; no verdict file is edited)
size: M + S (U1 M = 2 points, U2 S = 1 point; 3 points)
labels: kind:chore · P2 · size:M · lane:docs · status:backlog (as minted on #723)
written: 2026-09-22
depends: none. Keep off every `.sdlc/` record another lane is editing: this plan never edits a file under `.sdlc/verdicts/`, `.sdlc/handoffs/`, `.sdlc/roadmap.md` (#720) or `.sdlc/board.md` except its own rows
head: 88905891 (`origin/main`; `plan/verdict-frontmatter` is cut from it, local only, never pushed by the planner)
measured-at: 88905891, in the planner's scratch worktree, 2026-09-22
branch: plan/verdict-frontmatter
inputs: ticket #723; the triage `issue-triage-2026-09-22.md` row for it; the owner answer of 2026-09-22 ("Mandate new ones, backfill later"); `.sdlc/plans/records-followup-U11-rediagnosis.md` §4 (the shape that would not be a fourth failure); `.sdlc/adapter.md` §2.1 item 1 (a pre-land record carries `verdict: 🟢` and `sha:`) and §6; the plugin's `scripts/adapter.py` (`--gate` reads `^(verdict|sha|version):` on any line and refuses a value other than `🟢`); the plugin's `githooks/pre-commit` (runs `scripts/verdict.py check` on staged verdicts, a table-shape check that never reads the field); `.sdlc/checks/doc-drift-rows-check.sh` (the shape a repo check takes here); the 67 files under `.sdlc/verdicts/` at the head
---

# New verdict records carry machine-readable `verdict:` front matter, and a check refuses one that does not

#723 says a record under `.sdlc/` can assert a fact about other work that nothing re-derives, and names the prerequisite: one machine-readable source of a verdict's state. Today 43 of 67 verdict files carry no `verdict:` field and three more carry one whose value is prose (`FIX-FIRST` twice, `green-with-one-note` once), so a script reading state has nothing to read. The owner ruled: mandate the field on new files, backfill later. This plan lands the mandate, the check that enforces it, and a grandfather list holding exactly the files that fail today, so the check exits 0 on the head and exits 1 on the first new file that skips the field. The backfill is U2's ticket, not this plan's work.

The field's grammar is what the adapter already reads. `adapter.py land --gate` matches `^verdict:` on any line and wants `🟢`; the k17-rerun pre-land record puts the field at line 11, after a YAML block and a title, and the adapter reads it there. The mandate keeps that shape legal and adds one placement rule so a re-grade appended at the bottom cannot be mistaken for the state: the first line starting `verdict:` must sit before the first `## ` heading, and its first token is 🟢, 🟡 or 🔴. Measured on the 24 files that carry the field today, none breaks the placement rule (`late []`), so the rule costs nobody anything.

Scope wall. Paths this plan may change: `.sdlc/checks/verdict-frontmatter-check.sh` (new), `.sdlc/checks/verdict-frontmatter-grandfather.txt` (new), `.sdlc/adapter.md` (one amendment paragraph under §6 and one line in §2.1 item 1), this plan, its handoffs, verdicts and questions, and the board's own rows. No file under `.sdlc/verdicts/` is edited, added or removed by a builder: the verdict files this plan's own seats write are new files and carry the field. Nothing under `src/`, `test/`, `scripts/`, `.github/`, `package.json`: wiring the check into `npm test` is Q1, and `test/run.mjs` is under contention from #713 U1 and `plan/rule-gates`.

Prose rules for every line this plan adds. No em dash (U+2014) outside an inline backtick span that quotes program output. No bold inline labels. The retired maker brand is paraphrased, never quoted. `grep -P` is absent on this host: PCRE runs through `perl`.

Criteria ids: P rows for the plan, numbered rows per unit, cited as U1-4.

## Measured by the planner on 2026-09-22 at 88905891

The planner wrote the candidate check to a scratch path, ran it against a scratch copy of the head, and planted six controls. Every figure below is from those runs; the builder's file may differ in wording but must print the same shape and the same numbers on the same inputs.

| What | Command (scratch copy of the head) | Printed |
|---|---|---|
| Files, field-less files, field values | `ls .sdlc/verdicts \| wc -l; grep -L '^verdict:' .sdlc/verdicts/*.md \| wc -l; grep -h '^verdict:' .sdlc/verdicts/*.md \| sort \| uniq -c` | `67`, `43`, then `21 verdict: 🟢`, `5 verdict: 🟢 pass`, `2 verdict: FIX-FIRST`, `1 verdict: green-with-one-note` |
| Placement: fields after the first `## ` heading | python probe over the 67 files (first `verdict:` line index against first `## ` line index) | `late []` |
| Candidate check with no list file: everything graded | `sh <check>` | 46 `MISSING`/`VALUE` lines, then `verdicts 67 graded 67 grandfathered 0 bad 46`, exit 1 |
| The grandfather list cut from that run | `sh <check> \| awk '/^(MISSING\|VALUE\|LATE)/{print $2}' \| tr -d ':' \| sort > .sdlc/checks/verdict-frontmatter-grandfather.txt; wc -l < .sdlc/checks/verdict-frontmatter-grandfather.txt; shasum -a 256 .sdlc/checks/verdict-frontmatter-grandfather.txt \| cut -c1-16` | `46`, `d8b7a8ff526df95d` |
| Clean run with the list in place | `sh <check>; echo "exit $?"` | `verdicts 67 graded 21 grandfathered 46 bad 0`, `exit 0` |
| Control A: a new file with no field | `printf '# Verdict x-U1 · 🟢\n\nbody\n' > .sdlc/verdicts/zz-control-U1.md; sh <check>` | `MISSING zz-control-U1.md: no verdict: line`, `verdicts 68 graded 22 grandfathered 46 bad 1`, exit 1 |
| Control B: the same file with `verdict: 🟢` on line 2 | `printf '# Verdict x-U1 · 🟢\nverdict: 🟢\nsha: abc\n\nbody\n' > ...; sh <check>` | `verdicts 68 graded 22 grandfathered 46 bad 0`, exit 0 |
| Control C: a prose value | `printf -- '---\nverdict: pass\n---\n\nbody\n' > ...; sh <check>` | `VALUE zz-control-U1.md: verdict: pass is not 🟢, 🟡 or 🔴`, bad 1, exit 1 |
| Control D: the field below a heading | `printf '# t\n\n## Tally\n\nverdict: 🟢\n' > ...; sh <check>` | `LATE zz-control-U1.md: verdict: at line 5 is after the first ## heading at line 3`, bad 1, exit 1 |
| Control E: a grandfathered file deleted | `rm .sdlc/verdicts/survey.md; sh <check>` | `STALE survey.md: grandfathered but absent`, `verdicts 66 graded 21 grandfathered 45 bad 1`, exit 1 |
| Control F: the list file absent | `rm .sdlc/checks/verdict-frontmatter-grandfather.txt; sh <check> \| tail -1` | `verdicts 67 graded 67 grandfathered 0 bad 46`, exit 1 (the check reds on its own; a wrong path for the list cannot print green) |

The 46 names, so the builder's list can be checked by hash rather than by eye: `adopt-hygiene-plan.md adopt-hygiene-U1.md adopt-hygiene-U10-review.md adopt-hygiene-U10.md adopt-hygiene-U2.md adopt-hygiene-U3-review.md adopt-hygiene-U3.md adopt-hygiene-U4.md adopt-hygiene-U5-review.md adopt-hygiene-U5.md adopt-hygiene-U6.md adopt-hygiene-U7.md adopt-hygiene-U8-review.md adopt-hygiene-U8.md adopt-hygiene-U9-review.md adopt-hygiene-U9.md architecture.md baseline-regex-U1-review.md baseline-regex-U1.md k17-rerun-checkability.md k17-rerun-prepr-review.md k17-rerun-U1.md records-followup-checkability.md records-followup-prepr-review.md records-followup-roadmap-census.md records-followup-U1.md records-followup-U11-review.md records-followup-U12-review.md records-followup-U13-review.md records-followup-U14-review.md records-followup-U14-window.md records-followup-U2.md records-followup-U3.md records-followup-U4.md records-followup-U6.md records-followup-U7.md records-followup-U8.md records-refresh-checkability.md records-refresh-prepr-review.md records-refresh-U1.md records-refresh-U4.md records-tidy-checkability.md records-tidy-U1-review.md records-tidy-U1.md records.md survey.md` (43 without the field, plus `records-followup-U13-review.md`, `records-followup-U14-review.md`, `records-followup-U8.md` whose values are prose). sha256 of the file with one name per line, sorted, no header, trailing newline: `d8b7a8ff526df95dc0f368094eaa82e0624d928bb9b1e26f9cbec6f58ad3b7dc`.

## Units

- [ ] U1 (M) the check, the grandfather list, and the adapter amendment that makes the field mandatory · builder l3, reviewer l2, verifier l2
- [ ] U2 (S) the backfill ticket, minted with the 46 names and the removal rule, linked from the list file's first line · builder l1, reviewer l1, verifier l1

Grades. U1 is a small script, but it is the class of work the re-diagnosis says failed three times on "a plausible heuristic nobody measured": the builder is l3 (sonnet, high) with the measured controls above as its floor, and the reviewer and verifier are opus (l2) so that neither shares a model with the builder. U2 is a `gh issue create` with a body this plan dictates.

## Plan-level criteria

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| P1 | `npm test` green in the unit worktree, tree clean after (the plan adds no test file, so N does not move) | `npm test 2>&1 \| tail -1; git status --short \| wc -l` | `✓ all N test files passed` where N equals `.sdlc/baseline.md`'s figure at the head, then `0` | none planted by the planner: nothing this plan touches is on the test path, so the row is a regression guard, not a discriminator, and the verifier says so | green at 88905891 per `.sdlc/baseline.md`; not rerun by the planner |
| P2 | branding clean, and no added line carries an em dash outside a backtick span | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1'; git diff $(git merge-base plan/verdict-frontmatter HEAD) \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' \| wc -l` | `branding: clean (N files scanned)`, then `0` | one added prose line with the glyph makes the second figure `1` (the planner's own probe script prints `0` under `perl -CSD -ne 'print if /\x{2014}/'`) | clean, `0` |
| P3 | scope wall: no verdict, handoff, roadmap or board file of another lane moves | `git diff --name-only $(git merge-base plan/verdict-frontmatter HEAD) \| grep -v -E -e '^\.sdlc/checks/verdict-frontmatter-(check\.sh\|grandfather\.txt)$' -e '^\.sdlc/adapter\.md$' -e '^\.sdlc/plans/verdict-frontmatter' -e '^\.sdlc/(handoffs\|verdicts\|questions)/verdict-frontmatter-' -e '^\.sdlc/board\.md$' \| wc -l; git diff --name-only --diff-filter=MD $(git merge-base plan/verdict-frontmatter HEAD) -- .sdlc/verdicts \| wc -l` | `0`, `0` (the second forbids modifying or deleting any existing verdict; adding this plan's own is allowed by the first) | a fixture of three names (`.sdlc/verdicts/survey.md`, `.sdlc/roadmap.md`, `.sdlc/verdicts/verdict-frontmatter-U1.md`) through the first filter prints `2` (run by the planner) | `0`, `0` |
| P4 | the check is green at the landing head and the list equals the failing set at that head: re-cut at pre-land, because a lane landing between now and then may add a field-less verdict, and the owner's ruling grandfathers what is on main before the mandate lands | `sh .sdlc/checks/verdict-frontmatter-check.sh; echo "exit $?"; mv .sdlc/checks/verdict-frontmatter-grandfather.txt /tmp/gf.txt; sh .sdlc/checks/verdict-frontmatter-check.sh \| awk '/^(MISSING\|VALUE\|LATE)/{print $2}' \| tr -d ':' \| sort \| diff - <(tail -n +2 /tmp/gf.txt \| sort) \| wc -l; mv /tmp/gf.txt .sdlc/checks/verdict-frontmatter-grandfather.txt` | `verdicts N graded G grandfathered 46 bad 0`, `exit 0`, then `0`. If the third figure is not `0`, a lane landed a field-less verdict after this list was cut: the Orchestrator adds those names with a revision row and the pre-land record names them; the count in the first line then reads that new total, and the plan's `46` is amended in the same commit | control F above (list absent: bad 46, exit 1) and control E (a grandfathered name gone: `STALE`, exit 1) | at the head: `bad 0`, `exit 0`, `0` with the planner's list |

## U1: the check, the list, the mandate

Files. `.sdlc/checks/verdict-frontmatter-check.sh`, in the shape of `doc-drift-rows-check.sh` (a comment header saying what it measures, `node - <<'JS' ... JS`, files and git only, exit 1 on any defect, one summary line last). `.sdlc/checks/verdict-frontmatter-grandfather.txt`: line 1 a `#` comment naming the ticket U2 mints (U2 fills the number; U1 writes `# grandfathered: field-less verdicts on main before #723's mandate; backfill ticket #TBD, U2 fills this`) and then the 46 names, one per line, sorted, no other content. The check skips the `#` line when reading the list, so the hash criterion below hashes the names only (`tail -n +2`).

Rules the check enforces, each with its own printed prefix: `MISSING` (no line starts `verdict:`), `LATE` (the first such line sits after the first line starting `## `), `VALUE` (the first token after `verdict:` is not 🟢, 🟡 or 🔴), `STALE` (a listed name no longer exists). A file named in the list is not graded at all, so a backfill commit removes the name and the file is graded from then on. Summary line: `verdicts <all> graded <n> grandfathered <n> bad <n>`.

Adapter. Under §6 Records, an amendment paragraph dated with the landing: every file added under `.sdlc/verdicts/` carries a `verdict:` line before its first `## ` heading whose first token is 🟢, 🟡 or 🔴; `sh .sdlc/checks/verdict-frontmatter-check.sh` refuses one that does not, names the 46 grandfathered files by list, and the list shrinks only by a backfill commit that also adds the field (ticket from U2). In §2.1 item 1, the sentence listing what the pre-land verifier runs gains this check beside the two committed checks the pre-land records already run (`baseline-agrees-check.sh`, `doc-drift-rows-check.sh`). The verbatim-quote and cited-quote amendments are untouched.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-1 | the check exits 0 at the unit head with the list, and 1 without it | `sh .sdlc/checks/verdict-frontmatter-check.sh \| tail -1; echo "exit ${PIPESTATUS[0]}"; mv .sdlc/checks/verdict-frontmatter-grandfather.txt /tmp/gf.txt; sh .sdlc/checks/verdict-frontmatter-check.sh \| tail -1; echo "exit ${PIPESTATUS[0]}"; mv /tmp/gf.txt .sdlc/checks/verdict-frontmatter-grandfather.txt` | `verdicts 67 graded 21 grandfathered 46 bad 0` `exit 0`, then `verdicts 67 graded 67 grandfathered 0 bad 46` `exit 1` (67 and 21 move up by this unit's own verdict files, which carry the field; 46 does not move) | control F: the second run is the control, and it is the reason a mistyped list path cannot pass | the script does not exist |
| U1-2 | the four defect classes each red on one planted file, in a scratch copy | controls A, C, D, E from the measured table, run verbatim against the builder's script | the four printed lines and exit codes in that table, byte for byte after the file name | control B (the well-formed file) prints `bad 0` exit 0, so the reds are the plant's and not the harness's | measured by the planner on the candidate script |
| U1-3 | the list is the 46 names and nothing else | `tail -n +2 .sdlc/checks/verdict-frontmatter-grandfather.txt \| shasum -a 256 \| cut -d' ' -f1; head -1 .sdlc/checks/verdict-frontmatter-grandfather.txt \| cut -c1-1` | `d8b7a8ff526df95dc0f368094eaa82e0624d928bb9b1e26f9cbec6f58ad3b7dc`, `#` | one name removed or a file that carries the field added: a different hash | no file |
| U1-4 | the check reads the list through its `#` line: a comment line is not a name | `printf '# x\nsurvey.md\n' > /tmp/l.txt; sed 's#\.sdlc/checks/verdict-frontmatter-grandfather\.txt#/tmp/l.txt#' .sdlc/checks/verdict-frontmatter-check.sh \| sh \| grep -c 'STALE # x'` | `0` | a reader that does not skip `#` prints `1` (`STALE # x: grandfathered but absent`) | no script |
| U1-5 | no existing verdict is modified, and every verdict this unit adds carries the field | `git diff --name-only --diff-filter=MD $(git merge-base plan/verdict-frontmatter HEAD) -- .sdlc/verdicts \| wc -l; for f in $(git diff --name-only --diff-filter=A $(git merge-base plan/verdict-frontmatter HEAD) -- .sdlc/verdicts); do grep -c '^verdict: [🟢🟡🔴]' "$f"; done` | `0`, then one `1` or more per added file | editing `.sdlc/verdicts/survey.md` to add the field makes the first figure `1`: backfill is U2's ticket, not this unit | `0`, nothing added |
| U1-6 | the adapter names the mandate and the check | `grep -c 'verdict-frontmatter-check.sh' .sdlc/adapter.md; sed -n '/^## 6\. Records/,/^## 7/p' .sdlc/adapter.md \| grep -c 'before its first'; sed -n '/^### 2.1/,/^### 2.2/p' .sdlc/adapter.md \| grep -c 'verdict-frontmatter-check'` | `2` or more, `1`, `1` | `origin/main`: `0`, `0`, `0` | `0`, `0`, `0` |
| U1-7 | the adapter edit is additive: no existing adapter line is removed | `git diff $(git merge-base plan/verdict-frontmatter HEAD) -- .sdlc/adapter.md \| grep '^-' \| grep -v '^---' \| wc -l` | `0` | rewording the §6 first paragraph in place prints `1` or more | `0` |
| U1-8 | the script carries no em dash and no banned string, and `npm test`'s branding leg scans it (`.sh` is not in `TEXT`, so the branding gate does not read it; the em-dash count in P2 does, and the planner's probe printed `0`) | `perl -CSD -ne 'print if /\x{2014}/' .sdlc/checks/verdict-frontmatter-check.sh \| wc -l` | `0` | one glyph in the header comment prints `1` | probe: `0` |

## U2: the backfill ticket

After U1 verifies. `gh issue create` with labels `kind:chore`, `P3`, `size:M`, `lane:docs`, title `Backfill verdict: front matter on the 46 grandfathered verdict records (#723 follow-up)`, body: the rule (first `verdict:` line before the first `## ` heading, token 🟢/🟡/🔴), the 46 names as a checklist, the removal rule (a backfill commit adds the field to a file and deletes its name from `.sdlc/checks/verdict-frontmatter-grandfather.txt` in the same commit; the check goes `STALE` if the name is deleted without the file, and the file is graded the moment the name goes), the placement note that the three `VALUE` files need their prose value replaced by a token with the prose kept after it (`verdict: 🟡 FIX-FIRST` is legal), and the owner's ruling of 2026-09-22 that backfill is later. Then the list file's first line gets the number.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U2-1 | the ticket exists with the labels and names all 46 files | `N=$(sed -n '1s/.*#\([0-9][0-9]*\).*/\1/p' .sdlc/checks/verdict-frontmatter-grandfather.txt); gh issue view "$N" --json labels,title -q '[.title, ([.labels[].name] \| sort \| join(","))] \| join(" ")'; gh issue view "$N" --json body -q .body \| grep -c -F -f <(tail -n +2 .sdlc/checks/verdict-frontmatter-grandfather.txt)` | the title above then `P3,kind:chore,lane:docs,size:M`, then `46` | a body missing one name prints `45`; a first line still reading `#TBD` makes `N` empty and `gh` errors | `N` empty |
| U2-2 | the list file's first line names the ticket and the hash of the names is unchanged | `head -1 .sdlc/checks/verdict-frontmatter-grandfather.txt \| grep -c '#[0-9]'; tail -n +2 .sdlc/checks/verdict-frontmatter-grandfather.txt \| shasum -a 256 \| cut -c1-16` | `1`, `d8b7a8ff526df95d` | editing a name while filling the number changes the hash | `0`, no file |

## Landing

One PR after U2 verifies. Pre-land needs `.sdlc/verdicts/verdict-frontmatter-prepr.md` with `verdict: 🟢` on a line before its first `## ` heading and `sha:` at the branch head (adapter §2.1), the P4 re-cut run and recorded there, then `build-test`, `panda-smoke`, `corpus-contrast` green (and `sweeps` once #713 lands). Close per adapter §5. The check runs at every pre-land from then on (adapter §2.1 amendment, U1-6); a pre-land record that lacks the field reds its own plan's pre-land, which is the intended bite.

## Owner questions

| Id | Question | Recommendation |
|---|---|---|
| Q1 | Wire the check into `npm test` as `test/repo/verdict-frontmatter.mjs` too, so a builder's own gate catches a field-less verdict before pre-land? That touches `test/run.mjs`, which #713 U1 and `plan/rule-gates` both edit, and raises the baseline's N. | not in this plan: pre-land only now; file the `npm test` wiring as a one-line follow-up on the U2 ticket, to be taken after `rule-gates` and #713 land, when `test/run.mjs` is quiet |
| Q2 | Handoffs. #723 is about verdicts; `.sdlc/handoffs/` has no state field convention at all. Extend the mandate to handoffs (a `status:` field) in a later plan, or leave handoffs prose? | leave handoffs prose for now; a handoff is a builder's own account and the verdict is the record of state; revisit if a check ever needs to read a handoff's state |

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-22 | plan written, status proposed | triage plan group 3; owner ruled "mandate new ones, backfill later" |
