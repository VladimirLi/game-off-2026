#!/usr/bin/env node
// Builds one self-contained HTML page (engine, levels, audio and art inlined) for sharing the game as a web page.
//   node tools/build-page.js <out.html>
const fs = require("fs"), path = require("path");
const dir = path.resolve(__dirname, "..");
let html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
const inline = (f) => `<script>\n${fs.readFileSync(path.join(dir, f), "utf8")}\n</script>`;
html = html.replace('<script src="engine.js"></script>', () => inline("engine.js"))
           .replace('<script src="levels.js"></script>', () => inline("levels.js"))
           .replace('<script src="audio.js"></script>', () => inline("audio.js"))
           .replace('<script src="pixel-art.js"></script>', () => inline("pixel-art.js"))
           .replace('<script src="screens.js"></script>', () => inline("screens.js"))
           .replace('<script src="hud.js"></script>', () => inline("hud.js"));
// The host wraps the page in its own document skeleton: keep only the title, style and body content.
const title = '<title>Body Hop</title>\n<meta name="claude:viewport-fit-sides" content="cover">';
const style = html.match(/<style>[\s\S]*?<\/style>/)[0].replace("html, body {", "html, body { color-scheme: dark;");
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
fs.writeFileSync(process.argv[2], `${title}\n${style}\n${body}`);
console.log("wrote", process.argv[2]);
