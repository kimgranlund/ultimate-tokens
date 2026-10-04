PASS
R98: none found. The unit adds no code, flag, shim or fallback; `test/engine/tonal.mjs` changes are `//` lines only (non-comment changed lines `0`).

# Review pane-context U6, pass 2 (#785)

| Field | Value |
|---|---|
| Seat | reviewer-l3, fresh context |
| Branch | `unit/pc-U6` @ `5e4ac549` against base `24b9d01c`; pass 1 record `daef1140` (FAIL) |
| Criteria | C6.1 to C6.5, `plan/pane-context:.sdlc/plans/pane-context.md` section `### U6`, lane widened (knowledge-02 section 8.1 in lane) |
| Load | 8 matching processes, all idle dev servers at 0 to 1 percent CPU; competing gate processes `0` |
| Scratch | `/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U6-rev2/` (`act6.mjs`, `npmtest.log`, `build.log`) |

## Pass 1 findings re-checked

| Pass 1 finding | State | Evidence | Control |
|---|---|---|---|
| 1 SPEC REQ-003 and AC-006 | 🟢 | Banner `:14` names REQ-003 and AC-006. REQ-003 `:85-97` now reads "was byte-identical to 0.2.0 for every input ... Since #785 (R94) this holds for chroma-100 subjects only", and the IF AND ONLY IF clause reads "since #785 that clause holds only for a palette at chroma 100 in a group at 100". AC-006 `:439-441` says the pin changed (512 of 800 cells) and pins the damped construction for 14 of 16 | the same lines at `24b9d01c` read "is byte-identical ... for every input" and "with its 0.2.0 pin unchanged" |
| 2 SKILL, glossary, quality-rubric | 🟢 | `color-math/SKILL.md:55-56`, `glossary.md:26`, `quality-rubric.md:50` each carry "at group base chroma 100 (a group value below 100 damps the whole ramp, stop 500 included, R94)". `act6.mjs` on the 16 default anchored palettes: stop 500 equals the anchor `16/16` at chroma 100 and `2/16` at their own stored chroma (29, 95, 33, 40, 55 damp it), in all three tone modes, so the qualifier is the true one | the two chroma-100 defaults (Secondary, Warning) are exactly the `2/16`, so the probe tells damped from undamped |
| 3 EX-1 peak | 🟢 | EX-1 `:346` names "20/25 perceptual, 22/25 peak and 13/25 even", my pass 1 `ex1.mjs` counts | at `6d013771` (pass 1 head) the EX-1 sentence named perceptual and even only (`git show 6d013771:docs/spec/spec-muted-base-key-spikes.md`, `:342`) |
| 4 `tonal.mjs:599` framing | 🟢 | `tonal.mjs:599-600` now opens "HISTORICAL framing (superseded for the 14 sub-100 defaults by #785 ...): paletteStops was byte-identical" | non-comment changed lines over `git diff -U0 24b9d01c HEAD -- test/engine/tonal.mjs` read `0`; the same count over `a308d8b5..24b9d01c` (a range with code edits) reads `167` |
| Builder extra, `knowledge-02:277` | 🟢 | section 8.1 now reads "byte-identical to the pre-groups engine only for a chroma-100 subject in a group at 100", keeps the old IF AND ONLY IF as "Before #785 the rule read". Agrees with `paletteStops` `tonal.js:946` (any chroma other than 100 returns `dampStops` of the at-100 render) and with the section 8.1 table (all four groups at 100) | `:264` (at 100 the multiply is the identity) and `:431`, `:451` already said the same; no contradiction left inside 8.1 |

## Gates

| Check | Result | Control |
|---|---|---|
| `npm test` (NODE_OPTIONS unset) | rc 0, `✓ all 54 test files passed`, porcelain `0` lines after | n/a |
| `npm run build` | rc 0, `wrote figma/plugin/ui.html 4170.7 KB`, porcelain `0` lines after | n/a |
| `baseline-agrees-check.sh` | `stale total: 0` | n/a |
| `card-amendment-check.sh` | `stale total: 0` | n/a |
| U+2014 in `git diff 24b9d01c HEAD` | `0`; `em-dash.mjs` passed inside `npm test` | the same grep on a planted U+2014 line reads `1` |
| Lane, `git diff --name-only 24b9d01c HEAD` | ADR-026 card, `index.md`, SPEC, `tonal.mjs`, SKILL, glossary, quality-rubric, knowledge-02, the handoff, the pass 1 review. All named in C6.1 to C6.3 or the widened lane; no regenerated asset | n/a |

## Findings (by severity)

1. 🔴 High, out of lane (Orchestrator: route before pre-land pass 3). `docs/reference/rubrics/acceptance-criteria.md:30-34` (AC-T6) still states "`paletteStops(...)` stop 500's hex `=== anchor` in each of `perceptual`, `peak` and `even` for every anchored palette whose source sits inside the ramp window", with no group or chroma qualifier. `act6.mjs` reads `2/16` at the defaults' own chroma in every mode. It is the same rubric class as pass 1 Finding 2's `quality-rubric.md` line, and it would grade a correctly qualified document as wrong. The builder's handoff sweep says only the three Finding 2 files and `knowledge-02:277` were left; this one was missed (the claim spans two lines). Fix: copy the `quality-rubric.md:50` qualifier.
2. 🟡 Low, out of lane (test header, comment-only fix). `test/engine/anchor.mjs:463` opens the C3 block with "for every anchored palette, paletteStops(...) stop 500 equals `anchor`", unqualified. The gate renders through `projectView` at group 100 and the qualifier exists 340 lines later at `:803-805`, so it is not wrong about the gate, only stated wider than the engine.
3. 🟡 Low, in lane. Banner `docs/spec/spec-muted-base-key-spikes.md:14`: the second sentence starts lowercase ("... 30/60 (EX-2's ...). the byte identity of EX-1 ...").
4. 🟢 Note, outside this sweep's fact. The SPEC still states the pre-R96 Material default 30 at `:73` (REQ-001 defaults), `:95` (REQ-003 "Neutral (29 vs 30)"), `:443` (AC-007, Neutral equals its chroma 30 ramp) and `:659`. The banner's general "Material defaults to 100/60, not 30/60" covers the fact; only EX-2 is named. A pre-land pass may want AC-007 named.

Not counted, checked: `src/engine/tonal.js:633` (the `paletteStopsAnchored` header: that function is reached only at chroma 100, `tonal.js:946`, so "stop 500 VERBATIM" is true of it); `src/ui/persist.js:150` (field doc, live anchor); `knowledge-02:124` (tone pivot, not hex); `lld-muted-base-key-spikes.md:169` (live-derived rule); `decision-records.md`, CHANGELOG, archives, handoffs, questions (history). `plugin/ultimate-tokens` and `mcp` carry no stop-500 or `paletteStops` identity claim.

## Verdict

PASS: C6.1 to C6.5 met on `5e4ac549`, pass 1 findings 1 to 4 closed, gates green with a clean tree. Finding 1 is outside the builder's lane and does not fail the unit, but it is the same stale fact this unit exists to close; the Orchestrator should fold it in (widen U6 once more or add a one-line unit) before pre-land pass 3.
