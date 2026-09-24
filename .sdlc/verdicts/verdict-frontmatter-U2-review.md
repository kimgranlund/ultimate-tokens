# Verdict U2 review · 🟢

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | U2-1: ticket carries title, exactly the four labels plus one `status:` label, all 47 names distinct | 🟢 | fresh `git clone -q --shared` at bcd083d0, `GH_REPO` set: title + `P3,kind:chore,lane:docs,size:M,status:backlog`, then `47` | 46-name pattern file printed `46`; `#TBD` first line left `N` empty, `gh issue view ""` errored `invalid issue format: ""` |
| 2 | U2-2: list file's first line names the ticket, hash unchanged | 🟢 | same clone: `1`, `29d0eff2c1bccbc1` | editing one name while keeping the ticket number changed the hash to `8a5e0326caa20ee8` |
| 3 | #734 body matches what the check enforces | 🟢 | real body (`gh issue view 734 --json body -q .body`), same grep as U2-1 plus a CLEARED count: `grep -o -F -f <(grep -v '^#' grandfather.txt) body.txt \| sort -u \| wc -l` → `47`; `grep -c CLEARED body.txt` → `1` | a copy of the body with every `CLEARED` line stripped (`grep -v CLEARED`) prints `0` for the CLEARED count; a copy with `survey.md` stripped out prints `46` for the name count |
| 4 | no em dash outside backticks in files this unit touched | 🟢 | `perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' .sdlc/checks/verdict-frontmatter-grandfather.txt .sdlc/handoffs/verdict-frontmatter-U2.md \| wc -l` in a fresh clone at bcd083d0: `0` | planted one U+2014 mid-sentence in the handoff's closing prose line, same clone, same command: `1` |

## Finding (non-blocking)

The list file's header line still ends `backfill ticket #734, U2 fills this`. That clause was the
plan's placeholder text for the still-pending number (`#TBD, U2 fills this`); U2 has now filled it,
so the trailing imperative reads as unfinished work to a reader when the fill already happened.
U2-2 only greps for `#[0-9]` in the header and does not grade the wording, so this does not fail
a criterion, but it is a stale-description defect (CLAUDE.md: stale context is a bug-equal defect).
Recommend a follow-up wording pass, e.g. `...backfilled via #734` in place of `U2 fills this`, at
the next touch of this file (the backfill work itself, U2's own ticket, is the natural place).

## Summary

Both rows rerun clean against the real ticket in an isolated `--shared` clone, all three planted
negative controls discriminate exactly as the handoff claims, and #734's body matches the check's
actual STALE/CLEARED/VALUE rules line for line. The one finding is cosmetic wording, not a gate.

verdict: 🟢
