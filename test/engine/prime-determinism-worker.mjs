#!/usr/bin/env node
// prime-determinism-worker.mjs, a small, deliberately SEPARATE process, spawned by
// test/engine/prime.mjs's `determinism` gate (#686, #681 U6 review pass 4, finding N7). The gate needs
// two genuinely COLD starts to compare, a clean process and a process poisoned before anything else
// runs, and Node's ES module cache makes that impossible to fake by re-importing inside one process:
// re-importing "./prime.mjs" (even under a cache-busting query on ITS OWN url) still resolves
// "./hct.js" to the SAME already-instantiated module, so hct.js's module-level `_mc`/`_pk`/`_oh`
// caches survive across "fresh" imports in one process. A real child process is the only way to get a
// truly cold cache.
//
// Reads one JSON object from stdin: { poison: PaletteSpec[], cases: PaletteSpec[] }. Renders every
// `poison` spec first (discarding the result), POISON HAPPENS BEFORE ANYTHING ELSE TOUCHES THE
// PROCESS, closing review pass 4's finding that the prior gate's own order (render, THEN poison, THEN
// re-render) let the cases' own first render warm the cache the poison was supposed to corrupt. Poison
// entries are ordinary primeSwatches() calls, REAL palette renders, not a synthetic hue grid (review
// pass 4: a 0.1deg grid only fills the buckets whose second decimal is zero, about a tenth of the
// truncation-bucket space that mattered when hct.js's cache keys were truncated; a real palette render
// is what a corpus generator or the live editor actually does, and is the realistic poisoner). Then
// renders every `cases` spec and writes their hexes, in order, as one JSON array of comma-joined
// per-rung hex strings to stdout.
import { primeSwatches } from "../../src/engine/prime.mjs";

let raw = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) raw += chunk;
const { poison, cases } = JSON.parse(raw);

for (const p of poison) primeSwatches(p, { hueSpace: p.hueSpace });

const hexes = cases.map((p) => primeSwatches(p, { hueSpace: p.hueSpace }).map((s) => s.hex).join(","));
process.stdout.write(JSON.stringify(hexes));
