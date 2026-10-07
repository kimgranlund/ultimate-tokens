---
id: T-0015
title: "Hue space toggle (OKLCH/CAM16) also applies to anchored palettes"
type: feature        # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L              # S | M | L | XL
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-07
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
The global hue space toggle (OKLCH or CAM16, `doc.hueSpace`) changes every palette, including anchored ones. Today anchored palettes take their hue from the anchor and ignore it (`src/ui/sections/color.js:2123`, `src/ui/app-helpers.mjs:558-561`), so on a kit where only Material is unanchored the toggle seems to change only Material. User decision 2026-10-07: make anchored palettes respond.

## Intent
- Do: define how an anchored palette's hue is re-derived in the chosen space while the anchor stays its key colour; decide the ADR-026 impact and the `anchor-identity` and `key-anchor` gate consequences. Needs an architect first.
- Non-goals: chroma controls (T-0014), the envelope (T-0013).
- Done when: toggling the hue space moves every palette's ramp and prime ladder visibly where the two spaces differ, anchored ones included, with gates reshaped and the full-corpus sweeps green locally.

## Context
Status: proposed, not ready. Blocked on design; sequence after T-0014 because both change the prime ladder and ADR-026.

## Constraints
No push, PR or issue from a role. Local gates only through gate_lock. No U+2014. Never commit logs.

## Architect brief (conductor, 2026-10-07)
Run the architect pass now. Read-only on T-0014's built code: the branch plan/prime-anchor-follows-chroma is checked out at /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/prime-anchor-follows-chroma (steps 1 to 3 built and committed or in verification; step 2 changed the anchored prime middle and the key tile to follow the global prime k; step 1 introduced schema v8; step 3 sets vibrancy 50). Design T-0015 (issue #805) against THAT code, not main: how an anchored palette's hue is re-derived in OKLCH versus CAM16 while the anchor stays its key colour, what the anchored branches in src/engine/prime.mjs, src/engine/tonal.js (anchored paths) and src/ui/model.mjs deriveKeyColor must do, the anchor-identity and key-anchor gate consequences (identity must still hold at the default hue space), the persist schema version this needs (v9 if T-0014 holds v8; T-0017 also wants a schema bump, so say the order), the ADR (next number after ADR-030 which T-0014 step 4 adds), and which decisions the user must make. Never edit the worktree. Outputs only under .sdlc/hue-space-anchored/.

## Decisions (user, 2026-10-07, after architect-L1; design in architect-L1.md, decompose/manifest-v1.json)
1. Done-when reworded to what is physically visible: the toggle moves every surface where the two hue models differ. Even ramps (already visible), every anchored prime ladder above JND, the key tile below Prime chroma k 100; anchored perceptual and peak ramps move within rounding (at most 0.02 OKLab dE, measured 0.014) and the control's label title says so. No hue kink at stop 500.
2. Saved kits at the default space (oklch, k 100): every anchored prime ladder's six outer rungs move (3,128 of 3,380 corpus, 16 of 16 default kit, max 0.037 dE); ramps and the key tile do not; exported prime tokens move with the ladder. Accepted; the before/after report is the ruling record, as in T-0014.
3. Legacy documents stamped cam16 by the old hydrate now render CAM16-constant anchored ramps and ladders; accepted, no migration. No schema bump: CURRENT_SCHEMA_VERSION stays 8 (T-0014) and T-0017 takes v9.
4. Default taken for the minor item: dampStops keeps holding OKLCH hue after damping in perceptual and peak.
Sequence: build only after T-0014 lands (shared lines prime.mjs and model.mjs deriveKeyColor); independent of T-0017. ADR number: after ADR-030 (T-0014 step 4), so ADR-031.
Plan against T-0014's built branch at /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/prime-anchor-follows-chroma (read-only) until it lands on main.
Issue: #805. Decomposition: .sdlc/hue-space-anchored/decompose/manifest-v1.json
