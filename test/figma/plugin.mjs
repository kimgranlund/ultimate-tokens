#!/usr/bin/env node
// verify.mjs, the figma-plugin-app validation adapter (CRITIC side).
// Gates the generator-as-Figma-plugin without Figma: manifest shape + offline, code.js
// parses + uses no network APIs, ui.html carries the generator + the bridge, AND the
// load-bearing contract, model.figmaBundle() fed to code.applyBundle() (on a MOCK figma)
// builds a Color Primitives collection + a Color Roles (Light/Dark) collection in which EVERY
// semantic var, in BOTH modes, is aliased to a raw var that was actually created.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { figmaBundle, defaultDocument } from "../../src/ui/model.mjs";
import * as TYPE from "../../src/engine/type.mjs";
import * as GEOM from "../../src/engine/geometry.mjs";
import { exportDTCG } from "../../src/engine/exports.js";
import { modeApplyPlan, mergeModeInterchanges, libraryModeReconcile, libraryModeReport, valueChanged, nearestStepByHeight, geometrySizeAliasMap, resolveLiteralHeight, liveAliasTargetsByName, priorLibraryUplift, pruneCandidates, parseOldTypeStepName, typeStepAliasMap, typeWeightAliasMap, TYPE_STEP_FIELD_MAP } from "../../figma/binder/mode-apply-plan.mjs";
import { stylePlans, primitivesModesApplyPlan } from "../../figma/binder/style-plan.mjs";
import { LIBRARY_TYPE_VOICE_MAP, GEOMETRY_FIELD_RENAME_MAP } from "../../figma/binder/migrations.mjs";
import { googleSafeFontFor } from "../../src/engine/font-fallbacks.mjs";
import { gateReport } from "../gate-report.mjs";

// stateOfDefault, a minimal engine State over role-table.json's default palettes, for building a
// custom-themes DTCG bundle directly (figmaBundle() itself takes no themes option, TKT-0021
// generalizes the engine/bind/apply axis; a per-doc UI control for extra themes is a later ticket).
function stateOfDefault() {
  const RT = JSON.parse(readFileSync(new URL("../../docs/reference/data/role-table.json", import.meta.url), "utf8"));
  return { palettes: RT.defaults.map((p) => ({ ...p, on: true })), curve: "logistic", tension: 0, lmin: 5, lmax: 100, damp: 80, hueSpace: "cam16" };
}

const HERE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "figma", "plugin"); // the generator-as-plugin lives in figma/plugin/
const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };

// ── manifest: the plugin shape + offline (AC-P3) ────────────────────────────────
const mani = JSON.parse(readFileSync(`${HERE}/manifest.json`, "utf8"));
if (mani.main !== "code.js") FAIL("manifest", `main=${mani.main}, want code.js`);
if (mani.ui !== "ui.html") FAIL("manifest", `ui=${mani.ui}, want ui.html`);
if (!Array.isArray(mani.editorType) || !mani.editorType.includes("figma")) FAIL("manifest", "editorType must include 'figma'");
const na = mani.networkAccess;
const offline = na === "none" || (na && Array.isArray(na.allowedDomains) && na.allowedDomains.length === 1 && na.allowedDomains[0] === "none");
if (!offline) FAIL("manifest", "networkAccess must be 'none', the plugin is offline by design (AC-P3)");

// ── code.js: parses + uses no network / dynamic-import APIs ──────────────────────
const code = readFileSync(`${HERE}/code.js`, "utf8");
const codeNoComments = code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""); // ignore the comment that NAMES these
if (/\bfetch\s*\(|new\s+(XMLHttpRequest|WebSocket)|\bimport\s*\(/.test(codeNoComments)) FAIL("offline", "code.js calls a network or dynamic-import API");

// Figma's plugin VM (jsvm-cpp) is NOT modern V8: optional catch binding (ES2019, `catch {`
// with no param) PARSE-fails there, yet loads fine in Node, so this verifier's own
// new Function() load below can't catch it (real incident 2026-06-17: the whole plugin failed
// to run with "Syntax error: Unexpected token {"). Guard it statically. Write `catch (e) {`.
if (/\bcatch\s*\{/.test(codeNoComments)) FAIL("vmsyntax", "code.js uses optional catch binding (`catch {`), Figma's plugin VM rejects it; use `catch (e) {`");

// ── compliance: no RAW developer error surfaced to users, no stale product branding ─────────────
// Figma policy rejects plugins that show raw error text / stack traces. The catch must notify a
// friendly, handled message (technical detail goes to console.error, not figma.notify).
if (/figma\.notify\([^;]*\b(?:e\.message|String\(e\)|err\.message|\.stack)\b/.test(codeNoComments))
  FAIL("compliance", "code.js surfaces a raw error in figma.notify, show a friendly message; log the detail to console only");
if (/figma\.notify\([^;]*HCT/.test(codeNoComments))
  FAIL("compliance", "a user-facing figma.notify still says 'HCT' (stale branding), the product is 'Ultimate Tokens'");

// ── ui.html: the generator + the Figma bridge ───────────────────────────────────
if (!existsSync(`${HERE}/ui.html`)) FAIL("ui", "ui.html not generated, run gen-ui.mjs");
else {
  const ui = readFileSync(`${HERE}/ui.html`, "utf8");
  if (!ui.includes("<ultimate-tokens>")) FAIL("ui", "ui.html does not embed the generator (<ultimate-tokens>)");
  if (!/figma-init/.test(ui) || !/pluginMessage/.test(ui) || !/figmaBundle/.test(ui))
    FAIL("ui", "ui.html missing the bridge (figma-init listener / pluginMessage / figmaBundle())");
  if (!/config-loaded/.test(ui) || !/applyLoadedConfig/.test(ui))
    FAIL("ui", "ui.html missing the config round-trip bridge (config-loaded → applyLoadedConfig)");
  if (!/variables-read/.test(ui) || !/receiveLiveVariables/.test(ui))
    FAIL("ui", "ui.html missing the drift-diff bridge (variables-read → receiveLiveVariables)");
  if (!/float-variables-read/.test(ui) || !/receiveLiveFloatVariables/.test(ui))
    FAIL("ui", "ui.html missing the TKT-0020 Geometry/Type drift-diff bridge (float-variables-read → receiveLiveFloatVariables)");
}

// ── a mock figma: in-memory collections + variables ─────────────────────────────
function mockFigma() {
  const collections = [], variables = [];
  let id = 0;
  const figma = {
    // ── #632 adoption-confirm UI mock ── confirmAdopt() calls showUI() then synchronously assigns
    // figma.ui.onmessage; the queued microtask below fires AFTER that assignment (JS microtask
    // ordering), so it always reaches the dialog's own handler. `_adoptAnswer` (default false, DECLINE,
    // the conservative default so every existing test keeps seeing today's unchanged behaviour) is read
    // fresh per call. `_showUICalls` counts ADOPTION prompts only, detected from the posted-message type
    // embedded in the html, so restoreAppUI's re-show of the app bundle is not miscounted as a prompt.
    _adoptAnswer: false,
    _showUICalls: 0,
    _restoreCalls: 0,
    _configAtRestore: null,
    _onClose: null,
    on(event, cb) { if (event === "close") this._onClose = cb; },
    showUI(html) {
      if (typeof html !== "string" || html.indexOf("adopt-confirm") === -1) {
        // the app bundle, not a dialog: this is a BOOT (module top) or a restoreAppUI REBOOT. Record what
        // the file's embedded config reads as right now, because that is exactly what the freshly booted
        // app would load back (#632 MAJOR-1), a real iframe the mock cannot otherwise model.
        this._restoreCalls++;
        this._configAtRestore = this.root.getPluginData("ultimate-tokens-config");
        return;
      }
      this._showUICalls++;
      const answer = this._adoptAnswer;
      Promise.resolve().then(() => {
        if (answer === "close") { if (this._onClose) this._onClose(); return; }
        if (this.ui.onmessage) this.ui.onmessage({ type: "adopt-confirm", adopt: answer });
      });
    },
    // #689: record every notify() call (message + opts) so a leg can assert the completion notice's
    // TEXT, not just that a variable/report changed: every prior test only needed the no-op.
    _notified: [],
    notify(msg) { this._notified.push(msg); },
    closePlugin() {},
    // the document root carries the embedded config (setPluginData is a synchronous string store).
    root: { _pd: {}, setPluginData(k, v) { this._pd[k] = String(v); }, getPluginData(k) { return this._pd[k] || ""; } },
    ui: { _h: null, _posted: [], postMessage(m) { this._posted.push(m); }, close() {}, set onmessage(fn) { this._h = fn; }, get onmessage() { return this._h; } },
    clientStorage: { _s: {}, async setAsync(k, v) { this._s[k] = v; }, async getAsync(k) { return this._s[k]; } },
    // ── styles (paint + text), the styles executor's surface ──
    _styles: [],
    async getLocalPaintStylesAsync() { return this._styles.filter((s) => s._kind === "PAINT"); },
    async getLocalTextStylesAsync() { return this._styles.filter((s) => s._kind === "TEXT"); },
    async getStyleByIdAsync(sid) { return this._styles.find((s) => s.id === sid) || null; },
    createPaintStyle() { const st = { _kind: "PAINT", id: "s" + id++, name: "", paints: [], remove: function () { const i = figma._styles.indexOf(this); if (i >= 0) figma._styles.splice(i, 1); } }; this._styles.push(st); return st; },
    createTextStyle() {
      const st = { _kind: "TEXT", id: "s" + id++, name: "", fontName: null, fontSize: 0, lineHeight: null, letterSpacing: null, paragraphSpacing: 0, textCase: "ORIGINAL", _bound: {},
        setBoundVariable: function (field, v) { if (v == null) delete this._bound[field]; else this._bound[field] = v.id; },
        remove: function () { const i = figma._styles.indexOf(this); if (i >= 0) figma._styles.splice(i, 1); } };
      this._styles.push(st); return st;
    },
    // the "installed" font universe: a few families with REALISTIC face lists (note: no exact
    // "SemiBold" on Inter Tight, nearest-weight resolution must cope) and italics to be skipped.
    _fonts: { "Inter": ["Thin", "Light", "Regular", "Medium", "SemiBold", "Bold", "Black", "Italic", "Bold Italic"],
              "Inter Tight": ["Light", "Regular", "Medium", "Bold", "Black"],
              "Source Serif 4": ["Regular", "SemiBold", "Bold"],
              "JetBrains Mono": ["Regular", "Medium", "Bold"] },
    async listAvailableFontsAsync() {
      const out = [];
      for (const fam of Object.keys(this._fonts)) for (const st of this._fonts[fam]) out.push({ fontName: { family: fam, style: st } });
      return out;
    },
    async loadFontAsync(f) {
      if (!f || !f.family || !this._fonts[f.family] || this._fonts[f.family].indexOf(f.style) < 0) throw new Error("no face");
    },
    variables: {
      async getLocalVariableCollectionsAsync() { return collections.slice(); },
      createVariableCollection(name) {
        const c = {
          id: "c" + id++, name, modes: [{ modeId: "m" + id++, name: "Mode 1" }],
          renameMode(mid, nm) { const m = this.modes.find((x) => x.modeId === mid); if (m) m.name = nm; },
          addMode(nm) { const m = { modeId: "m" + id++, name: nm }; this.modes.push(m); return m.modeId; },
          removeMode(mid) { const i = this.modes.findIndex((x) => x.modeId === mid); if (i > 0) this.modes.splice(i, 1); }, // i>0: never the default
          remove() { // real Figma drops the collection AND its variables
            const i = collections.indexOf(this); if (i >= 0) collections.splice(i, 1);
            for (let j = variables.length - 1; j >= 0; j--) if (variables[j].variableCollectionId === this.id) variables.splice(j, 1);
          },
        };
        collections.push(c); return c;
      },
      async getLocalVariablesAsync() { return variables.slice(); },
      createVariable(name, coll, type) {
        const vm = {}; // shared: real Figma exposes valuesByMode; the cascade test reads .values
        const v = { id: "v" + id++, name, variableCollectionId: coll.id, type, values: vm, valuesByMode: vm,
          setValueForMode(mid, val) { vm[mid] = val; },
          remove() { const i = variables.indexOf(this); if (i >= 0) variables.splice(i, 1); } };
        variables.push(v); return v;
      },
      createVariableAlias(v) { return { type: "VARIABLE_ALIAS", id: v.id }; },
      setBoundVariableForPaint(paint, field, v) { return Object.assign({}, paint, { boundVariables: { [field]: { type: "VARIABLE_ALIAS", id: v.id } } }); },
    },
  };
  return { figma, collections, variables };
}

// ── END-TO-END contract: figmaBundle() -> applyBundle() on the mock ──────────────
let applyBundle, applyFloatPlans, applyFontPrimitivesModes, applyStylePlans, setCollectionNames, resolveFace, sweepCandidates, styleNameWeight;
// #495 "published library" mode, the hand-written VM mirrors of mode-apply-plan.mjs's pure planner
// functions, extracted for the `libraryparity` behavioral-parity gate below (see its own header comment).
let vmLibraryReconcile, vmValueChanged, vmLibraryModeReport, vmNearestStepByHeight, vmExpandGeometryAliasMap, vmExpandVoiceAliasMap, vmGeometryPlanStepHeights, vmLibraryTypeVoiceMap, vmResolveLiteralHeight, vmLiveAliasTargetsByName, vmPriorLibraryUplift, vmPruneCandidates;
// #498 grammar bridge, the hand-written VM mirrors, extracted for the same libraryparity gate.
let vmParseOldTypeStepName, vmTypeStepAliasMap, vmTypeWeightAliasMap, vmTypeStepFieldMap, vmGeometryFieldRenameMap;
const F = mockFigma();
try {
  const load = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle, applyFloatPlans, applyFontPrimitivesModes, applyStylePlans, setCollectionNames, resolveFace, sweepCandidates, styleNameWeight, libraryReconcile, valueChangedVM, libraryModeReportVM, nearestStepByHeightVM, expandGeometryAliasMap, expandVoiceAliasMap, geometryPlanStepHeights, LIBRARY_TYPE_VOICE_MAP, resolveLiteralHeightVM, liveAliasTargetsByNameVM, priorLibraryUpliftVM, pruneCandidatesVM, parseOldTypeStepNameVM, typeStepAliasMapVM, typeWeightAliasMapVM, TYPE_STEP_FIELD_MAP, GEOMETRY_FIELD_RENAME_MAP };");
  const loaded = load(F.figma, "<html>", undefined); // closes over the MOCK figma
  applyBundle = loaded.applyBundle; applyFloatPlans = loaded.applyFloatPlans;
  applyFontPrimitivesModes = loaded.applyFontPrimitivesModes; applyStylePlans = loaded.applyStylePlans;
  setCollectionNames = loaded.setCollectionNames; resolveFace = loaded.resolveFace;
  sweepCandidates = loaded.sweepCandidates; styleNameWeight = loaded.styleNameWeight;
  vmLibraryReconcile = loaded.libraryReconcile; vmValueChanged = loaded.valueChangedVM;
  vmLibraryModeReport = loaded.libraryModeReportVM; vmNearestStepByHeight = loaded.nearestStepByHeightVM;
  vmExpandGeometryAliasMap = loaded.expandGeometryAliasMap; vmExpandVoiceAliasMap = loaded.expandVoiceAliasMap;
  vmGeometryPlanStepHeights = loaded.geometryPlanStepHeights; vmLibraryTypeVoiceMap = loaded.LIBRARY_TYPE_VOICE_MAP;
  vmResolveLiteralHeight = loaded.resolveLiteralHeightVM; vmLiveAliasTargetsByName = loaded.liveAliasTargetsByNameVM; vmPriorLibraryUplift = loaded.priorLibraryUpliftVM; vmPruneCandidates = loaded.pruneCandidatesVM;
  vmParseOldTypeStepName = loaded.parseOldTypeStepNameVM; vmTypeStepAliasMap = loaded.typeStepAliasMapVM;
  vmTypeWeightAliasMap = loaded.typeWeightAliasMapVM; vmTypeStepFieldMap = loaded.TYPE_STEP_FIELD_MAP;
  vmGeometryFieldRenameMap = loaded.GEOMETRY_FIELD_RENAME_MAP;
} catch (e) { FAIL("parse", "code.js failed to load: " + e.message); }

if (applyBundle) {
  const bundle = figmaBundle(defaultDocument());
  // recursive: ADR-016 nested the raw scrims ({n}/scrim/{step}), so leaves are counted by $value.
  const expect = (tree) => {
    const walk = (node) => Object.keys(node).filter((k) => k[0] !== "$").reduce((a, k) => {
      const c = node[k];
      return a + (c && typeof c === "object" && ("$value" in c) ? 1 : (c && typeof c === "object" ? walk(c) : 0));
    }, 0);
    return walk(tree);
  };
  // primeLeafCount, the "{n}/prime/{step}" leaves nested under each family (REQ-054): P5/#540 routes
  // these into their OWN "Color Prime" collection, not "Color Primitives", so they're carved out of
  // rawExpect below and counted separately as primeExpect.
  const primeLeafCount = (tree) => Object.keys(tree).filter((k) => k[0] !== "$").reduce((a, n) => {
    const grp = tree[n];
    return a + (grp && grp.prime && typeof grp.prime === "object" ? Object.keys(grp.prime).filter((k) => k[0] !== "$").length : 0);
  }, 0);
  const primeExpect = primeLeafCount(bundle["palette.tokens.json"]);
  const rawExpect = expect(bundle["palette.tokens.json"]) - primeExpect;
  const semExpect = expect(bundle["Light_tokens.json"]);

  // ── schema stamp tolerance (SPEC 0.3.0 RP-8, ticket #577, plan PR #571 step E6), the bundle
  // already carries the new root $extensions["com.ultimate-tokens"].schemaVersion on all 3 files
  // (exportDTCG's figmaMode, unconditional); confirm it's actually there (not silently dropped by
  // figmaBundle's own aliasing pass) before proving below that applyBundle still parses/applies it
  // with the SAME variable counts as an unstamped bundle would (childKeys() skips any "$"-prefixed
  // root key, so the stamp is inert to the reader, this proves that, rather than assuming it).
  for (const file of ["palette.tokens.json", "Light_tokens.json", "Dark_tokens.json"]) {
    const ext = bundle[file].$extensions && bundle[file].$extensions["com.ultimate-tokens"];
    if (!ext || ext.schemaVersion !== 3) FAIL("apply", `bundle["${file}"] missing root $extensions["com.ultimate-tokens"].schemaVersion=3 (got ${JSON.stringify(ext)})`);
  }

  try {
    const res = await applyBundle(bundle);
    const raw = F.collections.find((c) => c.name === "Color Primitives");
    const sem = F.collections.find((c) => c.name === "Color Roles");
    const prime = F.collections.find((c) => c.name === "Color Prime");
    if (!raw) FAIL("apply", "no Color Primitives collection created");
    if (!sem) FAIL("apply", "no Color Roles collection created");
    if (!prime) FAIL("apply", "no Color Prime collection created (AC-052)");
    if (sem && sem.modes.map((m) => m.name).join() !== "Light,Dark") FAIL("apply", `Color Roles modes = ${sem && sem.modes.map((m) => m.name)}, want Light,Dark`);
    if (prime && prime.modes.map((m) => m.name).join() !== "Base") FAIL("apply", `Color Prime modes = ${prime && prime.modes.map((m) => m.name)}, want Base (REQ-054, mode-independent)`);
    if (res.raw !== rawExpect) FAIL("apply", `created ${res.raw} raw vars, expected ${rawExpect}`);
    if (res.prime !== primeExpect) FAIL("apply", `created ${res.prime} prime vars, expected ${primeExpect} (AC-052: 7 * enabled palettes)`);
    if (res.semantic !== semExpect) FAIL("apply", `created ${res.semantic} semantic vars, expected ${semExpect}`);

    if (prime) {
      const primeNames = F.variables.filter((v) => v.variableCollectionId === prime.id).map((v) => v.name);
      if (primeNames.length !== primeExpect) FAIL("apply", `Color Prime has ${primeNames.length} vars, expected ${primeExpect}`);
      // REQ-054 naming: "{n}/{step}", no "raw/" prefix, no leftover "/prime/" segment (that's the
      // DTCG source path this leaf was routed FROM, not the Figma variable name).
      if (!primeNames.includes("primary/brightest")) FAIL("apply", `Color Prime is missing "primary/brightest" (REQ-054 {n}/{step} naming); got e.g. ${primeNames.slice(0, 5).join(", ")}`);
      const badName = primeNames.find((nm) => nm.indexOf("raw/") === 0 || /\/prime\//.test(nm));
      if (badName) FAIL("apply", `Color Prime variable "${badName}" does not match the {n}/{step} grammar (REQ-054)`);
    }

    if (raw && sem) {
      const rawIds = new Set(F.variables.filter((v) => v.variableCollectionId === raw.id).map((v) => v.id));
      const lightId = sem.modes[0].modeId, darkId = sem.modes[1].modeId;
      let aliased = 0, bad = 0;
      for (const v of F.variables.filter((v) => v.variableCollectionId === sem.id)) {
        for (const mid of [lightId, darkId]) {
          const val = v.values[mid];
          if (!val || val.type !== "VARIABLE_ALIAS" || !rawIds.has(val.id)) { bad++; continue; }
          aliased++;
        }
      }
      if (bad > 0) FAIL("cascade", `${bad} semantic mode-values are not aliased to a created raw var`);
      if (aliased !== semExpect * 2) FAIL("cascade", `${aliased} aliased mode-values, expected ${semExpect * 2} (53 roles × palettes × 2 modes)`);
    }

    // ── IDEMPOTENT re-apply: a 2nd run finds-or-creates → updates in place, never doubles ──
    // (the user re-runs the plugin on the same file repeatedly; duplicate collections/vars/
    //  modes would corrupt the variable panel). Proven, not assumed.
    const res2 = await applyBundle(bundle);
    const rawColls = F.collections.filter((c) => c.name === "Color Primitives").length;
    const semColls = F.collections.filter((c) => c.name === "Color Roles").length;
    const primeColls = F.collections.filter((c) => c.name === "Color Prime").length;
    if (rawColls !== 1) FAIL("idempotent", `re-apply made ${rawColls} Color Primitives collections, want 1`);
    if (semColls !== 1) FAIL("idempotent", `re-apply made ${semColls} Color Roles collections, want 1`);
    if (primeColls !== 1) FAIL("idempotent", `re-apply made ${primeColls} Color Prime collections, want 1 (AC-052)`);
    const rawVars2 = F.variables.filter((v) => raw && v.variableCollectionId === raw.id).length;
    const semVars2 = F.variables.filter((v) => sem && v.variableCollectionId === sem.id).length;
    const primeVars2 = F.variables.filter((v) => prime && v.variableCollectionId === prime.id).length;
    if (rawVars2 !== rawExpect) FAIL("idempotent", `re-apply left ${rawVars2} raw vars, want ${rawExpect} (no duplicates)`);
    if (semVars2 !== semExpect) FAIL("idempotent", `re-apply left ${semVars2} semantic vars, want ${semExpect} (no duplicates)`);
    if (primeVars2 !== primeExpect) FAIL("idempotent", `re-apply left ${primeVars2} prime vars, want ${primeExpect} (no duplicates, AC-052)`);
    if (sem && sem.modes.map((m) => m.name).join() !== "Light,Dark") FAIL("idempotent", `re-apply left Color Roles modes = ${sem && sem.modes.map((m) => m.name)}, want Light,Dark (no duplicate mode)`);
    if (res2.raw !== rawExpect || res2.semantic !== semExpect) FAIL("idempotent", `re-apply reported ${res2.raw}/${res2.semantic} vars, want ${rawExpect}/${semExpect}`);
    if (res2.prime !== primeExpect) FAIL("idempotent", `re-apply reported prime=${res2.prime} vars, want ${primeExpect}`);

    // ── ORPHAN PRUNE: re-apply removes any var NOT in the current bundle, in ALL THREE generated
    //    collections, old-format scrims (250-*/500-0..6/750-*), removed/renamed/disabled palettes,
    //    and a stale prime var, so the file mirrors the generator exactly (full-mirror pruning). ──
    F.figma.variables.createVariable("neutral/500-0", raw, "COLOR"); // old base-index scrim
    F.figma.variables.createVariable("neutral/750-3", raw, "COLOR"); // old 750-base scrim
    F.figma.variables.createVariable("ghost/050", raw, "COLOR");     // removed-palette raw solid
    F.figma.variables.createVariable("ghost/primary", sem, "COLOR"); // removed-palette semantic var
    F.figma.variables.createVariable("ghost/brightest", prime, "COLOR"); // removed-palette prime var
    const res3 = await applyBundle(bundle);
    const inColl = (cid) => F.variables.filter((v) => v.variableCollectionId === cid).map((v) => v.name);
    const rawNames3 = inColl(raw.id), semNames3 = inColl(sem.id), primeNames3 = inColl(prime.id);
    for (const dead of ["neutral/500-0", "neutral/750-3", "ghost/050"]) if (rawNames3.includes(dead)) FAIL("prune", `orphan raw var '${dead}' not pruned`);
    if (semNames3.includes("ghost/primary")) FAIL("prune", "orphan semantic var 'ghost/primary' not pruned");
    if (primeNames3.includes("ghost/brightest")) FAIL("prune", "orphan prime var 'ghost/brightest' not pruned");
    if (rawNames3.length !== rawExpect) FAIL("prune", `Color Primitives has ${rawNames3.length} vars after prune, want ${rawExpect}`);
    if (semNames3.length !== semExpect) FAIL("prune", `Color Roles has ${semNames3.length} vars after prune, want ${semExpect}`);
    if (primeNames3.length !== primeExpect) FAIL("prune", `Color Prime has ${primeNames3.length} vars after prune, want ${primeExpect}`);
    if (res3.pruned !== 5) FAIL("prune", `apply reported pruned=${res3.pruned}, expected 5`);

    // ── REGROUP: apply with {rebuildSemantic} DELETES + re-creates the Color Roles collection (so it
    //    adopts the bundle's canonical order), leaving Color Primitives + the var counts intact and
    //    NOT duplicating the collection. The fresh semantic vars created in the bundle's role order. ──
    const semColl0 = F.collections.find((c) => c.name === "Color Roles");
    const res4 = await applyBundle(bundle, { rebuildSemantic: true });
    if (!res4.rebuilt) FAIL("regroup", "applyBundle({rebuildSemantic:true}) did not report rebuilt");
    const semColls4 = F.collections.filter((c) => c.name === "Color Roles");
    if (semColls4.length !== 1) FAIL("regroup", `after regroup there are ${semColls4.length} Color Roles collections, want 1`);
    if (semColls4[0] === semColl0) FAIL("regroup", "regroup reused the old Color Roles collection (should be a fresh one)");
    if (res4.semantic !== semExpect) FAIL("regroup", `regroup created ${res4.semantic} semantic vars, want ${semExpect}`);
    const semNames4 = inColl(semColls4[0].id);
    if (semNames4.length !== semExpect) FAIL("regroup", `Color Roles has ${semNames4.length} vars after regroup, want ${semExpect}`);
    // order check: the fresh collection's variable order matches the bundle's (regular → … → scrims)
    const wantOrder = Object.keys(bundle["Light_tokens.json"]).filter((n) => n[0] !== "$")
      .flatMap((n) => Object.keys(bundle["Light_tokens.json"][n]).filter((k) => k[0] !== "$").map((k) => n + "/" + k));
    if (semNames4.join(",") !== wantOrder.join(",")) FAIL("regroup", "regrouped Color Roles order != bundle (canonical) order");
    const lastSeven = semNames4.slice(-7);
    if (!lastSeven.every((nm) => /\/scrim/.test(nm))) FAIL("regroup", `last 7 regrouped vars are not scrims: ${lastSeven}`);

    // ── COLLECTION-NAME OVERRIDES: setCollectionNames (the apply message's `collections`) routes the
    //    SAME bundle into custom-named collections; the default constants are the empty/absent fallback. ──
    if (typeof setCollectionNames !== "function") FAIL("collnames", "code.js does not export setCollectionNames");
    else {
      setCollectionNames({ raw: "Brand Primitives", semantic: "Brand Modes" });
      const res5 = await applyBundle(bundle);
      const braw = F.collections.find((c) => c.name === "Brand Primitives");
      const bsem = F.collections.find((c) => c.name === "Brand Modes");
      if (!braw || !bsem) FAIL("collnames", "override apply did not create the custom-named collections");
      if (res5.raw !== rawExpect || res5.semantic !== semExpect) FAIL("collnames", `override apply created ${res5.raw}/${res5.semantic} vars, want ${rawExpect}/${semExpect}`);
      // Color Prime has NO Settings override (figmaCollectionNames only covers raw/semantic), it stays
      // "Color Prime" even while raw/semantic are overridden, and its own var count is unaffected.
      if (res5.prime !== primeExpect) FAIL("collnames", `override apply created ${res5.prime} prime vars, want ${primeExpect} (Color Prime has no name override)`);
      if (F.collections.filter((c) => c.name === "Color Prime").length !== 1) FAIL("collnames", "override apply should not rename or duplicate Color Prime");
      // the default-named collections from the earlier legs are left untouched (no rename, no prune)
      if (!F.collections.some((c) => c.name === "Color Primitives")) FAIL("collnames", "override apply disturbed the existing default-named Color Primitives");
      setCollectionNames(null); // empty/absent → the defaults (the fallback contract)
      const res6 = await applyBundle(bundle);
      if (res6.raw !== rawExpect) FAIL("collnames", "setCollectionNames(null) did not fall back to the default names");
    }
  } catch (e) { FAIL("apply", "applyBundle threw: " + e.message); }

  // ── PRIME RE-APPLY updates VALUES IN PLACE (AC-052's "re-applying updates in place" half, the
  //    idempotent leg above proves count stability, not that a CHANGED prime color actually lands).
  //    A fresh mock/load so this leg's own state can't be confused with the shared `F` above. ──
  {
    const F10 = mockFigma();
    let load10;
    try {
      load10 = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle };")(F10.figma, "<html>", undefined);
    } catch (e) { FAIL("primevalue", "could not load code.js for the prime-value leg: " + e.message); }
    if (load10 && load10.applyBundle) {
      try {
        const bundleA = figmaBundle(defaultDocument());
        const resA = await load10.applyBundle(bundleA);
        const primeA = F10.collections.find((c) => c.name === "Color Prime");
        if (!primeA) FAIL("primevalue", "no Color Prime collection created");
        else {
          const varsA = F10.variables.filter((v) => v.variableCollectionId === primeA.id);
          const brightestVar = varsA.find((v) => v.name === "primary/brightest");
          if (!brightestVar) FAIL("primevalue", "Color Prime is missing 'primary/brightest'");
          else {
            const before = JSON.stringify(brightestVar.values[primeA.modes[0].modeId]);
            // primeChroma (REQ-052) scales every prime swatch's saturation, a value-only mutation
            // with no structural effect (same 7 steps, same names). Set it on the PALETTE itself
            // (Primary's own override), not the top-level doc.primeChroma: ticket #559 put a GROUP
            // layer between the two (Primary's "brand" group has its own explicit primeChroma
            // default), so the global slider alone no longer reaches a grouped palette once
            // resolveGroups() has filled every group's default, a per-palette override still does.
            const doc10b = defaultDocument();
            doc10b.palettes.find((p) => p.name === "Primary").primeChroma = 50;
            const bundleB = figmaBundle(doc10b);
            const resB = await load10.applyBundle(bundleB);
            const primeCollsB = F10.collections.filter((c) => c.name === "Color Prime").length;
            if (primeCollsB !== 1) FAIL("primevalue", `re-apply made ${primeCollsB} Color Prime collections, want 1`);
            const varsB = F10.variables.filter((v) => v.variableCollectionId === primeA.id);
            if (varsB.length !== resA.prime) FAIL("primevalue", `re-apply left ${varsB.length} prime vars, want ${resA.prime} (no duplicates)`);
            if (resB.prime !== resA.prime) FAIL("primevalue", `re-apply reported prime=${resB.prime}, want ${resA.prime}`);
            const brightestVar2 = varsB.find((v) => v.name === "primary/brightest");
            if (!brightestVar2) FAIL("primevalue", "'primary/brightest' missing after re-apply");
            else if (brightestVar2.id !== brightestVar.id) FAIL("primevalue", "re-apply created a NEW variable for 'primary/brightest' instead of updating the existing one in place");
            else if (JSON.stringify(brightestVar2.values[primeA.modes[0].modeId]) === before) FAIL("primevalue", "re-apply with a changed primeChroma did not update 'primary/brightest' (still the OLD value)");
          }
        }
      } catch (e) { FAIL("primevalue", "applyBundle threw on the prime-value leg: " + e.message); }
    }
  }

  // ── THEMES (TKT-0021, the theme axis flows generically all the way to the apply executor): a
  //    3-theme bundle (Light/Dark/Dim, Dim on the "dark" side) creates a THREE-mode Color Roles
  //    collection, every var aliased in all three modes, and re-applying a plain 2-theme bundle prunes
  //    the now-unwanted "Dim" mode back down to two, proves N-way, not just "2 still works". Built
  //    directly off exportDTCG (the same engine call figmaBundle wraps) since figmaBundle itself takes
  //    no themes option (this ticket generalizes the engine/bind/apply axis; a per-doc UI control for
  //    extra themes is a separate, later ticket). ──
  {
    const F7 = mockFigma();
    let load7;
    try {
      load7 = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle };")(F7.figma, "<html>", undefined);
    } catch (e) { FAIL("themes", "could not load code.js for the themes leg: " + e.message); }
    if (load7 && load7.applyBundle) {
      const THEMES_3 = [{ name: "Light", side: "light" }, { name: "Dark", side: "dark" }, { name: "Dim", side: "dark" }];
      const bundle3 = exportDTCG(stateOfDefault(), { rawColl: "Color Primitives", themes: THEMES_3 });
      try {
        const res7 = await load7.applyBundle(bundle3);
        const sem7 = F7.collections.find((c) => c.name === "Color Roles");
        if (!sem7) FAIL("themes", "no Color Roles collection created for a 3-theme bundle");
        else if (sem7.modes.map((m) => m.name).join() !== "Light,Dark,Dim") FAIL("themes", `Color Roles modes = ${sem7.modes.map((m) => m.name)}, want Light,Dark,Dim`);
        else {
          const lightId = sem7.modes[0].modeId, darkId = sem7.modes[1].modeId, dimId = sem7.modes[2].modeId;
          const semVars7 = F7.variables.filter((v) => v.variableCollectionId === sem7.id);
          if (semVars7.length !== res7.semantic) FAIL("themes", `${semVars7.length} semantic vars in the collection, applyBundle reported ${res7.semantic}`);
          let missingMode = 0, dimNeqDark = 0;
          for (const v of semVars7) {
            if (!v.values[lightId] || !v.values[darkId] || !v.values[dimId]) { missingMode++; continue; }
            if (JSON.stringify(v.values[dimId]) !== JSON.stringify(v.values[darkId])) dimNeqDark++;
          }
          if (missingMode) FAIL("themes", `${missingMode} semantic var(s) missing a value in one of the 3 modes`);
          if (dimNeqDark) FAIL("themes", `${dimNeqDark} semantic var(s) have Dim != Dark (same "dark" side should alias/resolve identically)`);
        }

        // re-apply a PLAIN 2-theme bundle (the default axis) → Dim is no longer wanted → its mode is pruned.
        const bundle2 = exportDTCG(stateOfDefault(), { rawColl: "Color Primitives" });
        await load7.applyBundle(bundle2);
        const sem7b = F7.collections.find((c) => c.name === "Color Roles");
        if (!sem7b || sem7b.modes.map((m) => m.name).join() !== "Light,Dark") FAIL("themes", `after reverting to a 2-theme bundle, Color Roles modes = ${sem7b && sem7b.modes.map((m) => m.name)}, want Light,Dark (Dim should be pruned)`);
      } catch (e) { FAIL("themes", "applyBundle threw on a 3-theme bundle: " + e.message); }
    }
  }

  // ── CONFIG round-trip via the file's root pluginData (the project source of truth, travels with the
  //    .fig): save → stored IN the file → load → posted back; AND "apply" embeds the config alongside the vars. ──
  if (F.figma.ui._h) {
    const cfg = { name: "T", palettes: [{ name: "P", hue: 7, chroma: 50, skew: 0, lift: 0, on: true }], roleOverrides: { onSurface: { light: "900" } } };
    await F.figma.ui._h({ type: "save-config", config: cfg });
    if (JSON.stringify(JSON.parse(F.figma.root.getPluginData("ultimate-tokens-config") || "null")) !== JSON.stringify(cfg)) FAIL("config", "save-config did not store the config in the file's root pluginData (must travel with the file, not clientStorage)");
    F.figma.ui._posted.length = 0;
    await F.figma.ui._h({ type: "load-config" });
    const loaded = F.figma.ui._posted.find((m) => m && m.type === "config-loaded");
    if (!loaded) FAIL("config", "load-config posted no {type:'config-loaded'} message");
    else if (JSON.stringify(loaded.config) !== JSON.stringify(cfg)) FAIL("config", "load-config did not round-trip the saved config");

    // "apply" must ALSO embed the params in the file, so a read reproduces them losslessly (not from colors).
    F.figma.root._pd = {}; // clear, then apply with an embedded config
    const cfg2 = { name: "Embedded", palettes: [{ name: "Q", hue: 200, chroma: 60, skew: 0, lift: 0, on: true }] };
    await F.figma.ui._h({ type: "apply", dtcg: figmaBundle(defaultDocument()), config: cfg2 });
    if (JSON.stringify(JSON.parse(F.figma.root.getPluginData("ultimate-tokens-config") || "null")) !== JSON.stringify(cfg2)) FAIL("config", "apply did not embed the config in the file (read-back would be lossy)");

    // ORPHANED legacy keys: figma.root.setPluginData is namespaced PER PLUGIN ID, so the id rename to
    // "ultimate-tokens" makes every pre-rename key unreachable from this plugin -- no forward-migration is
    // possible (that is the accepted cost of the rename). What IS gated: load-config must degrade to a clean
    // empty start, never read a stale key and never throw.
    F.figma.root._pd = {};
    const orphaned = { name: "Legacy", palettes: [{ name: "L", hue: 33, chroma: 44, skew: 0, lift: 0, on: true }] };
    for (const k of ["hct-config", "nonoun-color-tokens-config"]) F.figma.root.setPluginData(k, JSON.stringify(orphaned));
    F.figma.ui._posted.length = 0;
    await F.figma.ui._h({ type: "load-config" });
    const orphanLoaded = F.figma.ui._posted.find((m) => m && m.type === "config-loaded");
    if (!orphanLoaded) FAIL("config", "load-config did not answer at all when only pre-rename keys are present (must post config-loaded with an empty config)");
    if (orphanLoaded && orphanLoaded.config) FAIL("config", "load-config read a pre-rename pluginData key -- setPluginData is namespaced per plugin id, so a legacy key must be invisible, not silently adopted");

    // ── READ-VARIABLES (drift reference): the live Color Primitives values come back as #RRGGBB(AA) hexes ──
    F.figma.ui._posted.length = 0;
    await F.figma.ui._h({ type: "read-variables" });
    const read = F.figma.ui._posted.find((m) => m && m.type === "variables-read");
    if (!read) FAIL("read", "read-variables posted no {type:'variables-read'} message");
    else if (!read.found) FAIL("read", "read-variables did not find the Color Primitives collection");
    else {
      const names = Object.keys(read.raw);
      if (names.length !== rawExpect) FAIL("read", `read ${names.length} raw values, expected ${rawExpect}`);
      if (!names.every((k) => /^#[0-9A-F]{6}([0-9A-F]{2})?$/.test(read.raw[k]))) FAIL("read", "a read raw value is not a #RRGGBB(AA) hex");
    }
  } else {
    FAIL("config", "code.js registered no figma.ui.onmessage handler");
  }
}

// ── breakpoint-moded FLOAT apply (Type + Geometry), the NATIVE side of #125's interchange export ──
// applyFloatPlans executes the UI-computed plans (figma/binder/mode-apply-plan.mjs.modeApplyPlan) against
// the figma API: since TKT-0009 the type + geometry halves land as ONE merged "Geometry" collection
// (type/ + box-geometry variables), mode[0]="Base" + one mode per breakpoint, value-complete FLOAT vars.
// Proven (not assumed): idempotent re-apply, stale-mode prune on breakpoint removal, orphan-var prune,
// and retirement of a registry-tracked two-collection-era "Typography".
if (applyFloatPlans) {
  try {
    const typeIx = TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 }), [{ name: "Mobile", scale: TYPE.typeScale({ treatment: "product", bodyBase: 13 }) }]);
    const geomIx = GEOM.geomTokensFigmaModes(GEOM.geomScale({ treatment: "comfortable", baseHeight: 28 }), [{ name: "Mobile", scale: GEOM.geomScale({ treatment: "comfortable", baseHeight: 24 }) }]);
    const mergedPlans = modeApplyPlan(mergeModeInterchanges(typeIx, geomIx));
    if (mergedPlans.length !== 1) FAIL("floatapply", `merged plan count = ${mergedPlans.length}, want 1 (one collection)`);
    const fr = await applyFloatPlans(mergedPlans);

    const geo = F.collections.find((c) => c.name === "Geometry");
    if (F.collections.some((c) => c.name === "Typography")) FAIL("floatapply", "the merged apply minted a Typography collection (the pre-TKT-0009 shape)");
    if (!geo) FAIL("floatapply", "no Geometry collection created");
    if (geo && geo.modes.map((m) => m.name).join() !== "Base,Mobile") FAIL("floatapply", `Geometry modes = ${geo && geo.modes.map((m) => m.name)}, want Base,Mobile`);
    if (fr.collections !== 1) FAIL("floatapply", `applyFloatPlans reported ${fr.collections} collections, want 1 (merged)`);

    // every var is FLOAT + value-complete across both modes; per-mode TYPE values DIFFER (16 vs 13); both halves present.
    if (geo) {
      const gVars = F.variables.filter((v) => v.variableCollectionId === geo.id);
      const planLen = mergedPlans[0].variables.length;
      if (gVars.length !== planLen) FAIL("floatapply", `Geometry has ${gVars.length} vars, want ${planLen}`);
      if (!gVars.every((v) => v.type === "FLOAT")) FAIL("floatapply", "a Geometry variable is not FLOAT");
      if (!gVars.some((v) => v.name.startsWith("type/"))) FAIL("floatapply", "the type/ half is missing from the merged collection");
      if (!gVars.some((v) => v.name.startsWith("size/"))) FAIL("floatapply", "the box-geometry half is missing from the merged collection");
      const baseId = geo.modes[0].modeId, mobId = geo.modes[1].modeId;
      const bodyMd = gVars.find((v) => v.name === "type/body/md/size");
      if (!bodyMd) FAIL("floatapply", "type/body/md/size variable missing");
      else if (!Number.isFinite(bodyMd.valuesByMode[baseId]) || !Number.isFinite(bodyMd.valuesByMode[mobId])) FAIL("floatapply", "type/Body/MD/size not value-complete across modes");
      else if (bodyMd.valuesByMode[baseId] === bodyMd.valuesByMode[mobId]) FAIL("floatapply", "type/body/md/size Base == Mobile (per-mode values should differ at bodyBase 16 vs 13)");
    }

    // IDEMPOTENT re-apply, no duplicate collection / modes / variables.
    await applyFloatPlans(modeApplyPlan(mergeModeInterchanges(typeIx, geomIx)));
    if (F.collections.filter((c) => c.name === "Geometry").length !== 1) FAIL("floatidem", "re-apply duplicated the Geometry collection");
    if (geo && geo.modes.length !== 2) FAIL("floatidem", `re-apply left ${geo && geo.modes.length} Geometry modes, want 2`);
    const gVars2 = geo ? F.variables.filter((v) => v.variableCollectionId === geo.id).length : 0;
    if (gVars2 !== mergedPlans[0].variables.length) FAIL("floatidem", `re-apply left ${gVars2} Geometry vars (duplicates)`);

    // BREAKPOINT REMOVED ⇒ the stale mode is pruned (re-apply the merged no-breakpoints plan ⇒ Base only).
    await applyFloatPlans(modeApplyPlan(mergeModeInterchanges(
      TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 }), []),
      GEOM.geomTokensFigmaModes(GEOM.geomScale({ treatment: "comfortable", baseHeight: 28 }), []),
    )));
    if (geo && geo.modes.map((m) => m.name).join() !== "Base") FAIL("floatprune", `after removing the breakpoint, Geometry modes = ${geo && geo.modes.map((m) => m.name)}, want Base`);

    // ORPHAN VAR pruned, a synthetic collection: apply {a,b} then {a} ⇒ b removed, a updated to 9.
    const synthVar = (name, value) => ({ name, type: "FLOAT", values: [{ mode: "Base", value }] });
    await applyFloatPlans([{ collection: "Synth", modes: ["Base"], defaultMode: "Base", addModes: [], variables: [synthVar("a", 1), synthVar("b", 2)] }]);
    await applyFloatPlans([{ collection: "Synth", modes: ["Base"], defaultMode: "Base", addModes: [], variables: [synthVar("a", 9)] }]);
    const synth = F.collections.find((c) => c.name === "Synth");
    const sVars = synth ? F.variables.filter((v) => v.variableCollectionId === synth.id) : [];
    if (sVars.some((v) => v.name === "b")) FAIL("floatprune", "orphan variable 'b' not pruned on re-apply");
    const aVar = sVars.find((v) => v.name === "a");
    if (!aVar) FAIL("floatprune", "variable 'a' missing after re-apply");
    else if (aVar.valuesByMode[synth.modes[0].modeId] !== 9) FAIL("floatprune", "variable 'a' not updated to 9 on re-apply");

    // PROVENANCE: apply must NEVER canonicalize a USER's own pre-existing same-named collection, it tracks
    // the collections IT created by id in root pluginData and makes a SEPARATE one. Fresh mock so the user's
    // "Geometry" is the only one until apply runs.
    const F2 = mockFigma();
    const a2 = new Function("figma", "__html__", "module", code + "\nreturn { applyFloatPlans };")(F2.figma, "<html>", undefined).applyFloatPlans;
    const userColl = F2.figma.variables.createVariableCollection("Geometry"); // the user's own, pre-existing
    F2.figma.variables.createVariable("user/keepme", userColl, "FLOAT").setValueForMode(userColl.modes[0].modeId, 123);
    await a2(modeApplyPlan(TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product" }), [])));
    if (F2.collections.filter((c) => c.name === "Geometry").length !== 2) FAIL("floatprov", `expected the user's Geometry + a separate plugin-created one (2), got ${F2.collections.filter((c) => c.name === "Geometry").length}`);
    if (!F2.variables.some((v) => v.variableCollectionId === userColl.id && v.name === "user/keepme")) FAIL("floatprov", "apply pruned a variable from the user's OWN Geometry collection");
    if (userColl.modes[0].name !== "Mode 1") FAIL("floatprov", "apply renamed the default mode of the user's OWN Geometry collection");
    await a2(modeApplyPlan(TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product" }), []))); // re-apply: reconcile OURS by id, not the user's
    if (F2.collections.filter((c) => c.name === "Geometry").length !== 2) FAIL("floatprov", "re-apply made a 3rd Geometry (provenance registry not persisted to root pluginData)");

    // RETIREMENT (TKT-0009 migration): a registry-tracked two-collection-era "Typography" is removed by a
    // merged plan carrying retire:["Typography"] (what _figmaFloatPlans attaches), while a user's OWN
    // same-named collection survives (provenance: retire matches by registry id, never by name).
    const F8 = mockFigma();
    const a8 = new Function("figma", "__html__", "module", code + "\nreturn { applyFloatPlans };")(F8.figma, "<html>", undefined).applyFloatPlans;
    await a8([{ collection: "Typography", modes: ["Base"], defaultMode: "Base", addModes: [], variables: [synthVar("Body/MD/size", 16)] }]); // the old era: OURS, registry-tracked
    const userTypo = F8.figma.variables.createVariableCollection("Typography"); // the user's own beside ours
    F8.figma.variables.createVariable("user/keepme", userTypo, "FLOAT").setValueForMode(userTypo.modes[0].modeId, 5);
    if (F8.collections.filter((c) => c.name === "Typography").length !== 2) FAIL("floatretire", "fixture: expected ours + the user's Typography before the merged apply");
    const retirePlans = modeApplyPlan(mergeModeInterchanges(typeIx, geomIx));
    retirePlans[0].retire = ["Typography"];
    await a8(retirePlans);
    const typosLeft = F8.collections.filter((c) => c.name === "Typography");
    if (typosLeft.length !== 1) FAIL("floatretire", `expected ONLY the user's own Typography to survive retirement, got ${typosLeft.length}`);
    if (!F8.variables.some((v) => v.variableCollectionId === userTypo.id && v.name === "user/keepme")) FAIL("floatretire", "retirement removed the user's OWN Typography collection (provenance violated)");
    if (!F8.variables.some((v) => v.name === "type/body/md/size")) FAIL("floatretire", "the merged Geometry collection missing after retirement");
    await a8(retirePlans); // idempotent: a retire with no registry entry left is a no-op
    if (F8.collections.filter((c) => c.name === "Typography").length !== 1) FAIL("floatretire", "re-applying a retire-carrying plan touched the user's own Typography");
  } catch (e) { FAIL("floatapply", "applyFloatPlans threw: " + e.message); }
} else {
  FAIL("floatapply", "code.js exported no applyFloatPlans");
}

// ── floatlibrary (#687): "published library" mode covers applyFloatPlans' OWN breakpoint-mode prune
//    too, mirroring applyFontPrimitivesModes' Type Primitives mode guard and applyBundle's Color Roles
//    theme-mode guard (#673): #629's ruling Q2 already settled that a mode prune must be guarded like
//    a variable prune, because a consumer file pinned to a mode loses its binding exactly as it would
//    lose a removed variable. This was the one remaining gap. libraryMode:true must keep a dropped
//    breakpoint mode standing and report it in the collection's libraryReports staleModes; the SAME
//    drop with the flag off must still remove it (the classic prune, unchanged).
if (applyFloatPlans) {
  try {
    const synthVarL = (name, value) => ({ name, type: "FLOAT", values: [{ mode: "Base", value }] });
    const twoModePlan = () => [{ collection: "Synth", modes: ["Base", "Mobile"], defaultMode: "Base", addModes: ["Mobile"], variables: [synthVarL("a", 1)] }];
    const oneModePlan = () => [{ collection: "Synth", modes: ["Base"], defaultMode: "Base", addModes: [], variables: [synthVarL("a", 1)] }];

    // ── LEG 1: libraryMode:true keeps the dropped 'Mobile' mode standing and reports it. ──
    const FL = mockFigma();
    const al = new Function("figma", "__html__", "module", code + "\nreturn { applyFloatPlans };")(FL.figma, "<html>", undefined).applyFloatPlans;
    await al(twoModePlan());
    const synthL = FL.collections.find((c) => c.name === "Synth");
    if (!synthL || synthL.modes.map((m) => m.name).join() !== "Base,Mobile") FAIL("floatlibrary", "fixture: expected Base,Mobile modes before the library-mode apply");
    else {
      const resLib = await al(oneModePlan(), { libraryMode: true });
      if (!synthL.modes.some((m) => m.name === "Mobile")) FAIL("floatlibrary", "libraryMode:true removed the stale 'Mobile' breakpoint mode: a published collection's mode must survive, every consumer file pinned it");
      const repLib = (resLib.libraryReports || []).find((r) => r.collection === "Synth");
      if (!repLib || !(repLib.staleModes || []).includes("Mobile")) FAIL("floatlibrary", "libraryMode:true did not report 'Mobile' in staleModes: a kept mode must be disclosed, or it reads as a prune that silently failed");
    }

    // ── LEG 2: the SAME drop with the flag off still removes the mode, unchanged. ──
    const FL2 = mockFigma();
    const al2 = new Function("figma", "__html__", "module", code + "\nreturn { applyFloatPlans };")(FL2.figma, "<html>", undefined).applyFloatPlans;
    await al2(twoModePlan());
    const synthL2 = FL2.collections.find((c) => c.name === "Synth");
    const resCla = await al2(oneModePlan(), { libraryMode: false });
    if (synthL2 && synthL2.modes.some((m) => m.name === "Mobile")) FAIL("floatlibrary", "libraryMode:false left the stale 'Mobile' breakpoint mode standing: the classic mode prune must be unchanged");
    const repCla = (resCla.libraryReports || []).find((r) => r.collection === "Synth");
    if (repCla && (repCla.staleModes || []).length) FAIL("floatlibrary", `libraryMode:false reported ${repCla.staleModes.length} staleModes: the classic path keeps none`);

    // ── LEG 3 (#687 critic, mirrors #696's fontprimslibrary): opts.libraryMode UNDEFINED (an old
    //    pre-#629 ui.html bundle) with GENUINE prior-uplift evidence already in the collection, namely
    //    a "_deprecated/" variable a REAL earlier libraryMode:true apply produced (never a fabricated
    //    fixture), must still resolve useLibrary=true off #635's priorLibraryUpliftVM fallback and keep
    //    the dropped 'Mobile' breakpoint standing, reported in staleModes, with the deprecated variable
    //    surviving too. Mutant M3 (deciding the mode prune off the raw `opts.libraryMode === true`
    //    instead of this SAME resolved flag) passes LEG 1/2 above but goes red here.
    const FL3 = mockFigma();
    const al3 = new Function("figma", "__html__", "module", code + "\nreturn { applyFloatPlans };")(FL3.figma, "<html>", undefined).applyFloatPlans;
    // seed: two modes, two variables; classic first apply (no opts, no evidence yet).
    await al3([{ collection: "Synth", modes: ["Base", "Mobile"], defaultMode: "Base", addModes: ["Mobile"], variables: [synthVarL("a", 1), synthVarL("oldvar", 2)] }]);
    // a REAL libraryMode:true apply drops 'oldvar' from the wanted set: it gets deprecated under
    // "_deprecated/oldvar", genuine prior-uplift evidence.
    await al3([{ collection: "Synth", modes: ["Base", "Mobile"], defaultMode: "Base", addModes: [], variables: [synthVarL("a", 1)] }], { libraryMode: true });
    const synthL3 = FL3.collections.find((c) => c.name === "Synth");
    if (!synthL3 || synthL3.modes.map((m) => m.name).join() !== "Base,Mobile") FAIL("floatlibrary", `fixture: expected Base,Mobile modes before the narrow apply, got ${synthL3 && synthL3.modes.map((m) => m.name)}`);
    const deprecatedBefore = FL3.variables.some((v) => v.variableCollectionId === synthL3.id && v.name === "_deprecated/oldvar");
    if (!deprecatedBefore) FAIL("floatlibrary", "fixture: no '_deprecated/oldvar' prior-uplift evidence before the narrow apply, the leg would prove nothing");
    const resL3 = await al3([{ collection: "Synth", modes: ["Base"], defaultMode: "Base", addModes: [], variables: [synthVarL("a", 1)] }]); // opts omitted entirely, undefined
    const modeNamesL3 = synthL3.modes.map((m) => m.name);
    const repL3 = (resL3.libraryReports || []).find((r) => r.collection === "Synth");
    const staleL3 = (repL3 && repL3.staleModes) || [];
    if (!modeNamesL3.includes("Mobile")) FAIL("floatlibrary", `#687 an undefined libraryMode with prior-uplift evidence removed the stale 'Mobile' mode (modes=${JSON.stringify(modeNamesL3)}): a published library must never lose a mode a consumer pinned`);
    if (!staleL3.includes("Mobile")) FAIL("floatlibrary", `#687 an undefined libraryMode with prior-uplift evidence did not REPORT the kept 'Mobile' mode (staleModes=${JSON.stringify(staleL3)})`);
    if (!repL3 || repL3.libraryMode !== true) FAIL("floatlibrary", `#687 the variable half resolved libraryMode=${repL3 && repL3.libraryMode}, want true (prior-uplift evidence): the mode half must read the SAME decision`);
    const deprecatedAfter = FL3.variables.some((v) => v.variableCollectionId === synthL3.id && v.name === "_deprecated/oldvar");
    if (!deprecatedAfter) FAIL("floatlibrary", "#687 the preserved '_deprecated/oldvar' variable did not survive the narrow apply, the variable half must stay preserved too");
  } catch (e) { FAIL("floatlibrary", "applyFloatPlans (library-mode breakpoint leg) threw: " + e.message); }
} else {
  FAIL("floatlibrary", "code.js exported no applyFloatPlans");
}

// ── TKT-0012: the id-preserving RENAME capability, the migration channel every renaming ticket uses.
//    Proven on the mock: (a) a plan.renames var rename keeps the SAME variable id (no prune+recreate),
//    (b) a plan.renameFrom collection rename adopts the registry-tracked collection by id, renames it
//    in place, and re-keys the registry, (c) empty maps are byte-identical no-ops. ──
if (applyFloatPlans) {
  try {
    const F9 = mockFigma();
    const a9 = new Function("figma", "__html__", "module", code + "\nreturn { applyFloatPlans };")(F9.figma, "<html>", undefined).applyFloatPlans;
    // era 1: a synthetic OLD-shape interchange ("Geometry" collection, camel var names), hand-built,
    // since the live emitters now speak the ADR-016 grammar.
    const oldIx = JSON.parse(JSON.stringify(TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 }), [])).replaceAll("Geometry", "Breakpoints").replaceAll("type/body/md/", "type/Body/MD/").replaceAll("line-height", "lineHeight").replaceAll("letter-spacing", "letterSpacing").replaceAll("paragraph-spacing", "paragraphSpacing").replaceAll("single-lineHeight", "singleLineHeight"));
    await a9(modeApplyPlan(oldIx)); // era 1: the old-shape collection ("Breakpoints", camel var names)
    const geoOld = F9.collections.find((c) => c.name === "Breakpoints");
    const oldVar = F9.variables.find((v) => v.variableCollectionId === geoOld.id && v.name === "type/Body/MD/size");
    const keepCollId = geoOld.id, keepVarId = oldVar.id, varCountBefore = F9.variables.filter((v) => v.variableCollectionId === geoOld.id).length;
    // era 2: the renamed shape, collection "Breakpoints-Test", var "type/body/md/size", via the capability
    const renamedIx = JSON.parse(JSON.stringify(oldIx).replaceAll("type/Body/MD/", "type/body/md/"));
    const plans9 = modeApplyPlan({ collections: { "Breakpoints-Test": renamedIx.collections.Breakpoints } });
    plans9[0].renameFrom = ["Breakpoints"];
    plans9[0].renames = { "type/Body/MD/size": "type/body/md/size", "type/Body/MD/lineHeight": "type/body/md/lineHeight" };
    await a9(plans9);
    const bp = F9.collections.find((c) => c.name === "Breakpoints-Test");
    if (!bp) FAIL("renamecap", "renameFrom did not produce the renamed collection");
    else {
      if (bp.id !== keepCollId) FAIL("renamecap", "collection rename minted a NEW collection (id changed, bindings would orphan)");
      if (F9.collections.filter((c) => c.name === "Breakpoints").length !== 0) FAIL("renamecap", "the old-name collection lingers after renameFrom");
      const nv = F9.variables.find((v) => v.variableCollectionId === bp.id && v.name === "type/body/md/size");
      if (!nv) FAIL("renamecap", "renamed variable missing");
      else if (nv.id !== keepVarId) FAIL("renamecap", "variable rename minted a NEW variable (id changed, bindings would orphan)");
      // NOTE: the plan renames only 2 vars; the rest of the old camel names differ from the new plan's
      // names WITHOUT a map entry → reconcile prunes and recreates them (fresh ids), exactly why every
      // renaming ticket MUST ship its full map. The two mapped ones prove the channel.
    }
    // registry re-keyed: a THIRD apply under the new name must reuse the same collection, not mint another
    await a9(plans9);
    if (F9.collections.filter((c) => c.name === "Breakpoints-Test").length !== 1) FAIL("renamecap", "re-apply after renameFrom duplicated the collection (registry not re-keyed)");
  } catch (e) { FAIL("renamecap", "rename capability threw: " + e.message); }
}

// ── apply RESPECTS the export-system toggles: a message with NO dtcg (Color toggled off) skips the color
//    collections entirely while still applying the Type/Geometry float plans. Driven through the real handler. ──
{
  const F3 = mockFigma();
  new Function("figma", "__html__", "module", code)(F3.figma, "<html>", undefined); // run code.js → registers onmessage on F3
  if (typeof F3.figma.ui._h !== "function") FAIL("applysys", "code.js registered no onmessage handler on the fresh mock");
  else {
    const typePlan = modeApplyPlan(TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product" }), []));
    await F3.figma.ui._h({ type: "apply", floatPlans: typePlan, config: { name: "x" } }); // Color OFF → no dtcg
    if (F3.collections.some((c) => c.name === "Color Primitives" || c.name === "Color Roles")) FAIL("applysys", "apply with no dtcg still created a Color collection (the Color toggle was ignored)");
    if (!F3.collections.some((c) => c.name === "Geometry")) FAIL("applysys", "apply with no dtcg did not apply the merged Geometry float plan");
    // COMPLETION FEEDBACK: a finished apply posts {apply-done} back to the UI (its counts drive the "Applied N…" toast).
    const done = F3.figma.ui._posted.find((m) => m && m.type === "apply-done");
    if (!done) FAIL("applydone", "a completed apply posted no {apply-done} message to the UI (no done-feedback)");
    else if (!(done.floatVars > 0)) FAIL("applydone", `apply-done floatVars=${done.floatVars}, expected the applied float variables`);
  }
}

// ── TKT-0012: color-pool + style-registry renames (the same channel for the color cascade + styles) ──
if (applyBundle && applyStylePlans) {
  try {
    const FA = mockFigma();
    const la = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle, applyStylePlans };")(FA.figma, "<html>", undefined);
    const bundleB = figmaBundle(defaultDocument()); // the CURRENT (kebab) grammar
    // era 1: a synthetic OLD-grammar bundle (camel role leaves), hand-built, the live export is kebab now.
    const bundleOld = JSON.parse(JSON.stringify(bundleB).replaceAll('"on-surface"', '"onSurface"'));
    await la.applyBundle(bundleOld, {});
    const semA = FA.collections.find((c) => c.name === "Color Roles");
    const oldSem = FA.variables.find((v) => v.variableCollectionId === semA.id && v.name === "neutral/onSurface");
    if (!oldSem) { FAIL("renamecap", "fixture: neutral/onSurface missing from the era-1 color apply"); }
    else {
      const keepId = oldSem.id;
      await la.applyBundle(bundleB, { renames: { semantic: { "neutral/onSurface": "neutral/on-surface" } } });
      const nv = FA.variables.find((v) => v.variableCollectionId === semA.id && v.name === "neutral/on-surface");
      if (!nv) FAIL("renamecap", "color semantic rename missing");
      else if (nv.id !== keepId) FAIL("renamecap", "color semantic rename minted a NEW variable (id changed)");
    }
  } catch (e) { FAIL("renamecap", "color rename capability threw: " + e.message); }
}

// ── TKT-0024: PROVENANCE, apply must NEVER canonicalize a USER's own pre-existing same-named collection
//    for Color Primitives/Color Roles either, the exact guarantee the float path has had since #155
//    (see "floatprov" above), back-ported to ensureCollection via COLOR_REGISTRY_KEY. Fresh mock so the
//    user's "Color Primitives"/"Color Roles" are the ONLY ones of that name until apply runs. ──
if (applyBundle) {
  try {
    const FC = mockFigma();
    const lc = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle };")(FC.figma, "<html>", undefined);
    const userRaw = FC.figma.variables.createVariableCollection("Color Primitives"); // the user's own, pre-existing
    FC.figma.variables.createVariable("user/keepme", userRaw, "COLOR").setValueForMode(userRaw.modes[0].modeId, { r: 1, g: 0, b: 0, a: 1 });
    const userSem = FC.figma.variables.createVariableCollection("Color Roles"); // the user's own, pre-existing
    FC.figma.variables.createVariable("user/keepme-sem", userSem, "COLOR").setValueForMode(userSem.modes[0].modeId, { r: 0, g: 1, b: 0, a: 1 });
    const bundleC = figmaBundle(defaultDocument());
    await lc.applyBundle(bundleC, {});
    if (FC.collections.filter((c) => c.name === "Color Primitives").length !== 2) FAIL("colorprov", `expected the user's Color Primitives + a separate plugin-created one (2), got ${FC.collections.filter((c) => c.name === "Color Primitives").length}`);
    if (FC.collections.filter((c) => c.name === "Color Roles").length !== 2) FAIL("colorprov", `expected the user's Color Roles + a separate plugin-created one (2), got ${FC.collections.filter((c) => c.name === "Color Roles").length}`);
    if (!FC.variables.some((v) => v.variableCollectionId === userRaw.id && v.name === "user/keepme")) FAIL("colorprov", "apply pruned/removed a variable from the user's OWN Color Primitives collection");
    if (!FC.variables.some((v) => v.variableCollectionId === userSem.id && v.name === "user/keepme-sem")) FAIL("colorprov", "apply pruned/removed a variable from the user's OWN Color Roles collection");
    if (userRaw.modes[0].name !== "Mode 1") FAIL("colorprov", "apply renamed the default mode of the user's OWN Color Primitives collection");
    if (userSem.modes[0].name !== "Mode 1") FAIL("colorprov", "apply renamed the default mode of the user's OWN Color Roles collection");
    if (userSem.modes.length !== 1) FAIL("colorprov", "apply added a mode (e.g. Dark) to the user's OWN Color Roles collection");
    // re-apply: reconcile OURS by id (the registry persisted), never touching the user's collections again
    await lc.applyBundle(bundleC, {});
    if (FC.collections.filter((c) => c.name === "Color Primitives").length !== 2) FAIL("colorprov", "re-apply made a 3rd Color Primitives (provenance registry not persisted to root pluginData)");
    if (FC.collections.filter((c) => c.name === "Color Roles").length !== 2) FAIL("colorprov", "re-apply made a 3rd Color Roles (provenance registry not persisted to root pluginData)");
  } catch (e) { FAIL("colorprov", "provenance guard threw: " + e.message); }
}

// ── colorlibrary (#673): "published library" mode covers applyBundle's COLOR reconcile too. #629
//    threaded the flag into the float, font-mode and style prunes and left color on the classic prune
//    by ruling Q1; #673 retired that exemption. libraryMode:true must remove NOTHING from any of the
//    three generated color collections: a stale name is renamed under "_deprecated/" instead, keeping
//    its id and every consumer binding. libraryMode:false must prune exactly as before.
//
//    THREE SITES, THREE LEGS. applyBundle prunes Color Roles, Color Primitives AND Color Prime. #629's
//    own PR review found a style guard that read correct at both its sites but was only ever exercised
//    at one, because the fixture never made a name stale at the other. So each collection is asserted
//    on its own: a guard applied to only one or two of the three reds on the collections it missed.
//
//    THE FIXTURE drops a whole PALETTE FAMILY from the doc between two applies. Every one of that
//    family's names goes stale at once, in all three collections, which is exactly the published-library
//    accident this ticket exists to prevent. ──
if (applyBundle) {
  try {
    const docFull = defaultDocument();
    const docCut = { ...docFull, palettes: docFull.palettes.slice(0, -1) };
    const dropped = docFull.palettes[docFull.palettes.length - 1];
    const bundleFull = figmaBundle(docFull);
    const bundleCut = figmaBundle(docCut);
    // the names the FULL bundle wants and the CUT one does not, per collection, computed from the
    // bundles themselves, not from the apply's own report, so the assertions have an independent count.
    const leaves = (node, prefix) => {
      const out = [];
      for (const k of Object.keys(node).filter((x) => x[0] !== "$")) {
        const c = node[k]; const path = prefix ? prefix + "/" + k : k;
        if (c && typeof c === "object" && "$value" in c) out.push(path);
        else if (c && typeof c === "object") out.push(...leaves(c, path));
      }
      return out;
    };
    const PRIME_RE = /^([^/]+)\/prime\/([^/]+)$/;
    const splitRaw = (b) => {
      const raw = [], prime = [];
      for (const n of leaves(b["palette.tokens.json"], "")) {
        const m = PRIME_RE.exec(n);
        if (m) prime.push(m[1] + "/" + m[2]); else raw.push(n);
      }
      return { raw, prime };
    };
    const semNames = (b) => leaves(b["Light_tokens.json"], "");
    const staleOf = (full, cut) => full.filter((n) => cut.indexOf(n) < 0);
    const fullRaw = splitRaw(bundleFull), cutRaw = splitRaw(bundleCut);
    const stale = {
      "Color Roles": staleOf(semNames(bundleFull), semNames(bundleCut)),
      "Color Primitives": staleOf(fullRaw.raw, cutRaw.raw),
      "Color Prime": staleOf(fullRaw.prime, cutRaw.prime),
    };
    const COLLS = Object.keys(stale);
    for (const cn of COLLS) if (!stale[cn].length) FAIL("colorlibrary", `fixture: dropping the '${dropped && dropped.name}' palette left NO stale name in ${cn}: the leg would be vacuous`);

    // ── LEG 1: libraryMode:true prunes nothing, anywhere ──
    const FL = mockFigma();
    const ll = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle };")(FL.figma, "<html>", undefined);
    await ll.applyBundle(bundleFull, {});
    const idsBefore = {};
    for (const cn of COLLS) {
      const coll = FL.collections.find((c) => c.name === cn);
      if (!coll) { FAIL("colorlibrary", `no ${cn} collection after the first apply`); continue; }
      idsBefore[cn] = {};
      for (const n of stale[cn]) {
        const v = FL.variables.find((x) => x.variableCollectionId === coll.id && x.name === n);
        if (v) idsBefore[cn][n] = v.id;
      }
      if (Object.keys(idsBefore[cn]).length !== stale[cn].length) FAIL("colorlibrary", `fixture: ${cn} is missing ${stale[cn].length - Object.keys(idsBefore[cn]).length} of the names the full bundle should have created`);
    }
    const resLib = await ll.applyBundle(bundleCut, { libraryMode: true });
    if (resLib.pruned !== 0) FAIL("colorlibrary", `libraryMode:true pruned ${resLib.pruned} color variable(s): a published library must never remove a name a consumer file is bound to`);
    const totalStale = COLLS.reduce((a, cn) => a + stale[cn].length, 0);
    if (resLib.preserved !== totalStale) FAIL("colorlibrary", `libraryMode:true reported ${resLib.preserved} preserved, want ${totalStale} (every stale name in all three collections)`);
    for (const cn of COLLS) {
      const coll = FL.collections.find((c) => c.name === cn);
      if (!coll) continue;
      const live = FL.variables.filter((v) => v.variableCollectionId === coll.id);
      const missing = stale[cn].filter((n) => !live.some((v) => v.id === idsBefore[cn][n]));
      if (missing.length) FAIL("colorlibrary", `libraryMode:true removed ${missing.length} stale variable(s) from ${cn} (e.g. ${missing[0]}): the guard is missing at this prune site`);
      const notDeprecated = stale[cn].filter((n) => { const v = live.find((x) => x.id === idsBefore[cn][n]); return v && v.name !== "_deprecated/" + n; });
      if (notDeprecated.length) FAIL("colorlibrary", `libraryMode:true kept ${notDeprecated.length} stale ${cn} variable(s) under the ORIGINAL name (e.g. ${notDeprecated[0]}): a preserved name must be renamed under _deprecated/`);
      const rep = (resLib.colorReports || []).find((x) => x.collection === cn);
      if (!rep) FAIL("colorlibrary", `no colorReports entry for ${cn}`);
      else {
        if (rep.removed.length) FAIL("colorlibrary", `${cn}'s library-mode report lists ${rep.removed.length} removed name(s); it must be empty`);
        if (rep.deprecates.length !== stale[cn].length) FAIL("colorlibrary", `${cn}'s library-mode report lists ${rep.deprecates.length} deprecates, want ${stale[cn].length}`);
      }
    }
    // idempotent: a SECOND library-mode apply of the same cut bundle must not re-deprecate or remove.
    const resLib2 = await ll.applyBundle(bundleCut, { libraryMode: true });
    if (resLib2.pruned !== 0 || resLib2.preserved !== 0) FAIL("colorlibrary", `a repeat libraryMode:true apply reported pruned=${resLib2.pruned} preserved=${resLib2.preserved}: an already-deprecated name must be a no-op`);

    // ── LEG 2: libraryMode:false reproduces today's prune, on a fresh file ──
    const FC2 = mockFigma();
    const lc2 = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle };")(FC2.figma, "<html>", undefined);
    await lc2.applyBundle(bundleFull, {});
    const resCla = await lc2.applyBundle(bundleCut, { libraryMode: false });
    if (resCla.pruned !== totalStale) FAIL("colorlibrary", `libraryMode:false pruned ${resCla.pruned}, want ${totalStale}: the classic prune must be unchanged`);
    if (resCla.preserved !== 0) FAIL("colorlibrary", `libraryMode:false preserved ${resCla.preserved}: the classic prune keeps nothing`);
    for (const cn of COLLS) {
      const coll = FC2.collections.find((c) => c.name === cn);
      if (!coll) continue;
      const live = FC2.variables.filter((v) => v.variableCollectionId === coll.id).map((v) => v.name);
      const left = stale[cn].filter((n) => live.indexOf(n) >= 0 || live.indexOf("_deprecated/" + n) >= 0);
      if (left.length) FAIL("colorlibrary", `libraryMode:false left ${left.length} stale variable(s) in ${cn} (e.g. ${left[0]}): the classic prune must still remove them`);
      const rep = (resCla.colorReports || []).find((x) => x.collection === cn);
      if (!rep) FAIL("colorlibrary", `no classic-mode colorReports entry for ${cn}`);
      else if (rep.removed.length !== stale[cn].length) FAIL("colorlibrary", `${cn}'s classic report lists ${rep.removed.length} removed, want ${stale[cn].length}`);
    }
    // an OMITTED libraryMode (an old pre-#629 ui.html bundle) resolves to the classic prune, never to a
    // dialog and never to preservation, the same legacy resolution the float executors give it.
    const FC3 = mockFigma();
    const lc3 = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle };")(FC3.figma, "<html>", undefined);
    await lc3.applyBundle(bundleFull, {});
    const resUndef = await lc3.applyBundle(bundleCut, {});
    if (resUndef.pruned !== totalStale || resUndef.preserved !== 0) FAIL("colorlibrary", `an omitted libraryMode pruned ${resUndef.pruned}/preserved ${resUndef.preserved}, want ${totalStale}/0: undefined must resolve to the classic prune`);

    // ── LEG 3: the theme-MODE prune. applyBundle has a SECOND destructive site: Color Roles carries
    // one MODE per theme, and a theme the doc no longer carries is removeMode'd. A consumer file pinned
    // to that mode loses its binding exactly as it would lose a removed variable, which is why #629's
    // ruling Q2 already settled that a mode prune is guarded like a variable prune. The variables are
    // NOT stale on this leg (every theme shares one name set), so it measures the mode axis alone.
    const bundleOneTheme = { ...bundleFull };
    delete bundleOneTheme["Dark_tokens.json"];
    const droppedTheme = bundleFull["Dark_tokens.json"] && bundleFull["Dark_tokens.json"].$extensions;
    const droppedMode = droppedTheme && droppedTheme["com.figma.modeName"];
    if (!droppedMode || Object.keys(bundleOneTheme).filter((k) => k !== "palette.tokens.json").length !== 1) {
      FAIL("colorlibrary", "fixture: dropping Dark_tokens.json did not leave a single-theme bundle with a named mode to lose");
    } else {
      const FM = mockFigma();
      const lm = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle };")(FM.figma, "<html>", undefined);
      await lm.applyBundle(bundleFull, { libraryMode: true });
      const semM = FM.collections.find((c) => c.name === "Color Roles");
      if (!semM || !semM.modes.some((m) => m.name === droppedMode)) FAIL("colorlibrary", `fixture: Color Roles has no '${droppedMode}' mode after the full apply`);
      else {
        const resM = await lm.applyBundle(bundleOneTheme, { libraryMode: true });
        if (!semM.modes.some((m) => m.name === droppedMode)) FAIL("colorlibrary", `libraryMode:true removed the stale '${droppedMode}' theme mode from Color Roles: a published collection's mode must survive, every consumer file pinned it`);
        if (!(resM.staleModes || []).includes(droppedMode)) FAIL("colorlibrary", `libraryMode:true did not report '${droppedMode}' in staleModes: a kept mode must be disclosed, or it reads as a prune that silently failed`);
        const repM = (resM.colorReports || []).find((x) => x.collection === "Color Roles");
        if (!repM || !(repM.staleModes || []).includes(droppedMode)) FAIL("colorlibrary", `the Color Roles colorReports entry does not carry '${droppedMode}' in staleModes`);
      }
      // the SAME theme drop with the flag off still removes the mode, unchanged.
      const FM2 = mockFigma();
      const lm2 = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle };")(FM2.figma, "<html>", undefined);
      await lm2.applyBundle(bundleFull, { libraryMode: false });
      const resM2 = await lm2.applyBundle(bundleOneTheme, { libraryMode: false });
      const semM2 = FM2.collections.find((c) => c.name === "Color Roles");
      if (semM2 && semM2.modes.some((m) => m.name === droppedMode)) FAIL("colorlibrary", `libraryMode:false left the stale '${droppedMode}' theme mode standing: the classic mode prune must be unchanged`);
      if ((resM2.staleModes || []).length) FAIL("colorlibrary", `libraryMode:false reported ${resM2.staleModes.length} staleModes: the classic path keeps none`);
    }

    // ── LEG 4: the MESSAGE HANDLER threads msg.libraryMode into applyBundle. The two legs above call
    // applyBundle directly, so they stay green even if the handler never passes the flag, which is
    // exactly the shape of the gap #673 closes. This leg drives the real "apply" message instead.
    const FH = mockFigma();
    new Function("figma", "__html__", "module", code)(FH.figma, "<html>", undefined);
    if (typeof FH.figma.ui._h !== "function") FAIL("colorlibrary", "the plugin never registered a ui.onmessage handler");
    else {
      await FH.figma.ui._h({ type: "apply", dtcg: bundleFull, libraryMode: true });
      await FH.figma.ui._h({ type: "apply", dtcg: bundleCut, libraryMode: true });
      for (const cn of COLLS) {
        const coll = FH.collections.find((c) => c.name === cn);
        if (!coll) { FAIL("colorlibrary", `no ${cn} collection after the handler-driven apply`); continue; }
        const live = FH.variables.filter((v) => v.variableCollectionId === coll.id).map((v) => v.name);
        const lost = stale[cn].filter((n) => live.indexOf("_deprecated/" + n) < 0);
        if (lost.length) FAIL("colorlibrary", `the apply MESSAGE with libraryMode:true lost ${lost.length} stale ${cn} variable(s) (e.g. ${lost[0]}): the handler is not threading the flag into applyBundle`);
      }
      const FH2 = mockFigma();
      new Function("figma", "__html__", "module", code)(FH2.figma, "<html>", undefined);
      await FH2.figma.ui._h({ type: "apply", dtcg: bundleFull, libraryMode: false });
      await FH2.figma.ui._h({ type: "apply", dtcg: bundleCut, libraryMode: false });
      for (const cn of COLLS) {
        const coll = FH2.collections.find((c) => c.name === cn);
        if (!coll) continue;
        const live = FH2.variables.filter((v) => v.variableCollectionId === coll.id).map((v) => v.name);
        const kept = stale[cn].filter((n) => live.indexOf(n) >= 0 || live.indexOf("_deprecated/" + n) >= 0);
        if (kept.length) FAIL("colorlibrary", `the apply MESSAGE with libraryMode:false kept ${kept.length} stale ${cn} variable(s) (e.g. ${kept[0]}): an unchecked box must still take the classic prune`);
      }
    }
  } catch (e) { FAIL("colorlibrary", "the color library-mode legs threw: " + e.message); }
}

// ── staleskip (#689): a stale name whose "_deprecated/" slot is ALREADY TAKEN is skipped by the
//    dedupe guard (`byName[r.to]`) and left LIVE, reported nowhere. Minimal repro (the #673
//    reviewer's own sequence on Color Prime): full, cut (deprecates the family), full (re-adds it
//    FRESH; the deprecated copy is untouched), cut again (the fresh copy wants the SAME
//    "_deprecated/" slot the first drop already took: collision. Same class exists at THREE sites:
//    applyBundle's color reconcile, applyFloatPlans' deprecates loop, applyFontPrimitivesModes'
//    deprecates loop, each covered on its own below.
if (applyBundle) {
  try {
    const docFull = defaultDocument();
    const docCut = { ...docFull, palettes: docFull.palettes.slice(0, -1) };
    const bundleFull = figmaBundle(docFull);
    const bundleCut = figmaBundle(docCut);
    const FS = mockFigma();
    const ls = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle };")(FS.figma, "<html>", undefined);
    await ls.applyBundle(bundleFull, { libraryMode: true }); // 1: full
    await ls.applyBundle(bundleCut, { libraryMode: true }); // 2: drop, family deprecated
    await ls.applyBundle(bundleFull, { libraryMode: true }); // 3: re-add, a FRESH family is created
    const res4 = await ls.applyBundle(bundleCut, { libraryMode: true }); // 4: drop again, collision
    if (!res4.skipped || !res4.skipped.length) FAIL("staleskip", `a fourth color apply (drop, re-add, drop) reported no skipped names (res4.skipped=${JSON.stringify(res4.skipped)}): the "_deprecated/" collision must be reported, not silently left live`);
    else {
      const liveNames = FS.variables.map((v) => v.name);
      const stillLive = res4.skipped.filter((n) => liveNames.indexOf(n) >= 0);
      if (!stillLive.length) FAIL("staleskip", `res4.skipped named ${JSON.stringify(res4.skipped)}, none of which are actually live in the mock (fixture mismatch)`);
      // the per-collection colorReports entry must ALSO carry the skip (not just the top-level rollup).
      const anyRepSkipped = (res4.colorReports || []).some((r) => (r.skipped || []).length);
      if (!anyRepSkipped) FAIL("staleskip", "no colorReports entry carries a non-empty skipped array");
    }
  } catch (e) { FAIL("staleskip", "the color stale-skip leg threw: " + e.message); }
} else {
  FAIL("staleskip", "code.js exported no applyBundle");
}

// ── staleskip float (#689): the SAME collision, in applyFloatPlans' own deprecates loop, on a
//    synthetic collection (drop/re-add/drop a variable, not a real breakpoint mode). ──
if (applyFloatPlans) {
  try {
    const synthVarSK = (name, value) => ({ name, type: "FLOAT", values: [{ mode: "Base", value }] });
    const twoVarPlanSK = () => [{ collection: "SynthSkip", modes: ["Base"], defaultMode: "Base", addModes: [], variables: [synthVarSK("a", 1), synthVarSK("b", 2)] }];
    const oneVarPlanSK = () => [{ collection: "SynthSkip", modes: ["Base"], defaultMode: "Base", addModes: [], variables: [synthVarSK("a", 1)] }];
    const FSF = mockFigma();
    const asf = new Function("figma", "__html__", "module", code + "\nreturn { applyFloatPlans };")(FSF.figma, "<html>", undefined).applyFloatPlans;
    await asf(twoVarPlanSK(), { libraryMode: true }); // 1: a, b
    await asf(oneVarPlanSK(), { libraryMode: true }); // 2: b -> _deprecated/b
    await asf(twoVarPlanSK(), { libraryMode: true }); // 3: fresh b created
    const res4f = await asf(oneVarPlanSK(), { libraryMode: true }); // 4: collision
    if (!res4f.skipped || !res4f.skipped.length) FAIL("staleskipfloat", `a fourth float apply (drop, re-add, drop) reported no skipped names (res4f.skipped=${JSON.stringify(res4f.skipped)}): the "_deprecated/" collision must be reported`);
    else {
      const liveNamesF = FSF.variables.map((v) => v.name);
      if (!res4f.skipped.some((n) => liveNamesF.indexOf(n) >= 0)) FAIL("staleskipfloat", `res4f.skipped named ${JSON.stringify(res4f.skipped)}, none of which are actually live in the mock (fixture mismatch)`);
      const anyRepSkippedF = (res4f.libraryReports || []).some((r) => (r.skipped || []).length);
      if (!anyRepSkippedF) FAIL("staleskipfloat", "no libraryReports entry carries a non-empty skipped array");
    }
  } catch (e) { FAIL("staleskipfloat", "the float stale-skip leg threw: " + e.message); }
} else {
  FAIL("staleskipfloat", "code.js exported no applyFloatPlans");
}

// ── staleskip font primitives (#689): the SAME collision, in applyFontPrimitivesModes' deprecates
//    loop (a similar guard at code.js's Type Primitives site, not just the float/color sites above). ──
if (applyFontPrimitivesModes) {
  try {
    const planSK = (names) => ({ collection: "TypePrimSkip", modes: ["Value"], defaultMode: "Value", addModes: [], variables: names.map((n) => ({ name: n, type: "STRING", values: [{ mode: "Value", value: "x" }] })) });
    const FSP = mockFigma();
    const asp = new Function("figma", "__html__", "module", code + "\nreturn { applyFontPrimitivesModes };")(FSP.figma, "<html>", undefined).applyFontPrimitivesModes;
    await asp(planSK(["font/a", "font/b"]), { libraryMode: true }); // 1: a, b
    await asp(planSK(["font/a"]), { libraryMode: true }); // 2: font/b -> _deprecated/font/b
    await asp(planSK(["font/a", "font/b"]), { libraryMode: true }); // 3: fresh font/b created
    const res4p = await asp(planSK(["font/a"]), { libraryMode: true }); // 4: collision
    const skippedP = (res4p && res4p.libraryReport && res4p.libraryReport.skipped) || [];
    if (!skippedP.length) FAIL("staleskipfontprim", `a fourth Font Primitives apply (drop, re-add, drop) reported no skipped names (libraryReport.skipped=${JSON.stringify(skippedP)}): the "_deprecated/" collision must be reported`);
    else {
      const liveNamesP = FSP.variables.map((v) => v.name);
      if (!skippedP.some((n) => liveNamesP.indexOf(n) >= 0)) FAIL("staleskipfontprim", `libraryReport.skipped named ${JSON.stringify(skippedP)}, none of which are actually live in the mock (fixture mismatch)`);
    }
  } catch (e) { FAIL("staleskipfontprim", "the Font Primitives stale-skip leg threw: " + e.message); }
} else {
  FAIL("staleskipfontprim", "code.js exported no applyFontPrimitivesModes");
}

// ── staleskip notice (#689 + folded #687 review finding 4): the completion notice (figma.notify)
//    must NAME both counts: a kept stale Type/Geometry breakpoint MODE (the float "stale kept"
//    counter #687 left off) and a skipped stale NAME (this ticket's own gap), driven through the
//    REAL message handler, exactly like "applysys"/"colorlibrary" LEG 4 above. ──
{
  // D1: a kept breakpoint mode (float) must be named in the notice, with its count.
  const FD1 = mockFigma();
  new Function("figma", "__html__", "module", code)(FD1.figma, "<html>", undefined);
  const synthVarD = (name, value) => ({ name, type: "FLOAT", values: [{ mode: "Base", value }] });
  const twoModePlanD = [{ collection: "SynthNotice", modes: ["Base", "Mobile"], defaultMode: "Base", addModes: ["Mobile"], variables: [synthVarD("a", 1)] }];
  const oneModePlanD = [{ collection: "SynthNotice", modes: ["Base"], defaultMode: "Base", addModes: [], variables: [synthVarD("a", 1)] }];
  await FD1.figma.ui._h({ type: "apply", floatPlans: twoModePlanD });
  FD1.figma._notified.length = 0; // only the SECOND apply's notice is under test
  await FD1.figma.ui._h({ type: "apply", floatPlans: oneModePlanD, libraryMode: true });
  const noticeD1 = FD1.figma._notified.find((m) => typeof m === "string" && m.indexOf("Applied") === 0);
  if (!noticeD1) FAIL("staleskipnotice", `no "Applied…" completion notice was posted; got ${JSON.stringify(FD1.figma._notified)}`);
  else if (!/1 stale kept \(published library\)/.test(noticeD1)) FAIL("staleskipnotice", `a kept stale Type/Geometry breakpoint mode under libraryMode:true produced no "N stale kept" notice: "${noticeD1}"`);

  // D2: a skipped stale NAME (this ticket) must be named in the notice, with its count, driven by
  // the SAME 4-apply drop/re-add/drop color sequence above, through the real message handler.
  if (applyBundle) {
    const docFullD = defaultDocument();
    const docCutD = { ...docFullD, palettes: docFullD.palettes.slice(0, -1) };
    const bundleFullD = figmaBundle(docFullD);
    const bundleCutD = figmaBundle(docCutD);
    const FD2 = mockFigma();
    new Function("figma", "__html__", "module", code)(FD2.figma, "<html>", undefined);
    await FD2.figma.ui._h({ type: "apply", dtcg: bundleFullD, libraryMode: true }); // 1
    await FD2.figma.ui._h({ type: "apply", dtcg: bundleCutD, libraryMode: true }); // 2
    await FD2.figma.ui._h({ type: "apply", dtcg: bundleFullD, libraryMode: true }); // 3
    FD2.figma._notified.length = 0; // only the FOURTH apply's notice is under test
    const warned = [];
    const realWarn = console.warn;
    console.warn = (...a) => { warned.push(a.join(" ")); };
    try { await FD2.figma.ui._h({ type: "apply", dtcg: bundleCutD, libraryMode: true }); } // 4: collision
    finally { console.warn = realWarn; }
    // #689 review F1: the notice carries only a count, so the NAMES must reach the console.
    const skipWarn = warned.find((w) => w.indexOf("stale color name(s), left live") >= 0);
    if (!skipWarn) FAIL("staleskipnotice", `the 4th color apply skipped names but no console.warn named them; warns: ${JSON.stringify(warned)}`);
    else if (!/taken: \S/.test(skipWarn)) FAIL("staleskipnotice", `the color skip warn lists no names: "${skipWarn}"`);
    const noticeD2 = FD2.figma._notified.find((m) => typeof m === "string" && m.indexOf("Applied") === 0);
    if (!noticeD2) FAIL("staleskipnotice", `no "Applied…" completion notice was posted for the 4th apply; got ${JSON.stringify(FD2.figma._notified)}`);
    else if (!/\d+ stale skipped \(rename target taken\)/.test(noticeD2)) FAIL("staleskipnotice", `a skipped stale name under libraryMode:true produced no "N stale skipped" notice: "${noticeD2}"`);
  }
}

// ── adoptconsent (#632): a live collection matching a target name that ISN'T registry-tracked (a file
//    applied to under the pre-rename plugin id, or a hand-made collection) is now OFFERED for adoption
//    through a real modal, once, BEFORE any write. Confirmed => the apply upserts INTO that collection
//    (same id, no duplicate, registry seeded); declined => today's unchanged behaviour, a separate
//    collection (colorprov above proves that path in full). A name that already resolves live through
//    the registry is never offered at all (the #492 MAJOR-1 guard). Driven through the REAL message
//    handler, since the consent pass runs there, ahead of applyBundle/applyFloatPlans. ──
if (applyBundle) {
  const bundleAd = figmaBundle(defaultDocument());
  const COLOR_REG = "ultimate-tokens-color-collections";
  const FLOAT_REG = "ultimate-tokens-float-collections";
  const regOf = (F, key) => { try { return JSON.parse(F.figma.root.getPluginData(key) || "{}"); } catch (e) { return {}; } };
  // (a)+(b) ACCEPT: asked exactly once, resolves to the EXISTING collection id, no duplicate, registry seeded.
  try {
    const FE = mockFigma();
    new Function("figma", "__html__", "module", code)(FE.figma, "<html>", undefined); // registers the app's onmessage
    FE.figma._adoptAnswer = true;
    const orphan = FE.figma.variables.createVariableCollection("Color Roles"); // live, but NOT registry-tracked
    FE.figma.variables.createVariable("foreign/leftover", orphan, "COLOR").setValueForMode(orphan.modes[0].modeId, { r: 0, g: 1, b: 0, a: 1 });
    await FE.figma.ui._h({ type: "apply", dtcg: bundleAd });
    if (FE.figma._showUICalls !== 1) FAIL("adoptconsent", `expected exactly 1 adoption prompt, got ${FE.figma._showUICalls}`);
    const semAd = FE.collections.filter((c) => c.name === "Color Roles");
    if (semAd.length !== 1) FAIL("adoptconsent", `confirmed adoption must NOT create a second Color Roles collection, got ${semAd.length}`);
    else if (semAd[0] !== orphan) FAIL("adoptconsent", "confirmed adoption minted a NEW collection instead of resolving to the existing one (bindings would orphan)");
    if (!FE.variables.some((v) => v.variableCollectionId === orphan.id && v.name === "neutral/on-surface")) FAIL("adoptconsent", "adoption did not upsert role variables INTO the adopted collection");
    if (regOf(FE, COLOR_REG)["Color Roles"] !== orphan.id) FAIL("adoptconsent", `the colour registry was not seeded with the adopted collection id (got ${JSON.stringify(regOf(FE, COLOR_REG)["Color Roles"])}, want ${orphan.id})`);
    // the dialog promises the collection is taken over and reconciled: prove the prune actually happens,
    // so the disclosure isn't describing behaviour the code doesn't have.
    if (FE.variables.some((v) => v.variableCollectionId === orphan.id && v.name === "foreign/leftover")) FAIL("adoptconsent", "an adopted collection must be fully reconciled (the dialog says so): a variable outside the apply survived");
    if (!FE.figma.ui._posted.some((m) => m && m.type === "apply-done")) FAIL("adoptconsent", "a confirmed adoption apply posted no {apply-done} (the apply did not complete)");
    // the app iframe + its message handler come back after the modal borrowed the single plugin ui:
    // prove it by SERVING a later request, not by type-checking the slot (the dialog's own handler is
    // a function too, so a typeof check would pass with the restore deleted).
    FE.figma.ui._posted.length = 0;
    await FE.figma.ui._h({ type: "list-fonts" });
    if (!FE.figma.ui._posted.some((m) => m && m.type === "fonts-listed")) FAIL("adoptconsent", "the app's own message handler was not restored after the adoption dialog: a later UI request went unanswered");
    // SECOND apply: the registry now tracks it by id, so no re-ask and no duplicate.
    FE.figma._showUICalls = 0;
    await FE.figma.ui._h({ type: "apply", dtcg: bundleAd });
    if (FE.figma._showUICalls !== 0) FAIL("adoptconsent", `a second apply must not re-ask about an already-adopted collection, got ${FE.figma._showUICalls} prompt(s)`);
    if (FE.collections.filter((c) => c.name === "Color Roles").length !== 1) FAIL("adoptconsent", "re-apply after adoption duplicated the collection");
  } catch (e) { FAIL("adoptconsent", "the confirmed-adoption leg threw: " + e.message); }
  // (c) DECLINE: asked once, the orphan is left completely alone, a separate collection is created (today's behaviour).
  try {
    const FF = mockFigma();
    new Function("figma", "__html__", "module", code)(FF.figma, "<html>", undefined);
    FF.figma._adoptAnswer = false;
    const orphan = FF.figma.variables.createVariableCollection("Color Roles");
    FF.figma.variables.createVariable("foreign/leftover", orphan, "COLOR").setValueForMode(orphan.modes[0].modeId, { r: 0, g: 1, b: 0, a: 1 });
    await FF.figma.ui._h({ type: "apply", dtcg: bundleAd });
    if (FF.figma._showUICalls !== 1) FAIL("adoptconsent", `decline leg: expected exactly 1 prompt, got ${FF.figma._showUICalls}`);
    const semDec = FF.collections.filter((c) => c.name === "Color Roles");
    if (semDec.length !== 2) FAIL("adoptconsent", `decline leg: expected the orphan + a separate plugin-created collection (2), got ${semDec.length}`);
    if (!FF.variables.some((v) => v.variableCollectionId === orphan.id && v.name === "foreign/leftover")) FAIL("adoptconsent", "decline leg: the declined collection was written to anyway");
    if (orphan.modes[0].name !== "Mode 1" || orphan.modes.length !== 1) FAIL("adoptconsent", "decline leg: the declined collection's modes were touched");
    if (regOf(FF, COLOR_REG)["Color Roles"] === orphan.id) FAIL("adoptconsent", "decline leg: the registry was seeded with the declined collection's id");
    // the restore is unconditional in confirmAdopt, so it must be proven on the DECLINE branch too, not
    // only on accept: decline is the branch a cautious user actually takes, and a restore-on-accept-only
    // regression would otherwise leave every later UI request unanswered for exactly those users.
    FF.figma.ui._posted.length = 0;
    await FF.figma.ui._h({ type: "list-fonts" });
    if (!FF.figma.ui._posted.some((m) => m && m.type === "fonts-listed")) FAIL("adoptconsent", "decline leg: the app's own message handler was not restored after a DECLINED adoption dialog: a later UI request went unanswered");
    // re-run after a decline: the fresh collection now resolves the name, so ZERO prompts and no third collection.
    FF.figma._showUICalls = 0;
    await FF.figma.ui._h({ type: "apply", dtcg: bundleAd });
    if (FF.figma._showUICalls !== 0) FAIL("adoptconsent", `decline leg: a re-run must show ZERO prompts, got ${FF.figma._showUICalls}`);
    if (FF.collections.filter((c) => c.name === "Color Roles").length !== 2) FAIL("adoptconsent", "decline leg: a re-run minted a THIRD Color Roles collection");
  } catch (e) { FAIL("adoptconsent", "the decline leg threw: " + e.message); }
  // (d) MAJOR-1 guard: a name that ALREADY resolves live through the registry is never offered, even
  //     when a same-named orphan also exists. Without the guard, confirming here would re-point the
  //     registry AT the orphan and abandon the collection actually in use.
  try {
    const FG2 = mockFigma();
    new Function("figma", "__html__", "module", code)(FG2.figma, "<html>", undefined);
    FG2.figma._adoptAnswer = true; // would adopt if ever asked
    await FG2.figma.ui._h({ type: "apply", dtcg: bundleAd }); // era 1: creates + registers our own
    const ours = FG2.collections.find((c) => c.name === "Color Roles");
    const orphan = FG2.figma.variables.createVariableCollection("Color Roles"); // a same-named newcomer, untracked
    FG2.figma._showUICalls = 0;
    await FG2.figma.ui._h({ type: "apply", dtcg: bundleAd });
    if (FG2.figma._showUICalls !== 0) FAIL("adoptconsent", `guard leg: a name that already resolves live must never prompt, got ${FG2.figma._showUICalls} prompt(s)`);
    if (regOf(FG2, COLOR_REG)["Color Roles"] !== ours.id) FAIL("adoptconsent", "guard leg: the registry was re-pointed away from the collection actually in use");
    if (FG2.variables.some((v) => v.variableCollectionId === orphan.id)) FAIL("adoptconsent", "guard leg: the apply wrote into the untracked namesake");
  } catch (e) { FAIL("adoptconsent", "the already-resolves-live guard leg threw: " + e.message); }
  // (f) MAJOR-1 ORDERING: answering the dialog reboots the app iframe, and a freshly booted app reloads
  //     the config embedded in the file. That config must already be the one being APPLIED, which means
  //     writeConfig has to run before the consent pass, not after the apply where it used to sit. The mock
  //     has no iframe, so this reads the embedded config at the exact moment the app bundle is re-shown.
  try {
    const FI = mockFigma();
    new Function("figma", "__html__", "module", code)(FI.figma, "<html>", undefined);
    FI.figma._adoptAnswer = true;
    FI.figma.root.setPluginData("ultimate-tokens-config", JSON.stringify({ name: "previous-apply" })); // an earlier apply's params
    FI.figma.variables.createVariableCollection("Color Roles"); // live, untracked: forces one prompt
    await FI.figma.ui._h({ type: "apply", dtcg: bundleAd, config: { name: "in-progress" } });
    if (FI.figma._showUICalls !== 1) FAIL("adoptconsent", `ordering leg: expected exactly 1 prompt, got ${FI.figma._showUICalls}`);
    if (FI.figma._restoreCalls < 2) FAIL("adoptconsent", `ordering leg: expected the module-top boot plus one restore re-show (2+), got ${FI.figma._restoreCalls}`);
    let atRestore = null;
    try { atRestore = JSON.parse(FI.figma._configAtRestore || "null"); } catch (e) { atRestore = null; }
    if (!atRestore || atRestore.name !== "in-progress") FAIL("adoptconsent", `ordering leg: the rebooted app would reload ${JSON.stringify(atRestore && atRestore.name)}, not the config being applied: writeConfig must run BEFORE the adoption dialog reboots the iframe`);
  } catch (e) { FAIL("adoptconsent", "the config-ordering leg threw: " + e.message); }
  // (e) the FLOAT call site: the same consent pass covers the Type/Geometry collections, whose registry
  //     is pre-seeded before applyFloatPlans runs (its own ensureFloatCollection stays untouched).
  try {
    const FH = mockFigma();
    new Function("figma", "__html__", "module", code)(FH.figma, "<html>", undefined);
    FH.figma._adoptAnswer = true;
    const orphanGeo = FH.figma.variables.createVariableCollection("Geometry"); // live, untracked
    const planH = modeApplyPlan(TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product" }), []));
    await FH.figma.ui._h({ type: "apply", floatPlans: planH });
    if (FH.figma._showUICalls !== 1) FAIL("adoptconsent", `float leg: expected exactly 1 prompt, got ${FH.figma._showUICalls}`);
    const geos = FH.collections.filter((c) => c.name === "Geometry");
    if (geos.length !== 1) FAIL("adoptconsent", `float leg: confirmed adoption must not create a second Geometry collection, got ${geos.length}`);
    else if (geos[0] !== orphanGeo) FAIL("adoptconsent", "float leg: confirmed adoption minted a NEW collection instead of resolving to the existing one");
    if (regOf(FH, FLOAT_REG)["Geometry"] !== orphanGeo.id) FAIL("adoptconsent", "float leg: the float registry was not seeded with the adopted collection id");
    if (!FH.variables.some((v) => v.variableCollectionId === orphanGeo.id)) FAIL("adoptconsent", "float leg: the apply wrote no variables into the adopted collection");
  } catch (e) { FAIL("adoptconsent", "the float adoption leg threw: " + e.message); }
  // (g) #676: fontPrimitivesModes riding WITHOUT stylePlans, unreachable from today's UI
  //     (apply-gate.js only ever sets fontPrimitivesModes inside the paints/texts branch), but the
  //     message handler only calls applyFontPrimitivesModes when msg.stylePlans has paints or texts,
  //     so the consent pass must mirror that guard exactly instead of depending on an invariant it
  //     doesn't assert. Without the guard, this message would prompt for and seed a Type Primitives
  //     registry entry for a collection this apply never touches, cashing that consent on a later
  //     apply that prunes it without asking again.
  //     Run over BOTH shapes of "no style work": stylePlans absent, and stylePlans PRESENT but empty.
  //     The second is the predicate's own boundary: `!!msg.stylePlans` would pass the first and fail
  //     it, so without it a broadened predicate survives the whole suite (#676 review, I-2).
  for (const [shape, extra] of [["absent", {}], ["present-but-empty", { stylePlans: { paints: [], texts: [] } }]]) {
    try {
      const FJ = mockFigma();
      new Function("figma", "__html__", "module", code)(FJ.figma, "<html>", undefined);
      FJ.figma._adoptAnswer = true; // would adopt if ever asked
      FJ.figma.variables.createVariableCollection("Type Primitives"); // live, untracked, by name not registry
      const bareFontPrimitivesModes = { collection: "Type Primitives", modes: ["Value"], defaultMode: "Value", addModes: [], variables: [] };
      await FJ.figma.ui._h({ type: "apply", fontPrimitivesModes: bareFontPrimitivesModes, ...extra });
      if (FJ.figma._showUICalls !== 0) FAIL("adoptconsent", `fontPrimitivesModes-without-stylePlans leg (stylePlans ${shape}): expected ZERO consent prompts, got ${FJ.figma._showUICalls}`);
      if (regOf(FJ, FLOAT_REG)["Type Primitives"] !== undefined) FAIL("adoptconsent", `fontPrimitivesModes-without-stylePlans leg (stylePlans ${shape}): the float registry was seeded for a collection this apply never touches`);
    } catch (e) { FAIL("adoptconsent", `the fontPrimitivesModes-without-stylePlans leg (stylePlans ${shape}) threw: ` + e.message); }
  }
  // (h) POSITIVE CONTROL for (g): the identical fontPrimitivesModes plan, but WITH a non-empty
  //     stylePlans riding the same message, must still prompt for Type Primitives exactly as before
  //     #676: the guard adds a condition to the concat, it does not remove the legitimate consent path.
  try {
    const FK = mockFigma();
    new Function("figma", "__html__", "module", code)(FK.figma, "<html>", undefined);
    FK.figma._adoptAnswer = true;
    const orphanPrim = FK.figma.variables.createVariableCollection("Type Primitives"); // live, untracked
    const fpPlan = { collection: "Type Primitives", modes: ["Value"], defaultMode: "Value", addModes: [], variables: [] };
    await FK.figma.ui._h({ type: "apply", fontPrimitivesModes: fpPlan, stylePlans: { paints: [{ name: "x", role: "x", value: { r: 0, g: 0, b: 0, a: 1 } }], texts: [] } });
    if (FK.figma._showUICalls !== 1) FAIL("adoptconsent", `fontPrimitivesModes-with-stylePlans leg: expected exactly 1 consent prompt, got ${FK.figma._showUICalls}`);
    if (regOf(FK, FLOAT_REG)["Type Primitives"] !== orphanPrim.id) FAIL("adoptconsent", "fontPrimitivesModes-with-stylePlans leg: the float registry was not seeded with the adopted Type Primitives collection id");
  } catch (e) { FAIL("adoptconsent", "the fontPrimitivesModes-with-stylePlans leg threw: " + e.message); }
}

// ── TKT-0024: the color collections' id-preserving RENAME capability still works once ensureCollection
//    switched from name-only to registry-by-id matching, a plan.renames.collections rename adopts the
//    REGISTRY-TRACKED collection by id, renames it in place, and re-keys the registry (mirrors the float
//    "renamecap" collection leg above). ──
if (applyBundle) {
  try {
    const FD = mockFigma();
    const ld = new Function("figma", "__html__", "module", code + "\nreturn { applyBundle, setCollectionNames };")(FD.figma, "<html>", undefined);
    const bundleD = figmaBundle(defaultDocument());
    await ld.applyBundle(bundleD, {}); // era 1: default-named collections, registered under "Color Roles"
    const semD0 = FD.collections.find((c) => c.name === "Color Roles");
    const keepId = semD0.id;
    ld.setCollectionNames({ raw: "Color Primitives", semantic: "Brand Colors" }); // era 2: renamed semantic collection
    await ld.applyBundle(bundleD, { renames: { collections: { "Brand Colors": ["Color Roles"] } } });
    const semD1 = FD.collections.find((c) => c.name === "Brand Colors");
    if (!semD1) FAIL("colorrenamecap", "renameFrom did not produce the renamed Color Roles collection");
    else {
      if (semD1.id !== keepId) FAIL("colorrenamecap", "collection rename minted a NEW collection (id changed, bindings would orphan)");
      if (FD.collections.filter((c) => c.name === "Color Roles").length !== 0) FAIL("colorrenamecap", "the old-name Color Roles collection lingers after renameFrom");
    }
    // registry re-keyed: a THIRD apply under the new name must reuse the same collection, not mint another
    await ld.applyBundle(bundleD, { renames: { collections: { "Brand Colors": ["Color Roles"] } } });
    if (FD.collections.filter((c) => c.name === "Brand Colors").length !== 1) FAIL("colorrenamecap", "re-apply after renameFrom duplicated the collection (registry not re-keyed)");
  } catch (e) { FAIL("colorrenamecap", "color collection rename capability threw: " + e.message); }
}

// ── list-fonts: the UI asks which families Figma can use; the sandbox answers with families only ──
{
  const F5 = mockFigma();
  new Function("figma", "__html__", "module", code)(F5.figma, "<html>", undefined);
  await F5.figma.ui._h({ type: "list-fonts" });
  const msg = F5.figma.ui._posted.find((m) => m && m.type === "fonts-listed");
  if (!msg) FAIL("fonts", "list-fonts posted no {fonts-listed} message");
  else {
    if (!Array.isArray(msg.families) || msg.families.indexOf("Inter") < 0) FAIL("fonts", "fonts-listed carries no family list");
    if (new Set(msg.families).size !== msg.families.length) FAIL("fonts", "fonts-listed families are not deduped (one entry per family, not per face)");
    if (msg.families.some((f) => typeof f !== "string")) FAIL("fonts", "fonts-listed must carry family NAMES only");
  }
}

// ── apply FAILURE posts {apply-error} so the UI can clear its optimistic "Applying…" toast ──
{
  const F4 = mockFigma();
  new Function("figma", "__html__", "module", code)(F4.figma, "<html>", undefined);
  await F4.figma.ui._h({ type: "apply", dtcg: { "palette.tokens.json": null } }); // missing Light/Dark → applyBundle throws
  if (!F4.figma.ui._posted.some((m) => m && m.type === "apply-error")) FAIL("applydone", "a FAILED apply posted no {apply-error} message to the UI");
}

// ── resolveFace: separator/case-insensitive fuzzy match, a REAL font's style catalog doesn't agree
// on hyphen vs. space for compound weight names (this kit's own WEIGHT_NAMES: "Extra-bold",
// "Semi-bold"), and an exact-string-only match silently missed the real face, falling back to the
// nearest-weight guess (which doesn't even preserve italic), found live via BZZR's real GT America
// styles ("Condensed Extra Bold Italic", space, vs. the templated "Condensed Extra-bold Italic",
// hyphen) resolving to plain "Bold". ──
if (resolveFace) {
  const styles = ["Regular", "Condensed Bold Italic", "Condensed Extra Bold Italic", "Condensed Black Italic"];
  const exact = resolveFace(styles, { styleName: "Condensed Bold Italic", weight: 700 });
  if (exact !== "Condensed Bold Italic") FAIL("resolveface", `an exact match still wins outright (got ${exact})`);
  const fuzzy = resolveFace(styles, { styleName: "Condensed Extra-bold Italic", weight: 800 });
  if (fuzzy !== "Condensed Extra Bold Italic") FAIL("resolveface", `hyphen vs. space must fuzzy-match to the real face (got ${fuzzy}, want "Condensed Extra Bold Italic")`);
  const caseInsensitive = resolveFace(styles, { styleName: "condensed extra-bold italic", weight: 800 });
  if (caseInsensitive !== "Condensed Extra Bold Italic") FAIL("resolveface", `the fuzzy match must be case-insensitive too (got ${caseInsensitive})`);
  const noMatch = resolveFace(styles, { styleName: "Totally Unrelated Name", weight: 800 });
  if (noMatch === "Totally Unrelated Name") FAIL("resolveface", "a genuinely absent style name must still fall back to the nearest-weight guess, not itself");
  if (!styles.includes(noMatch)) FAIL("resolveface", `the nearest-weight fallback must return a REAL style from the list (got ${noMatch})`);
  // CONCATENATED compound names, found live researching New Caledonia's real catalog ("SemiBold", no
  // separator at all) while auditing preset font/weight configs: collapsing hyphen/space to ONE space
  // (the previous fix) matched "Extra Bold" but not a foundry that runs the words together entirely.
  const concatStyles = ["Regular", "SemiBold", "Bold", "Black"];
  const concatFuzzy = resolveFace(concatStyles, { styleName: "Semi-bold", weight: 600 });
  if (concatFuzzy !== "SemiBold") FAIL("resolveface", `a hyphenated name must fuzzy-match a real font's fully-concatenated style ("SemiBold", no separator) (got ${concatFuzzy})`);
  const concatFuzzySpace = resolveFace(concatStyles, { styleName: "Semi Bold", weight: 600 });
  if (concatFuzzySpace !== "SemiBold") FAIL("resolveface", `a space-separated name must ALSO fuzzy-match a fully-concatenated real style (got ${concatFuzzySpace})`);
  // DETERMINISTIC tie-break, found live via GT America's real ladder (Ultra Light/Thin/Light/Regular/
  // Medium/Bold/Black, no Extra-bold cut at all), where a wanted 800 sits EXACTLY between the real
  // Bold (700) and Black (900): must always prefer the heavier one, never whichever style happened to
  // come first in Figma's own listAvailableFontsAsync() array order (unpredictable, install-dependent).
  const tieStyles = ["Regular", "Bold", "Black"];
  const tieHeavy = resolveFace(tieStyles, { weight: 800 });
  if (tieHeavy !== "Black") FAIL("resolveface", `an exact tie between two real weights must prefer the HEAVIER one, deterministically (got ${tieHeavy})`);
  const tieHeavyReversed = resolveFace(["Black", "Bold", "Regular"], { weight: 800 });
  if (tieHeavyReversed !== "Black") FAIL("resolveface", `the tie-break must NOT depend on array order (reversed list, got ${tieHeavyReversed})`);
}

// ── styleNameWeight / resolveFace: NUMERIC instance names, Figma exposes NO variable-font axis
// metadata at all (listAvailableFontsAsync returns only {family, style} strings), so a variable font
// whose named instances are numeric ("350", "Text 550") can only be read from the style STRING itself.
// Before parsing numbers, every numerically-named style fell back to the SAME default (400) and the
// nearest-weight pick silently returned whichever one happened to be first in the array. ──
if (styleNameWeight) {
  if (styleNameWeight("350") !== 350) FAIL("resolveface", `a bare numeric style name is its own weight (got ${styleNameWeight("350")})`);
  if (styleNameWeight("Text 550") !== 550) FAIL("resolveface", `an embedded number in a style name is parsed as weight (got ${styleNameWeight("Text 550")})`);
  if (styleNameWeight("Display 800 Italic") !== 800) FAIL("resolveface", `a numeric weight survives a trailing style modifier (got ${styleNameWeight("Display 800 Italic")})`);
  if (styleNameWeight("Bold") !== 700) FAIL("resolveface", "a real word match still wins over any numeric fallback path");
}
if (resolveFace) {
  const numericStyles = ["100", "350", "550", "800 Italic"];
  const midWeight = resolveFace(numericStyles, { weight: 500 });
  if (midWeight !== "550") FAIL("resolveface", `a numerically-instanced variable font resolves to its NEAREST real weight, not the first style in the list (got ${midWeight}, want "550")`);
  const lowWeight = resolveFace(numericStyles, { weight: 120 });
  if (lowWeight !== "100") FAIL("resolveface", `nearest-weight still works at the low end of a numeric instance set (got ${lowWeight})`);
}

// ── sweepCandidates: find real styles that LOOK like ours (top "/" segment matches a namespace the
// current plan still uses) but aren't anything the current plan would produce, leftovers from an older
// naming generation that predate this plugin's own registry, so no ordinary apply/prune can reach them.
// Pure + read-only: never touches a user's own unrelated style (a different namespace entirely). ──
if (sweepCandidates) {
  const knownTexts = ["Body/lg/• regular", "Body/lg/medium", "Headline/lg/• black"];
  const knownPaints = ["Primary/onPrimary"];
  const localTexts = [
    { id: "t1", name: "Body/lg/• regular" },          // current, not a candidate
    { id: "t2", name: "Body/lg/regular" },             // legacy (no dot-prefix), candidate
    { id: "t3", name: "Body/lg/regular-single" },      // legacy (old hyphen-suffix era), candidate
    { id: "t4", name: "MyOwnCustomStyle/heading" },    // a namespace we don't use at all, NEVER a candidate
  ];
  const localPaints = [
    { id: "p1", name: "Primary/onPrimary" },           // current, not a candidate
    { id: "p2", name: "Primary/onPrimaryOld" },         // legacy, candidate
  ];
  const cand = sweepCandidates(knownTexts, knownPaints, localTexts, localPaints);
  const candTextIds = cand.texts.map((x) => x.id).sort();
  if (candTextIds.join(",") !== "t2,t3") FAIL("sweep", `sweepCandidates must flag exactly the legacy Body/lg text styles, not the current one or the unrelated namespace (got ${candTextIds.join(",")})`);
  if (cand.paints.map((x) => x.id).join(",") !== "p2") FAIL("sweep", `sweepCandidates must flag exactly the legacy paint style (got ${cand.paints.map((x) => x.id).join(",")})`);
  if (cand.texts.some((x) => x.id === "t4") || cand.paints.some((x) => x.name.startsWith("MyOwnCustomStyle"))) FAIL("sweep", "a namespace this plan never uses at all must NEVER be flagged, only prefixes we currently own");

  // end-to-end via the real message handlers: sweep-scan never mutates; sweep-delete removes ONLY the
  // confirmed ids and reports how many.
  const F6 = mockFigma();
  new Function("figma", "__html__", "module", code)(F6.figma, "<html>", undefined);
  const legacyStyle = F6.figma.createTextStyle(); legacyStyle.name = "Body/lg/regular";
  const currentStyle = F6.figma.createTextStyle(); currentStyle.name = "Body/lg/• regular";
  const foreignStyle = F6.figma.createTextStyle(); foreignStyle.name = "MyOwnCustomStyle/heading";
  await F6.figma.ui._h({ type: "sweep-scan", textNames: ["Body/lg/• regular"], paintNames: [] });
  const scanMsg = F6.figma.ui._posted.find((m) => m && m.type === "sweep-scanned");
  if (!scanMsg) FAIL("sweep", "sweep-scan posted no {sweep-scanned} message");
  else {
    if (!scanMsg.texts.some((x) => x.id === legacyStyle.id)) FAIL("sweep", "sweep-scanned must include the legacy style");
    if (scanMsg.texts.some((x) => x.id === currentStyle.id)) FAIL("sweep", "sweep-scanned must NOT include a style the current plan already names");
    if (scanMsg.texts.some((x) => x.id === foreignStyle.id)) FAIL("sweep", "sweep-scanned must NEVER include a style outside any namespace the plan uses");
  }
  await F6.figma.ui._h({ type: "sweep-delete", ids: [legacyStyle.id] });
  const doneMsg = F6.figma.ui._posted.find((m) => m && m.type === "sweep-done");
  if (!doneMsg || doneMsg.removed !== 1) FAIL("sweep", `sweep-delete must report removing exactly 1 (got ${doneMsg && doneMsg.removed})`);
  if (F6.figma._styles.some((s) => s.id === legacyStyle.id)) FAIL("sweep", "sweep-delete must actually remove the confirmed style");
  if (!F6.figma._styles.some((s) => s.id === currentStyle.id) || !F6.figma._styles.some((s) => s.id === foreignStyle.id)) FAIL("sweep", "sweep-delete must touch ONLY the confirmed ids, nothing else");

  // #454, sweep-scan/sweep-delete are the only inbound pair besides `apply` gating a busy flag
  // (sweepBusy) on the UI side; a sandbox-side throw here must still post a reply, or the Cleanup
  // panel's Scan/Delete buttons stay disabled for the rest of the session. Mirrors the existing
  // apply carve-out, the outer catch must answer sweep-scan/sweep-delete too.
  const F6err = mockFigma();
  F6err.figma.getLocalTextStylesAsync = async () => { throw new Error("sandbox boom"); };
  new Function("figma", "__html__", "module", code)(F6err.figma, "<html>", undefined);
  await F6err.figma.ui._h({ type: "sweep-scan", textNames: [], paintNames: [] });
  const scanErrMsg = F6err.figma.ui._posted.find((m) => m && m.type === "sweep-scanned");
  if (!scanErrMsg) FAIL("sweep", "a throwing sweep-scan must still post {sweep-scanned} from the catch, or sweepBusy wedges the Cleanup panel forever (#454)");

  const F6err2 = mockFigma();
  new Function("figma", "__html__", "module", code)(F6err2.figma, "<html>", undefined);
  // a getter that throws on access forces the throw BEFORE the per-id try/catch in the handler
  // (which only swallows a single already-gone style, never the whole sweep-delete call).
  await F6err2.figma.ui._h({ type: "sweep-delete", get ids() { throw new Error("sandbox boom"); } });
  const doneErrMsg = F6err2.figma.ui._posted.find((m) => m && m.type === "sweep-done");
  if (!doneErrMsg) FAIL("sweep", "a throwing sweep-delete must still post {sweep-done} from the catch, or sweepBusy wedges the Cleanup panel forever (#454)");
}

// The REPORT block prints once, at the very end of the file (see bottom), after every gate above
// and below this point has had the chance to FAIL: a mid-file print here used to run before the
// STYLES/fontmodes/library/readfloat legs further down had even executed, which is how three of
// this file's own gates (compliance, regroup, primevalue) went unprinted for so long (#699).
// ── STYLES apply: paint styles bound to Color Roles vars; text styles set + bound; registry prune ──
// Runs on the SAME mock F: applyBundle already created Color Roles, the float e2e already created the
// merged Geometry collection with its type/ half (base "product/16" scale), exactly the state a real
// apply leaves behind.
if (applyStylePlans && applyFontPrimitivesModes) {
  try {
    const scale = TYPE.typeScale({ treatment: "product", bodyBase: 16, voices: { Display: { weights: [{ name: "Medium", weight: 500 }] } } });
    const bundle = figmaBundle(defaultDocument());
    const fams = Object.keys(bundle["Light_tokens.json"]).filter((n) => n[0] !== "$");
    const families = fams.map((n) => ({ n, name: n.charAt(0).toUpperCase() + n.slice(1) }));
    const plans = stylePlans({ families, scale });

    const pr = await applyFontPrimitivesModes(primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(scale)));
    if (!pr || !pr.variables) FAIL("styles", "applyFontPrimitivesModes created nothing");
    const prim = F.collections.find((c) => c.name === "Type Primitives");
    if (!prim) FAIL("styles", "no Type Primitives collection created");
    else {
      if (prim.modes.map((m) => m.name).join() !== "Premium,Google Fonts") FAIL("styles", `Type Primitives modes = ${prim.modes.map((m) => m.name)}, want Premium,Google Fonts`);
      const fontAlias = F.variables.find((v) => v.variableCollectionId === prim.id && v.name === "font/display");
      const targets = fontAlias && prim.modes.map((m) => fontAlias.values[m.modeId]);
      if (!fontAlias || !targets || !targets.every((t) => t && t.type === "VARIABLE_ALIAS") || targets[0].id !== targets[1].id) FAIL("styles", "font/display is not aliased to the SAME family primitive under BOTH modes");
    }

    const sr = await applyStylePlans(plans);
    const sem = F.collections.find((c) => c.name === "Color Roles");
    const semIds = new Set(F.variables.filter((v) => v.variableCollectionId === sem.id).map((v) => v.id));
    const paintStyles = F.figma._styles.filter((x) => x._kind === "PAINT");
    if (sr.paints !== plans.paints.length || paintStyles.length !== plans.paints.length) FAIL("styles", `paint styles ${paintStyles.length}/${sr.paints}, expected ${plans.paints.length}`);
    const unbound = paintStyles.filter((x) => !(x.paints[0] && x.paints[0].boundVariables && x.paints[0].boundVariables.color && semIds.has(x.paints[0].boundVariables.color.id)));
    if (unbound.length) FAIL("styles", `${unbound.length} paint styles not bound to a Color Roles variable (e.g. ${unbound[0] && unbound[0].name})`);
    if (!paintStyles.some((x) => /^[A-Z][a-z]+\/scrims\/scrim$/.test(x.name))) FAIL("styles", "no Family/scrims/scrim grouped paint style");
    if (!paintStyles.some((x) => /^[A-Z][a-z]+\/surfaces\/surface$/.test(x.name))) FAIL("styles", "no Family/surfaces/surface grouped paint style");

    const textStyles = F.figma._styles.filter((x) => x._kind === "TEXT");
    if (sr.texts !== plans.texts.length || textStyles.length !== plans.texts.length) FAIL("styles", `text styles ${textStyles.length}/${sr.texts}, expected ${plans.texts.length}`);
    // Display's core weight (the product treatment's 700) + its 1 sibling (Medium/500), 2 distinct
    // weights; the core (700, heavier of the two) gets the NORMALIZED relative label "heavier"
    // (2026-07-13, supersedes the literal ladder-name "bold"); the sibling (500) ranks "lighter".
    const core = textStyles.find((x) => x.name === "Display/md/heavier •");
    const sib = textStyles.find((x) => x.name === "Display/md/lighter");
    if (!core || !sib) FAIL("styles", "Display/md/heavier • core or Display/md/lighter sibling text style missing");
    if (core && (!core.fontName || core.fontName.style !== "Bold")) FAIL("styles", `Display core face = ${core && core.fontName && core.fontName.style}, want Bold (700 candidates)`);
    if (sib && (!sib.fontName || sib.fontName.style !== "Medium")) FAIL("styles", `Display sibling face = ${sib && sib.fontName && sib.fontName.style}, want Medium`);
    if (core && (!core.lineHeight || core.lineHeight.unit !== "PIXELS")) FAIL("styles", "text style lineHeight is not PIXELS-united");
    if (core && !core._bound.fontSize) FAIL("styles", "core fontSize not bound to the type/ variable in the Geometry collection");
    if (core && !core._bound.lineHeight) FAIL("styles", "core lineHeight not bound (percent FLOAT after unit set)");
    if (core && !core._bound.letterSpacing) FAIL("styles", "core letterSpacing not bound (percent FLOAT after unit set)");
    if (core && !core._bound.fontFamily) FAIL("styles", "core fontFamily not bound to the Type Primitives alias");
    if (core && !core._bound.fontWeight) FAIL("styles", "core fontWeight not bound to weight/<voice>");
    if (sib && !sib._bound.fontWeight) FAIL("styles", "sibling fontWeight not bound to weight/<voice>/<slug>");

    // a voice WITH a custom styleName (a named cut like "Condensed Black Italic", not derivable from a
    // bare weight number) must bind fontStyle ONLY, never fontWeight alongside it, real Figma resolves
    // a bound fontWeight to "the closest valid weight for the font" independently of fontStyle, which
    // silently overrode the named cut back to the nearest plain face (found live via BZZR's Display core
    // not rendering its bound "Condensed Black Italic" style at all, this mock's own setBoundVariable
    // is too permissive to catch that on its own, so the plan itself must never emit both).
    {
      const namedScale = TYPE.typeScale({ treatment: "statement", voices: { Display: { weight: 900, styleName: "Condensed Black Italic", weights: [{ name: "Bold", weight: 700 }] } } });
      const namedPlans = stylePlans({ families, scale: namedScale });
      const namedCore = namedPlans.texts.find((t) => t.voice === "Display" && t.name.startsWith("Display/lg/") && t.name.endsWith(" •"));
      // core (900) + 1 sibling (Bold/700), the sibling ranks "lighter" of the 2; the literal styleName
      // still carries the full templated cut ("Condensed Bold Italic"), only the LABEL is relative now.
      const namedSib = namedPlans.texts.find((t) => t.voice === "Display" && t.name === "Display/lg/lighter");
      if (!namedCore || !namedSib) FAIL("styles", "named-style-cut fixture: Display core or sibling plan entry missing");
      if (namedCore && (namedCore.bind.fontWeight || !namedCore.bind.fontStyle)) FAIL("styles", `named-style-cut core must bind fontStyle only (got fontStyle=${namedCore.bind.fontStyle}, fontWeight=${namedCore.bind.fontWeight})`);
      if (namedSib && (namedSib.bind.fontWeight || !namedSib.bind.fontStyle)) FAIL("styles", `named-style-cut sibling must bind fontStyle only (got fontStyle=${namedSib.bind.fontStyle}, fontWeight=${namedSib.bind.fontWeight})`);

      const namedPr = await applyFontPrimitivesModes(primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(namedScale)));
      if (!namedPr || !namedPr.variables) FAIL("styles", "named-style-cut fixture: applyFontPrimitivesModes created nothing");
      const namedSr = await applyStylePlans(namedPlans);
      const namedCoreStyle = F.figma._styles.find((x) => x._kind === "TEXT" && x.name === namedCore.name);
      if (!namedCoreStyle || namedCoreStyle._bound.fontWeight) FAIL("styles", "named-style-cut core text style must not carry a bound fontWeight field");
      if (!namedCoreStyle || !namedCoreStyle._bound.fontStyle) FAIL("styles", "named-style-cut core text style must carry a bound fontStyle field");
    }

    // STALE fontWeight/fontStyle binding clears across a re-apply, an EXPLICIT, isolated repro (found
    // live via a naming coincidence between two OTHER fixtures in this file: relative labels are RANKS,
    // not literal weight/style names, so the SAME Figma style name can legitimately carry a
    // fontWeight-bound style in one apply and a fontStyle-bound one in the next, e.g. a voice gaining a
    // custom styleName later while its rank-based label happens to stay the same). bindField only ever
    // ADDS a binding, never clears one the CURRENT plan omits, so a style reused by name must have its
    // NOW-unused half of the pair explicitly unbound, or Figma's own "closest valid weight" snap on the
    // stale fontWeight could silently override a freshly-bound fontStyle's precise named cut.
    {
      const F7 = mockFigma();
      const loaded7 = new Function("figma", "__html__", "module", code + "\nreturn { applyFontPrimitivesModes, applyStylePlans };")(F7.figma, "<html>", undefined);
      const genericScale = TYPE.typeScale({ treatment: "product", voices: { Kicker: { weight: 700, weights: [{ name: "Medium", weight: 500 }] } } });
      const genericPlans = stylePlans({ families: [], scale: genericScale });
      await loaded7.applyFontPrimitivesModes(primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(genericScale)));
      await loaded7.applyStylePlans(genericPlans);
      const reusedName = genericPlans.texts.find((t) => t.voice === "Kicker" && t.name.startsWith("Kicker/lg/") && t.name.endsWith(" •")).name;
      const afterGeneric = F7.figma._styles.find((x) => x._kind === "TEXT" && x.name === reusedName);
      if (!afterGeneric || !afterGeneric._bound.fontWeight) FAIL("styles", "stale-bind repro setup: the generic (no styleName) core must bind fontWeight first");
      // SAME Figma style name, SAME rank shape, but NOW with a custom styleName, fontStyle binds
      // instead. Re-applying under the reused name must not leave the OLD fontWeight bind behind.
      const namedScale2 = TYPE.typeScale({ treatment: "product", voices: { Kicker: { weight: 700, styleName: "Custom Bold Cut", weights: [{ name: "Medium", weight: 500 }] } } });
      const namedPlans2 = stylePlans({ families: [], scale: namedScale2 });
      await loaded7.applyFontPrimitivesModes(primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(namedScale2)));
      await loaded7.applyStylePlans(namedPlans2);
      const afterNamed = F7.figma._styles.find((x) => x._kind === "TEXT" && x.name === reusedName);
      if (!afterNamed || afterNamed._bound.fontWeight) FAIL("styles", "a stale fontWeight bind from an earlier apply survived once the SAME-named style switched to fontStyle binding");
      if (!afterNamed || !afterNamed._bound.fontStyle) FAIL("styles", "the reused style must carry the NEW fontStyle bind");
    }

    // Figma's lineHeight/letterSpacing bind as ABSOLUTE PIXELS, not a %, a Figma-bound percent FLOAT
    // displays as a bare, unit-less number in Figma's own Properties panel, indistinguishable from a
    // pixel value at a glance; an absolute pixel reads unambiguously there instead (CSS/DTCG keep the
    // ratio/em relative units, unaffected, see test/engine/type.mjs). Each step legitimately gets its
    // OWN pixel value (unlike percent, a differing per-step pixel number is expected, not drift).
    {
      const driftScale = TYPE.typeScale({ treatment: "statement", voices: { "Sub-heading": { leading: 1.125, weights: [] } } });
      const driftPlans = stylePlans({ families, scale: driftScale });
      await applyFontPrimitivesModes(primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(driftScale)));
      await applyStylePlans(driftPlans);
      for (const step of ["LG", "MD", "SM"]) {
        const st = F.figma._styles.find((x) => x._kind === "TEXT" && x.name === `Sub-heading/${step.toLowerCase()}`);
        const expected = driftScale.categories["Sub-heading"][step].lineHeight;
        if (!st || !st.lineHeight || st.lineHeight.unit !== "PIXELS" || st.lineHeight.value !== expected) FAIL("styles", `Sub-heading/${step} lineHeight must be PIXELS ${expected} (got ${st && st.lineHeight && `${st.lineHeight.unit} ${st.lineHeight.value}`})`);
      }
    }

    // a family Figma does not have: the style is BUILT on a placeholder face (Inter), reported as
    // SUBSTITUTED (not skipped), and its fontFamily stays BOUND to the true-family variable, so the
    // style self-heals once the font is installed. The ghost rides the FULL plan (a partial plan
    // would legitimately prune the rest).
    {
      const ghostBind = { ...plans.texts[0].bind };
      const ghost = await applyStylePlans({ paints: plans.paints, texts: plans.texts.concat([{ name: "Ghost/md", voice: "Ghost", step: "MD", bind: ghostBind, literal: { family: "Nonexistent Face", weight: 700, size: 20, lineHeight: 24, letterSpacing: 0, textCase: "none" } }]) });
      if (!ghost.substitutedFonts || ghost.substitutedFonts.indexOf("Nonexistent Face") < 0) FAIL("styles", "an unavailable family is not reported in substitutedFonts");
      if (ghost.substituted !== 1) FAIL("styles", `substituted count ${ghost.substituted}, want 1`);
      if (ghost.missingFonts.length) FAIL("styles", "a substitutable family must NOT be reported as missing");
      const g = F.figma._styles.find((x) => x.name === "Ghost/md");
      if (!g) FAIL("styles", "an unavailable family produced NO style (scaffold-with-fallback regressed)");
      else {
        if (!g.fontName || g.fontName.family !== "Inter") FAIL("styles", `the placeholder face is not Figma's default Inter: ${g.fontName && g.fontName.family}`);
        if (g.fontSize !== 20) FAIL("styles", "the substituted style lost its metrics");
        if (!g._bound.fontFamily) FAIL("styles", "the substituted style did not keep fontFamily BOUND to the true-family variable (the whole point)");
      }
      // a Figma with NO fonts at all cannot scaffold, then, and only then, we skip honestly.
      const saved = F.figma._fonts; F.figma._fonts = {};
      const none = await applyStylePlans({ paints: [], texts: [{ name: "Nofont/md", voice: "N", step: "MD", bind: {}, literal: { family: "Anything", weight: 400, size: 12, lineHeight: 16, letterSpacing: 0, textCase: "none" } }] });
      F.figma._fonts = saved;
      if (!none.missingFonts.length || F.figma._styles.some((x) => x.name === "Nofont/md")) FAIL("styles", "with no loadable font at all the style must be SKIPPED and reported missing");
      // the two experiments above mutated the style registry (Ghost added; the empty-font run pruned
      // every text style). Re-apply the canonical plan so the registry/idempotency/prune assertions
      // below measure the real contract, not the experiments' residue.
      await applyStylePlans(plans);
      if (F.figma._styles.some((x) => x.name === "Ghost/md")) FAIL("styles", "Ghost/md survived the canonical re-apply (prune regressed)");
    }

    // registry + idempotency + provenance-scoped prune
    const reg = JSON.parse(F.figma.root.getPluginData("ultimate-tokens-styles"));
    if (Object.keys(reg.paints).length !== plans.paints.length || Object.keys(reg.texts).length !== plans.texts.length) FAIL("styles", "style registry does not record every created style");
    const userStyle = F.figma.createPaintStyle(); userStyle.name = "My Own/keep-me";
    const before = F.figma._styles.length;
    await applyStylePlans(plans);
    if (F.figma._styles.length !== before) FAIL("styles", "re-apply is not idempotent (style count moved)");
    // siblings dropped via an EXPLICIT weights:[] opt-out (2026-07-13: omitting voices config no longer
    // means "no siblings", every voice auto-populates by default, so an explicit opt-out is the only
    // way left to get a bare, undisambiguated core).
    const reduced = stylePlans({ families, scale: TYPE.typeScale({ treatment: "product", bodyBase: 16, voices: { Display: { weights: [] } } }) });
    const sr2 = await applyStylePlans(reduced);
    if (F.figma._styles.some((x) => x.name === "Display/md/lighter")) FAIL("styles", "prune did not remove the dropped sibling style");
    // the core RENAMES too when its siblings disappear (Display/md/heavier • → bare Display/md, nothing
    // left to disambiguate), the old suffixed name must prune, and the bare name must exist fresh.
    if (F.figma._styles.some((x) => x.name === "Display/md/heavier •")) FAIL("styles", "prune did not remove the core's old suffixed name after its siblings were dropped");
    if (!F.figma._styles.some((x) => x.name === "Display/md")) FAIL("styles", "the core did not revert to its bare name once siblings were dropped");
    if (!F.figma._styles.some((x) => x.name === "My Own/keep-me")) FAIL("styles", "prune touched a USER style (provenance violated)");
    if (!sr2.pruned) FAIL("styles", "prune count not reported");

    // ── #629 "published library" mode: a name the CURRENT plan no longer produces is still bound in
    // every consumer file that subscribed to this library, so removing it breaks them. Run the two
    // modes over the SAME starting state: `reduced` (above) is already applied, so re-applying the
    // FULL `plans` and then `reduced` again is a registry holding names the plan does not want.
    // libraryMode:true must report them (pruned:0, preserved>0) and leave the live styles alone;
    // libraryMode:false must reproduce today's prune, byte-for-byte unchanged.
    await applyStylePlans(plans); // back to the full set: the registry now holds the sibling names again
    const libRes = await applyStylePlans(reduced, { libraryMode: true });
    if (libRes.pruned !== 0) FAIL("styles", `#629 libraryMode:true pruned ${libRes.pruned} styles: a published library must never remove a name a consumer file is bound to`);
    if (!libRes.preserved) FAIL("styles", "#629 libraryMode:true reported no preserved styles: the fixture did not actually put a stale name in front of the prune");
    if (!F.figma._styles.some((x) => x.name === "Display/md/lighter")) FAIL("styles", "#629 libraryMode:true removed the dropped sibling style anyway (it must survive)");
    const libReg = JSON.parse(F.figma.root.getPluginData("ultimate-tokens-styles"));
    if (!libReg.texts["Display/md/lighter"]) FAIL("styles", "#629 libraryMode:true dropped the preserved style's registry slot: a later classic apply could then never find or prune it");
    // and the SAME call under libraryMode:false still prunes exactly as it does today.
    const classicRes = await applyStylePlans(reduced, { libraryMode: false });
    if (!classicRes.pruned) FAIL("styles", "#629 libraryMode:false stopped pruning: classic behavior regressed");
    if (classicRes.preserved) FAIL("styles", `#629 libraryMode:false preserved ${classicRes.preserved} styles: it must remove, not report`);
    if (F.figma._styles.some((x) => x.name === "Display/md/lighter")) FAIL("styles", "#629 libraryMode:false left the dropped sibling style behind");
    if (!F.figma._styles.some((x) => x.name === "My Own/keep-me")) FAIL("styles", "#629 the library/classic round trip touched a USER style (provenance violated)");

    // ── #629 round 3 (PR #675 critic): the PAINT half of the same guard. The leg above drops a TEXT
    // sibling only, so no paint name is ever stale there and removing the paint guard at
    // applyStylePlans' paint prune site reds NOTHING. Drop a whole FAMILY instead: every paint style
    // in that family goes stale while the text set stays identical (same scale), so preserved and
    // pruned below are paint-only figures and the assertion cannot be satisfied by the text guard.
    const fewerFamilies = families.slice(0, -1);
    const droppedFamily = families[families.length - 1];
    const paintDropPlans = stylePlans({ families: fewerFamilies, scale });
    const keptPaintNames = new Set(paintDropPlans.paints.map((p) => p.name));
    const droppedPaintNames = plans.paints.map((p) => p.name).filter((n) => !keptPaintNames.has(n));
    if (!droppedPaintNames.length) FAIL("styles", `#629 fixture: dropping family '${droppedFamily && droppedFamily.name}' left every paint name in the plan, so the paint guard is still unexercised`);
    else {
      await applyStylePlans(plans); // full set: the registry now holds the dropped family's paints again
      const paintLib = await applyStylePlans(paintDropPlans, { libraryMode: true });
      if (paintLib.pruned !== 0) FAIL("styles", `#629 libraryMode:true pruned ${paintLib.pruned} PAINT styles: a published library must never remove a paint a consumer file is bound to`);
      if (paintLib.preserved !== droppedPaintNames.length) FAIL("styles", `#629 libraryMode:true preserved ${paintLib.preserved} styles, expected exactly the ${droppedPaintNames.length} dropped paints`);
      const liveNames = new Set(F.figma._styles.filter((x) => x._kind === "PAINT").map((x) => x.name));
      const gonePaints = droppedPaintNames.filter((n) => !liveNames.has(n));
      if (gonePaints.length) FAIL("styles", `#629 libraryMode:true removed ${gonePaints.length} dropped paint style(s) anyway (e.g. ${gonePaints[0]}): they must survive`);
      const paintReg = JSON.parse(F.figma.root.getPluginData("ultimate-tokens-styles"));
      const lostSlots = droppedPaintNames.filter((n) => !paintReg.paints[n]);
      if (lostSlots.length) FAIL("styles", `#629 libraryMode:true dropped ${lostSlots.length} preserved PAINT registry slot(s) (e.g. ${lostSlots[0]}): a later classic apply could then never find or prune them`);

      // the SAME family drop under libraryMode:false still prunes exactly as it does today.
      await applyStylePlans(plans);
      const paintClassic = await applyStylePlans(paintDropPlans, { libraryMode: false });
      if (paintClassic.pruned !== droppedPaintNames.length) FAIL("styles", `#629 libraryMode:false pruned ${paintClassic.pruned} paint styles, expected the ${droppedPaintNames.length} dropped ones: classic behavior regressed`);
      if (paintClassic.preserved) FAIL("styles", `#629 libraryMode:false preserved ${paintClassic.preserved} paint styles: it must remove, not report`);
      const liveAfter = new Set(F.figma._styles.filter((x) => x._kind === "PAINT").map((x) => x.name));
      const survivors = droppedPaintNames.filter((n) => liveAfter.has(n));
      if (survivors.length) FAIL("styles", `#629 libraryMode:false left ${survivors.length} dropped paint style(s) behind (e.g. ${survivors[0]})`);
      if (!F.figma._styles.some((x) => x.name === "My Own/keep-me")) FAIL("styles", "#629 the paint-drop round trip touched a USER style (provenance violated)");
      await applyStylePlans(plans); // leave the mock on the full set for anything downstream
    }
  } catch (e) { FAIL("styles", "styles apply threw: " + e.message); }
}

// ── FONT-MODE PHASE B: applyFontPrimitivesModes carries the real Premium/Google-Fonts axis (Figma's
// native addMode/setValueForMode mechanism, mirroring Geometry/Light-Dark). Runs on a FRESH mock,
// the axis mechanics are orthogonal to the "styles" e2e above, which already proved the plan/executor
// wiring on the shared F mock. ──
if (applyFontPrimitivesModes) {
  try {
    const FM = mockFigma();
    const lm = new Function("figma", "__html__", "module", code + "\nreturn { applyFontPrimitivesModes };")(FM.figma, "<html>", undefined);
    const scaleM = TYPE.typeScale({ treatment: "product", bodyBase: 16, voices: { Display: { font: "Söhne" } } });
    const planM = primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(scaleM));
    const prM = await lm.applyFontPrimitivesModes(planM);
    if (!prM || !prM.variables) FAIL("fontmodes", "applyFontPrimitivesModes created nothing");
    const prim = FM.collections.find((c) => c.name === "Type Primitives");
    if (!prim) FAIL("fontmodes", "no Type Primitives collection created");
    else {
      if (prim.modes.map((m) => m.name).join() !== "Premium,Google Fonts") FAIL("fontmodes", `Type Primitives modes = ${prim.modes.map((m) => m.name)}, want Premium,Google Fonts`);
      const [premiumId, googleId] = prim.modes.map((m) => m.modeId);
      const vars = FM.variables.filter((v) => v.variableCollectionId === prim.id);
      // every variable, literal or alias, gets an explicit value for BOTH mode ids (constraint #7:
      // "same as every other mode" is a value, never an omission).
      const unset = vars.filter((v) => v.values[premiumId] === undefined || v.values[googleId] === undefined);
      if (unset.length) FAIL("fontmodes", `${unset.length} variable(s) missing a value for one of the 2 modes (e.g. ${unset[0].name})`);

      // Söhne has a curated Google-Fonts substitute (font-fallbacks.mjs), its override primitive must
      // actually DIVERGE between modes, not just carry two identical copies.
      const displayFam = vars.find((v) => v.name === "override/display");
      if (!displayFam || displayFam.values[premiumId] !== "Söhne" || displayFam.values[googleId] !== googleSafeFontFor("Söhne") || displayFam.values[googleId] === "Söhne") FAIL("fontmodes", `Söhne's override primitive should diverge to its curated substitute (Premium=${displayFam && displayFam.values[premiumId]}, Google Fonts=${displayFam && displayFam.values[googleId]})`);

      // the alias resolves to the SAME target id under both modes, no per-mode retargeting (the
      // load-bearing simplification this feature rests on, verified live against a real Figma file).
      const fontAlias = vars.find((v) => v.name === "font/display");
      const aP = fontAlias.values[premiumId], aG = fontAlias.values[googleId];
      if (!aP || !aG || aP.type !== "VARIABLE_ALIAS" || aG.type !== "VARIABLE_ALIAS" || aP.id !== aG.id) FAIL("fontmodes", "font/display does not alias the SAME target id under both modes");
    }

    // IDEMPOTENT re-apply after a family change, no duplicate collection, and the new family lands.
    const scaleM2 = TYPE.typeScale({ treatment: "product", bodyBase: 16, voices: { Display: { font: "Tiempos Text" } } });
    const planM2 = primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(scaleM2));
    await lm.applyFontPrimitivesModes(planM2);
    if (FM.collections.filter((c) => c.name === "Type Primitives").length !== 1) FAIL("fontmodes", "re-apply after a family change duplicated the Type Primitives collection");
    const prim2 = FM.collections.find((c) => c.name === "Type Primitives");
    const pId2 = prim2.modes[0].modeId;
    const overrideVar = FM.variables.find((v) => v.variableCollectionId === prim2.id && v.name === "override/display");
    if (!overrideVar || overrideVar.values[pId2] !== "Tiempos Text") FAIL("fontmodes", "re-apply after a family change did not land the new family");

    // RETURNING FILE: a collection this plugin created under the OLD Phase-A single-"Value"-mode shape
    // (same registry key, "Type Primitives") must self-heal, rename "Value" → "Premium" in place (SAME
    // collection id, no data loss) and add "Google Fonts", never mint a second collection.
    const F11 = mockFigma();
    const l11 = new Function("figma", "__html__", "module", code + "\nreturn { applyFontPrimitivesModes };")(F11.figma, "<html>", undefined);
    const eraOnePlan = { collection: "Type Primitives", modes: ["Value"], defaultMode: "Value", addModes: [], variables: [
      { name: "family/display", type: "STRING", values: [{ mode: "Value", value: "Inter Tight" }] },
      { name: "font/display", type: "ALIAS", target: "family/display" },
    ] };
    await l11.applyFontPrimitivesModes(eraOnePlan);
    const eraOneColl = F11.collections.find((c) => c.name === "Type Primitives");
    const keepCollId = eraOneColl.id;
    const keepVarId = F11.variables.find((v) => v.variableCollectionId === eraOneColl.id && v.name === "family/display").id;
    const eraTwoPlan = primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 })));
    await l11.applyFontPrimitivesModes(eraTwoPlan);
    if (F11.collections.filter((c) => c.name === "Type Primitives").length !== 1) FAIL("fontmodes", "returning-file: self-healing minted a SECOND Type Primitives collection instead of renaming in place");
    const healed = F11.collections.find((c) => c.name === "Type Primitives");
    if (healed.id !== keepCollId) FAIL("fontmodes", "returning-file: self-healing minted a NEW collection (id changed, bindings would orphan)");
    if (healed.modes.map((m) => m.name).join() !== "Premium,Google Fonts") FAIL("fontmodes", `returning-file: modes after self-heal = ${healed.modes.map((m) => m.name)}, want Premium,Google Fonts`);
    const healedFam = F11.variables.find((v) => v.variableCollectionId === healed.id && v.name === "family/display");
    if (!healedFam || healedFam.id !== keepVarId) FAIL("fontmodes", "returning-file: family/display was pruned+recreated instead of updated in place (id changed, no data loss means SAME id)");

    // ── #629 ruling Q2: "published library" mode guards the Type Primitives MODE prune too, not just
    // the variable prune. Removing a MODE from a published collection breaks every consumer file that
    // pinned it, so libraryMode:true must REPORT the stale mode (libraryReport.staleModes) and leave
    // it standing; false must remove it exactly as today. Fresh mock per leg so the two are compared
    // from the SAME starting state (a collection carrying Premium + Google Fonts), not in sequence.
    const narrowPlan = { collection: "Type Primitives", modes: ["Premium"], defaultMode: "Premium", addModes: [], variables: [
      { name: "family/display", type: "STRING", values: [{ mode: "Premium", value: "Inter Tight" }] },
    ] };
    const widePlan = primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 })));
    for (const leg of [{ libraryMode: true }, { libraryMode: false }, undefined]) {
      const FQ = mockFigma();
      const lq = new Function("figma", "__html__", "module", code + "\nreturn { applyFontPrimitivesModes };")(FQ.figma, "<html>", undefined);
      await lq.applyFontPrimitivesModes(widePlan);
      const before = FQ.collections.find((c) => c.name === "Type Primitives");
      if (!before || before.modes.map((m) => m.name).join() !== "Premium,Google Fonts") { FAIL("fontmodes", "#629 fixture: the wide plan did not leave a Premium + Google Fonts axis to narrow"); break; }
      const res = await lq.applyFontPrimitivesModes(narrowPlan, leg);
      const after = FQ.collections.find((c) => c.name === "Type Primitives");
      const modeNames = after.modes.map((m) => m.name);
      const stale = (res && res.libraryReport && res.libraryReport.staleModes) || [];
      const label = leg === undefined ? "undefined (a pre-#629 ui.html bundle)" : `libraryMode:${leg.libraryMode}`;
      if (leg && leg.libraryMode === true) {
        if (!modeNames.includes("Google Fonts")) FAIL("fontmodes", "#629 libraryMode:true removed the stale 'Google Fonts' mode: a published collection's mode must survive");
        if (!stale.includes("Google Fonts")) FAIL("fontmodes", `#629 libraryMode:true did not REPORT the kept stale mode (libraryReport.staleModes = ${JSON.stringify(stale)})`);
      } else {
        if (modeNames.includes("Google Fonts")) FAIL("fontmodes", `#629 ${label} left the stale 'Google Fonts' mode behind: classic prune regressed`);
        if (stale.length) FAIL("fontmodes", `#629 ${label} reported staleModes ${JSON.stringify(stale)} instead of removing them`);
      }
    }
  } catch (e) { FAIL("fontmodes", "applyFontPrimitivesModes e2e threw: " + e.message); }
} else {
  FAIL("fontmodes", "code.js exported no applyFontPrimitivesModes");
}

// ── libraryparity (#495): code.js's HAND-WRITTEN VM mirrors of mode-apply-plan.mjs's pure
//    "published library" planner functions (libraryModeReconcile/valueChanged/libraryModeReport/
//    nearestStepByHeight/geometrySizeAliasMap) are NOT spliced (they're independent hand-written
//    functions inside a non-module VM, see the code.js header comment above each one), this gate
//    proves BEHAVIORAL parity instead: the SAME inputs must produce the SAME outputs on both sides. ──
{
  // libraryModeReconcile / libraryReconcile
  const existing = ["font/heading", "font/body", "font/quote", "_deprecated/font/legacy"];
  const wanted = ["font/headline", "font/body"];
  const aliasMap = { "font/heading": "font/headline" };
  const mjsRec = libraryModeReconcile(existing, wanted, aliasMap);
  const vmRec = vmLibraryReconcile ? vmLibraryReconcile(existing, wanted, aliasMap) : null;
  if (!vmRec) FAIL("libraryparity", "code.js exported no libraryReconcile");
  else if (JSON.stringify(mjsRec) !== JSON.stringify(vmRec)) FAIL("libraryparity", `libraryModeReconcile/libraryReconcile disagree: mjs=${JSON.stringify(mjsRec)} vm=${JSON.stringify(vmRec)}`);

  // libraryModeReconcile's 4th-arg idempotency fix (#495 follow-up, a real defect found in review): a
  // name already CORRECTLY aliased (whether re-derivable via aliasMap, or only recognizable via the
  // liveAliasTargets belt) must be an omit-entirely no-op, never re-aliased or misclassified as unmapped
  // -> deprecate on a re-apply. font/heading: aliasMap says font/headline, ALREADY live-aliased there ->
  // no-op. font/code: aliasMap says font/label-mono, NOT yet live-aliased (first time) -> real write.
  // font/legal: NO aliasMap entry at all, but the belt sees it's ALREADY live-aliased to a wanted name
  // (font/tiny) -> no-op (the belt only ever confirms an existing correct state; it can't cause a write).
  // font/quote: no mapping anywhere -> deprecate. _deprecated/font/legacy: already prefixed -> no-op.
  const existing2 = ["font/heading", "font/code", "font/legal", "font/quote", "_deprecated/font/legacy"];
  const wanted2 = ["font/headline", "font/label-mono", "font/tiny"];
  const aliasMap2 = { "font/heading": "font/headline", "font/code": "font/label-mono" };
  const liveAliasTargets2 = { "font/heading": "font/headline", "font/legal": "font/tiny" };
  const mjsRec2 = libraryModeReconcile(existing2, wanted2, aliasMap2, liveAliasTargets2);
  const vmRec2 = vmLibraryReconcile ? vmLibraryReconcile(existing2, wanted2, aliasMap2, liveAliasTargets2) : null;
  if (!vmRec2) FAIL("libraryparity", "code.js exported no libraryReconcile (4-arg form)");
  else if (JSON.stringify(mjsRec2) !== JSON.stringify(vmRec2)) FAIL("libraryparity", `libraryModeReconcile/libraryReconcile (4-arg) disagree: mjs=${JSON.stringify(mjsRec2)} vm=${JSON.stringify(vmRec2)}`);
  const aliasedFroms2 = mjsRec2.toAlias.map((a) => a.from);
  if (aliasedFroms2.includes("font/heading")) FAIL("libraryparity", "font/heading (already correctly aliased) should be an idempotent no-op, omitted from toAlias");
  if (!aliasedFroms2.includes("font/code")) FAIL("libraryparity", `font/code (first-time, aliasMap-driven) should be a real toAlias entry, got ${JSON.stringify(mjsRec2.toAlias)}`);
  if (aliasedFroms2.includes("font/legal")) FAIL("libraryparity", "font/legal (belt-recognized, already live-aliased) should be an idempotent no-op, omitted from toAlias");
  if (!mjsRec2.toDeprecate.some((d) => d.from === "font/quote")) FAIL("libraryparity", `font/quote (unmapped) should be deprecated, got ${JSON.stringify(mjsRec2.toDeprecate)}`);
  if (mjsRec2.toDeprecate.some((d) => d.from === "_deprecated/font/legacy")) FAIL("libraryparity", "an already-_deprecated/ name must never be re-deprecated");

  // resolveLiteralHeight / resolveLiteralHeightVM, chase an ALIAS chain to the underlying literal
  const liveHeights = {
    "size/small/height": { Base: { type: "VARIABLE_ALIAS", id: "id-sm" } }, // one hop -> a literal
    "size/sm/height": { Base: 24 },
    "size/broken/height": { Base: { type: "VARIABLE_ALIAS", id: "id-missing" } }, // unresolved id
    "size/cyclic/height": { Base: { type: "VARIABLE_ALIAS", id: "id-cyclic" } }, // points at itself
  };
  const idToNameHeights = { "id-sm": "size/sm/height", "id-cyclic": "size/cyclic/height" };
  const heightCases = [["size/small/height", 24], ["size/sm/height", 24], ["size/broken/height", null], ["size/cyclic/height", null], ["size/missing/height", null]];
  for (const [name, want] of heightCases) {
    const mjsH = resolveLiteralHeight(name, "Base", liveHeights, idToNameHeights);
    if (mjsH !== want) FAIL("libraryparity", `resolveLiteralHeight(${name}) = ${mjsH}, want ${want}`);
    const vmH = vmResolveLiteralHeight ? vmResolveLiteralHeight(name, "Base", liveHeights, idToNameHeights) : "MISSING";
    if (vmResolveLiteralHeight === undefined) FAIL("libraryparity", "code.js exported no resolveLiteralHeightVM");
    else if (mjsH !== vmH) FAIL("libraryparity", `resolveLiteralHeight/resolveLiteralHeightVM disagree for ${name}: mjs=${mjsH} vm=${vmH}`);
  }

  // liveAliasTargetsByName / liveAliasTargetsByNameVM, the one-hop {name: liveTargetName} map
  const liveTargetsInput = { ...liveHeights, "size/literal/height": { Base: 40 } }; // a literal, not an alias -> excluded
  const existingHeightNames = ["size/small/height", "size/sm/height", "size/broken/height", "size/literal/height"];
  const mjsTargets = liveAliasTargetsByName(existingHeightNames, "Base", liveTargetsInput, idToNameHeights);
  const vmTargets = vmLiveAliasTargetsByName ? vmLiveAliasTargetsByName(existingHeightNames, "Base", liveTargetsInput, idToNameHeights) : null;
  if (!vmTargets) FAIL("libraryparity", "code.js exported no liveAliasTargetsByNameVM");
  else if (JSON.stringify(mjsTargets) !== JSON.stringify(vmTargets)) FAIL("libraryparity", `liveAliasTargetsByName/liveAliasTargetsByNameVM disagree: mjs=${JSON.stringify(mjsTargets)} vm=${JSON.stringify(vmTargets)}`);
  if (mjsTargets["size/small/height"] !== "size/sm/height") FAIL("libraryparity", `liveAliasTargetsByName should resolve size/small/height -> size/sm/height, got ${JSON.stringify(mjsTargets)}`);
  if ("size/broken/height" in mjsTargets) FAIL("libraryparity", "liveAliasTargetsByName should exclude an unresolved alias id");
  if ("size/literal/height" in mjsTargets) FAIL("libraryparity", "liveAliasTargetsByName should exclude a literal (non-alias) value");

  // nearestStepByHeight
  const heights = { xs: 20, sm: 24, md: 28, lg: 36, xl: 48, "2xl": 64 };
  for (const h of [18, 22, 30, 40, 55, 70]) {
    const mjsN = nearestStepByHeight(h, heights);
    const vmN = vmNearestStepByHeight ? vmNearestStepByHeight(h, heights) : null;
    if (mjsN !== vmN) FAIL("libraryparity", `nearestStepByHeight(${h}) disagree: mjs=${mjsN} vm=${vmN}`);
  }

  // geometrySizeAliasMap / expandGeometryAliasMap (same signature shape: old heights, current heights, fields)
  const oldHeights = { small: 22, huge: 70 };
  const fields = ["height", "icon"];
  const mjsGeo = geometrySizeAliasMap(oldHeights, heights, fields);
  const vmGeo = vmExpandGeometryAliasMap ? vmExpandGeometryAliasMap(oldHeights, heights, fields) : null;
  if (!vmGeo) FAIL("libraryparity", "code.js exported no expandGeometryAliasMap");
  else if (JSON.stringify(mjsGeo) !== JSON.stringify(vmGeo)) FAIL("libraryparity", `geometrySizeAliasMap/expandGeometryAliasMap disagree: mjs=${JSON.stringify(mjsGeo)} vm=${JSON.stringify(vmGeo)}`);

  // valueChanged / valueChangedVM, both literal and ALIAS-typed plan variables
  const litVar = { type: "FLOAT", values: [{ mode: "Base", value: 16 }] };
  const aliasVar = { type: "ALIAS", target: "family/x" };
  for (const [live, planVar] of [[{ Base: 16 }, litVar], [{ Base: 18 }, litVar], [{}, aliasVar]]) {
    const mjsV = valueChanged(live, planVar);
    const vmV = vmValueChanged ? vmValueChanged(live, planVar) : null;
    if (mjsV !== vmV) FAIL("libraryparity", `valueChanged disagree for ${JSON.stringify({ live, planVar })}: mjs=${mjsV} vm=${vmV}`);
  }

  // libraryModeReport / libraryModeReportVM, the FULL report, on the SAME representative inputs
  const plan = { renames: { "weight/heading": "weight/headline" }, variables: [{ name: "weight/headline", type: "FLOAT", values: [{ mode: "Base", value: 700 }] }, { name: "font/body", type: "STRING", values: [{ mode: "Base", value: "Inter" }] }] };
  const live = { "weight/heading": { Base: 700 }, "font/body": { Base: "Georgia" }, "font/quote": { Base: "Times" } };
  const mjsReport = libraryModeReport(plan, live, {});
  const vmReport = vmLibraryModeReport ? vmLibraryModeReport(plan, live, {}) : null;
  if (!vmReport) FAIL("libraryparity", "code.js exported no libraryModeReportVM");
  else if (JSON.stringify(mjsReport) !== JSON.stringify(vmReport)) FAIL("libraryparity", `libraryModeReport/libraryModeReportVM disagree: mjs=${JSON.stringify(mjsReport)} vm=${JSON.stringify(vmReport)}`);

  // libraryModeReport's 4th-arg idempotency fix, end-to-end at the report level (#495 follow-up): a
  // variable ALREADY correctly aliased (font/heading -> font/headline, live) must not reappear in the
  // report's aliases on a re-apply, this is the exact bug a strict "run 2 = 0 aliases" e2e check
  // (test/figma/plugin.mjs's librarymode, test/figma/binder.mjs's librarygeom) exists to catch.
  const plan2 = { variables: [{ name: "font/headline", type: "STRING", values: [{ mode: "Base", value: "Inter" }] }, { name: "font/body", type: "STRING", values: [{ mode: "Base", value: "Inter" }] }] };
  const live2 = { "font/heading": { Base: { type: "VARIABLE_ALIAS", id: "id-headline" } }, "font/body": { Base: "Inter" } };
  const aliasMap3 = { "font/heading": "font/headline" };
  const liveAliasTargets3 = { "font/heading": "font/headline" };
  const mjsReport2 = libraryModeReport(plan2, live2, aliasMap3, liveAliasTargets3);
  const vmReport2 = vmLibraryModeReport ? vmLibraryModeReport(plan2, live2, aliasMap3, liveAliasTargets3) : null;
  if (!vmReport2) FAIL("libraryparity", "code.js exported no libraryModeReportVM (4-arg form)");
  else if (JSON.stringify(mjsReport2) !== JSON.stringify(vmReport2)) FAIL("libraryparity", `libraryModeReport/libraryModeReportVM (4-arg) disagree: mjs=${JSON.stringify(mjsReport2)} vm=${JSON.stringify(vmReport2)}`);
  if (mjsReport2.aliases.length) FAIL("libraryparity", `libraryModeReport must omit an already-correctly-aliased name (idempotency fix), got ${JSON.stringify(mjsReport2.aliases)}`);
  if (mjsReport2.deprecates.length) FAIL("libraryparity", `libraryModeReport must not deprecate an already-correctly-aliased name, got ${JSON.stringify(mjsReport2.deprecates)}`);

  // priorLibraryUplift / priorLibraryUpliftVM (#635, tightened in review round 1), the gate's "already
  // uplifted" evidence rule: an existing name NOT in wantedNames that carries a live alias target OR sits
  // under "_deprecated/". A wanted name's alias (the plan's own ALIAS variables) is NOT evidence.
  const upliftCases = [
    [["size/sm/height"], ["size/sm/height"], {}],
    [["size/sm/height", "size/small/height"], ["size/sm/height"], { "size/small/height": "size/sm/height" }],
    [["size/sm/height", "_deprecated/size/odd/height"], ["size/sm/height"], {}],
    [[], [], undefined], [["_deprecated/x"], [], undefined],
    [["font/body", "font/sans"], ["font/body", "font/sans"], { "font/body": "font/sans" }],
    [["font/body", "font/sans", "font/heading"], ["font/body", "font/sans"], { "font/body": "font/sans", "font/heading": "font/sans" }],
    [["_deprecated/a"], ["_deprecated/a"], {}],
  ];
  for (const [names, wanted, targets] of upliftCases) {
    const mjsU = priorLibraryUplift(names, wanted, targets);
    const vmU = vmPriorLibraryUplift ? vmPriorLibraryUplift(names, wanted, targets) : "MISSING";
    if (mjsU !== vmU) FAIL("libraryparity", `priorLibraryUplift disagree for ${JSON.stringify({ names, wanted, targets })}: mjs=${mjsU} vm=${vmU}`);
  }
  if (priorLibraryUplift(["size/sm/height"], ["size/sm/height"], {}) !== false) FAIL("libraryparity", "priorLibraryUplift must be false for a never-touched collection");
  if (priorLibraryUplift(["font/body", "font/sans"], ["font/body", "font/sans"], { "font/body": "font/sans" }) !== false) FAIL("libraryparity", "priorLibraryUplift must be false when the only live alias belongs to a WANTED name (the plan's own ALIAS variable)");
  if (priorLibraryUplift(["_deprecated/a"], ["_deprecated/a"], {}) !== false) FAIL("libraryparity", "priorLibraryUplift must be false when the only _deprecated/ name is itself wanted");
  if (priorLibraryUplift(["a", "b"], ["b"], { a: "b" }) !== true || priorLibraryUplift(["_deprecated/a", "b"], ["b"], {}) !== true) FAIL("libraryparity", "priorLibraryUplift must be true on an UNWANTED live alias or an UNWANTED _deprecated/ name");

  // pruneCandidates / pruneCandidatesVM (#659), the classic prune's candidate set is MONOTONIC over
  // "_deprecated/" names: existing - wanted - "_deprecated/*", whatever else the collection holds.
  const pruneCases = [
    [["size/sm/height"], ["size/sm/height"]],
    [["_deprecated/size/small/height"], ["size/sm/height"]],
    [["_deprecated/size/small/height", "size/old", "size/sm/height"], ["size/sm/height"]],
    [["_deprecated/a"], ["_deprecated/a"]], [[], []], [undefined, undefined],
  ];
  for (const [names, wanted] of pruneCases) {
    const mjsP = JSON.stringify(pruneCandidates(names, wanted));
    const vmP = vmPruneCandidates ? JSON.stringify(vmPruneCandidates(names, wanted)) : "MISSING";
    if (mjsP !== vmP) FAIL("libraryparity", `pruneCandidates disagree for ${JSON.stringify({ names, wanted })}: mjs=${mjsP} vm=${vmP}`);
  }
  if (JSON.stringify(pruneCandidates(["_deprecated/size/small/height"], ["size/sm/height"])) !== "[]") FAIL("libraryparity", "pruneCandidates must never list a lone _deprecated/ name");
  if (JSON.stringify(pruneCandidates(["_deprecated/size/small/height", "size/old", "size/sm/height"], ["size/sm/height"])) !== JSON.stringify(["size/old"])) FAIL("libraryparity", "pruneCandidates must list the unrelated stale name and STILL skip the _deprecated/ name beside it (monotonic)");
  if (JSON.stringify(pruneCandidates(["size/sm/height"], ["size/sm/height"])) !== "[]") FAIL("libraryparity", "pruneCandidates must be empty when existing == wanted");

  // LIBRARY_TYPE_VOICE_MAP, the same static map, migrations.mjs vs the code.js literal copy
  if (JSON.stringify(LIBRARY_TYPE_VOICE_MAP) !== JSON.stringify(vmLibraryTypeVoiceMap)) FAIL("libraryparity", `LIBRARY_TYPE_VOICE_MAP drifted: migrations.mjs=${JSON.stringify(LIBRARY_TYPE_VOICE_MAP)} code.js=${JSON.stringify(vmLibraryTypeVoiceMap)}`);

  // #498 grammar bridge, TYPE_STEP_FIELD_MAP / GEOMETRY_FIELD_RENAME_MAP static maps, parseOldTypeStepName,
  // and the two new pure alias-map builders, mjs vs the code.js literal/VM copies.
  if (JSON.stringify(TYPE_STEP_FIELD_MAP) !== JSON.stringify(vmTypeStepFieldMap)) FAIL("libraryparity", `TYPE_STEP_FIELD_MAP drifted: mjs=${JSON.stringify(TYPE_STEP_FIELD_MAP)} code.js=${JSON.stringify(vmTypeStepFieldMap)}`);
  if (JSON.stringify(GEOMETRY_FIELD_RENAME_MAP) !== JSON.stringify(vmGeometryFieldRenameMap)) FAIL("libraryparity", `GEOMETRY_FIELD_RENAME_MAP drifted: migrations.mjs=${JSON.stringify(GEOMETRY_FIELD_RENAME_MAP)} code.js=${JSON.stringify(vmGeometryFieldRenameMap)}`);

  const parseCases = ["Heading/MD/size", "UI/3XS/weight", "font/heading", "Code/2XS/singleLineHeight", "Too/Many/Segments/Here", "weight/display/bold", "weight-style/display/bold"];
  for (const c of parseCases) {
    const mjsP = parseOldTypeStepName(c);
    const vmP = vmParseOldTypeStepName ? vmParseOldTypeStepName(c) : "MISSING";
    if (vmParseOldTypeStepName === undefined) FAIL("libraryparity", "code.js exported no parseOldTypeStepNameVM");
    else if (JSON.stringify(mjsP) !== JSON.stringify(vmP)) FAIL("libraryparity", `parseOldTypeStepName/parseOldTypeStepNameVM disagree for "${c}": mjs=${JSON.stringify(mjsP)} vm=${JSON.stringify(vmP)}`);
  }
  if (!parseOldTypeStepName("Heading/MD/size") || parseOldTypeStepName("Heading/MD/size").voiceLower !== "heading" || parseOldTypeStepName("Heading/MD/size").stepLower !== "md") FAIL("libraryparity", "parseOldTypeStepName did not lowercase voice/step correctly");
  if (parseOldTypeStepName("font/heading") !== null) FAIL("libraryparity", "parseOldTypeStepName must reject a 2-segment name (a different grammar)");
  // a real defect found while building this bridge: an UNGUARDED 3-segment parse false-positive-matched
  // an ORDINARY current-grammar "weight/<voice>/<slug>" name (a sibling-weight variable, present in
  // every real Type Primitives collection), defeating the executor's own "only scan when this grammar
  // is actually present" guard on every NORMAL apply. The step segment MUST look like an old-style
  // UPPERCASE token (current slugs are always lowercase-kebab) to be accepted.
  if (parseOldTypeStepName("weight/display/bold") !== null) FAIL("libraryparity", "parseOldTypeStepName must reject an ordinary weight/<voice>/<slug> name (lowercase step segment)");
  if (parseOldTypeStepName("weight-style/display/bold") !== null) FAIL("libraryparity", "parseOldTypeStepName must reject an ordinary weight-style/<voice>/<slug> name (lowercase step segment)");

  const sizeRecs = [{ voice: "Heading", step: "MD", voiceLower: "heading", size: 34 }];
  const voiceMapT = { heading: "headline" };
  const sizesT = { headline: { sm: 32, md: 40, lg: 48 } };
  const mjsStepMap = typeStepAliasMap(sizeRecs, voiceMapT, sizesT, TYPE_STEP_FIELD_MAP);
  const vmStepMap = vmTypeStepAliasMap ? vmTypeStepAliasMap(sizeRecs, voiceMapT, sizesT, vmTypeStepFieldMap) : null;
  if (!vmStepMap) FAIL("libraryparity", "code.js exported no typeStepAliasMapVM");
  else if (JSON.stringify(mjsStepMap) !== JSON.stringify(vmStepMap)) FAIL("libraryparity", `typeStepAliasMap/typeStepAliasMapVM disagree: mjs=${JSON.stringify(mjsStepMap)} vm=${JSON.stringify(vmStepMap)}`);
  if (mjsStepMap["Heading/MD/size"] !== "type/headline/sm/size") FAIL("libraryparity", `typeStepAliasMap should match nearest-by-size (sm, dist 2) over md (dist 6), got ${JSON.stringify(mjsStepMap)}`);

  const weightRecs = [{ voice: "Heading", step: "MD", voiceLower: "heading", weight: 620 }];
  const weightCand = { headline: { bySlug: { regular: 400, medium: 500, "semi-bold": 620, bold: 700 } } };
  const mjsWeightMap = typeWeightAliasMap(weightRecs, voiceMapT, weightCand);
  const vmWeightMap = vmTypeWeightAliasMap ? vmTypeWeightAliasMap(weightRecs, voiceMapT, weightCand) : null;
  if (!vmWeightMap) FAIL("libraryparity", "code.js exported no typeWeightAliasMapVM");
  else if (JSON.stringify(mjsWeightMap) !== JSON.stringify(vmWeightMap)) FAIL("libraryparity", `typeWeightAliasMap/typeWeightAliasMapVM disagree: mjs=${JSON.stringify(mjsWeightMap)} vm=${JSON.stringify(vmWeightMap)}`);
  if (mjsWeightMap["Heading/MD/weight"] !== "weight/headline/semi-bold") FAIL("libraryparity", `typeWeightAliasMap should match the exact-value candidate (semi-bold, dist 0), got ${JSON.stringify(mjsWeightMap)}`);
  // a BARE weight/<voice> candidate wins outright over any slug-suffixed one, regardless of value distance.
  const bareWeightMap = typeWeightAliasMap(weightRecs, voiceMapT, { headline: { bare: true, bySlug: { regular: 400 } } });
  if (bareWeightMap["Heading/MD/weight"] !== "weight/headline") FAIL("libraryparity", `typeWeightAliasMap should prefer a bare weight/<voice> candidate, got ${JSON.stringify(bareWeightMap)}`);

  // geometrySizeAliasMap's 4th-arg field-rename bridge (#498), same nearest-by-height step match,
  // an OLD-SPELLED field name landing on the translated CURRENT field.
  const mjsFieldGeo = geometrySizeAliasMap({ xs: 20 }, { xs: 20, sm: 24 }, ["height", "icon"], GEOMETRY_FIELD_RENAME_MAP);
  const vmFieldGeo = vmExpandGeometryAliasMap ? vmExpandGeometryAliasMap({ xs: 20 }, { xs: 20, sm: 24 }, ["height", "icon"], vmGeometryFieldRenameMap) : null;
  if (!vmFieldGeo) FAIL("libraryparity", "code.js exported no expandGeometryAliasMap (4-arg form)");
  else if (JSON.stringify(mjsFieldGeo) !== JSON.stringify(vmFieldGeo)) FAIL("libraryparity", `geometrySizeAliasMap/expandGeometryAliasMap (4-arg) disagree: mjs=${JSON.stringify(mjsFieldGeo)} vm=${JSON.stringify(vmFieldGeo)}`);
  if (mjsFieldGeo["size/xs/edgePadding"] !== "size/xs/padding-wide") FAIL("libraryparity", `geometrySizeAliasMap should bridge size/xs/edgePadding -> size/xs/padding-wide, got ${JSON.stringify(mjsFieldGeo)}`);
}

// ── librarymode (#495): "published library" mode, the ADIA-file scenario, mirrored: an 11-voice
//    Font Primitives collection (Heading/UI/Caption/Legal/Code/Body/Display/Lead/Kicker/Sub-heading/
//    Quote, #495's own scope item 3, verbatim) predating the current 15-voice set. Only `font/<voice>`
//    is fixtured (not `family/<voice>`): typeTokensFigmaPrimitivesModes dedupes `family/*` by resolved
//    font string (famKey[fam] = family/<firstRole>, first-writer-wins), so it is NOT reliably one-per-
//    voice, e.g. the product treatment only emits family/display, family/body, family/mono. `font/*`
//    IS emitted unconditionally per voice (an ALIAS to whichever family/* key backs it), so it's the
//    reliable per-voice name a real old file's aliasing/deprecation would ride. A normal apply would
//    PRUNE the 6 with no current-name match (5 renamed + Quote); library mode must NEVER remove any of
//    them: the 5 renamed voices' font/* variables ALIAS to their mapped current counterpart (value
//    redirected, id kept), Quote's ALIAS to "_deprecated/font/quote" (id kept, no mapping exists).
//    0 removals; idempotent second run; dry-run report (libraryReport) matches what was applied. ──
if (applyFontPrimitivesModes) {
  try {
    const FL = mockFigma();
    const ll = new Function("figma", "__html__", "module", code + "\nreturn { applyFontPrimitivesModes };")(FL.figma, "<html>", undefined);
    const OLD_VOICES = ["heading", "ui", "caption", "legal", "code", "body", "display", "lead", "kicker", "sub-heading", "quote"]; // 11, per #495's own list
    // Create the OLD-era collection THROUGH the executor itself (not a raw figma.variables call) so it
    // gets registered in FLOAT_REGISTRY_KEY, ensureFloatCollection resolves its target by REGISTRY id
    // (or renameFrom), never by a bare name match (same provenance discipline as #492's color registry),
    // so an out-of-band collection would be invisible to the library-mode apply below and a SECOND, empty
    // "Type Primitives" would be created instead. Mirrors the "RETURNING FILE" fontmodes fixture above.
    const eraOnePlanFP = { collection: "Type Primitives", modes: ["Value"], defaultMode: "Value", addModes: [], variables: OLD_VOICES.map((v) => ({ name: "font/" + v, type: "STRING", values: [{ mode: "Value", value: "Old Font " + v }] })) };
    await ll.applyFontPrimitivesModes(eraOnePlanFP);
    const oldCollFP = FL.collections.find((c) => c.name === "Type Primitives");
    const scaleFP = TYPE.typeScale({ treatment: "product", bodyBase: 16 });
    const planFP = primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(scaleFP));
    const res1 = await ll.applyFontPrimitivesModes(planFP, { libraryMode: true });
    if (!res1 || !res1.libraryReport) FAIL("librarymode", "applyFontPrimitivesModes({libraryMode:true}) returned no libraryReport");
    else {
      const rpt = res1.libraryReport;
      if (!rpt.libraryMode) FAIL("librarymode", "libraryReport.libraryMode should be true when opts.libraryMode:true was passed");
      // 0 removals: every old font/* variable for all 11 voices must still exist by ID afterward.
      const stillThere = OLD_VOICES.every((v) => FL.variables.some((va) => va.variableCollectionId === oldCollFP.id && (va.name === "font/" + v || va.name.indexOf("_deprecated/font/" + v) === 0)));
      if (!stillThere) FAIL("librarymode", "library mode removed a variable that should have been aliased or deprecated instead");
      // the 5 renamed voices -> aliased; "quote" -> deprecated.
      const expectAliased = ["heading", "ui", "caption", "legal", "code"];
      for (const v of expectAliased) {
        if (!rpt.aliases.some((a) => a.from === "font/" + v)) FAIL("librarymode", `expected "font/${v}" aliased, got aliases=${JSON.stringify(rpt.aliases)}`);
      }
      if (!rpt.deprecates.some((d) => d.from === "font/quote" && d.to === "_deprecated/font/quote")) FAIL("librarymode", `expected "font/quote" deprecated, got deprecates=${JSON.stringify(rpt.deprecates)}`);
      if (rpt.removed.length) FAIL("librarymode", `libraryReport.removed must be empty in library mode, got ${JSON.stringify(rpt.removed)}`);
      // the ALIASED variable's actual live value must now resolve to the MAPPED target (every mode).
      const aliasedHeadingFont = FL.variables.find((va) => va.variableCollectionId === oldCollFP.id && va.name === "font/heading");
      const targetHeadlineFont = FL.variables.find((va) => va.variableCollectionId === oldCollFP.id && va.name === "font/headline");
      if (!aliasedHeadingFont || !targetHeadlineFont) FAIL("librarymode", "expected both font/heading (kept) and font/headline (planned) to exist live");
      else {
        const val = aliasedHeadingFont.valuesByMode[oldCollFP.modes[0].modeId];
        if (!val || val.type !== "VARIABLE_ALIAS" || val.id !== targetHeadlineFont.id) FAIL("librarymode", "font/heading's value was not redirected to font/headline via a real alias");
      }
    }
    // IDEMPOTENT second run, STRICT: a variable already correctly aliased/deprecated from run 1 needs NO
    // further action on an unchanged re-apply, a published library must not churn names/values on every
    // apply (a real defect found in review: run 1's alias write leaves no LITERAL value behind, so a
    // naive re-derive of the alias map on run 2 loses the mapping and misclassifies an already-correctly-
    // ALIASED variable as unmapped -> deprecate, renaming it out from under itself every single apply).
    const res2 = await ll.applyFontPrimitivesModes(planFP, { libraryMode: true });
    const stillThere2 = OLD_VOICES.every((v) => FL.variables.some((va) => va.variableCollectionId === oldCollFP.id && (va.name === "font/" + v || va.name.indexOf("_deprecated/font/" + v) === 0)));
    if (!stillThere2) FAIL("librarymode", "second run removed something library mode should have preserved");
    if (res2 && res2.libraryReport && res2.libraryReport.deprecates.some((d) => d.to.indexOf("_deprecated/_deprecated/") === 0)) FAIL("librarymode", "second run double-prefixed an already-deprecated variable, not idempotent");
    if (!res2 || !res2.libraryReport) FAIL("librarymode", "second run returned no libraryReport");
    else {
      const rpt2 = res2.libraryReport;
      if (rpt2.aliases.length) FAIL("librarymode", `second run should report 0 aliases (already correctly aliased = no-op), got ${JSON.stringify(rpt2.aliases)}`);
      if (rpt2.deprecates.length) FAIL("librarymode", `second run should report 0 deprecates (already resolved), got ${JSON.stringify(rpt2.deprecates)}`);
      if (rpt2.renames.length) FAIL("librarymode", `second run should report 0 renames, got ${JSON.stringify(rpt2.renames)}`);
    }
  } catch (e) { FAIL("librarymode", "applyFontPrimitivesModes library-mode e2e threw: " + e.message); }

  // #635 review round 1, negative control: a NEVER-touched Font Primitives collection re-applied with the
  // SAME plan (empty report) and an UNDECIDED library mode must read libraryMode:false. The plan carries
  // plan-level ALIAS variables (font/<voice> -> font/<face>), so liveAliasTargets is non-empty on a
  // collection nobody ever uplifted, the evidence must be scoped to existing names the plan does NOT
  // want, or every Font Primitives collection reads as "already uplifted".
  try {
    const FN = mockFigma();
    const ln = new Function("figma", "__html__", "module", code + "\nreturn { applyFontPrimitivesModes };")(FN.figma, "<html>", undefined);
    const planN = primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 })));
    if (!planN.variables.some((v) => v.type === "ALIAS")) FAIL("librarymode", "fixture broken: the Font Primitives plan carries no plan-level ALIAS variable, so this control proves nothing");
    await ln.applyFontPrimitivesModes(planN);
    const resN = await ln.applyFontPrimitivesModes(planN, {});
    if (!resN || !resN.libraryReport) FAIL("librarymode", "never-touched Font Primitives re-apply returned no libraryReport");
    else {
      const r = resN.libraryReport;
      if (r.aliases.length || r.deprecates.length) FAIL("librarymode", `fixture broken: never-touched re-apply must have an EMPTY report, got aliases=${JSON.stringify(r.aliases)} deprecates=${JSON.stringify(r.deprecates)}`);
      else if (r.libraryMode !== false) FAIL("librarymode", `never-touched Font Primitives + empty report must read libraryMode:false, got ${r.libraryMode}, the plan's own ALIAS variables were mistaken for a prior uplift`);
    }
  } catch (e) { FAIL("librarymode", "never-touched Font Primitives control threw: " + e.message); }
}

// ── librarygrammar (#498): the ADIA file's TWO older grammars, bridged instead of deprecated, a
//    Geometry size/* collection using pre-current field spellings (edgePadding/gap/minWidth/padding/
//    radius/font, #498's own example list) AND a pre-collection-split Type Primitives collection using
//    the "Voice/STEP/field" grammar (Title-Case voice, UPPERCASE step, camelCase field, e.g.
//    "Heading/MD/size", "UI/3XS/weight"). Both collections are set up via their OWN executor first (so
//    they're properly REGISTERED, ensureFloatCollection resolves by registry id only, same discipline
//    as every other fixture in this file), Geometry BEFORE Type Primitives, the SAME order the flagship's
//    real message handler uses, and the order this bridge's cross-collection Type->Geometry alias target
//    resolution depends on (see applyFontPrimitivesModes' own header comment on the bridge group). ──
if (applyFloatPlans && applyFontPrimitivesModes) {
  try {
    const FG = mockFigma();
    const lg = new Function("figma", "__html__", "module", code + "\nreturn { applyFloatPlans, applyFontPrimitivesModes };")(FG.figma, "<html>", undefined);

    // ── Geometry: 9 old fields (height/icon/caret unrenamed; edgePadding/gap/minWidth/padding/radius
    //    renamed; font, no clean same-collection target, deliberately deprecated, see
    //    GEOMETRY_FIELD_RENAME_MAP's own header comment) × 6 SAME-NAMED steps (isolates the field-
    //    spelling bridge from step-drift, which #495's own librarygeom/binder.mjs fixture already covers).
    const GEO_STEPS = { xs: 20, sm: 24, md: 28, lg: 36, xl: 48, "2xl": 64 }; // matches comfortable/baseHeight-28
    const OLD_GEO_FIELDS = ["height", "icon", "caret", "edgePadding", "gap", "minWidth", "padding", "radius", "font"];
    const oldGeoVars = [];
    for (const [step, h] of Object.entries(GEO_STEPS)) {
      for (const field of OLD_GEO_FIELDS) oldGeoVars.push({ name: `size/${step}/${field}`, type: "FLOAT", values: [{ mode: "Base", value: field === "height" ? h : Math.round(h / 3) + 1 }] });
    }
    await lg.applyFloatPlans([{ collection: "Geometry", modes: ["Base"], defaultMode: "Base", addModes: [], variables: oldGeoVars }]);
    const oldGeo = FG.collections.find((c) => c.name === "Geometry");

    // ── Type Primitives: the "Voice/STEP/field" grammar. Heading/UI/Code cover the 3 renamed voices
    //    (+ their heaviest test: UI/Code carry an OUT-OF-RANGE old step, #498's own "3XS" example);
    //    Body covers the IDENTITY voice fallback (unchanged name, not in LIBRARY_TYPE_VOICE_MAP); UI's
    //    singleLineHeight has no bridge at all (deprecates, #498's own instruction).
    const oldTypeVars = [];
    const addStep = (voice, step, size, lineHeight, letterSpacing, paragraphSpacing, weight) => {
      oldTypeVars.push({ name: `${voice}/${step}/size`, type: "FLOAT", values: [{ mode: "Value", value: size }] });
      oldTypeVars.push({ name: `${voice}/${step}/lineHeight`, type: "FLOAT", values: [{ mode: "Value", value: lineHeight }] });
      oldTypeVars.push({ name: `${voice}/${step}/letterSpacing`, type: "FLOAT", values: [{ mode: "Value", value: letterSpacing }] });
      oldTypeVars.push({ name: `${voice}/${step}/paragraphSpacing`, type: "FLOAT", values: [{ mode: "Value", value: paragraphSpacing }] });
      oldTypeVars.push({ name: `${voice}/${step}/weight`, type: "FLOAT", values: [{ mode: "Value", value: weight }] });
    };
    addStep("Heading", "MD", 34, 44, 0.2, 8, 620); // nearest headline step by size: sm(32,dist2) over md(40,dist6); weight exact-matches semi-bold(620)
    addStep("UI", "3XS", 10, 14, 0.1, 4, 450); // outside ui-control's own range (xs=12 is its smallest), clamps to nearest (xs, dist 2); weight nearest regular(440,dist10) over medium(500,dist50)
    addStep("Code", "2XS", 10, 13, 0.05, 2, 460); // outside label-mono's own range, clamps to nearest (sm, dist 2); weight nearest regular(440,dist20) over medium(500,dist40)
    addStep("Body", "MD", 15.5, 24, 0, 8, 460); // IDENTITY voice (unchanged name), nearest body step by size: md(16,dist0.5) over sm(14,dist1.5), NOT 17, a tie between md(dist1) and lg(dist1); weight nearest regular(440,dist20)
    oldTypeVars.push({ name: "UI/3XS/singleLineHeight", type: "FLOAT", values: [{ mode: "Value", value: 16 }] }); // no bridge at all, deprecates
    await lg.applyFontPrimitivesModes({ collection: "Type Primitives", modes: ["Value"], defaultMode: "Value", addModes: [], variables: oldTypeVars });
    const oldType = FG.collections.find((c) => c.name === "Type Primitives");

    // ── apply the REAL current plans, library mode, Geometry FIRST (matches the flagship's own order,
    //    Type Primitives' cross-collection bridge below depends on Geometry's type/ vars already existing).
    //    The Geometry plan must carry BOTH halves (TKT-0009 merge, mirroring #495's own floatcreate
    //    test), geomTokensFigmaModes alone is box-only and carries no type/ vars at all, which the
    //    Type Primitives cross-collection bridge needs to alias against.
    const scaleG = TYPE.typeScale({ treatment: "product", bodyBase: 16 });
    const typeIxG = TYPE.typeTokensFigmaModes(scaleG, []);
    const geomIx = GEOM.geomTokensFigmaModes(GEOM.geomScale({ treatment: "comfortable", baseHeight: 28 }), []);
    const geoPlans = modeApplyPlan(mergeModeInterchanges(typeIxG, geomIx));
    const resGeo = await lg.applyFloatPlans(geoPlans, { libraryMode: true });
    const planFP = primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(scaleG));
    const resType = await lg.applyFontPrimitivesModes(planFP, { libraryMode: true });

    // 0 removals, every old var, in BOTH collections, still exists by name.
    // "font" is deliberately DEPRECATED (renamed under _deprecated/, id-preserving, see
    // GEOMETRY_FIELD_RENAME_MAP's own header comment), so "still there" tolerates that rename, same as
    // #495's own librarygeom/librarymode fixtures.
    const geoStillThere = oldGeoVars.every((v) => FG.variables.some((va) => va.variableCollectionId === oldGeo.id && (va.name === v.name || va.name === "_deprecated/" + v.name)));
    if (!geoStillThere) FAIL("librarygrammar", "library mode removed an old Geometry size/* variable");
    const typeStillThere = oldTypeVars.every((v) => FG.variables.some((va) => va.variableCollectionId === oldType.id && (va.name === v.name || va.name === "_deprecated/" + v.name)));
    if (!typeStillThere) FAIL("librarygrammar", "library mode removed an old Type Primitives Voice/STEP/field variable");

    // Geometry: exactly the 5 renamed fields × 6 steps aliased, "font" × 6 steps deprecated (documented
    // scope decision, see GEOMETRY_FIELD_RENAME_MAP's own header comment), height/icon/caret are
    // ALREADY-wanted names (identity steps + identity spelling), so they never enter the alias/deprecate
    // report at all; they're ordinary create/update entries.
    const geoRpt = resGeo && resGeo.libraryReports && resGeo.libraryReports[0];
    if (!geoRpt) FAIL("librarygrammar", "applyFloatPlans returned no libraryReport for Geometry");
    else {
      if (geoRpt.aliases.length !== 30) FAIL("librarygrammar", `expected 30 Geometry field-spelling aliases (5 fields x 6 steps), got ${geoRpt.aliases.length}: ${JSON.stringify(geoRpt.aliases)}`);
      if (!geoRpt.aliases.some((a) => a.from === "size/xs/edgePadding" && a.to === "size/xs/padding-wide")) FAIL("librarygrammar", `expected size/xs/edgePadding -> size/xs/padding-wide, got ${JSON.stringify(geoRpt.aliases)}`);
      if (geoRpt.deprecates.length !== 6 || !geoRpt.deprecates.every((d) => d.from.indexOf("/font") === d.from.length - 5)) FAIL("librarygrammar", `expected exactly 6 "font" deprecates (1 field x 6 steps), got ${JSON.stringify(geoRpt.deprecates)}`);
    }
    // the alias's actual LIVE value must resolve to a real alias pointing at the CURRENT variable.
    const oldEdgePad = FG.variables.find((v) => v.variableCollectionId === oldGeo.id && v.name === "size/xs/edgePadding");
    const newPadWide = FG.variables.find((v) => v.variableCollectionId === oldGeo.id && v.name === "size/xs/padding-wide");
    if (!oldEdgePad || !newPadWide || oldEdgePad.valuesByMode[oldGeo.modes[0].modeId].type !== "VARIABLE_ALIAS" || oldEdgePad.valuesByMode[oldGeo.modes[0].modeId].id !== newPadWide.id) FAIL("librarygrammar", "size/xs/edgePadding's value was not redirected to size/xs/padding-wide via a real alias");

    // Type Primitives: the {size,lineHeight,letterSpacing,paragraphSpacing} bridge (4 fields x 4 steps =
    // 16) + the weight bridge (1 field x 4 steps = 4) = 20 aliases; UI/3XS/singleLineHeight deprecated (1).
    const typeRpt = resType && resType.libraryReport;
    if (!typeRpt) FAIL("librarygrammar", "applyFontPrimitivesModes returned no libraryReport");
    else {
      if (typeRpt.aliases.length !== 20) FAIL("librarygrammar", `expected 20 Type Primitives aliases (4 fields + weight, x 4 old voice/steps), got ${typeRpt.aliases.length}: ${JSON.stringify(typeRpt.aliases)}`);
      const expectAlias = {
        "Heading/MD/size": "type/headline/sm/size", "Heading/MD/weight": "weight/headline/semi-bold",
        "UI/3XS/size": "type/ui-control/xs/size", "UI/3XS/weight": "weight/ui-control/regular",
        "Code/2XS/size": "type/label-mono/sm/size", "Code/2XS/weight": "weight/label-mono/regular",
        "Body/MD/size": "type/body/md/size", "Body/MD/weight": "weight/body/regular",
      };
      for (const [from, to] of Object.entries(expectAlias)) {
        if (!typeRpt.aliases.some((a) => a.from === from && a.to === to)) FAIL("librarygrammar", `expected "${from}" aliased to "${to}", got ${JSON.stringify(typeRpt.aliases)}`);
      }
      if (!typeRpt.deprecates.some((d) => d.from === "UI/3XS/singleLineHeight" && d.to === "_deprecated/UI/3XS/singleLineHeight")) FAIL("librarygrammar", `expected "UI/3XS/singleLineHeight" deprecated, got ${JSON.stringify(typeRpt.deprecates)}`);
    }
    // the CROSS-COLLECTION alias's actual LIVE value must resolve to a REAL alias pointing at the
    // GEOMETRY variable's id (not merely a name string in the report).
    const oldHeadingSize = FG.variables.find((v) => v.variableCollectionId === oldType.id && v.name === "Heading/MD/size");
    const newHeadlineSmSize = FG.variables.find((v) => v.variableCollectionId === oldGeo.id && v.name === "type/headline/sm/size");
    if (!oldHeadingSize || !newHeadlineSmSize || oldHeadingSize.valuesByMode[oldType.modes[0].modeId].type !== "VARIABLE_ALIAS" || oldHeadingSize.valuesByMode[oldType.modes[0].modeId].id !== newHeadlineSmSize.id) FAIL("librarygrammar", "Heading/MD/size's value was not redirected to the CROSS-COLLECTION type/headline/sm/size via a real alias");

    // ── IDEMPOTENT second run, STRICT, both collections, 0 aliases/deprecates/renames.
    const resGeo2 = await lg.applyFloatPlans(geoPlans, { libraryMode: true });
    const resType2 = await lg.applyFontPrimitivesModes(planFP, { libraryMode: true });
    const geoRpt2 = resGeo2 && resGeo2.libraryReports && resGeo2.libraryReports[0];
    if (!geoRpt2) FAIL("librarygrammar", "second run returned no Geometry libraryReport");
    else if (geoRpt2.aliases.length || geoRpt2.deprecates.length || geoRpt2.renames.length) FAIL("librarygrammar", `second Geometry run should report 0 changes, got aliases=${JSON.stringify(geoRpt2.aliases)} deprecates=${JSON.stringify(geoRpt2.deprecates)} renames=${JSON.stringify(geoRpt2.renames)}`);
    const typeRpt2 = resType2 && resType2.libraryReport;
    if (!typeRpt2) FAIL("librarygrammar", "second run returned no Type Primitives libraryReport");
    else if (typeRpt2.aliases.length || typeRpt2.deprecates.length || typeRpt2.renames.length) FAIL("librarygrammar", `second Type Primitives run should report 0 changes, got aliases=${JSON.stringify(typeRpt2.aliases)} deprecates=${JSON.stringify(typeRpt2.deprecates)} renames=${JSON.stringify(typeRpt2.renames)}`);
    if (FG.collections.filter((c) => c.name === "Geometry").length !== 1 || FG.collections.filter((c) => c.name === "Type Primitives").length !== 1) FAIL("librarygrammar", "second run duplicated a collection");
  } catch (e) { FAIL("librarygrammar", "the grammar-bridge e2e threw: " + e.message); }
}

// ── fontprimslibrary (#696): the Type Primitives MODE prune must read the SAME resolved `useLibrary`
//    the VARIABLE prune below it already reads (explicit opts.libraryMode, else the interactive
//    confirmLibraryMode ask, else #635's priorLibraryUpliftVM fallback over the variable evidence),
//    not `opts.libraryMode === true` taken raw at collection time. Before #696, an old pre-#629
//    ui.html bundle (opts.libraryMode undefined) applying to a file that already carries prior-uplift
//    evidence (a "_deprecated/font/..." variable) kept the variables (library) but PRUNED the stale
//    mode (classic): a published library losing a mode every consumer pinned.
if (applyFontPrimitivesModes) {
  const OLD_VOICES_FPL = ["heading", "ui", "caption", "legal", "code", "body", "display", "lead", "kicker", "sub-heading", "quote"];
  // buildUpliftedMock: brings a fresh mock to "already library-uplifted", an old-era single-"Value"-mode
  // collection healed into Premium+Google Fonts, then a real libraryMode:true apply of planFP so a real
  // "_deprecated/font/quote" variable (and several live aliases) sit in the collection as genuine
  // prior-uplift evidence, never a fabricated fixture.
  async function buildUpliftedMockFPL() {
    const F = mockFigma();
    const loaded = new Function("figma", "__html__", "module", code + "\nreturn { applyFontPrimitivesModes };")(F.figma, "<html>", undefined);
    const eraOnePlan = { collection: "Type Primitives", modes: ["Value"], defaultMode: "Value", addModes: [], variables: OLD_VOICES_FPL.map((v) => ({ name: "font/" + v, type: "STRING", values: [{ mode: "Value", value: "Old Font " + v }] })) };
    await loaded.applyFontPrimitivesModes(eraOnePlan);
    const scaleFP = TYPE.typeScale({ treatment: "product", bodyBase: 16 });
    const planFP = primitivesModesApplyPlan(TYPE.typeTokensFigmaPrimitivesModes(scaleFP));
    await loaded.applyFontPrimitivesModes(planFP, { libraryMode: true });
    return { F, loaded, planFP };
  }
  try {
    // ── LEG (a): opts.libraryMode undefined (an old pre-#629 ui.html bundle) + prior-uplift evidence +
    //    a plan dropping the "Google Fonts" mode. The mode must survive AND be reported in staleModes,
    //    the SAME decision the variable half already makes off the priorLibraryUpliftVM fallback.
    {
      const { F: Fa, loaded: la, planFP: planA } = await buildUpliftedMockFPL();
      const beforeA = Fa.collections.find((c) => c.name === "Type Primitives");
      if (!beforeA || beforeA.modes.map((m) => m.name).join() !== "Premium,Google Fonts") FAIL("fontprimslibrary", `fixture: expected Premium,Google Fonts before the narrow apply, got ${beforeA && beforeA.modes.map((m) => m.name)}`);
      const deprecatedBefore = Fa.variables.some((v) => v.variableCollectionId === beforeA.id && v.name === "_deprecated/font/quote");
      if (!deprecatedBefore) FAIL("fontprimslibrary", "fixture: no '_deprecated/font/quote' prior-uplift evidence before the narrow apply, the leg would prove nothing");
      const narrowA = Object.assign({}, planA, { modes: ["Premium"], addModes: [] });
      const resA = await la.applyFontPrimitivesModes(narrowA); // opts omitted entirely, undefined
      const afterA = Fa.collections.find((c) => c.name === "Type Primitives");
      const modeNamesA = afterA.modes.map((m) => m.name);
      const staleA = (resA && resA.libraryReport && resA.libraryReport.staleModes) || [];
      if (!modeNamesA.includes("Google Fonts")) FAIL("fontprimslibrary", `#696 an undefined libraryMode with prior-uplift evidence removed the stale 'Google Fonts' mode (modes=${JSON.stringify(modeNamesA)}): a published library must never lose a mode a consumer pinned`);
      if (!staleA.includes("Google Fonts")) FAIL("fontprimslibrary", `#696 an undefined libraryMode with prior-uplift evidence did not REPORT the kept 'Google Fonts' mode (staleModes=${JSON.stringify(staleA)})`);
      if (!resA || !resA.libraryReport || resA.libraryReport.libraryMode !== true) FAIL("fontprimslibrary", `#696 the variable half resolved libraryMode=${resA && resA.libraryReport && resA.libraryReport.libraryMode}, want true (prior-uplift evidence): the mode half must read the SAME decision`);
      const deprecatedAfter = Fa.variables.some((v) => v.variableCollectionId === afterA.id && v.name === "_deprecated/font/quote");
      if (!deprecatedAfter) FAIL("fontprimslibrary", "#696 the preserved '_deprecated/font/quote' variable did not survive the narrow apply, the variable half must stay preserved too");
    }
    // ── LEG (b): explicit libraryMode:false, the stale mode IS removed, classic prune unchanged.
    {
      const { F: Fb, loaded: lb, planFP: planB } = await buildUpliftedMockFPL();
      const narrowB = Object.assign({}, planB, { modes: ["Premium"], addModes: [] });
      const resB = await lb.applyFontPrimitivesModes(narrowB, { libraryMode: false });
      const afterB = Fb.collections.find((c) => c.name === "Type Primitives");
      const modeNamesB = afterB.modes.map((m) => m.name);
      const staleB = (resB && resB.libraryReport && resB.libraryReport.staleModes) || [];
      if (modeNamesB.includes("Google Fonts")) FAIL("fontprimslibrary", `#696 libraryMode:false left the stale 'Google Fonts' mode behind (modes=${JSON.stringify(modeNamesB)}): classic prune regressed`);
      if (staleB.length) FAIL("fontprimslibrary", `#696 libraryMode:false reported staleModes ${JSON.stringify(staleB)} instead of removing them`);
    }
    // ── LEG (c): explicit libraryMode:true, already covered by shape, kept here as the third point on
    //    the SAME decision channel (undefined/false/true all agreeing between the two prune sites).
    {
      const { F: Fc, loaded: lc, planFP: planC } = await buildUpliftedMockFPL();
      const narrowC = Object.assign({}, planC, { modes: ["Premium"], addModes: [] });
      const resC = await lc.applyFontPrimitivesModes(narrowC, { libraryMode: true });
      const afterC = Fc.collections.find((c) => c.name === "Type Primitives");
      const modeNamesC = afterC.modes.map((m) => m.name);
      const staleC = (resC && resC.libraryReport && resC.libraryReport.staleModes) || [];
      if (!modeNamesC.includes("Google Fonts")) FAIL("fontprimslibrary", `#696 libraryMode:true removed the stale 'Google Fonts' mode (modes=${JSON.stringify(modeNamesC)}): a published collection's mode must survive`);
      if (!staleC.includes("Google Fonts")) FAIL("fontprimslibrary", `#696 libraryMode:true did not REPORT the kept 'Google Fonts' mode (staleModes=${JSON.stringify(staleC)})`);
    }
  } catch (e) { FAIL("fontprimslibrary", "the font-primitives mode/variable timing e2e threw: " + e.message); }
}

// ── READ-FLOAT-VARIABLES (TKT-0020, Geometry/Type drift reference): the live Geometry + Type
// Primitives values come back in a shape comparable to a modeApplyPlan/primitivesModesApplyPlan entry, the
// apply gate's pre-overwrite diff (collections-arch review C2). Runs on the SAME mock F: by this point
// the float e2e + styles sections above have left a real, registry-tracked Geometry AND Type
// Primitives collection in place, exactly the state a real apply leaves behind.
if (applyFloatPlans) {
  try {
    F.figma.ui._posted.length = 0;
    await F.figma.ui._h({ type: "read-float-variables" });
    const rf = F.figma.ui._posted.find((m) => m && m.type === "float-variables-read");
    if (!rf) FAIL("readfloat", "read-float-variables posted no {type:'float-variables-read'} message");
    else {
      if (!rf.breakpoints || !rf.breakpoints.found) FAIL("readfloat", "read-float-variables did not find the (registry-tracked) Geometry collection");
      else {
        if (!Array.isArray(rf.breakpoints.modes) || !rf.breakpoints.modes.includes("Base")) FAIL("readfloat", `Geometry read-back modes missing "Base" (got ${JSON.stringify(rf.breakpoints.modes)})`);
        const bodyMd = rf.breakpoints.values["type/body/md/size"];
        if (!bodyMd || typeof bodyMd.Base !== "number") FAIL("readfloat", "Geometry read-back missing a numeric type/body/md/size Base value");
      }
      if (!rf.fontPrimitives || !rf.fontPrimitives.found) FAIL("readfloat", "read-float-variables did not find the (registry-tracked) Type Primitives collection");
      else {
        if (!Array.isArray(rf.fontPrimitives.modes) || rf.fontPrimitives.modes.join() !== "Premium,Google Fonts") FAIL("readfloat", `Type Primitives read-back modes = ${JSON.stringify(rf.fontPrimitives.modes)}, want ["Premium","Google Fonts"]`);
        const famNames = Object.keys(rf.fontPrimitives.values).filter((n) => n.startsWith("family/"));
        if (!famNames.length) FAIL("readfloat", "Type Primitives read-back has no family/ literal values");
        if (Object.keys(rf.fontPrimitives.values).some((n) => n.startsWith("font/"))) FAIL("readfloat", "Type Primitives read-back surfaced an ALIAS (font/<voice>) as a comparable value");
      }
    }
    // PROVENANCE: a user's OWN pre-existing "Geometry" this plugin never created (no registry entry)
    // must be invisible to the read too, exactly as it's invisible to applyFloatPlans/ensureFloatCollection.
    const F10 = mockFigma();
    new Function("figma", "__html__", "module", code)(F10.figma, "<html>", undefined); // registers figma.ui.onmessage as a side effect
    F10.figma.variables.createVariableCollection("Geometry");
    await F10.figma.ui._h({ type: "read-float-variables" });
    const rf10 = F10.figma.ui._posted.find((m) => m && m.type === "float-variables-read");
    if (!rf10 || (rf10.breakpoints && rf10.breakpoints.found)) FAIL("readfloat", "read-float-variables must NOT surface a user's own un-registered Geometry collection (provenance violated)");
  } catch (e) { FAIL("readfloat", "read-float-variables threw: " + e.message); }
}

// ── REPORT ───────────────────────────────────────────────────────────────────────
// The printed set is this declared list UNION every gate name that actually reached a FAIL(...)
// call (#699, following #695's pattern in test/engine/tonal.mjs), so a gate missing from the list
// below still shows up, loudly, instead of hiding behind a neighbouring gate's "pass" row. This
// used to be a mid-file list (26 names) plus 8 hand-written per-leg print blocks further down
// (the 8th, fontprimslibrary, arrived in #696 after this conversion started), folded into one
// declared list here so there is a single printed set. gateReport() also runs the report-static
// self-check: a declared name with no FAIL(...) call site, or a call site whose name is not
// declared, fails loudly on its own (report-static).
const DECLARED = ["manifest", "offline", "vmsyntax", "ui", "parse", "apply", "cascade", "idempotent", "prune", "themes", "collnames", "floatapply", "floatidem", "floatprune", "floatprov", "floatretire", "floatlibrary", "renamecap", "colorprov", "colorlibrary", "staleskip", "staleskipfloat", "staleskipfontprim", "staleskipnotice", "colorrenamecap", "applysys", "applydone", "config", "read", "fonts", "resolveface", "sweep", "compliance", "regroup", "primevalue", "readfloat", "styles", "fontmodes", "libraryparity", "librarymode", "adoptconsent", "librarygrammar", "fontprimslibrary", "report-static"];
gateReport({ fails, declared: DECLARED, selfUrl: import.meta.url, FAIL });
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("\nPASS: figma-plugin-app, manifest + offline code.js + bridged ui.html + the figmaBundle→variables cascade + the Type/Geometry breakpoint-mode apply + the styles apply (bound paints/texts, registry prune)");
process.exit(0);
