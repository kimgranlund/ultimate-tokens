// collections.js — THE canonical Figma collection names (ADR-016, one shared constant pair ending the
// three-way split the 2026-07-17 librarian review found: exportUI3 said "Color / Primitives" while the
// plugin created "Color Primitives"). Every engine emitter + the app import from HERE; the two sandbox
// runtimes (figma/plugin/code.js, figma/binder/.../code.js) cannot import ESM and carry literals that a
// parity gate diffs against these values (test/figma/binder.mjs `collparity` gate).
// Content-named, tier-matched (#491 ruling, 2026-09-02): "Color Primitives" · "Color Roles" (was
// "Color Semantic", was "Color Modes") · "Type Primitives" (was "Font Primitives" — the product's own
// "Type" vocabulary, not "Font") · "Geometry" (was "Breakpoints", a REVERT — the mode axis stays
// Desktop/Tablet/Mobile; the name describes content, not the mode axis, matching the color pair).
// Renames ride FIGMA_MIGRATIONS (TKT-0012) so existing user files adopt by id, never by prune.
export const COLLECTIONS = {
  colorRaw: "Color Primitives",
  colorSemantic: "Color Roles",
  breakpoints: "Geometry",
  fontPrimitives: "Type Primitives",
};
