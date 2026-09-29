PASS

Review of U3 pass 2 on unit/dr-U3 at 8dae0573 (fix commit 2f085074), ticket #751. Reviewer: reviewer-l3 (opus, high) standing in for reviewer-l4 while fable is capped, per `.sdlc/questions/seat-reliability-approval.md`; the builder was builder-l5 (opus, medium), so builder and reviewer run on the same model. Criteria: `.sdlc/plans/docs-repair.md` U3 rows at the unit head plus plan-branch revision 3001a908 (U3-10's control cell). `B` = 282fca8d. Under owner ruling R66 no suite, build, smoke or timing run was made; every figure below is a single script or git/grep run. Worktree reads were in `.worktrees/dr-U3`; controls ran in a `--shared` clone at 8dae0573 under the job tmp dir (`git rev-parse --short HEAD` printed `8dae0573`).

## Prior findings (verdict pass 2 at da8d48d1)

| Finding | Status | Evidence | Negative control |
|---|---|---|---|
| 🔴 `No dependencies.` at `persist.js:22` | fixed | `src/ui/persist.js:22` reads `// Its three imports are engine constants (icon systems, the default type, the collections); nothing from the DOM.` Read against lines 23 to 25: `ICON_SYSTEMS`, `DEFAULT_ICON_SYSTEM` (`icon-systems.mjs:13,15`), `DEFAULT_TYPE` (`type.mjs:155`), `COLLECTIONS` (`collections.js:13`) are all `export const`, and neither `icon-systems.mjs` nor `collections.js` imports anything. The file's only `window`/`localStorage` text is the line 4 comment. The sentence is true | U3-10's grep at da8d48d1 prints `1` |
| 🔴 handoff P2 figure, build claim, U3-9 baseline, P1 head | fixed | the handoff was rewritten, not appended to: Branch `unit/dr-U3 @ 2f085074`, one bundle figure `4125.2`, equal to the tree; the build is marked owed at pre-land; U3-9 baseline `3`, equal to the plan's command; P1 names its head | at da8d48d1 the handoff carried `ui.html 4125.5 KB` |
| 🟡 plan U3-9 note direction | fixed upstream | 14645215 on the plan branch, merged into the unit at 184a795a | none needed |
| 🟡 `docs-repair-U3-rework.md:18` unlabelled `5` | fixed | reads `stripped 5 and raw 7 at 50a7f464` | 56573160's diff shows the old `(5 at 50a7f464` |

## Criteria

| Id | Result | Evidence (my run) | Negative control (my run) |
|---|---|---|---|
| U3-10 | 🟢 | `0`, `3`, `22` | `persist.js` at da8d48d1: `1` |
| U3-11 | 🟢 | `1`; `ui.html 4125.2`; `ui.html 4125.2`; `` baseline `3` `` (twice, U3-9 and U3-11 rows); `3` | the handoff at da8d48d1: `ui.html 4125.5 KB` against a tree of `4125.2` |
| P7 | 🟢 | H=`2f085074`, `ancestor`, `0` | with H=`184a795a`: `3` (the fix and both mirrors) |
| U3-9 | 🟢 | numstat `2 2 src/engine/geometry.mjs`, `1 1 src/ui/app.js`, `22 31 src/ui/persist.js`; the fix hunk is two `//` lines out, two in | not rerun; the verdict's control stands and this pass moves no code line |
| Mirrors are generator output | 🟢 | in the clone, `gen-mcp-assets`, `gen-describe-mcp-assets`, `bundle`, `gen-figma-ui` printed `wrote figma/plugin/ui.html 4125.2 KB` and left the tree at `0` changed files; the new sentence appears in `ui.html` (2) and `describe-mcp-assets.js` (1), the old `No dependencies` in neither | da8d48d1's two mirrors put back: `2` changed files; regenerated: `0` |
| P2 baseline leg | 🟢 | `baseline-agrees-check.sh`: `stale total: 0`; build owed at pre-land | as the handoff's `4124.3` control |
| P3 | 🟢 | `branding: clean (735 files scanned)`; `0` U+2014 on added lines in `git diff 184a795a HEAD` | not rerun |
| P5 | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 8dae0573)` | not rerun; the header held 22 lines, so no cite moved |
| P1 | owed | `npm test` held by R66; tree `0` after the generator run | the Verifier's, with the suite |

## Findings

1. 🟡 `.sdlc/handoffs/docs-repair-U3.md:7` and the Pass 2 findings row (`:51`): "line 20 to 22" and "lines 20 and 21 were shortened". Line 20 is unchanged (`git show 184a795a:src/ui/persist.js` line 20 already ends `survives`); the fix rewrote lines 21 and 22. A records inaccuracy with no effect on any figure.
2. 🟡 `.sdlc/plans/docs-repair.md` in the unit branch still carries U3-10's old control cell ("the reactivity cites read `STALE` in P5"). 3001a908 fixes it on `plan/docs-repair`, and the handoff's Notes measured the same thing (`STALE 0` under a 23-line header). It reconciles when the unit merges into the plan branch; no unit edit is needed.
3. Nit: `src/ui/persist.js:22` is 114 characters; the other header lines run to 99. The one-line rule held the 22-line count, which matters more. No gate reads line length.
4. Note: `src/ui/persist.js:117` and `src/engine/type.mjs:155` carry U+2014 in comments. Both predate U3, neither is in this diff, and they belong to the F5 merge debt the verdict already records.
