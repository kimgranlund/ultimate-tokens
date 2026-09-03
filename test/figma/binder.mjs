#!/usr/bin/env node
// verify.mjs — figma-plugin validation adapter (CRITIC side; deny-on-write to the advancer).
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as P from "../../figma/binder/bind-plan.mjs";
import * as MAP from "../../figma/binder/mode-apply-plan.mjs";
import * as TYPE from "../../src/engine/type.mjs";
import * as GEOM from "../../src/engine/geometry.mjs";
import { semanticRoles } from "../../src/engine/semantic.js";
import { COLLECTIONS } from "../../src/engine/collections.js";
import { extractFunctionSource } from "../../figma/binder/splice-utils.mjs";

const HERE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "figma", "binder"); // the binder lives in figma/binder/
const RT = JSON.parse(readFileSync(new URL("../../docs/reference/data/role-table.json", import.meta.url), "utf8"));
const { EXPORT_STOPS, SCRIM_BASES, SCRIM_STEPS } = RT.constants;
const NAMES = RT.defaults.map((p) => p.name.toLowerCase());
const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };

// canonical raw-colors variable name set (the answer key): {n}/{pad3(stop)} ∪ {n}/scrim/{pad3(step)}
// (ADR-016 nested the scrims; the 500 base is implicit while SCRIM_BASES is the single canonical 500)
const pad3 = (s) => String(s).padStart(3, "0");
const CANON = new Set();
for (const n of NAMES) {
  for (const s of EXPORT_STOPS) CANON.add(`${n}/${pad3(s)}`);
  for (const b of SCRIM_BASES) for (const step of SCRIM_STEPS) CANON.add(`${n}/${b === 500 || b === "500" ? "scrim" : `scrim/${pad3(b)}`}/${pad3(step)}`);
}

// ── hpg-plugin-bindings: every emitted target exists in the canonical raw-colors name set ─
const targets = P.bindingTargets(NAMES);
if (!Array.isArray(targets) || targets.length === 0) FAIL("bindings", "bindingTargets returned nothing");
const dangling = (targets || []).filter((t) => !CANON.has(t));
if (dangling.length) FAIL("bindings", `${dangling.length} dangling target(s), e.g. ${dangling.slice(0, 3).join(", ")}`);
// non-vacuity: a full plan covers every role's light+dark across all palettes
const plan = P.bindingPlan(NAMES);
if (!Array.isArray(plan) || plan.length !== 53 * NAMES.length) FAIL("bindings", `bindingPlan length ${plan && plan.length}, want ${53 * NAMES.length}`);
// every entry carries exactly 2 targets (Light, Dark) by DEFAULT — the default theme axis.
if (plan.length && (!Array.isArray(plan[0].targets) || plan[0].targets.length !== 2 || plan[0].targets.map((t) => t.mode).join() !== "Light,Dark")) {
  FAIL("bindings", `bindingPlan()'s default targets = ${plan[0] && JSON.stringify(plan[0].targets)}, want [{mode:"Light",...},{mode:"Dark",...}]`);
}

// ── hpg-plugin-themes (TKT-0021 — the theme axis flows generically through bind-plan.mjs, not a
//    hardcoded Light/Dark pair): a 3-theme axis (Light/Dark/Dim) produces a THIRD target per role,
//    and bindingTargets contributes NO new raw names (Dim reuses the "dark" side's ref) ──
const THEMES_3 = [{ name: "Light", side: "light" }, { name: "Dark", side: "dark" }, { name: "Dim", side: "dark" }];
const targets3 = P.bindingTargets(NAMES, THEMES_3);
if (JSON.stringify(targets3) !== JSON.stringify(targets)) FAIL("themes", "a 3rd theme reusing the 'dark' side changed the raw target SET (should be identical — no new raw refs)");
const plan3 = P.bindingPlan(NAMES, THEMES_3);
if (!Array.isArray(plan3) || plan3.length !== plan.length) FAIL("themes", `3-theme bindingPlan length ${plan3 && plan3.length}, want ${plan.length} (same role count)`);
else {
  const row = plan3[0];
  if (!Array.isArray(row.targets) || row.targets.length !== 3 || row.targets.map((t) => t.mode).join() !== "Light,Dark,Dim") {
    FAIL("themes", `3-theme bindingPlan row targets = ${row && JSON.stringify(row.targets)}, want modes Light,Dark,Dim`);
  } else if (row.targets[1].target !== row.targets[2].target) {
    FAIL("themes", "Dim (side:'dark') target does not match Dark's target (same side should resolve to the same raw ref)");
  }
}

// ── hpg-plugin-offline: manifest parses + declares NO network access (current Figma manifest format:
//    networkAccess.allowedDomains = ["none"]); code.js syntactically valid ─
try {
  const man = JSON.parse(readFileSync(join(HERE, "figma-semantic-binder/manifest.json"), "utf8"));
  const na = man.networkAccess;
  const offline = na && typeof na === "object" && Array.isArray(na.allowedDomains) && na.allowedDomains.length === 1 && na.allowedDomains[0] === "none";
  if (!offline) FAIL("offline", `manifest.networkAccess = ${JSON.stringify(na)}, want { allowedDomains: ["none"] }`);
  if (man.main !== "code.js") FAIL("offline", `manifest.main = ${man.main}`);
} catch (e) { FAIL("offline", `manifest.json: ${e.message}`); }
try {
  execSync(`node --check "${join(HERE, "figma-semantic-binder/code.js")}"`, { stdio: "pipe" });
} catch (e) { FAIL("offline", `code.js failed node --check: ${String(e.stderr || e).slice(0, 120)}`); }

// ── compliance: the binder surfaces no raw error, carries no stale "HCT" branding, and top-level
//    bind errors are handled (main().catch) so the user never sees an unhandled plugin crash ─
try {
  const bcode = readFileSync(join(HERE, "figma-semantic-binder/code.js"), "utf8").replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  if (/figma\.notify\([^;]*\b(?:e\.message|String\(e\)|\.stack)\b/.test(bcode)) FAIL("compliance", "binder surfaces a raw error in figma.notify");
  if (/figma\.notify\([^;]*HCT/.test(bcode)) FAIL("compliance", "binder has a user-facing 'HCT' notify (stale branding)");
  if (!/main\(\)\s*\.catch\s*\(/.test(bcode)) FAIL("compliance", "binder's main() is not wrapped in .catch — an unhandled error would crash with a raw message");
  const bman = JSON.parse(readFileSync(join(HERE, "figma-semantic-binder/manifest.json"), "utf8"));
  if (/HCT/.test(bman.name || "")) FAIL("compliance", `binder manifest name still says HCT: ${bman.name}`);
} catch (e) { FAIL("compliance", `binder compliance scan: ${e.message}`); }

const BINDER_PATH = join(HERE, "figma-semantic-binder/code.js");
const FLOAT_ANCHOR = 'JSON.parse("[]"); /* __ULTIMATE_TOKENS_FLOAT_PLANS__ */';

// loadBinder — compile the binder's source, EXPOSING roleTable/refKey/main/applyFloatPlans/FLOAT_PLANS
// via an appended return (they're all top-level function/const declarations, which hoist within the
// generated function body — no export mechanism needed). The file's own trailing `main().catch(...)`
// auto-invoke is stripped first: left in place it fires the moment the source loads (this file's `main`
// is not message-driven like the flagship plugin — it just runs), which would EITHER race an explicit
// call made afterward on the same mock figma (double-creating collections) OR — when no figma is passed
// at all (the roleTable-only PARITY GUARD below) — throw an orphaned, unhandled rejection that
// prints console noise once a later `await` in this script gives the microtask queue a chance to flush it.
function loadBinder(src, figma) {
  const controlled = src.replace(/\nmain\(\)\.catch\([\s\S]*$/, "");
  if (controlled === src) throw new Error("loadBinder: could not find the trailing main().catch(...) to strip");
  const fn = new Function("figma", "__html__", "module", controlled + "\nreturn { roleTable, refKey, main, applyFloatPlans, FLOAT_PLANS };");
  return fn(figma, "<html>", undefined);
}

// ── PARITY GUARD: the checked-in code.js's roleTable() is GENERATED (TKT-0019) — spliced verbatim
//    from src/engine/semantic.js's semanticRoles() function body by scripts/gen-figma-binder-code.mjs
//    — so this gate is now a TRIPWIRE proving the splice actually landed correctly (a stale build, a
//    hand-edit inside the `// === GENERATED:ROLE_TABLE ===` markers, or a splice-script bug), not the
//    mechanism preventing drift the way it was before TKT-0019 (mirrors the `floatparity` gate below,
//    which plays the same tripwire role for the spliced float-executor functions).
//    Load the runtime code.js (without running main()) and deep-equal-compare its FULL role objects —
//    {key, suffix, light, dark}, in ORDER, per default palette — against semantic.js's semanticRoles(n)
//    directly. This is the engine <-> Figma-binder leg of the role table's 3-impl identity;
//    role-table.json's own identity with semantic.js (also full-object, key+suffix+light+dark) is a
//    SEPARATE gate, `refs-canonical` in test/engine/semantic.mjs — the two gates together give
//    transitive identity across all three implementations.
//    A derived-ref-name-set diff (the previous shape of this gate, pre-TKT-0027) only proves every ref
//    resolves to a real raw-colors target — it CANNOT catch a `key` or `suffix` corruption that keeps
//    pointing at the same ref, nor a role missing from one side whose refs are already produced by
//    another role. Full-object, in-order comparison catches both: a length mismatch flags a
//    missing/extra row, and a per-field mismatch flags a `key`/`suffix` drift even when `light`/`dark`
//    still match. (Real incident 2026-06-18, pre-splice: the scrim refs drifted here.) ──
try {
  const src = readFileSync(BINDER_PATH, "utf8");
  const { roleTable } = loadBinder(src, undefined);
  const drift = [];
  for (const n of NAMES) {
    const runtimeRoles = roleTable(n);
    const engineRoles = semanticRoles(n);
    if (!Array.isArray(runtimeRoles) || runtimeRoles.length !== engineRoles.length) {
      drift.push(`${n}: code.js roleTable has ${runtimeRoles && runtimeRoles.length} rows, semantic.js has ${engineRoles.length}`);
      continue;
    }
    for (let i = 0; i < engineRoles.length; i++) {
      const a = runtimeRoles[i], b = engineRoles[i];
      if (!a || a.key !== b.key || a.suffix !== b.suffix || a.light !== b.light || a.dark !== b.dark) {
        drift.push(`${n}[${i}] code.js ${JSON.stringify(a)} != semantic.js ${JSON.stringify(b)}`);
      }
    }
  }
  if (drift.length) FAIL("parity", `runtime code.js roleTable drifted from src/engine/semantic.js (e.g. ${drift.slice(0, 3).join("; ")})`);
} catch (e) { FAIL("parity", `could not load/compare runtime roleTable: ${e.message}`); }

// ── a mock figma: in-memory collections + variables (a trimmed copy of test/figma/plugin.mjs's mock —
//    duplicated rather than imported, since plugin.mjs is a self-running verifier that process.exit()s
//    at end of file; importing it would execute AND exit this file too) ──
function mockFigma() {
  const collections = [], variables = [];
  let id = 0;
  const figma = {
    notify() {}, closePlugin() {},
    root: { _pd: {}, setPluginData(k, v) { this._pd[k] = String(v); }, getPluginData(k) { return this._pd[k] || ""; } },
    // ── #492 adoption-confirm UI mock ── confirmAdopt() calls showUI() then synchronously assigns
    // figma.ui.onmessage; the queued microtask below fires AFTER that assignment (JS microtask
    // ordering), so it always reaches the real handler. `_adoptAnswer` (default false — DECLINE, the
    // conservative default so existing tests that don't care about adoption see today's unchanged
    // behavior) is read fresh each call, so a test can flip it mid-run for a later prompt.
    // `_showUICalls` counts prompts shown, for asserting "asked once" / "never asked again".
    // `_adoptAnswer = "close"` (#492 review, MINOR) simulates the user closing the plugin window
    // WITHOUT clicking either button — fires the registered figma.on("close", …) handler instead of
    // posting an adopt-confirm message, proving confirmAdopt's close-handler safety net (never hangs).
    _adoptAnswer: false,
    _showUICalls: 0,
    // `_libraryModeAnswer` (#495) — the SAME "conservative default" precedent as `_adoptAnswer`: false
    // (classic/remove) so an EXISTING test that doesn't care about library mode keeps seeing today's
    // unchanged prune behavior. `_libraryShowUICalls` is tracked SEPARATELY from `_showUICalls` — one
    // apply can show EITHER dialog (never both at once, but different tests exercise different ones),
    // and existing adoption-only tests assert on `_showUICalls` alone.
    _libraryModeAnswer: false,
    _libraryShowUICalls: 0,
    _onClose: null,
    on(event, cb) { if (event === "close") this._onClose = cb; },
    // showUI(html) — routes by DIALOG TYPE, detected from the posted-message type string embedded in
    // the HTML itself (both confirmAdopt and confirmLibraryMode are real figma.showUI(htmlString, …)
    // calls — the mock reads back what was actually asked for, rather than assuming which one fired).
    showUI(html) {
      const isLibrary = typeof html === "string" && html.indexOf("library-mode-confirm") !== -1;
      if (isLibrary) this._libraryShowUICalls++; else this._showUICalls++;
      const answer = isLibrary ? this._libraryModeAnswer : this._adoptAnswer;
      Promise.resolve().then(() => {
        if (answer === "close") { if (this._onClose) this._onClose(); return; }
        if (this.ui.onmessage) {
          if (isLibrary) this.ui.onmessage({ type: "library-mode-confirm", library: answer });
          else this.ui.onmessage({ type: "adopt-confirm", adopt: answer });
        }
      });
    },
    ui: { onmessage: null, close() {} },
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
        const vm = {};
        const v = { id: "v" + id++, name, variableCollectionId: coll.id, type, values: vm, valuesByMode: vm,
          setValueForMode(mid, val) { vm[mid] = val; },
          remove() { const i = variables.indexOf(this); if (i >= 0) variables.splice(i, 1); } };
        variables.push(v); return v;
      },
      createVariableAlias(v) { return { type: "VARIABLE_ALIAS", id: v.id }; },
    },
  };
  return { figma, collections, variables };
}

// ── floatanchor: the injection anchor app.js.downloadFigmaPlugin() string-replaces, and the SAME
//    FLOAT_REGISTRY_KEY as the flagship (figma/plugin/code.js) so both converge on one collection set ──
const binderSrc = readFileSync(BINDER_PATH, "utf8");
if (!binderSrc.includes(FLOAT_ANCHOR)) FAIL("floatanchor", "code.js is missing the FLOAT_PLANS injection anchor");
if (!/FLOAT_REGISTRY_KEY\s*=\s*"ultimate-tokens-float-collections"/.test(binderSrc)) FAIL("floatanchor", "code.js FLOAT_REGISTRY_KEY does not match the flagship plugin's key string");
if (!/applyFloatPlans/.test(binderSrc)) FAIL("floatanchor", "code.js has no applyFloatPlans executor");

// bundlesafe (#492 real incident, MINOR review fix): moved to scripts/gen-figma-assets.mjs, which now
// throws (failing the FIRST step of both `npm test` and `npm run build`) if code.js contains a literal
// closing-script-tag substring — the generator is the earliest point that can catch it, right where the
// dangerous embedding happens, rather than a downstream test asserting on its output. See that script
// for the full incident writeup (this file's own copy of that writeup is gone with the check).

// ── floatcreate: applyFloatPlans creates the MERGED "Geometry" collection (type/ + box-geometry halves,
//    TKT-0009; Base + a breakpoint mode), the sized vars carry a DIFFERENT value per mode, re-apply is
//    idempotent (no doubling), and removing a breakpoint prunes its mode (mirrors test/figma/plugin.mjs) ──
{
  const F = mockFigma();
  try {
    const { applyFloatPlans } = loadBinder(binderSrc, F.figma);
    if (typeof applyFloatPlans !== "function") { FAIL("floatcreate", "code.js exported no applyFloatPlans"); }
    else {
      const typeIx = TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 }), [{ name: "Desktop", scale: TYPE.typeScale({ treatment: "product", bodyBase: 19 }) }]);
      const geomIx = GEOM.geomTokensFigmaModes(GEOM.geomScale({ treatment: "comfortable", baseHeight: 28 }), [{ name: "Desktop", scale: GEOM.geomScale({ treatment: "comfortable", baseHeight: 40 }) }]);
      const plans = MAP.modeApplyPlan(MAP.mergeModeInterchanges(typeIx, geomIx));
      const fr = await applyFloatPlans(plans);
      const geo = F.collections.find((c) => c.name === "Geometry");
      if (F.collections.some((c) => c.name === "Typography")) FAIL("floatcreate", "the merged apply minted a Typography collection (the pre-TKT-0009 shape)");
      if (!geo) FAIL("floatcreate", "no Geometry collection created");
      if (geo && geo.modes.map((m) => m.name).join() !== "Base,Desktop") FAIL("floatcreate", `Geometry modes = ${geo && geo.modes.map((m) => m.name)}, want Base,Desktop`);
      if (fr.collections !== 1) FAIL("floatcreate", `applyFloatPlans reported ${fr.collections} collections, want 1 (merged)`);
      if (geo) {
        const gVars = F.variables.filter((v) => v.variableCollectionId === geo.id);
        if (!gVars.some((v) => v.name.startsWith("type/"))) FAIL("floatcreate", "the type/ half is missing from the merged collection");
        if (!gVars.some((v) => v.name.startsWith("size/"))) FAIL("floatcreate", "the box-geometry half is missing from the merged collection");
        const baseId = geo.modes[0].modeId, bpId = geo.modes[1].modeId;
        const bodyMd = gVars.find((v) => v.name === "type/body/md/size");
        if (!bodyMd) FAIL("floatcreate", "type/body/md/size variable missing");
        else if (!Number.isFinite(bodyMd.valuesByMode[baseId]) || !Number.isFinite(bodyMd.valuesByMode[bpId])) FAIL("floatcreate", "type/body/md/size not value-complete across modes");
        else if (bodyMd.valuesByMode[baseId] === bodyMd.valuesByMode[bpId]) FAIL("floatcreate", "type/body/md/size Base == Desktop (per-mode values should differ)");
      }
      // idempotency: re-apply → no doubled collection/modes/vars
      await applyFloatPlans(plans);
      if (F.collections.filter((c) => c.name === "Geometry").length !== 1) FAIL("floatcreate", "re-apply duplicated the Geometry collection");
      if (geo && geo.modes.length !== 2) FAIL("floatcreate", `re-apply left ${geo && geo.modes.length} Geometry modes, want 2 (no duplicate mode)`);
      // drop the breakpoint → its mode is pruned on re-apply (Base survives, is never removable)
      const baseOnly = MAP.mergeModeInterchanges(
        TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 }), []),
        GEOM.geomTokensFigmaModes(GEOM.geomScale({ treatment: "comfortable", baseHeight: 28 }), []),
      );
      await applyFloatPlans(MAP.modeApplyPlan(baseOnly));
      if (geo && geo.modes.map((m) => m.name).join() !== "Base") FAIL("floatcreate", `after removing the breakpoint, Geometry modes = ${geo && geo.modes.map((m) => m.name)}, want Base`);
    }
  } catch (e) { FAIL("floatcreate", "applyFloatPlans threw: " + e.message); }
}

// ── floatindep: with NO "Color Primitives" collection and a non-empty (injected) FLOAT_PLANS, main()
//    still creates the breakpoint collections and does not throw — the color-abort no longer blocks
//    Type/Geometry (the bug this LLD fixes) ──
{
  const F = mockFigma(); // no Color Primitives
  const typeIx = TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 }), [{ name: "Mobile", scale: TYPE.typeScale({ treatment: "product", bodyBase: 13 }) }]);
  const plans = MAP.modeApplyPlan(typeIx);
  const injected = binderSrc.replace(FLOAT_ANCHOR, `JSON.parse(${JSON.stringify(JSON.stringify(plans))}); /* injected */`);
  try {
    const { main } = loadBinder(injected, F.figma);
    await main();
    if (F.collections.some((c) => c.name === "Color Modes" || c.name === "Color Primitives")) FAIL("floatindep", "main() created a Color collection with no Color Primitives present");
    if (!F.collections.some((c) => c.name === "Geometry")) FAIL("floatindep", "main() skipped the merged Geometry collection when Color Primitives was absent (color-abort still blocking breakpoints)");
  } catch (e) { FAIL("floatindep", "main() threw with no Color Primitives + a non-empty FLOAT_PLANS: " + e.message); }
}

// ── floatnoop: the CHECKED-IN binder (FLOAT_PLANS baked as []) creates NO breakpoint collections — the
//    generic/asset download stays a color-only, palette-agnostic no-op for Type/Geometry ──
{
  const F = mockFigma();
  try {
    const { main } = loadBinder(binderSrc, F.figma);
    await main();
    if (F.collections.some((c) => c.name === "Typography" || c.name === "Geometry" || c.name === "Breakpoints")) FAIL("floatnoop", "the checked-in binder (FLOAT_PLANS []) created a breakpoint collection");
  } catch (e) { FAIL("floatnoop", "main() threw on the generic (FLOAT_PLANS []) binder: " + e.message); }
}

// ── colorprov (TKT-0024): main() must NEVER canonicalize a USER's own pre-existing "Color Roles"
//    collection either — the same provenance guarantee floatindep/floatnoop prove for Type/Geometry,
//    back-ported to the color cascade's semantic-collection creation via COLOR_REGISTRY_KEY. A "Color
//    Primitives" collection's mere PRESENCE is enough to enter the cascade branch (main() checks `if
//    (rawColl)`, not a variable count), so an empty one is enough to exercise the Color Roles path. ──
{
  const F = mockFigma();
  F.figma.variables.createVariableCollection("Color Primitives"); // presence alone enters the cascade branch
  const userSem = F.figma.variables.createVariableCollection("Color Roles"); // the user's own, pre-existing
  F.figma.variables.createVariable("user/keepme", userSem, "COLOR").setValueForMode(userSem.modes[0].modeId, 1);
  try {
    const { main } = loadBinder(binderSrc, F.figma);
    await main();
    // #492: the mock's default _adoptAnswer is false (DECLINE) — main() now ASKS (findAdoptionCandidate
    // finds the orphan), but a decline preserves this test's exact original guarantee below.
    if (F.figma._showUICalls !== 1) FAIL("colorprov", `expected exactly 1 adoption prompt for the orphan Color Roles collection, got ${F.figma._showUICalls}`);
    if (F.collections.filter((c) => c.name === "Color Roles").length !== 2) FAIL("colorprov", `expected the user's Color Roles + a separate binder-created one (2), got ${F.collections.filter((c) => c.name === "Color Roles").length}`);
    if (!F.variables.some((v) => v.variableCollectionId === userSem.id && v.name === "user/keepme")) FAIL("colorprov", "bind removed/touched a variable in the user's OWN Color Roles collection");
    if (userSem.modes.length !== 1) FAIL("colorprov", "bind added a mode (e.g. Dark) to the user's OWN Color Roles collection");
    // re-bind: reconcile OURS by id (the registry persisted), never touching the user's collection again
    const { main: main2 } = loadBinder(binderSrc, F.figma);
    await main2();
    if (F.collections.filter((c) => c.name === "Color Roles").length !== 2) FAIL("colorprov", "re-bind made a 3rd Color Roles (provenance registry not persisted to root pluginData)");
  } catch (e) { FAIL("colorprov", "main() threw with a foreign pre-existing Color Roles collection: " + e.message); }
}

// ── adoptconsent (#492): the ADOPTION path — a live collection matching the target name (or a
//    renameFrom name) that ISN'T registry-tracked is now OFFERED for adoption ("in the plugin UI",
//    the ticket's own wording — confirmAdopt's figma.showUI dialog, not a notify toast), confirmed
//    once. Confirmed ⇒ upserts INTO the existing collection (same id — no duplicate, no data loss);
//    declined ⇒ today's unchanged behavior (a separate collection, proven by colorprov above).
//    Covers both the color (semantic-collection) and float (Geometry) adoption call sites. ──
{
  // color: an unregistered "Color Roles" ORPHAN, confirmed ⇒ adopted, its own pre-existing variable
  // survives, and the role-binding loop upserts INTO it (same collection id) rather than creating a
  // second one.
  const F = mockFigma();
  F.figma._adoptAnswer = true;
  const rawColl = F.figma.variables.createVariableCollection("Color Primitives");
  // populate real raw targets for "neutral" ONLY (bindingPlan's answer key) — enough for the role-binding
  // loop to actually resolve+create semantic vars, so this test can assert on a real upserted role.
  for (const t of P.bindingTargets(["neutral"])) F.figma.variables.createVariable(t, rawColl, "COLOR").setValueForMode(rawColl.modes[0].modeId, { r: 0.5, g: 0.5, b: 0.5, a: 1 });
  const orphan = F.figma.variables.createVariableCollection("Color Roles"); // NOT registered — an orphan
  orphan.addMode("Dark"); // a real Color Roles collection always carries Light+Dark
  F.figma.variables.createVariable("keepme/own", orphan, "COLOR").setValueForMode(orphan.modes[0].modeId, 1);
  try {
    const { main } = loadBinder(binderSrc, F.figma);
    await main();
    if (F.figma._showUICalls !== 1) FAIL("adoptconsent", `expected exactly 1 adoption prompt, got ${F.figma._showUICalls}`);
    const semColls = F.collections.filter((c) => c.name === "Color Roles");
    if (semColls.length !== 1) FAIL("adoptconsent", `confirmed adoption must NOT create a second Color Roles collection, got ${semColls.length}`);
    if (semColls[0] !== orphan) FAIL("adoptconsent", "confirmed adoption minted a NEW collection instead of reusing the orphan's id (bindings would orphan)");
    if (!F.variables.some((v) => v.variableCollectionId === orphan.id && v.name === "keepme/own")) FAIL("adoptconsent", "adoption must not drop the orphan's own pre-existing variable");
    if (!F.variables.some((v) => v.variableCollectionId === orphan.id && v.name === "neutral/on-surface")) FAIL("adoptconsent", "adoption did not upsert role variables INTO the adopted collection");
    // SECOND run: the registry now tracks the (formerly orphan) collection by id — no re-ask, no 2nd collection.
    F.figma._showUICalls = 0;
    const { main: main2 } = loadBinder(binderSrc, F.figma);
    await main2();
    if (F.figma._showUICalls !== 0) FAIL("adoptconsent", `a SECOND run must not re-ask for an already-adopted collection, got ${F.figma._showUICalls} prompt(s)`);
    if (F.collections.filter((c) => c.name === "Color Roles").length !== 1) FAIL("adoptconsent", "re-run after adoption duplicated the collection");
  } catch (e) { FAIL("adoptconsent", "main() threw during confirmed color adoption: " + e.message); }
}
{
  // #492 review, MINOR — CLOSE WITHOUT CHOOSING: closing the plugin window (neither button clicked)
  // must settle confirmAdopt's promise (as a decline) via the figma.on("close", …) safety net, never
  // leave main() hanging forever. Raced against a short timeout so a regression FAILS this test loudly
  // instead of hanging the whole `node test/figma/binder.mjs` run.
  const F = mockFigma();
  F.figma._adoptAnswer = "close"; // simulate the window closing, not a button click
  const rawColl = F.figma.variables.createVariableCollection("Color Primitives");
  for (const t of P.bindingTargets(["neutral"])) F.figma.variables.createVariable(t, rawColl, "COLOR").setValueForMode(rawColl.modes[0].modeId, { r: 0.5, g: 0.5, b: 0.5, a: 1 });
  F.figma.variables.createVariableCollection("Color Roles"); // NOT registered — an orphan, prompted then closed-on
  try {
    const { main } = loadBinder(binderSrc, F.figma);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("main() did not settle within 2s — confirmAdopt likely hung on window-close")), 2000));
    await Promise.race([main(), timeout]);
    if (F.collections.filter((c) => c.name === "Color Roles").length !== 2) FAIL("adoptconsent", "close-without-choosing leg: expected the orphan + a separate fresh collection (2), the close must be treated as a decline");
  } catch (e) { FAIL("adoptconsent", "close-without-choosing leg: " + e.message); }
}
{
  // MAJOR 1 (review fix) — DECLINE then RE-RUN: a decline leaves the orphan untouched, but
  // ensureCollection immediately creates+registers a FRESH "Color Roles" collection right after — so a
  // SECOND run must show ZERO prompts (reg[name] now resolves live; findAdoptionCandidate's first check
  // catches it before ever searching for an orphan again) and must NOT touch the orphan or mint a THIRD
  // collection. Before the fix, findAdoptionCandidate only checked "is this candidate's id untracked
  // anywhere in reg" — the still-untracked orphan kept matching that test forever, re-prompting every run.
  const F = mockFigma();
  F.figma._adoptAnswer = false; // DECLINE
  const rawColl = F.figma.variables.createVariableCollection("Color Primitives");
  for (const t of P.bindingTargets(["neutral"])) F.figma.variables.createVariable(t, rawColl, "COLOR").setValueForMode(rawColl.modes[0].modeId, { r: 0.5, g: 0.5, b: 0.5, a: 1 });
  const orphan = F.figma.variables.createVariableCollection("Color Roles"); // NOT registered — an orphan, declined
  try {
    const { main } = loadBinder(binderSrc, F.figma);
    await main();
    if (F.figma._showUICalls !== 1) FAIL("adoptconsent", `decline leg: expected exactly 1 prompt on the first run, got ${F.figma._showUICalls}`);
    const afterFirst = F.collections.filter((c) => c.name === "Color Roles");
    if (afterFirst.length !== 2) FAIL("adoptconsent", `decline leg: expected the orphan + a separate fresh collection (2) after declining, got ${afterFirst.length}`);
    const freshColl = afterFirst.find((c) => c !== orphan);
    F.figma._showUICalls = 0;
    const { main: main2 } = loadBinder(binderSrc, F.figma);
    await main2();
    if (F.figma._showUICalls !== 0) FAIL("adoptconsent", `decline leg: a re-run after a decline must show ZERO prompts (the fresh collection now resolves the name), got ${F.figma._showUICalls}`);
    const afterSecond = F.collections.filter((c) => c.name === "Color Roles");
    if (afterSecond.length !== 2) FAIL("adoptconsent", `decline leg: re-run after a decline must not mint a THIRD collection (still 2: orphan + fresh), got ${afterSecond.length}`);
    if (!afterSecond.includes(freshColl)) FAIL("adoptconsent", "decline leg: re-run replaced the fresh collection instead of reusing it");
    if (!afterSecond.includes(orphan)) FAIL("adoptconsent", "decline leg: re-run removed the declined orphan (it must be left alone, not deleted)");
  } catch (e) { FAIL("adoptconsent", "main() threw during the decline-then-re-run leg: " + e.message); }
}
{
  // MAJOR 1 (review fix) — an ALREADY-REGISTERED, LIVE collection coexists with a same-named ORPHAN
  // (plausible on a file that has been through more than one era): main() must show ZERO prompts (the
  // registered collection resolves the name; there is nothing to offer) and must NOT touch the
  // registry entry — before the fix, a confirm on this exact scenario would have silently re-pointed
  // the registry AT the orphan, abandoning the collection actually in use (on the ADIA file, the
  // equivalent of re-targeting onto the stale grouped scheme — the inverse of the ruling).
  const F = mockFigma();
  F.figma._adoptAnswer = true; // even set to ADOPT — must still never be asked, so this must never fire
  const rawColl = F.figma.variables.createVariableCollection("Color Primitives");
  for (const t of P.bindingTargets(["neutral"])) F.figma.variables.createVariable(t, rawColl, "COLOR").setValueForMode(rawColl.modes[0].modeId, { r: 0.5, g: 0.5, b: 0.5, a: 1 });
  const registeredColl = F.figma.variables.createVariableCollection("Color Roles");
  registeredColl.addMode("Dark");
  F.figma.root.setPluginData("ultimate-tokens-color-collections", JSON.stringify({ "Color Roles": registeredColl.id })); // pre-seed the registry directly
  const coexistingOrphan = F.figma.variables.createVariableCollection("Color Roles"); // a SECOND, unregistered "Color Roles"
  try {
    const { main } = loadBinder(binderSrc, F.figma);
    await main();
    if (F.figma._showUICalls !== 0) FAIL("adoptconsent", `registered+orphan leg: expected ZERO prompts (the name already resolves live), got ${F.figma._showUICalls}`);
    const reg = JSON.parse(F.figma.root.getPluginData("ultimate-tokens-color-collections"));
    if (reg["Color Roles"] !== registeredColl.id) FAIL("adoptconsent", "registered+orphan leg: the registry entry must stay pointed at the already-registered collection, never silently switched to the orphan");
    if (!F.variables.some((v) => v.variableCollectionId === registeredColl.id && v.name === "neutral/on-surface")) FAIL("adoptconsent", "registered+orphan leg: role variables must upsert into the REGISTERED collection");
    if (F.variables.some((v) => v.variableCollectionId === coexistingOrphan.id)) FAIL("adoptconsent", "registered+orphan leg: the untouched orphan must receive no variables at all");
  } catch (e) { FAIL("adoptconsent", "main() threw during the registered+orphan leg: " + e.message); }
}
{
  // float: an unregistered "Geometry" ORPHAN, confirmed ⇒ adopted by the SAME mechanism, proven via a
  // baked (injected) FLOAT_PLANS — mirrors floatindep's injection technique. Once adopted+registered,
  // applyFloatPlans' UNCHANGED full-mirror reconcile applies (create-or-reuse by name, prune anything
  // NOT in the plan) — exactly its existing, documented behavior for any collection it owns; adoption
  // only widens WHICH collections become "owned", never softens what "owned" already means. So a
  // foreign var inside the orphan does NOT survive adoption (proven below) — the confirm dialog is the
  // consent for exactly that reconciliation, matching the two-collection era's "Typography" retirement.
  const F = mockFigma();
  F.figma._adoptAnswer = true;
  const orphan = F.figma.variables.createVariableCollection("Geometry"); // NOT registered — an orphan
  F.figma.variables.createVariable("stale/own", orphan, "FLOAT").setValueForMode(orphan.modes[0].modeId, 9);
  const typeIx = TYPE.typeTokensFigmaModes(TYPE.typeScale({ treatment: "product", bodyBase: 16 }), []);
  const plans = MAP.modeApplyPlan(typeIx);
  const injected = binderSrc.replace(FLOAT_ANCHOR, `JSON.parse(${JSON.stringify(JSON.stringify(plans))}); /* injected */`);
  try {
    const { main } = loadBinder(injected, F.figma);
    await main();
    if (F.figma._showUICalls !== 1) FAIL("adoptconsent", `expected exactly 1 float adoption prompt, got ${F.figma._showUICalls}`);
    const geoColls = F.collections.filter((c) => c.name === "Geometry");
    if (geoColls.length !== 1) FAIL("adoptconsent", `confirmed float adoption must NOT create a second Geometry collection, got ${geoColls.length}`);
    if (geoColls[0] !== orphan) FAIL("adoptconsent", "confirmed float adoption minted a NEW collection instead of reusing the orphan's id");
    if (!F.variables.some((v) => v.variableCollectionId === orphan.id && v.name === "type/body/md/size")) FAIL("adoptconsent", "float adoption did not upsert plan variables INTO the adopted collection");
    if (F.variables.some((v) => v.variableCollectionId === orphan.id && v.name === "stale/own")) FAIL("adoptconsent", "float adoption's full-mirror reconcile should prune a var the plan no longer wants (applyFloatPlans' existing, unchanged behavior)");
  } catch (e) { FAIL("adoptconsent", "main() threw during confirmed float adoption: " + e.message); }
}

// ── librarygeom (#495): "published library" mode for the box-geometry (size/*) half of the merged
//    Geometry collection, mirroring the ADIA file's OLD step names (predating the current xs/sm/md/
//    lg/xl/2xl ramp) — proven end-to-end through the STANDALONE BINDER's own INTERACTIVE path
//    (main() -> applyFloatPlans(FLOAT_PLANS, {askIfUndecided:true}) -> confirmLibraryMode, the ONLY
//    caller this ticket wires an interactive dialog into — see applyFloatPlans' own header comment on
//    why the flagship never asks). Old steps map to their nearest CURRENT step BY HEIGHT (never by
//    name) via geometryPlanStepHeights/expandGeometryAliasMap: "small"(25)->sm(24), "large"(40)->lg(36),
//    "jumbo"(70)->2xl(64) — none collide with a current step name, so all three are "existing but not
//    wanted" and exercise the SAME alias path a renamed step would. 0 removals; the confirm dialog
//    actually fires (proving the wiring, not just the pure planner already proven in plugin.mjs's
//    libraryparity/librarymode); idempotent second run. ──
{
  const F = mockFigma();
  F.figma._libraryModeAnswer = true; // "Preserve (library-safe)"
  try {
    const FIELDS = ["height", "icon", "caret", "icon-gap", "min-width", "padding-narrow", "padding-narrow-compact", "padding-wide", "padding-wide-compact", "pill-radius"];
    const OLD_STEPS = { small: 25, large: 40, jumbo: 70 }; // heights land unambiguously nearest sm/lg/2xl (never a tie)
    const oldVars = [];
    for (const [step, h] of Object.entries(OLD_STEPS)) {
      for (const f of FIELDS) oldVars.push({ name: `size/${step}/${f}`, type: "FLOAT", values: [{ mode: "Base", value: f === "height" ? h : Math.round(h / 2) }] });
    }
    // Step 1: create + REGISTER the Geometry collection at its old shape, through applyFloatPlans
    // itself (never a raw figma.variables call — ensureFloatCollection resolves by registry id/
    // renameFrom only, same discipline as librarymode's Font Primitives fixture in plugin.mjs).
    const { applyFloatPlans: apply1 } = loadBinder(binderSrc, F.figma);
    await apply1([{ collection: "Geometry", modes: ["Base"], defaultMode: "Base", addModes: [], variables: oldVars }]);
    if (F.collections.filter((c) => c.name === "Geometry").length !== 1) FAIL("librarygeom", "step 1 (old-shape create) did not produce exactly 1 Geometry collection");

    // Step 2: apply the CURRENT box-geometry plan through main()'s own interactive path (injected
    // FLOAT_PLANS, mirroring floatindep's technique).
    const geomIx = GEOM.geomTokensFigmaModes(GEOM.geomScale({ treatment: "comfortable", baseHeight: 28 }), []);
    const plans2 = MAP.modeApplyPlan(geomIx);
    const injected = binderSrc.replace(FLOAT_ANCHOR, `JSON.parse(${JSON.stringify(JSON.stringify(plans2))}); /* injected */`);
    const { main } = loadBinder(injected, F.figma);
    await main();

    if (F.figma._libraryShowUICalls !== 1) FAIL("librarygeom", `expected exactly 1 library-mode confirm prompt, got ${F.figma._libraryShowUICalls}`);
    if (F.collections.filter((c) => c.name === "Geometry").length !== 1) FAIL("librarygeom", "the interactive library-mode apply duplicated the Geometry collection");
    const geo = F.collections.find((c) => c.name === "Geometry");
    // 0 removals: every old step/field variable must still exist BY NAME (aliasing redirects the
    // VALUE, never renames — id-preserving, matching applyFontPrimitivesModes' own contract).
    const stillThere = oldVars.every((v) => F.variables.some((va) => va.variableCollectionId === geo.id && va.name === v.name));
    if (!stillThere) FAIL("librarygeom", "library mode removed an old size/* variable instead of aliasing it");
    // "small" -> nearest CURRENT step "sm" BY HEIGHT: the old variable's live value must now be a real
    // alias pointing at the new step's SAME field.
    const oldSmallHeight = F.variables.find((va) => va.variableCollectionId === geo.id && va.name === "size/small/height");
    const newSmHeight = F.variables.find((va) => va.variableCollectionId === geo.id && va.name === "size/sm/height");
    if (!oldSmallHeight || !newSmHeight) FAIL("librarygeom", "expected both size/small/height (old, kept) and size/sm/height (current) to exist live");
    else {
      const baseId = geo.modes[0].modeId;
      const val = oldSmallHeight.valuesByMode[baseId];
      if (!val || val.type !== "VARIABLE_ALIAS" || val.id !== newSmHeight.id) FAIL("librarygeom", "size/small/height's value was not redirected to size/sm/height via a real alias (nearest-by-height)");
    }
    // "jumbo"(70) -> nearest CURRENT step "2xl"(64), not "xl"(48) — proves the mapping is BY HEIGHT,
    // not by list position or name.
    const oldJumboIcon = F.variables.find((va) => va.variableCollectionId === geo.id && va.name === "size/jumbo/icon");
    const new2xlIcon = F.variables.find((va) => va.variableCollectionId === geo.id && va.name === "size/2xl/icon");
    if (oldJumboIcon && new2xlIcon) {
      const baseId = geo.modes[0].modeId;
      const val = oldJumboIcon.valuesByMode[baseId];
      if (!val || val.type !== "VARIABLE_ALIAS" || val.id !== new2xlIcon.id) FAIL("librarygeom", "size/jumbo/icon did not alias to the nearest-by-height current step (2xl), got a different/no target");
    }

    // IDEMPOTENT second run, STRICT (#495 follow-up): a variable already correctly aliased from run 1
    // needs NO further action on an unchanged re-apply — a published library must not rename/re-alias
    // names on every apply. Called directly (libraryMode:true, pre-decided) rather than through main()'s
    // interactive dialog — run 1 above already proves that wiring; this leg only needs the return value.
    const { applyFloatPlans: apply2 } = loadBinder(binderSrc, F.figma);
    const res2 = await apply2(plans2, { libraryMode: true });
    if (F.collections.filter((c) => c.name === "Geometry").length !== 1) FAIL("librarygeom", "second (idempotent) run duplicated the Geometry collection");
    const stillThere2 = oldVars.every((v) => F.variables.some((va) => va.variableCollectionId === geo.id && (va.name === v.name || va.name.indexOf("_deprecated/" + v.name) === 0)));
    if (!stillThere2) FAIL("librarygeom", "second run removed a size/* variable library mode should have preserved");
    if (F.variables.some((va) => va.variableCollectionId === geo.id && va.name.indexOf("_deprecated/_deprecated/") === 0)) FAIL("librarygeom", "second run double-prefixed an already-deprecated variable — not idempotent");
    if (!res2 || !res2.libraryReports || !res2.libraryReports[0]) FAIL("librarygeom", "second run returned no libraryReports");
    else {
      const rpt2 = res2.libraryReports[0];
      if (rpt2.aliases.length) FAIL("librarygeom", `second run should report 0 aliases (already correctly aliased = no-op), got ${JSON.stringify(rpt2.aliases)}`);
      if (rpt2.deprecates.length) FAIL("librarygeom", `second run should report 0 deprecates (already resolved), got ${JSON.stringify(rpt2.deprecates)}`);
      if (rpt2.renames.length) FAIL("librarygeom", `second run should report 0 renames, got ${JSON.stringify(rpt2.renames)}`);
    }
  } catch (e) { FAIL("librarygeom", "the interactive box-geometry library-mode e2e threw: " + e.message); }
}

// ── colorparity: the binder's checked-in code.js's readColorRegistry/writeColorRegistry/ensureCollection
//    are GENERATED (TKT-0024, splicing the FLOAT_EXECUTOR technique from TKT-0019) — spliced verbatim from
//    the flagship figma/plugin/code.js by scripts/gen-figma-binder-code.mjs into the
//    `// === GENERATED:COLOR_EXECUTOR ===` markers, same discipline as floatparity below. This gate is now
//    a TRIPWIRE proving the splice landed correctly, not the mechanism keeping the two copies in lockstep. ──
{
  const FLAGSHIP_PATH = join(HERE, "..", "plugin", "code.js");
  const COLOR_FNS = ["readColorRegistry", "writeColorRegistry", "ensureCollection"];
  const norm = (code) => code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
  const keyLit = (src) => (/COLOR_REGISTRY_KEY\s*=\s*("[^"]*")/.exec(src) || [])[1];
  try {
    const flagSrc = readFileSync(FLAGSHIP_PATH, "utf8");
    for (const fn of COLOR_FNS) {
      const a = extractFunctionSource(binderSrc, fn), b = extractFunctionSource(flagSrc, fn);
      if (!a) { FAIL("colorparity", `binder is missing ${fn}()`); continue; }
      if (!b) { FAIL("colorparity", `flagship is missing ${fn}()`); continue; }
      if (norm(a) !== norm(b)) FAIL("colorparity", `${fn}() body drifted between the binder and the flagship (executor copies must stay byte-identical — regenerate with scripts/gen-figma-binder-code.mjs)`);
    }
    if (!keyLit(binderSrc) || keyLit(binderSrc) !== keyLit(flagSrc)) FAIL("colorparity", `COLOR_REGISTRY_KEY literal differs (binder ${keyLit(binderSrc)} vs flagship ${keyLit(flagSrc)}) — the two would not converge on one collection`);
  } catch (e) { FAIL("colorparity", "could not load/compare the flagship color-provenance functions: " + e.message); }
}

// ── collparity (#491): the four Figma collection NAMES are canonical in ONE place —
//    src/engine/collections.js's COLLECTIONS export — but neither sandbox (this binder, the flagship
//    figma/plugin/code.js) can `import` it (non-module Figma VM), so each carries hand-typed literal
//    copies. This is the tripwire root-caused by the 2026-07-17 librarian review (exportUI3 said
//    "Color / Primitives" while the plugin created "Color Primitives" — a drift with no gate to catch
//    it): RAW_COLLECTION/SEMANTIC_COLLECTION — the COLOR pair BOTH files hardcode as named constants —
//    must equal COLLECTIONS.colorRaw/colorSemantic exactly in both. The Geometry/Type Primitives pair
//    has no equivalent binder-side check: the standalone binder never hardcodes either name — it only
//    ever receives them as DATA inside the baked FLOAT_PLANS (named by the app's own COLLECTIONS-derived
//    plan at download time) — so only the flagship, which hardcodes both in readFloatVariables/
//    byRegistry for its own read-back and styles paths, is checked for those two. ──
{
  const FLAGSHIP_PATH = join(HERE, "..", "plugin", "code.js");
  const constLit = (src, name) => (new RegExp(`const ${name}\\s*=\\s*"([^"]*)"`).exec(src) || [])[1];
  try {
    const flagSrc = readFileSync(FLAGSHIP_PATH, "utf8");
    for (const [label, src] of [["binder", binderSrc], ["flagship", flagSrc]]) {
      const raw = constLit(src, "RAW_COLLECTION");
      const sem = constLit(src, "SEMANTIC_COLLECTION");
      if (raw !== COLLECTIONS.colorRaw) FAIL("collparity", `${label} RAW_COLLECTION = ${JSON.stringify(raw)}, want ${JSON.stringify(COLLECTIONS.colorRaw)} (src/engine/collections.js)`);
      if (sem !== COLLECTIONS.colorSemantic) FAIL("collparity", `${label} SEMANTIC_COLLECTION = ${JSON.stringify(sem)}, want ${JSON.stringify(COLLECTIONS.colorSemantic)} (src/engine/collections.js)`);
    }
    if (!flagSrc.includes(`"${COLLECTIONS.breakpoints}"`)) FAIL("collparity", `flagship carries no literal "${COLLECTIONS.breakpoints}" (COLLECTIONS.breakpoints)`);
    if (!flagSrc.includes(`"${COLLECTIONS.fontPrimitives}"`)) FAIL("collparity", `flagship carries no literal "${COLLECTIONS.fontPrimitives}" (COLLECTIONS.fontPrimitives)`);
  } catch (e) { FAIL("collparity", "could not load/compare the collection-name literals: " + e.message); }
}

// ── floatparity: the binder ports 5 float-executor functions VERBATIM from the flagship
//    (figma/plugin/code.js). They're a pure DATA executor with no planner to spec-gate against, so — per
//    the repo's culture (see the roleTable PARITY GUARD above; scrim-drift incident 2026-06-18) — the two
//    copies are gated against silent drift. Extract each function from BOTH files and compare their
//    comment-stripped, whitespace-normalized bodies: the two carry intentionally different surrounding
//    comments, but the executable code MUST stay byte-identical so a user who runs the flagship AND the
//    binder against one file converges on the SAME collection set (they share FLOAT_REGISTRY_KEY) ──
{
  const FLAGSHIP_PATH = join(HERE, "..", "plugin", "code.js");
  const FLOAT_FNS = ["readFloatRegistry", "writeFloatRegistry", "ensureFloatCollection", "varsByName", "applyFloatPlans"];
  // extractFunctionSource is the SAME brace-matched extraction scripts/gen-figma-binder-code.mjs uses
  // to splice these functions into the binder (TKT-0019) — shared from splice-utils.mjs so the
  // generator and this tripwire can never quietly disagree on what "the same function" means.
  const norm = (code) => code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
  const keyLit = (src) => (/FLOAT_REGISTRY_KEY\s*=\s*("[^"]*")/.exec(src) || [])[1];
  try {
    const flagSrc = readFileSync(FLAGSHIP_PATH, "utf8");
    for (const fn of FLOAT_FNS) {
      const a = extractFunctionSource(binderSrc, fn), b = extractFunctionSource(flagSrc, fn);
      if (!a) { FAIL("floatparity", `binder is missing ${fn}()`); continue; }
      if (!b) { FAIL("floatparity", `flagship is missing ${fn}()`); continue; }
      if (norm(a) !== norm(b)) FAIL("floatparity", `${fn}() body drifted between the binder and the flagship (executor copies must stay byte-identical — regenerate with scripts/gen-figma-binder-code.mjs)`);
    }
    if (!keyLit(binderSrc) || keyLit(binderSrc) !== keyLit(flagSrc)) FAIL("floatparity", `FLOAT_REGISTRY_KEY literal differs (binder ${keyLit(binderSrc)} vs flagship ${keyLit(flagSrc)}) — the two would not converge on one collection set`);
  } catch (e) { FAIL("floatparity", "could not load/compare the flagship executor: " + e.message); }
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
for (const g of ["bindings", "themes", "offline", "parity", "floatanchor", "floatcreate", "floatindep", "floatnoop", "colorprov", "adoptconsent", "librarygeom", "colorparity", "collparity", "floatparity"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
console.log(`  (checked ${targets ? targets.length : 0} binding targets vs ${CANON.size} canonical raw-colors names)`);
console.log("  defer  hpg-parity-roletable — this file's `parity` gate above verifies the engine<->Figma-binder leg (full role objects, in order, per default palette); the canonical role-table.json<->semantic.js leg is verified by semantic-mapping's own refs-canonical gate");
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: figma-plugin clears its checkable [gate] predicates");
process.exit(0);
