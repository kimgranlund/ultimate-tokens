# 00 — Synthesis: one architecture, four accreted seams

Reviewed at `63e3dc3` (2026-08-20). Sources: reports 01–04 in this corpus, each a fresh-context
read-only sweep of one axis; this synthesis reconciles and prioritizes.

## Verdict

The suspicion of "a mix of implementations" is **half-confirmed, in a specific way**: there is
ONE intended architecture — `doc` (parametric source of truth) → derive (`projectView` /
`typeScale` / `geometryScale`) → full-subtree `render()`, with documented fast paths
(`liveRefresh` for color drags, `paint*` readouts, `_sync*` dialog reconciliation) — and all
four reviewers independently traced their axis back to it. Nothing competes with it; every
bypass carries an inline comment explaining itself (01 §D).

What HAS mixed is the **execution layer under that architecture**, at four seams:

1. **Type/Geom scale resolution is one pattern hand-executed in parallel** (02). Color's
   derivation lives in `model.mjs` (`projectView`); Type/Geom's equivalent
   (`_typeScaleFor`/`_geomScaleFor`/`_typeModeScales`/`_geomModeScales`) lives as mirrored
   instance methods in two section files, with the tier-synthesis closure byte-identical in
   both (typography.js:1127 ≡ geometry.js:239), a third geomScale+typeScale join inside
   `_geomModeScales` (geometry.js:243), and a FOURTH, disconnected implementation in
   `model.mjs#geometryScale` that only `brandKit()` uses. They agree today by coincidence of
   independently-written code, not by sharing.
2. **Storage is three disciplines** (03): persist.js's spec-grade doc store (fuzzed roundtrip
   identity + per-field clamp + RENAME_MAPS) · an ad-hoc JSON.parse/try-catch tier (sets
   index, profile, PROJECT_KEY, both Figma channels) · a cache-buster tier (`-v1` literal keys
   for app-prefs/apply-consent) that sits outside `migrateStorageKeys()` entirely.
3. **The async/flag layer is ticket-by-ticket accretion** (04): the postMessage bridge itself
   is designed (one dispatcher, symmetric pairs), but 4-of-5 busy flags having guaranteed
   resets — and the fifth (`sweepBusy`) not — shows no shared wedge-proofing rule was ever
   written; likewise `disconnectedCallback` cleans exactly the two listeners that once bit
   someone, out of ~8 registrations.
4. **Two hand-rolled copies of the commit ladder** (01): `selectPalette()` (missing `save()`)
   and `_onReorderUp()` (a private re-implementation of `commit()`), each one drift away from
   the canonical `edit`/`commit`/`editDrag` lane.

## Cross-report reconciliation

- **`isDirty()`**: report 03 called its dirty branch unreachable ("every mutation path saves
  immediately"); report 01 found the reachable path 03 missed — `selectPalette()` mutates
  `doc.selected` without `save()`, so the footer badge CAN show a false "unsaved" today. Both
  cost findings stand: `isDirty()` pays a full `serialize`+`stringify` on every render AND
  every liveRefresh tick, for a signal that is wrong in exactly one case. Resolution: fix
  `selectPalette` (add `save()`), then decide whether the badge earns its per-frame cost.
- **`this._view` cache**: 01 cleared the staleness question (two writers, both recompute
  fresh before any read; no constructible stale-read with the current call graph). 02's
  data-source map confirms only color.js reads it. Keep, but see the naming hazard below.

## Prioritized findings

### Fix now (defects — small, isolated)

| # | Finding | Evidence | Fix shape |
|---|---|---|---|
| D1 | `sweep-scan`/`sweep-delete` failures never reply → `sweepBusy` wedges; Cleanup panel disabled for the session | 04 §B; figma/plugin/code.js:203-211 special-cases only `apply` | code.js catch posts `sweep-scanned {texts:[],paints:[]}` / `sweep-done {removed:0}`, mirroring the apply carve-out |
| D2 | `selectPalette()` mutates `doc.selected`, renders, never saves → false "unsaved" badge | 01 §B1; sections/color.js:255-260 | add `this.save()` (or route through `edit()`) |

### Fix soon (performance)

| # | Finding | Evidence | Fix shape |
|---|---|---|---|
| P1 | `edit()` runs `save()` on EVERY slider pointer-move tick: full doc deep-clone + second stringify + whole-gallery stringify + sync `localStorage.setItem` + (Figma) structured-clone postMessage of ALL sets — unthrottled, while only the DOM rebuild is rAF-coalesced. Likely co-culprit of the observed Figma drag jank the comments blame on rendering alone | 03 cost story; app.js:221-227, 321-326, 1133-1151, 2087-2124 | move `save()` off the live-drag lane: persist at settle (`commitDrag`) like the undo push, or debounce it; keep the doc mutation synchronous |
| P2 | `isDirty()` serialize-per-frame (render + liveRefresh) for the footer badge | 03 §B2 | cheap dirty bit set in `edit()`/cleared in `save()`, or drop the badge |

### Architecture (the real "unify the mix" work — one refactor)

| # | Finding | Evidence | Fix shape |
|---|---|---|---|
| A1 | Lift the mode-aware resolution layer into model.mjs as pure `doc → scale` exports: `_typeScaleFor`, `_geomScaleFor`, `_typeModeScales`, `_geomModeScales`, `_modeTierNudge` (all verified pure in doc+modeKey, 02 §C1); collapse the four independent join/tier implementations (02 §B1–B3) into one; make `brandKit()` and the drawer/apply-gate exports call the same functions; unify the 3× tokenOverrides mode-slicers (02 §B4) | 02 §B, §C | one PR; behavior-preserving (the implementations agree today), gated by the existing engine + headless + export tests |

### Hazards (structural — cheap guards, decide-and-document)

| # | Finding | Evidence | Fix shape |
|---|---|---|---|
| H1 | `_onReorderUp()` hand-rolls the commit ladder | 01 §B2; color.js:1478-1516 | route through `this.commit(fn)` |
| H2 | `mixinInto` has no method-collision guard (zero collisions today, verified; nothing catches the first one) | 01 §B3, 04 §C; app.js:2522-2535 | throw on duplicate own-property name during composition |
| H3 | Gallery crash vector: set records never shape-validated; search does `s.name.toLowerCase()` unguarded | 03 §C; app.js:628-630, app-helpers.mjs:93 | per-record shape check in `loadSets`/`receiveStoredSets` (or a `String(s.name||"")` guard) |
| H4 | `tokenOverrides` keys never validated against voice/step domains → typo'd/retired keys accumulate as permanent inert orphans | 03 §B5; persist.js:425-436 | drop unknown-voice/step keys in `clampTokenOverrides` (RENAME_MAPS already translates legitimate renames) |
| H5 | `clampProfile` has no rename-forward story (a FLAG_KEYS rename silently drops overrides); app-prefs/apply-consent sit outside `migrateStorageKeys()` undocumented at that site | 03 §B3–B4 | add a one-line comment at `migrateStorageKeys()` naming the exclusion as deliberate; add a rename-map seam to clampProfile only if flags ever rename |
| H6 | `_applyBusy` has no timeout (a lost reply wedges apply for the session — narrower than D1 since code.js always answers `apply`) | 04 §B | decide: accept (document) or add a timeout fallback consistent with D1's fix |

### Hygiene (cosmetic, batchable)

- `_schemeOverride` never declared in the constructor while its two mirrors are (02; color.js:943 vs app.js:99,134) — declare it.
- `this.view` (route string) vs local `view` (projectView result) one underscore apart at app.js:551 — rename the route field (e.g. `this.route`) or the locals.
- `disconnectedCallback` teardown set asymmetric with what connectedCallback registers (`_liveRaf`, `_dragTimer`, `_toastT`, window-level drag listeners) — inert for a page-lifetime singleton; either complete the inventory or comment why it's deliberately partial (01 §B6, 04 §D).
- Stale copy in `graphGeomComposition` (geometry.js:708) contradicts its own card title — font DOES still compose from Type's UI-control voice (02 §B6).
- `src/engine/tonal.js:275` module-level memo Map is the one true exception to "engines are pure, no module state" — bounded and harmless; worth one comment acknowledging it (04 §B).

## Deliberately fine — do not "fix"

- The mixin-flattened `this` (file organization, not encapsulation) — an explicit, documented
  trade-off (app.js:2530-2534); H2's collision guard is the cheap insurance, not a redesign.
- Color-only `liveRefresh` / the Type-Geom drag freeze until settle — canon (foundations §3),
  self-documented, intended UX.
- The one-shot latches `_figmaProbed`/`_figmaFontsRequested` — documented fire-once by design.
- Lazy clamp-at-open for stored docs (`hydrateStoredDoc` at consumption) — a consistent,
  reasonable pattern across sets/PROJECT_KEY/Figma config.
- The `newPalCustom` draft slider living outside the commit ladder — correct; nothing is
  undoable until the palette exists.

## Suggested sequencing

1. **PR 1 (defects)**: D1 + D2 — two small diffs, both test-coverable (a headless assert for
   D2; a plugin-test assert that code.js's catch answers sweeps for D1).
2. **PR 2 (perf)**: P1 (+P2 riding along) — move persistence to the settle, mirroring the
   undo debounce that already exists.
3. **PR 3 (architecture)**: A1 — the model.mjs lift; the one change that actually removes the
   "mix" rather than guarding it.
4. **PR 4 (hazard/hygiene batch)**: H1–H4 + the hygiene list; H5/H6 are decide-and-document.
