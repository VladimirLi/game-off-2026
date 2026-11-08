extends Node2D
# Pull the Rug grey box. Click a rug, press an arrow (or drag) to pull it one cell.
# Light objects ride the rug. Heavy objects stay put; the rug slides out from under them.

const W := 10
const H := 8
const CS := 52
const ORG := Vector2(220, 70)
const DIRV := [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]
const KEYS := {KEY_RIGHT: Vector2i(1, 0), KEY_LEFT: Vector2i(-1, 0), KEY_DOWN: Vector2i(0, 1), KEY_UP: Vector2i(0, -1)}
const SHAPES := [Vector2i(2, 1), Vector2i(1, 2), Vector2i(3, 1), Vector2i(1, 3), Vector2i(2, 2), Vector2i(4, 1), Vector2i(1, 4)]
const LEVELS := [[2, 3, 1], [2, 4, 2], [3, 6, 2], [3, 8, 3], [4, 10, 4], [5, 13, 5]]  # rugs, K reverse pulls, heavies
const RUG_COLS := [Color(0.62, 0.42, 0.40), Color(0.42, 0.58, 0.44), Color(0.42, 0.48, 0.66), Color(0.66, 0.60, 0.38), Color(0.58, 0.44, 0.62)]
const LIGHT_COLS := [Color(1, 0.35, 0.3), Color(0.3, 0.9, 0.35), Color(0.35, 0.6, 1), Color(1, 0.85, 0.2), Color(0.9, 0.4, 1), Color(0.2, 0.95, 0.95)]

var walls := {}
var heavies := []
var goals := []
var rugs := []
var lights := []
var start_rugs := []
var start_lights := []
var history := []
var level := 0
var par := 0
var moves := 0
var sel := -1
var started := false
var finished := false
var drag_from = null
var flash := {}  # heavy cell -> seconds left (rug slid out from under it)
var blocked_t := 0.0
var rng := RandomNumberGenerator.new()

func _ready() -> void:
	load_level(0)

func load_level(n: int) -> void:
	level = n
	rng.seed = 7919 * (n + 1)
	var p: Array = LEVELS[n]
	while not try_gen(p[0], p[1], p[2]):
		pass
	par = p[1]
	start_rugs = rugs.duplicate()
	start_lights = lights.duplicate()
	history.clear()
	moves = 0
	sel = -1
	queue_redraw()

func rug_at(rs: Array, c: Vector2i) -> int:
	for i in rs.size():
		if rs[i].has_point(c):
			return i
	return -1

func rect_free(rect: Rect2i, skip: int) -> bool:
	if rect.position.x < 0 or rect.position.y < 0 or rect.end.x > W or rect.end.y > H:
		return false
	for i in rugs.size():
		if i != skip and rugs[i].intersects(rect):
			return false
	for x in range(rect.position.x, rect.end.x):
		for y in range(rect.position.y, rect.end.y):
			if walls.has(Vector2i(x, y)):
				return false
	return true

# Forward pull: returns {} if illegal, else the new rugs, lights and heavies left behind.
func pull(rs: Array, ls: Array, r: int, d: Vector2i) -> Dictionary:
	var old: Rect2i = rs[r]
	var nr := Rect2i(old.position + d, old.size)
	if nr.position.x < 0 or nr.position.y < 0 or nr.end.x > W or nr.end.y > H:
		return {}
	for x in range(nr.position.x, nr.end.x):
		for y in range(nr.position.y, nr.end.y):
			var c := Vector2i(x, y)
			var o := rug_at(rs, c)
			if walls.has(c) or (o != -1 and o != r):
				return {}
			if not old.has_point(c) and (c in heavies or c in ls):
				return {}  # a rug cannot slide under anything
	var nl := ls.duplicate()
	for i in nl.size():
		if old.has_point(ls[i]):
			nl[i] = ls[i] + d
			if nl[i] in heavies:
				return {}  # a riding light would hit a heavy that stays
	var left := []
	for h in heavies:
		if old.has_point(h) and not nr.has_point(h):
			left.append(h)
	var nrs := rs.duplicate()
	nrs[r] = nr
	return {"rugs": nrs, "lights": nl, "left": left}

# Reverse pull: the state that a forward pull of rug r in d turns into (rs, ls), verified by simulation.
func unpull(rs: Array, ls: Array, r: int, d: Vector2i) -> Dictionary:
	var cur: Rect2i = rs[r]
	var prev := Rect2i(cur.position - d, cur.size)
	if not rect_free(prev, r):
		return {}
	var pl := ls.duplicate()
	for i in pl.size():
		if cur.has_point(ls[i]):
			pl[i] = ls[i] - d
			if pl[i] in heavies:
				return {}
	var prs := rs.duplicate()
	prs[r] = prev
	var f := pull(prs, pl, r, d)
	if f.is_empty() or f.rugs != rs or f.lights != ls:
		return {}
	return {"rugs": prs, "lights": pl}

func random_cell() -> Vector2i:
	return Vector2i(rng.randi_range(0, W - 1), rng.randi_range(0, H - 1))

func try_gen(n_rugs: int, k: int, n_heavy: int) -> bool:
	walls = {}
	heavies = []
	rugs = []
	lights = []
	for i in 4 + level:
		walls[random_cell()] = true
	var tries := 0
	while rugs.size() < n_rugs:
		tries += 1
		if tries > 300:
			return false
		var s: Vector2i = SHAPES[rng.randi() % SHAPES.size()]
		var rect := Rect2i(rng.randi_range(0, W - s.x), rng.randi_range(0, H - s.y), s.x, s.y)
		if rect_free(rect, -1):
			rugs.append(rect)
	for rect in rugs:  # one light per rug, on the rug
		lights.append(rect.position + Vector2i(rng.randi() % rect.size.x, rng.randi() % rect.size.y))
	tries = 0
	while heavies.size() < n_heavy:
		tries += 1
		if tries > 300:
			return false
		var c := random_cell()
		if heavies.size() % 2 == 0:  # every other heavy starts on a rug
			var rect: Rect2i = rugs[rng.randi() % rugs.size()]
			c = rect.position + Vector2i(rng.randi() % rect.size.x, rng.randi() % rect.size.y)
		if not walls.has(c) and not (c in lights) and not (c in heavies):
			heavies.append(c)
	goals = lights.duplicate()
	var done := 0
	var last_r := -1
	var last_d := Vector2i.ZERO
	for step in k * 40:
		if done >= k:
			break
		var r := rng.randi() % rugs.size()
		var d: Vector2i = DIRV[rng.randi() % 4]
		if r == last_r and d == -last_d:
			continue
		var p := unpull(rugs, lights, r, d)
		if p.is_empty():
			continue
		rugs = p.rugs
		lights = p.lights
		last_r = r
		last_d = d
		done += 1
	for i in lights.size():
		if lights[i] == goals[i]:
			return false  # every light starts off its goal
	return done >= k

func is_solved() -> bool:
	return lights == goals

func try_pull(d: Vector2i) -> void:
	if sel < 0 or is_solved():
		return
	var res := pull(rugs, lights, sel, d)
	if res.is_empty():
		blocked_t = 0.25
	else:
		history.append([rugs, lights])
		rugs = res.rugs
		lights = res.lights
		moves += 1
		for h in res.left:
			flash[h] = 0.5
	queue_redraw()

func _unhandled_input(e: InputEvent) -> void:
	var press: bool = (e is InputEventKey or e is InputEventMouseButton) and e.pressed
	if not started or finished:
		if press and not finished:
			started = true
			queue_redraw()
		return
	if e is InputEventKey and e.pressed and not e.echo:
		if e.keycode == KEY_Z and history.size() > 0:
			var s: Array = history.pop_back()
			rugs = s[0]
			lights = s[1]
			moves -= 1
		elif e.keycode == KEY_R:
			rugs = start_rugs.duplicate()
			lights = start_lights.duplicate()
			history.clear()
			moves = 0
		elif e.keycode == KEY_N:
			if level + 1 >= LEVELS.size():
				finished = true
			else:
				load_level(level + 1)
		elif KEYS.has(e.keycode):
			try_pull(KEYS[e.keycode])
		queue_redraw()
	elif e is InputEventMouseButton and e.button_index == MOUSE_BUTTON_LEFT:
		if e.pressed:
			var c := Vector2i(((e.position - ORG) / CS).floor())
			sel = rug_at(rugs, c)
			drag_from = e.position if sel != -1 else null
			queue_redraw()
		elif drag_from != null:
			var dv: Vector2 = e.position - drag_from
			drag_from = null
			if dv.length() > CS * 0.5:
				try_pull(Vector2i(int(sign(dv.x)), 0) if abs(dv.x) > abs(dv.y) else Vector2i(0, int(sign(dv.y))))

func _process(delta: float) -> void:
	if flash.is_empty() and blocked_t <= 0.0:
		return
	blocked_t -= delta
	for h in flash.keys():
		flash[h] -= delta
		if flash[h] <= 0.0:
			flash.erase(h)
	queue_redraw()

func cell_rect(c: Vector2i, inset: float) -> Rect2:
	return Rect2(ORG + Vector2(c) * CS + Vector2(inset, inset), Vector2(CS - 2 * inset, CS - 2 * inset))

func text(s: String, y: float, size: int, col := Color(0.9, 0.9, 0.9)) -> void:
	draw_string(ThemeDB.fallback_font, Vector2(0, y), s, HORIZONTAL_ALIGNMENT_CENTER, 960, size, col)

func _draw() -> void:
	draw_rect(Rect2(0, 0, 960, 540), Color(0.12, 0.12, 0.14))
	for x in W:
		for y in H:
			var c := Vector2i(x, y)
			draw_rect(cell_rect(c, 1), Color(0.2, 0.2, 0.22) if walls.has(c) else Color(0.72, 0.72, 0.70))
	for i in rugs.size():
		var r: Rect2 = Rect2(ORG + Vector2(rugs[i].position) * CS + Vector2(3, 3), Vector2(rugs[i].size) * CS - Vector2(6, 6))
		draw_rect(r, RUG_COLS[i % RUG_COLS.size()])
		if i == sel:
			draw_rect(r, Color(1, 0.3, 0.3) if blocked_t > 0.0 else Color.WHITE, false, 3.0)
	for i in goals.size():
		draw_rect(cell_rect(goals[i], 13), LIGHT_COLS[i % LIGHT_COLS.size()], false, 3.0)
	for h in heavies:
		draw_rect(cell_rect(h, 5), Color(0.13, 0.13, 0.15))
		if flash.has(h):
			draw_rect(cell_rect(h, 5), Color(1, 0.9, 0.3), false, 3.0)
	for i in lights.size():
		draw_rect(cell_rect(lights[i], 17), LIGHT_COLS[i % LIGHT_COLS.size()])
		draw_rect(cell_rect(lights[i], 17), Color(0.1, 0.1, 0.1), false, 1.5)
	text("Room %d/%d    Moves %d    Par %d" % [level + 1, LEVELS.size(), moves, par], 50, 18)
	text("Click a rug, then arrows or drag to pull it one cell    Z undo    R restart    N next", 520, 15, Color(0.7, 0.7, 0.7))
	if is_solved() and started:
		text("Solved in %d (par %d). Press N for the next room." % [moves, par], 506, 18, Color(1, 0.9, 0.3))
	if not started or finished:
		draw_rect(Rect2(0, 0, 960, 540), Color(0, 0, 0, 0.8))
		if finished:
			text("All rooms cleared. Thanks for testing.", 260, 28)
		else:
			text("PULL THE RUG", 230, 40)
			text("Get every small square onto its matching outline.", 280, 20)
			text("Click or press any key to start.", 320, 16, Color(0.7, 0.7, 0.7))
