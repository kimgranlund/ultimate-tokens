---
kind: authorization
plan: cache-docs
ticket: "750"
pr: 760
seat: orchestrator
sha: 99219abb654b78ef46f9eebaf761725a27ed4e0b
granted: 2026-09-26
ruling: R1 (three gates), R52 (cache-docs mobilized under R1)
verdict: 🟢
---

# Landing authorization · cache-docs · PR #760

Written before the squash, so the authorization names a sha rather than a moment.

## The sha every gate names

`99219abb654b78ef46f9eebaf761725a27ed4e0b`. Local `plan/cache-docs`, `origin/plan/cache-docs` and `gh pr view 760 --json headRefOid` all read it when this record was written, with `mergeable` MERGEABLE and `mergeStateStatus` CLEAN.

## The three gates, each at that sha

| Gate | Result | Where it is recorded |
|---|---|---|
| Pre-land record | 🟢 | `.sdlc/verdicts/cache-docs-prepr.md` on main at `72fc5f09`, pass 2; pass 1 (🔴 on the PR title and body only) is superseded after `gh pr edit 760` under the Conductor's standing go |
| CI | `build-test`, `panda-smoke`, `corpus-contrast` and the five `sweeps` legs pass | `gh pr checks 760`, run 36265231014; `deploy` skipped, its configured behaviour off main |
| Critic | ACCEPT | `issuecomment-5850619869` |

## Who authorized

The Conductor `sdlc:conductor (2)` verified the three gates and sent the go: one squash of PR #760 pinned to that sha with `--match-head-commit`, then close-out per adapter §5.

## What this record does not claim

The `_okL` line in `04-context-and-messaging.md` still states a `toFixed(2)` key; chroma-floor (#701) owns it. The carried reds on main, DD9 and #755, are not this plan's.
