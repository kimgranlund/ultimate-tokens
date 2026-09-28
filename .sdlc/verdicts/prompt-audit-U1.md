---
kind: verdict
plan: prompt-audit
unit: U1
ticket: "#758"
branch: unit/pa-U1
base: 8f5c6dc0
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-28
---

# Verdict prompt-audit U1 · 🔴 · every plan row passes and every control fails as it should, but a changed consumer file still states T3's false fact

verdict: 🔴
sha: ca3c6cc63f9819a00abd5c3bdb067f448329979e

The head is `ca3c6cc6` and the code commit is `0e507d10`. B is `8f5c6dc0`, from `git merge-base origin/main HEAD`. The negative state is read at B, not at `HEAD~` (see H1). All evidence comes from throwaway shared clones under the seat's job tmp.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U1-1 | 🟢 | plan command: `0`, `0`, `3`, `1`, `15` | the same greps at B print `3`, `1`, `0`, `0`, `15` |
| U1-2 | 🟢 | plan command: header `1`, rows `15`, box rows `2`, universal-ramp `0`/`0`/`0`, engine `true false` | at B: `0`, `0`, `0`, then `1`/`1`/`1`. The needle misses F1's wording, so this row does not clear the prose |
| U1-3 | 🟢 | plan command: `0` and `0`, `1`, `1`, `contrast fixed,contrast` | at B: `1` and `1`, `0`, `0` |
| U1-4 | 🟢 | plan command: `0` and `0`, `1`, `1`, `1` | at B: `1` and `1`, `0`, `1` |
| U1-5 | 🟢 | plan command: `0`, `0`, `0`, `0` | at B: `5`, `1`, `3`, `4` |
| U1-6 | 🟢 | the three parity scripts print PASS with `exit 0` (`15 voices`) | in a clone, `--type-label-3xl-size` appended to SKILL.md gives `unknown step "3xl"`, `voice-parity FAIL`, `exit 1` |
| U1-7 | 🟢 | `git diff --name-only $B..HEAD` through the plan filter prints exactly the eight U1 paths | a committed `stray.md` gives `1` |
| Prose read | 🔴 | `typography-tokens/references/interface.md:30-36` reads `every voice is sm/md/lg-only` and says XS, XL and 2XL have no UI-control counterpart. The engine says otherwise: `"UI-control": [12, 13, 15, 16, 18, 20]` (`src/engine/type.mjs:46`, my read), and `geometry.mjs:286` composes `uiSteps[name]` for every step. The paragraph also contradicts U1's own line 5, `a six-step xs/sm/md/lg/xl/2xl ramp` | not applicable: this row is a reading. The fault is T3's false fact in a file the unit rewrote |
| P1 | 🟢 | `npm test`: `✓ all 53 test files passed`, `exit 0`, tree `0`; `ok    tests: baseline 53, test/run.mjs TESTS 53` | the scrim sed on `role-table.json` gives `✗ 1/53 test file(s) failed`, `exit 1` |
| P3 (unit share) | 🟢 | `branding: clean`, `em-dash: clean`, `exit 0`; added-line glyph count `0` | a README line with the glyph gives `FAIL: 1 em dashes`, `exit 1`; the decision-records copy into verdicts gives branding `FAIL: 3` |
| P4 | 🟢 | the three commands print `0`, `0`, `0` | the six-name fixture gives `3` |
| P5 (U1 ids) | 🟢 | `1` for each of the ten ids; the ERE prints `10` | a handoff copy with no T4 row gives `0` and `9` |
| P6 (unit share) | 🟢 | added `0`, removed `2` | the fixture `+the rule (TKT-0010)` gives `1` |
| P0 (G0 half) | 🟢 | `git show origin/main:test/run.mjs \| grep -c '"repo/em-dash.mjs"'` prints `1` | the plan's figure at `61225d0c` is `0` |

These rows are left to pre-land: P2 (the build), the G1 half of P0, P7, and the P6 sum.

## Findings

- 🔴 F1 (the prose-read row). The needle to fix is `interface.md:30-36`, "Composing with control geometry". The audit's T3 row lists only `:5` and `:55`, so this is an inherited miss, but the file is in U1's diff and it now contradicts itself.
- 🟡 F2. `typography-tokens/references/prose.md:20`, in a U1-changed file, reads `Every voice rides the same **SM · MD · LG** ramp`. It is true only of the prose voices under that heading.
- 🟡 F3. Law 6 of `color-tokens/SKILL.md` uses "modes" both for the on-color mode and for the light and dark schemes. The fact itself holds.
- 🟡 F4 is outside U1's wall. `responsive.md:26` and `:43-44` name Label, Body-mono, Label-mono and Kicker as the `-line-single` box voices, but the engine emits `-line-single` for kicker, ui-control and ui-widget only. Line 36 of the same file names the right three. A plan revision owes a decision on which unit takes this.
- 🟡 H1, a handoff defect. The controls row reads `the pre-edit text at HEAD~ is the negative state`. That is false at every head the handoff has sat at. `git grep -c -i thirteen` over `plugin` finds no hit in `typography-tokens/SKILL.md` at `ca3c6cc6~` but finds `3` there at B. That control prints the pass figures.
- 🟡 H2. The handoff header reads `Builder, pass 1`, but the file was revised at `0e507d10` and is the pass 2 record. Its U1-6 control reads `backup restored after`, which is an edit in a worktree; the plan says "in the clone". Every other handoff figure agrees with the evidence run.
