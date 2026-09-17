# 02 — Section data-flow & engine-scale resolution

Reviewer: fresh-context agent `rx-sections` · 2026-08-20 · commit `63e3dc3` · read-only.
Scope: src/ui/sections/{color,typography,geometry}.js, src/ui/model.mjs, consumers in
overlays/{drawer,apply-gate}.js, judged against the building-editor-sections canon
(view-driven Color vs doc-driven Type/Geom; "centralize resolution in `_typeScaleFor`/`_geomScaleFor`").
Reproduced verbatim; the corpus synthesis (00) reconciles it against the other axes.

---

Verdict up front: the view-driven/doc-driven split IS honored consistently (not three dialects
at the contract level), but there's a real, confirmed duplication in the type/geom
tier-synthesis formula, plus the mode-aware resolution layer sits in the wrong file per the
same principle that already justified model.mjs.

## (A) Data-source map

**Color** — view-driven throughout, exactly per canon:
- Canvas (`renderCanvasArea`/`renderRampsScene`, color.js:859/958) and Left (`analysisCards`, color.js:13) read only `view` (projectView output).
- Right (`renderPaletteInspector` color.js:1598, `renderGlobalInspector` :1780, `renderRolesInspector` :1886, `renderStoryInspector` :1522): writable controls bind `this.doc.palettes[i]` raw params (hue/chroma/skew/lift/name/on/hueShift/cuspPull); resolved display (ramp swatch, colorName/description) reads `view.palettes[i]`. This doc+view mix is the canon-sanctioned "writable=doc, derived=view" pattern, not a violation — verified at color.js:1598-1687.
- Exports: drawer.js's "Colors" format group reads straight off `view.exports` (the `view` param passed into `renderDrawer(view)`).

**Typography** — doc-driven throughout, `view` accepted but genuinely unused (self-documented):
- `typeAnalysisCards(view)` (typography.js:25) — comment explicitly: "`view` is accepted for dispatch parity but unused (typography is doc-driven...)". Reads `this._activeTypeScale()`.
- Canvas (`renderTypographyScene`, typography.js:567) — `this._activeType()`/`this._activeTypeScale()`.
- Right (`renderTypeInspector`, typography.js:631+) — binds `this.doc.type`.
- Exports — `this._typeScaleFor("base")` / `this._typeModeScales()` (drawer.js:46,60-67,363-380; apply-gate.js:78,148,222,277).

**Geometry** — mirrors Typography exactly, method-for-method: `geomAnalysisCards(view)` (geometry.js:608, same "unused view" comment) → `this._activeGeomScale()`; `renderGeomInspector` (geometry.js:726) binds `this.doc.geometry`; exports via `this._geomScaleFor("base")`/`_geomModeScales()` (drawer.js:47,62,383-395; apply-gate.js:223).

`renderCenter`/`renderLeftPane`/`renderRightPane` (app.js:1511,1610,1906) are thin routers in app.js, exactly per SKILL.md step 1; every actual body method lives in its own section file (color.js/typography.js/geometry.js) — verified no leakage.

## (B) Resolver-bypass / duplication findings

**B1 [HIGH, confirmed]** — the flagged lead is real: `typography.js:1127` (`tier`) and `geometry.js:239` (`tierType`) are byte-identical closures:
`typeScale({ ...t, bodyBase: bb * mult, modeFactor: mf, overrides: { ...(t.overrides || {}), ...this._modeTierNudge(mf) } })`
Both independently rebuild "the type scale for a synthesized tier" inside `_typeModeScales()`/`_geomModeScales()`. This directly contradicts the neighboring claim at app.js:1751-1752 that `_modeTierNudge` is "the SINGLE source for both call sites... so they can never independently drift" — true for the nudge *table*, false for the composition formula wrapped around it.

**B2 [MEDIUM]** — geometry.js has a *third* independent geomScale+typeScale join: `_geomScaleFor` (geometry.js:62-69) vs the `synth()` closure inside `_geomModeScales` (geometry.js:243) — same idiom, two code paths in the same file (real/materialized modes vs. synthesized tiers).

**B3 [MEDIUM]** — model.mjs's `geometryScale(doc, opts)` (model.mjs:43-47) is a *fourth* independent implementation of "geomScale composed with typeScale," used only by `brandKit()` (model.mjs:265-306, consumed at app.js:2423/2455 for the MCP-kit zip downloads) and `projectView`'s shadcn radii (model.mjs:564-565). None of the section resolvers that drive every CSS/DTCG/Figma/DS-bundle export (drawer.js, apply-gate.js) call through it — they reimplement the join via `_typeScaleFor`/`_geomScaleFor` instead. Currently equivalent for base-mode-no-nudge, but only by coincidence of two independently-written override slicers agreeing (see B4), not by shared code.

**B4 [LOW]** — the "slice tokenOverrides by mode suffix" helper is implemented 3x: `baseOverrideSlice` (model.mjs:53-64, filters non-finite/≤0 values) vs `_typeOverridesFor`/`_geomOverridesFor` (typography.js:397-407, geometry.js:21-31, no filter). Dormant risk only — persist.js's `clampTokenOverrides` (persist.js:425-434) and the live setters already guarantee valid values reach these stores, so the missing filter isn't currently reachable, but it's the same duplication grain as B1.

**B5 [confirmed non-issue]** — checked every `geomScale(` call site in scope (model.mjs:46, geometry.js:69, geometry.js:243): none omit the `typeScale` composition option. The invariant "geomScale always carries a typeScale" holds everywhere; only the code enforcing it is unshared (B1-B3).

**B6 [LOW, content drift not data-flow]** — `geomAnalysisCards`'s card title (geometry.js:615, "Font ← Typography UI — shared text size") vs. its own body copy (`graphGeomComposition`, geometry.js:708: "its own hand-ratified table, decoupled from the Label voice"). Checked the engine (src/engine/geometry.mjs:157-169): font DOES compose from `typeScale.categories["UI-control"]` at every step, so the title is accurate and the body copy is stale/misleading — describes the historical "moved off Label" rerouting without mentioning it's still composed from Type's UI-control voice. Not a resolver bug, flagging per the stale-context standard.

## (C) Ownership misplacements

**C1 [the core finding]** — `_typeScaleFor`, `_geomScaleFor`, `_typeModeScales`, `_geomModeScales`, `_modeTierNudge` are all *pure functions of doc* (+ a modeKey arg) — none read any other mutable instance state (confirmed by inspection: `_typeScaleFor` touches only `this.doc.type` + doc-only helpers + `_modeTierNudge(mf)`, itself pure in `mf`). By the exact principle that already put `projectView(doc)`/`geometryScale(doc)` in model.mjs, this whole mode-aware resolution layer belongs there too, not scattered across app.js (`_modeTierNudge`, app.js:1753) and the two section mixins. Centralizing it would collapse B1/B2/B3 into one implementation that `brandKit` and the section resolvers both call.

**C2 [minor]** — `_modeTierNudge`'s placement in app.js's shared core is fine (it's genuinely cross-section). The misplacement is one level up: the formula that *wraps* it into a resolved scale should have followed it into a shared spot and didn't — each section reinvented that wrapper.

**C3 [verified clean]** — no leakage between app.js (routing) and section files (bodies); mixin composition (app.js:2517-2535: `mixinInto(HctApp, ColorSection, TypeSection, GeomSection, DrawerMixin, ApplyGateMixin, SettingsMixin)`) matches the documented "sections/overlays live in per-file mixins, flattened onto one prototype" contract.

**C4 [non-issue]** — `_pickTypeTreatment`/`_pickGeomTreatment` (app.js:1260-1269) are the only type/geom-named methods living in app.js proper, but they're the shared paywall-gate-then-commit pattern (`_treatmentBlocked`), not resolution logic — defensible placement.

## Mode/override channel trace + compare overrides

Traced matrix cell edit → `setTypeTokenOverride`/`setGeomTokenOverride` → `_typeScaleFor`/`_geomScaleFor` → specimen + every export: clean, single path, no consumer reads `tokenOverrides` directly instead of through the resolver.

`deleteTypeMode`/`deleteGeomMode` (typography.js:219-235, geometry.js:317-332): read both in full — line-for-line structurally identical, both correctly strip orphaned `|<id>` override keys on mode deletion. Clean hygiene, no drift.

Clamping mirror check: setters clamp type to [1,512] (typography.js:452) and geom to [8,256] (geometry.js:78, and the live-drag `_setGeomSize` at geometry.js:106); persist.js's `clampTokenOverrides` calls at persist.js:464 (`1, 512, 3`) and :554 (`8, 256, 2`) match exactly. No drift here.

The three transient-override mechanisms (`_schemeOverride`, `_typeModeOverride`, `_geomModeOverride`): same semantics (`!= null ? override : this.<mode>`, set/cleared around a Compare column's render), but **not identically implemented** — `_typeModeOverride`/`_geomModeOverride` are explicitly declared `= null` in the app.js constructor (app.js:99,134, both commented "mirrors _schemeOverride"), but `_schemeOverride` itself is *never* declared/initialized anywhere — it only exists via its setter/clearer inside color.js's compare-column function (color.js:943,946). Functionally harmless (`resolvedCanvasScheme()` at app.js:1496 uses a truthy check, so `undefined` and `null` behave the same), but it's a real asymmetry: scanning the app.js constructor for "what state exists" misses `_schemeOverride` entirely, contradicting the other two's own comments that claim to mirror it.

## (D) Verdict — one pattern or three dialects?

Not three dialects at the contract level. Color's view-driven contract and Type/Geom's shared doc-driven contract are each internally consistent and correctly honored everywhere checked — Type and Geom are mirror images of each other down to method names (`_typeEffectiveModes`/`_geomEffectiveModes`, `_ensureTypeModesMaterialized`/`_ensureGeomModesMaterialized`, `deleteTypeMode`/`deleteGeomMode`) and clamp ranges.

The actual crack is that Type/Geom's resolution engine was built as two hand-mirrored instance-method files instead of one shared model.mjs module the way Color's (`projectView`) was — so "one pattern, executed twice in parallel" is a more accurate description than "three dialects," and that parallel execution is exactly where B1's duplication and B3's disconnected fourth implementation come from. Recommended fix: lift `_typeScaleFor`/`_geomScaleFor`/`_typeModeScales`/`_geomModeScales`/`_modeTierNudge` into model.mjs as pure `doc → scale` exports (they qualify — see C1), and have `brandKit` call the same functions instead of model.mjs's separate `geometryScale`/`baseOverrideSlice`.
