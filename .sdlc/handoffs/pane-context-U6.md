# Handoff: pane-context U6 (#785)

Branch: `unit/pc-U6` (off `plan/pane-context` @ 24b9d01c), head recorded in the commit below.

## Files

| File | Change |
|---|---|
| `.sdlc/records/cards/ADR-026.md` | Decision line: stop 500 is the anchor only at group 100 (R94); amended-by row names the five amendments |
| `.sdlc/records/index.md` | line 41 lineage cell names the five amendments |
| `docs/spec/spec-muted-base-key-spikes.md` | #785 banner names EX-1 and AC-003(a); EX-1 and AC-003(a) state the chroma-100-only identity and the damped fixture |
| `test/engine/tonal.mjs` | two comment lines above the `hpg-tonal-intensity-legacy` case header, no code line |

No asset regenerated: `npm test` left the tree clean. `.sdlc/baseline.md` untouched (no ui.html movement). The plan file is untouched (C6.4 belongs to the Orchestrator).

## Ran

| Command | Result |
|---|---|
| `npm test` (NODE_OPTIONS unset, 0 competing gate processes) | all 54 test files passed, exit 0, tree clean after |
| `bash .sdlc/checks/baseline-agrees-check.sh` | `stale total: 0` |
| `node test/repo/em-dash.mjs` | clean (1150 files) |
| `sh .sdlc/checks/card-amendment-check.sh` | `stale total: 0` |
| `FORCE_COLOR=0 node test/engine/tonal.mjs` | exit 0 |
| `git diff --stat 24b9d01c` | the four lane files only |

## Criteria

| # | Evidence |
|---|---|
| C6.1 | `grep -c 'in all three tone modes' .sdlc/records/cards/ADR-026.md` reads `0`; the Decision line reads "at ramp stop 500 only at group 100 (R94: a group value below 100 damps the whole ramp, stop 500 included, ...)"; the amended-by row and `index.md:41` name #701, #725 (R69), #785 (R94 to R98), #766 (R85, R87), #785 (#766) |
| C6.2 | `grep -n 'EX-1' docs/spec/spec-muted-base-key-spikes.md` lists `:14` (the banner) and EX-1 with the chroma-100-only sentence (20/25 perceptual, 13/25 even) |
| C6.3 | `git diff -U0 test/engine/tonal.mjs \| grep '^+[^+]' \| grep -vc '^+//'` reads `0`; the header says 14 of 16 defaults, not pre-0.2.0 identity; SPEC AC-003(a) says the same; `tonal.mjs` exits 0 |
| C6.4 | not this builder's lane (Orchestrator, plan file) |
| C6.5 | the Ran rows above; `git status --porcelain` empty after commit |

## Pass 2 (review pass 1 FAIL, findings 1 to 3; widened lane C6.1, C6.2)

| File | Change |
|---|---|
| `docs/spec/spec-muted-base-key-spikes.md` | banner names REQ-003 and AC-006; REQ-003 engine level and its IF AND ONLY IF clause say the identity holds for chroma-100 subjects only since #785; AC-006 says the 0.2.0 pin changed (#785 regenerated the fixture, 512 of 800 cells); EX-1 sentence adds 22/25 peak |
| `.claude/skills/color-math/SKILL.md` | stop 500 equals the anchor "at group base chroma 100 (a group value below 100 damps the whole ramp, stop 500 included, R94)" |
| `docs/reference/references/glossary.md` | same qualifier in the Anchor entry |
| `docs/reference/rubrics/quality-rubric.md` | same qualifier in the anchored-palette checklist line |
| `docs/reference/references/knowledge-02-tonal-scale.md` | sweep hit (section 8.1, `:277`): the same IF AND ONLY IF byte-identity claim as REQ-003, now chroma-100 subjects only; outside the named lane, same stale fact |
| `test/engine/tonal.mjs` | the `hpg-tonal-intensity-legacy` header line now opens "HISTORICAL framing (superseded ... by #785 ...)"; comment lines only, non-comment changed lines `0` |

Sweep (`in all three tone modes`, `byte for byte`, `byte-identical`, plus an anchor/stop-500 regex, over `docs/`, `.claude/skills/`, `.sdlc/records`, `src/`, `test/`, `plugin/`, `mcp/`): the only live paletteStops or stop-500 identity claims left were the three Finding 2 files and `knowledge-02:277`. Left alone on purpose: `decision-records.md:742` (ADR body, amended at `:792`), `knowledge-02:264` and `:428` (already qualified), SPEC EX-2 "Secondary (chroma 100) is byte-identical" (true, chroma 100), `lld-muted-base-key-spikes.md:169` (derived-live rule, gated by `shell.mjs` ac003b, which already handles #785), `tonal.mjs:679` (carve-out history), CHANGELOG, archives, handoffs, questions.

| Command | Result |
|---|---|
| heavy-process count before `npm test` | `0` |
| `npm test` (NODE_OPTIONS unset), after the last edit | all 54 test files passed, exit 0, tree shows only the intended edits, no regenerated asset |
| `npm run build` | exit 0, `figma/plugin/ui.html` 4170.7 KB, tracked tree unchanged by it |
| `bash .sdlc/checks/baseline-agrees-check.sh` | `stale total: 0` (ui.html KB did not move, no Correction line) |
| `node test/repo/em-dash.mjs` | clean (1152 files) |
| `sh .sdlc/checks/card-amendment-check.sh` | `stale total: 0` |

## Pass 2 continuation (rework note `pane-context-U6-rework.md`, reviewer p2 PASS sweep notes)

| # | Change |
|---|---|
| 1 | `docs/reference/rubrics/acceptance-criteria.md` AC-T6: stop 500 `=== anchor` now "at group base chroma 100 (a group value below 100 damps the whole ramp, stop 500 included, R94)", wording copied from `quality-rubric.md` |
| 2 | `test/engine/anchor.mjs` C3 header (`// ── anchor-ramp` block): same qualifier, comment lines only, non-comment changed lines `0` |
| 3 | SPEC banner `:14`: "The byte identity ..." capitalised |
| 4 | Chose to NAME, not correct: the banner now lists REQ-001's shipped defaults (`:73`), REQ-003's "Neutral (29 vs 30)" (`:95`), AC-007's `chroma 30` Neutral ramp (`:443`), G2 (`:659`) and the Open follow-up (`:665`) as the pre-#785 record that stays as written (EX-2 was already named). Reason: these are ratified-history rows of a superseded-in-part SPEC, and the banner is the SPEC's own mechanism for that |
| 5 | Multi-line re-sweep (whitespace-collapsed, `stop 500` near `anchor` plus an equality word, over `docs/`, `.claude/skills`, `plugin/`, `mcp/`, `src/`, `test/`, `.sdlc/records`): one more live hit fixed, `glossary.md` Lift entry ("stop 500 stays byte-exact to the anchor at any lift") now carries "(at group base chroma 100, R94)". Already qualified or about the pre-damper construction, left: ADR-026 body and amendments, `knowledge-02` `:264` `:428` and the rows below, `anchor.mjs:1503-1507`, `tonal.mjs` construction comments |

Not touched, out of lane (src comments, editing them moves the bundles): `src/engine/tonal.js:633` ("renders stop 500 as that anchor's OWN color VERBATIM, in every tone mode", the anchored builder's own contract, true before `dampStops` runs) and `src/ui/persist.js:150` ("the ramp's stop 500 renders verbatim"). The Orchestrator can widen the lane if wanted.
