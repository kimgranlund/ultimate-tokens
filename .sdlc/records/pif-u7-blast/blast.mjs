const F = process.argv[2];
const load = async (root) => ({
  M: await import(`${root}/src/ui/model.mjs`),
  P: await import(`${root}/src/ui/persist.js`),
  D: await import(`${root}/src/engine/derive.mjs`),
});
const A = await load(`${F}/ub`), B = await load(`${F}/neg`);
const CATS = ["architecture","cuisine","film","literature","music","nature","travel","brands"];
const docs = [["default", A.M.defaultDocument()]];
for (const c of CATS) { const { PRESETS } = await import(`${F}/neg/src/ui/categories/${c}.js`); for (const p of PRESETS) docs.push([`${c}/${p.name.slice(0,30)}`, { ...A.M.defaultDocument(), palettes: p.palettes, hueSpace: p.hueSpace ?? "oklch" }]); }
let neutralFlip = 0, primaryMoved = 0, relMoved = 0, total = 0, ex = [];
const isN = (p, vp) => /\b(neutral|grey|gray)\b/i.test(p.name||"") || (vp.keyOklch[1] < 0.02);
const order = (doc, view) => { const idx = doc.palettes.map((_, i) => i).filter((i) => view.palettes[i] && view.palettes[i].key); const non = idx.filter(i=>!isN(doc.palettes[i], view.palettes[i])), neu = idx.filter(i=>isN(doc.palettes[i], view.palettes[i])); return [...non, ...neu]; };
for (const [name, doc0] of docs) {
  const va = A.M.projectView(A.P.hydrate(doc0)), vb = B.M.projectView(B.P.hydrate(doc0));
  const d = A.P.hydrate(doc0);
  total++;
  d.palettes.forEach((p, i) => { if (isN(p, va.palettes[i]) !== isN(p, vb.palettes[i])) neutralFlip++; });
  const oa = order(d, va), ob = order(d, vb);
  if (oa[0] !== ob[0]) { primaryMoved++; if (ex.length < 3) ex.push(`${name}: primary idx ${oa[0]} -> ${ob[0]}`); }
  const sa = oa.map(i => va.palettes[i].keyOklch), sb = ob.map(i => vb.palettes[i].keyOklch);
  const ra = A.D.deriveRelative("extend", sa), rb = B.D.deriveRelative("extend", sb);
  if (Math.hypot(ra[0]-rb[0], ra[1]-rb[1]) > 1e-3 || Math.abs(ra[2]-rb[2]) > 0.5) { relMoved++; if (name === "default") ex.push(`default Relative extend: [${ra.map(x=>x.toFixed(3))}] -> [${rb.map(x=>x.toFixed(3))}]`); }
}
console.log({ total, neutralFlip, primaryMoved, relMoved }); console.log(ex.join("\n"));
