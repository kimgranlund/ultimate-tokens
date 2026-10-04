// controls.mjs, the one resolver for a brand kit's tonal controls (vanilla ESM, pure, no DOM).
//
// resolveControls(src) pulls the controls a ramp, a prime ladder and the role chain read out of a
// State-shaped object, defaulting any missing from tonal.js's DEFAULT_CONTROLS. The canvas
// (ui/model.mjs: projectView, stateOf, paletteKeyColors) and every exporter (exports.js:
// derivedAll) resolve through this one function, so a control is defaulted in exactly one place
// and the two paths can never disagree about what an absent field means.
//
// Names are the exporter-facing ones: `baseChroma`, not the document's own field (AC-004 bars the
// retired name from src/engine in any form). model.mjs renames the document's field onto
// `baseChroma` at its one boundary before calling in.

import { DEFAULT_CONTROLS } from "./tonal.js";

export function resolveControls(src) {
  const out = {};
  for (const k of Object.keys(DEFAULT_CONTROLS)) out[k] = src[k] ?? DEFAULT_CONTROLS[k];
  // baseChroma (SPEC 0.3.0 REQ-002/004): the GLOBAL fallback group damper value (#785), used only when a
  // palette's group carries no value of its own. primeChroma (REQ-008/050..057): the prime system's
  // own chroma control. Both default 100, tonal.js stays group- and intensity-unaware.
  out.baseChroma = src.baseChroma ?? 100;
  out.primeChroma = src.primeChroma ?? 100;
  // paletteGroups (REQ-002/008): each group's own { baseChroma, primeChroma, locked? }, default-filled
  // by model.mjs's resolvePaletteGroups() before a state reaches an exporter.
  out.paletteGroups = src.paletteGroups ?? {};
  return out;
}
