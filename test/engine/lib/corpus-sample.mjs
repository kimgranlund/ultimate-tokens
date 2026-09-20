// lib/corpus-sample.mjs: the ONE seeded sampler over the curated corpus (#686 determinism, #713 U1).
// Every file that draws a canary sample from the 343 curated documents imports this instead of
// carrying its own picker.
//
// WHY THIS EXISTS. test/engine/curated-contrast.mjs used to pick `vols[hash % vols.length]`, where
// `vols` was the FIRST-APPEARANCE order over that category's loaded `PRESETS` array. Reversing a
// category's `PRESETS` moved the pick in 7 of 7 gallery categories (measured at 36ce7777, planner's
// probe for #713). Sorting the volume list before hashing removes the order dependency: the same
// volume is picked whether the corpus mirror loads forward, reversed, or shuffled.
//
// This module keeps no module state: nothing a call order, or an import order across files, could
// poison. Every export here is a pure function of its own arguments.

export const SAMPLE_SEED = 0; // bump to rotate every category's canary volume

const fnv1a = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
};

// pickVolume(cat, presets, seed = SAMPLE_SEED) -> the one volume label `cat` canaries this seed.
// `presets` is that category's own PRESETS array (or any array of documents carrying `.vol`); the
// volume LIST is de-duplicated and SORTED before hashing, so the pick does not depend on the array's
// own order. Returns undefined if no preset carries a `.vol`.
export function pickVolume(cat, presets, seed = SAMPLE_SEED) {
  const vols = [...new Set((presets || []).map((p) => p.vol))].sort();
  if (!vols.length || vols.some((v) => v === undefined)) return undefined;
  return vols[fnv1a(`${cat}#${seed}`) % vols.length];
}

const docKey = (doc) => `${doc.category}/${doc.name}`;

// contentKey(doc) -> a canonical string built from the document's OWN fields, used only to break a
// sort tie between two documents that already share both `category` and `name`. Sort ties are
// otherwise resolved by Array#sort's stability, which is INPUT ORDER: the exact thing #686 exists to
// remove. Comparing by content instead means the order stays the same no matter which position
// either document arrived at, so it is a real tiebreak rather than a second name for "whatever order
// the array happened to be in."
const contentKey = (doc) => JSON.stringify({ vol: doc.vol, curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax, palettes: doc.palettes });

// sampleCorpus(byCategory, seed = SAMPLE_SEED) -> curated documents only, each tagged with its own
// `category`, sorted by category then by document name then by content, so the RESULT is a pure
// function of the set of documents each category exposes and the seed, never of the order any
// mirror loaded in and never of Array#sort's own stability. `brands` (the identity tier) always
// ships in full; every other category contributes only the one volume `pickVolume` names for it.
//
// Throws if a category ever holds two documents with the same name: `docKey` is how this module and
// its callers tell documents apart, and a collision there is a corpus defect, not something a sort
// order can paper over.
export function sampleCorpus(byCategory, seed = SAMPLE_SEED) {
  const docs = [];
  for (const cat of Object.keys(byCategory).sort()) {
    const presets = byCategory[cat] || [];
    if (cat === "brands") {
      for (const p of presets) docs.push({ ...p, category: cat });
      continue;
    }
    const vol = pickVolume(cat, presets, seed);
    if (vol === undefined) continue;
    for (const p of presets) if (p.vol === vol) docs.push({ ...p, category: cat });
  }
  const seen = new Set();
  for (const d of docs) {
    const k = docKey(d);
    if (seen.has(k)) throw new Error(`corpus-sample: category "${d.category}" holds two documents named "${d.name}", so docKey is not unique`);
    seen.add(k);
  }
  docs.sort((a, b) => {
    if (a.category !== b.category) return a.category < b.category ? -1 : 1;
    if (a.name !== b.name) return a.name < b.name ? -1 : 1;
    const ka = contentKey(a), kb = contentKey(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  return docs;
}
