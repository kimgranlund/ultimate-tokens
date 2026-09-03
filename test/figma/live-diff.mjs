#!/usr/bin/env node
// live-diff.mjs — verifier for the PURE apply-vs-live comparison (figma/binder/live-diff.mjs), the
// Geometry/Type counterpart to Color's ad-hoc drift diff (TKT-0020 / collections-arch review C2). No
// figma calls; the read-back SHAPE this diffs against is proven separately over a mock in
// test/figma/plugin.mjs's "readfloat" gate.
import * as D from "../../figma/binder/live-diff.mjs";
import * as A from "../../figma/binder/mode-apply-plan.mjs";
import * as T from "../../src/engine/type.mjs";

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const J = (x) => JSON.stringify(x);

// ── flattenModePlanValues: every (variable, mode) pair a modeApplyPlan entry writes ──
const typeIx = T.typeTokensFigmaModes(T.typeScale({ treatment: "product", bodyBase: 16 }), [{ name: "Mobile", scale: T.typeScale({ treatment: "product", bodyBase: 13 }) }]);
const plan = A.modeApplyPlan(typeIx)[0];
const flat = D.flattenModePlanValues(plan);
ok(flat.length === plan.variables.length * plan.modes.length, `flattenModePlanValues: ${flat.length} pairs, want ${plan.variables.length * plan.modes.length} (one per variable×mode)`);
ok(flat.every((p) => typeof p.name === "string" && typeof p.mode === "string"), "flattenModePlanValues: every pair carries a name + mode");
ok(D.flattenModePlanValues(null).length === 0 && D.flattenModePlanValues({}).length === 0, "flattenModePlanValues: malformed input ⇒ []");

// ── flattenModePlanValues ALSO correctly flattens a primitivesModesApplyPlan-shaped fixture (font-mode
// Phase B): its literals carry the SAME {name,type,values:[{mode,value}]} shape modeApplyPlan uses, so
// no dedicated Type Primitives flattener is needed — its ALIAS entries (no .values array) are skipped
// by the SAME !Array.isArray(v.values) guard that already handles a malformed/absent values field,
// for free.
const primPlan = {
  collection: "Type Primitives", modes: ["Premium", "Google Fonts"], defaultMode: "Premium", addModes: ["Google Fonts"],
  variables: [
    { name: "family/inter", type: "STRING", values: [{ mode: "Premium", value: "Inter" }, { mode: "Google Fonts", value: "Inter" }] },
    { name: "weight/display", type: "FLOAT", values: [{ mode: "Premium", value: 700 }, { mode: "Google Fonts", value: 700 }] },
    { name: "font/display", type: "ALIAS", target: "family/inter" },
  ],
};
const primFlat = D.flattenModePlanValues(primPlan);
ok(primFlat.length === 4, `flattenModePlanValues on a Type Primitives plan: ${primFlat.length} entries, want 4 (2 literals × 2 modes; the ALIAS entry has no .values array to flatten)`);
ok(!primFlat.some((p) => p.name === "font/display"), "flattenModePlanValues: the ALIAS entry (no .values array) contributes nothing");
ok(primFlat.every((p) => primPlan.modes.includes(p.mode)), "flattenModePlanValues: every entry carries one of the plan's own modes");

// ── countChangedValues: the core diff — only a value that's THERE and DIFFERENT counts ──
const pairs = [{ name: "a", mode: "Base", value: 10 }, { name: "b", mode: "Base", value: 20 }];
ok(D.countChangedValues(pairs, { a: { Base: 10 }, b: { Base: 20 } }) === 0, "countChangedValues: identical live values ⇒ 0");
ok(D.countChangedValues(pairs, { a: { Base: 99 }, b: { Base: 20 } }) === 1, "countChangedValues: one drifted value ⇒ 1");
ok(D.countChangedValues(pairs, { a: { Base: 1 }, b: { Base: 2 } }) === 2, "countChangedValues: both drifted ⇒ 2");
// a NEW variable/mode (absent from the live read) is NOT a change — nothing to overwrite yet
ok(D.countChangedValues(pairs, {}) === 0, "countChangedValues: nothing live yet (first apply) ⇒ 0, not counted as changed");
ok(D.countChangedValues(pairs, { a: { Base: 10 } }) === 0, "countChangedValues: 'b' absent from live ⇒ not counted");
ok(D.countChangedValues([{ name: "a", mode: "Mobile", value: 5 }], { a: { Base: 5 } }) === 0, "countChangedValues: a mode absent from live ⇒ not counted");
// a floating-point epsilon must not false-positive
ok(D.countChangedValues([{ name: "a", mode: "Base", value: 16.000000001 }], { a: { Base: 16 } }) === 0, "countChangedValues: sub-epsilon float drift ⇒ not counted");
ok(D.countChangedValues([{ name: "a", mode: "Base", value: 16.01 }], { a: { Base: 16 } }) === 1, "countChangedValues: a real float drift ⇒ counted");
// strings compare strictly (Type Primitives family literals)
ok(D.countChangedValues([{ name: "family/inter", mode: "Value", value: "Inter" }], { "family/inter": { Value: "Inter" } }) === 0, "countChangedValues: identical string ⇒ 0");
ok(D.countChangedValues([{ name: "family/inter", mode: "Value", value: "Inter" }], { "family/inter": { Value: "Roboto" } }) === 1, "countChangedValues: drifted string ⇒ 1");
ok(D.countChangedValues(null, { a: { Base: 1 } }) === 0, "countChangedValues: malformed pairs ⇒ 0, never throws");
ok(D.countChangedValues(pairs, null) === 0, "countChangedValues: null live (collection not found) ⇒ 0, never throws");

// ── an end-to-end shape: a real plan diffed against a synthetic 'live' read that drifted one value ──
{
  const bodyMd = plan.variables.find((v) => v.name === "type/body/md/size");
  const liveBase = bodyMd.values.find((v) => v.mode === "Base").value;
  const live = { "type/body/md/size": { Base: liveBase + 3, Mobile: bodyMd.values.find((v) => v.mode === "Mobile").value } };
  const n = D.countChangedValues(D.flattenModePlanValues(plan), live);
  ok(n === 1, `end-to-end: exactly the one hand-tweaked (Base) value counts, got ${n}`);
}

if (fails.length) { console.error(`live-diff FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("live-diff PASS — flattenModePlanValues (Geometry + Type Primitives shapes, alias-dropping) · countChangedValues (present+differs only, float epsilon, string-strict)");
process.exit(0);
