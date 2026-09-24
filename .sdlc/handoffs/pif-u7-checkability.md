# U7 criteria checkability review

Target: `## U7 criteria (verifier-checkable)` in `.sdlc/plans/preset-intent-fidelity.md` at commit
1417e480 (plan branch `plan/preset-intent-fidelity`). Checkability only; nothing built yet, no build
graded. Verification ran against `the lane plan worktree`,
confirmed a clean descendant of the planner's 0391f045 measurement point (only two doc/ruling commits
sit on top, no code diff). No files were edited; no `npm test`, `--full`, or `gate:*` sweep was run;
`node test/engine/prime.mjs` was skipped per the host contention guard (the `pgrep` check kept reading
3, though inspection showed those three hits are unrelated shell wait-loops in other projects, not
real test runs, the rule was still honored literally).

| # | Runnable | Control can fail | R10 | State | Evidence |
|---|---|---|---|---|---|
| U7-P1 | `npm test 2>&1 \| tail -1; perl -0ne '...' test/run.mjs; git status --short \| wc -l` | yes, real gate | ok | 🟢 | perl one-liner reproduced `49` exactly. `test/engine/semantic.mjs` deep-equals `semanticRoles` against `role-table.json`, so corrupting the file in the clone is a genuine break, not vacuous. |
| U7-P2 | `node test/repo/branding.mjs \| tail -1; echo "exit $?"` | yes | ok | 🟢 | Ran clean: `branding: clean (552 files scanned)`, exit 0, plan's own "today" figure says 551, one file of drift since 0391f045 (repo keeps growing); the row itself uses N, not a pinned number, so this doesn't touch checkability. |
| U7-P3 | `git diff $UB -- . ... \| perl -CSD -ne '...' \| wc -l` | yes, and proven non-vacuous | ok | 🟢 | Reproduced both readings exactly: `1` with `-CSD`, `0` without, on the same probe line. The row's own command carries `-CSD`, confirmed present, so the row does not ship the vacuous form. |
| U7-P4 | `git diff --name-only $UB` | plausible | ok | 🟢 | Syntactically sound; from inside the plan branch today `$UB` resolves to HEAD itself (0 files), matching the row's own "not applicable before the unit exists." Cannot be exercised meaningfully pre-unit, which the row already says. |
| U7-P5 | `sh .sdlc/checks/baseline-agrees-check.sh \| tail -1; node .sdlc/checks/ceiling-counts-check.mjs \| tail -1` | yes | ok | 🟢 | Ran both: `stale total: 0`, `ceiling-counts: clean`, both exit 0, matches. `baseline-agrees-check.sh` really does assert `git merge-base --is-ancestor $ref origin/main`, so the negative control (a ref outside that history) is real. |
| U7-1 | `node test/engine/prime.mjs 2>&1 \| grep -i symmetry` | design matches a proven pattern | ok | 🟢 | Not runnable today (corpus leg doesn't exist yet, expected, nothing built). Statically confirmed `ORDER_ALLOW` in `test/engine/anchor.mjs` has exactly 26 entries, and the 3 "worst" names the row cites (Suspiria tertiary-muted, Black metal secondary, Night of the Hunter tertiary) are members of that list. The proposed by-name-frozen-list check mirrors `anchor.mjs`'s own order-allow-list gate (lines 366-375), which already discriminates a drop from a swap in production code today, not a new, unproven shape. |
| U7-2 | same command | yes, independent fixture | ok | 🟢 | `test/engine/fixtures/prime-pre-681.mjs` exists and exports its own independent `primeSwatches`, a genuinely different construction, so the "1,816 exceptions" control is not vacuous by construction. |
| U7-3 | `node test/engine/prime.mjs 2>&1 \| grep -ci order_allow` | yes, cross-file set-equality | ok | 🟢 | `order_allow` doesn't appear in `prime.mjs` today (0), confirming this is forward-only as expected. The described check (two independently-frozen lists in two files compared by name) is a real cross-file consistency check, not vacuous. |
| U7-4 | `node test/engine/prime.mjs 2>&1 \| grep -i span` | yes, dual controls | ok | 🟢 | Two independent negative controls (the pre-#681 fixture reads `0`; moving the threshold moves the count), not vacuous. |
| U7-5 | `awk '/^- C11 /,/^- C12 /' ... \| grep -c 364` | yes | ok | 🟢 | Reproduced exactly: `0` today. Discriminates a fixed prose edit from its absence. |
| U7-6 | `grep -c '#725' ...; grep -c '#701' ...; gh issue view 725 --json state,title` | yes | ok | 🟢 | Reproduced exactly: `#725` 0/0, `#701` 1 (decision-records) / 2 (CHANGELOG). Live `gh issue view 725` confirms `OPEN`, `kind:bug`, `size:big`, title naming perceptual and peak. |
| U7-7 | `awk '/^- C6 /,/^- C7 /' ... \| grep -c '#725'` | yes | ok | 🟢 | Reproduced exactly: `0` today. |
| U7-8 | `node test/engine/anchor.mjs 2>&1 \| grep -i key-anchor` | yes | ok | 🟢 | `key-anchor` absent from `anchor.mjs` today (0), confirming forward-only. The cited figures (3,062 over 5 L*, 1,570 over 20 L*, max 82.9 L* on "Hidaka coast" tertiary-muted) are not new claims, they reuse the plan's own already-measured baseline-(1) numbers verbatim, so nothing here needed re-derivation. |
| U7-9 | node one-liner over `brandKit`/MCP summary | yes | ok | 🟢 | Well-formed, checks two independent consumer surfaces; hex values cited match the anchor set already established in the plan, `brandKit` and the palettes summary in `mcp/brand-kit-core.mjs`. |
| U7-10 | `node test/ui/headless-boot.mjs 2>&1 \| tail -3` | yes, proven precisely | ok | 🟢 | Statically confirmed the row's central claim byte-for-byte: `seedFromKey` (`src/ui/sections/color.js:1943-1948`) commits `hue`/`chroma` only, calls neither `detachSnapshot` nor `delete ...anchor`, exactly as the row states. (Live run of the file itself timed out under host load in the background; not needed, the static read settles the claim.) |
| U7-11 | `node .sdlc/checks/ceiling-counts-check.mjs; echo "exit $?"` | **the important one, see below** | ok | 🟡 | See the detailed note below on `.sdlc/checks/ceiling-counts-check.mjs` |
| U7-12 | two `grep -oE` reads | yes | ok | 🟢 | Reproduced exactly: doc reads `4`, `persist.js` reads `6`. |
| U7-13 | `npm run gen:preview >/dev/null; git status --short` | yes | ok | 🟢 | Not re-run (would have written to the shared read-only lane's `docs/img/palette-preview.svg`, which the dispatch said not to touch). Trusted the planner's own already-stated evidence (283/283 diff, restored, clean). Command shape is sound and the control is a real diff check. |
| U7-14 | `grep -c identity-control ...; grep -c "pending U4" ...` | yes | borderline, judged ok | 🟢 | Reproduced exactly: `0` and `38`. `"pending U4"` is a short code-comment marker/tag, not a narrative-prose citation, read as an id under R10, not a banned needle, but it's the closest thing to a borderline call in the set. |

## U7-11 in detail (the row that matters most)

Ran `node .sdlc/checks/ceiling-counts-check.mjs` live: **11 `ok` lines**, exit 0,
`partition: 19 = 2 graded + 14 explicit + 3 unsupportable`, matches the row's stated "today" reading
exactly.

Read the script (`.sdlc/checks/ceiling-counts-check.mjs`) to test the row's own diagnosis. Both flagged
assertions are genuinely vacuous by construction, confirmed from the source, not just asserted:

- `"above + inside == total"` (line 69): `above` and `inside` are defined as `rows.filter(wall > BAND_TOP)`
  and `rows.filter(wall <= BAND_TOP)`, a mutually exclusive, exhaustive partition of the same `rows`
  array by construction. `above.length + inside.length === rows.length` holds for *any* parseable data;
  no corruption of `.sdlc/baseline.md` can red it.
- `"PARTITION graded + explicit + unsupportable == total"` (line 79): `graded` and `unsupportable` are
  disjoint by their filter conditions (one requires `!statesNoStart`, the other requires `statesNoStart`),
  and `explicit` is defined as `rows` minus both. The three-way sum is `rows.length` by algebra, always,
  for any input.

So U7-11's diagnosis is correct, and it targets exactly the two assertions the review found. Fixing them
(remove, or rewrite so each part reads from prose independently rather than re-partitioning the same
`rows` array) is the right, sufficient fix.

**Judgment call (a), asked by the dispatch**: is handing the verifier "reproduce at least three of the
handoff's named reds" checkable enough? Yes, but it's the one row here that isn't a single command , 
call it 🟡, not 🔴. It's bounded (the handoff must name one edit per *surviving* assertion, a fully
enumerable, small set, and the verifier only samples three), and the object being checked is concrete
(does a stated edit to `.sdlc/baseline.md` in a throwaway clone red the assertion). That's materially
different from a vague "trust the fix," but it costs more verifier effort than every other row in this
table, which are all one command each.

## Judgment call (b)

Confirmed directly: U7-P3's command in the plan carries `perl -CSD -ne '...'`. Without `-CSD`, the
identical probe line prints `0` (proven above), the flagless form is vacuous on real diff text
containing a multi-byte em dash, and the row does not ship that form.

## R10 scan

Grepped the 19 rows' commands and expected-reading cells for `file.ext:NNN` line-number citations , 
none found. Every needle in every command is a function/constant name, an id (`#725`, `ORDER_ALLOW`,
`CURRENT_SCHEMA_VERSION`), a count (`364`, `26`, `49`), or a short code-comment tag (`"pending U4"`,
borderline but not prose). No row pins an exact line number or a quoted sentence of prose as its needle.

## Summary

19/19 checkable; 0 🔴; 1 🟡 (U7-11, for the reasons above, its command and diagnosis are solid, its
negative control just costs more than the others'). Every "today" reading I could reproduce without a
full corpus sweep matched the plan's stated figure exactly (49, 552≈551, 1/0 on the em-dash probe, 0/0
and 1/2 on #725/#701, gh issue state, 0 on C6/C11 greps, 4/6 on schema version, 0/38 on identity-control
and pending-U4, 11 ok lines and the 19=2+14+3 partition, and, critically, the two flagged
ceiling-counts assertions independently confirmed vacuous by construction from source). The
harder-to-check counts (22, 26-corpus-derived, 364, 3,062, 3,380) were not re-derived from a live corpus
sweep, since that sweep is exactly what the host contention guard blocks; instead they were
cross-checked statically wherever a static check exists (ORDER_ALLOW's 26 entries and member names
match; the 3,062/82.9 figures are reused verbatim from the plan's own already-measured baseline-(1)
table rather than being new claims).
