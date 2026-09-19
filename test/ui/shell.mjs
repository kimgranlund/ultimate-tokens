#!/usr/bin/env node
// verify.mjs — ui-app validation adapter (CRITIC side). Checks the pure model core (projectView over
// the real modules) + that the shell files exist and app.js is syntactically valid. Exit 0=pass / 1=fail.
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as M from "../../src/ui/model.mjs";
import { paletteStops, STOPS, EXPORT_STOPS } from "../../src/engine/tonal.js";
import { derivedAll } from "../../src/engine/exports.js";
import { PRESETS as NATURE_PRESETS } from "../../src/ui/categories/nature.js";
import { DEFAULT_PALETTES } from "./counts.mjs";
import { gateReport } from "../gate-report.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const UI = join(HERE, "..", "..", "src", "ui"); // the shell files live in src/ui/
const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };

// ── model: projectView(defaultDocument()) composes the 6 modules into a renderable view ──
const doc = M.defaultDocument();
if (!doc || !Array.isArray(doc.palettes) || doc.palettes.length !== DEFAULT_PALETTES) FAIL("model", `defaultDocument has ${doc && doc.palettes && doc.palettes.length} palettes, want ${DEFAULT_PALETTES}`);
const v = M.projectView(doc);
if (!v || !Array.isArray(v.palettes) || v.palettes.length !== DEFAULT_PALETTES) FAIL("model", `projectView returned ${v && v.palettes && v.palettes.length} palettes`);
else for (const p of v.palettes) {
  if (!Array.isArray(p.ramp) || p.ramp.length === 0) { FAIL("model", `${p.name} ramp empty`); break; }
  if (!p.ramp[0] || typeof p.ramp[0].hex !== "string" || !/^#[0-9A-Fa-f]{6}/.test(p.ramp[0].hex)) { FAIL("model", `${p.name} ramp swatch has no hex`); break; }
  if (!Array.isArray(p.roles) || p.roles.length !== 53) { FAIL("model", `${p.name} has ${p.roles && p.roles.length} roles, want 53`); break; }
  if (!p.roles[0] || !p.roles[0].lightHex || !p.roles[0].darkHex) { FAIL("model", `${p.name} role missing light/darkHex`); break; }
}

// ── exports present + non-empty (the drawer renders these) ───────────────────────────────
for (const k of ["css", "oklch", "json", "dtcg", "ui3"]) {
  const e = v.exports && v.exports[k];
  if (e == null || (typeof e === "string" && e.length < 50) || (typeof e === "object" && Object.keys(e).length === 0)) FAIL("exports", `${k} empty`);
}
if (typeof v.exports.css !== "string" || !v.exports.css.includes("--c-")) FAIL("exports", "css missing --c-* semantic vars");

// ── plot + contrast data (the Analysis lens + readout render these) ───────────────────────
if (!Array.isArray(v.plot) || v.plot.length !== DEFAULT_PALETTES) FAIL("model", `plot has ${v.plot && v.plot.length} entries, want ${DEFAULT_PALETTES}`);
else if (!v.plot[0].points || !v.plot[0].points[0] || !("applied" in v.plot[0].points[0]) || !("ceiling" in v.plot[0].points[0])) FAIL("model", "plot points missing applied/ceiling");
if (!Array.isArray(v.contrast) || v.contrast.length === 0) FAIL("model", "no contrast data");

// ── live edit re-projects (no stored derived state) ──────────────────────────────────────
const edited = JSON.parse(JSON.stringify(doc)); edited.palettes[1].hue = (edited.palettes[1].hue + 90) % 360;
const v2 = M.projectView(edited);
if (v2.palettes[1].ramp[12] && v.palettes[1].ramp[12] && v2.palettes[1].ramp[12].hex === v.palettes[1].ramp[12].hex) FAIL("model", "editing hue did not change the projected ramp (stale/stored derived state?)");

// ── paletteKeyColors: the cheap tile-only alternative to projectView (gallery/list rendering —
// presetTile, buildTiles). Must stay identity-matched to projectView's own .key/.name/.on/.colorRole,
// never cache/retain anything of its own (each call is a fresh, independent computation — nothing here
// should outlive the call, so there is nothing for a long-lived session to leak), and re-project live
// edits exactly like projectView does. ──
{
  const kc = M.paletteKeyColors(doc);
  if (!Array.isArray(kc) || kc.length !== v.palettes.length) FAIL("model", `paletteKeyColors returned ${kc && kc.length} entries, want ${v.palettes.length}`);
  else for (let i = 0; i < kc.length; i++) {
    const a = kc[i], b = v.palettes[i];
    if (a.name !== b.name || a.on !== b.on || a.key !== b.key) { FAIL("model", `paletteKeyColors[${i}] (${a.name}) diverges from projectView: key ${a.key} vs ${b.key}`); break; }
    if (!!a.colorRole !== !!b.colorRole || (a.colorRole && a.colorRole !== b.colorRole)) { FAIL("model", `paletteKeyColors[${i}] colorRole ${a.colorRole} != projectView's ${b.colorRole}`); break; }
  }
  // a curated preset's colorRole (dominant/supporting/accent) passes through verbatim — no derivation.
  const curated = NATURE_PRESETS[0];
  const kcCurated = M.paletteKeyColors(curated);
  const withRole = kcCurated.find((p) => p.colorRole);
  if (!withRole) FAIL("model", "paletteKeyColors dropped colorRole on a curated preset (none of its palettes carry one)");
  // live edit re-projects here too — no stale/cached derived state.
  const kc2 = M.paletteKeyColors(edited);
  if (kc2[1].key === kc[1].key) FAIL("model", "paletteKeyColors did not change after editing hue (stale/cached state?)");
  // NOT memoized: two independent calls over the SAME doc return distinct array/object instances —
  // nothing is retained or shared across calls (the "extremely careful with memory leakage" bar).
  const kcAgain = M.paletteKeyColors(doc);
  if (kcAgain === kc || kcAgain[0] === kc[0]) FAIL("model", "paletteKeyColors returned a cached/shared reference across calls — should recompute fresh every time");
}

// ── shell files exist + app.js is syntactically valid ────────────────────────────────────
for (const f of ["index.html", "styles.css", "app.js", "model.mjs"]) if (!existsSync(join(UI, f))) FAIL("shell", `missing ${f}`);
try { execSync(`node --check "${join(UI, "app.js")}"`, { stdio: "pipe" }); } catch (e) { FAIL("shell", `app.js failed node --check`); }
const html = existsSync(join(UI, "index.html")) ? readFileSync(join(UI, "index.html"), "utf8") : "";
if (!/type=["']module["']/.test(html) || !/app\.js/.test(html)) FAIL("shell", "index.html does not load app.js as a module");

// ── OKLCH-NATIVE HUE MODEL (the slider value IS the OKLCH hue) ─────────────────────────────
// Helper: the worst per-stop RGB distance between two rendered ramps (0 = identical render).
const rampRgbDist = (a, b) => { let m = 0; for (let i = 0; i < a.length; i++) { const x = a[i].rgb, y = b[i].rgb; const d = Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); if (d > m) m = d; } return m; };

// (a) defaultDocument is OKLCH-native and each starter renders ≈ its intended (cam16) color: the
//     on-the-fly cam16→oklch hue conversion round-trips through the engine within the hue-space
//     precision (a few RGB units; the blue Primary is the loose pole — see fidelity note).
{
  const RT = JSON.parse(readFileSync(join(HERE, "..", "..", "docs", "reference", "data", "role-table.json"), "utf8"));
  const dd = M.defaultDocument();
  if (dd.hueSpace !== "oklch") FAIL("oklch-native", `defaultDocument hueSpace ${dd.hueSpace}, want "oklch"`);
  const ctl = { curve: dd.curve, tension: dd.tension, lmin: dd.lmin, lmax: dd.lmax, damp: dd.damp, dampCurve: dd.dampCurve, dampAmp: dd.dampAmp, dampBias: dd.dampBias, relChroma: dd.relChroma, chromaFloor: dd.chromaFloor, toneMode: dd.toneMode, vibrancy: dd.vibrancy };
  let worst = 0, wname = null;
  for (let i = 0; i < dd.palettes.length; i++) {
    const np = dd.palettes[i], op = RT.defaults[i];
    const nr = paletteStops({ hue: np.hue, chroma: np.chroma, skew: np.skew, lift: np.lift }, { ...ctl, hueSpace: "oklch" }, STOPS);
    const or = paletteStops({ hue: op.hue, chroma: op.chroma, skew: op.skew, lift: op.lift }, { ...ctl, hueSpace: "cam16" }, STOPS);
    const d = rampRgbDist(nr, or); if (d > worst) { worst = d; wname = np.name; }
    // the conversion must MOVE the stored hue off the raw cam16 value (it's now an OKLCH hue), except
    // where the two spaces coincide (small Δ rounds to the same integer) — so assert it's a valid degree.
    if (!(np.hue >= 0 && np.hue <= 360)) FAIL("oklch-native", `starter ${np.name} hue ${np.hue} out of range`);
  }
  // 30 RGB units (~Δ8° cam16 at the blue pole × high chroma) is the documented worst-case fidelity bound.
  if (worst > 30) FAIL("oklch-native", `starter ramp drifted ${worst.toFixed(1)} RGB from the cam16 intent (worst ${wname}), want ≤30`);
}

// (b) seedFromKeyColor returns the INPUT's OWN OKLCH hue (consistent with the OKLCH-native space):
//     seed of [L, C, 200] has hue ≈ 200.
{
  for (const H of [200, 30, 270, 355]) {
    const seed = M.seedFromKeyColor([0.6, 0.12, H]);
    if (!seed) { FAIL("oklch-native", `seedFromKeyColor([0.6,0.12,${H}]) returned null`); break; }
    let d = Math.abs(seed.hue - H); if (d > 180) d = 360 - d;
    if (d > 1) FAIL("oklch-native", `seedFromKeyColor hue ${seed.hue}, want ≈${H} (the input's OKLCH hue)`);
  }
}

// (c) a gen-categories sample palette's STORED hue ≈ its source oklch[2], and the set bakes hueSpace:"oklch".
{
  const preset = NATURE_PRESETS[0];
  if (preset.hueSpace !== "oklch") FAIL("oklch-native", `category preset hueSpace ${preset.hueSpace}, want "oklch"`);
  for (const pal of preset.palettes) {
    if (!pal.keyColors || !pal.keyColors[0]) continue;
    const src = ((pal.keyColors[0].oklch[2] % 360) + 360) % 360;
    let d = Math.abs(pal.hue - src); if (d > 180) d = 360 - d;
    if (d > 1) { FAIL("oklch-native", `category ${pal.name} stored hue ${pal.hue} vs source oklch ${src.toFixed(1)} (Δ${d.toFixed(1)})`); break; }
  }
}

// (d) persist: a doc WITH hueSpace:"cam16" round-trips as cam16 (legacy preserved); a doc WITHOUT a
//     hueSpace hydrates to "oklch" (the new default). Imported from persist.js (the storage clamp).
{
  const P = await import("../../src/ui/persist.js");
  const base = { palettes: [{ name: "P", hue: 200, chroma: 50, skew: 0, lift: 0, on: true }] };
  const cam = P.hydrate(P.serialize({ ...base, hueSpace: "cam16" }));
  if (cam.hueSpace !== "cam16") FAIL("oklch-native", `persist: a doc saved cam16 hydrated to ${cam.hueSpace}, want cam16 (legacy preserved)`);
  const none = P.hydrate(P.serialize({ ...base })); // no hueSpace field
  if (none.hueSpace !== "oklch") FAIL("oklch-native", `persist: a doc without hueSpace hydrated to ${none.hueSpace}, want oklch (new default)`);
}

// ── resolver gates (SPEC spec-muted-base-key-spikes 0.3.0, ticket #559: absolute per-group base
// chroma + prime chroma resolution) — AC-002, AC-003(b), AC-007, AC-008. ─────────────────────────

// (AC-002) rampChromaOf(p, doc) equals paletteGroups[g].baseChroma when present, else
// controls.baseIntensity; it ignores palette.chroma AND palette.intensity entirely. A probe at
// chroma:10, intensity:100 (a dead legacy field, still readable if stored) in a group whose
// baseChroma is set to 60 must render the chroma-60 ramp — on BOTH of tonal.js's own ramp paths
// (toneMode "even" and "perceptual"), never the palette's own chroma:10.
{
  const probeBase = { name: "Probe", hue: 210, chroma: 10, intensity: 100, skew: 0, lift: 0, group: "material", on: true };
  for (const toneMode of ["even", "perceptual"]) {
    const doc = M.defaultDocument();
    doc.toneMode = toneMode;
    doc.paletteGroups.material = { ...doc.paletteGroups.material, baseChroma: 60 };
    doc.palettes = [probeBase];
    const rc = M.rampChromaOf(doc.palettes[0], doc);
    if (rc !== 60) FAIL("ac002", `rampChromaOf ignored the group override (got ${rc}, want 60) at toneMode ${toneMode}`);
    const view = M.projectView(doc);
    const got = view.palettes[0].fullRamp.map((s) => s.hex);
    const ctl = { ...M.DEFAULT_CONTROLS, toneMode };
    const want = paletteStops({ hue: probeBase.hue, chroma: 60, skew: probeBase.skew, lift: probeBase.lift }, ctl, EXPORT_STOPS).map((s) => s.hex);
    if (JSON.stringify(got) !== JSON.stringify(want)) FAIL("ac002", `probe ramp at toneMode ${toneMode} did not match a direct chroma-60 call — palette.chroma/intensity leaked into the ramp`);
  }
}

// (AC-003b) test/ui/fixtures/default-doc-ramps.json (generated by scripts/gen-ramp-fixture.mjs,
// never by npm test) must match projectView(defaultDocument()) byte for byte; and the REQ-003
// identity rule must hold LIVE: for every default palette whose chroma equals its resolved
// rampChroma, the fixture row equals a direct paletteStops(p, controls, EXPORT_STOPS) call at
// p.chroma; for every other default palette it must differ.
{
  const fixturePath = join(HERE, "fixtures", "default-doc-ramps.json");
  if (!existsSync(fixturePath)) FAIL("ac003b", "test/ui/fixtures/default-doc-ramps.json is missing — run node scripts/gen-ramp-fixture.mjs");
  else {
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    const dd = M.defaultDocument();
    const dv = M.projectView(dd);
    const ctl = { ...M.DEFAULT_CONTROLS, toneMode: dd.toneMode, hueSpace: dd.hueSpace, lmin: dd.lmin, lmax: dd.lmax, damp: dd.damp, dampCurve: dd.dampCurve, dampAmp: dd.dampAmp, dampBias: dd.dampBias, curve: dd.curve, tension: dd.tension, relChroma: dd.relChroma, chromaFloor: dd.chromaFloor, vibrancy: dd.vibrancy };
    for (const p of dd.palettes) {
      const row = fixture.palettes[p.name];
      const got = dv.palettes.find((v) => v.name === p.name).fullRamp.map((s) => s.hex);
      if (!row) { FAIL("ac003b", `fixture missing palette "${p.name}"`); continue; }
      if (JSON.stringify(row) !== JSON.stringify(got)) FAIL("ac003b", `projectView(defaultDocument()) has drifted from the pinned fixture at palette "${p.name}" — regenerate with scripts/gen-ramp-fixture.mjs only if the drift is intentional`);
      const rc = M.rampChromaOf(p, dd);
      const direct = paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, ctl, EXPORT_STOPS).map((s) => s.hex);
      if (rc === p.chroma) {
        if (JSON.stringify(row) !== JSON.stringify(direct)) FAIL("ac003b", `REQ-003 identity: "${p.name}" has chroma === rampChroma (${p.chroma}) but its fixture row differs from the direct chroma-${p.chroma} call`);
      } else if (JSON.stringify(row) === JSON.stringify(direct)) {
        FAIL("ac003b", `REQ-003 identity: "${p.name}" has chroma ${p.chroma} !== rampChroma ${rc}, but its fixture row is byte-identical to the direct chroma-${p.chroma} call (should differ)`);
      }
    }
  }
}

// (AC-007) DEFAULT_CONTROLS.baseIntensity === 100 && primeChroma === 100 (the global fallback, only
// reached when a group itself carries no value); in projectView(defaultDocument()) Neutral's ramp
// equals its OWN chroma-30 ramp (Material's default) and every one of the eight data palettes'
// ramps equals its own chroma-100 ramp (Data's default).
{
  if (M.DEFAULT_CONTROLS.baseIntensity !== 100) FAIL("ac007", `DEFAULT_CONTROLS.baseIntensity is ${M.DEFAULT_CONTROLS.baseIntensity}, want 100`);
  if (M.DEFAULT_CONTROLS.primeChroma !== 100) FAIL("ac007", `DEFAULT_CONTROLS.primeChroma is ${M.DEFAULT_CONTROLS.primeChroma}, want 100`);
  const dd = M.defaultDocument();
  const dv = M.projectView(dd);
  const ctl = { ...M.DEFAULT_CONTROLS, toneMode: dd.toneMode, hueSpace: dd.hueSpace, lmin: dd.lmin, lmax: dd.lmax, damp: dd.damp, dampCurve: dd.dampCurve, dampAmp: dd.dampAmp, dampBias: dd.dampBias, curve: dd.curve, tension: dd.tension, relChroma: dd.relChroma, chromaFloor: dd.chromaFloor, vibrancy: dd.vibrancy };
  const neutral = dd.palettes.find((p) => p.name === "Neutral");
  const neutralGot = dv.palettes.find((p) => p.name === "Neutral").fullRamp.map((s) => s.hex);
  const neutralWant = paletteStops({ hue: neutral.hue, chroma: 30, skew: neutral.skew, lift: neutral.lift }, ctl, EXPORT_STOPS).map((s) => s.hex);
  if (JSON.stringify(neutralGot) !== JSON.stringify(neutralWant)) FAIL("ac007", "Neutral's ramp does not equal its own chroma-30 ramp (Material's default)");
  for (let i = 1; i <= 8; i++) {
    const name = `Data ${i}`;
    const dp = dd.palettes.find((p) => p.name === name);
    const got = dv.palettes.find((p) => p.name === name).fullRamp.map((s) => s.hex);
    const want = paletteStops({ hue: dp.hue, chroma: 100, skew: dp.skew, lift: dp.lift }, ctl, EXPORT_STOPS).map((s) => s.hex);
    if (JSON.stringify(got) !== JSON.stringify(want)) { FAIL("ac007", `${name}'s ramp does not equal its own chroma-100 ramp (Data's default)`); break; }
  }
}

// (AC-008) primeChromaOf(p, doc): a brand palette's stored override wins over its group's own
// default; a data palette's stored override is IGNORED (its group default applies instead);
// moving that same palette out of Data restores the override; the material group's default 60
// reaches Neutral's prime strip (its flat OKHSL saturation `s` equals the SAME palette's own
// primeChroma-100 saturation ("key.s") times 0.6).
{
  const dd = M.defaultDocument();
  const brandIdx = dd.palettes.findIndex((p) => M.paletteGroup(p) === "brand");
  dd.palettes[brandIdx] = { ...dd.palettes[brandIdx], primeChroma: 37 };
  if (M.primeChromaOf(dd.palettes[brandIdx], dd) !== 37) FAIL("ac008", "a brand palette's own primeChroma override must win over Brand's group default (100)");

  const dataIdx = dd.palettes.findIndex((p) => M.paletteGroup(p) === "data");
  dd.palettes[dataIdx] = { ...dd.palettes[dataIdx], primeChroma: 12 };
  if (M.primeChromaOf(dd.palettes[dataIdx], dd) !== 100) FAIL("ac008", `a Data palette's stored primeChroma override must be ignored (Data is locked) — got ${M.primeChromaOf(dd.palettes[dataIdx], dd)}, want the group default 100`);
  const movedOut = { ...dd.palettes[dataIdx], group: "brand" };
  if (M.primeChromaOf(movedOut, dd) !== 12) FAIL("ac008", "moving a Data palette out of Data must restore its stored primeChroma override");

  const nIdx = dd.palettes.findIndex((p) => p.name === "Neutral");
  const view = M.projectView(dd);
  const neutralS = view.palettes[nIdx].prime[0].s;
  const keyDoc = JSON.parse(JSON.stringify(dd));
  keyDoc.palettes[nIdx].group = "brand"; // Brand's own default primeChroma is 100 -> reproduces key.s exactly
  const keyView = M.projectView(keyDoc);
  const keyS = keyView.palettes[nIdx].prime[0].s;
  if (Math.abs(neutralS - keyS * 0.6) > 1e-9) FAIL("ac008", `Neutral's prime saturation ${neutralS} must equal key.s*0.6 = ${keyS * 0.6} (Material's default primeChroma 60)`);
}

// (resolver-agree, conductor ruling 2026-09-11 on PR #566) The two ramp paths cannot drift apart:
// projectView (src/ui/model.mjs) and derivePalette (src/engine/exports.js, via the exported
// derivedAll) must both import the SAME engine/resolve.mjs rampChromaOf/primeChromaOf — this proves
// it, over all 16 default palettes, at every one of the 25 EXPORT_STOPS, rather than trusting the
// two call sites stay hand-in-sync.
{
  const dd = M.defaultDocument();
  const dv = M.projectView(dd);
  const derived = derivedAll(M.stateOf(dd));
  if (derived.length !== dv.palettes.length) FAIL("resolver-agree", `derivedAll returned ${derived.length} palettes, projectView returned ${dv.palettes.length}`);
  for (let i = 0; i < dv.palettes.length; i++) {
    const viewP = dv.palettes[i];
    const dp = derived.find((d) => d.name === viewP.name);
    if (!dp) { FAIL("resolver-agree", `derivedAll has no entry for "${viewP.name}"`); continue; }
    for (const s of viewP.fullRamp) {
      const pad = String(s.stop).padStart(3, "0");
      const got = dp.stops[pad] && dp.stops[pad].hex;
      if (got !== s.hex) { FAIL("resolver-agree", `"${viewP.name}" stop ${s.stop}: projectView ${s.hex} != derivedAll ${got} — the two ramp paths resolved a different chroma`); break; }
    }
  }
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
// The printed set is this declared list UNION every gate name that actually reached a FAIL(...)
// call (#699, following #695's pattern in test/engine/tonal.mjs), so a gate missing from the list
// below still shows up, loudly, instead of hiding behind a neighbouring gate's "pass" row.
const DECLARED = ["model", "exports", "shell", "oklch-native", "ac002", "ac003b", "ac007", "ac008", "resolver-agree", "report-static"];
gateReport({ fails, declared: DECLARED, selfUrl: import.meta.url, FAIL });
console.log(`  (projectView: ${DEFAULT_PALETTES} palettes · ${v.palettes ? v.palettes.reduce((n, p) => n + (p.roles ? p.roles.length : 0), 0) : 0} role tokens · css ${v.exports && v.exports.css ? v.exports.css.length : 0} B)`);
console.log("  note  visual/interaction layer verified by serve + headless boot, not this adapter");
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: ui-app pure core + shell clear the checkable predicates");
process.exit(0);
