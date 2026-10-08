---
id: T-0021
title: "Compute layers: rebase U1-U3 onto main, then U4 pins and U5 ramp@2 on schema v9 (#788)"
type: feature
status: ready
size: L4
priority: P2
depends: []
created: 2026-10-08
router: .sdlc/AGENTS.md
---

## Goal
GitHub #788. Land the compute-layers plan (`.sdlc/plans/compute-layers.md`, status approved, written 2026-10-03 under the old Orchestrator workflow) on today's main. The plan's U1, U2 and U3 are already built and merged on branch `plan/compute-layers` (head `1a99d5ad`); U4 is built on branch `unit/cl-U4` (`3b2749b5`, `a2f82a32`) but was reviewed against the old base; U5 is unbuilt. Main has since landed T-0013 (chroma envelope presets, ADR-029), T-0014 (per-palette Base chroma, global k factors, persist schema 8, ADR-030), T-0015 (hue space applies to anchored palettes, ADR-031), T-0017 (Maison geometry ladder, persist schema 9, ADR-032) and T-0018/#809 (UI changes), so `plan/compute-layers` has conflicts and several of its assumptions are stale.

## Intent
- Work on a fresh branch off current `main` (a new worktree `.worktrees/compute-layers`, branch `plan/compute-layers-r2`), not by merging the old plan branch blindly. Use `git log main..plan/compute-layers` and `git diff main...plan/compute-layers` as the source of the U1 to U3 changes and re-apply them (cherry-pick where clean, hand-merge where not). Keep the old branches untouched until this lands.
- Re-baseline every stale assumption in the plan against main before writing steps. Known collisions: `src/ui/model.mjs` (`controlsOf`, `projectView`, `geometryScale`, `geomScaleFor`, `typeScaleFor` all changed in T-0014 to T-0017), `src/engine/tonal.js` (chroma envelope, vibrancy 50, hue space), `src/engine/prime.mjs`, `src/engine/exports.js`, `src/ui/persist.js` (schema is now 9; the plan stamped export pins at "merge-base schema plus 1" and referred to `baseIntensity` at schema 7; the migration must now be written on schema 9 so pins land at schema 10), the `geometry` layer (its `run` is the new 27-cell `geomScale`), the `group-chroma` layer (group chroma was REMOVED by T-0014; the registry must not carry a retired layer, drop it and say so), and R102 (U5: `ramp@2` without the cam16 branch): T-0015 made cam16 hue space meaningful for anchored palettes, so U5's premise needs a fresh ruling. Do not decide that: put it in a planner `## Missing decisions` or `decide:` note for the user.
- The plan's gates apply: byte-neutral for every stored doc and preset through U4 (adapter §1 `ramp-identity`: `node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD) --authored`, plain and with `--only`), a frozen module is never edited after it lands (`FROZEN.json` SHA-256), engines pure and DOM-free.
- Sequence: step A re-apply U1 to U3 on main and prove byte-neutral; step B U4 on schema 9 to 10; step C U5 only if the user rules on the cam16 question, otherwise leave U5 as a follow-up. Each step lands behind its own verifier; one PR for the whole branch at the end (user rule: one push, one PR, local gates only, `gate_lock.py` with `SDLC_GATE_WORKERS=10`, `gate:sweeps` run as its eight legs).
- Records: a new ADR (next number after ADR-032) appended to `docs/references/decision-records.md` before its Quick map; repair stale cites with `node scripts/audit-citations.mjs`; no U+2014; branding scan covers `.sdlc/`.

## Constraints
- Lane: full chain (size L4, cross-cutting, L4 steps need plan review). Planner L3 first; read `.sdlc/plans/compute-layers.md`, `.sdlc/plans/compute-layers-adr-draft.md` and the old unit handoffs under `.sdlc/` for U4.
- Never commit `*.log`, `.run.lock`, `*.attempt.json`, `*.dispatch.json`. `.claude/docs/other/` never reaches a commit.

## Plan review
plan defect: specgate refused planner-L3.md before review: step 2: duplicate span: `out=$(node scripts/report-compute-neutral.mjs --base "$SDLC_BASE_SHA") && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells"` repeats a criterion of step 1 verbatim. Replan: make step 2's byte-neutrality criterion distinct from step 1's (for example a different flag, a pins-stamped export leg, or the pre-pin-doc hydrate identity) and keep every other part of the plan; run `specgate.py check` on the new plan before returning it. Also keep: T-0030 (Gate A `basis` field in tonal.js) lands before step 1 (it is verified and landing now).

user ruling 2026-10-08 (U5): drop U5. CAM16 stays a live, supported hue model (ADR-031, the Hue space control); `ramp@1` is the only ramp layer and U5 (`ramp@2` without the cam16 branch, R102) is closed as superseded. The plan covers U1 to U4 only; do not add a U5 step, and say in the new ADR that R102 is superseded by ADR-031.
