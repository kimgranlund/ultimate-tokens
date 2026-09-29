---
kind: authorization
plan: hex-oklch-dedupe
ticket: "731"
pr: 754
seat: orchestrator
sha: 600763ce03fc7dda6d87e69a80c716efdd29b731
granted: 2026-09-26
ruling: R1 (three gates), R21 (R1 extends to every plan approved on 2026-09-22)
verdict: 🟢
---

# Landing authorization · hex-oklch-dedupe · PR #754

Written before the squash, so the authorization names a sha rather than a moment.

## The sha every gate names

`600763ce03fc7dda6d87e69a80c716efdd29b731`. Local `plan/hex-oklch-dedupe`, `origin/plan/hex-oklch-dedupe` and `gh pr view 754 --json headRefOid` all read it when this record was written, with `mergeable` MERGEABLE and `mergeStateStatus` CLEAN.

## The three gates, each at that sha

| Gate | Result | Where it is recorded |
|---|---|---|
| Pre-land record | 🟢 | `.sdlc/verdicts/hex-oklch-dedupe-prepr.md` on main at `d68688e5`, pass 2; pass 1 (🔴 on the PR title and body only) is superseded after `gh pr edit 754` on the Conductor's go |
| CI | `build-test`, `panda-smoke`, `corpus-contrast` and the five `sweeps` legs pass | `gh pr checks 754`, run 36224809883; `deploy` skipped, its configured behaviour off main |
| Critic | ACCEPT | `issuecomment-5845743701` |

## Who authorized

The Conductor `sdlc:conductor (2)` verified the three gates and sent the go under R1 as extended by R21: one squash of PR #754 pinned to that sha once it read CLEAN, then close-out per adapter §5.

## What this record does not claim

The carried reds on main, `doc-drift-rows` DD9 (docs-repair U7) and `ceiling-counts` (#755, records-gates U5), are not this plan's and are not closed here.
