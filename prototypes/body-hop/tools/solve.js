#!/usr/bin/env node
// Solver and level checker for Body Hop. Uses the game's own engine.js.
//   node tools/solve.js            check every level in levels.js (exit 1 on any failure)
//   node tools/solve.js plan [n]   print the optimal move list for level n (1-based) or all
//   node tools/solve.js file.txt   analyse an ad-hoc map (one level, plain text)
//   node tools/solve.js luck       per level: share of 1000 random-play runs (300 moves each) that win
// Checks a level can declare (each is verified by re-solving under a restriction that must make it unsolvable):
//   "needs:G" / "needs:C"  unsolvable if you may never hop into that body type
//   "reenter"              unsolvable if each body may be entered only once (you must go back to a parked body)
//   "plate"                unsolvable if plates are taken out (gates become walls)
//   "door"                 unsolvable if locked doors are walls
//   "doorstop"             unsolvable if a body in a gate does not hold it open
const BH = require("../engine.js");
const LEVELS = require("../levels.js");
const DIRS = Object.keys(BH.DIRS);
const LETTER = { up: "U", down: "D", left: "L", right: "R" };

function solve(level, opt = {}) {
  let L = BH.parse(level);
  if (opt.swap) L = { ...L, tiles: L.tiles.map((r) => r.map((c) => opt.swap[c] || c)) };
  if (opt.noDoorstop) L = { ...L, noDoorstop: true };
  const startKey = (s) => BH.key(s) + (opt.once ? "|" + s.entered : "");
  const start = { ...L.start, entered: 0 };
  const seen = new Map([[startKey(start), null]]);
  const states = [start];
  const edges = []; // for dead-end analysis: [from, to]
  const index = new Map([[startKey(start), 0]]);
  let goal = -1;
  for (let i = 0; i < states.length; i++) {
    const s = states[i];
    if (BH.won(L, s)) { if (goal < 0) goal = i; if (!opt.full) break; continue; }
    if (opt.cap && states.length > opt.cap) return { L, solvable: false, capped: true, states: states.length };
    for (const d of DIRS) {
      const r = BH.step(L, s, d);
      if (!r.state) continue;
      const ns = r.state;
      ns.entered = s.entered;
      if (r.kind === "hop") {
        const t = L.types[ns.ctrl];
        if (opt.forbid && opt.forbid.includes(t)) continue;
        if (opt.forbidIdx !== undefined && opt.forbidIdx === ns.ctrl) continue;
        if (opt.once) { if (s.entered & (1 << ns.ctrl)) continue; ns.entered = s.entered | (1 << ns.ctrl); }
      }
      const k = startKey(ns);
      let j = index.get(k);
      if (j === undefined) { j = states.length; index.set(k, j); states.push(ns); seen.set(k, { from: i, dir: d, kind: r.kind }); }
      edges.push([i, j]);
    }
  }
  const res = { L, solvable: goal >= 0, states: states.length };
  if (goal >= 0) {
    const path = [];
    for (let k = startKey(states[goal]); seen.get(k); ) { const p = seen.get(k); path.unshift(p); k = startKey(states[p.from]); }
    res.moves = path.map((p) => LETTER[p.dir]).join("");
    res.turns = path.length;
    res.hops = path.filter((p) => p.kind === "hop").length;
    // Which bodies the optimal route uses, in order of first entry.
    res.order = [];
    // Readable route: "spirit RR > hop G0 > G0 DDL > ..."
    const parts = [];
    let st = states[0], who = "spirit", run = "";
    for (const p of path) {
      const r = BH.step(L, st, p.dir); st = r.state;
      if (p.kind === "hop") {
        res.order.push(L.types[st.ctrl] + st.ctrl);
        if (run) parts.push(`${who} ${run}`);
        who = L.types[st.ctrl] + st.ctrl; run = ""; parts.push(`hop ${who}`);
      } else run += LETTER[p.dir];
    }
    if (run) parts.push(`${who} ${run}`);
    res.route = parts.join(" > ");
  }
  if (opt.full) {
    // Dead ends: reachable states from which the exit can no longer be reached (undo needed).
    const rev = states.map(() => []);
    for (const [a, b] of edges) rev[b].push(a);
    const good = new Uint8Array(states.length);
    const q = [];
    states.forEach((s, i) => { if (BH.won(L, s)) { good[i] = 1; q.push(i); } });
    while (q.length) { const b = q.pop(); for (const a of rev[b]) if (!good[a]) { good[a] = 1; q.push(a); } }
    res.deadPct = Math.round(100 * (1 - good.reduce((a, b) => a + b, 0) / states.length));
    res.startDead = !good[0];
  }
  return res;
}

const CHECKS = ["needs:G", "needs:C", "reenter", "plate", "door", "doorstop"];
function restriction(c) {
  if (c.startsWith("needs:")) return { forbid: [c.slice(6)] };
  return { reenter: { once: true }, plate: { swap: { "_": ".", "|": "#" } }, door: { swap: { "D": "#" } }, doorstop: { noDoorstop: true } }[c];
}

// Brute-force proxy: how often a player pressing random arrows (no-ops skipped) reaches the exit
// within a move budget. High = the level falls to trial and error; hard levels should be near 0%.
function luck(level, runs = 1000, budget = 300, seed = 7) {
  const L = BH.parse(level);
  let s0 = seed, wins = 0;
  const rnd = () => { s0 = (s0 + 0x6d2b79f5) | 0; let t = s0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let r = 0; r < runs; r++) {
    let s = L.start;
    for (let m = 0; m < budget; m++) {
      const opts = DIRS.map((d) => BH.step(L, s, d)).filter((x) => x.state);
      if (!opts.length) break;
      s = opts[Math.floor(rnd() * opts.length)].state;
      if (BH.won(L, s)) { wins++; break; }
    }
  }
  return wins / runs;
}

function check(level) {
  const r = solve(level, { full: true });
  const problems = [];
  if (!r.solvable) problems.push("UNSOLVABLE");
  if (level.par !== undefined && r.turns !== level.par) problems.push(`par ${level.par} but optimal is ${r.turns}`);
  for (const c of level.checks || []) {
    const o = restriction(c);
    if (!o) { problems.push(`unknown check ${c}`); continue; }
    if (solve(level, o).solvable) problems.push(`check '${c}' fails: solvable without it`);
  }
  return { r, problems };
}

function fmt(i, level, r, problems) {
  const head = `${String(i + 1).padStart(2)} ${level.name.padEnd(26)}`;
  if (!r.solvable) return `${head} UNSOLVABLE  ${problems.join("; ")}`;
  return `${head} turns ${String(r.turns).padStart(3)}  hops ${r.hops}  order ${r.order.join(">").padEnd(16)} states ${String(r.states).padStart(6)}  dead ${String(r.deadPct).padStart(2)}%  ${problems.length ? "FAIL: " + problems.join("; ") : "ok"}`;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === "luck") {
    LEVELS.forEach((l, i) => console.log(`${String(i + 1).padStart(2)} ${l.name.padEnd(24)} random solve ${(100 * luck(l)).toFixed(1).padStart(5)}%`));
  } else if (args[0] === "plan") {
    const n = args[1] ? [Number(args[1]) - 1] : LEVELS.map((_, i) => i);
    for (const i of n) { const r = solve(LEVELS[i]); console.log(`${i + 1} ${LEVELS[i].name}: ${r.solvable ? r.moves + "\n   " + r.route : "UNSOLVABLE"}`); }
  } else if (args[0]) {
    const map = require("fs").readFileSync(args[0], "utf8").replace(/\n+$/, "").split("\n");
    const level = { name: args[0], map };
    const { r } = check(level);
    console.log(fmt(0, level, r, []));
    if (r.solvable) console.log("route", r.route);
    for (const c of CHECKS) console.log(`  without ${c.padEnd(8)}: ${solve(level, restriction(c)).solvable ? "still solvable" : "unsolvable (required)"}`);
  } else {
    let bad = 0;
    LEVELS.forEach((level, i) => { const { r, problems } = check(level); if (problems.length) bad++; console.log(fmt(i, level, r, problems)); });
    process.exit(bad ? 1 : 0);
  }
}
module.exports = { solve, check, luck };
