# Type Rubric — one preset's register design, scored against its story

> Scores ONE palette's `type.registers` declaration (ADR-022) against that palette's own story
> (`kicker` / `source` / `refuses`) and the intended-use canon
> (`docs/reference/typography/intended-use.md`). Two layers, same contract as `quality-rubric.md`:
> **Layer A** is judgment, scored 0–10 per dimension (target ≥ 48/60, no dimension below 6;
> score → fix weakest → re-score). **Layer B** is the mechanical gate — any FAIL blocks the
> revision regardless of Layer A score. Used by the preset revision program (Phase 3): the
> drafter (`palette-researcher`) self-scores, the reconciler re-scores, `design:font-choice-checker`
> is the independent seat.

## Layer A — judgment dimensions

| # | Dimension | Question |
|---|-----------|----------|
| 1 | Register fit | Does each declared register's face serve BOTH the register's intent (anthemic shouts, functional disappears…) and its voices' jobs (intended-use Layer 1)? A face that fights its voice's "must serve" column fails here even if it renders. |
| 2 | Story grounding | Do the choices trace to the palette's OWN story — the narrative's era/material/mood, not a generic "elegant serif" reflex? The same test as color: sampled from the real subject, not the idea of it. |
| 3 | Refusal alignment | The palette names what it refuses. Does the type refuse it too? (A palette refusing "calm and desaturated" must not carry a timid type system; one refusing "cliché luxury" must not lean on the stock high-contrast-serif move.) |
| 4 | Coherence | One voice across the registers — a system, not a specimen sheet. Base treatment, families, and per-register deviations read as a single decision. |
| 5 | Face reality | Beyond the mechanical gate: are the named cuts/weights the RIGHT real cuts (nearest genuine face, no fantasy Semi-bold), and is the family's cut inventory actually known (font-cuts.json or a cited source in `type.note`)? |
| 6 | Restraint | Voices no register opts in stay on the quiet default. Every `voices` opt-in and every `styleName` is EARNED by the story — as little declaration as does the job. |

## Layer B — mechanical gate (pass/fail; any FAIL blocks)

- [ ] `node test/engine/categories.mjs` green — schema (register shape, ownership, styleName tier,
      %-strings) · faithful · uiladder · faces · cuts · purpose all pass on the regenerated preset.
- [ ] Every palette CHANGED by the revision carries a one-line `type.note` stating the reasoning
      (the in-spec rationale; the mapper ignores it, the ledger links to it).
- [ ] Any `styleName` or non-default weight on a family NOT in `docs/reference/data/font-cuts.json`
      names its cut source in `type.note` (the face-existence gate skips unknown families — the
      burden of proof moves to the note).
- [ ] No character override on UI-control/UI-widget (ladders-only law — the gate enforces `font`
      only; this line exists so a reviewer checks the INTENT too, not just the field name).
- [ ] The revision touched ONLY this category's spec JSON + its regenerated module (+ ledger row)
      — mapper, gate, and engine are frozen during Phase 3.
