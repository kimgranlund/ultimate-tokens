# Verdict adopt-hygiene-U5 · review

| Field | Value |
|---|---|
| Unit | U5 drop the drill-only setting |
| Branch | `unit/hygiene-U5` @ `ed565dd`, base `806bc03` |
| Reviewer | fresh-context, this record |
| Verdict | 🟢 clear |
| Blocking | 0 |

## Criteria (plan `.sdlc/plans/adopt-hygiene.md` §U5)

| # | Criterion | Result | Negative control |
|---|---|---|---|
| 1 | committed settings carry no `worktree` block; everything else unchanged | `true`, `0` 🟢 | at `39b78dc`: `false`, `1` 🟢 (matches) |
| 2 | valid JSON, plugin flags from f9e20c5 kept | `true false` 🟢 | trailing comma planted on a scratch copy: `SyntaxError`, restored 🟢 |
| 3 | `npm test` green, tree clean | 🟢 see below | none |

### Criterion 3 detail

`node test/repo/branding.mjs` on the `unit/hygiene-U5` head (`ed565dd`) alone shows **2**
violations, both in `.sdlc/verdicts/adopt-hygiene-U1-review.md`, the known, already-diagnosed
U1 P4 issue, fixed on `unit/hygiene-U4` @ `8ebf172` and now merged into `sdlc/adopt` @ `9fbb601`.
Nothing in U5's own files (`.claude/settings.json`, `.sdlc/handoffs/adopt-hygiene-U5.md`) trips
the gate.

Combined-tree probe: detached worktree at `ed565dd` merged with `sdlc/adopt` (`--no-commit
--no-ff`), full `npm test` run, worktree removed after.

```
✓ all 44 test files passed
```

`git status --porcelain` empty on `unit/hygiene-U5`.

## Diff shape (control)

`git diff 806bc03 --stat` on `unit/hygiene-U5`:

```
.claude/settings.json              |  3 ---
.sdlc/handoffs/adopt-hygiene-U5.md | 41 ++++++++++++++++++++++++++++++++++++++
```

`.claude/settings.json` diff is exactly the `worktree: { bgIsolation: "none" }` block removed;
surrounding keys (`enabledPlugins`, `extraKnownMarketplaces`) unchanged, key order preserved.

## Pass 1 re-review (this record)

Pass 0's record itself quoted the retired brand strings verbatim while describing the
`.sdlc/handoffs/adopt-hygiene-U5.md` violation it had found, and so failed the same branding gate
it was reporting on, it has been reworded here to describe the finding without repeating the
retired strings.

Pass 0 also flagged that unit `unit/hygiene-U4` (fixing the `.sdlc/verdicts/adopt-hygiene-U1-review.md`
row) had not yet merged, so criterion 3 on U5 alone read as 4 violations across two files. Since
then: `fe89fc9` reworded the two lines in the U5 handoff that had quoted the retired brand strings,
`ed565dd` recorded the combined-tree verification, and `unit/hygiene-U4` merged into `sdlc/adopt`
(now at `9fbb601`). All three criteria are green on this pass with no blocking findings.

## Retest

None outstanding.
