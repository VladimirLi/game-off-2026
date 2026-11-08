extends Node2D
# Slide the Row: grey box. The player piece never moves; rows and columns slide under it.

const N := 7
const CELL := 58
const PLAYER := Vector2i(3, 3)
enum { EMPTY, WALL, GOAL, HAZARD }
# Per level: [scramble shifts K (par), walls, hazards]
const LEVELS := [[3, 4, 0], [4, 6, 0], [5, 8, 1], [6, 10, 1], [8, 12, 1], [10, 14, 2], [12, 16, 2], [14, 18, 2]]
const COLORS := {EMPTY: Color(0.22, 0.22, 0.24), WALL: Color(0.62, 0.62, 0.64), GOAL: Color(0.3, 0.75, 0.4), HAZARD: Color(0.8, 0.28, 0.25)}

var grid: Array = []
var history: Array = []
var level := 0
var moves := 0
var par := 0
var cursor := PLAYER
var state := "start"  # start, play, won, dead, done
var msg := ""
var origin := Vector2(480 - N * CELL / 2.0, 70)

func idx(c: Vector2i) -> int:
	return c.y * N + c.x

func shift_line(g: Array, is_row: bool, line: int, dir: int) -> Array:
	var out := g.duplicate()
	for i in N:
		var src := posmod(i - dir, N)
		if is_row:
			out[line * N + i] = g[line * N + src]
		else:
			out[i * N + line] = g[src * N + line]
	return out

func place(g: Array, kind: int, count: int, rng: RandomNumberGenerator) -> void:
	var placed := 0
	while placed < count:
		var i := rng.randi_range(0, N * N - 1)
		if g[i] == EMPTY and i != idx(PLAYER):
			g[i] = kind
			placed += 1

func load_level(n: int) -> void:
	level = n
	var p: Array = LEVELS[n]
	var rng := RandomNumberGenerator.new()
	rng.seed = 1000 + n * 7919
	var g: Array = []
	g.resize(N * N)
	g.fill(EMPTY)
	g[idx(PLAYER)] = GOAL  # solved state: goal under the player
	place(g, WALL, p[1], rng)
	place(g, HAZARD, p[2], rng)
	# Scramble with legal shifts only, so reversing them is always a legal solution.
	var applied := 0
	var tries := 0
	var last := Vector3i(-1, -1, 0)
	while (applied < p[0] or g[idx(PLAYER)] == GOAL) and tries < 10000:
		tries += 1
		var is_row := rng.randf() < 0.5
		var goal_at := Vector2i(g.find(GOAL) % N, g.find(GOAL) / N)
		# Bias toward lines that matter: the goal's lines or the player's lines.
		var anchor := goal_at if rng.randf() < 0.6 else PLAYER
		var line := anchor.y if is_row else anchor.x
		if rng.randf() < 0.25:
			line = rng.randi_range(0, N - 1)
		var dir := 1 if rng.randf() < 0.5 else -1
		if last == Vector3i(int(is_row), line, -dir):
			continue
		var ng := shift_line(g, is_row, line, dir)
		if ng[idx(PLAYER)] == WALL or ng[idx(PLAYER)] == HAZARD:
			continue
		g = ng
		last = Vector3i(int(is_row), line, dir)
		applied += 1
	grid = g
	par = applied
	history.clear()
	moves = 0
	cursor = PLAYER
	state = "play"
	msg = ""

func try_shift(d: Vector2i) -> void:
	var is_row := d.y == 0
	var line := cursor.y if is_row else cursor.x
	var dir := d.x if is_row else d.y
	var ng := shift_line(grid, is_row, line, dir)
	if ng[idx(PLAYER)] == WALL:
		msg = "Blocked: a wall cannot slide under you."
		return
	history.push_back(grid)
	grid = ng
	moves += 1
	msg = ""
	if grid[idx(PLAYER)] == GOAL:
		state = "won"
		msg = "Goal reached in %d (par %d). N or Enter for next level." % [moves, par]
	elif grid[idx(PLAYER)] == HAZARD:
		state = "dead"
		msg = "Hazard slid under you. Z to undo, R to restart."

func undo() -> void:
	if history.is_empty():
		return
	grid = history.pop_back()
	moves -= 1
	state = "play"
	msg = ""

func next_level() -> void:
	if level + 1 < LEVELS.size():
		load_level(level + 1)
	else:
		state = "done"

func key_dir(k: int) -> Vector2i:
	match k:
		KEY_LEFT, KEY_A: return Vector2i.LEFT
		KEY_RIGHT, KEY_D: return Vector2i.RIGHT
		KEY_UP, KEY_W: return Vector2i.UP
		KEY_DOWN, KEY_S: return Vector2i.DOWN
	return Vector2i.ZERO

func _unhandled_input(e: InputEvent) -> void:
	if not (e is InputEventKey and e.pressed and not e.echo):
		return
	var k: int = e.keycode
	var confirm := k == KEY_ENTER or k == KEY_SPACE
	if state == "start" or state == "done":
		if confirm:
			load_level(0)
	elif k == KEY_R:
		load_level(level)
	elif k == KEY_N or (state == "won" and confirm):
		next_level()
	elif k == KEY_Z:
		undo()
	elif state == "play":
		var d := key_dir(k)
		if d != Vector2i.ZERO:
			if e.shift_pressed:
				try_shift(d)
			else:
				cursor = Vector2i(posmod(cursor.x + d.x, N), posmod(cursor.y + d.y, N))
	queue_redraw()

func text(pos: Vector2, s: String, size := 16, col := Color(0.9, 0.9, 0.9)) -> void:
	draw_string(ThemeDB.fallback_font, pos, s, HORIZONTAL_ALIGNMENT_CENTER, 960, size, col)

func _draw() -> void:
	draw_rect(Rect2(0, 0, 960, 540), Color(0.1, 0.1, 0.11))
	if state == "start":
		text(Vector2(0, 240), "SLIDE THE ROW", 40)
		text(Vector2(0, 290), "You never move. Slide the world until the green goal is under you.")
		text(Vector2(0, 330), "Press Enter to start", 20, Color(1, 0.85, 0.3))
		return
	if state == "done":
		text(Vector2(0, 260), "All %d levels cleared." % LEVELS.size(), 36)
		text(Vector2(0, 310), "Press Enter to play again")
		return
	text(Vector2(0, 30), "Level %d/%d    Moves %d    Par %d" % [level + 1, LEVELS.size(), moves, par], 20)
	for y in N:
		for x in N:
			var r := Rect2(origin + Vector2(x, y) * CELL, Vector2(CELL - 4, CELL - 4))
			draw_rect(r, COLORS[grid[y * N + x]])
			if x == cursor.x or y == cursor.y:
				draw_rect(r, Color(1, 1, 1, 0.08))
	var pr := Rect2(origin + Vector2(PLAYER) * CELL + Vector2(14, 14), Vector2(CELL - 32, CELL - 32))
	draw_rect(pr, Color(1, 0.85, 0.3))
	draw_rect(Rect2(origin + Vector2(cursor) * CELL - Vector2(2, 2), Vector2(CELL, CELL)), Color(0.4, 0.7, 1), false, 3)
	text(Vector2(0, 70 + N * CELL + 22), msg, 16, Color(1, 0.85, 0.3))
	text(Vector2(0, 525), "Arrows/WASD: move cursor   Shift+Arrows: slide cursor row/column   Z undo   R restart   N next", 14, Color(0.7, 0.7, 0.7))
