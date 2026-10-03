# PR body draft: plan floorref-hue (#766)

Title: `The even-mode chroma floor reads its gamut reference per stop, at the stop's own hue before edge rotation (#766)`

## Body

Closes #766.

### What changed

`evenChroma`'s floor reference (`floorRef`, #701) was one gamut ceiling per ramp, read at one hue. It is now read per stop through `floorRefAt`: the largest ceiling at the ramp's three reference tones (the pivot, 450, 550), at that stop's own hue before edge rotation. That hue is the CAM16 hue the per-stop OKLCH solve finds for the stop's tone on the anchored OKLCH path, `seedHue` on anchored cam16, and `baseHue` on the non-anchored path. The pivot ceiling is read at `pivotTone`, so a clamped anchor no longer reads it at its own L\*. `evenChroma`'s body and signature are unchanged.

Edge rotation is not followed (owner ruling R85, option A). The gamut ceilings are not monotone in hue, so a reference that follows the rotation rises or falls along the ramp against stops that do not move with it, and both directions measured off-anchor dips (4 / 20 / 64 at `hueShift` 30 / 45 / 60 on a default-kit grid, merge-base 0).

### Measured movement (`node scripts/report-preset-fidelity.mjs --floor-ref`)

| Path | Stop set | Cells | Moved | Max dC |
|---|---|---|---|---|
| gate (anchor omitted) | `STOPS` | 72,124 | 0 | 0.00 C |
| gate (anchor omitted) | `EXPORT_STOPS` | 94,900 | 0 | 0.00 C |
| rendered (anchor passed) | `STOPS` | 71,820 | 3,870 (5.4%), 1,522 palettes, 339 docs | 9.11 C (Tbilisi `secondary` 100) |
| rendered (anchor passed) | `EXPORT_STOPS` | 94,500 | 4,441 (4.7%), 1,523 palettes, 339 docs | 9.11 C |

The 10 C tolerance is a bound on the curated corpus the verifier reads, not an engine cap and not a property of every input. Every curated doc and the default kit persist `toneMode: "perceptual"`, so no shipped render moves; only a user's even-mode session does.

### Declared trade (owner ruling R87, option A)

On 5,000 random anchored palettes the per-stop OKLCH solve removes 16 merge-base dip cells and opens 4 (2 palettes, oklch, `hueShift` 39 and 49). The gate holds the net: `gate:even-dips` grid lines (a) gate path and (b1) kit anchors at `hueShift` +/-60 stay at 0, and (b2), 1,000 pinned-seed random anchored palettes, stays at or under the merge-base count of 7 (head reads 5 cells in 3 palettes, a strict subset). Each line has an in-script control that bites (32 / 8 / 13 against bounds 0 / 0 / 7). The `evenChroma` header and the `dip-gate-even` header now say no-dip there is a measurement, not a structural property.

### Out-of-lane edits (named for the reviewer)

Two one-token citation repairs outside the plan's lane list, forced by `test/repo/citations.mjs` (the engine edit moved `okhslLAt` from `tonal.js:1026` to `:1050`; reverting either makes the gate exit 1):

- `docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md`: `src/engine/tonal.js:1026` to `:1050`
- `docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md`: `src/engine/tonal.js:1026` to `:1050`

### Fixtures and timing

- `test/engine/fixtures/chroma-envelope.json`: even row re-captured and falling (median at 300 47.1 to 47.0, p90 100.3 to 100.0, `above100` 502 to 499); perceptual and peak byte-identical. `tonal-legacy.json` and the mode-isolation fixture are untouched.
- `gate:even-dips` (five alternating pairs, quiet host): merge-base 6.62 · 7.68 · 8.27 · 7.46 · 6.76 s, median 7.46; head 53.51 · 36.35 · 36.31 · 36.48 · 44.89 s, median 36.48. Net of the printed C2.13 blocks (29.48 s on the median run) the corpus sweep is 6.99 s, ratio 0.94 against the 1.2 bound. The `.sdlc/baseline.md` and `.sdlc/adapter.md` ranges are updated (36 to 54 s). One head run is over the 45 s ceiling; the median is not.
- `npm test`: 108.49 · 112.12 · 118.70 s, median under the 120 s ceiling.

### Records

Color-math skill and foundations, ADR-026 amendment (2026-10-03) and Quick map row, knowledge-02 section 5, the glossary `chromaFloor` row, CHANGELOG (Unreleased, no PR number until land).

### Test plan

- [ ] `npm test` green, tree clean after
- [ ] `npm run build` green
- [ ] CI: `build-test`, `panda-smoke`, `corpus-contrast`, `sweeps`
- [ ] `node scripts/report-preset-fidelity.mjs --floor-ref --base-dir <merge-base clone>` reads the table above

🤖 Generated with [Claude Code](https://claude.com/claude-code)

## Issue closing comment (C3.7, post after landing)

Closed by the PR above. The even-mode chroma floor now reads its gamut reference per stop, at the stop's own hue before edge rotation. Gate path: 0 of 72,124 `STOPS` cells and 0 of 94,900 `EXPORT_STOPS` cells move. Rendered path: 3,870 of 71,820 `STOPS` cells move (5.4%, 1,522 palettes, 339 docs) and 4,441 of 94,500 `EXPORT_STOPS` cells, at most 9.11 CAM16 C (Tbilisi `secondary` 100). Edge rotation is not followed: a reference that follows it measured off-anchor dips in both directions. No shipped render moves (every curated doc and the default kit are `perceptual`). Random anchored input under rotation is bounded, not dip-free: 16 merge-base dip cells removed, 4 opened in 5,000 random palettes, held at or under the pinned count by `gate:even-dips`. ADR-026 carries the amendment.
