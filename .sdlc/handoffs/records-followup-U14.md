---
kind: handoff
plan: records-followup
unit: U14
ticket: "#709"
branch: unit/rf-U14
seat: builder-l6
status: generator ready, final generation waiting for go
---

# U14 handoff: the roadmap rebuilt by a generator (owner ruling R18)

## State at this commit

| Item | State |
|---|---|
| generator | `.sdlc/scripts/roadmap-gen.mjs`, added alone in `5feddebb` |
| roadmap | untouched: `.sdlc/roadmap.md` is the blob `f9725be9` carries |
| final generation | not run; waits for the Orchestrator's `go` inside the re-freeze |
| `npm test` at `5feddebb` | exit 0 read from `$?`, `all 48 test files passed`, `git status --short` 0 after |

## Design

| Part | What it does |
|---|---|
| one read | HEAD, generator blob, refs (main, origin/main, plan/*), `git worktree list --porcelain` with the repo root shown as `<ROOT>`, the newest reflog entry of each ref and worktree branch, `gh issue list` and `gh pr list` as TSV, between two recorded instants |
| snapshot | each read quoted verbatim in `## Snapshot` under its command |
| cells | each table cell is the stdout of an sh command printed under its table, run with the snapshot blocks as variables; after the read, commands name git objects by sha only |
| verify | `--verify <file>` re-renders from the file's own snapshot and compares byte for byte; a by-hand recipe in the file reruns single cells (tried in bash and zsh) |
| legend | no marks: label cells are label text verbatim, no legacy mapping; order is a sort by P label then number, and the file says it ranks nothing |
| head, counts | `head:` is origin/main at the instant; `Count:` and `inputs:` are generated |
| refusals | exit 3 if a ref's newest reflog entry disagrees with the refs or worktree read; `.sdlc/roadmap.md` only with `--final`, which needs the generator committed at HEAD unchanged and a clean tree; banned brand strings refused; U+2014 in data written `<U+2014>` |

## Controls run on dry outputs

| # | Control | Result |
|---|---|---|
| N1 | one cell edited in a copy | `--verify` exit 1 at that line; unedited exit 0 |
| N2 | pif-u7 `Commits not on head` at another head | 225 at `7f80ab15`, 260 at `5f2c3787` |
| N3 | `kind:chore` added to #496 in the snapshot | its Kind cell moves `none` to `chore` |
| N4 | reflog witness, `plan/gate-split` | quoted entry `95a725bb` gives 255, the entry before it `2dd4444a` gives 254 |
| N6 | write the roadmap without `--final`; `--final` with the generator uncommitted | both refused, exit 1 |
| N7 | em dash in an input title | rendered `<U+2014>`, 0 raw em dashes in output |
| N8 | tampered reflog in a throwaway clone | exit 3, nothing written; untampered exit 0 |
| final path | `--final` in a throwaway clone at `5feddebb` | wrote, `--verify` exit 0 |

U5 criteria on the last dry run: U5-1 `1`, `anc 0`; U5-2 `diff 0`; U5-3 `8` and `8`; U5-4 `diff 0`; U5-5 `0`, `0`.

## For the Orchestrator

U5-7's second leg reads the range `## Unticketed debt` to `## Label`; the rebuild has neither heading, so it prints `0`. The DP ids are present (`grep -c 'DP[1-4]'` on the file `1`, `debt id` `0`). The section is not named "Unticketed debt" because nothing in the file measures that. Re-point U5-7 or rule otherwise.
