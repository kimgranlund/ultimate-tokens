// code.js — Ultimate Tokens, Figma plugin SANDBOX (the `main`).
//
// Runs in Figma's plugin VM: the `figma` global is available, but there is NO DOM, no
// fetch/XMLHttpRequest/WebSocket, no localStorage (ADR-010 / AC-P3 — offline by design;
// manifest networkAccess is "none"). The generator UI runs in the iframe (ui.html); this
// file only (a) opens that UI and (b) on an "apply" message turns the posted DTCG bundle
// into two Figma variable COLLECTIONS:
//
//   Color Primitives  (mode "Value")        — one COLOR var per stop/scrim, the concrete colors
//   Color Roles         (one mode per THEME) — one COLOR var per role, each mode ALIASED to the
//                                        raw var named by the leaf's com.figma.aliasData
//                                        (the live raw→semantic cascade native import can't do)
//
// The bundle comes from the UI's figmaBundle() = exportDTCG(state, { rawColl:"Color Primitives" }),
// so this file is palette-agnostic: it walks the tree, it does NOT hard-code the role table — and
// (TKT-0021) it does NOT hard-code the theme axis either. exportDTCG emits one "{name}_tokens.json"
// per theme (default: Light + Dark, from semantic.js's DEFAULT_THEMES), each tagged with its Figma
// mode name via $extensions["com.figma.modeName"]; applyBundle below walks WHATEVER theme files the
// bundle carries — 2 today, N once a doc's theme axis is configurable — and creates exactly that
// many Color Roles modes, in the bundle's own order. A 2-theme bundle still produces byte-
// identical Light/Dark output; nothing here assumes there are exactly two.

const RAW_COLLECTION = "Color Primitives";   // the raw color primitives (one "Value" mode) — the DEFAULT name
const SEMANTIC_COLLECTION = "Color Roles"; // the semantic Light/Dark tokens — the DEFAULT name (#491; was "Color Semantic", "Color Modes")
// COLL — the ACTIVE color-collection names. Settings › Token mapping can override the defaults
// (doc.figmaCollections); the apply message carries the override and sets these before any write, and
// readRawColors resolves them from the SAVED config so a renamed file still round-trips at boot. An
// override applies to the collections the next apply touches — an existing collection under the old
// name is left as-is (the apply gate's same-name-overwrite warning covers the semantics).
var COLL = { raw: RAW_COLLECTION, semantic: SEMANTIC_COLLECTION };
function setCollectionNames(c) {
  COLL.raw = c && typeof c.raw === "string" && c.raw.trim() ? c.raw.trim() : RAW_COLLECTION;
  COLL.semantic = c && typeof c.semantic === "string" && c.semantic.trim() ? c.semantic.trim() : SEMANTIC_COLLECTION;
}

figma.showUI(__html__, { width: 1440, height: 900, themeColors: true });
// Tell the UI it is running inside Figma so it reveals its "Apply to Figma" button.
figma.ui.postMessage({ type: "figma-init" });

// CONFIG_KEY — the generator's parametric config, persisted IN this file on the DOCUMENT ROOT via
// setPluginData. This is the "source of truth" round-trip: the exact hue/chroma/skew/lift, global
// controls, AND role overrides — NOT the resolved colors (those are the variables, written by "apply",
// and cannot reverse-derive the params). Root pluginData is saved inside the .fig and TRAVELS WITH THE
// FILE (shared with everyone who opens it), unlike clientStorage which is per-user-machine. So a read
// reproduces the generator's state LOSSLESSLY instead of approximating it from the 500 colors.
const CONFIG_KEY = "ultimate-tokens-config"; // (matches SETS_KEY's `ultimate-tokens-*` naming)
// NOTE — there is no legacy pluginData fallback, and there cannot be one. Figma namespaces
// `root.setPluginData` BY PLUGIN ID, and this plugin's id changed (nonoun-color-tokens ->
// ultimate-tokens) with the product rename: data written under the old id is unreadable by this
// plugin, at any key. Files applied before the rename lose their embedded config (re-import the
// config JSON, or re-apply) and every provenance registry — FLOAT_REGISTRY_KEY, COLOR_REGISTRY_KEY (TKT-0024),
// STYLE_REGISTRY_KEY. STYLES self-heal by name (applyStylePlans looks up a real local style by name FIRST,
// registry second) — a re-key with no data loss. COLLECTIONS do not: ensureCollection/ensureFloatCollection
// match by registry id ONLY (never by name, so a user's own same-named collection is never adopted — the
// whole point of the registry), so a reset registry makes the next apply mint a fresh, SEPARATE collection
// rather than re-adopting the pre-rename one — nothing is deleted or corrupted, but the old collection is
// orphaned (unmanaged) until a user manually removes it. Rare in practice: a plugin id change is a one-off,
// deliberate event, not a routine upgrade.

// SETS_KEY — the gallery's "Your Palettes" sets, persisted in figma.clientStorage (PER-USER, survives
// across plugin sessions). The plugin UI iframe has an opaque origin, so its localStorage is blocked /
// non-persistent; clientStorage is the sanctioned per-user store. (Mirrors the browser's localStorage
// key `ultimate-tokens-sets`, so the same gallery data model round-trips in both environments.)
const SETS_KEY = "ultimate-tokens-sets";

// FLOAT_REGISTRY_KEY — the PROVENANCE registry for the breakpoint-moded Type/Geometry collections, a
// name→collectionId map stored in root pluginData (travels with the .fig, like CONFIG_KEY). applyFloatPlans
// reconciles/prunes ONLY a collection we created (matched by id), so a user's OWN pre-existing collection
// named "Typography"/"Geometry" is never canonicalized or pruned — we make a separate one instead.
const FLOAT_REGISTRY_KEY = "ultimate-tokens-float-collections";
// COLOR_REGISTRY_KEY — TKT-0024: the SAME provenance discipline, back-ported to Color Primitives / Color
// Semantic. Before this, ensureCollection adopted ANY same-named collection by NAME alone — a user's own
// collection literally called "Color Primitives"/"Color Roles" got silently adopted and mutated on the
// next Apply, the exact failure class FLOAT_REGISTRY_KEY already closed for Type/Geometry (#155). Same
// shape: name→collectionId, travels with the .fig; applyBundle reconciles/prunes ONLY a collection it
// created (matched by id). A collection this registry doesn't yet know about — including one this SAME
// plugin created before this fix shipped — is now treated as foreign and gets its own separate collection;
// nothing existing is ever deleted, so a pre-fix file just needs its normal next Apply to re-converge.
const COLOR_REGISTRY_KEY = "ultimate-tokens-color-collections";

// writeConfig / readConfig — the file-embedded parametric config (root pluginData is a string store;
// getPluginData returns "" when unset). JSON-encoded; a corrupt value reads back as null, never throws.
function writeConfig(config) { figma.root.setPluginData(CONFIG_KEY, JSON.stringify(config)); }
function readConfig() {
  const raw = figma.root.getPluginData(CONFIG_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; } // NB: param required — Figma's plugin VM rejects optional catch binding (ES2019)
}
// readFloatRegistry / writeFloatRegistry — the {name: collectionId} provenance map (see FLOAT_REGISTRY_KEY).
function readFloatRegistry() {
  const raw = figma.root.getPluginData(FLOAT_REGISTRY_KEY);
  if (!raw) return {};
  try { const r = JSON.parse(raw); return r && typeof r === "object" ? r : {}; } catch (e) { return {}; }
}
function writeFloatRegistry(reg) { figma.root.setPluginData(FLOAT_REGISTRY_KEY, JSON.stringify(reg)); }
// readColorRegistry / writeColorRegistry — the {name: collectionId} provenance map (see COLOR_REGISTRY_KEY).
function readColorRegistry() {
  const raw = figma.root.getPluginData(COLOR_REGISTRY_KEY);
  if (!raw) return {};
  try { const r = JSON.parse(raw); return r && typeof r === "object" ? r : {}; } catch (e) { return {}; }
}
function writeColorRegistry(reg) { figma.root.setPluginData(COLOR_REGISTRY_KEY, JSON.stringify(reg)); }

// ACTIONS — each request mapped to a human action, so a failure reads as "couldn't <do X>" instead of a
// raw developer error (Figma policy: never surface raw error text / stack traces to users).
const ACTIONS = {
  apply: "apply the variables",
  "save-config": "save the palette set",
  "load-config": "load the palette set",
  "read-variables": "read this file's variables",
  "read-float-variables": "read this file's geometry/type variables",
  "list-fonts": "read Figma's font list",
  "load-sets": "load your palettes",
  "save-sets": "save your palettes",
  "sweep-scan": "scan for legacy styles",
  "sweep-delete": "remove the selected legacy styles",
};

figma.ui.onmessage = async (msg) => {
  if (!msg) return;
  try {
    if (msg.type === "apply") {
      // the Settings-overridable color-collection names ride the message; set BEFORE any write.
      setCollectionNames(msg.collections);
      // `dtcg` is OMITTED when the Color system is toggled off in the UI — skip the color collections
      // entirely (the existing ones are left untouched, not pruned). Type/Geometry filtering happens UI-side.
      const r = msg.dtcg ? await applyBundle(msg.dtcg, { rebuildSemantic: !!msg.rebuildSemantic, renames: msg.renames && msg.renames.color }) : null;
      // Embed the exact params in the file ALONGSIDE the variables, so a later read round-trips
      // losslessly (the variables alone can only seed an approximate hue/chroma).
      if (msg.config) writeConfig(msg.config);
      // Type + Geometry breakpoint-moded FLOAT collections (UI-computed, pre-validated apply plans). Isolated
      // in its OWN try so a float-apply failure can't mask the color apply that already succeeded above — the
      // user still gets the color result (+ a console error), and a re-apply (idempotent) converges the rest.
      // #495 "published library" mode: msg.libraryMode is undefined unless a future UI explicitly sets
      // it (no apply-gate.js toggle exists yet — out of THIS ticket's scope, documented in the #495
      // Findings) — undefined falls through to applyFloatPlans/applyFontPrimitivesModes' OWN
      // confirmLibraryMode() dialog, asked only if there's actually something at stake for this apply.
      let fr = null;
      if (Array.isArray(msg.floatPlans) && msg.floatPlans.length) {
        try { fr = await applyFloatPlans(msg.floatPlans, { libraryMode: msg.libraryMode }); }
        catch (e) { console.error("[Ultimate Tokens] type/geometry apply failed:", e); }
      }
      // STYLES (opt-out): paint + text styles bound to the variables just applied. Own try — a styles
      // failure never masks the variable apply that already succeeded.
      let sr = null;
      if (msg.stylePlans && ((msg.stylePlans.paints || []).length || (msg.stylePlans.texts || []).length)) {
        try {
          if (msg.fontPrimitivesModes) await applyFontPrimitivesModes(msg.fontPrimitivesModes, { libraryMode: msg.libraryMode });
          sr = await applyStylePlans(msg.stylePlans);
        } catch (e) { console.error("[Ultimate Tokens] styles apply failed:", e); }
      }
      const parts = [];
      if (r) parts.push(`${r.raw} primitives + ${r.semantic} semantic variables (${(r.themeNames || []).join(" / ")})` + (r.rebuilt ? ", regrouped" : "") + (r.pruned ? `, ${r.pruned} stale pruned` : ""));
      if (fr && fr.collections) parts.push(`${fr.variables} type/geometry variable${fr.variables === 1 ? "" : "s"} across ${fr.collections} collection${fr.collections === 1 ? "" : "s"}`);
      if (sr && (sr.paints || sr.texts)) parts.push(`${sr.paints + sr.texts} style${sr.paints + sr.texts === 1 ? "" : "s"} (${sr.paints} color · ${sr.texts} text)` + (sr.pruned ? `, ${sr.pruned} stale pruned` : ""));
      if (sr && sr.substitutedFonts && sr.substitutedFonts.length) figma.notify(`${sr.substituted} text style(s) use a placeholder face — install to see them as designed: ${sr.substitutedFonts.slice(0, 3).join(", ")}${sr.substitutedFonts.length > 3 ? "…" : ""}`, { timeout: 6000 });
      if (sr && sr.missingFonts && sr.missingFonts.length) figma.notify(`Some text styles were skipped — no usable font: ${sr.missingFonts.slice(0, 3).join(", ")}${sr.missingFonts.length > 3 ? "…" : ""}`, { timeout: 6000 });
      figma.notify(parts.length ? "Applied " + parts.join(" · ") : "Nothing to apply — every system is toggled off.");
      // Signal the iframe UI that the async write actually COMPLETED (its optimistic "Applying…" toast alone
      // can't know when the sandbox finishes) → onApplyDone shows a real "Applied N…" toast + closes the gate.
      figma.ui.postMessage({ type: "apply-done", raw: r ? r.raw : 0, semantic: r ? r.semantic : 0, floatVars: fr ? fr.variables : 0, floatCollections: fr ? fr.collections : 0, paintStyles: sr ? sr.paints : 0, textStyles: sr ? sr.texts : 0, missingFonts: sr && sr.missingFonts ? sr.missingFonts : [], substitutedFonts: sr && sr.substitutedFonts ? sr.substitutedFonts : [], substituted: sr ? sr.substituted : 0 });
    } else if (msg.type === "save-config") {
      writeConfig(msg.config);
      figma.notify("Palette set saved into this file");
    } else if (msg.type === "load-config") {
      const config = readConfig();
      figma.ui.postMessage({ type: "config-loaded", config });
      if (!config) figma.notify("No saved palette set in this file");
    } else if (msg.type === "list-fonts") {
      // the UI asks which font FAMILIES this Figma can actually use, so the Fonts panel can mark a
      // family that will be substituted (see applyStylePlans' scaffold path). Families only — the
      // face list is large and the panel needs presence, not weights.
      var fams = {};
      for (const f of await figma.listAvailableFontsAsync()) { const fn = f.fontName || f; fams[fn.family] = 1; }
      figma.ui.postMessage({ type: "fonts-listed", families: Object.keys(fams) });
    } else if (msg.type === "read-variables") {
      const live = await readRawColors(); // read-only reference for the drift diff
      figma.ui.postMessage({ type: "variables-read", found: live.found, raw: live.raw });
      if (!live.found) figma.notify('No "Color Primitives" collection in this file yet');
    } else if (msg.type === "read-float-variables") {
      const live = await readFloatVariables(); // read-only reference for the pre-apply changed-value count
      figma.ui.postMessage({ type: "float-variables-read", breakpoints: live.breakpoints, fontPrimitives: live.fontPrimitives });
    } else if (msg.type === "load-sets") {
      // the gallery's saved sets, from this user's clientStorage (null on first run).
      const sets = await figma.clientStorage.getAsync(SETS_KEY);
      figma.ui.postMessage({ type: "sets-loaded", sets: sets || null });
    } else if (msg.type === "save-sets") {
      // persist the gallery's sets for this user (the localStorage the iframe can't use).
      await figma.clientStorage.setAsync(SETS_KEY, Array.isArray(msg.sets) ? msg.sets : []);
    } else if (msg.type === "sweep-scan") {
      // SCAN only — never deletes. The UI sends the names the CURRENT plan would produce; anything real
      // in this file that looks like ours but isn't in that set is a candidate for the user to review.
      const localTexts = await figma.getLocalTextStylesAsync();
      const localPaints = await figma.getLocalPaintStylesAsync();
      const cand = sweepCandidates(msg.textNames, msg.paintNames, localTexts, localPaints);
      figma.ui.postMessage({ type: "sweep-scanned", texts: cand.texts, paints: cand.paints });
    } else if (msg.type === "sweep-delete") {
      // DELETE only the exact ids the user confirmed — no pattern-matching here, so a scan's false
      // positive can never compound into an unreviewed deletion.
      const ids = Array.isArray(msg.ids) ? msg.ids : [];
      let removed = 0;
      for (const id of ids) {
        try { const st = await figma.getStyleByIdAsync(id); if (st) { st.remove(); removed++; } } catch (e) { /* already gone */ }
      }
      figma.ui.postMessage({ type: "sweep-done", removed: removed });
    }
  } catch (e) {
    // Log the technical detail to the console for debugging; show the user a friendly, actionable
    // message naming what was attempted (never the raw error / stack).
    console.error("[Ultimate Tokens] '" + (msg && msg.type) + "' failed:", e);
    // Tell the iframe an apply FAILED so it can clear its optimistic "Applying…" toast (→ onApplyError).
    // RULE: every in-flight busy flag (`_applyBusy`, `sweepBusy`, …) needs a guaranteed reset path on
    // EVERY branch, including a sandbox-side throw here — a request type with no reply on this path
    // wedges its UI flag for the rest of the session (the sweep bug, #454). Add a carve-out below for
    // any new request/reply pair that gates a busy flag.
    if (msg && msg.type === "apply") { try { figma.ui.postMessage({ type: "apply-error" }); } catch (e2) { /* UI gone */ } }
    else if (msg && msg.type === "sweep-scan") { try { figma.ui.postMessage({ type: "sweep-scanned", texts: [], paints: [] }); } catch (e2) { /* UI gone */ } }
    else if (msg && msg.type === "sweep-delete") { try { figma.ui.postMessage({ type: "sweep-done", removed: 0 }); } catch (e2) { /* UI gone */ } }
    const what = (msg && ACTIONS[msg.type]) || "complete that action";
    figma.notify("Ultimate Tokens couldn't " + what + ". Please try again — if it keeps happening, open an issue at github.com/kimgranlund/ultimate-tokens.", { error: true });
  }
};

// ── helpers ───────────────────────────────────────────────────────────────────
// rgbaOf — a DTCG color leaf's $value → Figma's {r,g,b,a} (components are already 0..1).
function rgbaOf(leaf) {
  const c = (leaf && leaf.$value) || leaf;
  const k = c.components;
  return { r: k[0], g: k[1], b: k[2], a: typeof c.alpha === "number" ? c.alpha : 1 };
}
// childKeys — a DTCG group's token children (skip $type/$value/$extensions).
const childKeys = (tree) => Object.keys(tree).filter((k) => k[0] !== "$");
// aliasTarget — the raw var name a semantic leaf points at (set when rawColl was on).
function aliasTarget(leaf) {
  const ad = leaf && leaf.$extensions && leaf.$extensions["com.figma.aliasData"];
  return ad ? ad.targetVariableName : null;
}
// ensureCollection — OUR managed Color Primitives / Color Roles collection for `name`, by PROVENANCE
// (the registry's stored id), creating + registering it if absent. TKT-0024: this used to adopt ANY
// same-named collection found by getLocalVariableCollectionsAsync().find(c => c.name === name) — including
// a user's own hand-built collection that happens to share the name — mutating it on the next Apply. Now it
// NEVER adopts a same-named collection it didn't create, mirroring ensureFloatCollection below exactly: a
// user manual-rename survives (we track id, not name); a user-deleted one is re-created; a foreign
// same-named collection is left alone and we make a separate one instead. `reg` is mutated in place; the
// caller persists it once via writeColorRegistry.
async function ensureCollection(name, reg, renameFrom) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const known = reg[name] && cols.find((c) => c.id === reg[name]);
  if (known) return known;
  for (const old of (Array.isArray(renameFrom) ? renameFrom : [])) {
    const prev = reg[old] && cols.find((c) => c.id === reg[old]);
    if (prev) {
      prev.name = name;
      reg[name] = prev.id;
      delete reg[old];
      return prev;
    }
  }
  const made = figma.variables.createVariableCollection(name);
  reg[name] = made.id;
  return made;
}
// ensureFloatCollection — the SAME pattern (see ensureCollection above), for OUR managed Type/Geometry
// collection: PROVENANCE (the registry's stored id), creating + registering it if absent. It NEVER adopts a
// same-named collection it didn't create — so applyFloatPlans' rename/prune can't ever hit a user's own
// "Typography"/"Geometry". A user manual-rename survives (we track id, not name); a user-deleted one is
// re-created. `reg` is mutated in place; the caller persists it once via writeFloatRegistry.
async function ensureFloatCollection(name, reg, renameFrom) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const known = reg[name] && cols.find((c) => c.id === reg[name]);
  if (known) return known;
  for (const old of (Array.isArray(renameFrom) ? renameFrom : [])) {
    const prev = reg[old] && cols.find((c) => c.id === reg[old]);
    if (prev) {
      prev.name = name;
      reg[name] = prev.id;
      delete reg[old];
      return prev;
    }
  }
  const made = figma.variables.createVariableCollection(name);
  reg[name] = made.id;
  return made;
}
// rgbaToHex — a Figma color value {r,g,b,a} (0..1) -> "#RRGGBB" (or "#RRGGBBAA" when a < 1),
// matching the generator's emitted hex form so a live value can be diffed against generated.
function rgbaToHex(c) {
  const h = (x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, "0").toUpperCase();
  const base = "#" + h(c.r) + h(c.g) + h(c.b);
  return typeof c.a === "number" && c.a < 1 ? base + h(c.a) : base;
}

// readRawColors — the live Color Primitives variable values, as { "{n}/{key}": "#RRGGBB(AA)" }. Read-only
// reference for the drift diff (NO reverse-derive of params — colors only). Returns {} if absent.
async function readRawColors() {
  // resolve a possibly-renamed raw collection from the SAVED config (boot's read-variables arrives
  // before the UI knows the doc), falling back to the active/default name.
  var rawName = COLL.raw;
  try {
    const cfg = readConfig();
    if (cfg && cfg.figmaCollections && typeof cfg.figmaCollections.raw === "string" && cfg.figmaCollections.raw.trim()) rawName = cfg.figmaCollections.raw.trim();
  } catch (e) { /* unreadable config → default name */ }
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  // PROVENANCE FIRST (see ensureCollection) — resolve OUR raw collection by the registry id; name is only
  // a fallback for the read-only diff (harmless here — reading never mutates — but the registry id is
  // still the correct signal when a foreign same-named collection also exists in the file).
  const colorReg = readColorRegistry();
  const rawId = colorReg[rawName];
  const raw = (rawId && cols.find((c) => c.id === rawId)) || cols.find((c) => c.name === rawName);
  if (!raw) return { found: false, raw: {} };
  const mode = raw.modes[0].modeId;
  const all = await figma.variables.getLocalVariablesAsync();
  const out = {};
  for (const v of all) {
    if (v.variableCollectionId !== raw.id) continue;
    const val = v.valuesByMode ? v.valuesByMode[mode] : undefined;
    if (val && typeof val.r === "number") out[v.name] = rgbaToHex(val); // skip aliases (no .r)
  }
  return { found: true, raw: out };
}

// readFloatCollection — the live values of a REGISTRY-TRACKED float collection (Geometry/Type
// Primitives), read-only, in a shape directly comparable to a modeApplyPlan/primitivesModesApplyPlan entry:
// { found, modes: [<mode name>, …], values: { "<var name>": { "<mode name>": <value> } } }. Resolved by
// PROVENANCE (FLOAT_REGISTRY_KEY), exactly like ensureFloatCollection — a user's own same-named
// collection this plugin never created is invisible here too (found:false), never adopted for a read.
// An ALIAS value (Type Primitives' font/<voice> vars) has no independently-set value to diff against —
// skipped, matching primitivesModesApplyPlan's own "aliases aren't literals" treatment.
async function readFloatCollection(name, reg) {
  const id = reg[name];
  if (!id) return { found: false, modes: [], values: {} };
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const coll = cols.find((c) => c.id === id);
  if (!coll) return { found: false, modes: [], values: {} };
  const modeName = {};
  for (const m of coll.modes) modeName[m.modeId] = m.name;
  const all = await figma.variables.getLocalVariablesAsync();
  const values = {};
  for (const v of all) {
    if (v.variableCollectionId !== coll.id) continue;
    const byMode = {};
    const vbm = v.valuesByMode || {};
    for (const mid of Object.keys(vbm)) {
      const mn = modeName[mid];
      const val = vbm[mid];
      if (mn === undefined || (val && typeof val === "object" && val.type === "VARIABLE_ALIAS")) continue;
      byMode[mn] = val;
    }
    if (Object.keys(byMode).length) values[v.name] = byMode; // an all-ALIAS variable (e.g. font/<voice>) carries no literal to diff — omit it entirely, not just its modes
  }
  return { found: true, modes: coll.modes.map((m) => m.name), values };
}

// readFloatVariables — the live Geometry + Type Primitives collections together, for the apply
// gate's pre-overwrite diff (collections-arch review C2 / TKT-0020) — the Geometry/Type counterpart to
// readRawColors' color drift reference. Read-only; never reconstructs a scale from the raw numbers.
async function readFloatVariables() {
  const reg = readFloatRegistry();
  return { breakpoints: await readFloatCollection("Geometry", reg), fontPrimitives: await readFloatCollection("Type Primitives", reg) };
}

async function varsByName(collectionId) {
  const all = await figma.variables.getLocalVariablesAsync();
  const m = {};
  for (const v of all) if (v.variableCollectionId === collectionId) m[v.name] = v;
  return m;
}

// ── "published library" mode (#495) — never .remove() a variable from a collection consumed by OTHER
// files (via Figma's library-publish mechanism): a consumer's binding is always by ID, so pruning
// orphans it irrecoverably. MIRRORS figma/binder/mode-apply-plan.mjs's pure planner functions
// (nearestStepByHeight/geometrySizeAliasMap/libraryModeReconcile/valueChanged/libraryModeReport) — hand-
// written here, not imported, because Figma's plugin VM cannot `import` a .mjs at runtime (constraint 2,
// maintaining-figma-plugins). Kept in behavioral lockstep by hand; the SAME inputs must produce the
// SAME outputs as the .mjs source — see test/figma/plugin.mjs's `libraryparity` gate.

// LIBRARY_TYPE_VOICE_MAP — the STATIC old->new Type-voice kebab-segment map (#495's own scope item 3;
// mirrors migrations.mjs's LIBRARY_TYPE_VOICE_MAP, same discipline as SEMANTIC_RENAME_FROM in the
// binder — the VM can't import it). Voices NOT listed here (Body/Display/Lead/Kicker/Sub-heading) need
// no entry: their OLD name is ALREADY byte-identical to a CURRENT voice's kebab segment, so the
// ordinary create-or-reuse-by-name path already covers them without any alias/deprecate involvement.
// "quote" has no entry either — no current counterpart — so it falls straight to DEPRECATE.
const LIBRARY_TYPE_VOICE_MAP = { heading: "headline", ui: "ui-control", caption: "label", legal: "tiny", code: "label-mono" };

// substituteSegment(name, oldSeg, newSeg) — replace an EXACT "/"-delimited path segment (never a
// substring match — "ui" must not touch "ui-control" itself, or a segment that merely CONTAINS "ui").
// Returns the substituted name, or null if `oldSeg` isn't a segment of `name` at all.
function substituteSegment(name, oldSeg, newSeg) {
  const segs = name.split("/");
  let changed = false;
  const out = segs.map((s) => { if (s === oldSeg) { changed = true; return newSeg; } return s; });
  return changed ? out.join("/") : null;
}

// expandVoiceAliasMap(existingNames, voiceMap) — expands the SMALL static voice map into a FULL
// {existingName: aliasTargetName} map, one entry per EXISTING Font/Type Primitives variable whose path
// contains an OLD voice segment — e.g. "font/heading" -> "font/headline", "weight/heading/bold" ->
// "weight/headline/bold". Mirrors mode-apply-plan.mjs#typeVoiceAliasMap's INTENT (not literally
// imported — see the file header above).
function expandVoiceAliasMap(existingNames, voiceMap) {
  const map = {};
  for (const name of existingNames) {
    for (const oldV of Object.keys(voiceMap)) {
      const substituted = substituteSegment(name, oldV, voiceMap[oldV]);
      if (substituted) { map[name] = substituted; break; }
    }
  }
  return map;
}

// nearestStepByHeightVM / expandGeometryAliasMap — mirror mode-apply-plan.mjs#nearestStepByHeight /
// #geometrySizeAliasMap exactly (same algorithm: nearest CURRENT size/ step by height, expanded across
// every per-size FIELD the current plan itself carries — never a hand-typed field list, so a future
// buildSize() field is covered automatically).
function nearestStepByHeightVM(oldHeight, currentStepHeights) {
  let best = null, bestDist = Infinity;
  for (const step of Object.keys(currentStepHeights)) {
    const d = Math.abs(Number(currentStepHeights[step]) - Number(oldHeight));
    if (d < bestDist) { bestDist = d; best = step; }
  }
  return best;
}
// geometryPlanStepHeights(planVariables) — the CURRENT plan's own {step: height} (Base mode) + the full
// per-size FIELD list, derived from its own "size/{step}/{field}" variables — never hand-typed, so a
// future buildSize() field/step is picked up automatically.
function geometryPlanStepHeights(planVariables) {
  const currentStepHeights = {};
  const fieldSet = {};
  for (const v of planVariables) {
    const seg = v.name.split("/");
    if (seg.length !== 3 || seg[0] !== "size") continue;
    fieldSet[seg[2]] = true;
    if (seg[2] === "height") {
      const h = v.values.find((p) => p.mode === "Base") || v.values[0];
      if (h) currentStepHeights[seg[1]] = h.value;
    }
  }
  return { currentStepHeights: currentStepHeights, fields: Object.keys(fieldSet) };
}
// expandGeometryAliasMap(oldStepHeights, currentStepHeights, fields) — mirrors
// mode-apply-plan.mjs#geometrySizeAliasMap exactly: for each OLD step (already reduced to its OWN
// height, read from the LIVE "size/{oldStep}/height" variable by the caller — this function itself
// never touches figma), find the nearest CURRENT step by height, then expand across every FIELD.
function expandGeometryAliasMap(oldStepHeights, currentStepHeights, fields) {
  const map = {};
  for (const oldStep of Object.keys(oldStepHeights)) {
    const nearest = nearestStepByHeightVM(oldStepHeights[oldStep], currentStepHeights);
    if (!nearest) continue;
    for (const field of fields) map["size/" + oldStep + "/" + field] = "size/" + nearest + "/" + field;
  }
  return map;
}

// resolveLiteralHeightVM(name, modeName, liveVarsByName, idToName, maxHops) — mirrors
// mode-apply-plan.mjs#resolveLiteralHeight exactly: chase a possible ALIAS chain (bounded) from `name`'s
// LIVE value at `modeName` to the underlying literal NUMBER a "size/{step}/height" variable ultimately
// carries. Needed because library mode's OWN prior write redirects an old step's height to an ALIAS —
// without this, a SECOND apply can't read a literal off an already-aliased old variable, loses the
// ability to re-derive nearest-by-height for it, and misclassifies a correctly-mapped variable as
// unmapped -> deprecate on every re-apply (a real defect found in review — see the #495 Findings).
function resolveLiteralHeightVM(name, modeName, liveVarsByName, idToName, maxHops) {
  const limit = maxHops == null ? 5 : maxHops;
  let cur = name;
  for (let i = 0; i <= limit; i++) {
    const vals = liveVarsByName && liveVarsByName[cur];
    const v = vals ? vals[modeName] : undefined;
    if (typeof v === "number") return v;
    if (v && typeof v === "object" && v.type === "VARIABLE_ALIAS" && v.id) {
      const next = idToName && idToName[v.id];
      if (!next || next === cur) return null;
      cur = next;
      continue;
    }
    return null;
  }
  return null;
}
// liveAliasTargetsByNameVM(existingNames, modeName, liveVarsByName, idToName) — mirrors
// mode-apply-plan.mjs#liveAliasTargetsByName exactly: for every EXISTING name whose live value at
// `modeName` is CURRENTLY a resolvable VARIABLE_ALIAS, its one-hop target NAME — the "belt" half of the
// idempotency fix libraryReconcile below relies on.
function liveAliasTargetsByNameVM(existingNames, modeName, liveVarsByName, idToName) {
  const out = {};
  for (const name of (existingNames || [])) {
    const vals = liveVarsByName && liveVarsByName[name];
    const v = vals ? vals[modeName] : undefined;
    if (v && typeof v === "object" && v.type === "VARIABLE_ALIAS" && v.id) {
      const target = idToName && idToName[v.id];
      if (target && target !== name) out[name] = target;
    }
  }
  return out;
}

// libraryReconcile(existingNames, wantedNames, aliasMap, liveAliasTargets) — mirrors
// mode-apply-plan.mjs#libraryModeReconcile exactly (including the idempotency fix: a name already
// correctly aliased to its resolved target — from `aliasMap`, or the `liveAliasTargets` fallback when
// the map has no entry — is an omit-entirely no-op, never re-aliased or deprecated on a re-apply).
function libraryReconcile(existingNames, wantedNames, aliasMap, liveAliasTargets) {
  const wanted = {};
  for (const n of wantedNames) wanted[n] = true;
  const toAlias = [];
  const toDeprecate = [];
  for (const name of existingNames.slice().sort()) {
    if (wanted[name]) continue;
    const mapped = aliasMap && Object.prototype.hasOwnProperty.call(aliasMap, name) ? aliasMap[name] : undefined;
    const mappedTarget = mapped && wanted[mapped] ? mapped : undefined;
    const liveTarget = liveAliasTargets && Object.prototype.hasOwnProperty.call(liveAliasTargets, name) ? liveAliasTargets[name] : undefined;
    const liveTargetWanted = liveTarget && wanted[liveTarget] ? liveTarget : undefined;
    const target = mappedTarget || liveTargetWanted;
    if (target) {
      if (liveTarget !== target) toAlias.push({ from: name, to: target });
      // else: already correctly aliased to `target`, live — idempotent no-op, omit entirely.
    } else if (name.indexOf("_deprecated/") !== 0) {
      toDeprecate.push({ from: name, to: "_deprecated/" + name });
    }
  }
  return { toAlias: toAlias, toDeprecate: toDeprecate };
}

// valueChangedVM(liveValuesByModeName, planVar) — mirrors mode-apply-plan.mjs#valueChanged, extended
// (this file's own primitivesModesApplyPlan variables can be ALIAS-typed, which mode-apply-plan.mjs's
// FLOAT_VAR_TYPES never recognizes — see style-plan.mjs's own header comment on why): an ALIAS-typed
// plan variable has no `.values` array, only `.target` — reported as "changed" unconditionally,
// matching the executor's own unconditional every-mode alias write (never skipped for an "unchanged"
// target — the file-header comment on applyFontPrimitivesModes explains why).
function valueChangedVM(liveValuesByModeName, planVar) {
  if (planVar.type === "ALIAS") return true;
  for (const pair of (planVar.values || [])) {
    if (!(pair.mode in (liveValuesByModeName || {}))) return true;
    const live = liveValuesByModeName[pair.mode];
    if (typeof pair.value === "number" || typeof live === "number") { if (Number(live) !== Number(pair.value)) return true; }
    else if (live !== pair.value) return true;
  }
  return false;
}

// readLiveValuesByName(byName, modeId) — the LIVE variables' current values, keyed by NAME then MODE
// NAME (not mode id — the report/reconcile logic compares against the plan's own mode-name-keyed values).
function readLiveValuesByName(byName, modeId) {
  const modeNameOf = {};
  for (const nm of Object.keys(modeId)) modeNameOf[modeId[nm]] = nm;
  const out = {};
  for (const name of Object.keys(byName)) {
    const vr = byName[name];
    const vals = {};
    const vbm = vr.valuesByMode || {};
    for (const mid of Object.keys(vbm)) { const mname = modeNameOf[mid]; if (mname) vals[mname] = vbm[mid]; }
    out[name] = vals;
  }
  return out;
}

// libraryModeReportVM(plan, liveVarsByName, aliasMap, liveAliasTargets) — mirrors
// mode-apply-plan.mjs#libraryModeReport: the FULL rename/add/value-update/alias/deprecate action list for
// ONE collection's plan, computed ONCE so the dry-run report and the real apply (below) can never
// disagree. `liveAliasTargets` (optional) is liveAliasTargetsByNameVM's output, passed straight through
// to libraryReconcile's idempotency check.
function libraryModeReportVM(plan, liveVarsByName, aliasMap, liveAliasTargets) {
  const live = liveVarsByName || {};
  const wantedNames = plan.variables.map((v) => v.name);
  const renamesMap = plan.renames || {};
  const renamed = [];
  const consumedOld = {};
  const effective = {};
  for (const oldName of Object.keys(renamesMap)) {
    const newName = renamesMap[oldName];
    if (oldName in live && !(newName in live)) {
      effective[newName] = live[oldName];
      consumedOld[oldName] = true;
      renamed.push({ from: oldName, to: newName });
    }
  }
  for (const name of Object.keys(live)) {
    if (consumedOld[name] || name in effective) continue;
    effective[name] = live[name];
  }
  const adds = [];
  const valueUpdates = [];
  for (const v of plan.variables) {
    if (!(v.name in effective)) { adds.push(v.name); continue; }
    if (valueChangedVM(effective[v.name], v)) valueUpdates.push(v.name);
  }
  const rec = libraryReconcile(Object.keys(effective), wantedNames, aliasMap || {}, liveAliasTargets);
  return { renames: renamed, adds: adds.sort(), valueUpdates: valueUpdates.sort(), aliases: rec.toAlias, deprecates: rec.toDeprecate };
}

// libraryModeReportText / confirmLibraryMode — the "published library" dry-run gate: a COPYABLE report
// (a <textarea readonly>, per #495's own wording) plus Apply-safe / Remove-as-before buttons, shown
// BEFORE any write. Mirrors confirmAdopt's figma.showUI() pattern (#492, TKT-... same reasons: no
// ui.html file, no manifest change). USED BY: the standalone binder always (it has no persistent app UI
// to disturb); the flagship app-as-plugin ONLY as a fallback when the caller doesn't pass a pre-decided
// opts.libraryMode (see applyFloatPlans/applyFontPrimitivesModes below) — calling figma.showUI() here
// REPLACES the running app's iframe content for the duration of this dialog (figma.showUI can only show
// ONE ui at a time); the caller is responsible for restoring the app's own UI afterward if it cares
// (the flagship's message handler does, immediately after this resolves — see the "apply" branch).
function libraryModeReportText(collectionName, report) {
  const lines = ["Collection: " + collectionName, ""];
  lines.push("Renames (" + report.renames.length + "):");
  for (const r of report.renames) lines.push("  " + r.from + " -> " + r.to);
  lines.push("Adds (" + report.adds.length + "):");
  for (const n of report.adds) lines.push("  " + n);
  lines.push("Value updates (" + report.valueUpdates.length + "):");
  for (const n of report.valueUpdates) lines.push("  " + n);
  lines.push("Aliases — never removed, value redirected (" + report.aliases.length + "):");
  for (const r of report.aliases) lines.push("  " + r.from + " -> " + r.to);
  lines.push("Deprecates — never removed, renamed under _deprecated/ (" + report.deprecates.length + "):");
  for (const r of report.deprecates) lines.push("  " + r.from + " -> " + r.to);
  return lines.join("\n");
}
async function confirmLibraryMode(collectionName, report) {
  const text = libraryModeReportText(collectionName, report);
  const atRisk = report.aliases.length + report.deprecates.length;
  return new Promise((resolve) => {
    let settled = false;
    const settle = (v) => { if (!settled) { settled = true; resolve(v); } };
    figma.on("close", () => settle(false));
    figma.showUI(
      "<style>html,body{height:100%}body{font:12px -apple-system,BlinkMacSystemFont,sans-serif;margin:0;padding:16px;color:#1a1a1a;display:flex;flex-direction:column;box-sizing:border-box}" +
      "p{margin:0 0 10px;line-height:1.5}textarea{flex:1;width:100%;box-sizing:border-box;font:11px ui-monospace,SFMono-Regular,monospace;margin-bottom:12px;border:1px solid #ccc;border-radius:6px;padding:8px;white-space:pre}" +
      "button{font:inherit;padding:7px 14px;border-radius:6px;cursor:pointer;margin-right:8px}" +
      "#library{background:#18A0FB;color:#fff;border:1px solid #18A0FB}#classic{background:#fff;border:1px solid #ccc}</style>" +
      "<p><b>" + escapeHtmlVM(collectionName) + "</b> — this apply would remove " + atRisk + " variable(s) not in the current plan. " +
      "If another file consumes this collection as a published library, removing them breaks those bindings. " +
      "Preserve them (alias mapped names, deprecate the rest — never removed) or remove them as before?</p>" +
      "<textarea readonly>" + escapeHtmlVM(text) + "</textarea>" +
      "<div><button id=\"library\">Preserve (library-safe)</button><button id=\"classic\">Remove (today's behavior)</button></div>" +
      "<script>document.getElementById('library').onclick=()=>parent.postMessage({pluginMessage:{type:'library-mode-confirm',library:true}},'*');" +
      "document.getElementById('classic').onclick=()=>parent.postMessage({pluginMessage:{type:'library-mode-confirm',library:false}},'*');<\/script>",
      { width: 480, height: 420 },
    );
    figma.ui.onmessage = (msg) => {
      if (!msg || msg.type !== "library-mode-confirm") return;
      settle(!!msg.library);
      figma.ui.close();
    };
  });
}
function escapeHtmlVM(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// ── STYLES: Type Primitives + paint/text styles bound to the variables ─────────────────────────
// The UI computes the plans (figma/binder/style-plan.mjs — pure, parity-gated); this executor runs
// them verbatim. Provenance: STYLE_REGISTRY_KEY records the style ids WE created (name → id), so
// pruning can never touch a user's own styles — the float-registry discipline, applied to styles.
const STYLE_REGISTRY_KEY = "ultimate-tokens-styles";
function readStyleRegistry() {
  try {
    const raw = figma.root.getPluginData(STYLE_REGISTRY_KEY);
    const reg = raw ? JSON.parse(raw) : null;
    return reg && typeof reg === "object" ? { paints: reg.paints || {}, texts: reg.texts || {} } : { paints: {}, texts: {} };
  } catch (e) { return { paints: {}, texts: {} }; }
}
function writeStyleRegistry(reg) { figma.root.setPluginData(STYLE_REGISTRY_KEY, JSON.stringify(reg)); }

// applyFontPrimitivesModes — ensures "Type Primitives"
// carries the real Premium/Google-Fonts mode axis (figma.variables' native addMode/setValueForMode —
// the SAME mechanism Geometry already uses) and executes primitivesModesApplyPlan's
// literals-then-aliases plan. Copies (does not call) applyFloatPlans' proven addMode/rename/prune
// scaffolding below — this collection was never threaded through modeApplyPlan (ALIAS isn't a type it
// recognizes), so keeping the scaffolding local here is what keeps mode-apply-plan.mjs/applyFloatPlans
// themselves at zero lines changed. Literals write every mode's own value; aliases resolve their
// target's type for creation, then write createVariableAlias(target) for EVERY mode explicitly — never
// skipped for an unchanged target, which would silently reintroduce the exact "new mode reads as a
// stale copy of the default" bug this feature exists to fix. `plan.renameFrom` (#491, stamped by
// apply-gate.js via applyRenameMigrations — see FIGMA_MIGRATIONS.floats.collections) is threaded into
// ensureFloatCollection exactly like the merged Geometry plan does, so an existing file's "Font
// Primitives" collection renames in place instead of getting a parallel "Type Primitives" one.
async function applyFontPrimitivesModes(plan, opts) {
  opts = opts || {};
  if (!plan || !plan.collection || !Array.isArray(plan.modes) || !plan.modes.length || !Array.isArray(plan.variables) || !plan.variables.length) return null;
  const reg = readFloatRegistry(); // same provenance store as Typography/Geometry (name → collection id)
  const coll = await ensureFloatCollection(plan.collection, reg, plan.renameFrom);
  const defaultId = coll.defaultModeId || coll.modes[0].modeId;
  coll.renameMode(defaultId, plan.defaultMode);
  const findMode = (nm) => coll.modes.find((m) => m.name.toLowerCase() === String(nm).toLowerCase());
  const modeId = {};
  modeId[plan.defaultMode] = defaultId;
  for (const nm of plan.addModes) { const ex = findMode(nm); modeId[nm] = ex ? ex.modeId : coll.addMode(nm); }
  // prune stale modes (e.g. a returning file's old single "Value" mode, once renamed away — never the
  // default, never the last remaining mode).
  const wanted = new Set(plan.modes.map((m) => String(m).toLowerCase()));
  for (const m of coll.modes.slice()) {
    if (m.modeId === defaultId) continue;
    if (!wanted.has(m.name.toLowerCase()) && coll.modes.length > 1) coll.removeMode(m.modeId);
  }
  const byName = await varsByName(coll.id);
  // #495 "published library" mode: snapshot LIVE values + build the Type-voice alias map BEFORE the
  // create/update loop below overwrites anything. idToName + liveAliasTargets: an old voice ALREADY
  // aliased by a prior library-mode apply is recognized as "already correctly mapped" directly off its
  // LIVE value, so a re-apply reports/writes nothing for it instead of churning it to _deprecated/.
  const liveVarsByName = readLiveValuesByName(byName, modeId);
  const idToName = {};
  for (const nm of Object.keys(byName)) idToName[byName[nm].id] = nm;
  const aliasMap = expandVoiceAliasMap(Object.keys(byName), LIBRARY_TYPE_VOICE_MAP);
  const liveAliasTargets = liveAliasTargetsByNameVM(Object.keys(byName), plan.defaultMode, liveVarsByName, idToName);
  const report = libraryModeReportVM(plan, liveVarsByName, aliasMap, liveAliasTargets);

  const current = new Set();
  let count = 0;
  for (const v of plan.variables) {
    if (!v || !v.name) continue;
    if (v.type === "ALIAS") {
      const target = byName[v.target];
      if (!target) continue; // planner guarantees order; a missing target is a malformed plan — skip, never throw
      const vr = byName[v.name] || figma.variables.createVariable(v.name, coll, target.type || "STRING");
      for (const mode of plan.modes) {
        const mid = modeId[mode];
        if (mid != null) vr.setValueForMode(mid, figma.variables.createVariableAlias(target));
      }
      byName[v.name] = vr; current.add(v.name); count++;
    } else {
      const vr = byName[v.name] || figma.variables.createVariable(v.name, coll, v.type || "STRING");
      for (const pair of (v.values || [])) {
        const mid = modeId[pair.mode];
        if (mid != null) vr.setValueForMode(mid, v.type === "FLOAT" ? Number(pair.value) : String(pair.value));
      }
      byName[v.name] = vr; current.add(v.name); count++;
    }
  }
  // #495: NEVER prune when "published library" mode is active — same decision channel as
  // applyFloatPlans below. opts.libraryMode: explicit true/false = pre-decided by the caller. undefined
  // + opts.askIfUndecided: true = ask HERE via confirmLibraryMode (the standalone binder's own main()
  // passes this — it has no persistent UI a mid-apply dialog could disturb). undefined WITHOUT
  // askIfUndecided (the flagship's message handler, today — no apply-gate.js toggle exists yet, out of
  // #495's own scope) = default to classic prune, UNCHANGED from every existing flagship user's current
  // behavior: figma.showUI() can only show ONE ui at a time, so an interactive dialog here would
  // REPLACE the running app's iframe content mid-apply — a real, disruptive cost this ticket does not
  // take on for the flagship without a proper apply-gate-integrated review UI (see confirmLibraryMode's
  // own header comment, and the #495 Findings, for the follow-up this leaves on the table).
  let useLibrary = opts.libraryMode;
  if (useLibrary == null) {
    useLibrary = (opts.askIfUndecided && (report.aliases.length || report.deprecates.length)) ? await confirmLibraryMode(plan.collection, report) : false;
  }
  if (useLibrary) {
    for (const r of report.aliases) {
      const vr = byName[r.from];
      const target = byName[r.to];
      if (!vr || !target) continue;
      for (const mode of plan.modes) { const mid = modeId[mode]; if (mid != null) vr.setValueForMode(mid, figma.variables.createVariableAlias(target)); }
    }
    for (const r of report.deprecates) {
      const vr = byName[r.from];
      if (vr && !byName[r.to]) { vr.name = r.to; byName[r.to] = vr; delete byName[r.from]; }
    }
  } else {
    for (const name of Object.keys(byName)) if (!current.has(name)) byName[name].remove();
  }
  writeFloatRegistry(reg);
  return { variables: count, libraryReport: { collection: plan.collection, libraryMode: !!useLibrary, renames: report.renames, adds: report.adds, valueUpdates: report.valueUpdates, aliases: useLibrary ? report.aliases : [], deprecates: useLibrary ? report.deprecates : [], removed: useLibrary ? [] : report.deprecates.map((r) => r.from).concat(report.aliases.map((r) => r.from)) } };
}

// resolveFace — pick a REAL face for {family, weight, styleName?} from Figma's actual font list
// (listAvailableFontsAsync), never guess-and-catch: the kit's styleName wins when it exists; else the
// style whose NAME-implied weight is nearest the requested weight (upright faces preferred over
// italics; "Regular" wins ties at equal distance via the name table's order). Returns the style
// string, or null when the family is not available in this Figma at all (the caller reports it).
const STYLE_NAME_WEIGHTS = [
  ["thin", 100], ["hairline", 100], ["extralight", 200], ["extra light", 200], ["ultralight", 200], ["ultra light", 200],
  ["light", 300], ["regular", 400], ["normal", 400], ["book", 400], ["medium", 500],
  ["semibold", 600], ["semi bold", 600], ["demibold", 600], ["demi bold", 600],
  ["extrabold", 800], ["extra bold", 800], ["ultrabold", 800], ["ultra bold", 800],
  ["bold", 700], ["black", 900], ["heavy", 900],
];
function styleNameWeight(style) {
  const s = String(style).toLowerCase();
  for (const pair of STYLE_NAME_WEIGHTS) if (s.indexOf(pair[0]) >= 0) return pair[1];
  // variable fonts often name their named instances by the raw wght value ("350", "Text 550",
  // "Weight 800") instead of a word — Figma exposes NO axis/variable-font metadata at all
  // (listAvailableFontsAsync returns only {family, style} strings), so a numeric instance name is
  // the only other signal available. Parse an embedded 1–1000 integer (the valid CSS wght range)
  // before falling back to Regular — without this every numerically-named style in a family
  // resolved as "equally close to 400" and picked the first one arbitrarily, silently wrong.
  const m = s.match(/\b([1-9]\d{0,2}|1000)\b/);
  if (m) return Number(m[1]);
  return 400; // an unnamed, unnumbered cut reads as the family's regular
}
// pickFallbackFamily — when the kit's family is absent from this Figma, the style still gets BUILT:
// a loadable placeholder face carries the metrics while `fontFamily`/`fontStyle` stay BOUND to the
// Type Primitives variables that carry the TRUE family. Figma resolves a text style's family from the
// bound variable, so the style self-heals the moment the real font is installed. Prefer Figma's own
// default (Inter), then Roboto, then any family — a substitution is reported, never silent.
function pickFallbackFamily(fontsByFamily) {
  for (const pref of ["Inter", "Roboto"]) if (fontsByFamily[pref] && fontsByFamily[pref].length) return pref;
  for (const fam of Object.keys(fontsByFamily)) if (fontsByFamily[fam] && fontsByFamily[fam].length) return fam;
  return null;
}

// normalizeStyleName — lowercase + strip EVERY hyphen/space entirely (not just collapse to one), so
// "Extra-bold", "Extra Bold", AND "ExtraBold" all compare equal. Real type foundries don't agree on a
// separator convention for compound weight names — this kit's own WEIGHT_NAMES uses a hyphen
// ("Extra-bold"), but real font catalogs use a space (GT America's "Extra Bold") OR run the words
// together with no separator at all (New Caledonia's "SemiBold") — a real, live gap: collapsing to a
// single space (the previous fix) matched the space convention but NOT the concatenated one, so
// "Semi-bold" never matched a real "SemiBold" cut. An exact-string match alone silently missed the
// real face and fell back to the nearest-weight guess, which doesn't even preserve italic.
function normalizeStyleName(s) { return String(s).toLowerCase().replace(/[-\s]+/g, ""); }

function resolveFace(stylesOfFamily, literal) {
  if (!stylesOfFamily || !stylesOfFamily.length) return null;
  const wanted = literal && typeof literal.styleName === "string" ? literal.styleName : "";
  if (wanted) {
    if (stylesOfFamily.indexOf(wanted) >= 0) return wanted;
    const wantedNorm = normalizeStyleName(wanted);
    const fuzzy = stylesOfFamily.find(function (st) { return normalizeStyleName(st) === wantedNorm; });
    if (fuzzy) return fuzzy;
  }
  const w = literal && Number.isFinite(literal.weight) ? literal.weight : 400;
  const upright = stylesOfFamily.filter(function (st) { return !/italic|oblique/i.test(st); });
  const pool = upright.length ? upright : stylesOfFamily;
  // a real font's own weight ladder often has GAPS this kit's 9-step ladder doesn't (GT America has no
  // Extra-bold cut at all; its Bold/Black sit exactly ±100 either side of a wanted 800) — a tie is a
  // REAL, expected outcome, not an edge case. Break it towards the HEAVIER real weight, deterministically
  // (never Figma's own listAvailableFontsAsync array order, which a plugin can't rely on or predict).
  let best = pool[0], bestD = Infinity, bestW = styleNameWeight(pool[0]);
  for (const st of pool) {
    const w2 = styleNameWeight(st);
    const d = Math.abs(w2 - w);
    if (d < bestD || (d === bestD && w2 > bestW)) { best = st; bestD = d; bestW = w2; }
  }
  return best;
}

// sweepCandidates — find real Figma styles that LOOK like ours (their top "/" segment matches a
// namespace the CURRENT plan still uses) but whose full name ISN'T anything the current plan would ever
// produce — leftover styles from an older naming generation that predates this plugin's own per-style
// registry, so no ordinary apply/prune can ever find them (the registry only tracks styles IT created).
// Pure + read-only: it never deletes anything itself — the caller reviews the list and deletes by id.
// Namespace-gated (not "anything unrecognized") so a user's own unrelated styles are never candidates —
// only names that start with a prefix WE currently use, e.g. "Body/…", are ever considered.
function sweepCandidates(knownTextNames, knownPaintNames, localTexts, localPaints) {
  const textSet = new Set(knownTextNames || []);
  const paintSet = new Set(knownPaintNames || []);
  const namespaces = new Set();
  for (const n of textSet) namespaces.add(String(n).split("/")[0]);
  for (const n of paintSet) namespaces.add(String(n).split("/")[0]);
  const isOurs = function (name) { return namespaces.has(String(name).split("/")[0]); };
  const texts = (localTexts || []).filter(function (s) { return isOurs(s.name) && !textSet.has(s.name); }).map(function (s) { return { id: s.id, name: s.name }; });
  const paints = (localPaints || []).filter(function (s) { return isOurs(s.name) && !paintSet.has(s.name); }).map(function (s) { return { id: s.id, name: s.name }; });
  return { texts: texts, paints: paints };
}

// applyStylePlans — paint styles bound to the Color Roles variables; text styles set from the plan's
// literals then BOUND per field to the Geometry (type/) / Type Primitives variables where the target exists
// (per-field graceful fallback: an absent variable or an unsupported binding leaves the literal value).
// lineHeight/letterSpacing stay LITERAL PERCENT in v1 — the type/ vars carry them as % of size,
// and a FLOAT binding on those fields reads as px, which would mis-set them.
async function applyStylePlans(sp) {
  const out = { paints: 0, texts: 0, pruned: 0, missingVars: 0 };
  // TKT-0012 — id-preserving STYLE renames: re-key the provenance registry and rename the live style
  // object BEFORE reconcile, so a renamed style is adopted instead of pruned+recreated (bindings and
  // any team-library publish identity survive). sp.renames = { paints: {old:new}, texts: {old:new} }.
  const spRenames = (sp && sp.renames) || {};
  const regEarly = readStyleRegistry();
  for (const kind of ["paints", "texts"]) {
    for (const oldName of Object.keys(spRenames[kind] || {})) {
      const newName = spRenames[kind][oldName];
      if (regEarly[kind][oldName] && !regEarly[kind][newName]) {
        try {
          const st = await figma.getStyleByIdAsync(regEarly[kind][oldName]);
          if (st) st.name = newName;
        } catch (e) { /* style gone — the re-key below still retires the old registry slot */ }
        regEarly[kind][newName] = regEarly[kind][oldName];
        delete regEarly[kind][oldName];
      }
    }
  }
  writeStyleRegistry(regEarly);
  const reg = readStyleRegistry();

  // ── paint styles → Color Roles variables ──
  const paints = Array.isArray(sp.paints) ? sp.paints : [];
  if (paints.length) {
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    // PROVENANCE FIRST (see ensureCollection/COLOR_REGISTRY_KEY) — resolve OUR Color Roles by the
    // registry id, falling back to name: a name-only find could bind these paint styles to a foreign
    // same-named collection's variables instead of ours.
    const colorReg = readColorRegistry();
    const semId = colorReg[COLL.semantic];
    const sem = (semId && cols.find(function (c) { return c.id === semId; })) || cols.find(function (c) { return c.name === COLL.semantic; });
    const semVars = sem ? await varsByName(sem.id) : {};
    const local = await figma.getLocalPaintStylesAsync();
    const byName = {};
    for (const st of local) byName[st.name] = st;
    const current = {};
    for (const p of paints) {
      const variable = semVars[p.varName];
      if (!variable) { out.missingVars++; continue; }
      let st = byName[p.name];
      if (!st && reg.paints[p.name]) { try { st = await figma.getStyleByIdAsync(reg.paints[p.name]); } catch (e) { st = null; } }
      if (!st) st = figma.createPaintStyle();
      st.name = p.name;
      st.paints = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 1 }, "color", variable)];
      current[p.name] = st.id; out.paints++;
    }
    for (const name of Object.keys(reg.paints)) {
      if (current[name]) continue;
      try { const st = await figma.getStyleByIdAsync(reg.paints[name]); if (st) { st.remove(); out.pruned++; } } catch (e) { /* already gone */ }
    }
    reg.paints = current;
  }

  // ── text styles → Geometry (type/) + Type Primitives variables ──
  const texts = Array.isArray(sp.texts) ? sp.texts : [];
  if (texts.length) {
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    // PROVENANCE FIRST: resolve OUR collections by the float-registry id (name → id map written by
    // ensureFloatCollection), falling back to name. A name-only find can hit a foreign same-named
    // collection (or miss after a user rename) — then every typo binding silently degrades to the
    // literal, which reads as "the props are hardcoded".
    const floatReg = readFloatRegistry();
    const byRegistry = function (name) {
      const id = floatReg[name];
      return (id && cols.find(function (c) { return c.id === id; })) || cols.find(function (c) { return c.name === name; });
    };
    // the METRIC pool (fontSize/lineHeight/letterSpacing/paragraphSpacing) lives in the merged
    // "Geometry" collection's type/ group (TKT-0009 merge; ADR-016 rename) — the plan's bind
    // keys carry the type/ prefix.
    const typoColl = byRegistry("Geometry");
    const primColl = byRegistry("Type Primitives");
    const typoVars = typoColl ? await varsByName(typoColl.id) : {};
    const primVars = primColl ? await varsByName(primColl.id) : {};
    const local = await figma.getLocalTextStylesAsync();
    const byName = {};
    for (const st of local) byName[st.name] = st;
    // the REAL font list, once: family → its available style strings. Faces are resolved from this
    // (nearest name-implied weight), never guessed-and-caught — a wrong guess used to abandon a
    // freshly-created style at Figma's defaults (Inter Regular 12).
    const fontsByFamily = {};
    try {
      for (const f of await figma.listAvailableFontsAsync()) {
        const fn = f.fontName || f;
        if (!fontsByFamily[fn.family]) fontsByFamily[fn.family] = [];
        fontsByFamily[fn.family].push(fn.style);
      }
    } catch (e) { console.error("[Ultimate Tokens] couldn't list fonts:", e); }
    out.missingFonts = [];      // families with NO usable face at all (style skipped)
    out.substitutedFonts = [];  // families absent from this Figma (style BUILT on a placeholder face)
    out.substituted = 0;
    const fallbackFamily = pickFallbackFamily(fontsByFamily);
    const current = {};
    for (const t of texts) {
      const lit = t.literal || {};
      if (!lit.family || !Number.isFinite(lit.size)) continue;
      // resolve the kit's OWN face first; fall back to a loadable placeholder (the bound fontFamily
      // variable still carries the true family, so intent survives and self-heals on install).
      let useFamily = lit.family;
      let face = resolveFace(fontsByFamily[lit.family], lit);
      let didSubstitute = false;
      if (!face && fallbackFamily) {
        useFamily = fallbackFamily;
        face = resolveFace(fontsByFamily[fallbackFamily], lit);
        didSubstitute = true;
      }
      if (!face) { if (out.missingFonts.indexOf(lit.family) < 0) out.missingFonts.push(lit.family); continue; }
      try { await figma.loadFontAsync({ family: useFamily, style: face }); }
      catch (e) { if (out.missingFonts.indexOf(lit.family) < 0) out.missingFonts.push(lit.family); continue; }
      if (didSubstitute) {
        if (out.substitutedFonts.indexOf(lit.family) < 0) out.substitutedFonts.push(lit.family);
        out.substituted++;
      }
      // ONLY after the face is loaded: find-or-create + name + mutate (a load failure must never
      // create or reset a style).
      let st = byName[t.name];
      if (!st && reg.texts[t.name]) { try { st = await figma.getStyleByIdAsync(reg.texts[t.name]); } catch (e) { st = null; } }
      if (!st) st = figma.createTextStyle();
      st.name = t.name;
      st.fontName = { family: useFamily, style: face };
      st.fontSize = lit.size;
      // PIXELS, not PERCENT — a Figma-bound percent FLOAT displays as a bare, unit-less number in Figma's
      // own Properties panel (indistinguishable from a pixel value at a glance); an absolute pixel reads
      // unambiguously there instead.
      if (Number.isFinite(lit.lineHeight)) st.lineHeight = { unit: "PIXELS", value: lit.lineHeight };
      if (Number.isFinite(lit.letterSpacing)) st.letterSpacing = { unit: "PIXELS", value: lit.letterSpacing };
      if (Number.isFinite(lit.paragraphSpacing)) st.paragraphSpacing = lit.paragraphSpacing;
      try { st.textCase = lit.textCase === "uppercase" ? "UPPER" : "ORIGINAL"; } catch (e) { /* older API */ }
      // per-field bindings — only where the target variable exists; an unsupported field falls back to
      // the literal already set above.
      const bind = t.bind || {};
      const bindField = function (field, pool) {
        const target = bind[field] && pool[bind[field]];
        if (!target) return;
        try { st.setBoundVariable(field, target); } catch (e) { /* field not bindable in this API — literal stands */ }
      };
      bindField("fontSize", typoVars);
      // leading/tracking: the PIXELS literals above set the unit context; the bound FLOAT carries the
      // same pixel number (the type/ group emits lineHeight/letterSpacing in pixels too — see
      // typeTokensFigmaModes).
      bindField("lineHeight", typoVars);
      bindField("letterSpacing", typoVars);
      bindField("paragraphSpacing", typoVars);
      bindField("fontFamily", primVars);
      bindField("fontStyle", primVars);
      bindField("fontWeight", primVars);
      // fontStyle/fontWeight are MUTUALLY EXCLUSIVE per plan (see style-plan.mjs) — but a REUSED style
      // object (found by name across re-applies) can carry a STALE bind from an earlier apply where the
      // OTHER field of the pair was the one in play (e.g. a voice gains a custom styleName later, while
      // its Figma style name coincidentally stays the same — names are relative ranks now, not literal
      // weight names, so this collision is real, not hypothetical). bindField only ever ADDS a binding,
      // never clears one the current plan omits, so explicitly unbind whichever of the pair the CURRENT
      // plan does not carry — or Figma's own "closest valid weight" snap on a stale fontWeight binding
      // could still silently override a freshly-bound fontStyle's precise named cut.
      if (!bind.fontStyle) { try { st.setBoundVariable("fontStyle", null); } catch (e) { /* nothing was bound, or unsupported */ } }
      if (!bind.fontWeight) { try { st.setBoundVariable("fontWeight", null); } catch (e) { /* nothing was bound, or unsupported */ } }
      current[t.name] = st.id; out.texts++;
    }
    for (const name of Object.keys(reg.texts)) {
      if (current[name]) continue;
      try { const st = await figma.getStyleByIdAsync(reg.texts[name]); if (st) { st.remove(); out.pruned++; } } catch (e) { /* already gone */ }
    }
    reg.texts = current;
    // diagnostics — the console is the debugging surface (figma.notify races and truncates):
    if (out.substitutedFonts.length) console.warn("[Ultimate Tokens]", out.substituted, "text style(s) built on a placeholder face — these families are not in this Figma:", out.substitutedFonts.join(", "), "· their fontFamily stays BOUND to the Type Primitives variable, so installing the font adopts it.");
    if (out.missingFonts.length) console.warn("[Ultimate Tokens] text styles skipped — no usable face at all:", out.missingFonts.join(", "), "(font list size:", Object.keys(fontsByFamily).length, "families)");
    if (!Object.keys(typoVars).length) console.warn("[Ultimate Tokens] Geometry collection empty/missing at styles time — fontSize/leading/tracking bindings degraded to literals");
    if (!Object.keys(primVars).length) console.warn("[Ultimate Tokens] Type Primitives collection empty/missing at styles time — family/weight bindings degraded to literals");
  }

  writeStyleRegistry(reg);
  return out;
}

// ── the apply ───────────────────────────────────────────────────────────────────
// opts.rebuildSemantic — the opt-in "Regroup": delete the existing Color Roles collection so it is
// re-created fresh and adopts the bundle's (canonical, grouped) variable order. Figma keeps an
// existing variable's position on update, so a normal apply never reorders; only a fresh collection
// does. Color Primitives are untouched; bindings to the dropped Color Roles variables detach.
// TKT-0012 — id-preserving rename pass: `renames` = { "<old>": "<new>" } applied to a varsByName pool
// BEFORE the reconcile loop, so a renamed variable is adopted (v.name =) instead of pruned+recreated
// (which would orphan every consumer binding). Skipped when the new name already exists.
function renameInPool(pool, renames) {
  for (const oldName of Object.keys(renames || {})) {
    const newName = renames[oldName];
    if (pool[oldName] && !pool[newName]) {
      pool[oldName].name = newName;
      pool[newName] = pool[oldName];
      delete pool[oldName];
    }
  }
}
// leafEntries — flatten a DTCG (sub)tree to [path, leaf] pairs, path segments joined "/". A LEAF is a
// node with $value; anything else non-$-keyed is a GROUP to recurse (ADR-016 nested the raw scrims
// under "{n}/scrim/{step}", so the raw tree is no longer uniformly two levels deep).
function leafEntries(node, prefix) {
  const out = [];
  for (const key of childKeys(node)) {
    const child = node[key];
    const path = prefix ? prefix + "/" + key : key;
    if (child && typeof child === "object" && "$value" in child) out.push([path, child]);
    else if (child && typeof child === "object") out.push.apply(out, leafEntries(child, path));
  }
  return out;
}
async function applyBundle(dtcg, opts) {
  opts = opts || {};
  const renames = opts.renames || {};
  const collectionRenames = renames.collections || {};
  const rawTree = dtcg && dtcg["palette.tokens.json"];
  if (!rawTree) throw new Error("bundle missing palette.tokens.json");
  // theme files — every OTHER top-level entry in the bundle, each carrying its Figma mode NAME via
  // $extensions["com.figma.modeName"] (exportDTCG's figmaMode()). TKT-0021: this used to hardcode
  // exactly "Light_tokens.json"/"Dark_tokens.json"; now it walks WHATEVER theme files the bundle
  // carries, in the bundle's own order (object key order === exportDTCG's `themes` order), so a
  // 2-theme (Light/Dark) doc still produces exactly today's two modes, in the same order, and a
  // longer theme axis needs no change here.
  const themeEntries = Object.keys(dtcg)
    .filter((k) => k !== "palette.tokens.json")
    .map((k) => dtcg[k])
    .filter((f) => f && f.$extensions && typeof f.$extensions["com.figma.modeName"] === "string");
  if (!themeEntries.length) throw new Error("bundle has no theme files (e.g. Light_tokens.json/Dark_tokens.json)");
  const themeNames = themeEntries.map((f) => f.$extensions["com.figma.modeName"]);

  const reg = readColorRegistry(); // provenance: only ever touch a collection this plugin created (see ensureCollection)

  // 1) RAW collection — single "Value" mode, one COLOR var per stop/scrim.
  const raw = await ensureCollection(COLL.raw, reg, collectionRenames[COLL.raw]);
  raw.renameMode(raw.modes[0].modeId, "Value");
  const rawMode = raw.modes[0].modeId;
  const rawByName = await varsByName(raw.id);
  renameInPool(rawByName, renames.raw);
  const currentRaw = new Set(); // names this bundle WANTS in Color Primitives — everything else is stale
  let rawCount = 0;
  for (const [name, leaf] of leafEntries(rawTree, "")) {
    const v = rawByName[name] || figma.variables.createVariable(name, raw, "COLOR");
    v.setValueForMode(rawMode, rgbaOf(leaf));
    rawByName[name] = v;
    currentRaw.add(name);
    rawCount++;
  }

  // 2) SEMANTIC collection — one mode per THEME (TKT-0021: N-way, not a hardcoded Light+Dark pair),
  // each role ALIASED to its raw var. Regroup: drop the existing Color Roles collection first so
  // the rebuild creates every variable fresh, in the bundle's canonical order (regular · containers ·
  // surfaces · scrims).
  let rebuilt = false;
  if (opts.rebuildSemantic) {
    // PROVENANCE, not name: only OUR registry-tracked Color Roles (under its current name or a
    // renameFrom key still pending re-key) is ever dropped — never a foreign same-named collection.
    const cols0 = await figma.variables.getLocalVariableCollectionsAsync();
    const oldKeys = [COLL.semantic].concat(Array.isArray(collectionRenames[COLL.semantic]) ? collectionRenames[COLL.semantic] : []);
    let oldId = null;
    for (const k of oldKeys) { if (reg[k]) { oldId = reg[k]; break; } }
    const old = oldId && cols0.find((c) => c.id === oldId);
    if (old) { old.remove(); rebuilt = true; }
    for (const k of oldKeys) delete reg[k];
  }
  const sem = await ensureCollection(COLL.semantic, reg, collectionRenames[COLL.semantic]);
  // the collection's DEFAULT mode (Figma rejects removing it) is renamed to the FIRST theme; the rest
  // are added-or-reused BY NAME (mirrors applyFloatPlans' generic mode reconciliation, below) — never
  // assumes exactly two.
  const firstModeId = sem.modes[0].modeId;
  sem.renameMode(firstModeId, themeNames[0]);
  // Object.create(null)/Map/Set, not {}/plain-object membership — a data-driven theme NAME (unlike
  // the engine's own controlled palette/role names elsewhere in this file) could collide with an
  // inherited Object.prototype key ("constructor", "toString", …) and read back truthy/defined.
  const modeIdByName = Object.create(null);
  modeIdByName[themeNames[0]] = firstModeId;
  const findSemMode = (nm) => sem.modes.find((m) => m.name === nm);
  for (let i = 1; i < themeNames.length; i++) {
    const nm = themeNames[i];
    const ex = findSemMode(nm);
    modeIdByName[nm] = ex ? ex.modeId : sem.addMode(nm);
  }
  // prune stale theme modes (a theme the doc no longer carries) — never the collection's default
  // mode (just renamed above, always in wantedModes), never the last remaining mode.
  const wantedModes = new Set(themeNames);
  for (const m of sem.modes.slice()) {
    if (m.modeId === firstModeId) continue;
    if (!wantedModes.has(m.name) && sem.modes.length > 1) sem.removeMode(m.modeId);
  }

  const semByName = await varsByName(sem.id);
  renameInPool(semByName, renames.semantic);
  const currentSem = new Set(); // names this bundle WANTS in Color Roles — everything else is stale
  let semCount = 0;
  // leaves per theme, indexed by variable name — every theme file shares one name set (exportDTCG
  // derives them all off the identical palette/role walk), so the FIRST theme's key order is the
  // bundle's canonical creation order for every theme.
  const leavesByTheme = themeEntries.map((f) => {
    const m = {};
    for (const [name, leaf] of leafEntries(f, "")) m[name] = leaf;
    return m;
  });
  for (const name of Object.keys(leavesByTheme[0])) {
    const v = semByName[name] || figma.variables.createVariable(name, sem, "COLOR");
    for (let i = 0; i < themeNames.length; i++) {
      const leaf = leavesByTheme[i][name];
      const rv = leaf && rawByName[aliasTarget(leaf)];
      // Alias to the raw var (the cascade). Fall back to the resolved color if the raw
      // target is somehow absent, so a role is never left unset.
      v.setValueForMode(modeIdByName[themeNames[i]], rv ? figma.variables.createVariableAlias(rv) : rgbaOf(leaf));
    }
    semByName[name] = v;
    currentSem.add(name);
    semCount++;
  }

  // 3) PRUNE orphans — make each GENERATED collection mirror the current bundle exactly, so a
  // scrim-model/format change or a removed/renamed/disabled palette can't leave stale variables
  // behind (e.g. the old base-index scrims 250-*/500-0..6/750-*). Scoped to these two generated
  // collections ONLY: rawByName/semByName are filtered by collection id (varsByName), so no other
  // collection is ever touched. Delete SEMANTIC orphans first — a stale semantic var may alias a
  // stale raw var we then remove, whereas every CURRENT semantic var aliases a CURRENT (kept) raw
  // var, so no live alias is broken.
  let pruned = 0;
  for (const name of Object.keys(semByName)) {
    if (!currentSem.has(name)) { semByName[name].remove(); pruned++; }
  }
  for (const name of Object.keys(rawByName)) {
    if (!currentRaw.has(name)) { rawByName[name].remove(); pruned++; }
  }

  writeColorRegistry(reg); // persist the name→id provenance map (any newly-created collections)
  return { raw: rawCount, semantic: semCount, pruned: pruned, rebuilt: rebuilt, themeNames: themeNames };
}

// ── the breakpoint-moded FLOAT apply (Type / Geometry) ────────────────────────────
// applyFloatPlans — execute the UI-computed apply PLANS that figma/binder/mode-apply-plan.mjs produces
// (one entry per collection: { collection, modes, defaultMode:"Base", addModes, variables:[{name,type,
// values:[{mode,value}]}] }). The plan is pure DATA the UI already ran validateModeInterchange + ordering
// over, so this file stays a thin EXECUTOR — there is no planner to inline or parity-gate (unlike the color
// cascade, which mirrors a role table). It mirrors the operation sequence documented in that module's header.
// Idempotent: collections, modes, and variables are reconciled BY NAME and stale ones pruned, so re-applying
// after a breakpoint/voice change converges the file to exactly the current plan (never doubling, never
// leaving a removed breakpoint's mode behind). Value-complete plans mean no mode is ever left unset.
async function applyFloatPlans(plans, opts) {
  opts = opts || {};
  let collections = 0, variables = 0;
  const libraryReports = [];
  const reg = readFloatRegistry(); // provenance: only ever touch a collection this plugin created (see ensureFloatCollection)
  for (const plan of (Array.isArray(plans) ? plans : [])) {
    if (!plan || !plan.collection || !Array.isArray(plan.modes) || !plan.modes.length) continue;
    const coll = await ensureFloatCollection(plan.collection, reg, plan.renameFrom);
    // The collection's DEFAULT mode (Figma rejects removing it) — rename it to the plan's first mode ("Base");
    // the rest are added (or reused) by NAME. Anchor on `defaultModeId`, not modes[0]: for a plugin-created
    // collection they coincide, but a foreign same-named collection's default may not be the first mode, and
    // pruning it would throw. (The headless mock has no defaultModeId → falls back to modes[0].)
    const defaultId = coll.defaultModeId || coll.modes[0].modeId;
    coll.renameMode(defaultId, plan.defaultMode);
    const findMode = (nm) => coll.modes.find((m) => m.name.toLowerCase() === String(nm).toLowerCase());
    const modeId = {};
    modeId[plan.defaultMode] = defaultId;
    for (const nm of plan.addModes) { const ex = findMode(nm); modeId[nm] = ex ? ex.modeId : coll.addMode(nm); }
    // prune stale modes (a breakpoint the user removed) — never the default, never the last remaining mode.
    const wanted = new Set(plan.modes.map((m) => String(m).toLowerCase()));
    for (const m of coll.modes.slice()) {
      if (m.modeId === defaultId) continue;
      if (!wanted.has(m.name.toLowerCase()) && coll.modes.length > 1) coll.removeMode(m.modeId);
    }
    // variables: create-or-reuse by name; write every mode's value; prune orphans scoped to THIS collection.
    const byName = await varsByName(coll.id);
    for (const [oldName, newName] of Object.entries(plan.renames || {})) {
      if (byName[oldName] && !byName[newName]) {
        byName[oldName].name = newName;
        byName[newName] = byName[oldName];
        delete byName[oldName];
      }
    }
    // #495 "published library" mode: snapshot LIVE values + build the alias map BEFORE the create/
    // update loop below overwrites anything — the dry-run report needs the value the file ACTUALLY had.
    // The Geometry collection carries BOTH the type/ half (TKT-0009 merge — an OLD-voice-named
    // "type/heading/md/size" needs the SAME Type-voice map Font/Type Primitives uses) and the size/
    // half (needs its OWN nearest-by-height map) — the combined alias map is the union of both,
    // applied only to the family (type/ or size/) each existing name actually belongs to.
    const liveVarsByName = readLiveValuesByName(byName, modeId);
    const existingNames = Object.keys(byName);
    // idToName + liveAliasTargets: an old type/ or size/ variable ALREADY aliased by a prior library-mode
    // apply has no literal value left to derive a fresh mapping from — resolveLiteralHeightVM below
    // chases the alias chain back to a literal for the height-derivation path, and liveAliasTargets is
    // the belt (recognizes "already correctly aliased to a wanted name" directly off LIVE state) so a
    // re-apply reports/writes nothing for it instead of churning it to _deprecated/ on every apply.
    const idToName = {};
    for (const nm of existingNames) idToName[byName[nm].id] = nm;
    const combinedAliasMap = expandVoiceAliasMap(existingNames.filter((n) => n.indexOf("type/") === 0), LIBRARY_TYPE_VOICE_MAP);
    const sizeGeo = geometryPlanStepHeights(plan.variables);
    if (Object.keys(sizeGeo.currentStepHeights).length) {
      const oldStepHeights = {};
      for (const name of existingNames) {
        const seg = name.split("/");
        if (seg.length === 3 && seg[0] === "size" && seg[2] === "height" && !(seg[1] in sizeGeo.currentStepHeights)) {
          const val = resolveLiteralHeightVM(name, plan.defaultMode, liveVarsByName, idToName);
          if (typeof val === "number") oldStepHeights[seg[1]] = val;
        }
      }
      Object.assign(combinedAliasMap, expandGeometryAliasMap(oldStepHeights, sizeGeo.currentStepHeights, sizeGeo.fields));
    }
    const liveAliasTargets = liveAliasTargetsByNameVM(existingNames, plan.defaultMode, liveVarsByName, idToName);
    const report = libraryModeReportVM(plan, liveVarsByName, combinedAliasMap, liveAliasTargets);

    const current = new Set();
    for (const v of plan.variables) {
      const vr = byName[v.name] || figma.variables.createVariable(v.name, coll, v.type || "FLOAT");
      for (const pair of v.values) {
        const mid = modeId[pair.mode];
        if (mid != null && Number.isFinite(Number(pair.value))) vr.setValueForMode(mid, Number(pair.value));
      }
      byName[v.name] = vr; current.add(v.name); variables++;
    }
    // #495: NEVER prune when "published library" mode is active for this apply — alias mapped names
    // (redirect the value, keep the id), deprecate the rest (id-preserving rename under "_deprecated/").
    // See applyFontPrimitivesModes' matching block above for the FULL decision-channel rationale:
    // opts.libraryMode explicit true/false wins; undefined + opts.askIfUndecided asks interactively
    // (the standalone binder's main() only); undefined alone (the flagship, today) defaults to classic
    // prune — unchanged behavior, no mid-apply UI disruption, until a proper apply-gate toggle exists.
    let useLibrary = opts.libraryMode;
    if (useLibrary == null) {
      useLibrary = (opts.askIfUndecided && (report.aliases.length || report.deprecates.length)) ? await confirmLibraryMode(plan.collection, report) : false;
    }
    if (useLibrary) {
      for (const r of report.aliases) {
        const vr = byName[r.from];
        const target = byName[r.to];
        if (!vr || !target) continue;
        for (const mode of plan.modes) { const mid = modeId[mode]; if (mid != null) vr.setValueForMode(mid, figma.variables.createVariableAlias(target)); }
      }
      for (const r of report.deprecates) {
        const vr = byName[r.from];
        if (vr && !byName[r.to]) { vr.name = r.to; byName[r.to] = vr; delete byName[r.from]; }
      }
    } else {
      for (const name of Object.keys(byName)) if (!current.has(name)) byName[name].remove();
    }
    libraryReports.push({ collection: plan.collection, libraryMode: !!useLibrary, renames: report.renames, adds: report.adds, valueUpdates: report.valueUpdates, aliases: useLibrary ? report.aliases : [], deprecates: useLibrary ? report.deprecates : [], removed: useLibrary ? [] : report.deprecates.map((r) => r.from).concat(report.aliases.map((r) => r.from)) });
    // retire — collections THIS plan supersedes (plan.retire; TKT-0009: the pre-merge "Typography"
    // moded collection, now folded into "Geometry" as the type/ group): registry-tracked ONLY
    // (provenance — never a user's own same-named collection), removed with their variables. Styles
    // re-bind to the merged targets in the SAME apply run (applyStylePlans executes after this).
    for (const nm of (Array.isArray(plan.retire) ? plan.retire : [])) {
      if (!reg[nm]) continue;
      const cols = await figma.variables.getLocalVariableCollectionsAsync();
      const stale = cols.find((c) => c.id === reg[nm]);
      if (stale) stale.remove();
      delete reg[nm];
    }
    collections++;
  }
  writeFloatRegistry(reg); // persist the name→id provenance map (any newly-created collections)
  return { collections: collections, variables: variables, libraryReports: libraryReports };
}

// Exposed for the headless verifier (a no-op inside Figma's VM).
if (typeof module !== "undefined") module.exports = { applyBundle, applyFloatPlans, applyFontPrimitivesModes, applyStylePlans, resolveFace, pickFallbackFamily, styleNameWeight, rgbaOf, aliasTarget, childKeys, sweepCandidates };
