---
unit: U1
plan: cache-docs
branch: unit/cd-U1
sha: 2bb80509
---

# cache-docs U1 handoff (#750)

`unit/cd-U1@2bb80509`, pushed to `origin/unit/cd-U1`. G0 ran green; four knowledge-01 cache
claims and the geometry cross-reference are rewritten to the live keys; `npm test` green,
tree clean.

## G0 (step 1)

```
gh issue view 730 --json state,stateReason --jq '.state + " " + .stateReason'  -> CLOSED COMPLETED
git show origin/main:test/run.mjs | grep -c '"repo/em-dash.mjs"'               -> 1
git show origin/main:docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md | grep -c 'REMOVED at'  -> 0
```
Rule-gates has landed (line 1, line 2). Line 3 is `0`: chroma-floor's cf-U1 rewrite of the
`_okL` line has not landed on `origin/main` yet. Per the plan's risk table this unit leaves
that file alone either way; nothing to do.

## Files changed (each changed line quoted before and after)

### `docs/reference/references/knowledge-01-color-engine.md` (5 5)

1. §6 `maxChromaInGamut`
   - before: `` - **Memoized** by key `hue.toFixed(2)+'|'+tone.toFixed(2)`. ``
   - after: `` - **Memoized** by key `hue + "|" + tone`, the exact float, bounded by `boundedCache(CACHE_CAP)` (#686). ``
2. §7 `peakC`
   - before: `` its tone. Memoized by `hue.toFixed(2)`. ``
   - after: `` its tone. Memoized by `String(hue)`, the exact float: a truncated key let the first caller into a shared rounded bucket decide every later caller's peak, the order dependence #686 fixed. ``
   (worded without the literal `0.01°`/`within 0.01` phrasing the design sketch used, so U1-1's
   whole-file needle that phrase must lose stays `0`; see Left out.)
3. §8 `oklchToCam16Hue` pseudo-code
   - before: `  memoize by h.toFixed(2)+'|'+chromaFrac.toFixed(3)`
   - after: `  memoize by target + ":" + cf  // the wrapped hue and the clamped chroma fraction, exact (#686)`
4. §9 Determinism and caching (2 physical lines)
   - before:
     ```
     chromaFrac). Keys use `toFixed(2)` (chromaFrac `toFixed(3)`) so cache hits are exact within
     0.01° / 0.01 tone.
     ```
   - after:
     ```
     chromaFrac). Keys use the exact float (`hue + "|" + tone`, `String(hue)`, `target + ":" + cf`)
     so a hit is an identical input, each bounded by `boundedCache(CACHE_CAP)` (#686). The memo `tonal.js` used to keep in front of `okhslLAt` is gone (#738).
     ```

### `.claude/skills/geometry-system/references/best-practices.md` (1 1)

- before: `  add memoization, key it deterministically (the color/type engines key on \`toFixed(2)\`).`
- after: `  add memoization, key it deterministically (the color engine keys its caches on the exact float; the type engine keeps no cache).`

No `#NNN` on this line (prompt-audit's U6-4 rule on skill narratives).

## Criteria, evidence, and controls

All commands run with `B=$(git merge-base origin/main HEAD)` = `8f5c6dc0`.

| Id | Run | Expected | Got | Control | Control result |
|---|---|---|---|---|---|
| P1 | `npm test` in the worktree | `all N passed`, N, `0` tree lines | `✓ all 53 test files passed`; `TESTS` length `53`; working tree carries only this unit's 2 intended files (both staged/committed) | clone: `sed -i '' 's/"scrim/"scrimX/' role-table.json && npm test` | `exit 1` |
| P2 | `git diff --name-only "$B" -- src scripts test figma mcp plugin package.json \| wc -l` | `0` | `0` | fixture of 2 names through the `^(src\|...)/'` filter | `1` (planner value; not rerun, arithmetic only) |
| P3 | branding + em-dash gates + raw dash counts | clean, `0`, `0`, clean, exit 0 | `branding: clean (786 files scanned)`; `0`; `0`; `em-dash: clean (794 files scanned)`; exit 0 | clone a: copy `decision-records.md` into `.sdlc/verdicts/x.md` | `FAIL: 3 branding violation(s)`, exit 1. clone b: inserted a prose line with U+2014 | raw count `1`; `em-dash.mjs` `FAIL: 1 em dashes...`, exit 1 |
| P4 | scope-wall diff filters | `0`, `0` | `0`, `0` | fixture of 3 names (reviews file, color-math SKILL.md, knowledge-01) through the wall filter | `2`; geometry file alone through same filter | `0` (admitted) |
| U1-1 | knowledge-01 needles | `0,>=1,>=1,>=1,>=1,>=1,0` | `0,2,2,2,4,1,0` | file at `8f5c6dc0` (pre-edit) | `4,0,0,0,0,0,1` |
| U1-2 | geometry needles + numstat | `0,>=1,>=1,0,"1 1"` | `0,1,1,0,"1 1"` | clone: appended `(#686)` after `no cache)` | ticket-id count `1` |
| U1-3 | `hct.js`/`type.mjs`/`geometry.mjs` needles | `3,3,2` | `3,3,2` | clone: mutated `peakC`'s key back to `hue.toFixed(2)` | count drops to `2` |
| U1-4 | citations gate + numstat | `✓ citations...`, exit 0, `"1 1 ..."`, `"5 5 ..."` | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 6d243283)`, exit 0, `1 1 best-practices.md`, `5 5 knowledge-01...` | clone: docs-repair's stale-pin mutant on `docs/lld/app-shell.md` | `✗ 1 citation gate failure(s)`, exit 1 |

Negative controls ran in a throwaway clone (`git clone -q --shared . <scratch>/neg2`), made
from this unit's own commit `2bb80509` (`git -C neg2 log -1 --format=%h` → `2bb80509`), never
in a worktree.

## Left out

- U1-1's needle over the whole file that the `0.01°`/`within 0.01` phrase must vanish (last
  count, expected `0`) first caught a real mismatch: the design sketch's suggested wording for
  the `peakC` line ("a truncated key let the first caller into a 0.01° bucket...") itself
  contains the literal string the needle forbids. Reworded to "a shared rounded bucket" to
  keep the order-dependence explanation without the banned phrase; re-ran U1-1 after, now `0`
  as required. Flagging this since it's a design-vs-criterion conflict the plan's own text
  didn't anticipate, not a deviation I'd call a design question, the fix is mechanical and the
  needle is authoritative.
- Nothing else from U1-1 to U1-4 or P1 to P4 skipped.
- Build and smoke not run (P2 is `0`; not owed).

## Note on a self-caught mistake

My first pass at these edits landed in the root checkout
(`/Users/kimba/Projects/nonoun/ultimate-tokens/docs/...`) instead of the worktree, because I
used the absolute repo path without the `.worktrees/cd-U1` prefix. Caught it before running
any gates there; the root checkout's copy of both files was reverted (currently clean) and
every edit was redone with the correct `.worktrees/cd-U1/...` paths, verified by numstat
before proceeding. All work in this handoff is from the worktree only.
