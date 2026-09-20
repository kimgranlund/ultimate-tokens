#!/usr/bin/env node
// verify.mjs — export-formats validation adapter (CRITIC side; deny-on-write to the advancer).
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as Xcolor from "../../src/engine/exports.js";
// The DS-bundle (Claude Design / Stitch / Make) subsystem moved to its own module (TKT-0015);
// merge into the same `X` namespace so every existing X.foo call below is untouched.
import * as Xds from "../../src/engine/ds-export.js";
const X = { ...Xcolor, ...Xds };
import { dsBundleGates } from "../../src/engine/ds-gates.js";
import { typeScale, DEFAULT_TYPE } from "../../src/engine/type.mjs";
import { geomScale, LADDER_MD_STEP, sizeAnchor } from "../../src/engine/geometry.mjs";
import { PRIME_STEPS } from "../../src/engine/prime.mjs";
import { oklchToRgb } from "../../src/engine/okhsl.js"; // radix gate's own oklch()->rgb inverse (anti-tautology, never X's forward path)
import { gateReport } from "../gate-report.mjs";
import { paletteGroup, brandKit, defaultDocument, stateOf } from "../../src/ui/model.mjs"; // paletteGroup is the SINGLE
// group resolver (ticket #556/#572) — the group-metadata gate below asserts every emitted surface
// matches THIS, never a second hand-kept copy; brandKit/defaultDocument prove the MCP-facing kit too.
// stateOf builds the exporter-shaped State the hpg-export-json-meta gate (ticket #573) deep-equals
// exportJSON's `meta.controls` against — the SAME function every real export path (projectView,
// figmaBundle) goes through, never a hand-built State that could drift from it.

const RT = JSON.parse(readFileSync(new URL("../../docs/reference/data/role-table.json", import.meta.url), "utf8"));
const C = (palettes) => ({ palettes, curve: "logistic", tension: 0, lmin: 5, lmax: 100, damp: 80, hueSpace: "cam16", theme: "auto" });
const ALL = RT.defaults.map((p) => ({ ...p, on: true }));
const enabledCount = (st) => st.palettes.filter((p) => p.on !== false).length;

// ── DATA PALETTE FIXTURES (#516, U7 of #503) — constructed directly, this repo's standard
// engine-test pattern (fixture palette objects, not a live default document), rather than relying on
// RT.defaults' own data-N entries. #515/U6 has since landed real data-1..8 into role-table.json, so
// ALL now already carries 16 (8 brand + 8 data) — BRAND_ONLY isolates the 8 brand families as the
// stable "no data enabled" baseline these gates compare against.
const dataPalette = (i, hue, chroma) => ({ name: `Data ${i}`, hue, chroma, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true });
const BRAND_ONLY = ALL.filter((p) => !X.isDataPalette(p));
const PRIMARY_CHROMA = BRAND_ONLY.find((p) => p.name === "Primary").chroma; // REQ-022: data chroma follows primary's
const DATA_8 = [30, 75, 120, 165, 210, 255, 300, 345].map((hue, i) => dataPalette(i + 1, hue, PRIMARY_CHROMA));
const ALL_WITH_DATA = [...BRAND_ONLY, ...DATA_8];

// RADIX_COLLIDING (#630, reused by #638's reference-form gates) — the reserved-alias-key collision
// document: stock "Danger" dropped so pickDrivers' danger regex lands on the "Error" palette, plus
// palettes whose slugs ARE reserved alias keys ("accent", "error"), so both are emitted under a
// `<slug>-palette` key. Declared once here because radix-alias-collision and radix-refs-collision
// must exercise the SAME document; a second hand-built copy could drift from it.
const RADIX_MK = (name, hue) => ({ name, hue, chroma: 60, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true });
const RADIX_COLLIDING = [...BRAND_ONLY.filter((p) => p.name !== "Danger"), RADIX_MK("Accent", 40), RADIX_MK("Error", 350)];
const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };

// recursively collect DTCG color leaves ({$type:"color", $value:{...}, $extensions?})
const leaves = (node, out = []) => {
  if (node && typeof node === "object") {
    if (node.$type === "color" && node.$value) out.push(node);
    else for (const k of Object.keys(node)) leaves(node[k], out);
  }
  return out;
};

// ── hpg-export-dtcg-shape ────────────────────────────────────────────────────────────────
const dtcg = X.exportDTCG(C(ALL), {});
const want3 = ["palette.tokens.json", "Light_tokens.json", "Dark_tokens.json"];
if (want3.some((k) => !(k in dtcg)) || Object.keys(dtcg).length !== 3) FAIL("dtcg-shape", `keys = ${Object.keys(dtcg)}`);
for (const k of want3) try { JSON.parse(JSON.stringify(dtcg[k])); } catch { FAIL("dtcg-shape", `${k} not JSON-serializable`); }

// ── hpg-export-themes (TKT-0021 — the theme axis is data-driven, not a hardcoded Light/Dark pair) ──
// IDENTITY: an absent opts.themes must reproduce EXACTLY the same output as passing the default pair
// explicitly — proves the fallback isn't a separate code path that could quietly drift from the axis.
const dtcgDefault = X.exportDTCG(C(ALL), {});
const dtcgExplicit2 = X.exportDTCG(C(ALL), { themes: [{ name: "Light", side: "light" }, { name: "Dark", side: "dark" }] });
if (JSON.stringify(dtcgDefault) !== JSON.stringify(dtcgExplicit2)) FAIL("themes", "default (no opts.themes) output differs from the explicit 2-theme (Light/Dark) equivalent");
// GENERALIZATION: a 3-theme axis (Light/Dark/Dim) produces a THIRD semantic file, correctly tagged and
// resolved — proves the axis is genuinely N-way, not just "2 still works". Dim reuses the dark side
// (a real, named companion mode — not a new per-role color derivation, which is out of this ticket's
// scope; see semantic.js's DEFAULT_THEMES note), so its tree must equal Dark's tree exactly.
const THEMES_3 = [{ name: "Light", side: "light" }, { name: "Dark", side: "dark" }, { name: "Dim", side: "dark" }];
const dtcg3 = X.exportDTCG(C(ALL), { themes: THEMES_3 });
const want4 = ["palette.tokens.json", "Light_tokens.json", "Dark_tokens.json", "Dim_tokens.json"];
if (want4.some((k) => !(k in dtcg3)) || Object.keys(dtcg3).length !== 4) FAIL("themes", `3-theme keys = ${Object.keys(dtcg3)}, want ${want4}`);
else {
  if ((dtcg3["Dim_tokens.json"].$extensions || {})["com.figma.modeName"] !== "Dim") FAIL("themes", "Dim_tokens.json is not tagged com.figma.modeName='Dim'");
  const dimNoTag = { ...dtcg3["Dim_tokens.json"] }; delete dimNoTag.$extensions;
  const darkNoTag = { ...dtcg3["Dark_tokens.json"] }; delete darkNoTag.$extensions;
  if (JSON.stringify(dimNoTag) !== JSON.stringify(darkNoTag)) FAIL("themes", "Dim (side:'dark') tree does not match Dark's tree (same side, should resolve identically)");
  // Light/Dark themselves are untouched by adding a 3rd theme (order + content stable).
  if (JSON.stringify(dtcg3["Light_tokens.json"]) !== JSON.stringify(dtcgDefault["Light_tokens.json"])) FAIL("themes", "adding a 3rd theme changed the Light tree");
  if (JSON.stringify(dtcg3["Dark_tokens.json"]) !== JSON.stringify(dtcgDefault["Dark_tokens.json"])) FAIL("themes", "adding a 3rd theme changed the Dark tree");
}
// aliasData also flows per-theme (rawColl on): Dim's alias targets equal Dark's (same side -> same ref).
const dtcg3Alias = X.exportDTCG(C(ALL), { themes: THEMES_3, rawColl: "Color Primitives" });
const firstPaletteKey = Object.keys(dtcg3Alias["Dim_tokens.json"]).find((k) => k[0] !== "$");
const dimRoleLeaf = leaves(dtcg3Alias["Dim_tokens.json"][firstPaletteKey])[0];
const darkRoleLeaf = leaves(dtcg3Alias["Dark_tokens.json"][firstPaletteKey])[0];
const aliasOfLeaf = (l) => l && l.$extensions && l.$extensions["com.figma.aliasData"];
if (!aliasOfLeaf(dimRoleLeaf) || JSON.stringify(aliasOfLeaf(dimRoleLeaf)) !== JSON.stringify(aliasOfLeaf(darkRoleLeaf))) FAIL("themes", "Dim's aliasData does not match Dark's (same side should target the same raw ref)");

// ── hpg-export-leaf-valid (>= 53 x enabled resolved leaves per mode; each well-formed) ────
for (const file of ["Light_tokens.json", "Dark_tokens.json"]) {
  const ls = leaves(dtcg[file]);
  if (ls.length < 53 * enabledCount(C(ALL))) FAIL("leaf-valid", `${file} has ${ls.length} leaves < 53×${enabledCount(C(ALL))}`);
  for (const lf of ls) {
    const v = lf.$value;
    if (!v || v.colorSpace !== "srgb") { FAIL("leaf-valid", `leaf colorSpace != srgb`); break; }
    if (!Array.isArray(v.components) || v.components.length !== 3 || v.components.some((c) => c < 0 || c > 1)) { FAIL("leaf-valid", `components out of [0,1]: ${v.components}`); break; }
    if (typeof v.alpha !== "number" || v.alpha < 0 || v.alpha > 1) { FAIL("leaf-valid", `alpha out of [0,1]: ${v.alpha}`); break; }
    const hx = "#" + v.components.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
    if ((v.hex || "").toUpperCase().slice(0, 7) !== hx) { FAIL("leaf-valid", `hex ${v.hex} != ${hx} from components`); break; }
  }
}

// ── hpg-export-resolved (no aliasData when blank; positive control when set) ──────────────
const semLeaves = (d) => [...leaves(d["Light_tokens.json"]), ...leaves(d["Dark_tokens.json"])];
if (semLeaves(dtcg).some((l) => l.$extensions && l.$extensions["com.figma.aliasData"])) FAIL("resolved", "aliasData present with blank rawColl");
const dtcgA = X.exportDTCG(C(ALL), { rawColl: "Color Primitives" });
const sa = semLeaves(dtcgA);
const aliasOf = (l) => l.$extensions && l.$extensions["com.figma.aliasData"];
// rawColl set → every leaf carries the FULL documented name+collection alias shape:
// targetVariableName "{n}/{refPath}" (e.g. neutral/550, neutral/scrim/200) AND targetVariableSetName
// === the Color Primitives collection. That is the shape Figma's documented aliasData fallback hierarchy
// resolves on NATIVE import when the Color Primitives collection pre-exists in the file (OD-004 spike;
// ADR-002 re-verify 2026-06-15). The native-import cascade itself is validated end-to-end in Figma,
// NOT here — this gate only proves the emitted SHAPE so the spike can't silently regress.
if (sa.length === 0 || !sa.every((l) => {
  const a = aliasOf(l);
  // ADR-016: solid targets "{n}/{pad3}" (2 segments), scrim targets NEST "{n}/scrim/{step}" (3)
  return a && /^[a-z0-9-]+\/(?:[a-z0-9-]+|scrim\/[0-9]{3})$/.test(a.targetVariableName || "") && a.targetVariableSetName === "Color Primitives";
}))
  FAIL("resolved", "rawColl set: not every semantic leaf carries aliasData {targetVariableName '{n}/{refPath}', targetVariableSetName 'Color Primitives'}");

// ── hpg-export-css-resolves (every --c-* is light-dark(var,var) over existing raw vars) ───
const css = X.exportCSS(C(ALL));
const declared = new Set([...css.matchAll(/(--[a-z0-9_-]+)\s*:/gi)].map((m) => m[1])); // raw + semantic both use --c- (raw names end in digits, semantic in a word)
let cssChecked = 0;
for (const m of css.matchAll(/(--c-[a-z0-9-]+)\s*:\s*light-dark\(\s*var\((--[a-z0-9_-]+)\)\s*,\s*var\((--[a-z0-9_-]+)\)\s*\)/gi)) {
  cssChecked++;
  if (!declared.has(m[2]) || !declared.has(m[3])) FAIL("css-resolves", `${m[1]} refs undefined raw var ${m[2]}/${m[3]}`);
}
if (cssChecked === 0) FAIL("css-resolves", "no --c-* light-dark(var,var) lines found");

// ── configurable colour prefix (--{prefix}-* naming; M3-flavoured export) ────────────────────────
{
  if (X.cssPrefixOf(C(ALL)) !== "c") FAIL("prefix", "default state must resolve to the 'c' prefix");
  const md = X.exportCSS({ ...C(ALL), export: { colorPrefix: "md-sys-color" } });
  if (!md.includes("--md-sys-color-neutral-on-surface")) FAIL("prefix", "a Material prefix must emit --md-sys-color-{p}-{role}");
  if (md.includes("--c-neutral-on-surface")) FAIL("prefix", "no stray --c-* names must survive under a custom prefix");
  // the semantic refs must thread the same prefix (var() points at the prefixed raws) or the cascade breaks.
  for (const m of md.matchAll(/--md-sys-color-[a-z0-9-]+\s*:\s*light-dark\(\s*var\((--[a-z0-9-]+)\)\s*,\s*var\((--[a-z0-9-]+)\)\s*\)/gi))
    if (!m[1].startsWith("--md-sys-color-") || !m[2].startsWith("--md-sys-color-")) FAIL("prefix", `a semantic ref didn't thread the prefix: ${m[1]}/${m[2]}`);
  // IDENTITY: no export / default "c" ⇒ byte-identical to the historical output.
  if (X.exportCSS({ ...C(ALL), export: { colorPrefix: "c" } }) !== X.exportCSS(C(ALL))) FAIL("prefix", "the default prefix must be byte-identical to no-prefix (identity gate)");
  // sanitization: junk → legal ident core; leading digit repaired; empty → 'c'.
  if (X.cssPrefixOf({ export: { colorPrefix: "MD Sys!!" } }) !== "md-sys") FAIL("prefix", "junk prefix must sanitize");
  if (X.cssPrefixOf({ export: { colorPrefix: "3x" } }) !== "c3x") FAIL("prefix", "leading-digit prefix must be repaired");
  if (X.cssPrefixOf({ export: { colorPrefix: "" } }) !== "c") FAIL("prefix", "empty prefix falls back to 'c'");
}

// ── hpg-export-padding (3-digit stop padding in CSS var names) ───────────────────────────
// GREEDY prefix (not lazy): a lazy `+?` stops at the FIRST digit run, which a data-family slug like
// "data-1" produces before the real stop (e.g. "--c-data-1-500:" would lazily capture "1", not "500").
// Only a numeric run >= 50 is a real stop (every stop, padded or not, is 50..950); a data slug's own
// trailing digit (1..8) is excluded, so e.g. the bare role var "--c-data-1:" is correctly ignored.
for (const m of css.matchAll(/--c-[a-z0-9-]+-(\d+)\s*:/gi)) {
  const stop = m[1];
  if (/^\d+$/.test(stop) && Number(stop) >= 50 && stop.length < 3) FAIL("padding", `unpadded stop in --c-…-${stop}`);
}

// ── on-color policy threads to exports (OD-001 / ADR-025): "fixed" = on{N} pinned 050 both modes;
//    "contrast" (the DEFAULT since #662) re-points at least one to the better-contrasting end, and
//    falls through to the document-level white/black constants where neither ramp end clears AA.
//    BOTH modes are named explicitly — reading one of them off the engine default would make this
//    gate re-state whatever DEFAULT_CONTROLS happens to say instead of testing the two policies. ──
//    The ref group accepts a stop, a scrim ref, OR a bare `white`/`black`, because an achromatic
//    on-color aliases the document constant (`var(--c-white)`), not a per-palette var.
const onRefs = (cssStr) => [...cssStr.matchAll(/--c-([a-z]+)-on-\1:\s*light-dark\(var\(--c-(?:[a-z]+-)?([0-9-]+|white|black)\),\s*var\(--c-(?:[a-z]+-)?([0-9-]+|white|black)\)/gi)].map((m) => `${m[1]}:${m[2]}/${m[3]}`);
const fixedOn = onRefs(X.exportCSS({ ...C(ALL), onColorMode: "fixed" }));
const contrastOn = onRefs(X.exportCSS({ ...C(ALL), onColorMode: "contrast" }));
if (fixedOn.length === 0) FAIL("oncolors", "no on-{n} CSS vars found");
if (contrastOn.length !== fixedOn.length) FAIL("oncolors", `contrast mode matched ${contrastOn.length} on-{n} vars, fixed matched ${fixedOn.length} — a ref shape the matcher does not know about`);
if (!fixedOn.every((r) => /:050\/050$/.test(r))) FAIL("oncolors", `fixed mode: on-colors not all 050/050 (${fixedOn.find((r) => !/:050\/050$/.test(r))})`);
if (JSON.stringify(fixedOn) === JSON.stringify(contrastOn)) FAIL("oncolors", "contrast mode changed no on-color — onColorMode not threaded to exports");
// #662: the achromatic fall-through reaches the CSS emitter, and it aliases the emitted document
// constant rather than a per-palette var that would not resolve.
//
// This needs a palette whose accent (550 light / 450 dark) misses AA against BOTH of its own ramp
// ends (050 and 950) — the only case `applyOnColorContrast`'s `pick()` falls through to white/black.
// RT.defaults no longer supplies one: ticket #681 U2 fixed model.mjs's projectView and exports.js's
// derivePalette to actually forward `anchor` into paletteStops (a "subset-object gap" — they built
// narrowed object literals for the engine call that silently dropped the new field), and RT.defaults'
// families now carry `anchor` (mirroring DEFAULT_PALETTES). With the anchor honoured, every family's
// own 050/950 clears AA against its accent comfortably (see test/engine/semantic.mjs's re-measured
// role-contrast floors) — none of them exercise the fallback path any more. A dedicated synthetic
// probe, unrelated to any default family, keeps this gate meaningful: hue 150 (a green/cyan) at full
// chroma, with damping OFF (damp/dampAmp/dampBias: 0, so the ramp keeps full saturation all the way
// to its own 050/950 instead of fading toward white/black) is measured to land its light-scheme
// accent between its own washed-out ends, missing AA on both — the exact "no” a ramp fixture chases.
const FALLBACK_PROBE = { name: "Probe", hue: 150, chroma: 100, skew: 0, lift: 0, on: true };
const probeCtl = { ...C([...ALL, FALLBACK_PROBE]), onColorMode: "contrast", damp: 0, dampAmp: 0, dampBias: 0 };
const contrastCss = X.exportCSS(probeCtl);
const probeOn = onRefs(contrastCss).filter((r) => r.startsWith("probe:"));
if (probeOn.length === 0) FAIL("oncolors", "fallback probe palette produced no on-color ref — the resolution ladder changed shape");
else if (!probeOn.some((r) => /white|black/.test(r)))
  FAIL("oncolors", `contrast mode produced no white/black on-color for the fallback probe (got ${probeOn.join(",")}) — the achromatic fall-through (#662) is not wired to the exporters`);
for (const which of ["white", "black"]) {
  if (contrastCss.includes(`var(--c-${which})`) && !contrastCss.includes(`--c-${which}: `))
    FAIL("oncolors", `an on-color aliases var(--c-${which}) but --c-${which} is not emitted in :root (ADR-005)`);
  if (/--c-[a-z0-9-]+-(white|black)\b/.test(contrastCss))
    FAIL("oncolors", `an achromatic ref was emitted palette-prefixed (--c-{n}-${which}) — it must alias the document constant`);
}

// ── hpg-export-disabled-palette (on:false absent; all-disabled = valid empty, no throw) ───
const oneOff = C(ALL.map((p, i) => (i === 1 ? { ...p, on: false } : p)));
const cssOff = X.exportCSS(oneOff);
const offName = ALL[1].name.toLowerCase();
if (cssOff.includes(`--c-${offName}-`)) FAIL("disabled-palette", `disabled palette '${offName}' still in CSS`);
try {
  const empty = C(ALL.map((p) => ({ ...p, on: false })));
  const ec = X.exportCSS(empty), ed = X.exportDTCG(empty, {});
  if (typeof ec !== "string" || Object.keys(ed).length !== 3) FAIL("disabled-palette", "all-disabled not well-formed");
  if (leaves(ed["Light_tokens.json"]).length !== 0) FAIL("disabled-palette", "all-disabled has leaves");
} catch (e) { FAIL("disabled-palette", `all-disabled threw: ${e.message}`); }

// ── hpg-export-nonempty (5 formats non-empty; JSON has stops/scrims/semantic) ─────────────
const all = X.exportAll(C(ALL), {});
for (const k of ["css", "oklch", "json", "dtcg", "ui3", "tailwind", "shadcn", "panda", "radix", "radixRef"]) {
  const v = all[k];
  if (v == null || (typeof v === "string" && v.length < 10) || (typeof v === "object" && Object.keys(v).length === 0)) FAIL("nonempty", `${k} empty`);
}
const j = X.exportJSON(C(ALL)); const p0 = j[ALL[0].name.toLowerCase()] || Object.values(j)[0];
if (!p0 || !p0.stops || !p0.scrims || !p0.semantic) FAIL("nonempty", "JSON palette missing stops/scrims/semantic");

// ── hpg-export-dialog-backdrop (a fixed, non-palette color CONSTANT — opaque black at 80% alpha,
//    emitted ONCE per document, never per-palette, never mode-flipped) across every color format ──
{
  const WANT_HEX = "#000000CC"; // black, alpha 0.8 * 255 = 204 = 0xCC
  const WANT_OKLCH = "oklch(0 0 0 / 80%)";
  // CSS (hex) / CSS (OKLCH) — one line in :root, before any palette (cssFrom's shared body).
  if (!X.exportCSS(C(ALL)).includes(`--c-dialog-backdrop: ${WANT_HEX};`)) FAIL("dialog-backdrop", "exportCSS missing --c-dialog-backdrop (hex)");
  if (!X.exportOKLCH(C(ALL)).includes(`--c-dialog-backdrop: ${WANT_OKLCH};`)) FAIL("dialog-backdrop", "exportOKLCH missing --c-dialog-backdrop (oklch)");
  // the configurable prefix covers it too (same {pfx} as every other token).
  const mdCss = X.exportCSS({ ...C(ALL), export: { colorPrefix: "md-sys-color" } });
  if (!mdCss.includes(`--md-sys-color-dialog-backdrop: ${WANT_HEX};`)) FAIL("dialog-backdrop", "a custom prefix must cover --{prefix}-dialog-backdrop too");
  // JSON — a top-level `constants` sibling to the palette-name keys (never itself a palette).
  const jc = X.exportJSON(C(ALL));
  if (!jc.constants || jc.constants["dialog-backdrop"]?.hex !== WANT_HEX) FAIL("dialog-backdrop", `JSON constants.dialog-backdrop.hex = ${jc.constants && jc.constants["dialog-backdrop"] && jc.constants["dialog-backdrop"].hex}, want ${WANT_HEX}`);
  // DTCG — RAW tree only (palette.tokens.json), under a "constants" group. Deliberately ABSENT from
  // the SEMANTIC tree (Light/Dark): every top-level key there is treated elsewhere (style-plan family
  // derivation, regroup ordering) as a real, fully-roled palette positionally zipped against
  // doc.palettes — a synthetic non-palette key breaks that invariant (caught live during this change).
  const dtcgC = X.exportDTCG(C(ALL), {});
  const rawLeaf = dtcgC["palette.tokens.json"] && dtcgC["palette.tokens.json"].constants && dtcgC["palette.tokens.json"].constants["dialog-backdrop"];
  if (!rawLeaf || rawLeaf.$type !== "color" || rawLeaf.$value.alpha !== 0.8 || (rawLeaf.$value.hex || "").toUpperCase() !== WANT_HEX)
    FAIL("dialog-backdrop", `DTCG raw constants/dialog-backdrop leaf malformed: ${JSON.stringify(rawLeaf)}`);
  if (dtcgC["Light_tokens.json"].constants || dtcgC["Dark_tokens.json"].constants)
    FAIL("dialog-backdrop", "DTCG semantic tree (Light/Dark) must NOT carry a 'constants' key (breaks the real-palette invariant)");
  // even with rawColl set, the raw constants leaf carries NO aliasData — there is no semantic entry to
  // point FROM, and the raw leaf is the thing consumers bind to directly.
  const dtcgAliased = X.exportDTCG(C(ALL), { rawColl: "Color Primitives" });
  const rawLeafAliased = dtcgAliased["palette.tokens.json"].constants["dialog-backdrop"];
  if (rawLeafAliased.$extensions && rawLeafAliased.$extensions["com.figma.aliasData"]) FAIL("dialog-backdrop", "the raw constants leaf must never carry aliasData");
  // UI3 (Figma interchange) — Primitives collection ONLY, same reasoning as DTCG above.
  const ui3 = X.exportUI3(C(ALL));
  const ui3Prim = ui3.collections["Color Primitives"].variables["raw/constants/dialog-backdrop"];
  if (!ui3Prim || ui3Prim.type !== "COLOR" || ui3Prim.values.Base !== WANT_HEX) FAIL("dialog-backdrop", `UI3 Primitives raw/constants/dialog-backdrop malformed: ${JSON.stringify(ui3Prim)}`);
  if (ui3.collections["Color Roles"].variables["constants/dialog-backdrop"]) FAIL("dialog-backdrop", "UI3 Semantic collection must NOT carry constants/dialog-backdrop");
  // Tailwind @theme — one line, outside any palette's scale/role blocks.
  if (!X.exportTailwind(C(ALL)).includes(`--color-dialog-backdrop: ${WANT_OKLCH};`)) FAIL("dialog-backdrop", "exportTailwind missing --color-dialog-backdrop");
  // ShadCN — the one fixed, non-role token (--overlay), outside SHADCN_ORDER/MAP: present in BOTH
  // :root/.dark (mode-independent — token-set parity is proven generically by the shadcn gate above),
  // mapped in @theme inline, literal in the default (non-alias) call, var()-linked when aliased.
  const scDefault = X.exportShadcn(C(ALL));
  if (!scDefault.includes(`--overlay: ${WANT_OKLCH};`)) FAIL("dialog-backdrop", "exportShadcn (default) missing a literal --overlay value");
  if (!scDefault.includes("--color-overlay: var(--overlay);")) FAIL("dialog-backdrop", "exportShadcn @theme inline missing --color-overlay -> var(--overlay)");
  const scAliased = X.exportShadcn(C(ALL), { aliasPrefix: "c" });
  if (!scAliased.includes("--overlay: var(--c-dialog-backdrop);")) FAIL("dialog-backdrop", "exportShadcn (aliased) --overlay must link var(--{aliasPrefix}-dialog-backdrop)");
}

// ── hpg-export-white-black (two more fixed, non-palette color CONSTANTS — solid, opaque, emitted
//    ONCE per document, never per-palette, never mode-flipped) across every color format except
//    ShadCN (its fixed contract has no white/black slot, same reasoning as the dialog-backdrop block
//    above for why --overlay is dialog-backdrop-only) ──
{
  const WHITE_HEX = "#FFFFFF";
  const BLACK_HEX = "#000000";
  const WHITE_OKLCH = "oklch(1 0 0)";
  const BLACK_OKLCH = "oklch(0 0 0)";
  // CSS (hex) / CSS (OKLCH) — two lines in :root, alongside dialog-backdrop, before any palette.
  if (!X.exportCSS(C(ALL)).includes(`--c-white: ${WHITE_HEX};`)) FAIL("white-black", "exportCSS missing --c-white (hex)");
  if (!X.exportCSS(C(ALL)).includes(`--c-black: ${BLACK_HEX};`)) FAIL("white-black", "exportCSS missing --c-black (hex)");
  if (!X.exportOKLCH(C(ALL)).includes(`--c-white: ${WHITE_OKLCH};`)) FAIL("white-black", "exportOKLCH missing --c-white (oklch)");
  if (!X.exportOKLCH(C(ALL)).includes(`--c-black: ${BLACK_OKLCH};`)) FAIL("white-black", "exportOKLCH missing --c-black (oklch)");
  // the configurable prefix covers both too (same {pfx} as every other token).
  const mdCss = X.exportCSS({ ...C(ALL), export: { colorPrefix: "md-sys-color" } });
  if (!mdCss.includes(`--md-sys-color-white: ${WHITE_HEX};`) || !mdCss.includes(`--md-sys-color-black: ${BLACK_HEX};`))
    FAIL("white-black", "a custom prefix must cover --{prefix}-white/--{prefix}-black too");
  // JSON — top-level `constants` siblings to dialog-backdrop (never themselves a palette).
  const jc = X.exportJSON(C(ALL));
  if (!jc.constants || jc.constants.white?.hex !== WHITE_HEX) FAIL("white-black", `JSON constants.white.hex = ${jc.constants && jc.constants.white && jc.constants.white.hex}, want ${WHITE_HEX}`);
  if (!jc.constants || jc.constants.black?.hex !== BLACK_HEX) FAIL("white-black", `JSON constants.black.hex = ${jc.constants && jc.constants.black && jc.constants.black.hex}, want ${BLACK_HEX}`);
  // DTCG — RAW tree only (palette.tokens.json), under the same "constants" group as dialog-backdrop,
  // absent from the SEMANTIC tree for the same real-palette-invariant reason.
  const dtcgC = X.exportDTCG(C(ALL), {});
  const whiteLeaf = dtcgC["palette.tokens.json"].constants.white;
  const blackLeaf = dtcgC["palette.tokens.json"].constants.black;
  if (!whiteLeaf || whiteLeaf.$type !== "color" || whiteLeaf.$value.alpha !== 1 || (whiteLeaf.$value.hex || "").toUpperCase() !== WHITE_HEX)
    FAIL("white-black", `DTCG raw constants/white leaf malformed: ${JSON.stringify(whiteLeaf)}`);
  if (!blackLeaf || blackLeaf.$type !== "color" || blackLeaf.$value.alpha !== 1 || (blackLeaf.$value.hex || "").toUpperCase() !== BLACK_HEX)
    FAIL("white-black", `DTCG raw constants/black leaf malformed: ${JSON.stringify(blackLeaf)}`);
  if (dtcgC["Light_tokens.json"].constants || dtcgC["Dark_tokens.json"].constants)
    FAIL("white-black", "DTCG semantic tree (Light/Dark) must NOT carry a 'constants' key (breaks the real-palette invariant)");
  // UI3 (Figma interchange) — Primitives collection ONLY, same reasoning as DTCG above.
  const ui3 = X.exportUI3(C(ALL));
  const ui3White = ui3.collections["Color Primitives"].variables["raw/constants/white"];
  const ui3Black = ui3.collections["Color Primitives"].variables["raw/constants/black"];
  if (!ui3White || ui3White.type !== "COLOR" || ui3White.values.Base !== WHITE_HEX) FAIL("white-black", `UI3 Primitives raw/constants/white malformed: ${JSON.stringify(ui3White)}`);
  if (!ui3Black || ui3Black.type !== "COLOR" || ui3Black.values.Base !== BLACK_HEX) FAIL("white-black", `UI3 Primitives raw/constants/black malformed: ${JSON.stringify(ui3Black)}`);
  if (ui3.collections["Color Roles"].variables["constants/white"] || ui3.collections["Color Roles"].variables["constants/black"])
    FAIL("white-black", "UI3 Semantic collection must NOT carry constants/white or constants/black");
  // Tailwind @theme — two lines, outside any palette's scale/role blocks.
  if (!X.exportTailwind(C(ALL)).includes(`--color-white: ${WHITE_OKLCH};`)) FAIL("white-black", "exportTailwind missing --color-white");
  if (!X.exportTailwind(C(ALL)).includes(`--color-black: ${BLACK_OKLCH};`)) FAIL("white-black", "exportTailwind missing --color-black");
}

// ── hpg-export-tailwind (v4 @theme: oklch ramps + light-dark() semantic roles) ────────────
const tw = X.exportTailwind(C(ALL));
if (!/@theme\s*\{/.test(tw)) FAIL("tailwind", "no @theme block");
if (!/--color-[a-z0-9-]+-500:\s*oklch\(/i.test(tw)) FAIL("tailwind", "no --color-{name}-500: oklch() scale var");
if (!/--color-[a-z0-9-]+:\s*light-dark\(\s*oklch/i.test(tw)) FAIL("tailwind", "no semantic role as light-dark(oklch…)");
// a disabled palette must not appear in the Tailwind scale either (use the oneOff state)
if (X.exportTailwind(oneOff).includes(`--color-${offName}-`)) FAIL("tailwind", `disabled palette '${offName}' still in Tailwind`);

// ── hpg-export-shadcn (oklch :root/.dark token contract + @theme inline + radius) ─────────
const sc = X.exportShadcn(C(ALL));
for (const need of [":root {", ".dark {", "@theme inline {", "--radius:", "--background:", "--foreground:", "--primary:", "--destructive:"]) {
  if (!sc.includes(need)) FAIL("shadcn", `missing '${need}'`);
}
if (!/--background:\s*oklch\(/i.test(sc)) FAIL("shadcn", "tokens are not oklch()");
if (!/--color-background:\s*var\(--background\)/.test(sc)) FAIL("shadcn", "@theme inline does not map --color-* -> var(--token)");
// same token set in :root (light) and .dark (parity)
const tokset = (block) => new Set([...block.matchAll(/^\s*(--[a-z0-9-]+):/gim)].map((m) => m[1]).filter((t) => t !== "--radius"));
const rootBlock = sc.slice(sc.indexOf(":root {"), sc.indexOf(".dark {"));
const darkBlock = sc.slice(sc.indexOf(".dark {"), sc.indexOf("@theme inline {"));
const rootToks = tokset(rootBlock), darkToks = tokset(darkBlock);
if (rootToks.size === 0 || rootToks.size !== darkToks.size || [...rootToks].some((t) => !darkToks.has(t))) {
  FAIL("shadcn", `:root (${rootToks.size}) and .dark (${darkToks.size}) token sets differ`);
}
// typography + geometry props: the brand fonts fill shadcn's three family slots, and --radius is DERIVED
// from the geometry `md` corner (rem), not hard-coded — the medium corner on the M3-aligned scale.
{
  const withSys = X.exportShadcn(C(ALL), { fonts: { body: "Inter", display: "Source Serif 4", mono: "JetBrains Mono" }, radii: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 } });
  if (!withSys.includes("--radius: 0.75rem;")) FAIL("shadcn", "--radius not derived from the geometry md corner (12px → 0.75rem, M3-aligned scale)");
  if (!withSys.includes("--font-sans: 'Inter',")) FAIL("shadcn", "--font-sans not mapped from the body font");
  if (!withSys.includes("--font-serif: 'Source Serif 4',")) FAIL("shadcn", "--font-serif not mapped from the display font (quoted — digit name)");
  if (!withSys.includes("--font-mono: 'JetBrains Mono',")) FAIL("shadcn", "--font-mono not mapped from the mono font");
  // absent opts → the shadcn defaults (backward compatible)
  if (!X.exportShadcn(C(ALL)).includes("--radius: 0.625rem;") || X.exportShadcn(C(ALL)).includes("--font-sans:")) FAIL("shadcn", "no opts → default 0.625rem radius + no font vars");
}

// ── hpg-export-shadcn-baseline (REQ-040/062, #586 K1 — the pickDrivers refactor gate: exportShadcn's
//    output over three fixtures is byte-identical to a string captured BEFORE the refactor) ──────
{
  const fixture = readFileSync(new URL("./fixtures/shadcn-baseline.css", import.meta.url), "utf8");
  const section = (marker) => {
    const start = fixture.indexOf(`/* === FIXTURE: ${marker} === */`) + `/* === FIXTURE: ${marker} === */`.length + 1;
    const nextMarker = fixture.indexOf("/* === FIXTURE:", start);
    return fixture.slice(start, nextMarker === -1 ? fixture.length : nextMarker).trimEnd();
  };
  const ALL_DATA_OFF = ALL.map((p) => (/^Data \d+$/.test(p.name) ? { ...p, on: false } : p));
  const cases = [
    ["ALL", X.exportShadcn(C(ALL))],
    ["BRAND_ONLY", X.exportShadcn(C(BRAND_ONLY))],
    ["ALL_DATA_OFF", X.exportShadcn(C(ALL_DATA_OFF))],
  ];
  for (const [marker, got] of cases) {
    const want = section(marker);
    if (got.trimEnd() !== want) FAIL("shadcn-baseline", `exportShadcn(${marker}) drifted from the pre-refactor fixture`);
  }
  // AC-004: pickDrivers is the ONLY site left holding the driver-pick regex — exactly one grep hit,
  // and the exports.js source shows it sitting inside pickDrivers's own body (before exportShadcn).
  const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
  const grepHits = execSync(`git grep -n "find(/neutral|gray" src/engine || true`, { cwd: repoRoot, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  if (grepHits.length !== 1) FAIL("shadcn-baseline", `find(/neutral|gray site count = ${grepHits.length}, want 1: ${grepHits.join(" | ")}`);
  else {
    const src = readFileSync(new URL("../../src/engine/exports.js", import.meta.url), "utf8");
    const pickDriversStart = src.indexOf("export function pickDrivers(");
    const exportShadcnStart = src.indexOf("export function exportShadcn(");
    const regexAt = src.indexOf("find(/neutral|gray");
    if (pickDriversStart === -1 || exportShadcnStart === -1 || !(regexAt > pickDriversStart && regexAt < exportShadcnStart))
      FAIL("shadcn-baseline", "find(/neutral|gray site is not inside pickDrivers's own body");
  }
}

// ── hpg-export-panda (Panda CSS preset — REQ-001..006/009/042 colour half; REQ-007/008 land in K2) ──
{
  const state = C(ALL);
  const preset = X.exportPanda(state);
  if (typeof preset.name !== "string" || !preset.name.startsWith("ultimate-tokens-")) FAIL("panda", `name malformed: ${preset.name}`);
  if (!preset.theme || !preset.theme.extend || preset.theme.tokens) FAIL("panda", "theme.extend missing, or a bare theme.tokens leaked outside extend");
  const { tokens, semanticTokens } = preset.theme.extend || {};
  if (!tokens || !tokens.colors) FAIL("panda", "theme.extend.tokens.colors missing");
  if (!semanticTokens || !semanticTokens.colors) FAIL("panda", "theme.extend.semanticTokens.colors missing");

  // PF-2: every leaf is a bare { value }. Collect dotted paths -> value for tokens/semanticTokens
  // SEPARATELY (Panda flattens each namespace by dot path, PF-4 — REQ-005's coexistence proof).
  const COLOR_RE = /^oklch\([^)]*\)$/;
  const collectLeaves = (node, path, out) => {
    if (node && typeof node === "object" && !Array.isArray(node)) {
      const keys = Object.keys(node);
      if (keys.length === 1 && keys[0] === "value") { out[path] = node.value; return; }
      for (const k of keys) collectLeaves(node[k], path ? `${path}.${k}` : k, out);
    } else FAIL("panda", `non-leaf, non-object value at ${path}`);
  };
  const rawLeaves = {}; collectLeaves(tokens, "", rawLeaves); delete rawLeaves[""];
  const semLeaves = {}; collectLeaves(semanticTokens, "", semLeaves); delete semLeaves[""];

  for (const [path, v] of Object.entries(rawLeaves)) {
    if (typeof v !== "string" || (!COLOR_RE.test(v) && v !== "transparent")) FAIL("panda", `raw leaf ${path} = ${JSON.stringify(v)} not oklch()/transparent`);
  }
  for (const [path, v] of Object.entries(semLeaves)) {
    if (!v || typeof v !== "object" || typeof v.base !== "string" || typeof v._dark !== "string") FAIL("panda", `semantic leaf ${path} not {base,_dark} strings: ${JSON.stringify(v)}`);
    else {
      if (!COLOR_RE.test(v.base) && v.base !== "transparent") FAIL("panda", `semantic leaf ${path}.base not oklch(): ${v.base}`);
      if (!COLOR_RE.test(v._dark) && v._dark !== "transparent") FAIL("panda", `semantic leaf ${path}._dark not oklch(): ${v._dark}`);
    }
  }
  // no flat path emitted twice across the two maps (tokens vs semanticTokens).
  const rawPaths = new Set(Object.keys(rawLeaves));
  for (const p of Object.keys(semLeaves)) if (rawPaths.has(p)) FAIL("panda", `path ${p} emitted under both tokens and semanticTokens`);

  // per-enabled-palette leaf counts: 25 stops + 11 scrims + 8 prime (7 + DEFAULT) raw; 53 semantic.
  const derived = X.derivedAll(state);
  for (const p of derived) {
    const rawForP = Object.keys(rawLeaves).filter((k) => k.startsWith(`colors.${p.n}.`));
    if (rawForP.length !== 25 + 11 + 8) FAIL("panda", `colors.${p.n} raw leaf count = ${rawForP.length}, want 44`);
    const semForP = Object.keys(semLeaves).filter((k) => k.startsWith(`colors.${p.n}.`));
    if (semForP.length !== 53) FAIL("panda", `colors.${p.n} semantic leaf count = ${semForP.length}, want 53`);
  }
  for (const k of ["white", "black", "backdrop"]) if (!(`colors.constant.${k}` in rawLeaves)) FAIL("panda", `colors.constant.${k} missing`);

  // EX-1/EX-2 (normative literal spot-checks) — fed the SAME resolved state the drawer/every other
  // export path uses (stateOf(defaultDocument())), per the SPEC's Examples header: calling derivedAll
  // on a bare C(ALL)-shaped fixture skips the group chroma resolver and renders different numbers.
  // #647 re-capture: the five colour literals below moved when okhslStops started honouring a
  // palette's skew and lift on the perceptual ramp (Primary and Neutral both ship skew -20), so every
  // value derived from their ramp shifted. Re-pinned here AND in the SPEC's own Examples section in the
  // same change, so the normative text and this mirror cannot drift apart. The prime ladder, on-colors,
  // data-1 and constant.backdrop did not move.
  // #681 re-capture (U1, Q2 (b)): Primary's prime.prime/.brightest/.dimmest moved AGAIN — Primary's
  // DEFAULT_PALETTES entry now carries `anchor: "#0C5DCC"` (today's stop-550 hex), so its `prime` step
  // renders that hex verbatim instead of deriveKeyColor's cusp identity, and the other six ladder
  // rungs bend around the anchor's own OKHSL l/s/h instead of the cusp's. Re-pinned to the anchor's
  // own oklch (independently verified: hexToRgb("#0C5DCC") -> oklch(0.504 0.1867 258.99) by a
  // from-scratch sRGB->OKLab->OKLCH conversion, not by reading this pipeline's own output back). The
  // ramp stops (500/050/950/scrim) and every OTHER default family's prime are untouched by U1 — only
  // Primary's row happens to be this file's literal spot check.
  //
  // #681 re-capture (U2): the RAMP's own stop 500 moved too — model.mjs's projectView and exports.js's
  // derivePalette were fixed to actually forward `anchor` into paletteStops (a "subset-object gap":
  // they built narrowed object literals for the engine call that silently dropped the new field, so
  // the ramp itself had been silently ignoring `anchor` all along, unlike prime.mjs which U1 already
  // wired correctly). With that fixed, colors.primary.500 now equals colors.primary.prime.prime
  // exactly (both read the SAME verbatim anchor hex #0C5DCC, in-window per RAMP_L_MIN/MAX so it is
  // never clamped) — the two were coincidentally different literals before this fix, now the SAME by
  // construction (C3's own claim). scrim.300 tracks 500. neutral.500 moved (Neutral also carries an
  // anchor). The accent-role semantic tokens (DEFAULT/hover, at ramp stops 550/450/650/350 — NOT 500,
  // so still genuinely distinct from the anchor) and data-1's own accent moved with the ramp shape.
  // on-primary._dark ALSO moved (black -> white): #662's achromatic-fallback `pick()` now finds
  // Primary's own dark ramp end clears AA against the anchor-pinned 450 fill, so it no longer needs
  // the black constant. on-surface/backdrop/prime.brightest/prime.dimmest (no accent role reads them)
  // did not move. Every literal below independently re-verified against exports.mjs's own resolution
  // ladder output (this file's normal spot-check discipline — not re-derived by hand).
  //
  // #681 re-capture (U2, review pif-u2-review-1.md F2): the anchored branches' saturation basis now
  // lerps from the anchor's own measured chroma toward the group-driven ramp target as a stop moves
  // away from 500 (see okhslStopsAnchored's own comment), so every OFF-pivot stop's chroma moved a
  // second time — primary.DEFAULT/.hover (stops 550/450) and data-1.DEFAULT (also off-pivot). EX-1's
  // raw ramp literals (500/50/950/scrim.300, all either the verbatim anchor or undamped by chroma)
  // and on-primary/on-surface (no chroma dependence) are UNCHANGED — independently re-verified.
  //
  // #681 re-capture (U2 repair pass, re-diagnosis Findings 1+2): the anchored branches' chroma now
  // routes through U3's own chromaEnvelope (verbatim copy, keyed on liftStop) instead of the interim
  // group-target lerp above, and the anchored tone construction now composes toneAt's curve/tension/
  // vibrancy/hueSpace with the pivot instead of a straight lerp (F4). Both only move OFF-pivot stops
  // (envelope(500)=1 exactly, and vibrancy=0's default perceptual-mode construction reduces to the
  // prior linear-curve build).
  //
  // #681 re-capture (U2 repair pass, Q-U2-5 ruled, revision 17): Finding 1's literal, unconditional
  // anchor-value basis (immediately above) broke REQ-002 — re-ruled to a BLEND (chromaEnvelope stays
  // verbatim, but its basis input shades from the anchor's own chroma at the pivot to `rampChroma` at
  // the ramp's ends, see paletteStopsAnchored/okhslStopsAnchored's own header comments). Numerically
  // this lands back at (or very near) the F2-blend values two re-captures above, since both blend
  // toward the same group target — only primary.DEFAULT/.hover (550/450) and data-1.DEFAULT moved;
  // EX-1's raw ramp literals and on-primary/on-surface are UNCHANGED — independently re-verified.
  //
  // #681 re-capture (U2 repair pass, addendum 2, u2-p2-brief.md): the blend's own weight now keys on
  // `liftStop` (`anchorChromaBasis`, see its own header comment above `chromaEnvelope`), never
  // `anchorWarp`'s skew-warped `w` — a local construction the ruling retired. Primary carries skew -20,
  // so its own DEFAULT literal (stop 550) moved a hair from the anchorWarp-keyed capture immediately
  // above; every other literal is unchanged — independently re-verified.
  //
  // #681 re-capture (U2 review pass 2, R6 -- toneAt piecewise-affine remap replacing anchorLerp's
  // per-side double-S, tonal.js's own header comment): stop 550/450 sit closer to toneAt's own
  // steepest point now, not the double-S's flattest part, so Primary's own DEFAULT and hover literals
  // (skew -20, stops 550/450) moved again. on-primary, on-surface and data-1.DEFAULT are unchanged --
  // independently re-verified. R2's smoothstep easing on the chroma blend weight did not move any of
  // these four fields at default vibrancy/damp (near-pivot chroma stays within rounding here).
  //
  // #681 U4 re-capture (integration of U6 onto U1's anchor branch, prime.mjs rewritten per U1's own
  // "provisional OKHSL fix; U6's L*-domain equal-compress rewrite replaces this whole mechanism"):
  // `prime.brightest`/`.dimmest` moved again — the ladder now builds in CIE L* around the anchor's own
  // measured L*/CAM16 hue/chroma (not the anchor's OKHSL l/s/h U1's provisional construction read),
  // equal-compress at the window bound (Primary's anchor sits well inside [PRIME_L_MIN, PRIME_L_MAX],
  // so this ladder is NOT window-clamped). `.prime` itself is unchanged (REQ-056's verbatim-anchor
  // identity holds regardless of ladder construction). Every ramp stop (500/50/950/scrim/neutral.500)
  // and `.prime` are independently re-verified UNCHANGED from the U3 merge — U6 touches only
  // src/engine/prime.mjs, never tonal.js/the ramp. Values independently re-verified against
  // exports.mjs's own resolution ladder output (this file's normal spot-check discipline — not
  // re-derived by hand), out-of-lane reporting on the SPEC's own stale EX-1 mirror carried over from
  // U6's own paragraph (`docs/spec/spec-panda-park-ui-exports.md:419-424`, see `.sdlc/handoffs/pif-u6.md`).
  const ddState = stateOf(defaultDocument());
  const ddPreset = X.exportPanda(ddState);
  const ddRaw = ddPreset.theme.extend.tokens.colors;
  const ddSem = ddPreset.theme.extend.semanticTokens.colors;
  if (ddRaw.primary["500"].value !== "oklch(0.504 0.1867 258.99)") FAIL("panda", `EX-1 colors.primary.500 = ${ddRaw.primary["500"].value}`);
  if (ddRaw.primary["50"].value !== "oklch(1 0 0)") FAIL("panda", `EX-1 colors.primary.50 = ${ddRaw.primary["50"].value}`);
  if (ddRaw.primary["950"].value !== "oklch(0.1763 0.014 258.36)") FAIL("panda", `EX-1 colors.primary.950 = ${ddRaw.primary["950"].value}`);
  if (ddRaw.neutral["500"].value !== "oklch(0.5056 0.0552 267.76)") FAIL("panda", `EX-1 colors.neutral.500 = ${ddRaw.neutral["500"].value}`);
  if (ddRaw.primary.scrim["300"].value !== "oklch(0.504 0.1867 258.99 / 30%)") FAIL("panda", `EX-1 colors.primary.scrim.300 = ${ddRaw.primary.scrim["300"].value}`);
  if (ddRaw.primary.prime.prime.value !== "oklch(0.504 0.1867 258.99)") FAIL("panda", `EX-1 colors.primary.prime.prime = ${ddRaw.primary.prime.prime.value}`);
  if (ddRaw.primary.prime.brightest.value !== "oklch(0.733 0.1374 264.49)") FAIL("panda", `EX-1 colors.primary.prime.brightest = ${ddRaw.primary.prime.brightest.value}`);
  if (ddRaw.primary.prime.dimmest.value !== "oklch(0.2669 0.1023 258.76)") FAIL("panda", `EX-1 colors.primary.prime.dimmest = ${ddRaw.primary.prime.dimmest.value}`);
  if (JSON.stringify(ddRaw.primary.prime.DEFAULT) !== JSON.stringify(ddRaw.primary.prime.prime)) FAIL("panda", "EX-1 colors.primary.prime.DEFAULT != .prime");
  if (ddRaw.constant.backdrop.value !== "oklch(0 0 0 / 80%)") FAIL("panda", `EX-1 colors.constant.backdrop = ${ddRaw.constant.backdrop.value}`);
  if (JSON.stringify(ddSem.primary.DEFAULT.value) !== JSON.stringify({ base: "oklch(0.4669 0.1671 258.98)", _dark: "oklch(0.5504 0.1924 258.96)" }))
    FAIL("panda", `EX-2 colors.primary.DEFAULT = ${JSON.stringify(ddSem.primary.DEFAULT.value)}`);
  if (JSON.stringify(ddSem.primary.hover.value) !== JSON.stringify({ base: "oklch(0.3971 0.1239 258.91)", _dark: "oklch(0.6419 0.1561 259.24)" }))
    FAIL("panda", `EX-2 colors.primary.hover = ${JSON.stringify(ddSem.primary.hover.value)}`);
  if (JSON.stringify(ddSem.primary["on-primary"].value) !== JSON.stringify({ base: "oklch(1 0 0)", _dark: "oklch(1 0 0)" }))
    FAIL("panda", `EX-2 colors.primary.on-primary = ${JSON.stringify(ddSem.primary["on-primary"].value)}`);
  if (JSON.stringify(ddSem.neutral["on-surface"].value) !== JSON.stringify({ base: "oklch(0.1774 0.0044 264.46)", _dark: "oklch(1 0 0)" }))
    FAIL("panda", `EX-2 colors.neutral.on-surface = ${JSON.stringify(ddSem.neutral["on-surface"].value)}`);
  if (Object.keys(ddSem.primary).length !== 53) FAIL("panda", `EX-2 expected 53 keys under semanticTokens.colors.primary, got ${Object.keys(ddSem.primary).length}`);
  if (Object.keys(ddSem).length !== 16) FAIL("panda", `EX-2 expected 16 palette groups, got ${Object.keys(ddSem).length}`);
  if (!ddSem["data-1"] || ddSem["data-1"].DEFAULT.value.base !== "oklch(0.5194 0.2328 272.25)") FAIL("panda", `EX-2 data-1.DEFAULT.base = ${ddSem["data-1"] && ddSem["data-1"].DEFAULT.value.base}`);

  // disabled palette absent from both trees.
  const disabledPanda = X.exportPanda(oneOff);
  if (offName in disabledPanda.theme.extend.tokens.colors) FAIL("panda", `disabled palette '${offName}' still in tokens.colors`);
  if (offName in disabledPanda.theme.extend.semanticTokens.colors) FAIL("panda", `disabled palette '${offName}' still in semanticTokens.colors`);

  // AC-005/REQ-043: theme-independent — exportPanda never reads state.theme, so the default
  // document's preset is byte-identical whether STATE.theme (not the doc, which stateOf never
  // copies theme off of) is light, dark, or auto.
  for (const t of ["light", "dark"]) {
    const themed = X.exportPanda({ ...ddState, theme: t });
    if (JSON.stringify(themed) !== JSON.stringify(ddPreset)) FAIL("panda", `REQ-043 preset differs under theme:${t} vs theme:auto`);
  }

  // module string (EX-7): fixed header, valid JS, JSON.parse(body) deep-equals exportPanda(state).
  const mod = X.exportPandaModule(preset);
  if (!mod.includes("/* Panda CSS preset, generated by Ultimate Tokens.")) FAIL("panda", "module header text wrong");
  if (!mod.startsWith("/* ultimate-tokens export schema ")) FAIL("panda", "module missing the leading schema-stamp comment (ticket #606)");
  if (!mod.includes("export default {")) FAIL("panda", "module missing 'export default {'");
  const bodyStart = mod.indexOf("export default ") + "export default ".length;
  const body = mod.slice(bodyStart, mod.lastIndexOf(";"));
  let parsed = null;
  try { parsed = JSON.parse(body); } catch (e) { FAIL("panda", `module body not valid JSON: ${e.message}`); }
  if (parsed && JSON.stringify(parsed) !== JSON.stringify(preset)) FAIL("panda", "module JSON does not deep-equal exportPanda(state)");

  // AC-002 (REQ-007/008, K2 of #587): without opts.type/opts.geometry, the type/geometry blocks
  // are absent and the colour output is byte-identical to the with-opts colour output.
  if (preset.theme.extend.tokens.fonts) FAIL("panda", "tokens.fonts present without opts.type");
  if (preset.theme.extend.textStyles) FAIL("panda", "textStyles present without opts.type");
  if (preset.theme.extend.tokens.radii) FAIL("panda", "tokens.radii present without opts.geometry");
  if (preset.theme.extend.tokens.spacing) FAIL("panda", "tokens.spacing present without opts.geometry");
  if (preset.theme.extend.tokens.borderWidths) FAIL("panda", "tokens.borderWidths present without opts.geometry");

  const typeScl = typeScale(DEFAULT_TYPE);
  const geomScl = geomScale({});
  const withOpts = X.exportPanda(ddState, { type: typeScl, geometry: geomScl });
  if (JSON.stringify(withOpts.theme.extend.tokens.colors) !== JSON.stringify(ddRaw)) FAIL("panda", "EX-3 colour output changed by opts.type/opts.geometry");
  if (JSON.stringify(withOpts.theme.extend.semanticTokens) !== JSON.stringify(ddPreset.theme.extend.semanticTokens)) FAIL("panda", "EX-3 semanticTokens changed by opts.type/opts.geometry");

  // EX-3 (NORMATIVE, panda type + geometry).
  const wf = withOpts.theme.extend.tokens.fonts;
  if (!wf || wf.body.value !== "'Inter', sans-serif") FAIL("panda", `EX-3 tokens.fonts.body = ${wf && wf.body.value}`);
  if (!wf || wf.display.value !== "'Inter Tight', sans-serif") FAIL("panda", `EX-3 tokens.fonts.display = ${wf && wf.display.value}`);
  const bodyMd = withOpts.theme.extend.textStyles.body.md.value;
  const expectBodyMd = { fontFamily: "{fonts.body}", fontSize: "16px", lineHeight: "24px", letterSpacing: "0px", fontWeight: 440, textTransform: "none" };
  if (JSON.stringify(bodyMd) !== JSON.stringify(expectBodyMd)) FAIL("panda", `EX-3 textStyles.body.md = ${JSON.stringify(bodyMd)}`);
  if (JSON.stringify(withOpts.theme.extend.textStyles.body.DEFAULT.value) !== JSON.stringify(expectBodyMd)) FAIL("panda", "EX-3 textStyles.body.DEFAULT != .md");
  const wr = withOpts.theme.extend.tokens.radii;
  if (!wr || wr.md.value !== "12px") FAIL("panda", `EX-3 tokens.radii.md = ${wr && wr.md.value}`);
  if (!wr || wr.full.value !== "9999px") FAIL("panda", `EX-3 tokens.radii.full = ${wr && wr.full.value}`);
  const wsp = withOpts.theme.extend.tokens.spacing;
  if (!wsp || wsp["4"].value !== "16px") FAIL("panda", `EX-3 tokens.spacing.4 = ${wsp && wsp["4"].value}`);
  const wbw = withOpts.theme.extend.tokens.borderWidths;
  if (!wbw || wbw.thin.value !== "1px") FAIL("panda", `EX-3 tokens.borderWidths.thin = ${wbw && wbw.thin.value}`);
  // every voice's textStyle carries sm/md/lg + DEFAULT, fontFamily referencing its resolved role.
  const VOICE_COUNT = Object.keys(typeScl.categories).length;
  if (VOICE_COUNT !== 15) FAIL("panda", `expected 15 type voices, got ${VOICE_COUNT}`);
  for (const [voice, roleOf] of Object.entries(typeScl.roleOf)) {
    const key = voice.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const st = withOpts.theme.extend.textStyles[key];
    if (!st || !st.sm || !st.md || !st.lg || !st.DEFAULT) FAIL("panda", `textStyles.${key} missing sm/md/lg/DEFAULT`);
    if (st && st.md.value.fontFamily !== `{fonts.${roleOf}}`) FAIL("panda", `textStyles.${key}.md.fontFamily = ${st.md.value.fontFamily}, want {fonts.${roleOf}}`);
  }
}

// ── hpg-export-radix (Radix preset — REQ-020..028/041/061; issue #588's corrected 1..8) ────
{
  const parseOklch = (s) => {
    if (s === "transparent") return { rgb: null, a: 0 };
    const m = /^oklch\(([-\d.]+) ([-\d.]+) ([-\d.]+)(?: \/ ([-\d.]+)%)?\)$/.exec(s);
    if (!m) return null;
    const [, L, C, H, a] = m;
    return { rgb: oklchToRgb(Number(L), Number(C), Number(H)), a: a !== undefined ? Number(a) / 100 : 1 };
  };

  // The ratified 1..8 raw-stop table (docs/reference/data/radix-projection.json), redeclared here
  // independently of exports.js's own RADIX_RAW_STEPS — pins the EXACT stop number per step, not
  // just monotone direction (a same-direction off-by-one, e.g. step 6 duplicating step 5's stop,
  // still reads monotone but is wrong).
  const RATIFIED_RAW_STEPS = [
    { step: 1, light: 100, dark: 900 },
    { step: 2, light: 125, dark: 875 },
    { step: 3, light: 150, dark: 850 },
    { step: 4, light: 175, dark: 825 },
    { step: 5, light: 200, dark: 800 },
    { step: 6, light: 250, dark: 750 },
    { step: 7, light: 300, dark: 700 },
    { step: 8, light: 350, dark: 650 },
  ];

  const state = C(ALL);
  const preset = X.exportRadix(state);
  if (typeof preset.name !== "string" || !preset.name.startsWith("ultimate-tokens-radix-")) FAIL("radix", `name malformed: ${preset.name}`);
  if (!preset.theme || !preset.theme.extend || !preset.theme.extend.semanticTokens) FAIL("radix", "theme.extend.semanticTokens missing");
  const { colors, radii } = preset.theme.extend.semanticTokens || {};
  if (!colors) FAIL("radix", "semanticTokens.colors missing");
  if (!radii || !radii.l1 || !radii.l2 || !radii.l3) FAIL("radix", "semanticTokens.radii.l1..l3 missing");
  if (radii) {
    if (radii.l1.value !== "{radii.xs}") FAIL("radix", `radii.l1 = ${radii.l1.value}`);
    if (radii.l2.value !== "{radii.sm}") FAIL("radix", `radii.l2 = ${radii.l2.value}`);
    if (radii.l3.value !== "{radii.md}") FAIL("radix", `radii.l3 = ${radii.l3.value}`);
  }
  if (preset.theme.extend.textStyles) FAIL("radix", "textStyles must not be emitted in v1 (H-2)");

  const derived = X.derivedAll(state);
  const APPEARANCE_KEYS = {
    solid: ["bg.DEFAULT", "bg.hover", "fg.DEFAULT"],
    subtle: ["bg.DEFAULT", "bg.hover", "bg.active", "fg.DEFAULT"],
    surface: ["bg.DEFAULT", "bg.active", "border.DEFAULT", "border.hover", "fg.DEFAULT"],
    outline: ["bg.hover", "bg.active", "border.DEFAULT", "fg.DEFAULT"],
    plain: ["bg.hover", "bg.active", "fg.DEFAULT"],
  };
  const dig = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
  for (const p of derived) {
    const g = colors[p.n];
    if (!g) { FAIL("radix", `colors.${p.n} missing`); continue; }
    for (let k = 1; k <= 12; k++) {
      const v = g[String(k)];
      if (!v || typeof v.value.base !== "string" || typeof v.value._dark !== "string") FAIL("radix", `colors.${p.n}.${k} not {base,_dark}`);
      const a = g[`a${k}`];
      if (!a || typeof a.value.base !== "string" || typeof a.value._dark !== "string") FAIL("radix", `colors.${p.n}.a${k} not {base,_dark}`);
    }
    for (const [grp, keys] of Object.entries(APPEARANCE_KEYS)) {
      for (const path of keys) {
        const v = dig(g[grp], path);
        if (!v || typeof v.value !== "string" || !v.value.startsWith(`{colors.${p.n}.`)) FAIL("radix", `colors.${p.n}.${grp}.${path} not an alias ref: ${v && v.value}`);
      }
    }
    if (!g["on-accent"] || typeof g["on-accent"].value.base !== "string") FAIL("radix", `colors.${p.n}.on-accent missing`);
    if (!g.prime || typeof g.prime.value.base !== "string" || g.prime.value._dark !== undefined) FAIL("radix", `colors.${p.n}.prime malformed (mode-independent, base only): ${JSON.stringify(g.prime)}`);

    // exact-value pin (reviewer finding on #588's radix gate): each of steps 1..8 must read the
    // EXACT ratified stop number, not merely a monotone-in-the-right-direction neighbour — deep-equal
    // the emitted leaf's parsed rgb against derivedAll's own byStop.get(expectedStop) for that step,
    // per palette (cheap enough to run for all, not just one representative).
    for (const { step, light, dark } of RATIFIED_RAW_STEPS) {
      const parsedBase = parseOklch(g[String(step)].value.base);
      const parsedDark = parseOklch(g[String(step)].value._dark);
      const wantBase = p.byStop.get(light);
      const wantDark = p.byStop.get(dark);
      if (!parsedBase || !wantBase || parsedBase.rgb.some((c, i) => Math.abs(c - wantBase[i]) > 1)) {
        FAIL("radix", `colors.${p.n}.${step}.base rgb ${parsedBase && parsedBase.rgb} != byStop.get(${light}) ${wantBase} (exact-stop pin)`);
      }
      if (!parsedDark || !wantDark || parsedDark.rgb.some((c, i) => Math.abs(c - wantDark[i]) > 1)) {
        FAIL("radix", `colors.${p.n}.${step}._dark rgb ${parsedDark && parsedDark.rgb} != byStop.get(${dark}) ${wantDark} (exact-stop pin)`);
      }
    }
  }

  // REQ-025: accent/gray are self-contained deep copies of the driver groups, ref-rewritten.
  const { primary, neutral, danger } = X.pickDrivers(derived);
  const rewriteBack = (json, toN, fromN) => json.split(`{colors.${toN}.`).join(`{colors.${fromN}.`);
  if (JSON.stringify(colors[primary.n]) !== rewriteBack(JSON.stringify(colors.accent), "accent", primary.n)) FAIL("radix", "colors.accent is not primary's group with refs rewritten");
  if (JSON.stringify(colors[neutral.n]) !== rewriteBack(JSON.stringify(colors.gray), "gray", neutral.n)) FAIL("radix", "colors.gray is not neutral's group with refs rewritten");
  if (X.isDataPalette({ name: primary.name }) || X.isDataPalette({ name: neutral.name })) FAIL("radix", "a data palette was picked as accent/gray driver");

  // REQ-026: globals + error, present and resolving to an existing leaf.
  if (colors.fg?.default?.value !== "{colors.gray.12}") FAIL("radix", `fg.default = ${colors.fg?.default?.value}`);
  if (colors.fg?.muted?.value !== "{colors.gray.11}") FAIL("radix", `fg.muted = ${colors.fg?.muted?.value}`);
  if (colors.fg?.subtle?.value !== "{colors.gray.10}") FAIL("radix", `fg.subtle = ${colors.fg?.subtle?.value}`);
  if (colors.canvas?.value !== "{colors.gray.1}") FAIL("radix", `canvas = ${colors.canvas?.value}`);
  if (colors.border?.value !== "{colors.gray.7}") FAIL("radix", `border = ${colors.border?.value}`);
  if (colors.bg?.subtle?.value !== "{colors.gray.2}") FAIL("radix", `bg.subtle = ${colors.bg?.subtle?.value}`);
  if (!colors.error || typeof colors.error.value !== "string" || !colors.error.value.startsWith("{colors.")) FAIL("radix", `error = ${colors.error && colors.error.value}`);
  for (const [k, v] of [["fg.default", colors.fg?.default], ["fg.muted", colors.fg?.muted], ["fg.subtle", colors.fg?.subtle], ["canvas", colors.canvas], ["border", colors.border], ["bg.subtle", colors.bg?.subtle], ["error", colors.error]]) {
    const ref = v && v.value;
    const m = ref && /^\{colors\.([\w-]+)\.([\w-]+)\}$/.exec(ref);
    if (!m || !colors[m[1]] || !colors[m[1]][m[2]]) FAIL("radix", `${k} = ${ref} does not resolve to an emitted leaf`);
  }

  // REQ-022 anti-tautology: a{k}'s alpha value, composited over white (base)/black (_dark) by
  // THIS TEST's own arithmetic (oklchToRgb, never X.alphaProject), is within 1/255 of the emitted
  // solid {k}, per channel.
  const primaryGroup = colors[primary.n];
  for (let k = 1; k <= 12; k++) {
    for (const [mode, bg] of [["base", [255, 255, 255]], ["_dark", [0, 0, 0]]]) {
      const a = parseOklch(primaryGroup[`a${k}`].value[mode]);
      const solid = parseOklch(primaryGroup[String(k)].value[mode]);
      if (!a || !solid) { FAIL("radix", `a${k}.${mode} or solid ${k}.${mode} failed to parse`); continue; }
      if (a.a === 0) continue; // transparent — nothing to composite
      const composited = a.rgb.map((c, i) => Math.round(a.a * c + (1 - a.a) * bg[i]));
      for (let i = 0; i < 3; i++) {
        if (Math.abs(composited[i] - solid.rgb[i]) > 1) FAIL("radix", `a${k}.${mode} composited over ${mode === "base" ? "white" : "black"} = ${composited} not within 1/255 of solid ${k} = ${solid.rgb}`);
      }
    }
  }

  // gray luminance monotone: default document's gray, base non-increasing / _dark non-decreasing
  // over steps 1..12 (the REQ-061 control).
  const ddState = stateOf(defaultDocument());
  const ddDerived = X.derivedAll(ddState);
  const ddDrivers = X.pickDrivers(ddDerived);
  const ddRadixPreset = X.exportRadix(ddState);
  const ddGray = ddRadixPreset.theme.extend.semanticTokens.colors[ddDrivers.neutral.n];
  let prevBase = Infinity, prevDark = -Infinity;
  for (let k = 1; k <= 12; k++) {
    const base = parseOklch(ddGray[String(k)].value.base);
    const dark = parseOklch(ddGray[String(k)].value._dark);
    const lumBase = X.relLumExp(base.rgb), lumDark = X.relLumExp(dark.rgb);
    if (lumBase > prevBase + 1e-6) FAIL("radix", `gray base luminance not monotone non-increasing at step ${k}`);
    if (lumDark < prevDark - 1e-6) FAIL("radix", `gray _dark luminance not monotone non-decreasing at step ${k}`);
    prevBase = lumBase; prevDark = lumDark;
  }

  // disabled palette absent; data palettes present but never accent/gray.
  const disabledRadix = X.exportRadix(oneOff);
  if (offName in disabledRadix.theme.extend.semanticTokens.colors) FAIL("radix", `disabled palette '${offName}' still in colors`);
  if (!colors["data-1"]) FAIL("radix", "data-1 missing from colors (REQ-028: data palettes emitted like any other)");

  // AC-005/REQ-043: theme-independent — exportRadix never reads state.theme, so the default
  // document's preset is byte-identical whether STATE.theme (not the doc, which stateOf never
  // copies theme off of) is light, dark, or auto.
  for (const t of ["light", "dark"]) {
    const themedRadix = X.exportRadix({ ...ddState, theme: t });
    if (JSON.stringify(themedRadix) !== JSON.stringify(ddRadixPreset)) FAIL("radix", `REQ-043 preset differs under theme:${t} vs theme:auto`);
  }

  // no-driver sentinel (mirrors exportShadcn).
  const sentinel = X.exportRadix(C([]));
  if (typeof sentinel !== "string" || !sentinel.startsWith("/* Radix export needs")) FAIL("radix", `no-driver sentinel wrong: ${JSON.stringify(sentinel)}`);
  if (X.exportRadixModule(sentinel) !== sentinel) FAIL("radix", "exportRadixModule must pass the sentinel through unwrapped");

  // module string: header, valid JSON, deep-equals exportRadix(state).
  const mod = X.exportRadixModule(preset);
  if (!mod.includes("/* Radix preset, generated by Ultimate Tokens.")) FAIL("radix", "module header text wrong");
  if (!mod.startsWith("/* ultimate-tokens export schema ")) FAIL("radix", "module missing the leading schema-stamp comment (ticket #606)");
  const bodyStart = mod.indexOf("export default ") + "export default ".length;
  const body = mod.slice(bodyStart, mod.lastIndexOf(";"));
  let parsedMod = null;
  try { parsedMod = JSON.parse(body); } catch (e) { FAIL("radix", `module body not valid JSON: ${e.message}`); }
  if (parsedMod && JSON.stringify(parsedMod) !== JSON.stringify(preset)) FAIL("radix", "module JSON does not deep-equal exportRadix(state)");
}

// ── radix-keys-drift (I4, ticket #637; rewritten for #630) — RESERVED_ALIAS_KEYS is the ONE source
//    of truth for the non-palette keys exportRadix writes into semanticTokens.colors. Under the #630
//    rule a colliding palette is emitted under `<slug>-palette`, so "subtract the palette slugs" no
//    longer isolates the aliases; instead: the 7 reserved keys are present verbatim and in order, and
//    EVERY other key is either a palette slug or that palette's radixPaletteKey. An 8th alias key
//    added without updating the constant lands in neither bucket and goes red here. ───────────────
{
  const check = (st, label) => {
    const derived = X.derivedAll(st);
    const slugs = derived.map((p) => p.n);
    const expectKeys = new Set(X.radixPaletteKeys(slugs));
    const keys = Object.keys(X.exportRadix(st).theme.extend.semanticTokens.colors);
    const aliasKeys = keys.filter((k) => X.RESERVED_ALIAS_KEYS.includes(k));
    if (JSON.stringify(aliasKeys) !== JSON.stringify(X.RESERVED_ALIAS_KEYS)) FAIL("radix-keys-drift", `${label}: reserved keys ${JSON.stringify(aliasKeys)} != RESERVED_ALIAS_KEYS ${JSON.stringify(X.RESERVED_ALIAS_KEYS)} (verbatim, in order)`);
    const stray = keys.filter((k) => !X.RESERVED_ALIAS_KEYS.includes(k) && !expectKeys.has(k));
    if (stray.length) FAIL("radix-keys-drift", `${label}: keys ${JSON.stringify(stray)} are neither a reserved alias key nor a palette's radixPaletteKey`);
    const missing = [...expectKeys].filter((k) => !keys.includes(k));
    if (missing.length) FAIL("radix-keys-drift", `${label}: palette keys ${JSON.stringify(missing)} missing from the export`);
  };
  check(stateOf(defaultDocument()), "default document");
  check(C([...BRAND_ONLY, { name: "Accent", hue: 40, chroma: 60, skew: 0, lift: 0, on: true }]), "with a colliding 'Accent' palette");
}

// ── radix-alias-collision (#630) — a palette whose slug equals a reserved alias key is emitted
//    under `<slug>-palette` (suffix repeated until unique against the reserved set AND the other
//    palettes' slugs; order-independent), the 7 alias keys stay verbatim, and every `{colors.X.N}`
//    reference in the document resolves. Negative control: against the pre-fix engine (797173e)
//    the ladder is absent (alias overwrote it) and `error` is `{colors.error.9}`, a self-reference.
{
  const mk = (name, hue) => ({ name, hue, chroma: 60, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true });
  // stock "Danger" is dropped from the fixture so pickDrivers' danger regex lands on "Error".
  const NO_DANGER = BRAND_ONLY.filter((p) => p.name !== "Danger");
  const colliding = C([...NO_DANGER, mk("Accent", 40), mk("Error", 350)]);
  const preset = X.exportRadix(colliding);
  const colors = typeof preset === "string" ? {} : preset.theme.extend.semanticTokens.colors;
  const isLadder = (g) => !!g && [...Array(12)].every((_, i) => g[String(i + 1)] && g[String(i + 1)].value && typeof g[String(i + 1)].value.base === "string" && g[`a${i + 1}`]);
  const { primary, danger } = X.pickDrivers(X.derivedAll(colliding));
  if (!danger || danger.n !== "error") FAIL("radix-collision", `fixture: danger driver should be the 'error' palette, got ${danger && danger.n}`);
  if (!isLadder(colors["accent-palette"])) FAIL("radix-collision", `colors["accent-palette"] must hold the 'Accent' palette's full 12-step ladder (keys: ${JSON.stringify(Object.keys(colors["accent-palette"] || {}))})`);
  if (!isLadder(colors["error-palette"])) FAIL("radix-collision", `colors["error-palette"] must hold the 'Error' palette's full 12-step ladder`);
  if (!isLadder(colors.accent)) FAIL("radix-collision", "colors.accent must still be the primary driver's clone (a full ladder)");
  if (JSON.stringify(colors.accent) !== JSON.stringify(X.exportRadix(C([...BRAND_ONLY])).theme.extend.semanticTokens.colors.accent)) FAIL("radix-collision", "colors.accent (the driver clone) must be unaffected by a colliding 'Accent' palette");
  const errRef = colors.error && colors.error.value;
  if (errRef !== "{colors.error-palette.9}") FAIL("radix-collision", `colors.error must reference the renamed danger key, got ${JSON.stringify(errRef)}${errRef === "{colors.error.9}" ? " (a dangling self-reference)" : ""}`);
  // internal refs of the renamed group point at the renamed key, not the alias.
  const solidBg = colors["accent-palette"] && colors["accent-palette"].solid && colors["accent-palette"].solid.bg.DEFAULT.value;
  if (solidBg !== "{colors.accent-palette.9}") FAIL("radix-collision", `accent-palette.solid.bg.DEFAULT must be {colors.accent-palette.9}, got ${JSON.stringify(solidBg)}`);
  // every {colors.X.leaf} reference in the whole document resolves to an existing leaf.
  const unresolved = [];
  const walkRefs = (node, path) => {
    if (typeof node === "string") {
      const m = /^\{colors\.([^.}]+)\.([^}]+)\}$/.exec(node);
      if (m) {
        const g = colors[m[1]];
        if (!g || !g[m[2]] || g[m[2]].value === undefined) unresolved.push(`${path} -> ${node}`);
      }
      return;
    }
    if (node && typeof node === "object") for (const k of Object.keys(node)) walkRefs(node[k], `${path}.${k}`);
  };
  walkRefs(colors, "colors");
  if (unresolved.length) FAIL("radix-collision", `unresolved {colors.…} refs: ${unresolved.slice(0, 3).join("; ")}`);
  // non-colliding documents are byte-identical to the pre-rule output (the rule is a no-op for them).
  const plainKeys = Object.keys(X.exportRadix(C([...BRAND_ONLY])).theme.extend.semanticTokens.colors);
  if (plainKeys.some((k) => k.endsWith("-palette"))) FAIL("radix-collision", "a collision-free document must emit no '-palette' keys");
  // the suffix loop: "accent" and "accent-palette" -> "accent-palette-palette" and "accent-palette"
  // (the raw "accent-palette" slug is taken by the other palette, so the suffix repeats once more;
  // the same answer in either palette order).
  for (const order of [[mk("accent", 40), mk("accent-palette", 200)], [mk("accent-palette", 200), mk("accent", 40)]]) {
    const st = C([...BRAND_ONLY, ...order]);
    const keys = Object.keys(X.exportRadix(st).theme.extend.semanticTokens.colors);
    if (!keys.includes("accent-palette-palette") || !keys.includes("accent-palette")) FAIL("radix-collision", `suffix loop: expected both accent-palette and accent-palette-palette, got ${JSON.stringify(keys.filter((k) => k.startsWith("accent")))}`);
    const ks = X.radixPaletteKeys(X.derivedAll(st).map((p) => p.n));
    const byName = Object.fromEntries(X.derivedAll(st).map((p, i) => [p.n, ks[i]]));
    if (byName.accent !== "accent-palette-palette" || byName["accent-palette"] !== "accent-palette") FAIL("radix-collision", `radixPaletteKeys order-independence: ${JSON.stringify(byName)}`);
  }
  if (X.radixPaletteKey("gray", new Set()) !== "gray-palette") FAIL("radix-collision", "radixPaletteKey('gray', {}) must be 'gray-palette'");
  if (X.radixPaletteKey("primary", new Set(["neutral"])) !== "primary") FAIL("radix-collision", "radixPaletteKey must leave a non-colliding slug alone");
  // review round 1, F1: `otherSlugs` is consulted only AFTER a reserved collision changed the key.
  // Two palettes both named "Neutral" are NOT a reserved collision: both keep the raw `neutral`
  // key and collapse last-write-wins exactly as before the fix (no `neutral-palette`), so a
  // duplicate-name document is byte-identical to the pre-fix output.
  if (X.radixPaletteKey("neutral", new Set(["neutral"])) !== "neutral") FAIL("radix-collision", `radixPaletteKey('neutral', {neutral}) must stay 'neutral' (duplicate names are not a collision), got ${X.radixPaletteKey("neutral", new Set(["neutral"]))}`);
  {
    const dup = C([...BRAND_ONLY, mk("Neutral", 250)]);
    const dupPalettes = X.derivedAll(dup);
    const dupColors = X.exportRadix(dup).theme.extend.semanticTokens.colors;
    const dupKeys = Object.keys(dupColors);
    if (dupKeys.some((k) => k.endsWith("-palette"))) FAIL("radix-collision", `duplicate-name document must emit no '-palette' key, got ${JSON.stringify(dupKeys.filter((k) => k.endsWith("-palette")))}`);
    if (dupKeys.filter((k) => k === "neutral").length !== 1) FAIL("radix-collision", "duplicate-name document must emit exactly one 'neutral' key");
    const ks = X.radixPaletteKeys(dupPalettes.map((p) => p.n));
    if (ks.filter((k) => k === "neutral").length !== 2) FAIL("radix-collision", `radixPaletteKeys must map both 'neutral' slugs to 'neutral', got ${JSON.stringify(ks)}`);
    // last-write-wins: the emitted ladder is the LAST "Neutral" palette's group, as before the fix
    // (a group depends only on its own palette + key, so a document carrying just that palette
    // as "Neutral" emits the identical group).
    const onlyLast = X.exportRadix(C([...BRAND_ONLY.filter((p) => p.name !== "Neutral"), mk("Neutral", 250)])).theme.extend.semanticTokens.colors.neutral;
    if (JSON.stringify(dupColors.neutral) !== JSON.stringify(onlyLast)) FAIL("radix-collision", "duplicate-name document: colors.neutral must be the last 'Neutral' palette's ladder (last-write-wins, as pre-fix)");
  }
}

// ── radix-refs-values-unchanged (#638 U1.1) — the REFERENCE form is purely additive: the VALUES
//    form exportRadix(state) must stay byte-identical to the output captured at 2805f40, BEFORE
//    the opts.refs branch existed. The REQ-062 pattern (hpg-export-shadcn-baseline above): a
//    committed fixture, not a self-derived expectation, so a leaf builder that quietly changed the
//    values path — or a refs branch that leaked into the default — goes red here and nowhere else.
//    The preset object carries no schema stamp, so the 2 -> 3 bump does not touch this fixture.
//    #681 U4 integration re-capture (2026-09-20, by script from the engine, never typed): this
//    fixture landed on main before #681's anchor/chroma-envelope/prime-ladder engine changes, so
//    every ramp-derived value in all three sections moved once, the same way shadcn-baseline.css's
//    #681 CARVE-OUTs above document. No leaf shape, key, or ordering changed — only the underlying
//    OKLCH values, matching what src/engine/tonal.js/prime.mjs now emit on the merged tree.
{
  const G = "radix-refs-values-unchanged";
  const fixture = JSON.parse(readFileSync(new URL("./fixtures/radix-baseline.json", import.meta.url), "utf8"));
  for (const [marker, st] of [["ALL", C(ALL)], ["BRAND_ONLY", C(BRAND_ONLY)], ["COLLIDING", C(RADIX_COLLIDING)]]) {
    const got = JSON.stringify(X.exportRadix(st));
    const want = JSON.stringify(fixture[marker]);
    if (!want) { FAIL(G, `fixture section ${marker} missing from radix-baseline.json`); continue; }
    if (got !== want) FAIL(G, `exportRadix(${marker}) drifted from the pre-#638 values-form baseline`);
  }
}

// ── radix-refs-* (#638 U1.2..U1.12) — the REFERENCE form of the Radix preset: the same preset with
//    every numbered leaf replaced by a var() LINK into the kit's own CSS custom-property layer
//    (owner rulings a1/c1/d1/e1, 2026-09-18). Each criterion is its own gate name so a red says
//    WHICH property broke. Every expectation below is derived from this test's own tables
//    (RATIFIED_RAW_STEPS, derivedAll's lightRef/darkRef, exportCSS's emitted text) and never from
//    exports.js's RADIX_RAW_STEPS or its leaf builders, so a gate cannot degrade with the code.
{
  const state = C(ALL);
  const refPreset = X.exportRadix(state, { refs: true });
  const valPreset = X.exportRadix(state);
  const refColors = refPreset.theme.extend.semanticTokens.colors;
  const valColors = valPreset.theme.extend.semanticTokens.colors;
  const derived = X.derivedAll(state);
  const drivers = X.pickDrivers(derived);
  const parseOklch = (s) => {
    if (s === "transparent") return { rgb: null, a: 0 };
    const m = /^oklch\(([-\d.]+) ([-\d.]+) ([-\d.]+)(?: \/ ([-\d.]+)%)?\)$/.exec(s);
    if (!m) return null;
    const [, L, Ch, H, a] = m;
    return { rgb: oklchToRgb(Number(L), Number(Ch), Number(H)), a: a !== undefined ? Number(a) / 100 : 1 };
  };
  // redeclared independently of exports.js's own RADIX_RAW_STEPS (same reasoning as the radix gate).
  const RATIFIED_RAW_STEPS = [
    { step: 1, light: 100, dark: 900 },
    { step: 2, light: 125, dark: 875 },
    { step: 3, light: 150, dark: 850 },
    { step: 4, light: 175, dark: 825 },
    { step: 5, light: 200, dark: 800 },
    { step: 6, light: 250, dark: 750 },
    { step: 7, light: 300, dark: 700 },
    { step: 8, light: 350, dark: 650 },
  ];
  const ROLE_STEPS = [{ step: 9, suffix: "" }, { step: 10, suffix: "-hover" }, { step: 11, suffix: "-on-surface-variant" }, { step: 12, suffix: "-on-surface" }];
  // the test's OWN ref -> var-name-fragment rule (semantic.js's refSlug re-derived here): a bare
  // stop pads to 3 digits; a scrim "{base}-{step}" becomes "scrim-{step}" on the emitted hyphen
  // surface (ADR-016) — pinned against exportCSS's real text by radix-refs-parity below.
  const fragOf = (ref) => {
    const s = String(ref);
    const dash = s.indexOf("-");
    if (dash === -1) return s.padStart(3, "0");
    return `scrim-${s.slice(dash + 1).padStart(3, "0")}`;
  };

  // the test's OWN link rule. A ref is normally a fragment inside its palette's own block, but an
  // ACHROMATIC ref (white/black) is a document-level constant: exportCSS declares it once as
  // `--c-{ref}` and links it with no palette segment. #662's contrast on-color policy makes that
  // reachable by default, so a link built the naive way would name `--c-{n}-black`, which nothing
  // declares. Re-derived here rather than imported, so the gate cannot agree with the engine by
  // construction; radix-refs-collision checks every emitted link against exportCSS's real text.
  const ACHROMATIC = ["white", "black"];
  const wantLink = (n, ref) => (ACHROMATIC.includes(String(ref)) ? `var(--c-${ref})` : `var(--c-${n}-${fragOf(ref)})`);

  // U1.2 — every numbered leaf 1..12 of every palette is a var() link in BOTH modes.
  {
    const G = "radix-refs-shape";
    const RE = /^var\(--c-(?:white|black|[a-z0-9-]+-(?:\d{3}|scrim-\d{3}|prime-[a-z]+))\)$/;
    for (const p of derived) {
      const g = refColors[p.n];
      if (!g) { FAIL(G, `colors.${p.n} missing from the reference form`); continue; }
      for (let k = 1; k <= 12; k++) {
        const v = g[String(k)] && g[String(k)].value;
        if (!v || typeof v.base !== "string" || typeof v._dark !== "string") { FAIL(G, `colors.${p.n}.${k} is not a {base,_dark} leaf`); continue; }
        if (!RE.test(v.base)) FAIL(G, `colors.${p.n}.${k}.base = ${JSON.stringify(v.base)} is not a var(--c-…) link`);
        if (!RE.test(v._dark)) FAIL(G, `colors.${p.n}.${k}._dark = ${JSON.stringify(v._dark)} is not a var(--c-…) link`);
      }
    }
    // the values form must NOT have become links (the flag is opt-in, not a global switch).
    const v1 = valColors[drivers.primary.n]["1"].value.base;
    if (v1.startsWith("var(")) FAIL(G, `the DEFAULT (values) form emitted a link: ${JSON.stringify(v1)}`);
  }

  // U1.3 — steps 1..8 link the exact ratified raw stop, per palette, both modes (c1 identity map).
  {
    const G = "radix-refs-raw-pin";
    for (const p of derived) {
      const g = refColors[p.n];
      if (!g) continue;
      for (const { step, light, dark } of RATIFIED_RAW_STEPS) {
        const wantBase = `var(--c-${p.n}-${String(light).padStart(3, "0")})`;
        const wantDark = `var(--c-${p.n}-${String(dark).padStart(3, "0")})`;
        if (g[String(step)].value.base !== wantBase) FAIL(G, `colors.${p.n}.${step}.base = ${JSON.stringify(g[String(step)].value.base)}, want ${JSON.stringify(wantBase)}`);
        if (g[String(step)].value._dark !== wantDark) FAIL(G, `colors.${p.n}.${step}._dark = ${JSON.stringify(g[String(step)].value._dark)}, want ${JSON.stringify(wantDark)}`);
      }
    }
  }

  // U1.4 — steps 9..12 link the DRIVING ROLE's own lightRef/darkRef, so overrides, accentRef and
  //        the on-color policy travel with the link instead of being frozen into a stop number.
  {
    const G = "radix-refs-role-pin";
    for (const p of derived) {
      const g = refColors[p.n];
      if (!g) continue;
      for (const { step, suffix } of ROLE_STEPS) {
        const r = p.roles.find((x) => x.suffix === suffix);
        if (!r) { FAIL(G, `${p.n} has no role with suffix ${JSON.stringify(suffix)}`); continue; }
        const wantBase = wantLink(p.n, r.lightRef);
        const wantDark = wantLink(p.n, r.darkRef);
        if (g[String(step)].value.base !== wantBase) FAIL(G, `colors.${p.n}.${step}.base = ${JSON.stringify(g[String(step)].value.base)}, want ${JSON.stringify(wantBase)} (role ${JSON.stringify(suffix)} lightRef ${r.lightRef})`);
        if (g[String(step)].value._dark !== wantDark) FAIL(G, `colors.${p.n}.${step}._dark = ${JSON.stringify(g[String(step)].value._dark)}, want ${JSON.stringify(wantDark)} (role ${JSON.stringify(suffix)} darkRef ${r.darkRef})`);
      }
    }
    // an override moves the link: the anti-freeze control. Re-derive with a role override on the
    // primary's -hover role and confirm step 10's link followed it.
    const ovKey = derived.find((p) => p.n === drivers.primary.n).roles.find((r) => r.suffix === "-hover").key;
    const ovState = { ...state, roleOverrides: { [ovKey]: { light: "150", dark: "850" } } };
    const ovLink = X.exportRadix(ovState, { refs: true }).theme.extend.semanticTokens.colors[drivers.primary.n]["10"].value;
    if (ovLink.base !== `var(--c-${drivers.primary.n}-150)` || ovLink._dark !== `var(--c-${drivers.primary.n}-850)`) {
      FAIL(G, `a -hover role override did not move step 10's link: ${JSON.stringify(ovLink)}`);
    }
  }

  // U1.5 — REF PARITY, the load-bearing gate: resolve each link through exportCSS's OWN emitted
  //        declarations (the real custom-property layer a consumer loads) and compare the rgb to
  //        the values form's leaf, within 1/255 per channel. A link pointing one stop off, or at
  //        the light ref for the _dark mode, is red here even though it is a legal var() name.
  {
    const G = "radix-refs-parity";
    const cssText = X.exportOKLCH(state);
    const declared = new Map();
    for (const m of cssText.matchAll(/^\s*--([a-z0-9-]+):\s*(oklch\([^;]+\));$/gm)) declared.set(m[1], m[2]);
    let checked = 0;
    for (const p of derived) {
      const refG = refColors[p.n], valG = valColors[p.n];
      if (!refG || !valG) continue;
      for (let k = 1; k <= 12; k++) {
        for (const mode of ["base", "_dark"]) {
          const link = refG[String(k)].value[mode];
          const name = /^var\(--(.+)\)$/.exec(link);
          if (!name) { FAIL(G, `colors.${p.n}.${k}.${mode} is not a var() link: ${JSON.stringify(link)}`); continue; }
          const decl = declared.get(name[1]);
          if (!decl) { FAIL(G, `colors.${p.n}.${k}.${mode} links --${name[1]}, which exportOKLCH never declares`); continue; }
          const got = parseOklch(decl), want = parseOklch(valG[String(k)].value[mode]);
          if (!got || !want) { FAIL(G, `colors.${p.n}.${k}.${mode}: unparseable (${decl} / ${valG[String(k)].value[mode]})`); continue; }
          if (got.rgb.some((c, i) => Math.abs(c - want.rgb[i]) > 1)) FAIL(G, `colors.${p.n}.${k}.${mode} links --${name[1]} = ${got.rgb}, but the values form says ${want.rgb} (>1/255 apart)`);
          checked++;
        }
      }
    }
    if (checked < 12 * 2 * derived.length) FAIL(G, `only ${checked} of ${12 * 2 * derived.length} link/value pairs were actually compared`);
  }

  // U1.6 — a1..a12 are COMPUTED projections in both forms (no primitive exists for them), so the
  //        two files' alpha leaves are string-equal.
  {
    const G = "radix-refs-alpha";
    for (const p of derived) {
      const refG = refColors[p.n], valG = valColors[p.n];
      if (!refG || !valG) continue;
      for (let k = 1; k <= 12; k++) {
        if (JSON.stringify(refG[`a${k}`]) !== JSON.stringify(valG[`a${k}`])) FAIL(G, `colors.${p.n}.a${k} differs between the two forms: ${JSON.stringify(refG[`a${k}`])} vs ${JSON.stringify(valG[`a${k}`])}`);
      }
      // and they must NOT have turned into links.
      if (String(refG.a1.value.base).startsWith("var(")) FAIL(G, `colors.${p.n}.a1 became a link; no alpha primitive exists to link`);
    }
  }

  // U1.7 — the two additive leaves: on-accent follows the `-on-{n}` role's own refs; prime links the
  //        mode-independent prime-prime identity primitive and stays base-only (REQ-024).
  {
    const G = "radix-refs-extras";
    for (const p of derived) {
      const g = refColors[p.n];
      if (!g) continue;
      const onRole = p.roles.find((x) => x.suffix === `-on-${p.n}`);
      const wantOn = { base: wantLink(p.n, onRole.lightRef), _dark: wantLink(p.n, onRole.darkRef) };
      if (JSON.stringify(g["on-accent"].value) !== JSON.stringify(wantOn)) FAIL(G, `colors.${p.n}.on-accent = ${JSON.stringify(g["on-accent"].value)}, want ${JSON.stringify(wantOn)}`);
      if (g.prime.value.base !== `var(--c-${p.n}-prime-prime)`) FAIL(G, `colors.${p.n}.prime.base = ${JSON.stringify(g.prime.value.base)}, want var(--c-${p.n}-prime-prime)`);
      if (g.prime.value._dark !== undefined) FAIL(G, `colors.${p.n}.prime must stay mode-independent (base only), got ${JSON.stringify(g.prime.value)}`);
    }
  }

  // U1.8 — the accent/gray driver clones (REQ-025) link the PRIMARY/NEUTRAL palette's own custom
  //        properties, never a `var(--c-accent-…)` name that no surface emits: rewriteRefs only
  //        rewrites `{colors.{n}.` Panda paths, which cannot occur inside a var() string. The
  //        internal appearance aliases still re-point at the clone's own group name.
  {
    const G = "radix-refs-clones";
    for (const [alias, driver] of [["accent", drivers.primary], ["gray", drivers.neutral]]) {
      const clone = refColors[alias], src = refColors[driver.n];
      if (!clone || !src) { FAIL(G, `colors.${alias} or its driver colors.${driver.n} missing`); continue; }
      for (let k = 1; k <= 12; k++) {
        if (clone[String(k)].value.base !== src[String(k)].value.base || clone[String(k)].value._dark !== src[String(k)].value._dark) {
          FAIL(G, `colors.${alias}.${k} = ${JSON.stringify(clone[String(k)].value)} but its driver colors.${driver.n}.${k} = ${JSON.stringify(src[String(k)].value)}`);
        }
        if (clone[String(k)].value.base.includes(`--c-${alias}-`)) FAIL(G, `colors.${alias}.${k}.base was rewritten to a non-existent primitive: ${clone[String(k)].value.base}`);
      }
      if (clone.solid.bg.DEFAULT.value !== `{colors.${alias}.9}`) FAIL(G, `colors.${alias}.solid.bg.DEFAULT = ${JSON.stringify(clone.solid.bg.DEFAULT.value)}, want {colors.${alias}.9}`);
      if (clone.prime.value.base !== src.prime.value.base) FAIL(G, `colors.${alias}.prime = ${JSON.stringify(clone.prime.value.base)} but the driver's is ${JSON.stringify(src.prime.value.base)}`);
    }
  }

  // U1.9 — #630 collision (ruling d1): the GROUP key stays `<slug>-palette`, but its links use the
  //        RAW slug, because the primitive surfaces only ever emit `--c-{raw slug}-…`. The Panda
  //        `{colors.…}` aliases are unchanged from the values form.
  {
    const G = "radix-refs-collision";
    const cSt = C(RADIX_COLLIDING);
    const cRef = X.exportRadix(cSt, { refs: true }).theme.extend.semanticTokens.colors;
    const cVal = X.exportRadix(cSt).theme.extend.semanticTokens.colors;
    if (!cRef["accent-palette"]) FAIL(G, `colors["accent-palette"] missing from the reference form (keys: ${JSON.stringify(Object.keys(cRef).filter((k) => k.startsWith("accent")))})`);
    else {
      if (cRef["accent-palette"]["1"].value.base !== "var(--c-accent-100)") FAIL(G, `colors["accent-palette"].1.base = ${JSON.stringify(cRef["accent-palette"]["1"].value.base)}, want var(--c-accent-100) (the RAW slug, not the renamed key)`);
      if (cRef["accent-palette"].solid.bg.DEFAULT.value !== "{colors.accent-palette.9}") FAIL(G, `colors["accent-palette"].solid.bg.DEFAULT = ${JSON.stringify(cRef["accent-palette"].solid.bg.DEFAULT.value)}, want {colors.accent-palette.9}`);
    }
    if (cRef.error && cRef.error.value !== "{colors.error-palette.9}") FAIL(G, `colors.error = ${JSON.stringify(cRef.error.value)}, want {colors.error-palette.9} (unchanged from the values form)`);
    // every link the colliding document emits names a property exportOKLCH really declares.
    const declared = new Set([...X.exportOKLCH(cSt).matchAll(/^\s*--([a-z0-9-]+):/gm)].map((m) => m[1]));
    const dangling = [];
    const walk = (node, path) => {
      if (typeof node === "string") { const m = /^var\(--(.+)\)$/.exec(node); if (m && !declared.has(m[1])) dangling.push(`${path} -> ${node}`); return; }
      if (node && typeof node === "object") for (const k of Object.keys(node)) walk(node[k], `${path}.${k}`);
    };
    walk(cRef, "colors");
    if (dangling.length) FAIL(G, `${dangling.length} link(s) name a custom property no CSS export declares: ${dangling.slice(0, 3).join("; ")}`);
    // the Panda alias skeleton is identical between the two forms of the same document.
    const skeleton = (colors) => JSON.stringify(colors).replace(/"(var\(--[^"]*\)|oklch\([^"]*\)|transparent)"/g, '"<leaf>"');
    if (skeleton(cRef) !== skeleton(cVal)) FAIL(G, "the reference form's key/alias skeleton differs from the values form's");
  }

  // U1.10 — the links follow cssPrefixOf: a Material-flavoured prefix renames both surfaces in
  //         lockstep, so the pair still resolves.
  {
    const G = "radix-refs-prefix";
    const mdState = { ...state, export: { colorPrefix: "md-sys-color" } };
    const mdColors = X.exportRadix(mdState, { refs: true }).theme.extend.semanticTokens.colors;
    const want = `var(--md-sys-color-${drivers.primary.n}-100)`;
    const got = mdColors[drivers.primary.n]["1"].value.base;
    if (got !== want) FAIL(G, `prefixed link = ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    const mdCss = X.exportCSS(mdState);
    if (!mdCss.includes(`--md-sys-color-${drivers.primary.n}-100:`)) FAIL(G, `exportCSS on the same state never declares --md-sys-color-${drivers.primary.n}-100`);
    if (mdCss.includes(`--c-${drivers.primary.n}-100:`)) FAIL(G, "exportCSS still declares the default-prefixed name under a custom prefix");
  }

  // U1.11 — the module wrapper names the link contract on its own header line, and only there.
  {
    const G = "radix-refs-module";
    const refMod = X.exportRadixModule(refPreset);
    const valMod = X.exportRadixModule(valPreset);
    const lines = refMod.split("\n");
    if (lines[0] !== `/* ultimate-tokens export schema ${3} */`) FAIL(G, `reference module first line = ${JSON.stringify(lines[0])}`);
    if (!lines[1].startsWith("/* Radix preset")) FAIL(G, `reference module header does not open with the Radix preset comment: ${JSON.stringify(lines[1])}`);
    if (!lines[2].includes("LINKS")) FAIL(G, `the header's second comment line must name the link form, got ${JSON.stringify(lines[2])}`);
    if (!/css-hex|css-oklch/.test(refMod)) FAIL(G, "the reference header never tells the consumer which export to load first");
    if (valMod.includes("LINKS")) FAIL(G, "the VALUES module header must not claim its values are links");
    const body = refMod.slice(refMod.indexOf("export default ") + "export default ".length, refMod.lastIndexOf(";"));
    let parsed = null;
    try { parsed = JSON.parse(body); } catch (e) { FAIL(G, `reference module body is not valid JSON: ${e.message}`); }
    if (parsed && JSON.stringify(parsed) !== JSON.stringify(refPreset)) FAIL(G, "reference module JSON does not deep-equal exportRadix(state, { refs: true })");
    // exportAll carries the second form under its own key.
    const bundle = X.exportAll(state, {});
    if (!bundle.radixRef || typeof bundle.radixRef !== "object") FAIL(G, `exportAll(state).radixRef = ${JSON.stringify(bundle.radixRef)}, want the reference preset object`);
    else if (JSON.stringify(bundle.radixRef) !== JSON.stringify(refPreset)) FAIL(G, "exportAll(state).radixRef is not exportRadix(state, { refs: true })");
  }

  // U1.12 — the no-driver sentinel is a property of the document, not of the form.
  {
    const G = "radix-refs-sentinel";
    const s = X.exportRadix(C([]), { refs: true });
    if (typeof s !== "string" || !s.startsWith("/* Radix export needs")) FAIL(G, `reference-form sentinel wrong: ${JSON.stringify(s)}`);
    if (s !== X.exportRadix(C([]))) FAIL(G, "the two forms disagree on the no-driver sentinel string");
    if (X.exportRadixModule(s, { refs: true }) !== s) FAIL(G, "exportRadixModule must pass the sentinel through unwrapped in the reference form too");
  }
}

// ── hpg-export-data-palette (#516 — isDataPalette, shadcn chart-1..5 binding, fallback exclusion) ──
{
  // isDataPalette: every derived palette's data-ness matches the /^data-\d+$/ slug pattern exactly.
  const derivedWithData = X.derivedAll(C(ALL_WITH_DATA));
  for (const p of derivedWithData) {
    const want = /^data-\d+$/.test(p.n);
    if (X.isDataPalette(p) !== want) FAIL("data-palette", `isDataPalette(${p.n}) = ${X.isDataPalette(p)}, want ${want}`);
  }
  // negative control: a palette merely NAMED like data ("Metadata") must not false-positive.
  const fake = X.derivedAll(C([{ name: "Metadata", hue: 100, chroma: 50, skew: 0, lift: 0, on: true }]))[0];
  if (X.isDataPalette(fake)) FAIL("data-palette", "isDataPalette false-positived on a non-'data-N' slug ('metadata')");

  // EX-7 half 1 — chart-1..5 bind to the prime role of data-1..5 when those enabled palettes exist.
  const scData = X.exportShadcn(C(ALL_WITH_DATA));
  const chartMatches = (sc, n) => [...sc.matchAll(new RegExp(`--chart-${n}:\\s*(oklch\\([^;]+\\));`, "g"))].map((m) => m[1]);
  for (let i = 1; i <= 5; i++) {
    const dp = derivedWithData.find((p) => p.n === `data-${i}`);
    const primeRole = dp.roles.find((r) => r.suffix === "");
    const [gotLight, gotDark] = chartMatches(scData, i);
    const wantLight = X.roleOklch(primeRole.light), wantDark = X.roleOklch(primeRole.dark);
    if (gotLight !== wantLight || gotDark !== wantDark) FAIL("data-palette", `chart-${i} != prime role of data-${i} (light ${gotLight} vs ${wantLight}; dark ${gotDark} vs ${wantDark})`);
  }

  // EX-7 half 2 — data palettes all disabled: byte-identical to the pre-feature (no-data) baseline.
  const allDataOff = ALL_WITH_DATA.map((p) => (/^Data \d+$/.test(p.name) ? { ...p, on: false } : p));
  if (X.exportShadcn(C(allDataOff)) !== X.exportShadcn(C(BRAND_ONLY))) FAIL("data-palette", "EX-7: with data palettes disabled, shadcn output differs from the pre-feature (no-data) baseline");

  // fallback exclusion (REQ-031) — an adversarial fixture: data-1/data-2 listed FIRST, two renamed
  // brand palettes ("Aurora"/"Nightfall") matching NEITHER the neutral NOR the primary regex, so a
  // bare `palettes[0]` fallback (the pre-fix bug) would resolve neutral straight to data-1. The fix
  // must still land neutral on Aurora (first non-data) and primary on Nightfall (next non-data).
  const RENAMED = [
    dataPalette(1, 10, 50), dataPalette(2, 55, 50),
    { name: "Aurora", hue: 200, chroma: 60, skew: 0, lift: 0, on: true },
    { name: "Nightfall", hue: 260, chroma: 20, skew: 0, lift: 0, on: true },
  ];
  const scRenamed = X.exportShadcn(C(RENAMED));
  const tokenVal = (sc, tok) => { const m = sc.match(new RegExp(`--${tok}:\\s*(oklch\\([^;]+\\));`)); return m && m[1]; };
  const derivedRenamed = X.derivedAll(C(RENAMED));
  const auroraBg = X.roleOklch(derivedRenamed.find((p) => p.n === "aurora").roles.find((r) => r.suffix === "-background").light);
  const nightfallPrime = X.roleOklch(derivedRenamed.find((p) => p.n === "nightfall").roles.find((r) => r.suffix === "").light);
  if (tokenVal(scRenamed, "background") !== auroraBg) FAIL("data-palette", "neutral fallback did not land on the first non-data palette (Aurora) — may have resolved to a data palette");
  if (tokenVal(scRenamed, "primary") !== nightfallPrime) FAIL("data-palette", "primary fallback did not land on the first non-data non-neutral palette (Nightfall) — may have resolved to a data palette");
}

// ── hpg-export-shadcn-chart-6-8 (#576, #569 RP-3/H-3 — a deliberate departure from shadcn's stock
//    5 chart slots: chart-6..8 bind to data-6..8's prime role when enabled, and are OMITTED
//    entirely — not fallback-filled — when those data palettes are absent/disabled) ──
{
  const chartMatches = (sc, n) => [...sc.matchAll(new RegExp(`--chart-${n}:\\s*(oklch\\([^;]+\\));`, "g"))].map((m) => m[1]);

  // enabled: chart-6..8 present, equal to the prime role of data-6..8 per scheme, and mapped in @theme inline.
  const scData = X.exportShadcn(C(ALL_WITH_DATA));
  const derivedWithData8 = X.derivedAll(C(ALL_WITH_DATA));
  for (let i = 6; i <= 8; i++) {
    const dp = derivedWithData8.find((p) => p.n === `data-${i}`);
    const primeRole = dp.roles.find((r) => r.suffix === "");
    const [gotLight, gotDark] = chartMatches(scData, i);
    const wantLight = X.roleOklch(primeRole.light), wantDark = X.roleOklch(primeRole.dark);
    if (gotLight !== wantLight || gotDark !== wantDark) FAIL("shadcn-chart-6-8", `chart-${i} != prime role of data-${i} (light ${gotLight} vs ${wantLight}; dark ${gotDark} vs ${wantDark})`);
    if (!scData.includes(`--color-chart-${i}: var(--chart-${i});`)) FAIL("shadcn-chart-6-8", `@theme inline missing --color-chart-${i} -> var(--chart-${i})`);
  }

  // disabled (no data palettes at all, BRAND_ONLY): chart-6..8 entirely absent — no fallback.
  const scBrandOnly = X.exportShadcn(C(BRAND_ONLY));
  for (let i = 6; i <= 8; i++) {
    if (new RegExp(`--chart-${i}:`).test(scBrandOnly)) FAIL("shadcn-chart-6-8", `chart-${i} present with data-${i} disabled/absent (must be omitted, no fallback)`);
    if (scBrandOnly.includes(`--color-chart-${i}:`)) FAIL("shadcn-chart-6-8", `@theme inline includes chart-${i} with data-${i} disabled/absent`);
  }

  // selective: only data-6..8 disabled, data-1..5 stay enabled — chart-6..8 absent, chart-1..5 unaffected.
  const only678Off = ALL_WITH_DATA.map((p) => (/^Data [678]$/.test(p.name) ? { ...p, on: false } : p));
  const sc678Off = X.exportShadcn(C(only678Off));
  for (let i = 6; i <= 8; i++) {
    if (new RegExp(`--chart-${i}:`).test(sc678Off)) FAIL("shadcn-chart-6-8", `chart-${i} present when data-${i} alone is disabled`);
  }
  for (let i = 1; i <= 5; i++) {
    if (!new RegExp(`--chart-${i}:`).test(sc678Off)) FAIL("shadcn-chart-6-8", `chart-${i} missing when only data-6..8 are disabled (chart-1..5 must be unaffected)`);
  }
}

// ── hpg-export-keycolors (retained brand colors -> exact OKLCH tokens by role + JSON block) ──
const withKey = C(ALL.map((p, i) => (i === 0 ? { ...p, keyColors: [{ role: "dominant", oklch: [0.32, 0.05, 150] }, { role: "supportive", oklch: [0.7, 0.04, 160] }] } : p)));
const kcss = X.exportCSS(withKey);
if (!/--c-[a-z0-9-]+-key-dominant:\s*oklch\(/.test(kcss)) FAIL("keycolors", "dominant key token (oklch) missing");
if (!/--c-[a-z0-9-]+-key-supportive:\s*oklch\(/.test(kcss)) FAIL("keycolors", "supportive key token (oklch) missing");
const kp = X.exportJSON(withKey)[ALL[0].name.toLowerCase()]; // ADR-016: JSON keys by slug
if (!kp.keyColors || kp.keyColors.length !== 2 || kp.keyColors[0].role !== "dominant" || !Array.isArray(kp.keyColors[0].oklch) || kp.keyColors[0].oklch.length !== 3) FAIL("keycolors", "JSON keyColors block missing/wrong");
// derivePalette's internal `rgb` (added for DTCG/UI3, TKT-0022) must not leak into JSON's own {role,oklch,name?} shape
if ("rgb" in kp.keyColors[0]) FAIL("keycolors", "JSON keyColors leaf leaked the internal rgb field");
// a palette with no key colors emits no key tokens (opt-in only)
if (X.exportCSS(C(ALL)).includes("-key-")) FAIL("keycolors", "key tokens present when none set");

// TKT-0022 — key colors must ALSO surface in DTCG (raw tree's key/ group, mirroring scrim/) and UI3
// (raw/{n}/key/{role} primitives): they exported fine via CSS/JSON but were silently absent from the
// two "standards path" formats, with no ADR fencing the omission (checked decision-records.md — none
// exists). Treated as a bug, not a documented exception.
const slug0 = ALL[0].name.toLowerCase();
const kdtcg = X.exportDTCG(withKey)["palette.tokens.json"][slug0];
if (!kdtcg || !kdtcg.key || !kdtcg.key.dominant || !kdtcg.key.supportive) FAIL("keycolors-dtcg", "DTCG raw tree missing key/ group for a keyColors palette");
else {
  for (const role of ["dominant", "supportive"]) {
    const leaf = kdtcg.key[role];
    if (!leaf || leaf.$type !== "color" || !leaf.$value || leaf.$value.colorSpace !== "srgb" || leaf.$value.alpha !== 1) FAIL("keycolors-dtcg", `key/${role} not a well-formed, opaque (frac=1) color leaf`);
  }
}
// absent when the palette sets no key colors (opt-in only, same rule as CSS)
const noKeyDtcg = X.exportDTCG(C(ALL))["palette.tokens.json"][slug0];
if (noKeyDtcg && noKeyDtcg.key) FAIL("keycolors-dtcg", "DTCG key/ group present when no keyColors set");

const kui3 = X.exportUI3(withKey);
const primVars = kui3.collections["Color Primitives"].variables;
if (!primVars[`raw/${slug0}/key/dominant`] || primVars[`raw/${slug0}/key/dominant`].type !== "COLOR" || !primVars[`raw/${slug0}/key/dominant`].values.Base) FAIL("keycolors-ui3", "UI3 raw/{n}/key/dominant missing or malformed");
if (!primVars[`raw/${slug0}/key/supportive`]) FAIL("keycolors-ui3", "UI3 raw/{n}/key/supportive missing");
const noKeyUi3 = X.exportUI3(C(ALL)).collections["Color Primitives"].variables;
if (Object.keys(noKeyUi3).some((k) => k.startsWith(`raw/${slug0}/key/`))) FAIL("keycolors-ui3", "UI3 key/ variables present when no keyColors set");

// ── hpg-export-prime (#539/P4, REQ-054, AC-051 — the seven-swatch prime group, engine-emitter half) ──
// Naming per REQ-054: CSS/OKLCH "--{pfx}-{n}-prime-{step}"; JSON palette.prime[step] = {hex, oklch};
// Tailwind "--color-{n}-prime-{step}". exportShadcn has no slot (non-goal) — proven as a negative
// control below rather than assumed. UI3/DTCG naming has its own gates further down.
const primeCss = X.exportCSS(C(ALL));
const primeOklch = X.exportOKLCH(C(ALL));
for (const step of PRIME_STEPS) {
  if (!new RegExp(`--c-${slug0}-prime-${step}:\\s*#[0-9A-F]{6};`).test(primeCss)) FAIL("prime", `CSS missing --c-${slug0}-prime-${step} (hex)`);
  if (!new RegExp(`--c-${slug0}-prime-${step}:\\s*oklch\\(`).test(primeOklch)) FAIL("prime", `OKLCH missing --c-${slug0}-prime-${step}`);
}
// count: every format except shadcn emits 7 * enabledCount prime leaves (AC-051).
const primeCssCount = (css) => (css.match(/--c-[a-z0-9-]+-prime-[a-z]+:/g) || []).length;
const wantPrime = 7 * enabledCount(C(ALL));
if (primeCssCount(primeCss) !== wantPrime) FAIL("prime", `CSS prime leaf count ${primeCssCount(primeCss)} != ${wantPrime}`);
if (primeCssCount(primeOklch) !== wantPrime) FAIL("prime", `OKLCH prime leaf count ${primeCssCount(primeOklch)} != ${wantPrime}`);

const primeJsonP0 = X.exportJSON(C(ALL))[slug0];
if (!primeJsonP0.prime || PRIME_STEPS.some((s) => !primeJsonP0.prime[s])) FAIL("prime", "JSON palette.prime missing a step");
else {
  for (const step of PRIME_STEPS) {
    const leaf = primeJsonP0.prime[step];
    if (!/^#[0-9A-F]{6}$/.test(leaf.hex || "")) FAIL("prime", `JSON prime.${step}.hex malformed: ${leaf.hex}`);
    if (!/^oklch\(/.test(leaf.oklch || "")) FAIL("prime", `JSON prime.${step}.oklch malformed: ${leaf.oklch}`);
  }
}
const primeJsonCount = Object.values(X.exportJSON(C(ALL))).filter((p) => p && p.prime).reduce((n, p) => n + Object.keys(p.prime).length, 0);
if (primeJsonCount !== wantPrime) FAIL("prime", `JSON prime leaf count ${primeJsonCount} != ${wantPrime}`);

const primeTw = X.exportTailwind(C(ALL));
for (const step of PRIME_STEPS) {
  if (!new RegExp(`--color-${slug0}-prime-${step}:\\s*oklch\\(`).test(primeTw)) FAIL("prime", `Tailwind missing --color-${slug0}-prime-${step}`);
}
const primeTwCount = (tw) => (tw.match(/--color-[a-z0-9-]+-prime-[a-z]+:/g) || []).length;
if (primeTwCount(primeTw) !== wantPrime) FAIL("prime", `Tailwind prime leaf count ${primeTwCount(primeTw)} != ${wantPrime}`);

// disabled palette: zero prime leaves anywhere for the disabled slug, and total counts drop by 7.
const primeOff = C(ALL.map((p, i) => (i === 1 ? { ...p, on: false } : p)));
if (X.exportCSS(primeOff).includes(`--c-${offName}-prime-`)) FAIL("prime", `disabled palette '${offName}' still emits CSS prime tokens`);
if (X.exportTailwind(primeOff).includes(`--color-${offName}-prime-`)) FAIL("prime", `disabled palette '${offName}' still emits Tailwind prime tokens`);
const offJson = X.exportJSON(primeOff);
if (offJson[offName]) FAIL("prime", `disabled palette '${offName}' still present in JSON export`);
const wantPrimeOff = 7 * enabledCount(primeOff);
if (primeCssCount(X.exportCSS(primeOff)) !== wantPrimeOff) FAIL("prime", "disabling a palette did not drop the CSS prime count by exactly 7");

// negative control: exportShadcn has NO prime slot (non-goal) — its output is unaffected by
// primeChroma, byte-identical whether the control is 100 or 50 on every palette.
const shadcnBase = X.exportShadcn(C(ALL));
const shadcnPrimeChroma50 = X.exportShadcn({ ...C(ALL), primeChroma: 50 });
if (shadcnBase !== shadcnPrimeChroma50) FAIL("prime", "exportShadcn output changed with primeChroma — it must have no prime slot (non-goal)");
if (shadcnBase.includes("prime")) FAIL("prime", "exportShadcn output unexpectedly mentions 'prime'");

// ── hpg-export-prime-dtcg (REQ-054 — raw tree nests prime beside scrim/key, same depth) ──────────
const primeDtcgTree = X.exportDTCG(C(ALL))["palette.tokens.json"][slug0];
if (!primeDtcgTree.prime || PRIME_STEPS.some((s) => !primeDtcgTree.prime[s])) FAIL("prime-dtcg", "DTCG raw tree missing prime/ group or a step");
else {
  for (const step of PRIME_STEPS) {
    const leaf = primeDtcgTree.prime[step];
    if (!leaf || leaf.$type !== "color" || !leaf.$value || leaf.$value.colorSpace !== "srgb" || leaf.$value.alpha !== 1) FAIL("prime-dtcg", `prime/${step} not a well-formed, opaque (frac=1) color leaf`);
  }
}
// nesting depth: prime/{step} sits exactly as deep as scrim/{step} — both ONE segment under the
// palette group (grp.scrim.{step} / grp.prime.{step}), never a numeral-compound or a deeper path.
const scrimDepthKeys = Object.keys(primeDtcgTree.scrim);
const primeDepthKeys = Object.keys(primeDtcgTree.prime);
if (typeof primeDtcgTree.scrim !== "object" || typeof primeDtcgTree.prime !== "object" || !scrimDepthKeys.length || !primeDepthKeys.length) FAIL("prime-dtcg", "scrim/prime groups are not both one-level nested objects");
// a disabled palette is wholly absent from the raw tree (derivedAll's own filter) — no prime/ leaks.
const primeDtcgOff = X.exportDTCG(primeOff)["palette.tokens.json"];
if (offName in primeDtcgOff) FAIL("prime-dtcg", `disabled palette '${offName}' still present in DTCG raw tree`);
const primeDtcgRaw = X.exportDTCG(C(ALL))["palette.tokens.json"];
const primeDtcgLeafCount = Object.keys(primeDtcgRaw).filter((k) => k !== "constants" && k !== "$extensions").reduce((n, k) => n + Object.keys(primeDtcgRaw[k].prime).length, 0);
if (primeDtcgLeafCount !== wantPrime) FAIL("prime-dtcg", `DTCG prime leaf count ${primeDtcgLeafCount} != ${wantPrime}`);

// ── hpg-export-prime-ui3 (REQ-054, LLD Interfaces block — a DEDICATED "Color Prime" collection,
//    one "Base" mode, variables keyed "{n}/{step}") ───────────────────────────────────────────
// NOTE (#539 sub-unit split): the collection is a LITERAL "Color Prime" string here, not
// COLLECTIONS.colorPrime — that constant is added by #539's sub-unit B (stacked on this branch)
// together with the two Figma sandbox literal mirrors it must move in lockstep with for the
// `collparity` gate. The STRING VALUE is fixed now so sub-unit B's constant has a stable shape to
// agree with.
const primeUi3Coll = X.exportUI3(C(ALL)).collections["Color Prime"];
if (!primeUi3Coll || JSON.stringify(primeUi3Coll.modes) !== JSON.stringify(["Base"])) FAIL("prime-ui3", `UI3 "Color Prime" collection missing or wrong modes: ${JSON.stringify(primeUi3Coll && primeUi3Coll.modes)}`);
else {
  for (const step of PRIME_STEPS) {
    const v = primeUi3Coll.variables[`${slug0}/${step}`];
    if (!v || v.type !== "COLOR" || !/^#[0-9A-F]{6}$/.test(v.values.Base || "")) FAIL("prime-ui3", `UI3 "Color Prime" var ${slug0}/${step} missing or malformed`);
  }
  const primeUi3Count = Object.keys(primeUi3Coll.variables).length;
  if (primeUi3Count !== wantPrime) FAIL("prime-ui3", `UI3 "Color Prime" leaf count ${primeUi3Count} != ${wantPrime}`);
}
// "Color Prime" carries ONLY prime data — no "raw/" prefixed keys leaked in from the Primitives shape.
if (primeUi3Coll && Object.keys(primeUi3Coll.variables).some((k) => k.startsWith("raw/"))) FAIL("prime-ui3", `UI3 "Color Prime" variables leaked a "raw/"-prefixed key`);
// the "Color Primitives" collection must NOT also carry prime data (moved wholesale to its own collection).
const primitivesVars = X.exportUI3(C(ALL)).collections["Color Primitives"].variables;
if (Object.keys(primitivesVars).some((k) => /\/prime\//.test(k))) FAIL("prime-ui3", `UI3 "Color Primitives" still carries prime/ keys — should have moved wholesale to "Color Prime"`);
const primeUi3Off = X.exportUI3(primeOff).collections["Color Prime"].variables;
if (Object.keys(primeUi3Off).some((k) => k.startsWith(`${offName}/`))) FAIL("prime-ui3", `disabled palette '${offName}' still emits UI3 "Color Prime" variables`);

// ── hpg-export-design-system (the LLM design-system bundle: DESIGN.md universal-dialect core + tokens.json
// + @dsCard previews + README receipt). The engine gate runs the ported §8 verifier (ds-gates.js) on the
// emitted bundle — the same platform-agnostic checks bundle_gates.py enforces (contrast all-pairs × both
// schemes · scheme parity · carrier equality · refs · section grammar · previews · relative leading). Runs
// on the DEFAULT palettes (a theme != the Studio golden): the emitter must be theme-general.
{
  const tsc = typeScale({});
  const gsc = geomScale({});
  const files = X.exportDesignSystemBundle(C(ALL), tsc, gsc, { date: "2026-07-05" });
  const byName = Object.fromEntries(files.map((f) => [f.name, f.data]));
  for (const layer of ["DESIGN.md", "tokens.json", "README.md"]) if (!(layer in byName)) FAIL("design-system", `bundle missing ${layer}`);
  const previews = files.filter((f) => f.name.startsWith("components/"));
  if (previews.length < 5) FAIL("design-system", `too few previews (${previews.length})`);
  const asPreviews = previews.map((p) => ({ name: p.name.replace("components/", ""), html: p.data }));

  // EXTENDED COLOR LAYER (#471) — chrome-only: -placeholder/-scrim/-inverse-surface/-inverse-on-surface;
  // per-family (chrome + every fill family, intents included): -container/-container-low/-container-high.
  // The reduced consumption set (dsColorRoles), the tokens.json colors/colorsDark tier, and the DESIGN.md
  // frontmatter must all agree — one source, three carriers, same as every other slot.
  {
    const ds = X.dsColorRoles(C(ALL));
    const cn = ds.chrome.n;
    const byName = Object.fromEntries(ds.tokens.map((t) => [t.name, t]));
    for (const suffix of ["placeholder", "scrim", "inverse-surface", "inverse-on-surface"]) {
      const name = `${cn}-${suffix}`;
      if (!byName[name]) FAIL("design-system", `dsColorRoles missing chrome extended slot ${name}`);
    }
    for (const fam of ds.families) {
      for (const suffix of ["container", "container-low", "container-high"]) {
        const name = `${fam}-${suffix}`;
        if (!byName[name]) FAIL("design-system", `dsColorRoles missing ${name} (every family, intents included, must carry -container/-low/-high)`);
      }
    }
    const tjExt = JSON.parse(X.exportDesignSystemTokens(C(ALL), tsc, gsc));
    const mdExt = X.exportDesignSystemSpine(C(ALL), tsc, gsc);
    for (const [name, t] of Object.entries(byName)) {
      if (/-(placeholder|scrim|inverse-surface|inverse-on-surface|container|container-low|container-high)$/.test(name)) {
        if (tjExt.colors[name] !== t.light.oklch || tjExt.colorsDark[name] !== t.dark.oklch)
          FAIL("design-system", `tokens.json colors/colorsDark diverges from dsColorRoles for extended slot ${name}`);
        if (!mdExt.includes(`  ${name}: "${t.light.oklch}"`) || !mdExt.includes(`  ${name}-dark: "${t.dark.oklch}"`))
          FAIL("design-system", `DESIGN.md frontmatter is missing extended slot ${name} (or its -dark sibling)`);
      }
    }
  }

  // TEXT-RENDERING BASELINE — "always include" is a GATE, not a hope (the standing rule, 2026-07-10):
  // the DESIGN.md Typography section mandates the block (smoothing pair · optimizeLegibility · optical
  // sizing · font-synthesis none · kerning + common ligatures · the code/pre/kbd no-ligatures exception),
  // and EVERY @dsCard preview actually renders under it.
  {
    const md = byName["DESIGN.md"] || "";
    for (const probe of ["-webkit-font-smoothing: antialiased", "-moz-osx-font-smoothing: grayscale", "text-rendering: optimizeLegibility", "font-optical-sizing: auto", "font-synthesis: none", "font-kerning: normal", "font-variant-ligatures: common-ligatures", "code, pre, kbd { font-variant-ligatures: none; }"])
      if (!md.includes(probe)) FAIL("design-system", `DESIGN.md Typography is missing the text-rendering baseline line: ${probe}`);
    for (const p of previews) {
      if (!p.data.includes("font-synthesis:none") || !p.data.includes("-webkit-font-smoothing:antialiased") || !p.data.includes("font-variant-ligatures:common-ligatures"))
        FAIL("design-system", `preview ${p.name} is missing the text-rendering baseline props`);
      if (!p.data.includes(".cd code,.cd pre,.cd kbd") || !p.data.includes("font-variant-ligatures:none"))
        FAIL("design-system", `preview ${p.name} is missing the code/pre/kbd no-ligatures exception`);
    }
  }

  // §8 GATES — KIT FIDELITY: G1 (contrast) is a MEASUREMENT of the kit's own onColorMode choice
  // (fixed = uniform brand labels, sub-4.5 pairs accepted per ADR-003) and is DISCLOSED in the
  // receipt; every OTHER gate (G0 parse, G2 parity, G3 carrier equality, G5 refs, G6 sections,
  // G7 roles, G8 leading) stays a hard ZERO.
  const gate = dsBundleGates({ designMd: byName["DESIGN.md"], tokensJson: byName["tokens.json"], previews: asPreviews });
  const nonG1 = gate.findings.filter((f) => f.level === "ERROR" && f.gate !== "G1");
  if (nonG1.length > 0) FAIL("design-system", `§8 non-G1 gates: ${nonG1.length} fail(s) — ${nonG1.map((f) => `[${f.gate}] ${f.msg}`).join(" | ")}`);
  const g1Count = gate.findings.filter((f) => f.level === "ERROR" && f.gate === "G1").length;
  const receipt = byName["README.md"];
  if (g1Count > 0) {
    if (!/🟡 Contrast measured/.test(receipt)) FAIL("design-system", "G1 misses exist but the receipt has no 🟡 contrast disclosure");
    if (!receipt.includes(`${g1Count} derivable fill/on-pair(s) below 4.5:1`)) FAIL("design-system", `receipt disclosure count does not match the gate (${g1Count})`);
    if (!/ADR-003/.test(receipt)) FAIL("design-system", "contrast disclosure missing the ADR-003 brand-override citation");
  } else if (!/🟢 Contrast/.test(receipt)) FAIL("design-system", "all pairs pass but the receipt has no 🟢 contrast line");

  // KIT FIDELITY — the reduced grammar is a NAME reduction of the semantic layer: values VERBATIM.
  {
    const tjF = JSON.parse(byName["tokens.json"]);
    for (const [nm, sem] of [["primary", "primary"], ["primary-on-primary", "primary-on-primary"], ["primary-hover", "primary-hover"], ["neutral-background", "neutral-background"]]) {
      if (tjF.colors[nm] !== tjF.semantic[sem]) FAIL("design-system", `colors.${nm} !== semantic.${sem} — the export adjusted a kit value (fidelity broken)`);
      if (tjF.colorsDark[nm] !== tjF.semanticDark[sem]) FAIL("design-system", `colorsDark.${nm} !== semanticDark.${sem} — the export adjusted a kit value (fidelity broken)`);
    }
  }

  // tokens.json shape: grammar-named colors + `primary` alias, scheme parity, numeric type/space/radii, leading FACTOR
  let tj = null;
  try { tj = JSON.parse(byName["tokens.json"]); } catch { FAIL("design-system", "tokens.json not valid JSON"); }
  if (tj) {
    if (!tj.colors || !tj.colors.primary) FAIL("design-system", "no `primary` Stitch-compat alias");
    if (!Object.keys(tj.colors).some((k) => /-on-/.test(k))) FAIL("design-system", "no `{family}-on-{family}` on-color (grammar)");
    if (!Object.keys(tj.colors).some((k) => /-surface$/.test(k))) FAIL("design-system", "no neutral `-surface` slot (grammar)");
    if (Object.keys(tj.colorsDark).join() !== Object.keys(tj.colors).join()) FAIL("design-system", "colorsDark keys differ from colors (scheme parity)");
    // Colors are high-resolution OKLCH, never bare hex (standing rule: a design-system export never ships a bare
    // hex color). Both schemes; alpha < 1 rides as `oklch(L C H / A)`, still matched by the `oklch(` prefix.
    for (const map of [["colors", tj.colors], ["colorsDark", tj.colorsDark]]) for (const [k, v] of Object.entries(map[1])) if (!/^oklch\(/i.test(v)) FAIL("design-system", `${map[0]}.${k} is not high-resolution OKLCH (bare hex is not allowed): ${v}`);
    if (!tj.type || !tj.type.scale || !Object.keys(tj.type.scale).length) FAIL("design-system", "type.scale empty");
    else for (const s of Object.values(tj.type.scale)) { if (!(s.size > 0 && s.weight > 0)) FAIL("design-system", "type.scale step not numeric"); if (!(s.lineHeight > 0 && s.lineHeight <= 4)) FAIL("design-system", `type.scale lineHeight not a factor (${s.lineHeight})`); }
    if (!Array.isArray(tj.spacing) || tj.spacing.some((v) => typeof v !== "number")) FAIL("design-system", "spacing not a numeric array");
    if (!tj.radii || Object.values(tj.radii).some((v) => typeof v !== "number")) FAIL("design-system", "radii not numeric");
    // FULL layers: semantic = every role of every enabled palette (53 x N), OKLCH, scheme parity; geometry = the full system.
    const semN = Object.keys(tj.semantic || {}).length;
    if (semN < 53 * ALL.length) FAIL("design-system", `semantic layer too small (${semN} < ${53 * ALL.length})`);
    if (Object.keys(tj.semanticDark || {}).join() !== Object.keys(tj.semantic || {}).join()) FAIL("design-system", "semanticDark keys differ from semantic (scheme parity)");
    for (const map of [["semantic", tj.semantic], ["semanticDark", tj.semanticDark]]) for (const [k, v] of Object.entries(map[1] || {})) if (!/^oklch\(/i.test(v)) { FAIL("design-system", `${map[0]}.${k} is not OKLCH: ${v}`); break; }
    const geo = tj.geometry || {};
    if (!geo.sizes || !geo.sizes.md || !(geo.sizes.md.height > 0 && geo.sizes.md.icon > 0)) FAIL("design-system", "geometry.sizes.md missing/non-numeric");
    for (const grp of ["insets", "gaps", "borders", "focus"]) if (!geo[grp] || Object.values(geo[grp]).some((v) => typeof v !== "number")) FAIL("design-system", `geometry.${grp} missing/non-numeric`);
    if (!Object.values(tj.type.scale).some((st) => typeof st.letterSpacing === "number")) FAIL("design-system", "no type.scale step carries letterSpacing (tracking dropped)");
    // ICONS — always present (an agent must never pick its own library); sizes come FROM geometry, never
    // redefined, so the icon ramp must equal the geometry ramp's per-size icon px.
    if (!tj.icons || tj.icons.family !== "Phosphor" || tj.icons.variant !== "regular") FAIL("design-system", `tokens.icons is not the default Phosphor·regular: ${JSON.stringify(tj.icons)}`);
    const geoIcons = Object.fromEntries(Object.entries(gsc.sizes).map(([k, v]) => [k.toLowerCase(), v.icon]));
    if (JSON.stringify(tj.icons.sizes) !== JSON.stringify(geoIcons)) FAIL("design-system", "tokens.icons.sizes diverges from the geometry ramp (icon sizes must never be redefined)");
    // MOTION — always present. Easings are cubic-bezier strings (an agent binds, never types); the ms
    // ladder is 4 tiers × 4 steps, strictly ascending; only compositor properties are animatable.
    const mo = tj.motion || {};
    if (!mo.easing || !mo.duration || !Array.isArray(mo.animatable)) FAIL("design-system", "tokens.motion missing easing/duration/animatable");
    else {
      for (const [k, v] of Object.entries(mo.easing)) if (!/^cubic-bezier\(/.test(v)) FAIL("design-system", `motion.easing.${k} is not a cubic-bezier(): ${v}`);
      for (const need of ["standard", "standard-decelerate", "standard-accelerate", "emphasized-decelerate", "emphasized-accelerate", "linear"]) if (!mo.easing[need]) FAIL("design-system", `motion.easing missing ${need}`);
      const ds = Object.values(mo.duration);
      if (ds.length !== 16 || ds.some((n) => !Number.isFinite(n) || n <= 0)) FAIL("design-system", `motion.duration is not 16 positive ms values (got ${ds.length})`);
      if (ds.some((n, i) => i > 0 && n <= ds[i - 1])) FAIL("design-system", "motion.duration ladder is not strictly ascending");
      if (mo.duration.short2 !== 100) FAIL("design-system", "motion.duration.short2 must be the 100ms instant floor");
      if (JSON.stringify(mo.animatable) !== JSON.stringify(["transform", "opacity"])) FAIL("design-system", "motion.animatable must be exactly transform+opacity (compositor-only)");
    }
  }

  // SELF-CONTAINMENT (standing rule): no emitted file may reference a path outside its shipped folder —
  // the consuming harness may have ONLY that folder. Gate every design-system bundle file.
  const UNREACHABLE = /\.\.\/design-system|\.\.\/_superseded|design-system-files-for-llms/;
  for (const f of files) if (UNREACHABLE.test(f.data)) FAIL("design-system", `${f.name} references a path outside the shipped folder (unreachable for the consumer)`);

  // DESIGN.md: the canonical sections, the grammar teaching, and light-dark() ONLY in the runtime block.
  const md = byName["DESIGN.md"];
  for (const sec of ["## Overview", "## Colors", "## Typography", "## Iconography", "## Motion", "## Components", "## Do's and Don'ts", "## Responsive Behavior", "## Agent Prompt Guide"]) if (!md.includes(sec)) FAIL("design-system", `spine missing ${sec}`);
  // the Motion section is the four-part contract: durations · easings · what never animates · reduced motion.
  {
    const mo = md.split("## Motion")[1].split("## Components")[0];
    if (!/100ms is the "instant" floor/.test(mo)) FAIL("design-system", "Motion section states no duration guidance");
    if (!/Entrances decelerate\. Exits accelerate/.test(mo)) FAIL("design-system", "Motion section states no enter/exit asymmetry law");
    if (!/Never animate:/.test(mo) || !/CLS defect/.test(mo)) FAIL("design-system", "Motion section carries no never-animate list");
    if (!/prefers-reduced-motion: reduce/.test(mo) || !/reduce, don't remove/.test(mo)) FAIL("design-system", "Motion section carries no reduced-motion policy");
    if (!/cubic-bezier\(/.test(mo)) FAIL("design-system", "Motion section names no easing curve");
  }
  // the icon system is a binding RULE in PROSE, never a frontmatter key (a frontmatter `icons:` trips the
  // Stitch schema linter's unknown-key check; the extra prose section rides its unknown-section tolerance).
  if (/^icons:/m.test(md.split("---")[1] || "")) FAIL("design-system", "icons must not appear as a frontmatter key (Stitch unknown-key)");
  if (!md.includes("Phosphor") || !/Icon SIZES come from the control ramp/.test(md)) FAIL("design-system", "the Iconography section does not name the library + fence sizes to the control ramp");
  if (!md.includes("### Token naming")) FAIL("design-system", "spine missing the Token naming grammar section");
  if (/^\s+[a-z0-9-]+(?:-dark)?:\s*"light-dark\(/mi.test(md)) FAIL("design-system", "light-dark() in a frontmatter carrier (Stitch rejects it)");
  if (!/color-scheme: light dark/.test(md) || !/light-dark\(oklch/.test(md)) FAIL("design-system", "no color-scheme + light-dark(oklch) runtime block");

  // BRIGHT-BRAND regression fixture (the real ADIA kit params): base fills luminous enough that the
  // MEASURED light-scheme label is the INK pole. The role table's mode-mirrored hover (darker in light)
  // then moves AGAINST the ink label — pre-fix, 7/8 families failed AA on the light hover pair (the
  // default theme masked it: its labels are white, so darkening hover *gains* contrast). dsStateFills
  // must keep every emitted state pair ≥4.5 for THIS shape too, not just the default.
  {
    const BRIGHT = { curve: "logistic", tension: 0, lmin: 4, lmax: 100, damp: 80, dampCurve: 1.2, dampAmp: 90, dampBias: -30, hueSpace: "oklch", relChroma: false, chromaFloor: 40, toneMode: "perceptual", vibrancy: 0, onColorMode: "fixed", accentRef: "single", theme: "auto", palettes: [{ name: "Neutral", hue: 225, chroma: 10, skew: -20, lift: 0, hueShift: 15, hueSameDir: false, on: true, cuspPull: 0 }, { name: "Primary", hue: 225, chroma: 85, skew: -20, lift: 0, hueShift: 10, hueSameDir: false, on: true, cuspPull: 26 }, { name: "Secondary", hue: 205, chroma: 40, skew: 0, lift: 0, hueShift: 20, hueSameDir: false, on: true, cuspPull: 25 }, { name: "Tertiary", hue: 285, chroma: 45, skew: -20, lift: 0, hueShift: 20, hueSameDir: false, on: true }, { name: "Info", hue: 265, chroma: 45, skew: -20, lift: 0, hueShift: 20, hueSameDir: false, on: true }, { name: "Success", hue: 150, chroma: 40, skew: -20, lift: -5, hueShift: 0, hueSameDir: false, on: true }, { name: "Warning", hue: 75, chroma: 50, skew: 40, lift: 15, hueShift: 30, hueSameDir: true, on: true, cuspPull: 100 }, { name: "Danger", hue: 25, chroma: 40, skew: -20, lift: -5, hueShift: 0, hueSameDir: false, on: true, cuspPull: 0 }] };
    const bf = X.exportDesignSystemBundle(BRIGHT, tsc, gsc);
    const bByName = Object.fromEntries(bf.map((f) => [f.name, f.data]));
    const bPrev = bf.filter((f) => f.name.startsWith("components/")).map((p) => ({ name: p.name.replace("components/", ""), html: p.data }));
    const bg = dsBundleGates({ designMd: bByName["DESIGN.md"], tokensJson: bByName["tokens.json"], previews: bPrev });
    const bNonG1 = bg.findings.filter((f) => f.level === "ERROR" && f.gate !== "G1");
    if (bNonG1.length > 0) FAIL("design-system", `bright-brand fixture: non-G1 gates ${bNonG1.length} fail(s) — ${bNonG1.slice(0, 4).map((f) => `[${f.gate}] ${f.msg}`).join(" | ")}`);
    // fidelity: the bright kit's values ship VERBATIM (fixed-mode G1 misses are the kit's own, disclosed)
    const bTj = JSON.parse(bByName["tokens.json"]);
    if (bTj.colors["primary"] !== bTj.semantic["primary"] || bTj.colors["primary-on-primary"] !== bTj.semantic["primary-on-primary"]) FAIL("design-system", "bright-brand fixture: export adjusted a kit value (fidelity broken)");
    const bG1 = bg.findings.filter((f) => f.level === "ERROR" && f.gate === "G1").length;
    if (bG1 > 0 && !bByName["README.md"].includes(`${bG1} derivable fill/on-pair(s) below 4.5:1`)) FAIL("design-system", "bright-brand fixture: receipt does not disclose the measured G1 count");
  }

  // the §8 gate CATCHES a broken bundle (a constant dark on-color) — proves npm test would fail on the F1 defect.
  if (tj) {
    // Inject a carrier-divergence defect into the OKLCH tokens.json: a value no kit token plausibly is
    // (#123456), so it MUST diverge from the OKLCH frontmatter and trip G3. (The old #FFFFFF injection went
    // vacuous under kit fidelity — fixed-mode dark on-colors can BE white, making white a no-op mutation.)
    const bad = JSON.parse(JSON.stringify(tj)); const onKey = Object.keys(bad.colorsDark).find((k) => /^(.+)-on-\1$/.test(k)); bad.colorsDark[onKey] = "#123456";
    const g = dsBundleGates({ designMd: md, tokensJson: bad, previews: asPreviews });
    if (!g.findings.some((f) => f.level === "ERROR" && f.gate === "G3")) FAIL("design-system", "the §8 gate does not catch a constant dark on-color (F1 — G3 carrier divergence)");
  }

  // disabled-palette fallback: all-off → tokens.json-only with a $note, no throw
  const off = X.exportDesignSystemBundle(C(RT.defaults.map((p) => ({ ...p, on: false }))), tsc, gsc);
  if (off.length !== 1 || off[0].name !== "tokens.json") FAIL("design-system", "disabled bundle is not tokens.json-only");
  try { const j = JSON.parse(off[0].data); if (j.colors) FAIL("design-system", "all-disabled emitted colors"); if (!j.$note) FAIL("design-system", "all-disabled missing $note"); } catch { FAIL("design-system", "all-disabled not valid JSON"); }
}

// ── hpg-export-design-system-catalog (#473 — exportDesignSystemComponents expanded from 7 teaching
// previews to a ~95%-usage component catalog: one card per component group, per the pinned resolution.
// Verifies the returned [{name, data}] array directly: card count/roster, the @dsCard marker + single
// shared :root structure, token-reference-only discipline (no hardcoded hex/oklch outside :root), and
// that the active-state + focus-ring tokens (which existed but were never drawn before this ticket) are
// actually referenced. Runs on the default palettes — the emitter must be theme-general.
{
  const tsc = typeScale({});
  const gsc = geomScale({});
  const state = C(ALL);
  const G = "design-system-catalog";
  const cards = X.exportDesignSystemComponents(state, tsc, gsc);

  // card count — one card per named component group (~12-14 per the resolution; the resolved roster —
  // 8 named groups + colors/spacing/card — lands at 11, so a wide-but-bounded range catches a regression
  // (a collapse back toward 7, or an unbounded per-variant explosion) without pinning an exact number.
  if (cards.length < 10 || cards.length > 18) FAIL(G, `card count ${cards.length} outside the expected ~11-14 catalog range`);
  const names = cards.map((c) => c.name);
  if (new Set(names).size !== names.length) FAIL(G, `duplicate card names: ${names.join(", ")}`);
  for (const want of ["components/colors.html", "components/buttons.html", "components/inputs.html", "components/table.html", "components/dialog.html", "components/navigation.html", "components/card.html", "components/feedback.html", "components/motion.html", "components/typography.html", "components/spacing.html"])
    if (!names.includes(want)) FAIL(G, `catalog missing expected card ${want}`);

  // marker / :root structure — every card is a self-contained @dsCard sharing exactly one :root block,
  // and none forks color on prefers-color-scheme (light-dark() must carry that branch, not a media query).
  for (const c of cards) {
    const first = c.data.trim().split("\n")[0];
    if (!first.startsWith("<!--") || !first.includes("@dsCard") || !first.includes("group=") || !first.includes("title="))
      FAIL(G, `${c.name}: first line is not a well-formed @dsCard marker`);
    if (!c.data.includes(":root{color-scheme:light dark;")) FAIL(G, `${c.name}: missing the shared :root block`);
    if ((c.data.match(/:root\{/g) || []).length !== 1) FAIL(G, `${c.name}: more than one :root block (single-block contract)`);
    if (/@media\s*\(\s*prefers-color-scheme/.test(c.data)) FAIL(G, `${c.name}: forks on prefers-color-scheme (light-dark() must carry the branch, not a media query)`);
  }

  // token-reference-only discipline — outside the shared :root declaration (where tokens are DEFINED),
  // no card may hardcode a raw hex or oklch() color literal; every color value must be a var(--...) ref.
  for (const c of cards) {
    const body = c.data.replace(/:root\{[^}]*\}/, "");
    const hexHit = body.match(/#[0-9a-fA-F]{3,8}\b/);
    if (hexHit) FAIL(G, `${c.name}: hardcoded hex color ${hexHit[0]} outside :root (every color must be a token reference)`);
    if (/oklch\(/.test(body)) FAIL(G, `${c.name}: hardcoded oklch() literal outside :root (every color must be a token reference)`);
  }

  // active-state + focus-ring tokens actually referenced (the seed's own complaint: "tokens already
  // exist but are never drawn") — both must show up as var() references on the Buttons card.
  const dsr = X.dsColorRoles(state);
  const brand = dsr.families.find((f) => /primary|brand/.test(f)) || dsr.chrome.n;
  const pfx = X.cssPrefixOf(state);
  const buttons = cards.find((c) => c.name === "components/buttons.html");
  if (!buttons) FAIL(G, "no components/buttons.html card");
  else {
    if (dsr.tokens.some((t) => t.name === `${brand}-active`) && !buttons.data.includes(`var(--${pfx}-${brand}-active)`))
      FAIL(G, "Buttons card does not reference the brand family's -active token");
    // Focus ring — real outline/outline-offset from geometry.focus, AND (the reviewed defect) the
    // ring's own color token must differ from the control's own fill token: a ring drawn in the
    // SAME token as the fill it surrounds is illegible at a 1-2px geometry-authored offset.
    const demo = (buttons.data.match(/<button class="btn btn--focus-demo" style="([^"]*)"/) || [])[1] || "";
    if (!demo) FAIL(G, "Buttons card carries no btn--focus-demo control to check the focus ring against");
    else {
      const ringMatch = /outline:\d+px solid var\((--[a-z0-9-]+)\)/.exec(demo);
      const fillMatch = /(?:^|;)background:var\((--[a-z0-9-]+)\)/.exec(demo);
      if (!ringMatch || !/outline-offset:\d+px/.test(demo)) FAIL(G, "Buttons card does not render a real focus ring (outline/outline-offset from geometry.focus)");
      else if (!fillMatch) FAIL(G, "Buttons card's focus-ring control has no token-derived fill to contrast the ring against");
      else if (ringMatch[1] === fillMatch[1]) FAIL(G, `Buttons card's focus ring (${ringMatch[1]}) is the SAME token as its control's own fill (${fillMatch[1]}) — illegible at a 1-2px offset`);
    }
  }

  // Motion card — reduced-motion is a CROSS-FADE fallback (reduce, don't remove), not a frozen preview:
  // the full-motion keyframe moves (translateX); the media-query override swaps to an opacity-only one.
  const motion = cards.find((c) => c.name === "components/motion.html");
  if (!motion) FAIL(G, "no components/motion.html card");
  else {
    if (!motion.data.includes("translateX")) FAIL(G, "Motion card never animates transform (translateX) in its default keyframe");
    const reduceBlock = (motion.data.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\}\s*\}/) || [])[1] || "";
    if (!reduceBlock) FAIL(G, "Motion card carries no prefers-reduced-motion override");
    else if (reduceBlock.includes("translateX")) FAIL(G, "Motion card's reduced-motion override still animates transform (must cross-fade opacity only)");
  }

  // Dialog card — the fixed dialog-backdrop system constant rides as a token reference, never a literal.
  const dialog = cards.find((c) => c.name === "components/dialog.html");
  if (!dialog) FAIL(G, "no components/dialog.html card");
  else if (!dialog.data.includes(`var(--${pfx}-dialog-backdrop)`)) FAIL(G, "Dialog card does not reference --{pfx}-dialog-backdrop via var()");

  // uiFont font-size pin (#477) — .btn/.pbtn (Card)/.dlg-btn (Dialog) must carry a font-size read from
  // the real UI-control MD step, not the browser default; and the Inputs .field rule must not carry a
  // bare `font:` SHORTHAND after uiFont (it resets family/size/weight/line-height to `inherit`,
  // wiping the UI voice uiFont just set — the exact defect this ticket fixes).
  {
    const uiMd = tsc && tsc.categories && tsc.categories["UI-control"] && tsc.categories["UI-control"].MD;
    const wantSize = uiMd && uiMd.size ? uiMd.size : null;
    const cardCard = cards.find((c) => c.name === "components/card.html");
    const inputsCard = cards.find((c) => c.name === "components/inputs.html");
    const fontSizeOf = (html, ruleRe) => { const m = (html || "").match(ruleRe); const fs = m && /font-size:(\d+(?:\.\d+)?)px/.exec(m[0]); return fs ? Number(fs[1]) : null; };
    const checks = [
      ["Buttons .btn", buttons, /\.btn\{[^}]*\}/],
      ["Card .pbtn", cardCard, /\.pbtn\{[^}]*\}/],
      ["Dialog .dlg-btn", dialog, /\.dlg-btn\{[^}]*\}/],
    ];
    for (const [label, c, re] of checks) {
      if (!c) continue; // already reported missing above
      const size = fontSizeOf(c.data, re);
      if (size == null) FAIL(G, `${label} carries no font-size (renders at the browser default, not the UI-control MD step)`);
      else if (wantSize != null && size !== wantSize) FAIL(G, `${label} font-size is ${size}px, expected the UI-control MD step's ${wantSize}px`);
    }
    if (!inputsCard) FAIL(G, "no components/inputs.html card");
    else {
      const fieldRule = (inputsCard.data.match(/\.field\{[^}]*\}/) || [])[0] || "";
      if (!fieldRule) FAIL(G, "Inputs card carries no .field rule to check");
      else {
        if (/font-size:(\d+(?:\.\d+)?)px/.exec(fieldRule) == null) FAIL(G, ".field rule carries no font-size (UI voice not applied)");
        if (/(?:^|;)font:\s*inherit\b/.test(fieldRule)) FAIL(G, ".field rule still carries a `font: inherit` shorthand after uiFont — it resets family/size/weight to inherit, wiping the UI voice");
      }
    }
  }

  // linear-ladder "wins while active" pin (issue #483) — geomScale's own composition-skip decision
  // (the ladder's text formula overrides the UI-control voice) must reach EVERY uiFont consumer here,
  // not just the Size-ladder preview row (which already reads per-size `s.font` directly and needed no
  // change). Re-derives the catalog with a ladder-active geomSc and checks .btn/.pbtn/.dlg-btn/.field
  // all switch from the composed UI-control MD size to the ladder's own MD font — and that turning the
  // ladder OFF again is untouched (the identity gate for this leg).
  {
    const gscLadder = geomScale({ ramp: "linear4" }, { typeScale: tsc });
    const wantLadderSize = gscLadder.sizes[LADDER_MD_STEP].font; // "3" — the ladder's own MD-equivalent, not ".MD" (numbered steps, issue #483)
    const cardsLadder = X.exportDesignSystemComponents(state, tsc, gscLadder);
    const fontSizeOf = (html, ruleRe) => { const m = (html || "").match(ruleRe); const fs = m && /font-size:(\d+(?:\.\d+)?)px/.exec(m[0]); return fs ? Number(fs[1]) : null; };
    const ladderChecks = [
      ["Buttons .btn", "components/buttons.html", /\.btn\{[^}]*\}/],
      ["Card .pbtn", "components/card.html", /\.pbtn\{[^}]*\}/],
      ["Dialog .dlg-btn", "components/dialog.html", /\.dlg-btn\{[^}]*\}/],
    ];
    for (const [label, name, re] of ladderChecks) {
      const c = cardsLadder.find((x) => x.name === name);
      const size = c && fontSizeOf(c.data, re);
      if (size !== wantLadderSize) FAIL(G, `${label} font-size while the linear ladder is active is ${size}px, expected the ladder's own MD size ${wantLadderSize}px (composition must be skipped, not just the Size-ladder row)`);
    }
    const inputsLadder = cardsLadder.find((c) => c.name === "components/inputs.html");
    const fieldRuleLadder = inputsLadder && (inputsLadder.data.match(/\.field\{[^}]*\}/) || [])[0];
    const fieldSizeLadder = fieldRuleLadder && /font-size:(\d+(?:\.\d+)?)px/.exec(fieldRuleLadder);
    if (!fieldSizeLadder || Number(fieldSizeLadder[1]) !== wantLadderSize) FAIL(G, `Inputs .field font-size while the linear ladder is active is ${fieldSizeLadder ? fieldSizeLadder[1] : "missing"}px, expected the ladder's own MD size ${wantLadderSize}px`);
    // this leg is only meaningful if the ladder's MD font actually differs from the composed UI-control
    // MD size (else the two checks above couldn't distinguish "wired correctly" from "never wired at all").
    const uiMdSize = tsc && tsc.categories && tsc.categories["UI-control"] && tsc.categories["UI-control"].MD && tsc.categories["UI-control"].MD.size;
    if (uiMdSize != null && wantLadderSize === uiMdSize) FAIL(G, "test fixture problem: the ladder's MD font must differ from the composed UI-control MD size for this leg to be meaningful");

    // mapping ruling (2026-09-02, THIRD and final: the full 10-step table, NUMBERED "0".."9") — the
    // Buttons card's Size-ladder row must render all ten numbered steps, not the default ramp's six
    // t-shirt names (it reads geomSc.sizes' own keys via orderedSizeNames, never a hardcoded list).
    const buttonsLadder = cardsLadder.find((c) => c.name === "components/buttons.html");
    const sizeRowLadder = buttonsLadder && (buttonsLadder.data.match(/<div class="size-row">[\s\S]*?<\/div>/) || [])[0];
    const sizeButtonCount = sizeRowLadder ? (sizeRowLadder.match(/<button/g) || []).length : 0;
    if (sizeButtonCount !== 10) FAIL(G, `Buttons card's Size-ladder row renders ${sizeButtonCount} controls while the linear ladder is active, expected 10 (steps 0-9)`);
    if (!sizeRowLadder || !sizeRowLadder.includes(">0<") || !sizeRowLadder.includes(">9<")) FAIL(G, "Buttons card's Size-ladder row is missing the ladder's step 0 or step 9 control");
    // and they render in ascending numeric order (step 0 first, step 9 last) — not JS's coincidental
    // integer-key reordering, but orderedSizeNames' explicit canonical-step-index sort (issue #483).
    const ladderStepOrder = [...sizeRowLadder.matchAll(/>(\d)</g)].map((m) => m[1]);
    if (ladderStepOrder.join(",") !== "0,1,2,3,4,5,6,7,8,9") FAIL(G, `Buttons card's Size-ladder row is out of order, expected steps 0-9 ascending (got ${ladderStepOrder.join(",")})`);
    // and the DEFAULT (non-ladder) catalog computed at the top of this block still renders exactly six.
    const sizeRowDefault = buttons && (buttons.data.match(/<div class="size-row">[\s\S]*?<\/div>/) || [])[0];
    const sizeButtonCountDefault = sizeRowDefault ? (sizeRowDefault.match(/<button/g) || []).length : 0;
    if (sizeButtonCountDefault !== 6) FAIL(G, `Buttons card's Size-ladder row renders ${sizeButtonCountDefault} controls on the DEFAULT ramp, expected 6 (unchanged by the ladder's existence)`);

    // checkbox/radio + switch pin — Inputs' selection controls read sizeAnchor(geomSc,"SM"/"XS")'s
    // icon, not a bare .sizes.SM/.sizes.XS (which don't exist on the ladder and used to silently fall
    // through to the hardcoded 18/16 defaults, so the Inputs card never actually followed the ladder).
    // baseHeight 40 (not the canonical 28 the rest of this leg uses) — at 28 the ladder's SM/XS-
    // equivalent icons (18/16) happen to numerically COINCIDE with the hardcoded fallback constants,
    // which would let a regressed "still reads .sizes.SM" bug pass silently.
    const gscLadder40 = geomScale({ ramp: "linear4", baseHeight: 40 }, { typeScale: tsc });
    const smAnchor = sizeAnchor(gscLadder40, "SM"), xsAnchor = sizeAnchor(gscLadder40, "XS");
    const wantCtrlIcon = smAnchor.size.icon, wantSwitchH = xsAnchor.size.icon;
    const inputsLadder40 = X.exportDesignSystemComponents(state, tsc, gscLadder40).find((c) => c.name === "components/inputs.html");
    const checkRuleLadder = (inputsLadder40.data.match(/\.ds-check,\.ds-radio\{[^}]*\}/) || [])[0] || "";
    const switchRuleLadder = (inputsLadder40.data.match(/\.ds-switch\{[^}]*\}/) || [])[0] || "";
    const checkW = (checkRuleLadder.match(/width:(\d+)px/) || [])[1];
    const switchH = (switchRuleLadder.match(/height:(\d+)px/) || [])[1];
    if (Number(checkW) !== wantCtrlIcon) FAIL(G, `Inputs .ds-check/.ds-radio width while the ladder is active is ${checkW}px, expected SM-equivalent step ${smAnchor.name}'s icon ${wantCtrlIcon}px`);
    if (Number(switchH) !== wantSwitchH) FAIL(G, `Inputs .ds-switch height while the ladder is active is ${switchH}px, expected XS-equivalent step ${xsAnchor.name}'s icon ${wantSwitchH}px`);
    // and this leg is only meaningful if the ladder's values differ from the hardcoded 18/16 fallbacks
    // (else the checks above couldn't distinguish "wired correctly" from "never wired, fell to fallback").
    if (wantCtrlIcon === 18 || wantSwitchH === 16) FAIL(G, "test fixture problem: the ladder's SM/XS-equivalent icons must differ from the 18/16 hardcoded fallbacks for this leg to be meaningful");
  }

  // Typography card — every voice's every step appears (not one cherry-picked key per tier). Anchored
  // to the EXACT caption-span markup exportDesignSystemComponents emits for a step specimen (the
  // ".cap" span's own class/style plus the "<voice-step> · size/lh · weight" triple it wraps) rather
  // than the bare "· N/M ·" fragment, which could in principle coincide with unrelated card text.
  const typo = cards.find((c) => c.name === "components/typography.html");
  const totalSteps = tsc && tsc.categories ? Object.values(tsc.categories).reduce((a, s) => a + Object.keys(s).length, 0) : 0;
  const STEP_SPAN_RE = /<span class="cap" style="font-size:11px;font-weight:400">[a-z0-9]+(?:-[a-z0-9]+)* · \d+\/\d+ · \d+<\/span>/g;
  if (!typo) FAIL(G, "no components/typography.html card");
  else if (totalSteps && (typo.data.match(STEP_SPAN_RE) || []).length !== totalSteps)
    FAIL(G, `Typography card shows ${(typo.data.match(STEP_SPAN_RE) || []).length} step specimens (anchored to the caption span structure), expected the full ${totalSteps}-step scale`);

  const md = X.exportDesignSystemSpine(state, tsc, gsc);

  // Hover-wash grammar pin (#475/#476) — {cn}-surface-dim must exist in the reduced consumption
  // grammar (not just the full semantic layer), be declared as a real custom property in the shared
  // :root (so the fallback, if ever taken, resolves rather than dangles), be taught in the Surfaces
  // prose (consumers aren't handed an untaught token), and the Table/Navigation fallback SOURCE must
  // target -surface-dim, never regress to -surface-high (a MIRRORED elevation stop, not a hover
  // wash) — the branch is unreachable at runtime under any real theme (every real palette carries
  // -hover), so a source-level check is the only way to pin the literal fallback target.
  {
    const cn = dsr.chrome.n;
    const table = cards.find((c) => c.name === "components/table.html");
    if (!dsr.tokens.some((t) => t.name === `${cn}-surface-dim`)) FAIL(G, `dsColorRoles is missing ${cn}-surface-dim (the hover-wash grammar token)`);
    if (table && !table.data.includes(`--${pfx}-${cn}-surface-dim:light-dark(`))
      FAIL(G, `shared :root does not declare --${pfx}-${cn}-surface-dim (the hover-wash fallback would dangle if ever taken)`);
    if (!md.includes(`hover wash \`{colors.${cn}-surface-dim}\``))
      FAIL(G, "DESIGN.md Surfaces bullet does not teach the -surface-dim hover-wash token");
    const dsExportSrc = readFileSync(new URL("../../src/engine/ds-export.js", import.meta.url), "utf8");
    const isHoverRule = (dsExportSrc.match(/\.dtable tr\.is-hover td\{background:\$\{[^}]*\}\}/) || [])[0] || "";
    if (!isHoverRule.includes('"-surface-dim"')) FAIL(G, "Table row-hover fallback source no longer targets -surface-dim");
    if (isHoverRule.includes('"-surface-high"')) FAIL(G, "Table row-hover fallback source regressed back to -surface-high (an elevation stop, not a hover wash)");
    const menuHoverRule = (dsExportSrc.match(/\.menu-item--hover\{background:\$\{[^}]*\}\}/) || [])[0] || "";
    if (!menuHoverRule.includes('"-surface-dim"')) FAIL(G, "Navigation menu-item hover fallback source no longer targets -surface-dim");
    if (menuHoverRule.includes('"-surface-high"')) FAIL(G, "Navigation menu-item hover fallback source regressed back to -surface-high (an elevation stop, not a hover wash)");
  }

  // AdiaUI-parity dimensional-default pins (#480) — the concrete dimension/state values this ticket
  // adopted from the AdiaUI (gen-ui-kit) spec, translated onto our own token grammar.
  {
    const cn = dsr.chrome.n;
    const table = cards.find((c) => c.name === "components/table.html");
    const buttonsCard = cards.find((c) => c.name === "components/buttons.html");
    const cardCard = cards.find((c) => c.name === "components/card.html");
    const dialogCard = cards.find((c) => c.name === "components/dialog.html");
    const feedbackCard = cards.find((c) => c.name === "components/feedback.html");
    const navCard = cards.find((c) => c.name === "components/navigation.html");

    // -outline (a real, stronger role than -outline-variant) exists in the reduced grammar and is
    // what the Table header's hairline reads — row dividers keep the subtler -outline-variant.
    if (!dsr.tokens.some((t) => t.name === `${cn}-outline`)) FAIL(G, `dsColorRoles is missing ${cn}-outline (the AdiaUI-parity strong-hairline token)`);
    if (table) {
      if (!table.data.includes(`var(--${pfx}-${cn}-outline)`)) FAIL(G, "Table header does not reference the stronger -outline hairline");
      const thRule = (table.data.match(/\.dtable th\{[^}]*\}/) || [])[0] || "";
      if (thRule.includes(`--${pfx}-${cn}-outline-variant`)) FAIL(G, "Table header uses the subtler -outline-variant instead of the stronger -outline");
      const tdRule = (table.data.match(/\.dtable td\{[^}]*\}/) || [])[0] || "";
      if (!tdRule.includes(`--${pfx}-${cn}-outline-variant`)) FAIL(G, "Table row dividers should keep the subtler -outline-variant");
    }

    // Buttons — Ghost is transparent even at rest (not Tonal's always-on fill); Tonal stands on a
    // real token fill; Active pairs its color state with the scale(0.97) press transform.
    if (buttonsCard) {
      const ghostBtn = (buttonsCard.data.match(/<button class="btn" style="([^"]*)">Ghost<\/button>/) || [])[1] || "";
      if (!ghostBtn.startsWith("background:transparent")) FAIL(G, `Ghost variant must be transparent even at rest — got: ${ghostBtn}`);
      const tonalBtn = (buttonsCard.data.match(/<button class="btn" style="([^"]*)">Tonal<\/button>/) || [])[1] || "";
      if (!/^background:var\(--/.test(tonalBtn)) FAIL(G, `Tonal variant must stand on a real token fill — got: ${tonalBtn}`);
      if (!/transform:scale\(0\.97\)/.test(buttonsCard.data)) FAIL(G, "Buttons card active/pressed state carries no scale(0.97) press transform");
    }

    // Card — the inset is a real spacing-ladder value (AdiaUI's own default inset, 16), not the old
    // hardcoded 24.
    if (cardCard) {
      const space = Object.keys(gsc.space).sort((a, b) => a - b).map((k) => gsc.space[k]);
      const wantPad = space[4] != null ? space[4] : 16;
      const panelRule = (cardCard.data.match(/\.panel\{[^}]*\}/) || [])[0] || "";
      const padMatch = /padding:(\d+)px/.exec(panelRule);
      if (!padMatch) FAIL(G, "Card .panel rule carries no padding");
      else if (Number(padMatch[1]) !== wantPad) FAIL(G, `Card padding is ${padMatch[1]}px, expected the real spacing-ladder value ${wantPad}px`);
    }

    // Dialog + Toast — the soft shadow (top-most/overlay surfaces, per our own Elevation & Depth
    // exception) is a real -scrim token reference, never a raw color.
    if (dialogCard) {
      const panelRule = (dialogCard.data.match(/\.dlg-panel\{[^}]*\}/) || [])[0] || "";
      if (!/box-shadow:[^;{}]*var\(--/.test(panelRule)) FAIL(G, "Dialog panel carries no token-derived box-shadow");
    }
    if (feedbackCard) {
      const toastRule = (feedbackCard.data.match(/\.toast\{[^}]*\}/) || [])[0] || "";
      if (!/max-width:\d+px/.test(toastRule)) FAIL(G, "Toast rule carries no max-width constraint");
      const toastEl = (feedbackCard.data.match(/<div class="toast" style="([^"]*)">/) || [])[1] || "";
      if (!/box-shadow:[^;"]*var\(--/.test(toastEl)) FAIL(G, "Toast element carries no token-derived box-shadow");
      // Badge — mono, uppercase, tracked, tabular (AdiaUI's badge typography treatment, translated
      // into our own mono voice, not their font).
      const badgeRule = (feedbackCard.data.match(/\.badge\{[^}]*\}/) || [])[0] || "";
      if (!/text-transform:uppercase/.test(badgeRule)) FAIL(G, "Badge rule is not uppercase");
      if (!/font-variant-numeric:tabular-nums/.test(badgeRule)) FAIL(G, "Badge rule does not use tabular-nums");
      if (!/letter-spacing:\.06em/.test(badgeRule)) FAIL(G, "Badge rule tracking does not match AdiaUI's 0.06em");
      // Alert radius (md, not the old sm) and Progress track height (6px, not 8px).
      const alertRule = (feedbackCard.data.match(/\.alert\{[^}]*\}/) || [])[0] || "";
      const alertRadius = /border-radius:(\d+)px/.exec(alertRule);
      const trackRule = (feedbackCard.data.match(/\.progress-track\{[^}]*\}/) || [])[0] || "";
      const trackHeight = /height:(\d+)px/.exec(trackRule);
      if (!trackHeight || Number(trackHeight[1]) !== 6) FAIL(G, `Progress track height is ${trackHeight ? trackHeight[1] : "unset"}px, expected 6px`);
      if (cardCard && alertRadius) {
        const panelRadius = /border-radius:(\d+)px/.exec((cardCard.data.match(/\.panel\{[^}]*\}/) || [])[0] || "");
        if (panelRadius && Number(alertRadius[1]) === Number(panelRadius[1])) FAIL(G, "Alert radius still matches Card's lg radius — expected the smaller md radius");
      }
    }

    // Navigation — the menu popover is a card-tier (lg) radius, and its item radius is CONCENTRIC:
    // the popover's own radius minus its own padding, never a fixed/arbitrary value.
    if (navCard && cardCard) {
      const menuRule = (navCard.data.match(/\.menu\{[^}]*\}/) || [])[0] || "";
      const menuRadius = /border-radius:(\d+)px/.exec(menuRule);
      const menuPad = /padding:(\d+)px/.exec(menuRule);
      const panelRadius = /border-radius:(\d+)px/.exec((cardCard.data.match(/\.panel\{[^}]*\}/) || [])[0] || "");
      const itemRule = (navCard.data.match(/\.menu-item\{[^}]*\}/) || [])[0] || "";
      const itemRadius = /border-radius:(\d+)px/.exec(itemRule);
      if (!menuRadius || !panelRadius || Number(menuRadius[1]) !== Number(panelRadius[1]))
        FAIL(G, `Menu popover radius (${menuRadius ? menuRadius[1] : "unset"}) should match the card-tier lg radius (${panelRadius ? panelRadius[1] : "unset"})`);
      if (!itemRadius || !menuRadius || !menuPad || Number(itemRadius[1]) !== Number(menuRadius[1]) - Number(menuPad[1]))
        FAIL(G, `Menu item radius (${itemRadius ? itemRadius[1] : "unset"}) is not concentric with the popover (radius ${menuRadius ? menuRadius[1] : "?"} minus padding ${menuPad ? menuPad[1] : "?"})`);
    }
  }

  // §8 gate parity — the expanded catalog still clears every non-G1 gate through dsBundleGates, same as
  // the full-bundle check above (this is a targeted re-run scoped to the catalog change itself).
  const tj = X.exportDesignSystemTokens(state, tsc, gsc);
  const gate = dsBundleGates({ designMd: md, tokensJson: tj, previews: cards.map((c) => ({ name: c.name.replace("components/", ""), html: c.data })) });
  const nonG1 = gate.findings.filter((f) => f.level === "ERROR" && f.gate !== "G1");
  if (nonG1.length > 0) FAIL(G, `§8 non-G1 gates: ${nonG1.length} fail(s) — ${nonG1.map((f) => `[${f.gate}] ${f.msg}`).join(" | ")}`);
}

// ── hpg-export-design-system-stitch (the Google Stitch profile: DESIGN.md ONLY — the SAME canonical spine,
// byte-identical to the Claude Code DESIGN.md — plus a Stitch-lint-framed README receipt). One core, two
// uploads: the acceptance is byte-identity of the DESIGN.md, so P3 adds NO second spine to drift.
{
  const tsc = typeScale({});
  const gsc = geomScale({});
  const stitch = X.exportDesignSystemStitchBundle(C(ALL), tsc, gsc, { date: "2026-07-05" });
  const byName = Object.fromEntries(stitch.map((f) => [f.name, f.data]));
  // Stitch consumes ONE file: exactly DESIGN.md + README.md, no tokens.json/previews.
  if (stitch.length !== 2) FAIL("design-system-stitch", `stitch bundle is not 2 files (got ${stitch.length}: ${stitch.map((f) => f.name).join(", ")})`);
  for (const layer of ["DESIGN.md", "README.md"]) if (!(layer in byName)) FAIL("design-system-stitch", `stitch bundle missing ${layer}`);

  // BYTE-IDENTITY — the Stitch DESIGN.md must equal the Claude Code DESIGN.md exactly (one canonical spine).
  const claudeSpine = X.exportDesignSystemSpine(C(ALL), tsc, gsc);
  if (byName["DESIGN.md"] !== claudeSpine) FAIL("design-system-stitch", "Stitch DESIGN.md is NOT byte-identical to the Claude Code spine");
  const claudeBundle = Object.fromEntries(X.exportDesignSystemBundle(C(ALL), tsc, gsc, { date: "2026-07-05" }).map((f) => [f.name, f.data]));
  if (byName["DESIGN.md"] !== claudeBundle["DESIGN.md"]) FAIL("design-system-stitch", "Stitch DESIGN.md diverges from the Claude Code bundle's DESIGN.md");

  // no light-dark() in the carrier (Stitch rejects it) — inherited from the shared spine, asserted here too.
  if (/^\s+[a-z0-9-]+(?:-dark)?:\s*"light-dark\(/mi.test(byName["DESIGN.md"])) FAIL("design-system-stitch", "light-dark() in the Stitch frontmatter carrier");

  // NO DUPLICATE YAML KEY — the `primary` Stitch alias must not collide with a grammar family already
  // named `primary`. C(ALL) is the canonical-defaults theme whose brand family IS `primary`, so a naive
  // always-append alias emits `primary:`/`primary-dark:` twice — a duplicate key the Stitch prelint rejects
  // (theme-generality regression: the golden's renamed brand family hid this). Each must appear exactly once.
  const fm = (byName["DESIGN.md"].match(/^---\n([\s\S]*?)\n---/) || [, ""])[1];
  for (const k of ["primary", "primary-dark"]) {
    const n = (fm.match(new RegExp(`^  ${k}:`, "gm")) || []).length;
    if (n !== 1) FAIL("design-system-stitch", `frontmatter \`${k}:\` appears ${n}× (expected exactly 1 — a duplicate YAML key fails the Stitch prelint)`);
  }

  // Stitch-profile README receipt: distinct header + the single-file / byte-identical / lint framing.
  const rm = byName["README.md"];
  if (!/design-system-for-google-stitch — Stitch profile export/.test(rm)) FAIL("design-system-stitch", "README is not the Stitch profile receipt");
  if (!/`DESIGN\.md` only/.test(rm)) FAIL("design-system-stitch", "Stitch receipt missing the single-file note");
  if (!/same canonical core/.test(rm)) FAIL("design-system-stitch", "Stitch receipt missing the one-canonical-core note");
  if (!/complete on its own/.test(rm)) FAIL("design-system-stitch", "Stitch receipt missing the self-containment note");
  if (!/prelint\.py check`: 0 errors/.test(rm)) FAIL("design-system-stitch", "Stitch receipt missing the prelint 0-errors gate");
  if (!/orphaned-tokens/.test(rm)) FAIL("design-system-stitch", "Stitch receipt missing the orphaned-tokens lint note");

  // SELF-CONTAINMENT: the upload set must never reference a path outside its shipped folder.
  const UNREACHABLE_S = /\.\.\/design-system|\.\.\/_superseded|design-system-files-for-llms/;
  for (const f of stitch) if (UNREACHABLE_S.test(f.data)) FAIL("design-system-stitch", `${f.name} references a path outside the shipped folder`);

  // disabled-palette: all-off → empty upload set (nothing to upload), no throw.
  const off = X.exportDesignSystemStitchBundle(C(RT.defaults.map((p) => ({ ...p, on: false }))), tsc, gsc);
  if (off.length !== 0) FAIL("design-system-stitch", "disabled Stitch bundle is not empty");
}

// ── hpg-export-design-system-make (the Figma Make profile: a routed guidelines/ tree). The gate of
// record is make_guidelines_check.py (D1–D6, D10, D11) — python, run manually against emitted scratch
// dirs for both the default theme and a hand-authored theme (see the handoff); this block asserts the
// SAME shape/content predicates in JS so `npm test` stays the zero-dependency gate. Runs on the DEFAULT
// palettes (C(ALL)) — the emitter must be theme-general, no hardcoded brand names/values.
{
  const tsc = typeScale({});
  const gsc = geomScale({});
  const make = X.exportDesignSystemMakeBundle(C(ALL), tsc, gsc, { date: "2026-07-05" });
  const byName = Object.fromEntries(make.map((f) => [f.name, f.data]));
  const wantFiles = ["guidelines/Guidelines.md", "guidelines/setup.md", "guidelines/styles.css",
    "guidelines/foundations/color.md", "guidelines/foundations/typography.md", "guidelines/foundations/spacing.md",
    "guidelines/components/overview.md", "guidelines/components/button.md", "README.md"];
  if (make.length !== wantFiles.length) FAIL("design-system-make", `make bundle is not ${wantFiles.length} files (got ${make.length}: ${make.map((f) => f.name).join(", ")})`);
  for (const f of wantFiles) if (!(f in byName)) FAIL("design-system-make", `bundle missing ${f}`);

  // D10 carrier — styles.css is exportShadcn() in the MEASURED on-color mode (R1: the shadcn projection
  // forces onColorMode:"contrast" so the dark foregrounds are the contrast-passing pole, like dsColorRoles;
  // raw "fixed"-mode shadcn ships white foregrounds that fail AA on the brightened dark fills).
  const styles = byName["guidelines/styles.css"];
  // The projection is exportShadcn in contrast mode with the LINKING opts the bundle passes: aliasPrefix
  // (every color value a var() into the token layer), radii (--radius from the real geometry, never the
  // 0.625rem fallback), fonts (the @theme font slots setup.md promises).
  const shadcnPart = X.exportShadcn({ ...C(ALL), onColorMode: "contrast" }, { aliasPrefix: "c", radii: Object.fromEntries(Object.entries(gsc.radii)), fonts: tsc.fonts });
  if (!styles.startsWith(shadcnPart)) FAIL("design-system-make", "styles.css does not START with the aliased contrast-mode shadcn projection");
  if (!/--primary:\s*var\(--c-primary\);/.test(styles)) FAIL("design-system-make", "shadcn tokens are not LINKED (var()) to the design-token layer");
  if (/--radius:\s*0\.625rem/.test(styles)) FAIL("design-system-make", "--radius fell back to the shadcn default instead of the geometry md corner");
  if (!/--font-sans:/.test(styles)) FAIL("design-system-make", "@theme font slots missing (setup.md promises them)");
  if (!styles.includes("FULL token layers")) FAIL("design-system-make", "styles.css missing the appended full token layers");
  // the appendix must land AFTER the @theme block so the D10 parse (first :root -> .dark -> @theme) is untouched
  if (styles.indexOf("FULL token layers") < styles.indexOf("@theme inline {")) FAIL("design-system-make", "full-layer appendix must come after @theme inline (D10 parse safety)");
  // TEXT-RENDERING BASELINE — Make carries it as REAL CSS in styles.css AND as prose in typography.md.
  for (const probe of ["-webkit-font-smoothing:antialiased", "font-synthesis:none", "font-optical-sizing:auto", "code, pre, kbd { font-variant-ligatures: none; }"])
    if (!styles.includes(probe)) FAIL("design-system-make", `styles.css missing the text-rendering baseline: ${probe}`);
  const makeTypo = byName["guidelines/foundations/typography.md"];
  for (const probe of ["font-synthesis: none", "-webkit-font-smoothing: antialiased", "code, pre, kbd { font-variant-ligatures: none; }"])
    if (!makeTypo.includes(probe)) FAIL("design-system-make", `typography.md missing the text-rendering baseline: ${probe}`);
  // every var() link must RESOLVE to a concrete value in both schemes (the map contract survives aliasing)
  const rmap = X.dsShadcnRuntimeMap(styles);
  for (const tok of ["--background", "--primary", "--primary-foreground", "--destructive", "--border"]) {
    const e = rmap[tok];
    if (!e || !/^(oklch\(|#)/.test(e.light) || !/^(oklch\(|#)/.test(e.dark)) FAIL("design-system-make", `${tok} does not resolve to concrete values through the link layer`);
  }
  // the fixed --overlay constant resolves too, through the SAME link mechanism, to the SAME value in
  // both schemes (an overlay doesn't flip) — proves dsFullLayersCss actually defines the alias target
  // the aliased shadcn projection points at (D10 for a non-palette token, not just palette roles).
  {
    const e = rmap["--overlay"];
    if (!e || e.light !== "oklch(0 0 0 / 80%)" || e.dark !== "oklch(0 0 0 / 80%)") FAIL("design-system-make", `--overlay does not resolve to the fixed backdrop value in both schemes (got ${JSON.stringify(e)})`);
  }
  // KIT-FIDELITY guard — the resolved shadcn foregrounds must equal the kit's own on-role values
  // (tokens.json semantic layer, same state): the projection may never re-measure or re-point a label.
  {
    const tjm = JSON.parse(X.exportDesignSystemTokens(C(ALL), tsc, gsc));
    for (const [tok, sem] of [["--primary-foreground", "primary-on-primary"], ["--primary", "primary"], ["--background", "neutral-background"]]) {
      const e = rmap[tok];
      if (!e) { FAIL("design-system-make", `${tok} missing from the resolved runtime map`); continue; }
      if (e.light !== tjm.semantic[sem] || e.dark !== tjm.semanticDark[sem]) FAIL("design-system-make", `resolved ${tok} != the kit's ${sem} role — the projection adjusted a kit value (fidelity broken)`);
    }
  }

  // SELF-CONTAINMENT: no file may reference a path outside the shipped folder (`../styles.css` WITHIN
  // guidelines/ is fine — same shipped tree; sibling design-system folders are not).
  const UNREACHABLE_M = /\.\.\/design-system|\.\.\/_superseded|design-system-files-for-llms/;
  for (const f of make) if (UNREACHABLE_M.test(f.data)) FAIL("design-system-make", `${f.name} references a path outside the shipped folder`);

  // D6 — Guidelines.md hard rules (>=1 "Do NOT" + the literal word "IMPORTANT").
  const gmd = byName["guidelines/Guidelines.md"];
  if (!/\bDo NOT\b/.test(gmd)) FAIL("design-system-make", "Guidelines.md missing a 'Do NOT' rule");
  if (!/IMPORTANT/.test(gmd)) FAIL("design-system-make", "Guidelines.md missing the IMPORTANT marker");

  // D1 — Guidelines.md routes to every leaf; overview.md routes to button.md.
  for (const rel of ["setup.md", "foundations/color.md", "foundations/typography.md", "foundations/spacing.md", "components/overview.md", "components/button.md"])
    if (!gmd.includes(rel)) FAIL("design-system-make", `Guidelines.md does not route to ${rel}`);
  if (!byName["guidelines/components/overview.md"].includes("button.md")) FAIL("design-system-make", "overview.md does not route to button.md");

  // D5 — button.md names hover + carries a color literal or a -hover/-active token reference.
  const btn = byName["guidelines/components/button.md"];
  if (!/\bhover\b/i.test(btn)) FAIL("design-system-make", "button.md does not name 'hover'");
  if (!/-hover\b/.test(btn) && !btn.includes("var(--")) FAIL("design-system-make", "button.md hover state carries no color literal or -hover/-active token reference");

  // D11 — no px leading/tracking anywhere in the tree.
  for (const [nm, data] of Object.entries(byName)) {
    if (/(?:line-height|letter-spacing)\s*:\s*[^;\n]*?\d[\d.]*px/i.test(data) || /\|\s*[\d.]+\s*\/\s*[\d.]+\s*px/i.test(data))
      FAIL("design-system-make", `${nm} carries a px leading/tracking value`);
  }

  // D4 — a paste-ready light-dark() block, with color-scheme: light dark declared in the SAME file.
  const colorMd = byName["guidelines/foundations/color.md"];
  if (!/light-dark\(/.test(colorMd)) FAIL("design-system-make", "no light-dark() runtime block in foundations/color.md");
  if (!/color-scheme:\s*light dark/.test(colorMd)) FAIL("design-system-make", "light-dark() block missing its color-scheme: light dark declaration");

  // D2/D3 — the grammar-token reference table: every row carries light AND dark (parity), and (per
  // R1/dsColorRoles' contrast guarantee) every fill/on-fill pair clears 4.5:1 in both schemes.
  const tokenRowRe = /^\|\s*`(--[a-z0-9-]+)`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|/gim;
  let tokenRows = 0;
  for (const m of colorMd.matchAll(tokenRowRe)) tokenRows++;
  if (tokenRows === 0) FAIL("design-system-make", "no `--token` grammar rows found in foundations/color.md (D2 needs >=1)");

  // D10 (measured, not left UNMEASURED) — the runtime block's tokens equal the SHIPPED styles.css
  // parse (kit fidelity: same state, same carrier, links resolved — never a re-forced mode).
  const rtMap = X.dsShadcnRuntimeMap(styles);
  if (Object.keys(rtMap).length === 0) FAIL("design-system-make", "dsShadcnRuntimeMap parsed no tokens");
  for (const [tok, { light, dark }] of Object.entries(rtMap))
    if (!colorMd.includes(`${tok}: light-dark(${light}, ${dark})`)) FAIL("design-system-make", `color.md runtime block diverges from the shadcn carrier for ${tok}`);

  // README.md is the figma-make profile receipt, citing the gate of record.
  const rm = byName["README.md"];
  if (!/design-system-for-figma-make — Figma Make profile export/.test(rm)) FAIL("design-system-make", "README is not the figma-make profile receipt");
  if (!/make_guidelines_check\.py/.test(rm)) FAIL("design-system-make", "README does not cite make_guidelines_check.py as the gate of record");
  if (!rm.includes(`/* ultimate-tokens export schema ${X.EXPORT_SCHEMA_VERSION} */`)) FAIL("design-system-make", "README does not cite the styles.css schema stamp");

  // theme-general — no hardcoded golden-theme (Studio 54) names leak into a default-theme run.
  const allText = Object.values(byName).join("\n").toLowerCase();
  for (const bad of ["spotlight", "beam", "mirror", "dancefloor", "studio 54"])
    if (allText.includes(bad)) FAIL("design-system-make", `hardcoded theme-specific name '${bad}' leaked into the theme-general emitter`);

  // disabled-palette: all-off → empty array (nothing to upload), like the Stitch bundle.
  const off = X.exportDesignSystemMakeBundle(C(RT.defaults.map((p) => ({ ...p, on: false }))), tsc, gsc);
  if (off.length !== 0) FAIL("design-system-make", "disabled make bundle is not empty");
}

// ── hpg-export-design-system-data (#516 — the ds-export `data` tier + DESIGN.md "Data series"
// section). REQ-031: data palettes are excluded from `others`/`families` (no hover/active/disabled/
// container treatment) and form their own tier; DESIGN.md gains a short listing, only when present.
{
  const tsc = typeScale({});
  const gsc = geomScale({});
  const stateData = C(ALL_WITH_DATA);
  const ds = X.dsColorRoles(stateData);
  const wantData = DATA_8.map((_, i) => `data-${i + 1}`);

  if (JSON.stringify(ds.dataFamilies) !== JSON.stringify(wantData)) FAIL("design-system-data", `dataFamilies = ${JSON.stringify(ds.dataFamilies)}, want ${JSON.stringify(wantData)}`);
  if (ds.families.some((f) => wantData.includes(f))) FAIL("design-system-data", "a data-N slug leaked into ds.families");
  // minimal token: the prime + its on-color (a legend label pairing, and what the §8 G7 gate
  // requires of every fill) are present, but none of the interactive-family states — proves the
  // `others` exclusion actually bit.
  for (const f of ds.dataFamilies) {
    if (!ds.tokens.some((t) => t.name === f)) FAIL("design-system-data", `dsColorRoles missing the data prime token for ${f}`);
    if (!ds.tokens.some((t) => t.name === `${f}-on-${f}`)) FAIL("design-system-data", `dsColorRoles missing the data on-color for ${f}`);
    for (const suffix of ["-hover", "-active", "-disabled", "-container", "-container-low", "-container-high"]) {
      if (ds.tokens.some((t) => t.name === `${f}${suffix}`)) FAIL("design-system-data", `data tier ${f} unexpectedly carries the full-family token ${f}${suffix}`);
    }
  }

  // no data palettes enabled → no data tier, no Data series section (the pre-#516 shape, untouched).
  const dsNoData = X.dsColorRoles(C(BRAND_ONLY));
  const mdNoData = X.exportDesignSystemSpine(C(BRAND_ONLY), tsc, gsc);
  if (dsNoData.dataFamilies.length !== 0) FAIL("design-system-data", "dataFamilies non-empty with no data palettes enabled");
  if (mdNoData.includes("## Data series")) FAIL("design-system-data", "DESIGN.md carries a Data series section with no data palettes enabled");

  // data palettes enabled → DESIGN.md gains the section, listing every data family with a
  // {colors.data-N} reference that actually resolves in tokens.json (frontmatter/tokens.json accord).
  const mdData = X.exportDesignSystemSpine(stateData, tsc, gsc);
  if (!mdData.includes("## Data series")) FAIL("design-system-data", "DESIGN.md missing the Data series section with data palettes enabled");
  const tjData = JSON.parse(X.exportDesignSystemTokens(stateData, tsc, gsc));
  for (const f of wantData) {
    if (!mdData.includes(`\`{colors.${f}}\``)) FAIL("design-system-data", `Data series section missing a reference to ${f}`);
    if (!tjData.colors[f]) FAIL("design-system-data", `tokens.json colors missing ${f} referenced by the Data series section`);
  }
  // REQ-030: the FULL semantic layer's per-palette loop needs no edit — 53 x 16 entries.
  if (Object.keys(tjData.semantic).length !== 53 * ALL_WITH_DATA.length) FAIL("design-system-data", `semantic layer = ${Object.keys(tjData.semantic).length} entries, want 53 * ${ALL_WITH_DATA.length} = ${53 * ALL_WITH_DATA.length}`);

  // the extra section rides the unknown-section tolerance: every canonical section still present,
  // and Data series sits between Colors and Typography (never reorders the canonical 8).
  for (const sec of ["## Overview", "## Colors", "## Typography", "## Components", "## Do's and Don'ts"]) if (!mdData.includes(sec)) FAIL("design-system-data", `spine missing ${sec} once Data series is present`);
  if (!(mdData.indexOf("## Colors") < mdData.indexOf("## Data series") && mdData.indexOf("## Data series") < mdData.indexOf("## Typography"))) FAIL("design-system-data", "Data series section is not positioned between Colors and Typography");

  // a real bundle run with data palettes enabled still clears every non-G1 §8 gate.
  const files = X.exportDesignSystemBundle(stateData, tsc, gsc, { date: "2026-09-11" });
  const byNameD = Object.fromEntries(files.map((f) => [f.name, f.data]));
  const previewsD = files.filter((f) => f.name.startsWith("components/")).map((p) => ({ name: p.name.replace("components/", ""), html: p.data }));
  const gateD = dsBundleGates({ designMd: byNameD["DESIGN.md"], tokensJson: byNameD["tokens.json"], previews: previewsD });
  const nonG1D = gateD.findings.filter((f) => f.level === "ERROR" && f.gate !== "G1");
  if (nonG1D.length > 0) FAIL("design-system-data", `§8 non-G1 gates fail with data palettes enabled: ${nonG1D.map((f) => `[${f.gate}] ${f.msg}`).join(" | ")}`);
}

// ── hpg-export-design-system-prime (#541 — the ds-export `prime` block per family in tokens.json +
// DESIGN.md's "Prime swatches" section). REQ-054 / AC-031's prime part: every enabled palette
// (chrome/others/intents AND data-N) carries its seven identity swatches in the DS bundle,
// byte-identical to exportJSON's own canonical prime block; DESIGN.md gains a short section,
// present UNCONDITIONALLY (unlike the opt-in Data series) between Colors and Typography, shared
// byte-for-byte by the Claude Code and Stitch profiles (one core, two uploads).
{
  const tsc = typeScale({});
  const gsc = geomScale({});
  const stateData = C(ALL_WITH_DATA);
  const ds = X.dsColorRoles(stateData);
  const rawJson = X.exportJSON(stateData);
  const allFamilies = [...ds.families, ...ds.dataFamilies];

  for (const f of allFamilies) {
    const p = ds.prime[f];
    if (!p) { FAIL("design-system-prime", `dsColorRoles.prime missing family ${f}`); continue; }
    if (Object.keys(p).join() !== PRIME_STEPS.join()) FAIL("design-system-prime", `dsColorRoles.prime[${f}] step order = ${Object.keys(p).join()}, want ${PRIME_STEPS.join()}`);
    for (const step of PRIME_STEPS) {
      const want = rawJson[f] && rawJson[f].prime[step];
      if (!want) { FAIL("design-system-prime", `exportJSON missing ${f}.prime.${step} to compare against`); continue; }
      if (p[step].hex !== want.hex || p[step].oklch !== want.oklch) FAIL("design-system-prime", `dsColorRoles.prime[${f}].${step} = ${JSON.stringify(p[step])}, want ${JSON.stringify(want)} (exportJSON)`);
    }
  }

  // tokens.json carries the SAME prime block, byte-identical to dsColorRoles' own (no re-derivation).
  const tj = JSON.parse(X.exportDesignSystemTokens(stateData, tsc, gsc));
  if (JSON.stringify(tj.prime) !== JSON.stringify(ds.prime)) FAIL("design-system-prime", "tokens.json prime block diverges from dsColorRoles.prime");

  // DESIGN.md gains the section unconditionally — present even with NO data palettes enabled.
  const mdNoData = X.exportDesignSystemSpine(C(BRAND_ONLY), tsc, gsc);
  if (!mdNoData.includes("## Prime swatches")) FAIL("design-system-prime", "DESIGN.md missing the Prime swatches section with no data palettes enabled");
  for (const f of X.dsColorRoles(C(BRAND_ONLY)).families) if (!mdNoData.includes(`${f}-prime-`)) FAIL("design-system-prime", `Prime swatches section (no data) missing a reference to ${f}`);

  const mdData = X.exportDesignSystemSpine(stateData, tsc, gsc);
  if (!mdData.includes("## Prime swatches")) FAIL("design-system-prime", "DESIGN.md missing the Prime swatches section with data palettes enabled");
  for (const f of allFamilies) if (!mdData.includes(`${f}-prime-`)) FAIL("design-system-prime", `Prime swatches section missing a reference to ${f}`);

  // position: never reorders the canonical 8; Prime swatches sits between Colors and Typography.
  for (const sec of ["## Overview", "## Colors", "## Typography", "## Components", "## Do's and Don'ts"]) if (!mdData.includes(sec)) FAIL("design-system-prime", `spine missing ${sec} once Prime swatches is present`);
  if (!(mdData.indexOf("## Colors") < mdData.indexOf("## Prime swatches") && mdData.indexOf("## Prime swatches") < mdData.indexOf("## Typography"))) FAIL("design-system-prime", "Prime swatches section is not positioned between Colors and Typography");

  // Stitch shares the SAME canonical spine byte-for-byte (one core, two uploads) — the byte-identity
  // check above already proves Stitch's DESIGN.md carries the SAME Prime swatches section and every
  // family reference the Claude Code profile does; asserted explicitly here too so the Stitch profile
  // is its own named proof, not just inherited from the Claude Code assertions above.
  const stitchFiles = X.exportDesignSystemStitchBundle(stateData, tsc, gsc, { date: "2026-09-11" });
  const stitchMd = stitchFiles.find((f) => f.name === "DESIGN.md").data;
  if (stitchMd !== mdData) FAIL("design-system-prime", "Stitch DESIGN.md diverges from the Claude Code DESIGN.md once Prime swatches is present");
  if (!stitchMd.includes("## Prime swatches")) FAIL("design-system-prime", "Stitch DESIGN.md missing the Prime swatches section");
  for (const f of allFamilies) if (!stitchMd.includes(`${f}-prime-`)) FAIL("design-system-prime", `Stitch DESIGN.md Prime swatches section missing a reference to ${f}`);

  // Figma Make profile (a DIFFERENT shape — no DESIGN.md/tokens.json, a guidelines/ tree): the prime
  // section lives in foundations/color.md and the seven-step values live as raw CSS custom properties
  // in styles.css's FULL token layers appendix (dsFullLayersCss) — proven per-profile, not inherited
  // from the byte-identity check above (Make's carrier is NOT byte-identical to DESIGN.md).
  const pfx = X.cssPrefixOf(stateData);
  const makeFiles = X.exportDesignSystemMakeBundle(stateData, tsc, gsc, { date: "2026-09-11" });
  const makeByName = Object.fromEntries(makeFiles.map((f) => [f.name, f.data]));
  const makeColorMd = makeByName["guidelines/foundations/color.md"];
  const makeStyles = makeByName["guidelines/styles.css"];
  if (!makeColorMd.includes("## Prime swatches")) FAIL("design-system-prime", "Make foundations/color.md missing the Prime swatches section with data palettes enabled");
  for (const f of allFamilies) {
    if (!makeColorMd.includes(`${f}-prime-`)) FAIL("design-system-prime", `Make foundations/color.md Prime swatches section missing a reference to ${f}`);
    for (const step of PRIME_STEPS) {
      const want = rawJson[f] && rawJson[f].prime[step];
      if (!want) continue;
      if (!makeStyles.includes(`--${pfx}-${f}-prime-${step}: ${want.oklch};`)) FAIL("design-system-prime", `Make styles.css missing/mismatched --${pfx}-${f}-prime-${step} (want ${want.oklch})`);
    }
  }
  // unconditional like Claude Code/Stitch — present even with NO data palettes enabled.
  const makeFilesNoData = X.exportDesignSystemMakeBundle(C(BRAND_ONLY), tsc, gsc, { date: "2026-09-11" });
  const makeColorMdNoData = Object.fromEntries(makeFilesNoData.map((f) => [f.name, f.data]))["guidelines/foundations/color.md"];
  if (!makeColorMdNoData.includes("## Prime swatches")) FAIL("design-system-prime", "Make foundations/color.md missing the Prime swatches section with no data palettes enabled");
  for (const f of X.dsColorRoles(C(BRAND_ONLY)).families) if (!makeColorMdNoData.includes(`${f}-prime-`)) FAIL("design-system-prime", `Make foundations/color.md Prime swatches section (no data) missing a reference to ${f}`);

  // a real bundle run still clears every non-G1 §8 gate with the new section present.
  const files = X.exportDesignSystemBundle(stateData, tsc, gsc, { date: "2026-09-11" });
  const byName = Object.fromEntries(files.map((f) => [f.name, f.data]));
  const previews = files.filter((f) => f.name.startsWith("components/")).map((p) => ({ name: p.name.replace("components/", ""), html: p.data }));
  const gate = dsBundleGates({ designMd: byName["DESIGN.md"], tokensJson: byName["tokens.json"], previews });
  const nonG1 = gate.findings.filter((f) => f.level === "ERROR" && f.gate !== "G1");
  if (nonG1.length > 0) FAIL("design-system-prime", `§8 non-G1 gates fail once Prime swatches is present: ${nonG1.map((f) => `[${f.gate}] ${f.msg}`).join(" | ")}`);

  // disabled palettes: dsColorRoles(state) → null → tokens.json falls back to the note-only shape.
  const offTokens = JSON.parse(X.exportDesignSystemTokens(C(RT.defaults.map((p) => ({ ...p, on: false }))), tsc, gsc));
  if ("prime" in offTokens) FAIL("design-system-prime", "disabled-palette tokens.json unexpectedly carries a prime block");
}

// ── hpg-export-group-metadata (SPEC 0.3.0 RP-1, ticket #572, plan PR #571 step E1) — the palette
// group (material/brand/system/data) is exported METADATA on every surface that has a metadata slot
// (JSON, DTCG's raw file, a CSS/OKLCH/Tailwind comment line, the DS bundle's familiesByGroup) and is
// ABSENT from UI3/ShadCN (no metadata slot short of `description`, #556's own no-Figma-folder ruling)
// — every emitted group is one of the four valid ids AND matches model.mjs's paletteGroup(p), the
// single resolver (no drift between the metadata and the real resolver).
{
  const VALID_GROUPS = ["material", "brand", "system", "data"];
  const tsc = typeScale({});
  const gsc = geomScale({});
  const gstate = C(ALL_WITH_DATA);
  const derived = X.derivedAll(gstate); // [{name, n, group, ...}] — group per exports.js's own derivePalette

  const gjson = X.exportJSON(gstate);
  const gdtcg = X.exportDTCG(gstate, {});
  const gcss = X.exportCSS(gstate);
  const goklch = X.exportOKLCH(gstate);
  const gtw = X.exportTailwind(gstate);
  const gui3 = X.exportUI3(gstate);
  const gshadcn = X.exportShadcn(gstate);
  const gds = X.dsColorRoles(gstate);

  for (const d of derived) {
    // ALL_WITH_DATA's fixture palettes carry no explicit `.group` — paletteGroup(p)'s own by-name
    // default rule is what resolves them, the SAME rule exports.js's paletteGroupOf mirrors.
    const src = ALL_WITH_DATA.find((p) => p.name === d.name);
    const want = paletteGroup(src);
    if (!VALID_GROUPS.includes(d.group)) FAIL("hpg-export-group-metadata", `derivePalette group "${d.group}" for "${d.name}" is not one of ${VALID_GROUPS.join("/")}`);
    if (d.group !== want) FAIL("hpg-export-group-metadata", `derivePalette group for "${d.name}" is "${d.group}", want "${want}" (paletteGroup(p))`);

    // JSON — palettes[n].group
    const j = gjson[d.n];
    if (!j || !VALID_GROUPS.includes(j.group)) FAIL("hpg-export-group-metadata", `JSON group for "${d.name}" is ${JSON.stringify(j && j.group)}, want one of ${VALID_GROUPS.join("/")}`);
    else if (j.group !== want) FAIL("hpg-export-group-metadata", `JSON group for "${d.name}" is "${j.group}", want "${want}"`);

    // DTCG — the RAW file's palette group node carries $extensions["com.ultimate-tokens"].group;
    // the two SEMANTIC theme files must NEVER carry it (RP-1: raw file only).
    const rawNode = gdtcg["palette.tokens.json"][d.n];
    const dtcgExt = rawNode && rawNode.$extensions && rawNode.$extensions["com.ultimate-tokens"];
    if (!dtcgExt || !VALID_GROUPS.includes(dtcgExt.group)) FAIL("hpg-export-group-metadata", `DTCG raw group for "${d.name}" is ${JSON.stringify(dtcgExt)}, want one of ${VALID_GROUPS.join("/")}`);
    else if (dtcgExt.group !== want) FAIL("hpg-export-group-metadata", `DTCG raw group for "${d.name}" is "${dtcgExt.group}", want "${want}"`);
    for (const themeFile of ["Light_tokens.json", "Dark_tokens.json"]) {
      const themeNode = gdtcg[themeFile][d.n];
      if (themeNode && themeNode.$extensions && themeNode.$extensions["com.ultimate-tokens"]) FAIL("hpg-export-group-metadata", `DTCG ${themeFile} palette node for "${d.name}" unexpectedly carries com.ultimate-tokens group metadata (raw file only, per RP-1)`);
    }

    // CSS / OKLCH / Tailwind — one ADDED comment line per palette block, never a token.
    const commentLine = `/* ${d.name} · ${want} */`;
    if (!gcss.includes(commentLine)) FAIL("hpg-export-group-metadata", `CSS missing group comment for "${d.name}" (want "${commentLine}")`);
    if (!goklch.includes(commentLine)) FAIL("hpg-export-group-metadata", `OKLCH missing group comment for "${d.name}" (want "${commentLine}")`);
    if (!gtw.includes(commentLine)) FAIL("hpg-export-group-metadata", `Tailwind missing group comment for "${d.name}" (want "${commentLine}")`);
  }

  // negative check: UI3 and ShadCN carry NOTHING group-shaped — no group id/keyword anywhere.
  const groupWordRe = /"material"|"brand"|"system"|com\.ultimate-tokens|"group"\s*:/;
  if (groupWordRe.test(JSON.stringify(gui3))) FAIL("hpg-export-group-metadata", "UI3 output unexpectedly carries group metadata (ruled out — no Figma metadata slot, #556)");
  if (groupWordRe.test(gshadcn)) FAIL("hpg-export-group-metadata", "ShadCN output unexpectedly carries group metadata (fixed contract, no groups)");

  // DS bundle — familiesByGroup partitions EXACTLY the union of families + dataFamilies, one bucket
  // per valid group, alongside the existing flat `families` (kept, unchanged, for consumers).
  for (const g of VALID_GROUPS) if (!Array.isArray(gds.familiesByGroup && gds.familiesByGroup[g])) FAIL("hpg-export-group-metadata", `dsColorRoles.familiesByGroup missing/invalid group "${g}"`);
  else {
    const wantMembers = derived.filter((d) => d.group === g).map((d) => d.n).sort();
    const gotMembers = [...gds.familiesByGroup[g]].sort();
    if (JSON.stringify(gotMembers) !== JSON.stringify(wantMembers)) FAIL("hpg-export-group-metadata", `dsColorRoles.familiesByGroup["${g}"] = ${JSON.stringify(gotMembers)}, want ${JSON.stringify(wantMembers)}`);
  }
  const allDsFamilies = [...gds.families, ...gds.dataFamilies].sort();
  const bucketed = VALID_GROUPS.flatMap((g) => gds.familiesByGroup[g]).sort();
  if (JSON.stringify(bucketed) !== JSON.stringify(allDsFamilies)) FAIL("hpg-export-group-metadata", `familiesByGroup does not partition families+dataFamilies exactly (bucketed=${JSON.stringify(bucketed)}, want ${JSON.stringify(allDsFamilies)})`);

  // Figma Make profile's "Grammar token reference" table — the one literal per-family markdown
  // table in the DS bundle — gains a Group column matching familiesByGroup.
  const makeFiles = X.exportDesignSystemMakeBundle(gstate, tsc, gsc, { date: "2026-09-11" });
  const makeColorMd = Object.fromEntries(makeFiles.map((f) => [f.name, f.data]))["guidelines/foundations/color.md"];
  if (!makeColorMd.includes("| Token | Group | Fill (Light) | Fill (Dark) | On (Light) | On (Dark) | Use |")) FAIL("hpg-export-group-metadata", "Make foundations/color.md grammar table missing the Group column header");
  for (const f of gds.families) {
    const g = VALID_GROUPS.find((grp) => gds.familiesByGroup[grp].includes(f));
    if (!makeColorMd.includes(`\`--${X.cssPrefixOf(gstate)}-${f}\` | ${g} |`)) FAIL("hpg-export-group-metadata", `Make foundations/color.md grammar table row for "${f}" missing/mismatched Group cell (want "${g}")`);
  }

  // brandKit / MCP list_palettes — every entry's group is valid and matches paletteGroup(p).
  const dd = defaultDocument();
  const kit = brandKit(dd);
  for (const kp of kit.palettes) {
    const src2 = dd.palettes.find((p) => p.name === kp.name);
    const want2 = paletteGroup(src2);
    if (!VALID_GROUPS.includes(kp.group)) FAIL("hpg-export-group-metadata", `brandKit palette "${kp.name}" group "${kp.group}" is not one of ${VALID_GROUPS.join("/")}`);
    else if (kp.group !== want2) FAIL("hpg-export-group-metadata", `brandKit palette "${kp.name}" group "${kp.group}" !== paletteGroup(p) "${want2}"`);
  }
}

// ── hpg-export-json-meta (SPEC 0.3.0 RP-2, ticket #573, plan PR #571 step E2) — exportJSON's
// top-level `meta` states the chroma policy the export was resolved under: `generator` names the
// tool, `controls` deep-equals stateOf(doc)'s OWN resolved baseChroma/primeChroma/paletteGroups —
// never a stale or independently re-derived snapshot. `doc` below carries NON-default controls
// (every group differs from GROUP_DEFAULTS, the two global fallbacks differ from 100/100) so the
// deep-equal actually exercises resolution, not a default-vs-default match that would pass even if
// exportJSON ignored `state` entirely. `schemaVersion` itself is covered by the hpg-export-schema-stamp
// gate below (E6, #577), not here.
{
  const doc = {
    ...defaultDocument(),
    baseIntensity: 42,
    primeChroma: 77,
    paletteGroups: {
      material: { baseChroma: 12, primeChroma: 34 },
      brand: { baseChroma: 56, primeChroma: 78 },
      system: { baseChroma: 90, primeChroma: 11 },
      data: { baseChroma: 100, primeChroma: 100 }, // data stays locked to its own default (REQ-002)
    },
  };
  const state = stateOf(doc);
  const json = X.exportJSON(state);
  if (!json.meta || typeof json.meta !== "object") FAIL("hpg-export-json-meta", "exportJSON output missing top-level meta");
  else {
    if (json.meta.generator !== "Ultimate Tokens") FAIL("hpg-export-json-meta", `meta.generator = ${JSON.stringify(json.meta.generator)}, want "Ultimate Tokens"`);
    const c = json.meta.controls;
    if (!c || typeof c !== "object") FAIL("hpg-export-json-meta", "meta.controls missing");
    else {
      if (c.baseChroma !== state.baseChroma) FAIL("hpg-export-json-meta", `meta.controls.baseChroma = ${c.baseChroma}, want stateOf(doc).baseChroma ${state.baseChroma}`);
      if (c.primeChroma !== state.primeChroma) FAIL("hpg-export-json-meta", `meta.controls.primeChroma = ${c.primeChroma}, want stateOf(doc).primeChroma ${state.primeChroma}`);
      if (JSON.stringify(c.paletteGroups) !== JSON.stringify(state.paletteGroups)) FAIL("hpg-export-json-meta", `meta.controls.paletteGroups drifted from stateOf(doc).paletteGroups: ${JSON.stringify(c.paletteGroups)} vs ${JSON.stringify(state.paletteGroups)}`);
      // not a trivial pass: the resolved values must actually be the doc's own non-default numbers.
      if (c.baseChroma !== 42) FAIL("hpg-export-json-meta", `meta.controls.baseChroma didn't resolve the doc's own non-default value (got ${c.baseChroma}, want 42)`);
      if (c.primeChroma !== 77) FAIL("hpg-export-json-meta", `meta.controls.primeChroma didn't resolve the doc's own non-default value (got ${c.primeChroma}, want 77)`);
      if (c.paletteGroups.brand.baseChroma !== 56 || c.paletteGroups.brand.primeChroma !== 78) FAIL("hpg-export-json-meta", `meta.controls.paletteGroups.brand didn't resolve the doc's own non-default override (got ${JSON.stringify(c.paletteGroups.brand)})`);
    }
  }

  // brandKit carries the SAME controls block (RP-2's other surface), resolved from the SAME doc.
  const kit = brandKit(doc);
  if (!kit.controls || typeof kit.controls !== "object") FAIL("hpg-export-json-meta", "brandKit(doc) missing controls");
  else if (JSON.stringify(kit.controls) !== JSON.stringify(json.meta.controls)) FAIL("hpg-export-json-meta", `brandKit(doc).controls disagrees with exportJSON's meta.controls: ${JSON.stringify(kit.controls)} vs ${JSON.stringify(json.meta.controls)}`);
}

// ── hpg-export-schema-stamp (SPEC 0.3.0 RP-8, ticket #577, plan PR #571 step E6) — one
// EXPORT_SCHEMA_VERSION stamped, verbatim, on every surface that can carry it: JSON meta,
// DTCG root $extensions (all 3 files), UI3 $schema, a first-line comment on CSS/OKLCH/Tailwind/
// ShadCN/Panda module/Radix module, the DS bundle's tokens.json + DESIGN.md frontmatter, and
// the brand-kit $schema. (ticket #606: the gate originally missed the Panda/Radix module stamps.)
// `v` is a HARDCODED literal (2), deliberately never X.EXPORT_SCHEMA_VERSION itself — reading the
// constant back to build the expectation would make this gate vacuous (it would degrade in
// lockstep with the very thing under test, proven live: neutering the constant to `undefined`
// left every check here passing). Bumping the real constant is expected to turn this red until
// `v` is bumped alongside it in the same PR — that IS the bump-rule contract, not a bug in the gate.
{
  const G = "hpg-export-schema-stamp";
  const v = 3;
  const doc = defaultDocument();
  const state = stateOf(doc);
  const tsc = typeScale({});
  const gsc = geomScale({});
  const stampComment = `/* ultimate-tokens export schema ${v} */`;

  if (X.exportCSS(state).split("\n")[0] !== stampComment) FAIL(G, `CSS first line is not the schema stamp comment (want ${JSON.stringify(stampComment)})`);
  if (X.exportOKLCH(state).split("\n")[0] !== stampComment) FAIL(G, `OKLCH first line is not the schema stamp comment (want ${JSON.stringify(stampComment)})`);
  if (X.exportTailwind(state).split("\n")[0] !== stampComment) FAIL(G, `Tailwind first line is not the schema stamp comment (want ${JSON.stringify(stampComment)})`);
  if (X.exportShadcn(state).split("\n")[0] !== stampComment) FAIL(G, `ShadCN first line is not the schema stamp comment (want ${JSON.stringify(stampComment)})`);
  if (X.exportPandaModule(X.exportPanda(state)).split("\n")[0] !== stampComment) FAIL(G, `Panda module first line is not the schema stamp comment (want ${JSON.stringify(stampComment)})`);
  if (X.exportRadixModule(X.exportRadix(state)).split("\n")[0] !== stampComment) FAIL(G, `Radix module first line is not the schema stamp comment (want ${JSON.stringify(stampComment)})`);

  const json = X.exportJSON(state);
  if (!json.meta || json.meta.schemaVersion !== v) FAIL(G, `JSON meta.schemaVersion = ${JSON.stringify(json.meta && json.meta.schemaVersion)}, want ${v}`);

  const dtcg = X.exportDTCG(state);
  const dtcgFiles = Object.keys(dtcg);
  if (dtcgFiles.length !== 3) FAIL(G, `expected 3 DTCG files (got ${dtcgFiles.length}: ${dtcgFiles.join(", ")})`);
  for (const file of dtcgFiles) {
    const ext = dtcg[file].$extensions && dtcg[file].$extensions["com.ultimate-tokens"];
    if (!ext || ext.schemaVersion !== v) FAIL(G, `DTCG ${file} root $extensions["com.ultimate-tokens"].schemaVersion = ${JSON.stringify(ext && ext.schemaVersion)}, want ${v}`);
  }

  const ui3 = X.exportUI3(state);
  if (ui3.$schema !== `figma-ui3-variables.color.schema.v${v}`) FAIL(G, `UI3 $schema = ${JSON.stringify(ui3.$schema)}, want figma-ui3-variables.color.schema.v${v}`);

  const tj = JSON.parse(X.exportDesignSystemTokens(state, tsc, gsc));
  if (tj.$schemaVersion !== v) FAIL(G, `DS tokens.json $schemaVersion = ${JSON.stringify(tj.$schemaVersion)}, want ${v}`);

  const md = X.exportDesignSystemSpine(state, tsc, gsc);
  const fm = (md.match(/^---\n([\s\S]*?)\n---/) || [, ""])[1];
  if (!new RegExp(`^tokensSchema: ${v}$`, "m").test(fm)) FAIL(G, `DESIGN.md frontmatter is missing "tokensSchema: ${v}"`);

  // Figma Make ships no DESIGN.md/tokens.json — styles.css's inherited shadcn first-line comment IS
  // its schema carrier (E6 follow-up, ticket #607), cited explicitly in the profile's own README receipt.
  const makeFiles = X.exportDesignSystemMakeBundle(state, tsc, gsc);
  const makeStyles = makeFiles.find((f) => f.name === "guidelines/styles.css");
  if (!makeStyles || makeStyles.data.split("\n")[0] !== stampComment) FAIL(G, `Make styles.css first line is not the schema stamp comment (want ${JSON.stringify(stampComment)})`);
  const makeReadme = makeFiles.find((f) => f.name === "README.md");
  if (!makeReadme || !makeReadme.data.includes(stampComment)) FAIL(G, "Make README does not cite the schema stamp comment");

  const kit = brandKit(doc);
  if (kit.$schema !== `ultimate-tokens-brand-kit/${v}`) FAIL(G, `brandKit $schema = ${JSON.stringify(kit.$schema)}, want ultimate-tokens-brand-kit/${v}`);
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
// The printed set is this declared list UNION every gate name that actually reached a FAIL(...)
// call (#699, following #695's pattern in test/engine/tonal.mjs), so a gate missing from the list
// below still shows up, loudly, instead of hiding behind a neighbouring gate's "pass" row.
// "prefix" was the live hole (#699 correction): it had 8 real call sites but was never declared.
// The 12 "radix-refs-*" gates, "design-system-catalog" and "hpg-export-schema-stamp" call FAIL
// through a per-block const named G bound to the gate name, rather than a literal string directly
// in the call, which is why an earlier naive grep over this file mistook all 14 for dead declared
// names with no call site at all, when they are in fact real, live gates. gateReport()'s
// self-check resolves that indirection (see gate-report.mjs).
const DECLARED = ["dtcg-shape", "themes", "leaf-valid", "resolved", "css-resolves", "padding", "oncolors", "disabled-palette", "nonempty", "dialog-backdrop", "white-black", "tailwind", "shadcn", "shadcn-baseline", "panda", "radix", "radix-keys-drift", "radix-collision", "radix-refs-values-unchanged", "radix-refs-shape", "radix-refs-raw-pin", "radix-refs-role-pin", "radix-refs-parity", "radix-refs-alpha", "radix-refs-extras", "radix-refs-clones", "radix-refs-collision", "radix-refs-prefix", "radix-refs-module", "radix-refs-sentinel", "data-palette", "shadcn-chart-6-8", "keycolors", "keycolors-dtcg", "keycolors-ui3", "prime", "prime-dtcg", "prime-ui3", "design-system", "design-system-catalog", "design-system-stitch", "design-system-make", "design-system-data", "design-system-prime", "hpg-export-group-metadata", "hpg-export-json-meta", "hpg-export-schema-stamp", "prefix", "report-static"];
gateReport({ fails, declared: DECLARED, selfUrl: import.meta.url, FAIL });
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: export-formats clears all [gate] predicates");
process.exit(0);
