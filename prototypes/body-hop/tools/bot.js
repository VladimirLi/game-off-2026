#!/usr/bin/env node
// Browser check: replays each level's solver route as real key presses in Chromium and
// checks the game reports a win in exactly par turns. Optional screenshots for eyeballing.
//   node tools/bot.js [screenshot-dir]
const path = require("path");
const { chromium } = require("playwright");
const { solve } = require("./solve.js");
const LEVELS = require("../levels.js");
const KEY = { U: "ArrowUp", D: "ArrowDown", L: "ArrowLeft", R: "ArrowRight" };

(async () => {
  const shots = process.argv[2];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 760 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let bad = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    await page.goto("file://" + path.resolve(__dirname, "../index.html") + `?level=${i + 1}`);
    if (shots) await page.screenshot({ path: `${shots}/level${String(i + 1).padStart(2, "0")}-start.png` });
    const r = solve(LEVELS[i]);
    let firstHop = true;
    for (const m of r.moves) {
      await page.keyboard.press(KEY[m]);
      if (shots && firstHop && (await page.evaluate(() => window.__bodyhop.state.ctrl)) >= 0) {
        firstHop = false; await page.waitForTimeout(300);
        await page.screenshot({ path: `${shots}/level${String(i + 1).padStart(2, "0")}-hop.png` });
      }
    }
    const st = await page.evaluate(() => ({ won: window.__bodyhop.won, turns: window.__bodyhop.turns }));
    const ok = st.won && st.turns === LEVELS[i].par;
    if (!ok) bad++;
    console.log(`${i + 1} ${LEVELS[i].name.padEnd(22)} ${ok ? "ok" : "FAIL"} won=${st.won} turns=${st.turns} par=${LEVELS[i].par}`);
    // Undo everything and check we are back at the start state.
    for (let k = 0; k < r.moves.length; k++) await page.keyboard.press("z");
    const back = await page.evaluate(() => window.__bodyhop.turns);
    if (back !== 0) { bad++; console.log(`   undo FAIL: turns ${back} after full undo`); }
  }
  if (errors.length) { bad++; console.log("page errors:", errors); }
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
