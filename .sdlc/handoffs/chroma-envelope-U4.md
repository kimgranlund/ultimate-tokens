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

# Pass 2 · builder → orchestrator

| Field | Value |
|---|---|
| Fixes | verdict findings 1 (CHANGELOG claims), 2 (amendment counts, now over `afd415c0`), 3 (both reactivity cites to `tonal.js:1026`) |
| Files | `CHANGELOG.md`, `docs/reference/references/decision-records.md` (the "export-wide" clause only), `docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89`, `04-context-and-messaging.md:71`, this handoff |
| Not touched | engine, scripts, tests, fixtures, plan, board; finding 5 (7.60 vs 7.59) left per the re-diagnosis: a comment in `test/engine/semantic.mjs:302` and the plan's C3.7 text, outside U4's lane, a one-line follow-up for the close step |
| Base of every figure | `main` at `afd415c0` (merge-base of the plan), measured at head `5aa90430` plus this pass's records-only diff (no `src`/`scripts` line differs, so the render is 5aa90430's) |

## Figures, each with its command and printed line

All run in `.worktrees/ce-U4` except the probe rows, which ran in a throwaway clone of `5aa90430` (`$CLAUDE_JOB_DIR/tmp/probe2`) with six scratch lines added to the identity compare loop of `scripts/report-preset-fidelity.mjs`; the clone was never pushed and the worktree script is unchanged.

| Record sentence | Command | Printed line |
|---|---|---|
| CHANGELOG "90 to 91% of cells move: 86008 of 94500 perceptual and 85463 of 94500 peak ... 3780-palette corpus"; ADR "perceptual 3780 of 3780 palettes and 86008 of 94500 cells, peak 3780 of 3780 and 85463 of 94500" | `node scripts/report-preset-fidelity.mjs --identity-control --authored --base afd415c0` | `identity perceptual: 3780/3780 palettes, 86008/94500 cells differ, max dL* 2.4410` · `identity peak: 3780/3780 palettes, 85463/94500 cells differ, max dL* 2.3142` (86008/94500 = 91.0%, 85463/94500 = 90.4%) |
| CHANGELOG "Even mode does not move"; ADR "even 0 in both" | same | `identity even: 0/3780 palettes, 0/94500 cells differ, max dL* 0.0000` · `identity even default kit: 0/16 palettes, 0/400 cells differ` |
| ADR "default kit perceptual 16 of 16 palettes and 347 of 400 cells, peak 16 of 16 and 352 of 400, even 0 of 16" | same | `identity perceptual default kit: 16/16 palettes, 347/400 cells differ, max dL* 2.2188` · `identity peak default kit: 16/16 palettes, 352/400 cells differ, max dL* 2.0624` (run exits 1, as the moved modes must) |
| CHANGELOG "stop 500 moves in one palette of 3780 per mode (film "The Night of the Hunter" primary, `#1C1B1E` to `#1B1C1E`)" | probe: same command, loop counts `baseRamp[i].stop === 500 && hex differs` | `PROBE perceptual: stop500 moved 1 (film/The Night of the Hunter ... /primary #1C1B1E->#1B1C1E)` · `PROBE peak: stop500 moved 1 (same)` · default kit `0` both modes |
| CHANGELOG "on the cap's own path no stop's envelope reads above stop 500's" | `node scripts/report-preset-fidelity.mjs --envelope` (reading b) | perceptual and peak each `above 100% of stop 500: 0 OK` with `(16 additional instance(s) from the named Adia carve-out, exempt from this clause)` |
| CHANGELOG "a near-grey palette's white stop 50 can still read above its stop 500 (15 of 3764 in the `test/engine/tonal.mjs` C6 (v) ratchet)" | `node scripts/report-preset-fidelity.mjs --envelope \| grep 'C6 (v)'` | `peak (gated in test/engine/tonal.mjs C6 (v)): 15/3764 violator(s), max 2.023757x stop 500's own chroma` |
| CHANGELOG "a damped stop keeps the CIE L\* it had before the envelope was applied (to within 0.8 L\*)" | probe: max abs(`lstarFromRgb(head.rgb)` minus `head.toneTarget`) over every cell | `PROBE perceptual: ... cells with toneTarget 94500; max \|headL*-toneTarget\| 0.4819` · `PROBE peak: ... 94500; 0.7943` (the re-diagnosis had these two swapped, 0.7943 perceptual / 0.7 peak; the bound "under 0.8" holds either way) |
| CHANGELOG "a cell's L\* moves by up to 2.4, which is the lightness drift the old chroma coupling carried" | identity line `max dL*`; probe: max abs(`lstarFromRgb(base.rgb)` minus head `toneTarget`) | `max dL* 2.4410` / `2.3142`; `PROBE perceptual: max \|baseL*-toneTarget\| 2.4290; cells dL*>1 792` · `PROBE peak: 2.2158; 401` |
| CHANGELOG "the envelope reads 0.74 at stops 300/700 and 0.23 at 100/900" (kept) | `--envelope` (reading b) | perceptual and peak `stop 300: median 74.3%`, `stop 700: median 74.3%`, `stop 100: median 23.0%`, `stop 900: median 23.0%` |
| CHANGELOG "`d` 0.9275", "`c` = log2 3"; ADR `r^2.1796` (kept) | `node -e 'import("./src/engine/tonal.js").then(m=>console.log(m.OKHSL_DAMP_D,m.OKHSL_DAMP_RESIDUE_EXP))'`; `grep -n OKHSL_DAMP_CURVE_GAIN src/engine/tonal.js` | `0.9275 2.179591355961476`; `:447 OKHSL_DAMP_CURVE_GAIN = Math.log2(3) / 1.5` |
| CHANGELOG floors "peak Success light to 7.5, perceptual Data 3 dark to 4.8" (kept) | `grep -n '"Success", 7.5\|"Data 3", "dark", 4.8' test/engine/semantic.mjs` | `302: ["Success", 7.5, 4.8]` (under `peak:`) · `371: ["perceptual", "Data 3", "dark", 4.8]` |
| CHANGELOG "eighth `gate:sweeps` member" (kept) | `node -e 'console.log(require("./package.json").scripts["gate:sweeps"])'` | eight `npm run gate:*` members, last `gate:chroma-envelope` |
| Reactivity cites `tonal.js:1026` | `sed -n '1026p' src/engine/tonal.js`; `node scripts/audit-citations.mjs \| grep okhslLAt` | `export function okhslLAt(lstar) {` · `OK ... 00-synthesis.md:89 cites src/engine/tonal.js:1026 -> matched okhslLAt at src/engine/tonal.js:1026` and the same for `04-context-and-messaging.md:71` |

## Pre-handoff check (re-diagnosis steps 1 to 8)

| Step | Printed | State |
|---|---|---|
| 1 identity over `afd415c0` | the six lines above | 🟢 |
| 2 C6 (v) | `15/3764 violator(s)` | 🟢 |
| 3 `grep -n '91%\|86008\|85463\|15 of 3764\|2\.4' CHANGELOG.md` | `:16` (91%, 86008, 85463), `:22` (15 of 3764), `:29` (2.4); plus `:644`, an older unrelated entry (`2.49·h^0.58`) | 🟢 |
| 4 old counts in ADR-026 | `grep -c '76998\|75804\|3779'` = `0` | 🟢 |
| 5 cites | both `tonal.js:1026`, line is the def | 🟢 |
| 6 repo gates | `STALE 0 across 10 discovered docs + 11 fact pins`, `em-dash: clean (1012 files scanned)`, `branding: clean (1004 files scanned)` | 🟢 |
| 7 `git diff febaa601 -- src scripts \| wc -l` | `0` | 🟢 |
| 8 `npm test` | `✓ all 54 test files passed`, status 0, real 93.43 s; `git status --short` after lists only the five pass 2 files | 🟢 |
