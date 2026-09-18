# Question adopt-hygiene · from orchestrator
| Field | Value |
|---|---|
| Blocks | nothing in U6; the landing PR's config (pre-land 🟡, `.sdlc/verdicts/adopt-hygiene-prepr.md`) |
| Question | `.claude/settings.json` enables `sdlc@nonoun` but `extraKnownMarketplaces` declares no `nonoun` marketplace, so a fresh clone cannot resolve the plugin. Declare it (source?) or leave it user-scoped? |
| Options | A leave it: the marketplace is user-scoped on the maintainer's machine, add a debt row (recommended: no public source to point at) · B declare it in `extraKnownMarketplaces` with a source the human names · C disable `sdlc@nonoun` in committed settings, enable in settings.local.json |
| Default if unanswered | A; U6's builder adds the debt row |

## Answer (2026-09-17, conductor)
| Field | Value |
|---|---|
| Chosen | B: declare `nonoun` in `extraKnownMarketplaces` with `{"source": {"source": "github", "repo": "kimgranlund/sdlc-orchestration"}}` (same shape as `nonoun-plugins`). The repo is not pushed yet; the human pushes it after landing, so add a debt row for "push sdlc-orchestration to GitHub" as well |
