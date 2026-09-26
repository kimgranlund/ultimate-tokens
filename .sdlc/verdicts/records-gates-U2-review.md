FAIL

# records-gates U2 review (#742)

Unit worktree `.worktrees/rc-U2`, branch `unit/rc-U2` at `e6ee37e0`, base `634d94cf`. Diff read via
`git -C .worktrees/rc-U2 diff 634d94cf e6ee37e0`.

## Q2 confirmed

`.sdlc/questions/records-gates-approval.md:17` records the owner ruling: "Q2 ADR-026/027 headings
to a colon" among the questions answered as recommended, and the board row for U2
(`.sdlc/board.md:101`) already carries "verifier-l1 only if Q2 is yes (a file outside `.sdlc/`
changes)". The handoff's own "Q2 answer applied: Yes" statement matches the plan's own record, so
the verifier-l1 pass this unit is routed to is correctly triggered.

## Findings

### Critical: the em-dash gate reds on this unit's own new file

`node test/repo/em-dash.mjs` run directly against the unit worktree exits `1`:

```
self-test: PASS
  ✗ .sdlc/handoffs/records-gates-U2.md:65
  ✗ .sdlc/handoffs/records-gates-U2.md:89
  ✗ .sdlc/handoffs/records-gates-U2.md:106
  ✗ .sdlc/handoffs/records-gates-U2.md:109

FAIL: 4 em dashes outside inline code spans in 1 files
```

`test/repo/em-dash.mjs` is registered in `npm test`'s `TESTS` (`test/run.mjs:18`), so this is a
live `npm test` red, not a style nit. Reading each line confirms these are plain prose dashes used
as a clause join, not a verbatim quoted program line and not inside a backtick span (the one
quote that legitimately carries the old glyph, at `.sdlc/handoffs/records-gates-U2.md:22`, sits
inside backticks and is correctly not flagged):

- `.sdlc/handoffs/records-gates-U2.md:65`: `read at G0/measured-at): "2, 3, 0, 0, 1, 0" — confirmed by reading the file before editing.`
- `.sdlc/handoffs/records-gates-U2.md:89`: ``("and, after U1, `exit 1`") — the count-side assertion is what this row grades and it matches.``
- `.sdlc/handoffs/records-gates-U2.md:106`: `... this needs verifier-l1, not just reviewer-l1 — the Orchestrator should route it there.`
- `.sdlc/handoffs/records-gates-U2.md:109`: `... their count without exiting nonzero. That's U1's own unit, not a gap here — U2-3's control notes the dependency explicitly.`

This is a direct violation of the plan's own prose rule ("No em dash anywhere ... this one and
every verdict U3 touches included") and of the standing house rule in `.claude/CLAUDE.md`
("No U+2014 anywhere in the tree"). It is also a false record: the handoff's own "Ran" section
claims `em-dash: clean (794 files scanned), exit 0`, which does not match a direct run against
this same tree. Fix: rewrite those four sentences to avoid the glyph (comma, colon, or a period
and new sentence, per the tool's own replacement conventions) and re-verify with a fresh run of
`node test/repo/em-dash.mjs` before re-submitting.

## What holds

- Diff footprint is exactly three files: `.sdlc/adapter.md` (§6 only), the new
  `.sdlc/handoffs/records-gates-U2.md`, and `docs/reference/references/decision-records.md`
  (the ADR-026 and ADR-027 heading lines only, confirmed by `git diff --numstat` reading `2 2`
  for that file). All are inside U2's Touches list and the plan's scope wall.
- §6's rewrite is heading-shape and append-rule only: the rule sentence drops the em-dash glyph
  and the fixed `ADR-022` append point for the colon shape and "after the last ADR"; the
  `ADR-023`/`ADR-024` stub rows are reworded off `after ADR-022` per the plan's design, with their
  quoted heading text moved to the colon shape to match what the file already carries there. No
  ADR body content (Context/Decision/Rationale/Consequences/Status) was touched, so the
  append-only rule for an accepted ADR is intact; the new dated amendment paragraph is additive,
  matching the adapter's own amendment convention.
- `decision-records.md` changes are exactly the two heading separator characters (`-` to `:`) on
  ADR-026 and ADR-027, confirmed by direct diff read; no other line moved, so the card
  Source-range check is unaffected by construction (line count unchanged).
- Reran the criteria with negative controls in a scratch clone under `/private/tmp/claude-501/`:
  - U2-1 (§6 no longer says "after ADR-022", carries no glyph, names the colon shape and the
    append rule): on the unit tree, `0, 0, 1, 1, 0, 1` (matches expected `0,0,1+,1+,0,1+`); on a
    clone of `634d94cf` (pre-edit), `2, 3, 0, 0, 1, 0` (matches the plan's stated "Today" row).
  - U2-2 (heading shape agreement): on the unit tree, `27, 27, 0` (Q2 yes shape); reverting just
    ADR-026's heading back to the hyphen in a scratch copy reproduces `26, 1` on the second and
    third counts, matching the plan's stated negative control.
  - U2-3 (no card range moved, amendment check stays green): `range mismatches: 0` exit 0,
    `stale total: 0` exit 0, `git diff --numstat` for `decision-records.md` reads `2 2`.
- Branding scan: no retired-brand or pre-rename identifier text was added by this diff.
- Scope wall: `git diff --name-only 634d94cf e6ee37e0` lists only the three files above; nothing
  under `src/`, `scripts/`, `figma/`, `mcp/`, no other `.sdlc/checks/` script, no other verdict
  file touched.

## Recommendation

Send back to the builder to remove the four em dashes from
`.sdlc/handoffs/records-gates-U2.md` and rerun `node test/repo/em-dash.mjs` (and `npm test`) clean
before this unit is treated as reviewed. Everything else in the diff (the adapter §6 rewrite, the
ADR-026/027 heading normalization, the scope wall, the criteria reruns) holds up under a fresh
read with negative controls.

verdict: 🔴
