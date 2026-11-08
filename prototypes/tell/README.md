# Tell (grey box)

One-button-ish fencing duel. The opponent builds an order-2 Markov table from your own past actions
(HIGH, LOW, FEINT, WAIT) and covers its most likely guesses: the top one, plus the second if the top one
is under 60%. Its read is shown before you commit. If you play a covered action, it scores. If you get
through with an attack, you score. Waiting uncovered scores nothing. First to 5 touches. The commit
window shrinks each exchange, from 1.2 s down to 0.5 s, so habits take over under pressure.

Run: `godot --path .` (or open in Godot 4.7). Controls: UP/W high, DOWN/S low, SPACE/F feint,
press nothing = wait, R restart.

## Question to test

Is it fun to see yourself predicted and have to break your own pattern?

## What fun would look like

- Players laugh or groan when the red outline lands on the move they were about to make.
- They start talking to themselves about their rhythm ("I always go low after a feint").
- Late exchanges, with a short window, feel like a fight against your own reflexes, not against the AI.
- They ask for a rematch to try to beat it with a deliberate "random" plan, and discover they are not random.

## What not-fun would look like

- Reading the outline and picking anything else is trivial, so the prediction display removes all tension.
  If so, try hiding the read until the last 40% of the window, or show it only after the exchange.
- It feels random: players cannot connect the read to their own history strip.
