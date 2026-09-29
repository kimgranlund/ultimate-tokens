# Handoff U5 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/dr-U5 @ fa34e3a0 |
| Files | `.claude/CLAUDE.md`, `.sdlc/verdicts/docs-repair-U5-review.md` |

## Ran

| Criterion | Command | Output | Control output |
|---|---|---|---|
| U5-1 both records are named | `grep -c 'docs/lld/app-shell.md' .claude/CLAUDE.md; grep -c 'docs/reference/references/component-inventory.md' .claude/CLAUDE.md` | `1`, `1` | at `$B` (clone): `0`, `0` |
| D1 (reviewer, pass 2): the catalog cite was bare `component-inventory.md`, not the plan's `docs/reference/references/component-inventory.md` (plan :85) | same command as U5-1 above | now `1`, `1` on the full path; previously `0` on the full path, `1` on the bare name | fixed by re-wrapping lines 46-48 in place, no line added |
| U5-2 line count and DD rows hold | `wc -l < .claude/CLAUDE.md; sh .sdlc/checks/doc-drift-rows-check.sh \| tail -1; sh .sdlc/checks/doc-drift-rows-check.sh \| grep -c 'QUOTE'` | `115`, `rows 56 drifted 11 holds 45 undetermined 0 bad 1`, `1` (DD9 only, carried) | at `$B` (clone): `115`, `bad 1`, `1` (same, unit not yet applied); a blank line inserted above `## Layout` in the clone: `116`, `bad 21`, `21` (QUOTE rises well above 1) |
| U5-3 edit inside the Layout bullet, nothing else moved | `git diff --numstat "$B" -- .claude/CLAUDE.md \| cut -f1,2 \| tr '\t' ' '; git diff "$B" -- .claude/CLAUDE.md \| grep '^-' \| grep -v '^---' \| grep -c 'docs/lld/'` | `3 3`, `1` | at `$B` (clone): no diff, `0` lines; a four/five-line rewrite in a clone (spreading the new clauses onto extra lines instead of the same three): `5 3` (asymmetric, reds the "same number added/removed" leg), `1` |
| P3 em dash, added lines only | `B=$(git merge-base origin/main HEAD); git diff "$B" -- . ':(exclude)figma/plugin/ui.html' ':(exclude)src/ui/*-assets.js' ':(exclude)src/ui/categories' \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/\x60[^\x60]*\x60//g; print if /\x{2014}/' \| wc -l` | `0` (revision: the first rewrite of U5-2's own two lines carried the old text's em dashes forward, which counts since P3 charges a rewritten line, not just a kept one; both replaced, one with a colon, one with a comma) | at the pre-fix commit `f2926fc5`: `2` |

`npm test` last ran green at `79301dd8` (`✓ all 50 test files passed`, `exit 0`, tree clean after). Pass 2 (D1) is a quiet-window fix: text checks only (U5-1 to U5-3 above, rerun after the D1 fix), no `npm test`/`build`/`smoke` started.

## Left out

Nothing; U5's three rows and their controls are all above. No other file touched.
