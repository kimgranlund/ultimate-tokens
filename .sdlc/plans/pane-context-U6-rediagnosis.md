# pane-context U6 re-diagnosis (verdict pass 1 🔴 at edeeb8d9)

Source: `.sdlc/verdicts/pane-context-U6.md`. Builder passes so far: 2 (pass 1 review FAIL at daef1140, pass 2 at edeeb8d9). The next builder pass is pass 3, which needs the owner.

## What went wrong

U6's criteria named the five files the pre-land pass 2 record listed, then each review and verdict found more copies of the same stale claim ("stop 500 is the anchor verbatim in every mode", "paletteStops matches 0.2.0 byte for byte"). The class is one sentence in many spellings, and each sweep so far was a single-line grep on one spelling. The claim wraps across lines in SKILL, rubrics and the SPEC, and it hides in code comments, so each sweep found a different subset. The criteria enumerated files; they should have defined the class and the sweep.

## The complete list (verifier's tree grep at edeeb8d9, generated assets, verdicts, reviews, handoffs, questions and archives excluded)

| File | Line | Fix |
|---|---|---|
| `.claude/skills/color-math/references/foundations.md` | 132 | add the group-100 qualifier (copy `knowledge-02-tonal-scale.md:428`) |
| `src/engine/tonal.js` | 631-633 | comment: true of `paletteStopsAnchored` itself; add "(reached only at group 100, `paletteStops`; R94 damps below)" |
| `src/ui/persist.js` | 150 | comment, same qualifier |
| `scripts/gen-categories.mjs` | 131 | comment, same qualifier |
| `docs/lld/lld-muted-base-key-spikes.md` | 169 | name it in the LLD's #785 banner or qualify the `chroma == rampChroma` rule |

The `tonal.js` and `persist.js` comments move the bundles (`figma/plugin/ui.html`, `describe-mcp-assets.js`), so the ui.html KB figure and the baseline must be re-checked.

## Plan for a pass 3 (needs the owner)

1. Widen U6's lane to the five rows above and the regenerated assets and baseline figure, and say in C6.1 that the sweep is the class, not a file list: collapse line breaks, then grep `stop 500`, `verbatim`, `rampChroma`, `byte for byte`, `0.2.0 output` over `docs`, `.claude`, `plugin`, `mcp`, `src`, `scripts`, `test`, with history (amendments, CHANGELOG, archives) excluded.
2. One builder pass (l4, not below l3), wording and comments only, the sweep result attached to the handoff as a list with a disposition for every hit.
3. Reviewer-l3 and verifier-l2 as before.

## Default

Pass 3 is not dispatched until the owner answers (`.sdlc/questions/pane-context-prepr-p2.md`, Question 2).
