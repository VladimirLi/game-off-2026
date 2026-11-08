# Drag the margin (grey box)

Ranked #1 in `research/shift-ideas-shortlist.md`. The level is a paragraph in a monospace grid; you drag the right margin and the paragraph re-wraps greedily. Words are platforms.

## Run

```
godot --path /Users/vladimir/orca/projects/scratchpad/greybox/drag-the-margin
```

## Controls

- **A / D:** walk. **Space or W:** jump.
- **Drag the purple margin handle** with the mouse. While you drag, the new layout shows as hollow outlines: words in grey, the gold word in gold, spike walls in red. The word you would ride, and where you would end up, are highlighted. Release to apply, which costs one change however far you dragged, or press Esc to cancel.
- **Left / Right arrows:** a quick tap applies one column at once, for one change. Hold an arrow to preview instead: one column, then one more every 0.25 s while held. Releasing applies the whole hold as one change, and Esc cancels. Two quick taps within 1 s show a one-time tip above the player, "hold to preview, one change per release".
- **Z:** undo the last change and get its one change back, carrying you back with your word. This works only while you have not moved, jumped or fallen since that change finished, so it fixes a slip rather than letting you search for free. Several changes in a row can be undone one by one.
- **Level 1 hint:** "Drag the margin (or Left/Right)" floats above the player until the first change.
- **Tab (level 9 only):** cycle alignment left, centre, right, justify. Each press costs one change. A "Tab: alignment" hint follows the player on level 9 until the first Tab.
- **R:** restart the level, which also resets the change count. **N:** next paragraph, only after a win. **Shift+N:** skip an unfinished level (playtest aid); it prints a "SKIPPED" log line.
- Falling off the bottom, touching red punctuation, or touching the caret respawns you on the first word. The margin, the alignment, the letters collected and the changes used stay as they are.

### On a phone

The web build shows on-screen buttons when a touchscreen is present (or on the first touch): **◀ ▶** walk (bottom left), **JUMP** (bottom right), **◀ margin / margin ▶** (above JUMP; hold to preview, release to apply, like the arrow keys), and a top-right row with **undo**, **align** (level 9), **cancel** while previewing, **R** and **next** after a win. You can also drag the purple margin handle with a finger; the touch grab zone is wider than the mouse one. The buttons send the same key events as the keyboard, so the key log, the reports and the bot are unchanged. Code: `touch_controls.gd`. Stretch and the touch layer are web-only: the desktop window and the headless bot keep the fixed 960x540 coordinates.

## Rules

- Each letter is a cell; spaces are one-cell gaps. The player is wider than one space, so you cannot fall through a gap.
- Line pitch (3 cells) is higher than a jump, so you cannot climb to the line above.
- **Two solid walls:** one at the left edge of the text and one at the margin, which moves with the handle. So you go down only off a ragged line end, or through a gap of two or more cells, that has at least two cells of room. A flush end against a wall is no way down.
- In the air you steer freely, so after dropping off a line end you can land on any lower line your body reaches. That includes a slightly shorter line back under the one you left.
- Capitals are one solid cell taller: hop over them. Punctuation is a red spike.
- The goal is the last word, drawn in gold. Stand on it to win.
- **Reflow rule: you ride your word.** The word you ride is the one under your centre, or the nearer one if your centre is over a gap. If you are standing on a word when the margin changes, you move with it to its new position over 0.3 s. Moved words flash blue. If you are airborne, you keep falling and the words move under you.
- So widening the margin is the only way up (your word moves to an earlier line), and narrowing reshapes the ragged edge you fall from.
- **Spike walls:** a word made only of four or more punctuation marks, such as `!!!!`, is too long to jump. It wraps like any other word, so at some widths it sits between you and the goal and at others it moves to another line.

## Levels 8 to 10: one new element each

- **Level 8, the caret.** A thin white cursor reads the paragraph at a steady pace, letter by letter and space by space, then jumps to the start of the next line. It follows the current layout, so a reflow changes its road, and it moves with the words during a reflow. Touching it kills you, even mid-ride. It reads the whole paragraph in 11 s, slowed from 7 s after playtesting, so it passes any spot once every 11 s. A dim trail covers the cells it will reach in the next second, as a warning. A player standing still on the spawn word is caught after about 11 s, and anywhere else within one loop. It is 20 px tall above the floor, so a timed jump clears it. After a death it restarts just past the first word.
- **Level 9, alignment.** Tab cycles left, centre, right and justify. Centre and right shift each line's words in whole cells, giving lines a left edge you can drop off when it starts two or more cells from the wall. An engine check in right alignment walked left off a line start and landed on the line below. Justify spreads each line's slack over its gaps, except on the last line. A gap of two or more cells is wider than the player, so you can drop through it. The riding rule is unchanged.
- **Level 10, spell the word.** Five letter cells in different words must be touched in order: s, h, i, f, t, spelling SHIFT. The next one has a white outline, collected ones turn green, and the top line shows progress. The gold word stays dim and does not count until the word is spelled. The order runs down and up the paragraph, so you must climb by riding.

## Changes, par and budget

One commit is one change, however many columns it moves: a drag released, a quick tap, or a whole hold released. A Tab is one change, and an undo refunds one. The developer proposed this after a playtest log showed budgets burned one column at a time. The budget leans in the player's favour:

| Levels | Budget | Why |
|---|---|---|
| 1 to 3 | unlimited | they teach the verb; the top line counts changes against par |
| 4 to 10 | par + 2 | |

Par is always shown as the target. A change that would go over budget is refused with a note, not failed, so Z or R still works. The top line also shows a timer and deaths. Finishing a level prints a log line to stdout:

```
Level 1 complete | changes 1/unlimited (par 1) | time 6.7 s | deaths 0 | widths 39 > 41 | held A 0.0 s, D 4.7 s | keys Right x1, D x1
```

Undos show in the widths as "undo>width". The log lists every key press since the level loaded, in order, with repeats of the same key merged. Held arrow keys count each auto-repeat, and a mouse drag shows as "Drag" once per release. "held" is the total time A and D were down. The same line is printed with "restarted" on R and "SKIPPED" on Shift+N, so a playtest log shows how each level was left.

## Levels, par and budget

Par is the minimum number of changes, computed by `solve.py`. It runs a 0-1 breadth-first search over states made of margin width, alignment, the word you stand on and letters collected. Walking, falling and dying cost 0. Riding a word to any other width costs 1, and so does a Tab.

Falls are modelled as the set of reachable centre positions, carried line by line. You walk or jump off any free edge between the two walls, then steer freely in the air at 115 px/s. The game allows 140, so the model leaves some slack. At each lower line, positions over a word land there and the rest fall on. A landing counts only with 4 px of slack either side, and never on a spike. A pass also keeps clear of the spikes and capitals on the line passed, since the body is level with that line for a moment.

Gaps of two to four cells count as hoppable, except when a spike ends the word before or a capital starts the word after. Clearing both in one hop is a pixel-precise jump. A death respawns on the first word with width, alignment and letters kept, so the solver includes it as a free move, but only where a death is possible: a spike to walk into, or a drop that misses every line. Level 10's par route uses it twice.

Par is stored in `main.gd` and the check confirms it. A level fails the check if it can be finished with zero changes. Level 1 must have par 1 or 2, and every other level par 2 or more. The spike walls raise par on levels 4, 6 and 7 but not on level 5 (see below); this is reported, not enforced by the check.

Pars under one change per commit. Levels 5, 6, 8 and 9 fell to par 1 with their old texts, so each gained spike walls. Level 9 was also re-tuned.

| Level | Start width | Par (old, one per column) | Par now | Budget | Par without spike walls |
|---|---|---|---|---|---|
| 1 tutorial | 39 | 2 | 1 | unlimited | no wall |
| 2 | 45 (was 44) | 3 | 2 | unlimited | no wall |
| 3 | 48 | 3 | 2 | unlimited | no wall |
| 4 | 42 | 4 | 2 | 4 | 1 |
| 5 (+2 walls) | 30 | 6 | 2 | 4 | 2 |
| 6 (+1 wall) | 26 | 6 | 2 | 4 | 1 |
| 7 (two walls) | 46 | 6 | 2 | 4 | 1 |
| 8 caret (+1 wall) | 48 | 5 | 2 | 4 | the solver ignores the caret, a timing hazard |
| 9 align (+2 walls) | 30 (was 25) | 5 | 4 | 6 | needs a Tab and a margin change |
| 10 spell | 34 | 8 | 2 | 4 | no wall |

Level 5's two extra walls do not raise par above the no-wall par; they were the only placements that gave par 2.

**Level 1** is built to be solved in about 20 seconds by someone who has read nothing. At width 39 its first line is exactly full, so there is no way down. One column wider lifts the gold word "up" from the fourth line to the third, so it visibly comes closer. Two columns wider leaves two cells of room at the end of line 0. Walking right then drops you onto the gold word. With real input, a short hold of Right then D wins in 6.7 s with one change. Two taps then D wins in 6.7 s with two.

On level 9, "needs" means "cannot be finished within the budget without it". At width 30 it cannot be finished at all without a Tab, or with Tabs alone. The old rule of two or more margin changes no longer fits, because any width is now one change, and no text variant met it. Its par route is one margin change, three Tabs to reach justify, then a chain of drops through the stretched gaps.

Check every level after editing (it reads the levels from `main.gd`, exits non-zero on a mismatch):

```
python3 solve.py
python3 solve.py "any paragraph"   # par for every start width
```

## Engine verification

`tools/bot.gd` is test tooling, not game code. It plays only by sending key events (A, D, Space, Left, Right, Tab) and never moves the player or calls game functions. It jumps the caret when the caret is predicted to hit within a few frames, and waits to ride until the caret is far away.

```
python3 solve.py plan                                    # optimal action plan per level
godot --headless --fixed-fps 60 --path . -s res://tools/bot.gd -- plan 4 "<plan from above>"
godot --headless --fixed-fps 60 --path . -s res://tools/bot.gd -- adv 4 hug <seed>   # no changes: hug|random|ends
```

- Replaying each level's solver plan with real input completes all 10 levels with exactly par changes. The only deaths are level 10's two planned respawns. Drops follow the solver's waypoints, steering in the air.
- The adversarial zero-change sweep never presses the arrows or Tab. It runs three strategies:
  - **hug:** the left-edge A/D wiggle seen in playtest logs.
  - **random:** random A, D and Space.
  - **ends:** random walk-offs and jump-offs at every free edge, with random steering in the air.
- It ran 720 runs of 120 s game time, 24 per strategy per level. On the current build that is about 5,400 attempts, counting runs, deaths and drops to a lower line. None reached the goal. On every level the deepest line the bot reached equals the deepest line the solver says is reachable without changes, and every goal lies below it.
- A game layout and solver layout comparison over all four alignments matched cell for cell.

## Exploits checked

- **Left-edge descent, found in playtest logs.** Every line started at the same x with nothing beyond it. So you could walk off a line's start, tap D in the air, and land on the line below. That let you descend the whole paragraph with zero changes, and levels 1, 2, 3, 5 and 8 were finished that way. It is closed by the solid left wall.
- **Steering back under the line you left.** This is the mirror case. After walking off a right end you can steer back and land on a slightly shorter line below. That is still "down via a ragged end", so it stays, and the solver now models mid-air steering. In right and justify alignment every full line ends flush at the margin, which made the right side a free staircase. The margin is now solid as well, so a flush end is no way down.
- **New wall surfaces.** No wall-jump exists, because jumping needs a floor. A probe of 6,672 trials pressed into either wall, wiggled and spammed jump from the first and last word of every line, across all levels and every third width. No surviving player ended above its line. The capital-climb (537 trials) and mid-air-lift (6,685 trials) probes were re-run with both walls, and neither found anything. The player can wedge between a word end and the margin wall with no word counted under it. That gives nothing: it cannot ride from there, and widening the margin just drops it, a normal drop.
- **N skipped any level.** This is the most likely way past a level without solving it. N now works only after a win. Shift+N still skips but prints a SKIPPED log line.
- **Death returns you to the top line for free.** You keep your width, so this is a real move. The solver includes it rather than banning it. It changes no par on levels 1 to 9, and level 10's par route uses it.
- **Climbing on capitals.** A capital's top is 32 px below the line above, and the jump peaks at about 28.6 px. A physics probe of 351 jumps from capital tops, straight up and sideways, never reached a higher line.
- **Mid-air reflow lift.** Jumping and then changing the margin so a word rises past you does not carry you up. A probe of 5,005 jumps with the margin changed at various points in the jump never ended a line higher without dying.
- **Standing on an edge or over a gap.** You ride the word under your centre (fixed earlier). Walking past the margin handle just drops you, as the handle is not a floor.
- **Precision hops.** Clearing a word-final spike, a two-cell gap and a capital in one jump works only in a window of about 6 px. Players may still try it, but the solver no longer counts on it, so no par depends on it.

## Test question

Do testers change the margin unprompted within 30 seconds, and does a word jumping lines cause a smile?

Element question (levels 8 to 10): which element makes testers plan rather than poke? Watch whether the caret makes them rush, whether they read alignment as a tool or as noise, and whether spelling makes them climb on purpose.

Hard-mode question (levels 4 to 10): with a preview, undo, one change per commit and par + 2, do testers plan with the preview before they commit, or do they still guess? Compare the logged width sequences and undos against par.

Watch for: time to first margin change, whether they discover riding up on purpose, and whether reflow reads as "I moved the world" or "I got teleported".

## What fun would look like

The tester stops walking, nudges the margin one column at a time while watching their own word, and grins when it hops up a line with them on it. Then they start planning: "if I widen two, this line gets long enough to catch me." Fun is the moment the paragraph stops being text and becomes a machine they are tuning. If they only ever walk and fall, or wince at every reflow as if it were a bug, the idea fails.
