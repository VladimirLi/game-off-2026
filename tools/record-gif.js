#!/usr/bin/env node
// Records the README GIF: level 2 solved along the solver's route with real key presses in Chromium
// (as tools/bot.js does), captured with the DevTools screencast (a PNG per painted frame) and joined
// with ffmpeg (must be on PATH).
//   node tools/record-gif.js [out.gif]     (default media/body-hop.gif)
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const { solve } = require("./solve.js");
const LEVELS = require("../game/levels.js");
const KEY = { U: "ArrowUp", D: "ArrowDown", L: "ArrowLeft", R: "ArrowRight" };
const LEVEL = 2, STEP_MS = 450, INTRO_MS = 1700, OUTRO_MS = 1500, WIDTH = 800, HEIGHT = 520, FPS = 15;

(async () => {
  const out = path.resolve(process.argv[2] || path.join(__dirname, "../media/body-hop.gif"));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bodyhop-gif-"));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.goto("file://" + path.resolve(__dirname, "../game/index.html") + `?level=${LEVEL}`);

  // Every painted frame arrives as a PNG stamped with its time; the key presses run alongside.
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    const file = path.join(tmp, `f${String(frames.length).padStart(4, "0")}.png`);
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    frames.push({ file, t: metadata.timestamp * 1000 });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
  await page.waitForTimeout(INTRO_MS);
  for (const m of solve(LEVELS[LEVEL - 1]).moves) {
    await page.keyboard.press(KEY[m]);
    await page.waitForTimeout(STEP_MS);
  }
  await page.waitForTimeout(OUTRO_MS);
  await cdp.send("Page.stopScreencast");
  const won = await page.evaluate(() => window.__bodyhop.won);
  await browser.close();
  if (!won) { console.error("the route did not win; no GIF written"); process.exit(1); }

  // Each frame lasts until the next one was taken; ffmpeg resamples to a steady FPS and builds one palette.
  const list = frames.map((f, i) => `file '${f.file}'\nduration ${(((frames[i + 1] || f).t - f.t) / 1000 || 1 / FPS).toFixed(3)}`);
  fs.writeFileSync(path.join(tmp, "list.txt"), list.join("\n") + `\nfile '${frames[frames.length - 1].file}'\n`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(tmp, "list.txt"),
    "-vf", `fps=${FPS},split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=none`,
    "-loop", "0", out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  const secs = (frames[frames.length - 1].t - frames[0].t) / 1000;
  console.log(`${path.relative(process.cwd(), out)}: ${frames.length} frames over ${secs.toFixed(1)} s, ` +
    `${(fs.statSync(out).size / 1e6).toFixed(2)} MB`);
})();
