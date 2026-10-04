# Handoff · parallel-batch U5 · builder to orchestrator

| Field | Value |
|---|---|
| Unit | U5 (#796 code lines, #783 date line), branch `unit/pb-U5`, base `plan/parallel-batch` @ 61bcd123 |
| Status | 🟢 pass 3: plan revision 4 added `:737` to the lane; no open items |

## Changes

| File | Line | Was | Now |
|---|---|---|---|
| `src/ui/overlays/drawer.js` | 529 | `The eleven-voice type scale` | `The fifteen-voice type scale` |
| `src/ui/sections/typography.js` | 535 (plan's `:534`, shifted one line on this base) | `since the 2026-07-13 fixed-size-table rewrite)` | `since 2026-07-16)` |
| `src/ui/sections/typography.js` | 1003 | `each of the eleven voices` | `each of the fifteen voices` |
| `src/ui/sections/typography.js` | 1004 | `all 53 steps across the 11 voices` | `all 51 steps across the 15 voices` |
| `src/ui/sections/typography.js` | 1013 | `Each of the eleven voices at MD` | `Each of the fifteen voices at MD` |
| `figma/plugin/ui.html` | regenerated | `eleven-voice` x1 | `eleven-voice` x0 |

Truth source: `typeScale(DEFAULT_TYPE)` gives 15 voices, 51 steps (13 x 3 + 2 x 6). `src/engine/type.mjs:41` dates the 6-step UI voices 2026-07-16 (TKT-0008), which is the composition the `:535` comment describes. `dist/` is untracked, so only `figma/plugin/ui.html` is a bundle in the diff.

## Hunk overlap with pane-context (#785)

`git diff -U0 origin/main...origin/plan/pane-context` (fetched at dispatch):

| File | pane-context hunks (new-side) | U5 hunks | Overlap |
|---|---|---|---|
| `typography.js` | 137, 324, 338-341, 345-348, 350-351, 354-355, 357-358, 365-375, 378, 607 | 535, 1003-1004, 1013 | none (nearest: 378 vs 535, 607 vs 1003) |
| `drawer.js` | no hunks | 529 | none |

## Criteria

| # | Result | Evidence |
|---|---|---|
| C5.1 | 🟢 | `grep -n eleven` on both files: nothing; `grep -c eleven-voice figma/plugin/ui.html dist/ultimate-tokens.html`: `0` and `0` after `npm test` and `npm run build` |
| C5.2 | 🟡 | `grep -c 2026-07-16 src/engine/type.mjs` = 4. `grep -n 07-13 src/ui/sections/typography.js` still prints `:671` (see Findings) |
| C5.3 | 🟢 | `git diff --name-only` = `drawer.js`, `typography.js`, `figma/plugin/ui.html`, this handoff; `npm test` 54 of 54; `npm run build` exit 0; `npm run smoke` PASS; `em-dash` and `branding` clean; tree clean after test |

Gate hygiene: `NODE_OPTIONS` unset, contention count 0 before running, `npm ci` run first.

## Findings

| Item | Detail |
|---|---|
| C5.2 premise | `typography.js:671` ("size is a fixed table since 2026-07-13") is correct: `type.mjs:8` dates the fixed-table rewrite 2026-07-13. Editing it to satisfy the grep would make it false, so I left it. The criterion should read "no `07-13` on the `:535` comment line". |
| `:535` reading | The old text tied the 13 x 3 + 2 x 6 shape to the 07-13 rewrite; that shape dates from 07-16, so the date now says 07-16 and the rewrite clause is dropped (`:671` still carries it). |
| Out of lane, not edited | `typography.js:675` says "all 11 voices live" on the Fonts tab, same stale count. Not on the plan's line list; its hunk is also clear of pane-context. Candidate for a follow-up or an Orchestrator-approved add. |
| Added in lane | `:1004` (53 steps, 11 voices) sits in the `:1003` comment and was fixed with it. |

## Pass 2 (plan revision 3)

| Item | Result |
|---|---|
| Change | `typography.js:673` comment `all 11 voices live` is now `all 15 voices live` |
| C5.2 (revised) | 🟢 `grep -n "07-13" src/ui/sections/typography.js` prints only `:671` (correct per `type.mjs:8`); none on the `:535` voices-shape comment |
| Hunk overlap | `:673` vs pane-context's last typography.js hunks (378, 607): none |
| Gates | load count 4 (limit 5) before running; `npm test` 54 of 54, `npm run build` 0, `npm run smoke` PASS, em-dash and branding clean; `grep "eleven\|11 voices"` on typography.js: nothing |
| Not edited in pass 2 | `typography.js:737` (same stale count, not named in revision 3); done in pass 3 |

## Pass 3 (plan revision 4)

| Item | Result |
|---|---|
| Change | `typography.js:737` comment `all 11, matching 1:1` is now `all 15, matching 1:1` |
| Hunk overlap | `:737` vs pane-context's last typography.js hunks (378, 607): none |
| Stale-count grep | `grep -nE "11 voices\|all 11\|eleven" src/ui/sections/typography.js src/ui/overlays/drawer.js`: empty (exit 1) |
| Gates | load count 4 (limit 5) before running; `npm test` 54 of 54, `npm run build` 0, `npm run smoke` PASS, em-dash and branding clean, `ui.html` regenerated |
