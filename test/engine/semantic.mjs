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
import { gateReport } from "../gate-report.mjs";
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
//    Re-measured a FIFTH time (Q-U2-5 ruled, revision 17): Finding 1's literal, unconditional anchor
//    basis (immediately above) broke REQ-002 — re-ruled to a BLEND, chromaEnvelope itself verbatim,
//    its basis input shading from the anchor's own chroma/`s` at the pivot to `rampChroma` at the
//    ramp's ends (see paletteStopsAnchored/okhslStopsAnchored's own header comments). Every family
//    stayed >= AA 4.5 in every mode, both schemes; the numbers move only slightly from the fourth
//    measurement above (this blend and the F2 blend it replaces target the same group value at the
//    ramp's ends, just reached through chromaEnvelope's own shape now).
//
//    Re-measured a SIXTH time (addendum 2, u2-p2-brief.md): the blend's own weight now keys on
//    `liftStop` (`anchorChromaBasis`), never `anchorWarp`'s skew-warped `w` (a local construction the
//    ruling retired). Only the skewed default families (Neutral/Primary/Tertiary/Info/Success/Danger
//    skew -20, Warning skew 40) moved, and only slightly; every family still stayed >= AA 4.5.
//
//    Re-measured a SEVENTH time (review pass 2, fix-first-2, R7, 2026-09-18) after R6 (toneAt
//    piecewise-affine remap replacing anchorLerp's per-side double-S) and R2 (chroma-basis blend
//    weight eased to zero slope at the pivot). Every family still stayed >= AA 4.5 in every mode, both
//    schemes (0 cells under the floor). 41 of the 96 entries now sit below their PRE-#681 (origin/main,
//    `bf2aaf6`) value (was 46 last pass; R6's construction change moved several back above their
//    bf2aaf6 value too).
//
//    Re-measured an EIGHTH time (#681 U4 integration, 2026-09-19) on the fully integrated tree (U1 +
//    U2 + U3 + U6, after U3's own damp/dampCurve retune and U6's prime-ladder rebuild both landed).
//    The 41-cell Q-B population against bf2aaf6 is UNCHANGED (same 41 names, same set, checked by
//    name below) - U3's retune and U6's ladder rebuild move ramp/prime construction, not which cells
//    sit below their pre-#681 value. Four cells (even Primary light+dark, even Info dark, even Danger
//    light) moved fractionally below their SEVENTH-pass pinned floor (captured on U2's own branch,
//    before U3's retune landed) while staying comfortably above both AA and their bf2aaf6 baseline -
//    re-pinned in place below per this table's own ratchet rule ("an intentional default change has
//    to move a number here deliberately"); U3's retune is exactly that, already ratified in the plan.
//
//    Ruled (owner, via team-lead, Q-B, 2026-09-18): pin these 41 by name as "pending U4" so nothing
//    widens silently before the owner rules on the integrated numbers - each lowered row below carries
//    its own inline `pending U4: <side> was <old> at bf2aaf6` note. The full by-name old/new table
//    against `bf2aaf6` is also recorded in `.sdlc/questions/pif-u2.md` (Q-U2-5's Finding 5 section).
//    Made a machine gate, not just a comment (review pass 3, Q-B machine check, 2026-09-18):
//    FLOORS_BF2AAF6/PENDING_U4/checkFloors below the 96-cell sweep enforce it - reds on a 42nd
//    unlisted drop, or on any of these 41 eroding further than its value at this commit.
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
      ["Neutral", 6.8, 4.8],   // measured 6.87 / 4.86 - pending U4: dark was 4.9 at bf2aaf6
      ["Primary", 7.1, 4.9],   // measured 7.10 / 4.98
      ["Secondary", 5.2, 5.2],   // measured 5.24 / 5.22 - pending U4: dark was 6.1 at bf2aaf6
      ["Tertiary", 7.8, 5.6],   // measured 7.83 / 5.64
      ["Info", 6.7, 4.7],   // measured 6.80 / 4.76
      ["Success", 7.1, 5.0],   // measured 7.19 / 5.07
      ["Warning", 9.1, 5.6],   // measured 9.17 / 5.64
      ["Danger", 8.2, 5.9],   // measured 8.21 / 5.94
      ["Data 1", 6.0, 4.6],   // measured 6.00 / 4.68 - pending U4: dark was 5.5 at bf2aaf6
      ["Data 2", 6.3, 4.7],   // measured 6.33 / 4.75 - pending U4: dark was 4.9 at bf2aaf6
      ["Data 3", 6.1, 4.9],   // measured 6.10 / 4.92 - pending U4: dark was 5.1 at bf2aaf6
      ["Data 4", 5.6, 4.7],   // measured 5.67 / 4.80 - pending U4: dark was 5.5 at bf2aaf6
      ["Data 5", 5.4, 5.0],   // measured 5.45 / 5.06 - pending U4: dark was 5.8 at bf2aaf6
      ["Data 6", 5.1, 5.2],   // measured 5.16 / 5.28 - pending U4: dark was 6.2 at bf2aaf6
      ["Data 7", 5.2, 5.1],   // measured 5.29 / 5.15 - pending U4: dark was 6.0 at bf2aaf6
      ["Data 8", 5.4, 4.9],   // measured 5.44 / 4.99 - pending U4: dark was 5.8 at bf2aaf6
    ],
    even: [
      // Refreshed to 4dp, pass 5 (verifier's Records section: 10 of 16 comments were stale by more
      // than 0.01). 6 floors sat ONE DECIMAL under floor(measured) per this table's own stated rule
      // (line above: "floored to one decimal") - safe direction (no gate ever read below AA or its own
      // pin), but not what the rule says. Re-pinned those 6 to floor(measured) this pass: Secondary
      // light 5.5->5.6, Success light 7.6->7.7, Warning dark 5.2->5.3, Data 1 light 6.2->6.3, Data 3
      // light 6.4->6.5, Data 5 light 5.7->5.8 - each marked "re-pinned pass 5" below, in place of the
      // "pending U4" note the re-measurement supersedes for that one side.
      ["Neutral", 7.2, 4.6],   // measured 7.2938 / 4.6509
      ["Primary", 7.4, 4.7],   // measured 7.4983 / 4.7966 - re-pinned U4 integration (was 7.5/4.8): U3's damp/dampCurve retune, landed after this table was captured, moved it slightly
      ["Secondary", 5.6, 5.5],   // measured 5.6078 / 5.5335 - light re-pinned pass 5 (was 5.5, floor(measured) is 5.6); dark pending U4: was 5.8 at bf2aaf6
      ["Tertiary", 8.2, 5.2],   // measured 8.2782 / 5.2571
      ["Info", 7.2, 4.5],   // measured 7.2338 / 4.5768 - re-pinned U4 integration (was 7.2/4.6): U3's damp/dampCurve retune, landed after this table was captured, moved it slightly
      ["Success", 7.7, 4.9],   // measured 7.7219 / 4.9081 - light re-pinned pass 5 (was 7.6, floor(measured) is 7.7); dark pending U4: light was 8.0 at bf2aaf6, dark was 5.1 at bf2aaf6
      ["Warning", 9.9, 5.3],   // measured 9.9148 / 5.3334 - dark re-pinned pass 5 (was 5.2, floor(measured) is 5.3)
      ["Danger", 8.6, 5.6],   // measured 8.6973 / 5.6465 - re-pinned U4 integration (was 8.7/5.6): U3's damp/dampCurve retune, landed after this table was captured, moved it slightly
      ["Data 1", 6.3, 4.9],   // measured 6.3149 / 4.9736 - light re-pinned pass 5 (was 6.2, floor(measured) is 6.3); dark pending U4: was 5.8 at bf2aaf6
      ["Data 2", 6.6, 4.6],   // measured 6.6726 / 4.6487 - pending U4: dark was 5.8 at bf2aaf6
      ["Data 3", 6.5, 4.8],   // measured 6.5224 / 4.8271 - light re-pinned pass 5 (was 6.4, floor(measured) is 6.5); dark pending U4: was 5.8 at bf2aaf6
      ["Data 4", 6.0, 5.1],   // measured 6.0537 / 5.1407 - pending U4: dark was 5.8 at bf2aaf6
      ["Data 5", 5.8, 5.3],   // measured 5.8350 / 5.3561 - light re-pinned pass 5 (was 5.7, floor(measured) is 5.8); dark pending U4: was 5.8 at bf2aaf6
      ["Data 6", 5.5, 5.5],   // measured 5.5494 / 5.5467 - pending U4: dark was 5.8 at bf2aaf6
      ["Data 7", 5.6, 5.4],   // measured 5.6846 / 5.4779 - pending U4: dark was 5.8 at bf2aaf6
      ["Data 8", 5.8, 5.3],   // measured 5.8570 / 5.3269 - pending U4: dark was 5.8 at bf2aaf6
    ],
    peak: [
      ["Neutral", 7.2, 4.6],   // measured 7.21 / 4.66
      ["Primary", 7.4, 4.7],   // measured 7.44 / 4.77
      ["Secondary", 5.5, 5.6],   // measured 5.53 / 5.60 - pending U4: light was 11.5 at bf2aaf6, dark was 15.1 at bf2aaf6
      ["Tertiary", 8.2, 5.3],   // measured 8.20 / 5.39 - pending U4: dark was 5.5 at bf2aaf6
      ["Info", 7.0, 4.5],   // measured 7.10 / 4.57 - pending U4: dark was 7.7 at bf2aaf6
      ["Success", 7.6, 4.8],   // measured 7.60 / 4.88 - pending U4: dark was 11.8 at bf2aaf6
      ["Warning", 9.6, 5.2],   // measured 9.69 / 5.28 - pending U4: dark was 7.4 at bf2aaf6
      ["Danger", 8.6, 5.6],   // measured 8.63 / 5.68
      ["Data 1", 6.3, 4.9],   // measured 6.34 / 4.99 - pending U4: light was 10.0 at bf2aaf6, dark was 6.7 at bf2aaf6
      ["Data 2", 6.6, 4.5],   // measured 6.63 / 4.55 - pending U4: dark was 5.5 at bf2aaf6
      ["Data 3", 6.4, 4.7],   // measured 6.43 / 4.72 - pending U4: dark was 5.1 at bf2aaf6
      ["Data 4", 5.9, 5.0],   // measured 5.98 / 5.09 - pending U4: light was 6.3 at bf2aaf6, dark was 8.7 at bf2aaf6
      ["Data 5", 5.6, 5.3],   // measured 5.69 / 5.33 - pending U4: light was 12.8 at bf2aaf6, dark was 16.7 at bf2aaf6
      ["Data 6", 5.4, 5.5],   // measured 5.44 / 5.60 - pending U4: light was 11.6 at bf2aaf6, dark was 15.0 at bf2aaf6
      ["Data 7", 5.5, 5.4],   // measured 5.58 / 5.48 - pending U4: light was 11.8 at bf2aaf6, dark was 15.5 at bf2aaf6
      ["Data 8", 5.7, 5.3],   // measured 5.75 / 5.32 - pending U4: light was 6.3 at bf2aaf6, dark was 8.8 at bf2aaf6
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

  // Q-B machine check (review pass 3, 2026-09-18): the 41 "pending U4" notes above were comments, not a
  // gate - nothing enforced that they stayed the ONLY drops, or that an accepted drop couldn't erode
  // further. FLOORS_BF2AAF6 is the frozen pre-#681 (origin/main, `bf2aaf6`) floor for all 96 cells
  // (`git show bf2aaf6:test/engine/semantic.mjs`, transcribed verbatim). PENDING_U4 names the 41 cells
  // that ARE below their bf2aaf6 value, each pinned to its floor AT THIS COMMIT (frozen here,
  // independent of the live FLOORS above, so a FUTURE edit to FLOORS is checked against this snapshot,
  // not against itself). checkFloors is the real predicate; both the live check and its own negative
  // controls (below) call it, never a synthetic duplicate.
  const FLOORS_BF2AAF6 = {
    perceptual: {
      "Neutral": [5.8, 4.9], "Primary": [6.0, 4.8], "Secondary": [4.7, 6.1], "Tertiary": [6.7, 4.8],
      "Info": [5.7, 4.6], "Success": [6.1, 4.8], "Warning": [7.6, 4.6], "Danger": [7.1, 5.1],
      "Data 1": [5.0, 5.5], "Data 2": [5.4, 4.9], "Data 3": [5.2, 5.1], "Data 4": [4.8, 5.5],
      "Data 5": [4.5, 5.8], "Data 6": [4.8, 6.2], "Data 7": [4.7, 6.0], "Data 8": [4.6, 5.8],
    },
    even: {
      "Neutral": [7.0, 4.5], "Primary": [7.1, 4.5], "Secondary": [5.2, 5.8], "Tertiary": [7.1, 4.5],
      "Info": [7.1, 4.5], "Success": [8.0, 5.1], "Warning": [9.4, 5.0], "Danger": [8.0, 5.1],
      "Data 1": [5.2, 5.8], "Data 2": [5.2, 5.8], "Data 3": [5.2, 5.8], "Data 4": [5.2, 5.8],
      "Data 5": [5.2, 5.8], "Data 6": [5.2, 5.8], "Data 7": [5.2, 5.8], "Data 8": [5.2, 5.8],
    },
    peak: {
      "Neutral": [6.2, 4.5], "Primary": [6.4, 4.6], "Secondary": [11.5, 15.1], "Tertiary": [7.5, 5.5],
      "Info": [5.0, 7.7], "Success": [7.2, 11.8], "Warning": [4.8, 7.4], "Danger": [7.1, 5.1],
      "Data 1": [10.0, 6.7], "Data 2": [4.7, 5.5], "Data 3": [5.2, 5.1], "Data 4": [6.3, 8.7],
      "Data 5": [12.8, 16.7], "Data 6": [11.6, 15.0], "Data 7": [11.8, 15.5], "Data 8": [6.3, 8.8],
    },
  };
  const PENDING_U4 = [
    // [mode, family, side, floor pinned at this commit]
    ["perceptual", "Neutral", "dark", 4.8], ["perceptual", "Secondary", "dark", 5.2],
    ["perceptual", "Data 1", "dark", 4.6], ["perceptual", "Data 2", "dark", 4.7],
    ["perceptual", "Data 3", "dark", 4.9], ["perceptual", "Data 4", "dark", 4.7],
    ["perceptual", "Data 5", "dark", 5.0], ["perceptual", "Data 6", "dark", 5.2],
    ["perceptual", "Data 7", "dark", 5.1], ["perceptual", "Data 8", "dark", 4.9],
    ["even", "Secondary", "dark", 5.5], ["even", "Success", "light", 7.6],
    ["even", "Success", "dark", 4.9], ["even", "Data 1", "dark", 4.9],
    ["even", "Data 2", "dark", 4.6], ["even", "Data 3", "dark", 4.8],
    ["even", "Data 4", "dark", 5.1], ["even", "Data 5", "dark", 5.3],
    ["even", "Data 6", "dark", 5.5], ["even", "Data 7", "dark", 5.4],
    ["even", "Data 8", "dark", 5.3], ["peak", "Secondary", "light", 5.5],
    ["peak", "Secondary", "dark", 5.6], ["peak", "Tertiary", "dark", 5.3],
    ["peak", "Info", "dark", 4.5], ["peak", "Success", "dark", 4.8],
    ["peak", "Warning", "dark", 5.2], ["peak", "Data 1", "light", 6.3],
    ["peak", "Data 1", "dark", 4.9], ["peak", "Data 2", "dark", 4.5],
    ["peak", "Data 3", "dark", 4.7], ["peak", "Data 4", "light", 5.9],
    ["peak", "Data 4", "dark", 5.0], ["peak", "Data 5", "light", 5.6],
    ["peak", "Data 5", "dark", 5.3], ["peak", "Data 6", "light", 5.4],
    ["peak", "Data 6", "dark", 5.5], ["peak", "Data 7", "light", 5.5],
    ["peak", "Data 7", "dark", 5.4], ["peak", "Data 8", "light", 5.7],
    ["peak", "Data 8", "dark", 5.3],
  ];
  // checkFloors(floors, baseline, pending) -> violation strings. A cell below baseline that is not in
  // `pending` is a NEW, unlisted drop (a 42nd). A `pending`-listed cell whose live floor is below its
  // OWN pinned value has eroded further since this commit.
  function checkFloors(floors, baseline, pending) {
    const violations = [];
    const pendingMap = new Map(pending.map(([m, f, s, v]) => [`${m}|${f}|${s}`, v]));
    for (const mode of ["perceptual", "even", "peak"]) {
      for (const [family, light, dark] of floors[mode]) {
        for (const [side, val] of [["light", light], ["dark", dark]]) {
          const base = baseline[mode][family][side === "light" ? 0 : 1];
          const key = `${mode}|${family}|${side}`;
          const pinned = pendingMap.get(key);
          if (val < base - 1e-9 && pinned === undefined) {
            violations.push(`${mode} ${family} ${side}: ${val} is below its bf2aaf6 floor ${base} and is NOT in PENDING_U4 - a new, unlisted drop`);
          }
          if (pinned !== undefined && val < pinned - 1e-9) {
            violations.push(`${mode} ${family} ${side}: ${val} is below its PENDING_U4 pinned floor ${pinned} - an already-accepted drop eroded further`);
          }
        }
      }
    }
    return violations;
  }
  // negative controls (checks-that-bite): the SAME `checkFloors` predicate, run against a mutated
  // scratch copy of FLOORS, never a second hand-written comparison.
  {
    const scratchUnlisted = JSON.parse(JSON.stringify(FLOORS));
    scratchUnlisted.perceptual.find((r) => r[0] === "Primary")[1] = FLOORS_BF2AAF6.perceptual["Primary"][0] - 0.5; // Primary/light is not in PENDING_U4
    if (checkFloors(scratchUnlisted, FLOORS_BF2AAF6, PENDING_U4).length === 0) FAIL("role-contrast", "Q-B negative control DID NOT bite: lowering an unlisted floor below its bf2aaf6 value passed checkFloors()");
    const scratchListed = JSON.parse(JSON.stringify(FLOORS));
    scratchListed.perceptual.find((r) => r[0] === "Neutral")[2] = 4.0; // Neutral/dark IS in PENDING_U4, pinned at 4.8
    if (checkFloors(scratchListed, FLOORS_BF2AAF6, PENDING_U4).length === 0) FAIL("role-contrast", "Q-B negative control DID NOT bite: eroding a PENDING_U4-listed floor further passed checkFloors()");
  }
  const floorViolations = checkFloors(FLOORS, FLOORS_BF2AAF6, PENDING_U4);
  for (const v of floorViolations) FAIL("role-contrast", `Q-B: ${v}`);
  console.log(`  ${floorViolations.length === 0 ? "pass" : "FAIL"}  role-contrast Q-B floor gate: 0 unlisted drops, 0 further erosion (${PENDING_U4.length} cells named "pending U4")`);

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
// The printed set is this declared list UNION every gate name that actually reached a FAIL(...)
// call (#699, following #695's pattern in test/engine/tonal.mjs), so a gate missing from the list
// below still shows up, loudly, instead of hiding behind a neighbouring gate's "pass" row.
const DECLARED = ["roles", "oncolors", "refs-canonical", "surface-mode", "identity-stops", "role-contrast", "report-static"];
gateReport({ fails, declared: DECLARED, selfUrl: import.meta.url, FAIL });
console.log("  defer  hpg-parity-roletable — engine<->Figma-binder roleTable full-object identity is verified by test/figma/binder.mjs's `parity` gate; role-table.json<->semantic.js identity is the refs-canonical gate above (both already full-object)");
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: semantic-mapping clears its checkable [gate] predicates (parity deferred)");
process.exit(0);
