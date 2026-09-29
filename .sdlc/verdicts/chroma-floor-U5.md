---
kind: verdict
plan: chroma-floor
unit: U5
ticket: "#701"
branch: unit/cf-U5
base: 38bd0dea
grade: verifier-l2 standing in for verifier-l3 (opus l5 build, same family, ruling b9044bb), run by the Verifier seat itself at grade L2
pass: 1
written: 2026-09-29
---

# Verdict chroma-floor U5 · 🟢 · the false import credit and the four review Lows are repaired, every changed comment true against the code

verdict: 🟢
sha: 0ad2e2940a77f480bcb3404be5dc80d11891f05c

Head `0ad2e294` (the review commit); fix `e7c86afe`, baseline `e05baf9e`, handoff `570cc98c`. Criteria: the U5 line and revision 25 of `.sdlc/plans/chroma-floor.md` at `b25da145`, from `.sdlc/verdicts/chroma-floor-prepr.md` pass 2 (H1, finding 4). Base for controls `38bd0dea`. Evidence run by the seat in a `--shared` clone of `0ad2e294` with no node_modules. `verdict.py check` exits `0` on the handoff, the review, and `.sdlc/baseline.md` against its `38bd0dea` copy.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| H1 anchor.mjs:651 | 🟢 | `grep -c "this file's \`anchorChromaBasis\` import"` reads `0` at `0ad2e294`; the new text credits `tonal.js's comment above \`chromaEnvelope\`` (`// R2 (shipped) re-centres sd on the anchor's own lifted reading` at `tonal.js:376`, function at `:430`) and `tonal.mjs's C6 gate` (`// C6 ... (R2: sd measured against \`liftStop(anchorStop, lift)\`` at `tonal.mjs:1210-1211`), and `KNOWN_BASELINE_DUP` sits in `(C6 ii)` at `tonal.mjs:1366` | the same grep at `38bd0dea` reads `1`, and that file's import lines `:36-44` carry no `anchorChromaBasis` |
| tonal.js:327 cap condition | 🟢 | `equals that stop's own ceiling (exact at hueShift 0 on the cam16 path; both floorRef call sites name the approximate cases)`; the call sites do: `tonal.js:808-810` `exact in hue at hueShift 0 on the cam16 path, an approximation under edge rotation or the OKLCH per-stop hue solve`, `:942-943` `exact for the rendered stops at hueShift 0, an approximation under edge rotation`; `floorRef` is the max of three ceilings at `:813` and `:945`; file still `1359` lines, `994:export function okhslLAt` | the unconditional form `equals that stop's own ceiling, so from` greps `1` at `38bd0dea`, `0` here |
| tonal.mjs:1526 | 🟢 | `so at hueShift 0 on cam16 the floor does not rise from 450/550 outward (no dip guarantee)`, followed by the even branch that reds on any dip at a stop other than 500 | `so the valley cannot form` greps `1` at `38bd0dea`, `0` here |
| okhsl-modes pin | 🟢 | `SKILL.md:95` and `acceptance-criteria.md:25` read `tonal.mjs:301-327`; `:301` is `// ── hpg-tonal-okhsl-modes`, `:327` is the `}` closing the peak-centering block whose `FAIL("okhsl-modes", \`peak: chroma not centered at 500` sits inside it | at `38bd0dea` the pins read `301-319` (`2` hits) and `:319` closes only the loop, before the peak block at `:322-327` |
| mode-isolation-gate.mjs:21-25 | 🟢 | the header now says `--capture` writes `capturedAt` with the HEAD sha, `unknown` outside git, and prints it: `:70` `let sha = "unknown"`, `:71` `git rev-parse HEAD`, `:74` `capturedAt: sha`, `:80` `captured perceptual ... at ${sha}`; scope names curated corpus documents and the default kit, matching the fixture `owner` (`edits any curated corpus document or the default kit`) | `plan next moves perceptual or peak` greps `1` at `38bd0dea`, `0` here; the corpus clause greps `0` there, `1` here |
| npm test, citations, baseline | 🟢 | `✓ all 54 test files passed`, `exit 0`, tree `0` after; `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 0ad2e294)`; baseline check `ok    ui.html: baseline 4130.3 KB, tree 4130.3 KB`, only STALE `time test`, `stale total: 1` (revision 20's reading) | scrim sed on `role-table.json`: `✗ 1/54 test file(s) failed`, `neg exit 1`; restored, tree `0` |
| Scope and hygiene | 🟢 | non-`.sdlc/` diff `38bd0dea..0ad2e294` is 8 files: the six named sources plus the regenerated `ui.html` and `describe-mcp-assets.js`, `14 insertions(+), 12 deletions(-)`; added lines with a U+2014 outside code spans `0`; all five commits carry `Co-Authored-By: Claude Opus 5.5` | a line outside the named files would show in the `--stat` list |

### Findings

1. Note. The citations gate stays green with the pin moved to `302-327` (`STALE 0`, `exit 0`), so it does not guard a range's start line; the pin rows above rest on the direct read, not the gate. Not a U5 defect.
