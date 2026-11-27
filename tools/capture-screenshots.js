#!/usr/bin/env node
// Saves the screenshots listed in ITCH-PAGE.md ("Screenshots to take") from the local build, as PNGs in media/screenshots/.
// Like tools/bot.js and tools/record-gif.js it plays the real game in Chromium with key presses along the solver's
// routes, and it checks the game's state after the presses against the engine, so a shot that does not show what the
// list describes fails the run. Playwright's page.clock steps the game's own clock (performance.now and
// requestAnimationFrame), so every run draws the same frames and a re-run writes the same bytes unless the game looks
// different (checked run to run on one machine). Re-run it after any visual change:
//   node tools/capture-screenshots.js [out-dir]     (default media/screenshots; needs Playwright, not ffmpeg)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const BH = require("../game/engine.js");
const LEVELS = require("../game/levels.js");
const { solve } = require("./solve.js");

const INDEX = "file://" + path.resolve(__dirname, "../game/index.html");
const KEY = { U: "ArrowUp", D: "ArrowDown", L: "ArrowLeft", R: "ArrowRight" };
const DIR = { U: "up", D: "down", L: "left", R: "right" };

// itch.io says screenshots "can be any size" (itch.io/docs/creators/getting-started). 1280 x 720 is exactly 4x the
// game's 320 x 180 grid, so the pixels stay square and crisp. The title and end screens use a 192 x 144 grid, which
// the game centres at 5x with a bar of background on each side.
const SIZE = { width: 1280, height: 720 };
// The cover is the one size itch.io recommends: 630 x 500 (315:250, twice over). In a window that size the game
// draws the whole title at 3x (576 x 432) with a bar of background around it, so nothing is cut. A 630 x 500 crop of
// the 4x title (768 x 576) cuts either the tagline or the moon and leaves a few px above the logo and below the menu.
const COVER = { width: 630, height: 500 };

const START = 2000;      // the game's clock is frozen here once the page has loaded (ms; it loads in about 0.5 s, and pauseAt fails if it takes longer than START)
const STEP = 200;        // clock time between key presses: longer than a walk (160 ms), so each press is drawn
const SETTLE = 700;      // after the last press: the hop (350 ms), the plate and the gate bars finish drawing
const TITLE_AT = 3632;   // 132 ms after the title's second hop: BODY already cat blue, HOP still guard red
const END_PHASE = 4000;  // the end scene's 9 s loop: guard and cat out and waving, the spirit rising
const END_LOOP = 9000;

// The levels before the optional Night shift chapter, as index.html counts them.
const chapterOf = (i) => { for (let j = i; j >= 0; j--) if (LEVELS[j].chapter) return LEVELS[j].chapter; return ""; };
const MAIN = LEVELS.filter((_, i) => !/^Night shift/.test(chapterOf(i))).length;

// A fresh browser profile (nothing solved yet) with the game's clock stepped by us from START on.
async function open(browser, errors, query, viewport) {
  const page = await (await browser.newContext({ viewport })).newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.install({ time: 0 });
  await page.goto(INDEX + query);
  await page.clock.pauseAt(START);
  return page;
}

// Presses the first `count` keys of level `no`'s solver route (all of them by default), `gap` ms of game time
// apart, then checks the page agrees with the engine about where that leaves the game. Returns the engine's view.
async function play(page, no, count, gap = 0) {
  const level = LEVELS[no - 1], L = BH.parse(level), moves = solve(level).moves, n = count === undefined ? moves.length : count;
  let s = L.start;
  for (let i = 0; i < n; i++) {
    await page.keyboard.press(KEY[moves[i]]);
    s = BH.step(L, s, DIR[moves[i]]).state;
    if (gap) await page.clock.runFor(gap);
  }
  const got = await page.evaluate(() => ({ level: window.__bodyhop.level, ctrl: window.__bodyhop.state.ctrl, turns: window.__bodyhop.turns, won: window.__bodyhop.won }));
  const want = { level: no - 1, ctrl: s.ctrl, turns: n, won: BH.won(L, s) };
  if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`level ${no} after ${n} presses: the page says ${JSON.stringify(got)}, the engine ${JSON.stringify(want)}`);
  return { L, s, moves };
}

// How many presses of level `no`'s route it takes to make the first hop.
function pressesToFirstHop(no) {
  const L = BH.parse(LEVELS[no - 1]), moves = solve(LEVELS[no - 1]).moves;
  let s = L.start, n = 0;
  while (s.ctrl < 0) s = BH.step(L, s, DIR[moves[n++]]).state;
  return n;
}

// Refuses a picture that does not show what ITCH-PAGE.md says it shows.
const expect = (ok, what) => { if (!ok) throw new Error("not what ITCH-PAGE.md describes: " + what); };

// The title and end screens fade in with a CSS animation (0.3 s) that runs on the real clock, not the stepped one;
// "disabled" jumps finite CSS animations to their end, so no shot is taken half faded. The game has no other CSS animation.
async function save(page, out, file) {
  await page.screenshot({ path: path.join(out, file), animations: "disabled" });
  const buf = fs.readFileSync(path.join(out, file));
  console.log(`${path.relative(process.cwd(), path.join(out, file))}: ${buf.readUInt32BE(16)} x ${buf.readUInt32BE(20)}, ${(buf.length / 1000).toFixed(1)} KB`);
}

// One entry per numbered item under "Screenshots to take" in ITCH-PAGE.md.
const SHOTS = {
  // 1. The title while the logo's colour runs across the letters. The cover is the same moment in a 630 x 500 window.
  "1 title and cover": async (browser, errors, out) => {
    for (const [file, viewport] of [["01-title.png", SIZE], ["01-cover-630x500.png", COVER]]) {
      const page = await open(browser, errors, "", viewport);
      await page.clock.runFor(TITLE_AT - START);
      expect(await page.evaluate(() => document.getElementById("screen").classList.contains("open")), "the title screen is open");
      await save(page, out, file);
      await page.context().close();
    }
  },
  // 2. Level 1, straight after the hop: the spirit has walked into the guard and the room is drawn in the guard's colours.
  "2 level 1, first hop": async (browser, errors, out) => {
    const page = await open(browser, errors, "?level=1", SIZE);
    const { L, s } = await play(page, 1, pressesToFirstHop(1), STEP);
    expect(BH.current(L, s).t === "G", "level 1: the spirit has hopped into the guard");
    await page.clock.runFor(SETTLE);
    await save(page, out, "02-level1-first-hop.png");
  },
  // 3. Level 2, one step from the exit: the cat inside a red block, the guard asleep behind it.
  "3 level 2, cat in red": async (browser, errors, out) => {
    const page = await open(browser, errors, "?level=2", SIZE);
    const { L, s } = await play(page, 2, solve(LEVELS[1]).moves.length - 1, STEP);
    const me = BH.current(L, s);
    expect(me.t === "C" && L.tiles[me.y][me.x] === "R", "level 2: the cat is standing inside a red block");
    await page.clock.runFor(SETTLE);
    await save(page, out, "03-level2-cat-in-red.png");
  },
  // 4. Level 5 after the 8th press: the guard parked on the plate, the gate open, the cat on its way to the gate.
  "4 level 5, plate": async (browser, errors, out) => {
    const page = await open(browser, errors, "?level=5", SIZE);
    const { L, s } = await play(page, 5, 8, STEP);
    expect(BH.current(L, s).t === "C", "level 5: the cat is the body in play");
    expect(s.pos.some(([x, y], i) => L.types[i] === "G" && L.tiles[y][x] === "_"), "level 5: the guard is parked on the plate");
    expect(BH.platesHeld(L, s) && BH.gateOpen(L, s), "level 5: the plate is held and the gate is open");
    await page.clock.runFor(SETTLE);
    await save(page, out, "04-level5-guard-on-plate.png");
  },
  // 5. The end screen, after winning every main level at par as a player would (N between levels), so the Shift
  // report reads full marks and the CLOCKED OUT stamp has landed.
  "5 end screen": async (browser, errors, out) => {
    const page = await open(browser, errors, "?level=1", SIZE);
    for (let no = 1; no <= MAIN; no++) {
      const { L, s } = await play(page, no);
      expect(BH.won(L, s), `level ${no} is won along the solver's route`);
      await page.keyboard.press("n"); // the next level; after the last main level, the end screen
    }
    expect(await page.evaluate(() => document.getElementById("screen").classList.contains("open")), "the end screen is open");
    const saved = await page.evaluate(() => ({ done: JSON.parse(localStorage.getItem("bodyhop-done") || "[]"), best: JSON.parse(localStorage.getItem("bodyhop-best") || "{}") }));
    expect(LEVELS.slice(0, MAIN).every((lv) => saved.done.includes(lv.name) && saved.best[lv.name] <= lv.par), "the Shift report shows every main level solved and at par");
    // Count-up and stamp are done 1.3 s after the screen opens; then wait for the scene's loop to reach END_PHASE.
    const now = await page.evaluate(() => performance.now());
    let wait = (END_PHASE - (now % END_LOOP) + END_LOOP) % END_LOOP;
    if (wait < 1500) wait += END_LOOP;
    await page.clock.runFor(wait);
    await save(page, out, "05-end-screen.png");
  },
};

(async () => {
  const out = path.resolve(process.argv[2] || path.join(__dirname, "../media/screenshots"));
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const errors = [];
  let failed = 0;
  for (const [name, shot] of Object.entries(SHOTS)) {
    try { await shot(browser, errors, out); } catch (e) { failed++; console.error(`FAIL ${name}: ${e.message}`); }
  }
  await browser.close();
  if (errors.length) { failed++; console.error("page errors:", errors); }
  process.exit(failed ? 1 : 0);
})();
