# Silent playtest, round 2: the v3 level set (13 November 2026)

The same eight personas, briefs and models as round 1 (`../2026-11-13/`), run as fresh agents with no memory of round 1, on the redesigned v3 levels (three chapters plus the optional Night shift set). Hints for levels 5, 9 and 10 were changed after this round.

- `sessions/*.json`: every call: keys, think-aloud note, level, turns, on-screen message, timestamp.
- `interviews/*.md`: exit interviews.
- Analyse with `node ../../tools/analyze-playtest.js sessions [notes]`, which replays each key log through the rules engine. It needs the v3 `levels.js` in its original order.
