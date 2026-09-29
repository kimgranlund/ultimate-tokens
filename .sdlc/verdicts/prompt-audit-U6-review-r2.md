PASS

# prompt-audit U6 review, round 2 · #758

Reviewer, fresh context. Reviewed `unit/pa-U6` at 2d1ef134 (rework commit 91b6f571, on top of round 1's FAIL record d205f927) against the U6 section of `.sdlc/plans/prompt-audit.md` on `plan/prompt-audit` (bee7574d). Base `B` = 13346c1a. Every claim below was re-derived from `src/engine/geometry.mjs`, `test/engine/geometry.mjs` and `src/ui/app-helpers.mjs`, plus a live `geomScale` run in the worktree, not from the handoff. Negative controls ran in a `git clone -q --shared` under the reviewer's job tmp, checked out to `B` (`rev-parse --short HEAD` prints `13346c1a`) and to the round 1 head (`d205f927`), removed after. No npm test (the handoff records 53/53), no source edit.

F1 to F5 are fixed and each fix is true against the code. The builder's extra caret-constants fix is correct. What remains is four Low or Nit residues and out-of-wall stale comments, none of which puts a gate or rubric row in contradiction with the test.

## Round 1 findings

| # | Result | Evidence at HEAD | Control |
|---|---|---|---|
| F1 | 🟢 fixed | rubric G2 grades `caret < font` at every size (standalone, comfortable), matching `test/engine/geometry.mjs` "caret < the standalone font power law at every step" (the `every((k) => comf.sizes[k].caret < comf.sizes[k].font)` assert). Live run: caret 11·12·13·14·16·18 vs font 12·13·15·16·18·20. The "Top failure" line now says `caret` follows its own height law. `grep -c 'caret === font' rubric.md` prints `0` | `1` at `d205f927`, `1` at `B` |
| F2 | 🟢 fixed | rubric G7 and best-practices name `2.49/0.58` (icon) and `3.5/0.39` (caret); `buildSize` computes `roundEven(2.49 * height ** 0.58)` and `round(3.5 * height ** 0.39)`, and `CONTROL_FONT`, `GAP_UNIT` exist as named. `3.16` in rubric `0`, `0.45` in rubric `0`. The past-tense `round(3.16·height^0.45)` in walkthrough step 1 stays, as round 1 allowed | `1` and `1` at `d205f927` and `B` |
| F3 | 🟢 fixed | best-practices says density is applied once in `geomScale`, which hands `buildSize` the resolved `gap`. Source: `geomScale`'s `const gap = ... Math.max(1, round(GAP_UNIT[name] * factor * t.density))`, then `buildSize(rawHeight, t.density, font, gap)`; `buildSize` never reads `density`. `grep -c 'inside \`buildSize\`'` prints `0` | `1` at `d205f927` and `B` |
| F4 | 🟢 fixed | color-math names `hydrateStoredDoc` (`app-helpers.mjs`) stamping `"cam16"` on a stored doc without `hueSpace`; the function is `stored.hueSpace == null ? { ...stored, hueSpace: "cam16" } : stored`, and a doc carrying the field passes through. `grep -c hydrateStoredDoc` prints `1` | `0` at `d205f927` |
| F5 | 🟢 fixed | the ramp table's column is `paddingWide (caret edge)` = 4.5, 6, 7.5, 11, 16, 23; the live `geomScale({treatment:"comfortable",baseHeight:28})` run prints exactly those, and every other column (height, icon, caret, font, paddingNarrow, radius) matches the run. The pipeline's caret line no longer says "frame family". `grep -c 'edge (\`h/2\`, retired)'` prints `0` | `1` at `d205f927`, `0` at `B` (the column was pass 1's) |

## The builder's extra sweep fix

🟢 Correct. The `reference-ramp` block's `REF` carries only `height`, `icon`, `font` and asserts icon and font within 1 and height exactly; it has no caret key. Caret is pinned only by the exact `caret's own ramp` assert (`SM..2XL` equal to 12, 13, 14, 16, 18) and by `caret < font`. So "the caret constants reproduce `REF` to ±1px" was false, and SKILL.md, foundations and best-practices now say so correctly. The same false claim still sits in the engine's own header comment (see F5 below), outside the wall.

## Criteria

| Id | Result | At HEAD | Negative control at `B` |
|---|---|---|---|
| U6-1 needles | 🟢 | `0`, `2`, `0`, `1`, `1`, `1` | `4`, `0`, `3`, `0`, `1`, `1` |
| U6-1 sentence | 🟢 | the rubric, SKILL.md, foundations and best-practices agree with each other and with the test on caret, font, gap, density and the pads; residue is F1 and F2 below (Low) | rubric G2 `caret === font` `1` at `B` and `d205f927` |
| U6-2 | 🟢 | `1`, `1`, `0`, `1`, `0`, `1`, `2`, `1` | `0`, `0`, `2`, `0`, `2` |
| U6-3 | 🟢 | `0`, `0` (needle typed as the plan's literal `\\b37\\b`), `3`, `1` | `1`, `1`, `1`. A real `\b37\b` prints `3` at HEAD and `3` at `B`: all three are the "LEAVE historical counts" guidance naming the "36 vs 37" anecdote, true text |
| U6-4 | 🟢 | `0` and `0`, `0`, `0`, `0` | `4` and `2`, `5`, `6`, `2` |
| U6-5 | 🟢 | `1`, `1`, `1`, `2`, `1`, `1` | the needles also read at `B`, so the control is removal: the HEAD export skill with its `MCP_BRAND_KIT_VERSION` lines dropped prints `0`; color-math with its `"oklch"` lines dropped prints `0` |
| Prose | 🟢 | `em-dash: clean (817 files scanned)`, `branding: clean (809 files scanned)`; added lines with U+2014 in the rework `0`; history ids on added skill lines (`f6cd69cb..HEAD -- .claude/skills`) `0` | n/a |
| Wall | 🟢 | rework touches five skill files, all in U6's wall, plus the handoff | n/a |

## Findings

| # | Sev | Where | Finding | Source | Negative control |
|---|---|---|---|---|---|
| F1 | Low | `geometry-system/references/rubric.md` G2 row; `best-practices.md` line 26; `foundations.md` line 67; `SKILL.md` line 191 | They name a code-font `padding` as the field held identical across densities. `buildSize` returns no `padding` field (it returns `paddingNarrow`, `paddingWide` and the two compact pads), and the `two-families` assert compares `b.paddingNarrow === a.paddingNarrow`. Round 1's F1 suggestion named `paddingNarrow`. The meaning ("the frame padding", which is also the test message's phrase) is right, so no gate is misgraded; write `paddingNarrow` in the G2 gate text at least | `test/engine/geometry.mjs` two-families block; `buildSize`'s return object | `geomScale({}).sizes.MD.padding` is `undefined` |
| F2 | Low | `best-practices.md` lines 29 and 36 to 39; rubric G2 5-point cell | (a) "If you must retune, update the `REF` table" now sits under a bullet that also covers the caret constants, but `REF` has no caret; a caret retune updates the `caret's own ramp` assert. (b) The `gap` floor is justified "at tiny fonts × low density"; `gap` no longer reads the font, it is `GAP_UNIT[name] · factor · density`, so the floor case is small `baseHeight` × low density | `REF` in the `reference-ramp` block; `geomScale`'s `const gap` line | n/a |
| F3 | Nit | `SKILL.md` line 58; `foundations.md` line 93 | "the caret pinned by its own exact-ramp assert" omits the range. The assert pins `SM..2XL`; XS's caret 11 is held only by `caret < font`. `best-practices.md` states `(SM..2XL)` correctly | the `caret's own ramp` assert | n/a |
| F4 | Nit | `foundations.md` line 20 | "never = font" reads as an invariant, but an `opts.fontOverrides` value can make them equal (MD override 13 gives font 13, caret 13). The intent, caret is never derived from font, is true; "never derived from font" would say it | `geomScale` font precedence; `buildSize` caret line | n/a |
| F5 | Info | out of wall | Stale source comments carry the claims the skill just dropped: `src/engine/geometry.mjs` header "icon/caret remain rule-derived, they reproduce the hand-tuned reference ramp ... to ±1px"; `test/engine/geometry.mjs` two-families comment "0.39 vs font's 0.45" and "COMPOSED with a type scale's Label voice". Also `foundations.md` lines 84 and 87 keep `since 2026-07-15` and `ratified 2026-07-16`, which no U6 needle reads. For the orchestrator or a later unit | as cited | n/a |

Findings count: 5 (0 High, 0 Medium, 2 Low, 2 Nit, 1 Info).

verdict: 🟢
