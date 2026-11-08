# Game Off 2026 — theme: SHIFT

Solo entry for [GitHub Game Off 2026](https://itch.io/jam/game-off-2026) (theme **SHIFT**, due 1 Dec 2026), built in Godot 4.7.2 with GDScript, browser-first.

This repo holds the whole process, not just the game: the research that shaped it, the idea funnel, the grey-box prototypes that were tried and rejected, and the game itself.

## Status

Week 1, prototyping. Frontrunner: **Shunting Yard**, a tower defence where towers never kill: every tower shifts an enemy sideways, only pits kill, and you compose plates so each wave sorts itself. Drag the margin was played on a phone and benched: its whole state is one integer, so puzzles became a search.

## Layout

| Path | What |
|---|---|
| `research/` | Primary-sourced notes: how to place in Game Off, idea-to-shipped-game process, theme-to-idea methods, and the filtered shortlist from 187 generated ideas |
| `prototypes/` | Grey-box prototypes (rectangles only, no art, no sound). Each has a README with the question it tests and the verdict. Run one with `godot --path prototypes/<name>` |
| `game/` | The entry itself (to come) |
| `web/` | Web export preset, build scripts and the phone launcher page used by the GitHub Pages workflow |

## Prototype verdicts

| Prototype | Verdict |
|---|---|
| shunting-yard | New frontrunner after the margin playtest: tower defence where towers only shift enemies and pits do the killing. In test |
| drag-the-margin | Played on phone: readable, but the state is one integer and level 4 became a width search. Benched |
| insert-a-row | Confusing in play. Benched |
| pull-the-rug | Confusing in play. Benched |
| rulebender | Too complicated (18 rule bits). Out |
| selection-pressure | Out on prior art (several evolving-enemy tower defences exist) |
| tell | Out: theme in fiction only, random play beats the predictor |
| slide-the-row | Out on prior art (six close jam games) |

## Play on your phone

Every push builds the web version of every Godot project in the repo and publishes it to GitHub Pages. Open **https://vladimirli.github.io/game-off-2026/** on your phone: the launcher lists one card per branch (`main` first) with a button per build. Add that page to your home screen and it is a one-tap playtest.

- Each branch gets its own folder, so a work-in-progress branch is playable without merging. Deleting the branch removes its builds.
- Builds live under a path that contains the commit hash, so a fresh push is never served from cache. Allow about two minutes after a push: one for the export, one for Pages to publish.
- `game/` is built first when it exists, then every `prototypes/<name>/`.
- **Playtest logs:** every build has a small `log` button at the right edge. It opens a panel with everything the game printed (level reports, errors, device info), kept across reloads. **Report to GitHub** opens a prefilled issue labelled `playtest-log` with the last part of the log, so a tester can send it in one tap and it can be read from the repo. Copy and Share are there too. Code: `web/launcher/playtest-log.js`.
- The workflow is `.github/workflows/web.yml`; it uses `web/build-all.sh`, `web/publish.py` and the shared preset `web/export_presets.web.cfg`. To export by hand: `GODOT=godot web/build.sh prototypes/<name> build/<name>` (needs the Godot web export templates installed).
- Pages must serve the `gh-pages` branch. The workflow enables that itself; if your plan does not allow Pages on a private repository, make the repository public (Game Off requires it at submission anyway) or set it once under Settings → Pages.

## Tooling

- Godot 4.7.2 (`brew install --cask godot`)
- Prototypes verify with `godot --headless --path <dir> --quit-after 180` (expect only the engine banner)
- Web builds: see *Play on your phone* above; CI runs on every push

## AI disclosure

Research, ideation and prototype code were produced with Claude (Anthropic) under my direction; design decisions and playtesting are mine. Declared per the Game Off rules.
