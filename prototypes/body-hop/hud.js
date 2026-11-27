// Body Hop in-game screen: one pixel-art canvas on a single pixel grid, scaled up by whole numbers and centred in the
// window. Two layouts: wide (320 x 180, a laptop or a landscape tablet) and tall (160 x 290, a phone held upright,
// with an arrow pad and buttons drawn in the art).
//   Wide: a top bar with the level and clickable keys; the framed board (drawn by pixel-art.js) on the left; a panel
//   on the right with the body you are in and what it makes of red and blue, the turns against par, and the hint (the
//   result and a Next button after a win); a message line along the bottom.
//   Tall: the top bar, the board, the message lines, a strip with your body and turns, then the pad and buttons.
// Overlays: the level intro ribbon, the pause menu, level select, How to play, and (tall) the hint.
// The game (index.html) owns the rules and calls frame() every animation frame with what to show.
//   BodyHopHUD.init(opts); fit(); frame(now, g); key(e) -> consumed; intro(now, info); openMenu(kind); closeMenu();
//   menuOpen(); tileAt(pointerEvent) -> [x, y] | null
(function (root) {
  "use strict";
  const INK = "#06060c", TEXT = "#ececf8", DIM = "#a8a8c8", FAINT = "#9090b4", GOLD = "#f8c838", BAD = "#ff8a7a", GOOD = "#8ce07c";
  const PANEL = "#12122a", EDGE = "#2c2c52", EDGE_HI = "#40406c";
  const ACCENT = { S: "#e0e0f0", G: "#f87858", C: "#5cbcfc" };
  const NAME = { S: "Spirit", G: "Guard", C: "Cat" };
  const NIGHT = ["#090a18", "#0b0c1e", "#0e0e24", "#12112a", "#171430", "#1c1636"];
  const TINT = { S: "#000000", G: "#4a0e08", C: "#08204a" };
  const LAYOUTS = {
    wide: { W: 320, H: 180, col: { x: 4, y: 18, w: 156, h: 140 }, pan: { x: 164, y: 18, w: 152, h: 140 }, msg: { y: 160, lines: 2 } },
    tall: { W: 160, H: 290, col: { x: 2, y: 18, w: 156, h: 132 }, msg: { y: 154, lines: 4 }, info: { y: 192 }, pad: { y: 232 } },
  };

  let o, PX, cv, art, q, icon, LAY = LAYOUTS.wide, W = 320, H = 180, TOUCH = false;
  let hover = null, hits = [], menu = null, sel = 0, lvSel = 0, introAt = -1e9, introInfo = null, hintOpen = false, g = null, stampedFor = -1, boardRect = null;
  const rect = (x, y, w, h, c) => { q.fillStyle = c; q.fillRect(Math.round(x), Math.round(y), w, h); };
  const text = (s, x, y, c, outline) => PX.text(q, s, Math.round(x), Math.round(y), c, 1, outline);
  const tw = (s) => PX.textWidth(s);
  const centre = (s, cx, y, c, outline) => text(s, cx - tw(s) / 2, y, c, outline);
  const prog = (t, a, d) => Math.min(1, Math.max(0, (t - a) / d));
  const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
  const STARS = Array.from({ length: 90 }, (_, n) => { const h = hash(n, 11); return [h % 320, (h >> 9) % 290, (h >> 3) % 7]; });
  const bodyCols = (t) => PX.BODY_COLS[t];
  const tall = () => LAY === LAYOUTS.tall;

  function init(opts) {
    o = opts; PX = o.PX; cv = o.canvas;
    art = document.createElement("canvas"); q = art.getContext("2d");
    icon = document.createElement("canvas"); icon.width = icon.height = PX.K;
    addEventListener("resize", fit); fit();
    const hit = (e) => { const [x, y] = toArt(e); for (let i = hits.length - 1; i >= 0; i--) { const h = hits[i]; if (x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h) return h; } return null; };
    cv.addEventListener("pointermove", (e) => {
      const h = hit(e), id = h ? h.id : null;
      if (id !== hover) { hover = id; if (h && h.menu !== undefined) { if (menu === "levels") lvSel = h.menu; else sel = h.menu; o.SND.play("ui"); } }
      cv.style.cursor = h || tileAt(e) ? "pointer" : "default";
    });
    cv.addEventListener("pointerleave", () => { hover = null; });
    cv.addEventListener("pointerdown", (e) => { const h = hit(e); if (!h) return; e.preventDefault(); h.act(); });
  }
  const toArt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };

  // A window taller than wide gets the tall layout. A touch screen (no mouse to hover) gets on-screen buttons in
  // either layout; with a keyboard and mouse the keys are shown instead (and are clickable).
  function fit() {
    TOUCH = matchMedia("(hover: none) and (pointer: coarse)").matches;
    LAY = innerHeight > innerWidth * 1.15 ? LAYOUTS.tall : LAYOUTS.wide; W = LAY.W; H = LAY.H;
    if (art.width !== W || art.height !== H) { art.width = W; art.height = H; }
    // Desktops scale by whole numbers (crisp pixels). Phones fill the screen: their dense displays hide the uneven
    // pixels of a fractional scale, and the backing canvas is drawn at the device's own resolution.
    const s = Math.min(innerWidth / W, innerHeight / H), k = TOUCH || s < 2 ? Math.max(0.5, s * 0.98) : Math.floor(s);
    const back = Math.max(1, Math.ceil(k * (devicePixelRatio || 1)));
    cv.width = W * back; cv.height = H * back;
    cv.style.width = Math.round(W * k) + "px"; cv.style.height = Math.round(H * k) + "px";
  }

  // ---------- drawing helpers ----------
  // Every box text can sit in (panel, button, keycap, tile, ribbon) is reported to window.__uiBox when a layout test
  // sets it, so the test can check that no text runs past its box.
  const box = (x, y, w, h) => { if (root.__uiBox) root.__uiBox(x, y, w, h); };
  function panel(x, y, w, h, fill = PANEL) {
    box(x, y, w, h);
    rect(x + 2, y + 2, w, h, "rgba(0,0,0,0.45)");
    rect(x - 1, y - 1, w + 2, h + 2, INK); rect(x, y, w, h, fill);
    rect(x, y, w, 1, EDGE_HI); rect(x, y, 1, h, EDGE); rect(x + w - 1, y, 1, h, EDGE); rect(x, y + h - 1, w, 1, EDGE);
  }
  function keycap(label, x, y, id, act, gold) {
    const w = tw(label) + 6, on = hover === id;
    box(x, y, w, 10); rect(x - 1, y - 1, w + 2, 12, INK);
    rect(x, y, w, 10, gold ? (on ? "#fce080" : GOLD) : on ? "#5a5a8c" : "#34345a"); rect(x, y, w, 1, gold ? "#fcf0a8" : on ? "#8a8abc" : "#5a5a88"); rect(x, y + 9, w, 1, gold ? "#a86808" : "#1c1c34");
    text(label, x + 3, y + 1, gold ? INK : on ? "#ffffff" : TEXT);
    if (act) hits.push({ id, x: x - 1, y: y - 1, w: w + 2, h: 12, act });
    return w;
  }
  // [key] label pairs; align: "left" from x, "right" ending at x, "centre" on x.
  function keyRow(items, x, y, align = "centre") {
    const widths = items.map(([k, l]) => tw(k) + 6 + 3 + tw(l)), total = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * 7;
    let cx = Math.round(align === "left" ? x : align === "right" ? x - total : x - total / 2);
    items.forEach(([k, l, id, act], i) => {
      const kw = keycap(k, cx, y, id, act);
      text(l, cx + kw + 3, y + 1, hover === id ? TEXT : DIM);
      if (act) hits.push({ id, x: cx + kw, y: y - 1, w: 3 + tw(l), h: 12, act });
      cx += widths[i] + 7;
    });
  }
  // A big pixel button; returns its rect.
  function button(label, x, y, w, h, id, act, kind) {
    const on = hover === id, gold = kind === "gold", face = gold ? (on ? "#fce080" : GOLD) : on ? "#4a4a7c" : "#2c2c50";
    box(x, y, w, h); rect(x - 1, y - 1, w + 2, h + 2, INK); rect(x, y, w, h, face);
    rect(x, y, w, 1, gold ? "#fcf0a8" : "#5a5a88"); rect(x, y + h - 2, w, 2, gold ? "#a86808" : "#1a1a30");
    centre(label, x + w / 2, y + Math.round((h - 8) / 2), gold ? INK : TEXT);
    hits.push({ id, x: x - 1, y: y - 1, w: w + 2, h: h + 2, act });
  }
  function tileIcon(ch, viewer, x, y, now, state) {
    PX.render(icon, { map: [ch], viewer, t: now, state: state ? () => state : undefined });
    q.drawImage(icon, Math.round(x), Math.round(y));
  }
  function body(t, x, y, now, extra = {}) { PX.drawBody(q, { t, x: x / PX.K, y: y / PX.K, frame: Math.floor(now / 250) % 2, lift: Math.floor(now / 450) % 2, awake: true, ...extra }); }
  function sky(me, now) {
    const tint = TINT[me], hb = H / NIGHT.length, col = (c) => tint === "#000000" ? c : PX.mix(c, tint, 0.35);
    NIGHT.forEach((c, i) => rect(0, i * hb, W, Math.ceil(hb) + 1, col(c)));
    for (let i = 1; i < NIGHT.length; i++) for (let x = i % 2; x < W; x += 2) rect(x, Math.round(i * hb) - 1, 1, 1, col(NIGHT[i]));
    // stars only where no text sits: beside the board, never in the top bar or under the message line
    for (const [x, y, p] of STARS) if (x < W && y > 16 && y < LAY.msg.y - 3) { const t = Math.floor(now / 450 + p) % 7; rect(x, y, 1, 1, t === 0 ? "#fcfcfc" : t < 3 ? "#7c7ca8" : "#3c3c64"); }
  }
  // What a body makes of a block of a colour: solid, or not there for it (walk in). The spirit sees both as fog.
  const verdict = (me, col) => me === "S" ? "fog" : (me === "G") === (col === "R") ? "solid" : "walk in";

  // ---------- the game view ----------
  function frame(now, state) {
    g = state; hits = [];
    q.clearRect(0, 0, W, H);
    sky(g.me, now);
    topBar(now);
    boardView(now);
    if (tall()) { tallInfo(now); tallPad(now); } else sidePanel(now);
    messages(now);
    confetti(now);
    introRibbon(now);
    if (hintOpen) hintCard(now);
    if (g.legendOpen) howToPlay(now);
    if (menu === "pause") pauseMenu(now);
    if (menu === "levels") levelSelect(now);
    const c = cv.getContext("2d"); c.imageSmoothingEnabled = false; c.drawImage(art, 0, 0, cv.width, cv.height);
  }

  // A win throws confetti from the exit over the whole screen as the ring of light rises (not with "reduce motion"):
  // each piece flutters between a square and a sliver, falls back and winks out on its own.
  const CONFETTI = ["#f8b800", "#fcfcfc", "#fce0a8", "#58d854", "#f8a4c0", "#3cbcfc", "#f83800"];
  function confetti(now) {
    const d = (now - g.winFlashAt) / 1000;
    if (!g.won || !boardRect || d < 0 || d > 1.6 || PX.calm()) return;
    const ex = boardRect.x + g.exit[0] * PX.K + 8, ey = boardRect.y + g.exit[1] * PX.K + 6;
    for (let i = 0; i < 40; i++) {
      const h = Math.imul(i + 1, 2654435761) >>> 0, life = 0.8 + (h >>> 4) % 80 / 100;
      if (d > life) continue;
      const a = -Math.PI / 2 + ((h % 1000) / 1000 - 0.5) * 2.4, v = 70 + (h >>> 10) % 90, s = i % 3 ? 2 : 3;
      rect(ex + Math.cos(a) * v * d, ey + Math.sin(a) * v * d + 140 * d * d, s, Math.floor(now / 90 + i) % 2 ? 1 : s, CONFETTI[i % CONFETTI.length]);
    }
  }

  // The level's gold number chip and name; on the wide layout with a keyboard the main keys sit at the right of the
  // bar (L and H are named in the message line), leaving room for the longest level name.
  function topBar() {
    const x = LAY.col.x, chip = g.label, cw = tw(chip) + 6, y = 4;
    rect(x - 1, y - 1, cw + 2, 12, INK); rect(x, y, cw, 10, GOLD); rect(x, y + 9, cw, 1, "#a86808"); text(chip, x + 3, y + 1, INK);
    text(g.name, x + cw + 5, y + 1, TEXT, INK);
    if (!tall() && !TOUCH) keyRow([["Z", "undo", "k-undo", () => o.act("undo")], ["R", "restart", "k-restart", () => o.act("restart")],
      ["Esc", "menu", "k-menu", () => openMenu("pause")]], W - 4, y, "right");
  }

  function boardView(now) {
    const b = g.board, bw = b.width, bh = b.height, C = LAY.col;
    const bx = Math.round(C.x + (C.w - bw) / 2), by = Math.round(C.y + (C.h - bh) / 2);
    boardRect = { x: bx, y: by, w: bw, h: bh };
    // a hop lands with a one-pixel shake and a flash, as on the title screen; a refused press bumps the board a
    // pixel toward the push and back. A win flashes the frame white and rings it gold as the light rises from the
    // exit. With "reduce motion" none of these happen: the frame just turns gold.
    const still = PX.calm(), land = still ? Infinity : g.hopLanded, wt = g.won && !still ? now - g.winFlashAt : -1;
    let sx = land >= 0 && land < 90 ? (Math.floor(now / 30) % 2 ? 1 : -1) : 0, sy = 0;
    if (g.bump && !still && g.bump[2] < 100) { const j = Math.floor(g.bump[2] / 25) % 2 ? -1 : 1; sx += g.bump[0] * j; sy += g.bump[1] * j; }
    rect(bx + 3, by + 3, bw, bh, "rgba(0,0,0,0.5)");
    if (wt >= 0 && wt < 400) rect(bx - 3, by - 3, bw + 6, bh + 6, Math.floor(wt / 100) % 2 ? "#fcf0a8" : GOLD);
    rect(bx - 2, by - 2, bw + 4, bh + 4, INK); rect(bx - 1, by - 1, bw + 2, bh + 2, g.won ? (wt >= 0 && wt < 80 ? "#ffffff" : GOLD) : EDGE_HI);
    q.drawImage(b, bx + sx, by + sy);
    if (land >= 0 && land < 60) rect(bx, by, bw, bh, "rgba(255,255,255,0.2)");
  }

  function sidePanel(now) {
    const { x, y, w, h } = LAY.pan, me = g.me, L = x + 7;
    panel(x, y, w, h);
    // who you are: a portrait, the name in the logo font, and what this body makes of red and blue
    rect(L - 1, y + 5, 24, 24, INK); rect(L, y + 6, 22, 22, "#1c1c3c"); rect(L, y + 6, 22, 1, EDGE_HI);
    body(me, L + 3, y + 9, now, { awake: me !== "S" });
    text("You are the", L + 29, y + 5, DIM);
    PX.logo(q, NAME[me], L + 29, y + 15, 1, () => bodyCols(me));
    [["R", "Red"], ["B", "Blue"]].forEach(([ch, nm], i) => {
      const ix = L + i * 70, iy = y + 32, v = verdict(me, ch);
      rect(ix - 1, iy - 1, 18, 18, INK); tileIcon(ch, me, ix, iy, now);
      text(nm, ix + 20, iy - 1, ch === "R" ? "#f89878" : "#8cc4f8");
      text(v, ix + 20, iy + 9, v === "walk in" ? GOOD : DIM);
    });
    rect(x + 6, y + 52, w - 12, 1, EDGE);
    // turns against par in one row: label, big number, par; one pip per turn below (gold to par, red past it)
    turnsRow(L, y + 56, x + w - 7);
    rect(x + 6, y + 79, w - 12, 1, EDGE);
    if (g.won) winBlock(now, x, y + 82, w);
    else if (TOUCH) panelPad(L, y + 84, x + w - 7);
    else { // "Hint:" in gold starts the first line; the longest hint takes six lines, at a tighter line pitch
      const lines = PX.wrap("Hint: " + g.hint, w - 14).slice(0, 6), pitch = lines.length > 5 ? 9 : 10;
      lines.forEach((ln, i) => text(ln, L, y + 83 + i * pitch, "#c0c0dc"));
      text("Hint:", L, y + 83, GOLD);
    }
  }
  function turnsRow(x, y, right) {
    const over = g.par && g.turns > g.par, num = String(g.turns), nw = PX.logoWidth(num, 1);
    text("Turns", x, y + 3, DIM);
    PX.logo(q, num, x + 35, y, 1, () => over ? bodyCols("G") : bodyCols("gold"));
    text(`/ par ${g.par}`, x + 35 + nw + 6, y + 3, TEXT);
    const n = Math.max(g.par, g.turns), pip = n > 34 ? 3 : 4, bs = g.best ? `best ${g.best}` : "", room = right - x - (bs ? tw(bs) + 6 : 0), max = Math.floor(room / pip);
    for (let i = 0; i < Math.min(n, max); i++) { const px = x + i * pip, py = y + 16; if (i < g.turns) rect(px, py, pip - 1, 4, i < g.par ? GOLD : BAD); else { rect(px, py, pip - 1, 4, "#4a4a74"); rect(px, py + 1, pip - 1, 2, "#1c1c38"); } }
    if (bs) text(bs, right - tw(bs), y + 14, DIM);
  }
  // After a win the panel shows the result: OUT! hops in, the turns, a PAR stamp, and a big Next button.
  function winBlock(now, x, y, w) {
    const t = now - g.wonAt - 500, cx = x + w / 2;
    if (t < 0) return;
    const word = "OUT!", lw = PX.logoWidth(word, 1.5);
    PX.logo(q, word, Math.round(cx - lw / 2) - 18, y + 4, 1.5, () => bodyCols(g.me === "S" ? "gold" : g.me), (n) => { const d = t - n * 70; return d < 0 ? 99 : d < 200 ? Math.round(Math.sin(Math.PI * d / 200) * 5) : Math.floor(now / 500 + n * 0.5) % 2; });
    if (t > 350 && g.par) {
      const atPar = g.turns <= g.par, k = prog(t, 350, 100), sx = Math.round(cx + lw / 2 - 6), sy = y + 6;
      if (atPar) {
        if (stampedFor !== g.wonAt) { stampedFor = g.wonAt; o.SND.play("plate-down"); }
        const grow = k < 1 ? 1 : 0;
        rect(sx - 1 - grow, sy - 1 - grow, 30 + grow * 2, 14 + grow * 2, GOLD); rect(sx, sy, 28, 12, "#2a1e08"); text("PAR!", sx + 3, sy + 3, GOLD);
      } else { text("par", sx + 4, sy, DIM); text(String(g.par), sx + 6, sy + 8, DIM); }
    }
    if (t > 250) centre(g.turns <= g.par ? `Out in ${g.turns} turns: par!` : `Out in ${g.turns} turns. Par is ${g.par}.`, cx, y + 23, TEXT);
    if (g.chapterEnd && !g.endMain && t > 250) centre(`${g.chapter} complete!`, cx, y + 32, GOLD);
    if (t > 450) {
      const b = Math.floor(now / 400) % 2;
      button(`${TOUCH ? "" : "N  "}${nextLabel()} ${b ? "→" : " "}`, x + 8, y + 41, w - 16, 14, "k-next", () => o.act("next"), "gold");
    }
  }
  const nextLabel = () => g.endMain ? "Finish the shift" : g.last ? "Finish" : g.chapterEnd ? `On to ${g.nextChapter}` : "Next level";

  // The message line: the latest message, or (none) how to play: with a keyboard it alternates two tips.
  const IDLE_KEYS = ["Arrows or WASD move. Walk into a body to hop in.", "L: how to play.   H: the hint.   Esc: the menu."];
  function messages(now) {
    const cx = W / 2, st = g.status, { y, lines: max } = LAY.msg;
    let lines, col;
    if (st.text && !(g.won && !tall())) { lines = PX.wrap(st.text, W - 10).slice(0, max); col = st.cls === "bad" ? BAD : st.cls === "good" ? GOLD : TEXT; }
    else if (g.won) { lines = []; }
    else { lines = PX.wrap(TOUCH ? "Tap the pad or the board to move. Walk into a body to hop into it." : IDLE_KEYS[Math.floor(now / 5000) % 2], W - 10); col = DIM; }
    const shake = st.text && st.cls === "bad" && now - st.at < 120 && !PX.calm() ? (Math.floor(now / 30) % 2 ? 1 : -1) : 0;
    const y0 = tall() ? y : lines.length > 1 ? y : y + 5, outline = col === DIM ? null : INK; // the plain hint reads best without an outline
    lines.forEach((ln, i) => centre(ln, cx + shake, y0 + i * 10, col, outline));
  }

  // ---------- tall layout: your body and the turns under the messages, then the pad and buttons ----------
  function tallInfo(now) {
    const y = LAY.info.y, me = g.me, x = 4;
    panel(2, y, W - 4, 36);
    rect(x + 1, y + 4, 22, 22, "#1c1c3c"); body(me, x + 4, y + 7, now, { awake: me !== "S" });
    PX.logo(q, NAME[me], x + 28, y + 4, 1, () => bodyCols(me));
    // turns against par, labelled, at the right of the name row
    const tn = String(g.turns), tp = `/${g.par}`, tx = W - 6 - (tw("Turn") + 5 + tw(tn) + 1 + tw(tp));
    text("Turn", tx, y + 6, DIM); text(tn, tx + tw("Turn") + 5, y + 6, g.turns > g.par ? BAD : GOLD, INK); text(tp, tx + tw("Turn") + 5 + tw(tn) + 1, y + 6, DIM);
    [["R", "Red"], ["B", "Blue"]].forEach(([ch, nm], i) => {
      const ix = x + 28 + i * 64, iy = y + 21, v = verdict(me, ch);
      rect(ix, iy, 6, 6, ch === "R" ? "#d84830" : "#3c7ce8"); text(v, ix + 9, iy, v === "walk in" ? GOOD : DIM);
    });
  }
  const pad = (x, y, c) => {
    const dir = (d, gx, gy, glyph) => button(glyph, x + gx * c, y + gy * c, c - 2, c - 2, "pad-" + d, () => o.act("move", d));
    dir("up", 1, 0, "↑"); dir("left", 0, 1, "←"); dir("right", 2, 1, "→"); dir("down", 1, 2, "↓");
  };
  const showHint = () => { hintOpen = !hintOpen; o.SND.play("ui"); if (hintOpen && o.track) o.track("hint_opened"); };
  // Tall: on a touch screen the arrow pad and buttons; with a keyboard, the keys.
  function tallPad() {
    const y = LAY.pad.y;
    if (!TOUCH) {
      keyRow([["←↑→↓", "move", "k-move", null], ["H", "hint", "k-hint", showHint]], W / 2, y + 6);
      keyRow([["Z", "undo", "k-undo", () => o.act("undo")], ["R", "restart", "k-restart", () => o.act("restart")]], W / 2, y + 22);
      keyRow([["L", "help", "k-legend", () => o.act("legend")], ["Esc", "menu", "k-menu", () => openMenu("pause")]], W / 2, y + 38);
      return;
    }
    pad(6, y, 18);
    const bx = 61, bw = 47, bh = 16;
    if (g.won) button("NEXT →", bx, y, bw * 2 + 3, bh, "t-next", () => o.act("next"), "gold");
    else { button("HINT", bx, y, bw, bh, "t-hint", showHint); button("HELP", bx + bw + 3, y, bw, bh, "t-help", () => o.act("legend")); }
    button("UNDO", bx, y + 19, bw, bh, "t-undo", () => o.act("undo"));
    button("RESTART", bx + bw + 3, y + 19, bw, bh, "t-restart", () => o.act("restart"));
    button("MENU", bx, y + 38, bw * 2 + 3, bh, "t-menu", () => openMenu("pause"));
  }
  // Wide on a touch screen: the pad and buttons take the hint's place in the panel (HINT shows it over the board).
  function panelPad(x, y, right) {
    pad(x, y, 18);
    const bx = x + 58, bw = Math.floor((right - bx - 3) / 2), bh = 16;
    button("HINT", bx, y, bw, bh, "t-hint", showHint); button("HELP", bx + bw + 3, y, bw, bh, "t-help", () => o.act("legend"));
    button("UNDO", bx, y + 19, bw, bh, "t-undo", () => o.act("undo")); button("MENU", bx + bw + 3, y + 19, bw, bh, "t-menu", () => openMenu("pause"));
    button("RESTART", bx, y + 38, bw * 2 + 3, bh, "t-restart", () => o.act("restart"));
  }
  function hintCard() {
    const B = boardRect, x = LAY.col.x + 4, w = LAY.col.w - 8, lines = PX.wrap(g.hint, w - 12), h = 22 + lines.length * 10;
    const y = Math.round(B.y + (B.h - h) / 2);
    panel(x, y, w, h); text("Hint", x + 6, y + 5, GOLD);
    lines.forEach((ln, i) => text(ln, x + 6, y + 16 + i * 10, TEXT));
    hits.push({ id: "hint", x: 0, y: 0, w: W, h: H, act: () => { hintOpen = false; } });
  }

  // ---------- a level starts: a ribbon over the board with the chapter, the level and its name ----------
  function intro(now, info) { introAt = now; introInfo = info; hintOpen = false; }
  const skipIntro = () => { introAt = -1e9; };
  function introRibbon(now) {
    const t = now - introAt; if (!introInfo || t > 1600 || !boardRect) return;
    const C = LAY.col, slide = t < 120 ? Math.round((1 - prog(t, 0, 120)) * 4) * -C.w / 4 : t > 1450 ? Math.round(prog(t, 1450, 150) * 4) * C.w / 4 : 0;
    const name = introInfo.name.toUpperCase(), lines = [];
    for (const word of name.split(" ")) { const last = lines[lines.length - 1]; if (last && PX.logoWidth(last + " " + word, 1) <= C.w - 10) lines[lines.length - 1] = last + " " + word; else lines.push(word); }
    const h = 30 + lines.length * 14, y = Math.round(C.y + (C.h - h) / 2);
    q.save(); q.beginPath(); q.rect(C.x - 2, 0, C.w + 4, H); q.clip(); q.translate(slide, 0);
    box(C.x, y, C.w, h); rect(C.x - 2, y - 2, C.w + 4, h + 4, INK); rect(C.x, y, C.w, h, "#101026"); rect(C.x, y, C.w, 1, EDGE_HI); rect(C.x, y + h - 1, C.w, 1, EDGE);
    const cx = C.x + C.w / 2;
    centre(introInfo.chapter, cx, y + 5, GOLD, INK);
    centre(introInfo.label, cx, y + 16, DIM, INK);
    lines.forEach((ln, i) => PX.logo(q, ln, Math.round(cx - PX.logoWidth(ln, 1) / 2), y + 29 + i * 14, 1, () => bodyCols(g ? g.me : "S")));
    q.restore();
  }

  // ---------- menus ----------
  function openMenu(kind) { menu = kind; sel = 0; hintOpen = false; if (kind === "levels") lvSel = o.current(); o.SND.play("ui"); }
  const menuOpen = () => menu;
  function pauseItems() {
    const stats = o.stats ? o.stats() : null; // null: stats can't be sent here (a file, automation, Do Not Track), so no switch
    return [
      ["Resume", () => { menu = null; }],
      ["Restart level", () => { menu = null; o.act("restart"); }],
      ["Level select", () => openMenu("levels")],
      ["How to play", () => { menu = null; o.act("legend"); }],
      ["Send feedback", () => { menu = null; o.act("feedback"); }],
      [`Music: ${o.music() ? "on" : "off"}`, () => o.act("music"), true],
      [`Sound: ${o.sfx() ? "on" : "off"}`, () => o.act("sound"), true],
      ...(stats === null ? [] : [[`Play stats: ${stats ? "on" : "off"}`, () => o.act("stats"), true]]),
      ["Title screen", () => { menu = null; o.act("title"); }],
    ];
  }
  const cover = () => { if (root.__uiBox) root.__uiBox(); }; // an overlay hides every box under it (for the layout test)
  function dim() { cover(); rect(0, 0, W, H, "rgba(4,4,12,0.96)"); }
  function pauseMenu(now) {
    dim();
    const items = pauseItems(), pw = 150, ph = 30 + items.length * 12 + 16, px = Math.round((W - pw) / 2), py = Math.round((H - ph) / 2);
    panel(px, py, pw, ph);
    const t = "PAUSED"; PX.logo(q, t, Math.round(W / 2 - PX.logoWidth(t, 1) / 2), py + 7, 1, () => bodyCols(g ? g.me : "S"));
    items.forEach(([label, , keep], i) => {
      const iy = py + 28 + i * 12, on = i === sel, lw = tw(label), lx = Math.round(W / 2 - lw / 2);
      if (on) { rect(px + 6, iy - 2, pw - 12, 11, "#24244a"); const b = Math.floor(now / 260) % 2; for (let r = 0; r < 4; r++) { rect(lx - 9 + b + r, iy + r, 1, 7 - 2 * r, GOLD); rect(lx + lw + 8 - b - r, iy + r, 1, 7 - 2 * r, GOLD); } }
      text(label, lx, iy, on ? GOLD : TEXT);
      hits.push({ id: "m" + i, menu: i, x: px + 4, y: iy - 2, w: pw - 8, h: 11, act: () => { sel = i; activateMenu(); } });
    });
    if (TOUCH) centre("Tap Resume to go back", W / 2, py + ph - 12, FAINT);
    else keyRow([["Esc", "back", "m-back", () => { menu = null; o.SND.play("ui"); }]], W / 2, py + ph - 14);
  }
  function activateMenu() { const it = pauseItems()[sel]; if (!it) return; if (!it[2]) o.SND.play("ui"); it[1](); }

  // Level select: a row of tiles per chapter. Solved: filled with a green tick; at par: a gold star too.
  function chapters() {
    const rows = []; let cur = null;
    o.levels.forEach((lv, i) => { const ch = o.chapterOf(i); if (!cur || cur.raw !== ch) rows.push(cur = { raw: ch, name: /^Night shift/.test(ch) ? "Night shift" : ch, bonus: /^Night shift/.test(ch), levels: [] }); cur.levels.push(i); });
    return rows;
  }
  function levelTile(i, tx, ty) {
    const on = i === lvSel, done = o.isDone(i), par = o.atPar(i), cur = i === o.current();
    box(tx, ty, 20, 16); rect(tx - 1, ty - 1, 22, 18, on ? GOLD : INK);
    rect(tx, ty, 20, 16, done ? "#2c4a3c" : "#14142a"); rect(tx, ty, 20, 1, done ? "#4c7c5c" : "#2a2a4c");
    if (!done) { rect(tx, ty, 1, 16, "#2a2a4c"); rect(tx + 19, ty, 1, 16, "#2a2a4c"); rect(tx, ty + 15, 20, 1, "#2a2a4c"); }
    const lb = o.label(i); text(lb, tx + 10 - tw(lb) / 2, ty + 4, on ? GOLD : done ? TEXT : DIM);
    if (done) { rect(tx + 14, ty + 11, 1, 1, GOOD); rect(tx + 15, ty + 12, 1, 1, GOOD); rect(tx + 16, ty + 11, 1, 1, GOOD); rect(tx + 17, ty + 10, 1, 1, GOOD); rect(tx + 18, ty + 9, 1, 1, GOOD); }
    if (par) { rect(tx + 3, ty + 2, 1, 3, GOLD); rect(tx + 2, ty + 3, 3, 1, GOLD); }
    if (cur) rect(tx + 7, ty + 13, 6, 1, on ? GOLD : TEXT);
    hits.push({ id: "lv" + i, menu: i, x: tx - 1, y: ty - 1, w: 22, h: 18, act: () => { lvSel = i; goLevel(); } });
  }
  function levelSelect() {
    dim();
    const rows = chapters(), T = tall(), pw = T ? 152 : 236, rh = T ? 30 : 22, ph = 30 + rows.length * rh + 44, px = Math.round((W - pw) / 2), py = Math.round((H - ph) / 2);
    panel(px, py, pw, ph);
    PX.logo(q, "LEVELS", Math.round(W / 2 - PX.logoWidth("LEVELS", 1) / 2), py + 7, 1, () => bodyCols("gold"));
    rows.forEach((r, ri) => {
      const ry = py + 28 + ri * rh, label = r.bonus ? "Night shift (bonus)" : r.name;
      if (T) { text(label, px + 6, ry, DIM); r.levels.forEach((i, k) => levelTile(i, px + 6 + k * 23, ry + 10)); }
      else { text(r.bonus ? "Night shift" : r.name, px + 8, r.bonus ? ry : ry + 4, DIM); if (r.bonus) text("bonus", px + 8, ry + 10, FAINT); r.levels.forEach((i, k) => levelTile(i, px + 88 + k * 23, ry)); }
    });
    const lv = o.levels[lvSel], best = o.best(lvSel), by = py + ph - 42;
    rect(px + 6, by - 3, pw - 12, 1, EDGE);
    // the narrow (tall) panel names the level without its number (the tile shows it) and shortens the status
    centre(T ? lv.name : `${o.label(lvSel)} · ${lv.name}`, W / 2, by + 1, TEXT, INK);
    const status = best ? (T ? `Best ${best} · par ${lv.par}` : `Solved · best ${best} · par ${lv.par}`) : o.isDone(lvSel) ? `Solved · par ${lv.par}` : `${T ? "Not solved" : "Not solved yet"} · par ${lv.par}`;
    centre(status, W / 2, by + 11, DIM);
    // the key to the marks, and how to leave
    const ky = py + ph - 14;
    rect(px + 8, ky + 1, 6, 6, "#2c4a3c"); text("solved", px + 17, ky, DIM);
    rect(px + 59, ky + 2, 1, 3, GOLD); rect(px + 58, ky + 3, 3, 1, GOLD); text("at par", px + 64, ky, DIM);
    const back = () => { openMenu("pause"); sel = 2; };
    if (TOUCH) button("BACK", px + pw - 44, ky - 3, 38, 13, "l-back", back);
    else keyRow([["Esc", "back", "l-back", back]], px + pw - 6, ky - 1, "right");
  }
  function goLevel() { menu = null; o.SND.play("ui"); o.act("level", lvSel); }
  function moveLevel(dx, dy) {
    const rows = chapters(), ri = rows.findIndex((r) => r.levels.includes(lvSel)), k = rows[ri].levels.indexOf(lvSel);
    if (dx) { const r = rows[ri].levels; lvSel = r[(k + dx + r.length) % r.length]; }
    if (dy) { const r = rows[(ri + dy + rows.length) % rows.length].levels; lvSel = r[Math.min(k, r.length - 1)]; }
    o.SND.play("ui");
  }

  // ---------- How to play: each body and what it makes of every tile ----------
  const SAY = { S: { R: "solid (fog)", B: "solid (fog)", P: "can't press" }, G: { R: "solid", B: "walk in", P: "opens gates" }, C: { R: "walk in", B: "solid", P: "opens gates" } };
  const SUB = { S: "colour-blind", G: "sees red", C: "sees blue" };
  const sayCol = (v) => v === "walk in" ? GOOD : v === "can't press" ? BAD : DIM;
  function howToPlay(now) {
    cover(); rect(0, 0, W, H, "rgba(4,4,12,0.85)");
    const px = 4, py = 3, pw = W - 8, ph = H - 6, T = tall();
    panel(px, py, pw, ph);
    const t = "HOW TO PLAY"; PX.logo(q, t, Math.round(W / 2 - PX.logoWidth(t, 1) / 2), py + 5, 1, () => bodyCols(g ? g.me : "S"));
    ["S", "G", "C"].forEach((b, i) => {
      const on = g && g.me === b;
      if (T) { // one row per body: sprite and name, then its three tiles with a word under each
        const x = px + 5, y = py + 24 + i * 62;
        rect(x - 2, y - 2, pw - 6, 60, on ? "#22224a" : "#181834"); if (on) rect(x - 2, y - 2, pw - 6, 1, GOLD);
        body(b, x, y, now, { awake: b !== "S" }); text(NAME[b], x + 20, y, ACCENT[b], INK); text(SUB[b], x + 20, y + 10, DIM);
        [["R", "R"], ["B", "B"], ["_", "P"]].forEach(([ch, k], j) => { // a cell per tile: the icon, and the word under it
          const cx = x + j * 49 + 24, iy = y + 19, v = SAY[b][k];
          rect(cx - 9, iy - 1, 18, 18, INK); tileIcon(ch, b, cx - 8, iy, now, ch === "_" ? { press: 0 } : null);
          PX.wrap(v, 48).forEach((ln, n) => centre(ln, cx, iy + 18 + n * 9, sayCol(v)));
        });
      } else { // three columns
        const x = px + 6 + i * 103, y = py + 23;
        rect(x - 2, y - 2, 99, 82, on ? "#22224a" : "#181834"); if (on) rect(x - 2, y - 2, 99, 1, GOLD);
        body(b, x, y, now, { awake: b !== "S" }); text(NAME[b], x + 20, y, ACCENT[b], INK); text(SUB[b], x + 20, y + 10, DIM);
        [["R", "Red block"], ["B", "Blue block"], ["_", "Plate"]].forEach(([ch, nm], j) => {
          const iy = y + 22 + j * 20, v = SAY[b][ch === "_" ? "P" : ch];
          rect(x - 1, iy - 1, 18, 18, INK); tileIcon(ch, b, x, iy, now, ch === "_" ? { press: 0 } : null);
          text(nm, x + 20, iy - 1, ch === "R" ? "#f89878" : ch === "B" ? "#8cc4f8" : TEXT);
          text(v, x + 20, iy + 9, sayCol(v));
        });
      }
    });
    // the rest of the rules, one line each, with a picture in one column of icons
    const rules = [[T ? "A body on any plate or gate opens them." : "A body on any plate or gate opens gates.", "gate"], ["Walk into a body to hop into it.", "hop"], ["Reach the exit in any body to win.", "exit"]];
    const y0 = T ? py + 207 : py + 109, rowH = T ? 21 : 18, iconW = T ? 18 : 36, tx = px + 6 + iconW + (T ? 5 : 6), cw = pw - (tx - px) - 6;
    rect(px + 6, y0 - 4, pw - 12, 1, EDGE);
    rules.forEach(([s, pic], j) => {
      const ry = y0 + j * rowH, ix = px + 6;
      if (pic === "gate") { rect(ix - 1, ry - 1, 18, 18, INK); tileIcon("|", "S", ix, ry, now, { open: T ? 1 : 0, lit: T }); if (!T) { rect(ix + 18, ry - 1, 18, 18, INK); tileIcon("|", "S", ix + 19, ry, now, { open: 1, lit: true }); } }
      if (pic === "hop") { if (T) body("G", ix, ry, now, { awake: true, active: true }); else { body("S", ix - 2, ry, now); text("→", ix + 14, ry + 5, GOLD); body("G", ix + 20, ry, now, { awake: true, active: true }); } }
      if (pic === "exit") { const ex = T ? ix : ix + 9; rect(ex - 1, ry - 1, 18, 18, INK); tileIcon("E", "S", ex, ry, now); }
      const lines = PX.wrap(s, cw); lines.forEach((ln, n) => text(ln, tx, ry + (lines.length > 1 ? 0 : 5) + n * 9, TEXT));
    });
    centre(TOUCH ? "Tap anywhere to close." : tall() ? "L or Esc: close" : "Z undoes anything.   L or Esc: close", W / 2, py + ph - 11, FAINT);
    hits = [{ id: "legend", x: 0, y: 0, w: W, h: H, act: () => o.act("legend") }];
  }

  // Keys while a menu or the hint is open; returns true when the HUD used the key. Any key also ends the intro ribbon.
  function key(e) {
    const k = e.key;
    if (hintOpen && !menu) { hintOpen = false; if (k === "h" || k === "H") return true; }
    if (!menu) { skipIntro(); return false; }
    if (["Tab", "Shift", "Control", "Alt", "Meta"].includes(k)) return true;
    e.preventDefault();
    if (k === "m" || k === "M") { o.act("music"); return true; }
    if (menu === "levels") {
      if (k === "Escape") { openMenu("pause"); sel = 2; return true; }
      if (k === "ArrowLeft" || k === "a" || k === "A") moveLevel(-1, 0);
      else if (k === "ArrowRight" || k === "d" || k === "D") moveLevel(1, 0);
      else if (k === "ArrowUp" || k === "w" || k === "W") moveLevel(0, -1);
      else if (k === "ArrowDown" || k === "s" || k === "S") moveLevel(0, 1);
      else if (k === "Enter" || k === " " || k === "z" || k === "Z") goLevel();
      return true;
    }
    const n = pauseItems().length;
    if (k === "Escape" || k === "p" || k === "P") { menu = null; o.SND.play("ui"); return true; }
    if (k === "ArrowUp" || k === "w" || k === "W") { sel = (sel + n - 1) % n; o.SND.play("ui"); }
    else if (k === "ArrowDown" || k === "s" || k === "S") { sel = (sel + 1) % n; o.SND.play("ui"); }
    else if (k === "Enter" || k === " " || k === "z" || k === "Z" || k === "ArrowRight" || k === "d" || k === "D") activateMenu();
    return true;
  }
  function closeMenu() { menu = null; hintOpen = false; }

  // The board tile under a pointer, or null (also null while anything covers the board).
  function tileAt(e) {
    if (menu || hintOpen || !boardRect || (g && g.legendOpen)) return null;
    const [x, y] = toArt(e), b = boardRect;
    if (x < b.x || y < b.y || x >= b.x + b.w || y >= b.y + b.h) return null;
    return [Math.floor((x - b.x) / PX.K), Math.floor((y - b.y) / PX.K)];
  }

  root.BodyHopHUD = { init, fit, frame, key, intro, openMenu, closeMenu, menuOpen, tileAt, toggleHint: showHint };
})(typeof self !== "undefined" ? self : this);
