PASS

# Review anchor-gaps U1 (#740) · pass 2 · reviewer-l2

Head `ded4cd13` on `unit/ag-U1` (code `d33eadb8`), implementing plan revision 5 merged at `2b31080b`. Diff read: `2b31080b..ded4cd13`. Criteria diff base `B` = `8f5c6dc0` (merge-base with `origin/main`). Every row was rerun in a `git clone -q --shared` copy of the head outside the repo, with `npm ci` there for build and smoke; controls edited only that clone and were restored by copy. The worktree was not written except for this file.

## The verifier's red rows

| Row | Status | Evidence |
|---|---|---|
| M1 (cross-form stamp) | 🟢 closed | `src/ui/app-helpers.mjs` now picks one table: `stored.hueSpace == null \|\| stored.hueSpace === "cam16" ? DEFAULT_PALETTES : defaultDocument().palettes`, and the second `DEFAULT_PALETTES.find` is gone. U1-6 probe prints `oklch false 15 cam16 false 15` |
| CL (CHANGELOG sentence) | 🟢 closed | `CHANGELOG.md:14-22` now says the comparison is against the row of the default kit's own hue form, read from `hueSpace`, and that a palette moved onto the other form's default value stays parametric. That is true of the code |
| Pass 1 review M1 (baseline KB) | 🟢 closed | `.sdlc/baseline.md` build row reads `4120.8 KB` with a named correction paragraph; the check prints `ok    ui.html: baseline 4120.8 KB, tree 4120.8 KB` |

## Criteria rerun

| Id | Result | Output |
|---|---|---|
| U1-1 | 🟢 | `1`, `1`, `1`, `true` |
| U1-2 | 🟢 | `exit 0`; `stored-anchors` count `15` (7 or more); identity-fixture text `1`. Control 1 (return argument): `exit 1`, `(a) ... got 16 of 16 ramps differing`. Control 2 (name-only equality): `exit 1`, `(b) an edited Primary row must leave 15 of 16 stamped, got 16` |
| U1-3 | 🟢 | `0 of 16 16`; through `p.hydrate` `16 of 16 0` |
| U1-4 | 🟢 | `cam16 16 15 false`; control (OKLCH table only) `cam16 1 1 false` |
| U1-5 | 🟢 | `1`; numstat `39 2` |
| U1-6 | 🟢 | `oklch false 15 cam16 false 15`, `5`, `1`. Control (pass 1's both-tables lookup restored): probe `oklch true 16 cam16 true 16`, `persist.mjs` `exit 1` with `(f) cross-form: ... got 16` |
| U1-6, (g) alone | 🟢 | the (g) red is masked by (f) in the control above, because `FAIL` keeps only the first message per gate id (`test/ui/persist.mjs:14`). An isolating control adds the OKLCH table only to the cam16 branch: probe `oklch false 15 cam16 true 16`, `persist.mjs` `exit 1` with `(g) cross-form: ... got 16`. Both sub-gates bite |
| P1 | 🟢 | `npm test` exit 0, `✓ all 53 test files passed`, tree `0` after |
| P2 | 🟢 | `npm run build` exit 0, `wrote figma/plugin/ui.html 4120.8 KB`, tree `0`, `ok    ui.html: baseline 4120.8 KB, tree 4120.8 KB` |
| Smoke | 🟢 | `npm run smoke` exit 0, `SMOKE PASS`, tree `0` after |
| P3 | 🟢 | `branding: clean (788 files scanned)`, `0`, `0`, `em-dash: clean (796 files scanned)`, exit 0 |
| P4 | 🟡 | the first filter prints `.sdlc/plans/prompt-audit.md` (see n1); then `1 1`, and `0` on the forbidden-path list |
| Bundles | 🟢 | `npm test` and `npm run build` regenerate both bundles byte-identical to the committed ones |

## Correctness probes

| Question | Result |
|---|---|
| v0 to v4 stripped default docs | 16 stamped each |
| Fresh OKLCH kit toggled to `hueSpace: "cam16"` before saving | `1` stamped: the one row whose hue is equal in both forms, so it is still the raw default row and its anchor is right. The other 15 stay parametric, so the toggle's render change is kept |
| Unknown `hueSpace` (`"bogus"`) | hydrates to `oklch`, 16 stamped from the OKLCH table, as the design states |
| `hueSpace: null` | the seam stamps `cam16`; 1 stamped (same equal-hue row) |
| Idempotent | a second call returns the first result by reference |

## Findings

No Critical or Major.

### Nit

n1. P4's scope filter prints `.sdlc/plans/prompt-audit.md`. The change comes from the Orchestrator's board-sync commits `c379a774` and `d9e3fd35` ("prompt-audit checklist synced from main"), not from the builder. It will clear once those records reach `origin/main`; otherwise the pre-land P4 row needs to admit it.

n2. Sub-gates (f) and (g) share one gate id, so a regression in both shows only (f). This is the file's existing FAIL shape, not something this unit introduced. The isolating control above shows (g) bites independently.

Carried from pass 1, still open and out of this unit's scope: m2 (`DEFAULT_PALETTES` exported mutable, `src/ui/model.mjs:284`); the n1 hardening for a `sourceAnchor`-only row.

A `STALE time test` line from `baseline-agrees-check.sh` (baseline 167 to 268 s, adapter 80 to 89 s) predates this unit: neither `.sdlc/adapter.md` nor the test row changed since `B`.

verdict: 🟢
