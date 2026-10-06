# ultimate-tokens

## What this repository is

## Shared rules

## Checks

<!-- sdlc-lite:managed:start v1 sha256:971fe8256976 -->
## Documents

Read [the docs entry](docs/AGENTS.md) before adding or moving a document.

Managed by SDLC Lite onboard, template 1.

## Work records

`.sdlc/` holds SDLC Lite tickets, plans, and run records.

- Pick the lane first with `steps.py lane <task dir>` (in the plugin's `scripts/` folder): `solo` is the default for size S and M, `/sdlc-lite:fix` runs only when asked or when the lane script prints `fix`, and the full chain (`/sdlc-lite:chain`) needs a stated reason (an L4 or L5 step, a merge step, or cross-cutting scope). Roles launch with `run.sh`. Do not spawn another plugin's builder, planner, or reviewer agent in their place.
- Handoff files follow the `sdlc-lite:handoff-format` skill.
- Tickets are created, closed, and archived through the `sdlc-lite:ticket` skill.
- `.sdlc/roadmap.md` is generated. Do not edit it by hand.
- `.sdlc/messages/` is a local mailbox. Keep it in `.gitignore` and never commit it.
- Do not move or rewrite a finished run record.
<!-- sdlc-lite:managed:end -->
