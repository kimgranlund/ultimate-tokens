// plugin/color-tokens.mjs — the ultimate-tokens PLUGIN skill gate: the color-tokens consumption
// skill must stay in parity with the product's canonical role table (every --c- token it names is a
// real role; the role count it claims matches). The check itself lives WITH the skill
// (plugin/.../scripts/role-parity.mjs) so the shipped plugin carries its own gate; this wrapper
// runs it inside npm test so a role change reddens the suite until the skill is serviced.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT = join(ROOT, "plugin/ultimate-tokens/skills/color-tokens/scripts/role-parity.mjs");
if (!existsSync(SCRIPT)) { console.error("plugin FAIL: role-parity.mjs missing"); process.exit(1); }

const r = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
if (r.status !== 0) { console.error("plugin FAIL: color-tokens skill drifted from the role table"); process.exit(1); }

// Negative control (TKT #527): a count word role-parity's NUM_WORD parser can't resolve (e.g. a
// future two-digit/magnitude drift like "hundred") must FAIL LOUDLY, never silently no-op. A
// happy-path pass alone doesn't prove the loud-failure branch actually fires, so exercise it
// directly against a throwaway fixture skill dir via the ROLE_PARITY_SKILL_DIR test hook.
const fixture = mkdtempSync(join(tmpdir(), "role-parity-fixture-"));
try {
  mkdirSync(join(fixture, "references"));
  writeFileSync(join(fixture, "SKILL.md"), "# Fixture\n\nThe default kit ships hundred palettes.\n");
  const neg = spawnSync(process.execPath, [SCRIPT], {
    encoding: "utf8",
    env: { ...process.env, ROLE_PARITY_SKILL_DIR: fixture },
  });
  if (neg.status === 0) {
    console.error("plugin FAIL: role-parity silently passed an unrecognized count word (\"hundred palettes\") instead of failing loudly");
    process.exit(1);
  }
  if (!/hundred/.test(neg.stderr) || !/outside the range/.test(neg.stderr)) {
    console.error("plugin FAIL: role-parity failed on the out-of-range word but without a named, explicit error:");
    process.stderr.write(neg.stderr || "");
    process.exit(1);
  }
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

console.log("plugin PASS — color-tokens skill in parity with the canonical role table (incl. loud-failure negative control)");
process.exit(0);
