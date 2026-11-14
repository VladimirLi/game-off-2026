# Game Off 2026 entry: Body Hop

Solo entry for GitHub Game Off 2026, theme **SHIFT**. The owner is new to game development and does this to learn and have fun.

## Focus
- The game is **Body Hop** (`prototypes/body-hop/`): plain HTML and JavaScript, no build step, runs from `index.html`.
- All other prototypes are out of scope. Don't read, change or check them unless the owner asks. The root README still shows Godot and Drag the margin as frontrunner; that is stale.
- `prototypes/body-hop/README.md` is the source of truth for rules, controls and tools. `levels.js` is the source of truth for levels; keep the README levels table in sync when levels change.
- Start Claude Code at the repo root: the hooks in `.claude/` load only from there.

## Jam facts
- Deadline: **1 Dec 2026, 13:37 PST (21:37 UTC)**, for both the GitHub repo and the itch.io submission. A push does not submit. Voting runs to 1 Jan 2027.
- Score: Overall is the average of Gameplay, Graphics, Audio, Innovation and Theme interpretation. A silent or theme-less game caps its own score.
- The repo must be public (it already is). AI use is allowed and is declared in README.md.
- The browser build is the main upload.

## Checks (run from `prototypes/body-hop/`)
- `node tools/solve.js`: every level solvable, par and declared checks. Exit 1 on failure.
- `node tools/bot.js`: replays each solver route as key presses in Chromium and reads the win from the game's internal state. A pass means keys reach the engine and win at par; it does not prove the board is drawn or that N advances. Needs `npm install` in `prototypes/body-hop/` once (Playwright 1.64.1; on the owner's Mac it matches the cached Chromium). If you did not run it, say so.
- A Stop hook runs these when Body Hop files changed since the last passing commit. A pass means the rules hold, not that a level is fun, fair or even visible.
- Bots press keys only. A test that calls game functions directly proves nothing about play.

## Playtests
- Human playtests are the only evidence of fun and difficulty. As of 13 Nov no human has played Body Hop.
- `playtests/2026-11-13*/` are AI personas (Haiku, Sonnet, Opus). They solve at exactly par far more than people do. Always label them "AI persona", never "playtest" alone.
- The owner reports in one line ("too easy", "2 and 3 confusing"). Work from that, the level and the solver; don't ask for more.
- The game logs one line per level to the browser console only, so there is no saved log of the owner's play. If the owner pastes console lines, save them under `prototypes/body-hop/playtests/human/<date>.md`.

## Milestones
- Feature freeze 24 Nov. Then juice, audio, menus, the itch page and a README GIF.
- Last two days: bugs only, and test the uploaded build in Chrome and Firefox. Submit 30 Nov.
- Not started as of 13 Nov: a human playtest, the itch.io upload, audio. Check `git log` for later progress.
- A SessionStart hook prints today's date and the days left. After the freeze, flag any new mechanic or level to the owner before starting it.

## Running the team (main session only; subagents ignore this section)
- You plan, delegate, check and report. Don't edit game code yourself; delegate it.
- `level-designer`: new or reworked levels, and "level N is too easy/hard/confusing". Ask for 2 or 3 candidates and let the owner pick unless told otherwise.
- `builder`: any change to `engine.js`, `levels.js` or `index.html`, including wiring in a chosen level.
- `verifier`: after every builder change, before you tell the owner it works. Give it the task and the diff, not the builder's reasoning.
- `researcher`: any fact that must be checked rather than recalled.
- `persona-tester`: AI first-time players, to test a level before people do. Prepare a blind folder with `.claude/scripts/persona-run.sh <new-run-name>`, then run the personas in `.claude/personas.md` in parallel, each with its model. Before any further level edit, analyse with `node prototypes/body-hop/tools/analyze-playtest.js <run>/sessions` (it scores against the current `levels.js`; the run's `build/levels.js` is what was played). Copy `sessions/*.json` and `interviews/` to `prototypes/body-hop/playtests/<date>-<run-name>/` with a README naming the personas and models.
- A change works only when the verifier passes it and the Stop hook is clean. Report which checks ran and which did not (the bot, a human playtest).
- Don't pass `model` to builder, verifier, researcher or level-designer (a hook refuses it): each file sets its model. Do pass it to `persona-tester` (from `.claude/personas.md`) and to built-in agents (haiku for lookups, sonnet for most work, opus for hard reasoning); the hook refuses those calls without it.
- Run independent subagents in parallel, one-shot. Don't reply to bare idle notices.
- Commit only when the owner says so.

## Working with the owner
- Do not save memory, change repo visibility, or publish anything unless asked.
- Commit messages: one descriptive line.
