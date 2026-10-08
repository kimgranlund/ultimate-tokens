<!-- sdlc-lite:managed:start v1 sha256:cab97ffe8e68 -->
# Work records

This folder holds SDLC Lite tickets, task records, `roadmap.md`, `notes.md`, and `config`. `tickets.py roadmap` (also run by `new` and `close`) generates this block: do not edit inside it; change a ticket's `handoff.md` front matter and rerun `roadmap`. `roadmap.md` lists every ticket in dependency order. Closed `.NNNN-*` folders are history: open one only when asked.

- Ticket folders: next to this file.
- Mailbox: `messages/` is a git-ignored mailbox, not a record; follow `messages/AGENTS.md` to send, read, reply, ack, or expire a message with `<plugin-root>/scripts/messages.py`.
- `<plugin-root>` is the installed sdlc-lite plugin folder, the one holding `scripts/tickets.py`: `${CLAUDE_PLUGIN_ROOT}` in Claude Code; in Codex, the folder two levels above the `sdlc-lite` skill.

## Stages

- proposed: 0
- ready: 7
  - T-0021 Compute layers: rebase U1-U3 onto main, then U4 pins and U5 ramp@2 on schema v9 (#788) (gh-788)
  - T-0022 Describe eval runner: parse the leading JSON object of a string-typed families (Haiku 5.5 appends trailing text) (gh-811b)
  - T-0023 Retire docs/assets/geometry-tokens.json, the frozen six-size snapshot (T-0017 follow-up) (geometry-tokens-snapshot)
  - T-0024 Gate A narrowing from #807: can the chroma-envelope gate cover stops where OKHSL keyS reads above 1? (gate-a-narrowing)
  - T-0025 Color inspector follow-ups from the PR #814 review (Mapping/Radix reachability, drag-reorder context flip, keyboard path back to Global) (inspector-review-fixes)
  - T-0026 Figma apply must not prune legacy size/* variables on an existing file (PR #813 review, major 1) (figma-legacy-size-renames)
  - T-0027 Compound insets and radius composition for container components (segmented, listbox), square ghost icon buttons, unstyled palette name input (geometry-compound-insets)
- blocked: 0
- done: 19
- dropped: 0

## Procedures

Create a ticket:
1. Run `python3 <plugin-root>/scripts/tickets.py --root .sdlc new <feature|bug|chore|spike|idea> <slug> "<title>"`. Never pick an id by hand: `new` stamps the next id above every worktree's.
2. Fill in the body sections of the new `handoff.md`.

Claim a ticket:
1. Open its `handoff.md`. A `claimed_by:` front matter line means another agent holds it: pick another ticket or ask the user.
2. Add `claimed_by: <claude|codex> <YYYY-MM-DD>` to the front matter, then run `python3 <plugin-root>/scripts/tickets.py --root .sdlc roadmap`.
3. Start the work through `run.sh`, which puts it in progress: `<plugin-root>/scripts/run.sh planner <level> .sdlc/<folder>/handoff.md`, or `/sdlc-lite:chain .sdlc/<folder>`. `status` stays a person's decision; progress shows on `/board`.

Close a ticket:
1. Run the filer (`/file`): `<plugin-root>/scripts/run.sh filer L1 .sdlc/<folder>/handoff.md`.
2. Run `python3 <plugin-root>/scripts/tickets.py --root .sdlc close <folder> --dry-run`. It lists each follow-up as `<i>. <tag>: <title>` and ends with `expect <digest>`.
3. Run `python3 <plugin-root>/scripts/tickets.py --root .sdlc close <folder>`. To file the one `decide:` follow-up worth a ticket, add `--ticket <i> --expect <digest>`. `note:` items and the other `decide:` items go to `notes.md`; `fix-now:` items are finished before the close.
4. Work already done by another ticket: `python3 <plugin-root>/scripts/tickets.py --root .sdlc close <folder> --reason "<why>"`.
<!-- sdlc-lite:managed:end -->
