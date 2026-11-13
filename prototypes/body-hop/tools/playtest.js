#!/usr/bin/env node
// Play harness for silent playtests. Each call replays the session's earlier input in a fresh
// browser, applies the new input, then saves a screenshot and prints what is on screen.
//   node play.js --session NAME [--keys "Right Right Up"] [--note "what I'm thinking"]
// Keys: Up Down Left Right Z (undo) R (restart) N (next level) L (legend) ShiftN (skip) Level:5 (click level button 5)
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const args = process.argv.slice(2);
const opt = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith("--")) opt[args[i].slice(2)] = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : true;
if (!opt.session) { console.error("usage: node play.js --session NAME [--keys \"...\"] [--note \"...\"]"); process.exit(2); }
const dir = path.join(__dirname, "sessions"), file = path.join(dir, opt.session + ".json");
const shotDir = path.join(dir, opt.session); fs.mkdirSync(shotDir, { recursive: true });
const S = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { session: opt.session, filter: opt.filter || null, started: new Date().toISOString(), calls: [] };
const VALID = new Set(["Up", "Down", "Left", "Right", "Z", "R", "N", "L", "ShiftN"]);
const newKeys = (typeof opt.keys === "string" ? opt.keys.trim().split(/[\s,]+/).filter(Boolean) : []).map((k) => k[0].toUpperCase() + k.slice(1));
for (const k of newKeys) if (!VALID.has(k) && !/^Level:\d+$/i.test(k)) { console.error(`Unknown key "${k}". Use: Up Down Left Right Z R N L ShiftN Level:<n>`); process.exit(2); }
const KEY = { Up: "ArrowUp", Down: "ArrowDown", Left: "ArrowLeft", Right: "ArrowRight", Z: "z", R: "r", N: "n", L: "l" };
// Colour-vision simulation (Machado et al. 2009 matrices, severity 1.0).
const FILTERS = {
  deuteranopia: "0.367 0.861 -0.228 0 0  0.280 0.673 0.047 0 0  -0.012 0.043 0.969 0 0  0 0 0 1 0",
  protanopia: "0.152 1.053 -0.205 0 0  0.115 0.786 0.099 0 0  -0.004 -0.048 1.052 0 0  0 0 0 1 0",
};
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 820 } });
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("file://" + path.join(__dirname, "game.html"));
  if (S.filter && FILTERS[S.filter]) {
    await page.evaluate((m) => {
      document.body.insertAdjacentHTML("beforeend", `<svg width="0" height="0" style="position:absolute"><filter id="cvd"><feColorMatrix type="matrix" values="${m}"/></filter></svg>`);
      document.documentElement.style.filter = "url(#cvd)";
    }, FILTERS[S.filter]);
  }
  const press = async (k) => {
    const m = /^Level:(\d+)$/i.exec(k);
    if (m) { const b = page.locator("#levels button").nth(Number(m[1]) - 1); if (await b.count()) await b.click(); return; }
    if (k === "ShiftN") return page.keyboard.press("Shift+N");
    await page.keyboard.press(KEY[k]);
  };
  for (const c of S.calls) for (const k of c.keys) await press(k);
  const before = await page.evaluate(() => ({ level: window.__bodyhop.level + 1 }));
  for (const k of newKeys) await press(k);
  await page.waitForTimeout(320);
  const view = await page.evaluate(() => {
    const t = (id) => (document.getElementById(id) || {}).textContent || "";
    return { title: t("title"), hint: t("hint"), body: t("body"), turns: t("turns"), status: t("status").trim(),
      level: window.__bodyhop.level + 1, won: window.__bodyhop.won, nTurns: window.__bodyhop.turns };
  });
  const n = S.calls.length;
  const shot = path.join(shotDir, `shot-${String(n).padStart(4, "0")}.png`);
  await page.locator("#app").screenshot({ path: shot });
  S.calls.push({ t: new Date().toISOString(), keys: newKeys, note: typeof opt.note === "string" ? opt.note : null,
    levelBefore: before.level, level: view.level, won: view.won, turns: view.nTurns, status: view.status, shot: path.basename(shot) });
  fs.writeFileSync(file, JSON.stringify(S, null, 1));
  await browser.close();
  console.log(`${view.title}\n${view.hint}\n[${view.body}] ${view.turns}\n${view.status ? "Message: " + view.status : ""}`.trim());
  console.log(`Screenshot: ${shot}`);
  if (errors.length) console.log("Page errors:", errors.join("; "));
})();
