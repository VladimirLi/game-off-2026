#!/usr/bin/env node
// Playtest analysis: replays each tester's key log through the game's own rules engine, so every win
// and its turn count is exact (the in-browser log can miss a win sent together with N).
//   node tools/analyze-playtest.js <sessions-dir> [notes]
const fs = require("fs"), path = require("path");
const BH = require("../engine.js");
const LEVELS = require("../levels.js");
const dir = process.argv[2];
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
const lvStats = LEVELS.map((l) => ({ name: l.name, par: l.par, reached: 0, solved: 0, atPar: 0, turns: [], undos: 0, restarts: 0 }));
const rows = [];
for (const f of files) {
  const S = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  let idx = 0, L = BH.parse(LEVELS[0]), s = L.start, hist = [], turns = 0, won = false;
  const solved = new Map(), reached = new Set([0]); let undos = 0, restarts = 0;
  const load = (i) => { idx = i; L = BH.parse(LEVELS[i]); s = L.start; hist = []; turns = 0; won = false; reached.add(i); };
  const dirs = { Up: "up", Down: "down", Left: "left", Right: "right" };
  for (const c of S.calls) for (const k of c.keys) {
    if (dirs[k]) { if (won) continue; const r = BH.step(L, s, dirs[k]); if (!r.state) continue; hist.push(s); s = r.state; turns++;
      if (BH.won(L, s)) { won = true; if (!solved.has(idx)) solved.set(idx, turns); } }
    else if (k === "Z") { undos++; lvStats[idx].undos++; if (hist.length) { s = hist.pop(); turns--; won = false; } }
    else if (k === "R") { restarts++; lvStats[idx].restarts++; load(idx); }
    else if (k === "N") { if (won && idx < LEVELS.length - 1) load(idx + 1); }
    else if (k === "ShiftN") load((idx + 1) % LEVELS.length);
    else if (/^Level:\d+$/i.test(k)) { const n = Number(k.split(":")[1]) - 1; if (n >= 0 && n < LEVELS.length) load(n); }
  }
  for (const i of reached) lvStats[i].reached++;
  for (const [i, t] of solved) { lvStats[i].solved++; lvStats[i].turns.push(t); if (t <= LEVELS[i].par) lvStats[i].atPar++; }
  rows.push({ who: S.session, calls: S.calls.length, solved: [...solved.keys()].sort((a, b) => a - b).map((i) => i + 1), atPar: [...solved].filter(([i, t]) => t <= LEVELS[i].par).length, last: idx + 1, undos, restarts, S });
}
console.log("TESTERS\nwho      calls  solved (level numbers)                         at par  last  undos  restarts");
for (const r of rows) console.log(`${r.who.padEnd(8)} ${String(r.calls).padStart(5)}  ${r.solved.join(",").padEnd(45)} ${String(r.atPar).padStart(6)} ${String(r.last).padStart(5)} ${String(r.undos).padStart(6)} ${String(r.restarts).padStart(9)}`);
console.log("\nLEVELS\n #  name                      par  reached  solved  at par  median turns  undos  restarts");
lvStats.forEach((p, i) => { const t = p.turns.slice().sort((a, b) => a - b); console.log(`${String(i + 1).padStart(2)}  ${p.name.padEnd(24)} ${String(p.par).padStart(4)}  ${String(p.reached).padStart(7)} ${String(p.solved).padStart(7)} ${String(p.atPar).padStart(7)}  ${String(t.length ? t[Math.floor(t.length / 2)] : "-").padStart(12)} ${String(p.undos).padStart(6)} ${String(p.restarts).padStart(9)}`); });
if (process.argv[3] === "notes") for (const r of rows) { console.log(`\n== ${r.who}`); for (const c of r.S.calls) if (c.note) console.log(`  L${c.levelBefore} t${c.turns}${c.won ? " WON" : ""}: ${c.note}`); }
