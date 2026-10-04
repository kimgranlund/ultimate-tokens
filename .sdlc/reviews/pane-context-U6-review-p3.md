PASS
R98: none found. Pass 3 adds no code, flag, shim or fallback; every changed line under `src`, `test` and `scripts` is a comment (non-comment changed lines `0`).

# Review pane-context U6, pass 3 (#785)

| Field | Value |
|---|---|
| Seat | reviewer, fresh context |
| Branch | `unit/pc-U6` @ `ce00d147` against pass 2 head `edeeb8d9`; verdict `main:.sdlc/verdicts/pane-context-U6.md` (🔴, `d91037cd`); earlier reviews `daef1140` (FAIL), `c4c46d2c` (PASS) |
| Criteria | `### U6` and the widened U6 Lane in `plan/pane-context:.sdlc/plans/pane-context.md`; brief `.sdlc/handoffs/pane-context-U6-pass3.md`; sweep table in the Pass 3 section of `.sdlc/handoffs/pane-context-U6.md` |
| Scratch | `/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U6-rev3/` (`probe.mjs`, `sweep.py`, `old/` engine at `c7470c53`, `a/` and `b/` comment-filter control, `clone/` gate clone at `ce00d147`) |

## Findings, ranked

| Rank | Severity | Finding | Evidence | Control |
|---|---|---|---|---|
| 1 | 🟡 low, non-blocking | LLD `:171` "14 of the 16 defaults moved, Secondary and Warning did not" is the engine fixture's count, read next to a sentence about the doc gate. #785 moved `0` of 16 palettes in the doc fixture (`test/ui/fixtures/default-doc-ramps.json`, `1e3fe1eb^` vs head) and `14` of 16 in `test/engine/fixtures/tonal-legacy.json` (all but Secondary and Warning). The qualifier itself ("identity holds only for a palette whose group is at 100") is true as a necessary condition, and against 0.2.0 the doc gate also shows 14 of 16 differing, but those differ from `chroma != rampChroma`, not from a group below 100 (every default group is 100). Suggest naming the fixture in a later docs pass | `node probe.mjs` fixture diff, both fixtures | the same compare over `tonal-legacy.json` reads 14 of 16 moved, so the `0` is not a blind compare |
| 2 | 🟡 low, record only | Handoff Pass 3 table lists `src/engine/tonal.js:754` as "true as written"; 754 is the first line of the sentence fixed at 755. The table's rows also sum to 531 lines (427 true, 69 qualified, 26 history, 9 fixed) against the stated 546 (433, 74, 27, 12); the 9 hand-swept LLD hits are not itemised | `.sdlc/handoffs/pane-context-U6.md:99` and `:180`; my count over the table rows | tonal.js `:754` at `edeeb8d9` belongs to the unqualified "byte-exact by contract" sentence the builder fixed |
| 3 | 🟡 low, none live | The builder's matcher missed hyphen and no-space spellings (`stop-500`, `rampchroma`, `byte-for-byte`) in 7 files: type-scale best-practices `:22`, `mcp/brand-kit-merged-core` `:39`, `mcp/png-swatch-board` `:279`, `:281`, `hct.js:334`, `test/figma/migrations` `:38`, `test/mcp/brand-kit-merged-core` `:78-80`, `test/mcp/png-swatch-board` `:161`. I read each; none is a stop-500-at-group claim | `sweep.py` variant terms | n/a, each line read by hand |
| 4 | 🟡 cosmetic | The tonal.js header fix reflows `:632-638` where the lane names `:631-633`; same paragraph, same 7 lines, comment only | `git diff -U0 edeeb8d9 ce00d147 -- src/engine/tonal.js` | comment-only filter below |

No blocking finding.

## The five verdict lines

| Line | State | Evidence (text at `ce00d147`) | Control |
|---|---|---|---|
| `foundations.md:132` | 🟢 | "returns the stored `anchor` verbatim at group base chroma 100 only (a group value below 100 damps the whole ramp, stop 500 included, R94)" | base text at `edeeb8d9` had no group qualifier |
| `tonal.js:631-633` (now `:632-638`) | 🟢 | "VERBATIM, in every tone mode (this function; `paletteStops` damps it below group 100, R94)" | sweep predicate flags it UNQUAL at `edeeb8d9`, ok at `ce00d147` |
| `persist.js:150` | 🟢 | `src/ui/persist.js:149-150`: "the ramp's stop 500 at group 100, R94 damps it below" | UNQUAL at `edeeb8d9`, ok at `ce00d147` |
| `gen-categories.mjs:131` | 🟢 | `scripts/gen-categories.mjs:131`: "the ramp's stop 500 (group 100 only, R94) render verbatim" | UNQUAL at `edeeb8d9`, ok at `ce00d147` |
| LLD `:169` | 🟢 (see finding 1) | "since #785 that identity holds only for a palette whose group is at 100"; banner `:14` names the sentence | UNQUAL at `edeeb8d9`, ok at `ce00d147` |

The sweep predicate read foundations `:132` as ok at base too (the word "damp" sat in its window), so that one rests on the text diff, not the predicate.

## The three extra fixes

| Line | State | Evidence (text at `ce00d147`) | Control |
|---|---|---|---|
| `knowledge-02-tonal-scale.md:15` | 🟢 | TOC: "exact at `prime.DEFAULT`, and at stop 500 at group base chroma 100" | matches the body qualifier at `:428` |
| `tonal.js:755-756` | 🟢 | `src/engine/tonal.js:755`: "byte-exact by contract at group 100 (R94 damps after)" | `enforceMonotonePixelL` runs inside the at-100 render; `dampStops` runs after it in `paletteStops` `:931` |
| `headless-boot.mjs:1505-1506` | 🟢 | `test/ui/headless-boot.mjs:1505`: "the stop the anchor guarantees byte-exact at group 100 (R94)" | the (hh) test uses curated presets in even mode at group 100, so the assertion it describes is unchanged |

## Qualifier truth probe

`probe.mjs` takes the anchored palettes of `defaultDocument()`, sets every group's `baseChroma` to g, and reads `projectView`.

| Tone mode | g 100 stop 500 == anchor | g 60 | g 30 | `prime.DEFAULT` == anchor, every g | Control (engine at `c7470c53`, before the damper) |
|---|---|---|---|---|---|
| perceptual | 16/16 | 0/16 | 0/16 | 16/16 | 16/16 at every g |
| peak | 16/16 | 0/16 | 0/16 | 16/16 | 16/16 at every g |
| even | 16/16 | 0/16 | 0/16 | 16/16 | 16/16 at every g |

So "stop 500 equals the anchor at group 100 but not below it" is true in all three modes, and "`prime.DEFAULT` equals the anchor unconditionally" is true. The control shows that the probe tells the damped engine from the undamped one.

## Comment-only diff

| Check | Result | Control |
|---|---|---|
| `git diff -U0 edeeb8d9 ce00d147 -- src test scripts` (excluding the generated `describe-mcp-assets.js`) | 24 changed lines, 0 non-comment | `a/` and `b/` scratch copies with `b`'s tonal.js `const EPS = 1e-9` changed to `1e-8`: the same filter reads `2` |
| `src/ui/describe-mcp-assets.js` | the generated embedding of the same comments; `npm test` regenerates it with porcelain `0` | n/a |

## Independent class sweep

Method: every tracked file under `docs`, `.claude`, `plugin`, `mcp`, `src`, `scripts`, `test` at `ce00d147`, read through `git show`. Line breaks are collapsed, and each hit gets a window of ±260 characters. The terms are `stop 500`, `verbatim`, `rampChroma`, `byte for byte` and `0.2.0 output`, with their hyphen and no-space variants. History is excluded: archives, `docs/tickets`, CHANGELOG, amendments, verdicts, reviews, handoffs and questions.

| Measure | Result | Control |
|---|---|---|
| Raw hits | 649 in 99 files | n/a |
| Claim-class candidates (a stop-500 or byte-identity claim with no group, damp, R94 or function-scope qualifier in the window) | 64 | the same predicate flags 4 of the 5 verdict lines UNQUAL at `edeeb8d9` and 0 at `ce00d147` |
| Live unqualified hits after reading all 64 | 0 | n/a |

The 64 are all true as written. They fall into four groups:

- Function-level statements about `paletteStopsAnchored` and `okhslStopsAnchored`, which do return the anchor verbatim: tonal.js `670-675`, `832-839`, `1274` and `1309-1332`.
- `prime.DEFAULT` lines, which hold unconditionally.
- Gate and history narratives.
- ADR-026 body `decision-records.md:740-742`, which is append-only and already amended.

## Builder disposition table spot-check

I read more than 15 rows of the builder's disposition table by hand and includes every "true as written" row. All of them hold. The list:

- `test/engine/tonal.mjs` `1936-1946`, `1678-1683`
- `scripts/gen-categories.mjs` `96-103`, `522`
- spec `343-345`, `366-369`
- glossary `12-26`
- plugin color-tokens SKILL `77-80`
- `docs/reference/SKILL.md` `95-101`
- color-math SKILL `122-125`
- `anchor.mjs` `855-905`, `1498-1520` (`1503` is qualified at `1506-1507`)
- knowledge-02 `425-465`
- tonal.js `765-830`, `915-975`

Every listed line has a sweep term within reach except tonal.js `:754` (finding 2).

## Lane, gates, records

| Check | Result | Control |
|---|---|---|
| Lane, `git diff --stat edeeb8d9 ce00d147` | 11 files, all in the widened lane: foundations, tonal.js, persist.js, gen-categories, headless-boot, knowledge-02, LLD, baseline, `figma/plugin/ui.html`, `describe-mcp-assets.js`, unit handoff | n/a |
| U+2014 | `em-dash.mjs`: `clean (1153 files scanned)`; 0 in added lines | n/a |
| `npm test` in scratch clone at `ce00d147`, NODE_OPTIONS unset, heavy count `0` | rc 0, `✓ all 54 test files passed`, 4:44 at load 8 to 9, porcelain `0` | n/a |
| `npm ci` then `npm run build` | rc 0, `wrote figma/plugin/ui.html 4170.9 KB`, porcelain `0` | baseline row read 4170.7 at `edeeb8d9` |
| `baseline-agrees-check.sh` | `stale total: 0` | n/a |
| Correction line in `.sdlc/baseline.md` | present, 1 match for "Correction (2026-10-04, pane-context U6 pass 3, #785)" | n/a |
| `card-amendment-check.sh` | `stale total: 0` | n/a |
