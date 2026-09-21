---
kind: handoff
plan: records-followup
unit: U14
ticket: "#709"
branch: unit/rf-U14
seat: builder-l6
status: generated; gates run at the roadmap commit
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

## The final generation

Run once, on the Orchestrator's `go`, inside the re-freeze. Written by `--final` at `76993fa0` (the handoff commit above, which touched only this file) and committed alone as `e147ae0b`. This section is added after that commit and names it; it does not name its own.

| Item | Value |
|---|---|
| read | `2026-09-21T12:35:49Z` to `2026-09-21T12:35:50Z` |
| `head:` | `959b1bb7`, origin/main at the read |
| `inputs:` | 20 issues, 3 PRs, 35 worktrees, 11 refs, 28 reflog entries |
| commit | `e147ae0b`, `git show --stat` lists only `.sdlc/roadmap.md`; `git status --short` printed `0` right after it |

## Gates at `e147ae0b`, each with its control

The gates ran on the tree of `e147ae0b` with `git status --short` printing `0`. Controls ran in a `--shared` throwaway clone checked out at `e147ae0b`.

| Gate | Result | Negative control |
|---|---|---|
| `--verify .sdlc/roadmap.md` | exit 0, reproduces 756 lines | one cell edited: exit 1 |
| `npm test`, exit from `$?` | exit 0, `all 48 test files passed`, tree `0` after | role-table `scrim` renamed to `scrimX`: exit 1, `FAIL` counted `3` |
| `node test/repo/branding.mjs`, exit read directly | exit 0, `clean (512 files scanned)` | decision-records copied into `.sdlc/verdicts/`: `FAIL: 3 branding violation(s)`, exit 1 |
| scope: paths outside `.sdlc/` against `1f991877` | `0` | a probe line in `src/engine/motion.mjs`: `1` |
| em dashes added (P6 measure) | `0`; raw count in the roadmap and generator `0` and `0` | one prose em dash appended to the roadmap: `1` |
| roadmap alone (U5-6 leg) | commits touching the roadmap touch `.sdlc/roadmap.md` only | a commit touching the roadmap and a probe file: `.sdlc/probe.md,.sdlc/roadmap.md` |
| baseline check | exit 0, `stale total: 0`, one printed `note head:` line (tree moved outside `.sdlc/` since the baseline ran) | not re-planted here; the plan's P7 records the measured plant |

## What the snapshot's instants cover

The snapshot has two timestamps: `date -u` before the first read (HEAD) and after the last (PRS), `12:35:49Z` and `12:35:50Z`. Individual commands do not get their own timestamps. The read order is fixed in the generator: HEAD, GENERATOR, REFS, WORKTREES, REFLOG, ISSUES, PRS. `--verify` proves the file matches its snapshot; it does not prove the snapshot matched the world. That needs a diff against live `gh` while the freeze holds.
