# Question chroma-floor timing · from orchestrator

| Field | Value |
|---|---|
| Blocks | chroma-floor U3 and pre-land: the gate:even-dips timing row (3 readings) |
| Context | R57 (2026-09-26) accepts the gate:mode-isolation timing runs under host load. The gate:even-dips timing row came later, with plan revision 14. The Verifier reads R57 as not covering it, so its under-load runs stay 🟡 |
| Question | Extend R57 to gate:even-dips, so its 3 runs under load count 3/3 like mode-isolation? |
| Options | A Yes, same rule (recommended: same host, same kind of timing row, and a quiet window is not in sight) · B No, take 3 quiet readings in a later quiet window |
| Default if unanswered | none: the even-dips row stays 🟡 and blocks a 🟢 pre-land record |
