---
kind: question
plan: pane-context
unit: U5
seat: builder
written: 2026-10-03
---

# U5 X1: the okhsl `min` is live for anchors with OKHSL s above 1

🟡 Needs a ruling before `src/engine/tonal.js` is edited.

| Fact | Evidence |
|---|---|
| At group 100, `groupIntendedS = 1`, so the target is `min(1, anchor.okhsl.s)` | `tonal.js:1358`, `:611` |
| s <= 1: the target is the anchor's own s, dead (X1's `0/94900` holds) | X1 |
| `rgbToOkhsl` returns s > 1 for sRGB hexes near the gamut boundary | 154,151 of 1,029,272 sampled; max 1.0123 at `#FFEF98` |
| The corpus has 9 such anchors, all at s <= 1.0000026, so it reads 0 | probe over the 3,396 corpus anchors |
| Plain removal on 483 boundary anchors with s > 1 (perceptual, peak; chroma 100/50; lift 0/40; both stop sets) | `762/170016` cells, `324/3864` palettes, max dC 1.36 CAM16, all in gamut; worst `#550088` peak 350 `#A363DC` to `#A065DC` |

## Options

| Option | What | Cost |
|---|---|---|
| A (recommended) | `intendedS = anchor.okhsl.s`; `anchorChromaBasis` loses `min` and `climb` (even-only blend) | user anchors with s > 1 move up to 1.36 C; C5.2 narrows to "corpus and ramp-identity byte-neutral"; handoff and CHANGELOG say so |
| B | blend toward `min(1, s)`, named as the OKHSL saturation bound, not the group | byte-neutral everywhere, but it is the R69 construction under a new name |

Default if unanswered: none, the builder waits on tonal.js and does the record items meanwhile.
