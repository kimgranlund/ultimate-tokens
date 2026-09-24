---
kind: evidence
plan: records-followup
unit: U14
seat: verifier
written: 2026-09-21
verdict: 🟢
---

# U14 window evidence: the snapshot against the world, taken during the R19 re-freeze

Taken ahead of the U14 verdict because its first half cannot be taken later. While the re-freeze
holds, open issue and PR state is held by our own lanes; once it lifts it moves, and nothing records
what `gh` returned at a past instant. The U14 verdict cites this note.

> **R17 label.** Taken by the verifier seat at opus high, the same model as the seat that will grade
> U14 from it.

Branch `unit/rf-U14` at `e147ae0b`. The snapshot's `INSTANT` block reads `2026-09-21T12:35:49Z` to
`2026-09-21T12:35:50Z`. I reran its two `gh` commands verbatim from `.sdlc/scripts/roadmap-gen.mjs`
lines 62 and 63, with `LC_ALL=C` and `LIMIT` 500 as it ran them, at `2026-09-21T12:36:51Z`, 61
seconds after the read, and applied the file's own `<U+2014>` escape before comparing.

| id | check | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| W-ISSUES | the `ISSUES` block equals a live rerun of its command | 🟢 | `20` lines recorded, `0` differing; sha256 prefix recorded `abdea4620b7f5f1b`, live `abdea4620b7f5f1b` | the same diff with one label altered in memory reports `1` differing line |
| W-PRS | the `PRS` block equals a live rerun of its command | 🟢 | `3` lines recorded, `0` differing; sha256 prefix recorded `b967a8125810dc32`, live `b967a8125810dc32` | the same diff with one label altered in memory reports `1` differing line |
| W-V0 | `--verify` reproduces the committed file | 🟢 | `node .sdlc/scripts/roadmap-gen.mjs --verify .sdlc/roadmap.md` exits `0`, `756` lines | W-V1 and W-V2 |
| W-V1 | `--verify` fails when one snapshot value is wrong | 🟢 | `#377`'s label `P3` to `P2` inside the `ISSUES` block of a copy: exit `1`, first difference at line `46`, the Count line re-rendering as `P2 4, P3 1` against the file's `P2 3, P3 2` | the unmutated file exits `0` |
| W-V2 | `--verify` fails when one rendered cell is wrong | 🟢 | `#377`'s rendered `P3` at line `61` of a copy changed to `P2`: exit `1` at line `61`, file `P2` against re-render `P3` | the copy was confirmed to exist and to differ from the original by that one line before its exit code was read |

## What this does and does not show

W-ISSUES and W-PRS check the snapshot against the world, which `--verify` cannot. They show the
snapshot captured exactly what `gh` returns, shaping and sort order included. They do not show the
world held still across the 61 seconds; they show it did not change in any field these commands read.

W-V1 and W-V2 show `--verify` checks both halves: the rendering from the snapshot, and the snapshot's
consistency with what is rendered.

Two cautions. The `<U+2014>` escape went unexercised, because no open issue or PR title carries an em
dash, so this note makes no claim that the escape round-trips. And my first attempt at W-V2 failed to
write its copy, so its `exit 1` was Node failing to open a missing file. I discarded it and reran
against a copy I had first confirmed to exist and differ. A control that fails for the wrong reason
looks exactly like one that bites.

Git refs, worktrees and reflogs are local and stay readable, so they are graded with the U14 verdict
and not here.
