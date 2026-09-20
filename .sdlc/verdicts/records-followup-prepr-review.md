# Pre-land review · plan records-followup (#709) · head 887e3eb2 vs origin/main 3ce50daa

Reviewer `reviewer-l4`, fresh context, throwaway clones. Verdict FIX-FIRST: the mechanics hold, one blocking finding.

## Gates at the head, all green

P1 `npm test` 48 of 48, no `node_modules`, clean tree after. P4 `branding: clean (501 files scanned)`. P5 `0`, `0`, `1	1`, only `.claude/CLAUDE.md:99` outside `.sdlc/`. P6 `0`; the 15 raw dashes in added lines all sit inside backtick spans. P7 seven `ok`, one `note  head:`, the ancestry `ok`, `stale total: 0`, exit 0.

The check script broken on purpose in clones: baseline count 47 exits 1 with `STALE tests`; an adapter range of `19 to 23 s` exits 1; `ref:` at the branch head exits 1 with `STALE head`; the fonts row deleted exits 1; a moved tree alone exits 0. Header and output agree in all three head cases.

Old-id sweep over the whole repo: no live cite of architecture X1 to X6, debt P1 to P4 or adapter C1 to C13 under an old name, except `roadmap.md:91` (U5's). `board.py ids` and `check` exit 0. The new baseline quotes are byte-exact against reruns. Board and checklist agree, U5 the only open row.

## Findings

1. 🟡 BLOCKING, small. The records this PR adds break the verbatim-quote rule it writes (`adapter.md:101`, `:103`). I spot-checked the first, second and fourth myself.
   - Fenced program output, which the rule forbids: `verdicts/records-followup-U6.md:34-39` (an `od -c` dump) and `questions/records-followup-U9-board-seat.md:22-24` (the hook's refusal line). Neither says the fence is stripped.
   - `cited:` is never used in any record this PR adds. `plans/archive/records-refresh-corrections.md` rows N1 and N2 quote the defective spans unmarked; `handoffs/records-followup-U4.md` and `verdicts/records-followup-checkability.md` carry `refs-canonical, ordered` unmarked.
   - An unmarked cut quote: `handoffs/records-followup-U7.md:46` writes `all 48 test files passed`; the program prints a leading check mark.
   - `baseline.md:19` and `:20` hold program output outside spans, and `:19` drops the check mark, in the very record U4 touched; rows 21 to 23 are spanned. The check script's regexes at lines 14 and 17 still match if the cells are spanned.
   About six one-line edits, no count or gate moves.
2. 🟡 `debt.md:92` K17 cites `c130dd13`, a plan-branch sha the squash drops, unannotated. `architecture.md:18` annotates its dead sha; this one does not.
3. 🟡 The plan file is stale against itself: `amended:` says revision 6; the Revisions table jumps 6 to 9 with no rows for 7 and 8, none for the head-row-as-note design change, and a two-cell row 9; `size:` lists seven units and 8 points against nine units; `:11` says local only at `d34b4fb1`; `:62` says BASE is `d34b4fb1`; the Order and Landing lines omit U8 and U9 and the two extra files; U3 step 6 says one script line changes where three did.
4. 🟡 `baseline.md` prose now false after U3's rows: `:13` says every command ran in records-refresh's U3 worktree; `:32` says a clean status says nothing about `type-fonts.js`, which the fonts row now measures; `:52` re-attributes a toolchain change to #699, the mistake F6 removed.
5. 🟡 `handoffs/conductor-resume-2026-09-20.md` lands as a permanent record: it says rebase where U9 rules merge, cites the superseded by-name exclusion, embeds a session scratchpad path, and with `standing-rulings-2026-09-20.md` sits outside what Landing says the PR carries.
6. 🟢 `adapter.md:172` (§7) still reads `build-test` + `panda-smoke`; `CLAUDE.md:99` now differs and no amendment says so. `CLAUDE.md:92-94` names three of the five gates.
7. 🟢 With an unparsable `ref:` the script prints `note  head: baseline ref none, the tree moved ...` though no comparison ran; exit is still 1.
8. 🟢 Three more records carry the home path; debt C6's file list is further out of date (20 files against 17).
9. 🟢 `roadmap.md:91` still says `P3 (debt id, ...)`, now `DP3`; U5-7 owns it.

## Questions the reviewer put

Q1, finding 1: A a small U10 editing the six spots with a delta re-review (its default); B one sentence in §3 exempting records before 2026-09-20 and command-dump fences; C carry to U5's PR.
Q2: leave the plan's `status:` at `approved`; it must not read `done` while U5 is open.

## Orchestrator's recommendation

A, and fold findings 2, 3 and 4 into the same U10, since each is a record this PR makes false and the repo's rule is that the change repairs it. Finding 3 is plan text, the Conductor's to write. Finding 5 is the Conductor's call: drop the resume note from the branch or accept it as history with a dated note on the two superseded statements.
