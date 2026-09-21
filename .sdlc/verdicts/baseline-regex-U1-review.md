# baseline-regex-U1 review, 4a5475df..f57f99d3

**Verdict: 🟢 PASS.** No findings above nit severity. Every claim in the handoff independently reproduced from scratch runs, not from reading the diff.

## Diff
`git diff --stat 4a5475df..f57f99d3`: exactly `.sdlc/checks/baseline-agrees-check.sh` (4 lines) and `.sdlc/handoffs/baseline-regex-U1.md` (new). The two replaced lines are byte-identical to the plan's §Texts "with exactly:" block.

## Runs (throwaway clones under my own scratchpad, never the unit worktree or shared root; host lane count held at 1)
- Old script (checked out at `4a5475df`) vs new script (`f57f99d3`), planted on two different gates:
  - `test` row planted `56 to 60 s baseline; INTERIM ceiling: 280 to 550 s wall on a host at load`: old `ok .../exit 0` (defect reproduced), new `STALE .../exit 1` matching the handoff's quoted line exactly.
  - `build` row planted `1 to 3 s warm; also 9 to 9 s cold`: old `ok/exit 0`, new `STALE .../exit 1`. Fix is not test-row-specific.
- Plant fidelity: md5 of `.sdlc/adapter.md` differed before/after both sed plants (test: `19ad5351...`→`c7f429fc...`; build: same before→`76f85c11...`, matching the handoff's own hashes), and `grep -c` on each inserted marker returned 1. A silent no-op would have been caught.
- Edge cases on the new script:
  - No range at all (cell rewritten to `timing pending`): `STALE time build: baseline 1 to 3 s, adapter none`, exit 1. `ms.length > 0` correctly keeps a missing range STALE, not a vacuous pass.
  - Two ranges that both agree with baseline (`1 to 3 s warm; confirmed again at 1 to 3 s warm`): `ok .../exit 0`. `ms.every` correctly passes when every occurrence agrees.
- Clean tree, fresh, in the unit worktree: all gates `ok`, `stale total: 0`, exit 0. `npm test`: `✓ all 48 test files passed`, `git status --short` 0 lines.

## Plan criteria, run fresh in the unit worktree at merge-base `bcb7ce02`
U1-1: `1`,`0` (matches). P1: green, tree byte-stable. P4: `branding: clean (522 files scanned)`, exit 0; negative control (`cp` decision-records.md) → `FAIL: 3 branding violation(s)`, exit 1. P5: `0`. P6: `0`.

## Verbatim-quote rule (adapter.md §3), re-ran three handoff quotes
Handoff's U1-2 STALE line, U1-3 STALE line, and P1's `✓ all 48 test files passed` all matched my own fresh reruns byte for byte, glyphs included. No comma-for-em-dash or truncated-literal defect found.

## Scope wall
Only the wall's paths differ from the merge base (P5 = 0 in the unit worktree). `.sdlc/adapter.md`/`.sdlc/baseline.md` untouched in the worktree; every plant against them happened only in throwaway clones.
