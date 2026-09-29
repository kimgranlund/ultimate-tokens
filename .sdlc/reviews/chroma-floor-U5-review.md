PASS

# chroma-floor U5 review, pass 1 (#701)

Branch `unit/cf-U5` @ 570cc98c (fix e7c86afe, baseline e05baf9e), base `plan/chroma-floor` @ b25da145. Criteria: the U5 line of `.sdlc/plans/chroma-floor.md` revision 25; pre-land record pass 2 (main `.sdlc/verdicts/chroma-floor-prepr.md`) row H1 and findings 1 and 4. Fresh context; every claim below was re-derived from the tree at 570cc98c, not read off the handoff.

## Claims per changed line

| Line at 570cc98c | Claim | State | Evidence (my command) | Control at 38bd0dea |
|---|---|---|---|---|
| `test/engine/anchor.mjs:651` | the false `anchorChromaBasis` import credit is gone | 🟢 | `grep '^import' \| grep -c anchorChromaBasis` = `0`; `:39` imports `effHue, paletteStops, DEFAULT_CONTROLS, RAMP_L_MIN, RAMP_L_MAX, STOPS, ACHROMATIC_ANCHOR_C`; remaining hits `:505`, `:654`, `:709` are comments | credit text count `1` |
| `anchor.mjs:651` | tonal.js's comment above `chromaEnvelope` cites the fix as R2 | 🟢 | the `chromaEnvelope` header block starts `tonal.js:347`, function at `:430`; R2 at `:358`, `:376`, `:379`; `:358` and `:376` describe the lifted-reading re-centre, 2573208c's subject | same code |
| `anchor.mjs:652` | tonal.mjs's C6 gate cites R2; `KNOWN_BASELINE_DUP` belongs to it | 🟢 | `tonal.mjs:1210-1211` `// C6 ... (R2: sd measured against liftStop(anchorStop, lift)`; the Set at `:1280` is asserted under `(C6 ii)` at `:1330`, `:1358`, `:1364-1366` | same code |
| `anchor.mjs:651` (kept text) | `2573208c` is "#681 U3 review pass 2, R2" | 🟢 inherited | 2573208c answers review pass 1 and ships Design B; `.sdlc/questions/pif-u3.md:74` calls Design B "R2"; 515f0e24 is the U3 pass 2 handoff. The attribution predates U5 and agrees with pif-u4 records | `grep -c "Design B's R2" pif-u3.md` = `1`; the wrong design, `Design A's R2`, = `0` |
| `src/engine/tonal.js:318` | line join only | 🟢 | text unchanged, file stays 1359 lines, `okhslLAt` stays at `:994` | 1359, `:994` |
| `tonal.js:327` | at 450/550 the cap `min(maxc, floorRef)` equals that stop's own ceiling, exact at hueShift 0 on the cam16 path | 🟢 | `:338` cap; `:813` and `:945` floorRef = max of three ceilings, so floorRef >= c(450), c(550) when read at the rendered hue and tone; anchored tones `:812` and `:823` are the same `anchorLerp` call; hue `:847` = `resolvedHue + shift*dir`, `resolvedHue = seedHue` unless `oklchSpace` (`:838-839`); `shift` is `palette.hueShift` (`:762`, `:894`) | same code |
| `tonal.js:327-328` | both floorRef call sites name the approximate cases | 🟢 | `:809` "an approximation under edge rotation or the OKLCH per-stop hue solve"; `:943` "an approximation under edge rotation" | same code |
| `tonal.js:328` / `tonal.mjs:1526` | from 450/550 outward the floor never rises | 🟢 | my own sweep on the anchored path (not the handoff's `toneAt` sweep): pivot tone in {12,25,40,55,70,85,94} x skew {-50,0,50} x lift {-20,0,20} x even hues, tones from `anchorLerp`: `anchored steps 181440 rises 0` | same sweep with floorRef removed (the retired `chromaFloor%*maxc` floor): `rises 28228` |
| `test/engine/tonal.mjs:1526` | reads as a scoped statement, not a guarantee | 🟢 | `(no dip guarantee)` and `:1527` hands the guarantee to `dip-gate-even`; old `so the valley cannot form` count `0` | count `1` |
| `docs/reference/SKILL.md:95`, `rubrics/acceptance-criteria.md:25` | `okhsl-modes` spans `tonal.mjs:301-327` | 🟢 | `:301` section header, `:320` closes the mode loop, `:321-326` the peak-centred block that FAILs as `okhsl-modes`, `:327` its `}`, `:328` blank, `:329` the `cusp-pull` header. Both pins read `301-327`; audit `OK` for both | pins read `301-319` (2 hits) |
| `test/engine/mode-isolation-gate.mjs:21-22` | `--capture` writes the HEAD sha (`unknown` outside git) to `capturedAt` and prints it | 🟢 | `:70` `let sha = "unknown"`, `:71` `git rev-parse HEAD` in try/catch, `:74` `capturedAt: sha`, `:79` write, `:80` prints `at ${sha}` | old text claimed the sha is named "in this header and in the fixture's own owner field", count `1`; neither carries a sha |
| `mode-isolation-gate.mjs:22` | used only by hand | 🟢 | `git grep -- --capture` over package.json, .github, scripts, test, src outside the gate: `0` | the same filter over two planted caller lines prints `1` (the one outside the gate file) |
| `mode-isolation-gate.mjs:23-24` | scope matches `owner` and the fingerprint note | 🟢 | `owner` `:73` "moves perceptual or peak, or edits any curated corpus document or the default kit"; note `:10-12` "palette-content change to any curated document or the default kit" | old text named only "moves perceptual or peak" |
| `mode-isolation-gate.mjs:24-25` | #725 is the perceptual/peak plan per #701 revision 8 | 🟢 | `grep 'revision 8' \| grep -c '#725'` = `2` | the same stream for `#724` = `0` |

## Other checks

| Check | State | Evidence | Negative control |
|---|---|---|---|
| diff scope: comments, pins, baseline only | 🟢 | non-comment `+`/`-` lines in `*.js`/`*.mjs` (generated bundles excluded) 38bd0dea..570cc98c: `0`. Byte deltas: tonal.js +93, ui.html +186 (tonal.js inlined twice), describe-mcp-assets.js +93 (once): the bundles move by the comment bytes only. Plan edits are the Orchestrator's b25da145 | planted `+  const x = 1;` through the same filter prints `1` |
| baseline ui.html figure | 🟢 | fresh `git archive 570cc98c` in scratch, ran the six `npm test` generators: `wrote figma/plugin/ui.html 4130.3 KB`; `cmp` identical for ui.html and describe-mcp-assets.js; `baseline-agrees-check.sh` in the worktree: `ok ui.html: baseline 4130.3 KB, tree 4130.3 KB`, `ok tests: baseline 54`, only STALE `time test`, `stale total: 1` (C12, revision 20) | `cmp` against the committed ui.html with one planted byte exits `1`; the check in scratch with e7c86afe's baseline.md prints `STALE ui.html: baseline 4130.1 KB, tree 4130.3 KB` |
| baseline correction note `.sdlc/baseline.md:353` | 🟢 | "line count unchanged" (1359 both), "inlined with its comments" (new text found in ui.html x2), "#701 U1 precedent above" (`:351`, KB cell only) all hold | 38bd0dea's baseline reads `ui.html 4130.1 KB`; the new tonal.js text counts `0` at 38bd0dea |
| citations | 🟢 | `node scripts/audit-citations.mjs`: every doc `STALE 0`, NEAR 1+7+1+2 = 11 (matches handoff); `node test/repo/citations.mjs`: `STALE 0 across 10 discovered docs (HEAD 570cc98c)` | `citations.mjs` self-test: `staleLines() fails a NOFILE line (exit 1)`; at 38bd0dea both docs pin `301-319` (2 hits), 0 at head |
| records | 🟢 | `em-dash: clean (872 files scanned)`, `branding: clean (864 files scanned)`; the two U+2014 in the diff are unchanged context lines quoting program output in baseline rows | em-dash over the diff's added lines `0`; a planted `+a \u2014 b` line prints `1` |
| handoff claim checks bite at 38bd0dea | 🟢 | reran the discriminating legs at both refs: import-credit text 1 to 0, `valley cannot form` 1 to 0, new tonal.js text 0 to 1, `301-319` pins 2 to 0, old `--capture` text 1 to 0 | each leg is its own control: the 38bd0dea side is the failing reading |

## Findings

No blocking finding. Notes only, none needing a change in this unit:

1. Note. `tonal.js:327` says the cap is exact "at hueShift 0 on the cam16 path". On `paletteStops` (`:945`) floorRef is read at `baseHue`, which is already the solved hue under oklch, so hueShift 0 alone makes it exact there. The wording gives a sufficient condition and calls it narrower than it is. Not false; `:943` states the exact case for that path.
2. Note. `tonal.mjs:1526` "the floor does not rise" is true of the capped term `chromaFloor% * min(maxc, floorRef)` (swept above). `evenChroma` also caps the floor at `intended`, and `intended` varies under relChroma or the anchored basis blend. `tonal.js:330-332` states that caveat, and 1526 names no dip guarantee, so the gate carries the guarantee as the plan intends.
3. Note. `npm test` at 570cc98c was not run here, per dispatch. The handoff's green run is at e7c86afe. e05baf9e and 570cc98c touch only `.sdlc/`. The Verifier owns the head run.
