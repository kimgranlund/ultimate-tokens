---
id: T-0022
title: "Describe eval runner: parse the leading JSON object of a string-typed families (Haiku 5.5 appends trailing text)"
type: bug
status: ready
size: L1
priority: P2
depends: []
created: 2026-10-08
router: .sdlc/AGENTS.md
---

## Goal
GitHub #811 follow-up. `interpretOne` in `mcp/describe-eval-runner.mjs` parses a string-typed `families` with `JSON.parse`, inside a try that swallows errors. A live Haiku 5.5 run on 2026-10-08 showed the string can hold a valid JSON object followed by extra text (case 0: `Unexpected non-whitespace character after JSON at position 875`, length 1406, the tail being prose from other fields), so the parse fails, `families` stays a string, and the scorer counts every family as missing (0/15). Other responses return a proper object.

## Intent
- Add a small pure helper (exported, in `mcp/describe-eval-runner.mjs` or `mcp/describe-eval.mjs`) that returns the first balanced top-level JSON object from a string: scan from the first `{`, track string state and escapes, stop at the matching `}`, then `JSON.parse` that slice. Use it for a string-typed `families` after a plain `JSON.parse` fails. Return the original value when there is no balanced object or the slice does not parse, so a malformed brief still scores as a miss and never throws.
- Tests in `test/mcp/describe-eval.mjs`, offline only, no provider call: (a) a plain JSON string parses as before, (b) a valid object followed by trailing prose and a second object parses to the first object only, (c) braces and escaped quotes inside string values do not end the scan early, (d) an unbalanced or non-JSON string is returned unchanged, (e) a negative control: the pre-fix `JSON.parse`-only path throws on case (b).
- Also fix the cosmetic backslash-escaped backticks in the comment above that line (it reads a literal backslash before each backtick).
- Do not run any paid call. Do not change the scorer, threshold or briefing.

## Constraints
- Zero runtime deps, no U+2014. `npm test` green via `scripts/gate_lock.py run --name npm-test -- npm test`. Files: `mcp/describe-eval-runner.mjs`, `test/mcp/describe-eval.mjs` only (plus `src/ui/mcp-assets.js` / `describe-mcp-assets.js` only if a generator moves them).
