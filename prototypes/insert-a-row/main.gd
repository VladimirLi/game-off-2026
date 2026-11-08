extends Node2D
# Insert a row: grey box. Tools: insert an empty row (bottom row falls off), delete a column
# (everything right of it shifts left). Each tool use costs one move, then the walker takes one step.
# Walker rule: fall one cell if the cell below is not a wall and is on the sheet; else step right
# if that cell is not a wall and is on the sheet; else wait.

const W := 8
const H := 6
const CW := 80.0
const CH := 60.0
const OX := 200.0
const OY := 96.0
const HDR := 36.0
const SLIDE := 0.15
const EMPTY := 0
const WALL := 1
const GOAL := 2
const WALKER := 3
const SEED := 20261107
const TARGETS := [2, 3, 3, 4, 4, 5]  # wanted BFS solution length per level
const COLORS := {WALL: Color(0.32, 0.33, 0.36), GOAL: Color(0.30, 0.72, 0.40), WALKER: Color(0.95, 0.55, 0.15)}
const PADS := {WALL: 3.0, GOAL: 10.0, WALKER: 18.0}

var levels := []   # {"t": PackedByteArray of types, "len": shortest solution}
var level := 0
var ids := []      # grid of entity ids, 0 = empty
var kinds := {}    # id -> type
var nodes := {}    # id -> ColorRect
var moves_left := 0
var state := "play"
var history := []
var busy := false
var hover_gap := -1
var hover_col := -1
var info: Label
var msg: Label
var highlight: ColorRect

func _ready() -> void:
	_build_levels()
	_build_sheet()
	if "--report" in OS.get_cmdline_user_args():
		for i in levels.size():
			print("level %d: BFS solution length %d, budget %d" % [i + 1, levels[i]["len"], levels[i]["len"] + 1])
	_load(0)

# ---------- pure rules (shared by BFS and play) ----------

func _shift(g, m: int):
	var n = g.duplicate()
	if m < H:  # insert empty row above row m; bottom row falls off
		for y in range(H - 1, m, -1):
			for x in W:
				n[y * W + x] = g[(y - 1) * W + x]
		for x in W:
			n[m * W + x] = 0
	else:  # delete column m - H; empty column appears at the right
		for y in H:
			for x in range(m - H, W - 1):
				n[y * W + x] = g[y * W + x + 1]
			n[y * W + W - 1] = 0
	return n

func _doomed(m: int) -> Array:
	var out := []
	if m < H:
		for x in W:
			out.append((H - 1) * W + x)
	else:
		for y in H:
			out.append(y * W + m - H)
	return out

func _kills(t: PackedByteArray, m: int) -> bool:
	for i in _doomed(m):
		if t[i] >= GOAL:
			return true
	return false

func _step(t: PackedByteArray) -> Vector2i:  # (from, to); to = -1 means wait
	var i := t.find(WALKER)
	if i + W < W * H and t[i + W] != WALL:
		return Vector2i(i, i + W)
	if i % W + 1 < W and t[i + 1] != WALL:
		return Vector2i(i, i + 1)
	return Vector2i(i, -1)

func _bfs(start: PackedByteArray, maxd: int) -> int:
	var frontier := [start]
	var seen := {start.hex_encode(): true}
	for d in range(1, maxd + 1):
		var next := []
		for t in frontier:
			for m in H + W:
				if _kills(t, m):
					continue
				var n: PackedByteArray = _shift(t, m)
				var s := _step(n)
				if s.y >= 0:
					if n[s.y] == GOAL:
						return d
					n[s.y] = WALKER
					n[s.x] = EMPTY
				var k := n.hex_encode()
				if not seen.has(k):
					seen[k] = true
					next.append(n)
		frontier = next
	return -1

func _waits_to_win(t: PackedByteArray, budget: int) -> bool:  # does "delete last column" alone win?
	for k in budget:
		if _kills(t, H + W - 1):
			return false
		t = _shift(t, H + W - 1)
		var s := _step(t)
		if s.y >= 0:
			if t[s.y] == GOAL:
				return true
			t[s.y] = WALKER
			t[s.x] = EMPTY
	return false

func _build_levels() -> void:
	var rng := RandomNumberGenerator.new()
	var attempt := 0
	for target in TARGETS:
		while true:
			attempt += 1
			rng.seed = SEED + attempt
			var t := PackedByteArray()
			t.resize(W * H)
			t[rng.randi_range(0, H - 1) * W + rng.randi_range(0, 2)] = WALKER
			t[rng.randi_range(1, H - 1) * W + rng.randi_range(5, W - 1)] = GOAL
			for k in rng.randi_range(6, 12):
				var i := rng.randi_range(0, W * H - 1)
				if t[i] == EMPTY:
					t[i] = WALL
			if _bfs(t, target) == target and not _waits_to_win(t, target + 1):  # solvable, not in fewer moves
				levels.append({"t": t, "len": target})
				break

# ---------- presentation ----------

func _rect(pos: Vector2, size: Vector2, col: Color) -> ColorRect:
	var r := ColorRect.new()
	r.position = pos
	r.size = size
	r.color = col
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(r)
	return r

func _label(pos: Vector2, text: String) -> Label:
	var l := Label.new()
	l.position = pos
	l.text = text
	l.add_theme_color_override("font_color", Color(0.1, 0.1, 0.12))
	add_child(l)
	return l

func _build_sheet() -> void:
	_rect(Vector2(OX - HDR, OY - 28), Vector2(HDR + W * CW, 28 + H * CH), Color(0.7, 0.71, 0.74))
	for x in W:
		_rect(Vector2(OX + x * CW + 1, OY - 27), Vector2(CW - 2, 26), Color(0.93, 0.93, 0.95))
		_label(Vector2(OX + x * CW + CW / 2 - 5, OY - 27), char(65 + x))
	for y in H:
		_rect(Vector2(OX - HDR + 1, OY + y * CH + 1), Vector2(HDR - 2, CH - 2), Color(0.93, 0.93, 0.95))
		_label(Vector2(OX - HDR + 13, OY + y * CH + CH / 2 - 12), str(y + 1))
		for x in W:
			_rect(Vector2(OX + x * CW + 1, OY + y * CH + 1), Vector2(CW - 2, CH - 2), Color.WHITE)
	highlight = _rect(Vector2.ZERO, Vector2.ZERO, Color(0.2, 0.45, 0.95, 0.8))
	highlight.z_index = 2
	info = _label(Vector2(20, 10), "")
	msg = _label(Vector2(20, 36), "")
	_label(Vector2(20, 505), "Click a row line (or Shift+click a row number): insert row  |  Click a column letter: delete column  |  Z undo  R restart  N next")

func _cell_pos(i: int) -> Vector2:
	return Vector2(OX + (i % W) * CW, OY + (i / W) * CH)

func _types() -> PackedByteArray:
	var t := PackedByteArray()
	t.resize(W * H)
	for i in W * H:
		t[i] = kinds[ids[i]] if ids[i] != 0 else EMPTY
	return t

func _rebuild() -> void:
	for id in nodes:
		nodes[id].queue_free()
	nodes.clear()
	for i in W * H:
		var id: int = ids[i]
		if id == 0:
			continue
		var p: float = PADS[kinds[id]]
		var r := _rect(_cell_pos(i) + Vector2(p, p), Vector2(CW - 2 * p, CH - 2 * p), COLORS[kinds[id]])
		r.set_meta("pad", Vector2(p, p))
		r.z_index = 1 if kinds[id] == WALKER else 0
		nodes[id] = r

func _refresh() -> void:
	info.text = "Level %d/%d    Moves left: %d    Walker (orange): falls if it can, else steps right, else waits. Reach the green goal." % [level + 1, levels.size(), moves_left]

func _load(i: int) -> void:
	level = i
	ids = []
	kinds = {}
	var t: PackedByteArray = levels[i]["t"]
	for c in W * H:
		ids.append(c + 1 if t[c] != EMPTY else 0)
		if t[c] != EMPTY:
			kinds[c + 1] = t[c]
	moves_left = levels[i]["len"] + 1
	history.clear()
	state = "play"
	busy = false
	msg.text = "Get the walker to the goal before the moves run out." if i == 0 else ""
	_rebuild()
	_refresh()

func _slide_all() -> Tween:
	var tw := create_tween().set_parallel(true)
	tw.tween_interval(SLIDE)
	for i in W * H:
		var id: int = ids[i]
		if id != 0 and nodes.has(id):
			tw.tween_property(nodes[id], "position", _cell_pos(i) + nodes[id].get_meta("pad"), SLIDE).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	return tw

func _drop(id: int, m: int) -> void:
	var r: ColorRect = nodes[id]
	nodes.erase(id)
	var tw := create_tween().set_parallel(true)
	tw.tween_property(r, "position", r.position + (Vector2(0, CH) if m < H else Vector2(-CW / 2, 0)), SLIDE)
	tw.tween_property(r, "modulate:a", 0.0, SLIDE)
	tw.chain().tween_callback(r.queue_free)

func _do(m: int) -> void:
	history.append([ids.duplicate(), moves_left])
	moves_left -= 1
	busy = true
	msg.text = ""
	var dead := false
	for i in _doomed(m):
		if ids[i] != 0:
			dead = dead or kinds[ids[i]] >= GOAL
			_drop(ids[i], m)
	ids = _shift(ids, m)
	_refresh()
	await _slide_all().finished
	if dead:
		_end("lost", "Something important fell off the sheet. Z undo, R restart.")
		return
	var s := _step(_types())
	if s.y >= 0:
		var win: bool = ids[s.y] != 0 and kinds[ids[s.y]] == GOAL
		ids[s.y] = ids[s.x]
		ids[s.x] = 0
		await _slide_all().finished
		if win:
			_end("won", "Sheet complete: all levels solved." if level + 1 == levels.size() else "Solved. Press N for the next level.")
			return
	if moves_left <= 0:
		_end("lost", "Out of moves. Z undo, R restart.")
		return
	busy = false

func _end(st: String, text: String) -> void:
	state = st
	busy = false
	msg.text = text

func _undo() -> void:
	if busy or history.is_empty():
		return
	var h: Array = history.pop_back()
	ids = h[0]
	moves_left = h[1]
	state = "play"
	msg.text = ""
	_rebuild()
	_refresh()

func _hover(p: Vector2) -> void:
	hover_gap = -1
	hover_col = -1
	if p.x >= OX - HDR and p.x <= OX + W * CW and p.y >= OY - 10 and p.y < OY + H * CH - 10:
		var fy := (p.y - OY) / CH
		var r := roundi(fy)
		if absf(fy - r) * CH <= 10 and r < H:
			hover_gap = r
		elif p.x < OX and Input.is_key_pressed(KEY_SHIFT):
			hover_gap = clampi(int(fy), 0, H - 1)
	if hover_gap < 0 and p.y >= OY - 28 and p.y < OY and p.x >= OX and p.x < OX + W * CW:
		hover_col = int((p.x - OX) / CW)
	if hover_gap >= 0:
		highlight.position = Vector2(OX - HDR, OY + hover_gap * CH - 3)
		highlight.size = Vector2(HDR + W * CW, 6)
		highlight.color = Color(0.2, 0.45, 0.95, 0.8)
	elif hover_col >= 0:
		highlight.position = Vector2(OX + hover_col * CW, OY - 28)
		highlight.size = Vector2(CW, 28 + H * CH)
		highlight.color = Color(0.95, 0.2, 0.2, 0.25)
	else:
		highlight.size = Vector2.ZERO

func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventKey and e.pressed and not e.echo:
		if e.keycode == KEY_Z:
			_undo()
		elif e.keycode == KEY_R and not busy:
			_load(level)
		elif e.keycode == KEY_N and not busy:
			if level + 1 < levels.size():
				_load(level + 1)
			else:
				msg.text = "That was the last level. R replays it."
	elif e is InputEventMouseMotion:
		_hover(e.position)
	elif e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		_hover(e.position)
		if busy or state != "play":
			return
		if hover_gap >= 0:
			_do(hover_gap)
		elif hover_col >= 0:
			_do(H + hover_col)
