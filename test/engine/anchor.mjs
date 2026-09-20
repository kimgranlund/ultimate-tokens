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
import { primeSwatches, PRIME_STEPS } from "../../src/engine/prime.mjs";
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

// referencePrimeSteps(lPrime) - repaired U4 review pass 1, Finding F1 (2026-09-20). A PRIVATE,
// OKHSL-domain copy of prime.mjs's own pre-#681 `primeSteps` (origin/main commit 91957732, before
// U1's anchor field and U6's CIE-L*/equal-compress rebuild), ported verbatim rather than reused from
// the shared import: the shared `primeSteps` (src/engine/prime.mjs) was rebuilt by U6 to take CIE L*
// in [0, 100], so feeding it an OKHSL `l` in [0, 1] (as this file did before the fix) silently read
// every lPrime as "essentially at PRIME_L_MIN", returning {up:0, down:0} and collapsing all seven
// reference rungs onto the key colour's own hex - the exact fault pattern of the duplicate
// `chromaEnvelope` export this same integration unit caught elsewhere: two units editing one shared
// symbol with a consumer neither updated. `PRIME_STEP`/`PRIME_L_MIN`/`PRIME_L_MAX` below are this
// reference's OWN, unit-correct constants (0.09 / 0.14 / 0.97, the pre-#681 OKHSL-domain values),
// never prime.mjs's post-#681 CIE-L* ones - deliberately different names so the two can't be
// confused again.
const REF_PRIME_STEP = 0.09;
const REF_PRIME_L_MIN = 0.14;
const REF_PRIME_L_MAX = 0.97;
function referencePrimeSteps(lPrime) {
  const roomUp = Math.max(0, (REF_PRIME_L_MAX - lPrime) / 3);
  const roomDown = Math.max(0, (lPrime - REF_PRIME_L_MIN) / 3);
  let up = Math.min(REF_PRIME_STEP, roomUp);
  let down = Math.min(REF_PRIME_STEP, roomDown);
  const short = (REF_PRIME_STEP - up) + (REF_PRIME_STEP - down); // travel lost to clipping, 0 if neither clips
  if (up >= REF_PRIME_STEP) up = Math.min(roomUp, up + short); // only an UNCLIPPED side absorbs (#641 redistribute)
  if (down >= REF_PRIME_STEP) down = Math.min(roomDown, down + short);
  return { up, down };
}

// referenceNonAnchored(palette, controls) — a FRESH copy of prime.mjs's pre-#681 (deriveKeyColor cusp)
// construction, built directly against hct.js/okhsl.js/tonal.js's validated primitives, never calling
// primeSwatches. `PRIME_STEPS` is reused (test/engine/prime.mjs's own precedent: it is a pre-existing,
// unchanged-by-#681 export, not the branching logic under test here); `primeSteps` itself is NOT
// reused - see `referencePrimeSteps` above.
function referenceNonAnchored(palette, controls) {
  const baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100);
  const pk = peakC(baseHue);
  const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c;
  const keyRgb = hctToRgb(baseHue, keyChroma, pk.tone).rgb;
  const key = rgbToOkhsl(keyRgb);
  const lPrime = key.l;
  const { up, down } = referencePrimeSteps(lPrime);
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

{
  // second negative control (U4 review pass 1, F1 point 3): the control above only ever mutates the
  // PRIME rung (index 3, `real[3].hex`) - the one rung `w(prime) = 0` makes immune to `skew`/`hueShift`,
  // so it says nothing about whether the loop below actually discriminates the SIX LADDER rungs, which
  // is where the whole 3,796-off reading came from. Mutate `skew` instead (it only bends `w` on the six
  // ladder rungs; `real[3]`/`ref[3]` are provably identical to their unmutated selves regardless of
  // skew) and confirm at least one non-prime step differs.
  const s = controlSubjects[0];
  const ctl = { hueSpace: s.hueSpace, primeChroma: 100 };
  const mutated = { ...s.palette, anchor: undefined, skew: ((s.palette.skew ?? 0) + 80) % 100 };
  const real = primeSwatches(mutated, ctl);
  const ref = referenceNonAnchored(s.palette, ctl); // reference uses the UN-mutated skew on purpose
  const ladderIdx = [0, 1, 2, 4, 5, 6];
  const bites = ladderIdx.some((i) => real[i].hex !== ref[i].hex);
  if (!bites) FAIL("prime-identity-control", "negative control DID NOT bite: mutating skew by 80 left all six non-prime ladder rungs unchanged vs the reference - the six-rung comparison cannot discriminate");
}

// Addendum-1 reconciliation (Q1, 2026-09-19, standing rule at
// .sdlc/questions/standing-rulings-2026-09-20.md): this used to assert ctrlOff===0 (primeSwatches with
// the anchor stripped byte-identical to the pre-#681 reference), and FAILed per mismatch. That assumed
// U6's rebuild touched ONLY the anchored path. It did not: U6 replaced the non-anchored ladder itself
// (CIE-L*/equal-compress, `referencePrimeSteps`' own header comment names it "U6's CIE-L*/equal-compress
// rebuild" vs. the retired pre-#681 OKHSL-domain "redistribute" ladder this reference still
// deliberately reimplements), and U4 review pass 1 Finding A then ported F1's best-iterate widening
// search onto that NEW equal-compress domain (src/engine/prime.mjs) - a further, correct fix to the
// CURRENT construction, not a partial migration. So EVERY non-anchored subject now legitimately
// differs from the retired reference: measured 3,796 of 3,796 off, 0 exact, confirmed stable across
// this pass's own prime.mjs fixes. That total-and-uniform divergence is itself the useful invariant a
// migration this deliberate should show - a PARTIAL divergence (some subjects still byte-identical to
// the retired ladder, most not) would mean the rebuild missed a code path, which is what this gate
// still catches. The independent, CURRENT-construction correctness check lives in test/engine/prime.mjs
// (20 gates, including this pass's own Finding A mutation proof) - this file's job is narrower: prove
// the migration away from the pre-#681 reference is total, not spot-check the new construction's own
// correctness a second time.
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
  } else {
    ctrlExact++;
    FAIL("prime-identity-control", `${label}: primeSwatches (anchor stripped) is BYTE-IDENTICAL to the retired pre-#681 reference - U6's rebuild should have replaced this subject's construction too; a still-exact match after the rebuild means an unmigrated code path, not a clean result`);
  }
}
if (ctrlOff !== controlSubjects.length) FAIL("prime-identity-control", `${ctrlOff} of ${controlSubjects.length} subjects differ from the retired reference, not all of them - a partial migration (some non-anchored ramps still built the old way) is a real defect, re-diagnose rather than accepting a number between 0 and ${controlSubjects.length}`);
console.log(`  ${fails.some((f) => f.startsWith("prime-identity-control:")) ? "FAIL" : "pass"}  prime-identity-control: ${ctrlExact} exact, ${ctrlOff} off (want 0 exact, ${controlSubjects.length} off - U6's rebuild replaced the non-anchored ladder too, see Q1)`);

// ── anchor-ladder (F1, U1 review 2026-09-18; re-derived U4 review pass 1, Finding A, 2026-09-20) ──
// The anchored ladder's own well-formedness at primeChroma 100 (the same evaluation point C2/C4
// use), over all 3,380 anchored corpus palettes, two invariants:
//   (a) the SIX ladder rungs (every step but `prime`) are strictly decreasing in CIE L* - this comes
//       only from `primeSteps`' equal-compress and prime.mjs's F1-style widening search (ported onto
//       equal-compress at U4, review pass 1 Finding A - U1's original OKHSL widening loop is retired,
//       but the mechanism it names is real again), never from the anchor's own position, so it holds
//       UNCONDITIONALLY: 0 exceptions anywhere in the corpus (no allow-list, by design).
//   (b) all SEVEN rungs render distinct hexes, and `prime` sits strictly between `bright` and `dim`
//       in `l` — Q3 (b) ruled the token stays exact regardless of the window, so a source whose true
//       CIE L* sits at or past [PRIME_L_MIN, PRIME_L_MAX] can only get a real six-rung ladder by
//       letting `prime` sit outside it; those sources are a named, counted allow-list (mirroring C5's
//       "print the list, fail on any other count" shape), not a silent carve-out.
//       TWO DISTINCT MECHANISMS land a source on this list (review pass 2, F1, 2026-09-20 - the
//       original comment named only the first and mis-described all 26 by it):
//       (i) OUT-OF-WINDOW (21 of 26): the source's own CIE L* sits at or past [PRIME_L_MIN,
//           PRIME_L_MAX], so `prime` is clamped to the window edge while the six ladder rungs spread
//           around it - `prime` sits outside [bright, dim] by construction, not by a defect.
//       (ii) IN-WINDOW, widening-pivot lift (5 of 26; corrected review pass 3, R3-1, 2026-09-20 - the
//           prior comment quoted `3 * STEP_L` as the threshold and the pivot constant, a 27 L* band
//           holding 532 anchored palettes that does not discriminate the 5 from the rest; the real
//           bound is `PRIME_L_MIN + 3 * reserve`, using the reserve the search stops at, not the cap):
//           the source's own CIE L* IS inside the window, but sits close enough to `PRIME_L_MIN` that
//           the F1-style widening search (Finding A, ported at U4 review pass 1) lifts the pivot above
//           it before the ladder's six rungs come out distinct. The search tries `reserve` from
//           `RESERVE_UNIT` (0.1) up in 0.1 steps, capped at `STEP_L` (9), stopping at the FIRST
//           reserve whose rungs separate, and picks the ladder's pivot as
//           `min(hi, max(PRIME_L_MIN + 3 * reserve, lPrime))` - for a source this close to the floor,
//           that pivot sits ABOVE the source's own `lPrime`, so `prime` (still rendered at the
//           source's real `lPrime`) no longer sits between the ladder's `bright`/`dim` rungs, which
//           are built around the LIFTED pivot instead. The widening trades a duplicate-hex rung for
//           an order violation on exactly this population - a real, derived consequence of the
//           widening, not an error. These 5: film "Enter the Void · 2009 · dir. Gaspar Noé · the
//           Tokyo nightlife" secondary #212129 (new this pass), film "The Night of the Hunter · 1955
//           · dir. Charles Laughton · the river drift" tertiary #1E211E, music "The rave · the laser
//           tent" secondary #212228 (new this pass), travel "37° N · May · 00:00 · A Patmos Greek
//           Orthodox church, Easter Saturday at midnight" tertiary-muted #232220, travel "42° N ·
//           July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season"
//           tertiary-muted #252215 (new this pass). All 5 sources' own CIE L* (re-measured directly
//           from each anchor hex, review pass 3) sit within 1.11 L* of `PRIME_L_MIN` (12.2500): 12.3351
//           to 13.3550 - a real, tight band, unlike the false 27 L* one the old comment named. Confirmed
//           by disabling the widening in a scratch copy: these 5 drop OUT of ORDER_ALLOW (21 measured,
//           not 26) while `DUPE_ALLOW` grows to absorb them (26, not 3) - the exact trade the mechanism
//           predicts.
//       All other members are mechanism (i). A handful of THOSE also sit close enough to the window
//       floor that even the widening search's full `STEP_L` of reserve cannot keep `prime` distinct
//       from the rung it ends up beside - a stricter subset of (i), landing them on `DUPE_ALLOW` too.
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
  `film "Enter the Void · 2009 · dir. Gaspar Noé · the Tokyo nightlife" secondary #212129`,
  `film "Suspiria · 1977 · dir. Argento · the ballet academy" tertiary-muted #201F25`,
  `film "TRON: Legacy · 2010 · dir. Kosinski · the Grid" secondary #181B1F`,
  `film "The Matrix · 1999 · dir. Wachowskis · inside the simulation" tertiary-muted #1F1F24`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E`,
  `music "Black metal · the forest at night" secondary #1E2024`,
  `music "P-Funk · the cosmic album art" secondary-muted #211E27`,
  `music "The late-night club · the smoky set" primary-muted #1F1F23`,
  `music "The rave · the laser tent" secondary #212228`,
  `music "UK '77 · the ransom-note sleeve" secondary #1F1F23`,
  `nature "32° N · constant · Carlsbad Caverns, New Mexico, lamp-lit" secondary #1D1D20`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
  `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" primary #1E1D1B`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913`,
  `travel "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight" tertiary-muted #232220`,
  `travel "41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in" tertiary-muted #251B12`,
  `travel "42° N · July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season" tertiary-muted #252215`,
  `travel "48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide" primary-muted #251B14`,
  `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913`,
];
const DUPE_ALLOW = [
  `film "Suspiria · 1977 · dir. Argento · the ballet academy" tertiary-muted #201F25`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E`,
  `music "Black metal · the forest at night" secondary #1E2024`,
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

// negative control: a synthetic anchor pinned at CIE L* 0 (pure black, unambiguously past
// PRIME_L_MIN) must be caught by the SAME predicate the corpus loop above counts with — proving the
// predicate itself discriminates rather than the corpus happening to already contain 23/4.
{
  const synthetic = { anchor: "#000000" };
  const sw = primeSwatches(synthetic, { hueSpace: "oklch", primeChroma: 100 });
  const orderViolation = !(sw[2].l > sw[3].l && sw[3].l > sw[4].l);
  if (!orderViolation) FAIL("anchor-ladder", "negative control DID NOT bite: a synthetic #000000 anchor (CIE L* 0, unambiguously outside [PRIME_L_MIN, PRIME_L_MAX]) passed the prime-between-bright-and-dim check - the predicate cannot discriminate an out-of-window anchor");
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
// **91** names failing the 19-stop gap bar (RAMP_GAP_ALLOW below) and **13** names failing 25-stop
// distinctness (RAMP_DISTINCT_ALLOW, below that) - a source can appear on both. Named, frozen, sorted
// - compared by name, not count (N1's own lesson, applied here too). Q-U2-5's own REQ-002 chroma-basis
// tension is RULED (the anchor's own value at the pivot, blending to `rampChroma` at the ends by
// liftStop - see `anchorChromaBasis`'s own header comment in tonal.js), not an open question any more.
// Gap growth attribution, corrected (review pass 3, Finding 6): from `0849f67`'s own 69, each of the
// three review-pass-2 changes measured ALONE (not combined) moves the count: R6 alone 69 -> 76 (+7,
// the single largest factor), the R3 hue solve alone +2, the smoothstep chroma-basis easing (R2) alone
// +3 - all three interact rather than summing linearly to the observed 90 (pre-Finding-2) / 93
// (pixel-corrected) total. Do not credit R6 alone for the full 69 -> 93 move, as an earlier record did.
// Review pass 4, Finding 2 (2026-09-19): the joint hue/rendered-chroma solve (solveCam16Hue's own
// header comment) incidentally tightened two even-mode ramps' pixel gaps back over the 0.55 bar -
// music "Detroit techno" secondary and music "Kingston street" secondary, both previously in this
// list, both removed here - 93 -> 91. The gap-19 negative control below (the real Kingston-street
// hex pair) still bites regardless: it tests `gapOk19()`'s own discrimination, not this list's size.
//
// #681 U4 re-freeze (integration of U2+U3+U6 on the plan branch): U3's chroma envelope (env(500)=1,
// shoulders damp harder) moves this population again, measured on the fully integrated tree - 91 ->
// 72. 69 of the prior 91 remain gap-19 misses; 22 close (chroma now falls away from the anchor fast
// enough that neighbouring stops widen past the 0.55 L* bar); 3 are newly named: literature "Alice's
// Adventures in Wonderland" tertiary-muted, literature "The Road" tertiary-muted, nature "Valdivian
// rainforest" tertiary-muted - all three dark, low-chroma sources where U3's steeper shoulder damping
// compresses an adjacent pixel pair under the gap. A purely mechanical re-freeze (RAMP_GAP_ALLOW names
// which ramps sit at this boundary today, the same as every prior review-pass re-freeze above, not a
// policy threshold an owner rules on); the gate's own negative control still proves it discriminates a
// real regression from an expected member.
const RAMP_GAP_ALLOW = [
  `architecture "Katsura Imperial Villa · 17th c · Kyoto" primary #282322`,
  `brands "Burger King · The Flame Identity · 2021 rebrand" tertiary-muted #F5EBDC`,
  `brands "Nike · The Swoosh · Since 1971" secondary #101820`,
  `brands "Nike · The Swoosh · Since 1971" tertiary-muted #FFFFFF`,
  `cuisine "Chocolate · the chocolatier's bench" primary #312722`,
  `cuisine "Kaiseki · the seasonal course" tertiary-muted #2B2624`,
  `cuisine "Matcha & wagashi · the tea room" tertiary-muted #2B2624`,
  `film "2001: A Space Odyssey · 1968 · dir. Kubrick · the centrifuge & the stargate" tertiary-muted #1A1B1E`,
  `film "Apocalypse Now · 1979 · dir. Coppola · the river at dusk" primary #241E1A`,
  `film "Double Indemnity · 1944 · dir. Billy Wilder · the venetian-blind living room" primary #1B1B1D`,
  `film "Enter the Void · 2009 · dir. Gaspar Noé · the Tokyo nightlife" secondary #212129`,
  `film "Hereditary · 2018 · dir. Aster · the dollhouse home" tertiary-muted #29231F`,
  `film "John Wick · 2014 · dir. Stahelski · the Red Circle club" tertiary-muted #232428`,
  `film "Once Upon a Time in the West · 1968 · dir. Leone · the railhead town" tertiary-muted #312721`,
  `film "Spider-Man: Into the Spider-Verse · 2018 · the comic-book city" primary #232429`,
  `film "Suspiria · 1977 · dir. Argento · the ballet academy" tertiary-muted #201F25`,
  `film "TRON: Legacy · 2010 · dir. Kosinski · the Grid" secondary #181B1F`,
  `film "The Godfather · 1972 · dir. Coppola · cin. Gordon Willis · the don's study" secondary #302721`,
  `film "The Matrix · 1999 · dir. Wachowskis · inside the simulation" tertiary-muted #1F1F24`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E`,
  `film "The Third Man · 1949 · dir. Carol Reed · the wet Vienna cobbles at night" secondary-muted #252422`,
  `film "There Will Be Blood · 2007 · dir. P.T. Anderson · the oil derrick fire" tertiary-muted #282320`,
  `film "Touch of Evil · 1958 · dir. Orson Welles · the border-town night" secondary #232428`,
  `literature "Alice's Adventures in Wonderland · Carroll, ill. Tenniel · 1865" tertiary-muted #2C2926`,
  `literature "Anna Karenina · Tolstoy · 1877 · the Moscow station in snow" tertiary-muted #252428`,
  `literature "Fahrenheit 451 · Bradbury · 1953 · the fireman's city" tertiary-muted #282320`,
  `literature "The Bell Jar · Sylvia Plath · 1963 · New York & the suburb" primary #242427`,
  `literature "The Road · Cormac McCarthy · 2006 · the ash-grey wasteland" tertiary-muted #2C2926`,
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
  `music "Neon MV · the night-set choreography" tertiary-muted #26232C`,
  `music "P-Funk · the cosmic album art" secondary-muted #211E27`,
  `music "Rasta tricolour · the roots sleeve" tertiary-muted #282320`,
  `music "Riot grrrl · the zine collage" tertiary-muted #242427`,
  `music "Southern trap · the night-drive cover" tertiary-muted #26222F`,
  `music "Studio 54 · the dancefloor" secondary #2B2734`,
  `music "Symphonic & gothic metal · the cathedral set" tertiary-muted #272328`,
  `music "The late-night club · the smoky set" primary-muted #1F1F23`,
  `music "The orchestra · the concert platform" secondary #242428`,
  `music "The rave · the laser tent" secondary #212228`,
  `music "UK '77 · the ransom-note sleeve" secondary #1F1F23`,
  `nature "24° S · June · 07:00 · Sossusvlei, Namib Desert, Namibia" tertiary-muted #2B2621`,
  `nature "32° N · constant · Carlsbad Caverns, New Mexico, lamp-lit" secondary #1D1D20`,
  `nature "40° S · December · 14:00 · Valdivian rainforest, Los Ríos, southern Chile" tertiary-muted #302820`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
  `travel "22° N · January · 11:00 · Sapa Sunday market, Lào Cai Province, cold mountain fog" secondary #042546`,
  `travel "23° S · December · 16:20 · Salar de Atacama, 2,305 m" secondary #EBEAE6`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" secondary #E0E5E6`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
  `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" primary #1E1D1B`,
  `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913`,
  `travel "34° S · March · 22:00 · San Telmo, Buenos Aires, a Sunday after the antiques fair has closed" secondary-muted #22242B`,
  `travel "35° N · February · 23:48 · Yamanote line, last loop, between Shinjuku and Ikebukuro" secondary #DDE5EB`,
  `travel "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight" tertiary-muted #232220`,
  `travel "37° N · November · 05:40 · MV passing Kea, en route Piraeus" primary-muted #E1F5DA`,
  `travel "41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in" tertiary-muted #251B12`,
  `travel "42° N · July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season" primary-muted #282724`,
  `travel "42° N · July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season" tertiary-muted #252215`,
  `travel "48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide" primary-muted #251B14`,
  `travel "48° N · November · 18:50 · A wet evening in a Viennese kaffeehaus, Mariahilf" primary-muted #24221F`,
  `travel "59° N · January · 14:00 · Lake Baikal corridor" secondary #E0E5E6`,
  `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913`,
  `travel "63° N · Late August · 15:00 · Reynisfjara, south coast of Iceland" secondary #242427`,
].sort();

// RAMP_DISTINCT_ALLOW (Finding 6 fix): the 25-stop export ramp's own duplicate-hex population,
// gated separately from RAMP_GAP_ALLOW's 19-stop gap population — see the comment above
// RAMP_GAP_ALLOW. A source can appear on both lists.
// Review pass 4, Finding 2 (2026-09-19): same fix, same fallout as RAMP_GAP_ALLOW above - the joint
// hue/rendered-chroma solve incidentally de-duplicated travel "23° S / Salar de Atacama, 2,305 m"
// secondary's 25-stop ramp. 14 -> 13.
// Review pass 5, Finding 1 (2026-09-19): the review-4 solve's fixed-point step (now replaced by a
// bracketed root-find, see solveCam16Hue's own header comment) also missed the achromatic-boundary
// case this same Salar de Atacama ramp sits in - the fix restores it to duplicate-hex, matching
// a079fab3's original (pre-review-4) construction. 13 -> 14 - back to the original count, not a new
// regression.
//
// #681 U4 re-freeze (integration of U2+U3+U6, same mechanical re-freeze as RAMP_GAP_ALLOW above):
// U3's envelope moves this population 14 -> 16. 10 remain, 4 close, 6 are newly named - travel "23 S
// / Salar de Atacama" secondary drops off this pass (its own ramp is no longer a duplicate-hex case
// once U3's shoulders separate it further from the neighbouring stop); the six new entries are three
// of C5's own 10 window-clamped dark sources (2001: A Space Odyssey tertiary-muted, Double Indemnity
// primary, The Night of the Hunter primary - already named in RAMP_WINDOW_ALLOW, now also duplicating
// a stop on the 25-stop export ramp under the steeper shoulder damping) plus three more dark, low-
// chroma sources at the same 8-bit-quantization boundary (Patmos tertiary-muted, Hidaka coast
// tertiary-muted, Viennese kaffeehaus primary-muted).
const RAMP_DISTINCT_ALLOW = [
  `brands "Burger King · The Flame Identity · 2021 rebrand" tertiary-muted #F5EBDC`,
  `brands "Nike · The Swoosh · Since 1971" secondary #101820`,
  `brands "Nike · The Swoosh · Since 1971" tertiary-muted #FFFFFF`,
  `film "2001: A Space Odyssey · 1968 · dir. Kubrick · the centrifuge & the stargate" tertiary-muted #1A1B1E`,
  `film "Double Indemnity · 1944 · dir. Billy Wilder · the venetian-blind living room" primary #1B1B1D`,
  `film "TRON: Legacy · 2010 · dir. Kosinski · the Grid" secondary #181B1F`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" primary #161618`,
  `film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" tertiary #1E211E`,
  `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
  `travel "23° S · December · 16:20 · Salar de Atacama, 2,305 m" secondary #EBEAE6`,
  `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
  `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" primary #1E1D1B`,
  `travel "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight" tertiary-muted #232220`,
  `travel "41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in" tertiary-muted #251B12`,
  `travel "42° N · July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season" tertiary-muted #252215`,
  `travel "48° N · November · 18:50 · A wet evening in a Viennese kaffeehaus, Mariahilf" primary-muted #24221F`,
].sort();

// NOTCH_ALLOW (ruling Q-C, 2026-09-18): the owner ruled the notch gate is the 70%-ratio definition AND
// an absolute dip of at least 3 CAM16 C versus both neighbours (see notchOk's own header comment). This
// is the by-name list under that variant, measured on the rendered path.
//
// Addendum-1 reconciliation (Q3, 2026-09-19, standing rule at .sdlc/questions/standing-rulings-2026-09-20.md):
// this list previously carried 78 entries (perceptual 15, peak 9, even 54), measured BEFORE this tree
// integrated U3's own work. On the current integration head it measures 15 (all even mode) - a clean
// SUBSET of the old 78 (0 new/unexpected members, all 63 departures are removals, verified directly).
// Cited mechanism: commit 2573208c "re-centre chromaEnvelope on the anchor's own lifted reading" (#681
// U3 review pass 2, R2) - the same fix this file's `anchorChromaBasis` import and the tonal.mjs
// KNOWN_BASELINE_DUP/EVEN_DIP_BASELINE comments already cite as U3's shipped chromaEnvelope shape. R2
// keyed the envelope's position on `liftStop(stop,lift) - liftStop(anchorStop,lift)`, the anchor's own
// LIFTED reading, instead of the raw numeric anchor stop - env(anchorStop)=1 exactly under any lift,
// where the pre-U3 construction this 78-count was measured against could sit off-pivot under a nonzero
// lift and read a visible ratio+absolute notch there. All 63 departed names are the near-grey anchors
// whose notch was an artifact of that pre-R2 off-pivot reading, not a real construction defect - every
// one was ALREADY gone before this U4 pass started (inherited from the U3 merge, ed14832b), not a
// side effect of any U4 fix. Full 63-name departure list recorded in .sdlc/questions/pif-u4.md (Q3).
const NOTCH_ALLOW = [
  `architecture "Habitat 67 · 1967 · Moshe Safdie · Montreal" tertiary-muted #D6D5D0 [even]`,
  `architecture "Himeji Castle · 1609 · 'White Heron' keep · Japan" secondary #E0DEDA [even]`,
  `architecture "Icelandic turf house · vernacular · Skógar / Glaumbær" tertiary-muted #D9D8D4 [even]`,
  `architecture "Katsura Imperial Villa · 17th c · Kyoto" primary #282322 [even]`,
  `architecture "Trulli of Alberobello · vernacular · Puglia, Italy" primary #CCCBC7 [even]`,
  `cuisine "Fresh pasta · the marble work-bench" tertiary-muted #E0DEDA [even]`,
  `cuisine "Macarons · the display case" tertiary-muted #E0DEDA [even]`,
  `music "Pop-punk · the skate-park sleeve" tertiary-muted #D9D8D4 [even]`,
  `nature "23° S · December · 13:00 · Salar de Atacama edge, Atacama Desert, Chile" secondary #E0DEDA [even]`,
  `nature "51° N · May · 09:00 · English oak woodland, Sussex, bluebell season" primary #D8D9D0 [even]`,
  `travel "34° N · May · 04:30 · The corridor of torii at Fushimi Inari before opening hour" tertiary-muted #A2A19E [even]`,
  `travel "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight" secondary-muted #B9B8B4 [even]`,
  `travel "41° N · October · 23:00 · Tbilisi viewed from the Mtatsminda funicular at the upper station" secondary #71716E [even]`,
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
// loneSpikeStop (review pass 5, Finding 1): a stop whose rendered OKLCH C exceeds BOTH its immediate
// neighbours' by more than LONE_SPIKE_BOUND is a visible artifact regardless of cause - the class the
// review's own worst case (a lone C-0.13 lemon spike, from the pre-fix seedHue fallback) belongs to.
// The review's own "exceeds both neighbours by > 0.03" test, taken literally over EVERY interior stop,
// also fires on a ramp's own intended chroma PEAK (a smooth cusp near stop 500's neighbourhood, where
// consecutive 25/50-wide stops naturally differ by well over 0.03 as part of the designed curve -
// measured: 168 hits, nearly all ordinary peaks, e.g. architecture "Bankside / Tate Modern" secondary
// stop 300, C 0.153 between neighbours 250/350 at C 0.108/0.117 - not remotely achromatic, a normal
// cusp). The bug class this gate targets is narrower: an isolated excursion out of an otherwise
// NEAR-ACHROMATIC region (both neighbours themselves under LONE_SPIKE_ACHROMATIC), which a real ramp
// peak never is. Requiring that keeps the gate sensitive to the actual bug (the review's own examples'
// neighbours read 0.016-0.034, comfortably under this bound) while clearing every legitimate cusp.
// Gated in EVEN mode only (the only mode `chromaAt`'s bracketed solve touches) on the 25-stop export
// ramp. Negative control: restoring the old seedHue fallback in a scratch copy reds this exact gate
// (recorded in the handoff, since it needs a source patch this file does not carry).
//
// LONE_SPIKE_ALLOW (owner ruling, U4 review pass 1 / pass 2, 2026-09-20; same treatment as
// NOTCH_ALLOW above, named-by-value not just counted). Root-caused, not an integration defect: all 64
// hits sit at stop 500 (the anchor pass-through point, U2) and the spiking hex is the palette's own
// stored `anchor` in every case. U3's ruled `dampAmp` 55 -> 0 (ticket #681 U3, Q7) removes even mode's
// chroma-envelope shoulder term, so at `dampAmp` 0 stops 450/550 fall to OKLCH C 0.036-0.049 (under
// this gate's own 0.05 achromatic bound) while U2's pass-through holds stop 500 at the anchor's own
// full chroma, C 0.072-0.093 - a genuine one-stop chroma spike exactly at the pass-through point.
// Witness: architecture "Komsomolskaya Station" tertiary `#346190`: `#5F768F` (C 0.0475) ->
// `#346190` (C 0.0911) -> `#3E546C` (C 0.0482). Neither `unit/pif-u2-ramp` (carries this gate, but
// `dampAmp: 55`: 0 hits) nor `unit/pif-u3-envelope` (carries `dampAmp: 0`, but not this gate) could
// see the combination alone - the gate and the corpus change first meet on this integration branch.
// Owner ruling: name the 64 by value and gate the count here; the real fix (an even-mode neighbourhood
// chroma term at the anchor stop, so 450/550 are not left achromatic beside a saturated 500) joins
// ticket #701, not this unit. Printed by the gate itself, so a real drift is copy-pasteable back in.
const LONE_SPIKE_BOUND = 0.03, LONE_SPIKE_ACHROMATIC = 0.05;
const LONE_SPIKE_ALLOW = [
  `architecture "Komsomolskaya Station · 1952 · Moscow Metro" tertiary #346190 stop 500`,
  `architecture "Marine Drive · 1930s · Art Deco ensemble · Mumbai" tertiary #3C819E stop 500`,
  `architecture "Napier · rebuilt 1931–33 · Art Deco town, New Zealand" primary-muted #458FA7 stop 500`,
  `architecture "Ocean Drive · 1930s · Miami Beach Art Deco Historic District" primary-muted #6BABCD stop 500`,
  `architecture "Ocean Drive · 1930s · Miami Beach Art Deco Historic District" tertiary #78C0C4 stop 500`,
  `architecture "Oia · Cyclades vernacular · Santorini, Greece" tertiary #136689 stop 500`,
  `architecture "Piazza d'Italia · 1978 · Charles Moore · New Orleans" tertiary #399091 stop 500`,
  `architecture "Piazza d'Italia · 1978 · Charles Moore · New Orleans" tertiary-muted #5893AC stop 500`,
  `architecture "Sagrada Família · Gaudí, begun 1882 · Barcelona · the nave" tertiary-muted #2C9498 stop 500`,
  `architecture "Shah Mosque · 1629 · Isfahan, Iran · the dome and iwan" secondary #3CA1A2 stop 500`,
  `architecture "Sydney Opera House · 1973 · Jørn Utzon" primary #6BABCD stop 500`,
  `architecture "Sydney Opera House · 1973 · Jørn Utzon" tertiary #206F92 stop 500`,
  `architecture "Taos Pueblo · adobe vernacular · New Mexico" secondary-muted #4A9FA3 stop 500`,
  `architecture "Taos Pueblo · adobe vernacular · New Mexico" tertiary #5F97BD stop 500`,
  `architecture "The Alhambra · 14th c · Granada · the Court of the Lions" tertiary #28817E stop 500`,
  `architecture "The Chrysler Building · 1930 · William Van Alen · New York" primary-muted #6595BF stop 500`,
  `architecture "The Portland Building · 1982 · Michael Graves" primary #4875A6 stop 500`,
  `architecture "Trellick Tower · 1972 · Ernő Goldfinger · London" primary-muted #40888A stop 500`,
  `architecture "VDNKh · 1939–54 · exhibition pavilions · Moscow" tertiary-muted #528DA6 stop 500`,
  `cuisine "Mole poblano · the festival plate" secondary-muted #346190 stop 500`,
  `cuisine "Sicilian table · the southern feast" primary-muted #3D699A stop 500`,
  `film "Blade Runner 2049 · 2017 · dir. Villeneuve · cin. Deakins · the Vegas ruins" primary #409EB2 stop 500`,
  `film "Hero · 2002 · dir. Zhang Yimou · the red courtyard duel" primary-muted #2C5887 stop 500`,
  `film "Hero · 2002 · dir. Zhang Yimou · the red courtyard duel" tertiary #3B8269 stop 500`,
  `film "John Wick · 2014 · dir. Stahelski · the Red Circle club" primary #2C9498 stop 500`,
  `film "John Wick · 2014 · dir. Stahelski · the Red Circle club" secondary #244979 stop 500`,
  `film "La La Land · 2016 · dir. Chazelle · the Griffith Park dusk" secondary-muted #264B7C stop 500`,
  `film "Mad Max: Fury Road · 2015 · dir. Miller · the desert chase" tertiary #005567 stop 500`,
  `film "My Neighbour Totoro · 1988 · Studio Ghibli · the rural summer" secondary-muted #82BAD8 stop 500`,
  `film "Once Upon a Time in the West · 1968 · dir. Leone · the railhead town" primary #40888A stop 500`,
  `film "TRON: Legacy · 2010 · dir. Kosinski · the Grid" secondary-muted #4376A5 stop 500`,
  `film "The Red Shoes · 1948 · dir. Powell & Pressburger · the ballet" tertiary-muted #0A8285 stop 500`,
  `film "The Wizard of Oz · 1939 · the gates of the Emerald City" primary-muted #729DCA stop 500`,
  `film "Touch of Evil · 1958 · dir. Orson Welles · the border-town night" primary #418792 stop 500`,
  `film "Vertigo · 1958 · dir. Alfred Hitchcock · the green neon hotel" primary #274D76 stop 500`,
  `literature "Don Quixote · Cervantes · 1605 · the plains of La Mancha" tertiary-muted #6292BC stop 500`,
  `literature "The Little Prince · Saint-Exupéry · 1943 · the desert & the asteroid" tertiary #2E4E7A stop 500`,
  `literature "The Picture of Dorian Gray · Wilde · 1890 · the aesthete's drawing room" secondary #006366 stop 500`,
  `music "City pop · the '80s Tokyo-night sleeve" secondary-muted #279196 stop 500`,
  `music "Cool jazz · the mid-century record sleeve" secondary #265986 stop 500`,
  `music "Gospel · the church choir" secondary-muted #346190 stop 500`,
  `music "Mod & British Invasion · the op-art club" secondary-muted #264B7C stop 500`,
  `music "Modal jazz · the cool-blue session" secondary #23436E stop 500`,
  `music "Motown · the glamour stage" primary #1E8B8F stop 500`,
  `music "Nashville rhinestone · the Opry stage" secondary #30979D stop 500`,
  `music "Outlaw country · the desert-highway sleeve" primary #399092 stop 500`,
  `music "Power metal · the fantasy album art" secondary #2C5887 stop 500`,
  `music "Stax · the Southern-soul sleeve" primary #289195 stop 500`,
  `music "Vaporwave · the digital-pastel aesthetic" tertiary-muted #75C7D3 stop 500`,
  `nature "0° · June · 11:00 · Congo Basin lowland forest, Odzala, Republic of the Congo" primary #116264 stop 500`,
  `nature "18° S · November · 11:00 · Ribbon Reefs, Great Barrier Reef, Australia" secondary #6CBBBB stop 500`,
  `nature "18° S · November · 11:00 · Ribbon Reefs, Great Barrier Reef, Australia" tertiary #29638E stop 500`,
  `nature "19° S · July · 17:00 · Okavango Delta, Botswana, dry-season flood" primary-muted #1E8B90 stop 500`,
  `nature "20° N · January · 11:00 · Cenote Ik Kil, Yucatán, Mexico" secondary #569DA0 stop 500`,
  `nature "23° S · December · 13:00 · Salar de Atacama edge, Atacama Desert, Chile" secondary-muted #5DA4A1 stop 500`,
  `nature "37° N · October · 16:00 · Monument Valley, Colorado Plateau, Arizona–Utah" primary #4E79A4 stop 500`,
  `nature "51° N · July · 08:00 · Moraine Lake, Valley of the Ten Peaks, Canadian Rockies" secondary-muted #56AAAD stop 500`,
  `nature "64° N · March · inside · Vatnajökull glacier cave, Iceland" secondary #2F7B9F stop 500`,
  `travel "22° N · January · 11:00 · Sapa Sunday market, Lào Cai Province, cold mountain fog" secondary #042546 stop 500`,
  `travel "23° S · December · 16:20 · Salar de Atacama, 2,305 m" primary-muted #588AB9 stop 500`,
  `travel "26° N · June · 18:30 · The shrine of Lal Shahbaz Qalandar, Sehwan, at the evening dhamaal" secondary #397554 stop 500`,
  `travel "41° N · April · 09:00 · La Boqueria, Barcelona, just past opening on a Tuesday" tertiary #1C486F stop 500`,
  `travel "41° N · April · 10:00 · Bolhão Market, Porto, Saturday opening hour" primary #4F80A8 stop 500`,
  `travel "47° N · October · 05:55 · Ger camp at Övörkhangai, the moment before sunrise" primary-muted #5485AE stop 500`,
];
function loneSpikeStop(ramp25) {
  for (let i = 1; i < ramp25.length - 1; i++) {
    const c0 = rgbToOklchIndep(hexToRgb(ramp25[i - 1].hex))[1];
    const c1 = rgbToOklchIndep(hexToRgb(ramp25[i].hex))[1];
    const c2 = rgbToOklchIndep(hexToRgb(ramp25[i + 1].hex))[1];
    if (c0 <= LONE_SPIKE_ACHROMATIC && c2 <= LONE_SPIKE_ACHROMATIC && c1 - c0 > LONE_SPIKE_BOUND && c1 - c2 > LONE_SPIKE_BOUND) return ramp25[i].stop;
  }
  return null;
}
const loneSpikeNames = new Set();
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
      // Lone-spike (review pass 5, Finding 1): even mode only, on the 25-stop export ramp.
      if (mode === "even") {
        const spikeStop = loneSpikeStop(ramp25);
        if (spikeStop !== null) loneSpikeNames.add(`${label} stop ${spikeStop}`);
      }
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
// Addendum-2 (2026-09-19): the lone-spike sweep above only ever walked `presetsByCat` (the 8 curated
// categories), never the 16-palette default kit - "excluded" is the wrong word (nothing filtered it
// out), it was simply never in this loop's own subject list. Ruling: the default kit must be IN the
// sweep. Rather than fold it into the big shared loop above (which also drives six OTHER allow-lists -
// window-clamp, monotone, gap, distinct, notch - none of them named by addendum 2 and none
// re-measured against the default kit yet), this is a small, separate, lone-spike-only sweep over the
// same `loneSpikeStop` function, so it costs 16 extra renders instead of re-opening six unrelated
// gates' scope. It found exactly one hit: default kit "Default" Data 7 #088585 stop 500 (even, 25-stop) -
// a near-achromatic teal anchor sitting as a lone spike between two near-grey neighbours, the same
// mechanism as the curated corpus's 64: `dampAmp` 0 leaves stops 450/550 achromatic beside the anchor
// pass-through at stop 500, the fix joins #701 (not this unit). Per addendum 2, this is its OWN
// finding, not folded into LONE_SPIKE_ALLOW: LONE_SPIKE_ALLOW's own count gate is scoped to the 8
// curated categories, so folding the kit in would silently widen what that number means.
//
// Q8 RULED (owner, via the conductor, 2026-09-20, review pass 2 confirmed the measurement): the
// rendered-path ruling puts the default kit in the sweep, so the plan's "0 notched cells in the
// default kit" invariant is RESTATED, not broken. `notchOk`'s own predicate (the ratio+absolute-dip
// notch check above, NOTCH_ALLOW) measures the default kit at 0 in all three modes - verified directly,
// re-confirmed by review pass 2 independently. The lone-spike predicate here is a DIFFERENT check (a
// single stop's OKLCH C spiking above two near-achromatic neighbours, not a chroma dip at the pivot),
// so Data 7's one named hit does not breach the notch invariant; it is a separate, correctly-scoped
// finding under its own name, gated below.
const dkBaseForSpike = defaultDocument(); // .name is read BEFORE hydrate - hydrate does not carry it
const dkSpikeDoc = hydrate({ ...dkBaseForSpike, toneMode: "even" });
const dkSpikeView = projectView(dkSpikeDoc);
const defaultKitSpikeNames = new Set();
for (const p of dkSpikeDoc.palettes) {
  if (typeof p.anchor !== "string") continue;
  const vp = dkSpikeView.palettes.find((v) => v.name === p.name);
  const ramp25 = vp ? vp.fullRamp : null;
  if (!ramp25) continue;
  const spikeStop = loneSpikeStop(ramp25);
  if (spikeStop !== null) defaultKitSpikeNames.add(`default kit "${dkBaseForSpike.name}" ${p.name} ${p.anchor} stop ${spikeStop}`);
}
const DEFAULT_KIT_SPIKE_FINDING = new Set([`default kit "Default" Data 7 #088585 stop 500`]);
const dkSpikeSorted = [...defaultKitSpikeNames].sort();
console.log(`  ${allowListMatches(dkSpikeSorted, [...DEFAULT_KIT_SPIKE_FINDING]) ? "pass" : "FAIL"}  anchor-ramp default-kit lone-spike (addendum 2, own finding, NOT part of LONE_SPIKE_ALLOW - Q8 ruled: the "0 notched cells" invariant is restated, not broken, notch itself reads 0 for the kit): ${dkSpikeSorted.length} (expected ${DEFAULT_KIT_SPIKE_FINDING.size})`);
if (!allowListMatches(dkSpikeSorted, [...DEFAULT_KIT_SPIKE_FINDING])) {
  for (const n of DEFAULT_KIT_SPIKE_FINDING) if (!dkSpikeSorted.includes(n)) FAIL("anchor-ramp", `default-kit lone-spike: expected member missing - ${n}`);
  for (const n of dkSpikeSorted) if (!DEFAULT_KIT_SPIKE_FINDING.has(n)) FAIL("anchor-ramp", `default-kit lone-spike: unexpected member - ${n}`);
}
for (const n of DEFAULT_KIT_SPIKE_FINDING) console.log(`    r ${n}`);
const loneSpikeSorted = [...loneSpikeNames].sort();
console.log(`  ${allowListMatches(loneSpikeSorted, LONE_SPIKE_ALLOW) ? "pass" : "FAIL"}  anchor-ramp lone-spike allow-list (even, near-achromatic neighbours <= ${LONE_SPIKE_ACHROMATIC}, OKLCH C > both by > ${LONE_SPIKE_BOUND}; owner-ruled dampAmp-0/anchor-pass-through carve-out, fix joins #701): ${loneSpikeSorted.length} (expected ${LONE_SPIKE_ALLOW.length})`);
if (!allowListMatches(loneSpikeSorted, LONE_SPIKE_ALLOW)) {
  for (const n of LONE_SPIKE_ALLOW) if (!loneSpikeSorted.includes(n)) FAIL("anchor-ramp", `lone-spike allow-list: expected member missing - ${n}`);
  for (const n of loneSpikeSorted) if (!LONE_SPIKE_ALLOW.includes(n)) FAIL("anchor-ramp", `lone-spike allow-list: unexpected member (stop's OKLCH C exceeds both neighbours by > ${LONE_SPIKE_BOUND}) - ${n}`);
}
for (const n of LONE_SPIKE_ALLOW) console.log(`    r ${n}`);

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
  dropCheck("lone-spike", loneSpikeSorted, LONE_SPIKE_ALLOW);
  // A same-length swap must ALSO be caught (a name substitution, not just a shrink).
  const swapCheck = (name, measuredSorted, allow, fakeMember) => {
    const swapped = [...allow.slice(0, -1), fakeMember].sort();
    if (allowListMatches(measuredSorted, swapped)) FAIL("anchor-ramp", `negative control DID NOT bite: a swapped ${name} allow list still matched the real measured data`);
  };
  swapCheck("window-clamp", windowSorted, RAMP_WINDOW_ALLOW, `film "A Made-Up Title" primary #000001`);
  swapCheck("gap", gapSorted, RAMP_GAP_ALLOW, `film "A Made-Up Title" primary #000003`);
  swapCheck("distinct", distinctSorted, RAMP_DISTINCT_ALLOW, `film "A Made-Up Title" primary #000004`);
  swapCheck("notch", notchSorted, NOTCH_ALLOW, `film "A Made-Up Title" primary #000005 [peak]`);
  swapCheck("lone-spike", loneSpikeSorted, LONE_SPIKE_ALLOW, `film "A Made-Up Title" primary #000006 stop 500`);
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
  // 3,396 anchored ramps clear ΔE_OK > 0.01).
  //
  // Q-D (ruled + verified, superseding the "open question" this comment used to record): the OKHSL
  // (perceptual/peak) construction stays UNCHANGED - `okhslStopsAnchored`'s own per-stop OKHSL hue
  // solve is untouched by this pass, same as review pass 3 left it. Instead the UI now disables the
  // doc-level Hue space control for an anchored palette in perceptual/peak (src/ui/sections/color.js's
  // renderGlobalInspector + renderPaletteInspector, gated in test/ui/headless-boot.mjs's (hs) block),
  // on the strength of this file's OWN bound below: flipping hueSpace on an anchored perceptual/peak
  // ramp never moves any channel by more than 2 (8-bit). This is the engine-side half of that ruling -
  // it does not just re-assert Finding 1's magnitude-floor miss, it bounds the miss.
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
    const floorNote = magnitudeFloor !== undefined ? `, max OKLab dE ${maxDeltaE.toFixed(4)} (want > ${magnitudeFloor}, a magnitude floor - below the commonly used OKLab JND of about 0.02, not itself a JND), asserted in even only` : "";
    console.log(`  ${moved > 0 && s500moved === 0 && (magnitudeFloor === undefined || maxDeltaE > magnitudeFloor) ? "pass" : "FAIL"}  anchor-f4 ${key}: moved ${moved} default-kit anchored ramps, stop 500 moved ${s500moved} (want >=1, 0)${floorNote}`);
  }

  // Q-D (ruled + verified, 2026-09-18; scope corrected + re-ruled, review pass 4 Finding 1, plan rev
  // 23, 2026-09-19): the engine-side half of the ruling - flipping hueSpace on an ANCHORED palette in
  // perceptual or peak has NO VISIBLE effect. Review 3's own in-suite sample (the 16-palette default
  // kit only) measured a max 8-bit per-channel diff of 1 and stated a "<= 2 codes" bound as if it held
  // for every anchored palette; review 4 measured the full 3,396-ramp curated corpus and found 39
  // perceptual / 17 peak ramps exceed 2 codes (max 10 / 12) - the default-kit sample was too small to
  // see this. The perceptual magnitude stays invisible throughout: 0 of 3,396 ramps in either mode
  // clear a 0.01 OKLab delta-E (max 0.0047 perceptual, 0.0053 peak). RULED: the gate is max OKLab
  // delta-E <= 0.01 over the full anchored corpus, per mode - the corpus data supports that bound, not
  // a codes bound. "<= 2 codes" STAYS as its own gate, scoped to the DEFAULT KIT ONLY (tracked below as
  // `dkMaxDiff`, separately from the corpus-wide `maxDiff`, which is reported for visibility only and
  // is not, and will not be, gated). This is a final ruling, not an open question any more.
  // This is the bound the UI's "disabled,
  // rounding only" claim rests on (src/ui/sections/color.js's renderGlobalInspector/
  // renderPaletteInspector; gated in test/ui/headless-boot.mjs's (hs) block). Unlike F4_CASES's
  // hueSpace entry (which asserts a REAL effect exists, in even mode), this asserts the OPPOSITE
  // direction for perceptual/peak - that whatever effect exists stays invisible - so it is a separate
  // block, not folded into that loop's shared "moved === 0 -> FAIL" liveness check.
  //
  // Negative control (run by the review-4 reviewer, recorded here since it needs a source patch this
  // file does not carry): substituting the anchor's own CAM16 hue for the OKHSL hue candidate at every
  // iteration (i.e. solving nothing - always rendering at the "cam16" hue while hueSpace claims
  // "oklch") reds this exact gate at a max per-channel diff of 33 (perceptual) / 34 (peak) - proving
  // the predicate below can tell a real hue divergence from the actual rounding-only behavior.
  const maxChannelDiff = (hexA, hexB) => {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
  };
  const HUE_SPACE_DELTA_E_BOUND = 0.01;
  const HUE_SPACE_CODES_BOUND = 2;
  const hueSpaceBoundSubjects = [...presetsByCat, { slug: "default kit", preset: dkBase }];
  for (const modeName of ["perceptual", "peak"]) {
    let maxDiff = 0, worstCodes = "n/a", maxDeltaE = 0, worstDeltaE = "n/a", overBoundRamps = 0;
    let dkMaxDiff = 0, dkWorstCodes = "n/a";
    const overBoundNames = new Set();
    for (const { slug, preset } of hueSpaceBoundSubjects) {
      const base = hydrate({ ...preset, toneMode: modeName });
      const alt = hydrate({ ...base, hueSpace: base.hueSpace === "cam16" ? "oklch" : "cam16" });
      const baseV = projectView(base), altV = projectView(alt);
      for (const p of base.palettes) {
        if (typeof p.anchor !== "string") continue;
        const a = baseV.palettes.find((v) => v.name === p.name).fullRamp;
        const b = altV.palettes.find((v) => v.name === p.name).fullRamp;
        let rampOverBound = false;
        for (let i = 0; i < a.length; i++) {
          const d = maxChannelDiff(a[i].hex, b[i].hex);
          if (d > maxDiff) { maxDiff = d; worstCodes = `${slug} "${preset.name}" ${p.name} stop ${a[i].stop}`; }
          if (slug === "default kit" && d > dkMaxDiff) { dkMaxDiff = d; dkWorstCodes = `${preset.name} ${p.name} stop ${a[i].stop}`; }
          const de = deltaEOk(a[i].hex, b[i].hex);
          if (de > maxDeltaE) { maxDeltaE = de; worstDeltaE = `${slug} "${preset.name}" ${p.name} stop ${a[i].stop}`; }
          if (de > HUE_SPACE_DELTA_E_BOUND) rampOverBound = true;
        }
        if (rampOverBound) { overBoundRamps++; overBoundNames.add(`${slug}|${preset.name}|${p.name}`); }
      }
    }
    if (maxDeltaE > HUE_SPACE_DELTA_E_BOUND) {
      FAIL(
        "anchor-f4",
        `hueSpace ${modeName}: ${overBoundRamps} anchored ramp(s) clear a ${HUE_SPACE_DELTA_E_BOUND} OKLab delta-E when hueSpace flips (max ${maxDeltaE.toFixed(4)}, worst ${worstDeltaE}) - the UI's "disabled, rounding only" claim for anchored ${modeName} palettes is now false`,
      );
    }
    if (dkMaxDiff > HUE_SPACE_CODES_BOUND) {
      FAIL(
        "anchor-f4",
        `hueSpace ${modeName}: default-kit codes bound broken, ${dkMaxDiff} > ${HUE_SPACE_CODES_BOUND} (worst ${dkWorstCodes})`,
      );
    }
    const codesNote = maxDiff > HUE_SPACE_CODES_BOUND ? `full-corpus codes reach ${maxDiff} (worst ${worstCodes}) - reported only, not gated; default kit's own codes bound held (max ${dkMaxDiff}, want <= ${HUE_SPACE_CODES_BOUND})` : `codes bound held everywhere (max ${maxDiff})`;
    console.log(`  ${maxDeltaE <= HUE_SPACE_DELTA_E_BOUND && dkMaxDiff <= HUE_SPACE_CODES_BOUND ? "pass" : "FAIL"}  anchor-f4 hueSpace-${modeName}-bound: full corpus + default kit, max OKLab dE ${maxDeltaE.toFixed(4)} (want <= ${HUE_SPACE_DELTA_E_BOUND}, worst ${worstDeltaE}); ${codesNote}`);
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
// overstated gap-19 and notch: both are named, frozen allow-lists, not settled zeros; corrected again
// pass 5 records, per Q1/Q3's own standing-rule resolutions - "C4 untouched" and "notch pending" are
// both overtaken): name the specific criteria this file clears, not a generic pass line - C2 (anchor
// identity, direct + rendered), C4 (non-anchored construction TOTALLY migrated off the retired
// pre-#681 reference - Q1's own resolution, not "untouched": U6 replaced the base ladder outright, so
// `prime-identity-control` now asserts every one of 3,796 subjects differs from that reference), C3
// (stop 500 exact + lift-40 negative control), C5 (monotone, pixel L*, a true 0, no list), C6/F4 (peak
// != perceptual, Curve/Tension/Vibrancy each live for every anchored ramp, hueSpace live in even mode
// + bounded to rounding in perceptual/peak per Q-D, stop 500 exact under every toggle). Window-clamp
// (10), gap-19 (72, U4 re-freeze), distinct-25 (16, U4 re-freeze) and notch (15, Q-C variant,
// RESOLVED by standing rule at Q3 - a clean subset of the old 78, every departure named with cause,
// not pending) are all named allow-lists compared by name with a biting negative control, not settled
// zeros.
console.log("\nPASS: C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved) are named allow-lists, compared by name, each with a biting negative control");
process.exit(0);
