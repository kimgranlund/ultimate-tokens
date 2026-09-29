---
kind: verdict
plan: docs-repair
unit: U7
ticket: "#751"
branch: unit/dr-U7
base: 282fca8d
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
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
