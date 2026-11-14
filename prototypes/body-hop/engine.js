// Body Hop rules engine. Shared by the browser game (index.html) and the solver (tools/solve.js),
// so the solver checks exactly the rules the game plays.
//
// Rules v2 (parked bodies):
// - One arrow press is one turn. Pressing toward a free tile walks there.
//   Pressing toward a body hops into it. Your old body stays where it is, asleep ("parked").
// - The spirit exists only at the start. Its first hop uses it up; there is no "leave body" action.
// - Every body occupies its tile, parked or not. Nothing walks through a body, and bodies are never pushed.
// - You can hop into any orthogonally adjacent body, including one you left earlier.
// - A hop is not a walk: only adjacency matters, so a guard can hop into a cat standing inside a red block.
// - Colour vision: a body's own colour is real to it, the other colour is not.
//   Real block = wall, real bridge = floor. Unreal block = floor, unreal bridge = pit.
//   The spirit sees no colour: coloured things are fog it cannot pass (blocks are walls, bridges are pits).
// - Guard (sees red): carries the key, so locked doors are guard-only tiles.
// - Cat (sees blue): the only one small enough for vents, so vents are cat-only tiles.
// - Plates: a body on a plate (parked or not) holds it down. The spirit weighs nothing.
//   Gates share one channel: every gate is open while any plate is held, or while a body stands in any gate
//   (a body is a doorstop for all of them).
// - Win: you (the body you are in, or the spirit) step onto the exit. No death; undo and restart.
(function (root) {
  "use strict";

  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const NAMES = { S: "spirit", G: "guard", C: "cat" };
  const LEGEND = {
    "#": "wall", ".": "floor", " ": "void",
    "R": "red block", "B": "blue block",
    "r": "red bridge", "b": "blue bridge", "~": "pit",
    "D": "locked door", "V": "vent", "E": "exit",
    "_": "plate", "|": "gate",
    "S": "spirit start", "G": "guard", "C": "cat",
  };

  // Entity letters stand on plain floor. To start a body on another tile, give the level
  // an "on" map: { "x,y": "R" } puts that tile under the entity at x,y.
  function parse(level) {
    const rows = level.map;
    const h = rows.length, w = Math.max(...rows.map((r) => r.length));
    const tiles = [];
    let spirit = null;
    const bodies = [];
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        let ch = rows[y][x] || " ";
        if (!(ch in LEGEND)) throw new Error(`${level.name}: unknown tile '${ch}' at ${x},${y}`);
        if (ch === "S" || ch === "G" || ch === "C") {
          if (ch === "S") spirit = [x, y]; else bodies.push({ type: ch, x, y });
          ch = (level.on && level.on[x + "," + y]) || ".";
        }
        row.push(ch);
      }
      tiles.push(row);
    }
    if (!spirit) throw new Error(`${level.name}: no spirit start`);
    return { name: level.name, w, h, tiles, types: bodies.map((b) => b.type),
      start: { ctrl: -1, sx: spirit[0], sy: spirit[1], pos: bodies.map((b) => [b.x, b.y]) } };
  }

  function bodyAt(s, x, y) {
    for (let i = 0; i < s.pos.length; i++) if (s.pos[i][0] === x && s.pos[i][1] === y) return i;
    return -1;
  }

  function platesHeld(L, s) {
    for (const [x, y] of s.pos) if (L.tiles[y][x] === "_") return true;
    return false;
  }

  function gateOpen(L, s) {
    if (platesHeld(L, s)) return true;
    if (L.noDoorstop) return false; // solver-only variant, used to prove a level needs the doorstop
    for (const [x, y] of s.pos) if (L.tiles[y][x] === "|") return true;
    return false;
  }

  // Is tile (x, y) real ground for an entity of type t ("S", "G", "C") in state s? Bodies are not considered.
  function canEnter(L, s, t, x, y) {
    if (x < 0 || y < 0 || x >= L.w || y >= L.h) return false;
    switch (L.tiles[y][x]) {
      case ".": case "E": case "_": return true;
      case "R": return t === "C";   // red block: wall to the guard, not there for the cat
      case "B": return t === "G";
      case "r": return t === "G";   // red bridge: floor to the guard, a pit for the cat
      case "b": return t === "C";
      case "D": return t === "G";
      case "V": return t === "C";
      case "|": return gateOpen(L, s);
    }
    return false; // wall, void, pit
  }

  function current(L, s) {
    if (s.ctrl < 0) return { t: "S", x: s.sx, y: s.sy };
    return { t: L.types[s.ctrl], x: s.pos[s.ctrl][0], y: s.pos[s.ctrl][1] };
  }

  // Returns { state, kind: "move"|"hop" } or { state: null, why } when the press does nothing.
  function step(L, s, dir) {
    const [dx, dy] = DIRS[dir];
    const me = current(L, s);
    const nx = me.x + dx, ny = me.y + dy;
    const other = bodyAt(s, nx, ny);
    if (other >= 0) return { state: { ctrl: other, sx: -1, sy: -1, pos: s.pos }, kind: "hop" };
    if (!canEnter(L, s, me.t, nx, ny)) return { state: null, why: blockedWhy(L, me.t, nx, ny) };
    if (s.ctrl < 0) return { state: { ctrl: -1, sx: nx, sy: ny, pos: s.pos }, kind: "move" };
    const pos = s.pos.slice();
    pos[s.ctrl] = [nx, ny];
    return { state: { ctrl: s.ctrl, sx: -1, sy: -1, pos }, kind: "move" };
  }

  // Text for a refused press. It says the move was blocked and why; nothing ever dies.
  function blockedWhy(L, t, x, y) {
    const who = `the ${NAMES[t]}`;
    if (x < 0 || y < 0 || x >= L.w || y >= L.h) return `Blocked: ${who} can't walk through a wall.`;
    const ch = L.tiles[y][x];
    const col = ch === "R" || ch === "r" ? "red" : "blue";
    switch (ch) {
      case "R": case "B": return t === "S"
        ? `Blocked: the spirit can't pass a ${col} block.`
        : `Blocked: ${who} sees ${col}, so the ${col} block is a wall to it.`;
      case "r": case "b": return t === "S"
        ? `Blocked: the spirit can't see bridges, so the ${col} bridge is a pit to it.`
        : `Blocked: ${who} can't see ${col}, so the ${col} bridge is a pit to it.`;
      case "~": return `Blocked: ${who} can't cross a pit.`;
      case "V": return `Blocked: only a cat fits through the vent.`;
      case "D": return `Blocked: only a guard can open the locked door.`;
      case "|": return `Blocked: the gate is shut. A body on a plate opens it.`;
    }
    return `Blocked: ${who} can't walk through a wall.`;
  }

  function won(L, s) {
    const me = current(L, s);
    return L.tiles[me.y][me.x] === "E";
  }

  function key(s) {
    let k = s.ctrl + ":" + s.sx + "," + s.sy;
    for (const p of s.pos) k += ";" + p[0] + "," + p[1];
    return k;
  }

  const API = { DIRS, NAMES, LEGEND, parse, step, won, key, current, bodyAt, canEnter, gateOpen, platesHeld };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.BodyHop = API;
})(typeof self !== "undefined" ? self : this);
