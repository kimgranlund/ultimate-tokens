# 01 — Core reactivity & render machinery

Reviewer: fresh-context agent `rx-core` · 2026-08-20 · commit `63e3dc3` · read-only.
Scope: src/ui/app.js (+ sections where needed), judged against
`.claude/skills/building-editor-sections/references/foundations.md` §3–§4.
Reproduced verbatim; the corpus synthesis (00) reconciles it against the other axes.

---

Verdict up front: **one coherent model**, not competing paradigms — every bypass of
commit/edit/editDrag found carries an inline comment explaining why, and doc→view→render
(projectView re-derived on every full render + every color liveRefresh, never cached across an
edit) holds up under direct inspection. Two narrow real gaps, two structural hazards, two
cosmetic asymmetries. No undo-hole (history/future always serialize the live `this.doc`,
regardless of which lane mutated it).

## A. Mechanism catalog

| Mechanism | Trigger | What refreshes | file:line |
|---|---|---|---|
| `edit(fn, opts)` | called by commit/editDrag | mutate doc, sync `doc.selected`, `save()`, then `liveRefresh()` (opts.live) or full `render()` | app.js:221-227 |
| `commit(fn)` | discrete edits (add/delete/rename/toggle/treatment/…) | `pushHistory()` + `edit(fn)` — one undo step | app.js:312-315; ~44 call sites across app.js/color.js/typography.js/geometry.js |
| `editDrag(fn)` | slider drags (color hue/chroma/skew/lift/vibrancy/damp*; type bodyBase/weight/tracking/leading; geom baseHeight/rampContrast/per-size height) | captures pre-drag snapshot once, `edit(fn,{live:true})`, (re)arms 250ms `commitDrag` debounce | app.js:321-326 |
| `commitDrag()` | debounce timeout, `slider()`'s onchange, undo()/redo() (flush first), docname input onchange, color.js:1635 | push captured snapshot to history, clear future | app.js:331-338 |
| `slider(label,…)` | shared factory used by every doc-bound range control | oninput → live readout text + `onInput(v)`; onchange → `commitDrag()` + full `render()` — the ONE place the drag-settle contract is wired | app.js:2044-2069 |
| Full `render()` | ~86 call sites total (34 app.js + 17 color.js + 7 typography.js + 5 geometry.js + 7 settings.js + 12 apply-gate.js + 4 drawer.js) | capture/restore focus, `replaceChildren(gallery\|editor)`, theme/motion dataset, apply-busy class, `paintAppFooter(this._view)`, 4× `_sync<X>()` | app.js:527-557 |
| `liveRefresh()`/`_liveRefreshNow()` | `edit(fn,{live:true})`, color section only | rAF-coalesced; recomputes `projectView`, sets `this._view`, patches canvas-scene children, `--canvas-bg`, example card, damping graph, left-pane graph cards + selection label, both footers. Right pane + the dragged input untouched. Early-returns for Type/Geom (line 255) and defers to full render when `colorMode==="both"` (line 256) | app.js:239-289 |
| Direct-DOM paint paths | pan/zoom, hover, drag-settle | `paintCanvasFooter()` (1878-1900), `paintAppFooter(view)` (2153-2176), `applyTransform()` (1665-1674), `_fitTopLeftInset()` (516-523) — all called from both full render() and liveRefresh()/pan-zoom handlers, outside the h()-rebuild path | app.js |
| `_sync<X>()` ×4 | tail of every `render()` | reconcile one native `<dialog>`'s open/closed vs a ui-session boolean (Drawer/NewPal/ApplyGate/Settings) — identical pattern each time | app.js:553-556; color.js:408; apply-gate.js:286; settings.js:15 |
| `this._view` cache | set at liveRefresh + every full render | two writers (app.js:258, app.js:1326), both recompute fresh from `this.doc`; reads are defensive `this._view \|\| projectView(this.doc)` | app.js:551,1684; color.js:791,1743 |
| `_bindRangeDrag()` | bound once on host in connectedCallback | delegated `pointerdown`, drives drag off `window`, dispatches synthetic native `input`/`change` `Event`s via `dispatchEvent` | app.js:2087-2125 |
| Mixin composition | module load | `Object.defineProperty` copies every own prototype method from ColorSection/TypeSection/GeomSection/DrawerMixin/ApplyGateMixin/SettingsMixin onto `HctApp.prototype`, last-source-wins, no collision check | app.js:2522-2535 |
| Reorder-drag ghost | palette-row drag | direct DOM style/insert writes on `.ramp-row`/ghost/placeholder during the drag; only touches `this.doc` at drop, via a **hand-rolled** ladder (see B2) | color.js:~1360-1516 |
| New-Palette draft slider | Custom-tab hue/chroma | a locally-defined `slider()` (not `this.slider`) mutating `this.newPalCustom` (never bound to doc) — correctly outside the whole commit ladder since nothing is undoable yet | color.js:690-730 |
| Ambient subscriptions | connectedCallback | matchMedia scheme listener (158-162, torn down), `_installKeyboard` (382-385, torn down), `document.fonts.ready` one-shot (typography.js:897-904, self-guarded, no teardown needed), `_bindRangeDrag`'s host pointerdown listener (2087-2091, **never** torn down) | app.js |

## B. Divergences (severity-ordered)

1. **DEFECT** — `selectPalette()` (color.js:255-260; called from app.js:486 and color.js:344,473,998,1049,1140,1766,1776) writes `this.doc.selected` directly and calls `render()` but never calls `save()`. `selected` is a real serialized field (persist.js:80) and `isDirty()` (app.js:194-196) diffs `savedSnapshot` against `serialize(this.doc)`. **Reproducible now**: open a saved set, click a different (already-saved) palette swatch, make zero edits — the footer's save badge (app.js:2164-2169) flips to "unsaved." Not a data-loss bug — the next real `commit`/`editDrag` re-syncs and persists `doc.selected` correctly, and undo/redo integrity is unaffected (`pushHistory`/`snapshot` always read the live doc) — but it's a false signal in exactly the UI element whose only job is to report save state truthfully.

2. **HAZARD** — `_onReorderUp()` (color.js:1478-1516) hand-rolls `pushHistory()` → direct `pals.splice()` → manual `this.sel`/`doc.selected` sync → `save()` → `render()` instead of calling `this.commit(fn)`. Currently correct (same order, same one-undo-step contract) but it's a second, independently-maintained copy of what `commit()`/`edit()` already do — a future change to that ladder has no structural reason to also land here.

3. **HAZARD** — mixin composition (app.js:2522-2535) has zero collision guard: `Object.defineProperty` lets a later source silently overwrite an earlier same-named method (including one defined directly on `HctApp`). I diffed all top-level method names across app.js + the 6 mixin files — **zero collisions exist today** — but nothing would catch one being introduced; it'd fail at runtime as wrong behavior, not at build/test time, unless a test exercises the shadowed path.

4. **COSMETIC** — `this.view` ("gallery"|"editor") and the ubiquitous local `view` (projectView result) sit one underscore apart at app.js:551: `if (this.view === "editor") this.paintAppFooter(this._view);`. No live bug, but dropping/adding that underscore compiles fine and produces a silent wrong-type error (`paintAppFooter` would receive the string `"editor"` and `view.palettes.filter(...)` would throw).

5. **COSMETIC** (documented, not a bug) — Type/Geometry `editDrag` slides mutate the doc live but `_liveRefreshNow()` early-returns for `this.section !== "color"` (app.js:255), so nothing repaints during the drag except the slider's own inline readout text. The canvas/specimen/matrix stays frozen at the pre-drag frame until pointer-up (`onchange` → `commitDrag()` + full render). This matches foundations.md §3 exactly (intentional: only Color gets the live fast path) but is a real, user-visible asymmetry — Color drags are visually live, Type/Geometry drags are not.

6. **COSMETIC** — `disconnectedCallback()` (app.js:167-170) tears down the keydown and matchMedia listeners but not `_bindRangeDrag`'s host-level pointerdown listener. Inert in practice (long-lived singleton element, no reconnect cycle), but the teardown set isn't symmetric with what connectedCallback installs.

## C. Staleness / undo-hole risks

- **False-dirty** (B1 above) — UX/trust risk, not data loss.
- **Bounded read-after-write window on Type/Geometry drags** — `this.doc` is mutated synchronously inside `editDrag`, but the rendered DOM (and `this._view`, since `liveRefreshNow` no-ops for non-color sections) lags until release, ≤250ms or until pointerup. Harmless for a human dragging (they see the readout number tick and the visual settle on release, which is the intended UX) but a real trap for anything that asserts on the canvas/`this._view` mid-drag without first firing `change` — e.g. a future test.
- **Undo-hole check**: none found. Both hand-mutation lanes (`selectPalette`, `_onReorderUp`) are still captured correctly by whichever `pushHistory()` runs next, because `snapshot()` always serializes the live `this.doc` — there's no code path where an edit becomes silently un-undoable. `selectPalette`'s issue is purely persistence/dirty-flag, not undo integrity.
- `this._view`'s "single owner" question: effectively two owners (liveRefresh + renderEditor) but both always run before any read in the same call stack — I could not construct a stale-read scenario given the current two callers of `this._view` (both in color.js, both post-render).

## D. Verdict

One coherent model with fast paths that are unusually well self-documented at each divergence point — the `newPalCustom` slider, the reorder-drag ghost, and the Type/Geometry live-refresh early-return all carry inline comments explaining exactly why they don't use the canonical ladder. The two real gaps (B1, B2) are narrow, named, and each has an obvious fix shape (add `this.save()` to `selectPalette()`; route `_onReorderUp` through `commit()`). The mixin collision hazard (B3) and the `this.view`/local-`view` naming collision (B4) are structural risks — nothing prevents them from becoming bugs — but neither is one today. This reads as mixed fast-paths by deliberate design, not competing paradigms by accident.

Files touched in this review (read-only): src/ui/app.js, src/ui/sections/color.js, src/ui/sections/typography.js, src/ui/sections/geometry.js, src/ui/overlays/{drawer,apply-gate,settings}.js, src/ui/persist.js, src/ui/app-helpers.mjs.
