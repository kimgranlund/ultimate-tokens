# Handoff U6a (gate-split, #713) · builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U6a @ (see Head sha below, after commit) |
| Files | .github/workflows/ci.yml |
| G0 | waived for U6a per question 7 (`.sdlc/questions/gate-split-approval.md`). Ran anyway: `128`, `0`, `OPEN`, `128`, matching the plan's recorded "Today" row exactly |

## What was built

One new job `sweeps` in `.github/workflows/ci.yml`, inserted between `corpus-contrast` and `deploy`: a matrix over the five gate script names (`gate:corpus-tonal`, `gate:corpus-anchor`, `gate:sweep-prime`, `gate:corpus-reset`, `gate:corpus-contrast`), own runner, `fail-fast: false`, no `needs:`, no `npm ci`, no `if:` or `continue-on-error:` on any leg, one step `npm run ${{ matrix.gate }}`. It runs on the workflow's existing `on:` block (`pull_request` and `push` to main).

## P4, the shape check (exact command from the plan)

```
corpus-tonal 1
corpus-anchor 1
sweep-prime 1
corpus-reset 1
2
1
0
1
1
```

Matches expected exactly: each gate `1` or more, then `1` or more (`corpus-contrast` appears twice: once in the matrix list, once in its own job's run line), `1` (the job name line), `0` (no `if:`/`continue-on-error:`/`needs:` inside the block), `1` (`fail-fast: false`), `1` (`pull_request:`).

## U6-2, matrix vs package.json

`same 5` (ran verbatim from the plan). Negative control fired in a throwaway clone under the scratchpad (`git clone -q --shared`, added an extra `gate:` script not named in CI): prints `DIFFER 1`. Clone removed after.

## YAML parses

Used `python3 -c 'import yaml; yaml.safe_load(...)'` (PyYAML is present on this host; ruby/yaml was not tried since python3's worked). Printed `YAML PARSES OK`.

## The two facts, recorded and not fixed

1. Fact 1 (sequencing). `gate:corpus-anchor` needs `test/engine/anchor.mjs`, which does not exist on this branch yet (confirmed by G0 itself: `128` on both `origin/main` and `plan/gate-split`). Running it locally: `MODULE_NOT_FOUND`, exit 1. `gate:corpus-tonal` and `gate:sweep-prime` pass `--full` to files U2/U4 have not yet taught to read that flag, so today they just run their existing (non-full) suite: both exited 0 locally. `gate:corpus-reset` (`test/ui/headless-boot.mjs --full`) is in the same position: the file exists pre-#681 and the `--full`-reading `(rst-corpus)` block arrives with #681, so it also ran its existing suite and exited 0.
   Correction against the brief's own expectation: the brief said "the two that exit non-zero today are the ones fact 1 names." Measured today, only **one** leg exits non-zero locally: `gate:corpus-anchor` (exit 1, missing file). `gate:corpus-tonal`, `gate:sweep-prime` and `gate:corpus-reset` all exited 0 locally, because an ignored `--full` flag is not a failure, it is silently-reduced coverage. This is the fact worth writing down for the reviewer/verifier: the `sweeps` job's CI-conclusion redness this plan calls "expected sequencing" comes from exactly one leg today (`corpus-anchor`), not three, until #681 lands and U2/U4 also start reading `--full`. No skip, soft-fail, or conditional was added to any leg; P4 forbids exactly that, and none is present.
2. U6-8 (P10, the wall budget) reads a completed run on a draft PR of `plan/gate-split`. This unit never pushes (branch is local-only, no PR exists), so U6-8 is not measurable here. Recorded as pre-land only, for that reason, per the brief.

## Local exit codes, all five gate scripts, run once each, no timing

| script | exit |
|---|---|
| `gate:corpus-tonal` | 0 |
| `gate:corpus-anchor` | 1 (MODULE_NOT_FOUND: `test/engine/anchor.mjs` absent, arrives with #681) |
| `gate:sweep-prime` | 0 |
| `gate:corpus-reset` | 0 |
| `gate:corpus-contrast` | 0 |

No third non-zero exit occurred; only `gate:corpus-anchor` did, contrary to the brief's stated expectation of two (see fact 1 correction above).

## Scope wall

`git status --short` / `git diff --stat` after the edit: only `.github/workflows/ci.yml` changed, 27 insertions, 0 deletions.

## Measure after (commands run against the committed tree, post-commit)

- P4 full command: as above, all values matched.
- U6-2: `same 5`, control `DIFFER 1`.
- Scope wall: `.github/workflows/ci.yml` only.
- `npm test`: see result below.
- `node test/repo/branding.mjs`: see result below.

## Left out / not built

- U6-8 (P10 wall budget): not measurable in this unit, no PR exists (see fact 2).
- No change to `test/engine/anchor.mjs`, `tonal.mjs`, `prime.mjs`, `headless-boot.mjs`, or `package.json`: out of this unit's scope (U2 to U5, U6b own those).

## Questions

None. G0 waiver and scope were both fully specified in the brief and the plan.
