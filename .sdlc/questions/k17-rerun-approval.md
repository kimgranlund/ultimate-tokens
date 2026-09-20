# Approval: plan k17-rerun

date: 2026-09-19
asked by: conductor (sdlc-ultimate-tokens-conductor)
answered by: human (Kim Granlund)
refers to: sdlc-orchestration `.sdlc/inbox/ultimate-tokens-k17-rerun.md` (54550fd), `.sdlc/verdicts/architecture.md` at 28c2e8cc

## Q1
Question: The plugin repo graded C31 🟡 at our 28c2e8cc: our A2 verdict still shows K17 🔴 against the old filter (the rerun with the widened filter lives only in U3's verdict) and its title still says pass 4. My pre-land missed that. The fix is one record unit: our verifier reruns K17 at HEAD, writes the row, fixes the title, landed by PR. That needs a small plan file under .sdlc/plans/, which you told me to stay out of. How do I take it?
Options:
- One exception: I plan and run it (Recommended): a single S plan, k17-rerun, one unit, touching only .sdlc/verdicts/architecture.md plus its own plan, verdict and board rows; no other plan and not the roadmap
- The other session takes it
- Not now
Chosen: One exception: I plan and run it (Recommended)

## Q2
Question: Plan k17-rerun passed the checkability review on pass 2 (10 of 10). One S unit: builder-l1 rewrites only the A2 verdict's title line and writes a handoff with its own K17 run; verifier-l1 appends a Pass 6 section with the K17 row from its own run and plant. Criteria: P1 npm test green and tree clean; P4 branding; P5 scope wall (only the A2 verdict, this plan's own records and the board); U1-1 pass 6 exists once, last, one K17 row, green; U1-2 the row quotes the map's filter byte for byte; U1-3 graded at a head equal to HEAD with own plant; U1-4 title computed from the file (pass 6, 18 of 18); U1-5 the plugin's C31 counts pinned (18, 18, 19, 31, 1, 7); U1-6 passes 1 to 5 untouched; U1-7 handoff records the plant's hit count. Approve for mobilization?
Options:
- Approve (Recommended)
- Hold
Chosen: Approve (Recommended)
