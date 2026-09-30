# Handoff chroma-envelope U2 pass 3 · builder → orchestrator

| Field | Value |
|---|---|
| Branch | unit/ce-U2: pass 3 is the commit carrying this handoff, on 0627f874 (pass 2, verdict 🔴). Base merge 351eee68 = plan/chroma-envelope b149f8dd (revision 5) |
| Scope | R75 (`.sdlc/questions/chroma-envelope-U2-pass3.md`, Q1 A): records only. No engine, gate-logic or allow-list change |
| Status | 🟢 all four verdict items fixed. `npm test` reds on exactly the three declared C2.8 rows, tree clean after |
| Files | `test/engine/tonal.mjs` (comment only), `test/ui/shell.mjs` (the ac003b witness control), `.sdlc/baseline.md` (ui.html row and a correction paragraph), this handoff |
| Untouched | every `src/` and `scripts/` file; `test/engine/chroma-envelope-gate.mjs`; RAMP_GAP_ALLOW, RAMP_DISTINCT_ALLOW, NOTCH_ALLOW, KNOWN_BASELINE_DUP; FLOORS and FLOORS_BF2AAF6; the plan file; `.sdlc/board.md` |
| Carries | every pass 2 C2 row the verdict graded 🟢 (C2.1, C2.2, C2.4 to C2.8): no file they read changed, see Scope proof |

## Fixes

| Id | Fix | Evidence at head | Control | State |
|---|---|---|---|---|
| F1 C2.3 | `test/engine/tonal.mjs:1850` to `:1852` (was `:1850` to `:1851`) now reads: 72 near-grey anchors excluded (15 of them the violators the exclusion removes, 15/3764 with it off), 3692 measured at 0 violators, max ratio at most 1. `git diff b149f8dd` over the unit's own files shows no other `3,749` or "15 excluded" text; the only other copies are in the planner's re-diagnosis record and the review, dated records left as written | gate prints `C6 (v) white-pixel exclusion (stop 500 CAM16 C < 2.869): 72 palette(s)` and `anchored peak overshoot: 0/3692 violator(s)` (verdict C2.3 row, unchanged code) | verdict's `WHITE_PIXEL_C = 0` run: `0 palette(s)`, `15/3764`, the figures the comment now names | 🟢 |
| F2 baseline | `.sdlc/baseline.md` `npm run build` row: `4141.3 KB` to `4148.2 KB`, plus a dated correction paragraph naming the cause (U2's `src/engine/tonal.js` rewrite and the regenerated `src/ui/describe-mcp-assets.js`, both inlined) | throwaway `git clone -q --no-hardlinks` at `0627f874`: `npm ci` exit 0, `npm run build` exit 0 `wrote figma/plugin/ui.html 4148.2 KB`, porcelain `0`; with this baseline copied in, `sh .sdlc/checks/baseline-agrees-check.sh` exit 0, `ok    ui.html: baseline 4148.2 KB, tree 4148.2 KB`, `stale total: 0` | same clone before the edit: `STALE ui.html: baseline 4141.3 KB, tree 4148.2 KB`, `stale total: 1` | 🟢 |
| F3 FLOORS | the 31 undeclared cell moves are listed per cell in FLOORS moves below, before and after. None crosses its FLOORS pin or its PENDING_U4 pin | `node floors.mjs` (scratch probe: `brandKit(defaultDocument(), { color: true })` per mode, the same `contrastRatio` pairing `semantic.mjs` reads) at `b149f8dd` and at head: `moved at 4dp: 32, differ at all: 32, pins parsed: 96`; `semantic.mjs` exit 0 in `npm test` | verdict C2.7: the declared cell's pin left at 8.2 reds `peak Tertiary LIGHT ... 8.18:1, below its pinned floor 8.2:1` | 🟢 |
| F4 shell | `test/ui/shell.mjs:286` compared `directAt(wn, wn.chroma)` with itself. Replaced by a live control: a second `defaultDocument()` with Neutral's group `baseChroma` set to Neutral's own chroma (29); its `projectView` row must have `rampChroma` 29, must be flagged by `readsChroma`, and must differ from the witness row at baseChroma 10 | `node test/ui/shell.mjs` exit 0, `pass  ac003b`; all-FAIL logging copy at head prints no `witness` line | scratch clone with `src/ui/model.mjs:949` set to `const rampChroma = p.chroma;`, all-FAIL logging copy prints `witness control: Neutral's rows at group baseChroma 10 and 29 are identical, group chroma does not reach the ramp`. The pass 2 line on the same scratch engine prints no `witness control` line (it could not fail) | 🟢 |

## FLOORS moves (F3)

Every cell whose contrast differs between `b149f8dd` and head, 32 in all. Pin is the live FLOORS value; PENDING_U4 is the frozen erosion floor where the cell has one. Measured to 4 dp; every cell that differs at all also differs at 4 dp.

| Mode | Family | Side | Before | After | Delta | Pin | Crosses |
|---|---|---|---|---|---|---|---|
| perceptual | Primary | dark | 4.9819 | 4.9787 | -0.0033 | 4.9 | no |
| perceptual | Secondary | dark | 5.2226 | 5.2155 | -0.0071 | 5.2, PENDING_U4 5.2 | no |
| perceptual | Tertiary | dark | 5.6385 | 5.6234 | -0.0150 | 5.6 | no |
| perceptual | Warning | dark | 5.6426 | 5.6697 | +0.0271 | 5.6 | no |
| perceptual | Danger | light | 8.2100 | 8.2388 | +0.0288 | 8.2 | no |
| perceptual | Data 1 | light | 6.0003 | 6.0201 | +0.0198 | 6.0 | no |
| perceptual | Data 2 | light | 6.3308 | 6.3203 | -0.0105 | 6.3 | no |
| perceptual | Data 2 | dark | 4.7470 | 4.7586 | +0.0116 | 4.7, PENDING_U4 4.7 | no |
| perceptual | Data 3 | dark | 4.9207 | 4.9376 | +0.0170 | 4.9, PENDING_U4 4.9 | no |
| perceptual | Data 4 | dark | 4.7966 | 4.7971 | +0.0004 | 4.7, PENDING_U4 4.7 | no |
| perceptual | Data 6 | dark | 5.2801 | 5.2838 | +0.0037 | 5.2, PENDING_U4 5.2 | no |
| perceptual | Data 7 | light | 5.2851 | 5.2831 | -0.0020 | 5.2 | no |
| perceptual | Data 7 | dark | 5.1548 | 5.1565 | +0.0017 | 5.1, PENDING_U4 5.1 | no |
| peak | Neutral | dark | 4.6630 | 4.6641 | +0.0011 | 4.6 | no |
| peak | Primary | light | 7.4400 | 7.4566 | +0.0165 | 7.4 | no |
| peak | Primary | dark | 4.7696 | 4.7798 | +0.0102 | 4.7 | no |
| peak | Secondary | dark | 5.6019 | 5.6082 | +0.0062 | 5.6, PENDING_U4 5.6 | no |
| peak | Tertiary | light | 8.2001 | 8.1825 | -0.0176 | 8.1 (was 8.2) | declared in pass 2, re-pinned |
| peak | Tertiary | dark | 5.3935 | 5.3795 | -0.0140 | 5.3, PENDING_U4 5.3 | no |
| peak | Info | dark | 4.5732 | 4.5726 | -0.0006 | 4.5, PENDING_U4 4.5 | no |
| peak | Success | dark | 4.8790 | 4.8796 | +0.0005 | 4.8, PENDING_U4 4.8 | no |
| peak | Warning | dark | 5.2824 | 5.2841 | +0.0017 | 5.2, PENDING_U4 5.2 | no |
| peak | Danger | light | 8.6322 | 8.6300 | -0.0022 | 8.6 | no |
| peak | Danger | dark | 5.6846 | 5.6824 | -0.0022 | 5.6 | no |
| peak | Data 1 | light | 6.3441 | 6.3659 | +0.0218 | 6.3, PENDING_U4 6.3 | no |
| peak | Data 2 | dark | 4.5509 | 4.5605 | +0.0096 | 4.5, PENDING_U4 4.5 | no |
| peak | Data 4 | dark | 5.0946 | 5.0917 | -0.0029 | 5.0, PENDING_U4 5.0 | no |
| peak | Data 5 | light | 5.6948 | 5.6941 | -0.0007 | 5.6, PENDING_U4 5.6 | no |
| peak | Data 5 | dark | 5.3318 | 5.3320 | +0.0003 | 5.3, PENDING_U4 5.3 | no |
| peak | Data 6 | dark | 5.5999 | 5.6007 | +0.0008 | 5.5, PENDING_U4 5.5 | no (up across the 5.6 line) |
| peak | Data 7 | dark | 5.4752 | 5.4753 | +0.0001 | 5.4, PENDING_U4 5.4 | no |
| peak | Data 8 | dark | 5.3224 | 5.3246 | +0.0021 | 5.3, PENDING_U4 5.3 | no |

Even mode: 0 cells moved (the unit changes only the anchored perceptual and peak paths). Largest drop among the 31: perceptual Tertiary dark, -0.0150, 0.0234 above its pin.

## Gates

| Gate | Evidence | Control | State |
|---|---|---|---|
| C2.8 `npm test` | exit 1, `✗ 2/54 test file(s) failed`, FAIL lines exactly `(C6 ii) perceptual: 3 duplicate-hex pair(s)`, `anchor-ramp gap (19-stop) allow-list: 13`, `anchor-ramp distinct (25-stop) allow-list: 6`; `git status --porcelain` after shows only this pass's edits (93.9 s wall, load 6.7) | verdict C2.8: a planted U+2014 reds `FAIL: 1 em dashes` | 🟢 |
| em-dash, branding, citations | `em-dash: clean (1004 files scanned)` exit 0; `branding: clean (996 files scanned)` exit 0; `citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins` exit 0; `verdict.py check` on this handoff exit 0 | verdict C2.8 planted em dash | 🟢 |
| Scope proof | `git diff 0627f874 -- src/ test/engine/chroma-envelope-gate.mjs scripts/` prints nothing; `git diff 0627f874 -- test/engine/tonal.mjs` is the three comment lines | the verdict's Scope row: anchor-stripped identity-control `0` cells | 🟢 |

## Left out

- The FLOORS table's own `// measured x / y` comments (2 dp) are not refreshed for the 31 cells; R75 limits this pass to the named records, and this table is the per-cell declaration.
- Verdict findings 3 (plan text) and 4 (`anchor.mjs --full` timing against C3.7) belong to revision 6 and U3, not this pass.
- Pass 2's C2 row evidence is in git at `0627f874:.sdlc/handoffs/chroma-envelope-U2.md`.
