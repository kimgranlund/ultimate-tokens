---
doc-type: spec
id: spec-muted-base-key-spikes
status: approved        # draft | approved | superseded  (0.4.0 approved 2026-09-20: prime ladder rebuilt in CIE L* with equal-compress and held CAM16 chroma, #681 U6/U4; amends 0.3.2)
version: 0.4.0
date: 2026-09-20
owner: Kim Granlund
prd: none               # GitHub issues #503 and #533 are the intent records (ADR-017 git-native tickets)
scope: feature
audience: builder, reviewer, planner
---
# SPEC — Muted base ramps, a per-palette prime system, and 8 brand-derived data palettes

Intent records: GitHub issue #503 (`kind:feature`, `size:big`, `lane:color-engine`) and #533 (the
prime-system re-ruling, Findings 2026-09-11). Companion design: `docs/lld/lld-muted-base-key-spikes.md`.

Version history: 0.1.0 (approved 2026-09-11) put chroma spikes on identity stops of the base ramp.
0.2.0 (this revision, ratified in principle 2026-09-11 under #533) RETIRES the ramp spike entirely and
defines the prime swatches as their own token system per palette. 0.3.0 (ratified 2026-09-11 under
#556 and the #559 re-ruling) adds user-assignable PALETTE GROUPS (material, brand, system, data) and
makes the group's Base chroma an ABSOLUTE ramp chroma target shared by every ramp in the group;
`palette.chroma` feeds only the key colour and the prime system. 0.3.1 (approved 2026-09-17 under
#641, owner ruling option A) amends REQ-051's ladder: travel a bound clips off one side is handed to
the other, so the ladder spans a full `6 * PRIME_STEP` at every hue and chroma instead of collapsing
wherever the cusp tone sits near a bound. 0.3.2 (approved 2026-09-17, #655 folded into #641 by owner
ruling) raises `PRIME_L_MAX` from 0.94 to 0.97, because 0.94 was below the cusp construction's own
reach and left the ANCHOR outside the window for yellow-green hues. 0.4.0 (approved 2026-09-20,
ticket #681 unit U6, owner rulings Q8/Q9, with unit U4's integration pass 2 folded in) REBUILDS the
ladder itself: CIE L* replaces OKHSL `l` as the metric, `STEP_L = 9` L* replaces `PRIME_STEP = 0.09`,
0.3.1's redistribute rule is replaced by EQUAL-COMPRESS (both sides take the smaller side's room), and
0.3.2's flat OKHSL saturation is replaced by HELD CAM16 chroma that only the gamut desaturates. The
window is the same window, re-expressed in L* and derived from the greys rather than retyped. The id
and file name are kept so existing links resolve.

Ruled before this SPEC (not reopened here): the 53-role table and `docs/reference/data/role-table.json`
role list stay frozen; data palettes are full ordinary palettes; data hues derive from the brand
primary hue by default and are user-editable; one global base intensity with a per-palette override
on the `cuspPull ?? vibrancy` precedent (`src/engine/tonal.js`). New under #533: the base ramp is
shaped by Base chroma alone; the prime swatches are a separate system with their own lightness
ladder, their own chroma control, and their own token group; the editor strip renders that system.

## Vocabulary

- **Palette group** (`palette.group`, editor-only) is one of `material`, `brand`, `system`, `data`.
  Defaults by name: `neutral` is material; `primary`, `secondary`, `tertiary` are brand; `info`,
  `success`, `warning`, `danger` are system; every other palette (data-1..8, user-added,
  preset-opened) is data. Fully user-assignable. Groups never enter token names, Figma paths, the
  role table, or MCP output (ratified 2026-09-11, #556).
- **Base chroma** is the group's ABSOLUTE ramp chroma target, `paletteGroups[g].baseChroma`, in the
  same `%`-of-peak units `palette.chroma` already used for the ramp. Every ramp in a group is shaped
  and damped from the same target; `palette.chroma` no longer feeds the ramp at all (ratified
  2026-09-11, #559 re-ruling, supersedes 0.2.0's multiplier model). The global `baseIntensity`
  control (UI "Base chroma") survives only as the fallback target for a group with no value.
- **Palette chroma** (`palette.chroma`, UI "Chroma") now feeds only `deriveKeyColor` and therefore
  the prime system (the gallery tile and the seven prime swatches). The ramp ignores it.
- **Prime system** is a per-palette set of seven swatches, `brightest`, `brighter`, `bright`, `prime`,
  `dim`, `dimmer`, `dimmest`, lightest first, computed from the palette's hue and chroma on their own
  lightness ladder, NOT from ramp stops. They are primitives-tier tokens (mode-independent).
- **Prime chroma** (`primeChroma`, UI "Prime chroma") is a fraction of the palette's `chroma`
  applied to the prime system only; global with a per-palette override.
- **Brand families** are the eight existing palettes (neutral, primary, secondary, tertiary, info,
  success, warning, danger). **Data families** are `data-1` … `data-8`.

## Requirements

### R-A. Palette groups and base chroma (ramp shaping)

- **REQ-001** Each palette carries an optional `group` field in `{material, brand, system, data}`.
  `paletteGroup(p)` (model) resolves `p.group ?? defaultGroupByName(p.name)` with the defaults in
  Vocabulary. The document carries `paletteGroups`, an object keyed by group with `{ baseChroma,
  primeChroma, locked? }`; shipped defaults: material `{30, 60}`, brand `{100, 100}`, system
  `{100, 100}`, data `{100, 100, locked: true}` (ratified 2026-09-11, #556/#559; the material values
  may be tuned in a follow-up after a Safari look). `DEFAULT_CONTROLS` keeps `baseIntensity` (0..100,
  default 100) and `primeChroma` (0..100, default 100) as the global fallbacks.
- **REQ-002** Ramp chroma target: for palette `p` in group `g`, the chroma value `paletteStops`
  shapes and damps is `rampChroma(p) = paletteGroups[g].baseChroma ?? controls.baseIntensity`, an
  absolute target in `%` of the hue's peak, resolved in the model and passed to the engine as the
  palette's chroma (`paletteStops({ ...p, chroma: rampChroma(p) }, controls, stops)`). It applies
  on BOTH ramp paths exactly as `palette.chroma` did in 0.2.0; gamut safety stays with the existing
  clamps. There is no per-palette ramp override in any group: `palette.intensity` is retired and a
  stored value is ignored on read (ratified 2026-09-11, #559 re-ruling; supersedes 0.2.0's
  `I(stop) = b` multiplier). `palette.chroma` feeds only `deriveKeyColor` and the prime system.
- **REQ-003** Byte identity, stated at two levels. Engine level: `paletteStops(palette, controls,
  stops)` is byte-identical to 0.2.0 for every input (the engine no longer reads `baseIntensity`,
  and at `baseIntensity 100` the 0.2.0 multiplier was 1); the `intensity-legacy` fixture stays as the
  proof. Document level: a palette's rendered ramp is byte-identical to 0.2.0 IF AND ONLY IF its
  `chroma` control equals its resolved `rampChroma`. In the default document that holds for
  Secondary (100, brand 100), Warning (100, system 100), and every data palette minted at the
  primary's chroma only when that chroma is 100; Neutral (29 vs 30), Primary (95), Tertiary (33),
  Info (40), Success (55), Danger (55), and the default data palettes (95) CHANGE by design. Exports,
  Figma values, and MCP values move with them; names never do.
- **REQ-004** Engine retirement, extended (0.2.0's spike retirement stands): `intensityAt` and the
  `baseIntensity` read inside `tonal.js` are removed; `paletteStops` and `hueAnchorFrac` read only
  `palette.chroma` as before 0.1.0. Resolution of the target lives in `src/ui/model.mjs` and
  `src/engine/exports.js` `derivePalette` (both call one shared resolver); `tonal.js` and `prime.mjs`
  stay pure and group-unaware.
- **REQ-005** The OKLCH hue anchor at stop 500 uses the resolved ramp chroma, so the
  `oklch-hue-anchor` guarantee holds for every group target.
- **REQ-006** Every existing tonal gate stays green with no pin change (the engine contract is the
  0.2.0 one). Chroma targets never perturb tone.
- **REQ-007** Product defaults: `paletteGroups` as in REQ-001; global `baseIntensity 100`,
  `primeChroma 100`. A fresh default document renders Neutral visibly muted (ramp at 30, prime at
  60) and the eight data palettes at equal ramp chroma (100), with Brand and System ramps at 100.
  (Supersedes H1's "no visual change" for the material and data groups; ratified 2026-09-11.)
- **REQ-008** Prime chroma resolution: `primeChromaOf(p) = (locked(g) ? undefined : p.primeChroma)
  ?? paletteGroups[g].primeChroma ?? controls.primeChroma`. The data group is locked: its palettes
  have no per-palette prime override (a stored value is ignored, not deleted, and comes back when
  the palette is moved out of data). Fed to `primeSwatches` as `controls.primeChroma` with
  `palette.primeChroma` cleared, so `prime.mjs` stays unchanged.
- **REQ-009** Editor grouping: the Color canvas renders palette rows under four headers, Material,
  Brand, System, Data, in that order, empty groups hidden, each header showing its count;
  drag-reorder across a header reassigns the group; the inspector has a Group dropdown; "Add data
  palettes (8)" and the new-palette modal set the default group.

### R-B. Persistence and migration

- **REQ-010** `persist.js` `DOMAINS` carries `baseIntensity` (0..100, default 100), `primeChroma`
  (0..100, default 100), and `paletteGroups` (per group: `baseChroma` 0..100, `primeChroma` 0..100,
  `locked` boolean; an absent group or field default-fills from REQ-001, the `lmin`/`lmax` precedent);
  the palette domain carries optional `group` (enum, absent means derive-by-name on read) and
  optional `primeChroma` (0..100, absent means inherit, clamped only when finite). `intensity` is no
  longer in the palette domain. Roundtrip identity and per-field clamp hold. The document key is
  `paletteGroups`, not `groups`: `story.groups` already names the curated story's concept groups.
- **REQ-011** `CURRENT_SCHEMA_VERSION` becomes 4. Below 2: stamp `baseIntensity 100`. Below 3: rename
  `keyIntensity` to `primeChroma`. Below 4: delete `palette.intensity` from every palette (reported
  through `DROPPED_KEYS`) and default-fill `paletteGroups`; `palette.group` is NOT written by the
  migration (derive-on-read keeps old documents byte-stable on reload except for the dropped key).
- **REQ-012** Hydrating a pre-v2 snapshot never injects data palettes. Data palettes reach an
  existing document only through the explicit action in REQ-032.

### R-C. Data palettes

- **REQ-020** `deriveDataHues(primaryHue, brandHues, count = 8)` (pure, module `src/engine/data-hues.mjs`)
  returns `count` OKLCH hues `primaryHue + phi + i * (360 / count)`, `i = 0 .. count-1`, where `phi` is
  the integer degree in `[0, 360 / count)` that maximises the minimum circular distance between the
  data hues and every brand hue; ties resolve to the smallest `phi`. Answer to Open gap 3.
- **REQ-021** `brandHues` is the hue of every non-data palette whose `chroma >= 20`.
- **REQ-022** A minted data palette is an ordinary palette object: `name: "Data N"`, `hue` from
  REQ-020, `chroma` equal to the primary's `chroma` (H4), `skew 0`, `lift 0`, `hueShift 0`,
  `hueSameDir false`, `on true`, no overrides. It carries all 53 roles and a prime system like any
  palette.
- **REQ-023** Data hues are derived once, at mint time, and stored as plain numbers. A "Re-derive
  data hues" action (REQ-032) recomputes them.
- **REQ-024** `defaultDocument()` returns 16 palettes: the eight brand families followed by
  `Data 1` … `Data 8`, enabled. `role-table.json` `defaults` lists the same 16 (H2).

### R-D. Exports, Figma, and the editor (data palettes and controls)

- **REQ-030** Every emitter that maps over enabled palettes emits data palettes with no change to the
  per-palette loop. Token count per enabled palette is 25 + 11 + 53 + 7 = 96 (the 7 are REQ-052).
- **REQ-031** `exportShadcn`: `chart-1..5` bind to the prime ROLE of `data-1..5` when enabled, else
  the current fallback chain; data palettes are excluded from the neutral, primary, and "first
  palette" fallbacks. `ds-export`: data palettes form a `data` tier and DESIGN.md gains a "Data
  series" section.
- **REQ-032** UI: "Add data palettes (8)" and "Re-derive data hues" actions; the Global tab keeps
  "Base chroma" (`baseIntensity`, the fallback target) and "Prime chroma" (`primeChroma`) next to
  Vibrancy, and beneath them a per-group row for Material, Brand, System, Data with two sliders each
  writing `paletteGroups[g].baseChroma` / `.primeChroma`; the palette inspector keeps "Chroma"
  (`palette.chroma`, now labelled as feeding the key colour and prime system), gains a Group
  dropdown, carries "Prime chroma" (`palette.primeChroma`) next to Cusp pull for every group except
  Data, and no longer carries an "Intensity" slider (ratified 2026-09-11, #556/#559).
- **REQ-033** Figma: binding plan 53 x 16 = 848 role targets; Color Primitives 16 x 36 = 576
  variables; the new prime collection (REQ-054) 16 x 7 = 112 variables; all under the 5,000 per
  collection ceiling; the role collection's mode count (2) is unchanged.
- **REQ-034** Key swatch strip: each enabled palette row in the Color canvas renders the palette's
  seven prime swatches FIRST, left of the stop ramp, lightest first, labelled `brightest`,
  `brighter`, `bright`, `prime`, `dim`, `dimmer`, `dimmest` (ratified 2026-09-11 under #533,
  supersedes the role-mapped and ladder-stop strips of 0.1.0). The strip reads `view.palettes[i].prime`,
  never ramp stops or roles; it does not change with the scheme toggle, `accentRef`, or `stopsMode`.
  The labels are display text AND the token step names (REQ-053).

### R-E. Records and parity

- **REQ-040** `knowledge-02-tonal-scale.md` documents base intensity and the prime system;
  `knowledge-03-semantic-system.md` documents the 16 default families and that prime tokens are a
  primitives-tier group roles do not alias; `knowledge-04-export-formats.md` documents the prime
  group in every format; `CLAUDE.md`, `README.md`, `mcp/README.md`, the consumer plugin, and the
  marketing fact sheet update their counts. The 53 role count is unchanged everywhere.
- **REQ-041** Count literals under `test/` that encode the default palette count or the per-palette
  token count move together (`test/ui/counts.mjs`, `test/ui/shell.mjs`, `test/mcp/brand-kit*.mjs`,
  `tokenCount` expectations). Literals derived from `role-table.json` or the bundle need no edit.
- **REQ-042** Every build unit listed in the LLD leaves `npm test` green at its boundary; no parity
  gate (role-table deep-equal, binder mirror, `collparity`, count literals) is red between PRs.

### R-F. The prime system (new in 0.2.0)

- **REQ-050** `primeSwatches(palette, controls)` (pure, new module `src/engine/prime.mjs`, imports
  only `hct.js`, `okhsl.js`, and `tonal.js` helpers) returns seven entries
  `{ step, l, s, hue, rgb, hex, oklch, inGamut }` in the fixed order brightest, brighter, bright,
  prime, dim, dimmer, dimmest, lightest first. Deterministic; no DOM. Amended 2026-09-20 (#681 U6,
  owner ruling Q8/Q9): `l` is the rung's CIE L*, which is literally its `hctToRgb` tone argument, and
  `s` is the rung's rendered CAM16 chroma. Both fields keep their names and their positions in the
  shape; only the SPACE they are measured in changed, from the OKHSL `l`/`s` pair 0.2.0..0.3.2
  described to the CIE L* / CAM16 chroma pair the HCT-native construction of REQ-051 and REQ-052
  actually renders. A rung is built by `hctToRgb(hue, chroma, l)` directly, so no OKHSL round trip
  sits anywhere on the ladder path.
- **REQ-051** Ladder. REBUILT 2026-09-20 (ticket #681 unit U6, owner rulings Q8/Q9), replacing R1's
  OKHSL-`l` ladder and 0.3.1's redistribute rule. Lightness is CIE L*, the same tone axis the ramp,
  the contrast maths, and every pixel-measured gate in this repo already read, and a rung is rendered
  in HCT directly: `hctToRgb(hue, chroma, L)`. `L*_prime` is the anchor's own CIE L*, read off the
  REAL colour and never off a proxy: on the cusp-identity path it is `peakC(baseHue).tone`, which IS
  the key colour's own L* by construction, since `hctToRgb`'s `tone` argument converges to exactly
  that L*; on the stored-`anchor` path it is `lstarFromRgb(anchorRgb)`. Either way no OKHSL round trip
  is taken, which is what retires R1's Helmholtz-Kohlrausch argument rather than answering it: that
  gap only existed because the old ladder measured lightness on a different scale from the one
  `hctToRgb` renders in.
  Steps are EVENLY SPACED ON EACH SIDE of the anchor, nominally `STEP_L = 9` L* per rung, with all
  seven inside the L* window of REQ-051a. The per-side step sizes are `primeSteps(L*_prime)`
  (`src/engine/prime.mjs`): each side's ROOM is `room_up = (PRIME_L_MAX - L*_prime) / 3` and
  `room_down = (L*_prime - PRIME_L_MIN) / 3`, each floored at 0, and BOTH sides then take the SAME
  step, `up = down = min(STEP_L, room_up, room_down)`. This is EQUAL-COMPRESS (Q9): where a bound is
  in reach the ladder compresses symmetrically rather than handing the clipped side's shortfall to the
  other side. The two sides are therefore equal BY CONSTRUCTION, not merely close, and the ladder
  spans `6 * min(STEP_L, room_up, room_down)`, which is the full `6 * STEP_L = 54` L* wherever both
  sides have `STEP_L` of room and less than that, symmetrically, where they do not. 0.3.1's
  redistribution is RETIRED: it produced exactly the asymmetry between the light and dark halves that
  the owner's screenshot finding flagged, and buying a constant span with a lopsided ladder was the
  wrong trade.
  With the skew bend of REQ-053a, `l_i = L*_ladder + 3 * up * w_i` for `i = 0..2` and
  `L*_ladder - 3 * down * w_i` for `i = 4..6`, where `w_i` is the bent offset weight (`w_i = |t_i|` at
  `skew 0`, giving the even ladder `L*_ladder + up * (3 - i)` / `L*_ladder - down * (i - 3)`). The
  `prime` rung is the anchor itself and is never moved, which is what keeps REQ-056 exact and is why
  biasing the ANCHOR away from the bound stays rejected. `L*_ladder` is `L*_prime` clamped into the
  window: on the cusp-identity path the two are identical, since `peakC`'s own cusp-tone search only
  samples tone 4..96 and so can never leave the window, while a STORED anchor can sit outside it and
  must not credit out-of-domain room. Monotone strictly decreasing in `l` whenever `up, down > 0`, at
  every skew.
  WIDENING SEARCH (added 2026-09-20 by #681 unit U4, integration pass 2; stored-`anchor` palettes
  only). At the exact window bound, equal-compress's own `min` reads 0 on BOTH sides at once, since
  one side's zero room binds the other, and all six non-prime rungs collapse onto the clamped pivot as
  duplicate hexes. Where that would happen, `primeSwatches` walks the LADDER's pivot away from the
  bound in `0.1` L* increments, reserving the same amount on both sides (`lo = PRIME_L_MIN + 3 * r`,
  `hi = PRIME_L_MAX - 3 * r`, pivot re-clamped into `[lo, hi]`, steps re-sized from it), and stops at
  the first reserve that makes the six ladder rungs and the anchor seven distinct hexes. The reserve
  is capped at one full `STEP_L` per side, beyond which the window is offering less room than the
  ladder was ever designed to need; the most-widened attempt is kept if none succeeds. The search
  moves only the ladder's pivot, equally on both sides, so `up == down` and the untouched `prime` rung
  both survive it. Sources close enough to a bound that even a full `STEP_L` of reserve cannot
  separate the rungs are named and counted by `test/engine/anchor.mjs`'s `anchor-ladder` allow-lists,
  not silently passed.
- **REQ-051a** The ladder window is CIE L* `[PRIME_L_MIN, PRIME_L_MAX] = [12.25, 96.88]`
  (re-expressed 2026-09-20, #681 U6; the same window 0.3.2 ratified in OKHSL, not a new bound). It is
  DERIVED, never retyped: `PRIME_L_MIN = lstarFromRgb(okhslToRgb(0, 0, 0.14))` and
  `PRIME_L_MAX = lstarFromRgb(okhslToRgb(0, 0, 0.97))`, so the two OKHSL grey bounds `0.14` and `0.97`
  stay the single typed source and a second, independently-typed L* literal cannot drift from them. A
  grey has no hue or chroma, so that conversion is exact. The `0.97` ceiling keeps its 0.3.2
  rationale, quoted here for the record: `0.94` was BELOW the reach of the cusp construction, whose
  OKHSL-domain `l_prime` peaks at `0.961183` (cam16 hue 109.75 at chroma 0.75; the oklch peak is the
  same value near hue 98), so for yellow-green hues the ANCHOR itself fell outside the window, `prime`
  was out of bounds before any ladder was built, `room_up` went negative, and the three light swatches
  INVERTED, reading DARKER than `prime`. Under the L* construction the window's job is generous
  headroom rather than a tight ceiling: `peakC`'s cusp-tone search only ever samples tone 4..96, so
  every cusp-identity anchor sits inside `[12.25, 96.88]` with room to spare, and AC-050 (d4) asserts
  zero out-of-window anchors across the whole sweep in both hue spaces. A STORED anchor is the one
  case that can still leave the window, and REQ-051's clamp plus the floor-at-0 on each room is what
  keeps its ladder in bounds and its travel non-negative.
- **REQ-052** Chroma. RE-BASED 2026-09-20 (#681 U6, owner ruling Q9 "hold CAM16 chroma"), replacing
  the flat OKHSL saturation of 0.2.0. The anchor's OWN CAM16 chroma is the target on every rung:
  `C_prime = max(0, keyChroma * pc)` where `keyChroma` is `(palette.chroma / 100) * peakC(baseHue).c`
  on the cusp-identity path or `cam16FromRgb(anchorRgb).chroma` on the stored-`anchor` path, and
  `pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100`; `palette.chroma` still enters
  only through the key colour. Chroma is then HELD at `C_prime` on every rung and desaturated ONLY
  where that rung's own gamut cannot carry it: `chroma_i = min(C_prime, maxChromaInGamut(hue_i, l_i))`.
  Nothing damps chroma by lightness distance, which the retired flat-saturation construction did
  implicitly, so a rung is as saturated as its own tone allows and no more. `inGamut` is true on every
  rung and asserted, now by the `min` against the in-gamut cap rather than by OKHSL construction.
  Rationale: the ladder renders in HCT, so the chroma it holds must be the chroma HCT measures; a
  flat OKHSL `s` across a 54 L* span is not a constant colourfulness and was the mechanism by which
  `brightest` and `dimmest` failed to read 1:1 around `prime`. `primeChroma` still scales the target
  linearly, which AC-050 (g) asserts exactly rather than approximately, because the scaling now
  applies to the chroma the engine actually renders.
- **REQ-053** Hue: the anchor's own CAM16 hue, read directly and shared by all seven swatches; there
  is NO hue re-solve in the prime system (ruled 2026-09-11 on #537: `solveOkhslHue` at the palette hue
  carried an Abney drift into the muted swatches and can oscillate at very low saturation, and it is
  shared with `tonal.js`, whose legacy fixture is a hard wall). Re-based 2026-09-20 with REQ-050..052
  (#681 U6): the hue is `effHue(palette.hue, controls.hueSpace, chroma / 100)` on the cusp-identity
  path, which is the SAME `baseHue` `deriveKeyColor` uses, and `cam16FromRgb(anchorRgb).hue` on the
  stored-`anchor` path, and it is passed straight to `hctToRgb`, so the construction holds each rung's
  CAM16 hue rather than its OKHSL hue. OKLCH hue is NOT held across rungs of differing tone even at a
  fixed CAM16 hue, which is the Abney spread this codebase corrects for elsewhere, so AC-050 (e)/(f)
  measure CAM16 hue. Since the anchor's own L*, chroma, and hue are all read off the real colour at
  `primeChroma 100`, `prime` reproduces the key colour exactly, not approximately. `hueShift` applies with the ramp's rule
  (`dir = hueSameDir ? -|t| : t`, `t = (i - 3) / 3`, so `brightest` is `t = -1`, `dimmest` `t = +1`).
  (Ratified 2026-09-11, R5.)
- **REQ-053a** Skew (ratified 2026-09-11, R5): the palette's `skew` bends the ladder toward light or
  dark the way it bends the ramp, as a gamma on ladder position, while `prime` and the two end
  swatches stay put. With `g = 3 ** (skew / 100)` (the ramp's own gamma, `toneAt`) and
  `t_i = (i - 3) / 3`: the light-side weight is `w_i = |t_i| ** (1 / g)` for `i < 3` and the dark-side
  weight is `w_i = |t_i| ** g` for `i > 3`; `w_3 = 0`, `w_0 = w_6 = 1`. `skew > 0` (`g > 1`, lighter
  mids on the ramp) pushes `brighter`/`bright` further from `prime` and pulls `dim`/`dimmer` toward it,
  so every non-end swatch reads lighter; `skew < 0` does the reverse. `skew 0` is the even ladder.
  `prime` is skew-invariant, so REQ-056 holds at every skew. The bend is normalised PER SIDE, with
  `w_i` running 0..1 on each side independently, so it applies to that side's OWN extent (`3 * up` or
  `3 * down`) (clarified 2026-09-17, #641). Amended 2026-09-20 (#681 U6): under equal-compress
  `up == down`, so the two extents are now equal too and the two sides bend identically, not merely by
  the same rule across different extents. `lift`, `damp*`,
  `vibrancy`, `cuspPull`, `toneMode` do NOT apply: they shape the ramp, and the prime system is not
  the ramp.
- **REQ-054** Tokens: a `prime` group per palette, primitives tier, mode-independent, one value per
  step. Naming (ratified 2026-09-11, R3): CSS `--{n}-prime-{step}` next to `--{n}-550`; DTCG, UI3, and
  JSON nest `{n}/prime/{step}` beside `{n}/scrim/*` and `{n}/key/*` (ADR-016 two-segment shape);
  Tailwind `--color-{n}-prime-{step}` in `@theme`; Figma: a new collection `COLLECTIONS.colorPrime =
  "Color Prime"` with the single mode `Base` and variables `{n}/{step}`; DS bundle: a `prime` block per
  family in `tokens.json` plus a "Prime swatches" section in DESIGN.md; MCP brand-kit:
  `palettes[i].prime = { brightest: { hex, oklch }, … }` and `get_prime(slug)` returns it. ShadCN
  has no slot (fixed contract, non-goal).
- **REQ-055** Same seven swatches in both schemes (ratified 2026-09-11, R2): the prime system is
  primitives-tier and mode-independent like the raw stops (knowledge-03 §1); one set of seven tokens
  per palette, identical in light and dark. Roles remain the only mode-flipping layer. No per-scheme
  ladder exists and the `Color Prime` collection has the single mode `Base`.
- **REQ-056** Legacy identity: at `primeChroma 100` the `prime` swatch equals the palette's
  `deriveKeyColor` hex within one 8-bit step per channel (same hue anchor, same cusp tone, same
  chroma fraction), so the gallery tile and the strip's `prime` agree.
- **REQ-057** `projectView` exposes `palettes[i].prime` (the seven entries) and `brandKit` includes
  it; `tokenCount` adds 7 per enabled palette.

## Non-goals

- No new semantic roles, no muted-suffixed roles, no reduced role set for data palettes. The
  `refs-canonical` gate and the binder mirror stay at 53. Roles do NOT alias prime tokens this round
  (a later round may re-point `{n}`/Dim/Bright to the prime group; it needs its own SPEC).
- No chroma spike on the base ramp of any kind; no identity-stop set; the ramp is continuous.
- No per-palette ramp chroma in any group (0.3.0): ramps in a group are chroma peers by
  construction; `palette.chroma` shapes the key colour and prime system only.
- Groups never enter token names, CSS variables, Figma paths or folders, the role table, the DS
  bundle grammar, or MCP output; they are an editor concept (a separate ticket if ever wanted).
- No per-scheme prime ladder (ratified, R2); no Light/Dark mode on the prime collection.
- No prime tokens in ShadCN (fixed contract) and no new export FORMAT (the group rides the eight).
- No change to Typography or Geometry.
- No live link from the primary hue to data hues after minting; no migration that adds palettes to a
  saved document; presets stay as authored (H3).
- No change to the "From Figma" import.

## Examples

- **EX-1 (NORMATIVE, engine identity).** `paletteStops({hue: 267, chroma: 95, skew: -20, lift: 0},
  DEFAULT_CONTROLS, EXPORT_STOPS)` equals the 0.2.0 output byte for byte, and neither `baseIntensity`
  nor `primeChroma` nor any group value has any effect on it.
- **EX-2 (NORMATIVE, group target).** Default document, brand `baseChroma 100`: Primary's ramp equals
  `paletteStops({hue: 267, chroma: 100, skew: -20, lift: 0}, ...)`, not the `chroma 95` ramp; its
  prime system and gallery tile are still computed at `chroma 95`. Secondary (`chroma 100`) is
  byte-identical to 0.2.0. Material `baseChroma 30`: Neutral's ramp is the `chroma 30` ramp.
- **EX-3 (NORMATIVE, group edit and fallback).** Set brand `baseChroma 60`: Primary, Secondary, and
  Tertiary ramps all become their `chroma 60` ramps; System palettes are unchanged. Delete brand's
  `baseChroma` (absent): those three ramps follow the global `baseIntensity` (100 by default). A
  stored `palette.intensity 100` on Tertiary changes nothing. Move Tertiary to the Data group: its
  ramp becomes the data target and its stored `primeChroma` override is ignored until moved back.
- **EX-4 (NORMATIVE, prime ladder).** Primary at `skew 0` on the CUSP-IDENTITY path (a probe: no
  `anchor` field, and the default Primary carries `skew -20` and a stored anchor, see EX-4b and
  REQ-051), `hueSpace "cam16"` with `role-table.json`'s raw pair (`hue 267, chroma 95`),
  `primeChroma 100`. Engine-regenerated 2026-09-20 (#681 U6) by
  `scratchpad/gen-ex4.mjs`, which imports this worktree's own `src/engine/prime.mjs` and prints
  `primeSwatches({ name: "Primary", hue: 267, chroma: 95, skew: 0 }, { hueSpace: "cam16",
  primeChroma: 100 })` alongside `primeSteps` and `peakC`: `L*_prime = 52.000000`,
  `C_prime = 68.081932` CAM16 (the anchor's own chroma, no longer an OKHSL saturation),
  `room_up = 14.961643`, `room_down = 13.249990`, so `up = down = 9` (uncompressed) and the span is
  the full 54 L*. `l` and hex, brightest to dimmest: `79.0000 #AAC3FF`, `70.0000 #82AAFF`,
  `61.0000 #5590FF`, `52.0000 #2177F6`, `43.0000 #0061D3`, `34.0000 #004CA9`, `25.0000 #003880`.
  Rendered CAM16 chroma over the same seven: `36.72, 49.63, 61.41, 68.08, 63.72, 55.49, 46.92`, held
  at `C_prime` only on the `prime` rung and cut by the gamut everywhere else, most of all at the light
  end. `prime.hex` equals `deriveKeyColor(Primary).keyHex` byte for byte.
- **EX-4b (NORMATIVE, skew bend).** As EX-4 with `skew -20`: `g = 3 ** -0.2 = 0.802742`.
  Engine-regenerated 2026-09-20 (#681 U6) by the same `scratchpad/gen-ex4.mjs` run, the
  `primeSwatches({ ..., skew: -20 }, ...)` call. `l` and hex: `79.0000 #AAC3FF`, `68.2930 #7AA5FF`,
  `58.8707 #498AFF`, `52.0000 #2177F6`, `40.8221 #005BC9`, `32.5012 #0049A2`, `25.0000 #003880`.
  Ends and `prime` equal EX-4; every inner swatch is darker than in EX-4. With `skew +20` the
  light-side and dark-side weights swap and every inner swatch is lighter.
- **EX-5 (NORMATIVE, equal-compress at a bound).** Warning at `skew 0` on the CUSP-IDENTITY path (a
  probe: no `anchor` field, and the default carries `skew 40` and a stored anchor), `hueSpace "cam16"`,
  raw pair `hue 70, chroma 100`, `primeChroma 100`. Engine-regenerated 2026-09-20 (#681 U6) by the
  same `scratchpad/gen-ex4.mjs` run, the `primeSwatches({ name: "Warning", hue: 70, chroma: 100,
  skew: 0 }, { hueSpace: "cam16", primeChroma: 100 })` call: `L*_prime = 74.000000`,
  `C_prime = 60.523682` CAM16. The light side is the short one, `room_up = (96.88493 - 74) / 3 =
  7.628309` against `room_down = 20.583323`, so EQUAL-COMPRESS gives BOTH sides that smaller room:
  `up = down = 7.628309`. `l` and hex: `96.8849 #FFF4EC`, `89.2566 #FFDAB2`, `81.6283 #FFBF71`,
  `74.0000 #FDA200`, `66.3717 #E18F00`, `58.7434 #C67D00`, `51.1151 #AB6C00`. All seven inside
  `[12.25, 96.88]`, strictly decreasing, evenly spaced across BOTH sides, `brightest` exactly on
  `PRIME_L_MAX`, and the span is `6 * 7.628309 = 45.769856`, short of `6 * STEP_L = 54` by design:
  under equal-compress a clipped ladder is shorter and symmetric rather than full-length and
  lopsided. The default `skew 40` bends the inner swatches lighter with the ends unchanged.
  (Under 0.3.1's retired redistribute rule this example read `up = 0.073353` / `down = 0.106647` in
  the OKHSL domain and held a constant `0.54` span by making the dark side 45% longer than the light
  one.)
- **EX-6 (NORMATIVE, prime chroma).** As EX-4 with `primeChroma 50`: `C_prime` halves to `34.0410`
  CAM16, `l` is unchanged, and the ramp is unchanged. Regenerated 2026-09-20 (#681 U6) alongside
  EX-4: because the halved target now sits below every rung's gamut cap, the held chroma is exactly
  `34.0410` on ALL seven, where at `primeChroma 100` only the `prime` rung reaches `C_prime`. With
  `palette.primeChroma 100` on Primary inside a document at `primeChroma 50`, Primary's prime system
  equals EX-4.
- **EX-7 (NORMATIVE, naming).** For Primary the CSS export contains `--primary-prime-brightest` …
  `--primary-prime-dimmest` in the raw block; DTCG raw tree has `primary.prime.brightest`; UI3 has a
  `Color Prime` collection with `primary/brightest`; Tailwind has `--color-primary-prime-prime`.
- **EX-8 (NORMATIVE, key strip).** Default Primary, either scheme, either `accentRef`, either
  `stopsMode`: the strip reads the seven `prime` entries in order; each swatch's hex equals
  `view.palettes[i].prime[k].hex`. Nothing in the strip changes with the scheme toggle.
- **EX-9 (NORMATIVE, migration).** Snapshot `{schemaVersion: 2, keyIntensity: 70}` hydrates to
  `primeChroma 70` with no `keyIntensity` key. Snapshot `{schemaVersion: 1}` hydrates to
  `baseIntensity 100, primeChroma 100`. Snapshot `{schemaVersion: 3, palettes: [{name: "Primary",
  intensity: 40, ...}]}` hydrates with no `intensity` key on Primary, `DROPPED_KEYS` naming it, and
  `paletteGroups` filled with the REQ-001 defaults; `palettes[i].group` stays absent.
- **EX-12 (NORMATIVE, grouping).** `defaultDocument()`: Neutral is material; Primary, Secondary,
  Tertiary are brand; Info, Success, Warning, Danger are system; Data 1..8 are data. The canvas shows
  the four headers with counts 1, 3, 4, 8. A user-added "Accent" palette lands in data; choosing
  brand in its Group dropdown moves it under Brand and its ramp to the brand target.
- **EX-10 (NORMATIVE, data hues).** Unchanged from 0.1.0 EX-5.
- **EX-11 (NORMATIVE, shadcn).** Unchanged from 0.1.0 EX-7 (chart-1..5 from data-1..5).

## Acceptance

- **AC-001** `DEFAULT_CONTROLS` has `baseIntensity` and `primeChroma`, no `keyIntensity`;
  `defaultDocument().paletteGroups` deep-equals the REQ-001 defaults; `paletteGroup(p)` returns the
  by-name defaults for all 16 default palettes and honours an explicit `p.group`.
- **AC-002** `rampChroma(p)` equals `paletteGroups[g].baseChroma` when present, else
  `controls.baseIntensity`; it ignores `palette.chroma` and `palette.intensity` (a probe with
  `chroma 10, intensity 100` in a group at 60 renders the `chroma 60` ramp on both ramp paths).
- **AC-003** Two fixtures. (a) Engine: `test/engine/fixtures/tonal-legacy.json` retained, compared
  byte for byte by `test/engine/tonal.mjs` (`intensity-legacy`), regenerated only by hand. (b)
  Document: a new `test/ui/fixtures/default-doc-ramps.json` holding `projectView(defaultDocument())`'s
  25-stop hex per palette at the ratified `paletteGroups` defaults, compared byte for byte by
  `test/ui/shell.mjs`, regenerated only by `node scripts/gen-ramp-fixture.mjs` (never by `npm test`;
  the #559 builder generates it once the resolver lands). The same gate also asserts the REQ-003
  identity rule live: for every default palette whose `chroma` equals its `rampChroma`, the fixture
  row equals `paletteStops(p, controls, EXPORT_STOPS)` computed with `p.chroma`; for every other
  default palette it differs.
- **AC-004** `tonal.js` exports no `intensityAt` and never reads `baseIntensity` or `intensity`
  (`git grep -n "intensityAt\|baseIntensity\|\.intensity\b" src/engine` returns nothing); `git grep
  -n "identityStops\|keyIntensity" src test` returns nothing outside `RENAME_MAPS` and its test.
- **AC-005** `oklch-hue-anchor` gate passes with `rampChroma` in `{20, 45, 100}` passed as chroma.
- **AC-006** The full tonal verifier passes with its 0.2.0 pin unchanged; tones equal within 1e-9
  across group targets.
- **AC-007** `DEFAULT_CONTROLS.baseIntensity === 100 && primeChroma === 100`; in
  `projectView(defaultDocument())` Neutral's ramp equals its `chroma 30` ramp and the eight data
  palettes' ramps all equal their `chroma 100` ramps.
- **AC-008** `primeChromaOf`: a brand palette's override wins over its group default; a data
  palette's stored override is ignored and its group default applies; moving it to brand restores
  the override; the material default 60 reaches Neutral's `prime` (its `s` is `key.s * 0.6`).
- **AC-009** Headless-boot: four headers in order with counts 1, 3, 4, 8 on the default document;
  empty groups hidden; the Group dropdown moves a palette between headers; drag-reorder across a
  header reassigns the group; the new-palette modal and "Add data palettes (8)" assign the default
  group.
- **AC-010** `test/ui/persist.mjs` roundtrip and clamp groups cover `baseIntensity`, `primeChroma`,
  `paletteGroups` (per-field clamp, absent default-fill), `palette.group` (enum clamp, absent stays
  absent), `palette.primeChroma`; `palette.intensity` is dropped and reported.
- **AC-011** EX-9 all three snapshots as hydrate assertions; `CURRENT_SCHEMA_VERSION === 4`.
- **AC-012** Hydrating a v1 snapshot with 8 palettes yields exactly 8 palettes.
- **AC-020..024** Unchanged from 0.1.0 (data hues, minting, defaults 16).
- **AC-030** `hpg-export-leaf-valid` passes with `enabledCount` 16; `tokenCount(defaultDocument())
  === 16 * 96`.
- **AC-031** EX-11; shadcn neutral and primary picks unchanged; DS semantic layer `53 * 16`; DESIGN.md
  has the data section and the prime section.
- **AC-032** Headless-boot: "Base chroma" and "Prime chroma" sliders exist on the Global tab and
  write `doc.baseIntensity` / `doc.primeChroma`; four per-group rows with two sliders each write
  `doc.paletteGroups[g].baseChroma` / `.primeChroma`; the inspector has no "Intensity" slider, shows
  "Prime chroma" for a brand palette and hides it for a data palette, and its "Chroma" slider changes
  the prime strip but not the ramp; the two data actions behave as in 0.1.0.
- **AC-033** Binder plan `53 * 16`; plugin cascade green; the `collparity` gate covers
  `COLLECTIONS.colorPrime` against both sandbox literals.
- **AC-034** Headless-boot: every enabled ramp row has a `.prime-strip` (seven `.prime-swatch`; the
  older `.key-strip`/`.key-cell` name the unrelated retained-key-colours row, #552) before `.ramp-strip` with
  exactly seven `<i>` whose labels are, in order, brightest, brighter, bright, prime, dim, dimmer,
  dimmest, and whose background equals `view.palettes[i].prime[k].hex`; toggling scheme, `accentRef`,
  and `stopsMode` leaves the strip byte-identical.
- **AC-040** Count grep as in 0.1.0 plus `git grep -n "\b89\b" -- src test docs/reference mcp` returns
  only historical hits.
- **AC-041** After the count-moving units land: `test/ui/counts.mjs` `DEFAULT_PALETTES === 16`,
  `test/ui/shell.mjs` and `test/mcp/brand-kit*.mjs` assert 16 palettes, `tokenCount` expectations
  read 96 per palette, and `test/figma/binder.mjs` / `test/figma/plugin.mjs` are unedited (their
  bounds derive). Checked by the AC-040 greps plus a green `npm test`.
- **AC-042** `npm test` green at every build-unit boundary listed in the LLD.
- **AC-050** `test/engine/prime.mjs`: (a) exactly seven entries in the fixed step order for every
  default palette; (b) `l` strictly decreasing and every `l` within `[PRIME_L_MIN, PRIME_L_MAX]`,
  the derived L* window `[12.25, 96.88]` of REQ-051a, within 1e-9 (restated 2026-09-20, #681 U6: the
  gate reads the two exported constants, so the window cannot be retyped here or there and drift);
  (c) `inGamut` true for every entry at `primeChroma` in `{0, 50, 100}` and `chroma` in `{0, 50,
  100}`, plus a widened hueShift/skew sweep and a two-process determinism check comparing emitted
  hexes between a cold process and one whose shared caches were poisoned by real palette renders
  first; (d) the ladder gates, REWRITTEN 2026-09-20 (#681 U6/U4) for equal-compress and run over the
  16 defaults AND a sweep of hue 0..359 step 5 x chroma `{0, 50, 100}`, in BOTH hue spaces (`cam16`
  and the product default `oklch`), each stating a property rather than re-deriving `primeSteps`'s
  own expression.
  (d1) `brightest - dimmest` equals `6 * min(STEP_L, room_up, room_down)` exactly (1e-9) for EVERY
  case unconditionally, and never EXCEEDS `6 * STEP_L = 54`; equal-compress collapses the old
  "unclipped versus clipped" branch into one equation. Pinned alongside it: the three default
  palettes that clip on the shipped anchors, Tertiary at span `52.7805`, Danger at `49.9212`, and
  Warning at `46.2664` L*, each within 0.05, and the COMPLEMENT, every other default at exactly 54,
  so a silent change that clips or un-clips a default moves this gate rather than surfacing later as
  an unrelated-looking (d5) failure.
  (d2a) `prime`'s `l` equals the anchor's own L* within 1e-9 (REQ-056's mechanism, so neither
  equal-compress nor the widening search can move the anchor).
  (d3) the three consecutive `l` differences are equal within each side AND the two sides' steps are
  equal to each other within 1e-9 (Q9's "equal on both sides", strictly stronger than 0.3.1, where
  redistribution let the sides legitimately differ), both step sizes strictly positive, plus
  `primeSteps`'s algebraic contract at hand-computed anchors 55, 93, and 20, and at two anchors
  OUTSIDE the window, where BOTH sides must floor at zero because under equal-compress the missing
  side's zero binds the other.
  (d4) all seven `l` inside `[PRIME_L_MIN, PRIME_L_MAX]` and strictly decreasing, plus ZERO anchors
  outside the window across the whole sweep in both spaces (the REQ-051a gate; `peakC`'s cusp-tone
  search samples tone 4..96 only, so a cusp-identity anchor cannot leave `[12.25, 96.88]`).
  (d5) a FROZEN hex snapshot, byte-identical, of the seven defaults whose anchors need no compression
  at `STEP_L 9`: Neutral, Primary, Secondary, Info, Data 2, Data 3, Data 8. Re-captured 2026-09-19 on
  the integrated tree, because the shipped anchors moved Tertiary and Danger into the clipped set and
  Secondary and Info out of it. Frozen literals, so the check is independent of the present
  implementation by construction; `cam16`, the space they were captured in.
  (d6) the side whose NATURAL room is smaller sets the shared step, so ONLY that side's extreme rung
  touches its own bound while the other's sits `3 * step` from the anchor and generally falls short
  of its own bound. Which cases clip, and on which side, is DERIVED from the window and the anchor
  alone, and asserted non-empty on BOTH sides so the gate cannot go vacuous if the window or `STEP_L`
  move again. Its population is the full sweep, not the 16 named defaults: on the shipped anchors all
  three clipped defaults clip on the DARK side, so the named-defaults-only population would leave the
  light-clip branch permanently unexercised.
  Two further ladder gates ride with (d). SYMMETRY (C11, Q9): `|up - down| <= 1e-9` L* by
  construction on every case, asserted from the EMITTED `l` fields rather than re-derived from
  `primeSteps`, and `<= 3` L* MEASURED from the rendered 8-bit pixels, zero exceptions over the whole
  sweep, with a negative control that runs the SAME sweep against a frozen committed copy of the
  pre-#681 redistribute module and FAILS the gate if that copy does not exceed the budget.
  LADDER-WINDOW (C5): walking `docs/reference/colors/categories/*.json` and re-deriving the
  generator's own six-role mapping from the raw swatch fields, exactly 21 mapped source colours fall
  outside `[PRIME_L_MIN, PRIME_L_MAX]`, matched by (category, role, hex) against C5's own allow-list,
  with a negative control at a synthetic `[40, 60]` window that must find clearly more than 21.
  (d2) skew gamma (REQ-053a): for `skew` in
  `{-100, -60, -20, 0, 20, 60, 100}` on every default palette in both hue spaces, `l` is strictly
  decreasing and inside `[PRIME_L_MIN, PRIME_L_MAX]`; `brightest`, `prime`, and `dimmest`
  are skew-invariant within 1e-9; at `skew 0` the weights equal `|t|`; for `skew > 0` every inner
  swatch's `l` is >= its `skew 0` value and for `skew < 0` <= (strict where `up`/`down > 0`); the
  weights re-derived in the test from `3 ** (skew / 100)` match within 1e-9 (EX-4b binds the numbers);
  (e) hue, referenced to the ANCHOR's own pixel, never to the `hue` control (ruled 2026-09-11 on
  #537, the AC-005 precedent, no exemptions; re-based on CAM16 hue 2026-09-20, #681 U6, because the
  construction holds CAM16 hue per rung and OKLCH hue is not held across tones even at a fixed CAM16
  hue): `prime`'s CAM16 hue measured from its emitted 8-bit pixel equals the CAM16 hue measured from
  the anchor's own pixel, which is `deriveKeyColor(palette).rgb` on the cusp-identity path and the
  stored hex on the anchored path (an identity at `primeChroma 100`; (h)'s exact-hex check is the
  stronger form and is kept alongside); each of the other six
  swatches is within `max(0.5°, 2 * q)` of the `prime` pixel hue when `hueShift 0`, where `q` is the
  hue quantum at THAT swatch's measured chroma, the hue swing produced by a 1/255 perturbation of one
  RGB channel at that colour, re-derived in the test from the pixel. Near-neutral primes (Neutral:
  about 8° of spread from ±1/255) are covered by the chroma-aware `tol`, never exempted. Any residual
  between the `hue` control and the key colour's pixel hue is `deriveKeyColor`'s own ratified
  behaviour and is not asserted here. Since every shipped default now carries a stored `anchor`, each
  of (e), (g), (h), and (j) runs a companion probe with `anchor` stripped, so the cusp-identity arm
  the requirement was written for keeps being exercised rather than passing on a hex pass-through;
  (f) with
  `hueShift 20` the `brightest`/`dimmest` hues move by `-20`/`+20` within the same adaptive CAM16-hue
  budget and `prime` is invariant;
  (g) chroma scales linearly with `primeChroma` (ratio of measured `s` at 50 versus 100 equals 0.5
  EXACTLY, 1e-6, on an unclamped anchor-stripped probe; restated 2026-09-20 with REQ-052, which
  scales the rendered CAM16 chroma directly rather than an OKHSL saturation, so the relation is exact
  and no longer merely close), with a companion assertion that an anchored palette's `prime` rung is
  immune to `primeChroma` by design; (h) REQ-056: `prime.hex` equals its anchor BYTE-IDENTICALLY, in
  BOTH hue spaces, for every default palette (tightened 2026-09-20 from one 8-bit step per channel to
  zero, #686: the tolerance was covering a real `peakC` cache divergence between `primeSwatches` and
  `deriveKeyColor`, and with hct.js's cache keys now exact the two are literally the same call);
  (i) determinism: two calls are deep-equal; (j)
  `palette.primeChroma` overrides the global; (k) chroma is HELD, not damped by lightness distance:
  every rung's MEASURED CAM16 chroma either retains at least 70% of the `prime` rung's measured
  chroma or sits within 0.5 of `maxChromaInGamut` at that rung's own hue and tone, one or the other,
  with near-neutral cases excluded on the same quantisation-floor reasoning (e) uses for hue.
- **AC-051** `test/engine/exports.mjs`: every format except shadcn emits `7 * enabledCount` prime
  leaves, named per REQ-054; disabled palettes emit none; DTCG raw tree nests `prime` beside `scrim`;
  UI3 has the `Color Prime` collection with one `Base` mode and `7 * enabledCount` variables; the
  brand-kit carries `prime` per palette with seven `{hex, oklch}` entries.
- **AC-052** `test/figma/plugin.mjs`: applying the bundle creates the `Color Prime` collection with
  `7 * palettes` variables; re-applying updates in place (provenance registry, no duplicates).
- **AC-053** `test/mcp/brand-kit.mjs`: `get_prime("primary")` returns seven entries in step order.

## Agent verification

- AC-001..003(a), AC-004..006: `node test/engine/tonal.mjs` (`intensity-legacy` fixture retained; the
  0.2.0 `intensity-uniform` group is retired with `intensityAt`). AC-004's greps run in the same script.
- AC-002, AC-003(b), AC-007, AC-008: `node test/ui/shell.mjs` (resolver gates, the document fixture,
  the live identity rule). AC-009, AC-032: the headless shim lettered group.
- AC-010..012: `node test/ui/persist.mjs`.
- AC-020..024: `node test/engine/data-hues.mjs`, `node test/ui/shell.mjs`.
- AC-030..034: `node test/engine/exports.mjs`, `node test/figma/binder.mjs`, `node test/figma/plugin.mjs`,
  the headless shim lettered groups. Strip assertions read the shim DOM (background style string and
  the label text), never computed style.
- AC-050: `node test/engine/prime.mjs` (new verifier, registered in `test/run.mjs`; `pass`/`FAIL` per
  lettered group like `tonal.mjs`). The anti-tautology controls are: the property-stated gates in
  (d1)/(d3)/(d4)/(d6), which assert what the SPEC claims rather than re-running `primeSteps`'s formula;
  the FROZEN hex snapshot in (d5), independent of the present implementation by construction;
  the measurement from emitted pixels in (e)/(f)/(g)/(k) and in the symmetry gate; the symmetry
  gate's frozen pre-#681 redistribute module, which must FAIL the same sweep; the ladder-window
  gate's synthetic narrow window; the `gamut-ceiling` gate's private truncated-key reconstruction of
  the pre-#686 caches, which must measure a non-zero violation count; and the two-process,
  poison-before-any-render determinism check folded into (c). Restated 2026-09-20 (#681 U6/U4).
- AC-051..053: `node test/engine/exports.mjs`, `node test/figma/plugin.mjs`, `node test/mcp/brand-kit.mjs`.
- AC-040..042: the AC-040 greps and `npm test`, run at each build-unit boundary.
- No human exception remains: R1 is ratified, so `STEP_L = 9` is a checked constant (was
  `PRIME_STEP = 0.09` before R1's third amendment, 2026-09-20).

## Decisions on the issue's six Open gaps (as they stand after #533)

| Gap | Decision | Rationale | Ratify? |
|---|---|---|---|
| 1. Spike curve | Superseded 2026-09-11 by #533: no spike on the ramp. The prime system carries brand chroma instead, with a flat `s` from Prime chroma | A discrete spike made the ramp patchy (the defect #533 closes); a separate seven-swatch system gives vivid identity colours without touching the continuous ramp | Ratified (#533) |
| 2. Hover/active | Superseded 2026-09-11 by #533: no identity stops exist. Roles keep aliasing ramp stops; hover/active render at base intensity like every stop | Roles do not alias prime tokens this round (non-goal); a later SPEC may re-point them | Ratified (#533) |
| 3. Data hue rule | Even 45° spacing from primary plus an integer offset maximising min distance to chromatic brand hues (chroma >= 20) | Deterministic, pure, brute-force testable | No |
| 4. Token ceiling | 848 role variables, 576 primitives, 112 prime variables per Figma file at 16 palettes, each collection under 5,000; modes unchanged | Counted from 53, 36, and 7 per palette | No |
| 5. Migration | Pre-v2 stamps `baseIntensity 100`; pre-v3 renames `keyIntensity` to `primeChroma` | Same principle as the `hueSpace` legacy stamp and the TKT-0016 voice rename | R4 |
| 6. Data palettes default | ON in a fresh document; opt-in for upgraded documents | The pivot names data palettes part of the system | Ratified (H2) |

## Ratification record

Ratified 2026-09-11 (H1..H4, team-lead relaying the owner):
- **H1** `baseIntensity` default stays 100 this cycle.
- **H2** Data palettes ON in a fresh `defaultDocument` (16 palettes); upgraded documents opt in.
- **H3** Presets stay as authored.
- **H4** Data palette chroma follows the primary's chroma.
- **#533 Findings** Ramp spike retired; prime swatches are their own system with their own ladder,
  chroma control, and token group; roles frozen; strip renders the prime system.
- **R2** (ratified 2026-09-11, team-lead ruling on the former H5) The prime system is
  mode-independent: one set of seven swatches per palette, the same tokens in light and dark, like
  primitives. Roles stay the only mode-flipping layer.

Ratified 2026-09-11 (R1, R3, R4, R5; team-lead relaying the owner). 0.2.0 is approved with these:
- **R1** Ladder shape: OKHSL `l`, prime at the hue's cusp lightness, `PRIME_STEP 0.09`, inside
  `[0.14, 0.94]` (REQ-051). AMENDED 2026-09-17 (ticket #641, owner ruling option A): the ladder is
  even PER SIDE of the anchor, and travel a bound clips off one side is redistributed to the other,
  so every hue spans the full `6 * PRIME_STEP`. The anchor stays at `l_prime`; the rejected
  alternative was biasing it away from `PRIME_L_MAX`, which moves the anchor and breaks REQ-056.
  AMENDED AGAIN 2026-09-17 (ticket #655, folded into #641 by owner ruling): the window's upper bound
  is `0.97`, not the `0.94` ratified here. `0.94` was below the reach of this ruling's own cusp
  anchor (`l_prime` peaks at `0.961183`), so yellow-green hues put `prime` itself outside the window
  and inverted the light side. See REQ-051a for the sweep, the candidates, and the margin.
  AMENDED A THIRD TIME 2026-09-20 (ticket #681 unit U6, owner rulings Q8/Q9, with unit U4's
  integration pass 2 folded in): the ladder's METRIC is CIE L*, not OKHSL `l`, and its step is
  `STEP_L = 9` L*, not `PRIME_STEP 0.09`. Q8 keeps the total span this ruling set, `6 * STEP_L = 54`
  L*, and Q9 replaces the 2026-09-17 redistribution with EQUAL-COMPRESS: at a bound both sides take
  the smaller side's room, so the ladder shortens symmetrically instead of buying a constant span
  with a lopsided one. Chroma is HELD at the anchor's own CAM16 chroma on every rung, with only the
  gamut desaturating it, replacing the flat OKHSL saturation. The window is the same window,
  re-expressed as `[12.25, 96.88]` L* and derived from the two OKHSL greys rather than retyped. The
  anchor still never moves, so REQ-056 is still exact, and biasing it away from the bound is still
  rejected; U4 pass 2's widening search moves only the LADDER's pivot, and only for a stored anchor
  that would otherwise collapse the six non-prime rungs to duplicate hexes. See REQ-050..053a and
  EX-4/EX-4b/EX-5 for the construction and the regenerated numbers.
- **R3** Naming: `prime` group, `--{n}-prime-{step}`, `{n}/prime/{step}`, new Figma collection
  `Color Prime` with `{n}/{step}` (REQ-054).
- **R4** Rename `keyIntensity` to `primeChroma` with a schema-v3 rename (REQ-011).
- **R5** (changed from the proposed default) `hueShift` applies AND `skew` applies as a gamma on
  ladder position with `prime` and the ends fixed (REQ-053, REQ-053a); `lift`, damping, vibrancy,
  cusp pull do not apply.

Ratified 2026-09-11 for 0.3.0 (#556, #559 and its re-ruling; team-lead relaying the owner):
- **G1** Palette groups material / brand / system / data, user-assignable, editor-only (REQ-001,
  REQ-009).
- **G2** The group's Base chroma is an absolute ramp chroma target shared by every ramp in the group;
  `palette.chroma` feeds only the key colour and prime system; per-palette ramp override removed for
  all groups; defaults material 30, brand 100, system 100, data 100; global Base chroma is the
  fallback (REQ-002, REQ-007).
- **G3** Prime chroma: group default plus per-palette override, Data locked (REQ-008); material
  default 60.
- **G4** Byte identity re-pinned at two levels and AC-003 replaced by the engine fixture plus a
  regenerable document fixture (REQ-003, AC-003).
- Open, follow-up only: the material 30/60 values may be tuned after a Safari look (#559 Open 2).
