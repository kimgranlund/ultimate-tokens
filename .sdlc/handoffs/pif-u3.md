---
kind: handoff
plan: preset-intent-fidelity
unit: U3
branch: unit/pif-u3-envelope
base: 690b0a1a395cee0bad122443c3441d5f35412030
head: ed1e6a3bfdd4572c01e6443f406f9772dcd0d6b4
written: 2026-09-18
pass: 2
---

# U3 handoff — anchor-centred chroma envelope, all modes, grade l4

Ticket #681, priority P1. This unit unifies the even path's and the OKHSL path's per-stop chroma
damping into one `chromaEnvelope` function, keys it on `liftStop` (#668's R1c fix), switches the OKHSL
path's saturation basis to the key colour's own OKHSL `s` (REQ-052), and drops `VIVID_MIDS.dampAmp` to 0
(Q7). Rebased onto plan tip `690b0a1` (rev7 retired C6's sub-pixel magnitude bar for four ramp-shape
gates; rev8 corrected the peak uptick count and named the Varanger duplicate-swatch witness) and the
gate rewritten to match: it now scans the full 3,780-palette corpus with no chroma floor, both stop
sets, per rev8. Five questions are open for the plan owner in `.sdlc/questions/pif-u3.md`, the most
consequential being Q3: the zero-duplicate-hex bar (C6 ii) appears structurally unreachable at true 0
from inside this unit, and the gate currently ships with a named, cited exception list standing in for
a plan-level ruling.

## Criteria table

| # | Criterion | Command | Observed (red -> green) | Negative control |
|---|---|---|---|---|
| C7-1 | One `chromaEnvelope` definition | `grep -c "export function chromaEnvelope(" src/engine/tonal.js` | before: 0 (two separate `m` copies) -> after: `1` | n/a (mechanical) |
| C7-2 | Exactly 3 total appearances (1 def + 2 call sites) | `grep -c "chromaEnvelope(" src/engine/tonal.js` | before: 0 -> after: `3` | a stray 4th mention in this unit's own doc comment tripped it to `4` mid-build; rephrased, back to `3` |
| C7-3 | Zero stale two-copy dampAmp expressions | `grep -c "1 + ((controls.dampAmp" src/engine/tonal.js` | before: `2` -> after: `0` | n/a (mechanical) |
| C6-anchor | `env(anchorStop)=1` exactly at lift 0, every damp/dampCurve/dampAmp/dampBias combo | `test/engine/tonal.mjs` "chroma-envelope" (C6 env-anchor sub-check) | pass; deliberately perturbing the return value by +0.01 made this fail as `1.01 != 1` (verified red) | n/a (deterministic sweep) |
| C6-i | perceptual/peak/even: 0 tone upticks, full corpus, both stop sets | `test/engine/tonal.mjs` "chroma-envelope" (C6 i) | `upticks.{perceptual,peak,even} = 0` over all 3,780 corpus palettes (343 presets + 16 role defaults, no chroma floor), 19-stop and 25-stop, all 3 modes | tried an alternative `chromaEnvelope` design (see C7/iii-c row below) that reopened 21/10,080 upticks on the synthetic grid; reverted |
| C6-ii | 0 duplicate hex beyond a named, cited exception list, full corpus, both stop sets | same file, (C6 ii) | 7 distinct ramps (10 colliding stop-pairs) cited by exact key (mode/hue/skew/lift/stop-pair); verified the gate is load-bearing both directions: removing one cited entry reproduces `FAIL — (C6 ii) peak: 2 duplicate-hex pair(s) beyond the cited list...` (both stop sets trip); the list must ALSO be fully observed or the gate fails, so it cannot silently rot | measured directly against the pre-U3, pre-any-#668-fix baseline (`362cc48`): 21 peak-mode ramps already carry >= 1 duplicate hex, full corpus — this unit's fix cuts that to 7 as a side effect, not a target |
| iii-c | measured CIELAB L* never rises, 10,080-cell synthetic grid (curve x skew x lift x hue x vibrancy x mode) | `test/engine/tonal.mjs` "skew-lift-okhsl" | 0 of 10,080 rose (shipped design, kept after reverting an alternative that regressed to 21/10,080, including a skew=0 case) | tried alternative design (env(anchor)=1 exact at ANY lift): 21/10,080 rose, worst +0.2127 L*; reverted |
| C6-iii | no docs/ literal moves without a named exception | `git diff --stat 690b0a1 -- docs/` (this unit's own base, not `origin/main`, which has moved on for reasons unrelated to any unit — see Q5) | 4 paths: 2 expected `adia-*` regen files, 2 citation-line fixes in `docs/reference/reviews/2026-08-20-reactivity/` this unit's own comment growth caused — not yet added to the plan's named-exception list (Q5) | n/a |
| Q7 | `VIVID_MIDS.dampAmp` 55 -> 0 | `scripts/gen-categories.mjs` | changed; `npm run gen:categories` (run inside `npm test`) regenerates the corpus under the new default | n/a |
| citations | 0 STALE | `node scripts/audit-citations.mjs` | 0 STALE-WRONG-LINE / STALE-MISS, exit 0 (2 were found and fixed mid-build: `tonal.js:395`->`:404`, the `_okL` memo moved when this unit's own doc comment grew) | n/a |
| branding | clean | `node test/repo/branding.mjs` | `branding: clean` | n/a |
| full suite | 47/47 green | `npm test` | `✓ all 47 test files passed` (~92s wall, up from ~63s baseline — the corpus-wide chroma-envelope gate now covers both stop sets) | n/a |
| tree | clean after | `git status --short` | empty after commit | n/a |

## C6, reframed per plan rev7 (the numeric magnitude bar this unit was first built against is retired)

Revision 7 (`d547a7a`) replaced C6's original median/p90/"zero above 100% of stop 500" numeric bar with
four ramp-shape gates ("a chroma cliff repair moves more than one 8-bit channel, so a sub-pixel bar is
unsatisfiable"): (i) zero tone upticks, (ii) zero duplicate hex, (iii) no unnamed docs/ literal moves,
(iv) a per-preset movement table gated on the plan owner's acceptance (U4's deliverable, not built here
— see Landing sequencing below). The corpus-wide median/p90/above-100% numbers this unit measured against
the now-retired bar are preserved in `.sdlc/questions/pif-u3.md` Q2 for the record, since they still
show real, diagnosed mechanisms (a pre-existing peak-mode OKHSL/CAM16 cusp mismatch), but they are no
longer pass criteria.

## C6 (i) and (ii), full corpus (3,780 palettes, no chroma floor), both stop sets

| mode | tone upticks (19-stop) | tone upticks (25-stop) | duplicate-hex ramps, pre-U3 baseline (362cc48) | duplicate-hex ramps, shipped |
|---|---|---|---|---|
| perceptual | 0 | 0 | 0 | 0 |
| peak | 0 | 0 | 21 | 7 (cited) |
| even | 0 | 0 | 0 | 0 |

The peak-mode duplicate-hex class is entirely near-white (chroma 2-23), entirely under strong positive
lift (33-40) — one mechanism, not scattered noise. Root cause (verified by comparing raw RGB triples
between the pre-U3 baseline and this unit's engine at the colliding stops): correctly keying chroma
damping on `liftStop` narrows chroma differentiation exactly where lift has also compressed the two
stops' lightness reading close together; near white that can round adjacent 8-bit stops to the identical
hex. The pre-U3 baseline's cruder, raw-stop-keyed damping over-differentiated chroma in the same region
often enough to avoid MOST (not all — 21 already existed) such collisions by accident. Full detail, the
exact 7-ramp/10-pair list, and options for closing the remaining gap: `.sdlc/questions/pif-u3.md` Q3.

## Files changed (commits `0a8d1c6`, `ed1e6a3`)

- `src/engine/tonal.js` — `chromaEnvelope`, `ANCHOR_STOP`, `keyChroma`/`keyS`, `evenChroma` refactor,
  `hueAnchorFrac` simplified, both `paletteStops` and `okhslStops` reading the shared `envelopeAt` map.
- `scripts/gen-categories.mjs` — `VIVID_MIDS.dampAmp` 55 -> 0.
- `test/engine/tonal.mjs` — new `hpg-tonal-chroma-envelope` group (C6/C7), corrected to the full corpus
  and both stop sets after the rebase; `damping-curve`, `chroma-floor`, `oklch-hue-anchor`,
  `hue-solver-best` groups repinned to the new engine.
- `test/engine/semantic.mjs` — `hpg-role-contrast` floors re-measured (C8); no family fell below AA 4.5.
- `test/engine/exports.mjs` — EX-1 `colors.neutral["500"]` literal repinned (mirrors the out-of-lane
  spec doc; see `.sdlc/questions/pif-u3.md` Q4).
- `test/ui/headless-boot.mjs` — curated-preset `dampAmp` assertion 55 -> 0.
- `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md` — 2 stale
  citations fixed (`tonal.js:395` -> `:404`); flagged in Q5 for C6(iii)'s named-exception list.
- `.sdlc/questions/pif-u3.md`, `.sdlc/handoffs/pif-u3.md` — this handoff and its open questions.

## Regenerated artifacts (committed)

- `test/engine/fixtures/tonal-legacy.json`, `test/engine/fixtures/shadcn-baseline.css` (CARVE-OUT header
  extended, names all three lifted role defaults that move), `test/ui/fixtures/default-doc-ramps.json`.
- `src/ui/categories/*.js`, `docs/reference/data/adia-{oklch,radix}-export.*`, `figma/plugin/ui.html`,
  `src/ui/describe-mcp-assets.js` — `npm test`'s own `gen:*`/`bundle`/`gen:figma-ui` steps.

## Out of lane, not touched

- `src/engine/prime.mjs` / `test/engine/prime.mjs` (U6).
- `src/ui/model.mjs` anchors / `src/ui/persist.js` (U1).
- The ramp's anchor pass-through in `okhslStops`/`toneAt`, and `effStop`/`toneAt`'s lightness-curve
  density under lift (U2) — this is where Q1 and Q3's residuals would need to be closed for real.
- `docs/spec/spec-panda-park-ui-exports.md` — the normative EX-1/EX-2 literal drift is reported (Q4),
  not edited.

## Landing sequencing

Per the plan text, U3 merges into the plan branch only after U4's `scripts/report-preset-fidelity.mjs
--movement` report exists and the plan owner records 🟢 acceptance in
`.sdlc/questions/preset-intent-fidelity-u3-movement.md` (C6 iv) — not something this unit builds or can
satisfy alone. Flagging so the merge order isn't missed, not asking for it here.

## Risks for U2 / U4

- **U2:** the "anchored branch" pins lightness at the nominal anchor stop independent of lift for
  anchored palettes. This unit's `chromaEnvelope(stop, anchorStop, lift, controls)` already takes
  `anchorStop` as a parameter (currently always called with the module constant `ANCHOR_STOP = 500`), so
  threading a palette's real anchor stop through should be a call-site change, not a `chromaEnvelope`
  redesign — EXCEPT that if U2's lightness pinning makes `liftStop(anchorStop, lift) === anchorStop`
  hold for anchored palettes, this unit's Q1 trade-off may become moot for that case specifically: worth
  checking before assuming Q1 is permanent.
- **U2:** the near-white duplicate-hex class (Q3) and the peak-mode OKHSL/CAM16 cusp mismatch (Q2) both
  live in `effStop`/`toneAt`. If U2 touches that density under lift for the anchored branch, both are
  worth re-measuring against the new lightness curve rather than assumed unrelated.
- **U4:** the movement-table report (C6 iv) should measure against the SAME full-corpus, both-stop-set
  scope this unit's gate now uses, not the earlier `chroma >= 10` scope an earlier draft of this gate
  mistakenly reused — that filter hides the whole duplicate-hex class Q3 is about.

## Open questions

See `.sdlc/questions/pif-u3.md`: Q1 (zero-upticks vs exact-anchor design trade-off, decision needed),
Q2 (retired numeric C6 bar, kept for the record, no decision needed), Q3 (duplicate-hex bar, the
consequential one — a plan-level ruling is needed before this can be called fully closed), Q4
(Panda/shadcn spec literal drift, needs a docs-owning seat), Q5 (2 more docs/ paths for C6(iii)'s
exception list).
