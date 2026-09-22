# Handoff U2 · builder → orchestrator · 🟢 finished

| Field | Value |
|---|---|
| Branch | unit/vf-U2 @ 03f65709 |
| Ticket | #734 https://github.com/kimgranlund/ultimate-tokens/issues/734 |
| npm test | pass, tree clean after |

## Ticket mint

Dry-run first, matched. Real `adapter.py create` run once with `--size M --label kind:chore --label P3 --label lane:docs` and a body carrying the rule, the removal rule with the `CLEARED` clause, all 47 names as a checklist (3 flagged VALUE, needing a token in front of existing prose), the owner ruling, and the Q1 follow-up line. Ticket #734 created. Labels came back with `status:backlog` too (adapter.py:305-310 always appends it); reported and held per dispatch instruction until revision 7 fixed U2-1's expectation; ticket was not re-minted.

## U2-1

Command: `N=$(sed -n '1s/.*#\([0-9][0-9]*\).*/\1/p' .sdlc/checks/verdict-frontmatter-grandfather.txt); gh issue view "$N" --json labels,title -q '[.title, ([.labels[].name] | sort | join(","))] | join(" ")'; gh issue view "$N" --json body -q .body | grep -o -F -f <(grep -v '^#' .sdlc/checks/verdict-frontmatter-grandfather.txt) | sort -u | wc -l`

Output:
```
Backfill verdict: front matter on the 47 grandfathered verdict records (#723 follow-up) P3,kind:chore,lane:docs,size:M,status:backlog
47
```
Matches expected: title, the four labels plus exactly one `status:` label, then `47`. 🟢

Controls:
- Missing-name body: fed a 46-name pattern file (one name dropped) against the real issue body → `46`, not `47`. Discriminates.
- `#TBD` first line: `N` came back empty and `gh issue view "" ...` errored (`invalid issue format: ""`, exit 1). Discriminates.

## U2-2

Command: `head -1 .sdlc/checks/verdict-frontmatter-grandfather.txt | grep -c '#[0-9]'; grep -v '^#' .sdlc/checks/verdict-frontmatter-grandfather.txt | shasum -a 256 | cut -c1-16`

Output:
```
1
29d0eff2c1bccbc1
```
Matches expected `1`, `29d0eff2c1bccbc1`. 🟢

Control: edited one name in a `git clone -q --shared` copy while leaving the ticket number filled → hash changed to `9bfe447c373048d7`. Discriminates.

## Gates

`node test/repo/branding.mjs` clean (553 files scanned). No em dash (U+2014) outside backtick spans. `npm test` (foreground, 48/48 files pass, `repo/branding.mjs` included) and `git status --short` empty after.

## State

Both rows 🟢, both controls discriminate, ticket #734 carries the field, the list file names it. `git rev-parse HEAD` → `03f65709`.
