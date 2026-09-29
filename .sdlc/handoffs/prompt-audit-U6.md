# prompt-audit U6 handoff: slice B skills, pass 2

Pass 2 (rework of verdict pass 1, 🔴 at 60fd4668). Branch: unit/pa-U6. Head code commit 301f281e (the pass 2 skill edits; this handoff is the next commit), on the merge 5ad4510d of plan/prompt-audit @ 5e298d22 (revision 8). Earlier code commits 5ca1ffe4, 91b6f571, 60fd4668. Diff base B = 13346c1a9c2e7e84368f276e5f67169090f1ddaa (`git merge-base origin/main HEAD`). Every figure below was measured at that commit.

## Pass 2 rework

Each fact was read from code, not from the plan or a review: `test/ui/counts.mjs` line `export const ROLES = 53;` (header: kept independent of the engine), `test/ui/headless-boot.mjs` imports it and `(s4)` compares against it; `test/smoke/smoke.mjs` does not import `ROLES`; `test/engine/semantic.mjs` (`validPrim`, the `roles` gate's `scrims.length !== 7` and `okScrim`); `test/engine/geometry.mjs` (`REF` holds `height`, `icon`, `font`; the `caret's own ramp` assert; the `GAP calibration` block; the composition block's `JSON.stringify(composed) === JSON.stringify(base)` and `"UI-control|MD": 17`); `src/ui/overlays/drawer.js` `FORMAT_GROUPS`; `src/engine/ds-export.js`'s `./exports.js` import; `src/ui/app-helpers.mjs` `export function hydrateStoredDoc`. The count recipes were executed with `53` substituted on `git version 2.54.0 (Apple Git-157)`.

| Id | Fate | Note |
|---|---|---|
| F1 | applied | `adding-semantic-roles/SKILL.md` step 5: headless-boot's `(s4)` reads `ROLES`, a hand literal in `test/ui/counts.mjs`, so a count change edits it there; `semExpect` (`test/figma/plugin.mjs`) derives from the bundle. Proof: U6-6 |
| F2 | applied | all five count searches use `git grep -nw "<oldcount>"` (SKILL.md step 5, the prose sweep, the verify line; best-practices sweep bullet) and `git grep -nwE "37\|49"` (best-practices closing line); no `\b` on any `git grep` line. Proof: U6-7 |
| F3 | applied | `foundations.md` cites the scrim-count assert as the `roles` gate's `scrims.length !== 7` in `test/engine/semantic.mjs`, no pin; `(line ~23)` and `(line ~32)` became `validPrim` and the `roles` gate's `okScrim`; best-practices drops `(line ~132)`. Proof: U6-8 |
| F4 | applied | geometry rubric G7 names the assert that pins each constant (`REF` holds only `height`, `icon`, `font`; the caret, `CONTROL_FONT` and `GAP_UNIT` asserts); the score cell says "without updating the assert that pins it". Proof: U6-9 legs 1 |
| F5 | applied | geometry best-practices cites the composition block's `JSON.stringify` equality ("value-neutral at defaults") and the `"UI-control\|MD": 17` override flowing into `MD.font`; the invented `paddingNarrow` and `bodyBase` asserts are gone. Proof: U6-9 legs 2 to 4 |
| F6 | applied | export SKILL step 4 lists the groups `Colors`, `Typography`, `Geometry`, `Design System`, `Project`. Proof: U6-9 legs 5 and 6 |
| F7 | applied | the ds-export paragraph lists all thirteen names of the `./exports.js` import. Proof: U6-9 leg 7 |
| F8 | applied | color-math cites `hydrateStoredDoc` (`src/ui/app-helpers.mjs`). Proof: U6-9 leg 8 |
| F9 | applied | this handoff: pass 2, names the head code commit, every Ran figure re-measured at it. Proof: U6-10 |
| F10 | dropped | plan defects, the planner's; revision 8 fixed them. Proof: `git show 5e298d22:.sdlc/plans/prompt-audit.md \| grep -c 'SB8, SB9.*counts\.mjs'` prints `1` |

## Pass 1 review round 2 rework

Re-derived from `src/engine/geometry.mjs` and `test/engine/geometry.mjs`, then swept all four geometry-system files.

| Id | Fate | Note |
|---|---|---|
| F1 | applied | rubric G2 grades `caret < font` (standalone, comfortable), the two-families assert; the rhythm line says `gap` and composed `font` respond, `caret` follows its own height law |
| F2 | applied | rubric G7 and best-practices name `2.49/0.58` (icon) and `3.5/0.39` (caret) with `CONTROL_FONT`, `GAP_UNIT`; `3.16/0.45` gone |
| F3 | applied | best-practices: density is applied once in `geomScale`, which hands `buildSize` the resolved `gap` |
| F4 | applied | color-math names `hydrateStoredDoc` stamping `"cam16"` on a stored doc without `hueSpace` |
| F5 | applied | foundations ramp column is `paddingWide (caret edge)` = 4.5, 6, 7.5, 11, 16, 23; caret no longer labelled frame family |

Sweep finds beyond F1 to F5: the `reference-ramp` test pins icon and font within 1 and height exactly, and pins caret only through the exact `caret's own ramp` assert, so SKILL.md, foundations and best-practices no longer say the caret constants reproduce `REF`; `since TKT-0010` dropped from best-practices.

Round 2 greps: `caret === font` in rubric 0, `3.16` in rubric 0, `inside \`buildSize\`` in best-practices 0. Branding and em-dash clean, P6 added history ids 0. `npm test`: all 53 test files passed, tree clean after.

## Files

Thirteen files, all inside U6's wall: `.claude/skills/geometry-system/{SKILL.md,references/foundations.md,references/best-practices.md,references/rubric.md}`, `.claude/skills/adding-export-formats/{SKILL.md,references/foundations.md,references/best-practices.md}`, `.claude/skills/adding-semantic-roles/{SKILL.md,references/foundations.md,references/rubric.md,references/best-practices.md}`, `.claude/skills/color-math/SKILL.md`, `.claude/skills/figma-file-migration/SKILL.md`.

## Ran

At the head code commit, in the unit worktree.

| Command | Result |
|---|---|
| `node test/repo/branding.mjs` | `branding: clean (812 files scanned)`, exit 0 |
| `node test/repo/em-dash.mjs` | `em-dash: clean (820 files scanned)`, exit 0 |
| P3, added prose lines with U+2014 against B | `0` |
| P4, out-of-wall files; guarded paths; `architecture.md` lines | `0`, `0`, `0` |
| P6, added lines carrying a history id (against B) | `0` |
| P6, removed lines carrying a history id, this unit's share (`git diff 5e298d22 HEAD`) | `23` |
| U6-8, line pins and `(line ~N)` in the wall | `0` |
| `npm test` | see the tally line at the foot of this file |

## Findings

Every claim below was re-derived from source before the rewrite: `src/engine/geometry.mjs` (`buildSize(rawHeight, density, font, gap)`, `paddingNarrow`, `paddingWide`, `caret = round(3.5 * height ** 0.39)`, `CONTROL_FONT`, `GAP_UNIT`, `geomScale`'s `fontOverrides`), `src/ui/overlays/drawer.js` (`const FORMAT_GROUPS`, `downloadAllZip(view)`), `src/ui/sections/color.js` (the `semantic roles · light / dark refs` label), `src/engine/tonal.js` (`hueSpace: "oklch"`, `export function chromaEnvelope(stop, anchorStop, lift, controls)`, `okhslLAt` uncached), `src/engine/hct.js` (`_mc`, `_pk`, `_oh` keyed on the exact float), `test/ui/headless-boot.mjs` (`(s4)` compares against `ROLES`, the hand literal in `test/ui/counts.mjs`), `scripts/gen-mcp-assets.mjs` and `test/mcp/brand-kit.mjs` (`MCP_BRAND_KIT_VERSION === SERVER.version`).

| Id | Fate | Note |
|---|---|---|
| SB1 | applied | geometry SKILL: icon and caret are the two power laws (`icon = 2.49·h^0.58`, `caret = 3.5·h^0.39`); font is the `CONTROL_FONT` row times `baseHeight/28` or the composed UI-control voice. Proof: U6-1 |
| SB2 | applied | slot pad `paddingNarrow`, bare edge `paddingWide = (height − caret)/2`; CSS inline pad is `paddingWide`. Proof: U6-1 |
| SB3 | applied | map row is `buildSize(rawHeight, density, font, gap)`, font and gap pre-resolved by `geomScale`. Proof: U6-1 lines 4 and 5 |
| SB4 | applied | verifier sentence names `paddingNarrow`. Proof: U6-1 line 1 and 2 |
| SB5 | applied | the seven reference lines now read `paddingNarrow`/`paddingWide`. Beyond the audit's hunks: `foundations.md` pipeline block still gave `font = fontOverride ?? round(3.16·height^0.45)`, `caret = font` and a `padding` field, all false against `buildSize`; rewritten to the real law. `fontOverride` (singular) in `SKILL.md` step 3, `foundations.md` and `best-practices.md` is `fontOverrides`, the `geomScale` option. Proof: U6-1 |
| SB6 | applied | `FORMAT_GROUPS` and `downloadAllZip` cited in the scanner's shape with `src/ui/overlays/drawer.js`. Proof: U6-2 |
| SB7 | applied | roles label cited at `src/ui/sections/color.js`. Proof: U6-2 |
| SB8 | amended | the enumerated count-gate list is replaced by a search (`git grep -nw "<oldcount>" test`); `ROLES` is named as the hand literal in `test/ui/counts.mjs` that `(s4)` reads, and `semExpect` as the one that derives. The second `(s4)` on the `npm test` comment line names a live check and stays. Proof: U6-3, U6-6 |
| SB9 | applied | the stale-count sweep and the verify line use `git grep -nw "<oldcount>"`, which finds hits on this git (`` does not). Proof: U6-3, U6-7 |
| SB11 | applied | the `app.js:4046` pin in three reference files is gone; the label is cited by file and grep string. Pass 2 drops the remaining `semantic.mjs:30` pin and the `(line ~N)` approximations. Proof: U6-2, U6-8 |
| SB12 | applied | `~line 433` and the `app.js` drawer are gone from `foundations.md` and `best-practices.md`; the chain names `renderDrawer`'s `FORMAT_GROUPS` in `src/ui/overlays/drawer.js`. Proof: U6-2 |
| SB13 | applied | the ds-export paragraph keeps the rule (out of scope, not in `exportAll`), drops the split story and the "yet" claim, states `ten colour formats`. Proof: U6-4 |
| SB14 | applied | the two live rules survive: a form change of a leaf is a SHAPE change and bumps; every bump moves `MCP_BRAND_KIT_VERSION`, pinned by `test/mcp/brand-kit.mjs`. Proof: U6-4, U6-5 |
| SB15 | applied | GENERATED stated in the present tense, both ticket ids gone. Proof: U6-4 |
| SB16 | applied | hue model heading and bullet state `hueSpace: "oklch"` and that `"cam16"` survives only on legacy docs (`persist.js` enum keeps both values). Proof: U6-4, U6-5 |
| SB17 | applied | determinism rule states exact-float keys and an uncached `okhslLAt`. Proof: U6-4 |
| SB18 | applied | "exactly ONE damping multiplier", no "now" or "since"; the `(#681, ADR-026)` handle on the `palette.anchor` sentence goes with it, ADR-026 stays. Proof: U6-4, U6-5 |
| SB19 | applied | retirement notice and dates gone; caret rides its own law and is never composed. Proof: U6-4 |
| SB20 | applied | "a final owner ruling" replaces the two superseded mappings. Proof: U6-4 |
| SB21 | applied | the `sizeAnchor` rule and its reason (integer keys reorder) stay; the four-call-site list is gone. Proof: U6-4, U6-5 |
| SB22 | applied | the join reads UI-control, `gap` rides `GAP_UNIT` independent of the font, in the present tense; the `TKT-0009` handle in the map paragraph also goes. Proof: U6-4 |
| SB23 | applied | the incident parenthetical goes and the recovery rule keeps its own reason. The Prerequisite table row of the same file carried a second `TKT-0013`; reworded to "a frozen scrim-step list left 32 stale scrim color variables" so the file count is `0`. Proof: U6-4 |

## Per-criterion evidence and negative controls

Runs at the head code commit. Controls ran in throwaway `git clone -q --shared` copies in this job's tmp directory: one at B (U6-1 to U6-5), one at 60fd4668 (U6-6 to U6-9 as they stood), one at the head code commit with the named fixture committed on top. `F` is that tmp directory.

| Row | At head | Control |
|---|---|---|
| U6-1 | `0 2 0 1 1 1` | at B: `4 0 3 0 1 1` |
| U6-2 | `1 1 0 1 0 1 2 1` | at B: `0 0 2 0 2 1 2 1` |
| U6-3 | `0 0 3 1` | at B: `1 1 1 1` |
| U6-4 | `0` and `0`, `0`, `0`, `0` | at B: `4` and `2`, `5`, `6`, `2` |
| U6-5 | `1 1 1 2 1 1` | the export SKILL with its `MCP_BRAND_KIT_VERSION` lines dropped prints `0` |
| U6-6 | `1 0 1 1` | at 60fd4668: `1 1 0 0`; fixture with step 5's sentence restored: second grep `1` |
| U6-7 | `27 236 63 236 6`, then `0` | at 60fd4668: `0 0 0 0 0`, then `5`; fixture with the first recipe typed back to `-nE "\b<oldcount>\b"`: `0 236 63 236 6`, then `1` |
| U6-8 | `0`, `1` | at 60fd4668: `4`, `1` |
| U6-9 | `0 0 2 0 0`, groups `2 1 1 1 1`, imports `2 2 2 1 1 1 1 1 1 2 1 2 3`, `1` | at 60fd4668: `1 1 0 1 1`, groups `0 1 1 0 1`, imports `2 2 2 1 1 1 1 0 0 2 0 1 2`, `0`; fixture with step 4's group list restored: `by DESTINATION` `1`, `Colors` `0` |
| U6-10 | `1 1 1` | the pass 1 handoff carried `807`, `815`, `91b6f571` against `810`, `818`, `60fd4668`: `0 0 0` |
| P3 | both gates clean (the Ran lines), `exit 0`, `0` | decision-records copied to `.sdlc/verdicts/prompt-audit-x.md`: `FAIL: 3 branding violation(s) across 813 files`, exit 1; one added U+2014 line: `FAIL: 1 em dashes outside inline code spans in 1 files`, exit 1, fourth leg `1` |
| P4 | `0`, `0`, `0` | the six-name fixture through the first filter: `3` |
| P5 | every SB1 to SB9, SB11 to SB23 id `1`; ERE total `37` = 22 ids + 15 review rows (`grep -c -E '^. F[0-9]+ '` prints `15`) | copy with the SB14 row deleted: SB14 `0`, total `36` |
| P6 | added `0`; removed `23` (unit share) | `+the rule (TKT-0010)` through the first filter: `1` |

The U6-7 counts differ from the brief's `229` because the tree now carries revision 8's plan files, whose lines match the `'*.md'` pathspec; each count is `1` or more, which is what the row asks.

## Left out

- `.claude/skills/adding-export-formats/references/rubric.md` row R3 still carries `~line 433`. The file is outside U6's wall (the wall names the export skill's `SKILL.md`, `foundations.md` and `best-practices.md`), so it is reported here for U9 or the orchestrator.
- SB10 is U8's. SB24 to SB26 are Low and stay: `(#252/#253)` and `(#264)` in the geometry skill on their own lines, unreflowed; the past-tense walkthroughs; the `figma-use` prerequisite.
- History ids the audit did not list and no needle reads (`#668` in the color-math skill, `issue #483` and `issue #487` in the geometry skill, the TKT ids inside labelled worked walkthroughs of `geometry-system/references/best-practices.md`) are untouched.

## Questions

None.

npm test at 42aa0d53 (the handoff commit on the head code commit): `✓ all 53 test files passed`, exit 0, tree clean after; N is 53 from TESTS, `test/run.mjs` unchanged against B, `ok    tests: baseline 53, test/run.mjs TESTS 53`.
