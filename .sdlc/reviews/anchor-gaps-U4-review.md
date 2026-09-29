PASS

# Review: anchor-gaps U4, pass 1 (trivial lane, closes the unit)

Head 5750190f on `unit/ag-U4`, base `plan/anchor-gaps` at 87e633cd. No source edited by this review.

## Findings, ranked

| Rank | Finding | Where |
|---|---|---|
| Info | The builder skipped U4-4's negative control; run here: appending a line to `src/ui/app.js` makes the U4-4 pipeline print `1`, the head prints `0`. Not a defect in the change | `.sdlc/handoffs/anchor-gaps-U4.md` U4-4 row |
| Info | The "stored pre-#681 preset takes its row's anchor" sentence is true by the equality rule (`name`, `hue`, `chroma`, `skew`, `lift` all `===`); no fixture here re-derives Maison's Success against a row. It follows from the code, not from a run of that palette | `src/ui/app-helpers.mjs:853` |

No blocking or major findings.

## Check 1: the #740 entry is true of the code

| Claim in `CHANGELOG.md` (lines 24 to 32) | Code | Result |
|---|---|---|
| a palette equal to no row of the stored doc's table stays parametric | `backfillDefaultAnchors` returns `p` when `defaultRows.find` misses (`app-helpers.mjs:867`); table chosen once from `stored.hueSpace` (`:860`), never both | true |
| a stored pre-v5 palette equal to a row, a pre-#681 preset included, takes that row's anchor | `{ ...p, anchor: row.anchor, sourceAnchor: row.anchor }` (`:869`); the rule reads no provenance, only equality, and skips `schemaVersion >= 5` (`:855`) | true |
| stored set list takes the backfill | `hydrateStoredDoc` calls it (`app-helpers.mjs:212`); `app.js:205` (openSet) and `:682` (tile key colours) use `hydrateStoredDoc` | true |
| gallery, Figma-variables, embedded-config restores open without it | `openConfigAsSet` uses `hydrateConfig` (`app.js:2371`); callers at `:806` (gallery tile), `:1227` (Figma variables), `:1192` (Open saved palette), `:2358` (project restore); `hydrateConfig` has no backfill (`app-helpers.mjs:~880`) | true |

## Check 2: rows and controls, run here

| Row | Result at 5750190f | Control |
|---|---|---|
| U4-1 | `0` | 221c1e57 prints `1` |
| U4-2 | `1` | the same range with `pre-#681` lines removed prints `0` |
| U4-3 | `1` and `0` | 221c1e57 prints `1` for `2026-09-26`, `0` for `2026-09-29` |
| U4-4 | `0` | a touched `src/ui/app.js` prints `1` (run) |
| U4-5 | `npm test` in a `git clone --shared` at 5750190f: `all 54 test files passed`; `git status --short` prints `0` | a U+2014 appended to `CHANGELOG.md`: `test/repo/em-dash.mjs` exits `1`; reverted, clone clean |

## Check 3: scope and hygiene

- `git diff --name-only 87e633cd 5750190f`: `.sdlc/handoffs/anchor-gaps-U3.md`, `.sdlc/handoffs/anchor-gaps-U4.md`, `CHANGELOG.md`. Nothing else.
- U3 handoff Left out line reads `4141.3` (the only change to that file).
- U+2014 in the diff: `0`. `test/repo/branding.mjs` passes inside `npm test`; the U4 handoff names no retired maker brand.
- The `### 2026-09-26` block was re-dated in place; no second `2026-09-29` block exists.
