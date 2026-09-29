---
kind: verdict
plan: prompt-audit
unit: U1
ticket: "#758"
branch: unit/pa-U1
base: 8f5c6dc0
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 2
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

## Pass 2 · 🟡 · every row 🟢 and every pass 1 finding fixed; four stale lines in records, none a prose defect

verdict: 🟡
sha: 4506cd1c0cc8ba935b2dbc347b774f639ac78d0a

Head `4506cd1c`, prose commits `3b73f739` and `e7f99f19`. B is now `13346c1a` (`git merge-base origin/main HEAD`); `git diff --stat 8f5c6dc0 13346c1a -- plugin/ultimate-tokens` is empty, so pass 1's B figures stand. Criteria from `511aba5a:.sdlc/plans/prompt-audit.md`. The evidence run was verifier-l3 on Fable 5.1 (`claude-fable-5-1`), not a substitute, in shared clones under the seat's job tmp. `verdict.py check` passes on the handoff, both p2 reviews and the rediagnosis plan, `exit 0` each.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U1-1 | 🟢 | the five legs print `0`, `0`, `3`, `1`, `15` | at B: `3`, `1`, `0`, `0` |
| U1-2 | 🟢 | `1`, `15`, `2`, `0`/`0`/`0`, `true false` | at B: `0`, `0`, `0`, then `1`/`1`/`1` |
| U1-3 | 🟢 | `0` and `0`, `1`, `1`, `contrast fixed,contrast` | at B: `1` and `1`, `0`, `0` |
| U1-4 | 🟢 | `0` and `0`, `2`, `1`, `1` (`"Label": cat("ui", "Label", ..., false)` at `src/engine/type.mjs:112`) | at B: `1` and `1`, `0`, `1` |
| U1-5 | 🟢 | `0`, `0`, `0`, `0` | at B: `5`, `1`, `3`, `4` |
| U1-6 | 🟢 | `voice-parity PASS`, `role-parity PASS`, `dimension-parity PASS`, each `exit 0` | `--type-label-3xl-size` appended to SKILL.md: `voice-parity FAIL`, `exit 1`; reverted |
| U1-7 | 🟢 | the filtered name list from merge base `36a83732` is exactly the nine wall paths | a committed `stray.md` prints `stray.md` through the filter |
| U1-8 | 🟢 | `0` on all five files, `1`, `0`, `true true 11,13,15,16,19,22` | at B: `1`, `2`, `1`, `1`, `0`; bare `geomScale({})` gives `false 12,13,15,16,18,20` |
| U1-9 | 🟢 | `0`, `1`, `1` | at B and `ca3c6cc6`: `1`, `0`, `0`; 511aba5a's line `Every voice rides the same **SM** ramp` appended prints `1` |
| U1-10 | 🟢 | `0`, `2`, `1` | at B: `1`, `0`, `0` |
| U1-11 | 🟢 | `0`, `1`, `3` | the handoff at `ca3c6cc6`: `1`, `0`; a row reading `at HEAD~` appended prints `1` |
| U1-12 | 🟢 | `1`, `0`, `1`, `1`, `11` | the handoff at `ca3c6cc6`: `0`, `1`, `0`, `0`, `10`; the T4 row cut prints `10` |
| U1-13 | 🟢 | `0`, `2`, `Kicker,UI-control,UI-widget` | at B: `2`, `0`; `Label` box flipped to `true` in `type.mjs`: the engine leg prints `Label,Kicker,UI-control,UI-widget` |
| P1 | 🟢 | `npm test` in a fresh clone at the head: `✓ all 53 test files passed`, `exit 0`, `git status --short \| wc -l` `0`; `ok    tests: baseline 53, test/run.mjs TESTS 53` | `sed 's/"scrim/"scrimX/'` on `role-table.json`: `✗ 1/53 test file(s) failed`, `exit 1`, `engine/semantic.mjs` gate `refs-canonical` |
| P3 (U1 share) | 🟢 | `branding: clean (800 files scanned)`, `em-dash: clean (808 files scanned)`, `exit 0` | a decision-records copy into `.sdlc/verdicts/` gives `FAIL: 3 branding violation(s)`, `exit 1`; a README glyph line gives `FAIL: 1 em dashes`, `exit 1` |
| P4 | 🟢 | the three commands at B print `0`, `0`, `0` | the six-name fixture prints `3` |
| P5 (U1 ids) | 🟢 | `1` for each of C1 C2 T1 to T5 S1 to S4; the ERE prints `11` | the T4-cut copy prints `0` on T4 and `10` on the ERE |
| P6 (U1 share) | 🟢 | added `0`, removed `2` | the fixture `+the rule (TKT-0010)` prints `1` |
| Pass 1 F1 | 🟢 | `interface.md:31-37` now reads `at every step, XS to 2XL`; `grep -c 'sm/md/lg-only'` prints `0`, read by the seat at `4506cd1c` | at `ca3c6cc6` the U1-8 first grep printed `1` on interface.md |
| Pass 1 F2 to F4, H1, H2, review p2 H1 | 🟢 | `prose.md:21` scopes the ramp; law 6 `in both schemes`; `responsive.md:26,44` name the three box voices; `grep -c 'HEAD~'` on the handoff `0`; `grep -c 'rides the .mono. role' headings.md` `0` | each needle printed its failing figure at B or `ca3c6cc6` (U1-9 to U1-13 controls above; headings `1` at B) |

### Findings

- 🟡 H3, handoff line 55: `the negative state is B, 8f5c6dc0 (git merge-base origin/main unit/pa-U1)`. True in pass 1; after the revision 4 merge `53966a8e` the command prints `13346c1a`. Stale, not false in effect: the nine files are byte-identical at both, so every figure holds.
- 🟡 H4, handoff line 25: `prose.md:40` is `prose.md:41` at the head, since `3b73f739` grew the intro by one line.
- 🟡 Plan, U1-13 control cell at `511aba5a`: says the `Label` box flip reds `voice-parity`; measured `voice-parity PASS`, `exit 0`. Revision 5's N2 row already records this; the cell was not amended. The Orchestrator owns the plan.
- 🟡 Plan, the unit copy's U1-9 control is revision 4's text (`Every voice rides the same ramp`, prints `0`); `511aba5a` has the right line. Resolved by the plan merge at landing.
- Carried, outside U1's classes: `responsive.md:22` `(pre-2026-07)`; prose.md:41 vs interface.md:20 metadata routing; `feedback.md:33` `mode-flat`; the `uppercase (treatment)` wording; `voice-parity` does not pin the prose box set (U2's wall).
