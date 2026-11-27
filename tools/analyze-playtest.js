#!/usr/bin/env node
// Playtest analysis: replays each tester's key log through the game's own rules engine, so every win
// and its turn count is exact (the in-browser log can miss a win sent together with N).
//   node tools/analyze-playtest.js <sessions-dir> [notes] [--old-legend]
// The legend is modelled as the page does it: L toggles it, and while it is open every other key
// (arrow, Z, R, N, ShiftN, Level:n) only closes it. Sessions played on a build from before 14 Nov 2026
// (commit cb9ad98 and earlier, where the legend was drawn on the canvas and keys still acted under it)
// need --old-legend, which ignores L. That covers every session in the playtests/ folder up to 2026-11-14-r1 (deleted from the repo; see git history, last present at commit 4815b55).
// The end screens are modelled too: N after winning the last main level opens the end screen (where N
// starts the Night shift and every other key does nothing), and N after the last level opens the final one.
const fs = require("fs"), path = require("path");
const BH = require("../game/engine.js");
const LEVELS = require("../game/levels.js");
const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--") && a !== "notes");
const oldLegend = args.includes("--old-legend"), showNotes = args.includes("notes");
if (!dir) { console.error("usage: node tools/analyze-playtest.js <sessions-dir> [notes] [--old-legend]"); process.exit(2); }
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
const lvStats = LEVELS.map((l) => ({ name: l.name, par: l.par, reached: 0, solved: 0, atPar: 0, turns: [], undos: 0, restarts: 0 }));
const rows = [];
// Levels in a chapter whose name starts with "Night shift" are the optional set after the main game (as in index.html).
const chapterOf = (i) => { for (let j = i; j >= 0; j--) if (LEVELS[j].chapter) return LEVELS[j].chapter; return ""; };
const mainCount = LEVELS.filter((_, i) => !/^Night shift/.test(chapterOf(i))).length;
for (const f of files) {
  const S = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  let idx = 0, L = BH.parse(LEVELS[0]), s = L.start, hist = [], turns = 0, won = false, legend = false, endScreen = null;
  const solved = new Map(), reached = new Set([0]); let undos = 0, restarts = 0;
  const load = (i) => { idx = i; L = BH.parse(LEVELS[i]); s = L.start; hist = []; turns = 0; won = false; reached.add(i); };
  const dirs = { Up: "up", Down: "down", Left: "left", Right: "right" };
  for (const c of S.calls) for (const k of c.keys) {
    if (endScreen) { if (k === "N" && endScreen === "end") { endScreen = null; load(mainCount); } continue; }
    if (k === "L") { if (!oldLegend) legend = !legend; continue; }
    if (legend) { legend = false; continue; } // the page only closes the legend on this press
    if (dirs[k]) { if (won) continue; const r = BH.step(L, s, dirs[k]); if (!r.state) continue; hist.push(s); s = r.state; turns++;
      if (BH.won(L, s)) { won = true; if (!solved.has(idx)) solved.set(idx, turns); } }
    else if (k === "Z") { undos++; lvStats[idx].undos++; if (hist.length) { s = hist.pop(); turns--; won = false; } }
    else if (k === "R") { restarts++; lvStats[idx].restarts++; load(idx); }
    else if (k === "N") { if (won && (idx === mainCount - 1 || idx === LEVELS.length - 1)) endScreen = idx === mainCount - 1 && mainCount < LEVELS.length ? "end" : "final"; else if (won) load(idx + 1); }
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
if (showNotes) for (const r of rows) { console.log(`\n== ${r.who}`); for (const c of r.S.calls) if (c.note) console.log(`  L${c.levelBefore} t${c.turns}${c.won ? " WON" : ""}: ${c.note}`); }
