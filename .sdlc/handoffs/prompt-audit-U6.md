# prompt-audit U6 handoff: slice B skills

Round 2 (rework of review FAIL d205f927). Branch: unit/pa-U6, rework commit 91b6f571 on top of the pass-1 rewrite 5ca1ffe4 (this handoff is the next commit), off plan/prompt-audit @ f6cd69cb. Diff base B = 13346c1a9c2e7e84368f276e5f67169090f1ddaa.

## Round 2 rework

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

| Command | Result |
|---|---|
| `node test/repo/branding.mjs` | `branding: clean (807 files scanned)` |
| `node test/repo/em-dash.mjs` | `em-dash: clean (815 files scanned)` |
| P6, added lines carrying a history id | `0` |
| P6, removed lines carrying a history id | `22` (this unit's share; the plan asks the pre-land verifier to sum) |
| added lines carrying a `:NNN` line pin | `0` |
| `npm test` | see the tally line at the foot of this file |

## Findings

Every claim below was re-derived from source before the rewrite: `src/engine/geometry.mjs` (`buildSize(rawHeight, density, font, gap)`, `paddingNarrow`, `paddingWide`, `caret = round(3.5 * height ** 0.39)`, `CONTROL_FONT`, `GAP_UNIT`, `geomScale`'s `fontOverrides`), `src/ui/overlays/drawer.js` (`const FORMAT_GROUPS`, `downloadAllZip(view)`), `src/ui/sections/color.js` (the `semantic roles · light / dark refs` label), `src/engine/tonal.js` (`hueSpace: "oklch"`, `export function chromaEnvelope(stop, anchorStop, lift, controls)`, `okhslLAt` uncached), `src/engine/hct.js` (`_mc`, `_pk`, `_oh` keyed on the exact float), `test/ui/headless-boot.mjs` (`(s4)` compares against derived `ROLES`), `scripts/gen-mcp-assets.mjs` and `test/mcp/brand-kit.mjs` (`MCP_BRAND_KIT_VERSION === SERVER.version`).

| Id | Fate | Note |
|---|---|---|
| SB1 | applied | geometry SKILL: icon and caret are the two power laws (`icon = 2.49·h^0.58`, `caret = 3.5·h^0.39`); font is the `CONTROL_FONT` row times `baseHeight/28` or the composed UI-control voice. Proof: U6-1 |
| SB2 | applied | slot pad `paddingNarrow`, bare edge `paddingWide = (height − caret)/2`; CSS inline pad is `paddingWide`. Proof: U6-1 |
| SB3 | applied | map row is `buildSize(rawHeight, density, font, gap)`, font and gap pre-resolved by `geomScale`. Proof: U6-1 lines 4 and 5 |
| SB4 | applied | verifier sentence names `paddingNarrow`. Proof: U6-1 line 1 and 2 |
| SB5 | applied | the seven reference lines now read `paddingNarrow`/`paddingWide`. Beyond the audit's hunks: `foundations.md` pipeline block still gave `font = fontOverride ?? round(3.16·height^0.45)`, `caret = font` and a `padding` field, all false against `buildSize`; rewritten to the real law. `fontOverride` (singular) in `SKILL.md` step 3, `foundations.md` and `best-practices.md` is `fontOverrides`, the `geomScale` option. Proof: U6-1 |
| SB6 | applied | `FORMAT_GROUPS` and `downloadAllZip` cited in the scanner's shape with `src/ui/overlays/drawer.js`. Proof: U6-2 |
| SB7 | applied | roles label cited at `src/ui/sections/color.js`. Proof: U6-2 |
| SB8 | amended | the enumerated count-gate list is replaced by a search (`git grep -nE "\b<oldcount>\b" test`) plus the fact that some tests derive the count. The audit's hunk named `headless-boot`'s `(s4)`; the second `(s4)` on the `npm test` comment line names a live check and stays. Proof: `grep -c '(s4)` `=== 53' .claude/skills/adding-semantic-roles/SKILL.md` prints `0` at HEAD and `1` at B |
| SB9 | applied | the stale-count sweep uses `<oldcount>`. Proof: U6-3 |
| SB11 | applied | the `app.js:4046` pin in three reference files is gone; the label is cited by file and grep string. Proof: U6-2 |
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

Own runs at HEAD 5ca1ffe4. Negative control: a throwaway `git clone -q --shared .` in this job's tmp directory, checked out to B (`git -C "$F/neg" rev-parse --short HEAD` prints `13346c1a`), removed after use; the same commands run there.

| Row | At HEAD | At B (control) |
|---|---|---|
| U6-1 | `0`, `2`, `0`, `1`, `1`, `1` | `4`, `0`, `3`, `0` for the four the control names |
| U6-2 | `1`, `1`, `0`, `1`, `0`, then the drawer.js definitions `1` and `1` | `0`, `0`, `2`, `0`, `2` |
| U6-3 | `0`, `0`, `3` (the `(pst8)` leg `1`) | `1`, `1`, `1` |
| U6-4 | `0` and `0`, `0`, `0`, `0` | `4` and `2`, `5`, `6`, `2` |
| U6-5 | `1`, `1`, `2` (`sizeAnchor`), `1` (`"oklch"`), `chromaEnvelope` and `hueSpace` source legs `1` | the story-removal control: in the clone, renaming `MCP_BRAND_KIT_VERSION` in the export skill makes the first command print `0` |

U6-2's fifth command also reads `references/best-practices.md` of the export skill (`app.js drawer` walkthrough step), which is why that Low walkthrough line changed although the audit flagged it only as SB25.

## Left out

- `.claude/skills/adding-export-formats/references/rubric.md` row R3 still carries `~line 433`. The file is outside U6's wall (the wall names the export skill's `SKILL.md`, `foundations.md` and `best-practices.md`), so it is reported here for U9 or the orchestrator.
- SB10 is U8's. SB24 to SB26 are Low and stay: `(#252/#253)` and `(#264)` in the geometry skill on their own lines, unreflowed; the past-tense walkthroughs; the `figma-use` prerequisite.
- History ids the audit did not list and no needle reads (`#668` in the color-math skill, `issue #483` and `issue #487` in the geometry skill, the TKT ids inside labelled worked walkthroughs of `geometry-system/references/best-practices.md`) are untouched.

## Questions

None.

npm test: `all 53 test files passed`, exit 0, tree clean after (N is 53, read from TESTS; no test file added).
