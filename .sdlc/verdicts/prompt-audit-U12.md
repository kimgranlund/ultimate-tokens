---
kind: verdict
plan: prompt-audit
unit: U12
ticket: "#758"
branch: unit/pa-U12
base: ba60879f
grade: verifier-l2 (opus), the evidence run dispatched by the Verifier seat; builder-l3 sonnet
pass: 1
written: 2026-09-29
---

# Verdict prompt-audit U12 · 🟡 · the ramp claims and the baseline cause are true now; no unit commit carries a Seat trailer

verdict: 🟡
sha: f24926e541ee8165710212e1ba22ca361679b85a

`unit/pa-U12` at `f24926e5`, base `ba60879f` (= `git merge-base HEAD origin/plan/prompt-audit`), criteria revision 24. Evidence run: `pa-U12-verifier-l2-p1` in its own clone, tree clean after every run. `verdict.py check` passes on the handoff and the review, both created by the unit. The seat re-ran the sweep, the diff names and the trailer read itself.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U12-1 | 🟢 | `0`, `2`, `0`, `15 13 2` | base file prints `1`, `0`, `2`; the uniform-ramp sentence appended makes leg 3 `1` |
| U12-2 | 🟢 | `0`, `2`, `15`, `1`, `1`, `3`, `3` | base file prints `1`, `0`, `13`, `0`, `0`; `UI-widget` knob removed prints `14`, `1`, `0` |
| U12-3 | 🟢 | the sweep prints two lines, `.claude/skills/type-scale/SKILL.md:40` and `foundations.md:52`, both naming thirteen (seat re-run) | base tree prints `5`; a fixture sentence in `prose.md` makes it `3` |
| U12-4 | 🟢 | `0`, `1`, `1`, `1`, `1` | base `baseline.md` prints `1`, `0`; KB cell typed `4130.3`: `STALE ui.html:`, `stale total: 1` |
| U12-5 P1 | 🟢 | `✓ all 54 test files passed`, `exit 0`, TESTS `54`, status `0` | `"scrim` to `"scrimX`: `FAIL  refs-canonical`, `exit 1` |
| U12-5 P3 | 🟢 | `branding: clean (958 files scanned)`, `em-dash: clean (966 files scanned)`, added U+2014 `0` | a copied ADR file under `.sdlc/verdicts/`: `FAIL: 3 branding violation(s)`; a glyph line: `FAIL: 1 em dashes`, `exit 1` |
| U12-5 P6 | 🟢 | added ids `0`, removed ids `0` | `+the rule (TKT-0008)` through the filter prints `1` |
| Scope | 🟢 | `git diff --name-only ba60879f`: two type-scale references, `.sdlc/baseline.md`, the handoff, the review | `git diff --name-only ba60879f -- src/engine` prints nothing; the P4 filter refuses `src/engine/type.mjs` |
| Truth | 🟢 | `type.mjs:31-47` nine three-entry rows plus `UI-control` and `UI-widget` six-entry rows, `RANKS6` at `:50`, `uc`/`uw` knobs at `:120-121`; history `4bf3dc52` (2026-07-13, 13 voices), `4ddd76f9` and `de1873bb` (2026-07-16) | the pre-edit sentences are false of the same table (base legs above) |
| Hygiene | 🟡 | Opus 5.5 co-author on `3a03c8e4`, `26b3f4eb`, `f24926e5`; `%(trailers:key=Seat)` prints empty on all three (seat re-run) | base commits print `Seat: orchestrator` through the same read |

### Findings

1. 🟡 No commit since the base carries a `Seat:` trailer. The adapter requires one only on board commits, so this is a record gap, not a breach; the squash does not carry it.
2. Note, no pass: `best-practices.md:110` "a three-entry row per voice" is loose (nine rows serve thirteen voices); `foundations.md` states the exact split.
3. The handoff's figures reproduce; its skipped controls are disclosed, and all of them bite. Pre-land pass 3 re-reads H1b and BL2 against the merged plan.
