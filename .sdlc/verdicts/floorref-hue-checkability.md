# Criteria review floorref-hue · 🟢 checkable (23 of 23, 11 🟡), mobilize only after #725 lands

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/floorref-hue.md` revision 0 (draft, uncommitted in the root checkout), head b8142c16 (`origin/plan/chroma-envelope`), ticket #766 |
| Asked by | conductor, 2026-09-30: grade each criterion checkable or not |
| Grade | L1 seat, ran the checks itself: reads in the root checkout and a throwaway shared clone at b8142c16 under `$CLAUDE_JOB_DIR/tmp/fr` (nothing edited except one reverted control) |

Checkable means a command exists now that prints one value before the unit and a different value after, and the expected value is one a builder following the plan's own section 3 can reach.

verdict: 🟢

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| C1.1 | `--floor-ref` report, 0 moved against own head | 🟢 | `grep -oE -- '--floor-ref'` in `scripts/report-preset-fidelity.mjs` reads nothing today; the `--identity-control` shape it copies runs at b8142c16: `0 differing cells`, 3780 palettes plus 16 kit, 55 s | the `scaledEngine` 1.6x base, as stated; `even-dips-gate.mjs` shows that recipe biting today: `120 dips` |
| C1.2 | `--only default-kit` rows | 🟢 | the kit is 16 palettes: identity run prints `0/16 palettes, 0/400 cells` | as C1.1 |
| C1.3 | mode documented, header names #766 | 🟢 | `grep -c "floor-ref"` reads `0` today | the unfixed script reads `0` |
| C1.4 | `npm test` green | 🟡 | at b8142c16 `node test/engine/tonal.mjs` has one FAIL, `(C6 ii) perceptual: 3 duplicate-hex pair(s)`, the #725 in-flight row the Today cell names | plan says n/a; the adapter §1 role-table control applies |
| C2.1 | gate path at most 6 moved, all rotated, max 1 C | 🟡 | report mode absent today; identity run shows the even row at `0/3780` | stated control (per-ramp constant at a rotated hue) is unmeasured, routed to U1 C1.1; see finding 1 |
| C2.2 | rendered path max dC at most 10 C | 🟡 | as C2.1: no `--floor-ref` mode today | stated control (450-only reading) unmeasured, routed to U1; see finding 1 |
| C2.3 | reference inside `chromaAt(h)`, 500 at `pivotTone`, no `const floorRef` | 🟢 | `grep -c 'const floorRef' src/engine/tonal.js` reads `2` at b8142c16 and at `origin/main` | the unfixed file reads `2`; a reference placed after the solve is told apart by reading the closure |
| C2.4 | 0 dips both paths, controls bite | 🟢 | at b8142c16: `even-dips-gate.mjs` `0 dips (19 + 25 stops, 3764 palettes + default kit 16)`, control `120 dips`; `tonal.mjs` `pass dip-gate-even`, controls `1` and `38` off-anchor dips | the two `FLOOR_TARGET` controls, measured biting above |
| C2.5 | mode-isolation hashes unchanged | 🟢 | `pass mode-isolation: perceptual a874ac86f2e113b4 peak 815dcec4262382da` at b8142c16, matching the fixture | an `okhslStops` edit moves a hash |
| C2.6 | `intensity-legacy` pass, fixture byte-identical | 🟢 | `pass intensity-legacy` at b8142c16; `git diff --stat` on the fixture is empty before any unit | stated kit `hueShift` 10 control, not run by me |
| C2.7 | even envelope row does not rise | 🟢 | `test/engine/fixtures/chroma-envelope.json` even row: median 300 `47.0855`, p90 300 `100.3224`, `above100` `502`, as the Today cell says; `--capture` and `--compare` exist in the gate | a hand-lowered `above100` in the compare fixture, as stated |
| C2.8 | paired timing within bounds | 🟡 | a timing row; planner single runs `5.55 s` vs `5.91 s` and `13.16 s` vs `29.54 s` | plan says n/a; a verifier control is a head copy with an added busy loop in `evenChroma`, which must push the ratio over its bound |
| C2.9 | identity-control moves only even cells | 🟢 | `--identity-control --authored --base HEAD` at b8142c16 prints the perceptual, peak and even rows separately (`identity even: 0/3780 palettes, 0/94500 cells`), the same 3780 plus 16 palettes and 25 stops as the C2.2 `EXPORT_STOPS` row, so the even row can equal the C2.2 set | an `okhslStops` edit moves the perceptual row; the mode's own `--perturb` also bites |
| C2.10 | semantic FLOORS hold, no new pending | 🟢 | `test/engine/semantic.mjs` at b8142c16: all pass, `41 cells named "pending U4"`, 96-cell `FLOORS` | measured: `chromaFloor: 40` to `0` in `DEFAULT_CONTROLS` reds `role-contrast, even Secondary DARK: ... 5.50:1, below its pinned floor 5.5:1`, reverted |
| C2.11 | deferral sentences gone | 🟢 | `grep -c "deferred to #766\|the issue its comment names" src/engine/tonal.js` reads `2` at b8142c16 and at `origin/main` | the unfixed file reads `2` |
| C2.12 | no hue literal or hue comparison in the hunks | 🟡 | a read of `git diff <merge-base> -- src/engine/tonal.js` | plan says n/a and names no command; a verifier control is `grep -E '^\+.*\bhue\s*[<>]'` on the diff, planted `if (hue > 90)` reads `1` |
| C3.1 | color-math records state the per-stop rule | 🟡 | `grep -c 'floorRef\|seed hue\|seedHue'` reads `2` in `SKILL.md` and `3` in `foundations.md`, `5` hits, not the `4` the Today cell says | the stated control is vacuous today; see finding 2 |
| C3.2 | ADR-026 amendment naming #766, Quick map row | 🟡 | `grep -c '#766' decision-records.md` reads `0`; ADR-026 spans lines `730` to `777`, ADR-027 follows at `778`, Quick map at `826` with an ADR-026 row | a file without the amendment reads `0`; see finding 3 |
| C3.3 | knowledge-02 §5 and glossary state the per-stop reading | 🟡 | knowledge-02 `:140` and `:141` and the glossary `chromaFloor` row describe `floorRef` as the largest ceiling among 450, 500, 550 and name no hue | the stated control is vacuous today; see finding 2 |
| C3.4 | CHANGELOG Unreleased entry | 🟢 | `## [Unreleased]` at `CHANGELOG.md:9`; `grep -c '#766'` reads `0` | the unfixed file reads `0` |
| C3.5 | `#766` mentions retired to history | 🟡 | `grep -c '#766'` reads `0` in both test files already; in `tonal.js` the deferral sits at the two call sites, and the `evenChroma` header states the one-hue reading (`exact at hueShift 0 on the cam16 path`) without `#766` | the test-file grep cannot red; see finding 2 |
| C3.6 | em-dash and branding gates green | 🟡 | both gates exist and run in `npm test` | plan says n/a; an appended U+2014 reds `em-dash.mjs` |
| C3.7 | issue closed with figures | 🟡 | `gh issue view 766` reads open today | plan says n/a; the open state today is the control |

## Findings

1. **C2.1 and C2.2 pass a hollow U2.** Both are upper bounds only, so an unchanged engine reads `0` moved and passes them. A unit that deletes `const floorRef` but still reads the ceilings at `seedHue` and `baseHue` passes C2.1, C2.2, C2.7, C2.11 and the C2.3 grep. Only the C2.3 closure read catches it. A lower bound makes the movement itself mechanical: for example, gate path exactly the rotated palettes' cells moved and rendered path moved cells > 0. The planner measured 6 and 3,870.
2. **The C3.1, C3.3 and C3.5 controls are vacuous today.** No current record says "seed hue". They are silent on hue, so "no line says seed hue" already holds before U3. The check that reds is positive: each hit names the rendered hue. For example, a grep for `rendered hue` or `each stop's` in those files and in the `evenChroma` header reads `0` today. The C3.1 Today cell says `4`, but the count is `5`.
3. **C3.2 placement is ambiguous.** "ADR-026 gains a dated amendment paragraph (appended before the Quick map, per CLAUDE.md)". ADR-026 is not the last ADR: ADR-027 sits between it and the Quick map. CLAUDE.md's before-the-Quick-map rule is for new ADRs. The amendment belongs inside ADR-026, and the `#766` grep should be bounded to that section.
4. **The five n/a controls** (C1.4, C2.8, C2.12, C3.6, C3.7) each have an obvious control, written in the table above. The plan should state them.
5. **Timing.** Mobilizing needs #725 landed (the `depends:` line). The Today cells were read on the plan branch at b8142c16. The `tonal.js` readings (`const floorRef` `2`, deferral `2`, `FLOOR_TARGET` literal `1`) are identical on `origin/main` today.

### Verdict

verdict: 🟢

🟢 checkable: 23 of 23 criteria, 12 🟢 and 11 🟡, no 🔴. Findings 1 and 2 are the ones worth a revision before U2 and U3 are graded.
