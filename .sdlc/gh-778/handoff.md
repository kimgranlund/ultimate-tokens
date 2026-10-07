---
id: T-0013
title: "Chroma envelope: the curve as the spec, presets, tolerance gates (gh 778)"
type: feature        # feature | bug | chore | spike | idea
status: done     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L              # S | M | L | XL
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-07
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
Make the chroma envelope's closed-form curve the spec: a few named preset curves (each a damp, dampCurve, shoulder triple, knobs still exposed), and gates that assert the continuous curve within one stated tolerance instead of pinning rounded 8-bit pixel values. Full issue: `gh issue view 778`.

## Intent
- Do: (1) state the closed-form envelope model in the spec docs (ADR-026 area, `docs/references/decision-records.md`, color-math skill) so the curve is the source of truth; (2) add presets, e.g. the shipped 75/25 retune (`dampCurve = log2(3)`, `damp` about 0.905) plus a small number of others, selectable without removing the existing knobs; (3) rewrite the chroma-envelope gate(s) (`npm run gate:chroma-envelope`, `test/engine/`) to check emitted chroma ratio against the model at each stop within a tolerance that names gamut clipping and 8-bit rounding once; (4) state how an anchored ramp deviates from the model (the curve passes through the anchor).
- Non-goals: changing any shipped palette's emitted output at the default preset (byte-identical outputs unless the owner rules otherwise); a UI for presets unless the plan finds it is required for the presets to be reachable (then keep it minimal).
- Done when: presets exist and are documented; the gates assert tolerance against the model, a planted regression reds them, and a deliberately wrong curve reds them; default outputs unchanged (identity check over every preset and the kit, as the #784 run did); `npm test`, `npm run build` and `npm run gate:sweeps` (via gate_lock) green locally.

## Context
- Source: #725 (the 75/25 retune was solved in closed form; most time went to owner rulings on sub-rounding rises, f4 code bounds and fixture movement because gates pin discrete outputs), ADR-026 (owner request, 2026-09-30).
- Engine: `src/engine/tonal.js` (damp, dampCurve, shoulder), gates under `test/engine/` including `even-dips-gate.mjs` and the chroma-envelope gate; follow the `color-math` skill.
- Docs paths moved on main (4801994f): ADRs in `docs/references/decision-records.md`, specs in `docs/specs/`.
- Design decisions NOT yet made (the planner or architect must list them as assumptions or `unresolved:`; the conductor asks the user): which presets and their names, the tolerance value, whether presets surface in the UI.

## Constraints
- No push, PR or issue comment from a role. The conductor publishes after user approval. Economical with GitHub Actions: all gates run locally first, one push, one PR.
- Gates through `gate_lock.py run --name <what> -- <cmd>` with SDLC_GATE_WORKERS=10. A browser-style red under load reruns once alone before it counts.
- No U+2014 em dash. Never commit `*.log`, `.run.lock`, `*.attempt.json`. `.claude/docs/other/` never enters a commit.
- Generated artifacts regenerate through `npm test`, never by hand. Role-table, figma binder rename-map and count parity must stay lockstep if touched.

## Decisions (conductor defaults, 2026-10-07, after architect-L1; user may veto at plan review)
- Presets: keep the six existing `DAMP_PRESETS` entries (move to the engine as `ENVELOPE_PRESETS`) and add the curated 70/1.5/0/0 entry. The preset UI already exists, so no new UI beyond a chip for the new entry if the planner finds it needed.
- TOL: not guessed; ruled from the `--envelope-residue` probe inside the plan (a probe step before the gate rewrite), then stated once in the ADR.
- Docs: add the next ADR (after ADR-028) before the Quick map in `docs/references/decision-records.md`; repair the stale curve copies the architect listed.
Decomposition: .sdlc/gh-778/decompose/manifest-v1.json (design: architect-L1.md)

## Plan review
- plan defect: step 1 builder-L3 blocked: guard `node test/repo/citations.mjs` contradicts the step's scope allowlist. The required `color.js` and `tonal.js:1061` edits shift lines cited from four report files in `docs/reports/2026-08-20-reactivity/` (`00-synthesis.md` lines 57, 76, 89; `01-core-reactivity.md` 24, 29, 30, 39; `02-sections-and-resolvers.md` 19, 20; `04-context-and-messaging.md` 71), 10 cite lines; the gate discovers 10 docs and the plan's "42 cites into 4 docs" missed them. `steps.py widen` refused (the scope criterion's allow-list form is not one it can rewrite). Fix: add those four report files to the step's scope allowlist AND to the Do's cite-repair list (a diff-derived line remap, as the builder already did for `component-inventory.md` and `app-shell.md`). Check every other step (2 and 3) for the same trap: any edit to `tonal.js`, `color.js`, `app-helpers.mjs` or `model.mjs` can stale cites in `docs/` (citations gate discovers 10 docs, run it as a guard in every step). Write allowlists in a form `steps.py widen` can rewrite (`grep -vxE "<pattern>"`).
- State at replan: the step 1 work is built and uncommitted in this worktree (`.worktrees/gh-778`, branch `plan/gh-778`, HEAD 46273403): all other step 1 criteria and guards pass (identity control 0 differing cells, tonal.mjs green with `envelope-presets`, headless-boot pass). Replanned step 1 must be idempotent over that tree and must not depend on a commit boundary. Builder-L3 result is in `step-1.superseded-1/builder-L3.md` after the rename.

## Closed

2026-10-07: landed via the batch PR (T-0013, #778)
