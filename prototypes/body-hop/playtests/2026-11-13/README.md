# Silent playtest, 13 November 2026

Eight first-time players, each a persona run as a separate agent with no access to the rules, maps, code or design docs. They saw only the game's title and how to send key presses. They played the real game in Chromium by sending keys and reading screenshots, and thought aloud with a note on each move. The report is in the Body Hop silent playtest doc.

| Tester | Profile | Model |
|---|---|---|
| Maya | Casual phone gamer, impatient, skims text | Haiku |
| Theo | 12, impulsive, mashes keys | Haiku |
| Ruth | 61, non-gamer, reads every word | Sonnet |
| Jonas | Jam judge, about 15 minutes per game | Sonnet |
| Priya | Colour-blind (screenshots passed through a deuteranopia filter) | Sonnet |
| Alex | Speedrunner, tries to break things | Sonnet |
| Kenji | Puzzle expert | Opus |
| Sam | Methodical engineer | Opus |

- `sessions/*.json`: every call each tester made: keys, think-aloud note, level, turns, win state, on-screen message, timestamp. Screenshots were not kept.
- `interviews/*.md`: each tester's exit interview, written in character.
- `analyze.js`: `node analyze.js` prints per-tester and per-level numbers; `node analyze.js notes` adds every think-aloud note.

Caveat: `analyze.js` misses a win when the winning key and N were sent in the same call, so it under-counts solved levels for some testers (Jonas solved 1 to 6; the script shows 4 to 6). The interviews and the report use the corrected counts.

## Running it again

1. Make an empty folder outside the repo, so testers can't wander into the code.
2. Build the game page into it: `node tools/build-page.js <folder>/body.html`, then wrap `body.html` in a minimal `<!doctype html><html><head><meta charset="utf-8"></head><body>…</body></html>` as `<folder>/game.html`.
3. Copy `tools/playtest.js` into the folder as `play.js`.
4. Brief each tester with a persona and the one command: `node <folder>/play.js --session <name> --keys "Right Up" --note "..."`. Each call replays the session so far in a fresh browser, applies the new keys, saves a screenshot and prints the on-screen text. To simulate colour blindness, start the session with `--filter deuteranopia` (or `protanopia`).
