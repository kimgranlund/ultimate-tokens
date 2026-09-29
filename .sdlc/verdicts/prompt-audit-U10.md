---
kind: verdict
plan: prompt-audit
unit: U10
ticket: "#758"
branch: unit/pa-U10
base: 13346c1a
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-29
---

# Verdict prompt-audit U10 · 🟡 · every row holds; the qualifier allowlist meets U10-2 as written but leaves eight single-word false passes

verdict: 🟡
sha: b86291f961742ca890469cea11f31cad3cd23ba8

Head `b86291f9`; code commit `5aacbc9f` (`voice-parity.mjs`, `test/plugin/typography-tokens.mjs`), handoff `c22f34c4`. Unit base plan/prompt-audit `f6cd69cb`; B `13346c1a`. Criteria from `4fa7561c:.sdlc/plans/prompt-audit.md`, section U10. Evidence run verifier-l1 (Opus 5.5) in shared clones under the seat's job tmp, fixtures run with `VOICE_PARITY_SKILL_DIR` on a copy of the six files; the old gate is `f6cd69cb`'s script. `verdict.py check` exits `0` on the handoff and the review.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U10-1 | 🟢 | `## The fourteen roles` appended: `✗ SKILL.md: fourteen roles, voice count drift, engine has 15`, `exit 1`; unmodified copy `voice-parity PASS`, `exit 0` | the old gate on the same fixture: `voice-parity PASS`, `exit 0` |
| U10-2 | 🟡 | `It gives fourteen named **voices**.`: `✗ SKILL.md: fourteen named **voices, voice count drift, engine has 15`, `exit 1`. The row's own case is met. `It gives fourteen text voices.` prints `voice-parity PASS`, `exit 0`; eight measured qualifiers pass falsely (`text`, `UI`, `semantic`, `unique`, `individual`, `core`, `full`, `reading`) | the old gate on the `named` fixture: `voice-parity PASS`, `exit 0` |
| U10-3 | 🟢 | `Label` added to the second SKILL.md statement: `box-voice set drift ... engine emits -line-single for kicker/ui-control/ui-widget`, `exit 1`; each fixed-shape statement flipped alone (SKILL.md two, responsive.md one) reds, `exit 1` | the old gate on the second-statement fixture: `voice-parity PASS`, `exit 0` |
| U10-4 | 🟢 | `node test/plugin/typography-tokens.mjs`: `exit 0`, `control (ok\|passed)` count `8` | step 2 reverted alone in a clone: `plugin FAIL: voice-parity did not exit 1 on a drifted second box-voice statement (Label added) (exit 0)`, wrapper `exit 1`, count `7` |
| U10-5 | 🟡 | `grep -c -E 'sub-heading\|Heading-Kicker'` prints `0`; the comments now name `headline`, `title`, `kicker` and `Kicker`, all engine voices | at `f6cd69cb`: `2` |
| U10-6 and P1 | 🟢 | fresh clone, no node_modules: `✓ all 53 test files passed`, `exit 0`, TESTS `53`, `test/run.mjs` diff `0`, tree `0`; `ok    tests: baseline 53, test/run.mjs TESTS 53` | scrim sed: `▶ engine/semantic.mjs      FAIL`, `exit 1` |
| P3 | 🟢 | `branding: clean (809 files scanned)`, `em-dash: clean (817 files scanned)`, added U+2014 `0` | a copied ADR: `FAIL: 3 branding violation(s) across 810 files`, `exit 1`; a dashed line: `FAIL: 1 em dashes`, `exit 1` |
| P4 | 🟢 | `0`, `0`, `0`; the unit's files are the handoff, the review, the script and the wrapper | six-name fixture: `3` |
| P6 | 🟢 | U10 share added `0`, removed `0` | `+the rule (TKT-0010)` prints `1` |
| Steps 3 and 6 | 🟢 | the `POSITIVELY ASSOCIATED` comment sits directly above `const near`; the three new handoff pass lines match the wrapper output verbatim | at `f6cd69cb` the box block sat between that comment and `near` |

### Ruling on the review's Medium

`fourteen text voices` passing does not fail U10's criteria: U10-2's command and expected output name the `named` case, and it reds. It falls short of step 1's words ("one word between the number word and `voices?|roles?`"), and that step was not buildable as written: a grammar that accepts any one word reds 7 true lines in the six real files (`Five family roles`, `two interactive voices` and `two INTERACTIVE voices` five times, `two dedicated voices`, `one per voice`), and without a lookahead it also loses the bare `The fourteen voices` red. That makes it a plan gap, so it is 🟡 against the unit and not 🔴. Measured for the planner: a lookahead form reds the bare case and all eight false-pass qualifiers, and every one of its 7 false reds has a number at or below 5 against the engine's 15. A follow-up row needs a failing control on `fourteen text voices`.

### Findings

1. 🟡 F1. The count grammar's qualifier allowlist leaves eight single-word false passes (the ruling above). Plan gap; follow-up owed.
2. 🟡 F2. responsive.md carries two more box-set statements in shapes no leg reads (`on a Kicker/UI-control/UI-widget`; `1.0× for the box (control-text) voices, Kicker, UI-control, and UI-widget`); `Label` added to either: `voice-parity PASS`, `exit 0`. Outside the plan's "fixed-shape" letter, same drift class.
3. 🟡 F3 (plan). U10-5's needle counts `sub-heading`, a real engine voice (`Sub-heading`); the false name at `f6cd69cb` was `heading`. The unit's new comment is true.
4. 🟡 F4. The handoff says the free-word trial reddened `five true subset phrases` and lists three; the evidence run's literal free-word grammar reds 7 lines, 4 distinct phrases. The builder's trial grammar is not recorded, so this is imprecise, not false.
5. Note. The new grammar comment is one line far past the file's wrap width, and the reported token reads `fourteen named **voices` (unbalanced bold). Cosmetic.

Cleared to merge.
