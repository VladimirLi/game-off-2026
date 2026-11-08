extends Node2D
# Tell: grey-box fencing duel. The opponent reads your habits with an
# order-2 Markov table and covers the actions it expects. You see its read.

const NAMES := ["HIGH", "LOW", "FEINT", "WAIT"]
const H := 0
const L := 1
const F := 2
const W := 3
const TOUCHES_TO_WIN := 5
const COVER_MASS := 0.6      # opponent covers top guesses until this much probability
const WINDOW_START := 1.2    # seconds to commit in the first exchange
const WINDOW_MIN := 0.5
const WINDOW_STEP := 0.04
const RESULT_TIME := 0.9

enum Phase { START, WINDOW, RESULT, OVER }

var phase := Phase.START
var counts2 := {}            # "a,b" -> [c0,c1,c2,c3]
var counts1 := [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
var counts0 := [0, 0, 0, 0]
var history: Array = []      # player actions
var caught: Array = []       # bool per exchange: was the action covered?
var probs := [0.25, 0.25, 0.25, 0.25]
var covered := [false, false, false, false]
var player_score := 0
var opp_score := 0
var window_len := WINDOW_START
var timer := 0.0
var exchange := 0
var last_action := -1
var last_text := ""
var font: Font

func _ready() -> void:
	font = ThemeDB.fallback_font
	reset()

func reset() -> void:
	counts2.clear()
	for i in 4:
		counts1[i] = [0, 0, 0, 0]
	counts0 = [0, 0, 0, 0]
	history.clear()
	caught.clear()
	player_score = 0
	opp_score = 0
	window_len = WINDOW_START
	exchange = 0
	last_action = -1
	last_text = ""
	phase = Phase.START
	queue_redraw()

func predict() -> Array:
	# Order-2 context if it has data, else order-1, else overall frequency.
	var c: Array = [0, 0, 0, 0]
	var n := history.size()
	if n >= 2 and counts2.has(ctx_key(history[n - 2], history[n - 1])):
		c = counts2[ctx_key(history[n - 2], history[n - 1])]
	if sum(c) < 2 and n >= 1:
		c = counts1[history[n - 1]]
	if sum(c) < 2:
		c = counts0
	var p := []
	var total := float(sum(c)) + 4.0 * 0.5
	for i in 4:
		p.append((c[i] + 0.5) / total)
	return p

func ctx_key(a: int, b: int) -> String:
	return "%d,%d" % [a, b]

func sum(a: Array) -> int:
	var s := 0
	for v in a:
		s += v
	return s

func choose_cover() -> void:
	# Cover the most likely actions until COVER_MASS is reached, at most two.
	covered = [false, false, false, false]
	var order := [0, 1, 2, 3]
	order.sort_custom(func(a, b): return probs[a] > probs[b])
	var mass := 0.0
	for k in 2:
		covered[order[k]] = true
		mass += probs[order[k]]
		if mass >= COVER_MASS:
			break

func learn(a: int) -> void:
	var n := history.size()
	if n >= 2:
		var key := ctx_key(history[n - 2], history[n - 1])
		if not counts2.has(key):
			counts2[key] = [0, 0, 0, 0]
		counts2[key][a] += 1
	if n >= 1:
		counts1[history[n - 1]][a] += 1
	counts0[a] += 1
	history.append(a)

func start_exchange() -> void:
	probs = predict()
	choose_cover()
	timer = 0.0
	phase = Phase.WINDOW
	queue_redraw()

func resolve(a: int) -> void:
	var hit := bool(covered[a])
	caught.append(hit)
	learn(a)
	last_action = a
	exchange += 1
	if hit:
		opp_score += 1
		last_text = "Read you: %s was covered. Opponent touch." % NAMES[a]
	elif a == W:
		last_text = "You waited, it missed. No touch."
	else:
		player_score += 1
		last_text = "%s got through. Your touch." % NAMES[a]
	window_len = max(WINDOW_MIN, window_len - WINDOW_STEP)
	timer = 0.0
	phase = Phase.OVER if (player_score >= TOUCHES_TO_WIN or opp_score >= TOUCHES_TO_WIN) else Phase.RESULT
	queue_redraw()

func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventKey and event.pressed and not event.echo):
		return
	var k: int = event.keycode
	if k == KEY_R:
		reset()
		return
	match phase:
		Phase.START:
			if k == KEY_SPACE or k == KEY_ENTER:
				start_exchange()
		Phase.WINDOW:
			if k == KEY_UP or k == KEY_W:
				resolve(H)
			elif k == KEY_DOWN or k == KEY_S:
				resolve(L)
			elif k == KEY_SPACE or k == KEY_F:
				resolve(F)

func _process(delta: float) -> void:
	if phase == Phase.WINDOW:
		timer += delta
		if timer >= window_len:
			resolve(W)  # not pressing is an action too
		queue_redraw()
	elif phase == Phase.RESULT:
		timer += delta
		if timer >= RESULT_TIME:
			start_exchange()

func text(pos: Vector2, s: String, size := 16, col := Color(0.9, 0.9, 0.9)) -> void:
	draw_string(font, pos, s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, col)

func _draw() -> void:
	draw_rect(Rect2(0, 0, 960, 540), Color(0.12, 0.12, 0.14))
	draw_rect(Rect2(0, 380, 960, 6), Color(0.3, 0.3, 0.33))  # piste
	# Fencers: player left (blue), opponent right (red).
	var lean := 20.0 if phase == Phase.RESULT and last_action != W else 0.0
	draw_rect(Rect2(300 + lean, 240, 40, 140), Color(0.35, 0.55, 0.9))
	draw_rect(Rect2(620, 240, 40, 140), Color(0.9, 0.4, 0.35))
	# Scores as pips.
	for i in TOUCHES_TO_WIN:
		draw_rect(Rect2(40 + i * 26, 30, 20, 20), Color(0.35, 0.55, 0.9) if i < player_score else Color(0.25, 0.25, 0.28))
		draw_rect(Rect2(900 - i * 26, 30, 20, 20), Color(0.9, 0.4, 0.35) if i < opp_score else Color(0.25, 0.25, 0.28))
	text(Vector2(40, 72), "YOU %d" % player_score)
	text(Vector2(860, 72), "OPP %d" % opp_score)
	# Opponent's read: one box per action, brightness = probability, outline = covered.
	text(Vector2(330, 100), "OPPONENT'S READ (red outline = covered)", 14, Color(0.7, 0.7, 0.7))
	for i in 4:
		var r := Rect2(330 + i * 75, 110, 65, 50)
		var p: float = probs[i]
		draw_rect(r, Color(0.2 + p * 0.7, 0.2 + p * 0.5, 0.2 + p * 0.3))
		if phase == Phase.WINDOW and covered[i]:
			draw_rect(r.grow(3), Color(1, 0.2, 0.2), false, 4.0)
		text(r.position + Vector2(6, 20), NAMES[i], 13, Color.BLACK if p > 0.45 else Color.WHITE)
		text(r.position + Vector2(6, 42), "%d%%" % roundi(p * 100), 14, Color.BLACK if p > 0.45 else Color.WHITE)
	var conf: float = probs.max()
	text(Vector2(330, 185), "Confidence %d%%   (order-2 context: %s)" % [roundi(conf * 100), context_label()], 14)
	# Timing bar.
	if phase == Phase.WINDOW:
		var frac := 1.0 - timer / window_len
		draw_rect(Rect2(330, 200, 290, 10), Color(0.25, 0.25, 0.28))
		draw_rect(Rect2(330, 200, 290 * frac, 10), Color(0.95, 0.85, 0.3))
	# Recent pattern strip: last 12 actions, red under ones that were caught.
	text(Vector2(40, 420), "YOUR RECENT PATTERN (oldest -> newest, red = read)", 14, Color(0.7, 0.7, 0.7))
	var start := maxi(0, history.size() - 12)
	for j in range(start, history.size()):
		var x := 40 + (j - start) * 70
		draw_rect(Rect2(x, 430, 62, 30), Color(0.3, 0.3, 0.34))
		text(Vector2(x + 5, 451), NAMES[history[j]], 13)
		draw_rect(Rect2(x, 462, 62, 5), Color(0.9, 0.25, 0.25) if caught[j] else Color(0.3, 0.7, 0.4))
	text(Vector2(40, 230), last_text, 15)
	# Phase labels.
	if phase == Phase.START:
		text(Vector2(330, 320), "TELL  -  press SPACE to start", 22)
	elif phase == Phase.OVER:
		text(Vector2(330, 320), "YOU WIN" if player_score >= TOUCHES_TO_WIN else "YOU WERE READ", 26)
		text(Vector2(330, 350), "Press R to restart", 16)
	text(Vector2(40, 520), "UP/W high   DOWN/S low   SPACE/F feint   do nothing = wait   R restart", 14, Color(0.65, 0.65, 0.65))

func context_label() -> String:
	var n := history.size()
	if n < 2:
		return "none yet"
	return "%s, %s" % [NAMES[history[n - 2]], NAMES[history[n - 1]]]
