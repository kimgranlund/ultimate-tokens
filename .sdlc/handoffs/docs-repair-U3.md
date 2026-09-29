# Handoff U3 pass 2 · builder → verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U3 @ 2f085074 |
| Base | B = 282fca8d |
| Files at 2f085074 against 184a795a | src/ui/persist.js (line 20 to 22 comment text), figma/plugin/ui.html and src/ui/describe-mcp-assets.js (regenerated) |
| Files in this handoff commit | .sdlc/handoffs/docs-repair-U3.md (this file), .sdlc/handoffs/docs-repair-U3-rework.md (line 18 label) |
| Ran | every row below at 2f085074 in `.worktrees/dr-U3` (tree clean, `git status --short` printed `0`); controls in a throwaway `--shared` clone under the job tmp dir, checked out at B, da8d48d1 or 2f085074 as named |
| Generators run (R66) | `node scripts/gen-mcp-assets.mjs`, `node scripts/gen-describe-mcp-assets.mjs`, `node scripts/bundle.mjs`, `node scripts/gen-figma-ui.mjs`, the four scripts `gen:mcp-assets`, `bundle` and `gen:figma-ui` name. Both mirrors came out byte-identical (`cmp`) to the copies the prior session left, so they are exact generator output for this `persist.js` |
| Single scripts run | `node test/repo/citations.mjs`, `node test/repo/branding.mjs`, `node scripts/audit-citations.mjs`, `sh .sdlc/checks/baseline-agrees-check.sh`. No suite, no build, no smoke, no timing run |
| npm test owed | heavy slot held by R66, to run before the verdict |
| npm run build owed | at pre-land (no `node_modules` in `.worktrees/dr-U3`) |

Every figure below is true at 2f085074 unless it names another head.

## Ran

| Id | Command | Output at 2f085074 | Negative control |
|---|---|---|---|
| U3-1 | the plan's four greps | `1`, `1`, `1`, `1` | at B: `0`, `0`, `0`, `1` |
| U3-2 | the plan's two greps and `makeVoices()` | `0`, `1`, `15` | at B: `1`, `0`, `15` |
| U3-3 | the plan's cite, line and audit commands | no `NO-CITE`, L=`2581`, `1`, `1` | at B: L=`2570`, `0`, `0` |
| U3-4 | the plan's seven greps | `0`, `1`, `1`, `1`, `1`, `1`, `1` | at B: `1`, `0`, `0`, `1`, `1`, `0`, `0` |
| U3-5 | the plan's loop | ten `1`s, then `1`, `0` (`slider()` has no row) | at B: `0 1 0 1 0 1 0 1 0 1`, then `1`, `0` |
| U3-6 | the plan's three greps | `0`, `1`, `0` | at B: `1`, `0`, `1` |
| U3-7 | the plan's five commands | `0`, `1`, `1`, `0`, `0` | at B: `1`, `0`, `0`, `1`, `2` |
| U3-8 | `git diff --name-only "$B" -- docs/marketing \| wc -l` | `0` | at B the diff is empty; any marketing edit prints `1` or more |
| U3-9 | P4's middle; numstat; baseline `wrote` count | `0`; `2 2 src/engine/geometry.mjs`, `1 1 src/ui/app.js`, `22 31 src/ui/persist.js`; baseline `3` (the build row plus the three U3 correction paragraphs that quote the `wrote` line; the ui.html figure did not move this pass, so no paragraph was added) | in the clone at 2f085074, `baseChroma: 100` to `101` in `persist.js`: middle `6`; at B: `0` and an empty numstat |
| U3-10 | the plan's three commands | `0`, `3`, `22` | at da8d48d1: `1`; a header line inserted at line 22 in the clone: `23` (see Notes: `citations.mjs` still read `STALE 0` under that control) |
| U3-11 | the plan's five commands | `1`; `ui.html 4125.2`; `ui.html 4125.2`; baseline `3`; `3` (the handoff carries one bundle figure, the one gen-figma-ui printed: `wrote figma/plugin/ui.html 4125.2 KB`) | the handoff at da8d48d1: `4125.5` against a tree of `4125.2`, and a baseline count of `1` against `3` |
| P1 | `npm test` | owed: heavy slot held by R66, to run before the verdict. `test/run.mjs` TESTS count and the tree leg: tree `0` at 2f085074 | the scrim control is the verifier's, with the suite |
| P2 | build leg and baseline leg | `npm run build` owed at pre-land (no `node_modules` in `.worktrees/dr-U3`). Baseline leg: `baseline-agrees-check.sh` reads `stale total: 0`; the committed ui.html measured the check's way is the figure in the U3-11 row | in the clone, the cell set to `4124.3`: `STALE ui.html: baseline 4124.3 KB, tree 4125.2 KB`, `stale total: 1` |
| P3 | branding; stripped count; raw count outside handoffs | `branding: clean (735 files scanned)`, `0`, `2` | a glyph prose line appended to `app-shell.md` in the clone: stripped `1` |
| P4 | the plan's four commands | `0`, `0`, `0`, `0` | the plan's four-name fixture prints `2` (planner's run, not rerun) |
| P5 | the plan's two commands | `1`, `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 2f085074)`, `exit 0` | in the clone, the `mixinInto` cite bumped to `app.js:1`: `docs/lld/app-shell.md: 1 STALE/NOFILE citation line(s)`, `✗ 1 citation gate failure(s)`, `exit 1` |
| P6 | the plan's two commands | `12`, `10`; U3's `11 voices` is gone, the 12 left belong to U1 and U2 | at B: `15`, `10` |
| P7 | the plan's three commands, `<unit>` = U3, run after this handoff commit | H=`2f085074`, `ancestor`, `0` expected: this commit changes only `.sdlc/handoffs/` | in the clone, H=`184a795a` (the merge before the fix): `3` (persist.js and the two mirrors) |

## P3 raw lines

The raw count outside handoffs is `2`. Both lines quote the retired `persist.js` header inside a code span, with the glyph written here as the token U+2014 because this handoff may not carry it: `persist.js <U+2014> UI state persistence for the HCT Palette Generator.`

1. `.sdlc/reviews/docs-repair-U3-progress.md:24`, a parenthesised quote.
2. `.sdlc/verdicts/docs-repair-U3-review.md:50`, a parenthesised quote.

## Pass 2 findings

| Finding | State | Evidence | Control |
|---|---|---|---|
| `No dependencies.` at `persist.js:22` | 🟢 | line 22 now reads `// Its three imports are engine constants (icon systems, the default type, the collections); nothing from the DOM.` Checked against lines 23 to 25: `ICON_SYSTEMS`/`DEFAULT_ICON_SYSTEM` (`icon-systems.mjs:13,15`), `DEFAULT_TYPE` (`type.mjs:155`), `COLLECTIONS` (`collections.js:13`) are all `export const`; the file's only `window`/`localStorage` text is in the line 4 comment. To hold 22 lines, lines 20 and 21 were shortened to `... survives` / `// as its current name, never dropped by a current-names allowlist (TKT-0016, RENAME_MAPS below).`; the TKT-0016 pointer and the RENAME_MAPS pointer stay | U3-10 at da8d48d1: `1` |
| Handoff P2 figure, build claim, U3-9 baseline, P1 head | 🟢 | this file was rewritten from the run at 2f085074, not appended to. The pass 1 figure 4125.5 (true at 0d1ebb55, where the build ran) is history only; the build claim is replaced by the owed row; U3-9's baseline count is `3`; P1 names its head | U3-11 and P7 rows above |
| Plan U3-9 note direction | 🟢 | already fixed on the plan branch at 14645215 ("which moved the `persist.js` lines the reactivity reviews cite"), merged at 184a795a; no edit here | `git show aab895f0:.sdlc/plans/docs-repair.md` carries the reversed phrase `review record lines the header cites` |
| `docs-repair-U3-rework.md:18` unlabelled count | 🟢 | reads `stripped 5 and raw 7 at 50a7f464` | at 184a795a the line read `(5 at 50a7f464` |
| Note: `03-stores-and-persistence.md` LOW 5 off by the same amount as at B | not in scope | the verdict raised it as a note; U3-10 holds the header at 22 lines so this pass moves no cite | none, no edit |

## Notes

- U3-10's control claim in the plan ("a header that grew a line ... the reactivity cites read `STALE` in P5") did not hold in my run: with a 23rd header line, `citations.mjs` still printed `STALE 0`. The gate reads anchors, as the verdict's LOW 5 note says, so the `22` leg is the only thing that catches a grown header. The plan is not edited here.
- The U3-9 control prints `6`, not `2`, because `baseChroma: 100` appears on three lines and sed rewrote each.
