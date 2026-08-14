# Preset revision ledger — the per-category re-reasoning program

Program state for the register-layer revision (ADR-022; plan ratified 2026-07-30): every preset's
`type.registers` re-reasoned from its own story via `docs/reference/typography/intended-use.md`
Layer 3, scored by `docs/reference/rubrics/type-rubric.md`, one category per PR. Per-palette
rationale lives IN the spec (`type.note`) — this ledger tracks only program state. Loop per
category: `palette-researcher` draft → reconcile + gates → `design:font-choice-checker` → PR.

| Category | Issue | State | PR | Date | Notes |
|---|---|---|---|---|---|
| architecture (pilot) | #408 | done | #417 | 2026-07-30 | 34/48 revised; checker 51/60 (2 passes); pilot ruling added to the rubric (real-cut cores, styleName-within-family); lessons → follow-up issue |
| brands | #409 | done | #420 | 2026-07-30 | 3/7 revised (Nike/BK/Corsa on real faces + cuts); Maison stays untyped BY RULING (color-only story, no typographic evidence — typing it would be invention); Adia was under the same ruling until 2026-08-14, when the brand owner supplied the evidence (GT America + GT America Mono, semantic weights) and it gained a real-cut `product`-treatment preset; BZZR/Modal jazz pass-throughs untouched; checker 49/60 + fixes (Nike UI-ladder fabrication caught → no-core-weight actionable shape) |
| cuisine | #410 | done | #421 | 2026-07-30 | 44/48 revised (non-ladder cores on static CJK/Indic/Arabic/Thai/display families — the dominant class); Vol II Italian untouched; Söhne umlaut restored; checker 52/60; Forma DJR + static-core pre-check lessons → #418 |
| film | #411 | done | #422 | 2026-07-30 | 48/48 revised (~200/240 cores fictional); 11 story-driven family refusals, all checker-upheld (Shining→Overlook Helvetica, Witch→IM Fell, Dune→Archivo Expanded, Vol VII Optima→locale-correct Noto Serifs…); axis-FLOOR fiction ruling minted; checker 52/60 |
| literature | #412 | done | #423 | 2026-07-30 | 48/48 revised (~all cores fictional 5-unit values); ~20 family swaps upheld (Fette Fraktur out ×4, Alice→Caslon, Beat volume, LOTR→IM Fell); researcher patch shipped 123 malformed ladders — schema gate caught, reconciler conversion upheld by checker; data-register lesson corrected (flows to Kicker only); checker 51/60 |
| music | #413 | done | #424 | 2026-07-30 | 48/48 revised; 10 genre-authenticity swaps all upheld ("genre font ≠ the genre's type" — punk's real machines, Graffonti out of hip-hop, Cinzel out of classical); single-cut-ceiling lesson applied; decorative-face -mono fills fixed via data.voices opt-ins; checker 50/60 |
| nature | #414 | done | #425 | 2026-07-31 | 46/48 revised; one swap (alpine Cinzel/Copperplate → hut-sign Archivo Narrow), 4 documented-tradition keeps upheld; 27 silently-clamped actionable cores now declared ≤450 in-spec; optical-weight ceiling ruling minted into the rubric; checker 53/60 (highest yet) |
| travel | #415 | done | #426 | 2026-07-31 | 48/48 revised; reflex families out wholesale (Bello/Trajan/Giza/Knockout/P22 Secession); 41 of 48 Sub-title opt-ins dropped; checker caught a fabricated Neutraface inventory + FF Tisa release ambiguity + the 75-Black contradiction — all fixed + re-verified (51/60); named-numbered-styles disqualifier + downward optical ceiling minted |

Epic: #407 — **CLOSED 2026-07-31, all 8 categories done** (PRs #417/#420/#421/#422/#423/#424/#425/#426).

Program totals: 341 typed presets re-reasoned; ~310 revised. The dominant defect everywhere was
face-reality fiction (cores/siblings naming cuts that don't exist); ~50 story-driven family
corrections, every one upheld under independent review; 8 program rulings minted into
`docs/reference/rubrics/type-rubric.md` along the way. Checker scores 50–53/60 across the runs.
Follow-up work (font-cuts.json expansion, mapper ladder-snapping, name/inventory normalization,
new schema checks) is consolidated on issue #418.

Done = the category's PR merged with gates green, checker verdict recorded here, ledger row
updated in that same PR. Program close-out (canon amendments from lessons, epic close) is Phase 4.
