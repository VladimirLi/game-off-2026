// Body Hop title and end screens: one 192 x 128 pixel-art canvas on a single pixel grid (sprites, tiles, text
// and the hand-pixelled logo all at 1x), scaled up by whole numbers to fit the window.
// Title: a night street, a cut-away room in which the spirit hops into the guard and the guard into the cat; each
// hop repaints the room, the sky and the logo in that body's colours, and the red block the guard can't pass turns
// to a dotted ghost for the cat, who walks through it to the exit. End: dawn; the three come out of the exit, the
// spirit rises into the sunrise, and a shift report counts up and gets stamped CLOCKED OUT.
//   BodyHopScreens.init(opts); show("title" | "end" | "final"); leave(then); draw(now); key(event); open()
(function (root) {
  "use strict";
  const W = 192, H = 144;
  let o, PX, PAL, el, cv, q, art, kind = null, sel = 0, items = [], shownAt = 0, stamped = false;
  const INK = "#06060c";
  const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
  const rect = (x, y, w, h, col) => { q.fillStyle = col; q.fillRect(Math.round(x), Math.round(y), w, h); };
  const prog = (t, a, d) => Math.min(1, Math.max(0, (t - a) / d));
  const mix = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };

  // The logo font lives in pixel-art.js; here it is centred on the screen.
  const shiftingLogo = (str, y, size, now, changes) => PX.shiftingLogo(q, str, Math.round((W - PX.logoWidth(str, size)) / 2), y, size, now, changes);

  function init(opts) {
    o = opts; PX = o.PX; PAL = PX.PAL; el = o.el; cv = o.canvas;
    art = document.createElement("canvas"); art.width = W; art.height = H; q = art.getContext("2d");
    addEventListener("resize", () => { if (kind) fit(); });
    const pick = (e) => { const r = cv.getBoundingClientRect(), y = (e.clientY - r.top) / r.height * H; return items.findIndex((it) => y >= it.y - 2 && y <= it.y + 8); };
    cv.addEventListener("pointermove", (e) => { const i = pick(e); if (i >= 0 && i !== sel) { sel = i; o.SND.play("ui"); } cv.style.cursor = i >= 0 ? "pointer" : "default"; });
    cv.addEventListener("pointerdown", (e) => { const i = pick(e); if (i >= 0) { e.preventDefault(); sel = i; activate(); } });
  }
  function fit() {
    const s = Math.max(1, Math.floor(Math.min(innerWidth / W, (innerHeight - 8) / H)));
    cv.width = W * s; cv.height = H * s;
  }
  const open = () => kind;

  // ---------- menu ----------
  function buildItems() {
    if (kind === "title") {
      const i = o.firstUnsolved(), started = o.progress().done.size > 0, name = i >= o.mainCount ? `NIGHT SHIFT ${i - o.mainCount + 1}` : `LEVEL ${i + 1}`;
      items = [{ label: () => started ? `CONTINUE - ${name}` : "START YOUR SHIFT", act: () => o.start(i) }];
      if (started && i > 0) items.push({ label: () => "NEW GAME", act: () => o.start(0) });
      items.push({ label: () => `MUSIC: ${o.music() ? "ON" : "OFF"}`, act: () => o.toggleMusic(), keep: true });
    } else {
      items = [];
      if (kind === "end" && o.mainCount < o.levels.length) items.push({ label: () => `NIGHT SHIFT: ${o.levels.length - o.mainCount} MORE LEVELS`, act: () => o.start(o.mainCount) });
      items.push({ label: () => "TITLE SCREEN", act: () => show("title") });
    }
    const y0 = kind === "title" ? 102 + (3 - items.length) * 5 : 106 + (2 - items.length) * 5;
    items.forEach((it, n) => { it.y = y0 + n * 10; });
  }
  function activate() { const it = items[sel]; if (!it) return; if (!it.keep) o.SND.play("ui"); it.act(); }
  function show(k) {
    kind = k; sel = 0; shownAt = performance.now(); stamped = false; buildItems(); fit();
    el.classList.add("open"); el.classList.remove("leaving"); el.setAttribute("aria-label", summary());
  }
  function hide() { kind = null; el.classList.remove("open"); }
  function leave(then) { el.classList.add("leaving"); setTimeout(() => { hide(); el.classList.remove("leaving"); then(); }, 260); }
  function summary() {
    if (kind === "title") return "Body Hop. Hop into bodies; each body sees one colour, and only what it sees is real. Arrow keys choose, Enter starts, M switches the music.";
    const r = report();
    return `${kind === "final" ? "All done" : "You got out"}. Levels solved ${r.main.solved} of ${r.main.n}, ${r.main.par} at par.` + (kind === "final" ? ` Night shift ${r.night.solved} of ${r.night.n}, ${r.night.par} at par.` : "");
  }
  function key(e) {
    const k = e.key;
    if (k === "m" || k === "M") { o.toggleMusic(); return; }
    if (["Tab", "Shift", "Control", "Alt", "Meta"].includes(k)) return;
    e.preventDefault();
    if (k === "ArrowUp" || k === "w" || k === "W") { sel = (sel + items.length - 1) % items.length; o.SND.play("ui"); return; }
    if (k === "ArrowDown" || k === "s" || k === "S") { sel = (sel + 1) % items.length; o.SND.play("ui"); return; }
    if ((k === "n" || k === "N") && kind === "end" && o.mainCount < o.levels.length) { o.SND.play("ui"); o.start(o.mainCount); return; }
    if (k === "Escape" && kind !== "title") { o.SND.play("ui"); show("title"); return; }
    if (k === "Enter" || k === " " || k === "z" || k === "Z" || k === "ArrowRight" || k === "d" || k === "D") activate();
  }

  // ---------- scenery ----------
  const NIGHT = ["#090a18", "#0b0c1e", "#0e0e24", "#12112a", "#171430", "#1c1636"];
  const TINT = { S: "#000000", G: "#4a0e08", C: "#08204a" };
  // Stars stay out of the band where the logo and its subtitle sit (from the top down to `clear`).
  const STARS = Array.from({ length: 46 }, (_, n) => { const h = hash(n, 7); return [h % W, (h >> 9) % 92, (h >> 3) % 7]; });
  function sky(bands, top, bottom, now, tint, starsTo, clear) {
    const hb = (bottom - top) / bands.length;
    bands.forEach((c, i) => rect(0, top + i * hb, W, Math.ceil(hb), tint ? mix(c, tint[0], tint[1]) : c));
    for (let i = 1; i < bands.length; i++) for (let x = i % 2; x < W; x += 2) rect(x, top + i * hb - 1, 1, 1, tint ? mix(bands[i], tint[0], tint[1]) : bands[i]);
    for (const [x, y, p] of STARS) if (y < starsTo && !(y < clear && x > 8 && x < W - 8)) { const tw = Math.floor(now / 450 + p) % 7; rect(x, y, 1, 1, tw === 0 ? "#fcfcfc" : tw < 3 ? "#9c9cc8" : "#4c4c78"); if (p === 0 && tw === 0) { rect(x - 1, y, 3, 1, "#a8a8d8"); rect(x, y - 1, 1, 3, "#a8a8d8"); } }
  }
  function disc(x, y, r, body, rim, glow) {
    for (let j = -r - 4; j <= r + 4; j++) for (let i = -r - 4; i <= r + 4; i++) { const d = Math.hypot(i, j);
      if (d < r) rect(x + i, y + j, 1, 1, d > r - 1.3 ? rim : body); else if (glow && d < r + 4 && (i + j) % 2 === 0) rect(x + i, y + j, 1, 1, glow); }
  }
  function moon(x, y) { disc(x, y, 6, "#f8f0cc", "#d8cc9c", "rgba(252,236,180,0.16)"); rect(x - 2, y - 2, 2, 2, "#e4d8a8"); rect(x + 2, y + 1, 2, 2, "#e4d8a8"); rect(x - 1, y + 3, 1, 1, "#e4d8a8"); }
  function street(y) { rect(0, y, W, 3, "#3c3c4c"); rect(0, y, W, 1, "#6c6c7c"); for (let x = 6; x < W; x += 12) rect(x, y + 1, 1, 2, "#2c2c38"); rect(0, y + 3, W, H - y - 3, "#0e0e18"); rect(0, y + 3, W, 1, "#08080e"); }
  function spark(qq, ax, ay, bx, by, k, lift = 10) {
    const at = (kk) => [ax + (bx - ax) * kk, ay + (by - ay) * kk - Math.sin(Math.PI * kk) * lift], d = (x, y, w, c) => { qq.fillStyle = c; qq.fillRect(Math.round(x), Math.round(y), w, w); };
    for (let i = 10; i > 0; i--) { const [x, y] = at(Math.max(0, k - i * 0.04)); d(x, y, i < 4 ? 2 : 1, i < 4 ? PAL.y : PAL.Y); }
    const [x, y] = at(k); d(x - 2, y - 2, 5, PAL.Y); d(x - 1, y - 1, 3, PAL.W); for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4]]) d(x + dx, y + dy, 1, PAL.W);
  }
  function burst(qq, x, y, k, n = 10, r0 = 2, r1 = 14) {
    if (k <= 0 || k >= 1) return; const r = r0 + (r1 - r0) * k;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + k; qq.fillStyle = i % 2 ? PAL.Y : PAL.W; qq.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), k < 0.5 ? 2 : 1, k < 0.5 ? 2 : 1); }
  }
  function menu(now) {
    items.forEach((it, n) => {
      const label = it.label(), w = PX.textWidth(label), x = Math.round((W - w) / 2), on = n === sel;
      PX.text(q, label, x, it.y, on ? "#f8c838" : "#8c8ca8", 1, INK);
      if (on) { const b = Math.floor(now / 260) % 2; for (let r = 0; r < 4; r++) { rect(x - 9 + b + r, it.y + r, 1, 7 - 2 * r, "#f8c838"); rect(x + w + 8 - b - r, it.y + r, 1, 7 - 2 * r, "#f8c838"); } }
    });
  }
  function footer(now, lines) { if (items.length > 2) return; const s = lines[Math.floor(now / 3500) % lines.length]; PX.text(q, s, Math.round((W - PX.textWidth(s)) / 2), 134, "#6c6c8c"); }

  // ---------- title ----------
  const ROOM = ["############", "##S.G.CR.E##", "############"], roomCv = document.createElement("canvas"); roomCv.width = 192; roomCv.height = 48;
  const P = 8200, HOP_MS = 450, HOPS = [[1500, "S", "G", 3, 4], [3500, "G", "C", 5, 6]], RY = 44, LIGHTS_OUT = 7500;
  function title(now) {
    const t = now % P, cyc = now - t;
    // whose eyes the room is seen through, and the hop in progress
    let cur = "S", hop = null; for (const [t0, a, b, ax, bx] of HOPS) { if (t >= t0 + HOP_MS) cur = b; else if (t >= t0) hop = { a, b, ax, bx, k: (t - t0) / HOP_MS }; }
    if (t >= LIGHTS_OUT + 350) cur = "S";
    const lensK = hop ? Math.floor(hop.k * 4) / 4 : 1, from = hop ? hop.a : cur, to = hop ? hop.b : cur, landed = (t0) => t - t0 - HOP_MS;
    const tint = mix(TINT[from], TINT[to], lensK);
    sky(NIGHT, 0, 92, now, tint === "#000000" ? null : [tint, 0.35], 92, 42); moon(178, 12);
    // the room's three bodies, walking and hopping to the exit
    const walkAt = (start, steps) => { let x = start, moving = false, lift = 0; for (const [t0, a, b] of steps) if (t >= t0) { const w = PX.walk(t, t0, a, b, 200); x = w.pos; moving = w.moving; lift = w.lift; } return { x, frame: moving ? 1 : 0, lift }; };
    const idle = Math.floor(now / 450) % 2, squash = (t0) => { const d = landed(t0); return d >= 0 && d < 160 ? (d < 60 ? 0.7 : d < 110 ? 1.1 : 1) : 1; };
    const bodies = [];
    if (t < 1500) { const s = walkAt(2, [[900, 2, 3]]); bodies.push({ t: "S", x: s.x, y: 1, active: true, frame: Math.floor(now / 250) % 2, lift: s.lift || idle }); }
    { const g = walkAt(4, [[2700, 4, 5]]), on = cur === "G" && !hop; bodies.push({ t: "G", x: g.x, y: 1, active: on, zz: !on, frame: g.frame, lift: g.lift || (on ? idle : 0), squash: squash(1500) }); }
    if (t < 6500) { const c = walkAt(6, [[4600, 6, 7], [5200, 7, 8], [5800, 8, 9]]), on = cur === "C" && !hop; bodies.push({ t: "C", x: c.x, y: 1, active: on, zz: !on, frame: c.frame, lift: c.lift || (on && t < 4600 ? idle : 0), squash: squash(3500), sink: t > 6000 ? Math.min(16, Math.floor((t - 6000) / 30)) : 0 }); }
    const hops = t >= 1100 && t < 1500 ? [[3, 1, "right"]] : t >= 3000 && t < 3500 ? [[5, 1, "right"]] : [];
    const fx = (qq) => {
      if (t < 350) burst(qq, 2 * 16 + 8, 24, t / 350, 8, 10, 2);
      if (hop) spark(qq, hop.ax * 16 + 8, 22, hop.bx * 16 + 8, 22, hop.k);
      for (const [t0, , , , bx] of HOPS) { const d = landed(t0); if (d >= 0 && d < 90) { qq.fillStyle = "rgba(255,255,255,0.6)"; qq.fillRect(bx * 16, 16, 16, 16); burst(qq, bx * 16 + 8, 24, d / 90, 8, 4, 12); } } // the body being entered flashes
      burst(qq, 9 * 16 + 8, 24, (t - 6500) / 600, 10, 2, 14);
    };
    PX.render(roomCv, { map: ROOM, viewer: hop ? (hop.k < 0.5 ? hop.a : hop.b) : cur, from, to, lensT: hop ? hop.k : 1, t: now, bodies, hops, fx });
    const shake = HOPS.some(([t0]) => landed(t0) >= 0 && landed(t0) < 90) ? (Math.floor(t / 30) % 2 ? 1 : -1) : 0;
    q.drawImage(roomCv, shake, RY);
    if (HOPS.some(([t0]) => landed(t0) >= 0 && landed(t0) < 60)) rect(0, RY, W, 48, "rgba(255,255,255,0.22)"); // the hop's flash
    if (t >= LIGHTS_OUT) { const d = t - LIGHTS_OUT, k = d < 300 ? Math.ceil(d / 100) / 3 : d < 400 ? 1 : Math.max(0, 1 - Math.ceil((d - 400) / 100) / 3); rect(0, RY, W, 48, `rgba(4,4,14,${0.85 * k})`); } // a quick stepped blackout resets the room
    street(92);
    shiftingLogo("BODY HOP", 8, 1.5, now, [[-1e9, "S"], [cyc + 1500, "G"], [cyc + 3500, "C"], [cyc + LIGHTS_OUT + 350, "S"], [cyc + P + 1500, "G"]]);
    const sub = "EACH BODY SEES ONE COLOUR"; PX.text(q, sub, Math.round((W - PX.textWidth(sub)) / 2), 31, "#a4a4c8", 1, INK);
    menu(now);
    footer(now, ["ARROWS + ENTER - M: MUSIC", "GAME OFF 2026 - THEME: SHIFT", "BY VLADIMIR LI"]);
  }

  // ---------- end screens: out of the exit at dawn ----------
  const DAWN = ["#141432", "#1e1c46", "#3a2656", "#6a3058", "#a8404c", "#e0683c", "#f8a050"];
  const DOOR = ["###", "#E#"], doorCv = document.createElement("canvas"); doorCv.width = 48; doorCv.height = 32;
  const sceneCv = document.createElement("canvas"); sceneCv.width = W; sceneCv.height = 96;
  function report() {
    const p = o.progress(), L = o.levels, tally = (a, b) => { const ls = L.slice(a, b); return { n: ls.length, solved: ls.filter((l) => p.done.has(l.name)).length, par: ls.filter((l) => p.best[l.name] <= l.par).length }; };
    return { main: tally(0, o.mainCount), night: tally(o.mainCount, L.length) };
  }
  function card(now) {
    const r = report(), age = now - shownAt, rows = [["LEVELS", r.main.solved, r.main.n], ["AT PAR", r.main.par, r.main.n]];
    if (kind === "final") rows.push(["NIGHT", r.night.solved, r.night.n], ["NIGHT PAR", r.night.par, r.night.n]);
    const x = 103, w = 84, h = 14 + rows.length * 8 + 20, y = 30, shake = age > 1150 && age < 1230 ? 1 : 0;
    rect(x + 2, y + 2 + shake, w, h, "rgba(0,0,0,0.45)"); rect(x - 1, y - 1 + shake, w + 2, h + 2, INK); rect(x, y + shake, w, h, "#f0e6c8");
    rows.forEach((_, i) => { if (i % 2) rect(x + 3, y + 23 + i * 8 + shake, w - 6, 1, "#ddd0ac"); }); // a rule under each shift's pair of rows
    rect(x + w / 2 - 10, y - 3, 20, 5, "#5c5c6c"); rect(x + w / 2 - 8, y - 2, 16, 3, "#a8a8b8"); // the clip
    PX.text(q, "SHIFT REPORT", x + 4, y + 4 + shake, "#3c2a1c"); rect(x + 4, y + 12 + shake, w - 8, 1, "#3c2a1c");
    rows.forEach(([a, v, n], i) => { const k = prog(age, 350 + i * 180, 420), s = `${Math.round(v * k)}/${n}`; PX.text(q, a, x + 4, y + 15 + i * 8 + shake, "#3c3c4c"); PX.text(q, s, x + w - 4 - PX.textWidth(s), y + 15 + i * 8 + shake, "#3c3c4c"); });
    // the stamp slams down, tilted, with a thunk
    if (age > 1100) {
      if (!stamped) { stamped = true; o.SND.play("plate-down"); }
      const k = prog(age, 1100, 120), sc = 1 + (1 - k) * 0.6;
      q.save(); q.translate(x + w / 2, y + h - 11 + shake); q.rotate(-0.1); q.scale(sc, sc); q.globalAlpha = 0.25 + 0.75 * k;
      rect(-35, -6, 70, 12, "#c82818"); rect(-34, -5, 68, 10, "#f0e6c8"); PX.text(q, "CLOCKED OUT", -32, -3, "#c82818");
      q.restore();
    }
  }
  function ending(now) {
    const t = now % 9000, sx = 96, sy = 100 - Math.round(prog(t, 0, 6000) * 7);
    sky(DAWN, 0, 96, now, null, 34, 27);
    disc(sx, sy, 10, "#fce8a0", "#f8c860", "rgba(252,200,120,0.22)"); // the sun coming up behind them
    // the scene at 1x on its own layer: the building, its lit exit, the three coming out, the spirit rising
    const s = sceneCv.getContext("2d"); s.clearRect(0, 0, W, 96);
    const qq = q; q = s;
    rect(2, 42, 64, 2, INK); rect(3, 43, 62, 1, "#4c4c60");
    for (let y = 44; y < 96; y += 4) { const off = (y / 4) % 2 ? 4 : 0; rect(2, y, 64, 4, "#14141c"); for (let x = 2 - off; x < 66; x += 8) { const a = Math.max(2, x + 1), b = Math.min(66, x + 8); if (b > a) rect(a, y, b - a, 3, hash(x, y) % 9 === 0 ? "#2a2a38" : "#2c2c3a"); } }
    for (const wx of [8, 44]) { const lit = hash(wx, Math.floor(now / 1900)) % 5; rect(wx - 1, 49, 14, 10, INK); rect(wx, 50, 12, 8, lit ? "#f8d878" : "#1c1c2c"); if (lit) rect(wx + 5, 50, 2, 8, "#c8a048"); }
    PX.render(doorCv, { map: DOOR, viewer: "S", t: now }); s.drawImage(doorCv, 10, 64, 48, 32);
    rect(2, 64, 10, 32, "#14141c"); rect(56, 64, 10, 32, "#14141c");
    const Y = 80, walker = (t0, from, to) => { const k = prog(t, t0, 800), m = k > 0 && k < 1; return { x: from + (to - from) * k, frame: m ? Math.floor(t / 100) % 2 : 0, lift: m ? Math.floor(t / 100) % 2 : 0, out: t >= t0 }; };
    const g = walker(300, 26, 52), c = walker(900, 26, 66), sp = walker(1500, 26, 80), rise = prog(t, 3200, 2400), wave = t > 3000 ? Math.floor(t / 300) % 2 : 0;
    if (g.out) PX.drawBody(s, { t: "G", x: g.x / 16, y: Y / 16, frame: g.frame, lift: g.lift + wave, awake: true });
    if (c.out) PX.drawBody(s, { t: "C", x: c.x / 16, y: Y / 16, frame: c.frame, lift: c.lift + (1 - wave), awake: true, flip: c.x >= 65 && t > 2000 });
    if (sp.out && rise < 1) {
      const path = (k) => [sp.x + (60 - sp.x) * k, Y - 2 - 72 * k * (2 - k)];
      for (let i = 1; i < 10; i++) { const [x, y] = path(Math.max(0, rise - i * 0.025)); if (rise > 0) rect(x + 8, y + 14, i < 4 ? 2 : 1, i < 4 ? 2 : 1, i < 4 ? PAL.y : PAL.Y); }
      const [x, y] = path(rise); PX.drawBody(s, { t: "S", x: x / 16, y: (y - Math.round(Math.sin(t / 300) * 1.5)) / 16, frame: Math.floor(t / 250) % 2 });
    }
    burst(s, 68, 8, (t - 5600) / 700, 12, 2, 16);
    q = qq; q.drawImage(sceneCv, 0, 0);
    street(96);
    card(now);
    const big = kind === "final" ? "ALL DONE!" : "YOU GOT OUT!", period = 4500, c0 = now - (now % period);
    shiftingLogo(big, 6, 1.5, now, [[-1e9, "S"], [c0, "S"], [c0 + 1500, "G"], [c0 + 3000, "C"], [c0 + period, "S"]]);
    menu(now);
    footer(now, ["THANKS FOR PLAYING!", "BY VLADIMIR LI - GAME OFF 2026", "SOUND: ZZFX BY FRANK FORCE", "MADE WITH HELP FROM CLAUDE AI"]);
  }

  function draw(now) {
    if (!kind) return;
    q.clearRect(0, 0, W, H);
    if (kind === "title") title(now); else ending(now);
    const g = cv.getContext("2d"); g.imageSmoothingEnabled = false; g.drawImage(art, 0, 0, cv.width, cv.height);
  }

  root.BodyHopScreens = { init, show, leave, draw, key, open };
})(typeof self !== "undefined" ? self : this);
