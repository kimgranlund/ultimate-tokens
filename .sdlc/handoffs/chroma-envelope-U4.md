# Handoff chroma-envelope U4 pass 1 · builder-l3 → orchestrator

| Field | Value |
|---|---|
| Branch | unit/ce-U4 @ records commit (sha in the commit that adds this file; see `git log -2`), base febaa601 |
| Status | 🟢 C4.1 to C4.5 met; 🟡 one control wording (C4.4, below) |
| Files | `docs/reference/references/decision-records.md` (ADR-026 amendment + Quick map row), `CHANGELOG.md`, `test/engine/mode-isolation-gate.mjs` (`:25`, `:73`), `test/engine/fixtures/mode-isolation.json`, `.sdlc/adapter.md` (mode-isolation row), `.sdlc/baseline.md` (mode-isolation row), `.claude/skills/shipping-changes/SKILL.md` (`sweeps` passage), this handoff |
| Not touched | engine, gate logic, fixture data (only the `owner` string), FLOORS, plan, board, `.claude/docs/other/` |

## Criteria

| Id | Evidence | Control | State |
|---|---|---|---|
| C4.1 | `sed -n '/^## ADR-026/,/^## ADR-027/p' ... \| grep -c 'Amendment (2026-'` prints 2. The #725 amendment sits after the #701 one, before ADR-027, and states each clause of the row. The damp mapping reads `r^2.1796` (the U3 verdict finding 2: the code's exponent, `OKHSL_DAMP_RESIDUE_EXP`, maps damp 70 to d 0.9275; the row's `r^2.0875` is the superseded revision 6 figure). The Quick map row names both amendments. | `git show dc177a30:docs/reference/references/decision-records.md` gives 1 | 🟢 |
| C4.2 | The 4 owner strings (gate `:25` and `:73`, fixture, adapter row) read "#725 moved perceptual and peak at U2/U3 and re-captured; the next plan that moves them re-captures". `grep -n '#725'` on the three files shows no "U4 retires" or "move" present tense. | before: the U1 strings said U2 and U3 "move ... and re-capture; U4 retires this note" | 🟢 |
| C4.3 | `grep -c 725 CHANGELOG.md` prints 2 (`### 2026-09-30` Changed + Added entries naming the cap, the retune, the tone hold, `gate:chroma-envelope`, R69, and that a re-exported kit differs at every stop but 500). Issue close and roadmap row left to the Orchestrator. | base prints 0 | 🟢 |
| C4.4 | `node test/repo/citations.mjs` STALE 0; `em-dash.mjs` clean; `branding.mjs` clean; `npm test` exit 0, `all 54 test files passed`, tree clean after (only the 7 edited files modified before commit). No pin moved by U4's edits, so none re-pinned. | scratch clone, `tonal.js:1024` pin in `00-synthesis.md` moved to `:1124`: `1 STALE/NOFILE citation line(s): 89`, gate exits 1. | 🟡 |
| C4.5 | `grep -c '34e544942d500b9e\|990c17c5ae140e6e' .sdlc/baseline.md` prints 0 (row now `perceptual 8ae715d202be14b2 peak 0ac42e3c6dc6c0ef`, the fixture's pair; timing columns untouched). The `sweeps` passage names all eight `gate:sweeps` members (incl. `gate:chroma-envelope`, matching `ci.yml` lines 112 to 119) and says "eight"; the range grep prints 1. | base: pair prints 1, passage count 0 | 🟢 |

## Findings

1. 🟡 C4.4 control as worded ("one pin's line number moved by one") does not print STALE: the audit reads a one-line move as NEAR (report-only), and a moved range start that still contains its subject stays OK (`SKILL.md` `tonal.mjs:735-884` to `736-884` and `801-884` both OK). A 100-line move of a single-line pin bites (above). The plan wording could say "moved far enough to leave NEAR".
2. 🟡 Existing NEAR citations (two reactivity review docs cite `src/engine/tonal.js:1024`, `okhslLAt` now at `:1023`) are report-only and were not re-pinned; U4's edits moved no cited line.
3. The baseline mode-isolation row's timing text still cites the chroma-floor U3 re-time; only the printed hash pair changed, as C4.5 asks.

## Left out

The issue-facing PR text (C4 does not ask for it as a file; the CHANGELOG entry carries the blast-radius sentence), the issue close, the roadmap row, the plan tick: the Orchestrator's.
