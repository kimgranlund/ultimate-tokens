# Review U10 · 🟢

Reviewer: U10-reviewer-l4-p1 (fresh context). Branch `unit/hygiene-U10` @ 9020e96, base e64b082. Criteria: root `.sdlc/plans/adopt-hygiene.md` §U10 (5 rows, criterion 2 control as rewritten at 55c65c4).

Method note: the branch carries the first (hardcoded) `card-amendment-check.sh`; every run below used the root's Source-row-driven copy. The worktree was never edited: the branch was exported with `git archive` to `$CLAUDE_JOB_DIR/tmp/u10`, the root script copied over it there, and both destructive controls run on that export (file restored, `cmp` against the worktree's copy: identical). `npm test`, branding, and the U8/U9 sweeps ran in the worktree itself; tree clean before and after.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | six cards and six index cells name the amendment; no "none stated" contradiction | 🟢 | root script on the branch: `stale total: 0`, no `stale` line | amendment clause cut from the `ADR-010` card on the export: `stale card ADR-010`, `stale total: 1`; restored: `0` |
| 2 | script not vacuous (Source-row driven, per-ADR section) | 🟢 | `- **Amendment (2026-09-16).** plant` inserted under `## ADR-011` at :165: `stale card ADR-011`, `stale index ADR-011`, `stale total: 2`; restored: `0` | same run without the plant prints neither line |
| 3 | no `none` on the six index rows | 🟢 | `grep ... \| grep -c 'none'` prints `0` | plan-measured `2` at 279ae0f; not rerun |
| 4 | U8 and U9 sweeps green | 🟢 | `u8check.sh` rows 1 to 9 print the §U8 Expected column verbatim (row 3: `debt disagreeing: 0 ... counts: 7/7 45/45`), exit 0; `wording-check.sh origin/main HEAD` and `e64b082 HEAD`: `em dashes: 0, bold labels: 0`, exit 0 both; U9 c1: `0` then exactly the three expected `missing` lines; U9 c3: no line, `npm ci` count `3` | as in §U8 and §U9; not rerun |
| 5 | gates, tree, branding | 🟢 | `all 44 test files passed`; porcelain `0` after the test run; `branding: clean (434 files scanned)` (433 in the handoff; the committed handoff is the 434th) | P1 control not rerun by me: it requires writing a retired brand string, which this review is barred from |

## Cell fidelity against the source amendments

Each amendment read in full at its source line; each cell compared for claims the source does not make.

| Record | Source | Card cell | Index cell |
|---|---|---|---|
| ADR-010 | `decision-records.md:158` | 🟢 comment in `persist.js`, `zipStore` in `src/ui/zip.mjs` not `makeZip`; both as written | 🟢 |
| ADR-013 | `:290` | 🟢 thirteen → fifteen, `UI-control`/`UI-widget` split off `ui`; TKT-0008 and the fifteen-name list omitted, nothing added | 🟢 |
| ADR-016 | `:394` | 🟢 the three renames plus "Color Primitives" unchanged, verbatim | 🟢 names the three new names only |
| LLD-muted-base | `lld-muted-base-key-spikes.md:220` | 🟢 `src/engine/resolve.mjs`, canvas + `exports.js`'s `derivePalette`; "every export format" compressed to the named import, same claim | 🟢 |
| SITE-runbook | `go-live-runbook.md:32` | 🟢 four wired consumers listed by name, `hostedMcp` the only unwired one and why; the pre-existing 2026-07-02 note kept | 🟢 |
| SITE-describe-palette | `describe-palette-spec.md:579` | 🟢 no-op skip → `exit 1`, badge stops lying, key stays the user's action | 🟢 |

`decisions.md:33` and `:50` agree with the ADR-016 and SITE-runbook cells. The ADR-013 index title still reads "(7 → 11)": that is the ADR's own heading, unchanged at source, not a lineage claim.

## Other cards under the generalised script

The script covers all 38 cards: every card has a `| Source |` row, every source path resolves, the 24 ADR cards are read by their own `## ADR-NNN ` to `## ADR-NNN+1 ` section (ADR-024 runs to the "Quick map" heading; nothing amended there), the 14 others by whole file. Repo-wide, exactly six sources carry `Amendment (2026-09-16)` (`grep -rn` over `docs/`), and the script flags none, so no seventh card is stale in the same way. Classes it still cannot see: (a) an amendment on any other date, the string is date-fixed; (b) an amendment written in another shape (`Update (…)`, prose); (c) a cell that names the date but misstates the amendment, which is why the table above exists; (d) a non-ADR `## ` heading inserted between two ADR sections, whose text would be attributed to the ADR above it.

## Scope, wording, branding

Diff touches only the six cards, `index.md`, and the handoff. Raw scan of added lines: one em dash and one bold label, both kept exceptions the wording script already encodes: the dash is inside the quoted source phrase `"settled — do not relitigate"` that the SITE-describe-palette line carried at e64b082 (2 dashes on that file then, 2 now); the bold label is the handoff quoting the amendment marker's own `- **Amendment (date).**` shape. Handoff itself: 0 dashes. No retired brand string in the diff.

## Would fail a fresh pre-land read (outside U10's file list)

| Item | State | Evidence |
|---|---|---|
| 14 ADR card `Source` line ranges are stale since U1's insertions | 🟡 | ADR-011 card says `:159`, heading at `:163`; drift grows to 9 lines from ADR-014 (`:289` vs `:298`) and 15 from ADR-017 (`:386` vs `:401`) through ADR-022 (`:630` vs `:645`). ADR-001 to ADR-010, ADR-023, ADR-024 match. At origin/main all ranges match, so U1's three amendment blocks (4 + 5 + 6 lines) moved them. The script keys on the heading, not the range, so criterion 1 is unaffected; the U9 path check only tests the path. A pre-land reader following a `Source` row lands four to fifteen lines early. Fix is mechanical (14 cells) and belongs to the pre-land round or a U11, not U10 |
| the branch's own copy of `adopt-hygiene.md` §U10 and `card-amendment-check.sh` are the pre-55c65c4 versions | 🟢 | expected: base is e64b082; the root's versions win on merge, nothing on the branch edits either file |

Blocking: 0. Attention: 1 (stale Source line ranges, U1's blast, outside this unit).
