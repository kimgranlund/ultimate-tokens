# Question chroma-envelope revision 6 · from orchestrator

The owner's answer is R75, Question 2 of `.sdlc/questions/chroma-envelope-U2-pass3.md` (main, 2026-09-29). This file is the record the revision cap reads (`board.py check`); it restates that question and its answer and rules nothing new.

| Field | Value |
|---|---|
| Blocks | chroma-envelope U2 pass 3, then U3, U4 and pre-land (#725, draft PR #777); the plan's revision 6 (the revision cap needs the owner's answer) |
| Evidence | `.sdlc/verdicts/chroma-envelope-U2.md` (🔴 at 0627f874, findings 3 and 4, the Records row), `.sdlc/reviews/chroma-envelope-U2-review-p2.md` on `unit/ce-U2` ("For the Orchestrator") |
| Finding | Pass 2 is 🔴 on one records row (the C6 (v) comment states 15 and 3,749 where the gate measures 72 and 3692); every engine and gate row is 🟢. The plan text carries the same stale figures (C2.3), C2.5 lacks `--authored`, C2.7 cites the even Tertiary figure and the wrong line, the lane omits three paths R69 admitted, and C3.7's 120 s is exceeded at U2's head (`anchor.mjs --full` 122 s and more against 93 to 97 s), about 10 s of it the f4 uncapped re-render the engine cap flag would retire |
| Question | May the plan take revision 6 (a seventh revision row) for the plan-text fixes above? It would also move U3's engine cap flag into U3's criteria so it recovers C3.7's time, or re-time C3.7 if it cannot |
| Options | Yes (recommended) · No, keep revision 5 and let U3 read C3.7 red as a declared deviation |
| Default if unanswered | none: the protocol reserves a revision past the cap for the owner |
| Chosen | Yes, revision 6 for the plan-text fixes; U3 recovers C3.7's time or re-times it (owner via AskUserQuestion, 2026-09-29, R75 Q2, `.sdlc/questions/chroma-envelope-U2-pass3.md`) |
