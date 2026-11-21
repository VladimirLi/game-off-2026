// Body Hop 8-bit art: palettes, sprites and a canvas renderer (window.PixelArt), used by index.html.
// The art is drawn at 16 x 16 pixels per tile; index.html scales it up 4x with no smoothing.
(function (root) {
"use strict";
const K = 16;
const PAL = { K: "#000000", D: "#3c3c4c", M: "#7c7c8c", L: "#bcbcbc", W: "#fcfcfc", r: "#a81000", R: "#f83800", p: "#f87858", b: "#0058f8", B: "#3cbcfc", c: "#a4e4fc",
  Y: "#f8b800", y: "#fce0a8", g: "#00a800", G: "#58d854", N: "#ac7c00", n: "#503000", S: "#fcb8a0", P: "#f8a4c0", h: "#24188c" };
// The lens: each body repaints floor and walls. Floors stay light and walls dark in every lens, so the
// room's shape reads the same whoever you are.
const LENS = { S: { f: ["#80808a", "#787882"], w: ["#16161c", "#40404e"] }, G: { f: ["#ae968e", "#a68e86"], w: ["#1e1210", "#4e3430"] }, C: { f: ["#7088aa", "#6a82a4"], w: ["#0a1230", "#223e78"] } };
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (a) => "#" + a.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const mixHex = (a, b, t) => { const B = hx(b); return toHex(hx(a).map((v, i) => v + (B[i] - v) * t)); };
// 8-bit fades step in quarters instead of gliding.
function lens(from, to, t = 1) { const s = Math.floor(Math.min(1, Math.max(0, t)) * 4) / 4, A = LENS[from], B = LENS[to]; return { f: A.f.map((c, i) => mixHex(c, B.f[i], s)), w: A.w.map((c, i) => mixHex(c, B.w[i], s)) }; }
const sight = (viewer, col) => viewer === "S" ? "fog" : (viewer === "G") === (col === "R") ? "real" : "unreal";
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const prog = (t, t0, dur) => clamp01((t - t0) / dur);

// ---------- figures (v = guard's chest badge, q = cat's collar, both recolourable) ----------
const GUARD_TOP = ["......KKKK......", "....KKhhhhKK....", "...KhhhYYhhhK...", "...KKKKKKKKKK...", "....KSSSSSSK....", "....KSekSekK....", "....KSSSSSSK....", ".....KSSSSK.....", "...KKRRRRRRKK...", "..KRRRRvRRRRRK..", "..KRRRRRRRRRRK..", "..KSKRRRRRRKSK.."];
const GUARD = [[...GUARD_TOP, "...KKrrKKrrKK...", "....KhhKKhhK....", "....KKK..KKK...."], [...GUARD_TOP, "...KKrrKKrrKK...", "...KhhK..KhhK...", "..KKK......KKK.."]];
const CAT_TOP = ["................", "...K.......K....", "..KBK.....KBK...", "..KBBKKKKKBBK...", "..KBBBBBBBBBK...", "..KBekBBBekBK...", "..KBBBBPBBBBK.K.", "...KqqqqqqqK.KBK", "..KBBBBBBBBBKKBK", "..KBBccccBBBBBK.", "..KBBccccBBBBK..", "..KBBBBBBBBBK..."];
const CAT = [[...CAT_TOP, "..KBKKBKKKBKK...", "..KK..K...KK...."], [...CAT_TOP, "..KBKBKKKBKBK...", ".KK...K....KK..."]];
const SPIRIT_TOP = ["................", ".....KKKKKK.....", "....KWWWWWWK....", "...KWWWWWWWWK...", "..KWWWWWWWWWWK..", "..KWWkkWWkkWWK..", "..KWWkkWWkkWWK..", "..KWWWWWWWWWWK..", "..KWWWWWWWWWWK..", "..KWWWWWWWWWWK..", "..KLWWWWWWWWLK.."];
const SPIRIT = [[...SPIRIT_TOP, "..KLLWWLLWWLLK..", "..KLKLLKKLLKLK..", "..KK.KK..KK.KK.."], [...SPIRIT_TOP, "..KLLWWLLWWLLK..", "..KKLLKKLLKKLK..", "..K.KK..KK..KKK."]];
const ZZ = ["WWWWW", "...W.", "..W..", ".W...", "WWWWW"]; // a Z with a long diagonal, so it never reads as a 2
const ZZ_SHADOW = ZZ.map((r) => r.replace(/W/g, "K"));
// Hop marker: a chevron on the edge between you and a body next to you, pointing into it.
const CHEV_R = ["KK...", "KYK..", "KYYK.", "KYYYK", "KYYK.", "KYK..", "KK..."];
const CHEV = { right: CHEV_R, left: CHEV_R.map((r) => [...r].reverse().join("")) };
CHEV.down = [...Array(5)].map((_, i) => CHEV_R.map((r) => r[i]).join(""));
CHEV.up = [...CHEV.down].reverse();
const EXIT_FONT = { E: ["111", "100", "110", "100", "111"], X: ["101", "101", "010", "101", "101"], I: ["1", "1", "1", "1", "1"], T: ["111", "010", "010", "010", "010"] };
// 5 x 7 pixel font for the title and end screens: each glyph is 7 rows of 5 bits.
const FONT = Object.fromEntries(Object.entries({
  A: "01110 10001 10001 11111 10001 10001 10001", B: "11110 10001 10001 11110 10001 10001 11110", C: "01110 10001 10000 10000 10000 10001 01110",
  D: "11110 10001 10001 10001 10001 10001 11110", E: "11111 10000 10000 11110 10000 10000 11111", F: "11111 10000 10000 11110 10000 10000 10000",
  G: "01110 10001 10000 10111 10001 10001 01111", H: "10001 10001 10001 11111 10001 10001 10001", I: "01110 00100 00100 00100 00100 00100 01110",
  J: "00111 00010 00010 00010 00010 10010 01100", K: "10001 10010 10100 11000 10100 10010 10001", L: "10000 10000 10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10101 10001 10001 10001", N: "10001 10001 11001 10101 10011 10001 10001", O: "01110 10001 10001 10001 10001 10001 01110",
  P: "11110 10001 10001 11110 10000 10000 10000", Q: "01110 10001 10001 10001 10101 10010 01101", R: "11110 10001 10001 11110 10100 10010 10001",
  S: "01111 10000 10000 01110 00001 00001 11110", T: "11111 00100 00100 00100 00100 00100 00100", U: "10001 10001 10001 10001 10001 10001 01110",
  V: "10001 10001 10001 10001 10001 01010 00100", W: "10001 10001 10001 10101 10101 10101 01010", X: "10001 10001 01010 00100 01010 10001 10001",
  Y: "10001 10001 01010 00100 00100 00100 00100", Z: "11111 00001 00010 00100 01000 10000 11111",
  0: "01110 10001 10011 10101 11001 10001 01110", 1: "00100 01100 00100 00100 00100 00100 01110", 2: "01110 10001 00001 00010 00100 01000 11111",
  3: "11111 00010 00100 00010 00001 10001 01110", 4: "00010 00110 01010 10010 11111 00010 00010", 5: "11111 10000 11110 00001 00001 10001 01110",
  6: "00110 01000 10000 11110 10001 10001 01110", 7: "11111 00001 00010 00100 01000 01000 01000", 8: "01110 10001 10001 01110 10001 10001 01110",
  9: "01110 10001 10001 01111 00001 00010 01100", "!": "00100 00100 00100 00100 00100 00000 00100", ".": "00000 00000 00000 00000 00000 01100 01100",
  "'": "00100 00100 01000 00000 00000 00000 00000", "-": "00000 00000 00000 11111 00000 00000 00000", ":": "00000 01100 01100 00000 01100 01100 00000",
  " ": "00000 00000 00000 00000 00000 00000 00000", "/": "00001 00010 00010 00100 01000 01000 10000", "+": "00000 00100 00100 11111 00100 00100 00000",
  "?": "01110 10001 00001 00010 00100 00000 00100", ",": "00000 00000 00000 00000 00000 01100 01100 00100 01000", ";": "00000 01100 01100 00000 01100 01100 00100 01000",
  "(": "00010 00100 01000 01000 01000 00100 00010", ")": "01000 00100 00010 00010 00010 00100 01000", '"': "01010 01010 00000 00000 00000 00000 00000",
  "·": "00000 00000 00000 01100 01100 00000 00000", "←": "00000 00100 01000 11111 01000 00100 00000", "→": "00000 00100 00010 11111 00010 00100 00000",
  "↑": "00100 01110 10101 00100 00100 00100 00000", "↓": "00000 00100 00100 00100 10101 01110 00100",
  // Lower case: x-height 5, ascenders to the top row, descenders 2 rows below the line (line height 10).
  a: "00000 00000 01110 00001 01111 10001 01111", b: "10000 10000 10110 11001 10001 10001 11110", c: "00000 00000 01110 10000 10000 10001 01110",
  d: "00001 00001 01101 10011 10001 10001 01111", e: "00000 00000 01110 10001 11111 10000 01110", f: "00110 01001 01000 11100 01000 01000 01000",
  g: "00000 00000 01111 10001 10001 10001 01111 00001 01110", h: "10000 10000 10110 11001 10001 10001 10001", i: "00100 00000 01100 00100 00100 00100 01110",
  j: "00010 00000 00110 00010 00010 00010 00010 10010 01100", k: "10000 10000 10010 10100 11000 10100 10010", l: "01100 00100 00100 00100 00100 00100 01110",
  m: "00000 00000 11010 10101 10101 10101 10001", n: "00000 00000 10110 11001 10001 10001 10001", o: "00000 00000 01110 10001 10001 10001 01110",
  p: "00000 00000 11110 10001 10001 10001 11110 10000 10000", q: "00000 00000 01111 10001 10001 10001 01111 00001 00001", r: "00000 00000 10110 11001 10000 10000 10000",
  s: "00000 00000 01111 10000 01110 00001 11110", t: "01000 01000 11100 01000 01000 01001 00110", u: "00000 00000 10001 10001 10001 10011 01101",
  v: "00000 00000 10001 10001 10001 01010 00100", w: "00000 00000 10001 10001 10101 10101 01010", x: "00000 00000 10001 01010 00100 01010 10001",
  y: "00000 00000 10001 10001 10001 10001 01111 00001 01110", z: "00000 00000 11111 00010 00100 01000 11111",
}).map(([ch, rows]) => [ch, rows.split(" ")]));
const SAME = { "’": "'", "‘": "'", "“": '"', "”": '"', "—": "-", "–": "-" };
const glyph = (ch) => FONT[ch] || FONT[SAME[ch]] || FONT[ch.toUpperCase()] || FONT[" "];
const textWidth = (str, scale = 1) => [...str].length * 6 * scale - scale;
// Draws str at (x, y) in art pixels; outline draws a 1-art-pixel ring of that colour round every letter first.
// Lower case is drawn where the string has it (the title screens pass capitals).
function text(q, str, x, y, col, scale = 1, outline) {
  const glyphs = (ox, oy, c) => { q.fillStyle = c; [...str].forEach((ch, n) => glyph(ch).forEach((row, j) => [...row].forEach((b, i) => { if (b === "1") q.fillRect(x + ox + (n * 6 + i) * scale, y + oy + j * scale, scale, scale); }))); };
  if (outline) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) glyphs(ox, oy, outline);
  glyphs(0, 0, col);
}
// Word-wraps str into lines of at most `width` art pixels.
function wrap(str, width) {
  const max = Math.max(1, Math.floor((width + 1) / 6)), lines = [];
  for (const para of String(str).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      if (!line) line = word; else if (line.length + 1 + word.length <= max) line += " " + word; else { lines.push(line); line = word; }
      while (line.length > max) { lines.push(line.slice(0, max)); line = line.slice(max); }
    }
    lines.push(line);
  }
  return lines;
}

// ---------- the logo font: hand-pixelled 9 x 11 letters with 3-pixel strokes ----------
const RR = (s, n) => Array(n).fill(s);
const LOGO = {
  A: [".1111111.", "111111111", "111...111", "111...111", "111111111", "111111111", ...RR("111...111", 5)],
  B: ["11111111.", "111111111", "111...111", "111...111", "11111111.", "11111111.", "111...111", "111...111", "111...111", "111111111", "11111111."],
  C: [".1111111.", "111111111", ...RR("111......", 7), "111111111", ".1111111."],
  D: ["11111111.", "111111111", ...RR("111...111", 7), "111111111", "11111111."],
  E: ["111111111", "111111111", "111......", "111......", "11111111.", "11111111.", "111......", "111......", "111......", "111111111", "111111111"],
  F: ["111111111", "111111111", "111......", "111......", "11111111.", "11111111.", ...RR("111......", 5)],
  G: [".1111111.", "111111111", "111......", "111......", "111.11111", "111.11111", "111...111", "111...111", "111...111", "111111111", ".1111111."],
  H: [...RR("111...111", 4), "111111111", "111111111", ...RR("111...111", 5)],
  I: ["111111111", "111111111", ...RR("...111...", 7), "111111111", "111111111"],
  J: ["111111111", "111111111", ...RR("......111", 6), "111...111", "111111111", ".1111111."],
  K: ["111...111", "111..111.", "111.111..", "111111...", "11111....", "11111....", "111111...", "111.111..", "111..111.", "111...111", "111...111"],
  L: [...RR("111......", 9), "111111111", "111111111"],
  M: ["11.....11", "111...111", "1111.1111", "111111111", "111.1.111", ...RR("111...111", 6)],
  N: ["111...111", "1111..111", "11111.111", "111111111", "111.11111", "111..1111", ...RR("111...111", 5)],
  O: [".1111111.", "111111111", ...RR("111...111", 7), "111111111", ".1111111."],
  P: ["11111111.", "111111111", "111...111", "111...111", "111111111", "11111111.", ...RR("111......", 5)],
  Q: [".1111111.", "111111111", ...RR("111...111", 6), "111..1111", "11111111.", ".11111111"],
  R: ["11111111.", "111111111", "111...111", "111...111", "111111111", "11111111.", "111.111..", "111..111.", ...RR("111...111", 3)],
  S: [".11111111", "111111111", "111......", "111......", "11111111.", ".11111111", "......111", "......111", "......111", "111111111", "11111111."],
  T: ["111111111", "111111111", ...RR("...111...", 9)],
  U: [...RR("111...111", 9), "111111111", ".1111111."],
  V: [...RR("111...111", 6), ".111.111.", ".111.111.", "..11111..", "..11111..", "...111..."],
  W: [...RR("111...111", 6), "111.1.111", "111111111", "1111.1111", "111...111", "11.....11"],
  X: ["111...111", "111...111", ".111.111.", "..11111..", "...111...", "...111...", "..11111..", ".111.111.", ...RR("111...111", 3)],
  Y: [...RR("111...111", 3), ".111.111.", "..11111..", ...RR("...111...", 6)],
  Z: ["111111111", "111111111", ".....1111", "....1111.", "...1111..", "..1111...", ".1111....", "1111.....", "111......", "111111111", "111111111"],
  0: [".1111111.", "111111111", ...RR("111...111", 7), "111111111", ".1111111."],
  1: ["...111...", "..1111...", ".11111...", ...RR("...111...", 6), "111111111", "111111111"],
  2: [".1111111.", "111111111", "111...111", "......111", "....11111", "..11111..", ".1111....", "111......", "111......", "111111111", "111111111"],
  3: ["11111111.", "111111111", "......111", "......111", "..111111.", "..111111.", "......111", "......111", "......111", "111111111", "11111111."],
  4: [...RR("111...111", 4), "111111111", "111111111", ...RR("......111", 5)],
  5: ["111111111", "111111111", "111......", "111......", "11111111.", "111111111", "......111", "......111", "......111", "111111111", "11111111."],
  6: [".1111111.", "111111111", "111......", "111......", "11111111.", "111111111", "111...111", "111...111", "111...111", "111111111", ".1111111."],
  7: ["111111111", "111111111", "......111", ".....111.", "....111..", "...111...", ...RR("...111...", 5)],
  8: [".1111111.", "111111111", "111...111", "111...111", ".1111111.", ".1111111.", "111...111", "111...111", "111...111", "111111111", ".1111111."],
  9: [".1111111.", "111111111", "111...111", "111...111", "111...111", "111111111", ".11111111", "......111", "......111", "111111111", ".1111111."],
  "!": [...RR("111", 7), "...", "...", "111", "111"],
  "?": [".1111111.", "111111111", "111...111", "......111", "....1111.", "...1111..", "...111...", "...111...", ".........", "...111...", "...111..."],
  "-": [...RR(".......", 4), "1111111", "1111111", ...RR(".......", 5)],
  ".": [...RR("...", 9), "111", "111"],
};
// Larger sizes repeat rows and columns of the 3-pixel strokes (size 2: every one twice; size 1.5: 3-pixel strokes
// become 4), while outline, bevel and extrusion stay 1 pixel: one pixel grid throughout.
const ROW15 = [0, 0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 9, 9, 10];
const grow = (g, size) => {
  if (size === 1) return g;
  const w = g[0].length, nw = Math.round(w * size), rows = size === 2 ? g.flatMap((r) => [r, r]) : ROW15.map((r) => g[r]);
  return rows.map((row) => Array.from({ length: nw }, (_, c) => row[Math.floor(c * w / nw)]).join(""));
};
const SIZED = { 1: {}, 1.5: {}, 2: {} };
for (const size of [1, 1.5, 2]) for (const ch in LOGO) SIZED[size][ch] = grow(LOGO[ch], size);
const advance = (ch, size) => ch === " " ? Math.round(5 * size) : (SIZED[size][ch] ? SIZED[size][ch][0].length : 9 * size) + Math.round(size);
const logoWidth = (str, size = 1) => [...str.toUpperCase()].reduce((a, ch) => a + advance(ch, size), -Math.round(size));
const LOGO_INK = "#06060c";
// Letters are bevelled (light top and left edges, shaded bottom), extruded 2 pixels and outlined in ink.
// cols(n) -> [face, shade, light]; lift(n) -> pixels letter n jumps.
function logo(q, str, x, y, size, cols, lift = () => 0) {
  const px = (X, Y, w, h, c) => { q.fillStyle = c; q.fillRect(Math.round(X), Math.round(Y), w, h); };
  [...str.toUpperCase()].forEach((ch, n) => {
    const g = SIZED[size][ch]; if (!g) { x += advance(ch, size); return; }
    const on = (i, j) => j >= 0 && j < g.length && i >= 0 && i < g[0].length && g[j][i] === "1", ly = y - lift(n), [face, shade, light] = cols(n);
    for (let j = 0; j < g.length; j++) for (let i = 0; i < g[0].length; i++) if (on(i, j)) px(x + i - 1, ly + j - 1, 5, 5, LOGO_INK);
    for (let j = 0; j < g.length; j++) for (let i = 0; i < g[0].length; i++) if (on(i, j)) { px(x + i + 1, ly + j + 1, 1, 1, shade); px(x + i + 2, ly + j + 2, 1, 1, mixHex(shade, LOGO_INK, 0.5)); }
    for (let j = 0; j < g.length; j++) for (let i = 0; i < g[0].length; i++) if (on(i, j)) px(x + i, ly + j, 1, 1, !on(i, j - 1) || !on(i - 1, j) ? light : !on(i, j + 1) ? mixHex(face, shade, 0.5) : face);
    x += advance(ch, size);
  });
}
// Each body's logo colours: [face, shade, light]; gold for scores and prompts.
const BODY_COLS = { S: ["#f4f4fc", "#8a8aa4", "#ffffff"], G: ["#f87858", "#a81000", "#fcc8b8"], C: ["#5cbcfc", "#0050c8", "#c8ecfc"], gold: ["#f8c838", "#a86808", "#fcf0a8"] };
// The colour change runs along the word as a wave, each letter hopping as it changes. changes: [[time, body], ...].
function shiftingLogo(q, str, x, y, size, now, changes) {
  const at = (n) => { let c = changes[0][1], h = -1e9; for (const [t, b] of changes) { const tn = t + n * 25; if (now >= tn + 40) c = b; if (now >= tn) h = tn; } return [c, h]; };
  logo(q, str, x, y, size, (n) => BODY_COLS[at(n)[0]], (n) => { const h = now - at(n)[1]; return (h >= 0 && h < 240 ? Math.round(Math.sin(Math.PI * h / 240) * 4) : 0) + (Math.floor(now / 500 + n * 0.5) % 2); });
}
// Blocks: [front face, top face, highlight]. Red blocks carry stripes, blue blocks rivet dots, in every view.
const COLS = { R: ["#7c1408", "#d84830", "#f89878"], B: ["#0c3c9c", "#3c7ce8", "#9cc4f8"] };
const FOGC = { R: ["#a87870", "#9c6e68"], B: ["#7088aa", "#68809e"] }; // mist keeps most of the block's hue
const MARK = { R: (i, j) => (i + j) % 4 === 0, B: (i, j) => i % 3 === 0 && j % 3 === 0 };
// A small stable hash per tile, for brick shades and floor specks.
const hash = (x, y, n) => ((x * 73856093) ^ (y * 19349663) ^ (n * 83492791)) >>> 0;

function spr(q, rows, X, Y, map = PAL) { rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== "." && map[ch]) { q.fillStyle = map[ch]; q.fillRect(X + i, Y + j, 1, 1); } })); }

function drawTile(q, c, X, Y, viewer, L, o) {
  const t = o.t || 0;
  const px = (x, y, col) => { q.fillStyle = col; q.fillRect(X + x, Y + y, 1, 1); };
  const rect = (x, y, w, h, col) => { q.fillStyle = col; q.fillRect(X + x, Y + y, w, h); };
  // Floor: flat tone, soft seams, a few varied marks (pebbles, a crack, a worn corner) and a shadow along any
  // wall above or to the left, so rooms read as a tiled floor with depth.
  const floor = () => {
    const base = (o.x + o.y) % 2 ? L.f[0] : L.f[1], dark = mixHex(base, "#000000", 0.14), light = mixHex(base, "#ffffff", 0.1);
    rect(0, 0, K, K, base); rect(0, 0, K, 1, dark); rect(0, 0, 1, K, dark);
    const h = hash(o.x, o.y, 3), kind = h % 5;
    if (kind === 0) { px(3 + (h >> 3) % 8, 4 + (h >> 6) % 6, dark); px(4 + (h >> 3) % 8, 4 + (h >> 6) % 6, light); px(9, 11, dark); }
    else if (kind === 1) { const cx = 4 + (h >> 4) % 6, cy = 4 + (h >> 7) % 6; px(cx, cy, dark); px(cx + 1, cy + 1, dark); px(cx + 1, cy + 2, dark); px(cx + 2, cy + 3, dark); }
    else { px(2 + (h >> 3) % 12, 2 + (h >> 7) % 12, dark); }
    if (o.nb(0, -1) === "#") rect(0, 0, K, 2, "rgba(0,0,0,0.25)");
    if (o.nb(-1, 0) === "#") rect(0, 0, 2, K, "rgba(0,0,0,0.18)");
  };
  const wall = () => {
    rect(0, 0, K, K, L.w[0]);
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      for (let b = -1; b < 2; b++) { // three bricks per row; every so often one is lighter or darker
        const bx = off + b * 8, x0 = Math.max(0, bx + 1), x1 = Math.min(K, bx + 8); if (x1 <= x0) continue;
        const h = hash(o.x * 4 + b, o.y * 4 + row, 7) % 9, col = h === 0 ? mixHex(L.w[1], "#ffffff", 0.12) : h === 1 ? mixHex(L.w[1], "#000000", 0.18) : L.w[1];
        rect(x0, row * 4, x1 - x0, 3, col); rect(x0, row * 4, x1 - x0, 1, "rgba(255,255,255,0.12)");
      }
    }
    if (o.nb(0, -1) !== "#" && o.nb(0, -1) !== " ") rect(0, 0, K, 1, mixHex(L.w[1], "#ffffff", 0.3)); // lit cap where the wall's top meets open floor
    if (o.nb(0, 1) !== "#") { rect(0, 12, K, 4, mixHex(L.w[1], "#000000", 0.45)); rect(0, 12, K, 1, "rgba(0,0,0,0.55)"); } // front face where the wall meets floor
  };
  const block = (col, how) => {
    const [dk, mid, lt] = COLS[col], mark = MARK[col];
    floor();
    if (how === "unreal") { // marching dashed outline at the tile edge with a dark edge under it, faint fill: "it's here for someone else"
      const off = Math.floor(t / 180) % 4, per = [];
      for (let i = 1; i < 14; i++) per.push([i, 1]); for (let j = 1; j < 14; j++) per.push([14, j]); for (let i = 14; i > 1; i--) per.push([i, 14]); for (let j = 14; j > 1; j--) per.push([1, j]);
      q.globalAlpha = 0.4; for (let j = 2; j < 14; j++) for (let i = 2; i < 14; i++) if ((i + j) % 2 === 0) px(i, j, mid); // checker dither: there, but not solid
      q.globalAlpha = 0.5; for (let j = 3; j < 13; j++) for (let i = 3; i < 13; i++) if (mark(i, j)) px(i, j, lt); q.globalAlpha = 1;
      per.forEach(([i, j], k) => { if ((k + off) % 4 < 2) { px(i, j, lt); px(i + (i === 1 ? 1 : i === 14 ? -1 : 0), j + (j === 1 ? 1 : j === 14 ? -1 : 0), dk); } });
      return;
    }
    // Shape, not just colour, tells the blocks apart: a red block is a square crate, a blue block a gem with
    // cut corners. span(j) is the block's left and right edge on row j (rows 0-14).
    const span = (j) => { const c = col === "B" ? Math.max(0, 2 - j, j - 12) : 0; return [1 + c, 14 - c]; };
    const row = (j, from, col2) => { const [a, b] = span(j); rect(a + from, j, b - a + 1 - 2 * from, 1, col2); };
    if (how === "fog") { // a soft cloud of light mist, tinted toward the block's colour, carrying its pattern; wisps drift on top
      const [f1, f2] = FOGC[col], par = Math.floor(t / 500) % 2;
      for (let j = 0; j < 15; j++) row(j, 0, PAL.D);
      for (let j = 1; j < 14; j++) { const [a, b] = span(j); for (let i = a + 1; i < b; i++) px(i, j, (i + j + par) % 2 ? f1 : f2); }
      for (let j = 3; j < 12; j++) { const [a, b] = span(j); for (let i = a + 1; i < b; i++) if (mark(i, j)) px(i, j, mixHex(f1, "#000000", 0.3)); }
      { const [a, b] = span(1); for (let i = a + 1; i < b; i++) if ((i + Math.floor(t / 400)) % 4 !== 0) px(i, 1, "#dcdce4"); } // wisps along the top
      row(15 - 1, 1, "rgba(0,0,0,0.25)"); return;
    }
    // A solid block: dark outline, a bevelled top face with the pattern, a front face and a shadow.
    for (let j = 0; j < 15; j++) row(j, 0, PAL.K);
    for (let j = 1; j < 11; j++) row(j, 1, mid);
    for (let j = 2; j < 10; j++) { const [a, b] = span(j); for (let i = a + 2; i < b - 1; i++) if (mark(i, j)) px(i, j, dk); }
    row(1, 1, lt); for (let j = 1; j < 11; j++) { const [a, b] = span(j); px(a + 1, j, lt); px(b - 1, j, mixHex(mid, "#000000", 0.25)); }
    for (let j = 11; j < 14; j++) row(j, 1, j === 11 ? mixHex(dk, "#000000", 0.4) : dk);
    { const [a, b] = span(14); rect(a, 15, b - a + 2, 1, "rgba(0,0,0,0.35)"); } rect(15, 2, 1, 13, "rgba(0,0,0,0.22)");
  };
  const plate = (press) => { // a flat plate set into the floor with a ring on it: step on me. Held, it lights green
    floor(); const held = press > 0.5, face = held ? PAL.g : PAL.L, ring = held ? PAL.W : PAL.D;
    rect(1, 1, 14, 14, PAL.K); rect(2, 2, 12, 12, face); rect(2, 2, 12, 1, mixHex(face, "#000000", 0.35)); rect(2, 2, 1, 12, mixHex(face, "#000000", 0.35)); // sunk: shadow on the top-left inner edge
    rect(2, 13, 12, 1, mixHex(face, "#ffffff", 0.35)); rect(13, 2, 1, 12, mixHex(face, "#ffffff", 0.35));
    rect(6, 4, 4, 1, ring); rect(6, 11, 4, 1, ring); rect(4, 6, 1, 4, ring); rect(11, 6, 1, 4, ring); px(5, 5, ring); px(10, 5, ring); px(5, 10, ring); px(10, 10, ring);
    rect(7, 7, 2, 2, ring);
    if (held) { rect(0, 14, K, 2, PAL.G); rect(0, 7, 1, 7, PAL.G); rect(15, 7, 1, 7, PAL.G); } // a lit lip that shows around a body standing on it
  };
  const gate = (open, lit) => { // a portcullis: shut, heavy bars to the floor under red lamps; open, bars pulled up into the beam, green lamps
    floor(); const bar = Math.round(12 * (1 - open));
    if (bar > 6) rect(2, 15, 12, 1, "rgba(0,0,0,0.35)");
    for (const i of [3, 6, 9, 12]) if (bar > 0) { rect(i - 1, 3, 1, bar, PAL.K); rect(i, 3, 1, bar, PAL.L); px(i, 3 + bar, PAL.W); }
    rect(0, 0, K, 4, PAL.K); rect(1, 0, 14, 3, PAL.D); rect(1, 0, 14, 1, PAL.M);
    for (const i of [3, 6, 9, 12]) { rect(i, 1, 1, 2, bar > 0 ? PAL.K : PAL.L); if (bar === 0) px(i, 3, PAL.W); } // the bar tips, tucked into the beam when open
    for (const gx of [0, 14]) { rect(gx, 0, 2, K, PAL.K); rect(gx + (gx ? 0 : 1), 4, 1, K - 4, PAL.D); rect(gx, 5, 2, 3, lit ? PAL.G : PAL.R); }
  };
  const exit = () => { // an open, lit doorway under a green EXIT sign. With a wall above, the sign hangs on that wall
    // and the door fills its own tile; otherwise both share the tile.
    floor();
    const onWall = o.nb(0, -1) === "#", top = onWall ? 1 : 7, sy = onWall ? -7 : 0;
    rect(1, top - 1, 14, K - top + 1, PAL.K); rect(2, top, 12, K - top, "#5a3a1a"); // door frame
    rect(3, top + 1, 10, K - top - 1, PAL.y); rect(4, top + 2, 8, K - top - 2, PAL.W); // light inside
    rect(3, top + 1, 2, K - top - 1, PAL.N); rect(3, top + 1, 1, K - top - 1, PAL.n); // the door leaf, swung open
    rect(2, 15, 12, 1, Math.floor(t / 300) % 2 ? PAL.y : PAL.W); // light spilling onto the floor
    rect(0, sy, K, 7, PAL.K); rect(1, sy, 14, 6, PAL.g); rect(1, sy, 14, 1, PAL.G);
    let x = 2; for (const ch of "EXIT") { const g = EXIT_FONT[ch]; g.forEach((row, j) => [...row].forEach((b, i) => { if (b === "1") px(x + i, sy + 1 + j, PAL.W); })); x += g[0].length + 1; }
  };
  switch (c) {
    case "#": return wall();
    case " ": return rect(0, 0, K, K, "#000");
    case "R": case "B": return block(c, sight(viewer, c));
    case "_": return plate(o.press ?? 0);
    case "|": return gate(o.open ?? 0, o.lit ?? (o.open ?? 0) > 0.5);
    case "E": return exit();
    default: return floor();
  }
}

const sprCache = new Map();
function spriteCanvas(rows, map, key) {
  let c = sprCache.get(key);
  if (!c) { c = document.createElement("canvas"); c.width = 16; c.height = rows.length; spr(c.getContext("2d"), rows, 0, 0, map); sprCache.set(key, c); }
  return c;
}
// The body you are in gets a 1 px yellow outline (drawn from a silhouette of its sprite) and a ring at its feet.
const OUTLINE = Object.fromEntries([...Object.keys(PAL), "e", "k", "v", "q"].map((ch) => [ch, PAL.Y]));
// b: { t, x, y (tiles), active, frame, squash, flip, lift, dx, dy, sink }
function drawBody(q, b) {
  const rows = (b.t === "G" ? GUARD : b.t === "C" ? CAT : SPIRIT)[b.frame || 0], awake = b.active || b.awake || b.t === "S";
  // b.mark colours the guard's badge or the cat's collar, so two bodies of one kind can be told apart.
  const marks = { v: b.mark || PAL.Y, q: b.mark || PAL.B };
  const img = spriteCanvas(rows, { ...PAL, ...marks, ...(awake ? { e: PAL.W, k: PAL.K } : { e: PAL.K, k: PAL.K }) }, b.t + (b.frame || 0) + awake + (b.mark || ""));
  const sq = b.squash || 1, h = Math.round(img.height * sq), w = Math.round(16 * (1 + (1 - sq) * 0.6));
  const TX = Math.round(b.x * K) + (b.dx || 0), TY = Math.round(b.y * K) + (b.dy || 0) - (b.lift || 0);
  const x = TX + Math.round((16 - w) / 2), y = TY + 16 - h + (b.sink || 0);
  q.save(); q.imageSmoothingEnabled = false;
  if (b.sink) { q.beginPath(); q.rect(Math.round(b.x * K), Math.round(b.y * K), 16, 16); q.clip(); }
  if (b.flip) { q.translate(x + w, y); q.scale(-1, 1); } else q.translate(x, y);
  if (b.active) { const sil = spriteCanvas(rows, OUTLINE, "sil" + b.t + (b.frame || 0)); for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) q.drawImage(sil, ox, oy, w, h); }
  q.drawImage(img, 0, 0, w, h);
  q.restore();
  return { TX, TY };
}
const ring = (q, X, Y, col) => { q.fillStyle = col; q.fillRect(X + 4, Y + 13, 8, 1); q.fillRect(X + 4, Y + 15, 8, 1); q.fillRect(X + 2, Y + 14, 2, 1); q.fillRect(X + 12, Y + 14, 2, 1); };

// scene: { map, viewer, from, to, lensT, t, bodies, hops: [[x, y, dir]], state(x,y), fx(q) }
function render(cv, sc) {
  const map = sc.map, H = map.length, W = map[0].length;
  if (!cv._o || cv._o.width !== W * K || cv._o.height !== H * K) { cv._o = document.createElement("canvas"); cv._o.width = W * K; cv._o.height = H * K; }
  const o = cv._o, q = o.getContext("2d"); q.imageSmoothingEnabled = false; q.clearRect(0, 0, o.width, o.height);
  const tile = (x, y) => { if (y < 0 || y >= H || x < 0 || x >= W) return "#"; const c = map[y][x] || " "; return "SGC".includes(c) ? "." : c; };
  const L = lens(sc.from || sc.viewer, sc.to || sc.from || sc.viewer, sc.lensT ?? 1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) drawTile(q, tile(x, y), x * K, y * K, sc.viewer, L, { x, y, t: sc.t, nb: (dx, dy) => tile(x + dx, y + dy), ...(sc.state ? sc.state(x, y) || {} : {}) });
  const pulse = Math.floor(sc.t / 400) % 2;
  for (const b of [...(sc.bodies || [])].sort((a, c) => a.y - c.y)) {
    const BX = Math.round(b.x * K) + (b.dx || 0), BY = Math.round(b.y * K) + (b.dy || 0);
    if (b.active && !b.sink) ring(q, BX, BY, pulse ? PAL.Y : PAL.y);
    else if (!b.sink) { q.fillStyle = "rgba(0,0,0,0.28)"; q.fillRect(BX + 4, BY + 14, 8, 2); q.fillRect(BX + 3, BY + 15, 10, 1); } // shadow
    drawBody(q, b);
    // A body standing in a red or blue block stays visibly inside it: a block it cannot see keeps its dashed edge
    // over the body; a block that is solid to the viewer shows its front lip over the body's legs.
    const under = Number.isInteger(b.x) && Number.isInteger(b.y) ? tile(b.x, b.y) : "";
    if (under === "R" || under === "B") {
      const how = sight(sc.viewer, under), X0 = b.x * K, Y0 = b.y * K, f = (x, y, w, h, c) => { q.fillStyle = c; q.fillRect(X0 + x, Y0 + y, w, h); };
      if (how === "unreal") { for (let i = 0; i < 16; i++) for (const [x, y] of [[i, 0], [i, 15], [0, i], [15, i]]) if ((i + Math.floor(sc.t / 180)) % 4 < 2) f(x, y, 1, 1, COLS[under][2]); }
      else {
        const c = under === "B" ? 1 : 0, face = how === "real" ? COLS[under][0] : PAL.D, top = how === "real" ? COLS[under][1] : FOGC[under][0];
        f(1, 10, 14, 4, PAL.K); f(2, 10, 12, 1, top); f(2, 11, 12, 2, face); f(1 + c, 14, 14 - 2 * c, 1, PAL.K);
      }
    }
    if (under === "|") { // a body in a gate stands under its beam, between its posts
      const x = b.x, y = b.y; q.save(); q.beginPath(); q.rect(x * K, y * K, K, 4); q.rect(x * K, y * K, 2, K); q.rect(x * K + 14, y * K, 2, K); q.clip();
      drawTile(q, "|", x * K, y * K, sc.viewer, L, { x, y, t: sc.t, nb: (dx, dy) => tile(x + dx, y + dy), ...(sc.state ? sc.state(x, y) || {} : {}) });
      q.restore();
    }
    if (b.zz) { const k = Math.floor(sc.t / 500) % 2, ZX = Math.round(b.x * K) + 10, ZY = Math.round(b.y * K) - 3; spr(q, ZZ_SHADOW, ZX + 1, ZY + 1 + k); spr(q, ZZ, ZX, ZY + k); } // above the head, not on it
  }
  // Hop markers: a chevron straddling the edge you would press across, nudging toward the body.
  for (const [x, y, dir] of sc.hops || []) {
    const n = pulse, at = { right: [x * K + 13 + n, y * K + 5], left: [x * K - 2 - n, y * K + 5], down: [x * K + 5, y * K + 13 + n], up: [x * K + 5, y * K - 2 - n] }[dir];
    spr(q, CHEV[dir], at[0], at[1]);
  }
  if (sc.fx) sc.fx(q);
  const g = cv.getContext("2d"); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(o, 0, 0, cv.width, cv.height);
}
const dot = (q, x, y, col, s = 1) => { q.fillStyle = col; q.fillRect(Math.round(x), Math.round(y), s, s); };

// One step from a to b starting at t0: position, leg frame and a 1px lift mid-step.
function walk(t, t0, a, b, dur = 160) { const k = prog(t, t0, dur); return { pos: a + (b - a) * k, moving: k > 0 && k < 1, lift: k > 0 && k < 1 ? Math.round(Math.sin(Math.PI * k)) : 0 }; }

root.PixelArt = { K, PAL, LENS, render, drawBody, walk, dot, text, textWidth, wrap, lens, FONT, logo, logoWidth, shiftingLogo, BODY_COLS, mix: mixHex };
})(typeof self !== "undefined" ? self : this);
