---
kind: handoff
plan: rule-gates
unit: U6
branch: unit/rg-U6
written: 2026-09-22
pass: 2
---

# Handoff U6 · builder-l2 → reviewer-l1

BASE (the unit's recorded base sha, cut from `plan/rule-gates`): `b3961aa947f700f4bc70dc5cdaaaebf592f2ea46`
Unit head after this pass: `b37b6518193e990fe08dedfa4a2640d293179f41`

| Field | Value |
|---|---|
| Files | `src/ui/sections/color.js`, `src/ui/sections/typography.js`, `src/ui/sections/geometry.js`, `src/ui/app.js`, `src/ui/app-helpers.mjs`, `src/engine/ds-export.js`, `mcp/brand-kit-core.mjs`, `.claude/skills/maintaining-brand-kit-mcp/references/foundations.md`, one assertion each in `test/ui/headless-boot.mjs`, `test/engine/exports.mjs`, `test/mcp/core.mjs`; plus the generated mirrors `npm test` rewrote from those sources (`figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`, `src/ui/mcp-assets.js`) |
| Ran | every U6 criterion below plus its negative control, all in a throwaway clone (`git clone -q --shared`), HEAD confirmed at the unit commit before running |

## Criteria

| # | Criterion | Command | Result | Negative control |
|---|---|---|---|---|
| U6-1 | no lone-glyph token remains in sources, and the three surfaces print `n/a` | plan row U6-1's own lone-token grep, the `"n/a"` count, then `npm test 2>&1 \| tail -1` | `0`, `20`, `✓ all 48 test files passed` 🟢 | put the glyph back in one `an-empty` call (`color.js:74`, `graphTone`): the lone-token grep prints `1`, and `node test/ui/headless-boot.mjs` reds `✗ (na) color.js .an-empty reads "n/a" (got —)` |
| U6-2 | each surface has a test that reds on the glyph, anchored to the surface's own text | `grep -c 'an-empty.*n/a' test/ui/headless-boot.mjs; grep -c '\| n/a \|' test/engine/exports.mjs; grep -c 'Systems in this kit: n/a' test/mcp/core.mjs` | `3`, `1`, `1` 🟢 | reverted each surface in turn in the clone: `color.js:74` reds `headless-boot.mjs` as above; `ds-export.js:1373` (the muted-foreground cell) reds `node test/engine/exports.mjs` as `FAIL design-system-make — color.md's text-muted-foreground row lost its n/a placeholder`; `brand-kit-core.mjs:63` reds `node test/mcp/core.mjs` as `(U6) an empty kit's guide reads "Systems in this kit: n/a." (got: Systems in this kit: —.)` |
| U6-3 | the doc line names the new text and the mirrors regenerate clean | `grep -c 'degrades to "n/a"' .claude/skills/maintaining-brand-kit-mcp/references/foundations.md; git grep -c -E '\\"—\\"' -- . ':!*.md' \| awk -F: '{s+=$NF} END{print s+0}'` (after `npm test`) | `1`, `0` 🟢 | left the doc line unchanged in a scratch copy: `0`; the 6 escaped `\"—\"` tokens the mirrors used to carry are gone once regenerated |

## Notes

- The plan's step-1 inventory ("the 16 `an-empty` inspector placeholders") undercounts: only 11 `an-empty` calls carry the glyph (5 in `color.js`, 3 in `geometry.js`, 3 in `typography.js`). The actual lone-token total is 20, confirmed both by `git grep` before this pass and by `grep -c '"—"'` across the seven touched source files landing on the same seven-file, 20-occurrence split. I replaced all 20 (not just the ones the step text names), since U6-1's own command is `0` over the WHOLE lone-token pattern, not a named subset. This includes two spots the step list omits: the drift-cell mark at `color.js:1337` (`st === "absent" ? "—" : "·"`) and the role-suffix fallback at `color.js:2149` (`r.suffix || "—"`).
- U6's own instructions named "owner ruling Q5/Q6"; the plan's Rulings table only carries Q1 to Q4, and Q3 (2026-09-22, "Replace it"; the new text is `n/a`) is the one that governs this unit. I built against Q3 and flag the Q5/Q6 reference as not present in `.sdlc/plans/rule-gates.md` or `.sdlc/questions/issue-triage-2026-09-22.md`.
- Dead branch, not exercised: `ds-export.js:1433`'s `DS_MAKE_TYPE_USE[key] || "n/a"` cannot actually miss under any real type scale (`DS_TYPE_LEVELS` and `DS_MAKE_TYPE_USE` carry the identical 12 keys), so no kit construction reaches it; I replaced the token there for U6-1's sake and left it unexercised rather than force a synthetic scenario, and covered the type table's own regression risk with a table-cell-shaped guard (`/\|\s*—\s*\|/`) instead of a bare `.includes("—")`, since the real typography.md carries legitimate prose em dashes that a bare glyph check would false-positive on.
- `npm run smoke`: ran in a separate clone with `npm ci` (never in the worktree), `SMOKE PASS`.
- Final `npm test` at the unit head, in a throwaway clone, no `node_modules`: `✓ all 48 test files passed`, tree clean (`0`) after.
- `node test/repo/branding.mjs` at the unit head, same clone: `branding: clean (567 files scanned)`.

## Pass 2 (fix-first: two test comments carried an em dash)

Review (`scratchpad/rg-U6-review.md`) found an em dash in two comments I added: `test/mcp/core.mjs:79` and `test/engine/exports.mjs:1954`. Both reworded with a colon, committed alone at `a7263e59299ab3eb6a8683a32362018f2fdd9218`.

- Line diff, `test/mcp/core.mjs:79`: was `// U6 (owner ruling Q3, 2026-09-22) — a kit with no system degrades to "n/a" in the guide's`, now `// U6 (owner ruling Q3, 2026-09-22): a kit with no system degrades to "n/a" in the guide's`.
- Line diff, `test/engine/exports.mjs:1954`: was `  // U6 (owner ruling Q3, 2026-09-22) — the empty-value placeholder is "n/a", not the glyph, on`, now `  // U6 (owner ruling Q3, 2026-09-22): the empty-value placeholder is "n/a", not the glyph, on`.
- U6-2's affected tests, rerun in a fresh clone at `a7263e59299ab3eb6a8683a32362018f2fdd9218`: `node test/mcp/core.mjs` prints `brand-kit core PASS — buildSurface (system-gated) + handle (initialize/tools/resources/prompts/errors), the surface shared by the stdio server + the hosted Worker`; `node test/engine/exports.mjs` prints `PASS: export-formats clears all [gate] predicates`.
- Full gate at the same head, same clone: `npm test` → `✓ all 48 test files passed`, tree clean (`0`) after; `node test/repo/branding.mjs` → `branding: clean (568 files scanned)`.
- New unit head: `a7263e59299ab3eb6a8683a32362018f2fdd9218`.

## Pass 2, continued (one more comment, missed by the first review pass)

`test/ui/headless-boot.mjs:3720` also carried an em dash: `// Typography's modular-scale graph (an empty series), Geometry's power graph (an empty ramp) —`. Reworded with a colon, committed alone at `6982a1f3477dde155c67443dcce93f598220ef94`.

- Sweep of the whole unit diff before committing further: `git diff b3961aa9 HEAD -- test src mcp .claude | grep -v '^+++ ' | grep '^+' | perl -CSD -ne 'print if /\x{2014}/'` (excluding generated files, since the diff scope is `test src mcp .claude`) printed one line, the assertion regex at `test/engine/exports.mjs:2047` (`/\|\s*—\s*\|/.test(colorMd) ...`), which carries the glyph as literal regex content, not prose; excluding that one line the count is `0`.
- `node test/ui/headless-boot.mjs`, rerun in a fresh clone at `6982a1f3477dde155c67443dcce93f598220ef94`: `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold`.
- `node test/repo/branding.mjs`, same clone: `branding: clean (568 files scanned)`.
- New unit head: `6982a1f3477dde155c67443dcce93f598220ef94`.
