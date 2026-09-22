---
kind: verdict
plan: verdict-frontmatter
unit: U2
ticket: "#723, backfill #734"
branch: unit/vf-U2
base: plan/verdict-frontmatter @ 356333f1
grade: verifier-l1 (worker `vf-U2-verifier-l1-p1`, opus medium), graded by the Verifier seat
contract: plan revision 7, U2-1 and U2-2
pass: 1
written: 2026-09-22
---

# Verdict verdict-frontmatter U2 · 🟡 · 1 🟢, 1 🟡, 0 🔴

verdict: 🟡
sha: e5ae5b3710cc60369dfb2e6424a33391b03f5d35

The ticket is right and the list is right. The yellow is on U2-2's own command: half of it printed
the same figure before this unit did anything. The worker's full report is
`/tmp/v13/vf-U2-verify.md`. I re-derived both rows first-hand, and the `#723` finding below. The
handoff and the review pass `verdict.py check` (exit `0`), a shape check only. #734 was read with
`gh issue view` only.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U2-1 | the ticket exists with the labels and names all 47 files as distinct names | 🟢 | mine and the worker's: `N=734`, then `Backfill verdict: front matter on the 47 grandfathered verdict records (#723 follow-up) P3,kind:chore,lane:docs,size:M,status:backlog`, then `47`. The title is the plan's, byte for byte. There is exactly one `status:` label. Worker: the list's 47 names equal the body's names exactly in both directions (the body's one extra `.md` token is the plan path). Raw matches before `sort -u` are `50`, with three names listed twice | worker: the body with one name removed prints `46`. The label pattern matches the real set, and rejects both a set with no `status:` label and a set with two. The plan says a `#TBD` header leaves `N` empty; the real pre-U2 header gives `N=723` instead, a live issue with a different title and labels, so the row still reds there, through a different path than the plan says |
| U2-2 | the first line names the ticket, and the names hash is unchanged | 🟡 | `1`, `29d0eff2c1bccbc1`. The hash is also `29d0eff2c1bccbc1` at `356333f1` and at the review's commit `bcd083d0`, so the header edit after the review left the names alone. The first figure, though, is `1` at `356333f1` as well, before the unit filled in the number, because the old header already reads `#723 mandate`. So `grep -c '#[0-9]'` never tested whether the line names the ticket. What does establish it: the diff changes line 1 only, from `backfill ticket #TBD` to `backfill ticket #734`, and U2-1's extraction reads `723` before and `734` after | the hash half discriminates: one name edited in a copy gives `6e344cb1e40d3623`. The grep half only reds on a header with no `#<digits>` anywhere, which is not the state the unit replaced |

## Revisions 6 and 7, judged

Revision 7 changed U2-1's expected labels after the mint. It fixes a contract that could not be met,
not work that was fitted to it. Revision 6 moved the mint to `adapter.py create` but kept revision
5's four-label expectation. `create` always adds `status:backlog`, and it refuses any `status:`
label passed in (`adapter.py`, the `create` method: `create applies status:backlog and size:<S>`).
So no correct mint could have met revision 6's U2-1. The builder stopped on the mismatch
(`33be4404`, 13:51:40), minted once, and revision 7 followed at 13:52:03, before any U2 verdict.
Revision 7 accepts one `status:` label of any value, which is a real loosening. But the ticket's
status is not what U2 delivers, and the row still reds on a missing required label, an extra label
or a second `status:` label, as the worker's control shows.

## For the plan owner

- U2-2's `grep -c '#[0-9]'` cannot tell the ticket from the mandate's own `#723` on the same line.
- U2-1's extraction takes the last `#<digits>` on line 1, so a later edit to that header that
  mentions another issue number after `#734` would quietly point both rows at the wrong ticket.

Neither is a defect in this unit's work.
