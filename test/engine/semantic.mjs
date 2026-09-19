#!/usr/bin/env node
// verify.mjs — semantic-mapping validation adapter (CRITIC side; deny-on-write to the advancer).
// Checks rubric.system.semantic-mapping's [gate]s against ./semantic.js vs the canonical role-table.json.
// Exit 0=pass / 1=fail; validate.py mints the signal from this status.
//
// Module ESM contract (./semantic.js):
//   semanticRoles(paletteName) -> [{ key, suffix, light, dark }]   (53 rows)
//   refKey(ref) -> padded ref ("50"->"050", "500-200"->"500-200")
import { readFileSync } from "node:fs";
import * as S from "../../src/engine/semantic.js";
// model.mjs is the SINGLE place the accent/on-color pairing is resolved (semanticRoles ->
// applyAccentRef -> applyOnColorContrast -> role overrides, then brandKit's kit.roles). The
// role-contrast gate below reads that resolved kit and model's own contrastRatio, exactly as the
// MCP `contrastLint` does, so the gate and the lint can never disagree about which two colors pair.
import { defaultDocument, brandKit, contrastRatio, slug, stateOf, projectView } from "../../src/ui/model.mjs";
// the Park leg (#636) measures the SECOND derivation of the same pairing: exports.js's derivedAll,
// which is the object radixColorGroup reads, on the default document and on the committed Adia brand
// document (PRESETS is the generated mirror of docs/reference/colors/categories/brands.json that
// scripts/gen-adia-derived-exports.mjs reads; `hydrate` is the same loader it uses).
import { derivedAll } from "../../src/engine/exports.js";
import { PRESETS } from "../../src/ui/categories/brands.js";
import { hydrate } from "../../src/ui/persist.js";
// The Adia preset's name is READ OUT of the generator's source rather than imported: importing
// gen-adia-derived-exports.mjs would run it (it writes its artifacts at module scope), and a
// hand-copied literal here would silently stop pointing at the shipped document the day the
// generator's pin moves. Regex, so the two can never disagree without this gate saying so.
const ADIA_PRESET_NAME = (() => {
  const src = readFileSync(new URL("../../scripts/gen-adia-derived-exports.mjs", import.meta.url), "utf8");
  const m = src.match(/export const PRESET_NAME = "([^"]+)"/);
  return m ? m[1] : null;
})();

const RT = JSON.parse(readFileSync(new URL("../../docs/reference/data/role-table.json", import.meta.url), "utf8"));
const CANON = RT.roleTable;                         // the canonical primary-palette table (answer key)
const { EXPORT_STOPS, SCRIM_BASES, SCRIM_STEPS } = RT.constants;
const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };

const ROLES = S.semanticRoles("primary");
const byKey = Object.fromEntries(ROLES.map((r) => [r.key, r]));
const isScrim = (ref) => /^\d+-\d+$/.test(ref);   // "{base}-{step}", multi-digit step (alpha% = step/10)
const stopOf = (ref) => parseInt(ref, 10);
const validPrim = (ref) => {
  if (isScrim(ref)) { const [b, step] = ref.split("-").map(Number); return SCRIM_BASES.includes(b) && EXPORT_STOPS.includes(step); }
  return EXPORT_STOPS.includes(parseInt(ref, 10));
};

// ── hpg-semantic-roles: exactly 53 roles; exactly 7 scrims, all on the 500 ramp (alpha% = step/10) ─
if (ROLES.length !== 53) FAIL("roles", `got ${ROLES.length} roles, want 53`);
const scrims = ROLES.filter((r) => /^scrim/.test(r.key));
if (scrims.length !== 7) FAIL("roles", `got ${scrims.length} scrim roles, want 7`);
for (const s of scrims) {
  const okScrim = s.light === s.dark && /^500-\d+$/.test(s.light) && SCRIM_STEPS.includes(Number(s.light.split("-")[1]));
  if (!okScrim) FAIL("roles", `scrim ${s.key} not a 500-ramp step (${s.light}/${s.dark})`);
}

// ── hpg-semantic-oncolors: on{N} === 50 stop both modes; on{N}Variant === 200 ────────────
const on = byKey["onPrimary"], onV = byKey["onPrimaryVariant"];
if (!(on && on.light === "50" && on.dark === "50")) FAIL("oncolors", `onPrimary = ${on && on.light}/${on && on.dark}, want 50/50`);
if (!(onV && onV.light === "200" && onV.dark === "200")) FAIL("oncolors", `onPrimaryVariant = ${onV && onV.light}/${onV && onV.dark}, want 200/200`);

// ── hpg-semantic-refs-canonical: deep-equal canonical AND every ref resolves to a primitive ─
const canonByKey = Object.fromEntries(CANON.map((r) => [r.key, r]));
if (ROLES.map((r) => r.key).join(",") !== CANON.map((r) => r.key).join(",")) FAIL("refs-canonical", "ordered key set != canonical");
for (const r of ROLES) {
  const c = canonByKey[r.key];
  if (!c) { FAIL("refs-canonical", `extra role ${r.key} not in canonical`); continue; }
  if (r.light !== c.light || r.dark !== c.dark || r.suffix !== c.suffix)
    FAIL("refs-canonical", `${r.key} = ${r.suffix} ${r.light}/${r.dark} != canonical ${c.suffix} ${c.light}/${c.dark}`);
  if (!validPrim(r.light) || !validPrim(r.dark)) FAIL("refs-canonical", `${r.key} ref ${r.light}/${r.dark} not a valid primitive`);
}

// ── hpg-semantic-surface-mode: Low/High mirror (sum 1000); Dim/Bright do NOT ──────────────
const mirror = (k) => { const r = byKey[k]; return r && !isScrim(r.light) && stopOf(r.light) + stopOf(r.dark) === 1000; };
for (const k of ["surfaceLowest", "surfaceLower", "surfaceLow", "surfaceHigh", "surfaceHigher", "surfaceHighest"])
  if (!mirror(k)) FAIL("surface-mode", `${k} must mirror (sum 1000): ${byKey[k] && byKey[k].light}/${byKey[k] && byKey[k].dark}`);
for (const k of ["surfaceDimmest", "surfaceDimmer", "surfaceDim", "surfaceBright", "surfaceBrighter", "surfaceBrightest"])
  if (mirror(k)) FAIL("surface-mode", `${k} must NOT mirror: ${byKey[k] && byKey[k].light}/${byKey[k] && byKey[k].dark}`);

// ── refKey + palette-name substitution (success palette substitutes name, shared roles unchanged) ─
if (S.refKey("50") !== "050" || S.refKey("500-200") !== "500-200") FAIL("refs-canonical", `refKey wrong: ${S.refKey("50")}, ${S.refKey("500-200")}`);
const succ = S.semanticRoles("success");
if (!succ.some((r) => r.key === "onSuccess") || !succ.some((r) => r.key === "successDim") || !succ.some((r) => r.key === "surfaceDim"))
  FAIL("roles", "palette-name substitution wrong for 'success' (expect onSuccess, successDim, shared surfaceDim)");

// ── on-color contrast (OD-001 opt-in): applyOnColorContrast flips on{N}/on{N}Variant to the
//    better-WCAG-contrast end vs the accent fill (550/450) per mode; a no-op unless "contrast". ──
{
  const P = S.semanticRoles("primary");
  const onMain0 = P.find((r) => r.suffix === "-on-primary");
  // fixed (default) → unchanged
  const fixed = S.applyOnColorContrast(P, "primary", () => 0.5, "fixed");
  const fm = fixed.find((r) => r.suffix === "-on-primary");
  if (fm.light !== onMain0.light || fm.dark !== onMain0.dark) FAIL("oncolors", "fixed mode must not alter on-colors");
  // contrast + LIGHT accent fill → dark on-colors (on{N}→950, on{N}Variant→800)
  const lumLight = (ref) => ({ "550": 0.8, "450": 0.75, "050": 0.95, "950": 0.03, "200": 0.7, "800": 0.12 }[ref] ?? 0.5);
  const cl = S.applyOnColorContrast(P, "primary", lumLight, "contrast");
  const cm = cl.find((r) => r.suffix === "-on-primary"), cv = cl.find((r) => r.suffix === "-on-primary-variant");
  if (cm.light !== "950" || cm.dark !== "950") FAIL("oncolors", `contrast/light fill: on-primary ${cm.light}/${cm.dark}, want 950/950`);
  if (cv.light !== "800" || cv.dark !== "800") FAIL("oncolors", `contrast/light fill: on-primary-variant ${cv.light}/${cv.dark}, want 800/800`);
  // contrast + DARK accent fill → light on-colors (on{N}→050)
  const lumDark = (ref) => ({ "550": 0.12, "450": 0.08, "050": 0.95, "950": 0.03, "200": 0.7, "800": 0.12 }[ref] ?? 0.5);
  const dm = S.applyOnColorContrast(P, "primary", lumDark, "contrast").find((r) => r.suffix === "-on-primary");
  if (dm.light !== "050" || dm.dark !== "050") FAIL("oncolors", `contrast/dark fill: on-primary ${dm.light}/${dm.dark}, want 050/050`);
  // non-on roles untouched in contrast mode
  const surf = cl.find((r) => r.key === "surface"), surf0 = P.find((r) => r.key === "surface");
  if (surf.light !== surf0.light || surf.dark !== surf0.dark) FAIL("oncolors", "contrast mode must not touch non-on roles");
}

// ── prime-accent ref: applyAccentRef "single" maps the prime accent (empty suffix) to 500/500;
//    "mode" (default) leaves 550/450; nothing else (variants, on-colors, surfaces) moves. ──
{
  const P = S.semanticRoles("primary");
  const prime0 = P.find((r) => r.suffix === "");
  if (!prime0 || prime0.light !== "550" || prime0.dark !== "450") FAIL("oncolors", `prime accent default ${prime0 && prime0.light}/${prime0 && prime0.dark}, want 550/450`);
  // "mode" (default) → unchanged
  const m = S.applyAccentRef(P, "mode").find((r) => r.suffix === "");
  if (m.light !== "550" || m.dark !== "450") FAIL("oncolors", "applyAccentRef 'mode' must not change the prime accent");
  // "single" → 500/500 on the prime accent only
  const sgl = S.applyAccentRef(P, "single");
  const ps = sgl.find((r) => r.suffix === "");
  if (ps.light !== "500" || ps.dark !== "500") FAIL("oncolors", `applyAccentRef 'single': prime ${ps.light}/${ps.dark}, want 500/500`);
  // a variant (e.g. -dim) and a non-accent role (surface) are untouched
  const dim = sgl.find((r) => r.suffix === "-dim"), dim0 = P.find((r) => r.suffix === "-dim");
  const sf = sgl.find((r) => r.key === "surface"), sf0 = P.find((r) => r.key === "surface");
  if (dim.light !== dim0.light || dim.dark !== dim0.dark) FAIL("oncolors", "applyAccentRef 'single' must not touch accent variants");
  if (sf.light !== sf0.light || sf.dark !== sf0.dark) FAIL("oncolors", "applyAccentRef 'single' must not touch non-accent roles");
}

// ── hpg-semantic-identity-stops: identityStops(roles) = the solid refs of the 5 identity roles, REPLACE semantics
// after applyAccentRef (spec-muted-base-key-spikes REQ-004, EX-3). tonal.js no longer consumes this set (the
// ramp-level identity-stop chroma lift was retired, #536, dropping the paletteStops parameter this function's
// result used to feed) — so the cross-file parity assertion this gate used to carry (against tonal.js's
// DEFAULT_IDENTITY_STOPS literal, since removed) is gone too; this gate now only checks identityStops() itself,
// kept exported for a possible future standalone prime-swatch system.
{
  const same = (a, b) => a instanceof Set && b instanceof Set && a.size === b.size && [...a].every((x) => b.has(x));
  const mode = S.identityStops(S.applyAccentRef(ROLES, "mode"));
  const want = new Set([350, 400, 450, 550, 650, 700]);
  if (!same(mode, want)) FAIL("identity-stops", `'mode' set ${JSON.stringify([...mode])}, want ${JSON.stringify([...want])}`);
  const single = S.identityStops(S.applyAccentRef(ROLES, "single"));
  if (!same(single, new Set([350, 400, 500, 650, 700]))) FAIL("identity-stops", `'single' set ${JSON.stringify([...single])}, want [350,400,500,650,700] (450/550 must drop out — replace, not union)`);
  // sorted ascending, numbers, and no scrim refs leak in
  const arr = [...mode];
  if (arr.some((x, i) => typeof x !== "number" || (i && x < arr[i - 1]))) FAIL("identity-stops", "set must be ascending numbers");
  if ([...S.identityStops(ROLES)].some((x) => !Number.isInteger(x))) FAIL("identity-stops", "scrim refs must be ignored");
  // the answer key is untouched: identityStops is NOT a role
  if (ROLES.some((r) => /identity/i.test(r.key))) FAIL("identity-stops", "identityStops must not add a role");
}

// ── hpg-role-contrast (#647, widened at #662): every family's ACCENT must stay readable against its
//    own on-color, in both schemes. #647 made the perceptual ramp honour a palette's skew and lift,
//    which exposed that Warning's shipped skew 40 / lift 15 put its accent at 2.18:1 against its
//    pinned light on-color, and that "even" mode had been shipping 1.90:1 unnoticed. That ruling was
//    Warning-only, so the other families stayed pinned wherever they sat — several of them under AA.
//
//    #662 closed that gap at the POLICY layer rather than the ramp: `onColorMode` now defaults to
//    "contrast", and when neither ramp end clears 4.5:1 against the accent fill the on-color falls
//    through to the white/black constant (semantic.js's applyOnColorContrast). No stop moved. So the
//    ruled floor is now AA 4.5:1 for ALL SIXTEEN families (8 semantic + 8 data), both schemes, and it
//    is met in every tone mode — including "peak", which before #662 was the worst of the three
//    (Secondary 1.24, Success 1.58, Info 2.44, Warning 2.52 in the dark scheme) and is now the best.
//
//    The pair is read off brandKit's resolved kit.roles — the same object, via the same resolution
//    ladder, that mcp/describe-mcp-core.mjs's contrastLint reads — so this gate cannot drift from the
//    lint's notion of "the accent" (550 light / 450 dark, per accentRef "mode") or "the on-color".
//
//    The per-family floors stay a RATCHET on top of the ruled floor: each is that family's own
//    measured ratio floored to one decimal, never below AA. An intentional default change has to move
//    a number here deliberately; an accidental one reds. Every entry is now >= 4.5, so nothing in this
//    table records a shipped miss any more. The table was re-measured whole on top of #657, whose
//    OKHSL hue solver returns its best iterate and shifts a few perceptual accents by one 8-bit step;
//    that change is folded into these numbers rather than tracked separately.
//
//    Re-measured whole again on top of #681 U2: every default palette now carries `anchor`, and
//    model.mjs's projectView + exports.js's derivePalette were fixed to actually forward it into
//    paletteStops (a "subset-object gap" — they were building narrowed object literals for the
//    engine call that silently dropped the new `anchor` field, so the live app/exports had been
//    silently rendering the OLD, un-anchored ramp all along). With that fixed, every family's real
//    accent/on-color pair moved. Perceptual and peak now measure IDENTICAL ratios: the anchored
//    branch's ladder (tonal.js's `okhslStopsAnchored`) is mode-independent by design — the anchor
//    IS the ramp's vivid identity point already, so the even/cusp vibrancy blend that used to tell
//    "perceptual" and "peak" apart plays no role here (see the comment above `okhslStopsAnchored`).
//
//    Re-measured a THIRD time (review pif-u2-review-1.md, F2): the anchored branches' saturation basis
//    now lerps from the anchor's own measured chroma/`s` at stop 500 toward the group's resolved ramp
//    chroma at each side's endpoint (see okhslStopsAnchored's own comment), replacing the earlier
//    single-target basis that put a chroma notch at the pivot. Every family stayed >= AA in every
//    mode; perceptual/peak stayed identical (the blend still keys off `anchorWarp`'s `w`, which does
//    not depend on toneMode).
//
//    Re-measured a FOURTH time (U2 repair pass, re-diagnosis Findings 1+2): the F2 blend above was
//    itself a fork (per re-diagnosis Finding 1) and is retracted; anchored chroma now routes through
//    U3's own chromaEnvelope, keyed on liftStop, the anchor's own OKHSL s / CAM16 chroma as the pivot
//    basis (Finding 1). The anchored tone construction also now composes toneAt's curve, tension,
//    vibrancy and hueSpace with the pivot instead of a straight lerp (Finding 2/F4, ruled 2026-09-18:
//    controls stay live). Both changes only move OFF-pivot stops. Consequence of F4: perceptual and
//    peak are NO LONGER identical for anchored palettes (the gate this ticket's F4 required) — every
//    family stayed >= the ruled AA 4.5 floor in every mode, both schemes; 46 of the 96 entries moved
//    below their PRE-#681 (origin/main, bf2aaf6) value, none below 4.5. Recorded by name in
//    `.sdlc/questions/pif-u2.md` Q-U2-5 (Finding 5) rather than re-pinned silently, since the F2 defect
//    this repair pass retracts was itself downstream of that same forked blend.
//
//    The PARK leg (#636) checks the same pairing through the OTHER derivation — exports.js's
//    derivedAll, which is what radixColorGroup reads for Park's `solid.bg` (step 9 = the bare accent
//    role) and `solid.fg` (`on-accent` = the `-on-{n}` role) — on the default document AND on the
//    committed Adia brand document, so a policy that passed via model.mjs cannot fail via the
//    exporters. ────────────────────────────────────────────────────────────────────────────────────
{
  const hexToRgb = (hex) => [0, 2, 4].map((i) => parseInt(String(hex).slice(1 + i, 3 + i), 16));
  const AA = 4.5;                                   // the ruled floor (#662): every family, both schemes
  // [family, light floor, dark floor] — max(AA, own measured ratio floored to 1 decimal)
  const FLOORS = {
    perceptual: [
      ["Neutral", 7.3, 5.1],   // measured 7.40 / 5.15
      ["Primary", 7.5, 5.2],   // measured 7.58 / 5.29
      ["Secondary", 5.2, 5.2],   // measured 5.24 / 5.22
      ["Tertiary", 8.3, 5.9],   // measured 8.35 / 5.93
      ["Info", 7.2, 5.0],   // measured 7.30 / 5.04
      ["Success", 7.7, 5.4],   // measured 7.70 / 5.41
      ["Warning", 8.0, 4.7],   // measured 8.06 / 4.73
      ["Danger", 8.6, 6.2],   // measured 8.70 / 6.24
      ["Data 1", 6.0, 4.6],   // measured 6.02 / 4.69
      ["Data 2", 6.3, 4.7],   // measured 6.33 / 4.76
      ["Data 3", 6.1, 4.9],   // measured 6.10 / 4.94
      ["Data 4", 5.6, 4.7],   // measured 5.67 / 4.80
      ["Data 5", 5.4, 5.0],   // measured 5.43 / 5.05
      ["Data 6", 5.1, 5.2],   // measured 5.16 / 5.28
      ["Data 7", 5.2, 5.1],   // measured 5.28 / 5.15
      ["Data 8", 5.4, 5.0],   // measured 5.44 / 5.00
    ],
    even: [
      ["Neutral", 6.9, 5.3],   // measured 6.97 / 5.38
      ["Primary", 7.2, 5.6],   // measured 7.20 / 5.61
      ["Secondary", 4.9, 4.8],   // measured 4.95 / 4.87
      ["Tertiary", 7.9, 6.2],   // measured 7.93 / 6.22
      ["Info", 6.8, 5.3],   // measured 6.89 / 5.36
      ["Success", 7.3, 5.7],   // measured 7.32 / 5.72
      ["Warning", 7.9, 5.3],   // measured 7.94 / 5.31
      ["Danger", 8.3, 6.5],   // measured 8.35 / 6.55
      ["Data 1", 5.6, 4.7],   // measured 5.65 / 4.78
      ["Data 2", 6.0, 4.6],   // measured 6.01 / 4.67
      ["Data 3", 5.8, 4.5],   // measured 5.82 / 4.53
      ["Data 4", 5.4, 4.9],   // measured 5.44 / 4.97
      ["Data 5", 5.1, 4.6],   // measured 5.14 / 4.68
      ["Data 6", 4.8, 4.9],   // measured 4.89 / 4.92
      ["Data 7", 5.0, 4.8],   // measured 5.03 / 4.83
      ["Data 8", 5.1, 4.6],   // measured 5.15 / 4.66
    ],
    peak: [
      ["Neutral", 6.8, 5.3],   // measured 6.87 / 5.38
      ["Primary", 7.1, 5.5],   // measured 7.10 / 5.60
      ["Secondary", 4.9, 4.8],   // measured 4.92 / 4.85
      ["Tertiary", 7.8, 6.2],   // measured 7.85 / 6.22
      ["Info", 6.7, 5.3],   // measured 6.80 / 5.32
      ["Success", 7.2, 5.7],   // measured 7.28 / 5.70
      ["Warning", 7.8, 5.3],   // measured 7.86 / 5.36
      ["Danger", 8.2, 6.5],   // measured 8.27 / 6.58
      ["Data 1", 5.6, 4.8],   // measured 5.64 / 4.84
      ["Data 2", 5.9, 4.7],   // measured 5.97 / 4.74
      ["Data 3", 5.7, 4.5],   // measured 5.75 / 4.56
      ["Data 4", 5.3, 4.9],   // measured 5.39 / 4.95
      ["Data 5", 5.1, 4.7],   // measured 5.13 / 4.72
      ["Data 6", 4.9, 4.9],   // measured 4.90 / 4.92
      ["Data 7", 5.0, 4.7],   // measured 5.01 / 4.79
      ["Data 8", 5.1, 4.6],   // measured 5.14 / 4.68
    ],
  };
  let checked = 0;
  for (const mode of ["perceptual", "even", "peak"]) {
    const doc = defaultDocument();
    doc.toneMode = mode;
    const kit = brandKit(doc, { color: true });
    for (const [family, lightFloor, darkFloor] of FLOORS[mode]) {
      const key = slug(family);
      const roles = kit.roles && kit.roles[key];
      const accent = roles && roles[key];
      const on = roles && roles["on" + key.charAt(0).toUpperCase() + key.slice(1)];
      if (!accent || !on) { FAIL("role-contrast", `${mode} ${family}: no accent/on-color pair in kit.roles — the resolution ladder changed shape`); continue; }
      const light = contrastRatio(hexToRgb(accent.light), hexToRgb(on.light));
      const dark = contrastRatio(hexToRgb(accent.dark), hexToRgb(on.dark));
      checked += 2;
      // the RULED floor first, stated separately from the ratchet so the ruling is legible in the text
      if (light < AA) FAIL("role-contrast", `${mode} ${family} LIGHT: accent ${accent.light} on ${on.light} = ${light.toFixed(2)}:1, under the ruled WCAG AA floor ${AA}:1 (#662) — fix the on-color policy, do not lower this gate`);
      if (dark < AA) FAIL("role-contrast", `${mode} ${family} DARK: accent ${accent.dark} on ${on.dark} = ${dark.toFixed(2)}:1, under the ruled WCAG AA floor ${AA}:1 (#662) — fix the on-color policy, do not lower this gate`);
      if (light < lightFloor) FAIL("role-contrast", `${mode} ${family} LIGHT: accent ${accent.light} on ${on.light} = ${light.toFixed(2)}:1, below its pinned floor ${lightFloor}:1`);
      if (dark < darkFloor) FAIL("role-contrast", `${mode} ${family} DARK: accent ${accent.dark} on ${on.dark} = ${dark.toFixed(2)}:1, below its pinned floor ${darkFloor}:1`);
    }
  }
  if (checked !== 96) FAIL("role-contrast", `compared ${checked} accent/on-color pairs, want 96 (16 families x 3 tone modes x 2 schemes)`);

  // ── the PARK leg (#636): the SAME pairing through exports.js's own derivation. Park's `solid.fg`
  //    sits on `solid.bg`; radixColorGroup builds step 9 from the bare accent role and `on-accent`
  //    from the `-on-{n}` role, both off derivedAll's resolved `r.light.rgb` / `r.dark.rgb`. Measured
  //    on the default document and on the committed Adia brand document (the generated brands.js
  //    mirror gen-adia-derived-exports.mjs reads), so neither the app's default nor the one shipped
  //    real-world kit can regress. rgb triples straight from the engine — no hex round-trip.
  let parkChecked = 0;
  {
    const adia = PRESETS.find((p) => p.name === ADIA_PRESET_NAME);
    if (!adia) FAIL("role-contrast", `the Adia brand preset "${ADIA_PRESET_NAME}" is missing from src/ui/categories/brands.js — the Park leg has nothing to measure`);
    const docs = [["default document", defaultDocument()], ...(adia ? [["Adia brand document", hydrate(adia)]] : [])];
    for (const [label, doc] of docs) {
      for (const p of derivedAll(stateOf(doc))) {
        const bg = p.roles.find((r) => r.suffix === "");              // Park solid.bg  (radix step 9)
        const fg = p.roles.find((r) => r.suffix === `-on-${p.n}`);    // Park solid.fg  (on-accent)
        if (!bg || !fg) { FAIL("role-contrast", `${label} ${p.name}: no accent/on-accent role pair in derivedAll — radixColorGroup would throw`); continue; }
        for (const side of ["light", "dark"]) {
          const ratio = contrastRatio(bg[side].rgb, fg[side].rgb);
          parkChecked++;
          if (ratio < AA) FAIL("role-contrast", `${label} ${p.name} ${side.toUpperCase()} (Park solid.fg on solid.bg): ${ratio.toFixed(2)}:1, under the ruled WCAG AA floor ${AA}:1 (#636/#662)`);
        }
      }
    }
    if (parkChecked !== 64) FAIL("role-contrast", `Park leg compared ${parkChecked} solid.fg/solid.bg pairs, want 64 (2 documents x 16 palettes x 2 schemes)`);
  }

  // ── the VARIANT-SIDE leg (#662): `on{N}Variant` must sit on the SAME SIDE as `on{N}`. The policy's
  //    own contract calls the variant "a softer tint of the same end", but it used to run its OWN
  //    independent contrast pick against the same fill, which is not the same thing — 200 and 800 are
  //    much closer to the fill than 050 and 950, so the two picks can disagree, and then a fill wears
  //    a dark label with a light tint beside it. Measured on bda9584, the pre-#662 engine under the
  //    contrast policy: 7 of these 96 cells straddled (perceptual Tertiary dark; even Neutral, Primary,
  //    Tertiary and Info dark; peak Neutral and Primary dark — every one of them prime 050 against
  //    variant 800). The achromatic fall-through would have added more in the other direction, with the
  //    prime on black and the variant still on the 200 tint. applyOnColorContrast now derives the
  //    variant FROM the prime's chosen end, so this is an invariant rather than a coincidence. It is
  //    read off the REFS (projectView's lightRef/darkRef), not the resolved colors, because the claim
  //    is about which end the policy chose, not about how that end happened to render. ───────────────
  {
    const LIGHT_END = new Set(["050", "200", "white"]);
    const DARK_END = new Set(["950", "800", "black"]);
    const sideOf = (ref) => (LIGHT_END.has(String(ref)) ? "light" : DARK_END.has(String(ref)) ? "dark" : null);
    let sideChecked = 0;
    for (const mode of ["perceptual", "even", "peak"]) {
      const doc = defaultDocument();
      doc.toneMode = mode;
      doc.onColorMode = "contrast";                 // named, not inherited: this leg tests the POLICY
      for (const p of projectView(doc).palettes) {
        const n = slug(p.name);
        const prime = p.roles.find((r) => r.suffix === `-on-${n}`);
        const variant = p.roles.find((r) => r.suffix === `-on-${n}-variant`);
        if (!prime || !variant) { FAIL("role-contrast", `${mode} ${p.name}: no on/on-variant role pair in projectView — the role suffixes changed shape`); continue; }
        for (const [scheme, key] of [["LIGHT", "lightRef"], ["DARK", "darkRef"]]) {
          sideChecked++;
          const a = sideOf(prime[key]);
          const b = sideOf(variant[key]);
          if (!a) { FAIL("role-contrast", `${mode} ${p.name} ${scheme}: on-color ref ${prime[key]} is neither a known light nor dark end — a new end was added without teaching this gate`); continue; }
          if (!b) { FAIL("role-contrast", `${mode} ${p.name} ${scheme}: on-color VARIANT ref ${variant[key]} is neither a known light nor dark end — a new end was added without teaching this gate`); continue; }
          if (a !== b) FAIL("role-contrast", `${mode} ${p.name} ${scheme}: on-color is ${prime[key]} (${a} end) but its variant is ${variant[key]} (${b} end) — the variant must follow the side the prime chose (#662)`);
        }
      }
    }
    if (sideChecked !== 96) FAIL("role-contrast", `variant-side leg compared ${sideChecked} on/on-variant pairs, want 96 (16 families x 3 tone modes x 2 schemes)`);
  }

  // role-table.json and model.mjs's inlined DEFAULT_PALETTES are two copies of the same defaults, and
  // the retune had to land in BOTH. Assert it directly rather than relying on a downstream ramp-distance
  // gate to notice: a skew or lift that differs between them is a silent split-brain default.
  //   `hue` is deliberately NOT compared. defaultDocument() is OKLCH-native and converts each stored
  //   cam16 seed hue on construction, so its number legitimately differs by a degree or two (Neutral
  //   267 -> 268). That leg has its own gate — test/ui/shell.mjs's `oklch-native`, which bounds the
  //   converted ramp against the cam16 intent in RGB. chroma/skew/lift/anchor are raw in both files.
  //   `anchor` (ticket #681, U1): each default family's own Q2 (b) hex, same split-brain risk as
  //   chroma/skew/lift — a value typed into only one of the two sources is exactly the "two default
  //   sources have split" failure this loop already exists to catch.
  {
    const ddPalettes = defaultDocument().palettes;
    let compared = 0;
    for (const rt of RT.defaults) {
      const mine = ddPalettes.find((p) => p.name === rt.name);
      if (!mine) { FAIL("role-contrast", `role-table default "${rt.name}" is missing from defaultDocument()`); continue; }
      for (const f of ["chroma", "skew", "lift", "anchor"]) {
        compared++;
        if (mine[f] !== rt[f]) FAIL("role-contrast", `default "${rt.name}" ${f}: model.mjs has ${mine[f]}, role-table.json has ${rt[f]} — the two default sources have split`);
      }
    }
    if (compared !== 4 * RT.defaults.length) FAIL("role-contrast", `default parity compared ${compared} fields, want ${4 * RT.defaults.length}`);
  }
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
for (const g of ["roles", "oncolors", "refs-canonical", "surface-mode", "identity-stops", "role-contrast"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
console.log("  defer  hpg-parity-roletable — engine<->Figma-binder roleTable full-object identity is verified by test/figma/binder.mjs's `parity` gate; role-table.json<->semantic.js identity is the refs-canonical gate above (both already full-object)");
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: semantic-mapping clears its checkable [gate] predicates (parity deferred)");
process.exit(0);
