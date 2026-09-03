## Foundations — the model the Figma plugins lean on

The load-bearing ideas behind both plugins. The conceptual *why* (aliasing as the only cascade mechanism) is
owned by `docs/reference/references/knowledge-05-figma-plugin.md`; this file is the mental model the *procedure*
assumes, grounded in the actual `code.js` files.

### 1. Two plugins, one vocabulary, different jobs

Both speak `RAW_COLLECTION = "Color Primitives"` and `SEMANTIC_COLLECTION = "Color Roles"`. They differ in
who builds what:

- **The standalone Binder** (`figma/binder/figma-semantic-binder/`) is alias-only. It assumes the raw
  `Color Primitives` collection already exists (the user ran the app's Apply first, or imported the raw JSON)
  and ONLY creates the aliased `Color Roles` collection on top. If `Color Primitives` is absent it notifies
  *"No 'Color Primitives' collection found — apply your palette in Color Tokens first, then run the Binder."*
  and closes. It has no `ui.html`/`figmaBundle` — its inputs are purely the live variables in the open
  file — but (#492) it CAN show a tiny inline `figma.showUI()` confirm dialog (no committed HTML file,
  no manifest change: the markup is a string literal in `confirmAdopt()`) for the one adoption-consent
  gate described below; that dialog is the ENTIRE UI surface this plugin has.
- **The app-as-plugin** (`figma/plugin/`) is the whole generator running inside Figma. `ui.html` embeds
  `<ultimate-tokens>` (built by `npm run gen:figma-ui` from `dist/ultimate-tokens.html`); the UI posts
  `figmaBundle()` to `code.js#applyBundle`, which CREATES both collections from scratch, prunes orphans, and
  can rebuild. It needs nothing pre-existing.

A bug report routes by which plugin: *"the binder skipped N roles"* is the binder's `missing` list; *"apply
did nothing / made duplicate collections"* is `applyBundle`.

### 2. The alias cascade — the only live raw→semantic mechanism (knowledge-05 §1)

Native Figma JSON import can't make semantic vars cascade off raw edits: imported colors are either resolved
(static) or matched by fragile name/library key. The plugins instead call
`figma.variables.createVariableAlias(rawVar)` — binding by **reference** to the actual raw `Variable` object.
Edit a raw color and every semantic role aliasing it updates. Each semantic var gets TWO aliases:
`setValueForMode(lightModeId, alias(lightRawVar))` and `setValueForMode(darkModeId, alias(darkRawVar))` —
this is the light/dark flip (the same role points at different raw stops per mode). The exported Light/Dark
JSON files are the static, portable artifact; the plugin is the *live-binding* artifact; both encode the same
role table.

### 3. The binder bind loop, exactly (read `figma-semantic-binder/code.js`)

`main()` is: `getLocalVariableCollectionsAsync` → find `Color Primitives` (bail with a friendly notify if
absent) → `getLocalVariablesAsync` and index by name into `rawVars` → find/create `Color Roles` with mode 0
as Light and mode 1 (or a fresh `addMode("Dark")`) as Dark → loop the 8 `PALETTES` × `roleTable(n)`:

```
ltName = targetName(n, r.light) = "{n}/" + refKey(r.light);  lt = rawVars[ltName]
dtName = targetName(n, r.dark)  = "{n}/" + refKey(r.dark);    dt = rawVars[dtName]
if (!lt) { missing.push(ltName); continue }   // a raw target that doesn't exist
if (!dt) { missing.push(dtName); continue }
semVar = (existing "{n}/{kebab leaf}" in Color Roles) || createVariable("{n}/{kebab leaf}", sem, "COLOR")   // ADR-016: leaf = suffix-derived
semVar.setValueForMode(lightMode, createVariableAlias(lt))
semVar.setValueForMode(darkMode,  createVariableAlias(dt))
```

`refKey(ref)` is the single normaliser (mirrors `semantic.js`): a solid stop zero-pads to 3 digits
(`"50"→"050"`); a scrim ref `"500-200"` emits the nested `scrim/200` path (ADR-016). Because every `r.light`/`r.dark`
is a ref from the validated role table, every `"{n}/{refPath}"` is GUARANTEED a member of the canonical
raw-colors name set — that is why the binder can't construct a dangling target by hand. `targetName(n, ref)`
centralises this grammar identically to `bind-plan.mjs#targetName`. (Note: the semantic var name uses `r.key`
— `"{n}/{r.key}"`, e.g. `"primary/primaryDim"` — distinct from `bind-plan.mjs`'s `bindingPlan` which names
its `semanticVar` as `"{n}{r.suffix}"`, e.g. `"primary-dim"`; both forms describe the same role.)

### 3b. The adoption path (#492) — the binder's only exception to "PROVENANCE, never by name"

`ensureCollection`/`ensureFloatCollection` (spliced verbatim from the flagship, TKT-0024/TKT-0009-era)
are UNCHANGED by #492 — they still resolve `reg[name]` by id ONLY, never by name, and adoption never
touches them. Instead, `main()` calls a DISCOVERY-only helper, `findAdoptionCandidate(name, reg,
renameFrom, cols)`, BEFORE each `ensureCollection`/`ensureFloatCollection` call: is there a LIVE
collection named `name` (or a `renameFrom` name) that `reg` does NOT already track by id — an orphan,
e.g. one built by hand, by an older build that predates the registry, or one the registry lost track of?
If one exists, `confirmAdopt(name)` shows the ONE UI this plugin has (`figma.showUI()` with an inline
HTML string — no `ui.html` file, no manifest change) and awaits a click. Confirmed ⇒ `main()` pre-seeds
`reg[name] = candidate.id` ITSELF, then calls the (still-unchanged) `ensureCollection`/
`ensureFloatCollection`, which now takes its normal "known" fast path and returns that exact collection
— zero risk to the provenance functions' own parity gates, since they were never touched. Declined ⇒
today's pre-#492 behavior: a separate collection is created, the orphan is left alone (proven live by
`test/figma/binder.mjs`'s `colorprov` gate, still green — it now explicitly asserts the prompt WAS shown
before asserting decline preserved the foreign collection).

**Once resolved — confirmed or declined — the SAME orphan is never re-asked about.** A confirmed adopt
registers the id (the normal path handles it forever after); a decline creates and registers a FRESH
collection under that name (so the orphan-vs-registered check never fires for that name again either).
No separate "have we asked" flag exists or is needed — the registry's own state transition IS the
"once per file" gate the ticket asks for.

**The load-bearing asymmetry a live adoption inherits, unchanged:** the color role-binding loop (§3
above) never prunes — an adopted Color Roles collection's own foreign variables survive. `applyFloatPlans`
(§ below) is a FULL-MIRROR reconciler for whatever it owns — create-or-reuse by name, PRUNE anything not
in the current plan — and adoption changes nothing about that contract; a foreign variable inside an
adopted Geometry/Type Primitives collection does NOT survive the same run that adopts it. The confirm
dialog's copy ("adopt it and upsert into it") is the user's consent to exactly that, for float
collections specifically — `test/figma/binder.mjs`'s `adoptconsent` gate proves both halves (color
survives, float prunes) against the SAME mechanism.

Binder-only: the flagship app-as-plugin's `applyBundle`/`ensureCollection` keep their unmodified TKT-0024
"never adopt a same-named collection" guarantee — #492's root cause and the ADIA Colors scenario are both
specific to the standalone binder; extending adoption to the flagship (which already has its own consent
UI, the apply gate) is a separate, not-yet-scoped decision.

### 4. Role-table parity — the generated copy (owned by `adding-semantic-roles`)

The Figma VM can't `import` the `.mjs`, so the binder's `roleTable(n)` is a **second copy** of
`semanticRoles(n)` baked into `code.js` — since TKT-0019, GENERATED (`scripts/gen-figma-binder-code.mjs`
splices `semanticRoles()`'s function body verbatim between `// === GENERATED:ROLE_TABLE ===` markers at
`npm test`/`npm run build` time), not hand-typed. Never hand-edit inside those markers. The pure,
importable source of truth is `figma/binder/bind-plan.mjs`, which imports `semanticRoles` + `refKey` from
`src/engine/semantic.js` and exposes:

- `bindingTargets(names)` → de-duped, sorted set of every `"{n}/{refKey(ref)}"` target the binder aliases.
- `bindingPlan(names)` → one `{semanticVar, lightTarget, darkTarget}` per (palette, role), length
  **`rolesPerPalette` × palette names** (owned by `docs/reference/data/role-table.json` — 59 at the time
  of writing; 8 default palettes).

The `parity` gate (`test/figma/binder.mjs`) loads `roleTable` straight out of `code.js` (strips the
top-level `main();` call, evals via `new Function`) and, per default palette, deep-equal-compares its FULL
role objects — `{key, suffix, light, dark}`, in ORDER — against `src/engine/semantic.js`'s `semanticRoles(n)`
(TKT-0027; widened from a derived-ref-name-set diff, which could miss a `key`/`suffix` typo that still
pointed at the right ref). Since roleTable is now generated (TKT-0019), this gate is mostly a TRIPWIRE
proving the splice ran and landed correctly (a stale build or a hand-edit inside the GENERATED markers) —
but a full-object, in-order compare is still the right shape for that tripwire: a row count mismatch
flags as loudly as a drifted ref or a corrupted `key`/`suffix`. A role addition is still an
`adding-semantic-roles` task (edit `semantic.js`, then regenerate — this skill does not re-own that
procedure), and a slip is no longer silent either way.
The separate `bindings` gate checks something different: that `bindingTargets(NAMES)` never names a raw
target outside the canonical raw-colors name set (no dangling `"{n}/50"`), and that `bindingPlan`'s length
is `rolesPerPalette` × palette names. (Its summary line — `checked N binding targets vs M canonical
raw-colors names` — is expected to show targets < canonical: the binder only aliases the stops referenced
by roles, a subset of all raw stops.) `role-table.json`'s own identity with `semantic.js` (also full-object)
is the THIRD leg, checked by `refs-canonical` in `test/engine/semantic.mjs` — together the two test files
give transitive full-object identity across all three role-table implementations.

### 5. The app apply path — create, embed, prune, rebuild (read `figma/plugin/code.js#applyBundle`)

`applyBundle(dtcg, opts)` is find-or-create + full-mirror prune:

- builds the `Color Primitives` (one "Value" mode) collection — one COLOR var per stop/scrim — and the
  `Color Roles` (Light/Dark) collection — one COLOR var per role, each mode aliased to the matching raw var.
- **idempotent**: a second run finds-and-updates in place; it never makes duplicate collections, vars, or
  modes (the user re-applies on the same file repeatedly).
- **prune**: any var NOT in the current bundle is removed from BOTH collections (old-format scrims, removed
  palettes) so the file mirrors the generator exactly. Semantic orphans are deleted FIRST (a stale semantic
  var may alias a stale raw var about to be removed). Returns `{raw, semantic, pruned, rebuilt}`.
- **`rebuildSemantic`** (the opt-in Regroup): DELETES + re-creates the `Color Roles` collection so it adopts
  the bundle's canonical order (regular → containers → surfaces → scrims; the verifier asserts the last 7
  vars are scrims). Color Primitives untouched; bindings to the dropped semantic vars detach — *why the
  Regroup gate always warns*.
- **graceful fallback**: each mode value is `lt ? createVariableAlias(lt) : rgbaOf(...)` — if a raw target is
  somehow absent, the role gets the resolved color rather than being left unset. In the default bundle every
  target resolves, so the `cascade` gate proves every mode-value IS an alias to a created raw var; the
  fallback is a safety net, not the normal path.
- **config embedding**: apply writes `serialize(this.doc)` into `figma.root` pluginData under
  `CONFIG_KEY = "ultimate-tokens-config"`. This is the source-of-truth round-trip — the exact
  hue/chroma/skew/lift travels IN the `.fig`, so a re-read reproduces the state losslessly, not
  approximately from the colors.
- **pluginData is namespaced PER PLUGIN ID** — so when the plugin id changed to `ultimate-tokens`, every
  key written under the old id became unreachable. There is no read path to them, which is why no
  `LEGACY_CONFIG_KEY` fallback exists (a former `"hct-config"` fallback was removed with the id change).
  A pre-rename file therefore opens as a clean empty config, never a stale one — gated in `test/figma/plugin.mjs`.

### 5b. Every busy flag needs a guaranteed reset path on every branch (#454)

The bridge's outer `catch (e)` in `code.js`'s `figma.ui.onmessage` is the last line of defense for any
request/reply pair that gates a UI-side busy flag (`_applyBusy`/`sweepBusy`, …): if the sandbox handler
throws AFTER receipt, the catch is the only place left that can still post the reply the UI is waiting
on to clear its flag. `apply` has always had this carve-out (`apply-error`); `sweep-scan`/`sweep-delete`
didn't until #454 — a throwing scan/delete only `figma.notify`d, so `sweepBusy` never cleared and the
Settings Cleanup panel's Scan/Delete buttons stayed disabled for the rest of the session. **Rule: adding
a new request type that sets a busy flag on receipt means adding its carve-out in the SAME catch** —
post the empty/zero shape the success reply would have sent (`sweep-scanned {texts:[],paints:[]}`,
`sweep-done {removed:0}`), not just a notify. Verified by `test/figma/plugin.mjs`'s `sweep` gate (forces
the throw via a mock/getter, asserts the reply still posts). Left open at #454: whether `_applyBusy` also
wants a timeout fallback for a reply that never arrives at all (a frame detach mid-apply) — narrower,
since `code.js` already always answers `apply` either way.

### 6. The consent gate (grep `src/ui/app.js`)

`requestApplyToFigma(rebuild)` → if a normal apply is already consented (a versioned localStorage key,
`ultimate-tokens-apply-consent-v1`, via `_applyConsented()`), apply immediately; otherwise open
`renderApplyGate()` — a *back up your file first* road-block. Normal apply is cookieable ("don't show again"
→ `_setApplyConsent()`); the destructive **Regroup** always re-warns — `renderApplyGate` renders the checkbox
as `rebuild ? false : <checkbox>`, and `confirmApplyGate` only persists consent when `!rebuild`. `applyToFigma`
posts the `apply` message; `_syncApplyGate` reconciles the `<dialog>`. This is a deliberate Figma review gate
(explicit awareness before modifying the file) + destructive-overwrite protection (same-named vars get
overwritten, re-skinning bound components; Regroup detaches bound layers).

### 7. The config round-trip OUT of variables

When a file has no embedded config (or to seed a new set), `configFromVariables(liveVars)`
(`src/ui/model.mjs`, exported there) recovers each family's 500 hue + chroma from the live raw vars — the
APPROXIMATE fallback (it cannot reverse-derive skew/lift/overrides; that is why the embedded config is the
real source of truth). The drift diff is fed by `read-variables` → `variables-read` → `receiveLiveVariables`,
which reads the live Color Primitives values back as `#RRGGBB(AA)` hexes. Geometry uses a separate path:
`geomTokensFigma(scale)` (`src/engine/geometry.mjs`) returns `{ Geometry: { size, radius, space } }` — a
`Geometry` collection of Figma NUMBER (FLOAT) variables, emitted as `dimension.variables.json`, independent
of the color cascade.