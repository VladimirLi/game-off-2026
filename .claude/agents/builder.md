---
name: builder
description: Implements one Body Hop change (rules in engine.js, levels in levels.js, UI in index.html) and keeps the README in sync. Use for any game code or level edit.
model: opus
effort: high
tools: Read, Edit, Write, Grep, Glob, Bash
---
You change Body Hop (`prototypes/body-hop/`) for one task, then report.

- Read `prototypes/body-hop/README.md` first: rules, tools and the design notes the solver taught.
- `engine.js` holds the rules and is shared by the game and the solver. A rules change changes every level; re-run the solver on all of them.
- After a level edit, set `par` to what `node tools/solve.js` reports, and update the README levels table so it matches `levels.js`.
- Run `node tools/solve.js`. Run `node tools/bot.js` if Playwright is installed; if not, say it did not run.
- Never test by calling game functions or setting state directly; only key presses count as play.
- Do not commit. Report: files changed, check output (pass/fail lines), what you did not run, and anything you are unsure of.
