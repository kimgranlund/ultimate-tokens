// layer-pins.mjs, a document's compute-layer pins (ADR-034, compute-layers #788; vanilla ESM, pure,
// no imports, no DOM).
//
// A document records, per layer id, the version of that layer it was made with: `doc.layers =
// { [id]: version }`. A fresh document and a preset pin each layer's latest version; a stored
// document keeps its own pins, so a later layer version never changes a kit already made (R100).
// This module is the pin rule alone, with no layer code, so persist.js (hydrate's clamp, the v10
// stamp) applies it without importing the layer registry and every engine module it pulls in.
//
// LATEST, the version a new document pins for each shipped layer, in registry order.
// test/engine/layer-pins.mjs checks it equals latestOf(REGISTRY) in layers.mjs, so a version bump
// registers the new layer there and moves its number here, in the same change.
export const LATEST = Object.freeze({ controls: 1, ramp: 2, prime: 1, roles: 1, type: 1, geometry: 1 });

// pinsOf(stored, latest), one pin per id of `latest`, read off a stored `layers` map: a missing or
// non-numeric pin is version 1 (the clamp for a malformed pin; a document saved before pins is
// stamped explicitly by persist.js's v10 entry), a number is rounded and clamped to [1, latest[id]],
// and an id `latest` does not name is not carried. hydrate, compute and the export stamps all read
// pins through this one rule.
export function pinsOf(stored, latest = LATEST) {
  const src = stored && typeof stored === "object" ? stored : {};
  return Object.fromEntries(Object.entries(latest).map(([id, top]) => {
    const v = src[id];
    return [id, typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(Math.round(v), 1), top) : 1];
  }));
}
