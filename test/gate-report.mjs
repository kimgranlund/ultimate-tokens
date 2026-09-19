// gate-report.mjs -- the shared REPORT-block printer + report-static self-check for this repo's
// gate files (#699, factoring out the pattern #695 introduced in test/engine/tonal.mjs). Each gate
// file keeps its own `fails` array, its own FAIL(name, msg) => fails.push(`${name}: ${msg}`)
// helper, and its own row wording elsewhere in the file; this module only decides which gate
// names print and whether the file's DECLARED list agrees with its real FAIL(...) call sites.
//
// Why a shared module instead of 12 copies of the same block: a copy drifts (that's the bug this
// ticket is fixing in the first place -- a hand-written list nobody has to keep in sync with the
// real call sites). One implementation means one place to fix if the pattern itself needs to
// change.
//
// Non-literal gate names: a FAIL(...) call site's first argument is usually a literal string,
// which a plain regex over the source finds directly. test/engine/exports.mjs instead binds a
// per-block const named G to a literal gate name and passes that variable as the first argument
// throughout the block -- the ticket's own "14 dead names" claim turned out to be exactly this: 14
// real, live gates the naive grep couldn't see because it only looked for a literal string as
// FAIL's first argument. siteNamesIn() below also resolves that pattern: any const/let binding
// whose value is a literal string, and whose name is later used as a FAIL(...) first argument,
// contributes its literal value as a real call site too. This is a heuristic, not a scope-aware
// evaluator -- it does not verify the binding and the FAIL(...) call share a lexical scope -- but
// it is enough to clear every non-literal case actually present in this repo (documented above),
// and a false "site exists" from it is far cheaper than a real gate wrongly declared dead.
import { readFileSync } from "node:fs";

const LITERAL_CALL = /FAIL\(\s*"([^"]+)"/g;
const VAR_CALL = /FAIL\(\s*([A-Za-z_$][\w$]*)\s*,/g;
const VAR_ASSIGN = /\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*"([^"]+)"/g;

function siteNamesIn(url) {
  const src = readFileSync(new URL(url), "utf8");
  const names = new Set([...src.matchAll(LITERAL_CALL)].map((m) => m[1]));
  const usedVars = new Set([...src.matchAll(VAR_CALL)].map((m) => m[1]));
  for (const m of src.matchAll(VAR_ASSIGN)) if (usedVars.has(m[1])) names.add(m[2]);
  return names;
}

// Prints the REPORT block's rows and runs the report-static self-check. `declared` must include
// "report-static" for that gate's own row to show: its call sites live in THIS file (immediately
// below), not in the caller, so the self-check unions the caller's own source (`selfUrl`) with
// this module's own source (found via its own `import.meta.url`) when looking for a "report-static"
// call site -- a caller never needs its own report-static call site written out for this to work.
//
// `fails` is the caller's own array (its FAIL(...) helper already pushes "name: message" strings
// into it); `FAIL` is that same caller helper, passed back in so the two self-check failures below
// land in the caller's own array the same way every other failure does. Returns the report-static
// failures this call appended, mainly so a caller (or a scratch test) can inspect them directly.
export function gateReport({ fails, declared, selfUrl, FAIL }) {
  const before = fails.length;
  const siteNames = new Set([...siteNamesIn(selfUrl), ...siteNamesIn(import.meta.url)]);
  for (const name of declared) {
    if (!siteNames.has(name)) FAIL("report-static", `declared gate "${name}" has no matching FAIL(...) call site in this file (dead entry or a typo)`);
  }
  for (const name of siteNames) {
    if (!declared.includes(name)) FAIL("report-static", `a FAIL(...) call site uses gate name "${name}", which is not in the REPORT block's declared list`);
  }
  const failedNames = [...new Set(fails.map((f) => f.slice(0, f.indexOf(":"))))];
  const printed = [...declared, ...failedNames.filter((g) => !declared.includes(g))];
  for (const g of printed) {
    const f = fails.find((x) => x.startsWith(g + ":"));
    console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
    if (f && !declared.includes(g)) console.log(`  !!! "${g}" is not in the REPORT block's declared list above; add it, this gate's failures were invisible until now !!!`);
  }
  return fails.slice(before);
}
