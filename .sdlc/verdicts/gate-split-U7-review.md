# gs-U7 review: pre-land review fixes

| Field | Value |
|---|---|
| Reviewer | gs-U7-reviewer-l1-p1, fresh context, read only |
| Target | `unit/gs-U7` @ `2875dcc7` (final head, superseding `57cff4a8`), worktree `.worktrees/gs-U7`, base `plan/gate-split` @ `1c958d6b` (merge-base confirmed) |
| Verdict | PASS |

## Pass 3 addendum (head moved 57cff4a8 -> 2875dcc7)

Commit `9202a2cb` rewords `baseline.md:76` a second time. Before (item 8's own after-text): "The `npm test` seconds the live table above showed at this section's own writing (56 to 60 s, since superseded by the 80 to 89 s U6c-8 re-time in that same table) were measured before #681..."; grammatically valid but confusing (a table "showing" a superseded figure at its "own writing"). After: "The table's pre-#681 figures, 56 to 60 s, were measured before #681, whose corpus sweeps are the cost; the live table above now reads 89.10, 79.93 and 80.07 s, the 80 to 89 s U6c-8 re-time." Verified:
- `grep -n '56 to 60' .sdlc/baseline.md` → exactly one hit, line 76. Not doubled with pass 2's wording (pass 2's version no longer exists in the file).
- Truth check: `git log --oneline origin/main -- .sdlc/baseline.md` shows the pre-#681 commit `28c2e8cc` (before `8ba4bee4`, #681's landing) recorded `npm test` as `56.27 · 56.43 · 59.83`; matches "pre-#681 figures, 56 to 60 s" exactly.
- Live table (line 19) reads `89.10 · 79.93 · 80.07`, matching "the live table above now reads 89.10, 79.93 and 80.07 s" exactly.
- Handoff item 9 (`gate-split-U7.md`, pass 3) quotes both before and after byte-for-byte matching the diff.
- Em dash / bold sweep on `9202a2cb`'s diff alone: 0 / 0.
- Full repo re-sweep at `2875dcc7`: same file list as pass 2 (no new files touched), em dash 0, bold-label 0, branding clean (694 files), `.claude/CLAUDE.md`/`.sdlc/board.md` still untouched.
- `npm test` in a fresh `git clone --shared` at `2875dcc7`: all 50 test files passed, tree clean after.

Verdict unchanged: PASS.

## Rows

| # | Check | State | Evidence |
|---|---|---|---|
| Finding 1 (shipping-changes CI figure) | fixed | 🟢 | `SKILL.md` step 6 now reads "~265 s wall on a PR, measured on run 35974499577: `build-test` about 260 s is the wall, the `sweeps` legs run 70 to 190 s in parallel". `gh run view 35974499577 --json conclusion,jobs`: overall `success`; `build-test` 08:18:49-08:23:11Z (262 s); every job success incl. all 5 `sweeps` legs, `panda-smoke`, `corpus-contrast`; `deploy` skipped. Matches the review's Addendum reading. |
| Finding C1 (prime.mjs comments) | fixed | 🟢 | Diff qualifies both sentences as FULL and adds "(30,240 SAMPLED, one hue in five at hue step 5)" / "(SAMPLED prints 3/30,240 at hue step 5)". Ran `node test/engine/prime.mjs` in a throwaway `git clone --shared` at `57cff4a8`: printed `negative control ... 3/30240` and the mode footer `(SAMPLED: 200 determinism cases, 500 poison renders, hue step 5)`; the comment's claimed SAMPLED denominator and hue step are exactly what the file produces. |
| ci.yml comment | fixed | 🟢 | The "Sequencing note (#713 plan)" sentence (describing #681 as unlanded and U2/U4/U5 as unmerged) is cut; the shape-rationale sentence (own runners, `fail-fast: false`, no `npm ci`, no `if:`/`continue-on-error:`) is kept verbatim. |
| C6 (U2 handoff quote) | fixed | 🟢 | `gate-split-U2.md:220` now quotes the full program-output name "Trulli of Alberobello · vernacular · Puglia, Italy\|primary\|500", matching the prepr review's cited real output. No `altered:` marker needed since the full text is restored. |
| C7 (U5 handoff quote) | fixed | 🟢 | `gate-split-U5.md:53` keeps `514 files scanned` but appends "(base's own count, not this unit's head)"; a correctly scoped fix (mark, not re-quote at head, which the review offered as an equally valid option). |
| Bold inline labels | fixed | 🟢 | `git diff 2890d67a -- gate-split-U3.md gate-split-U4.md \| grep '^+' \| grep -cE '\*\*[^*]+\*\*'` → `0` in my own re-run (handoff claims `2` remaining as table-cell data values, but those are outside the diffed files in my check; full repo sweep below confirms 0 across every touched .md). |
| adapter.md / baseline.md figures | fixed, not in original brief but disclosed | 🟢 | Team-lead follow-up items 7-8 (handoff), not part of the original six-item brief, but explicitly logged as such with before/after quotes and a stated reason (team-lead ask). `adapter.md` line 26 and `baseline.md` line 19 both read `89.10 · 79.93 · 80.07` / `80 to 89 s`; adapter §7's SDLC-proposal text and both files' "why a ceiling was needed" prose now cite the same figure instead of the stale `~60 s` / `56 to 60 s`. `.claude/CLAUDE.md` is untouched (confirmed below); its own `~60 s` line stays the owner's pending item (X9), correctly out of scope. |
| CI run figure | matches | 🟢 | `gh run view 35974499577 --json conclusion,jobs --jq '.jobs[] \| [.name,.conclusion] \| @tsv'`: `build-test success`, `sweeps (gate:sweep-prime) success`, `sweeps (gate:corpus-reset) success`, `corpus-contrast success`, `panda-smoke success`, `sweeps (gate:corpus-anchor) success`, `sweeps (gate:corpus-contrast) success`, `sweeps (gate:corpus-tonal) success`, `deploy skipped`. All 5 `sweeps` legs, matching the handoff and review. |
| `.claude/CLAUDE.md` unchanged | confirmed | 🟢 | `git diff 1c958d6b..HEAD --stat -- .claude/CLAUDE.md .sdlc/board.md` prints nothing. |
| Em dash on added lines | 🟢 | `git diff $(git merge-base origin/main HEAD) \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/'` → empty. |
| Bold inline labels, whole diff | 🟢 | `git diff 1c958d6b..HEAD -- '*.md' \| grep '^+' \| grep -cE '\*\*[^*]+\*\*'` → `0`. |
| Branding | 🟢 | `node test/repo/branding.mjs \| tail -1` → `branding: clean (694 files scanned)`, matches handoff's own reading. |
| Scope: nothing outside listed files | 🟢 | `git diff 1c958d6b..HEAD --name-only`: `.claude/skills/shipping-changes/SKILL.md`, `.github/workflows/ci.yml`, `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/handoffs/gate-split-{U2,U3,U4,U5,U7}.md`, `test/engine/prime.mjs`. All within the brief's fix list plus the disclosed adapter/baseline follow-up; no source or test-logic file touched, `.sdlc/board.md` and `.sdlc/plans/gate-split.md` untouched by this branch (a separate `git diff plan/gate-split..HEAD` shows those two files "changing" only because `plan/gate-split` itself advanced one commit past this unit's fork point, `e57e0971`, adding the U7 checklist/revision-15 entries after `unit/gs-U7` was cut from `1c958d6b`; confirmed by `git merge-base plan/gate-split HEAD` = `1c958d6b`, not a regression on this branch). |
| `npm test` | 🟢 | Ran in a fresh `git clone --shared` at `57cff4a8`: `✓ all 50 test files passed`, `git status --short` empty after. |

## Findings by severity

None. No FIX-FIRST or lower-severity issues found.

## Note

`.sdlc/plans/gate-split.md`'s U7 checklist row and revision 15 (added on `plan/gate-split` at `e57e0971`, one commit after this unit's fork point `1c958d6b`) are not reflected on `unit/gs-U7`. This is expected; the unit branch was correctly cut before that plan edit landed; but the eventual merge/rebase of `unit/gs-U7` back onto `plan/gate-split` should not silently drop those lines; worth a note to whoever performs the merge.

altered: the Orchestrator replaced the em dashes in this record's prose with semicolons when committing it (the repo rule bans the em dash outside code spans); no other change. The reviewer's original is `gs-U7-review.md` in the Lane B scratchpad.
