const R = process.argv[2];
const M = await import(`${R}/src/ui/model.mjs`); const P = await import(`${R}/src/ui/persist.js`);
const v = M.projectView(P.hydrate(M.defaultDocument()));
let worst = 0;
for (const p of v.palettes) { const ref = M.hexToOklch(p.key); const d = Math.max(Math.abs(ref[0]-p.keyOklch[0]), Math.abs(ref[1]-p.keyOklch[1]), Math.min(Math.abs(ref[2]-p.keyOklch[2]), 360-Math.abs(ref[2]-p.keyOklch[2]))*(ref[1]>0.01?1:0)); worst = Math.max(worst, d); }
console.log("default kit: max |keyOklch - hexToOklch(key)|", worst.toExponential(2), "palettes", v.palettes.length);
