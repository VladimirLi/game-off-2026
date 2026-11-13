#!/usr/bin/env node
// Random level search: generates small rooms and keeps the ones the solver finds interesting.
//   node tools/gen.js <tries> <seed> [w] [h] [bodies e.g. GC|GCC|GGC]
// Prints the best candidates as plain maps. They are raw material for hand design, not finished levels.
const BH = require("../engine.js");
const { solve } = require("./solve.js");
const [tries = 20000, seed0 = 1, W = 9, H = 7, BODIES = "GC"] = process.argv.slice(2).map((a, i) => (i < 4 ? Number(a) : a));
let seed = seed0;
const rnd = () => { // mulberry32
  seed = (seed + 0x6d2b79f5) | 0; let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (a) => a[Math.floor(rnd() * a.length)];
const WEIGHTS = [[".", 50], ["#", 22], ["R", 6], ["B", 6], ["~", 5], ["r", 2], ["b", 2], ["D", 2], ["V", 2], ["|", 2], ["_", 1]];
const TOTAL = WEIGHTS.reduce((a, [, w]) => a + w, 0);
function tile() { let r = rnd() * TOTAL; for (const [c, w] of WEIGHTS) if ((r -= w) < 0) return c; return "."; }

function make() {
  const g = [];
  for (let y = 0; y < H; y++) { const row = []; for (let x = 0; x < W; x++) row.push(x === 0 || y === 0 || x === W - 1 || y === H - 1 ? "#" : tile()); g.push(row); }
  const free = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) free.push([x, y]);
  const take = () => { const i = Math.floor(rnd() * free.length); return free.splice(i, 1)[0]; };
  for (const ch of "SE" + BODIES) { const [x, y] = take(); g[y][x] = ch; }
  const hasGate = g.flat().includes("|"), hasPlate = g.flat().includes("_");
  if (hasGate && !hasPlate) { const [x, y] = take(); g[y][x] = "_"; }
  if (hasPlate && !hasGate) { const [x, y] = take(); g[y][x] = "|"; }
  return g.map((r) => r.join(""));
}

function score(map) {
  const level = { name: "gen", map };
  const r = solve(level, { cap: 60000 });
  if (!r.solvable || r.turns < 12 || r.hops < 3) return null;
  const n = BODIES.length;
  for (let i = 0; i < n; i++) if (solve(level, { forbidIdx: i, cap: 60000 }).solvable) return null; // every body needed
  const reenter = !solve(level, { once: true, cap: 60000 }).solvable;
  const special = map.join("").replace(/[#.SEGC]/g, "").length;
  // Unused specials are noise: count the tile kinds whose removal changes nothing.
  return { map, turns: r.turns, hops: r.hops, reenter, special, states: r.states,
    score: (reenter ? 10 : 0) + Math.min(r.turns, 30) / 3 + Math.min(r.hops, 5) - special * 0.8 };
}

function valid(map, minTurns) {
  const level = { name: "gen", map };
  const r = solve(level, { cap: 60000 });
  if (!r.solvable || r.turns < minTurns) return null;
  for (let i = 0; i < BODIES.length; i++) if (solve(level, { forbidIdx: i, cap: 60000 }).solvable) return null;
  if (solve(level, { once: true, cap: 60000 }).solvable) return null;
  return r;
}

// Greedily replace special tiles by floor or wall while the level keeps every body needed,
// still needs a re-entry, and gets no shorter. What is left is tiles that matter.
function simplify(map) {
  let cur = map.slice();
  const base = valid(cur, 0);
  if (!base) return map;
  let changed = true;
  while (changed) {
    changed = false;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const ch = cur[y][x];
      if (!"RBrbDV|_~".includes(ch)) continue;
      for (const rep of [".", "#"]) {
        const m = cur.slice(); m[y] = m[y].slice(0, x) + rep + m[y].slice(x + 1);
        if (valid(m, base.turns)) { cur = m; changed = true; break; }
      }
    }
  }
  return cur;
}

// Keep a wide pool, then simplify it and keep only rooms where colour still matters.
const pool = [];
for (let t = 0; t < tries; t++) {
  const s = score(make());
  if (!s || !s.reenter) continue;
  pool.push(s); pool.sort((a, b) => b.score - a.score); if (pool.length > 60) pool.pop();
}
const best = pool;
for (const b of best) { b.map = simplify(b.map); b.colour = /[RBrb]/.test(b.map.join("")); const r = solve({ name: "g", map: b.map }); b.turns = r.turns; b.hops = r.hops; b.special = b.map.join("").replace(/[#.SEGC]/g, "").length; }
best.sort((a, b) => (b.colour - a.colour) || (a.special - b.special) || (a.turns - b.turns));
for (const b of best.filter((b) => b.colour && b.turns <= 32).slice(0, 15)) console.log(`turns ${b.turns} hops ${b.hops} reenter ${b.reenter} special ${b.special}\n${b.map.join("\n")}\n`);
