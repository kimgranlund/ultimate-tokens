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
import { peakC, hctToRgb, lstarFromRgb, cam16FromRgb } from "../../src/engine/hct.js";
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

// C5: over both stop sets, measured pixel L* must be non-increasing 050→950 in every mode, a true 0
// with no allow-list (R1, review pass 2, see `enforceMonotonePixelL` in tonal.js), including the 10
// window-clamped sources above, whose clamp fix makes them CONTINUOUS with their neighbours, not
// merely "allowed to be wrong". Every ramp
// should also keep a >=0.55 L* gap between neighbours on the 19-stop DISPLAY ramp, and no duplicate
// hex anywhere on the 25-stop EXPORT ramp - GATED SEPARATELY on their own matching stop sets
// (re-diagnosis Finding 6, review F5): RAMP_L_MIN/MAX [9.95, 95.05] was derived for the 19-stop
// ramp's own 0.55 L* gap requirement (5 + 9x0.55); checking it against the FINER 25-stop export
// ramp's half-steps (the shipped U2 gate's own original mistake) was a stop-set mismatch, not an
// OKHSL-l-vs-CIE-L* non-uniformity problem as U2's own Q-U2-3 first guessed. Measured on the RENDERED
// path (Finding 0/F1: `projectView(hydrate(preset))`, each preset's OWN controls resolved via
// `rampChromaOf`, never a raw `paletteStops` proxy under `DEFAULT_CONTROLS`), re-measured again for
// R6 (review pass 2, 2026-09-18, the toneAt-affine-remap that replaced `anchorLerp`'s per-side
// double-S changed the tone construction this population is measured against; the brief's own words:
// "expect the gap list ... to move; that is the point") and again for review pass 3's Finding 2
// (2026-09-18, `gapOk19` now reads PIXEL L*, not the `tone` field - see its own header comment above -
// surfacing 3 more names invisible to the old tone-based check): the combined population splits into
// **93** names failing the 19-stop gap bar (RAMP_GAP_ALLOW below) and **14** names failing 25-stop
// distinctness (RAMP_DISTINCT_ALLOW, below that) - a source can appear on both. Named, frozen, sorted
// - compared by name, not count (N1's own lesson, applied here too). Q-U2-5's own REQ-002 chroma-basis
// tension is RULED (the anchor's own value at the pivot, blending to `rampChroma` at the ends by
// liftStop - see `anchorChromaBasis`'s own header comment in tonal.js), not an open question any more.
// Gap growth attribution, corrected (review pass 3, Finding 6): from `0849f67`'s own 69, each of the
// three review-pass-2 changes measured ALONE (not combined) moves the count: R6 alone 69 -> 76 (+7,
// the single largest factor), the R3 hue solve alone +2, the smoothstep chroma-basis easing (R2) alone
// +3 - all three interact rather than summing linearly to the observed 90 (pre-Finding-2) / 93
// (pixel-corrected) total. Do not credit R6 alone for the full 69 -> 93 move, as an earlier record did.
const RAMP_GAP_ALLOW = [
  `architecture "Katsura Imperial Villa · 17th c · Kyoto" primary #282322`,
  `brands "Burger King · The Flame Identity · 2021 rebrand" tertiary-muted #F5EBDC`,
  `brands "Nike · The Swoosh · Since 1971" secondary #101820`,
  `brands "Nike · The Swoosh · Since 1971" tertiary-muted #FFFFFF`,
  `cuisine "Chocolate · the chocolatier's bench" primary #312722`,
  `cuisine "Espresso · the café counter" tertiary #392B23`,
  `cuisine "Kaiseki · the seasonal course" tertiary-muted #2B2624`,
  `cuisine "Matcha & wagashi · the tea room" tertiary-muted #2B2624`,
  `film "2001: A Space Odyssey · 1968 · dir. Kubrick · the centrifuge & the stargate" tertiary-muted #1A1B1E`,
  `film "Apocalypse Now · 1979 · dir. Coppola · the river at dusk" primary #241E1A`,
  `film "Arrival · 2016 · dir. Villeneuve · the shell interior" primary-muted #232427`,
  `film "Blade Runner · 1982 · dir. Ridley Scott · the rainy LA street" secondary #27292F`,
  `film "Double Indemnity · 1944 · dir. Billy Wilder · the venetian-blind living room" primary #1B1B1D`,
  `film "Enter the Void · 2009 · dir. Gaspar Noé · the Tokyo nightlife" secondary #212129`,
  `film "Hereditary · 2018 · dir. Aster · the dollhouse home" tertiary-muted #29231F`,
  `film "Hero · 2002 · dir. Zhang Yimou · the red courtyard duel" tertiary-muted #282421`,
  `film "John Wick · 2014 · dir. Stahelski · the Red Circle club" tertiary-muted #232428`,
  `film "Once Upon a Time in the West · 1968 · dir. Leone · the railhead town" tertiary-muted #312721`,
  `film "Spider-Man: Into the Spider-Verse · 2018 · the comic-book city" primary #232429`,
  `film "Suspiria · 1977 · dir. Argento · the ballet academy" tertiary-muted #201F25`,
  `film "TRON: Legacy · 2010 · dir. Kosinski · the Grid" secondary #181B1F`,
  `film "The Godfather · 1972 · dir. Coppola · cin. Gordon Willis · the don's study" secondary #302721`,
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
  `music "Detroit techno · the chrome sleeve" secondary #24272B`,
  `music "Doom & stoner · the amp-fuzz haze" secondary-muted #28262C`,
  `music "Golden-age NYC · the boom-bap sleeve" primary #242428`,
  `music "Graffiti · the subway-car piece" primary #242428`,
  `music "Kingston street · the sound-system yard" secondary #24272B`,
  `music "Leather & studs · the club night" secondary #242428`,
  `music "Liquid light show · the projected oil-wheel" tertiary-muted #26232C`,
  `music "Lovers rock · the blue-light basement" primary #242428`,
  `music "Mod & British Invasion · the op-art club" tertiary #242428`,
  `music "Motown · the glamour stage" tertiary-muted #26272B`,
  `music "Neon MV · the night-set choreography" tertiary-muted #26232C`,
  `music "Outlaw country · the desert-highway sleeve" tertiary-muted #2D2E34`,
  `music "P-Funk · the cosmic album art" secondary-muted #211E27`,
  `music "Pop-punk · the skate-park sleeve" secondary #26272B`,
  `music "Rasta tricolour · the roots sleeve" tertiary-muted #282320`,
  `music "Riot grrrl · the zine collage" tertiary-muted #242427`,
  `music "Romantic era · the candlelit recital" primary-muted #392B23`,
  `music "Soul Train · the TV stage" primary-muted #2D2E34`,
  `music "Southern trap · the night-drive cover" tertiary-muted #26222F`,
  `music "Studio 54 · the dancefloor" secondary #2B2734`,
  `music "Symphonic & gothic metal · the cathedral set" tertiary-muted #272328`,
  `music "The late-night club · the smoky set" primary-muted #1F1F23`,
  `music "The late-night club · the smoky set" secondary #2F2823`,
  `music "The orchestra · the concert platform" secondary #242428`,
  `music "The rave · the laser tent" secondary #212228`,
  `music "UK '77 · the ransom-note sleeve" secondary #1F1F23`,
  `nature "19° N · April · 18:00 · Kīlauea, Hawai'i, at dusk" secondary #28292E`,
  `nature "24° S · June · 07:00 · Sossusvlei, Namib Desert, Namibia" tertiary-muted #2B2621`,
  `nature "32° N · constant · Carlsbad Caverns, New Mexico, lamp-lit" secondary #1D1D20`,
  `nature "51° S · November · 07:00 · Torres del Paine, Patagonian Andes, Chile" primary-muted #2D2E35`,
  `nature "64° S · January · 18:00 · Antarctic Peninsula, austral summer evening" tertiary-muted #2C2E32`,
  `travel "19° N · December · 06:20 · Worli koliwada, Mumbai, just before sunrise" tertiary-muted #24234B`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
  `travel "21° N · May · 02:00 · Hanoi Old Quarter, the hour after the pho stalls close" tertiary #581B16`,
  `travel "22° N · January · 11:00 · Sapa Sunday market, Lào Cai Province, cold mountain fog" secondary #042546`,
  `travel "23° S · December · 16:20 · Salar de Atacama, 2,305 m" secondary #EBEAE6`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" secondary #E0E5E6`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
  `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" primary #1E1D1B`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" tertiary-muted #31241A`,
  `travel "34° S · March · 22:00 · San Telmo, Buenos Aires, a Sunday after the antiques fair has closed" secondary-muted #22242B`,
  `travel "35° N · February · 23:48 · Yamanote line, last loop, between Shinjuku and Ikebukuro" secondary #DDE5EB`,
  `travel "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight" tertiary-muted #232220`,
  `travel "37° N · November · 05:40 · MV passing Kea, en route Piraeus" primary #2E2B37`,
  `travel "37° N · November · 05:40 · MV passing Kea, en route Piraeus" primary-muted #E1F5DA`,
  `travel "41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in" tertiary-muted #251B12`,
  `travel "42° N · July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season" primary-muted #282724`,
  `travel "42° N · July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season" tertiary-muted #252215`,
  `travel "47° N · October · 05:55 · Ger camp at Övörkhangai, the moment before sunrise" tertiary #4B271D`,
  `travel "48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide" primary-muted #251B14`,
  `travel "48° N · November · 18:50 · A wet evening in a Viennese kaffeehaus, Mariahilf" primary-muted #24221F`,
  `travel "59° N · January · 14:00 · Lake Baikal corridor" primary-muted #242D47`,
  `travel "59° N · January · 14:00 · Lake Baikal corridor" secondary #E0E5E6`,
  `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913`,
  `travel "63° N · Late August · 15:00 · Reynisfjara, south coast of Iceland" secondary #242427`,
  `travel "67° N · January · 03:00 · The Helsinki–Rovaniemi night train, somewhere past Oulu" tertiary-muted #20263A`,
].sort();

// RAMP_DISTINCT_ALLOW (Finding 6 fix): the 25-stop export ramp's own duplicate-hex population,
// gated separately from RAMP_GAP_ALLOW's 19-stop gap population — see the comment above
// RAMP_GAP_ALLOW. A source can appear on both lists.
const RAMP_DISTINCT_ALLOW = [
  `brands "Burger King · The Flame Identity · 2021 rebrand" tertiary-muted #F5EBDC`,
  `brands "Nike · The Swoosh · Since 1971" secondary #101820`,
  `brands "Nike · The Swoosh · Since 1971" tertiary-muted #FFFFFF`,
  `film "Apocalypse Now · 1979 · dir. Coppola · the river at dusk" primary #241E1A`,
  `film "TRON: Legacy · 2010 · dir. Kosinski · the Grid" secondary #181B1F`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
  `travel "23° S · December · 16:20 · Salar de Atacama, 2,305 m" secondary #EBEAE6`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
  `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" primary #1E1D1B`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913`,
  `travel "41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in" tertiary-muted #251B12`,
  `travel "48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide" primary-muted #251B14`,
  `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913`,
].sort();

// NOTCH_ALLOW (ruling Q-C, 2026-09-18): the owner ruled the notch gate is the 70%-ratio definition AND
// an absolute dip of at least 3 CAM16 C versus both neighbours (see notchOk's own header comment). This
// is the by-name list under that variant, measured on the rendered path: 76 entries (perceptual 15,
// peak 9, even 52), replacing the prior 459-entry ratio-only list. Every entry is a near-grey anchor
// inside a group whose resolved `rampChroma` target is well above it, still visibly notched under the
// smoothstep easing fix (see `anchorChromaBasis`'s own header comment in tonal.js) even after the
// absolute-dip clause drops the marginal, imperceptible ratio-only cases. Named "pending U4": accepted
// here so nothing widens silently, re-verified on the integrated tree, not a final owner acceptance of
// the count. Recorded in Q-U2-7.
const NOTCH_ALLOW = [
  `architecture "Charleston single house · antebellum vernacular · South Carolina" primary #DDDBD7 [even]`,
  `architecture "Falu-red farmstead · Swedish vernacular · Dalarna" tertiary-muted #DDDBD7 [even]`,
  `architecture "Habitat 67 · 1967 · Moshe Safdie · Montreal" tertiary-muted #D6D5D0 [even]`,
  `architecture "Himeji Castle · 1609 · 'White Heron' keep · Japan" secondary #E0DEDA [even]`,
  `architecture "Icelandic turf house · vernacular · Skógar / Glaumbær" tertiary-muted #D9D8D4 [even]`,
  `architecture "Katsura Imperial Villa · 17th c · Kyoto" primary #282322 [even]`,
  `architecture "Lancashire cotton mill · 19th c · northern England" primary-muted #8C9094 [perceptual]`,
  `architecture "New England saltbox · colonial vernacular · coastal Massachusetts" secondary-muted #83878B [peak]`,
  `architecture "New England saltbox · colonial vernacular · coastal Massachusetts" tertiary-muted #DDDBD7 [even]`,
  `architecture "Sydney Opera House · 1973 · Jørn Utzon" tertiary-muted #9A8C88 [even]`,
  `architecture "The Taj Mahal · 1648 · Agra · at dawn" secondary #DDCECA [even]`,
  `architecture "Trulli of Alberobello · vernacular · Puglia, Italy" primary #CCCBC7 [even]`,
  `architecture "Zollverein Coal Mine · 1932 · Schupp & Kremmer · Essen, Germany" primary-muted #8C9094 [perceptual]`,
  `cuisine "Caramel & toffee · the confection pan" primary #DDDBD6 [even]`,
  `cuisine "Día de Muertos table · the ofrenda" tertiary-muted #DDDBD6 [even]`,
  `cuisine "Espresso · the café counter" tertiary-muted #DDDBD6 [even]`,
  `cuisine "Fresh pasta · the marble work-bench" tertiary-muted #E0DEDA [even]`,
  `cuisine "Macarons · the display case" tertiary-muted #E0DEDA [even]`,
  `film "Raise the Red Lantern · 1991 · dir. Zhang Yimou · the courtyard at night" secondary #83878B [peak]`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618 [even]`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" secondary-muted #9FA2A6 [perceptual]`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary-muted #D6D5D2 [even]`,
  `film "The Third Man · 1949 · dir. Carol Reed · the wet Vienna cobbles at night" tertiary-muted #8C9093 [peak]`,
  `film "The Third Man · 1949 · dir. Carol Reed · the wet Vienna cobbles at night" tertiary-muted #8C9093 [perceptual]`,
  `film "The Witch · 2015 · dir. Eggers · the farm at the wood's edge" secondary #8B9194 [perceptual]`,
  `film "Touch of Evil · 1958 · dir. Orson Welles · the border-town night" tertiary #707276 [perceptual]`,
  `film "Touch of Evil · 1958 · dir. Orson Welles · the border-town night" tertiary-muted #DDDBD7 [even]`,
  `literature "Alice's Adventures in Wonderland · Carroll, ill. Tenniel · 1865" tertiary #DDDBD7 [even]`,
  `literature "Death of a Salesman · Arthur Miller · 1949 · the Loman house" tertiary-muted #777B81 [peak]`,
  `literature "Death of a Salesman · Arthur Miller · 1949 · the Loman house" tertiary-muted #777B81 [perceptual]`,
  `literature "Dracula · Bram Stoker · 1897 · the Carpathian castle at night" secondary-muted #85847E [even]`,
  `literature "Mistborn · Brandon Sanderson · 2006 · the ash-fall Final Empire" secondary #82817D [even]`,
  `literature "Mrs Dalloway · Virginia Woolf · 1925 · a June morning in Westminster" secondary-muted #8C9095 [peak]`,
  `literature "My Brilliant Friend · Ferrante · 2011 · a poor Naples neighbourhood" tertiary-muted #D3D1CC [even]`,
  `literature "The Catcher in the Rye · Salinger · 1951 · winter New York" secondary #777B80 [peak]`,
  `literature "The Catcher in the Rye · Salinger · 1951 · winter New York" secondary #777B80 [perceptual]`,
  `literature "The Handmaid's Tale · Atwood · 1985 · Gilead" secondary-muted #74797E [perceptual]`,
  `literature "The Makioka Sisters · Tanizaki · 1948 · the Kyoto cherry-viewing" primary-muted #A6A5A0 [even]`,
  `literature "The Road · Cormac McCarthy · 2006 · the ash-grey wasteland" secondary #7C7B77 [even]`,
  `literature "War and Peace · Tolstoy · 1869 · the winter ballroom & the retreat" secondary-muted #8C9094 [perceptual]`,
  `music "Doom & stoner · the amp-fuzz haze" secondary-muted #28262C [even]`,
  `music "Doom & stoner · the amp-fuzz haze" tertiary-muted #7C7982 [even]`,
  `music "Golden-age NYC · the boom-bap sleeve" secondary #777B80 [peak]`,
  `music "Golden-age NYC · the boom-bap sleeve" secondary #777B80 [perceptual]`,
  `music "Gospel · the church choir" primary-muted #DDDBD7 [even]`,
  `music "Mod & British Invasion · the op-art club" tertiary-muted #DDDBD7 [even]`,
  `music "Pop-punk · the skate-park sleeve" tertiary-muted #D9D8D4 [even]`,
  `music "Riot grrrl · the zine collage" tertiary #D0CEC9 [even]`,
  `music "The orchestra · the concert platform" tertiary-muted #DDDBD7 [even]`,
  `music "UK '77 · the ransom-note sleeve" secondary-muted #707276 [perceptual]`,
  `nature "0° · June · 11:00 · Congo Basin lowland forest, Odzala, Republic of the Congo" tertiary-muted #5C5E63 [perceptual]`,
  `nature "23° S · December · 13:00 · Salar de Atacama edge, Atacama Desert, Chile" secondary #E0DEDA [even]`,
  `nature "35° N · November · 16:00 · Kyoto temple maple, late autumn" primary #B3B2AC [even]`,
  `nature "43° S · February · 18:00 · Aoraki / Mount Cook, Southern Alps, New Zealand" tertiary-muted #7F848A [perceptual]`,
  `nature "49° N · October · 15:00 · Boreal shield, northern Ontario, Canada" secondary-muted #988984 [even]`,
  `nature "51° N · May · 09:00 · English oak woodland, Sussex, bluebell season" primary #D8D9D0 [even]`,
  `nature "51° S · November · 07:00 · Torres del Paine, Patagonian Andes, Chile" secondary-muted #978985 [even]`,
  `nature "57° N · August · 14:00 · Rannoch Moor blanket bog, Scottish Highlands" primary #D7D5CE [even]`,
  `nature "78° N · July · 14:00 · Spitsbergen interior, Svalbard" secondary #83878B [peak]`,
  `travel "17° N · November · 22:00 · An Oaxacan village cemetery on the first night of Día de los Muertos" tertiary-muted #636665 [peak]`,
  `travel "17° N · November · 22:00 · An Oaxacan village cemetery on the first night of Día de los Muertos" tertiary-muted #636665 [perceptual]`,
  `travel "23° S · December · 16:20 · Salar de Atacama, 2,305 m" secondary #EBEAE6 [even]`,
  `travel "26° N · June · 18:30 · The shrine of Lal Shahbaz Qalandar, Sehwan, at the evening dhamaal" tertiary-muted #BCBBB8 [even]`,
  `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" tertiary-muted #AC9D99 [even]`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary-muted #D0CEC9 [even]`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" secondary-muted #82817E [even]`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" tertiary #C4ABA7 [even]`,
  `travel "34° N · May · 04:30 · The corridor of torii at Fushimi Inari before opening hour" tertiary-muted #A2A19E [even]`,
  `travel "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight" secondary-muted #B9B8B4 [even]`,
  `travel "38° N · July · 11:00 · Point Reyes peninsula, California, the marine layer locked in for the third week" secondary #D0CEC9 [even]`,
  `travel "41° N · July · 20:30 · The Great Salt Lake at sunset, near Antelope Island causeway" tertiary-muted #413538 [even]`,
  `travel "41° N · October · 23:00 · Tbilisi viewed from the Mtatsminda funicular at the upper station" secondary #71716E [even]`,
  `travel "47° N · June · 10:00 · St. John's harbour, dense Atlantic fog" secondary #D0CEC9 [even]`,
  `travel "48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide" tertiary-muted #CFCECB [even]`,
  `travel "48° N · November · 18:50 · A wet evening in a Viennese kaffeehaus, Mariahilf" secondary-muted #CBCAC5 [even]`,
  `travel "55° N · July · 13:00 · Lowland Kamchatkan taiga in heavy mosquito season, near the Avacha river" tertiary-muted #ABAAA7 [even]`,
].sort();

const MODES = ["perceptual", "peak", "even"];
// monotoneOk (R1, review pass 2, 2026-09-18): reads PIXEL L* (`lstarFromRgb` of the actually-emitted
// hex), not the `tone` field the ramp reports as its OWN target — review 2's own finding: the "even"
// path returns `tone` as `anchorLerp`'s target L*, not the measured pixel, so a real pixel rise can sit
// invisible to a check that trusts `tone` (Night of the Hunter primary, even mode, stops 925->950: target
// 5.165->5.000 falls, pixel 5.044->5.070 rises — the same proxy class as re-diagnosis Finding 0, on the
// even path specifically). Measuring the rendered hex directly closes that gap on every path, even
// included.
function monotoneOk(stops) {
  for (let i = 1; i < stops.length; i++) {
    const l0 = lstarFromRgb(hexToRgb(stops[i - 1].hex));
    const l1 = lstarFromRgb(hexToRgb(stops[i].hex));
    if (l1 > l0 + 1e-9) return false;
  }
  return true;
}
// notchOk (R2, review pass 2, 2026-09-18; ruling Q-C, 2026-09-18): review 1's own ratio definition,
// stop 500's CAM16 chroma must be UNDER 70% of BOTH its immediate neighbours (450 and 550), AND an
// absolute dip of at least 3 CAM16 C versus BOTH neighbours, on the rendered path. The owner ruled the
// second clause after a measured variant showed the ratio-only definition flags many near-grey anchors
// whose absolute chroma dip is imperceptibly small (a 70%-under ratio on a chroma-2 pivot is a fraction
// of one CAM16 C). A continuity PROOF (chromaEnvelope(500,500,...)===1 exactly, anchorChromaBasis's own
// w=0 at the pivot) is not the same claim as either clause here: review 2 found 1,811 rendered cells
// still notched under the raw linear blend despite that proof holding, because "continuous" and "not a
// visible local dip vs its neighbours" are different properties for a near-grey anchor inside a
// high-chroma group.
function notchOk(ramp25) {
  const c450 = ramp25.find((s) => s.stop === 450), c500 = ramp25.find((s) => s.stop === 500), c550 = ramp25.find((s) => s.stop === 550);
  if (!c450 || !c500 || !c550) return true;
  const C = (s) => cam16FromRgb(hexToRgb(s.hex)).chroma;
  const ch450 = C(c450), ch500 = C(c500), ch550 = C(c550);
  const ratioHit = ch500 < 0.7 * ch450 - 1e-9 && ch500 < 0.7 * ch550 - 1e-9;
  const dipHit = ch450 - ch500 >= 3 - 1e-9 && ch550 - ch500 >= 3 - 1e-9;
  return !(ratioHit && dipHit);
}
// gapOk19 / distinctOk25 (re-diagnosis Finding 6, review F5): RAMP_L_MIN/MAX [9.95, 95.05] was
// derived for the 19-stop DISPLAY ramp's 0.55 L* gap requirement (5 + 9x0.55) - checking it against
// the 25-stop EXPORT ramp instead (finer half-steps) was a stop-set mismatch, not an OKHSL-uniformity
// problem (U2's own original Q-U2-3 diagnosis, corrected here): gating the two requirements on their
// OWN matching stop sets is what RAMP_GAP_ALLOW (19-stop) and RAMP_DISTINCT_ALLOW (25-stop) measure -
// see their own header comments for the current counts, re-measured after R6's tone construction fix.
// gapOk19 reads PIXEL L* (`lstarFromRgb` of the emitted hex), not the `tone` field (review pass 3,
// Finding 2, 2026-09-18) - the same proxy gap review 2 found and fixed for monotone (R1): the even
// path returns `tone` as `anchorLerp`'s TARGET L*, not the rendered pixel, and `enforceMonotonePixelL`
// only rewrites `tone` on the stops it actually refines, so a real sub-0.55 pixel gap between two
// UNrefined even-mode stops sat invisible to a check that trusted the target field.
function gapOk19(stops) {
  let minGap = Infinity;
  for (let i = 1; i < stops.length; i++) {
    const l0 = lstarFromRgb(hexToRgb(stops[i - 1].hex));
    const l1 = lstarFromRgb(hexToRgb(stops[i].hex));
    minGap = Math.min(minGap, l0 - l1);
  }
  return minGap >= 0.55 - 1e-9;
}
function distinctOk25(stops) {
  return new Set(stops.map((s) => s.hex)).size === stops.length;
}

// negative control, run BEFORE the real sweep (checks-that-bite): the predicates above must
// discriminate a synthetic violation before the corpus is trusted against them.
{
  // monotoneOk (R1): a real rising PIXEL L* pair — #101010 is darker than #202020, so reading the
  // rendered hex (not a `tone` field, which this synthetic object does not even carry any more) must
  // catch the rise.
  const bad = [{ stop: 50, hex: "#101010" }, { stop: 100, hex: "#202020" }];
  if (monotoneOk(bad)) FAIL("anchor-ramp", "negative control DID NOT bite: monotoneOk() passed a synthetic rising-pixel-L* pair");
  const thin = [{ stop: 50, tone: 60, hex: "#222222" }, { stop: 100, tone: 59.99, hex: "#222223" }];
  if (gapOk19(thin)) FAIL("anchor-ramp", "negative control DID NOT bite: gapOk19() passed a synthetic sub-0.55-gap pair");
  // gapOk19 (review pass 3, Finding 2): reads PIXEL L*, not the `tone` field - proven with the REAL
  // pixel pair review 3 found invisible to the old tone-based check (music "Kingston street" secondary,
  // even mode, stops 850->900, #00142F -> #00132C). The stops below carry the SAME real hex pair but
  // the target `tone` values the ramp actually reported there (6.517 -> 5.699, gap 0.818, would have
  // PASSED a tone-based check) - gapOk19 must still fail it, because the rendered PIXEL gap is 0.523.
  const gapHidden = [{ stop: 850, tone: 6.517, hex: "#00142F" }, { stop: 900, tone: 5.699, hex: "#00132C" }];
  if (gapOk19(gapHidden)) FAIL("anchor-ramp", "negative control DID NOT bite: gapOk19() passed a real pixel-sub-0.55 pair whose target tone gap reads healthy (0.818)");
  const dup = [{ stop: 50, tone: 60, hex: "#222222" }, { stop: 100, tone: 55, hex: "#222222" }];
  if (distinctOk25(dup)) FAIL("anchor-ramp", "negative control DID NOT bite: distinctOk25() passed a synthetic duplicate-hex pair");
  // notchOk (R2, ruling Q-C): a synthetic 450/500/550 triple with a near-grey pivot between two
  // chromatic neighbours - chroma500 must read well under 70% of both chroma450 and chroma550, AND
  // dip at least 3 CAM16 C below both (this triple clears both clauses: ratio ~5%, dip ~36/~44 C).
  const notched = [{ stop: 450, hex: "#C08040" }, { stop: 500, hex: "#808080" }, { stop: 550, hex: "#4080C0" }];
  if (notchOk(notched)) FAIL("anchor-ramp", "negative control DID NOT bite: notchOk() passed a synthetic near-grey-pivot-between-two-chromatic-neighbours triple");
  const flat = [{ stop: 450, hex: "#C08040" }, { stop: 500, hex: "#B87838" }, { stop: 550, hex: "#B07030" }];
  if (!notchOk(flat)) FAIL("anchor-ramp", "notchOk() false positive: a smoothly-declining chroma triple (no dip) read as notched");
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
// NONMONO_ALLOW removed (R1, review pass 2, 2026-09-18, team-lead correction): the prior 66-entry
// pending-ruling list attributed its residual to a "Helmholtz-Kohlrausch coupling", which is wrong: H-K
// is a perceived-brightness effect of CHROMA that CIE L* cannot model, so it structurally cannot cause a
// measured CIE L* rise. The review's own instrumented probe proved continuous (pre-rounding) CIE L* is
// monotone in all 6,760 measured perceptual+peak anchored corpus ramps; every rise was an 8-bit RGB
// rounding artifact (a continuous L* step shrinking below one 8-bit code, flipped in sign by which
// channel's byte value rounds up or down). Fixed at construction (`enforceMonotonePixelL` in tonal.js,
// wired into both `paletteStopsAnchored` and `okhslStopsAnchored`), not gated around: the count is a
// true, unconditional 0, so there is no list to name. Q-U2-6 is resolved.

let rampExact = 0, rampOff = 0;
const windowNames = new Set(), nonMonoNames = new Set(), gapNames = new Set(), distinctNames = new Set(), notchNames = new Set();
// F4 gate data (R3, review pass 2): collected FOR FREE inside this same sweep — one hex fingerprint per
// (label, mode) — so "peak differs from perceptual for every anchored palette" costs no extra renders.
const modeHex = new Map(); // label -> { perceptual, peak, even } each a joined-hex fingerprint string
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
      // Notch (R2): rendered CAM16 chroma at 450/500/550, both stop sets share the same three values.
      if (!notchOk(ramp25)) notchNames.add(`${label} [${mode}]`);
      // F4: fingerprint this (label, mode)'s full 25-stop hex ramp for the peak-vs-perceptual compare below.
      let m = modeHex.get(label); if (!m) { m = {}; modeHex.set(label, m); }
      m[mode] = ramp25.map((s) => s.hex).join(" ");
    }
  }
}
// `anchored` (declared above, from `corpus`) is reused below only as the summary line's denominator.
// allowListMatches — the ONE comparator every allow-list gate below calls, so the R10 negative controls
// (below) exercise the SAME function the real gates use, not a second, independently-written comparison
// (the tautology the review named: the old N1-style control compared two hardcoded arrays with its OWN
// copy of this logic, which can never fail regardless of whether the REAL predicate is correct).
function allowListMatches(measuredSorted, allow) {
  return measuredSorted.length === allow.length && measuredSorted.every((n, i) => n === allow[i]);
}
const windowSorted = [...windowNames].sort();
const gapSorted = [...gapNames].sort();
const distinctSorted = [...distinctNames].sort();
const nonMonoSorted = [...nonMonoNames].sort();
const notchSorted = [...notchNames].sort();
console.log(`  ${rampOff === 0 ? "pass" : "FAIL"}  anchor-ramp: ${rampExact} exact, ${rampOff} off (in-window sources only, ${anchored.length - windowNames.size} of ${anchored.length})`);
console.log(`  ${allowListMatches(windowSorted, RAMP_WINDOW_ALLOW) ? "pass" : "FAIL"}  anchor-ramp allow-list: ${windowSorted.length} (expected ${RAMP_WINDOW_ALLOW.length})`);
if (!allowListMatches(windowSorted, RAMP_WINDOW_ALLOW)) {
  for (const n of RAMP_WINDOW_ALLOW) if (!windowSorted.includes(n)) FAIL("anchor-ramp", `window-clamp allow-list: expected member missing — ${n}`);
  for (const n of windowSorted) if (!RAMP_WINDOW_ALLOW.includes(n)) FAIL("anchor-ramp", `window-clamp allow-list: unexpected member — ${n}`);
}
for (const n of RAMP_WINDOW_ALLOW) console.log(`    r ${n}`);
// R1 (review pass 2, 2026-09-18): monotone is measured on PIXEL L*, not the `tone` field, and the
// construction fix (`enforceMonotonePixelL`) reaches a true, unconditional 0, no allow-list. An
// unexpected member here is a real pixel-L* rise, not a churn artifact.
console.log(`  ${nonMonoSorted.length === 0 ? "pass" : "FAIL"}  anchor-ramp monotone: ${nonMonoSorted.length} (expected 0, pixel L*, all three modes, both stop sets, all 3,380 sources including the window-clamped ones)`);
for (const n of nonMonoSorted) FAIL("anchor-ramp", `monotone: unexpected pixel-L* rise - ${n}`);
console.log(`  ${allowListMatches(gapSorted, RAMP_GAP_ALLOW) ? "pass" : "FAIL"}  anchor-ramp gap (19-stop) allow-list: ${gapSorted.length} (expected ${RAMP_GAP_ALLOW.length})`);
if (!allowListMatches(gapSorted, RAMP_GAP_ALLOW)) {
  for (const n of RAMP_GAP_ALLOW) if (!gapSorted.includes(n)) FAIL("anchor-ramp", `gap allow-list: expected member missing — ${n}`);
  for (const n of gapSorted) if (!RAMP_GAP_ALLOW.includes(n)) FAIL("anchor-ramp", `gap allow-list: unexpected member — ${n}`);
}
for (const n of RAMP_GAP_ALLOW) console.log(`    r ${n}`);
console.log(`  ${allowListMatches(distinctSorted, RAMP_DISTINCT_ALLOW) ? "pass" : "FAIL"}  anchor-ramp distinct (25-stop) allow-list: ${distinctSorted.length} (expected ${RAMP_DISTINCT_ALLOW.length})`);
if (!allowListMatches(distinctSorted, RAMP_DISTINCT_ALLOW)) {
  for (const n of RAMP_DISTINCT_ALLOW) if (!distinctSorted.includes(n)) FAIL("anchor-ramp", `distinct allow-list: expected member missing — ${n}`);
  for (const n of distinctSorted) if (!RAMP_DISTINCT_ALLOW.includes(n)) FAIL("anchor-ramp", `distinct allow-list: unexpected member — ${n}`);
}
for (const n of RAMP_DISTINCT_ALLOW) console.log(`    r ${n}`);
// R2/Q-C: the notch gate is stop 500's CAM16 chroma under 70% of BOTH 450 and 550, AND an absolute dip
// of at least 3 CAM16 C versus both (notchOk's own header comment). The residual under that ruled
// definition is real (near-grey anchors inside a high-chroma group) and is named "pending U4" in
// Q-U2-7, not loosened here.
console.log(`  ${allowListMatches(notchSorted, NOTCH_ALLOW) ? "pass" : "FAIL"}  anchor-ramp notch allow-list (ruled Q-C, named pending U4): ${notchSorted.length} (expected ${NOTCH_ALLOW.length})`);
if (!allowListMatches(notchSorted, NOTCH_ALLOW)) {
  for (const n of NOTCH_ALLOW) if (!notchSorted.includes(n)) FAIL("anchor-ramp", `notch allow-list: expected member missing - ${n}`);
  for (const n of notchSorted) if (!NOTCH_ALLOW.includes(n)) FAIL("anchor-ramp", `notch allow-list: unexpected member (stop 500's chroma both ratio-dipped and dipped >=3 C below both neighbours) - ${n}`);
}
for (const n of NOTCH_ALLOW) console.log(`    r ${n}`);

// R10 (review pass 2): the OLD "N1-style" control compared two hardcoded arrays with its own duplicate
// of allowListMatches's logic — a tautology, since that comparison can never pass regardless of whether
// the REAL gates above are correct. The real controls below call `allowListMatches` ITSELF (the same
// function the real gates call) against the REAL measured data with one name dropped from the allow
// list — proving the actual predicate, not a stand-in, reds on a real, silent narrowing.
{
  const dropCheck = (name, measuredSorted, allow) => {
    if (allowListMatches(measuredSorted, allow.slice(0, -1))) FAIL("anchor-ramp", `negative control DID NOT bite: dropping one name from the ${name} allow list still matched the real measured data`);
  };
  dropCheck("window-clamp", windowSorted, RAMP_WINDOW_ALLOW);
  dropCheck("gap", gapSorted, RAMP_GAP_ALLOW);
  dropCheck("distinct", distinctSorted, RAMP_DISTINCT_ALLOW);
  dropCheck("notch", notchSorted, NOTCH_ALLOW);
  // A same-length swap must ALSO be caught (a name substitution, not just a shrink).
  const swapCheck = (name, measuredSorted, allow, fakeMember) => {
    const swapped = [...allow.slice(0, -1), fakeMember].sort();
    if (allowListMatches(measuredSorted, swapped)) FAIL("anchor-ramp", `negative control DID NOT bite: a swapped ${name} allow list still matched the real measured data`);
  };
  swapCheck("window-clamp", windowSorted, RAMP_WINDOW_ALLOW, `film "A Made-Up Title" primary #000001`);
  swapCheck("gap", gapSorted, RAMP_GAP_ALLOW, `film "A Made-Up Title" primary #000003`);
  swapCheck("distinct", distinctSorted, RAMP_DISTINCT_ALLOW, `film "A Made-Up Title" primary #000004`);
  swapCheck("notch", notchSorted, NOTCH_ALLOW, `film "A Made-Up Title" primary #000005 [peak]`);
}

// ── F4 gate (R3, review pass 2, 2026-09-18): the owner's F4 principle — "no control goes dead" for an
// anchored palette — on the rendered path. Cheap checks (default kit only, ~16 anchored palettes) plus
// the peak-vs-perceptual compare, which reuses the fingerprints the sweep above already collected (no
// extra renders needed for that clause).
{
  let peakEqPerceptual = 0, peakChecked = 0;
  for (const [label, m] of modeHex) {
    if (m.perceptual === undefined || m.peak === undefined) continue;
    peakChecked++;
    if (m.perceptual === m.peak) { peakEqPerceptual++; FAIL("anchor-f4", `peak rendered byte-identical to perceptual — ${label}`); }
  }
  console.log(`  ${peakEqPerceptual === 0 && peakChecked > 0 ? "pass" : "FAIL"}  anchor-f4 peak-vs-perceptual: ${peakChecked - peakEqPerceptual} of ${peakChecked} differ (0 identical required)`);

  // Default-kit-only control sweep (cheap: a handful of renders, not the full 3,396-palette corpus —
  // that fuller measurement is recorded in the handoff from a standalone probe run, not re-run in-suite
  // on every `npm test`). Curve/Tension are only LIVE in perceptual mode at Vibrancy > 0 (evenL/peakL
  // blend by `t = vibrancy/100` — see okhslStopsAnchored's own header comment; review 1's own accepted
  // finding: this matches the non-anchored OKHSL path, which never reads Curve/Tension at all), so their
  // OWN base document is primed with vibrancy 60 first — a shared vibrancy-0 base would make BOTH sides
  // reduce to evenL and falsely read "moved 0" regardless of whether Curve/Tension are actually live.
  // `curve` also never toggles TO "linear" (shape("linear",...) ignores tension AND makes peakL equal
  // evenL's own always-"linear" call, which would cancel Vibrancy's own contribution too) — it cycles
  // between two genuinely reshaping curves instead.
  const dkBase = defaultDocument();
  const baseDoc = hydrate({ ...dkBase, toneMode: "perceptual" });
  const vibrantCurveDoc = hydrate({ ...dkBase, toneMode: "perceptual", vibrancy: 60, curve: "cubic", tension: 0 });
  const vibrantTensionDoc = hydrate({ ...dkBase, toneMode: "perceptual", vibrancy: 60, curve: "logistic", tension: 0 });
  // hueSpace (review pass 3, Finding 1, 2026-09-18): moved from perceptual to EVEN mode. Review 3 proved
  // the perceptual/peak (OKHSL) per-stop hue solve moves a ramp only by 8-bit re-picking (0 of 3,393/
  // 3,390 anchored ramps clear ΔE_OK > 0.01), because OKHSL already holds the anchor's own OKLCH hue
  // constant under "cam16" - "moved >= 1 hex" alone passes on a single-code rounding flip there, not a
  // real hueSpace effect. In EVEN mode the two hueSpace settings ARE a real Abney correction (1,060 of
  // 3,396 anchored ramps clear ΔE_OK > 0.01). hueSpace's real effect in the OKHSL modes is an open
  // question for the owner (Q-D) - this gate does NOT assert it there, and does not change that
  // construction (`okhslStopsAnchored`'s own per-stop OKHSL hue solve is untouched this pass).
  const evenBaseDoc = hydrate({ ...dkBase, toneMode: "even" });
  const F4_CASES = {
    curve: { base: vibrantCurveDoc, altPatch: { curve: "sine" } },
    tension: { base: vibrantTensionDoc, altPatch: { tension: 80 } },
    vibrancy: { base: baseDoc, altPatch: { vibrancy: 60 } },
    hueSpace: {
      base: evenBaseDoc, altPatch: { hueSpace: evenBaseDoc.hueSpace === "cam16" ? "oklch" : "cam16" },
      // magnitude floor (Finding 1's fix): "moved >= 1 hex" alone cannot tell a real hue effect from a
      // 1-code rounding flip. Require at least one anchored ramp with a stop whose OKLab ΔE (Euclidean,
      // independent conversion, never the engine's own) between the two hueSpace settings exceeds 0.01 -
      // a magnitude no single 8-bit rounding step reaches in practice (review 3's own measured floor).
      magnitudeFloor: 0.01,
    },
  };
  const deltaEOk = (hexA, hexB) => {
    const [la, ca, ha] = rgbToOklchIndep(hexToRgb(hexA));
    const [lb, cb, hb] = rgbToOklchIndep(hexToRgb(hexB));
    const rad = Math.PI / 180;
    const ax = ca * Math.cos(ha * rad), ay = ca * Math.sin(ha * rad);
    const bx = cb * Math.cos(hb * rad), by = cb * Math.sin(hb * rad);
    return Math.hypot(la - lb, ax - bx, ay - by);
  };
  for (const key in F4_CASES) {
    const { base, altPatch, magnitudeFloor } = F4_CASES[key];
    const baseV = projectView(base);
    const altDoc = hydrate({ ...base, ...altPatch });
    const altView = projectView(altDoc);
    let moved = 0, s500moved = 0, maxDeltaE = 0;
    for (const p of base.palettes) {
      if (typeof p.anchor !== "string") continue;
      const a = baseV.palettes.find((v) => v.name === p.name).fullRamp;
      const b = altView.palettes.find((v) => v.name === p.name).fullRamp;
      if (a.some((s, i) => s.hex !== b[i].hex)) moved++;
      if (magnitudeFloor !== undefined) {
        for (let i = 0; i < a.length; i++) maxDeltaE = Math.max(maxDeltaE, deltaEOk(a[i].hex, b[i].hex));
      }
      const srcL = lstarFromRgb(hexToRgb(p.anchor));
      const inWin = srcL >= RAMP_L_MIN && srcL <= RAMP_L_MAX;
      const a500 = a.find((s) => s.stop === 500).hex, b500 = b.find((s) => s.stop === 500).hex;
      if (inWin && a500 !== b500) { s500moved++; FAIL("anchor-f4", `${key}: stop 500 moved on the default kit — ${p.name} ${a500} !== ${b500}`); }
    }
    if (moved === 0) FAIL("anchor-f4", `${key}: moved 0 of the default kit's anchored ramps — this control is dead for anchored palettes`);
    if (magnitudeFloor !== undefined && maxDeltaE <= magnitudeFloor) FAIL("anchor-f4", `${key}: max OKLab delta-E ${maxDeltaE.toFixed(4)} does not clear the ${magnitudeFloor} magnitude floor - a rounding-only move would also report "moved >= 1"`);
    const floorNote = magnitudeFloor !== undefined ? `, max OKLab dE ${maxDeltaE.toFixed(4)} (want > ${magnitudeFloor}), asserted in even only, pending Q-D` : "";
    console.log(`  ${moved > 0 && s500moved === 0 && (magnitudeFloor === undefined || maxDeltaE > magnitudeFloor) ? "pass" : "FAIL"}  anchor-f4 ${key}: moved ${moved} default-kit anchored ramps, stop 500 moved ${s500moved} (want >=1, 0)${floorNote}`);
  }

  // Negative control (review pass 3, Finding 4, 2026-09-18): the prior in-suite "reference lerp"
  // control called the SAME reference function twice with IDENTICAL arguments and compared the two
  // results - a tautology (R10-class), it could never fail regardless of whether the REAL predicate
  // above is correct, and was deleted rather than patched. The real control is a SCRATCH construction
  // swap (`anchorLerp` replaced by a position-only pivot-to-edge lerp, the same one review 2 calls "the
  // lerp"), run out-of-suite since it needs a second tree, not a spare few seconds inside `npm test`'s
  // budget: under that construction, `anchor-f4 peak-vs-perceptual: 0 of 3380 differ (0 identical
  // required)` and curve/tension/vibrancy each read "moved 0" - a real FAIL on the predicates above, not
  // allow-list churn. Documented, with its output, in `.sdlc/handoffs/pif-u2.md`'s F4 section.
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
for (const g of ["anchor-identity", "prime-identity-control", "anchor-ladder", "anchor-ramp", "anchor-f4"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  if (!f) continue; // already printed a pass/FAIL summary line above; only surface the FIRST failure detail here
  console.error(`    — ${f.slice(g.length + 2)}`);
}
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
// R10 (review pass 2; corrected review pass 3, Finding 6 - the old line said "all clear", which
// overstated gap-19 and notch: both are named, frozen allow-lists, not settled zeros): name the
// specific criteria this file clears, not a generic pass line - C2 (anchor identity, direct +
// rendered), C4 (non-anchored prime path untouched), C3 (stop 500 exact + lift-40 negative control),
// C5 (monotone, pixel L*, a true 0, no list), C6/F4 (peak != perceptual, Curve/Tension/Vibrancy each
// live for every anchored ramp, hueSpace live in even mode only pending Q-D, stop 500 exact under
// every toggle). Window-clamp (10), gap-19 (93), distinct-25 (14) and notch (76, Q-C variant) are all
// named allow-lists compared by name with a biting negative control, not settled zeros.
console.log("\nPASS: C2, C3, C4, C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (93), distinct-25 (14) and notch (76, pending U4) are named allow-lists, compared by name, each with a biting negative control");
process.exit(0);
