#!/usr/bin/env node
// prime.mjs (test) — AC-050 verifier for src/engine/prime.mjs (SPEC spec-muted-base-key-spikes 0.2.0,
// REQ-050..053a/056). Every gate re-derives its own expectation independently from the SPEC's own
// formulas (peakC/okhslLAt/effHue are pre-existing, separately-validated engine primitives — never
// calling back into primeSwatches's own internals) or measures emitted pixels, per the SPEC's own
// "Agent verification" anti-tautology note for this file.
import { readFileSync } from "node:fs";
import { primeSwatches, PRIME_STEPS, PRIME_STEP, PRIME_L_MIN, PRIME_L_MAX } from "../../src/engine/prime.mjs";
import { peakC, hctToRgb } from "../../src/engine/hct.js";
import { effHue, DEFAULT_CONTROLS } from "../../src/engine/tonal.js";
import { rgbToOklchHue, rgbToOkhsl } from "../../src/engine/okhsl.js";

const RT = JSON.parse(readFileSync(new URL("../../docs/reference/data/role-table.json", import.meta.url), "utf8"));
const DEFAULTS = RT.defaults; // the 16 default palettes {name,hue,chroma,skew,lift,on}
// hueSpace "cam16": role-table.json's hue numbers ARE CAM16 hues (the raw, un-converted seeds
// defaultDocument() maps through camHueToOklch before storing) — pin cam16 here so effHue passes
// them straight through, exactly as test/engine/tonal.mjs's own DEFAULTS convention does, and so
// EX-4/EX-4b/EX-5's literal worked numbers (written against these same hue/chroma pairs) reproduce.
// prime.mjs's own hue is `key.h` directly (no re-solve, conductor ruling 2026-09-11), so nothing in
// this file is hueSpace-branch-specific any more — one CTL covers every gate.
const CTL = { ...DEFAULT_CONTROLS, hueSpace: "cam16" };
const PRIMARY = DEFAULTS.find((d) => d.name === "Primary");
const WARNING = DEFAULTS.find((d) => d.name === "Warning");

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

// ── (d) up/down re-derived independently from l_prime, equal observed step sizes (skew 0) ──
// EX-4 (Primary): uncompressed, up === down === PRIME_STEP. EX-5 (Warning): edge-compressed.
{
  const { lPrime } = lPrimeOf(PRIMARY.hue, PRIMARY.chroma, CTL.hueSpace);
  const up = Math.min(PRIME_STEP, (PRIME_L_MAX - lPrime) / 3), down = Math.min(PRIME_STEP, (lPrime - PRIME_L_MIN) / 3);
  if (Math.abs(up - PRIME_STEP) > 1e-9 || Math.abs(down - PRIME_STEP) > 1e-9) FAIL("d", `Primary (EX-4) expected uncompressed up=down=${PRIME_STEP}, got up=${up} down=${down}`);
}
{
  const { lPrime } = lPrimeOf(WARNING.hue, WARNING.chroma, CTL.hueSpace);
  const up = Math.min(PRIME_STEP, (PRIME_L_MAX - lPrime) / 3), down = Math.min(PRIME_STEP, (lPrime - PRIME_L_MIN) / 3);
  if (!(up < PRIME_STEP - 1e-9 || down < PRIME_STEP - 1e-9)) FAIL("d", `Warning (EX-5) expected an edge-compressed bound, got up=${up} down=${down}`);
}
for (const [p, label] of [[PRIMARY, "Primary (EX-4)"], [WARNING, "Warning (EX-5)"]]) {
  const pal = { ...p, skew: 0 };
  const sw = primeSwatches(pal, CTL);
  const { lPrime } = lPrimeOf(pal.hue, pal.chroma, CTL.hueSpace);
  const up = Math.min(PRIME_STEP, (PRIME_L_MAX - lPrime) / 3), down = Math.min(PRIME_STEP, (lPrime - PRIME_L_MIN) / 3);
  // at skew 0, w=|t| exactly, so consecutive l differences equal up/down exactly (REQ-051's "even ladder")
  const upObs = [sw[2].l - sw[3].l, sw[1].l - sw[2].l, sw[0].l - sw[1].l];
  const downObs = [sw[3].l - sw[4].l, sw[4].l - sw[5].l, sw[5].l - sw[6].l];
  for (const v of upObs) if (Math.abs(v - up) > 1e-9) FAIL("d", `${label}: observed light step ${v} != re-derived up ${up}`);
  for (const v of downObs) if (Math.abs(v - down) > 1e-9) FAIL("d", `${label}: observed dark step ${v} != re-derived down ${down}`);
}

// ── (d2) skew gamma (REQ-053a): monotone/bounds, end+prime invariance, weight re-derivation,
//        skew0 weights == |t|, and direction vs the skew-0 baseline, for every default palette ──
{
  const SKEWS = [-100, -60, -20, 0, 20, 60, 100];
  for (const p of DEFAULTS) {
    const { lPrime } = lPrimeOf(p.hue, p.chroma, CTL.hueSpace);
    const up = Math.min(PRIME_STEP, (PRIME_L_MAX - lPrime) / 3), down = Math.min(PRIME_STEP, (lPrime - PRIME_L_MIN) / 3);
    const base0 = primeSwatches({ ...p, skew: 0 }, CTL);
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
for (const g of ["a", "b", "c", "d", "d2", "e", "f", "g", "h", "i", "j"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: prime-system clears all AC-050 gates");
process.exit(0);
