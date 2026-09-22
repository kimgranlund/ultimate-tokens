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
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { primeSwatches, primeSteps, PRIME_STEPS, PRIME_L_MIN, PRIME_L_MAX, STEP_L } from "../../src/engine/prime.mjs";
import { peakC, hctToRgb, maxChromaInGamut, cam16FromRgb, lstarFromRgb } from "../../src/engine/hct.js";
import { effHue, DEFAULT_CONTROLS } from "../../src/engine/tonal.js";
import { gateReport } from "../gate-report.mjs";

// #681 U4 integration: U6 was dispatched standalone (team-lead, 2026-09-18) and its own SCOPE NOTE
// above predates U1 landing, so its DEFAULTS read `RT.defaults` unstripped — now the correct fixture,
// since U1 HAS landed (Q2 (b) minted the 16 default-kit anchors) and this file's d5/d6/g gates need to
// verify the REAL anchored default kit, not a stripped-`anchor` fixture that no longer matches what
// role-table.json (or the shipped engine) actually carries.
const REPO_ROOT = new URL("../../", import.meta.url);
const RT = JSON.parse(readFileSync(new URL("docs/reference/data/role-table.json", REPO_ROOT), "utf8"));
const CATEGORIES_DIR = new URL("docs/reference/colors/categories/", REPO_ROOT);
const hexToRgb = (hex) => { const h = String(hex).replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const DEFAULTS = RT.defaults; // the 16 default palettes {name,hue,chroma,skew,lift,on,anchor}
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

// ANCHOR_HEX — mirrors src/engine/prime.mjs's own anchor-detection regex exactly (prime.mjs:91),
// so this file's independent re-derivation classifies a palette anchored/non-anchored identically
// to the code under test, without importing prime.mjs's internal constant.
const ANCHOR_HEX = /^#[0-9A-Fa-f]{6}$/;
const isAnchored = (p) => typeof p.anchor === "string" && ANCHOR_HEX.test(p.anchor);

// keyOf — independent re-derivation of the ladder anchor's CIE L*/chroma/hue, from pre-existing
// engine primitives (effHue/peakC/lstarFromRgb/cam16FromRgb), never from primeSwatches itself.
// #681 U4 integration: this branch (unit/pif-u6-ladder) was dispatched standalone, before U1's
// `anchor` field landed — its original `lPrimeOf(hue, chroma, hueSpace)` only ever re-derived the
// non-anchored cusp-identity path (`pk.tone`). Now that U1 has landed and DEFAULTS carries all 16
// real anchors (role-table.json), the same construction primeSwatches uses (prime.mjs:137-160) must
// be re-derived here too: an anchored palette's ladder pivots on the ANCHOR's own measured CIE L*
// (`lstarFromRgb`, exact — `pk.tone` IS this by construction, see the note below) and CAM16
// chroma/hue (`cam16FromRgb`), not on `effHue`/`peakC` at all. `lPrime` is the anchor's raw,
// UNCLAMPED tone (what the prime rung itself emits — d2a); `lLadder` is that value clamped into
// [PRIME_L_MIN, PRIME_L_MAX] (what primeSwatches feeds `primeSteps` to size the room on each side —
// d1/d6). For a non-anchored palette the two are identical, since `peakC`'s own cusp-tone search
// never leaves the window (see (d4)'s comment). `pk.tone` IS the key colour's own CIE L* by
// construction — hctToRgb's `tone` argument converges to that exact L* (its internal binary search
// targets `lFromY(...) === tone`) — so no OKHSL round trip is needed to read it (#681 U6; the
// pre-#681 gate read this off `rgbToOkhsl(keyRgb).l`, a DIFFERENT perceptual scale that happened to
// bound the old OKHSL-domain ladder, not this one).
function keyOf(p, hueSpace) {
  if (isAnchored(p)) {
    const anchorRgb = hexToRgb(p.anchor);
    const cam = cam16FromRgb(anchorRgb);
    const lPrime = lstarFromRgb(anchorRgb);
    const lLadder = Math.min(PRIME_L_MAX, Math.max(PRIME_L_MIN, lPrime));
    return { lPrime, lLadder, keyChroma: cam.chroma, baseHue: cam.hue, anchored: true, anchorRgb };
  }
  const baseHue = effHue(p.hue, hueSpace, (p.chroma ?? 0) / 100);
  const pk = peakC(baseHue);
  const keyChroma = ((p.chroma ?? 0) / 100) * pk.c;
  return { lPrime: pk.tone, lLadder: pk.tone, keyChroma, baseHue, pk, anchored: false };
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
// GAMUT_SWEEP — gate (c)'s own broad correctness sweep (review pass 1, S3), independent of the
// `gamut-ceiling` gate below (review pass 3 finding: this used to run at hue step 1, purely to match
// what was believed to be the reviewer's own reproduction denominator for the ceiling gate — that
// premise was wrong (their sweep uses 4 hueShifts x 5 chromas, this one 5 x 4; the 302,400 totals
// coincided by accident), so gate (c) reverts to its review-pass-1-approved, cheaper step-3 resolution;
// `gamut-ceiling` below now runs its OWN separately-scaled sweep).
const GAMUT_SWEEP = { checked: 0, violations: [] };
for (const hueSpace of SPACES) {
  for (let hue = 0; hue < 360; hue += 3) {
    for (const chroma of [0, 25, 50, 75, 100]) {
      for (const hueShift of [0, 10, -10, 20, -20]) {
        for (const skew of [0, 40, -40]) {
          GAMUT_SWEEP.checked++;
          const sw = primeSwatches({ name: `h${hue}`, hue, chroma, hueShift, skew }, { hueSpace });
          for (const s of sw) {
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

// ── (determinism, folded into gate "c") — REBUILT (#686, #681 U6 review passes 4-5, findings N7/N8).
//    The PRIOR version of this gate ran entirely in-process: render, THEN poison, THEN re-render. By
//    the second render every memo the poison was meant to corrupt was already warm from the FIRST
//    render, so the gate could only ever read 0 mismatches regardless of whether the engine was
//    actually order-dependent (review pass 4 finding N7). Its poison was also a synthetic 0.1deg grid,
//    which only ever fills the truncation buckets whose second decimal is zero — about a tenth of the
//    space hct.js's OLD `hue.toFixed(2)` keys actually spanned — while a real palette render (what a
//    corpus generator or the live editor actually does) is the realistic poisoner and is what found the
//    surviving channel (`oklchToCam16Hue`'s Newton loop reading hct.js's shared `peakC` through
//    `effHue`'s oklch path, 11/4,000 order-dependent palettes on the pre-hct.js-fix head, review pass 4;
//    the reviewer's OWN discovery of REQ-056's anchor divergence, N8, traced to the identical cause).
//
//    Node's own ES module cache makes "two cold imports in one process" impossible to fake: re-importing
//    "../../src/engine/prime.mjs" even under a cache-busting query on its own URL still resolves
//    "./hct.js" to the SAME already-instantiated module, so hct.js's module-level `_mc`/`_pk`/`_oh`
//    caches survive across "fresh" imports in one process (see prime-determinism-worker.mjs's own
//    header). A genuinely cold cache needs a genuinely separate process, so this gate now spawns TWO,
//    via `prime-determinism-worker.mjs`: one renders DET_CASES with an EMPTY poison set (nothing has
//    touched hct.js's caches before these exact calls); the other renders POISON_CASES — REAL
//    `primeSwatches()` palette renders, not a synthetic grid — FIRST, before a single DET_CASES call
//    runs, then renders the identical DET_CASES. Both compare emitted HEXES per rung, not `inGamut`
//    (review pass 2's original finding: two DIFFERENT in-gamut hexes both read `inGamut: true`, so
//    `inGamut` alone cannot prove determinism).
//
//    Sizing, measured (this fix, revised review pass 6 N10): a full `primeSwatches` render through
//    `effHue`'s oklch path (the channel N7 found) at a distinct, never-repeated hue costs ~5.25ms
//    (1000 distinct-hue renders, 5,251ms, this host) — going through a REAL palette render for poison
//    is far costlier per entry than the OLD grid's bare `peakC`/`maxChromaInGamut` calls, so matching
//    the reviewer's literal 4,000-and-4,000 would cost roughly a minute standalone for this one gate.
//    An initial cut to DET_CASES 500 / POISON_CASES 1,500 was sized for cost alone (review pass
//    4/5) and left only a ~74% chance of catching a regression at the reviewer's own measured pre-fix
//    collision rate (11/4,000, 0.275%) — a coin-flip-ish guard for a gate whose entire job is to stop
//    this defect coming back (review pass 6, N10). DET_CASES raised to 2,000: 1-(1-0.00275)^2000 is
//    effectively 1 (>99.7%), near-certain at that rate. POISON_CASES stays at 1,500 — it is already
//    dense real-palette coverage and the reviewer's own note that it "would not need to grow" holds:
//    catch probability is driven by case count, not poison density, once the poison set is realistic
//    and runs before any case renders. A full reversion of hct.js's exact-key fix would produce a far
//    higher collision rate across ANY non-round sweep, so this gate's practical job is a fast
//    regression tripwire, not a precision measurement. The precision measurement — reproducing the
//    reviewer's own 4,000-case scale, PLUS a red-then-green check against a scratch copy with the
//    truncated keys restored, to prove this methodology actually bites — was run standalone, not
//    committed for cost, and is reported in the handoff (`.sdlc/handoffs/pif-u6.md`) and in this
//    unit's own report.
const DET_CASES = [];
for (let i = 0; i < 2000; i++) {
  DET_CASES.push({
    name: `d${i}`,
    hue: (i * 0.1381 + 13.7) % 360,
    chroma: 15 + (i % 6) * 15,
    hueShift: (i % 5) - 2,
    skew: ((i % 9) - 4) * 10,
    hueSpace: i % 2 === 0 ? "cam16" : "oklch",
  });
}
const POISON_CASES = [];
for (let i = 0; i < 1500; i++) {
  POISON_CASES.push({
    name: `p${i}`,
    hue: (i * 0.0917) % 360,
    chroma: 20 + (i % 7) * 11,
    hueShift: (i % 9) - 4,
    skew: ((i % 7) - 3) * 15,
    hueSpace: i % 2 === 0 ? "oklch" : "cam16",
  });
}
const DET_WORKER_PATH = fileURLToPath(new URL("./prime-determinism-worker.mjs", import.meta.url));
function runDeterminismWorker(poison, cases) {
  const out = execFileSync(process.execPath, [DET_WORKER_PATH], {
    input: JSON.stringify({ poison, cases }),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out);
}
const detClean = runDeterminismWorker([], DET_CASES);
const detPoisoned = runDeterminismWorker(POISON_CASES, DET_CASES);
let detMismatch = 0;
const detMismatchExamples = [];
for (let i = 0; i < DET_CASES.length; i++) {
  if (detClean[i] !== detPoisoned[i]) {
    detMismatch++;
    if (detMismatchExamples.length < 3) detMismatchExamples.push(`${DET_CASES[i].name}: clean [${detClean[i]}] poisoned [${detPoisoned[i]}]`);
  }
}
console.log(`  determinism (cold process vs poisoned-before-any-render process, real-palette poison, hex comparison): ${detMismatch}/${DET_CASES.length} palettes shifted hex by call order`);
if (detMismatch > 0) FAIL("c", `${detMismatch}/${DET_CASES.length} palettes returned a different hex when rendered in a process poisoned by real palette renders before anything else touched it — primeSwatches still depends on shared cache state (examples: ${detMismatchExamples.join("; ")})`);

// ── (gamut-ceiling) owner ruling, 2026-09-18 (#681 U6 review pass 1 fold), corrected review pass 3:
//    a fresh-context reviewer originally found ~1,288/302,400 rungs out of gamut on the head BEFORE the
//    S3 determinism fix, and the owner accepted that as shippable in principle, asking for a numeric
//    ceiling gate pinned to what THIS head actually measures. Review pass 3 found the FIRST version of
//    this gate could never fail: its `chroma` is `Math.min(cPrime, cap)` where `cap` is itself a value
//    `localMaxChroma`'s own binary search JUST confirmed in gamut, so "chroma <= cap is in gamut" is
//    guaranteed by the SAME monotonicity assumption the binary search itself already relies on — a
//    mathematical tautology given the current construction, not a fact this test can discover, and it
//    was riding on gate (c)'s own sweep with no negative control of its own (a 40s cost for zero
//    additional discriminating power beyond a 1-case probe). Corrected: `vulnPrimeSwatches` below
//    reimplements `primeSwatches`'s exact chroma-hold construction but against a PRIVATE, `.toFixed(2)`-
//    TRUNCATED reconstruction of `peakC`/`maxChromaInGamut` (`vulnPeakC`/`vulnMaxChroma` below) — i.e.
//    the actual pre-#686 vulnerable construction, which CAN clip a fraction of a chroma unit past the
//    true boundary on a cache-bucket collision, a real (non-tautological) failure mode. This control
//    used to call hct.js's own SHARED `peakC`/`maxChromaInGamut` directly, which was correct while those
//    were still truncated-key — but #686/#681 U6's own fix (see hct.js's `maxChromaInGamut` comment)
//    made them EXACT, so calling them here would no longer reproduce anything: the vulnerability this
//    control exists to catch would vanish along with the bug it is supposed to prove absent, and this
//    gate would go quietly vacuous the moment the fix it is validating landed. `vulnPeakC`/
//    `vulnMaxChroma` reconstruct the truncation locally instead, so the control stays meaningful
//    regardless of hct.js's own current state. Both constructions run over the SAME dedicated sweep
//    (this gate's own, separate from GAMUT_SWEEP — hue step 2 x chroma {25,50,75,100} x
//    hueShift {0,±10,±20} x skew {0,±40} x both hue spaces = 180 x 4 x 5 x 3 x 2 x 7 rungs = 151,200
//    rungs; these are THIS gate's own parameters, not a reproduction of the reviewer's — review pass 3
//    correction #2: an earlier version of this comment credited "the reviewer's own sweep" while
//    actually using different axis counts (4 hueShifts x 5 chromas for theirs, 5 x 4 here) that only
//    coincidentally summed to the same 302,400 denominator; measured independently on THESE parameters,
//    not copied). Before this fix, the control's own violation count was a measure of CACHE POLLUTION
//    under the WHOLE FILE's own call order — it called hct.js's shared, then-truncated cache directly,
//    so whatever else ran earlier in the same process changed its answer (review pass 4 measured
//    327/151,200 against an earlier run's 89/151,200 on the identical construction). Read as INDICATIVE
//    at that time, not a pinned measurement. That history-dependence is now gone along with the reason
//    for it: `vulnPeakC`/`vulnMaxChroma` are PRIVATE to this gate (a fresh `Map` per process, touched by
//    nothing else in this file), so the sweep below is now a genuinely reproducible measurement, not an
//    artifact of whatever ran first — measured, this commit, three runs: 114/151,200 every time.
//    At full hue-step-1 resolution (302,400 rungs, ~43s standalone, not run by default) the same
//    reproducible construction measures 742/302,400 — cited here for scale, re-measured on this head's
//    own axes rather than copied from the reviewer's (which used a different axis composition), and
//    superseding this comment's own prior 1,549 figure, itself measured under the old, history-dependent
//    construction and no longer reproducible under this one.
const CEILING_PARAMS = { hueStep: 2, chromas: [25, 50, 75, 100], hueShifts: [0, 10, -10, 20, -20], skews: [0, 40, -40] };
// vulnPeakC(hue) / vulnMaxChroma(hue, tone) — a PRIVATE reconstruction of hct.js's OWN pre-#686
// vulnerable caches (`hue.toFixed(2)`/`tone.toFixed(2)` keys), kept local to this gate so the negative
// control below still discriminates a truncation regression even though hct.js's real, shared
// `peakC`/`maxChromaInGamut` are exact-keyed as of this same commit (see their own comments in hct.js).
const _vulnMcCache = new Map();
function vulnMaxChroma(hue, tone) {
  if (tone <= 0 || tone >= 100) return 0;
  const key = hue.toFixed(2) + "|" + tone.toFixed(2);
  const hit = _vulnMcCache.get(key);
  if (hit !== undefined) return hit;
  let lo = 0, hi = 180;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (hctToRgb(hue, mid, tone).inGamut) lo = mid; else hi = mid;
  }
  _vulnMcCache.set(key, lo);
  return lo;
}
const _vulnPkCache = new Map();
function vulnPeakC(hue) {
  const key = hue.toFixed(2);
  const hit = _vulnPkCache.get(key);
  if (hit !== undefined) return hit;
  let bestC = 0, bestT = 0;
  for (let t = 4; t <= 96; t += 2) {
    const c = vulnMaxChroma(hue, t);
    if (c > bestC) { bestC = c; bestT = t; }
  }
  const res = { c: bestC, tone: bestT };
  _vulnPkCache.set(key, res);
  return res;
}
function vulnPrimeSwatches(palette, controls) {
  const baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100);
  const pk = vulnPeakC(baseHue); // PRIVATE, truncated-key peakC — the pre-#686 anchor
  const lPrime = pk.tone;
  const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c;
  const { up, down } = primeSteps(lPrime);
  const g = 3 ** ((palette.skew ?? 0) / 100);
  const pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100;
  const cPrime = Math.max(0, keyChroma * pc);
  const hOk = baseHue;
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  return PRIME_STEPS.map((step, i) => {
    const t = (i - 3) / 3;
    const absT = Math.abs(t);
    const w = i < 3 ? absT ** (1 / g) : absT ** g;
    const l = i < 3 ? lPrime + 3 * up * w : lPrime - 3 * down * w;
    const dir = sameDir ? -absT : t;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    const cap = vulnMaxChroma(hue, l); // PRIVATE, truncated-key maxChromaInGamut — the pre-#686 rung cap
    const chroma = Math.min(cPrime, cap);
    const { inGamut } = hctToRgb(hue, chroma, l);
    return { inGamut };
  });
}
const CEILING = { checked: 0, realViolations: 0, vulnViolations: 0 };
for (const hueSpace of SPACES) {
  for (let hue = 0; hue < 360; hue += CEILING_PARAMS.hueStep) {
    for (const chroma of CEILING_PARAMS.chromas) {
      for (const hueShift of CEILING_PARAMS.hueShifts) {
        for (const skew of CEILING_PARAMS.skews) {
          CEILING.checked++;
          const p = { name: `c${hue}`, hue, chroma, hueShift, skew };
          const ctl = { hueSpace };
          for (const s of primeSwatches(p, ctl)) if (!s.inGamut) CEILING.realViolations++;
          for (const s of vulnPrimeSwatches(p, ctl)) if (!s.inGamut) CEILING.vulnViolations++;
        }
      }
    }
  }
}
const PINNED_GAMUT_CEILING = 0;
console.log(`  gamut-ceiling: ${CEILING.realViolations}/${CEILING.checked * 7} real out-of-gamut rungs (pinned ceiling ${PINNED_GAMUT_CEILING}); negative control (private truncated-key reconstruction, same sweep): ${CEILING.vulnViolations}/${CEILING.checked * 7}`);
if (CEILING.realViolations > PINNED_GAMUT_CEILING) FAIL("gamut-ceiling", `${CEILING.realViolations}/${CEILING.checked * 7} out-of-gamut rungs exceeds the pinned ceiling of ${PINNED_GAMUT_CEILING}`);
if (CEILING.vulnViolations === 0) FAIL("gamut-ceiling", "negative control: the vulnerable shared-cache reconstruction measured 0 violations on this sweep — expected a nonzero count (this gate would not discriminate a regression back to the shared cache)");

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
// each case's independently re-derived anchor, per-side ROOM, and expected equal-compress step.
// roomUp/roomDown/expStep are sized off `lLadder` (the CLAMPED pivot primeSteps actually receives),
// never the raw `lPrime` — for the 16 real anchored defaults the two coincide (all measured in
// bounds, see the keyOf comment above), but sizing off the wrong one would silently be right only by
// coincidence. `inBounds`/d2a below deliberately use the RAW `lPrime`, since that is what the prime
// rung itself emits and what (d4)'s "zero anchors outside the window" property is actually about.
for (const c of CASES) {
  const k = keyOf(c.p, c.hueSpace);
  c.lPrime = k.lPrime;
  c.lLadder = k.lLadder;
  c.roomUp = Math.max(0, (PRIME_L_MAX - c.lLadder) / 3);
  c.roomDown = Math.max(0, (c.lLadder - PRIME_L_MIN) / 3);
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

// (d5) unclipped byte-identity: a FROZEN snapshot of the defaults whose anchor needs no
//      equal-compress at STEP_L 9 — i.e. min(roomUp,roomDown) >= STEP_L — RE-CAPTURED for #681 U4
//      integration (2026-09-19) from the INTEGRATED tree's real construction: U1's 16 anchors have
//      now landed, so `primeSwatches` pivots every default on its own `anchor` hex (cam16FromRgb's
//      chroma/hue, lstarFromRgb's L*), not on the cusp-tone `peakC` derivation this gate's values were
//      originally captured against on the standalone U6 branch (commit c286d40). Two of the original
//      seven families (Tertiary, Danger) now CLIP under the real anchors (min room < STEP_L; see the
//      "clipped defaults" gate below) and moved out of this snapshot; Secondary and Info replace them
//      — both measured unclipped (min room 9 exactly) on the integrated tree. Frozen literals, so the
//      check is independent of the present implementation by construction; cam16, the space they were
//      captured in (CTL above).
const FROZEN = {
  "Neutral": ["#9CA9CE", "#808DB0", "#687597", "#576485", "#3C4969", "#293655", "#192644"],
  "Primary": ["#7DA6FF", "#4D88F8", "#2E6FDE", "#0C5DCC", "#00439B", "#003276", "#002256"],
  "Secondary": ["#6CD3A4", "#52BA8D", "#36A176", "#108960", "#00704D", "#00583C", "#00412B"],
  "Info": ["#67B3E5", "#4896C7", "#297DAD", "#046C9B", "#005074", "#003C59", "#002B41"],
  "Data 2": ["#FF7FFD", "#F153F4", "#D536DA", "#B90CC1", "#96009D", "#730079", "#520056"],
  "Data 3": ["#FF9597", "#FF6972", "#F7344F", "#D6153B", "#B0002C", "#890020", "#630014"],
  "Data 8": ["#73C4FF", "#54ABE7", "#3693CE", "#067CB5", "#006594", "#004E75", "#003956"],
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
//      #681 U4 integration: originally scoped to `DEFAULTS`-named CASES only (a "dispatch
//      requirement", per the U6 SCOPE NOTE). Re-measured on the integrated tree (see the "clipped
//      defaults" gate below): all three real defaults that clip (Tertiary, Warning, Danger) clip on
//      the DARK side — none light-clip, because every anchor's own room is measured off the anchor's
//      real (fairly dark, saturated-brand) tone, not a hue-swept cusp. Restricting this gate's
//      population to just the 16 named defaults would make it permanently vacuous on the light side.
//      Widened to the FULL `CASES` sweep (the general hue/chroma population, non-anchored, still
//      reaches both bounds) so the property keeps being exercised in both directions; the real
//      defaults' own clip values are still pinned exactly by the "clipped defaults" gate below.
{
  let nLight = 0, nDark = 0;
  for (const c of CASES) {
    const clippedLight = c.roomUp < c.roomDown && c.roomUp < STEP_L - 1e-9;
    const clippedDark = c.roomDown < c.roomUp && c.roomDown < STEP_L - 1e-9;
    if (clippedLight) {
      nLight++;
      if (Math.abs(c.sw[0].l - PRIME_L_MAX) > 1e-9) FAIL("d6", `${c.label}: brightest l ${c.sw[0].l} != PRIME_L_MAX ${PRIME_L_MAX} (light-clipped side must touch the bound)`);
      const expDimmest = c.lLadder - 3 * c.expStep;
      if (Math.abs(c.sw[6].l - expDimmest) > 1e-9) FAIL("d6", `${c.label}: dimmest l ${c.sw[6].l} != anchor - 3*step ${expDimmest}`);
    } else if (clippedDark) {
      nDark++;
      if (Math.abs(c.sw[6].l - PRIME_L_MIN) > 1e-9) FAIL("d6", `${c.label}: dimmest l ${c.sw[6].l} != PRIME_L_MIN ${PRIME_L_MIN} (dark-clipped side must touch the bound)`);
      const expBrightest = c.lLadder + 3 * c.expStep;
      if (Math.abs(c.sw[0].l - expBrightest) > 1e-9) FAIL("d6", `${c.label}: brightest l ${c.sw[0].l} != anchor + 3*step ${expBrightest}`);
    }
  }
  if (nLight === 0) FAIL("d6", "no light-clipped default found — this gate has gone vacuous");
  if (nDark === 0) FAIL("d6", "no dark-clipped default found — this gate has gone vacuous");
}

// clipped defaults — #681 U4 integration (2026-09-19), RE-MEASURED on the integrated tree now that
// U1's real anchors have landed. The U6 SCOPE NOTE at the top of this file (written when this branch
// was dispatched standalone, before U1 existed) predicted this exact re-measurement: "the plan/
// dispatch names Tertiary, Danger, Warning as the three defaults that clip at STEP_L 9, with spans
// 52.8 / 49.9 / 46.3 L* — computed against U1's Q2(b) minted stop-550-hex anchors." Measured here
// against the real, landed anchors: Tertiary 52.7805, Danger 49.9212, Warning 46.2664 — matching the
// plan's own prediction almost exactly (the plan's figures were rounded to one decimal). The
// standalone branch's cusp-anchor set (Secondary/Info/Success/Warning/Data 1) was itself a stand-in,
// documented at the time as provisional pending U1 — it does not survive integration: on the real
// anchors, all three clipped defaults clip on the DARK side only (their anchor tone sits closer to
// PRIME_L_MIN than to PRIME_L_MAX), which is also why (d6) above needed widening past the 16 named
// defaults to keep exercising the light-clip branch. Asserted at the measured equal-compress spans,
// tolerance 0.05 L*, so a future change to the window/STEP_L/anchor construction is caught.
const CLIPPED_DEFAULTS = {
  "Tertiary": 52.7805, "Warning": 46.2664, "Danger": 49.9212,
};
for (const [name, expSpan] of Object.entries(CLIPPED_DEFAULTS)) {
  const p = DEFAULTS.find((d) => d.name === name);
  const sw = primeSwatches(p, CTL);
  const span = sw[0].l - sw[6].l;
  if (Math.abs(span - expSpan) > 0.05) FAIL("d1", `${name}: measured equal-compress span ${span.toFixed(3)} != expected ${expSpan} +/- 0.05 (see .sdlc/handoffs/pif-u4.md)`);
}
// and every OTHER default is UNCLIPPED here (span 54 exactly) — the complement of CLIPPED_DEFAULTS,
// asserted so a silent regression that clips (or un-clips) a default moves this test, not a surprise
// discovered only by (d5)'s frozen snapshot failing for an unrelated-looking reason.
for (const p of DEFAULTS) {
  if (Object.hasOwn(CLIPPED_DEFAULTS, p.name)) continue;
  const sw = primeSwatches(p, CTL);
  const span = sw[0].l - sw[6].l;
  if (Math.abs(span - SPAN) > 1e-9) FAIL("d1", `${p.name}: expected UNCLIPPED (span ${SPAN}), measured ${span.toFixed(3)} — update CLIPPED_DEFAULTS/FROZEN if the anchor construction changed`);
}

// ── (d2) skew gamma (REQ-053a): monotone/bounds, end+prime invariance, weight re-derivation,
//        skew0 weights == |t|, and direction vs the skew-0 baseline, for every default palette ──
{
  const SKEWS = [-100, -60, -20, 0, 20, 60, 100];
  for (let k = 0; k < SPACES.length; k++) {
   const CTL = CTLS[k];
   for (const p0 of DEFAULTS) {
    const p = { ...p0, name: `${p0.name}/${SPACES[k]}` };
    // lLadder, not the raw anchor lPrime: primeSwatches builds every non-prime rung off the CLAMPED
    // pivot (prime.mjs:154-160), matching the (d1)/(d6) fix above.
    const { lLadder: lPrime } = keyOf(p, CTL.hueSpace);
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
//        hue is the wrong axis to compare across rungs of differing tone.
//        #681 U4 integration: for an ANCHORED palette this identity is no longer against
//        `deriveKeyColor` (U1's anchor branch in primeSwatches never calls it) — the plan's own
//        Blast-radius table states it directly: "e, h prime pixel identity | prime == deriveKeyColor
//        hex | anchored palettes: prime == anchor (U1); non-anchored: unchanged". `deriveKeyColor`
//        itself is unchanged (still the cusp-identity gallery-tile colour, a different concept), so
//        the comparison target branches here rather than inside `deriveKeyRgb`, which stays an
//        accurate mirror of the real (still non-anchor-aware) `src/ui/model.mjs` function. ─────────
for (const p of DEFAULTS) {
  const sw = primeSwatches({ ...p, hueShift: 0 }, CTL);
  const anchored = isAnchored(p);
  const keyRgb = anchored ? hexToRgb(p.anchor) : deriveKeyRgb(p, CTL.hueSpace);
  const primeHue = cam16FromRgb(sw[3].rgb).hue;
  const keyHue = cam16FromRgb(keyRgb).hue;
  const tolPrime = hueTol(sw[3].rgb);
  if (angDiff(primeHue, keyHue) > tolPrime) FAIL("e", `${p.name}: prime pixel CAM16 hue ${primeHue.toFixed(3)} vs ${anchored ? "anchor" : "deriveKeyColor"} pixel CAM16 hue ${keyHue.toFixed(3)} (> ${tolPrime.toFixed(3)}°)`);
  for (const s of sw) {
    if (s.step === "prime") continue;
    const h = cam16FromRgb(s.rgb).hue;
    const tol = hueTol(s.rgb);
    if (angDiff(h, primeHue) > tol) FAIL("e", `${p.name} ${s.step}: CAM16 hue ${h.toFixed(3)} vs prime pixel CAM16 hue ${primeHue.toFixed(3)} (> ${tol.toFixed(3)}°)`);
  }
}
// #681 U4 review pass 1, Finding F2: all 16 DEFAULTS carry an anchor (role-table.json), so the loop
// above compares `primeSwatches`'s verbatim pass-through of a hex literal against this FILE's own
// parse of that SAME literal (`hexToRgb(p.anchor)`) - `deriveKeyRgb` is never called, so a
// non-anchored construction regression passes unnoticed (measured: scaling the non-anchored
// `keyChroma` by 0.95 at prime.mjs:156 moves 58 of 112 rungs across the 16 defaults and still clears
// every gate in this file before this companion). Same pattern as (g): strip `anchor` so the probe
// keeps exercising the real (still non-anchor-aware) `deriveKeyRgb` comparison target, keeping the
// anchored loop above as a companion assertion rather than the whole gate.
for (const p of DEFAULTS) {
  const stripped = { ...p, anchor: undefined, hueShift: 0 };
  const sw = primeSwatches(stripped, CTL);
  const keyRgb = deriveKeyRgb(stripped, CTL.hueSpace);
  const primeHue = cam16FromRgb(sw[3].rgb).hue;
  const keyHue = cam16FromRgb(keyRgb).hue;
  const tolPrime = hueTol(sw[3].rgb);
  if (angDiff(primeHue, keyHue) > tolPrime) FAIL("e", `${p.name} (anchor stripped): prime pixel CAM16 hue ${primeHue.toFixed(3)} vs deriveKeyColor pixel CAM16 hue ${keyHue.toFixed(3)} (> ${tolPrime.toFixed(3)}°)`);
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
//        == 0.5 (Primary, chroma 95 < 100, so cPrime never saturates against maxChromaInGamut).
//        #681 U4 integration: this relation only applies to the NON-anchored path - U1's anchor
//        branch emits the anchor's own measured chroma verbatim at the prime rung regardless of
//        `primeChroma` (prime.mjs:143-150, "prime == anchor" per the plan's Blast-radius table), so
//        `primeChroma` is a no-op on the prime rung for an anchored palette by design. Since all 16
//        `DEFAULTS` are now anchored (U1), the probe here strips Primary's own `anchor` field
//        (keeping its hue/chroma/skew — the values the original 0.5 ratio was written against)
//        rather than testing a palette that can no longer exercise this path at all. A companion
//        assertion below pins the anchored (immune) behaviour so a regression either way is caught. ──
{
  const PRIMARY_NO_ANCHOR = { ...PRIMARY, anchor: undefined };
  const s100 = primeSwatches(PRIMARY_NO_ANCHOR, { ...CTL, primeChroma: 100 })[3].s;
  const s50 = primeSwatches(PRIMARY_NO_ANCHOR, { ...CTL, primeChroma: 50 })[3].s;
  const ratio = s50 / s100;
  if (Math.abs(ratio - 0.5) > 1e-6) FAIL("g", `Primary (anchor stripped): measured chroma ratio (primeChroma 50/100) = ${ratio.toFixed(6)}, expected 0.5 exactly (unclamped)`);

  const aS100 = primeSwatches(PRIMARY, { ...CTL, primeChroma: 100 })[3].s;
  const aS50 = primeSwatches(PRIMARY, { ...CTL, primeChroma: 50 })[3].s;
  const aRatio = aS50 / aS100;
  if (Math.abs(aRatio - 1) > 1e-9) FAIL("g", `Primary (anchored): measured chroma ratio (primeChroma 50/100) = ${aRatio.toFixed(6)}, expected 1 exactly (anchor pass-through is immune to primeChroma)`);
}

// ── (h) REQ-056: at primeChroma 100, prime.hex == deriveKeyColor hex, BYTE-IDENTICAL, every default
//        palette, BOTH hue spaces (#686, #681 U6 review pass 4 finding N8, tightened here per the
//        owner's ruling: this gate used to tolerate one 8-bit step per channel, which is why it passed
//        while `deriveKeyColor` and `primeSwatches` measurably disagreed — review pass 4 measured
//        `#671CF1` (this file's construction) against `#671CF2` (`deriveKeyColor`, `src/ui/model.mjs`)
//        for Data 1 in OKLCH space. The divergence traced to `hct.js`'s shared `peakC` still being
//        truncated-key at the time: `primeSwatches` read an exact cusp, `deriveKeyColor` read a stale
//        one warmed by an unrelated earlier hue. With `hct.js`'s cache keys now exact (this commit) the
//        two calls are LITERALLY the same call, so the tolerance is no longer buying anything but cover
//        for a real regression — tightened to zero. Also widened to run BOTH hue spaces: the prior
//        version hardcoded `CTL` (cam16 only), so it could never have caught N8, which was specifically
//        an OKLCH-path divergence (`effHue`'s oklch branch is the one that calls `oklchToCam16Hue`).
//        #681 U4 integration: same anchor branch as (e) above - for an anchored palette the byte-
//        identity target is the anchor itself, not `deriveKeyColor` (plan Blast-radius table, "e, h
//        prime pixel identity"). Trivially exact (`primeSwatches` returns `rgb: anchorRgb` verbatim
//        at the prime rung), but asserted rather than assumed. Its residual value is NOT "catching a
//        regression that made the anchor branch re-derive its rgb": all 16 default anchors round-trip
//        `hctToRgb(cam16FromRgb(rgb), lstarFromRgb(rgb))` byte-exactly (0 of 16 off, measured), so a
//        mutation that swapped the verbatim pass-through for that round trip would NOT be caught on
//        these 16 subjects alone (U4 review pass 1, F2) - the real coverage for a re-derived anchor
//        branch is `test/engine/anchor.mjs`'s `anchor-identity` gate over the full 3,380-anchor
//        corpus, where round-trip byte-exactness is not universal. What THIS loop's anchored arm
//        actually guards is narrower and still real: that the pass-through wiring itself (the literal
//        `rgb: anchorRgb` line) hasn't been deleted or swapped for a different field. ──────────────
for (const hueSpace of SPACES) {
  for (const p of DEFAULTS) {
    const sw = primeSwatches(p, { hueSpace, primeChroma: 100 });
    const primeRgb = sw[3].rgb;
    const anchored = isAnchored(p);
    const keyRgb = anchored ? hexToRgb(p.anchor) : deriveKeyRgb(p, hueSpace);
    const diff = [0, 1, 2].map((i) => Math.abs(primeRgb[i] - keyRgb[i]));
    if (diff.some((d) => d > 0)) FAIL("h", `${p.name}/${hueSpace}: prime rgb [${primeRgb}] vs ${anchored ? "anchor" : "deriveKeyColor"} rgb [${keyRgb}] (diff [${diff}])`);
  }
}
// #681 U4 review pass 1, Finding F2: the loop above compares every DEFAULT's verbatim anchor
// pass-through against this file's own parse of the SAME literal - `deriveKeyRgb` (the actual REQ-056
// non-anchored construction) is never exercised, since all 16 defaults are anchored. Companion probe,
// same anchor-stripping pattern as (e)/(g): restores the non-anchored arm REQ-056 was written for.
for (const hueSpace of SPACES) {
  for (const p of DEFAULTS) {
    const stripped = { ...p, anchor: undefined };
    const sw = primeSwatches(stripped, { hueSpace, primeChroma: 100 });
    const primeRgb = sw[3].rgb;
    const keyRgb = deriveKeyRgb(stripped, hueSpace);
    const diff = [0, 1, 2].map((i) => Math.abs(primeRgb[i] - keyRgb[i]));
    if (diff.some((d) => d > 0)) FAIL("h", `${p.name}/${hueSpace} (anchor stripped): prime rgb [${primeRgb}] vs deriveKeyColor rgb [${keyRgb}] (diff [${diff}])`);
  }
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
//        the fallback tail was removed from primeSwatches accordingly).
//        #681 U4 integration: like (g), `primeChroma` (global or per-palette) has no effect on an
//        anchored palette's prime rung by design, so this probe uses Primary with its `anchor`
//        stripped (same rationale as (g)) rather than a palette that can no longer exercise either
//        override path at all. ─────────────────────────────────────────────────────────────────
{
  const PRIMARY_NO_ANCHOR = { ...PRIMARY, anchor: undefined };
  const swOverride = primeSwatches({ ...PRIMARY_NO_ANCHOR, primeChroma: 30 }, { ...CTL, primeChroma: 100 })[3];
  const swGlobal30 = primeSwatches(PRIMARY_NO_ANCHOR, { ...CTL, primeChroma: 30 })[3];
  const swGlobal100 = primeSwatches(PRIMARY_NO_ANCHOR, { ...CTL, primeChroma: 100 })[3];
  if (Math.abs(swOverride.s - swGlobal30.s) > 1e-9) FAIL("j", `palette.primeChroma override: s ${swOverride.s} != global-30 s ${swGlobal30.s}`);
  if (Math.abs(swOverride.s - swGlobal100.s) < 1e-9) FAIL("j", "palette.primeChroma override had no effect vs global primeChroma 100");
}
{
  // no controls.primeChroma field at all -> defaults to 100, ignoring a stray keyIntensity: if the
  // retired fallback tail were still present this would read key.s * 0.4 instead of key.s * 1.0.
  const PRIMARY_NO_ANCHOR = { ...PRIMARY, anchor: undefined };
  const ctlNoPC = { hueSpace: "oklch", keyIntensity: 40 };
  const sw = primeSwatches(PRIMARY_NO_ANCHOR, ctlNoPC)[3];
  const swExplicit100 = primeSwatches(PRIMARY_NO_ANCHOR, { ...ctlNoPC, primeChroma: 100 })[3];
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

// ── symmetry, ANCHORED CORPUS leg (B1, pre-land review at b4be472c, owner ruling 2026-09-20 in
//        .sdlc/questions/preset-intent-fidelity-preland.md), and the C11 span report ──────────────
//
// What the review found. The `symmetry` block above sweeps 464 SYNTHETIC cases: the 16 defaults plus
// hue 0..359 step 5 at three chromas, in both hue spaces. Not one of them carries an `anchor`, so the
// leg that the #681 anchored construction actually stresses was never measured, and the gate read
// "0 exceptions" over a population in which 0 is the only possible answer. The 3,380 anchored corpus
// palettes are where the asymmetry lives, and they are swept here.
//
// TWO LEGS, AND THEY ARE NOT THE SAME LEG. The review reported 22 exceptions; the by-construction leg
// has 26. Both figures are right and neither replaces the other:
//   by-construction: |(bright - prime) - (prime - dim)| > 1e-9, read off the EMITTED `l` fields.
//   measured-pixel:  the same difference taken through lstarFromRgb on the EMITTED rgb, bar 3 L*.
// The 22 are a strict SUBSET of the 26: four palettes break the constructed equality and still land
// inside 3 L* once 8-bit rounding and the gamut clamp have had their say. Each leg is frozen by name,
// in the same sorted-array shape `ORDER_ALLOW` uses in test/engine/anchor.mjs, because a count alone
// lets one source swap for another at an unchanged length (N1, that file's own finding).
//
// THE MECHANISM, which is what R2 asks for before a count may be pinned. An anchored palette renders
// its `prime` rung at the anchor's own CIE L* verbatim, while the six ladder rungs are built around
// `lLadder`, the pivot the widening search in src/engine/prime.mjs settles on. Those two coincide for
// an anchor comfortably inside [PRIME_L_MIN, PRIME_L_MAX], and they part company for a near-black
// source, which is exactly Q3 (b)'s ruled class. `ORDER_ALLOW`'s own note in test/engine/anchor.mjs
// works the population out case by case: 21 members are sources sitting at or past the window bound,
// so the pivot is clamped away from them, and 5 are sources inside the window but within about
// 1.1 L* of `PRIME_L_MIN` (measured 12.3351 to 13.3550 against a floor of 12.2500), where the search
// lifts the pivot above the source before the rungs come out distinct. Break the prime rung away from
// the pivot and the up arm and the down arm stop being the same number: that IS the asymmetry, and it
// is the same event `ORDER_ALLOW` records as "prime no longer sits between bright and dim". So the
// two lists are predicted to hold the same 26 members, and the cross-check below asserts it rather
// than asserting a second copy of a number.
{
  const CATS = ["architecture", "cuisine", "film", "literature", "music", "nature", "travel", "brands"];
  const anchoredCorpus = [];
  for (const slug of CATS) {
    const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
    for (const preset of PRESETS) {
      for (const p of preset.palettes) {
        if (isAnchored(p)) anchoredCorpus.push({ slug, presetName: preset.name, hueSpace: preset.hueSpace, palette: p });
      }
    }
  }
  if (anchoredCorpus.length !== 3380) {
    FAIL("symmetry", `corpus leg loaded ${anchoredCorpus.length} anchored palettes, want 3380 - report this line, do not force the number`);
  }

  // The two frozen lists. Label shape is `ORDER_ALLOW`'s exactly: slug, quoted preset name, palette
  // name, anchor hex. Printed by the gate itself, so a real drift is copy-pasteable back into here.
  const SYM_BY_CONSTRUCTION_ALLOW = [
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
  // The four that break the constructed equality and still measure inside 3 L* are, by subtraction:
  // Apocalypse Now primary #241E1A, The rave secondary #212228, the Patmos church tertiary-muted
  // #232220 and the Hidaka coast tertiary-muted #252215. They are absent below and present above.
  const SYM_MEASURED_ALLOW = [
    `brands "Nike · The Swoosh · Since 1971" secondary #101820`,
    `brands "Nike · The Swoosh · Since 1971" tertiary-muted #FFFFFF`,
    `film "2001: A Space Odyssey · 1968 · dir. Kubrick · the centrifuge & the stargate" tertiary-muted #1A1B1E`,
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
    `music "UK '77 · the ransom-note sleeve" secondary #1F1F23`,
    `nature "32° N · constant · Carlsbad Caverns, New Mexico, lamp-lit" secondary #1D1D20`,
    `travel "20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border" primary-muted #1F1A16`,
    `travel "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche" tertiary-muted #1F1A16`,
    `travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" primary #1E1D1B`,
    `travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary #221913`,
    `travel "41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in" tertiary-muted #251B12`,
    `travel "48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide" primary-muted #251B14`,
    `travel "62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog" tertiary-muted #221913`,
  ];
  // SPAN_L_FLOOR: C11's own "ladders under 30 L*" report. 30 is the plan's threshold, not a derived
  // constant, so it is named here and the negative control below moves it to prove the count tracks it.
  const SPAN_L_FLOOR = 30;

  const bcNames = [], pxNames = [];
  let bcMax = 0, pxMax = 0, spanPx = 0, spanConstructed = 0;
  const bcWorst = [];
  for (const { slug, presetName, hueSpace, palette: p } of anchoredCorpus) {
    const ctl = { hueSpace: hueSpace ?? "oklch", primeChroma: 100 };
    const sw = primeSwatches(p, ctl);
    const label = `${slug} "${presetName}" ${p.name} ${p.anchor}`;
    const bc = Math.abs((sw[0].l - sw[3].l) - (sw[3].l - sw[6].l));
    bcMax = Math.max(bcMax, bc);
    if (bc > 1e-9) { bcNames.push(label); bcWorst.push({ label, bc }); }
    const Lpx = (i) => lstarFromRgb(sw[i].rgb);
    const px = Math.abs((Lpx(0) - Lpx(3)) - (Lpx(3) - Lpx(6)));
    pxMax = Math.max(pxMax, px);
    if (px > 3) pxNames.push(label);
    // The span report reads BOTH producers and says which is which, because they disagree by one
    // palette and a report that quoted a single number would be quoting a choice it never declared.
    if (Lpx(0) - Lpx(6) < SPAN_L_FLOOR) spanPx++;
    if (sw[0].l - sw[6].l < SPAN_L_FLOOR) spanConstructed++;
  }
  bcNames.sort();
  pxNames.sort();
  bcWorst.sort((a, b) => b.bc - a.bc);

  // frozen-by-name comparison, both legs. Same shape as anchor.mjs's: name the member that went
  // missing AND the one that showed up, so a same-length substitution cannot pass as a count match.
  const freeze = (got, want, leg) => {
    // The summary word reads the SAME predicate the failure branch below does (count AND membership),
    // not the count alone: a one-for-one name substitution keeps the length and must still headline
    // FAIL, or the first line of the report contradicts the exit code (the same defect class as #718).
    const ok = got.length === want.length && got.every((n, i) => n === want[i]);
    console.log(`  ${ok ? "pass" : "FAIL"}  symmetry corpus ${leg}: ${got.length} of ${anchoredCorpus.length} (expected ${want.length})`);
    for (const n of got) console.log(`    ${leg === "by-construction" ? "c" : "m"} ${n}`);
    if (!ok) {
      // Printed as well as FAILed, on purpose. `FAIL` keeps only the FIRST message per gate name, so a
      // substitution (one missing, one uninvited, same count) would otherwise report half of itself and
      // the reader would be told a name went away with no idea what replaced it. Both sides go to stdout.
      for (const n of want) if (!got.includes(n)) { console.log(`    MISSING from the measured corpus, present in the frozen ${leg} list: ${n}`); FAIL("symmetry", `corpus ${leg} allow-list: expected member missing - ${n}`); }
      for (const n of got) if (!want.includes(n)) { console.log(`    UNEXPECTED in the measured corpus, absent from the frozen ${leg} list: ${n}`); FAIL("symmetry", `corpus ${leg} allow-list: unexpected member - ${n}`); }
      if (!fails.some((f) => f.startsWith("symmetry:"))) FAIL("symmetry", `corpus ${leg} allow-list count ${got.length} !== expected ${want.length} with no single-name diff found - investigate before trusting either count`);
    }
  };
  console.log(`  symmetry (anchored corpus): ${anchoredCorpus.length} palettes, by-construction exceptions ${bcNames.length} (max |up-down| ${bcMax.toFixed(4)} L*), measured exceed-3L* ${pxNames.length} (max ${pxMax.toFixed(4)} L*)`);
  for (const w of bcWorst.slice(0, 3)) console.log(`    worst ${w.bc.toFixed(2)} L*  ${w.label}`);
  freeze(bcNames, [...SYM_BY_CONSTRUCTION_ALLOW].sort(), "by-construction");
  freeze(pxNames, [...SYM_MEASURED_ALLOW].sort(), "measured-pixel");

  // the measured leg must be a SUBSET of the by-construction leg. A palette whose emitted `l` fields
  // are symmetric to 1e-9 cannot render pixels more than 3 L* apart, so a member here that is not
  // there would mean one of the two legs is reading the wrong swatch, not that the corpus moved.
  for (const n of pxNames) if (!bcNames.includes(n)) FAIL("symmetry", `corpus leg inconsistency: ${n} exceeds 3 L* measured but is symmetric by construction - one of the two legs is reading the wrong rung`);
  // and the difference IS the four named in SYM_MEASURED_ALLOW's comment, asserted rather than stated
  // (U7 review 1, F3: the mechanism as code, R2). Compared as sorted arrays against the frozen lists.
  const bcMinusPx = SYM_BY_CONSTRUCTION_ALLOW.filter((n) => !SYM_MEASURED_ALLOW.includes(n)).sort();
  const SYM_DIFF_EXPECTED = [`film "Apocalypse Now · 1979 · dir. Coppola · the river at dusk" primary #241E1A`, `music "The rave · the laser tent" secondary #212228`, `travel "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight" tertiary-muted #232220`, `travel "42° N · July · 06:00 · Hidaka coast, Hokkaido, low tide at the height of kombu season" tertiary-muted #252215`].sort();
  if (JSON.stringify(bcMinusPx) !== JSON.stringify(SYM_DIFF_EXPECTED)) FAIL("symmetry", `by-construction minus measured is not the four named palettes: got [${bcMinusPx.join(" | ")}]`);

  // ── U7-3: the by-construction 26 are the SAME 26 as ORDER_ALLOW in test/engine/anchor.mjs ────────
  // Read out of that file's source text rather than imported, because anchor.mjs is a top-level test
  // script that runs its whole suite and calls process.exit on import. Parsing the frozen literal is
  // what makes this a cross-check between two files instead of two copies of one list in one file.
  {
    const anchorSrc = readFileSync(new URL("./anchor.mjs", import.meta.url), "utf8");
    const block = anchorSrc.match(/const ORDER_ALLOW = \[([\s\S]*?)\n\];/);
    if (!block) {
      FAIL("symmetry", "cross-check: could not find `const ORDER_ALLOW = [...]` in test/engine/anchor.mjs - the frozen list moved or was renamed, so this cross-check is not running");
    } else {
      const orderAllow = [...block[1].matchAll(/`([^`]*)`/g)].map((m) => m[1]).sort();
      const mine = [...SYM_BY_CONSTRUCTION_ALLOW].sort();
      const same = orderAllow.length === mine.length && mine.every((n, i) => n === orderAllow[i]);
      console.log(`  ${same ? "pass" : "FAIL"}  symmetry corpus by-construction set == ORDER_ALLOW (test/engine/anchor.mjs): ${mine.length} vs ${orderAllow.length}`);
      if (!same) {
        // Both sides printed, for the same reason `freeze` prints them: FAIL keeps one message per gate.
        for (const n of orderAllow) if (!mine.includes(n)) { console.log(`    ORDER_ALLOW side moved: ${n} is in test/engine/anchor.mjs's ORDER_ALLOW and not in this file's by-construction list`); FAIL("symmetry", `ORDER_ALLOW cross-check: in ORDER_ALLOW, absent from this file's by-construction list - ${n}`); }
        for (const n of mine) if (!orderAllow.includes(n)) { console.log(`    this file's side moved: ${n} is in this file's by-construction list and not in ORDER_ALLOW`); FAIL("symmetry", `ORDER_ALLOW cross-check: in this file's by-construction list, absent from ORDER_ALLOW - ${n}`); }
        if (!fails.some((f) => f.startsWith("symmetry:"))) FAIL("symmetry", `ORDER_ALLOW cross-check: ${mine.length} vs ${orderAllow.length} with no single-name diff found - investigate before trusting either list`);
      }
    }
  }

  // ── span report (C11) ────────────────────────────────────────────────────────────────────────────
  // Expected counts are exact, tolerance 0: both producers are deterministic functions of committed
  // data, so a tolerance band here would only hide a real move.
  const SPAN_PX_EXPECTED = 364, SPAN_CONSTRUCTED_EXPECTED = 363;
  let dkUnder = 0;
  for (const p of DEFAULTS) {
    const sw = primeSwatches(p, CTL);
    if (lstarFromRgb(sw[0].rgb) - lstarFromRgb(sw[6].rgb) < SPAN_L_FLOOR) dkUnder++;
  }
  const spanOk = spanPx === SPAN_PX_EXPECTED && spanConstructed === SPAN_CONSTRUCTED_EXPECTED && dkUnder === 0;
  console.log(`  ${spanOk ? "pass" : "FAIL"}  ladder-span under ${SPAN_L_FLOOR} L*: ${spanPx} of ${anchoredCorpus.length} anchored corpus ladders measured from emitted pixels (expected ${SPAN_PX_EXPECTED}), ${spanConstructed} read off the constructed rungs (expected ${SPAN_CONSTRUCTED_EXPECTED}), ${dkUnder} of ${DEFAULTS.length} default-kit families (expected 0); tolerance 0 on all three`);
  if (spanPx !== SPAN_PX_EXPECTED) FAIL("ladder-span", `pixel span under ${SPAN_L_FLOOR} L*: ${spanPx} != expected ${SPAN_PX_EXPECTED}`);
  if (spanConstructed !== SPAN_CONSTRUCTED_EXPECTED) FAIL("ladder-span", `constructed span under ${SPAN_L_FLOOR} L*: ${spanConstructed} != expected ${SPAN_CONSTRUCTED_EXPECTED}`);
  if (dkUnder !== 0) FAIL("ladder-span", `default kit span under ${SPAN_L_FLOOR} L*: ${dkUnder} != expected 0`);

  // negative control for the span report: the SAME leg, same corpus, against the frozen pre-#681
  // fixture, must read 0 - proving the 364 is a property of this construction and not a constant the
  // report would print whatever the engine did. Read the PIXEL leg only. The fixture's own `l` field
  // is OKHSL lightness on 0..1, not CIE L*, so its constructed-span count is 3,380 for a reason that
  // is a unit mismatch and not a measurement; quoting it as a control would be a false red.
  //
  // negative control for the measured symmetry leg (U7-2): the same fixture, same corpus, must read a
  // large non-zero exception count. A pre-#681 ladder cannot pass this leg.
  {
    const oldMod2 = await import("./fixtures/prime-pre-681.mjs");
    let oldExceed = 0, oldMax = 0, oldSpanPx = 0;
    for (const { hueSpace, palette: p } of anchoredCorpus) {
      const swO = oldMod2.primeSwatches(p, { hueSpace: hueSpace ?? "oklch", primeChroma: 100 });
      const Lpx = (i) => lstarFromRgb(swO[i].rgb);
      const a = Math.abs((Lpx(0) - Lpx(3)) - (Lpx(3) - Lpx(6)));
      oldMax = Math.max(oldMax, a);
      if (a > 3) oldExceed++;
      if (Lpx(0) - Lpx(6) < SPAN_L_FLOOR) oldSpanPx++;
    }
    console.log(`  symmetry/ladder-span negative control (frozen pre-#681 fixture, anchored corpus): measured exceed-3L* ${oldExceed}/${anchoredCorpus.length}, max ${oldMax.toFixed(4)} L*, pixel span under ${SPAN_L_FLOOR} L* ${oldSpanPx}`);
    if (oldExceed <= pxNames.length) FAIL("symmetry", `negative control: the pre-#681 fixture measured ${oldExceed} corpus exceptions, not clearly more than this branch's ${pxNames.length} - this leg would not have caught #641's redistribute asymmetry`);
    if (oldSpanPx === spanPx) FAIL("ladder-span", `negative control: the pre-#681 fixture reported the SAME ${oldSpanPx} ladders under ${SPAN_L_FLOOR} L* as this branch - the span report may be constant rather than measured`);
  }
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
// The printed set is this declared list UNION every gate name that actually reached a FAIL(...)
// call (#699, following #695's pattern in test/engine/tonal.mjs), so a gate missing from the list
// below still shows up, loudly, instead of hiding behind a neighbouring gate's "pass" row.
const DECLARED = ["a", "b", "c", "gamut-ceiling", "d1", "d2a", "d3", "d4", "d5", "d6", "d2", "e", "f", "g", "h", "i", "j", "k", "ladder-window", "symmetry", "ladder-span", "report-static"];
gateReport({ fails, declared: DECLARED, selfUrl: import.meta.url, FAIL });
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: prime-system clears all AC-050 gates");
process.exit(0);
