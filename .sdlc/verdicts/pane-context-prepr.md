---
kind: verdict
plan: pane-context
unit: prepr
seat: verifier
pass: 3
ticket: "#785"
written: 2026-10-04
---

# pane-context prepr · pass 3 · 🔴 at `94bcd8aa`

verdict: 🔴
sha: 94bcd8aa04067b17cf561cbddf9cc0b2b2aa5347
version: n/a (a plan landing, no release)

Pre-land record pass 3 for `plan/pane-context` (draft PR #797) at `94bcd8aa`, merge-base `a308d8b5`, plan revision 15, against C1.* to C6.* and the request `.sdlc/handoffs/pane-context-prepr-request.md` (main `7d4e95a7`). Pass 2 (🔴 at `1cfefe26`) is overwritten here; its history is in git. Pair: `pane-context-prepr-reviewer-l3-p3` (reviewer-l3, opus, `FAIL`) and `pane-context-prepr-verifier-l2-p3` (verifier-l2, opus) in place of the adapter's reviewer-l4 plus verifier-l3, under R86/R92 (no Fable seats while it is capped). U4 (l6) and U5 (l5) were opus builds, so for them the pair shares the builder's family and independence across families is not claimed; U6 (l3, l4) was sonnet, so its checkers are independent. Preflight: `verdict.py check` exits 0 on the request. Written early at the Conductor's ask so the fix round can start: the gate and sweeps rows below are read from the verifier-l2 worker's logs at this sha, plus the seat's own clone runs; the worker's own rows file was not finished, and the verdict does not depend on it. Load was 4 to 5 throughout, so no row is a timing row.

One 🔴 blocks: a live code comment this diff made false. `src/engine/tonal.js:109-110` says `palette.chroma` is "the resolved value paletteStops was called with, the absolute group target on the group-resolution callers". That was true at `a308d8b5`. At the head, `paletteStops` re-enters at `:946` with `{ ...palette, chroma: 100 }` whenever the chroma is not 100, so every call below that line sees 100 and never the group value. U6's sweep covered the stop-500 and byte-identity classes, not this "group target" class. The fix is comment-only and moves no pixel. Every pass 2 🔴 is closed, and every gate, check and sweeps leg read is green with a control that went red.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| Live records true at head (stale-record class) | 🔴 | `git show 94bcd8aa:src/engine/tonal.js` `:109-110` still reads "the absolute group target on the group-resolution callers", while `:946` is `if (palette.chroma !== 100) return dampStops(paletteStops({ ...palette, chroma: 100 }, ...` | same lines at base: `git show a308d8b5:src/engine/tonal.js \| grep -c 'chroma: 100 }'` is `0`, so the comment was true at base and this diff made it false; reviewer-l3 found it independently |
| `npm test` | 🟢 | clean clone at `94bcd8aa`: `✓ all 54 test files passed`, porcelain `0` (`nt_head.log`) | planted mutation: `✗ 1/54 test file(s) failed` (`nt_ctl.log`) |
| `npm ci && npm run build` | 🟢 | `wrote figma/plugin/ui.html 4170.9 KB` (`hb_build.log`), matching the request | planted mutation: `Build failed with 1 error` (`ctl_build.log`) |
| `npm run smoke` | 🟢 | `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser` (`hb_smoke.log`) | planted mutation: `SMOKE FAIL (2):` (`ctl_smoke.log`) |
| panda-smoke | 🟢 | `smoke-panda: PASS, 7/7 assertions held` (`hb_panda.log`) | planted removal: `smoke-panda: FAIL, missing: --colors-primary-on-surface` (`ctl_panda.log`) |
| `.sdlc/checks/*.sh` (adapter §5 item 1) | 🟢 | seat clone at head, all rc 0: `baseline-agrees stale total: 0`, `card-amendment stale total: 0`, `card-source-range range mismatches: 0`, `doc-drift-rows ... undetermined 0 bad 0`, `verdict-frontmatter verdicts 277 ... bad 0` | `:730-837` to `:731-837` in the ADR-026 card: `range mismatches: 1`; worker's baseline control: `stale total: 1` (`ctl_ba.log`); restored, porcelain `0` |
| ceiling-counts and em-dash | 🟢 | `ceiling-counts: clean`; `em-dash: clean (1155 files scanned)` | appended a U+2014 line to README: `FAIL: 1 em dashes outside inline code spans in 1 files`; ceiling-counts control as pass 2 (`a 21-reading series` gives `1 failure(s)`), restored |
| CI sweeps legs | 🟢 | `sw_even-dips.log` `PASS`; `sw_mode-isolation.log` `pass ... match fixture`; `sw_chroma-envelope.log` `pass`; `sw_corpus-contrast.log` `PASS`; `sw_corpus-reset.log` `HEADLESS BOOT PASS`; `sw_sweep-prime.log` `PASS`; `sw_corpus-anchor.log` `PASS (FULL)`; `sw_corpus-tonal.log` `PASS` | planted per leg: even-dips `FAIL`, mode-isolation `do not match fixture`, contrast `FAIL: 73 gate failure(s)`, reset `✗ (j6-seg)`, prime `FAIL: 2`, anchor `FAIL: 3`, tonal `FAIL: 5` (`swc_*.log`) |
| Headless-shim contract assertions (C1 to C6 UI rows) | 🟢 | `shim_head.log` `HEADLESS BOOT PASS, all Phase-3 interaction assertions hold` | 12 planted mutations each went red, for example `sc_M1_deselect` `✗ (j6-seg)`, `sc_M4a_material30` `✗ (gid2)`, `sc_M6_one_false` `✗ (i-one) ... (got 810 rows)`, `sc_M11_prefs` `✗ (pref)` |
| Pass 2 A1 (ADR-026 card, index lineage) closed | 🟢 | reviewer-l3 own read at head: card Decision carries the group-100 qualifier, amended-by row and `index.md:41` name all five amendments; `card-amendment stale total: 0` | `card-source-range` control above bites on the same card |
| Pass 2 A2 (SPEC EX-1, banner) closed | 🟢 | reviewer-l3: banner names EX-1, REQ-003, AC-003(a), AC-006; `paletteStops({hue:267,chroma:95,skew:-20})` base vs head moves perceptual `20/25`, peak `22/25`, even `13/25`, and `0/25` at chroma 100, matching the amended text | the chroma-100 run is the control: the same probe reads `0/25`, so the counter separates moved from unmoved |
| C4.16 pin provenance | 🟢 | reviewer-l3, `8428280e` tonal.js as REAL, (b2) at chroma 100: `8 dips in 5 palettes` | drawn-chroma control: `7 dips in 4 palettes` |
| C2.7 group-chroma defaults movement | 🟢 | reviewer-l3 `--group-chroma --defaults --base-dir <a308d8b5>`: perceptual and peak `0/19` all 16; even Neutral only `3/19`, max dC 2.65 (R97 accepted) | the even Neutral move is the live reading: the same tool reports it, so a zero is not a dead tool |
| C2.6 chroma envelope | 🟢 | `c26_self.log` `0 cells rose` and `c26_cmp.log` `0 cells rose` against base fixture | amplified fixture: `c26_cmpamp.log` `1 cells rose (... even 300 p90)` |
| C5.3 tonal gate | 🟢 | `c53_head.log` `PASS: tonal-generation clears all [gate] predicates` | `c53_bite.log` and `c53_guard.log` `FAIL: 1 gate failure(s)` |
| R98 | 🟢 | reviewer-l3: "no override, shim, fallback or legacy layer, and no unreachable group branch"; `persist.js` changes only `GROUP_DEFAULTS.material` besides comments | M4b (damper removed) goes red `✗ (gid-owner4)`, so the damper path is live, not dead |
| Contract invariants | 🟢 | reviewer-l3: `html:` count `12` (6, 3, 3); `CURRENT_SCHEMA_VERSION = 7`; `semantic.js`, `role-table.json`, `code.js` untouched; no new font-family or SVG path | `sc_M6_one_false` and `sc_M5_one_true` show the 53-role table assertion bites |

## Findings

- 🔴 `src/engine/tonal.js:109-110` stale comment, as the first row. Comment-only fix; a pass 4 should sweep the whole "group target" class, not only this line.
- 🟡 Vestigial `palette.chroma / 100` reads inside `paletteStops`, now always 1 (`tonal.js:855`, `:889`, `:981`, `:993`, `:1018`, `:1417`, and `hueAnchorFrac`'s input at `:830`, `:972`, `:1390`). C5.1 rules `:855` and `:889` out of scope; the rest are unruled. A follow-up, no pixel change.
- 🟡 `docs/lld/lld-muted-base-key-spikes.md:62` interface snippet still shows `baseChroma: 30`; the `:14` banner's general "100/60, not 30/60" covers it, but the line is not named.
- 🟡 `docs/reference/reviews/2026-08-20-reactivity/01-core-reactivity.md:27` mixes historical `colorMode==="both"` text with re-homed live line numbers.
- 🟡 `decision-records.md:828` edits the #766 amendment sentence in place (append-only drift, as the request reports). The integrate question still has no owner answer. The headless-boot `fails` dump stays a follow-up issue.
- User-visible changes, all stated in the CHANGELOG: kits saved below group 100 load muted (no migration); a stored canvas pref is ignored; Breakpoint Compare renders 2 x (1 + modes) columns; mapping and token tables carry no scheme; Adia and other sub-100 presets moved.
