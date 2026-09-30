PASS

Review of docs-stale-batch U3 pass 1 (#779, closes #771), unit/dsb-U3 @ fcf2b5cd, base 30f7ba10. Reviewer: reviewer-l1.

## Findings, ranked

1. No blocking finding. The diff is five files: both headers, the two regenerated assets, the handoff.
2. Plan defect, P3 (docs-stale-batch.md:51), not a missing row. The cell's `grep -v -E '^[\|] (Claim\|---)'` is table-escaped; run verbatim in a shell, `\|` is a literal pipe, the header row is not filtered, and the count is 8 for 7 rows. Run with the escape resolved (`'^[|] (Claim|---)'`) it prints 7. The ledger has exactly 7 rows and covers each changed sentence: both headers present/absent, both embedded assets, the package.json wiring. Same escape trap as U2; the plan should state the count as 7 and unescape the pipe.
3. Minor, handoff Ran table: it says P3 was run "at this commit" but the ran block carries only U3-1..U3-4 and P2. Harmless, P3 re-run here is `ok`-shaped for all 7 rows.

## Checks

| Check | Result |
|---|---|
| U3-1 at head | `0` `0`; at base `1` `1` (control bites) |
| U3-2 at head | `true true node scripts/gen-figma-binder-code.mjs`; control (sed gen:figma-assets to gen:figma-binder-code in package.json) prints `false false` (plan predicted `false true`; the sed hit both scripts, still discriminating) |
| U3-3 at head | `0` per asset file; base `1` per file; reverting the two assets to base in a clone gives `1` per file, and `gen-figma-assets.mjs` alone regenerates `src/ui/figma-plugin-assets.js` byte-identical to head |
| U3-4 | clean tree after a second generator run prints `0`; with a stale line planted above the FLOAT_EXECUTOR END marker and committed, prints `1` |
| Header truth | package.json:17 `gen:figma-binder-code` = the generator alone; :18 `gen:figma-assets` = generator `&&` gen-figma-assets.mjs; `test`/`build` call gen:figma-assets and not gen:figma-binder-code. Both new sentences are true. |
| Asset drift | `figma-plugin-assets.js` and `figma/plugin/ui.html` each change on exactly one line, and within it only the replaced header words ("run it as gen:figma-binder-code" to the new clause). No other drift. |
| Workarounds | P2 cut to first two words and the in-awk ledger count: same as U2, accepted. |
| Hygiene | U+2014 count in the diff `0`; no board file, no `.claude/docs/other/`; tree clean. |
| Not run | `npm test`: process count guard was 2 (not under 2), skipped; the targeted regeneration above covers U3-3/U3-4. Builder's handoff reports npm test green (54 files). `npm run build` and smoke are owed at pre-land. |
