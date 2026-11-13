#!/usr/bin/env node
// Every-tile-matters check: replaces each special tile with floor, then with wall, and reports
// what changes (par, solvability, declared checks). A tile whose replacements change nothing is noise.
//   node tools/ablate.js            all levels in levels.js
//   node tools/ablate.js 7          one level (1-based)
const { solve, check } = require("./solve.js");
const LEVELS = require("../levels.js");
const SPECIAL = "RBrbDV|_~";
function ablate(level) {
  const base = solve(level);
  const out = [];
  level.map.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!SPECIAL.includes(ch)) return;
    const effects = [];
    for (const rep of [".", "#"]) {
      const map = level.map.slice(); map[y] = row.slice(0, x) + rep + row.slice(x + 1);
      const v = { ...level, map, par: undefined };
      const r = solve(v);
      if (!r.solvable) { effects.push(`${rep === "." ? "floor" : "wall"}: unsolvable`); continue; }
      const broken = check(v).problems.filter((p) => p.startsWith("check"));
      const bits = [];
      if (r.turns !== base.turns) bits.push(`par ${base.turns}->${r.turns}`);
      if (broken.length) bits.push(broken.map((p) => p.match(/'([^']+)'/)[1]).join("+") + " broken");
      effects.push(`${rep === "." ? "floor" : "wall"}: ${bits.length ? bits.join(", ") : "no change"}`);
    }
    const noise = effects.every((e) => e.endsWith("no change"));
    out.push(`  ${ch} at ${x},${y}  ${effects.join(" | ")}${noise ? "   <-- NOISE" : ""}`);
  }));
  return out;
}
if (require.main === module) {
  const n = process.argv[2] ? [Number(process.argv[2]) - 1] : LEVELS.map((_, i) => i);
  for (const i of n) { console.log(`${i + 1} ${LEVELS[i].name}`); console.log(ablate(LEVELS[i]).join("\n") || "  (no special tiles)"); }
}
module.exports = { ablate };
