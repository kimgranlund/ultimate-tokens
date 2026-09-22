# Handoff U2 · builder → orchestrator · 🔴 blocked

| Field | Value |
|---|---|
| Branch | unit/vf-U2 @ d49cfc7a (no commit yet) |
| Ticket | #734 https://github.com/kimgranlund/ultimate-tokens/issues/734 |
| Blocks | U2-1's expected label string |

## Step 1: mint ticket

Ran `adapter.py create --dry-run` first (matched: `{"would":"create","title":"Backfill verdict: front matter on the 47 grandfathered verdict records (#723 follow-up)"}`), then the real command once, with `--size M --label kind:chore --label P3 --label lane:docs` and `--body-file` holding the rule, the 47-name checklist (3 flagged VALUE), the removal rule with the `CLEARED` clause, the owner ruling, and the Q1 follow-up line.

Ticket #734 created: title correct, body correct, all 47 names present. Labels came back `P3,kind:chore,lane:docs,size:M,status:backlog` (`gh issue view 734 --json labels -q '[.labels[].name]|sort|join(",")'`), 5 labels, not the dispatch's expected 4 (`P3,kind:chore,lane:docs,size:M`).

## Root cause

`adapter.py`'s `create` verb always appends `status:backlog` itself (scripts/adapter.py:305-310, comment: "create applies status:backlog and size:<S>"). Every ticket minted via `create` carries it; not avoidable via flags. Confirmed other repo issues minted outside the adapter (#731, #730, #728, #727) carry no `status:*` label, so this is adapter-`create`-specific, not something U2's own command choice caused.

## State

Stopped per dispatch instruction ("if the labels come out different... stop and report; do not mint a second ticket"). Ticket #734 left as-is, not deleted. List file's first line untouched (still `#TBD`). U2-1/U2-2 not run as final; no commit.

## Need

Ruling: (a) revise U2-1's expected string to 5 labels including `status:backlog`, or (b) another fix. Holding for direction.
