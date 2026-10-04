# Question ceremony policy · from conductor

| Field | Value |
|---|---|
| Asked | 2026-10-04, owner via AskUserQuestion |
| Context | pane-context needed three pre-land repair units, each for stale comments or doc wording |
| Q1 | How strict should the pre-land check be? Options: only real bugs block (recommended) · cap at one repair round · keep it as is |
| Q1 answer | Only real bugs block: doc, comment and wording findings become follow-up issues and the PR lands; only code or behavior findings send it back |
| Q2 | Should docs-only repair units skip the Verifier? Options: yes, reviewer only (recommended) · no, keep the Verifier |
| Q2 answer | Yes: docs-only units run the trivial lane (one builder, one reviewer, merged on the reviewer's pass) |
| Applies to | all active plans from now on: pane-context, parallel-batch, compute-layers |

## Owner directive 2026-10-04, second round

The owner asked, verbatim: "do what you can to reduce ceremony (endless expensive planning-verifying loops) so we can have a general gravitational pull towards getting things done instead of getting caught in planning and verification loops"

The default leans toward shipping. These rules apply to every active and future plan:

| # | Rule |
|---|---|
| R1 | Blocking means a code or behavior defect, or a criterion that is actually unmet. Docs, comments, wording, naming and style become follow-up issues (one batched issue per plan), never a rework pass. |
| R2 | The checkability review gets one pass. A 🔴 is for a criterion that cannot be checked at all; the reviewer fixes wording in the verdict itself rather than sending it back. |
| R3 | The Orchestrator may revise a plan's criterion wording without the owner. The owner is asked only for a scope or contract change, or for a builder pass 3. |
| R4 | The trivial lane (builder plus reviewer, no Verifier) is the default for docs, comment, test-only and size-small units. |
| R5 | Pre-land gets one pass per plan. A second pass happens only when the first found a code or behavior blocker, and it checks only that fix. |
| R6 | Reviewers and Verifiers grade the unit's diff and criteria, not the surrounding record set. Stale text elsewhere is a follow-up issue. |
| R7 | Use the lowest grade that fits: builder-l2, reviewer-l1, verifier-l1 unless the unit is risky engine or contract code. |
| R8 | A plan lands as soon as its units are 🟢 and CI is green. Never hold a ready PR waiting on another plan unless they share files. |
