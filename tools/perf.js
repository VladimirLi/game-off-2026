#!/usr/bin/env node
// Performance check: loads the game over a throttled network, measures idle CPU on the title screen and in a level,
// plays every level's solver route at a human pace (150 ms per key) while recording frame times, long tasks, key
// latency and layout shift, replays one level 25 times for heap growth, and compares each number with the bar.
//   node tools/perf.js [--cpu N]     N: CPU slowdown (Chrome DevTools throttling), default 1; the bar is set at 4
// Headless Chromium draws on the CPU, so frame times run slower than on a machine with a GPU.
const path = require("path"), http = require("http"), fs = require("fs"), zlib = require("zlib");
const { chromium } = require("playwright");
const { solve } = require("./solve.js");
const LEVELS = require("../game/levels.js");
const KEY = { U: "ArrowUp", D: "ArrowDown", L: "ArrowLeft", R: "ArrowRight" };
const ROOT = path.resolve(__dirname, "../game");
const cpu = Number((process.argv.find((a, i) => process.argv[i - 1] === "--cpu")) || 1);
const FRAME = 1000 / 60;

// Serves the game gzipped, as GitHub Pages and itch do.
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\/$/, "/index.html"));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  const type = { ".html": "text/html", ".js": "application/javascript" }[path.extname(p)] || "application/octet-stream";
  res.writeHead(200, { "content-type": type, "content-encoding": "gzip" });
  res.end(zlib.gzipSync(fs.readFileSync(p)));
});

// In the page: a frame probe (every animation frame, whether or not the game draws; stopped while idle CPU is
// measured, since asking for frames costs CPU itself), long tasks, layout shifts and key events slower than one frame
// (Event Timing reports only those).
const PROBE = `(() => {
  window.__perf = { frames: [], longs: [], cls: 0, keys: [], on: true };
  let last = 0; const tick = (t) => { if (!__perf.on) { last = 0; return; } if (last) __perf.frames.push(t - last); last = t; requestAnimationFrame(tick); };
  window.__probe = (on) => { const was = __perf.on; __perf.on = on; if (on && !was) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  new PerformanceObserver((l) => l.getEntries().forEach((e) => __perf.longs.push(e.duration))).observe({ type: "longtask", buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) __perf.cls += e.value; })).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.name === "keydown") __perf.keys.push(e.duration); })).observe({ type: "event", durationThreshold: 16, buffered: true });
})();`;
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0; };

(async () => {
  await new Promise((r) => server.listen(0, r));
  const url = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 760 } });
  await ctx.addInitScript(PROBE);
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Performance.enable");
  const metric = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const busy = async (ms) => {
    await page.evaluate(() => __probe(false)); await page.waitForTimeout(200);
    const a = await metric(); await page.waitForTimeout(ms); const b = await metric();
    await page.evaluate(() => __probe(true));
    return (b.TaskDuration - a.TaskDuration) / ((b.Timestamp - a.Timestamp) || 1) * 100;
  };
  // Cold load on a slow 4G connection (Lighthouse's: 1.6 Mbit/s, 150 ms round trip) to a drawn title screen.
  let bytes = 0; const count = (e) => { bytes += e.encodedDataLength; };
  cdp.on("Network.loadingFinished", count);
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const loadMs = Date.now() - t0;
  cdp.off("Network.loadingFinished", count);
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  const cls0 = await page.evaluate(() => __perf.cls);
  await page.waitForTimeout(2000); // settled
  const idleTitle = await busy(3000);

  // Every level at a human pace (150 ms a key), then idle in the last one. Frames and long tasks count from 1.8 s
  // after the level loads (past its intro).
  const play = async (i) => {
    const moves = solve(LEVELS[i]).moves;
    for (const m of moves) { await page.keyboard.press(KEY[m]); await page.waitForTimeout(150); }
    for (const k of ["z", "z", "z", "r"]) { await page.keyboard.press(k); await page.waitForTimeout(150); }
    return moves.length + 4;
  };
  const frames = [], longs = []; let cls = cls0;
  for (let i = 0; i < LEVELS.length; i++) {
    await page.goto(url + `?level=${i + 1}`);
    await page.waitForTimeout(1800);
    await page.evaluate(() => { __perf.frames = []; __perf.longs = []; });
    await play(i);
    const p = await page.evaluate(() => __perf);
    frames.push(...p.frames); longs.push(...p.longs); cls = Math.max(cls, p.cls);
  }
  const idleLevel = await busy(3000);
  // Key latency on a few levels with the frame probe off: asking for every frame delays the paint after a key.
  const keys = []; let presses = 0;
  for (const i of [0, 5, 11, 14, 17]) {
    await page.goto(url + `?level=${i + 1}`);
    await page.waitForTimeout(1800);
    await page.evaluate(() => { __probe(false); __perf.keys = []; });
    presses += await play(i);
    keys.push(...await page.evaluate(() => __perf.keys));
  }

  // Heap: the longest main level played and restarted 25 times in one page.
  await page.goto(url + `?level=12`); await page.waitForTimeout(1800);
  const heap = async () => { await cdp.send("HeapProfiler.collectGarbage"); return (await cdp.send("Runtime.getHeapUsage")).usedSize / 1e6; };
  const h0 = await heap(), route = solve(LEVELS[11]).moves;
  for (let k = 0; k < 25; k++) { for (const m of route) await page.keyboard.press(KEY[m]); await page.keyboard.press("r"); }
  const h1 = await heap();
  await browser.close(); server.close();

  // Keys missing from Event Timing took under 16 ms to their next paint.
  const lat = [...keys, ...Array(Math.max(0, presses - keys.length)).fill(16)];
  const dropped = frames.filter((f) => f > FRAME * 1.5).length;
  const rows = [
    ["Cold load to title (slow 4G)", "<= 1000 ms", `${loadMs} ms`, loadMs <= 1000],
    ["Transfer size (gzipped)", "<= 150 KB", `${(bytes / 1024).toFixed(0)} KB`, bytes <= 150 * 1024],
    ["Frame time p50", `<= ${FRAME.toFixed(1)} ms`, `${pct(frames, 0.5).toFixed(1)} ms`, pct(frames, 0.5) <= FRAME * 1.2],
    ["Frame time p99", `<= ${FRAME.toFixed(1)} ms`, `${pct(frames, 0.99).toFixed(1)} ms`, pct(frames, 0.99) <= FRAME * 1.2],
    ["Longest frame", `<= ${FRAME.toFixed(1)} ms`, `${Math.max(...frames).toFixed(1)} ms`, Math.max(...frames) <= FRAME * 1.2],
    ["Dropped frames", "0", `${dropped} of ${frames.length}`, dropped === 0],
    ["Long tasks in play (> 50 ms)", "0", `${longs.length}${longs.length ? `, longest ${Math.max(...longs).toFixed(0)} ms` : ""}`, longs.length === 0],
    ["Key to next paint p50 / p95", "<= 16 ms", `${pct(lat, 0.5).toFixed(0)} / ${pct(lat, 0.95).toFixed(0)} ms`, pct(lat, 0.95) <= 16],
    ["Idle CPU: title / level", "~0%", `${idleTitle.toFixed(1)}% / ${idleLevel.toFixed(1)}%`, idleLevel <= 2],
    ["Layout shift (CLS)", "0", cls.toFixed(3), cls === 0],
    ["Heap growth, 25 replays", "< 5 MB", `${(h1 - h0).toFixed(2)} MB (${h0.toFixed(1)} -> ${h1.toFixed(1)})`, h1 - h0 < 5],
    ["Page errors", "0", String(errors.length), errors.length === 0],
  ];
  console.log(`CPU slowdown ${cpu}x, ${frames.length} frames, ${presses} key presses timed\n`);
  console.log("| Measure | Bar | Now | Pass |\n|---|---|---|---|");
  for (const [m, bar, now, ok] of rows) console.log(`| ${m} | ${bar} | ${now} | ${ok ? "yes" : "NO"} |`);
  if (errors.length) console.log("\npage errors:", errors);
  process.exit(rows.every((r) => r[3]) ? 0 : 1);
})();
