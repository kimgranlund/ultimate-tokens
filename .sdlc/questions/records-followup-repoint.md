# Question · records-followup baseline re-point · the port 9333 squatters

date: 2026-09-20
from: orchestrator (Lane B), raised by the stood-down close-709-builder-l5
about: the deferred baseline re-point to main 850f7fb1 (owner ruling 6 on `plan/gate-split` approval Q6)
status: answered

## Context

The re-point was deferred: the 1-minute load stayed above 10 on 10 cores for over an hour (23 at stand-down), so no run of the five gates could be used. The close-out landed on main without it (850f7fb1); `baseline.md` keeps `ref: origin/main @ 20298cc` and the check script prints `note  head:` at this head.

While holding, the builder found that `npm run smoke` pins its CDP port at `test/smoke/smoke.mjs:44` (`const PORT = 9333;`) and that about 75 orphaned headless Chrome processes from this repo's own smoke script sit on that port, all at 0.0% cpu, the listener being pid 51658, nine days old. That listener predates the `20298cc` smoke triple that passed 3/3, so the recorded smoke figures were taken with it present. The builder did not reap them: killing them changes the host under the measurement instead of reproducing the prior set's conditions.

Not a load source (0.0% cpu), so not the reason the host is busy.

## The decision

Before the re-point's smoke triple runs, reap or keep the 9333 squatters?

1. Keep them (Recommended by the builder as the default). The smoke seconds stay comparable with the `20298cc` set; the squatter is recorded beside the smoke rows in `baseline.md`.
2. Reap all ~75 first. Smoke runs against its own browser for the first time; the new smoke seconds are recorded as not comparable with the prior set, and the reap is noted as the reason.

Either way the re-point stays a separate dispatch under a quiet host (load under 10).

## Answer

Asked by the Conductor through AskUserQuestion on 2026-09-20. Options offered: "Reap all, file the leak as a bug (Recommended)" · "Keep them for now". Chosen: "Reap all, file the leak as a bug (Recommended)".

Effect: reap every orphan on port 9333 before the re-point's smoke triple; record the new smoke seconds as not comparable with the `20298cc` set, the reap being the reason, beside the smoke rows. The leak is ticket #717 (`smoke.mjs` leaves its Chrome behind and pins one port); the re-point does not fix it. The re-point still waits for a load window under 10.
