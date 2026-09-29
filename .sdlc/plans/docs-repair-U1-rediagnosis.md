---
kind: re-diagnosis
plan: docs-repair
unit: U1
ticket: "#751"
head: 597b4fba (unit/dr-U1), B = 282fca8d, unit base 5d8b1c30
written: 2026-09-29
measured-at: a throwaway `--shared` clone of `.worktrees/dr-U1` at 597b4fba under the job's tmp dir; `git rev-parse --short HEAD` printed `597b4fba`; the unit worktree was not touched
inputs: `.sdlc/verdicts/docs-repair-U1.md` (pass 1, 🔴), `.sdlc/verdicts/docs-repair-U1-review.md` and `-review-r2.md` at 597b4fba, `.sdlc/handoffs/docs-repair-U1.md` at 597b4fba, the plan at 5d8b1c30, `.sdlc/plans/docs-repair-U3-rediagnosis.md` for shape
---

# U1 re-diagnosis: a behaviour claim copied from a source comment, and no row that reads behaviour

## 1. Root cause

The false sentence at `ui-plan.md:42` (`the Typography and Geometry scenes start fit and do not pan or zoom`) is a transcription of `src/ui/app.js:1439` (`if (id !== "color") this.fit(); // type/geom scenes don't pan/zoom`, with `Type/geom scenes start centered (fit)` at `:1433` to `:1434` above it). The builder's step (1) told it to read `setSection`, and it read the comment as the behaviour. The comment was never true: `git log -S"scenes don't pan/zoom"` finds it born in `34d7159d` (2026-06-27), and in that same commit the Typography canvas already called `this.wirePanZoom(area)` (that tree's `app.js:2567`, under a comment naming the pannable shell the colour ramps use). So this is U3's class again, records copied and not measured, with a code comment as the record: a comment is prose about the code, and prose is checked against the code, never quoted as it.

Why three rounds let it through:

- The plan reads names, not behaviour. U1-2 greps the doc and the source for the same needles (`specimen`, `typeSpecMode`, `renderCompareArea`, ...), which proves every id the doc names exists. It says nothing about what the doc says the ids do. The Risks row reads `U1 writes prose that names an id the code does not have`; the class that bit is `U1 writes prose that says something the code does not do`, and no row measures it. Adapter R10 (a needle is a name, an id or a count, never exact prose) is right about needles, and it is why every U1 row is 🟢 on a file with a false sentence in it: R10 fixes what a row may grep for, not what a row must establish. A negative claim (`do not pan`) has no needle at all, so the needle rows cannot see it.
- Review r1 verified the claim against the same comment. Its `Claims verified correct` list opens with `Typography and Geometry scenes start fit (app.js:1435-1444)`: the reviewer's second derivation reused the builder's source, so it agreed by construction (the independence law in `checks-that-bite`: two legs that share a mechanism are one leg). r1 did catch two false mode claims (F1, F2), both in the section table, both by reading the section files. The pan/zoom sentence sits in the paragraph above the table, anchored on `app.js`, and r1 read `app.js` for it.
- Review r2 re-derived the table, not the paragraph. Its scope was the eight r1 findings plus the section table it rebuilt from source; the sentence at line 42 was in neither, and the r1 `verified correct` line stood as prior evidence. Two 🟢 readings of the same comment do not make a measurement.
- The verifier caught it with a mechanism-distinct leg: it counted `wirePanZoom` call sites in the section files (`typography.js` 2 calls, `geometry.js` 2) and the zoom controls in the headers, and used the non-panning views (`_tokensTableArea`, the Mapping table, `0` calls) as the control. That is the criterion this unit lacked, written down after the fact.

Grade: builder-l3 (sonnet, high) with reviewer-l2 (opus, medium). The level did not cause the miss (r1 at L2 read the section files well enough to find F1 and F2); the missing discipline is procedural, cite code lines and never comment lines, and pass 2 puts it into rows a verifier can run.

The stale comment compounds the risk beyond this unit: `app.js:1433` to `:1434` and `:1439` are the first thing anyone reading `setSection` sees, and `fit()` at `app.js:543` says the reset is top-left inset, `not dead-centered`, so `start centered` is wrong too. §4 rules where that goes.

## 2. Pass 2 brief for the builder

Scope: `docs/reference/references/ui-plan.md` only, plus the handoff. Every plan row U1-1 to U1-6 is 🟢 at 597b4fba and stays 🟢; nothing in §1 (T1 to T13) changes except as F4 says nothing there either. Two commits: commit A carries the doc; commit B carries the handoff, whose Branch field names commit A and whose Ran table is re-run at commit A (P7, F2). The reviewer and verifier run U1-7 and U1-8 first.

### 2.1 The four fixes

| # | Where | Fix |
|---|---|---|
| F1 | `ui-plan.md:42` | Replace `the Typography and Geometry scenes start fit and do not pan or zoom` with `the Typography and Geometry scenes are reset to fit on entry and pan and zoom like Color's (the same wirePanZoom shell); only the Tokens tables, like Color's Mapping table, scroll instead`. Needles the sentence must carry: `wirePanZoom`, `fit`. Anchors: `src/ui/app.js:1439` (the `this.fit()` call, code part), `src/ui/sections/typography.js:351` and `:370`, `src/ui/sections/geometry.js:423` and `:442` (the `this.wirePanZoom(area)` calls), `src/ui/app.js:1755` (`_tokensTableArea`, no call), `src/ui/sections/color.js:882` (the `if (!isTable)` guard on Color's call at `:884`) |
| F2 | `.sdlc/handoffs/docs-repair-U1.md` | Rewritten from a fresh run at commit A: Branch field `unit/dr-U1 @ <commit A>`, every Ran row measured there (P7's `git diff --name-only "$H" HEAD` minus records prints `0`), the `## Claims` table of §2.2 added, the `Left out` row stating that the negative controls of U1-5, U1-7 and U1-8 were run in a clone and what they printed |
| F3 | plan U1-5, control cell | Planner's, applied by the Orchestrator in the revision, row in §3. The builder's part: the handoff quotes the fixed control's two output lines from its own run |
| F4 | `ui-plan.md:47` and `:49` | Color row: `(and skips the Mapping table)` becomes `except in the Mapping view, whose table already shows both modes and renders once` (anchor `src/ui/sections/color.js:870`, the `!isTable` term). Geometry row: `compare labeled All` becomes `compare labeled All when at least one mode exists`, the same words as the Typography row (anchor `src/ui/sections/geometry.js:225`, the `modes.length ?` guard) |

Rule for every sentence the builder touches or keeps: the anchor is a line whose code part contains the needle. `sed -n Np file | sed 's://.*$::'` is the code part. A line that is only a comment, or a trailing comment, is not an anchor; a field initialiser with a comment (`app.js:98` to `:147`) anchors the field name and nothing the comment says about it.

### 2.2 Claim-by-claim re-derivation of Revision B at 597b4fba

Every behaviour sentence in lines 32 to 66 and the four new tasks, read against the tree in the clone. `Verdict` is what the sentence's state is now; `Anchor` is the code line the handoff's `## Claims` row cites (the needle is the backticked text). Where the current anchor is a comment, the row says so and gives the code line to cite instead.

| # | Doc line | Sentence (short) | Needle | Anchor at 597b4fba | Verdict |
|---|---|---|---|---|---|
| C1 | 32 to 33 | one brand-kit document with three composing systems | `geometryScale` | `src/ui/model.mjs:53` and `:57` (`geomScale(..., { typeScale: typeScale(tcfg) ...`) | 🟢 |
| C2 | 39 to 40 | `this.section` takes `color`, `typography`, `geometry` and routes the editor; `renderCenter` picks header and canvas | `this.section === "typography"` | `src/ui/app.js:1643` and `:1649` (`renderCenter`); the field's values are read from `:1643`, `:1649`, `:1536`; `app.js:100` is a comment anchor and is not cited | 🟢 |
| C3 | 40 to 41 | the left and right panes branch on the same field | `renderLeftPane`, `renderRightPane` | `src/ui/app.js:1536` to `:1540`; `:1930` to `:1931` | 🟢 |
| C4 | 41 to 42 | `setSection` stashes the Color pan and zoom on leave and restores on return | `_colorViewport` | `src/ui/app.js:1437` and `:1440` (code part) | 🟢 |
| C5 | 42 | Typography and Geometry scenes start fit | `this.fit()` | `src/ui/app.js:1439` code part (`if (id !== "color") this.fit();`); `fit()` at `:543` | 🟢 (the word is `fit`, not `centered`) |
| C6 | 42 | and do not pan or zoom | `wirePanZoom` | `src/ui/sections/typography.js:351`, `:370`; `src/ui/sections/geometry.js:423`, `:442`; zoom buttons `typography.js:325` to `:327`, `geometry.js:398` to `:400` | 🔴 F1; the only source was the comment at `app.js:1439` |
| C7 | 42 to 43 | each section is a canvas header, a scene with the full dataset, left analysis cards, a right inspector | `renderTypeCanvasHeader`, `renderGeomCanvasHeader` | `src/ui/app.js:1645` to `:1647`, `:1651` to `:1653`; `:1536` to `:1540`; `:1930` to `:1931` | 🟢 |
| C8 | 47 | `canvasView` of Palettes, Scrims, Mapping, Radix | `id: "palettes"` ... `id: "radix"` | `src/ui/sections/color.js:816` to `:819` | 🟢 |
| C9 | 47 | Mapping is the semantic-mapping table, the only table view | `isTable` | `src/ui/sections/color.js:867` (`const isTable = this.canvasView === "mapping"`) | 🟢 |
| C10 | 47 | `colorMode` of `system`, `light`, `dark`, `both` | `colorMode === "both"` | `src/ui/app.js:1520` to `:1522` (all four values read in code), `:2303`; `app.js:98` is a comment anchor | 🟢 |
| C11 | 47 | `both` renders the scene twice side by side through `renderCompareArea` | `_compareColumn` | `src/ui/sections/color.js:870`, `:936`, `:942` to `:943` | 🟢 |
| C12 | 47 | (and skips the Mapping table) | `!isTable` | `src/ui/sections/color.js:870` | 🟡 F4: in Mapping, `both` renders the table once, normally; reword |
| C13 | 47 | inspector palette, global, roles, plus a story tab when the document carries a curated story | `hasStory` | `src/ui/app.js:1932`, `:1940`; `view.story` from `src/ui/model.mjs:1111`; `app.js:94` is a comment anchor for the three tab ids, cite the `tabs` array near `:1936` instead | 🟢 |
| C14 | 48 | `typeSpecMode` segment of `specimen` or `tokens` | `id: "specimen"` | `src/ui/sections/typography.js:310` to `:311` | 🟢 |
| C15 | 48 | `typeMode` base plus each mode, `compare` labeled All when at least one mode exists | `modes.length ?` | `src/ui/sections/typography.js:161`, `:172` | 🟢 |
| C16 | 48 | `typeSegment` of scale, fonts, specimen in `renderTypeInspector` | `id: "scale"` | `src/ui/sections/typography.js:602`, `:607` | 🟢 |
| C17 | 48 | the Specimen view renders each step in the real face | `ensureTypeFonts` | `src/ui/sections/typography.js:603`; segment title at `:310` | 🟢 |
| C18 | 49 | `geomSpecMode` segment of `controls` or `tokens` | `id: "controls"` | `src/ui/sections/geometry.js:383` to `:384` | 🟢 |
| C19 | 49 | `geomMode` base plus each mode, `compare` labeled All | `modes.length ?` | `src/ui/sections/geometry.js:214`, `:225` | 🟡 F4: same guard as Typography, the doc omits `when at least one mode exists` |
| C20 | 49 | `renderGeomInspector` with ramp, `radius`, space | `id: "radius"` | `src/ui/sections/geometry.js:707`, `:710` | 🟢 |
| C21 | 49 | per-step text size composes from the Type scale | `typeScale:` | `src/ui/model.mjs:57`, `:176` | 🟢 |
| C22 | 51 | Compare shows every breakpoint side by side | `_typeCompareColumn`, `_geomCompareColumn` | `src/ui/sections/typography.js:360` to `:368`; `src/ui/sections/geometry.js:432` to `:440` | 🟢 |
| C23 | 51 to 52 | Compare hides the section's whole canvas segment | `=== "compare" ? false` | `src/ui/sections/typography.js:308`; `src/ui/sections/geometry.js:381` | 🟢 |
| C24 | 52 | left analysis cards routed by `renderLeftPane` | `typeAnalysisCards` | `src/ui/app.js:1539` to `:1540` | 🟢 |
| C25 | 55 to 58 | ten colour formats in the listed order; Typography, Geometry, design-system (tokens and DESIGN.md), config; `FORMAT_GROUPS` | `FORMAT_GROUPS` | `src/ui/overlays/drawer.js:38` to `:43` (Colors 10 pairs at `:39`; `tokens.json`, `DESIGN.md` at `:42`; `config` at `:43`) | 🟢 (`Hex` in the drawer, `CSS hex` in the doc; same format, keep) |
| C26 | 60 to 61 | the hub: saved sets as tiles with a search box, then `CATEGORY_INDEX` | `renderHubBody`, `openCategory(c.slug)` | `src/ui/app.js:906`, `:850`, `:675`, `:868` to `:870` | 🟢 |
| C27 | 61 to 62 | `this.category` is a slug or `null` (the hub) | `this.category = slug` | `src/ui/app.js:833`, `:842` (`closeCategory` sets `null`), `:906`; `app.js:75` is a comment anchor | 🟢 |
| C28 | 62 to 63 | that category's volumes load lazily on entry | `_categoryData[slug]` | `src/ui/app.js:832` to `:838` | 🟢 |
| C29 | 63 | a preset opens as an editable copy in your own sets | `openConfigAsSet` | `src/ui/app.js:806` (the tile's `onclick`); `app.js:785` is a comment anchor and the likely source of the sentence | 🟢, re-anchor on `:806` |
| C30 | 63 | Import, project load and New sit in the gallery header | `"Import"`, `"Project"`, `"+ New"` | `src/ui/app.js:901` to `:903` (`themeBtn()` at `:904` is there too; not false, may be added) | 🟢 |
| C31 | 65 to 66 | `colorMode` and the other app preferences persist per app, never with the document | `_appPrefsKey` | `src/ui/app.js:2297`; `grep -c colorMode src/ui/persist.js` prints `0` (the `absent` leg) | 🟢 |
| C32 | 86 | T8: 10 formats (color) plus type, geometry, design-system and config | `"Colors"` | `src/ui/overlays/drawer.js:39` to `:43` | 🟢 (U6 pin (c) needle kept) |
| C33 | 88 to 89 | T10 scale, fonts, specimen; T11 ramp, radius, space | as C16, C20 | `typography.js:607`; `geometry.js:710` | 🟢 |
| C34 | 90 | T12 add or edit breakpoint modes for Typography and Geometry | `addTypeMode`, `addGeomMode` | `src/ui/sections/typography.js:199`, `:210`; `src/ui/sections/geometry.js:254`, `:265` | 🟢 |
| C35 | 91 | T13 all breakpoints (Typography, Geometry) or Light and Dark (Color) side by side | as C11, C22 | `color.js:942` to `:943`; `typography.js:366` to `:368`; `geometry.js:438` to `:440` | 🟢 |

Tally: 32 🟢, 2 🟡 (C12, C19, both F4), 1 🔴 (C6, F1). Five sentences (C2, C10, C13, C27, C29) were anchored, if at all, on comment lines (`app.js:75`, `:94`, `:98`, `:100`, `:785`) and happen to be true; the ledger re-anchors them on code so the next drift of a comment cannot move the doc.

The handoff's `## Claims` table carries one row per line of this table (a claim with several anchors takes one row per anchor, or the anchor of the first call), in the shape U1-8 reads: `| Claim | Needle | Anchor | Kind |`, `Kind` being `present` (the anchor line's code part contains the needle) or `absent` (the file, comments stripped, contains no needle; the Anchor cell is then the bare path). C6 gets four `present` rows and C31 one `absent` row (`colorMode` in `src/ui/persist.js`). The verifier runs U1-8 on that table and reads the two negative controls.

### 2.3 What the reviewer does differently

Reviewer and verifier read the doc sentence by sentence against the ledger and, for each row, against the tree; a row whose anchor they would have chosen differently is a finding even when the check prints `1`. A `Claims verified correct` list in the review cites the code line it read, never a range that contains only comments (`app.js:1431` to `:1434` is such a range).

## 3. Criteria rows

Measured at 597b4fba in the clone. `$F` is the seat's tmp dir; `B=282fca8d`.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-5 (control cell replaced; F3) | unchanged criterion | unchanged | unchanged | in the clone: `printf '\n\x60setSection\x60 is defined at \x60src/ui/app.js:1\x60.\n' >> docs/reference/references/ui-plan.md; node scripts/audit-citations.mjs \| grep -A2 '=== docs/reference/references/ui-plan.md' \| tail -1; bash -c 'set -o pipefail; node test/repo/citations.mjs \| tail -1'; echo "exit $?"` prints a line starting `STALE 1`, then `✗ 1 citation gate failure(s)`, `exit 1`; then `git checkout -- docs/reference/references/ui-plan.md`. The old cell's bare `app.js:1` cite has no anchor and reads `UNDECIDABLE 1`, `exit 0`, which is why it never bit | measured: `    STALE 1 \| NEAR 0 \| UNDECIDABLE 0 \| OK 0 \| NOFILE 0  (line counts, deduped)`, `✗ 1 citation gate failure(s)`, `exit 1` at 597b4fba; tree `0` after the checkout |
| U1-7 | the pan and zoom sentence names the mechanism and denies nothing the section files do | `grep -c -i -E 'do(es)? not pan\|don.t pan\|no pan\|cannot pan' docs/reference/references/ui-plan.md; for f in typography geometry; do grep -c 'this\.wirePanZoom(area)' src/ui/sections/$f.js; done; grep -c 'wirePanZoom' docs/reference/references/ui-plan.md` | `0`, `2`, `2`, `1` or more | the file at 597b4fba prints `1`, `2`, `2`, `0` (the first is line 42; the two `2`s are the calls the sentence denies) | `1`, `2`, `2`, `0` at 597b4fba |
| U1-8 | every behaviour sentence in Revision B and T10 to T13 has a ledger row whose anchor is a code line carrying its needle (or, for an `absent` row, a file free of it), comments stripped | `awk '/^## Claims/,0' .sdlc/handoffs/docs-repair-U1.md \| grep -E '^\| ' \| grep -v -E '^\| (Claim\|---)' > "$F/claims"; [ -s "$F/claims" ] \|\| echo NO-LEDGER; wc -l < "$F/claims" \| tr -d ' '; while IFS='\|' read -r _ claim needle anchor kind _; do n=$(printf '%s' "$needle" \| sed 's/^ *\x60//; s/\x60 *$//'); a=$(printf '%s' "$anchor" \| sed 's/\x60//g; s/ //g'); k=$(printf '%s' "$kind" \| tr -d ' '); f=${a%%:*}; l=${a##*:}; case "$k" in present) c=$(sed -n "${l}p" "$f" \| sed 's://.*$::' \| grep -c -F -- "$n");; absent) c=$(grep -v -E '^[[:space:]]*//' "$f" \| sed 's://.*$::' \| grep -c -F -- "$n"); c=$([ "$c" = 0 ] && echo 1 \|\| echo 0);; *) c=0;; esac; echo "$c $k $a $n"; done < "$F/claims" \| tee "$F/claims.out" \| grep -c '^0 '` | no `NO-LEDGER`; a row count of `35` or more (one per §2.2 row at least; the builder states the count); `0` rows failing. The verifier reads `$F/claims.out` and quotes any `0` line. The `//` strip also cuts a `//` inside a string, which only ever costs a row a false `0`, never a false `1`. BSD sed reads `\x60` outside a bracket expression only, and BSD `tr` not at all, so the backtick strips are written as plain `s/\x60//g` | two, both at 597b4fba. (a) the handoff as committed: prints `NO-LEDGER`, `0`, `0`. (b) a fixture ledger of four rows written the way pass 1 would have anchored the pan claim, `\| ... do not pan or zoom \| \x60wirePanZoom\x60 \| \x60src/ui/sections/typography.js\x60 \| absent \|` and `\| ... do not pan or zoom \| \x60pan/zoom\x60 \| \x60src/ui/app.js:1439\x60 \| present \|` beside two true rows (`this.wirePanZoom(area)` at `typography.js:351`, `typeMode === "compare" ? false` at `typography.js:308`): prints `4`, `2`, and `claims.out` reads `0 absent src/ui/sections/typography.js wirePanZoom` and `0 present src/ui/app.js:1439 pan/zoom`. The comment-anchored row fails because the strip leaves `if (id !== "color") this.fit();`, which carries no `pan/zoom` | (a) `NO-LEDGER`, `0`, `0`; (b) `4`, `2`, the two `0` lines quoted, at 597b4fba |

Permanence. U1-7 is the recurrence guard for this one claim and stays in U1's table. U1-8 is the class guard; it stays in U1's table and, by the same revision, U7 gains it as U7-4 with the path `.sdlc/handoffs/docs-repair-U7.md` and no row minimum stated (U7's tour is shorter), because U7 is the other unit that writes behaviour prose from source, and it reads Revision B as its input. U2's glossary rows name a class or state field per row and are covered by U2-4's needle reads; no ledger there. The generic form (every handoff that writes behaviour prose carries a `## Claims` table, anchors are code lines) belongs beside R10 in the adapter as a rule from the date of ruling, not in this plan: a `/file-task` for `.sdlc/adapter.md`, filed by the Orchestrator when U1 pass 2 verifies, citing this record.

## 4. Ruling on the `app.js:1439` comment (and `:1433` to `:1434`)

Follow-up, not U1's wall and not a new unit of this plan.

- The wall admits `src/ui/app.js` for comment lines only (P4), and the file is U3's (Touches row); U3 is merged at 59925bdc after three passes. A comment edit in `app.js` reaches `figma/plugin/ui.html` (the bundle carries comments; U3's three comment lines moved the KB figure twice), so it re-points `.sdlc/baseline.md`'s `wrote figma/plugin/ui.html` figure, adds a correction paragraph, and moves U3-11's expected `3` and P2's figure. That is a docs unit reopening the build baseline for two comment lines.
- Pass 2 makes the doc independent of the comment (C5, C6 anchor on the `this.fit()` call and the four `wirePanZoom` calls), so the doc no longer inherits the defect, and U1-7 reds if anyone copies the comment back in.
- The comment is still a trap for the next reader. The Orchestrator files it with `/file-task` (`kind:chore`, `lane:docs`) when U1 pass 2 verifies: rewrite `src/ui/app.js:1433` to `:1434` (`start centered (fit)` becomes `are reset to fit (top-left inset, see fit())`) and `:1439` (`type/geom scenes don't pan/zoom` becomes `type/geom scenes get a fresh fit on entry; their pan/zoom is not stashed`), in place, no line added; `npm test` regenerates the bundle; the baseline figure is re-pointed with one correction paragraph; `node test/repo/citations.mjs` stays `STALE 0`. The task cites this record and the verdict's note.

If the Orchestrator would rather close it inside this plan, it is a U3-shaped unit (U8, S, after U1, same rows as U3-9, U3-10's shape on the two lines, U3-11, P2), never a line in U1's brief.

## 5. Revisions row

Written into the plan verbatim:

`| 2026-09-29 | revision: U1 pass 2 from the re-diagnosis at 597b4fba (.sdlc/plans/docs-repair-U1-rediagnosis.md). Root cause: a behaviour sentence copied from a source comment (app.js:1439, false since 34d7159d), and no row that reads behaviour: U1-2 proves the doc's ids exist, not what the doc says they do; review r1 verified the sentence against the same comment and r2 re-derived the table but not the paragraph. U1 gains U1-7 (the pan and zoom sentence names wirePanZoom and denies nothing the section files do) and U1-8 (a Claims ledger in the handoff, one row per behaviour sentence, each anchored on a code line carrying its needle with comments stripped, or on a file free of it); U7 gains U1-8's row as U7-4. U1-5's control becomes an anchored app.js:1 cite appended to the file, which reads STALE 1 and exit 1 (the bare cite read UNDECIDABLE and never bit). Pass 2 is four fixes, two commits: the doc at commit A, the handoff re-run at A. The app.js:1433 to :1439 comments go to a /file-task chore, outside this plan. Grade: builder-l5 (opus, medium), reviewer-l3, verifier-l2 | planner, re-diagnosis of verdict pass 1 at 597b4fba |`

## 6. Builder grade

builder-l5 (opus, medium), reviewer-l3, verifier-l2, the same three seats U3's pass 2 ran on.

Why: the edit is three sentences and a table, but the table is 35 rows of code anchors read with comments stripped, and pass 1's L3 anchored five true sentences and one false one on comments without noticing the difference. Opus at medium reads a line's code part and its comment as two things. Higher buys nothing U1-8 does not force; lower is the seat that just wrote the false sentence.

Dispatch note for the Orchestrator: the dispatch says "every anchor is a code line; a comment is not a source; run U1-8 on your own ledger before the handoff commit and paste `claims.out`", names the two-commit shape, and says the verifier runs U1-7 and U1-8 first.
