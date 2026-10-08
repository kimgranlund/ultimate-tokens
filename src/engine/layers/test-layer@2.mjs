// test-layer@2.mjs, a synthetic frozen layer version (compute-layers #788, ADR-034; vanilla ESM, pure,
// no imports, no DOM). FROZEN: never edited once landed; FROZEN.json holds its SHA-256 and
// test/engine/layers.mjs fails on any change. It is registered only by test/engine/layer-pins.mjs,
// never in the shipped LAYERS, so it proves a document pinned to version 2 runs this file's code.
// Its output differs from every other test-layer version's on any document with two palettes.
export const layer = Object.freeze({
  id: "test-layer",
  version: 2,
  inputs: Object.freeze(["palettes"]),
  outputs: Object.freeze(["test-layer.out"]),
  run: (doc) => ({ palettes: (doc.palettes ?? []).length, names: (doc.palettes ?? []).map((p) => p.name).reverse().join("|") }),
});
