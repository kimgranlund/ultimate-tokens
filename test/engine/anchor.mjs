#!/usr/bin/env node
// anchor.mjs — U1 (ticket #681, plan `preset-intent-fidelity`): the anchor field's own identity gates.
//
// C2 anchor-identity. For every REGENERATED corpus palette carrying a stored `anchor` (the sampled +
// status palettes scripts/gen-categories.mjs mints — direct/authored "brands" palettes and derived
// neutrals never carry one unless a spec JSON opts in, Q5):
//   (a) primeSwatches(palette, controls)[3].hex === anchor — called DIRECTLY, the same shape
//       test/engine/prime.mjs's own gates use.
//   (b) the ACTUAL export pipeline's prime.DEFAULT (src/engine/exports.js derivePalette ->
//       primeSwatches, wired at #681 U1 so `anchor` reaches that call) renders the SAME oklch as an
//       INDEPENDENT hex->oklch conversion of the anchor — a from-scratch sRGB->OKLab->OKLCH copy in
//       THIS file, never prime.mjs's or exports.js's own private rgbToOklch, so a bug shared between
//       the code under test and its check cannot cancel out (checks-that-bite's independence law).
// Plan's stated count is 3,380 (2,028 sampled + 1,352 status) on the plan's own measured base. This
// repo's actual corpus at U1's branch base (`git merge-base HEAD origin/main`, recorded in the unit
// handoff) counts EXACTLY 3,380 sampled+status palettes too (62 direct + 338 derived-neutral + 3,380
// sampled/status = 3,780 total, verified against the spec JSON's own `direct` structural marker before
// this file was written) — so the count below is asserted, not assumed.
//
// C2's negative control (documented here, per the plan: "patch one spec swatch hex by one byte in a
// scratch copy and rerun the generator into a temp dir, the gate names that preset and palette"): that
// full round trip is exercised by hand when touching scripts/gen-categories.mjs's `palette()` anchor
// lines. This file ALSO runs a cheaper, self-contained simulation of the same fault on every run (never
// skipped, so a change that breaks the CHECK itself — not just the feature — is caught immediately):
// one real anchored palette's `anchor` is corrupted by a single hex digit in memory and the identity
// check is proven to catch it, BY NAME (preset + palette), before the real corpus is graded.
//
// C4 (prime half) — the non-anchored identity control. `primeSwatches` must be BYTE-IDENTICAL to its
// pre-#681 behaviour whenever `anchor` is absent, over EVERY corpus palette (3,780, `anchor` stripped
// whether or not it is present — the point is the CODE PATH, not just the currently-anchored subset)
// plus the 16 default-kit palettes. The expectation is a FRESH, independent reimplementation of the
// pre-#681 algorithm (deriveKeyColor's cusp construction) written directly against hct.js/okhsl.js's
// validated primitives — never a call back into primeSwatches's own internals — mirroring
// test/engine/prime.mjs's own "Agent verification" anti-tautology note for this exact file. A negative
// control (one mutated chroma) proves the comparison loop itself can fail before trusting its "0 off".
import { primeSwatches, primeSteps, PRIME_STEPS } from "../../src/engine/prime.mjs";
import { peakC, hctToRgb, lstarFromRgb } from "../../src/engine/hct.js";
import { effHue, paletteStops, DEFAULT_CONTROLS, RAMP_L_MIN, RAMP_L_MAX } from "../../src/engine/tonal.js";
import { rgbToOkhsl, okhslToRgb } from "../../src/engine/okhsl.js";
import { derivedAll, oklchStr } from "../../src/engine/exports.js";
import { defaultDocument, projectView } from "../../src/ui/model.mjs";
import { hydrate } from "../../src/ui/persist.js";

const CATS = ["architecture", "cuisine", "film", "literature", "music", "nature", "travel", "brands"];

const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };

// ── independent hex<->oklch — a from-scratch conversion, never prime.mjs's/exports.js's own private
//    copy (both are correct, but a shared bug in either must not agree with itself here). ───────────
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function rgbToOklchIndep([r, g, b]) {
  const inv = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const rl = inv(r), gl = inv(g), bl = inv(b);
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + b2 * b2);
  let H = C < 0.00005 ? 0 : (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

// a minimal single-palette exports.js state — the SAME shape controlsOf()/enabledPalettes() expect
// (exports.js:207-241/245-247); `paletteGroups: {}` makes rampChromaOf fall back to `baseChroma`
// (irrelevant to prime, which never reads the ramp chroma), and `roleOverrides: {}` so
// applyRoleOverrides has a defined object to iterate.
function stateFor(p) {
  return {
    palettes: [{ ...p, on: true }],
    curve: "logistic", tension: 0, lmin: 5, lmax: 100, damp: 80, dampCurve: 1.5, dampAmp: 0, dampBias: 0,
    hueSpace: p.hueSpace ?? "oklch", toneMode: "perceptual", vibrancy: 0, onColorMode: "fixed", accentRef: "mode",
    relChroma: false, chromaFloor: 40, baseChroma: 100, primeChroma: 100, paletteGroups: {},
    roleOverrides: {},
  };
}

// referenceNonAnchored(palette, controls) — a FRESH copy of prime.mjs's pre-#681 (deriveKeyColor cusp)
// construction, built directly against hct.js/okhsl.js/tonal.js's validated primitives, never calling
// primeSwatches. `primeSteps`/`PRIME_STEPS` are reused (test/engine/prime.mjs's own precedent: they are
// pre-existing, unchanged-by-#681 exports, not the branching logic under test here).
function referenceNonAnchored(palette, controls) {
  const baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100);
  const pk = peakC(baseHue);
  const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c;
  const keyRgb = hctToRgb(baseHue, keyChroma, pk.tone).rgb;
  const key = rgbToOkhsl(keyRgb);
  const lPrime = key.l;
  const { up, down } = primeSteps(lPrime);
  const g = 3 ** ((palette.skew ?? 0) / 100);
  const pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100;
  const s = Math.min(1, Math.max(0, key.s * pc));
  const hOk = key.h;
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  return PRIME_STEPS.map((step, i) => {
    const t = (i - 3) / 3;
    const absT = Math.abs(t);
    const w = i < 3 ? absT ** (1 / g) : absT ** g;
    const l = i < 3 ? lPrime + 3 * up * w : lPrime - 3 * down * w;
    const dir = sameDir ? -absT : t;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    const rgb = okhslToRgb(hue, s, l);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { step, hex };
  });
}

// ── load the regenerated corpus + the default kit ──────────────────────────────────────────────────
const corpus = []; // { slug, presetName, palette }
const presetsByCat = []; // { slug, preset } — the whole preset object, for the RENDERED-path sweep below
for (const slug of CATS) {
  const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
  for (const preset of PRESETS) {
    presetsByCat.push({ slug, preset });
    for (const p of preset.palettes) corpus.push({ slug, presetName: preset.name, hueSpace: preset.hueSpace, palette: p });
  }
}
if (corpus.length !== 3780) FAIL("anchor-identity", `corpus loaded ${corpus.length} palettes, want 3780 — a category file moved or a preset count changed`);

const anchored = corpus.filter((c) => typeof c.palette.anchor === "string");

// ── C2's negative control (runs BEFORE the real count, never skipped) ──────────────────────────────
{
  const sample = anchored[0];
  if (!sample) FAIL("anchor-identity", "no anchored palette found to run the negative control against — the corpus lost every anchor");
  else {
    const corruptHex = sample.palette.anchor.slice(0, -1) + (sample.palette.anchor.slice(-1) === "0" ? "1" : "0");
    const corrupted = { ...sample.palette, anchor: corruptHex };
    const ctl = { hueSpace: sample.hueSpace ?? "oklch", primeChroma: 100 };
    const gotHex = primeSwatches(corrupted, ctl)[3].hex;
    if (gotHex === sample.palette.anchor) {
      FAIL("anchor-identity", `negative control DID NOT bite: corrupting ${sample.slug} "${sample.presetName}" ${sample.palette.name}'s anchor by one hex digit still rendered the ORIGINAL anchor — the identity check cannot discriminate`);
    } else if (gotHex !== corruptHex) {
      // it changed, but not to the corrupted hex either — primeSwatches isn't rendering the anchor verbatim at all
      FAIL("anchor-identity", `negative control gave an unexpected reading: ${sample.slug} "${sample.presetName}" ${sample.palette.name} rendered ${gotHex} for corrupted anchor ${corruptHex}`);
    }
    // else: correctly rendered the CORRUPTED hex, proving the gate below would have named this exact
    // preset/palette had the real anchor been wrong — the "prints the preset and palette" procedure.
  }
}

// ── C2 positive count ────────────────────────────────────────────────────────────────────────────
let exact = 0, off = 0;
for (const { slug, presetName, hueSpace, palette: p } of anchored) {
  const ctl = { hueSpace: hueSpace ?? "oklch", primeChroma: 100 };
  const sw = primeSwatches(p, ctl);
  const prime = sw[3];
  if (prime.hex !== p.anchor) {
    off++;
    FAIL("anchor-identity", `${slug} "${presetName}" ${p.name}: primeSwatches(...)[3].hex ${prime.hex} !== anchor ${p.anchor}`);
    continue;
  }
  const derived = derivedAll(stateFor(p))[0];
  const gotOklch = oklchStr({ L: derived.prime.prime.oklch[0], C: derived.prime.prime.oklch[1], H: derived.prime.prime.oklch[2] });
  const wantOklch = oklchStr({ L: rgbToOklchIndep(hexToRgb(p.anchor))[0], C: rgbToOklchIndep(hexToRgb(p.anchor))[1], H: rgbToOklchIndep(hexToRgb(p.anchor))[2] });
  if (gotOklch !== wantOklch) {
    off++;
    FAIL("anchor-identity", `${slug} "${presetName}" ${p.name}: exports.js prime.DEFAULT ${gotOklch} !== independent anchor oklch ${wantOklch}`);
    continue;
  }
  exact++;
}
if (anchored.length !== 3380) FAIL("anchor-identity", `counted ${anchored.length} anchored palettes (want 3380 — 2,028 sampled + 1,352 status per the plan's own measured baseline); report this line, do not force the number`);
console.log(`  ${fails.some((f) => f.startsWith("anchor-identity:")) ? "FAIL" : "pass"}  anchor-identity: ${exact} exact, ${off} off`);

// ── C4 (prime half): non-anchored identity control, negative control first ─────────────────────────
const controlSubjects = [
  ...corpus.map((c) => ({ label: `${c.slug} "${c.presetName}" ${c.palette.name}`, hueSpace: c.hueSpace, palette: c.palette })),
  ...defaultDocument().palettes.map((p) => ({ label: `default kit ${p.name}`, hueSpace: "oklch", palette: p })),
];
if (controlSubjects.length !== 3796) FAIL("prime-identity-control", `${controlSubjects.length} control subjects (want 3796 = 3780 corpus + 16 default kit)`);

{
  // negative control: mutate one subject's chroma between the two derivations and confirm the loop
  // below would have caught it (proves this comparison is not vacuously always-equal).
  const s = controlSubjects[0];
  const ctl = { hueSpace: s.hueSpace, primeChroma: 100 };
  const mutated = { ...s.palette, anchor: undefined, chroma: ((s.palette.chroma ?? 0) + 37) % 100 };
  const real = primeSwatches(mutated, ctl);
  const ref = referenceNonAnchored(s.palette, ctl); // reference uses the UN-mutated chroma on purpose
  if (real[3].hex === ref[3].hex) FAIL("prime-identity-control", "negative control DID NOT bite: mutating chroma by 37 left primeSwatches[3].hex unchanged vs the reference — the comparison cannot discriminate");
}

let ctrlExact = 0, ctrlOff = 0;
for (const { label, hueSpace, palette: p } of controlSubjects) {
  const ctl = { hueSpace, primeChroma: 100 };
  const stripped = { ...p, anchor: undefined };
  const real = primeSwatches(stripped, ctl);
  const ref = referenceNonAnchored(p, ctl);
  let mismatch = null;
  for (let i = 0; i < PRIME_STEPS.length; i++) if (real[i].hex !== ref[i].hex) { mismatch = i; break; }
  if (mismatch != null) {
    ctrlOff++;
    FAIL("prime-identity-control", `${label} step ${PRIME_STEPS[mismatch]}: primeSwatches (anchor stripped) ${real[mismatch].hex} !== the pre-#681 reference ${ref[mismatch].hex}`);
  } else {
    ctrlExact++;
  }
}
console.log(`  ${fails.some((f) => f.startsWith("prime-identity-control:")) ? "FAIL" : "pass"}  prime-identity-control: ${ctrlExact} exact, ${ctrlOff} off (non-anchored primeSwatches unchanged by #681)`);

// ── anchor-ladder (F1, U1 review 2026-09-18) ────────────────────────────────────────────────────
// The anchored ladder's own well-formedness at primeChroma 100 (the same evaluation point C2/C4
// use), over all 3,380 anchored corpus palettes, two invariants:
//   (a) the SIX ladder rungs (every step but `prime`) are strictly decreasing in OKHSL `l` — this
//       comes only from `primeSteps`' redistribution and prime.mjs's F1 widening search, never from
//       the anchor's own position, so it holds unconditionally: 0 exceptions anywhere in the corpus.
//   (b) all SEVEN rungs render distinct hexes, and `prime` sits strictly between `bright` and `dim`
//       in `l` — Q3 (b) ruled the token stays exact regardless of the window, so a source whose true
//       OKHSL `l` sits at or past [PRIME_L_MIN, PRIME_L_MAX] can only get a real six-rung ladder by
//       letting `prime` sit outside it; those sources are a named, counted allow-list (mirroring C5's
//       "print the list, fail on any other count" shape), not a silent carve-out. A handful sit close
//       enough to the window floor that even the F1 widening search's full PRIME_STEP of reserve
//       cannot keep `prime` distinct from the rung it ends up beside — a stricter subset of (b).
// N1 (U1 re-review, 2026-09-18): a count alone lets one corpus source swap for another — one moving
// in across the window bound, another moving out — and stay green at the same length. Both lists are
// frozen BY NAME (sorted), mirroring C5's own "fail on any other count or any other name" shape, and
// the corpus is compared against the frozen arrays directly, not just their lengths. Printed by the
// gate itself (`node test/engine/anchor.mjs`), so a real drift is copy-pasteable back into this file.
const ORDER_ALLOW = [
  `brands "Nike · The Swoosh · Since 1971" secondary #101820`,
  `brands "Nike · The Swoosh · Since 1971" tertiary-muted #FFFFFF`,
  `film "2001: A Space Odyssey · 1968 · dir. Kubrick · the centrifuge & the stargate" tertiary-muted #1A1B1E`,
  `film "Apocalypse Now · 1979 · dir. Coppola · the river at dusk" primary #241E1A`,
  `film "Double Indemnity · 1944 · dir. Billy Wilder · the venetian-blind living room" primary #1B1B1D`,
  `film "Suspiria · 1977 · dir. Argento · the ballet academy" tertiary-muted #201F25`,
  `film "TRON: Legacy · 2010 · dir. Kosinski · the Grid" secondary #181B1F`,
  `film "The Matrix · 1999 · dir. Wachowskis · inside the simulation" tertiary-muted #1F1F24`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E`,
  `music "Black metal · the forest at night" secondary #1E2024`,
  `music "P-Funk · the cosmic album art" secondary-muted #211E27`,
  `music "The late-night club · the smoky set" primary-muted #1F1F23`,
  `music "UK '77 · the ransom-note sleeve" secondary #1F1F23`,
  `nature "32° N · constant · Carlsbad Caverns, New Mexico, lamp-lit" secondary #1D1D20`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
  `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" primary #1E1D1B`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913`,
  `travel "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight" tertiary-muted #232220`,
  `travel "41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in" tertiary-muted #251B12`,
  `travel "48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide" primary-muted #251B14`,
  `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913`,
];
const DUPE_ALLOW = [
  `film "Suspiria · 1977 · dir. Argento · the ballet academy" tertiary-muted #201F25`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E`,
  `music "Black metal · the forest at night" secondary #1E2024`,
  `music "P-Funk · the cosmic album art" secondary-muted #211E27`,
];
{
  const orderNames = [], dupeNames = [];
  for (const { slug, presetName, hueSpace, palette: p } of anchored) {
    const ctl = { hueSpace: hueSpace ?? "oklch", primeChroma: 100 };
    const sw = primeSwatches(p, ctl);
    const label = `${slug} "${presetName}" ${p.name} ${p.anchor}`;
    const sixIdx = [0, 1, 2, 4, 5, 6]; // every step but prime (index 3)
    let sixMono = true;
    for (let k = 1; k < sixIdx.length; k++) if (!(sw[sixIdx[k - 1]].l > sw[sixIdx[k]].l)) sixMono = false;
    if (!sixMono) FAIL("anchor-ladder", `${label}: the six ladder rungs (excluding prime) are not strictly decreasing in l — primeSteps or the F1 widening search regressed`);
    if (!(sw[2].l > sw[3].l && sw[3].l > sw[4].l)) orderNames.push(label);
    if (new Set(sw.map((x) => x.hex)).size < 7) dupeNames.push(label);
  }
  orderNames.sort();
  dupeNames.sort();
  console.log(`  ${orderNames.length === ORDER_ALLOW.length ? "pass" : "FAIL"}  anchor-ladder order-allow-list: ${orderNames.length} (expected ${ORDER_ALLOW.length})`);
  for (const n of orderNames) console.log(`    r ${n}`);
  console.log(`  ${dupeNames.length === DUPE_ALLOW.length ? "pass" : "FAIL"}  anchor-ladder dupe-allow-list: ${dupeNames.length} (expected ${DUPE_ALLOW.length})`);
  for (const n of dupeNames) console.log(`    d ${n}`);
  // Compare the SORTED ARRAYS, not just their lengths (N1) — a swapped name at an unchanged count
  // must still fail, naming both the entry that's missing and the one that showed up uninvited.
  if (orderNames.length !== ORDER_ALLOW.length || orderNames.some((n, i) => n !== ORDER_ALLOW[i])) {
    for (const n of ORDER_ALLOW) if (!orderNames.includes(n)) FAIL("anchor-ladder", `order-allow-list: expected member missing — ${n}`);
    for (const n of orderNames) if (!ORDER_ALLOW.includes(n)) FAIL("anchor-ladder", `order-allow-list: unexpected member — ${n}`);
    if (!fails.some((f) => f.startsWith("anchor-ladder:"))) FAIL("anchor-ladder", `order-allow-list count ${orderNames.length} !== expected ${ORDER_ALLOW.length} with no single-name diff found — investigate before trusting either count`);
  }
  if (dupeNames.length !== DUPE_ALLOW.length || dupeNames.some((n, i) => n !== DUPE_ALLOW[i])) {
    for (const n of DUPE_ALLOW) if (!dupeNames.includes(n)) FAIL("anchor-ladder", `dupe-allow-list: expected member missing — ${n}`);
    for (const n of dupeNames) if (!DUPE_ALLOW.includes(n)) FAIL("anchor-ladder", `dupe-allow-list: unexpected member — ${n}`);
    if (!fails.some((f) => f.startsWith("anchor-ladder:"))) FAIL("anchor-ladder", `dupe-allow-list count ${dupeNames.length} !== expected ${DUPE_ALLOW.length} with no single-name diff found — investigate before trusting either count`);
  }
  // every dupe MUST also be an order violation (the F1 widening search cannot fail (b) without also
  // failing (a): a collapsed rung is, by definition, not strictly between its neighbours in l).
  for (const n of dupeNames) if (!orderNames.includes(n)) FAIL("anchor-ladder", `${n}: has a duplicate hex but passes the prime-between-bright-and-dim check — inconsistent with F1's own mechanism, investigate before trusting either count`);
}

// N1's own negative control: a frozen list with one real member swapped for a plausible-but-wrong
// one, at the SAME length, must fail the sorted-array comparison — proving a same-count substitution
// cannot slip through silently (the exact failure scenario N1 named).
{
  const swapped = ORDER_ALLOW.slice(0, -1).concat(`film "A Made-Up Title" primary #000001`).sort();
  const realSorted = [...ORDER_ALLOW].sort();
  const sameLength = swapped.length === realSorted.length;
  const identical = sameLength && swapped.every((n, i) => n === realSorted[i]);
  if (!sameLength || identical) FAIL("anchor-ladder", "negative control DID NOT bite: a same-length, one-member-swapped allow-list compared equal to the real one — the sorted-array comparison cannot discriminate a substitution");
}

// negative control: a synthetic anchor pinned at OKHSL l=0 (pure black, unambiguously past
// PRIME_L_MIN) must be caught by the SAME predicate the corpus loop above counts with — proving the
// predicate itself discriminates rather than the corpus happening to already contain 23/4.
{
  const synthetic = { anchor: "#000000" };
  const sw = primeSwatches(synthetic, { hueSpace: "oklch", primeChroma: 100 });
  const orderViolation = !(sw[2].l > sw[3].l && sw[3].l > sw[4].l);
  if (!orderViolation) FAIL("anchor-ladder", "negative control DID NOT bite: a synthetic #000000 anchor (OKHSL l=0, unambiguously outside [PRIME_L_MIN, PRIME_L_MAX]) passed the prime-between-bright-and-dim check — the predicate cannot discriminate an out-of-window anchor");
}

// ── anchor-ramp (U2, ticket #681): C3 ramp pass-through + C5 monotone/distinct ─────────────────────
// C3: for every anchored palette, paletteStops(...) stop 500 equals `anchor` in each of perceptual,
// peak, even — EXCEPT the named, counted window-clamp population (Q3 (b), same shape as U1's
// anchor-ladder allow-lists): the RAMP itself clamps for a source whose CIE L* falls outside
// [RAMP_L_MIN, RAMP_L_MAX], landing stop 500 at the pivot the OTHER stops are shaped around instead
// of the verbatim anchor pixel (see tonal.js's own comment on why: forcing the verbatim anchor there
// would jump away from that pivot and invert the ramp at 550/450, which is exactly what broke before
// this branch existed). `prime.DEFAULT` (the token, C2 above) stays exact for ALL 3,380 regardless —
// only the ramp's own stop 500 clamps.
const RAMP_WINDOW_ALLOW = [
  `brands "Nike · The Swoosh · Since 1971" secondary #101820`,
  `brands "Nike · The Swoosh · Since 1971" tertiary-muted #FFFFFF`,
  `film "2001: A Space Odyssey · 1968 · dir. Kubrick · the centrifuge & the stargate" tertiary-muted #1A1B1E`,
  `film "Double Indemnity · 1944 · dir. Billy Wilder · the venetian-blind living room" primary #1B1B1D`,
  `film "TRON: Legacy · 2010 · dir. Kosinski · the Grid" secondary #181B1F`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913`,
  `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913`,
].sort();

// C5: over both stop sets, measured CIELAB tone must be non-increasing 050→950 in every mode (see
// NONMONO_ALLOW above the sweep loop — 1 named, bounded, shipped-preset exception, not 0, pending
// Q-U2-5's dampAmp/chroma-basis ruling — including the 10 window-clamped sources above, whose clamp
// fix makes them CONTINUOUS with their neighbours, not merely "allowed to be wrong"). Every ramp
// should also keep a >=0.55 L* gap between neighbours on the 19-stop DISPLAY ramp, and no duplicate
// hex anywhere on the 25-stop EXPORT ramp — GATED SEPARATELY on their own matching stop sets
// (re-diagnosis Finding 6, review F5): RAMP_L_MIN/MAX [9.95, 95.05] was derived for the 19-stop
// ramp's own 0.55 L* gap requirement (5 + 9x0.55); checking it against the FINER 25-stop export
// ramp's half-steps (the shipped U2 gate's own original mistake) was a stop-set mismatch, not an
// OKHSL-l-vs-CIE-L* non-uniformity problem as U2's own Q-U2-3 first guessed (that explains at most
// 56 of the population, and only where Finding 1's chroma-basis fix also contributes). Measured on
// the RENDERED path (Finding 0/F1: `projectView(hydrate(preset))`, each preset's OWN controls
// resolved via `rampChromaOf`, never a raw `paletteStops` proxy under `DEFAULT_CONTROLS`), after
// Finding 1's chroma-basis fix (the anchored branches route through the shared `chromaEnvelope`, the
// anchor's own measured chroma/`s` as the pivot basis — see Q-U2-5 for the REQ-002 tension this
// creates, not yet resolved) and Finding 7's clamp-pivot fix (`okhslLAtChromatic`, landing the
// window-clamped stop's RENDERED L* at the window bound instead of up to 2.26 L* short of it): the
// combined 119-name list splits into **62** names failing the 19-stop gap bar (RAMP_GAP_ALLOW below)
// and **12** names failing 25-stop distinctness (RAMP_DISTINCT_ALLOW, below that) — a source can
// appear on both. Named, frozen, sorted — compared by name, not count (N1's own lesson, applied here
// too).
const RAMP_GAP_ALLOW = [
  `architecture "Katsura Imperial Villa · 17th c · Kyoto" primary #282322`,
  `brands "Burger King · The Flame Identity · 2021 rebrand" tertiary-muted #F5EBDC`,
  `brands "Nike · The Swoosh · Since 1971" secondary #101820`,
  `brands "Nike · The Swoosh · Since 1971" tertiary-muted #FFFFFF`,
  `cuisine "Chocolate · the chocolatier's bench" primary #312722`,
  `film "2001: A Space Odyssey · 1968 · dir. Kubrick · the centrifuge & the stargate" tertiary-muted #1A1B1E`,
  `film "Apocalypse Now · 1979 · dir. Coppola · the river at dusk" primary #241E1A`,
  `film "Arrival · 2016 · dir. Villeneuve · the shell interior" primary-muted #232427`,
  `film "Blade Runner · 1982 · dir. Ridley Scott · the rainy LA street" secondary #27292F`,
  `film "Double Indemnity · 1944 · dir. Billy Wilder · the venetian-blind living room" primary #1B1B1D`,
  `film "Enter the Void · 2009 · dir. Gaspar Noé · the Tokyo nightlife" secondary #212129`,
  `film "Hereditary · 2018 · dir. Aster · the dollhouse home" tertiary-muted #29231F`,
  `film "John Wick · 2014 · dir. Stahelski · the Red Circle club" tertiary-muted #232428`,
  `film "Once Upon a Time in the West · 1968 · dir. Leone · the railhead town" tertiary-muted #312721`,
  `film "Spider-Man: Into the Spider-Verse · 2018 · the comic-book city" primary #232429`,
  `film "Suspiria · 1977 · dir. Argento · the ballet academy" tertiary-muted #201F25`,
  `film "TRON: Legacy · 2010 · dir. Kosinski · the Grid" secondary #181B1F`,
  `film "The Matrix · 1999 · dir. Wachowskis · inside the simulation" tertiary-muted #1F1F24`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E`,
  `film "The Red Shoes · 1948 · dir. Powell & Pressburger · the ballet" primary-muted #392737`,
  `film "The Third Man · 1949 · dir. Carol Reed · the wet Vienna cobbles at night" secondary-muted #252422`,
  `film "There Will Be Blood · 2007 · dir. P.T. Anderson · the oil derrick fire" tertiary-muted #282320`,
  `film "Touch of Evil · 1958 · dir. Orson Welles · the border-town night" secondary #232428`,
  `literature "Anna Karenina · Tolstoy · 1877 · the Moscow station in snow" tertiary-muted #252428`,
  `literature "Dracula · Bram Stoker · 1897 · the Carpathian castle at night" secondary #28292D`,
  `literature "Fahrenheit 451 · Bradbury · 1953 · the fireman's city" tertiary-muted #282320`,
  `literature "The Bell Jar · Sylvia Plath · 1963 · New York & the suburb" primary #242427`,
  `literature "The Tale of Genji · Murasaki Shikibu · c.1010 · the Heian court" secondary-muted #292321`,
  `music "Acid house · the smiley flyer" tertiary-muted #26241F`,
  `music "Black metal · the forest at night" secondary #1E2024`,
  `music "Doom & stoner · the amp-fuzz haze" secondary-muted #28262C`,
  `music "Golden-age NYC · the boom-bap sleeve" primary #242428`,
  `music "Graffiti · the subway-car piece" primary #242428`,
  `music "Leather & studs · the club night" secondary #242428`,
  `music "Liquid light show · the projected oil-wheel" tertiary-muted #26232C`,
  `music "Lovers rock · the blue-light basement" primary #242428`,
  `music "Mod & British Invasion · the op-art club" tertiary #242428`,
  `music "Motown · the glamour stage" tertiary-muted #26272B`,
  `music "Neon MV · the night-set choreography" tertiary-muted #26232C`,
  `music "P-Funk · the cosmic album art" secondary-muted #211E27`,
  `music "Pop-punk · the skate-park sleeve" secondary #26272B`,
  `music "Rasta tricolour · the roots sleeve" tertiary-muted #282320`,
  `music "Riot grrrl · the zine collage" tertiary-muted #242427`,
  `music "Southern trap · the night-drive cover" tertiary-muted #26222F`,
  `music "Studio 54 · the dancefloor" secondary #2B2734`,
  `music "Symphonic & gothic metal · the cathedral set" tertiary-muted #272328`,
  `music "The late-night club · the smoky set" primary-muted #1F1F23`,
  `music "The orchestra · the concert platform" secondary #242428`,
  `music "The rave · the laser tent" secondary #212228`,
  `music "UK '77 · the ransom-note sleeve" secondary #1F1F23`,
  `nature "32° N · constant · Carlsbad Caverns, New Mexico, lamp-lit" secondary #1D1D20`,
  `travel "19° N · December · 06:20 · Worli koliwada, Mumbai, just before sunrise" tertiary-muted #24234B`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
  `travel "22° N · January · 11:00 · Sapa Sunday market, Lào Cai Province, cold mountain fog" secondary #042546`,
  `travel "23° S · December · 16:20 · Salar de Atacama, 2,305 m" secondary #EBEAE6`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
  `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" primary #1E1D1B`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913`,
  `travel "34° S · March · 22:00 · San Telmo, Buenos Aires, a Sunday after the antiques fair has closed" secondary-muted #22242B`,
  `travel "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight" tertiary-muted #232220`,
  `travel "37° N · November · 05:40 · MV passing Kea, en route Piraeus" primary #2E2B37`,
  `travel "37° N · November · 05:40 · MV passing Kea, en route Piraeus" primary-muted #E1F5DA`,
  `travel "41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in" tertiary-muted #251B12`,
  `travel "42° N · July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season" tertiary-muted #252215`,
  `travel "48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide" primary-muted #251B14`,
  `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913`,
  `travel "63° N · Late August · 15:00 · Reynisfjara, south coast of Iceland" secondary #242427`,
  `travel "67° N · January · 03:00 · The Helsinki–Rovaniemi night train, somewhere past Oulu" tertiary-muted #20263A`,
].sort();

// RAMP_DISTINCT_ALLOW (Finding 6 fix): the 25-stop export ramp's own duplicate-hex population,
// gated separately from RAMP_GAP_ALLOW's 19-stop gap population — see the comment above
// RAMP_GAP_ALLOW. A source can appear on both lists.
const RAMP_DISTINCT_ALLOW = [
  `brands "Burger King · The Flame Identity · 2021 rebrand" tertiary-muted #F5EBDC`,
  `brands "Nike · The Swoosh · Since 1971" tertiary-muted #FFFFFF`,
  `film "Apocalypse Now · 1979 · dir. Coppola · the river at dusk" primary #241E1A`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
  `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" primary #1E1D1B`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913`,
  `travel "48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide" primary-muted #251B14`,
  `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913`,
].sort();

const MODES = ["perceptual", "peak", "even"];
function monotoneOk(stops) {
  for (let i = 1; i < stops.length; i++) if (stops[i].tone > stops[i - 1].tone + 1e-9) return false;
  return true;
}
// gapOk19 / distinctOk25 (re-diagnosis Finding 6, review F5): RAMP_L_MIN/MAX [9.95, 95.05] was
// derived for the 19-stop DISPLAY ramp's 0.55 L* gap requirement (5 + 9x0.55) — checking it against
// the 25-stop EXPORT ramp instead (finer half-steps) was a stop-set mismatch, not an OKHSL-uniformity
// problem (U2's own original Q-U2-3 diagnosis, corrected here): gating the two requirements on their
// OWN matching stop sets shrinks the combined 119-name allow-list to 62 (gap, 19-stop) + 12 (distinct,
// 25-stop), and the causal story lines up with the window's own derivation again.
function gapOk19(stops) {
  let minGap = Infinity;
  for (let i = 1; i < stops.length; i++) minGap = Math.min(minGap, stops[i - 1].tone - stops[i].tone);
  return minGap >= 0.55 - 1e-9;
}
function distinctOk25(stops) {
  return new Set(stops.map((s) => s.hex)).size === stops.length;
}

// negative control, run BEFORE the real sweep (checks-that-bite): the three predicates above must
// discriminate a synthetic violation before the corpus is trusted against them.
{
  const bad = [{ stop: 50, tone: 50, hex: "#111111" }, { stop: 100, tone: 51, hex: "#111111" }];
  if (monotoneOk(bad)) FAIL("anchor-ramp", "negative control DID NOT bite: monotoneOk() passed a synthetic rising-tone pair");
  const thin = [{ stop: 50, tone: 60, hex: "#222222" }, { stop: 100, tone: 59.99, hex: "#222223" }];
  if (gapOk19(thin)) FAIL("anchor-ramp", "negative control DID NOT bite: gapOk19() passed a synthetic sub-0.55-gap pair");
  const dup = [{ stop: 50, tone: 60, hex: "#222222" }, { stop: 100, tone: 55, hex: "#222222" }];
  if (distinctOk25(dup)) FAIL("anchor-ramp", "negative control DID NOT bite: distinctOk25() passed a synthetic duplicate-hex pair");
}

// C3's own named negative control (per the plan): lift 40 on an anchored palette leaves stop 500
// unchanged; a non-anchored copy of the SAME palette moves. Run against a real in-window corpus
// subject before the positive count is trusted.
{
  const sample = anchored.find((c) => {
    const l = lstarFromRgb(hexToRgb(c.palette.anchor));
    return l >= RAMP_L_MIN && l <= RAMP_L_MAX;
  });
  if (!sample) FAIL("anchor-ramp", "no in-window anchored palette found to run C3's own negative control against");
  else {
    const ctlA = { ...DEFAULT_CONTROLS, toneMode: "perceptual", hueSpace: sample.hueSpace ?? "oklch" };
    const liftedAnchored = { ...sample.palette, lift: 40 };
    const stopsA = paletteStops(liftedAnchored, ctlA, [500]);
    if (stopsA[0].hex !== sample.palette.anchor)
      FAIL("anchor-ramp", `C3 negative control: lift 40 on an anchored palette moved stop 500 (${stopsA[0].hex} !== ${sample.palette.anchor}) — the anchor is not fixed`);
    const nonAnchored = { ...sample.palette, anchor: undefined, sourceAnchor: undefined, lift: 40 };
    const nonAnchoredBase = { ...sample.palette, anchor: undefined, sourceAnchor: undefined, lift: 0 };
    const stopsB = paletteStops(nonAnchored, ctlA, [500]);
    const stopsB0 = paletteStops(nonAnchoredBase, ctlA, [500]);
    if (stopsB[0].hex === stopsB0[0].hex)
      FAIL("anchor-ramp", "C3 negative control DID NOT bite: a non-anchored copy's stop 500 did not move between lift 0 and lift 40 — the control cannot discriminate anchored from non-anchored");
  }
}

// RENDERED-path sweep (F1 fix, review pif-u2-review-1.md): a raw `paletteStops(p, {...DEFAULT_CONTROLS,
// toneMode, hueSpace}, EXPORT_STOPS)` proxy call is NOT what the product renders — the product renders
// `projectView(hydrate(preset))`, which resolves EACH preset's OWN controls (damp/dampCurve/dampAmp/
// dampBias/relChroma/chromaFloor/lmin/lmax/curve/tension, all preset-authored, not DEFAULT_CONTROLS'
// values) via `rampChromaOf`. The proxy measured "0 non-monotone" while the rendered path had 16 real
// non-monotone ramps (F1/F2's own fix; test/engine/curated-contrast.mjs already uses the right entry
// point for this exact reason). Iterated by PRESET x MODE (343 x 3 = 1,029 renders, not 10,140 lean
// calls) so each hydrate+projectView computes every palette in that preset's document at once, exactly
// once per mode — the SAME cost shape as the product's own render.
// NONMONO_ALLOW (re-diagnosis Finding 1/1b addendum, Q-U2-5 ruled — revision 17): re-measured after
// the ruled chroma/saturation BLEND (the anchor's own value at the pivot, shading to `rampChroma` at
// the ramp's ends — see paletteStopsAnchored/okhslStopsAnchored's own header comments) replaced the
// literal, unconditional anchor basis. Grew from 1 named exception to 45: blending toward a SECOND,
// independent chroma target introduces a chroma trajectory `chromaEnvelope`'s shoulder/damp shaping
// was not built against, so more dark-end (mostly stop 900-950, mostly peak mode, where F4 pins full
// curve/tension shaping) sources cross into the SAME Helmholtz-Kohlrausch coupling #668's own
// mechanism names — measured CIE L* rising slightly while OKHSL l and chroma both fall. Every entry
// re-verified individually against the rendered path, not assumed from the count. 39 of 45 are
// peak mode, 6 perceptual, 0 even; the concentration in peak mode matches F4's own curve-shaping
// being fully engaged there. Named, not silently dropped; expected to shrink once
// U3's own `VIVID_MIDS.dampAmp` 55->0 fix lands (most named sources carry a non-zero generated
// `dampAmp`) — flagged in `.sdlc/questions/pif-u2.md` Q-U2-5's addendum as an owner-visible open
// question, since unlike U3's own synthetic-grid exceptions every one of these is a real shipped
// preset the growth from 1 to 45 needs the owner to see, not just the mechanism.
const NONMONO_ALLOW = [
  `brands "Nike · The Swoosh · Since 1971" secondary #101820 [peak, 25-stop]`,
  `film "2001: A Space Odyssey · 1968 · dir. Kubrick · the centrifuge & the stargate" tertiary-muted #1A1B1E [peak, 25-stop]`,
  `film "2001: A Space Odyssey · 1968 · dir. Kubrick · the centrifuge & the stargate" tertiary-muted #1A1B1E [perceptual, 25-stop]`,
  `film "Arrival · 2016 · dir. Villeneuve · the shell interior" primary-muted #232427 [peak, 25-stop]`,
  `film "Double Indemnity · 1944 · dir. Billy Wilder · the venetian-blind living room" primary #1B1B1D [peak, 19-stop]`,
  `film "Double Indemnity · 1944 · dir. Billy Wilder · the venetian-blind living room" primary #1B1B1D [peak, 25-stop]`,
  `film "Double Indemnity · 1944 · dir. Billy Wilder · the venetian-blind living room" primary #1B1B1D [perceptual, 25-stop]`,
  `film "Enter the Void · 2009 · dir. Gaspar Noé · the Tokyo nightlife" secondary #212129 [peak, 25-stop]`,
  `film "The Matrix · 1999 · dir. Wachowskis · inside the simulation" tertiary-muted #1F1F24 [peak, 19-stop]`,
  `film "The Matrix · 1999 · dir. Wachowskis · inside the simulation" tertiary-muted #1F1F24 [peak, 25-stop]`,
  `film "The Matrix · 1999 · dir. Wachowskis · inside the simulation" tertiary-muted #1F1F24 [perceptual, 25-stop]`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618 [peak, 19-stop]`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618 [peak, 25-stop]`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618 [perceptual, 25-stop]`,
  `literature "The Bell Jar · Sylvia Plath · 1963 · New York & the suburb" primary #242427 [peak, 25-stop]`,
  `music "Golden-age NYC · the boom-bap sleeve" primary #242428 [peak, 25-stop]`,
  `music "Graffiti · the subway-car piece" primary #242428 [peak, 25-stop]`,
  `music "Leather & studs · the club night" secondary #242428 [peak, 25-stop]`,
  `music "Liquid light show · the projected oil-wheel" tertiary-muted #26232C [peak, 19-stop]`,
  `music "Liquid light show · the projected oil-wheel" tertiary-muted #26232C [peak, 25-stop]`,
  `music "Lovers rock · the blue-light basement" primary #242428 [peak, 25-stop]`,
  `music "Mod & British Invasion · the op-art club" tertiary #242428 [peak, 25-stop]`,
  `music "Neon MV · the night-set choreography" tertiary-muted #26232C [peak, 19-stop]`,
  `music "Neon MV · the night-set choreography" tertiary-muted #26232C [peak, 25-stop]`,
  `music "P-Funk · the cosmic album art" secondary-muted #211E27 [peak, 19-stop]`,
  `music "P-Funk · the cosmic album art" secondary-muted #211E27 [peak, 25-stop]`,
  `music "P-Funk · the cosmic album art" secondary-muted #211E27 [perceptual, 25-stop]`,
  `music "Riot grrrl · the zine collage" tertiary-muted #242427 [peak, 25-stop]`,
  `music "Symphonic & gothic metal · the cathedral set" tertiary-muted #272328 [peak, 19-stop]`,
  `music "Symphonic & gothic metal · the cathedral set" tertiary-muted #272328 [peak, 25-stop]`,
  `music "The late-night club · the smoky set" primary-muted #1F1F23 [peak, 19-stop]`,
  `music "The late-night club · the smoky set" primary-muted #1F1F23 [peak, 25-stop]`,
  `music "The orchestra · the concert platform" secondary #242428 [peak, 25-stop]`,
  `music "UK '77 · the ransom-note sleeve" secondary #1F1F23 [peak, 19-stop]`,
  `music "UK '77 · the ransom-note sleeve" secondary #1F1F23 [peak, 25-stop]`,
  `nature "32° N · constant · Carlsbad Caverns, New Mexico, lamp-lit" secondary #1D1D20 [peak, 19-stop]`,
  `nature "32° N · constant · Carlsbad Caverns, New Mexico, lamp-lit" secondary #1D1D20 [peak, 25-stop]`,
  `nature "32° N · constant · Carlsbad Caverns, New Mexico, lamp-lit" secondary #1D1D20 [perceptual, 25-stop]`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16 [peak, 25-stop]`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16 [peak, 25-stop]`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913 [peak, 25-stop]`,
  `travel "37° N · November · 05:40 · MV passing Kea, en route Piraeus" primary-muted #E1F5DA [peak, 25-stop]`,
  `travel "41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in" tertiary-muted #251B12 [peak, 25-stop]`,
  `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913 [peak, 25-stop]`,
  `travel "63° N · Late August · 15:00 · Reynisfjara, south coast of Iceland" secondary #242427 [peak, 25-stop]`,
].sort();

let rampExact = 0, rampOff = 0;
const windowNames = new Set(), nonMonoNames = new Set(), gapNames = new Set(), distinctNames = new Set();
for (const { slug, preset } of presetsByCat) {
  for (const mode of MODES) {
    const doc = hydrate({ ...preset, toneMode: mode });
    const view = projectView(doc);
    for (const p of doc.palettes) {
      if (typeof p.anchor !== "string") continue;
      const srcL = lstarFromRgb(hexToRgb(p.anchor));
      const outsideWindow = srcL < RAMP_L_MIN || srcL > RAMP_L_MAX;
      const label = `${slug} "${preset.name}" ${p.name} ${p.anchor}`;
      if (outsideWindow) windowNames.add(label);
      const vp = view.palettes.find((v) => v.name === p.name);
      const ramp19 = vp ? vp.ramp : null, ramp25 = vp ? vp.fullRamp : null;
      const s500 = ramp25 && ramp25.find((s) => s.stop === 500);
      if (!outsideWindow) {
        if (s500 && s500.hex === p.anchor) rampExact++;
        else { rampOff++; FAIL("anchor-ramp", `${slug} "${preset.name}" ${p.name} (${mode}, rendered): stop 500 ${s500 && s500.hex} !== anchor ${p.anchor}, and this source is INSIDE the ramp window — it should be exact`); }
      }
      if (!ramp19 || !ramp25) { FAIL("anchor-ramp", `${slug} "${preset.name}" ${p.name} (${mode}): projectView produced no matching palette — the render path changed shape`); continue; }
      // Monotone (Finding 6): gated on BOTH stop sets independently, matching C5's own "43 on the
      // 19-stop, 11/46 on the 25-stop" reporting shape — a ramp that only rises on the finer 25-stop
      // export ramp is a real, distinct finding from one that rises on the coarser 19-stop display ramp.
      if (!monotoneOk(ramp19)) nonMonoNames.add(`${label} [${mode}, 19-stop]`);
      if (!monotoneOk(ramp25)) nonMonoNames.add(`${label} [${mode}, 25-stop]`);
      // Gap (0.55 L*, 19-stop display ramp) and distinctness (no duplicate hex, 25-stop export ramp)
      // gated SEPARATELY on their own matching stop sets (Finding 6 fix — see gapOk19/distinctOk25).
      if (!gapOk19(ramp19)) gapNames.add(label);
      if (!distinctOk25(ramp25)) distinctNames.add(label);
    }
  }
}
// `anchored` (declared above, from `corpus`) is reused below only as the summary line's denominator.
const windowSorted = [...windowNames].sort();
const gapSorted = [...gapNames].sort();
const distinctSorted = [...distinctNames].sort();
const nonMonoSorted = [...nonMonoNames].sort();
console.log(`  ${rampOff === 0 ? "pass" : "FAIL"}  anchor-ramp: ${rampExact} exact, ${rampOff} off (in-window sources only, ${anchored.length - windowNames.size} of ${anchored.length})`);
console.log(`  ${windowSorted.length === RAMP_WINDOW_ALLOW.length && windowSorted.every((n, i) => n === RAMP_WINDOW_ALLOW[i]) ? "pass" : "FAIL"}  anchor-ramp allow-list: ${windowSorted.length} (expected ${RAMP_WINDOW_ALLOW.length})`);
if (windowSorted.length !== RAMP_WINDOW_ALLOW.length || windowSorted.some((n, i) => n !== RAMP_WINDOW_ALLOW[i])) {
  for (const n of RAMP_WINDOW_ALLOW) if (!windowSorted.includes(n)) FAIL("anchor-ramp", `window-clamp allow-list: expected member missing — ${n}`);
  for (const n of windowSorted) if (!RAMP_WINDOW_ALLOW.includes(n)) FAIL("anchor-ramp", `window-clamp allow-list: unexpected member — ${n}`);
}
for (const n of RAMP_WINDOW_ALLOW) console.log(`    r ${n}`);
console.log(`  ${nonMonoSorted.length === NONMONO_ALLOW.length && nonMonoSorted.every((n, i) => n === NONMONO_ALLOW[i]) ? "pass" : "FAIL"}  anchor-ramp monotone allow-list: ${nonMonoSorted.length} (expected ${NONMONO_ALLOW.length}, all three modes, both stop sets, all 3,380 sources including the window-clamped ones)`);
if (nonMonoSorted.length !== NONMONO_ALLOW.length || nonMonoSorted.some((n, i) => n !== NONMONO_ALLOW[i])) {
  for (const n of NONMONO_ALLOW) if (!nonMonoSorted.includes(n)) FAIL("anchor-ramp", `monotone allow-list: expected member missing — ${n}`);
  for (const n of nonMonoSorted) if (!NONMONO_ALLOW.includes(n)) FAIL("anchor-ramp", `monotone allow-list: unexpected member (a real rise) — ${n}: measured tone rises somewhere on this ramp`);
}
console.log(`  ${gapSorted.length === RAMP_GAP_ALLOW.length && gapSorted.every((n, i) => n === RAMP_GAP_ALLOW[i]) ? "pass" : "FAIL"}  anchor-ramp gap (19-stop) allow-list: ${gapSorted.length} (expected ${RAMP_GAP_ALLOW.length})`);
if (gapSorted.length !== RAMP_GAP_ALLOW.length || gapSorted.some((n, i) => n !== RAMP_GAP_ALLOW[i])) {
  for (const n of RAMP_GAP_ALLOW) if (!gapSorted.includes(n)) FAIL("anchor-ramp", `gap allow-list: expected member missing — ${n}`);
  for (const n of gapSorted) if (!RAMP_GAP_ALLOW.includes(n)) FAIL("anchor-ramp", `gap allow-list: unexpected member — ${n}`);
}
console.log(`  ${distinctSorted.length === RAMP_DISTINCT_ALLOW.length && distinctSorted.every((n, i) => n === RAMP_DISTINCT_ALLOW[i]) ? "pass" : "FAIL"}  anchor-ramp distinct (25-stop) allow-list: ${distinctSorted.length} (expected ${RAMP_DISTINCT_ALLOW.length})`);
if (distinctSorted.length !== RAMP_DISTINCT_ALLOW.length || distinctSorted.some((n, i) => n !== RAMP_DISTINCT_ALLOW[i])) {
  for (const n of RAMP_DISTINCT_ALLOW) if (!distinctSorted.includes(n)) FAIL("anchor-ramp", `distinct allow-list: expected member missing — ${n}`);
  for (const n of distinctSorted) if (!RAMP_DISTINCT_ALLOW.includes(n)) FAIL("anchor-ramp", `distinct allow-list: unexpected member — ${n}`);
}

// N1-style negative control: a same-length, one-member-swapped copy of each allow-list must fail the
// sorted-array comparison (proves a same-count substitution cannot slip through silently). Covers all
// FOUR allow-lists this gate now freezes (window-clamp, monotone, gap-19, distinct-25).
{
  const check = (name, list, fakeMember) => {
    const swapped = list.slice(0, -1).concat(fakeMember).sort();
    const real = [...list].sort();
    if (swapped.length !== real.length || swapped.every((n, i) => n === real[i])) FAIL("anchor-ramp", `negative control DID NOT bite: a swapped ${name} allow-list compared equal to the real one`);
  };
  check("window-clamp", RAMP_WINDOW_ALLOW, `film "A Made-Up Title" primary #000001`);
  check("monotone", NONMONO_ALLOW, `film "A Made-Up Title" primary #000002 [peak, 25-stop]`);
  check("gap", RAMP_GAP_ALLOW, `film "A Made-Up Title" primary #000003`);
  check("distinct", RAMP_DISTINCT_ALLOW, `film "A Made-Up Title" primary #000004`);
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
for (const g of ["anchor-identity", "prime-identity-control", "anchor-ladder", "anchor-ramp"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  if (!f) continue; // already printed a pass/FAIL summary line above; only surface the FIRST failure detail here
  console.error(`    — ${f.slice(g.length + 2)}`);
}
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: anchor identity clears C2 and C4's prime-half predicates");
process.exit(0);
