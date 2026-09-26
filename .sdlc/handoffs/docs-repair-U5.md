# Handoff U5 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/dr-U5 @ 3211ebd2 |
| Files | `.claude/CLAUDE.md` |

## Ran

| Criterion | Command | Output | Control output |
|---|---|---|---|
| U5-1 both records are named | `grep -c 'docs/lld/app-shell.md' .claude/CLAUDE.md; grep -c 'component-inventory.md' .claude/CLAUDE.md` | `1`, `1` | at `$B` (clone): `0`, `0` |
| U5-2 line count and DD rows hold | `wc -l < .claude/CLAUDE.md; sh .sdlc/checks/doc-drift-rows-check.sh \| tail -1; sh .sdlc/checks/doc-drift-rows-check.sh \| grep -c 'QUOTE'` | `115`, `rows 56 drifted 11 holds 45 undetermined 0 bad 1`, `1` (DD9 only, carried) | at `$B` (clone): `115`, `bad 1`, `1` (same, unit not yet applied); a blank line inserted above `## Layout` in the clone: `116`, `bad 21`, `21` (QUOTE rises well above 1) |
| U5-3 edit inside the Layout bullet, nothing else moved | `git diff --numstat "$B" -- .claude/CLAUDE.md \| cut -f1,2 \| tr '\t' ' '; git diff "$B" -- .claude/CLAUDE.md \| grep '^-' \| grep -v '^---' \| grep -c 'docs/lld/'` | `3 3`, `1` | at `$B` (clone): no diff, `0` lines; a four/five-line rewrite in a clone (spreading the new clauses onto extra lines instead of the same three): `5 3` (asymmetric, reds the "same number added/removed" leg), `1` |
| P3 em dash, added lines only | `B=$(git merge-base origin/main HEAD); git diff "$B" -- . ':(exclude)figma/plugin/ui.html' ':(exclude)src/ui/*-assets.js' ':(exclude)src/ui/categories' \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/\x60[^\x60]*\x60//g; print if /\x{2014}/' \| wc -l` | `0` (revision: the first rewrite of U5-2's own two lines carried the old text's em dashes forward, which counts since P3 charges a rewritten line, not just a kept one; both replaced, one with a colon, one with a comma) | at the pre-fix commit `f2926fc5`: `2` |

`npm test` on branch (run at `f2926fc5`, before the em-dash fix, and rerun manually after with the same result): `✓ all 50 test files passed`, `exit 0`, tree clean after (`git status --short` empty save for the committed edit itself before each commit). No `npm test`/`build`/`smoke` run started during the quiet window (R47); the one already in flight when it opened finished green and is what this handoff cites.

## Left out

Nothing; U5's three rows and their controls are all above. No other file touched.
