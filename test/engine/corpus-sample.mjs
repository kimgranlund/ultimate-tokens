#!/usr/bin/env node
// test/engine/corpus-sample.mjs: proves the shared sampler (lib/corpus-sample.mjs, #686 determinism,
// #713 U1) is a pure function of the document SET and the seed: the same volume per category is
// picked whether a corpus mirror loads forward, reversed, or shuffled by a fixed LCG. Registered in
// TESTS.
import { sampleCorpus, pickVolume, SAMPLE_SEED } from "./lib/corpus-sample.mjs";
import { defaultDocument } from "../../src/ui/model.mjs";

const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
const fails = [];
const FAIL = (m) => fails.push(m);

const byCategory = {};
for (const cat of CATS) {
  const { PRESETS } = await import(`../../src/ui/categories/${cat}.js`);
  if (!Array.isArray(PRESETS) || !PRESETS.length) { FAIL(`category "${cat}" exposed no PRESETS: gen:categories did not run, or the mirror moved`); continue; }
  byCategory[cat] = PRESETS;
}

// a fixed LCG shuffle, seeded, so the "shuffled" leg is reproducible run to run.
function lcgShuffle(arr, seed) {
  let s = seed >>> 0;
  const next = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const forwardBy = byCategory;
const reversedBy = Object.fromEntries(CATS.map((c) => [c, (byCategory[c] || []).slice().reverse()]));
const shuffledBy = Object.fromEntries(CATS.map((c) => [c, lcgShuffle(byCategory[c] || [], 0x5eed0000 + c.length)]));

// includes each document's own content (not just category/name) so a content-order flip between two
// documents sharing a category and name is visible here too, not just to a human reading a diff.
const sampleKey = (docs) => docs.map((d) => `${d.category}/${d.name}/${JSON.stringify(d.palettes)}`).join("|");
const paletteCount = (docs) => docs.reduce((a, d) => a + (d.palettes ? d.palettes.length : 0), 0);

if (!fails.length) {
  const forward = sampleCorpus(forwardBy);
  const reversed = sampleCorpus(reversedBy);
  const shuffled = sampleCorpus(shuffledBy);

  const kf = sampleKey(forward), kr = sampleKey(reversed), ks = sampleKey(shuffled);
  if (kf !== kr || kf !== ks) {
    const moved = CATS.filter((cat) => {
      const vf = pickVolume(cat, forwardBy[cat]);
      const vr = pickVolume(cat, reversedBy[cat]);
      const vs = pickVolume(cat, shuffledBy[cat]);
      return vf !== vr || vf !== vs;
    });
    FAIL(`the pick moved with load order in categor${moved.length === 1 ? "y" : "ies"} ${moved.join(", ") || "(none named: the document set itself differs)"}`);
  } else {
    console.log(`  (forward = reversed = shuffled: ${forward.length} documents, ${paletteCount(forward)} palettes)`);
  }

  const seed1 = sampleCorpus(forwardBy, 1);
  if (sampleKey(seed1) === kf) FAIL(`seed 1 picked the identical sample as seed ${SAMPLE_SEED}: the seed is not wired into the pick`);
  else console.log(`  (seed ${SAMPLE_SEED} != seed 1: ${seed1.length} documents)`);

  const brandsDoc = forward.filter((d) => d.category === "brands");
  const brandsTotal = (byCategory.brands || []).length;
  if (brandsDoc.length !== brandsTotal) FAIL(`brands sampled ${brandsDoc.length} of ${brandsTotal}: the identity tier must ship in full`);

  const kit = defaultDocument();
  if (!kit || !Array.isArray(kit.palettes) || kit.palettes.length !== 16)
    FAIL(`the default kit is not importable, or does not carry 16 palettes (${kit && kit.palettes ? kit.palettes.length : "n/a"})`);

  if (forward.length < 30) FAIL(`sample is ${forward.length} documents, expected at least 30`);

  // the sampler's order is total because its KEYS are unique, not because of a tiebreak: the real
  // corpus has zero (category, name) collisions, and this checks that directly rather than trusting
  // sampleCorpus not to have thrown.
  const keys = forward.map((d) => `${d.category}/${d.name}`);
  if (keys.length !== new Set(keys).size)
    FAIL(`the sample carries ${keys.length} documents but only ${new Set(keys).size} distinct (category, name) keys`);
  else console.log(`  (${keys.length} document keys, all distinct)`);

  // synthetic duplicate-name leg (#686, U1-6 revision 5): a category holding two documents under one
  // name must throw before any sort runs, never fall through to a silently reordered or duplicated
  // result. This is the only place that guarantee has coverage inside npm test.
  const dup = { brands: [
    { name: "Dup", vol: "I", palettes: [{ name: "A" }] },
    { name: "Dup", vol: "I", palettes: [{ name: "B" }] },
  ] };
  let dupThrew = false, dupMessage = "";
  try { sampleCorpus(dup); } catch (e) { dupThrew = true; dupMessage = e.message; }
  if (!dupThrew) FAIL(`sampleCorpus accepted a synthetic corpus with two "brands" documents named "Dup" instead of throwing`);
  else if (!/Dup/.test(dupMessage)) FAIL(`sampleCorpus threw on the duplicate-name fixture, but its message did not name "Dup": ${dupMessage}`);
  else console.log(`  (duplicate-name leg: sampleCorpus threw as expected: ${dupMessage})`);
}

if (fails.length) {
  console.error(`\n${fails.length} failure(s):`);
  for (const f of fails) console.error(`  - ${f}`);
  console.error(`\nFAIL: ${fails.length} failure(s)`);
  process.exit(1);
}
console.log(`\nPASS: corpus sample is a pure function of the document set and the seed`);
process.exit(0);
