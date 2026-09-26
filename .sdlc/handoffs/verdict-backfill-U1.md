# Handoff U1 · builder → reviewer

`.sdlc/plans/verdict-backfill.md` §U1: the 31 title-token records, verdict: added equal to the
title's first emoji, the 31 names off `.sdlc/checks/verdict-frontmatter-grandfather.txt`.

| Field | Value |
|---|---|
| Branch | unit/bf-U1 @ e2bd2329 |
| Files | the 31 `.sdlc/verdicts/*.md` named in the plan's U1 list, `.sdlc/checks/verdict-frontmatter-grandfather.txt` |
| Commit | one commit, e2bd2329, the 31 files and the list together |

## Tokens added (31)

| File | Token |
|---|---|
| adopt-hygiene-U1.md | 🟢 |
| adopt-hygiene-U10-review.md | 🟢 |
| adopt-hygiene-U10.md | 🟢 |
| adopt-hygiene-U2.md | 🟢 |
| adopt-hygiene-U3-review.md | 🟢 |
| adopt-hygiene-U3.md | 🟢 |
| adopt-hygiene-U4.md | 🟢 |
| adopt-hygiene-U5.md | 🟢 |
| adopt-hygiene-U6.md | 🟢 |
| adopt-hygiene-U7.md | 🟢 |
| adopt-hygiene-U8-review.md | 🟢 (front matter) |
| adopt-hygiene-U8.md | 🟢 |
| adopt-hygiene-U9-review.md | 🟢 (front matter) |
| adopt-hygiene-U9.md | 🟢 |
| adopt-hygiene-plan.md | 🟡 |
| architecture.md | 🟢 |
| baseline-regex-U1.md | 🟢 |
| k17-rerun-U1.md | 🟡 |
| k17-rerun-prepr-review.md | 🟢 (front matter) |
| records-followup-U1.md | 🟢 |
| records-followup-U2.md | 🟢 |
| records-followup-U3.md | 🟢 |
| records-followup-U4.md | 🟢 |
| records-followup-U6.md | 🟢 |
| records-followup-U7.md | 🟢 |
| records-refresh-U1.md | 🟢 |
| records-refresh-U4.md | 🟢 |
| records-refresh-checkability.md | 🟢 |
| records-tidy-U1.md | 🟢 |
| records.md | 🟡 |
| survey.md | 🟡 |

All 28 non-front-matter files carry the line at line 2; the three front-matter files
(`adopt-hygiene-U8-review.md`, `adopt-hygiene-U9-review.md`, `k17-rerun-prepr-review.md`) carry it
as the last line inside the front matter block, directly above the closing `---`.

## Criteria run

| Id | Command | Evidence | Control | State |
|---|---|---|---|---|
| U1-1 | title/line token match loop from the plan | `31` ok, no `MISMATCH` | ran the plan's own control on a clone edit: `sed -i '' '2s/🟢/🟡/' .sdlc/verdicts/adopt-hygiene-U1.md` gave `30` and one `MISMATCH` | 🟢 |
| U1-2 | placement loop, 28 at line 2, 3 in front matter | `28 1`, three lines each `verdict: 🟢` | against the plan's stated `Today` baseline `28 0` (the pre-edit tree), confirming the loop read `0` before this unit's edit | 🟢 |
| U1-3 | list hash after removal, kept-16 hash, header char | `cf9e4407ced1d74d6e1b8007fb0a7a3cbcf0657860e5bf799abb3dcb82723e42`, `ee97008bb4def1516de7765c7e0145768217a4df8ca3c3bb001247e7a0aad8e8`, `#` | matches the plan's precomputed U1/U2 set hashes exactly; a name moved wrong would print a different pair, per the plan's own row | 🟢 |
| U1-4 | later-block re-grade reading, 31 files | `for f in <the 31>; do ...; done` read to each file's last block: no `MISMATCH` against the title | contrasted against the plan's own counter-case, `k17-rerun-checkability.md` (a U2 file whose `## Pass 2` overturns its title, which is why it is excluded from U1) | 🟢 |
| U1-5 | `sh .sdlc/checks/verdict-frontmatter-check.sh` at unit head | `verdicts 79 graded 63 grandfathered 16 bad 0`, `exit 0`, `16` | P4's plan controls (`CLEARED`/`MISSING` on a clone) apply unchanged, not replanted here since they test the check script, not this unit's edits | 🟢 |
| U1-6 | one commit carries both the files and the list | `1`, and `e2bd2329` for both the list and `adopt-hygiene-U1.md` | `git log --format=%h "$B"..HEAD -- <list>` and the same command against a second file both print the single commit hash, proving neither moved separately | 🟢 |
| P1 (regression guard) | `npm test` foreground, 600000 ms timeout | `✓ all 48 test files passed`, exit 0, `git status --short` empty after | the adapter's own control (`sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test`) was not replanted this unit: nothing under `src/`, `test/`, `scripts/` was touched, so P1 is carried as the plan's stated regression guard | 🟢 |
| P2 (branding + em dash) | `node test/repo/branding.mjs`; added-line em dash sweep, backtick-stripped and raw | `branding: clean (568 files scanned)`, `0`, `0` | the plan's own control (`cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md` reds branding) was not replanted: every line added here is a bare `verdict: <emoji>` line, none quoting a dash | 🟢 |
| P7 | every `.sdlc/checks/*.sh` | all five `exit 0` | matches the plan's recorded `Today` baseline for the same five scripts, run at this unit's head instead of the plan's | 🟢 |

## Left out

Nothing from the U1 scope. The 16 U2 names, the check/adapter retirement, and the list's remaining
header line are U2/U3 work, untouched here.

`git rev-parse HEAD`: `e2bd2329dba8a1840d04b7f75e77c009174164cd`
