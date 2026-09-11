#!/usr/bin/env node
// data-hues.mjs: verifier for the data-hue derivation math (src/engine/data-hues.mjs). Pure, no DOM.
// Covers SPEC docs/spec/spec-muted-base-key-spikes.md AC-020/AC-021.
import * as D from "../../src/engine/data-hues.mjs";

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const norm = (d) => ((d % 360) + 360) % 360;
const approx = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const angClose = (a, b, tol = 1e-6) => Math.min(norm(a - b), norm(b - a)) <= tol;

// An INDEPENDENT brute-force re-derivation, coded from scratch here (not calling into the module's
// own internals): the "second derivation" `checks-that-bite` calls for, and the exact method AC-020c
// names ("brute-force re-derived in the test").
function bruteForce(primaryHue, brandHues, count) {
  const step = 360 / count;
  const dist = (a, b) => { const x = Math.abs(norm(a) - norm(b)); return Math.min(x, 360 - x); };
  if (!brandHues.length) return { phi: 0, score: null };
  let bestPhi = 0, bestScore = -Infinity;
  for (let phi = 0; phi < step; phi++) {
    let minD = Infinity;
    for (let i = 0; i < count; i++) {
      const c = norm(primaryHue + phi + i * step);
      for (const b of brandHues) minD = Math.min(minD, dist(c, b));
    }
    if (minD > bestScore) { bestScore = minD; bestPhi = phi; }
  }
  return { phi: bestPhi, score: bestScore };
}

// ---- AC-020a/b: output length is `count`; consecutive hues differ by 360/count (mod 360) ----
{
  for (const count of [8, 4, 5]) {
    const { hues } = D.deriveDataHues(30, [200], count);
    ok(hues.length === count, `deriveDataHues(count=${count}) returned ${hues.length} hues, want ${count}`);
    const step = 360 / count;
    for (let i = 0; i < count; i++) {
      const next = hues[(i + 1) % count];
      const gap = norm(next - hues[i]);
      ok(angClose(gap, step, 1e-6) || angClose(gap, step - 360, 1e-6),
        `count=${count}: gap ${i}->${(i + 1) % count} is ${gap.toFixed(3)}, want ${step}`);
    }
    for (const h of hues) ok(h >= 0 && h < 360, `count=${count}: hue ${h} not normalised to [0, 360)`);
  }
}

// ---- AC-020c: phi is the argmax of the min circular distance, cross-checked against the
// independent brute-force re-derivation above, on EX-5's own dataset (SPEC's normative example) ----
{
  const primary = 267;
  const brandHues = [267, 165, 315, 235, 145, 70, 27]; // EX-5, all chroma >= 20
  const got = D.deriveDataHues(primary, brandHues, 8);
  const want = bruteForce(primary, brandHues, 8);
  ok(got.phi === want.phi, `EX-5: deriveDataHues phi ${got.phi} != independent brute-force phi ${want.phi}`);
  ok(got.hues.length === 8, "EX-5: 8 data hues");
  ok(angClose(got.hues[0], norm(primary + got.phi)), "EX-5: hues[0] = primary + phi");
}

// A second, differently-shaped brand set (asymmetric, non-45-multiple hues), proving the cross-check
// isn't only correct on one convenient dataset.
{
  const primary = 12;
  const brandHues = [340, 5, 88, 88.5, 200];
  const got = D.deriveDataHues(primary, brandHues, 8);
  const want = bruteForce(primary, brandHues, 8);
  ok(got.phi === want.phi, `asymmetric set: deriveDataHues phi ${got.phi} != brute-force phi ${want.phi}`);
}

// ---- Tie-break (ratified 2026-09-11: smallest phi wins). Hand-derived case: primary=0, count=8
// (step 45), brandHues=[22]. f(phi) = min(x, 45-x) where x = (22 - phi) mod 45 is maximised (=22) at
// BOTH x=22 (phi=0) and x=23 (phi=44); every other phi scores lower. Smallest phi (0) must win. ----
{
  const { phi, hues } = D.deriveDataHues(0, [22], 8);
  ok(phi === 0, `tie-break: expected smallest phi 0 (tied with 44 at score 22), got ${phi}`);
  const brute = bruteForce(0, [22], 8);
  ok(brute.phi === 0 && approx(brute.score, 22), `tie-break sanity: brute-force phi ${brute.phi} score ${brute.score}, want phi 0 score 22`);
  ok(angClose(hues[0], 0), "tie-break: hues[0] = primary + 0 = 0");
}

// ---- AC-020d: an empty brand-hue set has nothing to optimise against, phi 0 regardless of count ----
{
  for (const brandHues of [[], undefined]) {
    for (const count of [8, 3]) {
      const { phi, hues } = D.deriveDataHues(50, brandHues, count);
      ok(phi === 0, `empty brand set (count=${count}): phi ${phi}, want 0`);
      ok(hues.length === count, `empty brand set (count=${count}): ${hues.length} hues, want ${count}`);
    }
  }
  // non-finite brand-hue entries are ignored the same way an empty set is (defensive, not a NaN sink)
  const { phi } = D.deriveDataHues(50, [NaN, undefined, null], 8);
  ok(phi === 0, `all-non-finite brand set: phi ${phi}, want 0 (treated as empty)`);
}

// ---- AC-021: the REQ-021 chroma-threshold contract (chroma >= 20 is IN, chroma < 20 is OUT)
// exercised as the actual input `deriveDataHues` consumes: a tinted neutral (chroma 29, SPEC's own
// default Neutral) qualifies as a brand hue; a near-achromatic neutral (chroma 10) does not. This
// mirrors the exact REQ-021 filter a caller (model.mjs mintDataPalettes, U6) applies before calling
// in. ----
{
  const palettes = [
    { name: "Primary", hue: 267, chroma: 95 },
    { name: "Tinted Neutral", hue: 200, chroma: 29 },
    { name: "Near-achromatic Neutral", hue: 60, chroma: 10 },
  ];
  const threshold = 20;
  const brandHues = palettes.filter((p) => p.chroma >= threshold).map((p) => p.hue);
  ok(brandHues.includes(200), "AC-021: tinted neutral (chroma 29) must be IN brandHues");
  ok(!brandHues.includes(60), "AC-021: near-achromatic neutral (chroma 10) must be OUT of brandHues");
  ok(brandHues.length === 2, `AC-021: expected 2 qualifying brand hues, got ${brandHues.length}`);

  // And the exclusion actually matters to the derivation: with the sub-threshold hue wrongly
  // included, the winning phi can differ from the correctly-filtered result, proving this isn't a
  // vacuous check.
  const correct = D.deriveDataHues(267, brandHues, 8);
  const wronglyIncluded = D.deriveDataHues(267, [...brandHues, 60], 8);
  const correctBrute = bruteForce(267, brandHues, 8);
  ok(correct.phi === correctBrute.phi, `AC-021: correctly-filtered phi ${correct.phi} != brute-force ${correctBrute.phi}`);
  // (no assertion that phi must differ, a coincidental match is possible, but both derivations must
  // independently agree with their OWN brute-force answer, proving the threshold's inclusion/exclusion
  // is actually read by deriveDataHues rather than ignored)
  const wrongBrute = bruteForce(267, [...brandHues, 60], 8);
  ok(wronglyIncluded.phi === wrongBrute.phi, `AC-021: wrongly-included-set phi ${wronglyIncluded.phi} != its own brute-force ${wrongBrute.phi}`);
}

// ---- AC-020e: no NaN at the 359/0 hue wrap ----
{
  for (const primary of [359, 0.5, -3]) {
    const { phi, hues } = D.deriveDataHues(primary, [10, 200, 355], 8);
    ok(Number.isFinite(phi), `wrap primary=${primary}: phi is not finite (${phi})`);
    ok(hues.every((h) => Number.isFinite(h) && h >= 0 && h < 360), `wrap primary=${primary}: hues ${JSON.stringify(hues)} contain NaN or out-of-range values`);
  }
}

if (fails.length) { console.error(`data-hues FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("data-hues PASS: spacing, phi-maximisation (brute-force cross-checked), tie-break, chroma threshold, and the empty/wrap edge cases hold");
process.exit(0);
