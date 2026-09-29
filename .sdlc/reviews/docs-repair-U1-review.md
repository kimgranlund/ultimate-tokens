FAIL: every U1 row measures as expected, but Revision B misstates the Typography and Color canvas modes, and it skips four things the plan's design paragraph asks for, one of which breaks U6 pin (c).

---
kind: verdict
plan: docs-repair
unit: U1
ticket: "#751"
branch: unit/dr-U1
base: 5d8b1c30
sha: 3e4cfdcf
grade: reviewer, fresh context
pass: 1
written: 2026-09-28
---

verdict: 🔴 FAIL, fix F1 to F4 and re-review; F5 to F8 ride the same pass

Head `3e4cfdcf` (the code is at `15c562ed`), base `5d8b1c30`, diff `git diff 5d8b1c30..3e4cfdcf`. I ran every command in `.worktrees/dr-U1` and made no source edits. I did not run `npm test`; it is recorded green 50/50.

## Rows

| Id | State | Evidence at 3e4cfdcf |
|---|---|---|
| U1-1 | 🟢 | `1`, `1`, Color `2`, Typography `3`, Geometry `3` |
| U1-2 | 🟢 | all eight doc needles `1`; source greps `2 3 36 1 3 2 1 1`, same as the plan |
| U1-3 | 🟢 | `11`, `2`, `4` |
| U1-4 | 🟢 | `0`, `2`, `1` (the handoff reports `1` for the second; the file names `docs/lld/app-shell.md` twice, F8) |
| U1-5 | 🟢 | the file is not discovered (no cite): `0`, `0` |
| U1-6 | 🟢 | `0`, `0`, `260` lines (under 330) |
| P3 | 🟢 | `branding: clean (737 files scanned)`; U+2014 on added lines: `0` |
| P4 | 🟢 | the diff names only `docs/reference/references/ui-plan.md` and the handoff |
| P6 | 🟢 | `10` (was 15 at base; the rest belongs to U2) |
| P7 | 🟢 | handoff head `15c562ed`, `ancestor`, `0` tree files changed since |

The rows are green, but they only count needles. Checked against the source, the revision's claims are wrong in the places below.

## Findings, by severity

| # | Sev | Where | Finding | Source evidence |
|---|---|---|---|---|
| F1 | high | `ui-plan.md:48` (Typography row) | The row treats the inspector tabs as the canvas mode. "scale, fonts and `specimen` tabs, with the mode held in `typeSpecMode`" is wrong: `scale \| fonts \| specimen` are the right-pane inspector tabs, held in `typeSegment`. `typeSpecMode` is the canvas segment and holds `specimen \| tokens`. The row also leaves out Typography's own breakpoint modes and its `compare` (All), and it gives both only to Geometry | `typography.js:310-311` canvas `specimen`/`tokens`; `app.js:101` `typeSpecMode = "specimen"; // typography canvas: specimen \| tokens`; `app.js:147` `typeSegment = "scale"; // right-pane Typography inspector tab: scale \| fonts \| specimen`; `typography.js:607` inspector tabs; `typography.js:166-172` `typeMode` base/modes/`compare` |
| F2 | high | `ui-plan.md:47` (Color row) | The row says "plus the ramps table view", but no ramps table view exists. The Color canvas has four views in `canvasView`: Palettes, Scrims, Mapping (the only table, and it is the semantic-mapping table, not ramps) and Radix. The row names none of them. The inspector also has a `story` tab beside palette, global and roles when a category story exists | `color.js:816-819` the four ids; `color.js:867` `isTable = this.canvasView === "mapping"`; `color.js:870` Compare skips the table; `app.js:94` and `app.js:1933` the `story` tab |
| F3 | medium | `ui-plan.md:81` (`T8 export:` line) | The line reads `10 color formats, ...`. U6 pin (c) in the plan's design paragraph needs the `T8 export:` line to carry the needle `10 formats`. As written, that pin reds as soon as U6 lands, or U6 has to be rewritten around it. Either write `10 formats (color), plus ...` or get the plan to change the needle | plan `## The design, stated once`, U6 paragraph, pin (c) |
| F4 | medium | `ui-plan.md:73-82` (§1 tasks) | Not done: the design says "§1's task list gains the tasks Revision B adds (tune type, tune geometry, manage breakpoint modes, compare) without renumbering T1 to T9". Only T8 and T9 changed; there is no T10 or later | `grep -c 'tune.type\|breakpoint' ui-plan.md` finds only the Geometry table row |
| F5 | low | `ui-plan.md:55-57` (Gallery) | The design asks for "the categories view named as its own state (`this.category`, a slug or `null`, volumes of curated presets loaded per category)". The revision says "a category page" and never names `this.category` or the volumes. The gallery facts it does give are accurate | `app.js:75` `this.category = null`; `app.js:952-955` "12 volumes x 4 palettes (lazily loaded)"; `app.js:906` the hub/category switch |
| F6 | low | `ui-plan.md:30-37` (pointers) | The design asks for pointers to `type-scale` and `geometry-system` "for the engines", and the file has neither. It also omits the Geometry canvas segment `controls \| tokens` (`geomSpecMode`) and the left-pane analysis by name | `grep -c 'type-scale\|geometry-system' ui-plan.md` prints `0`; `app.js:142` `geomSpecMode`; `geometry.js:383-384` |
| F7 | low | `ui-plan.md:1` (title) | The design says the title keeps `HCT Palette Generator` only if Q2 says keep, and Q2 was answered "keep the id; retitle only". The title still reads `HCT Palette Generator`. The ruling is ambiguous for this file (Q2 is about the SKILL.md spec cell), so either retitle to `Ultimate Tokens` or have the handoff say why it was kept | plan `## Owner questions` Q2 |
| F8 | info | handoff `Ran` U1-4, P3 | The handoff reports `docs/lld/app-shell.md` as `1`; it measures `2`. It calls the 28 pre-existing lines "dashed lines", but all 28 are U+2014, as the next section shows | per row above |

## Em dash check (the lead's ask)

- All 28 pre-existing "dashed lines" in `ui-plan.md` carry U+2014: lines `1 8 10 13 15 21 69 128 130 137 139 144 152 203 212 221 223 243-249 253 256 258 259` at head. The count is `28` at base `5d8b1c30` and `28` at head.
- The unit added none. Added lines with U+2014: `0`. The three lines it rewrote (T8, T9 and the drawer heading) had none at base.
- Merge outlook: main's em-dash sweep (`347e7103`, not in this base) already cleared this file. `git merge-tree` of `main` with `3e4cfdcf` merges `ui-plan.md` cleanly with `0` U+2014 lines, so U1 adds no em-dash debt to pre-land. That same trial merge conflicts in `.claude/CLAUDE.md`, `building-editor-sections/SKILL.md` and `.sdlc/baseline.md`, all outside U1.

## Claims verified correct

- `setSection` stashes the Color viewport on leave and restores it on return; Typography and Geometry scenes start fit (`app.js:1435-1444`).
- `colorMode` takes `system`, `light`, `dark` or `both`, and `both` goes through `renderCompareArea` (`app.js:98`, `color.js:870`, `color.js:936`).
- Geometry: `geomMode` base, mode or `compare` (All), and inspector tabs `ramp`, `radius`, `space` (`geometry.js:219-230`, `geometry.js:710`).
- The drawer offers the ten color formats, in the listed order, through a grouped `select` (`drawer.js:38-44`, `drawer.js:177-194`). The groups are Typography 2, Geometry 3, Design System 2 and Project 1, matching the prose.
- The gallery header holds Project, Import, `+ New` and theme. The hub shows Your Palettes with search, then `CATEGORY_INDEX` cards, and a category palette opens as an editable copy (`app.js:887-946`).
- Persistence: `colorMode` and the other app prefs go under `_appPrefsKey()` and never with the document (`app.js:2297`, `app-shell.md:208`).
- The revision cites no `file:line` and copies no procedure from the skill.
