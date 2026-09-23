# The numbers in .sdlc/baseline.md agree with the tree they describe, and the adapter's
# time ranges agree with the baseline. Reads files and git only: no node_modules, no network.
# Usage: sh .sdlc/checks/baseline-agrees-check.sh   (from the repo root)
# A STALE head line now means only that the ref is not in origin/main's history; a note head line on a later commit is expected, counts toward neither the stale total nor the exit code, and says the tree moved since the baseline ran,
# so the numbers are unproven at that head, not that they are wrong.
node - <<'EOF'
const fs = require("fs"), cp = require("child_process");
const read = (f) => fs.readFileSync(f, "utf8");
const b = read(".sdlc/baseline.md"), a = read(".sdlc/adapter.md");
let stale = 0;
const say = (ok, line) => { if (!ok) stale++; console.log((ok ? "ok    " : "STALE ") + line); };
const row = (txt, head) => (txt.split("\n").find((l) => l.startsWith(head)) || "").split("|").map((s) => s.trim());
const tests = ((read("test/run.mjs").match(/const TESTS = \[([\s\S]*?)\];/) || ["", ""])[1].match(/"[^"]+\.mjs"/g) || []).length;
const bn = (row(b, "| `npm test` |")[5] || "").match(/all (\d+) test files passed/);
say(!!bn && +bn[1] === tests, `tests: baseline ${bn ? bn[1] : "none"}, test/run.mjs TESTS ${tests}`);
const kb = (read("figma/plugin/ui.html").length / 1024).toFixed(1);
const bs = (row(b, "| `npm run build` |")[5] || "").match(/ui\.html ([\d.]+) KB/);
say(!!bs && bs[1] === kb, `ui.html: baseline ${bs ? bs[1] : "none"} KB, tree ${kb} KB`);
const ceilBase = b.match(/^Interim ceiling: \*\*.*?expected between (\d+) and (\d+) s/m);
for (const [cmd, gate] of [["npm test", "test"], ["npm run build", "build"], ["npm run smoke", "smoke"], ["npm run gate:corpus-contrast", "corpus-contrast"], ["npm run gen:type-fonts", "fonts"]]) {
  const t = (row(b, "| `" + cmd + "` |")[4] || "").split("·").map(Number);
  const cell = row(a, "| " + gate + " |")[5] || "";
  if (gate === "test") {
    const ceilCells = [...cell.matchAll(/ceiling (\d+) to (\d+) s/g)];
    if (ceilBase || ceilCells.length) {
      const baseStr = ceilBase ? `${ceilBase[1]} to ${ceilBase[2]} s` : "none";
      const adapterStr = ceilCells.length ? ceilCells.map((m) => `${m[1]} to ${m[2]} s`).join(", ") : "none";
      const allMatch = !!ceilBase && ceilCells.length > 0 && ceilCells.every((m) => m[1] === ceilBase[1] && m[2] === ceilBase[2]);
      say(allMatch, `ceiling ${gate}: baseline ${baseStr}, adapter ${adapterStr}`);
    }
  }
  const plain = cell.replace(/ceiling \d+ to \d+ s/g, "");
  const ms = [...plain.matchAll(/(\d+) to (\d+) s/g)];
  const lo = Math.round(Math.min(...t)), hi = Math.round(Math.max(...t));
  say(t.length === 3 && t.every(Number.isFinite) && ms.length > 0 && ms.every((m) => +m[1] === lo && +m[2] === hi),
    `time ${gate}: baseline ${lo} to ${hi} s, adapter ${ms.length ? ms.map((m) => m[1] + " to " + m[2] + " s").join(", ") : "none"}`);
}
const ref = (b.match(/^ref: .*@ ([0-9a-f]{7,40})\b/m) || [])[1];
let same = false, onMain = false;
if (ref) {
  try { cp.execSync(`git diff --quiet ${ref} HEAD -- . ":(exclude).sdlc" ":(exclude).gitignore"`, { stdio: "ignore" }); same = true; } catch (e) {}
  try { cp.execSync(`git merge-base --is-ancestor ${ref} origin/main`, { stdio: "ignore" }); onMain = true; } catch (e) {}
}
console.log(same ? `ok    head: baseline ref ${ref || "none"} has the same tree as HEAD outside .sdlc/ and .gitignore` : `note  head: baseline ref ${ref || "none"}, the tree moved outside .sdlc/ and .gitignore since the baseline ran, so the numbers are unproven at this head`);
say(onMain, `head: baseline ref ${ref || "none"} is in origin/main's history`);
console.log(`stale total: ${stale}`);
process.exit(stale ? 1 : 0);
EOF
