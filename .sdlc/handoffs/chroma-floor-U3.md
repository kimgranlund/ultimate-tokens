# Handoff U3 · builder to reviewer (pass 1)

| Field | Value |
|---|---|
| Branch | unit/cf-U3, cut from plan/chroma-floor @ 27c513c1 (U1, U2 merged); this handoff rides in the one unit commit on top |
| Files | `.claude/skills/color-math/SKILL.md` · `.claude/skills/color-math/references/foundations.md` · `docs/reference/references/{glossary,decision-records,knowledge-02-tonal-scale}.md` · `docs/reference/CHANGELOG.md` · `.sdlc/baseline.md` · `.sdlc/adapter.md` (§1, two time ranges) |
| Host | 1-minute load 21 to 103 through the timing runs; counted under R57 (`.sdlc/runtime/owner-rulings-2026-09-22.md`, same rule as R49), not quiet-host |
| Scratch | `/private/tmp/claude-501/cf-U3/` (six gate logs, `npmtest.log`, a C11 control copy) |

## Criteria (figures at 27c513c1 plus this unit's docs and records edits; no engine file moved)

| Crit | Evidence | Negative control |
|---|---|---|
| C1 | `npm test` foreground, rc 0, 261 s, `✓ all 50 test files passed` (`TESTS.length` 50); `git status --short` after the run lists only the 8 edited files, no regenerated asset | not re-run; U2's control (a `scrimX` in role-table.json reds `semantic.mjs`) is unchanged, no gate code moved |
| C10 | regeneration ran inside `npm test`, tree unmoved by it. `git diff --stat $(git merge-base HEAD origin/main) -- docs/ code.js role-table.json` lists CHANGELOG, `docs/reference/SKILL.md`, decision-records, glossary, knowledge-02, the two `2026-08-20-reactivity/` files and `rubrics/acceptance-criteria.md`: 8 of the 10 allowed paths; `code.js`, `role-table.json`, `adia-oklch-export.css`, `quality-rubric.md` absent | appending a line to `knowledge-01-color-engine.md` makes the diff list it (`grep -c knowledge-01` prints 1), then reverted |
| C11 | the seven greps print `0`, `0`, `0`, `1`, `1`, `0`, `2` (0 is a pass for the sixth) | a scratch copy of `anchor.mjs` with one `LONE_SPIKE_ALLOW` line prints 1 |
| Docs | glossary row `chromaFloor` added (none existed); ADR-025 dated amendment; CHANGELOG 1.65; SKILL.md invariant 1 and foundations §5 carry the floor formula and the even shoulder, two-path line kept ("a change to one is a change to both"); knowledge-02 gains the shoulder. `node test/repo/branding.mjs` clean (747 files); `node test/repo/citations.mjs` STALE 0 across 10 docs; `test/repo/em-dash.mjs` does not exist on this branch, added lines grep 0 for U+2014 | none owned by this unit |

## Timing rows (R57), owed from U2's verdict C4 and C11/C12

| Gate | Run 1 | Run 2 | Run 3 | Load at start (1 min) | Load at end |
|---|---|---|---|---|---|
| `gate:even-dips` | 20.62 s | 23.15 s | 18.90 s | 42.34 · 36.51 · 32.91 | 36.51 · 32.91 · 28.70 |
| `gate:mode-isolation` | 60.14 s | 65.01 s | 48.25 s | 28.70 · 21.43 · 24.36 | 21.43 · 24.36 · 27.41 |

All six exit 0 (`PASS`; `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture`). `.sdlc/baseline.md` rows set to 3/3 and `.sdlc/adapter.md` ranges to `~19 to 23 s` and `~48 to 65 s`, each saying counted under R57, not quiet-host. `sh .sdlc/checks/baseline-agrees-check.sh`: `ok    time gate:mode-isolation: baseline 48 to 65 s, adapter 48 to 65 s`, `ok    time gate:even-dips: baseline 19 to 23 s, adapter 19 to 23 s`, `STALE ui.html: baseline 4130.1 KB, tree 4135.3 KB` (the one allowed STALE line), `stale total: 1`, exit 1 (the C12 pass value).

## Left out

| Item | Why |
|---|---|
| `docs/reference/rubrics/quality-rubric.md` | does not state the floor mechanism (grep `floor` finds nothing) |
| `ui.html` baseline figure | C12 allows exactly this one STALE line; pre-land repairs it |
| ADR-025's subject | ADR-025 is the on-color decision, not the floor; the plan names it as the amendment's home, so the line says the on-color decision is untouched. A floor-specific ADR is an Orchestrator call |
| Quiet-host readings | not taken; R57 accepts load |
