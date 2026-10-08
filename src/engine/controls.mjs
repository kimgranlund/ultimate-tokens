// controls.mjs, the one resolver for a brand kit's tonal controls (vanilla ESM, pure, no DOM).
//
// resolveControls(src) pulls the controls a ramp, a prime ladder and the role chain read out of a
// State-shaped object, defaulting any missing from tonal.js's DEFAULT_CONTROLS. The canvas
// (ui/model.mjs: projectView, stateOf, paletteKeyColors) and every exporter (exports.js:
// derivedAll, through layers.mjs's compute) resolve through this one function, so a control is
// defaulted in exactly one place and the two paths can never disagree about what an absent field
// means (ADR-034).
//
// Names are the exporter-facing ones: `baseChroma`, not the document's own field (AC-004 bars the
// retired name from src/engine in any form). model.mjs renames the document's field onto
// `baseChroma` at its one boundary before calling in.

import { DEFAULT_CONTROLS } from "./tonal.js";

export function resolveControls(src) {
  const out = {};
  for (const k of Object.keys(DEFAULT_CONTROLS)) out[k] = src[k] ?? DEFAULT_CONTROLS[k];
  // baseChroma and primeChroma (SPEC 0.3.0 REQ-002/004/008, #804): the two GLOBAL k factors,
  // multiplied onto every palette by resolve.mjs (Base chroma onto each palette's own `baseChroma`,
  // Prime chroma onto every prime strip). Both default 100; tonal.js stays chroma-resolver-unaware.
  out.baseChroma = src.baseChroma ?? 100;
  out.primeChroma = src.primeChroma ?? 100;
  return out;
}
