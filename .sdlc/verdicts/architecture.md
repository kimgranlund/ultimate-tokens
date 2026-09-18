# Verdict A2 architecture · pass 4 · 🟢

Graded by sdlc-verifier on 2026-09-16 against `.sdlc/architecture.md` (152 lines) at `sdlc/adopt` @ f9e20c5. Every control rerun in a throwaway git worktree of HEAD (since removed), plants reset between runs. Pass 1 gaps listed at the bottom with their disposition.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | Each convention has a negative control run and exceptions listed | 🟡 | 18/18 K rows now carry HEAD result + recorded bite. Extracted and ran the §6.1 scripts verbatim: K9 0, K13 0, K14 3 (`lc-applied`, `lc-ceiling`, `lc-toneline`, as listed), K18 0. Reran the changed filters: K1 0, K6 0, K12 inventory 4, K17 0. Gap: K9's exceptions say `figma/plugin/ui.html` "is still covered by `gen:figma-ui` in `npm test`", but the K9 control itself leaves it out. The script's file list omits ui.html (and the adia artifacts), so a hand edit there passes K9. It should be listed as an exception to the control, or the script should cover it | my own plants, each caught: K1 `document.body` in tonal.js 1 (a comment line mentioning `document.body` added 0); K6 `fetch(` 1; K9 `// hand edited` in mcp-assets.js 1 `CHANGED BY REGEN`; K13 `font-family:${family}` 1; K14 `ty-line` renamed `zz-line`: +1 `MISSING .an-svg .zz-line`; K17 unlisted tracked `test/engine/zzz.mjs` 1; K18 CURRENT 5: 1. Gap proof: `x` appended to `figma/plugin/ui.html`, K9 script: 0 hits |
| 2 | Two evidence files per claim | 🟢 | 35/35 rows still have two non-empty evidence cells. P3 now lists 10 types; the doc's own grep yields exactly `apply, list-fonts, load-config, load-sets, read-float-variables, read-variables, save-config, save-sets, sweep-delete, sweep-scan` (13 raw matches, 10 unique). P7 evidence 2 is now repo files (`package.json` test script, `.claude/CLAUDE.md` Commands). X2 idempotence held: `gen-figma-binder-code.mjs` run twice, `git status` empty both times. Cited refs verified in pass 1 are unchanged | X2: junk inside `GENERATED:ROLE_TABLE` markers was removed by regen (status empty after); junk appended outside the markers survived regen, which is what "rewrite only between markers" predicts |
| 3 | No source edits | 🟢 | `git diff --stat HEAD`: only `.claude/settings.json`, the key reorder already in this session's starting status; no untracked files outside `.sdlc/` | pass 1: an index-backed diff against a planted copy listed all 9 planted files + 1 untracked |

## Pass 1 gaps

| Gap | Disposition |
|---|---|
| bites recorded for 4/18 | 🟢 closed: 18/18, and 8 re-planted here all caught |
| K12 count 4 vs command 10 | 🟢 closed: raw 10 and filtered 4 both stated; filtered command returns 4 |
| K13 count 9 vs 10 | 🟢 closed: generated asset excluded by name; script returns 0 at HEAD |
| P3 partial | 🟢 closed: 10 types |
| P7 evidence not in repo | 🟢 closed |
| X2 idempotence unevidenced | 🟢 closed, verified above |
| (new) K9 control omits `figma/plugin/ui.html` without listing it as an exception | 🟡 open |

## Pass 3 (criterion 1, K9 only)

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | K9 control and exceptions | 🟡 | Ran the revised §6.1 K9 script verbatim in a throwaway worktree of HEAD: 0 lines, tree clean after. `figma/plugin/ui.html` is now watched and regenerated. Still open: the two `gen:adia-exports` outputs (`docs/reference/data/adia-oklch-export.css`, `adia-radix-export.mjs`) are in the `npm test` chain but neither watched by K9 nor run by it (`gen-adia-derived-exports.mjs` is absent from the script), and the exceptions cell does not list them. All other `npm test` generator writes are watched (figma-plugin-assets, mcp-assets, describe-mcp-assets, categories, binder code.js, ui.html); `dist/` is ignored | `<!-- hand edited -->` appended to ui.html: 1 `CHANGED BY REGEN: figma/plugin/ui.html`. Gap proof: `x` appended to `adia-oklch-export.css`, K9 script: 0 lines; `node scripts/gen-adia-derived-exports.mjs` then restored it (status empty), so adding it to the script would catch the plant |

Pass 2 gap "K9 omits ui.html": 🟢 closed. Remaining: adia outputs unwatched and unlisted, 🟡 open.

## Pass 4 (criterion 1, K9 only)

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | Each convention has a negative control run and exceptions listed (K9 was the last open row) | 🟢 | Ran the §6.1 K9 script verbatim in a throwaway worktree of HEAD: 0 lines, tree clean. It watches 16 files and runs 8 generator scripts, including `gen-adia-derived-exports.mjs`. Independent inventory: marker file, then the 6 `npm run` generator steps of `test`, then `find -newer`: 17 files written = the 16 watched + `dist/ultimate-tokens.html` (gitignored, listed as an exception). `git status` empty after | plants, each caught with 1 `CHANGED BY REGEN` line: `adia-oklch-export.css`, `adia-radix-export.mjs`, `src/ui/categories/travel.js` |

Pass 3 gap "adia outputs unwatched and unlisted": 🟢 closed. Final state: criteria 1, 2, 3 all 🟢.
