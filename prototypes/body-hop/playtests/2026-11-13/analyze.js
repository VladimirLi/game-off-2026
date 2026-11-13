// Turns playtest session logs into per-tester and per-level numbers.
const fs = require("fs"), path = require("path");
const LAB = path.join(__dirname, "sessions");
const LEVELS = require("../../levels.js");
const sessions = fs.readdirSync(LAB).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(LAB, f), "utf8")));
const perLevel = LEVELS.map((l, i) => ({ n: i + 1, name: l.name, par: l.par, reached: [], solved: [], turns: [], undos: 0, restarts: 0, calls: 0 }));
const rows = [];
for (const S of sessions) {
  const solved = new Map(); const reached = new Set(); let undos = 0, restarts = 0, skips = 0, legend = 0;
  const per = {};
  for (const c of S.calls) {
    reached.add(c.level);
    const lv = c.levelBefore;
    per[lv] = per[lv] || { calls: 0, undos: 0, restarts: 0 };
    per[lv].calls++;
    for (const k of c.keys) { if (k === "Z") { undos++; per[lv].undos++; } if (k === "R") { restarts++; per[lv].restarts++; } if (k === "ShiftN") skips++; if (k === "L") legend++; }
    if (c.won && !solved.has(c.level)) solved.set(c.level, c.turns);
  }
  const t0 = S.calls.length ? new Date(S.calls[0].t) : null, t1 = S.calls.length ? new Date(S.calls[S.calls.length - 1].t) : null;
  rows.push({ who: S.session, calls: S.calls.length, minutes: t0 ? ((t1 - t0) / 60000).toFixed(0) : 0, solved: [...solved.keys()].sort((a, b) => a - b).join(","),
    last: S.calls.length ? S.calls[S.calls.length - 1].level : "-", undos, restarts, skips, legend, notes: S.calls.filter((c) => c.note).length });
  for (const lv of reached) if (perLevel[lv - 1]) perLevel[lv - 1].reached.push(S.session);
  for (const [lv, turns] of solved) if (perLevel[lv - 1]) { perLevel[lv - 1].solved.push(S.session); perLevel[lv - 1].turns.push(turns); }
  for (const [lv, p] of Object.entries(per)) if (perLevel[lv - 1]) { perLevel[lv - 1].undos += p.undos; perLevel[lv - 1].restarts += p.restarts; perLevel[lv - 1].calls += p.calls; }
}
console.log("TESTERS\nwho      calls  min  solved levels            last  undo  restart  skip  legend  notes");
for (const r of rows) console.log(`${r.who.padEnd(8)} ${String(r.calls).padStart(5)} ${String(r.minutes).padStart(4)}  ${r.solved.padEnd(24)} ${String(r.last).padStart(4)} ${String(r.undos).padStart(5)} ${String(r.restarts).padStart(8)} ${String(r.skips).padStart(5)} ${String(r.legend).padStart(7)} ${String(r.notes).padStart(6)}`);
console.log("\nLEVELS\n #  name                   par  reached solved  median-turns  calls  undos  restarts");
for (const p of perLevel) { const t = p.turns.slice().sort((a, b) => a - b); const med = t.length ? t[Math.floor(t.length / 2)] : "-";
  console.log(`${String(p.n).padStart(2)}  ${p.name.padEnd(22)} ${String(p.par).padStart(3)}  ${String(p.reached.length).padStart(7)} ${String(p.solved.length).padStart(6)}  ${String(med).padStart(12)}  ${String(p.calls).padStart(5)}  ${String(p.undos).padStart(5)}  ${String(p.restarts).padStart(8)}`); }
if (process.argv[2] === "notes") for (const S of sessions) { console.log(`\n== ${S.session}`); for (const c of S.calls) if (c.note) console.log(`  L${c.levelBefore} t${c.turns}${c.won ? " WON" : ""}: ${c.note}`); }
