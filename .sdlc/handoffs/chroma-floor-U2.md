# Handoff U2 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/cf-U2 @ fe65e640 (code); this handoff is the next commit |
| Base | plan/chroma-floor @ 8b731da5 (U1 merged); `<base>` for movement and C5/C6 = 282fca8d |
| Files | src/engine/tonal.js · test/engine/tonal.mjs · test/engine/even-dips-gate.mjs (new) · test/engine/fixtures/tonal-legacy.json · package.json · .github/workflows/ci.yml · .sdlc/adapter.md · .sdlc/baseline.md · .sdlc/checks/baseline-agrees-check.sh · docs/reference/references/knowledge-02-tonal-scale.md · .claude/skills/color-math/references/foundations.md · docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md (citation `tonal.js:959` to `:974`) · figma/plugin/ui.html and src/ui/describe-mcp-assets.js (regenerated) |
| Host | 1-minute load 28 to 136 across the session; no timing here is a figure of record |

## The redesign

`evenChroma(maxc, intended, env, chromaFloor, floorRef = maxc)`, floor line:

```
const floorC = Math.min(((chromaFloor ?? 0) / 100) * Math.min(maxc, floorRef), intended);
```

`floorRef` is the gamut ceiling at the anchor stop: `maxc500` at both per-stop sites (`chromaAt` in `paletteStopsAnchored`, the per-stop map in `paletteStops`); the stop-500 seeds pass none (default `maxc`, identical there). Mechanism of the retired dips: the old floor `chromaFloor% * maxc` followed `maxc` down toward a dark or light anchor while the damped value rose toward it; the two met in a valley one or two stops out. With the reference capped at the anchor's own ceiling, the floor is flat on the side where the gamut widens away from the anchor and follows `maxc` down near white and black, so it is non-increasing outward on both sides, as is the damped value; their max has no interior minimum. Scaling the floor keeps that property, which is why a plain 1.6x control no longer bites (see Left out).

One boundary: a clamped anchor (L* outside 9.95 to 95.05) keeps the old floor (`floorRef = Infinity`). Its pivot sits at the window edge where the gamut is near-degenerate; capping there drained the far side to grey (`#FFFFFF`, hue 250, chroma 50, even stop 700: CAM16 C 14.45 to 4.72), which reddened #739's `achromatic-anchor` skip bound (4 of 30 skipped, bound 3). With the boundary: 0 off-anchor dips still, `achromatic-anchor` green, and the two near-black film presets that share dup key `even|280|...|850&875` render as before (the `KNOWN_BASELINE_DUP` swap an earlier draft needed is gone; list stays 23).

## Ran

| # | Command | Output | Negative control |
|---|---|---|---|
| C1 | `npm test` | `✓ all 50 test files passed`, exit 0; `git status --short` 0 after commit | `scrim` to `scrimX` in role-table.json, `node test/engine/semantic.mjs`: 2 FAIL lines, exit 1 (reverted) |
| C3 | `npm run -s gate:corpus-tonal` (FULL, `/private/tmp/claude-501/cf-U2/F/t.log`) | exit 0, `PASS: tonal-generation clears all [gate] predicates`; `grep -c EVEN_DIP_BASELINE` 0; line: `  dip-gate even rendered (anchor passed): 0 dips at stops other than 500 (19 + 25 stops, 3764 palettes + default kit 16, no baseline); 500: 32 (notch class, Q-C, not gated here)`; `pass  dip-gate-even` | in-gate, both over `dipDocs`, real `findDips`: pre-#701 floor `24` off-anchor (the revision-13 figure at U1's head), pre-#701 floor 1.6x `381`; missing patch target FAILs |
| C4 | `npm run -s gate:even-dips` | exit 0; tail: `  dip-gate even gate-path (no anchor): 0 dips (19 + 25 stops, 3764 palettes + default kit 16, no baseline)`, `PASS`; greps `1`, `1`, `1`, `0`, `3` | `node test/engine/even-dips-gate.mjs --full --floor-scale 1.6`: `120 dips ... pre-#701 floor scaled 1.6x`, `FAIL`, exit 1 (120, not the plan's 155: U1's shoulder is in) |
| C5 | `report-preset-fidelity.mjs --envelope --gate-path` / `--envelope` | gate path even: 10.9/16.2, 39.1/44.6, 39.0/44.6, 16.3/16.5, `above 100% of stop 500: 0 OK`, all four OK; perceptual+peak md5 `6e558839ee9e43217e1e2f7afc898b7b` (= `<base>`) | `--gate-path --damp-amp 55`: `above 100% of stop 500: 1916 FAIL` |
| C6 | `npm run -s gate:mode-isolation` | `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture (captured at 282fca8d..., 3780 corpus + 16 default kit, 25-stop, projectView)` | U1's (unchanged gate); movement script: perceptual 0 / 3796, peak 0 / 3796 moved |
| C7 | same captures | `anchor-ramp monotone: 0`; `distinct (25-stop) allow-list: 16 (expected 16)`; `pass skew-lift-okhsl`; `pass chroma-envelope`; `GRID_R2_EXCEPTIONS` 21, `KNOWN_BASELINE_DUP` 23; `chromaEnvelope(` 1 / 5 | scratch copy with a second `export function chromaEnvelope`: grep 2 |
| C8 | full tonal leg; `semantic.mjs`; `gate:corpus-contrast`; comparator vs 282fca8d | `pass chroma-floor`; `pass role-contrast`; `pass role-contrast Q-B floor gate: 0 unlisted drops`; `PASS: every measured curated preset's accent clears 4.5:1`; comparator `changed 4, down 4`, exit 1, exactly R44's four rows (U1's); `semantic.mjs` untouched by U2 | the gate's own (d) list: `SAT_FLOOR_EXCEPT` with 300 still listed self-reds `actually diverging 100,125,150,175,200,250,875,900,925,950` (seen on the first run) |
| C9 | `a.log`; `node test/ui/headless-boot.mjs` | perceptual bound 0.0048 (codes 2), peak 0.0048 (codes 1); even live `0.0209` (was 0.0486, still above 0.01); exit 0, `HEADLESS BOOT PASS`, `(hs)` source 4, log 0 | U1's `solveOkhslHue` +30 control, not re-run (no hue code touched) |
| C10 | regen via `npm test`; merge-base `docs/` diff | tree clean after commit; `docs/`: knowledge-02 (named) + the four revision-13(b) paths (two re-touched here for the same line shift); `code.js`, `role-table.json` absent; `adia-oklch-export.css` unmoved | `citations.mjs` red `✗ 2` before the two repairs |
| C11 | greps | 0, 0, 0, 1, 1, 0, 2 | the dip gate has no list; any off-anchor dip reds `dip-gate-even` |
| C12 | `sh .sdlc/checks/baseline-agrees-check.sh` | 15 lines, `ok time gate:even-dips: baseline 26 to 33 s, adapter 26 to 33 s`; only `STALE ui.html: baseline 4130.1 KB, tree 4133.8 KB`; `stale total: 1` | no `node_modules` in the worktree, so no build and the build KB cell is left |
| C2 | `a.log` | `pass  anchor-ramp lone-spike ... 0 (expected 0, corpus 3380 anchored + default kit 16, no allow-list)`; U1's control now reads 73 | not U2's |

`SAT_FLOOR_EXCEPT` re-derived: 100, 125, 150, 175, 200, 250, 875, 900, 925, 950 (300 no longer diverges).

## Dip histograms (25 + 19 stops, 3764 + kit 16)

| Reading | `<base>` 282fca8d | U1 head 8b731da5 | U2 fe65e640 |
|---|---|---|---|
| rendered, by stop | 450: 57, 500: 32, 550: 1 (plan) | 400: 3, 450: 20, 500: 32, 550: 1 | 500: 32 |
| rendered, depth | 44 in [3,4), 45 in [4,6), 1 at 6+ (plan, 326592d2) | 39 / 16 / 1 | 32 / 0 / 0 |
| gate path | 0 | 0 | 0 |

The three revision-13 stop-400 dips (Sapa `secondary|400`, Wadi Rum `primary-muted|400`, Yixing `primary|400`) are 0.

K = 32, all at stop 500 (the notch class, not gated): 22° N Sapa primary; 23° S Salar de Atacama edge secondary; 23° S Salar de Atacama 2,305 m secondary; 26° N Sehwan tertiary-muted; 30° N Atchafalaya secondary-muted and tertiary; 34° N Fushimi Inari tertiary-muted; 37° N Patmos secondary-muted; 41° N Great Salt Lake tertiary-muted; 41° N Tbilisi secondary; 48° N Viennese kaffeehaus secondary-muted; 51° N English oak woodland primary; 55° N Kamchatkan taiga tertiary-muted; 59° N Lake Baikal primary; Alice's Adventures in Wonderland tertiary; Charleston single house primary; Falu-red farmstead tertiary-muted; Fresh pasta tertiary-muted; Gospel primary-muted; Habitat 67 tertiary-muted; Himeji Castle secondary; Icelandic turf house tertiary-muted; Katsura Imperial Villa primary; Macarons tertiary-muted; Mod & British Invasion tertiary-muted; New England saltbox tertiary-muted; Pop-punk tertiary-muted; Symphonic & gothic metal tertiary-muted; The Red Shoes primary-muted; The orchestra tertiary-muted; Touch of Evil tertiary-muted; Trulli of Alberobello primary. Full keys in `/private/tmp/claude-501/cf-U2/F/k-names.txt`.

## Envelope tables

| READING (a) even | 100 | 300 | 700 | 900 | above 100% | C6 (v) even |
|---|---|---|---|---|---|---|
| gate path, `<base>` | 10.9 / 16.2 | 39.1 / 52.2 | 39.0 / 44.6 | 16.3 / 16.5 | 0 | n/a |
| gate path, U2 | 10.9 / 16.2 OK | 39.1 / 44.6 OK | 39.0 / 44.6 OK | 16.3 / 16.5 OK | 0 OK | n/a |
| rendered, `<base>` | 15.6 / 37.0 | 48.4 / 113.7 | 42.5 / 80.2 | 22.9 / 52.0 | 670 | 1,205 / 3,764, max 17.18x |
| rendered, U2 (REPORTED, NOT BARRED) | 15.6 / 37.0 | 46.3 / 94.1 | 42.5 / 79.9 | 22.9 / 52.0 | 374 | 909 / 3,764, max 13.66x |

100 and 900 medians unmoved on both readings. Both rendered counts fell.

## Blast radius (rendered hex, CAM16)

Script: `/private/tmp/claude-501/cf-U2/report-chroma-floor-movement.mjs` (U1's scratch, unchanged copy), run `REPO=<worktree> node ... <base-ref>`; outputs `F/mv-base.txt`, `F/mv-u1.txt`.

| Field | U1 + U2 vs 282fca8d | U2 alone vs 8b731da5 |
|---|---|---|
| presets moved | 344 / 344 | 344 / 344 |
| palettes moved | perceptual 0, peak 0, even 3,137 / 3,796 | perceptual 0, peak 0, even 2,566 / 3,796 |
| even 25-stop cells moved | 13,353 / 94,900 (14.07%, under the 15% line) | 8,822 / 94,900 (9.30%) |
| max dL* | 0.3848 (8-bit quantization; target tone unchanged) | 0.3676 |
| max dC overall | 27.43, Tongass secondary stop 175 | same |
| max dC by stop (U2 alone) | | 100: 8.74, 125: 16.20, 150: 24.05, 175: 27.43, 200: 25.98, 250: 23.41, 300: 19.90, 350: 18.66, 400: 13.62, 450: 7.11, 550: 9.87, 600: 21.39, 650: 23.80, 700: 18.76, 750: 13.99, 800: 9.56, 900: 6.48, 950: 4.09 |
| lone spikes | 64 + 1 to 0 (U1) | 0 to 0 |
| default kit | 37 even legacy-fixture cells re-pinned (list in the tonal.mjs carve-out comment: Secondary, Info, Success, Warning, Danger, Data 1/4/5/6/7, stops 125 to 450 and 650), role-contrast green, FLOORS unmoved by U2 | |
| exports | even-mode cells of every format and `figma/plugin/ui.html` (4130.1 to 4133.8 KB); Adia OKLCH export unmoved | |

The largest moves are light stops (150 to 300) of dark anchors on light-cusp hues, where the old floor rose with `maxc` toward the cusp: those tints are now less saturated. That is the design, not a side effect, and it is where most of the 9.30% sits.

## Left out / for the reviewer

- 🟡 C3 control (1) and C4's control are not the plan's literal "shipped floor at 1.6x": that reads 0 off-anchor dips on both paths (measured, rendered 0 at stop != 500, gate path 0), because `min(maxc, floorRef)` is non-increasing outward at any scale. Both controls instead restore the pre-#701 floor (drop `floorRef`), plain and at 1.6x; `--floor-scale k` scales that engine. The new patch target string is `const floorC = Math.min(((chromaFloor ?? 0) / 100) * Math.min(maxc, floorRef), intended);`.
- 🟡 The clamped-anchor boundary (`floorRef = Infinity`) is a second condition in the design; it is argued above, but a plan revision should name it.
- 🟡 `gate:even-dips` timing row is 0/3 quiet-host (load 60 to 100); a quiet set is owed before pre-land, like U1's mode-isolation row.
- 🟡 The even `hueSpace` live magnitude fell 0.0486 to 0.0209 (still above the 0.01 floor); C9 passes, flagged because the margin shrank.
- The color-math `SKILL.md` invariant 1 is still true as written and was not touched; foundations §5 and knowledge-02 now state the floor. Glossary, ADR-025 line and CHANGELOG stay U3's.
- `findDips` is copied into `even-dips-gate.mjs`: it is a closure inside `tonal.mjs`, which runs its gates at import.
- No build (no `node_modules` in the worktree); baseline build KB cell untouched.
