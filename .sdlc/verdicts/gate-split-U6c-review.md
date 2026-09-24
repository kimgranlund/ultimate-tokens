# Review: #713 gate-split U6c, pass 1

| Field | Value |
|---|---|
| Seat | gs-U6c-reviewer-l2-p1 |
| Target | `unit/gs-U6c` @ cc540b6c (code 8fc8abf5), base `unit/gs-U6b` @ d40cc5ce |
| Plan | `plan/gate-split:.sdlc/plans/gate-split.md`, revision 13, `### U6c` |
| Verdict | 🟡 FIX-FIRST. Every mechanical criterion reproduces and every control reds. Three small record fixes, no code-behavior change |

Every run was in a `git clone -q --shared` of the unit worktree under `u6c-rev/` in this scratchpad, `git rev-parse HEAD` printed `cc540b6c5ecff4bcaa3584c20ff339cae42e20ac` in each (the pass-count baseline clone printed `d40cc5cead6633842bf76aef73319e878db73381`). Mutations and controls were applied as uncommitted edits on top of that head, `git diff --stat | tail -1` quoted per row. One heavy run at a time: each run was gated by a wait loop on the brief's `pgrep` count at 1 or below. No timing taken (U6c-7, U6c-8 out of scope).

## Criteria

| # | Command (as the plan writes it) | Output | Control | Status |
|---|---|---|---|---|
| U6c-1 | `node test/engine/prime.mjs`, the three greps | `exit 0`, `1`, `1`, `1` | clone C1, `HUE_MULT` to `FULL ? 1 : 10` (`1 file changed, 1 insertion(+), 1 deletion(-)`): `exit 1`, one gate row `FAIL  gamut-ceiling  — negative control: the vulnerable shared-cache reconstruction measured 0 violations on this sweep ...` | 🟢 |
| U6c-2 | `npm run -s gate:sweep-prime`, the four greps | `exit 0`, `26`, `1`, `1`, `1`; `PASS: prime-system clears all AC-050 gates` | same command at d40cc5ce: `exit 0`, `26`, `1`, `1`, `1`, and the 26 `  pass  ` rows diff identical to the unit head's | 🟢 (26 is right, see Q1) |
| U6c-3 | M-B clone (`1 file changed, 2 insertions(+), 2 deletions(-)`), `node test/engine/prime.mjs`, the greps | `exit 1`, `1`, `1`; `2/200 palettes shifted hex by call order`, `73/30240 out-of-gamut rungs exceeds the pinned ceiling of 0`; gate rows `FAIL  c`, `FAIL  gamut-ceiling`, then `FAIL: 2 gate failure(s)` | U6c-1 is the unmutated run: `0/200`, no ceiling FAIL | 🟢 |
| U6c-4 | `node test/ui/headless-boot.mjs`, the three greps | `exit 0`, `1`, `1`, `1` | clone C4a, stride over corpus and kit together (the plan's name-keyed probe, restated for the new structure): line reads `stride 4, 79 anchored palettes checked of 316, default kit whole`, needle count `0`. Clone C4b, `corpusFloor` back to 300: `exit 1`, `✗ (rst-corpus-setup) ... (91 palettes, want > 300)` | 🟢 |
| U6c-5 | M-D clone (`1 file changed, 1 insertion(+), 1 deletion(-)`), the greps | `exit 1`, `4`, `1`; `(rst-corpus) 91 of 91 anchored palettes failed the exact-snapshot field round trip`, `(rst-corpus-ramp) 91 of 91 ...` | U6c-4 is the unmutated run | 🟢 |
| U6c-6 | `npm run -s gate:corpus-reset`, the three greps | `exit 0`, `1`, `0`, `1` | U5-3's line-range clause: every U6c hunk (`4075 4086 4128 4130 4134`) sits inside `[A=4051, Z=4140]`, outside count `0` against `unit/gs-U6b`; against the plan fork point the count is `3` at both d40cc5ce and cc540b6c, so U6c adds none (the third is U6b's main merge, per M5) | 🟢 (handoff omits the clause, F2) |
| U6c-7, U6c-8 | not graded, per brief | | | deferred |

## Brief items

| # | Item | Evidence | Status |
|---|---|---|---|
| Q1 | FULL pass count 26 or 21 | The grep `^  pass  ` counts the `gateReport` rows plus four symmetry and ladder-span lines that print their own `  pass  ` prefix (`test/engine/prime.mjs:1139` twice, `:1178`, `:1198`). At c8823976 `DECLARED` holds 21 names and the symmetry block does not exist: 21. #681 (8ba4bee4, merged into U6b at 8ff163bd) added one declared gate (22 names) and the symmetry block's four extra lines: 22 plus 4. Measured 26 at d40cc5ce and at cc540b6c, identical rows. The builder is right; the plan's `21` is stale text, but the plan itself says "re-observed ... and cited", so re-citing is what it asked for, not a defect in the unit | 🟢 |
| Q2 | FULL legs unchanged | U6c-2 and U6c-6 above; FULL takes `corpusAnchoredEntries` whole plus the kit, same set and order as the old nested loop | 🟢 |
| Q3 | SAMPLED coverage line states what is given up | `(rst-corpus SAMPLED: stride 4, 91 anchored palettes checked of 316, default kit whole)` names kept of total; prime's mode line names 200 and 500 | 🟢, with F3 |
| Q4 | Diff limited to `prime.mjs`, `headless-boot.mjs`, the handoff | `git diff --stat unit/gs-U6b..HEAD`: those 3 files. P9 with `BASE=04f95ff0`: 1 line, `.claude/CLAUDE.md`, inherited from U6b (present at d40cc5ce), cleared by `Q2=yes`; `-- src` `0` | 🟢 |
| Q5 | No em dash outside backticks, no bold inline labels | P8 filter against `04f95ff0`: `0`; against `unit/gs-U6b`: `0`; `**` in added lines `0`; branding `clean (665 files scanned)` at cc540b6c, `664` at 8fc8abf5 (the handoff's figure; the handoff file is the 665th) | 🟢 |
| Q6 | Quotes byte for byte | Every needle and quoted line in the handoff matched a log line byte for byte (checked against `ps.log`, `psb.log`, `hs.log`, `hsd.log`, `pf.log`, `hf.log`) | 🟢 |

## Findings

| Sev | # | Finding | Fix |
|---|---|---|---|
| 🟡 Medium | F1 | The new comment at `test/ui/headless-boot.mjs` (above `RESET_STRIDE`) gives the wrong mechanism: "the spread `...dkDoc` after `name: "default kit"` overwrites the name field on every other preset that happens to carry one". The spread only touches the kit's own object literal: `defaultDocument().name` is `"Default"` (measured), so the kit's `preset.name` becomes `"Default"` and a skip on `=== "default kit"` matches nothing, which is why the probe strided the kit. The handoff repeats the error ("overwrites the name field on whatever a category preset happens to carry"). A future reader trusting the comment would look for a bug in the category presets | Reword both to: the `...dkDoc` spread after `name: "default kit"` replaces that name with `defaultDocument().name` (`"Default"`), so a name-keyed skip never matches the kit |
| 🟡 Low | F2 | Two plan asks are not in the handoff. (a) The plan's "what the canary gives up" paragraph: "the builder prints how many documents contribute none and cites it". Not printed, not cited. Measured by this seat in a probe clone: 35 sampled documents, 30 with anchored palettes, all 30 still contribute at least one after the stride, 0 lose coverage; the 5 that contribute none have no anchored palettes in either mode. (b) U6c-6's second clause (U5-3's line-range count) has no row in the handoff; measured above, 0 new outside hunks | Cite both figures in the handoff (a print line is optional if the plan owner accepts a citation; the plan wording says print) |
| ⚪ Nit | F3 | `default kit whole` in the SAMPLED line is a literal, asserted by nothing: control C4a strided the kit and the line still said `default kit whole` (only the `91` needle caught it). Not a plan requirement | Optional: derive the phrase from `defaultKitEntries.length` kept, or leave; the 91 needle is the guard |
| ⚪ Nit | F4 | Loop body under `for (const { preset, pal } of resetEntries)` kept its old two-level indentation (6 spaces under a 2-space `for`) | Optional reindent; behavior unaffected |

The plan's `21` in U6c-2's Expected cell is stale against every head after #681's merge; the plan owner may want a revision note, not a unit change.
