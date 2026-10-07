<!-- sdlc-lite:managed:start v1 sha256:38132ebfee43 -->
# Work records

This folder holds SDLC Lite tickets, task records, `roadmap.md`, `notes.md`, and `config`. `tickets.py roadmap` (also run by `new` and `close`) generates this block: do not edit inside it; change a ticket's `handoff.md` front matter and rerun `roadmap`. `roadmap.md` lists every ticket in dependency order. Closed `.NNNN-*` folders are history: open one only when asked.

- Ticket folders: next to this file.
- Mailbox: `messages/` is a git-ignored mailbox, not a record; follow `messages/AGENTS.md` to send, read, reply, ack, or expire a message with `<plugin-root>/scripts/messages.py`.
- `<plugin-root>` is the installed sdlc-lite plugin folder, the one holding `scripts/tickets.py`: `${CLAUDE_PLUGIN_ROOT}` in Claude Code; in Codex, the folder two levels above the `sdlc-lite` skill.

## Stages

- proposed: 0
- ready: 8
  - T-0003 src/ui/sections/typography.js: replace the retired voice counts (GitHub #782) (gh-782)
  - T-0004 Stale eleven-voice wording in Download-All README, inspector copy and store copy (GitHub #796) (gh-796)
  - T-0005 gates-batch follow-ups: gate breadth, a fourth rename-map copy, stale lines (GitHub #783) (gh-783)
  - T-0006 pane-context follow-up: stale comments and wording after #785 (GitHub #798) (gh-798)
  - T-0007 headless-boot shim: print a summary of failed assertions at the end (GitHub #800) (gh-800)
  - T-0008 tonal.js: drop vestigial palette.chroma / 100 reads and the groupTarget name (GitHub #799) (gh-799)
  - T-0009 Anchored notch at stop 200 on the default kit #774902 palette at hueShift -30/-45 (GitHub #784) (gh-784)
  - T-0011 Palette slugs can collide with another palette's suffixed token names (GitHub #787) (gh-787)
- blocked: 0
- done: 3
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
