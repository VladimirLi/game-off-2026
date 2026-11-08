extends Node2D
# Rulebender grey box: steer a Life-like automaton by editing its rule, never its cells.

const W := 24
const H := 16
const CS := 22
const GRID_POS := Vector2(30, 80)
const RULE_POS := Vector2(600, 120)
const BIT := Vector2(34, 34)
const BIT_GAP := 4.0
const STEP_DELAY := 0.15
const HOLD_DELAY := 0.35
const PUZZLE_COUNT := 5
const START_RULE := "B3/S23"
const TARGET_RULES := ["B36/S23", "B3678/S34678", "B35678/S5678", "B34/S34", "B368/S245",
	"B3/S12345", "B37/S23", "B2/S0", "B36/S125", "B3/S1234", "B345/S5"]

var puzzles: Array = []
var idx := 0
var cells := PackedByteArray()
var mask := 0
var steps := 0
var best := 0.0
var done := false
var started := false
var hold_timer := 0.0
var hovered := -1
var preview := PackedByteArray()
var font: Font

func _ready() -> void:
	font = ThemeDB.fallback_font
	var rng := RandomNumberGenerator.new()
	rng.seed = 20261107
	make_puzzles(rng)
	load_puzzle(0)

func parse_rule(s: String) -> int:
	var parts := s.split("/")
	var m := 0
	for ch in parts[0].substr(1):
		m |= 1 << int(ch)
	for ch in parts[1].substr(1):
		m |= 1 << (9 + int(ch))
	return m

func rule_str(m: int) -> String:
	var b := "B"
	var s := "S"
	for i in 9:
		if m & (1 << i): b += str(i)
		if m & (1 << (9 + i)): s += str(i)
	return b + "/" + s

func step(c: PackedByteArray, m: int) -> PackedByteArray:
	var out := PackedByteArray()
	out.resize(W * H)
	for y in H:
		for x in W:
			var n := 0
			for dy in range(-1, 2):
				for dx in range(-1, 2):
					if dx == 0 and dy == 0: continue
					var nx := x + dx
					var ny := y + dy
					if nx >= 0 and nx < W and ny >= 0 and ny < H:
						n += c[ny * W + nx]
			var alive := c[y * W + x] == 1
			var bit := (9 + n) if alive else n
			out[y * W + x] = 1 if m & (1 << bit) else 0
	return out

func count(c: PackedByteArray) -> int:
	var n := 0
	for v in c: n += v
	return n

func make_puzzles(rng: RandomNumberGenerator) -> void:
	# Simulate a hidden rule forward from a random seed; the result is the target (always solvable).
	var start_mask := parse_rule(START_RULE)
	var tries := 0
	while puzzles.size() < PUZZLE_COUNT and tries < 2000:
		tries += 1
		var start := PackedByteArray()
		start.resize(W * H)
		for y in range(5, 11):
			for x in range(8, 16):
				start[y * W + x] = 1 if rng.randf() < 0.45 else 0
		var m := parse_rule(TARGET_RULES[rng.randi() % TARGET_RULES.size()])
		var n_steps := rng.randi_range(4, 8)
		var c := start
		var naive := start
		for i in n_steps:
			c = step(c, m)
			naive = step(naive, start_mask)
		var live := count(c)
		if live < 10 or live > W * H / 2 or c == start or c == naive:
			continue
		puzzles.append({"start": start, "target": c, "budget": n_steps, "rule": m})

func load_puzzle(i: int) -> void:
	idx = i % puzzles.size()
	cells = puzzles[idx].start.duplicate()
	mask = parse_rule(START_RULE)
	steps = 0
	done = false
	best = overlap()
	queue_redraw()

func overlap() -> float:
	var target: PackedByteArray = puzzles[idx].target
	var inter := 0
	var uni := 0
	for k in W * H:
		if cells[k] == 1 and target[k] == 1: inter += 1
		if cells[k] == 1 or target[k] == 1: uni += 1
	return 100.0 * inter / max(uni, 1)

func do_step() -> void:
	if done: return
	started = true
	cells = step(cells, mask)
	steps += 1
	var o := overlap()
	best = max(best, o)
	if o >= 100.0 or steps >= puzzles[idx].budget:
		done = true
	queue_redraw()

func bit_rect(b: int) -> Rect2:
	var row := b / 9
	var col := b % 9
	return Rect2(RULE_POS + Vector2(col * (BIT.x + BIT_GAP), row * (BIT.y + 40)), BIT)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		for b in 18:
			if bit_rect(b).has_point(event.position):
				mask ^= 1 << b
				started = true
				queue_redraw()
	elif event is InputEventKey and event.pressed and not event.echo:
		match event.keycode:
			KEY_SPACE:
				do_step()
				hold_timer = HOLD_DELAY
			KEY_R:
				load_puzzle(idx)
			KEY_N:
				load_puzzle(idx + 1)

func _process(delta: float) -> void:
	if Input.is_key_pressed(KEY_SPACE):
		hold_timer -= delta
		if hold_timer <= 0.0:
			do_step()
			hold_timer = STEP_DELAY
	var mp := get_local_mouse_position()
	var h := -1
	for b in 18:
		if bit_rect(b).has_point(mp): h = b
	if h != hovered:
		hovered = h
		# Ghost preview: next generation if the hovered bit were flipped.
		preview = step(cells, mask ^ (1 << h)) if h >= 0 and not done else PackedByteArray()
		queue_redraw()

func text(pos: Vector2, s: String, size := 16, col := Color(0.9, 0.9, 0.9)) -> void:
	draw_string(font, pos, s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, col)

func _draw() -> void:
	draw_rect(Rect2(0, 0, 960, 540), Color(0.12, 0.12, 0.13))
	draw_rect(Rect2(GRID_POS, Vector2(W, H) * CS), Color(0.2, 0.2, 0.22))
	var target: PackedByteArray = puzzles[idx].target
	for y in H:
		for x in W:
			var k := y * W + x
			var r := Rect2(GRID_POS + Vector2(x, y) * CS, Vector2(CS, CS))
			if cells[k] == 1:
				draw_rect(r.grow(-1), Color(0.85, 0.85, 0.85))
			if target[k] == 1:
				draw_rect(r.grow(-2), Color(1.0, 0.55, 0.1), false, 2.0)
			if preview.size() > 0 and preview[k] == 1:
				draw_rect(r.grow(-7), Color(0.2, 0.8, 1.0, 0.8))
	for b in 18:
		var r := bit_rect(b)
		var on := (mask & (1 << b)) != 0
		draw_rect(r, Color(0.3, 0.75, 0.4) if on else Color(0.28, 0.28, 0.3))
		if b == hovered: draw_rect(r, Color.WHITE, false, 2.0)
		text(r.position + Vector2(12, 23), str(b % 9), 16, Color.BLACK if on else Color(0.7, 0.7, 0.7))
	text(RULE_POS + Vector2(0, -8), "BIRTH on n neighbours")
	text(RULE_POS + Vector2(0, BIT.y + 32), "SURVIVE on n neighbours")
	text(RULE_POS + Vector2(0, 200), "Rule: " + rule_str(mask), 20)
	var o := overlap()
	text(RULE_POS + Vector2(0, 240), "Step %d / %d" % [steps, puzzles[idx].budget], 20)
	text(RULE_POS + Vector2(0, 270), "Overlap %.0f%%   best %.0f%%" % [o, best], 20)
	text(Vector2(30, 40), "RULEBENDER   puzzle %d / %d" % [idx + 1, puzzles.size()], 24)
	if not started:
		text(Vector2(30, 450), "Change the law, not the cells: fill the orange outline before the steps run out.", 18, Color(1, 0.8, 0.4))
	if done:
		var msg := "SOLVED in %d steps!" % steps if o >= 100.0 else "Out of steps. Overlap %.0f%%. A rule that works: %s" % [o, rule_str(puzzles[idx].rule)]
		text(Vector2(30, 450), msg + "   R retry, N next", 18, Color(0.5, 1, 0.6) if o >= 100.0 else Color(1, 0.5, 0.5))
	text(Vector2(30, 520), "Click rule bits to toggle | Space step (hold to run) | hover a bit: cyan = next gen if flipped | R restart | N next puzzle", 14, Color(0.6, 0.6, 0.6))
