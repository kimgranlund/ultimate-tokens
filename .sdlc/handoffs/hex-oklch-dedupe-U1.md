# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/hx-U1 @ ed5b716a (includes 91ac5168 and 612650b0, the plan's two P4 revisions merged in) |
| Files | src/ui/model.mjs, test/ui/model.mjs, figma/plugin/ui.html, src/ui/describe-mcp-assets.js, .sdlc/plans/hex-oklch-dedupe.md (merged), .sdlc/handoffs/hex-oklch-dedupe-U1.md |
| B | 625248316db62d7ed55947507c7300161db29f31 (`git merge-base origin/main HEAD`) |
| Deleted lines (B numbering) | model.mjs:871 (false comment), :874-878 (5 comment lines), :880-892 (anchorRgbOf + rgbToOklchLocal, 13 lines), :913 changed to the hexToOklch(keyHex) call. numstat 1 added / 20 deleted |
| Engine-side copies (out of scope, named per Q1) | src/engine/prime.mjs:101 rgbToOklch; src/engine/exports.js:144 rgbToOklch |
| P3 raw count | branding: clean (644 files scanned); 0 added em dashes outside backticks; 0 in the handoffs-excluded sweep |
| U1-4 subject count | 16 (the default kit's anchored families) |

## Ran

| Id | Command | Result | Control |
|---|---|---|---|
| P1 | npm test in worktree | pass line "all 49 test files passed", N=49, tree 0 | clone, corrupted role-table.json: exit 1, "1/49 test file(s) failed" |
| P2 | npm run build in a clone (node_modules symlinked) | exit 0, "wrote figma/plugin/ui.html 4116.2 KB", tree 0 | clone, un-exported hexToOklch: exit 1, [MISSING_EXPORT] hexToOklch not exported |
| P3 | branding.mjs + em-dash sweep | "branding: clean (644 files scanned)", 0, 0 | clone+cp decision-records into verdicts: FAIL 3 violations/645 files; clone+added em-dash line: 1 |
| P4 | scope wall (post plan-merge, with 91ac5168's added exclude) | 0, 0 | fixture of 3 names through the filter: 2 |
| U1-1 | grep needles + survivors | 0, 1, 1, 1 | at G0 before edit: 7, 1, 0, 1 |
| U1-2 | node test/engine/anchor.mjs | exit 0, key-anchor count 2, 0 FAIL | clone with keyOklch forced to hexToOklch("#000000"): stays exit 0 (reads hex only, by design; see U1-4) |
| U1-3 | corpus probe, worktree vs clone at B, cmp | cmp 0; 3780 rows, 3380 anchored-equal both sides | clone, coefficient 0.4122214708->...09 in the surviving rgbToOklchArr: cmp differ at char 286, cmp 1 |
| U1-4 | node test/ui/model.mjs | exit 0, pin match 1, subjects 16 | clone from U1-2's control (keyOklch forced to #000000): exit 1, FAIL naming "Neutral" first |
| U1-5 | numstat + added-line count on model.mjs | "1 20", 1 | clone, one extra appended line then committed: numstat "2 20", added-line count 2 |

## Note for landing

P4 first went red (1, not 0) because fe1d6071 also repaired a stale line-number citation in
docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md (model.mjs:1100 ->
:1081, shifted by the deletion). Resolved by the team lead's plan revision 91ac5168, which admits
that file by name in P4's exclude list; rerun after merging plan/hex-oklch-dedupe into this branch
is 0, 0.

Second, merging plan/hex-oklch-dedupe 612650b0 (origin/main's own drift folded in) made
.sdlc/baseline.md's committed ui.html figure stale: the deletion shrinks the bundle from 4125.3 KB
to 4122.4 KB. `npm test` in this worktree and `npm run build` in a scratch clone (node_modules
symlinked from the repo root) both print `wrote figma/plugin/ui.html 4122.4 KB`, and measuring the
committed file the way baseline-agrees-check.sh measures it (`fs.readFileSync(f, "utf8").length /
1024`) gives the same 4122.4. baseline.md's Pass-table KB cell and a new dated correction paragraph
are updated; `sh .sdlc/checks/baseline-agrees-check.sh` now reads `stale total: 0`.

N1: U1-2's negative control (`node test/engine/anchor.mjs` against the clone with `keyOklch` forced
to `hexToOklch("#000000")`) cannot go red by construction. The `key-anchor` gate that row reads
checks the identity swatch against the stored hex, never against `keyOklch`, so no edit to
`keyOklch` alone can fail it; the row's job is only to show it stays green under that edit, which is
why U1-4 (reading `test/ui/model.mjs`, which does assert on `keyOklch`) is the row that catches this
class of regression, and its own control does go red (see the Ran table).

## Left out

Nothing. All of P1-P4 and U1-1 to U1-5 ran with a real control.
