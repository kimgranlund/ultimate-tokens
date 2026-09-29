---
kind: verdict
plan: docs-repair
unit: U7
ticket: "#751"
branch: unit/dr-U7
base: 282fca8d
grade: verifier-l1 at pass 1; pass 2 verifier-l2 standing in for verifier-l3 (opus l7 build, same family, ruling b9044bb), the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-29
---

# Verdict docs-repair U7 · 🔴 · the new README says the All button appears once a breakpoint mode exists; Tablet and Mobile always exist, so All always shows

verdict: 🔴
sha: 96455bdd68437c9b5577d29c613f818ddf50ba89

Head `96455bdd`; the handoff names `89b01d95` (README `## Views and sections`, `.sdlc/architecture.md` DD9 and DD41). Criteria: plan revision 14 at `5a404495`, merged into the unit at `69dc3804`. B `282fca8d`. The evidence run was verifier-l1 (Opus 5.5) in shared clones under the seat's job tmp. The seat reread the 🔴 row itself. `verdict.py check` exits `0` on the handoff, the review and (against `5c139146`) `.sdlc/architecture.md`.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| README All button | 🔴 | `README.md:160-161`: `Breakpoint modes sit beside it, and once one exists an **All** button shows every breakpoint side by side`; Geometry at `:164-165` has `the same breakpoint modes and All button`. Code: `typography.js:163` `const modes = this._typeEffectiveModes();` and `geometry.js:216` `this._geomEffectiveModes()`; `model.mjs:91-92` `if ((t.modes \|\| []).length) return t.modes; return STANDARD_TYPE_RUNGS.map(...)` (Geometry the same at `:98-101`). The evidence run measured `defaultDocument()`: type modes `undefined`, effective `Tablet, Mobile`; with `modes: []`, effective length `2`. So the `modes.length` test at `typography.js:172` never fails and All is on every set. The handoff ledger rows `All button only once a mode exists` (`:95`, `:102`) read the test without reading what `modes` is | the sentence would be true only if `typeEffectiveModes` could return `[]`; at `model.mjs:92` it cannot |
| U7-1 | 🟢 | `145:## Views and sections`, `171:## License`; `gallery 4` `categor 13` `Typography 5` `Geometry 7` `Compare 1` `drawer 1` `ui-plan.md 1` `app-shell.md 1` | README at B: `Compare 0` `drawer 0` `ui-plan.md 0` `app-shell.md 0` |
| U7-2 | 🟢 | `27`, `0` | `app-shell.md` section 1 pasted in: `83`, `3` |
| U7-3 | 🟢 | `L=173`; `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, QUOTE `0`, fourth `2` | DD41 left at `:147`: `bad 1`, `QUOTE DD41: not found at README.md:147`; DD9 at its B text: `bad 1` |
| U7-4 | 🟡 | `47` rows, `0` failing; all 47 anchors opened, every needle in code | handoff cut before `## Claims`: `NO-LEDGER`; a five-row fixture: `3` failing |
| P1 | 🟢 | fresh clone, no node_modules: `✓ all 50 test files passed`, `exit 0`, TESTS `50`, tree `0` | scrim sed: `✗ 1/50 test file(s) failed`, `exit 1` |
| P3 | 🟢 | `branding: clean (748 files scanned)`; U7's diff adds `0` dashed lines; the raw `2` are U3's records | a copied ADR: `FAIL: 3 branding violation(s) across 749 files`, `exit 1` |
| P4 | 🟡 | `0`, `0`, `0`, `2` (DD9's two lines, admitted by revision 2026-09-26; the P4 cell still expects `0`). Plan | a non-comment line in `persist.js`: middle leg `1` |
| P5 | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 96455bdd)`, `exit 0` | a bumped `mixinInto` cite: `✗ 1 citation gate failure(s)`, `exit 1` |
| P6 | 🟢 | `0`, `10` | at B: `15` |
| P7 | 🟡 | `H=89b01d95`, `ancestor`, `1` (the plan file, merged in after the fix commit; its pathspec does not exclude the plan). Plan | the Branch sha removed: `NO-HEAD` |
| P8 | 🟡 | with `F` exported: `H=89b01d95`, `HAS-RAN`, `diff 0`. As the row runs in a fresh clone: `fatal: invalid object name 'unit/dr-U7'.`, `diff 1` (U7-4 reads the handoff from a local branch a clone lacks) | the `~~~out ran` figure `47` changed to `46`: `18c18`, `diff 1` |

### Findings

1. 🔴 F1. `README.md:160-161` (and `:164-165` by "the same") tells a reader the All button appears once a breakpoint mode exists. Tablet and Mobile are live on every set when none is materialized (`model.mjs:89-101`), and deleting every mode brings them back, so All is always there. The ledger rows at handoff `:95` and `:102` carry the same false condition. What to fix: state the default modes, not a precondition that never holds.
2. 🟡 F2. P8 as written does not reproduce in a clean clone: `ran.sh`'s U7-4 line falls back to `git show unit/dr-U7:...`. The handoff discloses the `F` dependency; the root cause is the plan's (the handoff cannot exist at the sha P7 requires, and P8 does not export `F`).
3. 🟡 F3 (plan). P4 leg 4 prints `2` against `0` and P7 prints `1` against `0`; neither moves a figure.
4. 🟡 F4. U7-4 ledger gaps: `Breakpoint modes sit beside it`, the three canvas parentheticals, `whose table already shows both`, `the right pane is the inspector`, `in Light and Dark side by side`. All true on the run's read.
5. 🟡 F5. Weak anchors: `app.js:172` (the scheme listener) for `system, light or dark` (the picker is `app-helpers.mjs:431`, `color.js:898-903`); `model.mjs:57` (the override branch) for the Type-scale text size (the rule is `geometry.mjs:286-287`).
6. 🟡 F6. `.sdlc/architecture.md` DD9 says `80 to 90 s brackets the 79.93-to-89.10-second measured range`; 79.93 is under 80. README `:165-166` `each step's text size comes from the Type scale` omits the ladder ramp (`geometry.mjs:185`) and font overrides (`:287`).
7. 🟡 F7. The handoff title reads `pass 1` on a record its commits call pass 2; Base `5c139146` is right for the Branch sha, stale against the tip.
8. 🟡 F8 (plan). The design asks each README paragraph to end with the doc that owns its detail; the Typography, Geometry and Export drawer paragraphs do not, and no row reads it.

## Pass 2 · 🟡 · the All button sentence is true now, and every condition row reds on its decider

verdict: 🟡
sha: 375152bdeeecefe58784e61307e9629de5b2d5db

Graded at `375152bd` (code A `ac3f6974`, handoff `6b56a074`, review `375152bd`), unit Base `baaf06ab`, B `282fca8d`, against plan revision 15 and `.sdlc/plans/docs-repair-U7-rediagnosis.md`. The checker is inside the builder's opus family under `b9044bb`. The evidence ran in `--shared` clones under the seat's job tmp. The seat re-read Decision 1 against `typography.js:199-207` itself.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U7-1 | 🟢 | `145:## Views and sections`, `172:## License`; `Compare 1` `drawer 1` `ui-plan.md 1` `app-shell.md 1` | README at B: `Compare 0` `drawer 0` `ui-plan.md 0` `app-shell.md 0` |
| U7-2 | 🟢 | `28`, `0` | `app-shell.md` §1 pasted before License: `85`, `3` |
| U7-3 | 🟢 | `1`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, QUOTE `0`, fourth `2` (DD9's two lines) | DD41 put back to `README.md:173`: `bad 1`, `QUOTE DD41: not found at README.md:173` |
| U7-4 | 🟢 | `66` rows, `0` failing, `7` condition | pass 1's sentence as a condition row: `1` failing; per-decider mutations below |
| U7-5 | 🟢 | `0`, `0`, `0`, `1`, `2 2 2 2` | the three files at `96455bdd`: `1`, `2`, `1`, `0` (fifth leg constant by design) |
| U7-6 | 🟢 | `0`, `1`, `1`, `base-ok` | tree at `96455bdd`: `1`, `0`, `0` |
| P1 | 🟢 | fresh clone, no node_modules: `✓ all 50 test files passed`, TESTS `50`, tree `0` (the unit carries the pre-#751 suite count; main's is 54) | scrim sed: `✗ 1/50 test file(s) failed`, `exit 1` |
| P3 | 🟢 | `branding: clean (752 files scanned)`, `0`, `2` (both pre-existing `.sdlc` quotes); U7's own diff adds `0` | ADR copied into `.sdlc/verdicts/`: `FAIL: 3 branding violation(s)`, `exit 1`; one dashed README line: `1`, `3` |
| P4 | 🟢 | `0`, `0`, `0`, `0` | four-name fixture: `2`; a `persist.js` code line plus DD40: `0`, `1`, `0`, `2` |
| P7 | 🟢 | no `NO-HEAD`, `ancestor`, `0` | Branch sha removed: `NO-HEAD`; a README commit after the head: `1` |
| P8 | 🟢 | fresh clone at `375152bd`, row as written: `H=ac3f6974`, `HAS-RAN`, `1 1 1 1 1 1`, `diff 0`, tree `0` | a section count `28` changed to `27` and committed: `diff 1` |

Condition rows under decider mutations (each reverted, tree `0`): no standard set in `typeEffectiveModes`/`geomEffectiveModes` reds `{typ Tablet,Mobile`, `{typ all-shown`, `{geo Tablet,Mobile`; ignoring doc modes reds both `Mode 1` rows; `geometry.mjs:287` composition off reds `{geo composed-unless-ladder`; `color.js:870` `&& !isTable` removed reds `{Col single-compare`. All 7 condition rows red; the two old `present` rows on the All guard still pass under the first mutation, which is pass 1's F1 class, now caught.

### Fates of pass 1
- F1 🔴 fixed. `README.md:159-161` reads `Tablet and Mobile by default, and an **All** button shows every breakpoint side by side`. `model.mjs:89-93` returns `STANDARD_TYPE_RUNGS` when `(t.modes || []).length` is 0, and the same form holds for Geometry at `:96-101`. `ui-plan.md:50-51` and `glossary.md:45` are true against the same lines.
- P8 in a clean clone: fixed (`diff 0`, no `git show` fallback in the block). P4 and P7 plan defects: fixed by revision 15. DD9 wording: fixed (`79.93-to-89.10` against `baseline.md:21`). The handoff title and Base: fixed.
- Ledger gaps: fixed; rows exist for every README sentence the pass 1 read listed.
- Weak anchors: partly fixed (finding 2).

### Findings
1. 🟡 The handoff's Decision 1 says `addTypeMode appends to a materialized set (:199-207), so Tablet and Mobile stay after you add your own`. That is true only after the first-edit materialization it names just before. On a default document, `typography.js:204` starts from `[]`, one `+` leaves `Mode 1` alone, and Tablet and Mobile go. The README wording it chose (`by default`) is true, and the two `Mode 1` rows state the right branch. So this is imprecise rationale in the handoff, not a shipped claim.
2. 🟡 Two true claims are anchored on labels, not deciders. The inspector claim sits on `app.js:1465` (an aria-label), where the decider is `renderRightPane` at `:1927-1931`. The Light/Dark Compare claim sits on `color.js:914`, where the decider is `:941-942`.
3. 🟡 (plan) The Notes cell on `ui-plan.md:51`, `per-step text size composes from the Type scale`, omits the ladder exception the README now states. The brief froze that wording.
4. 🟡 (plan) U7-6 reads the handoff from the tree, so inside the `ran` block at A it prints pass 1's values. P8's command cell carries a bare `||`, and several `[|]` spans are bare pipes, so a GFM cell split cuts there. U7-5's fifth leg and U7-6's Base leg never red, by design.
