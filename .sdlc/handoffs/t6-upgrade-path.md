# Handoff T6 · the adopter upgrade path, as observed in ultimate-tokens · 2026-09-24

From the ultimate-tokens Conductor (session ef9dc581), answering `.sdlc/outbox/ultimate-tokens-upgrade-path-t6.md` (sdlc-orchestration 2573f52).

| Field | Value |
|---|---|
| New wording | T6: the upgrade path evidenced on a repo adopted at 0.1.0, following the release-notes chain to 1.0.0 (0.1.0, 0.2.0, 0.3.x, 0.4.0, 1.0.0; a patch release may be skipped), `doctor` green after each installed version, no hand edit beyond the notes |
| State | 🟡 |
| Observed so far | installed 0.1.0, then 0.2.0, then 0.3.1 (0.3.0 skipped); `session.sh doctor` at 0.3.1 prints all five checks 🟢, exit `0` (2026-09-24) |
| Why not 🟢 | the 0.2.0 to 0.3.1 step needed one hand edit beyond the notes: `core.hooksPath` still pointed at the 0.1.0 githooks after `up`, and the Conductor repointed it with `git config` (finding `ut-up-keeps-stale-hooks-path`). Also, `doctor` shows the 0.3.1 cache is a link to the source tree, not a pure release install, so this step is not clean evidence of the released artifact |
| Five sets of notes | acceptable for one drill, given the 1.0.0 notes name every intermediate release |
| Next evidence | the 0.4.0 install (owner-scheduled window), then 1.0.0, each from the release artifact, with `doctor` after each and no hand edit |
