# Question chroma-envelope U3 · from orchestrator

| Field | Value |
|---|---|
| Blocks | chroma-envelope pre-land (#725); U4 proceeds meanwhile |
| Evidence | `.sdlc/verdicts/chroma-envelope-U3.md` (🟡 cleared to merge, unit/ce-U3 @ 8bc5c3b3, merged into plan/chroma-envelope @ 2ab30df7), findings 1 to 3 |
| Finding | U3 meets every clause, but three plan texts no longer match the ruled build, and the pre-land verifier reruns the plan literally. (1) C3.3 x2 says `exactly 0 on every row class`; it holds on every named class and on every `dampAmp` 0 row, but the `dampAmp` 70 carve-out preset reads 502 oklch and 486 cam16 rows over 0.01 (max 1.48), where env stays above 1 and the hold leaves it alone by design. (2) C3.1 says `r^2.0875` (the revision 6 d 0.919); the code uses 2.1796 from the ruled d 0.9275 (R76 Q3), and the probe prints are 0.7435 / 0.2304. (3) Two named controls no longer bite (C3.2 `--damp 70 --damp-curve 1.5`, C3.7 forced `capped` flag); the verdict's substitute controls do. |
| Question | May the plan take revision 9 (the tenth revision row), plan text only, to scope C3.3 x2 to `dampAmp` 0 (env at most 1), write C3.1 as 2.1796 with the measured prints, and swap in the substitute controls? |
| Options | A Yes (recommended): orchestrator writes revision 9 from the verdict, no engine or gate change, before the pre-land request · B No: pre-land grades the literal text, so C3.3 x2 reads 🔴 on the carve-out preset and the plan returns to a planner |
| Default if unanswered | none for pre-land, which waits; U4 (records) builds meanwhile |
