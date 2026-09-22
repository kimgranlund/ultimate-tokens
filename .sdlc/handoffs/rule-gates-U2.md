---
kind: handoff
plan: rule-gates
unit: U2
branch: unit/rg-U2
written: 2026-09-22
pass: 1
---

# U2 handoff: `branding.mjs` allow-list becomes a deny-list

BASE (this unit's recorded base sha, the commit the worktree was cut from): `b3961aa9`.
Head: `1867a050` (single commit, `test(repo): branding.mjs deny-list of binary extensions (#724)`).

## Files

- `test/repo/branding.mjs`: the only file touched. `const TEXT = /\.(js|mjs|ts|json|html|css|md|yml|yaml|svg|webmanifest)$/;`
  (an allow-list) is replaced by `const BINARY = /\.(png|jpe?g|gif|webp|bmp|tiff?|ico|icns|pdf|zip|gz|tgz|tar|rar|7z|mp3|mp4|mov|avi|wav|ogg|woff2?|ttf|otf|eot|exe|dll|so|dylib|class|jar|wasm|db|sqlite)$/i`
  (a deny-list), with a comment saying binaries are skipped and everything else is scanned by
  default. The walk guard `if (!TEXT.test(rel) || SKIP_FILES.has(rel) || RECORDS.has(rel)) continue;`
  becomes `if (BINARY.test(rel) || SKIP_FILES.has(rel) || RECORDS.has(rel)) continue;`. No other
  line changed.

## Criteria

| # | Criterion | Command | Output | Head |
|---|---|---|---|---|
| U2-1 | P4: `branding.mjs` opens every text file it walks past, by deny-list | in a throwaway clone (`git clone -q --shared . <F>/neg` cloned from `1867a050`): `mkdir -p .sdlc/records/x; for e in log txt foo; do printf "$B\n" > .sdlc/records/x/run.$e; done; node test/repo/branding.mjs \| tail -1; rm -r .sdlc/records/x; node test/repo/branding.mjs \| tail -1` (`B` is the retired maker name in uppercase, typed at the keyboard per the plan's own convention, never written into this record per adapter X12) | `` `FAIL: 3 branding violation(s) across 579 files` `` then `` `branding: clean (576 files scanned)` `` | clone of `1867a050` |
| U2-2 | the filter is a deny-list and names no text extension | `grep -c 'const TEXT' test/repo/branding.mjs; grep -c 'const BINARY' test/repo/branding.mjs; grep -cE 'BINARY = /.*\b(md\|mjs\|txt\|log)\b' test/repo/branding.mjs` | `` `0` ``, `` `1` ``, `` `0` `` | `1867a050` (worktree) |
| U2-3 | informational, not graded: the root checkout's count against a clone's | `node test/repo/branding.mjs \| tail -1` in the root checkout (`.worktrees/rg-U2`) and in the clone; `git status --short --ignored \| wc -l` in the root | root: `` `branding: clean (576 files scanned)` ``; clone: `` `branding: clean (576 files scanned)` ``; root `git status --short --ignored` count: `` `1` ``. The two counts agree here (the worktree carries no extra untracked text files right now, one ignored entry only), unlike the plan's own root-vs-clone note which assumed leftover untracked files | `1867a050` (worktree and clone) |

## Negative controls (all in the same throwaway clone, cloned from `1867a050`)

1. **U2-1's control**: plant `.sdlc/records/x/run.{log,txt,foo}` each containing the maker name in
   uppercase (`$B`) on its own line. Before
   removal: `FAIL: 3 branding violation(s) across 579 files` (576 scanned + 3 planted, all three
   caught since none of log/txt/foo is in the binary deny-list). After `rm -r`: back to
   `branding: clean (576 files scanned)`.
2. **U2-2's control**: in the same clone, add `txt` to the `BINARY` regex
   (`woff2?|ttf` → `woff2?|ttf|txt`), replant the three files. `grep -cE 'BINARY = /.*\b(md|mjs|txt|log)\b'`
   now prints `1` (txt now named), and the planted `.txt` goes uncounted:
   `FAIL: 2 branding violation(s) across 577 files` (log and foo caught, txt skipped, scanned count
   is 576 + 1 uncounted-but-present txt file). Reverted with `git checkout -- test/repo/branding.mjs`
   and the plant removed before continuing.

## Gate run (rg-common.md's required close-out)

In a separate throwaway clone at head `1867a050` (`git clone -q --shared . <F>/final`), no
`node_modules`, foreground, to completion:

- `npm test` last line: `` `✓ all 48 test files passed` ``. `git status --short | wc -l` after: `` `0` `` (tree clean).
- `node test/repo/branding.mjs` last line: `` `branding: clean (576 files scanned)` ``.

## Disagreements with the plan

None. The plan's U2-2 expected `0`, `1`, `0` and this run matches exactly. The plan's U2-3 cites
`root 602, clone 532 at 3438864b` as already-stale figures ("both stale by the time a builder reads
this"); the re-measured figures at this unit's base/head are `576` in both root and clone, with the
root-clone gap being `0` rather than positive, since the worktree here has no extra untracked text
files sitting around (only one ignored entry). This is exactly the informational, non-graded
divergence the plan anticipated, not a defect.
