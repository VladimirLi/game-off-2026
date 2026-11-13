#!/usr/bin/env node
// Builds one self-contained HTML page (engine + levels inlined) for sharing the grey box as a web page.
//   node tools/build-page.js <out.html>
const fs = require("fs"), path = require("path");
const dir = path.resolve(__dirname, "..");
let html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
const inline = (f) => `<script>\n${fs.readFileSync(path.join(dir, f), "utf8")}\n</script>`;
html = html.replace('<script src="engine.js"></script>', () => inline("engine.js"))
           .replace('<script src="levels.js"></script>', () => inline("levels.js"));
// The host wraps the page in its own document skeleton: keep only the title, style and body content.
const title = '<title>Body Hop</title>\n<meta name="claude:viewport-fit-sides" content="cover">';
const style = html.match(/<style>[\s\S]*?<\/style>/)[0]
  .replace(":root {", ":root { color-scheme: dark;")
  .replace("#app { max-width: 960px; margin: 0 auto; padding: 16px; }",
    "#app { max-width: 960px; margin: 0 auto; padding-block: 16px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }\n  #levels button:focus-visible { outline: 2px solid var(--accent); }");
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
fs.writeFileSync(process.argv[2], `${title}\n${style}\n${body}`);
console.log("wrote", process.argv[2]);
