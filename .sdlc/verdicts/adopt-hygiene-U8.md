# Verdict adopt-hygiene U8 · 🟢 (pass 2)
verdict: 🟢

Graded by sdlc-verifier on 2026-09-17 (evidence run: adopt-hygiene-U8-verifier-l3-p2, grade l3, Fable 5.1). Replaces the pass 1 🔴 on d7cf7f4. Branch `unit/hygiene-U8` @ 266d13e, merge-base 0aec4a8, graded against the `sdlc/adopt` plan copy at 2ee32f0 (revised criteria 1 and 3). Worktree left at status 0; controls in detached scratch worktrees at b44883d, 61a3f90, d7cf7f4, and a mutable copy of head (removed); root checkout untouched. The handoff, the review, and the re-diagnosis were not used as evidence.
Tally: 23 rows. 🟢 21 · 🟡 2 · 🔴 0. Both pass 1 blockers are closed, and the closure check now fails on a false closure rather than on a missing note. The two 🟡 are record parity on the unit branch, which the merge resolves.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U8-1 | records index agrees with head, including the PLAN-overhaul status row | 🟢 | `index stale: 0 reactivity: 1 ops-untracked: 1`, PLAN-overhaul grep 1; `:52` now reads closed and complete with the D2 carry, matching its sibling rows | b44883d and 61a3f90: `2 0 0` then `0`; status reverted on a scratch copy: `0` |
| U8-2 | adapter: three appended amendments, no deletion since 80ae4d8 | 🟢 | `s2: 1 s3-ignores: 1 s8: 1 deletions-vs-80ae4d8: 0` | b44883d: `0 0 0 0`; rewording a pre-80ae4d8 line: `deletions: 1` |
| U8-3 | every closing note agrees with its row's own evidence: 13 full, 8 partial, no note-less closure; R12 trigger; wording block | 🟢 | closure check with live `gh`: `disagreeing: 0`, exit 0; `debt disagreeing: 0 R12-trigger: 1 emdash: 0 bold: 0 counts: 7/7 45/45` | 61a3f90: 20 `no-note` lines; d7cf7f4: `false-close R6/R8/D2/G2`; planted header in `ui.html`: `half-gone G2`; `.gitattributes` removed: `not-done G2`, `not-done G3`; overhaul items ticked: `half-gone D2`; D4 note dropped: `no-note D4` |
| U8-4 | decisions ledger gaps and rows | 🟢 | `gaps-closed: 5 rows: 1 1 1 1 1 G6: 1`; G6 text matches live `gh secret list` (`NPM_TOKEN` only) | b44883d: all `0` |
| U8-5 | cards | 🟢 | `active: 0 overhaul-closed: 1 adr004-names-023: 2`; card names the D2 carry | b44883d: `2 0 0` |
| U8-6 | architecture K18 row and script | 🟢 | `vN: 0 snapshot: 1 script: 0`; block silent at version 4 | b44883d: `1 1 0`; bump to 5: the missing-case line |
| U8-7 | plan wording, U8 listed | 🟢 | `three-units: 0 bold-lead: 0 U8-listed: 1` | b44883d: `3 3 0` |
| U8-8 | shipping-changes: no "no hooks" claim, no pinned model | 🟢 | `stale: 0`; foundations names the guard and the board hooks | b44883d and origin/main: `3` |
| U8-9 | project-docs SPEC row | 🟢 | `spec-absent: 0 spec-files: 2` | b44883d: `1 2` |
| U8-10 | no plan-authored em dash or bold label on added lines | 🟢 | check: `0, 0`, exit 0; independent recount over `origin/main...HEAD` outside verdicts and handoffs: 24 dash lines, all in the ratified kept classes; 8 bold lines, all ratified markers | 61a3f90: `9, 3`, exit 1; README dash restored and committed: that line, `1, 0` |
| U8-11 | carried rows stay green | 🟢 | P1 44 pass and 0; P2 0; P3 0; P4 clean (427); P5 0; U1-7, U1-8, U1-11, U1-12, U2-4, U6-1, U6-4 at expected values; U7-2 revised loop prints no `missing` line, clash block silent, `7 / 7`, `45 / 45` | role-table plant: FAIL 3; origin/main ops tree 7; motion.mjs probe 2; `docs/x.md` copy: FAIL 3; old U7-2 loop still prints its false positive |
| U8-12 | gates green, tree clean, branding clean | 🟢 | `✓ all 44 test files passed`; status 0; `branding: clean (427 files scanned)` | controls above |
| U8-13 | board: U2 cell closed, U8 row present | 🟢 | `follow-up` 0, `U8` 1 on the branch and on `sdlc/adopt` | b44883d: `1`, `0` |
| I1 | pass 1 gap: debt G2 matches reality | 🟢 | note reads as a half: `.gitattributes` closed by U2 (9 entries, `ui.html` among them), header line open behind the P3 wall; `head -c 600 figma/plugin/ui.html` header count 0; form matches the other partials | scratch with a full-closure note: `false-close G2` |
| I2 | pass 1 gap: D2 and its sibling records agree | 🟢 | overhaul archive: item 2 ticked, items 1, 3, 4 open, closing note names D2; card, `decisions.md:58`, `index.md:52` carry the same sentence; D2 reads open for those items. Five records, one state | scratch with a full-closure note: `false-close D2`; items ticked: `half-gone D2` |
| I3 | re-diagnosis no longer prescribes the false closures | 🟡 | corrected on `sdlc/adopt` (R6, R8, G2, D2 are partial rows, no full-closure line). Concern: the branch copy is still the old text, so the unit branch documents a refuted prescription until merge | branch grep for the old closure line: 1; root copy: 0 |
| I4 | the closure check detects a false closure, not the note string | 🟢 | the check reads each row's own probes from the tree and live `gh`; planted full-closure notes on G2, D2, and C4 each print `false-close`, exit 1 | clean copy: `0`, exit 0; the pass 1 string check printed `open-of-17: []` for all three |
| I5 | every closed or partial row re-derived against its own evidence | 🟢 | 13 full rows (R1, R4, R7, R11, C1, D1, D3, D4, G3, G4, K11, K18, P4) and 8 partials (R3, R6, R8, G2, D2, P2, C4, P1) checked with the verifier's own commands and live `gh`; no row disagrees | d7cf7f4 carried four rows that disagreed with this same evidence |
| I6 | `index.md:52` PLAN-overhaul status | 🟢 | rewritten, graded under criterion 1 | scratch revert: `0` |
| I7 | U7-2 `/Users/` loop false positive | 🟢 | criterion revised to `/Users/[a-z]`; revised loop silent at head | old loop: `missing .sdlc/plans/adopt-hygiene-U7-p2.md` |
| I8 | scope wall | 🟢 | outside `.sdlc/`, `.claude/`, `docs/`, `README.md`: 0 files; only `test/repo/branding.mjs` differs from origin/main under the wall, which P3 excludes (U2) | P3 probe: 2 |
| I9 | wording recount | 🟢 | see U8-10 | see U8-10 |
| I10 | plan copy parity, branch vs `sdlc/adopt` | 🟡 | not identical: the root copy carries revised criteria 1, 3, U7-2 and two revision rows, plus `U8-p2.md` and the corrected re-diagnosis. The branch never edited these files, so the merge takes the root copies without conflict | `git diff --stat sdlc/adopt unit/hygiene-U8 -- .sdlc/plans/`: 14 lines and 104 lines |

Notes (non-blocking):
- The handoff frontmatter names sha 7ca8ef8, a commit on no branch; head is 266d13e.
- Criterion 2's control wording says any adapter line; the guard covers pre-80ae4d8 lines, which is what the criterion needs.
- The closure check reads live `gh` for C4, P1, R8; with `NO_GH=1` those probes are skipped and a false closure there would pass. Worth knowing before the check is reused in CI.
