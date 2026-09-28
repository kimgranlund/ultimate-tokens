PASS

# Review U3 · chroma-floor (#701), pass 1

Reviewed `unit/cf-U3` at ba8eece2 in a throwaway clone (`/private/tmp/claude-501/cf-U3-rev`), diff against the merge-base with `plan/chroma-floor`. Nine files, no `src/` file, no test file, no generated asset.

| Crit | Check and result | Negative control |
|---|---|---|
| Timing rows | Baseline rows read 3/3 with `60.14 · 65.01 · 48.25` (mode-isolation) and `20.62 · 23.15 · 18.90` (even-dips), each saying R57-counted, not quiet-host, matching the handoff's six figures. Adapter §1 ranges `~48 to 65 s` and `~19 to 23 s` cover min and max of those figures and say "counted under R57 load". R65 extends R57 to even-dips, so 3/3 under load is the ruled reading. `baseline-agrees-check.sh` prints `ok time gate:mode-isolation: 48 to 65` and `ok time gate:even-dips: 19 to 23` | a range narrower than the figures (`~19 to 22 s`) would not cover 23.15; the check compares baseline against adapter only, so the figure-to-range agreement was checked by hand |
| C12 | `STALE ui.html: baseline 4130.1 KB, tree 4135.3 KB` is the only STALE line, `stale total: 1`, exit 1; the `head:` line is a `note` | not run; the plan's own control (an extra `TESTS` entry prints `STALE tests:`) is unchanged, no gate code moved |
| C10 | `git diff --stat merge-base(origin/main) -- docs/ code.js role-table.json` lists 8 paths, all in the plan's allowed ten; `code.js`, `role-table.json`, `adia-oklch-export.css`, `quality-rubric.md` absent (the rubric has 0 `chromaFloor` hits, so leaving it out is right) | a `knowledge-01-*.md` path is not in the diff (`grep -c knowledge-01` prints 0); the plan's control (touching it lists a path outside the list) holds by the same test |
| C11 | seven greps print `0`, `0`, `0`, `1`, `1`, `0`, `2` (0 is a pass for the sixth) | the gates assert zero with no list; the plan's own control (re-adding an allow-list) is a gate red, not owned by this unit |
| Docs true of the engine | `src/engine/tonal.js` at ba8eece2: `evenChroma` is `min(maxc, max(min(intended*env, maxc), floorC))` with `floorC = min(chromaFloor/100 * min(maxc, floorRef), intended)` (line 336 to 340); `floorRef` is the max of the 450, 500, 550 ceilings on both the anchored (806) and non-anchored (934) paths; `EVEN_NEIGHBOURHOOD_R = 0.2` exported (427), applied only under `isEven` as a smoothstep of `min(1,|sd|/R)` on `uG` (438 to 441); default `chromaFloor` 40 (tonal.js:54, persist.js:133 range 0 to 100). SKILL.md invariant 1, foundations §5, knowledge-02, the glossary row and CHANGELOG 1.65 all say this; the two-path line is kept. The CHANGELOG figures (11,311 of 94,900, 11.92%, 2,991 of 3,796) match the U2 verdict record. `node test/repo/branding.mjs` clean (748 files); `node test/repo/citations.mjs` STALE 0 across 10 docs | none of the doc lines can be broken by a test; the check is a line-by-line read against the source |
| ADR-025 amendment | The plan names it: U3 text says "a dated amendment line under ADR-025", and C10's list names "the ADR-025 amendment line, U3". The amendment line is true: it states the envelope-relative floor, the shoulder, `EVEN_NEIGHBOURHOOD_R` 0.2, the three retired lists (the plan's C11 names three, the plan's U3 text says "both", the line's "All three" matches C11 and the code), and that the on-color decision is untouched. ADR-025 is the on-color decision (heading at decision-records.md:696), so the placement is a plan choice, not a builder error | n/a, a prose check |
| Em dash and gates | perl over the added lines for `\x{2014}` prints nothing (em-dash.mjs is absent on this branch) | the same perl on a line containing U+2014 matches (the pattern is not vacuous) |
| C1 | not re-run. The diff carries no `src/`, `test/`, or generator input, so the engine and tests are as U2's verified head; the handoff's foreground run (rc 0, 50 files) is not contradicted | n/a |

## Findings

| Severity | Finding |
|---|---|
| Low | The floor amendment lives under ADR-025 (the on-color ADR) because the plan names it. A reader of ADR-025 meets an unrelated mechanism. The builder flagged it; a floor-specific ADR is an Orchestrator call, not a U3 defect |
| Low | The plan's U3 text says "both allow-lists retired" while C11 and the code have three. The amendment line uses the correct count; the plan wording could be fixed at revision |
| Low | The adapter §1 mode-isolation and even-dips cells say "counted under R57 load, not quiet-host"; the word "under-load" itself is not used, but the meaning is the same and the baseline rows say the same |

No High or Medium finding.

verdict: 🟢
