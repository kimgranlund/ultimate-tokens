#!/usr/bin/env node
// verdict-frontmatter.mjs -- .sdlc/checks/verdict-frontmatter-check.sh as an npm-test GATE, not a
// script someone remembers to run by hand at pre-land (#741). The check grades every top-level
// .sdlc/verdicts/*.md for a machine-readable `verdict:` line; nothing wired it into `npm test`,
// so a record that loses that line (a bad merge, a hand edit, a rename that drops the front
// matter) goes undetected until someone happens to run it.
//
// Two legs. (a) the repo's own .sdlc/verdicts/, from the repo root: the check must exit 0 and its
// last line must read every record graded with none bad. (b) a planted fixture in a throwaway
// os.tmpdir() directory, holding one record with no `verdict:` line at all and one whose value
// isn't a 🟢/🟡/🔴 token: the check must exit 1, print one MISSING line and one VALUE line, and
// close with `bad 2`. (b) is what proves the check actually bites (checks-that-bite's
// independence law) without corrupting a real record to do it; (a) alone would stay green even
// if the check's MISSING/VALUE branches were dead code.
//
// The repo root is derived from this file's own path (fileURLToPath(import.meta.url)), not
// process.cwd(), so `node test/repo/verdict-frontmatter.mjs` behaves the same run from the repo
// root (test/run.mjs's own way of invoking every gate) or from test/ directly.

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CHECK = join(ROOT, ".sdlc", "checks", "verdict-frontmatter-check.sh");
let failed = 0;
const FAIL = (name, msg) => { failed++; console.log(`  ✗ ${name}: ${msg}`); };

// Runs the check with `sh`, in `cwd`, and reports {code, out} without throwing on a non-zero
// exit -- the check's exit code is itself an assertion (see the planted-leg note below), not
// just its printed text.
function runCheck(cwd) {
  try {
    const out = execFileSync("sh", [CHECK], { cwd, encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || "").toString() };
  }
}

// (a) the repo's own records, from the repo root
const repo = runCheck(ROOT);
const repoLines = repo.out.trim().split("\n").filter(Boolean);
const repoLast = repoLines[repoLines.length - 1] || "";
const repoMatch = repoLast.match(/^verdicts (\d+) graded (\d+) bad (\d+)$/);
if (repo.code !== 0) FAIL("repo", `expected exit 0, got ${repo.code}; output:\n${repo.out}`);
else if (!repoMatch) FAIL("repo", `last line ${JSON.stringify(repoLast)} doesn't match "verdicts N graded N bad K"`);
else if (repoMatch[1] !== repoMatch[2] || repoMatch[3] !== "0") FAIL("repo", `graded/bad mismatch: ${repoLast}`);

// (b) a planted tmpdir: one record with no verdict: line, one with a non-token value
const tmp = mkdtempSync(join(tmpdir(), "verdict-frontmatter-"));
try {
  mkdirSync(join(tmp, ".sdlc", "verdicts"), { recursive: true });
  writeFileSync(join(tmp, ".sdlc", "verdicts", "missing.md"), "# a record\n\nno verdict line in this one.\n");
  writeFileSync(join(tmp, ".sdlc", "verdicts", "value.md"), "# a record\n\nverdict: PASS\n");
  const planted = runCheck(tmp);
  const plantedLines = planted.out.trim().split("\n").filter(Boolean);
  const plantedLast = plantedLines[plantedLines.length - 1] || "";
  // The exit code is read directly, not inferred from the text -- a check whose MISSING/VALUE
  // lines and `bad 2` count are right but whose exit stays 0 must still fail this test.
  if (planted.code !== 1) FAIL("planted", `expected exit 1, got ${planted.code} (the planted leg exited ${planted.code} despite bad records); output:\n${planted.out}`);
  if (!plantedLines.some((l) => l.includes("MISSING missing.md"))) FAIL("planted", `no MISSING missing.md line; output:\n${planted.out}`);
  if (!plantedLines.some((l) => l.includes("VALUE value.md"))) FAIL("planted", `no VALUE value.md line; output:\n${planted.out}`);
  if (plantedLast !== "verdicts 2 graded 2 bad 2") FAIL("planted", `expected last line "verdicts 2 graded 2 bad 2", got ${JSON.stringify(plantedLast)}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

if (failed) {
  console.log(`✗ ${failed} verdict-frontmatter gate failure(s)`);
  process.exit(1);
}
console.log(`✓ verdict-frontmatter: ${repoLast}, planted 2`);
process.exit(0);
