---
kind: verdict
plan: gate-gaps
unit: U1
ticket: "#715"
branch: unit/gg-U1
head: f2e568b7
base: 557b6c0c
plan-head: 1b20deaa
written: 2026-09-22
---

# Verdict gg-U1 · 🟢

9 of 9 rows 🟢, 0 🟡, 0 🔴. Every run was in a detached scratch worktree at `f2e568b7` or in `git clone --shared` copies checked out at `f2e568b7` (base copy at `557b6c0c`), never in `.worktrees/gg-U1`.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U1-1 | the seven kit lines print, each 0, file green, both legs | 🟢 | SAMPLED `exit 0`, `7`, `0`; FULL (`npm run -s gate:corpus-anchor`) `exit 0`, `7`, `0` | U1-2 plants below turn the same lines to `FAIL` |
| U1-2 | a planted kit defect reds each of the seven by name | 🟢 | window/monotone/gap/distinct/notch/order/dupe FAIL counts: K1 `1 0 1 1 0 1 0`, K2 `0 0 1 1 0 1 1`, K3 `0 0 0 0 1 0 0`, K4 `1 1 1 1 0 1 0`, each `exit 1`. Diff-stat before each run: K1 to K3 `1 file changed, 1 insertion(+), 1 deletion(-)`, K4 `2 files changed, 2 insertions(+), 2 deletions(-)` | clean run is U1-1 (`0` FAIL lines). Every one of the seven reds on at least one plant; K3 is pure notch (`FAIL: 1 gate failure(s)`) |
| U1-2b | the checks read the rendered path, not the source data | 🟢 | my own plant R: `src/ui/model.mjs` `projectView` output only, `fullRamp` stop index 1 of `Data 7` copies stop 0's hex, anchor untouched. Result `exit 1`, `distinct=1`, all other six `0`, line `FAIL  anchor-ramp default-kit distinct: Data 7 #088585 [perceptual]: the 25-stop export ramp has a duplicate hex` | a plant that exists only in `projectView`'s output can only red a check that reads that output. Code read also confirms the five ramp checks take `vp.ramp`/`vp.fullRamp` from `projectView(hydrate(...))`, the same shape as the curated sweep |
| U1-3 | the vacuity check bites | 🟢 | clone edit `const kitPalettes = [];` (diff-stat `1 file changed, 1 insertion(+), 1 deletion(-)`): `exit 1`, `1`, line `default-kit vacuity: visited 0 (ramp), 0 (ladder) of 16 kit palettes` | U1-1 is the clean half: `0` FAIL lines, vacuity silent |
| U1-4 | curated gates did not move, both legs | 🟢 | base `557b6c0c` pass counts SAMPLED `19`, FULL `19` (my own runs); head SAMPLED `26`, FULL `26`; `diff` of the two SAMPLED pass sets: `7` added, `0` removed; `ALLOW_NEEDLE` `window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15` count `1` at head and base; `cmp 0` for the kit lines across legs | one name removed from `RAMP_GAP_ALLOW` (diff-stat `1 file changed, 1 deletion(-)`): FULL `exit 1`, needle count `0`, `FAIL  anchor-ramp gap (19-stop) allow-list: 72 (expected 71)` |
| U1-5 | no predicate copied or rewritten; curated sweeps, allow-lists and lone-spike block untouched | 🟢 | removed diff lines `0` (`grep -v '^--- ' \| grep -c '^-'`); new block calls top-level `monotoneOk`, `gapOk19`, `distinctOk25`, `notchOk`, `RAMP_L_MIN`/`RAMP_L_MAX`; order/dupe expressions byte-match the curated `anchor-ladder` loop (`sw[2].l > sw[3].l && sw[3].l > sw[4].l`, `new Set(sw.map((x) => x.hex)).size < 7`) | U1-4 allow-list control shows the curated lists still bite; U1-2/U1-2b show the called predicates bite on the kit |
| P1 | `npm test` green, count agrees, tree byte-stable | 🟢 | `✓ all 50 test files passed`, `exit 0`; TESTS `50`; `git status --short` `0`; wall `real 239.46` (loud, not a timing figure) | P1's role-table control not rerun; U1-2 to U1-4 show `anchor.mjs`, which runs inside `npm test`, exits 1 on a defect |
| P3 | branding clean, no em dash on added lines | 🟢 | `branding: clean (522 files scanned)`; em dash sweep `0` (and `0` with backtick stripping off) | clone with the retired maker token appended: `exit 1`, `FAIL: 1 branding violation(s)`; a planted dash line through the same perl filter prints `1` |
| P4 | scope wall | 🟢 | vs `557b6c0c`: filter `0`, `src` `0`; files `test/engine/anchor.mjs`, `.sdlc/handoffs/gate-gaps-U1.md` | the three-name fixture through the same filter prints `1` |

## Notes, not graded

- Host load: `uptime` at start `load averages: 4.65 6.24 6.25`; after the anchor legs `16.78 19.93 13.76`; after `npm test` `32.51 21.66 15.57`. Other seats' browser and gate runs were live (95 node-matching processes mid-run). No figure here is a timing baseline.
- G0 waived for U1 by plan revision 5; the baseline's two non-head STALE lines at `557b6c0c` (handoff's observation) are owed by #713 U6b before pre-land, not by this unit.
- Vacuity keys on palette names in a `Set`, so two kit palettes sharing a name would trip it falsely. Not a defect today (16 distinct names visited).
- P2 and P5 are pre-land or U2 rows; not graded here.
