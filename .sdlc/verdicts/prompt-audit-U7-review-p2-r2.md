PASS: prompt-audit U7 (#758), pass 2 review round 2. Review p2 had four findings. F2, the Medium one, is closed: every key list the MCP foundations file states now matches a fresh `brandKit(defaultDocument())` dump, and the resolvers are named as `brandKit` calls them. The two plan Lows (U7-8's SC29 needle, U7-9's line-pinned control) are fixed at `e50b99b3`. The fourth, the §5 test-pin sentence, is recorded as a U9 item. No new findings.

Reviewer: reviewer-l3 (Opus 5.5, high), the same seat as review p2, standing in for reviewer-l4 while fable is capped (ruling seat-reliability-approval, `b9044bb`). Worktree `.worktrees/pa-U7`, branch `unit/pa-U7`, head `e9ba254f` (skill fix `794f7342`; review p2 record at `cbbd0b8a`). Criteria: U7-8 and U7-9 from `.sdlc/plans/prompt-audit.md` at `e50b99b3`, the rest as in review p2. Since `cbbd0b8a` the diff touches two files: `maintaining-brand-kit-mcp/references/foundations.md` and the handoff. No source was edited. `npm test` was not re-run: the change is Markdown only, the builder records it green at `794f7342`, and review p2 ran it green in a clean clone at `c547d584`.

## Review p2 findings

| # | Round 1 | Round 2 | Evidence | Negative control |
|---|---|---|---|---|
| 1 | 🟡 the shape block and §5 miss `singleLineHeight` and palette `group`/`prime`, name `typeScale`/`geometryScale` for resolvers `brandKit` does not call, and the handoff says every key list matches | 🟢 closed | Fresh dump from the head, with each list checked against the file text. Top level `$schema,name,generator,icons,motion,constants,controls,stops,palettes,roles,type,geometry`. Palette `name,slug,key,group,ramp,prime`; prime keys `brightest,brighter,bright,prime,dim,dimmer,dimmest`, each `hex,oklch`; ramp cell `stop,hex`. 16 palettes × 53 roles. Type `treatment,label,fonts,roleOf,categories,weights`, 15 voices. `singleLineHeight` appears only on `Kicker`, `UI-control` and `UI-widget` and equals `size` on every one of those steps. Geometry has the 15 listed keys, and `typed` is absent. The `MD` row and the radii match §5. The new Note checks out against `src/ui/model.mjs`: 742 and 743 call `typeScaleFor(doc, "base")` and `geomScaleFor(doc, "base")`, 158 to 163 wrap the engine's `typeScale`, 169 to 177 run `geomScale` with `{ typeScale: typeScaleFor(doc, modeKey) }`, and `geometryScale` (53) is not called by `brandKit`; its one caller is `test/ui/headless-boot.mjs` 2678. The handoff's F2 row now says round 1's claim went unchecked and gives the key-diff command | at `c547d584` the palettes line has no `group`, and the step shape has no `singleLineHeight` (review p2) |
| 2 | Low (plan): U7-8's SC29 needle could not fail | 🟢 closed at `e50b99b3` | the needle is `build · test`: the tree prints `0` | `1` at `f6cd69cb` and at B `13346c1a`; `0` at 8e8aa3ad |
| 3 | Low (plan): U7-9's control pinned line 19 | 🟢 closed at `e50b99b3` | the control appends ` typed:true` to any line of the shape block | appended at lines 18, 19 and 21 of the head file: `1` each; the plan's own `sed '18s/$/ typed:true/'` on the file at c547d584: `1` |
| 4 | Low: §5 says the test pins `font` equal to the UI-control size; the test pins `=== 15` | 🟢 routed | the handoff's Questions section names it a U9 item; the values match at the defaults | none needed |

## Criteria re-run at `e9ba254f`

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U7-8 | 🟢 | tree `0 0 1 0 6 0 1`; the seven row greps `1` each; `SC31.*not in scope` `0` | SC31 moved to `left out, Low` in a copy: its applied grep prints `0`; the SC29 needle is `1` at the unit base (controls above) |
| U7-9 | 🟢 | `0`, `0`, `1`, `15 false`; the criterion text holds by the key comparison in row 1 | `typed:true` appended to any shape line prints `1`; the file at 8e8aa3ad prints `2` |
| U7-7 | 🟢 | `1`, `1`, then nothing (the handoff changed, so it was re-run) | review p2's swap fixture |
| P3 | 🟢 | `em-dash: clean (820 files scanned)`, `branding: clean (812 files scanned)`, added U+2014 over the U7 skill diff from B `0` | pass 1 record |
| P5 | 🟢 | SC1 to SC27 each `1`; ERE count `27` | pass 1 record |

verdict: 🟢
