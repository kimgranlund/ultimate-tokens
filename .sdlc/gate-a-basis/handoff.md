---
id: T-0030
title: "Chroma-envelope Gate A: record the OKHSL basis so rule 2 covers every uncapped stop (#807 follow-up)"
type: chore           # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
Implement the architect's design in `.sdlc/gate-a-narrowing/architect-L1.md` (spike T-0024: read its Approach, Interfaces, Constraints, Rejected alternatives and Risks in full, and `decompose/report.md`). Gate A rule 2 in `test/engine/chroma-envelope-gate.mjs` excludes stops where the OKHSL basis reads above 1 (122,733 of 146,000 anchored and 80,228 of 146,000 gate-path stops checked). The architect found the exclusion inherent but removable: OKHSL stop records carry no `basis` while even records do, so rule 2 can only compare `model / model500` to `env`.

## Intent
- `src/engine/tonal.js`: add `basis: anchor.okhsl.s` to the verbatim stop-500 record (~:1477) and the built record (~:1485), and `basis: keyS` to the unanchored record (~:1586), exactly as the Interfaces section says. No other engine line, no arithmetic touched.
- `test/engine/chroma-envelope-gate.mjs` (~:103-113): replace rule 2 with rule 2' (at every uncapped stop `model / (damper ?? 1)` equals `min(1, max(0, basis * env))` to 1e-9; `basis` constant across the ramp; at the anchored stop 500 `model` equals `basis` or `min(1, basis)`; capped stops excluded), restate the header comment (~:11-13), print the rule-2' covered count (the architect's probe: 280,337 stops, 0 failures). Rule 1 (env exact to 1e-12), Gate B and the direction leg stay. Rule 2' REPLACES rule 2; never keep two gates on one property.
- Negative controls from the design, run with the gate's `--engine-dir` scratch copy: `basis: keyS * 1.01` at the unanchored record reds `curve perceptual` and `curve peak` with rule 1 at 0 off; `const intendedS = anchor.okhsl.s * (1 + 0.05 * Math.abs(sp))` with `basis: intendedS` reds the constant-basis clause. Record both outcomes in the report.
- `docs/references/decision-records.md`: add an `- **Amendment (2026-10-08, T-0024).**` bullet before ADR-029's Status line restating Decision (3)'s perceptual/peak rule as the clamped basis form. ADR stays PROPOSED.
- Byte-neutrality proof (the acceptance): `node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD) --authored` prints `0 differing cells`, plain and with its `--only` variants per `.sdlc/adapter.md` section 1. Regenerate the bundles that embed `tonal.js` with the repo generators (`npm test` does it) and commit them. Also note T-0021 (compute layers) will freeze `ramp@1` after this lands, so keep the change to exactly these lines.

## Constraints
- Zero runtime deps, engines pure. No U+2014. `npm test`, `npm run build`, and the eight `gate:*` sweep legs through `scripts/gate_lock.py run --name <leg> -- npm run gate:<leg>` with `SDLC_GATE_WORKERS=10` (do not run `gate:sweeps` as one command, it exceeds the foreground limit); `chroma-envelope` and `corpus-anchor` are the legs that matter most. Files: `src/engine/tonal.js`, `test/engine/chroma-envelope-gate.mjs`, `docs/references/decision-records.md`, generated bundles, `.sdlc/gate-a-basis/` records.
