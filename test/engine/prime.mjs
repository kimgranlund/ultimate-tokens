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
//   1. The plan's C5 "ladder-window allow-list: 21 (expected 21)" is a property of the REAL curated
//      preset SOURCE colours (U1/U4's corpus, hex values as dark as L* 7.32) — data this branch has no
//      access to. The cusp-anchor construction's own L* range is [32, 96] (measured, both hue spaces,
//      1-degree sweep) — comfortably inside the ladder window — so THIS branch's own `ladder-window`
//      gate honestly reports 0. Once U1 lands and this unit rebases onto a source-anchored corpus, that
//      gate must be extended to iterate the corpus too; see .sdlc/handoffs/pif-u6.md.
//   2. The plan/dispatch names Tertiary, Danger, Warning as the three defaults that clip at STEP_L 9,
//      with spans 52.8 / 49.9 / 46.3 L* — computed against U1's Q2(b) minted stop-550-hex anchors.
//      Measured against THIS branch's cusp anchors, Tertiary and Danger do not clip at all (span 54
//      exactly) and Warning clips to 45.77, not 46.3 — a different set entirely (Secondary, Info,
//      Success, Warning, Data 1, Data 4, Data 5, Data 6, Data 7 clip; see the `clipped defaults` gate
//      below). This is flagged in .sdlc/questions/pif-u6.md rather than silently adopted either way.
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { primeSwatches, primeSteps, PRIME_STEPS, PRIME_L_MIN, PRIME_L_MAX, STEP_L } from "../../src/engine/prime.mjs";
import { peakC, hctToRgb, maxChromaInGamut, cam16FromRgb, lstarFromRgb } from "../../src/engine/hct.js";
import { effHue, DEFAULT_CONTROLS } from "../../src/engine/tonal.js";

const REPO_ROOT = new URL("../../", import.meta.url);
const RT = JSON.parse(readFileSync(new URL("docs/reference/data/role-table.json", REPO_ROOT), "utf8"));
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

// ── (c) inGamut true for every entry, primeChroma x chroma in {0,50,100}^2, every default ──
for (const p of DEFAULTS) {
  for (const primeChroma of [0, 50, 100]) {
    for (const chroma of [0, 50, 100]) {
      const sw = primeSwatches({ ...p, chroma }, { ...CTL, primeChroma });
      for (const s of sw) if (s.inGamut !== true) FAIL("c", `${p.name} chroma${chroma} primeChroma${primeChroma} ${s.step}: inGamut ${s.inGamut}`);
    }
  }
}

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
//      OWN construction, commit 766478b ("feat(prime): ladder steps equally in perceived CIE L*, held
//      CAM16 chroma (#681 U6)", `unit/pif-u6-ladder`). Frozen
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

// ── ladder-window: prints the allow-list of CASES whose cusp anchor falls outside
//        [PRIME_L_MIN, PRIME_L_MAX] — expected 0 on THIS branch (see the U6 SCOPE NOTE at the top of
//        this file: the plan's 21-name corpus list needs U1's source-anchored data, not available
//        here). Negative control: with the window narrowed to exclude the sweep's own measured range
//        (a synthetic [40, 60] window), the same predicate finds a large, non-zero count — proving the
//        predicate itself discriminates rather than being vacuously always-0.
let LADDER_WINDOW_ALLOWLIST;
{
  const outside = CASES.filter((c) => !c.inBounds).map((c) => c.label);
  LADDER_WINDOW_ALLOWLIST = outside;
  console.log(`  ladder-window allow-list: ${outside.length} (expected 0 on this branch; U1's source corpus is out of scope here — see .sdlc/handoffs/pif-u6.md)`);
  if (outside.length !== 0) FAIL("ladder-window", `${outside.length} case(s) outside the ladder window: ${outside.slice(0, 5).join(", ")}${outside.length > 5 ? "…" : ""}`);
  // negative control: a synthetic narrow window must find violations, proving the filter isn't vacuous
  const narrowOutside = CASES.filter((c) => c.lPrime < 40 || c.lPrime > 60).length;
  if (narrowOutside === 0) FAIL("ladder-window", "negative control: narrowing the window to [40,60] found 0 out-of-window cases — the predicate is vacuous");
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

  // Negative control: origin/main's prime.mjs (pre-#681, the #641 redistribute rule) over the SAME
  // sweep, run out-of-process against a temp copy whose imports are rewritten to this worktree's own
  // (unchanged) hct.js/okhsl.js/tonal.js. FAILS to demonstrate this gate discriminates, not just passes.
  let oldExceed = null, oldMaxAsym = null, controlError = null;
  const tmp = mkdtempSync(join(tmpdir(), "pif-u6-negctl-"));
  try {
    const mainSrc = execFileSync("git", ["show", "origin/main:src/engine/prime.mjs"], { cwd: new URL(".", REPO_ROOT).pathname, encoding: "utf8" });
    const hctPath = new URL("src/engine/hct.js", REPO_ROOT).pathname;
    const okhslPath = new URL("src/engine/okhsl.js", REPO_ROOT).pathname;
    const tonalPath = new URL("src/engine/tonal.js", REPO_ROOT).pathname;
    const rewritten = mainSrc
      .replace('from "./hct.js"', `from ${JSON.stringify(hctPath)}`)
      .replace('from "./okhsl.js"', `from ${JSON.stringify(okhslPath)}`)
      .replace('from "./tonal.js"', `from ${JSON.stringify(tonalPath)}`);
    const tmpFile = join(tmp, "prime-main.mjs");
    writeFileSync(tmpFile, rewritten);
    const oldMod = await import(`file://${tmpFile}`);
    oldExceed = 0; oldMaxAsym = 0;
    for (const c of CASES) {
      const swO = oldMod.primeSwatches(c.p, c.ctl);
      const upPx = lstarFromRgb(swO[0].rgb) - lstarFromRgb(swO[3].rgb);
      const downPx = lstarFromRgb(swO[3].rgb) - lstarFromRgb(swO[6].rgb);
      const asym = Math.abs(upPx - downPx);
      oldMaxAsym = Math.max(oldMaxAsym, asym);
      if (asym > 3) oldExceed++;
    }
  } catch (e) {
    controlError = e.message;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  if (controlError) {
    FAIL("symmetry", `negative control could not run against origin/main: ${controlError}`);
  } else {
    console.log(`  symmetry negative control (origin/main prime.mjs, same sweep): exceed-3L* ${oldExceed}/${CASES.length}, max asymmetry ${oldMaxAsym.toFixed(4)} L*`);
    if (oldExceed === 0) FAIL("symmetry", `negative control: origin/main's prime.mjs measured 0 exceptions — expected a large non-zero count (this gate would not have caught #641's redistribute asymmetry)`);
  }
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
for (const g of ["a", "b", "c", "d1", "d2a", "d3", "d4", "d5", "d6", "d2", "e", "f", "g", "h", "i", "j", "k", "ladder-window", "symmetry"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: prime-system clears all AC-050 gates");
process.exit(0);
