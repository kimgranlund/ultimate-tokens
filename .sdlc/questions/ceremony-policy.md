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
