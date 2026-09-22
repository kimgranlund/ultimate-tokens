---
kind: handoff
plan: rule-gates
unit: U2
branch: unit/rg-U2
written: 2026-09-22
pass: 2
---

# U2 handoff: `branding.mjs` allow-list becomes a deny-list

BASE (this unit's recorded base sha, the commit the worktree was cut from): `b3961aa9`.
Head: `e22d00ff` (single commit, `sdlc(rule-gates): U2 pass 2, trim BINARY to the plan's 12-extension list (#724)`).

## Files

- `test/repo/branding.mjs`: the only file touched. `const TEXT = /\.(js|mjs|ts|json|html|css|md|yml|yaml|svg|webmanifest)$/;`
  (an allow-list) is replaced by `const BINARY = /\.(woff2|woff|ttf|otf|png|jpg|jpeg|gif|ico|webp|zip|pdf)$/;`
  (a deny-list, exactly the plan's 12 extensions, case-sensitive), with a comment saying binaries
  are skipped and everything else is scanned by default. The walk guard
  `if (!TEXT.test(rel) || SKIP_FILES.has(rel) || RECORDS.has(rel)) continue;` becomes
  `if (BINARY.test(rel) || SKIP_FILES.has(rel) || RECORDS.has(rel)) continue;`. No other line
  changed.

## Criteria (rerun at `e22d00ff`, fresh clones under this builder's own scratchpad)

| # | Criterion | Command | Output | Head |
|---|---|---|---|---|
| U2-1 | P4: `branding.mjs` opens every text file it walks past, by deny-list | throwaway clone (`git clone -q --shared .` from `e22d00ff`): plant `.sdlc/records/x/run.{log,txt,foo}` each containing the retired maker name in uppercase (typed at the keyboard, never written into this record per adapter X12); `node test/repo/branding.mjs \| tail -1`; `rm -r .sdlc/records/x`; `node test/repo/branding.mjs \| tail -1` | `` `FAIL: 3 branding violation(s) across 580 files` `` then `` `branding: clean (577 files scanned)` `` | clone of `e22d00ff` |
| U2-2 | the filter is a deny-list and names no text extension | `grep -c 'const TEXT' test/repo/branding.mjs; grep -c 'const BINARY' test/repo/branding.mjs; grep -cE 'BINARY = /.*\b(md\|mjs\|txt\|log)\b' test/repo/branding.mjs` | `` `0` ``, `` `1` ``, `` `0` `` | `e22d00ff` (worktree) |
| U2-3 | informational, not graded: the root checkout's count against a clone's | `node test/repo/branding.mjs \| tail -1` in the root checkout (`.worktrees/rg-U2`) and in a fresh clone | root: `` `branding: clean (577 files scanned)` ``; clone: `` `branding: clean (577 files scanned)` `` | `e22d00ff` (worktree and clone) |

## Negative controls

1. **U2-1's control**: same clone as U2-1 above. Plant `.sdlc/records/x/run.{log,txt,foo}` each
   containing the retired maker name in uppercase. Before removal: `FAIL: 3 branding violation(s) across 580 files` (577
   scanned + 3 planted, all three caught since none of log/txt/foo is in the binary deny-list).
   After `rm -r`: back to `branding: clean (577 files scanned)`.
2. **U2-2's control**: a separate fresh clone from `e22d00ff`. Added `txt` to the `BINARY` regex
   (`...|pdf)$/` to `...|pdf|txt)$/`), replanted the three files. `grep -cE 'BINARY = /.*\b(md|mjs|txt|log)\b'`
   now prints `1` (txt now named), and the planted `.txt` goes uncounted:
   `FAIL: 2 branding violation(s) across 578 files` (log and foo caught, txt skipped, scanned count
   is 577 + 1 uncounted-but-present txt file). The regex edit was reverted with
   `git checkout -- test/repo/branding.mjs` and the plant removed before continuing; nothing from
   this control is part of the committed code.

## Gate run (rg-common.md's required close-out)

In a separate fresh clone at head `e22d00ff` (`git clone -q --shared .`), no `node_modules`,
foreground, to completion:

- `npm test` last line: `` `✓ all 48 test files passed` ``. `git status --short | wc -l` after: `` `0` `` (tree clean).
- `node test/repo/branding.mjs` last line: `` `branding: clean (577 files scanned)` ``.

## Pass 2

The pass 1 review (`rg-U2-review.md`, verdict FIX-FIRST) raised two findings, both addressed here:

1. **Undisclosed design departure (major).** Pass 1's `BINARY` denied roughly 30 extensions
   (`bmp`, `tiff`, `gz`, `tgz`, `tar`, `rar`, `7z`, `mp3`, `mp4`, `mov`, `avi`, `wav`, `ogg`, `eot`,
   `exe`, `dll`, `so`, `dylib`, `class`, `jar`, `wasm`, `db`, `sqlite`, plus `jpe?g`/`tiff?`/`woff2?`
   variants) beyond the plan's exact 12-extension list, and added a case-insensitive `/i` flag the
   plan never states, under a design paragraph that says "nothing else in the file moves." The
   handoff's own disagreements section wrongly said "None." Fixed: `BINARY` is now exactly
   `/\.(woff2|woff|ttf|otf|png|jpg|jpeg|gif|ico|webp|zip|pdf)$/`, the plan's 12 extensions,
   case-sensitive, no `/i` flag. Only that one line moved (`git diff --stat` against `b3961aa9`
   still shows one file, one changed line beyond the pass 1 diff).
2. **Reproducibility mismatch (minor).** Pass 1's quoted figures (`579`/`576` for U2-1, `577` for
   the U2-2 control, `576` for the gate close-out) were each one file low against the reviewer's
   independent reruns. Re-run here at `e22d00ff` in fresh clones: U2-1 gives `580` then `577`
   (matching the reviewer's own `580`/`577`, not pass 1's `579`/`576`); the gate close-out gives
   `577`. No untracked files were found in any clone or the worktree at this head
   (`git status --short --ignored` in the root worktree: clean). The one-file discrepancy in pass
   1's own numbers was a transcription slip when that handoff was written, not a behavioral
   divergence; this pass's figures come from commands actually run and quoted verbatim, not
   retyped.

## Disagreements with the plan

Pass 1 departed from the plan's design: `BINARY` denied roughly 30 extensions beyond the plan's
stated 12 and added a case-insensitive flag the plan never states, and pass 1's handoff wrongly
reported "None" under this section. That is fixed in this pass: `BINARY` is now exactly the plan's
12 extensions, case-sensitive, and this section is corrected to say so plainly. No further
disagreement with the plan remains; U2-2's `0`, `1`, `0` still matches the plan's own expectation
exactly.
