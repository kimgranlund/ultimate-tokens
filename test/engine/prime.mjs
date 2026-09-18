#!/usr/bin/env node
// prime.mjs (test) — AC-050 verifier for src/engine/prime.mjs (SPEC spec-muted-base-key-spikes 0.2.0,
// REQ-050..053a/056, ladder rebuilt 2026-09-18 ticket #681 U6, owner ruling Q8/Q9). Every gate
// re-derives its own expectation independently from the SPEC's own formulas (peakC/hctToRgb/
// maxChromaInGamut/effHue are pre-existing, separately-validated engine primitives — never calling
// back into primeSwatches's own internals) or measures emitted pixels, per the SPEC's own
// "Agent verification" anti-tautology note for this file.
//
// U6 SCOPE NOTE: this branch (unit/pif-u6-ladder) does NOT carry U1's `anchor` field — U1 lands as a
// sibling unit and this one was built to stand alone (team-lead dispatch, 2026-09-18). Wherever the
// plan's mechanism (3) text says "the anchor's L*", this file and src/engine/prime.mjs read the
// EXISTING key colour's own L* (`peakC`'s cusp tone) on the non-anchored path, exactly as prime.mjs
// did before #681. Two consequences, both re-measured here rather than copied from the plan:
//   1. C5's own 21-name allow-list is NOT gated on U1's `anchor` field: the source hexes it names are
//      already shipped on this branch, under `docs/reference/colors/categories/*.json`'s
//      `palettes[].swatches[].hex` (the curated corpus the generator maps into primary/primary-muted/
//      secondary/secondary-muted/tertiary/tertiary-muted — the SAME mapping `scripts/gen-categories.mjs`
//      `mapColors()` uses). A first pass of this gate wrongly reasoned this was U1-only data and
//      reported a vacuous 0 (reviewer finding, corrected here): the `ladder-window` gate below iterates
//      that corpus directly and re-derives the 21-name allow-list from it, independent of primeSwatches
//      and independent of whether an `anchor` field exists anywhere.
//   2. The plan/dispatch names Tertiary, Danger, Warning as the three defaults that clip at STEP_L 9,
//      with spans 52.8 / 49.9 / 46.3 L* — computed against U1's Q2(b) minted stop-550-hex anchors.
//      Measured against THIS branch's cusp anchors, Tertiary and Danger do not clip at all (span 54
//      exactly) and Warning clips to 45.77, not 46.3 — a different set entirely (Secondary, Info,
//      Success, Warning, Data 1, Data 4, Data 5, Data 6, Data 7 clip; see the `clipped defaults` gate
//      below). This is flagged in .sdlc/questions/pif-u6.md rather than silently adopted either way.
import { readFileSync, readdirSync } from "node:fs";
import { primeSwatches, primeSteps, PRIME_STEPS, PRIME_L_MIN, PRIME_L_MAX, STEP_L } from "../../src/engine/prime.mjs";
import { peakC, hctToRgb, maxChromaInGamut, cam16FromRgb, lstarFromRgb } from "../../src/engine/hct.js";
import { effHue, DEFAULT_CONTROLS } from "../../src/engine/tonal.js";

const REPO_ROOT = new URL("../../", import.meta.url);
const RT = JSON.parse(readFileSync(new URL("docs/reference/data/role-table.json", REPO_ROOT), "utf8"));
const CATEGORIES_DIR = new URL("docs/reference/colors/categories/", REPO_ROOT);
const hexToRgb = (hex) => { const h = String(hex).replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const DEFAULTS = RT.defaults; // the 16 default palettes {name,hue,chroma,skew,lift,on}
// hueSpace "cam16": role-table.json's hue numbers ARE CAM16 hues (the raw, un-converted seeds
// defaultDocument() maps through camHueToOklch before storing) — `CTL` pins cam16 so effHue passes
// them straight through, exactly as test/engine/tonal.mjs's own DEFAULTS convention does, and so
// EX-4/EX-4b/EX-5's literal worked numbers (written against these same hue/chroma pairs) reproduce.
// prime.mjs's own hue is `baseHue` directly (no re-solve, conductor ruling 2026-09-11), so no gate is
// hueSpace-BRANCHED — but the two spaces feed effHue different hues, so they reach different cusp
// tones and different `lPrime` values, and the PRODUCT default is oklch (`tonal.js` DEFAULT_CONTROLS).
// The ladder gates therefore run over BOTH spaces (`SPACES`/`CTLS`, #641 round-2 F5); only the frozen
// hex snapshot in (d5) is cam16-only, because that is the space it was captured in.
const CTL = { ...DEFAULT_CONTROLS, hueSpace: "cam16" };
const SPACES = ["cam16", "oklch"];
const CTLS = SPACES.map((hueSpace) => ({ ...DEFAULT_CONTROLS, hueSpace }));
const PRIMARY = DEFAULTS.find((d) => d.name === "Primary");

const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };
const angDiff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const norm = (h) => ((h % 360) + 360) % 360;
// quantumCam — the AC-005 precedent (PR #509, test/engine/tonal.mjs), re-based on CAM16 hue (#681 U6):
// the largest CAM16-hue swing a single 8-bit RGB step (±1 in any one channel) produces at this exact
// pixel. Gates (e)/(f) measure CAM16 hue, not OKLCH hue, because the new HCT-native construction holds
// the rung's CAM16 hue constant by construction (`hue` is passed straight to `hctToRgb`) — OKLCH hue
// is NOT held constant across rungs of differing tone even at a fixed CAM16 hue (the Abney effect this
// codebase corrects for elsewhere via `oklchToCam16Hue`), so comparing OKLCH hue across rungs measures
// a quantity the ladder never promised to hold, not a defect in the ladder itself (measured: Neutral's
// rungs hold CAM16 hue within ~2.6° of the 267.000 target, all 8-bit-rounding scale, while their OKLCH
// hue spans 265.8–271.3°, a real ~5.4° Abney spread at IDENTICAL CAM16 hue and varying tone alone).
const quantumCam = (rgb) => {
  const h0 = cam16FromRgb(rgb).hue;
  let m = 0;
  for (let c = 0; c < 3; c++) for (const d of [-1, 1]) {
    const r = [...rgb]; r[c] = Math.min(255, Math.max(0, r[c] + d));
    m = Math.max(m, angDiff(cam16FromRgb(r).hue, h0));
  }
  return m;
};
const hueTol = (rgb) => Math.max(0.5, 2 * quantumCam(rgb));

// lPrimeOf — independent re-derivation of the ladder anchor's CIE L*, from pre-existing engine
// primitives (effHue/peakC), never from primeSwatches itself. `pk.tone` IS the key colour's own CIE
// L* by construction — hctToRgb's `tone` argument converges to that exact L* (its internal binary
// search targets `lFromY(...) === tone`) — so no OKHSL round trip is needed to read it (#681 U6; the
// pre-#681 gate read this off `rgbToOkhsl(keyRgb).l`, a DIFFERENT perceptual scale that happened to
// bound the old OKHSL-domain ladder, not this one).
function lPrimeOf(hue, chroma, hueSpace) {
  const baseHue = effHue(hue, hueSpace, (chroma ?? 0) / 100);
  const pk = peakC(baseHue);
  return { lPrime: pk.tone, pk, baseHue };
}

// deriveKeyRgb — REQ-056's comparison target, independently re-derived from deriveKeyColor's own
// documented construction (src/ui/model.mjs) rather than importing the UI layer into an engine test.
function deriveKeyRgb(p, hueSpace) {
  const baseHue = effHue(p.hue, hueSpace, (p.chroma ?? 0) / 100);
  const pk = peakC(baseHue);
  const keyChroma = ((p.chroma ?? 0) / 100) * pk.c;
  return hctToRgb(baseHue, keyChroma, pk.tone).rgb;
}

// ── (a) shape: exactly seven entries, fixed step order, every default palette ─────────────
for (const p of DEFAULTS) {
  const sw = primeSwatches(p, CTL);
  if (sw.length !== 7) FAIL("a", `${p.name}: expected 7 entries, got ${sw.length}`);
  for (let i = 0; i < PRIME_STEPS.length; i++) {
    if (sw[i]?.step !== PRIME_STEPS[i]) FAIL("a", `${p.name}: step[${i}] = ${sw[i]?.step}, expected ${PRIME_STEPS[i]}`);
  }
}

// ── (b) l strictly decreasing, every l within [PRIME_L_MIN, PRIME_L_MAX] (1e-9 tol, CIE L*) ─
for (const p of DEFAULTS) {
  const sw = primeSwatches(p, CTL);
  for (let i = 0; i < sw.length; i++) {
    if (sw[i].l < PRIME_L_MIN - 1e-9 || sw[i].l > PRIME_L_MAX + 1e-9) FAIL("b", `${p.name} ${sw[i].step}: l ${sw[i].l} outside [${PRIME_L_MIN},${PRIME_L_MAX}]`);
    if (i > 0 && sw[i].l >= sw[i - 1].l) FAIL("b", `${p.name}: l not strictly decreasing at ${sw[i].step} (${sw[i - 1].l} -> ${sw[i].l})`);
  }
}

// ── (c) inGamut true for every entry, PLUS a real hex-determinism assertion (not just inGamut).
//        Widened (#681 U6 review pass 1, S3): the 16-defaults x primeChroma x chroma sweep alone never
//        exercises a hueShift-perturbed rung, and the reviewer's finding was specifically that a
//        shifted rung's float hue could fall in a shared `maxChromaInGamut`/`peakC` memoization bucket
//        whose cached cap was computed for a neighbouring hue (hct.js, `hue.toFixed(2)` cache keys) —
//        enough to occasionally clip a fraction of a CAM16-chroma unit outside the TRUE gamut boundary,
//        including on the prime rung itself, AND to make two calls for the SAME logical palette
//        disagree depending on what else had rendered earlier in the same process (a real reproduced
//        break of REQ-043's theme-independence check via `exportPanda`). `localMaxChroma`/`localPeakC`
//        in prime.mjs replace hct.js's shared, TRUNCATED-key caches with their own PRIVATE,
//        EXACT-keyed ones (review pass 1 S3 for the rung caps, review pass 2 for the anchor's own
//        `peakC` call, which the S3 fix had left on the shared cache). Below: the gamut sweep checks
//        `inGamut` (a first pass claimed this alone proved determinism — reviewer finding, review pass
//        2: it does not, since two DIFFERENT-but-both-in-gamut hex outputs both read `inGamut: true`);
//        the `determinism` block afterward is the actual hex-identity assertion, run twice with an
//        hct.js-shared-cache-poisoning sweep interleaved. ────────────────────────────────────────────
for (const p of DEFAULTS) {
  for (const primeChroma of [0, 50, 100]) {
    for (const chroma of [0, 50, 100]) {
      const sw = primeSwatches({ ...p, chroma }, { ...CTL, primeChroma });
      for (const s of sw) if (s.inGamut !== true) FAIL("c", `${p.name} chroma${chroma} primeChroma${primeChroma} ${s.step}: inGamut ${s.inGamut}`);
    }
  }
}
// GAMUT_SWEEP — the reviewer's own reproduction sweep (review pass 1, S3): hue 0..359 step 1 x
// hueShift {0,±10,±20} x skew {0,±40} x both hue spaces, run once and shared by gate (c) (all five
// chroma values, including 0) and the `gamut-ceiling` gate below (chroma {25,50,75,100} only — chroma 0
// is neutral, `peakC.c` 0, trivially always in gamut, and the reviewer's own 302,400-rung denominator
// excludes it: 360 x 4 x 5 x 3 x 2 x 7 rungs = 302,400).
const GAMUT_SWEEP = { checked: 0, violations: [], ceilingChecked: 0, ceilingViolations: 0 };
for (const hueSpace of SPACES) {
  for (let hue = 0; hue < 360; hue += 1) {
    for (const chroma of [0, 25, 50, 75, 100]) {
      for (const hueShift of [0, 10, -10, 20, -20]) {
        for (const skew of [0, 40, -40]) {
          GAMUT_SWEEP.checked++;
          const sw = primeSwatches({ name: `h${hue}`, hue, chroma, hueShift, skew }, { hueSpace });
          for (const s of sw) {
            if (chroma > 0) { GAMUT_SWEEP.ceilingChecked++; if (!s.inGamut) GAMUT_SWEEP.ceilingViolations++; }
            if (!s.inGamut) GAMUT_SWEEP.violations.push(`hue${hue}/c${chroma}/hueShift${hueShift}/skew${skew}/${hueSpace} ${s.step} (hex ${s.hex})`);
          }
        }
      }
    }
  }
}
{
  if (GAMUT_SWEEP.checked < 15000) FAIL("c", `only ${GAMUT_SWEEP.checked} hueShift-sweep cases checked — the widened sweep did not run`);
  for (const v of GAMUT_SWEEP.violations.slice(0, 20)) FAIL("c", v);
}

// ── (determinism, folded into gate "c") — asserts hex identity, not just inGamut (review pass 2
//    finding: a prior version of this gate claimed determinism from the inGamut sweep alone, which
//    cannot catch two DIFFERENT in-gamut hexes for the same logical palette). Runs a dense, non-integer
//    hue sweep (1500 cases, hue step 0.0917deg — deliberately NOT round numbers, so many fall at
//    different hct.js `hue.toFixed(2)` truncation-bucket boundaries, the shape of the reviewer's
//    63/4000 repro) through `primeSwatches` TWICE, with a POISON sweep of hct.js's own SHARED
//    `peakC`/`maxChromaInGamut` caches (imported above, already used by other gates in this file)
//    interleaved between the two passes — 3600 unrelated hues at a dense 0.1deg step, forcing heavy
//    eviction/repopulation of hct.js's shared 5000-slot LRUs. `primeSwatches`'s own PRIVATE caches
//    (`localMaxChroma`/`localPeakC` in prime.mjs) are untouched by this poisoning — they are separate
//    instances, exact-keyed, so this proves the SEPARATION holds: primeSwatches no longer reads hct.js's
//    shared cache state at all, anchor or rung. Sized down from an initial 4000-case version (cost:
//    ~45s standalone) to 1500 (~20s) — cut by REDUCING CASE COUNT, not the poison sweep's density,
//    since a scratch reproduction (not committed; described in the U6 handoff) found that thinning the
//    poison sweep to step 0.5 made the vulnerable pre-fix code read 0/1500 mismatches — false-clean —
//    while keeping poison step 0.1 and only cutting cases to 1500 still caught 3/1500 on the same
//    vulnerable code. Case count is the safe lever here; poison density is not.
const DET_CASES = [];
for (let i = 0; i < 1500; i++) {
  DET_CASES.push({
    name: `d${i}`,
    hue: (i * 0.0917) % 360,
    chroma: 20 + (i % 5) * 18,
    hueShift: (i % 7) - 3,
    skew: ((i % 5) - 2) * 20,
  });
}
const DET_SPACE = DET_CASES.map((_, i) => (i % 2 === 0 ? "cam16" : "oklch"));
const detBefore = DET_CASES.map((p, i) => primeSwatches(p, { ...CTL, hueSpace: DET_SPACE[i] }).map((s) => s.hex).join(","));
for (let hue = 0; hue < 360; hue += 0.1) { peakC(hue); maxChromaInGamut(hue, 4 + (hue % 90)); maxChromaInGamut(hue, 50); maxChromaInGamut(hue, 96 - (hue % 90)); }
const detAfter = DET_CASES.map((p, i) => primeSwatches(p, { ...CTL, hueSpace: DET_SPACE[i] }).map((s) => s.hex).join(","));
let detMismatch = 0;
for (let i = 0; i < DET_CASES.length; i++) if (detBefore[i] !== detAfter[i]) detMismatch++;
console.log(`  determinism (hct.js shared-cache-poisoning interleave): ${detMismatch}/${DET_CASES.length} palettes shifted hex by call order`);
if (detMismatch > 0) FAIL("c", `${detMismatch}/${DET_CASES.length} palettes returned a different hex on the second call after an hct.js shared-cache-poisoning sweep — primeSwatches still depends on shared cache state`);

// ── (gamut-ceiling) owner ruling, 2026-09-18 (#681 U6 review pass 1 fold): a fresh-context reviewer's
//    own reproduction of GAMUT_SWEEP's exact parameters (hue 0..359 step 1 x chroma {25,50,75,100} x
//    hueShift {0,±10,±20} x skew {0,±40} x both hue spaces = 43,200 palettes x 7 rungs = 302,400 rungs,
//    chroma 0 excluded since it is neutral and trivially always in gamut) found 1,288/302,400 rungs
//    out of gamut on the head BEFORE the S3 determinism fix (the shared, memoized `maxChromaInGamut`
//    cache in hct.js producing stray `inGamut:false` on cache-bucket collisions — see the `localMaxChroma`
//    comment in src/engine/prime.mjs). The owner accepted that 1,288 count as shippable in principle and
//    asked for a numeric ceiling gate pinned to what THIS head actually measures, not a hardcoded 1,288.
//    S3's fix (already shipped, required regardless to close the REQ-043 determinism break) turns out to
//    eliminate the out-of-gamut rungs entirely: PINNED_GAMUT_CEILING below is measured directly from
//    GAMUT_SWEEP (the same sweep gate (c) just ran, restricted to chroma>0 to match the reviewer's
//    302,400-rung denominator exactly) on this commit, and is 0 — not a re-assertion of the owner's
//    1,288 figure, which described the pre-fix head, not this one.
const PINNED_GAMUT_CEILING = 0;
if (GAMUT_SWEEP.ceilingChecked !== 302400) FAIL("gamut-ceiling", `expected exactly 302400 chroma>0 rungs (reviewer's own denominator) — measured ${GAMUT_SWEEP.ceilingChecked}, sweep parameters drifted`);
if (GAMUT_SWEEP.ceilingViolations > PINNED_GAMUT_CEILING) FAIL("gamut-ceiling", `${GAMUT_SWEEP.ceilingViolations}/${GAMUT_SWEEP.ceilingChecked} out-of-gamut rungs exceeds the pinned ceiling of ${PINNED_GAMUT_CEILING} (owner-accepted precedent: 1288/302400 on the pre-S3 head)`);
console.log(`  gamut-ceiling: ${GAMUT_SWEEP.ceilingViolations}/${GAMUT_SWEEP.ceilingChecked} out-of-gamut rungs (pinned ceiling ${PINNED_GAMUT_CEILING})`);

// ── (d) Q8/Q9 (2026-09-18, ticket #681 U6): the ladder spans a FULL 6 x STEP_L in CIE L* at every hue
//        and chroma UNLESS a bound is closer than STEP_L*3 on either side, in which case BOTH sides
//        take the SAME reduced step (equal-compress, min(STEP_L, roomUp, roomDown)) — replacing #641's
//        redistribute rule, which handed a clipped side's shortfall to the OTHER side and produced
//        exactly the asymmetry the owner's screenshot finding flagged. Every gate below states a
//        PROPERTY re-derived from `peakC`/window arithmetic, never primeSteps's own expression, so a
//        fitted formula cannot satisfy them by mirroring. All of (d) runs over BOTH hue spaces. ──────
const SPAN = 6 * STEP_L;
// CASES — for each hue space: the 16 shipped defaults, plus a sweep of hue 0..359 step 5 x
// chroma {0,50,100} that generalises past them.
const CASES = [];
for (let k = 0; k < SPACES.length; k++) {
  const hueSpace = SPACES[k], ctl = CTLS[k];
  for (const p of DEFAULTS) CASES.push({ p: { ...p, skew: 0 }, ctl, hueSpace, label: `${p.name}/${hueSpace}` });
  for (let hue = 0; hue < 360; hue += 5) for (const chroma of [0, 50, 100]) {
    CASES.push({ p: { name: `hue${hue}`, hue, chroma, skew: 0 }, ctl, hueSpace, label: `hue${hue}/c${chroma}/${hueSpace}` });
  }
}
// each case's independently re-derived anchor, per-side ROOM, and expected equal-compress step
for (const c of CASES) {
  c.lPrime = lPrimeOf(c.p.hue, c.p.chroma, c.hueSpace).lPrime;
  c.roomUp = Math.max(0, (PRIME_L_MAX - c.lPrime) / 3);
  c.roomDown = Math.max(0, (c.lPrime - PRIME_L_MIN) / 3);
  c.inBounds = c.lPrime >= PRIME_L_MIN && c.lPrime <= PRIME_L_MAX;
  c.expStep = Math.min(STEP_L, c.roomUp, c.roomDown);
  c.sw = primeSwatches(c.p, c.ctl);
}
if (CASES.length < 2 * (16 + 72 * 3)) FAIL("d1", `CASES built only ${CASES.length} cases — the sweep did not run`);

// (d1) span floor: brightest - dimmest === 6 * min(STEP_L, roomUp, roomDown) EXACTLY (1e-9), for
//      EVERY case, unconditionally — equal-compress collapses the old "unclipped vs both-clip" branch
//      into one formula (up === down always, whether or not a bound is in reach), so a single equation
//      covers the whole sweep. Never exceeds SPAN.
for (const c of CASES) {
  const span = c.sw[0].l - c.sw[6].l;
  const expSpan = 6 * c.expStep;
  if (Math.abs(span - expSpan) > 1e-9) FAIL("d1", `${c.label}: span ${span.toFixed(6)} != 6 x min(STEP_L,roomUp,roomDown) ${expSpan.toFixed(6)}`);
  if (span > SPAN + 1e-9) FAIL("d1", `${c.label}: span ${span.toFixed(6)} EXCEEDS the ${SPAN} L* ceiling`);
}

// (d2a) anchor: `prime`'s l IS the key colour's own CIE L* (`peakC`'s cusp tone) — the redistribution
//       rule and the equal-compress rule must never move the anchor itself.
for (const c of CASES) {
  if (Math.abs(c.sw[3].l - c.lPrime) > 1e-9) FAIL("d2a", `${c.label}: anchor l ${c.sw[3].l} != cusp tone ${c.lPrime}`);
}

// (d3) even PER SIDE, AND the two sides equal (Q9's "equal on both sides" — stronger than pre-#681,
//      where the sides could legitimately differ under redistribution). Both step sizes strictly
//      positive: measured across the full sweep in both hue spaces, `peakC`'s cusp tone never reaches
//      within 3 x STEP_L of either window bound with zero room (min observed room ~0.29 L*, at the
//      hottest cusp near PRIME_L_MAX).
for (const c of CASES) {
  const upObs = [c.sw[2].l - c.sw[3].l, c.sw[1].l - c.sw[2].l, c.sw[0].l - c.sw[1].l];
  const downObs = [c.sw[3].l - c.sw[4].l, c.sw[4].l - c.sw[5].l, c.sw[5].l - c.sw[6].l];
  for (const v of upObs) if (Math.abs(v - upObs[0]) > 1e-9) FAIL("d3", `${c.label}: light-side steps uneven ${upObs.map((x) => x.toFixed(9)).join("/")}`);
  for (const v of downObs) if (Math.abs(v - downObs[0]) > 1e-9) FAIL("d3", `${c.label}: dark-side steps uneven ${downObs.map((x) => x.toFixed(9)).join("/")}`);
  if (Math.abs(upObs[0] - downObs[0]) > 1e-9) FAIL("d3", `${c.label}: light step ${upObs[0]} != dark step ${downObs[0]} (Q9 equal-compress)`);
  if (!(upObs[0] > 0 && downObs[0] > 0)) FAIL("d3", `${c.label}: a side has a non-positive step (up ${upObs[0]}, down ${downObs[0]}), anchor ${c.lPrime}`);
}
// primeSteps's own algebraic contract, at hand-computed anchors (no engine call, no mirrored
// expression): every anchor inside the window gets up === down === min(STEP_L, roomUp, roomDown); an
// anchor OUTSIDE the window is floored at zero travel on the missing side, never negative.
for (const [lP, expBoth] of [
  [55, Math.min(STEP_L, (PRIME_L_MAX - 55) / 3, (55 - PRIME_L_MIN) / 3)],
  [93, Math.min(STEP_L, (PRIME_L_MAX - 93) / 3, (93 - PRIME_L_MIN) / 3)],
  [20, Math.min(STEP_L, (PRIME_L_MAX - 20) / 3, (20 - PRIME_L_MIN) / 3)],
]) {
  const { up, down } = primeSteps(lP);
  if (Math.abs(up - expBoth) > 1e-9 || Math.abs(down - expBoth) > 1e-9) FAIL("d3", `primeSteps(${lP}) = {up ${up}, down ${down}}, expected both ${expBoth}`);
}
{
  const { up, down } = primeSteps(PRIME_L_MAX + 1); // above the ceiling: no light room, so up floors at 0
  if (up !== 0) FAIL("d3", `primeSteps(above ceiling) up ${up} != 0`);
  if (down !== 0) FAIL("d3", `primeSteps(above ceiling) down ${down} != 0 (equal-compress: the missing side's zero binds the other)`);
}
{
  const { up, down } = primeSteps(PRIME_L_MIN - 1); // below the floor: no dark room, so down floors at 0
  if (down !== 0) FAIL("d3", `primeSteps(below floor) down ${down} != 0`);
  if (up !== 0) FAIL("d3", `primeSteps(below floor) up ${up} != 0 (equal-compress: the missing side's zero binds the other)`);
}

// (d4) bounds and order, unconditionally — plus the #655 precedent carried over: ZERO anchors outside
//      the window over the whole sweep, in BOTH hue spaces. `peakC`'s own cusp-tone search only ever
//      samples tone 4..96 (hct.js), well inside [PRIME_L_MIN, PRIME_L_MAX] ≈ [12.25, 96.88].
{
  const oob = CASES.filter((c) => !c.inBounds);
  if (oob.length) FAIL("d4", `${oob.length} case(s) with an anchor outside [${PRIME_L_MIN},${PRIME_L_MAX}], e.g. ${oob[0].label} lPrime ${oob[0].lPrime}`);
}
for (const c of CASES) {
  for (let i = 0; i < 7; i++) {
    if (c.sw[i].l < PRIME_L_MIN - 1e-9 || c.sw[i].l > PRIME_L_MAX + 1e-9) FAIL("d4", `${c.label} ${c.sw[i].step}: l ${c.sw[i].l} outside [${PRIME_L_MIN},${PRIME_L_MAX}]`);
    if (i > 0 && c.sw[i].l >= c.sw[i - 1].l) FAIL("d4", `${c.label}: l not strictly decreasing at ${c.sw[i].step} (${c.sw[i - 1].l} -> ${c.sw[i].l})`);
  }
}

// (d5) unclipped byte-identity: a FROZEN snapshot of the defaults whose cusp anchor needs no
//      equal-compress at STEP_L 9 — i.e. min(roomUp,roomDown) >= STEP_L — captured from THIS unit's
//      OWN construction, commit c286d40 ("feat(prime): ladder steps equally in perceived CIE L*, held
//      CAM16 chroma (#681 U6)", `unit/pif-u6-ladder`, post-rebase-onto-6429c49 sha; superseded the
//      pre-rebase 766478b, review pass 1 S7). Frozen
//      literals, so the check is independent of the present implementation by construction. cam16, the
//      space they were captured in. Seven families (one more than #641's six-family pre-#681 set:
//      Data 8 clips under the 0.94-ceiling OKHSL construction but does NOT clip under the L*-domain
//      window measured here, both re-derivations agreeing it is unclipped).
const FROZEN = {
  "Neutral": ["#B9C3E2", "#9BA6C3", "#838EAA", "#717C97", "#55607A", "#424C66", "#303B54"],
  "Primary": ["#AAC3FF", "#7AA5FF", "#498AFF", "#2177F6", "#005BC9", "#0049A2", "#003880"],
  "Tertiary": ["#C8A8DA", "#AA8BBC", "#9173A3", "#7F6290", "#624773", "#4E345F", "#3C244D"],
  "Danger": ["#FFB0A4", "#FF8270", "#E76554", "#D05444", "#AB392C", "#8F251B", "#77130B"],
  "Data 2": ["#FFC1F8", "#FF95FC", "#FB63FF", "#EC25F8", "#CB00D7", "#A600B0", "#83008A"],
  "Data 3": ["#FFB7B8", "#FF9195", "#FF646F", "#FB2049", "#D60038", "#AD002B", "#85001F"],
  "Data 8": ["#E6F2FF", "#B2DCFF", "#76C6FF", "#2CAFF7", "#0097D9", "#007EB7", "#006796"],
};
for (const [name, hexes] of Object.entries(FROZEN)) {
  const p = DEFAULTS.find((d) => d.name === name);
  if (!p) { FAIL("d5", `frozen palette ${name} missing from role-table defaults`); continue; }
  const got = primeSwatches(p, CTL).map((s) => s.hex);
  for (let i = 0; i < 7; i++) if (got[i] !== hexes[i]) FAIL("d5", `${name} ${PRIME_STEPS[i]}: ${got[i]} != frozen ${hexes[i]} — an UNCLIPPED palette must be byte-identical`);
}

// (d6) clipped-side fill (Q9 equal-compress, replacing #641's redistribute rule): the side whose
//      NATURAL room is smaller determines the shared step for BOTH sides — so ONLY that side's extreme
//      rung touches its own bound; the other side's extreme rung sits `3 x step` from the anchor, which
//      generally falls SHORT of its own (larger) bound. Which defaults clip, and on which side, is
//      DERIVED here (never hand-listed), and asserted non-empty on both sides so the gate cannot go
//      vacuous if the window or STEP_L move again.
{
  let nLight = 0, nDark = 0;
  for (const c of CASES.filter((x) => DEFAULTS.some((d) => d.name === x.p.name))) {
    const clippedLight = c.roomUp < c.roomDown && c.roomUp < STEP_L - 1e-9;
    const clippedDark = c.roomDown < c.roomUp && c.roomDown < STEP_L - 1e-9;
    if (clippedLight) {
      nLight++;
      if (Math.abs(c.sw[0].l - PRIME_L_MAX) > 1e-9) FAIL("d6", `${c.label}: brightest l ${c.sw[0].l} != PRIME_L_MAX ${PRIME_L_MAX} (light-clipped side must touch the bound)`);
      const expDimmest = c.lPrime - 3 * c.expStep;
      if (Math.abs(c.sw[6].l - expDimmest) > 1e-9) FAIL("d6", `${c.label}: dimmest l ${c.sw[6].l} != anchor - 3*step ${expDimmest}`);
    } else if (clippedDark) {
      nDark++;
      if (Math.abs(c.sw[6].l - PRIME_L_MIN) > 1e-9) FAIL("d6", `${c.label}: dimmest l ${c.sw[6].l} != PRIME_L_MIN ${PRIME_L_MIN} (dark-clipped side must touch the bound)`);
      const expBrightest = c.lPrime + 3 * c.expStep;
      if (Math.abs(c.sw[0].l - expBrightest) > 1e-9) FAIL("d6", `${c.label}: brightest l ${c.sw[0].l} != anchor + 3*step ${expBrightest}`);
    }
  }
  if (nLight === 0) FAIL("d6", "no light-clipped default found — this gate has gone vacuous");
  if (nDark === 0) FAIL("d6", "no dark-clipped default found — this gate has gone vacuous");
}

// clipped defaults (dispatch requirement, re-measured — see the U6 SCOPE NOTE at the top of this file):
// on THIS branch's cusp-anchor construction, the defaults that clip at STEP_L 9 are Secondary, Info,
// Success, Warning (light) and Data 1 (dark) — NOT the plan's Tertiary/Danger/Warning trio, which is
// computed against U1's Q2(b) anchors (not present here). Asserted at the measured equal-compress
// spans, tolerance 0.05 L*, so a future change to the window/STEP_L/cusp construction is caught.
const CLIPPED_DEFAULTS = {
  "Secondary": 17.77, "Info": 49.77, "Success": 17.77, "Warning": 45.77, "Data 1": 43.50,
};
for (const [name, expSpan] of Object.entries(CLIPPED_DEFAULTS)) {
  const p = DEFAULTS.find((d) => d.name === name);
  const sw = primeSwatches(p, CTL);
  const span = sw[0].l - sw[6].l;
  if (Math.abs(span - expSpan) > 0.05) FAIL("d1", `${name}: measured equal-compress span ${span.toFixed(3)} != expected ${expSpan} +/- 0.05 (see .sdlc/questions/pif-u6.md)`);
}
// and the dispatch-named Tertiary/Danger are UNCLIPPED here (span 54 exactly) — asserted so a silent
// regression toward the plan's post-U1 numbers (which WOULD clip them) is visible as a test change,
// not a surprise at rebase time.
for (const name of ["Tertiary", "Danger"]) {
  const p = DEFAULTS.find((d) => d.name === name);
  const sw = primeSwatches(p, CTL);
  const span = sw[0].l - sw[6].l;
  if (Math.abs(span - SPAN) > 1e-9) FAIL("d1", `${name}: expected UNCLIPPED (span ${SPAN}) on the cusp anchor, measured ${span.toFixed(3)} — U1 rebase may have changed the anchor; re-check .sdlc/questions/pif-u6.md`);
}

// ── (d2) skew gamma (REQ-053a): monotone/bounds, end+prime invariance, weight re-derivation,
//        skew0 weights == |t|, and direction vs the skew-0 baseline, for every default palette ──
{
  const SKEWS = [-100, -60, -20, 0, 20, 60, 100];
  for (let k = 0; k < SPACES.length; k++) {
   const CTL = CTLS[k];
   for (const p0 of DEFAULTS) {
    const p = { ...p0, name: `${p0.name}/${SPACES[k]}` };
    const { lPrime } = lPrimeOf(p.hue, p.chroma, CTL.hueSpace);
    const base0 = primeSwatches({ ...p, skew: 0 }, CTL);
    // per-side extents read off the skew-0 ENDPOINTS, not re-computed from the clipping rule — this
    // group tests the BEND, and the endpoints it bends between are gated by (d1)/(d4)/(d6) above.
    const up = (base0[0].l - base0[3].l) / 3, down = (base0[3].l - base0[6].l) / 3;
    for (const skew of SKEWS) {
      const sw = primeSwatches({ ...p, skew }, CTL);
      const g = 3 ** (skew / 100);
      for (let i = 0; i < sw.length; i++) {
        if (sw[i].l < PRIME_L_MIN - 1e-9 || sw[i].l > PRIME_L_MAX + 1e-9) FAIL("d2", `${p.name} skew${skew}: l ${sw[i].l} out of range`);
        if (i > 0 && sw[i].l >= sw[i - 1].l) FAIL("d2", `${p.name} skew${skew}: l not strictly decreasing at ${sw[i].step}`);
      }
      if (Math.abs(sw[0].l - base0[0].l) > 1e-9) FAIL("d2", `${p.name} skew${skew}: brightest not skew-invariant`);
      if (Math.abs(sw[3].l - base0[3].l) > 1e-9) FAIL("d2", `${p.name} skew${skew}: prime not skew-invariant`);
      if (Math.abs(sw[6].l - base0[6].l) > 1e-9) FAIL("d2", `${p.name} skew${skew}: dimmest not skew-invariant`);
      for (let i = 0; i < 7; i++) {
        if (i === 3) continue;
        const t = (i - 3) / 3, absT = Math.abs(t);
        const w = i < 3 ? absT ** (1 / g) : absT ** g;
        const lExp = i < 3 ? lPrime + 3 * up * w : lPrime - 3 * down * w;
        if (Math.abs(sw[i].l - lExp) > 1e-9) FAIL("d2", `${p.name} skew${skew} ${sw[i].step}: l ${sw[i].l} != re-derived ${lExp}`);
        if (skew === 0 && Math.abs(w - absT) > 1e-9) FAIL("d2", `${p.name} skew0 ${sw[i].step}: weight ${w} != |t| ${absT}`);
        if (skew > 0 && up > 1e-9 && down > 1e-9 && sw[i].l < base0[i].l - 1e-9) FAIL("d2", `${p.name} skew${skew} ${sw[i].step}: l ${sw[i].l} < skew0 baseline ${base0[i].l} (expected >=)`);
        if (skew < 0 && up > 1e-9 && down > 1e-9 && sw[i].l > base0[i].l + 1e-9) FAIL("d2", `${p.name} skew${skew} ${sw[i].step}: l ${sw[i].l} > skew0 baseline ${base0[i].l} (expected <=)`);
      }
    }
   }
  }
}

// ── (e) prime's pixel CAM16 hue == deriveKeyColor's pixel CAM16 hue (an identity — REQ-053
//        superseded 2026-09-11: the hue anchor IS the key colour's own measured hue now, no re-solve).
//        The other six ladder swatches are within max(0.5°, 2 CAM16-hue-quanta at their OWN measured
//        pixel) of PRIME's pixel CAM16 hue, hueShift 0. Measured in CAM16 hue (#681 U6), the space the
//        construction actually holds constant per rung — see quantumCam's header note for why OKLCH
//        hue is the wrong axis to compare across rungs of differing tone. ─────────────────────────
for (const p of DEFAULTS) {
  const sw = primeSwatches({ ...p, hueShift: 0 }, CTL);
  const keyRgb = deriveKeyRgb(p, CTL.hueSpace);
  const primeHue = cam16FromRgb(sw[3].rgb).hue;
  const keyHue = cam16FromRgb(keyRgb).hue;
  const tolPrime = hueTol(sw[3].rgb);
  if (angDiff(primeHue, keyHue) > tolPrime) FAIL("e", `${p.name}: prime pixel CAM16 hue ${primeHue.toFixed(3)} vs deriveKeyColor pixel CAM16 hue ${keyHue.toFixed(3)} (> ${tolPrime.toFixed(3)}°)`);
  for (const s of sw) {
    if (s.step === "prime") continue;
    const h = cam16FromRgb(s.rgb).hue;
    const tol = hueTol(s.rgb);
    if (angDiff(h, primeHue) > tol) FAIL("e", `${p.name} ${s.step}: CAM16 hue ${h.toFixed(3)} vs prime pixel CAM16 hue ${primeHue.toFixed(3)} (> ${tol.toFixed(3)}°)`);
  }
}

// ── (f) hueShift 20: brightest/dimmest move -20°/+20° from their own hueShift-0 CAM16 hue (within the
//        same adaptive budget); prime stays invariant (hueShift's dir is 0 at t=0, never touches it) ──
for (const p of DEFAULTS) {
  const sw0 = primeSwatches({ ...p, hueShift: 0 }, CTL);
  const swS = primeSwatches({ ...p, hueShift: 20 }, CTL);

  const primeHue0 = cam16FromRgb(sw0[3].rgb).hue, primeHueS = cam16FromRgb(swS[3].rgb).hue;
  const tolPrime = hueTol(swS[3].rgb);
  if (angDiff(primeHueS, primeHue0) > tolPrime) FAIL("f", `${p.name}: prime hue moved under hueShift 20 (should be invariant)`);

  const b0 = cam16FromRgb(sw0[0].rgb).hue, bS = cam16FromRgb(swS[0].rgb).hue, targetB = norm(b0 - 20), tolB = hueTol(swS[0].rgb);
  if (angDiff(bS, targetB) > tolB) FAIL("f", `${p.name} brightest: hue ${bS.toFixed(3)} vs base-20 target ${targetB.toFixed(3)} (> ${tolB.toFixed(3)}°)`);

  const d0 = cam16FromRgb(sw0[6].rgb).hue, dS = cam16FromRgb(swS[6].rgb).hue, targetD = norm(d0 + 20), tolD = hueTol(swS[6].rgb);
  if (angDiff(dS, targetD) > tolD) FAIL("f", `${p.name} dimmest: hue ${dS.toFixed(3)} vs base+20 target ${targetD.toFixed(3)} (> ${tolD.toFixed(3)}°)`);
}

// ── (g) s scales linearly with primeChroma (#681 U6: `.s` is now the rung's rendered CAM16 chroma,
//        not OKHSL saturation — REQ-052 still scales the key colour's own chroma directly, so the
//        relation is EXACT, not merely close, on an unclamped probe): ratio of measured s at 50 vs 100
//        == 0.5 (Primary, chroma 95 < 100, so cPrime never saturates against maxChromaInGamut) ──────
{
  const s100 = primeSwatches(PRIMARY, { ...CTL, primeChroma: 100 })[3].s;
  const s50 = primeSwatches(PRIMARY, { ...CTL, primeChroma: 50 })[3].s;
  const ratio = s50 / s100;
  if (Math.abs(ratio - 0.5) > 1e-6) FAIL("g", `Primary: measured chroma ratio (primeChroma 50/100) = ${ratio.toFixed(6)}, expected 0.5 exactly (unclamped)`);
}

// ── (h) REQ-056: at primeChroma 100, prime.hex == deriveKeyColor hex within one 8-bit step
//        per channel, every default palette ────────────────────────────────────────────────
for (const p of DEFAULTS) {
  const sw = primeSwatches(p, { ...CTL, primeChroma: 100 });
  const primeRgb = sw[3].rgb;
  const keyRgb = deriveKeyRgb(p, CTL.hueSpace);
  const diff = [0, 1, 2].map((i) => Math.abs(primeRgb[i] - keyRgb[i]));
  if (diff.some((d) => d > 1)) FAIL("h", `${p.name}: prime rgb [${primeRgb}] vs deriveKeyColor rgb [${keyRgb}] (diff [${diff}])`);
}

// ── (i) determinism: two calls deep-equal ───────────────────────────────────────────────────
for (const p of DEFAULTS) {
  const a = JSON.stringify(primeSwatches(p, CTL));
  const b = JSON.stringify(primeSwatches(p, CTL));
  if (a !== b) FAIL("i", `${p.name}: two calls not deep-equal`);
}

// ── (j) palette.primeChroma overrides controls.primeChroma; an absent controls.primeChroma
//        defaults to 100 flat, with NO fallback to any stray keyIntensity field (the P2..P3
//        rename window, LLD Risk 2, closed once P3/#548 landed primeChroma as a real control —
//        the fallback tail was removed from primeSwatches accordingly) ─────────────────────
{
  const swOverride = primeSwatches({ ...PRIMARY, primeChroma: 30 }, { ...CTL, primeChroma: 100 })[3];
  const swGlobal30 = primeSwatches(PRIMARY, { ...CTL, primeChroma: 30 })[3];
  const swGlobal100 = primeSwatches(PRIMARY, { ...CTL, primeChroma: 100 })[3];
  if (Math.abs(swOverride.s - swGlobal30.s) > 1e-9) FAIL("j", `palette.primeChroma override: s ${swOverride.s} != global-30 s ${swGlobal30.s}`);
  if (Math.abs(swOverride.s - swGlobal100.s) < 1e-9) FAIL("j", "palette.primeChroma override had no effect vs global primeChroma 100");
}
{
  // no controls.primeChroma field at all -> defaults to 100, ignoring a stray keyIntensity: if the
  // retired fallback tail were still present this would read key.s * 0.4 instead of key.s * 1.0.
  const ctlNoPC = { hueSpace: "oklch", keyIntensity: 40 };
  const sw = primeSwatches(PRIMARY, ctlNoPC)[3];
  const swExplicit100 = primeSwatches(PRIMARY, { ...ctlNoPC, primeChroma: 100 })[3];
  if (Math.abs(sw.s - swExplicit100.s) > 1e-9) FAIL("j", `absent controls.primeChroma did not default to 100 flat (s ${sw.s} != explicit-100 s ${swExplicit100.s}) — a stray keyIntensity must not affect it`);
}

// ── (k) chroma is HELD, not damped by lightness distance (Q9 "hold CAM16 chroma"): every rung's
//        MEASURED CAM16 chroma (cam16FromRgb on the rendered pixel, never the internal `.s` field)
//        either equals the prime rung's measured chroma to within 70% retention, or equals
//        maxChromaInGamut(hue, l) at that rung's own tone within 0.5 — one or the other, by
//        construction. Near-neutral cases (measured prime chroma < 3 CAM16 units) are excluded: the
//        ratio is meaningless when dividing by a value that is itself 8-bit-rounding noise around 0,
//        the same quantisation-floor reasoning (e) uses for hue. ─────────────────────────────────
{
  let checked = 0, skipped = 0;
  for (const c of CASES) {
    const primeC = cam16FromRgb(c.sw[3].rgb).chroma;
    for (const s of c.sw) {
      if (primeC < 3) { skipped++; continue; }
      checked++;
      const measC = cam16FromRgb(s.rgb).chroma;
      const cap = maxChromaInGamut(s.hue, s.l);
      const kept = measC / primeC;
      const heldOk = kept >= 0.70 - 1e-6;
      const cappedOk = Math.abs(measC - cap) <= 0.5;
      if (!heldOk && !cappedOk) FAIL("k", `${c.label} ${s.step}: measured chroma ${measC.toFixed(2)} is ${(kept * 100).toFixed(1)}% of prime's ${primeC.toFixed(2)} (< 70%) AND ${Math.abs(measC - cap).toFixed(2)} from the gamut cap ${cap.toFixed(2)} (> 0.5)`);
    }
  }
  if (checked < 2000) FAIL("k", `only ${checked} rungs checked (${skipped} skipped as near-neutral) — the sweep did not run`);
}

// ── ladder-window (C5, corrected — reviewer finding): C5's 21-name allow-list is a property of the
//        CURATED CORPUS'S SOURCE SWATCHES, shipped on this branch under
//        `docs/reference/colors/categories/*.json`, `palettes[].swatches[].hex` — not of U1's `anchor`
//        field, which this gate does not need. `mapColorsRoles` independently re-derives the SAME
//        six-role mapping `scripts/gen-categories.mjs`'s `mapColors()` uses (dE-nearest supporting
//        swatch to the dominant -> secondary-muted; the other supporting swatch, sorted by chroma ->
//        tertiary/tertiary-muted; the two accent swatches, in array order -> primary/primary-muted),
//        from the RAW hex/oklch fields alone — never by importing or calling gen-categories.mjs, so a
//        bug in the generator's own mapping cannot make this gate agree with it by construction. ─────
function mapColorsRoles(swatches) {
  const oklab = (ok) => { const [L, C, H] = ok; const h = (H * Math.PI) / 180; return [L, C * Math.cos(h), C * Math.sin(h)]; };
  const dE = (a, b) => { const A = oklab(a), B = oklab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
  const parseOklch = (s) => s.split(/\s+/).map(Number);
  const sw = swatches.map((s) => ({ hex: String(s.hex).toUpperCase(), hier: s.hier, ok: parseOklch(s.oklch) }));
  const dom = sw.find((s) => s.hier === "d");
  const sup = sw.filter((s) => s.hier === "s");
  const acc = sw.filter((s) => s.hier === "a");
  if (!dom || sup.length < 1 || acc.length < 2) return null; // malformed preset — never silently skip cheaper
  const byNearGround = [...sup].sort((a, b) => dE(a.ok, dom.ok) - dE(b.ok, dom.ok));
  const domMuted = byNearGround[0];
  const domSupport = byNearGround.slice(1).sort((a, b) => b.ok[1] - a.ok[1]); // chroma descending
  return [
    ["primary", acc[0]], ["primary-muted", acc[1]],
    ["secondary", dom], ["secondary-muted", domMuted],
    ["tertiary", domSupport[0]], ["tertiary-muted", domSupport[1]],
  ];
}

// EXPECTED_LADDER_ALLOWLIST — C5's own 21-name list, as (category, role, hex) triples (the plan's
// prose kickers are hand-abbreviated with no formal derivation from the JSON, so this file matches on
// category + role + hex, an exact and unambiguous key, rather than chasing the plan's prose strings).
const EXPECTED_LADDER_ALLOWLIST = [
  ["Brands", "secondary", "#101820"], ["Brands", "tertiary-muted", "#FFFFFF"],
  ["Film / Cinema", "primary", "#1B1B1D"], ["Film / Cinema", "primary", "#161618"],
  ["Film / Cinema", "primary", "#241E1A"], ["Film / Cinema", "tertiary-muted", "#1A1B1E"],
  ["Film / Cinema", "secondary", "#181B1F"], ["Film / Cinema", "tertiary-muted", "#201F25"],
  ["Film / Cinema", "tertiary-muted", "#1F1F24"],
  ["Music / Genre & Era", "primary-muted", "#1F1F23"], ["Music / Genre & Era", "secondary", "#1F1F23"],
  ["Music / Genre & Era", "secondary-muted", "#211E27"], ["Music / Genre & Era", "secondary", "#1E2024"],
  ["Nature / Biomes", "secondary", "#1D1D20"],
  ["Travel / Territories", "tertiary-muted", "#221913"], ["Travel / Territories", "primary-muted", "#251B14"],
  ["Travel / Territories", "tertiary-muted", "#1F1A16"], ["Travel / Territories", "tertiary-muted", "#251B12"],
  ["Travel / Territories", "primary-muted", "#1F1A16"], ["Travel / Territories", "primary", "#1E1D1B"],
  ["Travel / Territories", "primary", "#221913"],
];

let LADDER_WINDOW_ALLOWLIST;
{
  const outside = [];
  const files = readdirSync(CATEGORIES_DIR).filter((f) => f.endsWith(".json")).sort();
  for (const f of files) {
    const doc = JSON.parse(readFileSync(new URL(f, CATEGORIES_DIR), "utf8"));
    for (const vol of doc.volumes || []) {
      for (const preset of vol.palettes || []) {
        const roles = preset.swatches ? mapColorsRoles(preset.swatches) : null;
        if (!roles) continue;
        for (const [role, s] of roles) {
          const L = lstarFromRgb(hexToRgb(s.hex));
          if (L < PRIME_L_MIN || L > PRIME_L_MAX) outside.push({ category: doc.category, kicker: preset.kicker, role, hex: s.hex, L });
        }
      }
    }
  }
  LADDER_WINDOW_ALLOWLIST = outside;
  console.log(`  ladder-window allow-list: ${outside.length} (expected 21)`);
  for (const o of outside) console.log(`    ${o.category} "${o.kicker}" ${o.role} ${o.hex} L* ${o.L.toFixed(2)}`);
  if (outside.length !== 21) FAIL("ladder-window", `allow-list count ${outside.length} != expected 21`);
  const got = outside.map((o) => `${o.category}|${o.role}|${o.hex}`).sort();
  const exp = EXPECTED_LADDER_ALLOWLIST.map(([c, r, h]) => `${c}|${r}|${h}`).sort();
  if (JSON.stringify(got) !== JSON.stringify(exp)) {
    const missing = exp.filter((e) => !got.includes(e));
    const extra = got.filter((g) => !exp.includes(g));
    FAIL("ladder-window", `allow-list contents differ from C5's list. Missing: ${missing.join(", ") || "none"}. Extra: ${extra.join(", ") || "none"}.`);
  }
  // negative control: a synthetic narrow window must find MORE violations than the real one, proving
  // the filter discriminates on the window bounds rather than being vacuously constant.
  let narrowOutside = 0;
  const files2 = files; // same corpus, re-walked at a deliberately narrow synthetic window [40,60] L*
  for (const f of files2) {
    const doc = JSON.parse(readFileSync(new URL(f, CATEGORIES_DIR), "utf8"));
    for (const vol of doc.volumes || []) for (const preset of vol.palettes || []) {
      const roles = preset.swatches ? mapColorsRoles(preset.swatches) : null;
      if (!roles) continue;
      for (const [, s] of roles) { const L = lstarFromRgb(hexToRgb(s.hex)); if (L < 40 || L > 60) narrowOutside++; }
    }
  }
  if (narrowOutside <= 21) FAIL("ladder-window", `negative control: narrowing the window to [40,60] found only ${narrowOutside} (expected clearly more than the real window's 21) — the predicate may not be discriminating on the bounds`);
}

// ── symmetry (C11, Q9): |up - down| <= 1e-9 L* BY CONSTRUCTION on every case (equal-compress makes
//        this trivial — up and down are literally the same computed value — but it is asserted from
//        the EMITTED l fields, not re-derived from primeSteps, so a construction bug that broke the
//        equality would still be caught), and <= 3 L* MEASURED from the actual rendered 8-bit pixels
//        (lstarFromRgb), 0 exceptions over the full sweep plus the 16 defaults. Negative control: the
//        SAME sweep run against origin/main's prime.mjs (the pre-#681 redistribute rule) must FAIL. ──
{
  let byConstructionFails = 0, measuredExceed = 0, measuredMaxAsym = 0;
  for (const c of CASES) {
    const upC = c.sw[0].l - c.sw[3].l, downC = c.sw[3].l - c.sw[6].l;
    if (Math.abs(upC - downC) > 1e-9) { byConstructionFails++; FAIL("symmetry", `${c.label}: by-construction |up-down| = ${Math.abs(upC - downC)} > 1e-9`); }
    const upPx = lstarFromRgb(c.sw[0].rgb) - lstarFromRgb(c.sw[3].rgb);
    const downPx = lstarFromRgb(c.sw[3].rgb) - lstarFromRgb(c.sw[6].rgb);
    const asym = Math.abs(upPx - downPx);
    measuredMaxAsym = Math.max(measuredMaxAsym, asym);
    if (asym > 3) { measuredExceed++; FAIL("symmetry", `${c.label}: measured pixel asymmetry ${asym.toFixed(3)} L* > 3`); }
  }
  console.log(`  symmetry (this branch): by-construction fails ${byConstructionFails}, measured exceed-3L* ${measuredExceed}/${CASES.length}, max measured asymmetry ${measuredMaxAsym.toFixed(4)} L*`);

  // Negative control: the pre-#681 redistribute rule (ticket #641), over the SAME sweep, run against
  // `test/engine/fixtures/prime-pre-681.mjs` — a FROZEN, committed copy of `src/engine/prime.mjs` as it
  // stood at `origin/main` blob `c744fb8` (commit `9195773`). Reviewer finding (first pass of this
  // gate): reading `origin/main` LIVE via `git show` at test-run time reds `npm test` twice over — in
  // PR CI (`actions/checkout@v4` on a `pull_request` event creates no `origin/main` ref) and
  // permanently on `main` after this unit's own squash-merge (the "old" module then IS the new one, so
  // `oldExceed` becomes 0 and the FAIL below would fire on every future `npm test`). A frozen fixture
  // has neither failure mode — same discipline as `d5`'s frozen hex snapshot. FAILS to demonstrate this
  // gate discriminates, not just passes.
  const oldMod = await import("./fixtures/prime-pre-681.mjs");
  let oldExceed = 0, oldMaxAsym = 0;
  for (const c of CASES) {
    const swO = oldMod.primeSwatches(c.p, c.ctl);
    const upPx = lstarFromRgb(swO[0].rgb) - lstarFromRgb(swO[3].rgb);
    const downPx = lstarFromRgb(swO[3].rgb) - lstarFromRgb(swO[6].rgb);
    const asym = Math.abs(upPx - downPx);
    oldMaxAsym = Math.max(oldMaxAsym, asym);
    if (asym > 3) oldExceed++;
  }
  console.log(`  symmetry negative control (frozen pre-#681 fixture, same sweep): exceed-3L* ${oldExceed}/${CASES.length}, max asymmetry ${oldMaxAsym.toFixed(4)} L*`);
  if (oldExceed === 0) FAIL("symmetry", `negative control: the frozen pre-#681 fixture measured 0 exceptions — expected a large non-zero count (this gate would not have caught #641's redistribute asymmetry)`);
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
for (const g of ["a", "b", "c", "gamut-ceiling", "d1", "d2a", "d3", "d4", "d5", "d6", "d2", "e", "f", "g", "h", "i", "j", "k", "ladder-window", "symmetry"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: prime-system clears all AC-050 gates");
process.exit(0);
