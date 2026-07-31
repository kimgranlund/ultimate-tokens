#!/usr/bin/env node
// git-precommit-privatedocs-guard.mjs — PreToolUse guard on Bash: blocks a `git commit` if
// `.claude/docs/other/` (the local-only working folder, ignored via `.git/info/exclude`) would
// be swept into the commit. Mechanizes CLAUDE.md's own "Always" guard — the check itself was
// already a one-line grep; this makes it fire before the commit, not just when someone remembers
// to run it. Zero-dep, ESM, matches this repo's own scripting convention.
//
// Selftest: node .claude/hooks/git-precommit-privatedocs-guard.mjs --selftest
import { execSync } from "node:child_process";

const COMMIT_RE = /\bgit\s+(?:.*\s)?commit\b/;

// isPrivateDirStaged(statusOutput) — the pass/fail core, pure and testable: `git status --short`
// output → true if any line touches .claude/docs/other/ (any status code, any of the two path
// columns a rename can occupy).
export function isPrivateDirStaged(statusOutput) {
  return String(statusOutput || "")
    .split("\n")
    .some((line) => line.slice(3).includes(".claude/docs/other/"));
}

function runSelftest() {
  const fails = [];
  const ok = (c, m) => { if (!c) fails.push(m); };

  ok(isPrivateDirStaged(" M .claude/docs/other/notes.md\n M src/engine/type.mjs") === true, "staged private file → true");
  ok(isPrivateDirStaged("?? .claude/docs/other/scratch.txt") === true, "untracked private file → true");
  ok(isPrivateDirStaged("R  old.md -> .claude/docs/other/new.md") === true, "rename INTO the private dir → true");
  ok(isPrivateDirStaged(" M src/engine/type.mjs\n M test/engine/type.mjs") === false, "no private-dir line → false");
  ok(isPrivateDirStaged("") === false, "empty status → false");
  ok(isPrivateDirStaged(" M .claude/docs/other-thing.md") === false, "lookalike path (no trailing slash match) → false");

  if (fails.length) { console.error(`git-precommit-privatedocs-guard FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
  console.log("git-precommit-privatedocs-guard PASS — staged/untracked/renamed private-dir detection, lookalike-path exclusion");
  process.exit(0);
}

if (process.argv.includes("--selftest")) runSelftest();
else {
  let input = "";
  process.stdin.on("data", (d) => (input += d));
  process.stdin.on("end", () => {
    let event;
    try { event = JSON.parse(input); } catch { process.exit(0); } // malformed event → exit 0 quietly
    const command = event?.tool_input?.command;
    if (typeof command !== "string" || !COMMIT_RE.test(command)) process.exit(0); // scope filter: only git-commit commands

    let status;
    try { status = execSync("git status --short", { encoding: "utf8", cwd: event.cwd || process.cwd() }); }
    catch { process.exit(0); } // not a git repo / git unavailable → don't block on an unrelated failure

    if (isPrivateDirStaged(status)) {
      console.error(
        "git-precommit-privatedocs-guard · .claude/docs/other/ would reach this commit\n" +
        "  .claude/docs/other/ is local-only (ignored via .git/info/exclude) — it must never reach a commit.\n" +
        "  Fix: `git restore --staged .claude/docs/other/` (or unstage the specific file), then commit again.\n" +
        "  If this looks wrong, report it against CLAUDE.md's own guard — do not bypass with --no-verify."
      );
      process.exit(2); // block; stderr is fed back
    }
    process.exit(0);
  });
}
