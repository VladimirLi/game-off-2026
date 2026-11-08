# Rulebender (grey box)

A Life-like cellular automaton puzzler. You never touch the cells. You toggle the 18 rule bits
(birth on 0..8 neighbours, survival on 0..8 neighbours) and step the colony until it fills the
orange target outline before the step budget runs out.

## Question this grey box tests

Is it satisfying to steer a colony by changing its laws rather than its cells?

## What fun would look like

- The player forms hunches ("more birth bits makes it spread", "drop S2 and the edges thin out")
  and those hunches mostly pay off, so changing the rule feels like steering, not rolling dice.
- Players flip bits between steps on purpose: grow with one rule, then freeze or trim with another.
- A near miss (90% overlap) makes them press R right away with a specific new plan.
- The cyan hover preview gets used as a thinking tool, not ignored and not relied on for every click.

Signs it is not fun: random bit-mashing, players ignoring the preview, wins that feel lucky,
or players saying they could not tell why a change did what it did.

## Run

    godot --path /Users/vladimir/orca/projects/scratchpad/greybox/rulebender

## Controls

Click rule bits to toggle. Space steps one generation (hold to run). Hover a bit to see the next
generation if it were flipped (cyan). R restarts the puzzle, N goes to the next puzzle.

## Puzzles

Five puzzles are generated at startup from a fixed seed: a random blob is simulated forward under
a hidden rule for 4 to 8 steps and the result becomes the target, so each puzzle is solvable.
Targets that Conway's rule (the starting rule, B3/S23) already reaches are rejected.
The hidden rule is revealed when you run out of steps.
