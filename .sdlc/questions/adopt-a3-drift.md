# Answers: adopt-repo A3 drift and gaps

date: 2026-09-16
asked by: sdlc-conductor
answered by: human (Kim Granlund)
refers to: .sdlc/records/decisions.md, .sdlc/verdicts/records.md

## Q1 Stale records
Question: Six records are stale against code that is right (ADR-010 persist/zip wording, ADR-013 says 13 voices not 15, ADR-016 collection names overturned by #491, LLD-muted-base resolver moved to resolve.mjs, runbook step 0 says no flagOf consumers, describe-palette §12). Amend them?
Options: Amend all six in one docs unit (Recommended) · Debt map only, amend later · Leave stale
Chosen: Amend all six in one docs unit (Recommended)

## Q2 hostedMcp
Question: `hostedMcp` is wired as a Pro flag (flags.js:17) though the spec says it stays unwired until Phase E and no server exists; a tier flip would grant a feature with nothing behind it. Which is right?
Options: Unwire until Phase E, per spec (Recommended) · Keep wired, amend the spec · Leave
Chosen: Unwire until Phase E, per spec (Recommended)

## Q3 UI3 caution
Question: ADR-007 rules the UI3 Collections export is interchange-only, but the drawer, README and skill present it as a plain Figma format with no caution. Which is right?
Options: Surface the caution (Recommended) · Drop the caution, amend ADR-007 · Leave
Chosen: Surface the caution (Recommended)

## Q4 Plan closing
Question: All three docs/plan files still read every step as todo though the work landed (G5). Close them and add a rule for who flips a plan?
Options: Close all three, add the rule to the adapter (Recommended) · Close them, no rule · Leave
Chosen: Close all three, add the rule to the adapter (Recommended)

## Q5 Licensing P1
Question: Licensing Phase 1 (email-bound license check in the Account panel, decided 2026-07-02) was never built. What is it?
Options: Deferred on purpose, keep as debt (Recommended) · Roadmap P1, build it · Withdraw the decision
Chosen: Deferred on purpose, keep as debt (Recommended)

## Q6 OD-004
Question: OD-004 (manual test: does the aliased DTCG export cascade on native Figma import?) has been open since July with no result. It needs a human in Figma.
Options: Keep open, I will run it when in Figma (Recommended) · Close it: the plugin is the cascade path · Schedule it now
Chosen: Keep open, I will run it when in Figma (Recommended)

## Q7 Stub ADRs (multi-select)
Question: Three live patterns have no record of their own. Which stub ADRs should the planner write during A5/A6?
Options: G2: 500-ramp scrim model (Recommended) · G3: vite is dev server + type check, bundle.mjs is the artifact (Recommended) · G1: PRD stub for PRD-G1..G7 · None
Chosen: G2, G3, G1 (all three)

## Q8 Eval secret
Question: The weekly describe-eval workflow reads `secrets.ANTHROPIC_API_KEY`, which is not set (only NPM_TOKEN exists), yet its runs pass in 11-13 s. What now?
Options: Debt: check whether the eval silently skips (Recommended) · Add the secret now · Disable the workflow
Chosen: Debt: check whether the eval silently skips (Recommended)
