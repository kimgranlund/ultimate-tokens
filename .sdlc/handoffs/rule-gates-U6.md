---
kind: handoff
plan: rule-gates
unit: U6
branch: unit/rg-U6
written: 2026-09-22
pass: 1
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
