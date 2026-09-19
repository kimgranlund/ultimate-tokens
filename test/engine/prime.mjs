#!/usr/bin/env node
// prime.mjs (test) — AC-050 verifier for src/engine/prime.mjs (SPEC spec-muted-base-key-spikes 0.2.0,
// REQ-050..053a/056). Every gate re-derives its own expectation independently from the SPEC's own
// formulas (peakC/okhslLAt/effHue are pre-existing, separately-validated engine primitives — never
// calling back into primeSwatches's own internals) or measures emitted pixels, per the SPEC's own
// "Agent verification" anti-tautology note for this file.
import { readFileSync } from "node:fs";
import { primeSwatches, primeSteps, PRIME_STEPS, PRIME_STEP, PRIME_L_MIN, PRIME_L_MAX } from "../../src/engine/prime.mjs";
import { peakC, hctToRgb } from "../../src/engine/hct.js";
import { effHue, DEFAULT_CONTROLS } from "../../src/engine/tonal.js";
import { rgbToOklchHue, rgbToOkhsl } from "../../src/engine/okhsl.js";
import { gateReport } from "../gate-report.mjs";

const RT = JSON.parse(readFileSync(new URL("../../docs/reference/data/role-table.json", import.meta.url), "utf8"));
const DEFAULTS = RT.defaults; // the 16 default palettes {name,hue,chroma,skew,lift,on}
// hueSpace "cam16": role-table.json's hue numbers ARE CAM16 hues (the raw, un-converted seeds
// defaultDocument() maps through camHueToOklch before storing) — `CTL` pins cam16 so effHue passes
// them straight through, exactly as test/engine/tonal.mjs's own DEFAULTS convention does, and so
// EX-4/EX-4b/EX-5's literal worked numbers (written against these same hue/chroma pairs) reproduce.
// prime.mjs's own hue is `key.h` directly (no re-solve, conductor ruling 2026-09-11), so no gate is
// hueSpace-BRANCHED — but the two spaces feed effHue different hues, so they reach different cusp
// tones and different `l_prime` values, and the PRODUCT default is oklch (`tonal.js` DEFAULT_CONTROLS).
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
// quantum — the AC-005 precedent (PR #509, test/engine/tonal.mjs): the largest OKLCH-hue swing a
// single 8-bit RGB step (±1 in any one channel) produces at this exact pixel. A hue budget compared
// against pixels measured through 8-bit rounding must scale with this, or it's unreachable at low
// measured chroma by construction (ticket #537 Findings) — not a defect, a rounding floor.
const quantum = (rgb) => {
  const h0 = rgbToOklchHue(rgb);
  let m = 0;
  for (let c = 0; c < 3; c++) for (const d of [-1, 1]) {
    const r = [...rgb]; r[c] = Math.min(255, Math.max(0, r[c] + d));
    m = Math.max(m, angDiff(rgbToOklchHue(r), h0));
  }
  return m;
};
const hueTol = (rgb) => Math.max(0.5, 2 * quantum(rgb));

// lPrimeOf — independent re-derivation of REQ-051's l_prime (post-ruling: the REAL chromatic key
// colour's own OKHSL lightness, matching deriveKeyColor's construction), from pre-existing engine
// primitives (effHue/peakC/hctToRgb/rgbToOkhsl), never from primeSwatches itself.
function lPrimeOf(hue, chroma, hueSpace) {
  const baseHue = effHue(hue, hueSpace, (chroma ?? 0) / 100);
  const pk = peakC(baseHue);
  const keyChroma = ((chroma ?? 0) / 100) * pk.c;
  const key = rgbToOkhsl(hctToRgb(baseHue, keyChroma, pk.tone).rgb);
  return { lPrime: key.l, key, pk, baseHue };
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

// ── (b) l strictly decreasing, every l within [PRIME_L_MIN, PRIME_L_MAX] (1e-9 tol) ────────
for (const p of DEFAULTS) {
  const sw = primeSwatches(p, CTL);
  for (let i = 0; i < sw.length; i++) {
    if (sw[i].l < PRIME_L_MIN - 1e-9 || sw[i].l > PRIME_L_MAX + 1e-9) FAIL("b", `${p.name} ${sw[i].step}: l ${sw[i].l} outside [${PRIME_L_MIN},${PRIME_L_MAX}]`);
    if (i > 0 && sw[i].l >= sw[i - 1].l) FAIL("b", `${p.name}: l not strictly decreasing at ${sw[i].step} (${sw[i - 1].l} -> ${sw[i].l})`);
  }
}

// ── (c) inGamut true for every entry, primeChroma x chroma in {0,50,100}^2, every default ──
for (const p of DEFAULTS) {
  for (const primeChroma of [0, 50, 100]) {
    for (const chroma of [0, 50, 100]) {
      const sw = primeSwatches({ ...p, chroma }, { ...CTL, primeChroma });
      for (const s of sw) if (s.inGamut !== true) FAIL("c", `${p.name} chroma${chroma} primeChroma${primeChroma} ${s.step}: inGamut ${s.inGamut}`);
    }
  }
}

// ── (d) REQ-051 (amended 2026-09-17, #641): the ladder spans a FULL 6 x PRIME_STEP at every hue and
//        chroma — a side clipped by a bound hands its lost travel to the other side, which stays even
//        within itself — and PRIME_L_MAX 0.97 (raised from 0.94, #655 folded in) is above the cusp
//        construction's own reach, so no anchor is ever outside the window. Every gate below states a
//        PROPERTY the SPEC asserts; none re-implements primeSteps's own expression, so a fitted
//        formula cannot satisfy them by mirroring. All of (d) runs over BOTH hue spaces. ───────────
const SPAN = 6 * PRIME_STEP;
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
// each case's independently re-derived anchor and per-side ROOM (from lPrimeOf, never primeSteps)
for (const c of CASES) {
  c.lPrime = lPrimeOf(c.p.hue, c.p.chroma, c.hueSpace).lPrime;
  c.roomUp = (PRIME_L_MAX - c.lPrime) / 3;
  c.roomDown = (c.lPrime - PRIME_L_MIN) / 3;
  c.inBounds = c.lPrime >= PRIME_L_MIN && c.lPrime <= PRIME_L_MAX;
  c.sw = primeSwatches(c.p, c.ctl);
}
if (CASES.length < 2 * (16 + 72 * 3)) FAIL("d1", `CASES built only ${CASES.length} cases — the sweep did not run`);

// (d1) span floor: brightest - dimmest === 6 * PRIME_STEP EXACTLY (1e-9), for every case whose anchor
//      is in bounds. This is the ticket's whole point — before #641 the span COLLAPSED toward 0.28
//      wherever the cusp tone sat near a bound, and 200-plus of the sweep's hues fell short at every
//      chroma. The in-bounds condition is not an escape hatch: (d4) separately asserts that NO case
//      is out of bounds, so every case must satisfy this. If an anchor ever were outside the window,
//      or so extreme that BOTH sides clip, the span cannot be honoured and the guard caps it instead;
//      that case must degrade to a SHORTER span, never a longer one or an inverted ladder.
for (const c of CASES) {
  const span = c.sw[0].l - c.sw[6].l;
  const bothClip = c.roomUp < PRIME_STEP && c.roomDown < PRIME_STEP;
  if (c.inBounds && !bothClip) {
    if (Math.abs(span - SPAN) > 1e-9) FAIL("d1", `${c.label}: span ${span.toFixed(6)} != 6 x PRIME_STEP ${SPAN} (short by ${(SPAN - span).toFixed(6)})`);
  } else if (span > SPAN + 1e-9) {
    FAIL("d1", `${c.label}: span ${span.toFixed(6)} EXCEEDS ${SPAN} with an out-of-window or doubly-clipped anchor (${c.lPrime})`);
  }
}

// (d2a) anchor: `prime`'s l IS the key colour's own OKHSL lightness (REQ-056's mechanism — the
//       redistribution and the raised ceiling must never move the anchor, which is what rules out a
//       PRIME_L_MAX bias on the anchor itself). Its own gate key (#641 round-2 F7).
for (const c of CASES) {
  if (Math.abs(c.sw[3].l - c.lPrime) > 1e-12) FAIL("d2a", `${c.label}: anchor l ${c.sw[3].l} != key.l ${c.lPrime}`);
}

// (d3) even PER SIDE: the three consecutive l differences are equal to each other on the light side
//      and equal to each other on the dark side (skew 0). The two sides need NOT match — that is the
//      amendment. Both step sizes strictly positive, unconditionally: with PRIME_L_MAX 0.97 there is
//      no anchor for which a side has zero room (min up across the full sweep is 0.0039).
for (const c of CASES) {
  const upObs = [c.sw[2].l - c.sw[3].l, c.sw[1].l - c.sw[2].l, c.sw[0].l - c.sw[1].l];
  const downObs = [c.sw[3].l - c.sw[4].l, c.sw[4].l - c.sw[5].l, c.sw[5].l - c.sw[6].l];
  for (const v of upObs) if (Math.abs(v - upObs[0]) > 1e-9) FAIL("d3", `${c.label}: light-side steps uneven ${upObs.map((x) => x.toFixed(9)).join("/")}`);
  for (const v of downObs) if (Math.abs(v - downObs[0]) > 1e-9) FAIL("d3", `${c.label}: dark-side steps uneven ${downObs.map((x) => x.toFixed(9)).join("/")}`);
  if (!(upObs[0] > 0 && downObs[0] > 0)) FAIL("d3", `${c.label}: a side has a non-positive step (up ${upObs[0]}, down ${downObs[0]}), anchor ${c.lPrime}`);
}
// primeSteps's own algebraic contract, at hand-computed anchors (no engine call, no mirrored
// expression): centre takes both full steps; a high anchor hands its shortfall down, a low one up;
// and an anchor OUTSIDE the window is floored at zero travel, never negative (#641 round-2 F1 guard).
for (const [lP, expUp, expDown] of [
  [0.55, 0.09, 0.09],
  [0.93, (PRIME_L_MAX - 0.93) / 3, 0.09 + (0.09 - (PRIME_L_MAX - 0.93) / 3)],
  [0.20, 0.09 + (0.09 - 0.02), 0.02],
  [PRIME_L_MAX + 0.01, 0, 0.18],          // above the ceiling: no light travel, never negative
  [PRIME_L_MIN - 0.01, 0.18, 0],          // below the floor: no dark travel, never negative
]) {
  const { up, down } = primeSteps(lP);
  if (Math.abs(up - expUp) > 1e-12 || Math.abs(down - expDown) > 1e-12) FAIL("d3", `primeSteps(${lP}) = {up ${up}, down ${down}}, expected {up ${expUp}, down ${expDown}}`);
  if (up < 0 || down < 0) FAIL("d3", `primeSteps(${lP}) returned negative travel {up ${up}, down ${down}} — the Math.max(0, ...) guard is gone`);
}

// (d4) bounds and order, unconditionally — plus the #655 gate: ZERO anchors outside the window, over
//      the whole sweep in BOTH hue spaces. Under the old 0.94 ceiling this was NOT true: the cusp
//      construction reaches l_prime 0.961183, so yellow-green hues (cam16 108..122, oklch 96..114)
//      put `prime` itself out of bounds and the light side INVERTED. 0.97 clears that reach.
{
  const oob = CASES.filter((c) => !c.inBounds);
  if (oob.length) FAIL("d4", `${oob.length} case(s) with an anchor outside [${PRIME_L_MIN},${PRIME_L_MAX}], e.g. ${oob[0].label} l_prime ${oob[0].lPrime} — PRIME_L_MAX no longer clears the cusp construction's reach (#655)`);
}
for (const c of CASES) {
  for (let i = 0; i < 7; i++) {
    if (c.sw[i].l < PRIME_L_MIN - 1e-9 || c.sw[i].l > PRIME_L_MAX + 1e-9) FAIL("d4", `${c.label} ${c.sw[i].step}: l ${c.sw[i].l} outside [${PRIME_L_MIN},${PRIME_L_MAX}]`);
    if (i > 0 && c.sw[i].l >= c.sw[i - 1].l) FAIL("d4", `${c.label}: l not strictly decreasing at ${c.sw[i].step} (${c.sw[i - 1].l} -> ${c.sw[i].l})`);
  }
}

// (d5) unclipped byte-identity: a FROZEN snapshot of the defaults whose anchor needs no
//      redistribution AND never touched either bound, captured from origin/main @ 1b2c750 BEFORE
//      #641 (`git show origin/main:src/engine/prime.mjs`, run against these same DEFAULTS + CTL).
//      Frozen literals, so the check is independent of the present implementation by construction.
//      cam16, the space they were captured in. NOTE: six, not the four the #641 brief named — Data 2
//      and Data 3 are unclipped too (measured). Data 8 is NOT here: it is unclipped under the raised
//      0.97 ceiling but was light-clipped under 0.94, so its hexes legitimately moved.
const FROZEN = {
  "Neutral": ["#BDC4D6", "#9DA7BF", "#838EA9", "#717C97", "#566078", "#434C60", "#333A4B"],
  "Primary": ["#A5C8FE", "#74AAFD", "#468DFB", "#2177F6", "#0D5BC8", "#0748A2", "#04377F"],
  "Tertiary": ["#C3ACD1", "#A98DBB", "#9173A3", "#7F6290", "#61486F", "#4A3656", "#36273F"],
  "Danger": ["#F7B8AD", "#F08E7E", "#E26958", "#D05444", "#A73D30", "#882F24", "#6C231B"],
  "Data 2": ["#FCD1FD", "#F9A5FC", "#F473FB", "#EC25F8", "#CB0ED6", "#A904B2", "#87028E"],
  "Data 3": ["#FFC1C0", "#FE9A9B", "#FE6C73", "#FB2049", "#D5103A", "#AE092D", "#870521"],
};
for (const [name, hexes] of Object.entries(FROZEN)) {
  const p = DEFAULTS.find((d) => d.name === name);
  if (!p) { FAIL("d5", `frozen palette ${name} missing from role-table defaults`); continue; }
  const got = primeSwatches(p, CTL).map((s) => s.hex);
  for (let i = 0; i < 7; i++) if (got[i] !== hexes[i]) FAIL("d5", `${name} ${PRIME_STEPS[i]}: ${got[i]} != frozen pre-#641 ${hexes[i]} — an UNCLIPPED palette must be byte-identical`);
}

// (d6) clipped-side fill: a clipped side runs right up to its bound, and the OTHER side's step is
//      whatever the span still owes, derived here from that bound and key.l ALONE — never from
//      primeSteps. Which defaults are clipped depends on PRIME_L_MAX, so the sets are DERIVED, and
//      asserted non-empty on both sides so the gate cannot go vacuous if the constant moves again.
{
  let nLight = 0, nDark = 0;
  for (const c of CASES.filter((x) => DEFAULTS.some((d) => d.name === x.p.name))) {
    if (c.roomUp < PRIME_STEP && c.roomDown >= PRIME_STEP) {
      nLight++;
      if (Math.abs(c.sw[0].l - PRIME_L_MAX) > 1e-9) FAIL("d6", `${c.label}: brightest l ${c.sw[0].l} != PRIME_L_MAX ${PRIME_L_MAX} (clipped side must fill to the bound)`);
      const expDown = (SPAN - 3 * c.roomUp) / 3;
      const gotDown = c.sw[3].l - c.sw[4].l;
      if (Math.abs(gotDown - expDown) > 1e-9) FAIL("d6", `${c.label}: dark step ${gotDown} != owed ${expDown}`);
    } else if (c.roomDown < PRIME_STEP && c.roomUp >= PRIME_STEP) {
      nDark++;
      if (Math.abs(c.sw[6].l - PRIME_L_MIN) > 1e-9) FAIL("d6", `${c.label}: dimmest l ${c.sw[6].l} != PRIME_L_MIN ${PRIME_L_MIN}`);
      const expUp = (SPAN - 3 * c.roomDown) / 3;
      const gotUp = c.sw[2].l - c.sw[3].l;
      if (Math.abs(gotUp - expUp) > 1e-9) FAIL("d6", `${c.label}: light step ${gotUp} != owed ${expUp}`);
    }
  }
  if (nLight === 0) FAIL("d6", "no light-clipped default found — this gate has gone vacuous");
  if (nDark === 0) FAIL("d6", "no dark-clipped default found — this gate has gone vacuous");
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
    // (Amended #641: the two sides may differ, so each must use its own extent.)
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

// ── (e) prime's pixel hue == deriveKeyColor's pixel hue (an identity — REQ-053 superseded 2026-09-11:
//        the hue anchor IS the key colour's own measured hue now, no re-solve; gate (h) already covers
//        the RGB match, this is its own assertion per the ruling). The other six ladder swatches are
//        within max(0.5°, 2 hue-quanta at their OWN measured pixel) of PRIME's pixel hue, hueShift 0 ──
for (const p of DEFAULTS) {
  const sw = primeSwatches({ ...p, hueShift: 0 }, CTL);
  const keyRgb = deriveKeyRgb(p, CTL.hueSpace);
  const primeHue = rgbToOklchHue(sw[3].rgb);
  const keyHue = rgbToOklchHue(keyRgb);
  const tolPrime = hueTol(sw[3].rgb);
  if (angDiff(primeHue, keyHue) > tolPrime) FAIL("e", `${p.name}: prime pixel hue ${primeHue.toFixed(3)} vs deriveKeyColor pixel hue ${keyHue.toFixed(3)} (> ${tolPrime.toFixed(3)}°)`);
  for (const s of sw) {
    if (s.step === "prime") continue;
    const h = rgbToOklchHue(s.rgb);
    const tol = hueTol(s.rgb);
    if (angDiff(h, primeHue) > tol) FAIL("e", `${p.name} ${s.step}: hue ${h.toFixed(3)} vs prime pixel hue ${primeHue.toFixed(3)} (> ${tol.toFixed(3)}°)`);
  }
}

// ── (f) hueShift 20: brightest/dimmest move -20°/+20° from their own hueShift-0 hue (within the same
//        adaptive budget); prime stays invariant (hueShift's dir is 0 at t=0, never touches it) ─────
for (const p of DEFAULTS) {
  const sw0 = primeSwatches({ ...p, hueShift: 0 }, CTL);
  const swS = primeSwatches({ ...p, hueShift: 20 }, CTL);

  const primeHue0 = rgbToOklchHue(sw0[3].rgb), primeHueS = rgbToOklchHue(swS[3].rgb);
  const tolPrime = hueTol(swS[3].rgb);
  if (angDiff(primeHueS, primeHue0) > tolPrime) FAIL("f", `${p.name}: prime hue moved under hueShift 20 (should be invariant)`);

  const b0 = rgbToOklchHue(sw0[0].rgb), bS = rgbToOklchHue(swS[0].rgb), targetB = norm(b0 - 20), tolB = hueTol(swS[0].rgb);
  if (angDiff(bS, targetB) > tolB) FAIL("f", `${p.name} brightest: hue ${bS.toFixed(3)} vs base-20 target ${targetB.toFixed(3)} (> ${tolB.toFixed(3)}°)`);

  const d0 = rgbToOklchHue(sw0[6].rgb), dS = rgbToOklchHue(swS[6].rgb), targetD = norm(d0 + 20), tolD = hueTol(swS[6].rgb);
  if (angDiff(dS, targetD) > tolD) FAIL("f", `${p.name} dimmest: hue ${dS.toFixed(3)} vs base+20 target ${targetD.toFixed(3)} (> ${tolD.toFixed(3)}°)`);
}

// ── (g) s scales linearly with primeChroma: ratio of measured s at 50 vs 100 == 0.5 (±0.02),
//        an UNCLAMPED probe (Primary, chroma 95 < 100, so s never saturates at 1) ──────────
{
  const s100 = primeSwatches(PRIMARY, { ...CTL, primeChroma: 100 })[3].s;
  const s50 = primeSwatches(PRIMARY, { ...CTL, primeChroma: 50 })[3].s;
  const ratio = s50 / s100;
  if (Math.abs(ratio - 0.5) > 0.02) FAIL("g", `Primary: measured s ratio (primeChroma 50/100) = ${ratio.toFixed(4)}, expected ~0.5`);
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

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
// The printed set is this declared list UNION every gate name that actually reached a FAIL(...)
// call (#699, following #695's pattern in test/engine/tonal.mjs), so a gate missing from the list
// below still shows up, loudly, instead of hiding behind a neighbouring gate's "pass" row.
const DECLARED = ["a", "b", "c", "d1", "d2a", "d3", "d4", "d5", "d6", "d2", "e", "f", "g", "h", "i", "j", "report-static"];
gateReport({ fails, declared: DECLARED, selfUrl: import.meta.url, FAIL });
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: prime-system clears all AC-050 gates");
process.exit(0);
