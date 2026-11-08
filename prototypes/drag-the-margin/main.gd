extends Node2D
# Drag the margin: the level is a paragraph; words are platforms; the right margin re-wraps it.
# Reflow rule: if you stand on a word, you ride it to its new spot. If airborne, you keep falling.
# Walls: the left edge and the margin are solid, so the only ways down are ragged line ends and gaps of 2+ cells.
# Changes: one commit = one change, however many columns it moves (a drag, a tap, or a whole hold); one Tab = one change.
# Budget (cheating in the player's favour): levels 1-3 unlimited, 4-10 par + 2. Par is shown as a target.
# Preview: dragging the handle, or holding an arrow, shows the would-be layout; releasing commits and charges.
# Undo: Z reverts the last change and refunds it, as long as the player has not moved since it finished.
# Each level: [text, start width, par, optional kind, optional letters].
# kind: "caret" (a cursor sweeps the text and kills), "align" (Tab cycles alignment), "spell" (touch letters in order).
# letters: [[word index, char index], ...] in the order they must be touched.
# Par comes from solve.py (run it after editing levels). Words made only of 4+ punctuation marks are spike walls.

const LEVELS := [
	["You stand on a word and you cannot jump up a line so drag the purple margin to the right and the gold word will come up", 39, 1],
	["The quick brown fox was told to jump over the lazy dog, but the dog kept moving to the next line. So the fox learned to shift the margin instead and rode the dog all the way home", 45, 2],
	["Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse and nothing to interest me on shore, I thought I would sail about and see the watery part of the world", 48, 2],
	["Some lines are guarded. Spikes are words too, so they wrap with the rest of the paragraph. Push them down a line or pull them up, then walk past this row of spikes !!!! to the gold word home", 42, 2],
	["Hold the Shift key and every letter stands up tall. Hold the margin and every line lies !!!! down again. Between the two !!!! of them the paragraph keeps its secrets, and the last word waits just past the fence ?!?! at home", 30, 2],
	["The editor said cut it, so the writer cut it. The editor said longer, so the writer padded every sentence with words that did nothing at all. Then the editor said !!!! no !!!! no !!!! no, and the last word left", 26, 2],
	["Read me slowly. Then read me again with a narrower margin, and notice which words used to be neighbours !!!!! and now are strangers on different lines. Find the one width where the fence !!!!! leaves the last word alone", 46, 2],
	["A caret blinks through every line in reading order, left to right and then down to the start of the next. It does not care where you stand. !!!! Change the margin and you change its road, so keep moving toward the gold word at the end", 48, 2, "caret"],
	["Centre the text and every line grows a left edge to fall from. Justify it !!!! and the spaces stretch into holes. Right align it and the ragged end moves to the other side. Pick the !!!! shape that gets you past the fence !!!! home", 30, 4, "align"],
	["Every letter you need is hiding somewhere in this paragraph, but you have to find them in the right order. The margin moves the words, the words move the letters, and only when the whole word is spelled for you does the gold one at the end let you finish", 34, 2, "spell", [[26, 4], [5, 0], [14, 1], [38, 0], [1, 3]]],
]
const ALIGNS := ["left", "centre", "right", "justify"]
const CARET_PERIOD := 11.0  # seconds for the caret to read the whole paragraph once
const CARET_WARN := 1.0     # the cells it will cover in the next second are drawn as a dim trail
const CW := 16.0          # cell width
const CH := 16.0          # cell height
const LH := 48.0          # line pitch: higher than a jump, so you cannot climb lines
const OX := 32.0
const OY := 56.0
const MAX_COLS := 55
const MAX_LINES := 9
const PUNCT := ",.;:!?"
const REFLOW_TIME := 0.3
const SPEED := 140.0
const JUMP := -260.0
const GRAVITY := 1100.0
const PSIZE := Vector2(20, 14)  # wider than one space, so you only fall off line ends

var level := 0
var words: PackedStringArray
var cols := 40
var min_cols := 20
var bodies: Array[StaticBody2D] = []
var from_pos: Array[Vector2] = []
var to_pos: Array[Vector2] = []
var flash: Array[float] = []
var anim_t := 1.0
var player: CharacterBody2D
var floor_word := -1
var rider := -1
var rider_off := Vector2.ZERO
var dragging := false
var won := false
var finished := false
var started := false
var failed := false
var budget := 0
var used := 0
var deaths := 0
var elapsed := 0.0
var widths: PackedStringArray = []
var kind := ""
var align := 0
var letters: Array = []
var spell_p := 0
var caret_q := 0.0
var char_word: PackedInt32Array = []
var char_off: PackedInt32Array = []
var keylog: Array = []
var held_a := 0.0
var held_d := 0.0
var label: Label
var help: Label
var hint: Label
var margin_wall: StaticBody2D
var tabbed := false
var par := 0
var preview := -1          # previewed width while dragging or holding an arrow, -1 when none
var arrow_t := 0.0
var arrow_held := false
var hover := false
var undo_stack: Array = [] # [width, alignment, cost] per committed change, cleared when the player moves
var settled := true
var settle_pos := Vector2.ZERO
var note := ""
var note_t := 0.0
var clock := 0.0
var last_tap := -10.0
var tip_shown := false     # the "hold to preview" tip shows once per session
var tip_t := 0.0

func _ready() -> void:
	label = Label.new()
	label.position = Vector2(12, 8)
	add_child(label)
	help = Label.new()
	help.position = Vector2(12, 512)
	help.text = "A/D walk  Space/W jump  drag the margin or hold Left/Right: preview, release to apply  Z undo  Tab align (lvl 9)  R restart  N next"
	add_child(help)
	hint = Label.new()
	hint.text = "Tab: alignment"
	add_child(hint)
	# Solid left wall: you cannot walk off the start of a line, so you only go down off a line's ragged end.
	var wall := StaticBody2D.new()
	var ws := CollisionShape2D.new()
	var wr := RectangleShape2D.new()
	wr.size = Vector2(16, 800)
	ws.shape = wr
	ws.position = Vector2(OX - 8, 270)
	wall.add_child(ws)
	add_child(wall)
	# The margin is solid too, and moves with the handle: a flush line end is not a ragged end, so it is no way down.
	margin_wall = StaticBody2D.new()
	var ms := CollisionShape2D.new()
	var mr := RectangleShape2D.new()
	mr.size = Vector2(16, 800)
	ms.shape = mr
	ms.position = Vector2(8, 270)
	margin_wall.add_child(ms)
	add_child(margin_wall)
	player = CharacterBody2D.new()
	var cs := CollisionShape2D.new()
	var rs := RectangleShape2D.new()
	rs.size = PSIZE
	cs.shape = rs
	player.add_child(cs)
	add_child(player)
	load_level(0)
	var touch := Control.new()
	touch.set_script(load("res://touch_controls.gd"))
	add_child(touch)  # on-screen buttons on phones; sends the same key events

func load_level(i: int) -> void:
	level = i
	for b in bodies:
		b.queue_free()
	bodies.clear()
	words = LEVELS[i][0].split(" ")
	cols = LEVELS[i][1]
	par = LEVELS[i][2]
	budget = -1 if i < 3 else par + 2  # -1: unlimited
	preview = -1
	arrow_held = false
	dragging = false
	undo_stack.clear()
	note = ""
	used = 0
	deaths = 0
	elapsed = 0.0
	widths = [str(cols)]
	failed = false
	kind = LEVELS[i][3] if LEVELS[i].size() > 3 else ""
	letters = LEVELS[i][4] if LEVELS[i].size() > 4 else []
	align = 0
	tabbed = false
	spell_p = 0
	keylog = []
	held_a = 0.0
	held_d = 0.0
	char_word.clear()
	char_off.clear()
	for k in words.size():  # reading stream: each letter, then the space after the word
		for c in words[k].length() + (1 if k < words.size() - 1 else 0):
			char_word.append(k)
			char_off.append(c)
	min_cols = 1
	for w in words:
		min_cols = max(min_cols, w.length())
	while layout(min_cols, 0)[-1].y >= OY + MAX_LINES * LH:
		min_cols += 1
	var lay := layout(cols)
	margin_wall.position.x = OX + cols * CW
	from_pos = lay.duplicate()
	to_pos = lay.duplicate()
	flash.clear()
	for k in words.size():
		bodies.append(make_word(words[k], lay[k]))
		flash.append(0.0)
	anim_t = 1.0
	won = false
	finished = false
	respawn()

func make_word(w: String, pos: Vector2) -> StaticBody2D:
	var b := StaticBody2D.new()
	b.position = pos
	var base := CollisionShape2D.new()
	var r := RectangleShape2D.new()
	r.size = Vector2(w.length() * CW, CH)
	base.shape = r
	base.position = r.size / 2
	base.one_way_collision = true
	b.add_child(base)
	for c in w.length():
		if is_cap(w[c]):  # capitals are one cell taller and solid: hop over them
			var cap := CollisionShape2D.new()
			var cr := RectangleShape2D.new()
			cr.size = Vector2(CW, CH)
			cap.shape = cr
			cap.position = Vector2(c * CW + CW / 2, -CH / 2)
			b.add_child(cap)
	add_child(b)
	return b

func is_cap(ch: String) -> bool:
	return ch != ch.to_lower()

# Greedy wrap over a monospace grid, then alignment in whole cells; returns each word's top-left in pixels.
# Justify spreads the slack over the gaps of every line but the last. solve.py mirrors this exactly.
func layout(c: int, al: int = -1) -> Array[Vector2]:
	if al < 0:
		al = align
	var lines: Array = [[]]
	var col := 0
	for i in words.size():
		if col > 0 and col + words[i].length() > c:
			lines.append([])
			col = 0
		lines[-1].append(i)
		col += words[i].length() + 1
	var out: Array[Vector2] = []
	out.resize(words.size())
	for l in lines.size():
		var ids: Array = lines[l]
		var used_cols: int = ids.size() - 1
		for i in ids:
			used_cols += words[i].length()
		var slack: int = c - used_cols
		var gaps: int = ids.size() - 1
		var x: int = [0, int(slack / 2.0), slack, 0][al]
		for n in ids.size():
			out[ids[n]] = Vector2(OX + x * CW, OY + CH + l * LH)
			var extra := 0
			if al == 3 and gaps > 0 and l < lines.size() - 1:
				extra = int(slack / float(gaps)) + (1 if n < slack % gaps else 0)
			x += words[ids[n]].length() + 1 + extra
	return out

func respawn() -> void:
	var b := bodies[0]
	player.position = b.position + Vector2(words[0].length() * CW / 2 + CW / 2, -CH - 20)
	player.velocity = Vector2.ZERO
	rider = -1
	caret_q = words[0].length() + 1  # the caret starts just past the first word: standing still there lasts ~7 s

func spend(n: int) -> bool:
	if won or finished or failed or n == 0:
		return false
	if budget >= 0 and used + n > budget:  # refuse, don't fail: the player can still undo or restart
		note = "Not enough changes left (%d). Z undoes, R restarts." % (budget - used)
		note_t = 3.0
		return false
	used += n
	started = true
	return true

func set_cols(c: int, by_drag := false) -> void:
	c = clampi(c, min_cols, MAX_COLS)
	if c == cols or not spend(1):  # one commit is one change, however far it moves
		return
	if by_drag:
		log_key("Drag")
	undo_stack.append([cols, align, 1])
	cols = c
	margin_wall.position.x = OX + cols * CW
	widths.append(str(c))
	reflow()

func cycle_align() -> void:
	if kind != "align" or not spend(1):
		return
	undo_stack.append([cols, align, 1])
	align = (align + 1) % 4
	tabbed = true
	widths.append(ALIGNS[align])
	reflow()

func undo() -> void:  # only while the player has not moved since the last reflow finished
	if undo_stack.is_empty() or won or finished:
		return
	var u: Array = undo_stack.pop_back()
	used -= u[2]
	cols = u[0]
	align = u[1]
	margin_wall.position.x = OX + cols * CW
	widths.append("undo>" + str(cols) + ("/" + ALIGNS[align] if kind == "align" else ""))
	reflow()

func drag_begin() -> void:  # grab the margin handle (mouse or touch)
	dragging = true
	preview = cols

func drag_move(x: float) -> void:
	if dragging:
		preview = clampi(roundi((x - OX) / CW), min_cols, MAX_COLS)

func drag_end() -> void:
	if dragging:
		dragging = false
		commit_preview(true)

func commit_preview(by_drag := false) -> void:
	var c := preview
	preview = -1
	arrow_held = false
	if c >= 0 and c != cols:
		set_cols(c, by_drag)

func reflow() -> void:
	settled = false
	if rider < 0 and floor_word >= 0 and player.is_on_floor():
		rider = floor_word
		rider_off = player.position - bodies[rider].position
	var lay := layout(cols)
	for k in words.size():
		from_pos[k] = bodies[k].position
		to_pos[k] = lay[k]
		if from_pos[k].distance_to(to_pos[k]) > 1.0:
			flash[k] = 0.6
	anim_t = 0.0

func _unhandled_input(e: InputEvent) -> void:
	var mx := OX + cols * CW
	if e is InputEventMouseButton and e.button_index == MOUSE_BUTTON_LEFT:
		if e.pressed and abs(e.position.x - mx) < 14:
			drag_begin()
		elif not e.pressed and dragging:
			drag_end()
	elif e is InputEventMouseMotion and dragging:
		drag_move(e.position.x)
	elif e is InputEventKey and not e.pressed and e.keycode in [KEY_LEFT, KEY_RIGHT] and arrow_held:
		if not (Input.is_key_pressed(KEY_LEFT) or Input.is_key_pressed(KEY_RIGHT)):
			var tap: bool = abs(preview - cols) == 1 and arrow_t < 0.4
			commit_preview()  # releasing the last arrow applies the previewed width
			if tap:  # two quick taps in a row: teach the hold, once
				if clock - last_tap < 1.0 and not tip_shown:
					tip_shown = true
					tip_t = 4.0
				last_tap = clock
	elif e is InputEventKey and e.pressed and not e.echo:
		match e.keycode:
			KEY_LEFT, KEY_RIGHT:  # hold to preview (one more column every 0.25 s), release to commit
				var d := 1 if e.keycode == KEY_RIGHT else -1
				preview = clampi((preview if arrow_held else cols) + d, min_cols, MAX_COLS)
				arrow_held = true
				arrow_t = 0.0
			KEY_ESCAPE:
				preview = -1
				arrow_held = false
				dragging = false
			KEY_Z: undo()
			KEY_TAB: cycle_align()
			KEY_R:
				report("restarted")
				load_level(0 if finished else level)
			KEY_N:
				if won:
					next_level()
				elif e.shift_pressed and not finished:  # playtest skip, always logged
					report("SKIPPED")
					next_level()

func _process(dt: float) -> void:
	var mp := get_viewport().get_mouse_position()
	hover = abs(mp.x - (OX + cols * CW)) < 14
	note_t = max(0.0, note_t - dt)
	tip_t = max(0.0, tip_t - dt)
	clock += dt
	if arrow_held:
		arrow_t += dt
		if arrow_t >= 0.4:
			arrow_t -= 0.25
			var d := int(Input.is_key_pressed(KEY_RIGHT)) - int(Input.is_key_pressed(KEY_LEFT))
			preview = clampi(preview + d, min_cols, MAX_COLS)

func _input(e: InputEvent) -> void:
	if e is InputEventKey and e.pressed:
		log_key(e.as_text_keycode())

func log_key(name: String) -> void:
	if not keylog.is_empty() and keylog[-1][0] == name:
		keylog[-1][1] += 1
	else:
		keylog.append([name, 1])

func report(what: String) -> void:
	var keys := PackedStringArray()
	for k in keylog:
		keys.append("%s x%d" % k)
	print("Level %d %s | changes %d/%s (par %d) | time %.1f s | deaths %d | widths %s | held A %.1f s, D %.1f s | keys %s" % [
		level + 1, what, used, "unlimited" if budget < 0 else str(budget), par, elapsed, deaths, " > ".join(widths), held_a, held_d, ", ".join(keys)])

func next_level() -> void:
	if level + 1 < LEVELS.size():
		load_level(level + 1)
	else:
		finished = true

func _physics_process(dt: float) -> void:
	for k in flash.size():
		flash[k] = max(0.0, flash[k] - dt)
	if anim_t < 1.0:
		anim_t = min(1.0, anim_t + dt / REFLOW_TIME)
		var e := ease(anim_t, -2.0)
		for k in bodies.size():
			bodies[k].position = from_pos[k].lerp(to_pos[k], e)
		if rider >= 0:
			player.position = bodies[rider].position + rider_off
			player.velocity = Vector2.ZERO
			if anim_t >= 1.0:
				rider = -1
			advance_caret(dt)
			if hit_caret():
				die()
			queue_redraw()
			return
	if not (won or finished or failed):
		elapsed += dt
		held_a += dt * int(Input.is_key_pressed(KEY_A))
		held_d += dt * int(Input.is_key_pressed(KEY_D))
		advance_caret(dt)
		var dir := int(Input.is_key_pressed(KEY_D)) - int(Input.is_key_pressed(KEY_A))
		player.velocity.x = dir * SPEED
		var jump := Input.is_key_pressed(KEY_SPACE) or Input.is_key_pressed(KEY_W)
		if dir != 0:
			started = true
		if dir != 0 or jump:
			undo_stack.clear()  # moving makes the last change final
		if player.is_on_floor() and jump:
			player.velocity.y = JUMP
	else:
		player.velocity.x = 0
	player.velocity.y += GRAVITY * dt
	player.move_and_slide()
	if anim_t >= 1.0 and not settled:
		settled = true
		settle_pos = player.position
	elif settled and player.position.distance_to(settle_pos) > 1.0:
		undo_stack.clear()  # fell or was moved after the reflow: no undo
	# The word you stand on (and ride) is the one under your centre; if your centre is over a gap, the nearer word.
	floor_word = -1
	var best := INF
	for i in player.get_slide_collision_count():
		var col := player.get_slide_collision(i)
		if col.get_normal().y < -0.5 and col.get_collider() in bodies:
			var k := bodies.find(col.get_collider())
			var d: float = abs(player.position.x - (bodies[k].position.x + words[k].length() * CW / 2)) - words[k].length() * CW / 2
			if d < best:
				best = d
				floor_word = k
	var pr := Rect2(player.position - PSIZE / 2, PSIZE)
	while spell_p < letters.size() and pr.intersects(letter_rect(spell_p)):
		flash[letters[spell_p][0]] = 0.6
		spell_p += 1
	if floor_word == words.size() - 1 and spell_p == letters.size() and not won and not failed:
		won = true
		report("complete")
	if player.position.y > 580 or hit_spike() or hit_caret():
		die()
	queue_redraw()

func die() -> void:  # respawn on the first word; width, alignment, letters and budget spent are kept
	deaths += 1
	respawn()

func advance_caret(dt: float) -> void:
	if kind == "caret":
		caret_q = fmod(caret_q + dt * char_word.size() / CARET_PERIOD, char_word.size())

func caret_rect() -> Rect2:
	var i := int(caret_q)
	var p := bodies[char_word[i]].position
	return Rect2(p + Vector2((char_off[i] + caret_q - i) * CW - 1.5, -20), Vector2(3, 36))

func hit_caret() -> bool:
	return kind == "caret" and caret_rect().intersects(Rect2(player.position - PSIZE / 2, PSIZE))

func letter_rect(n: int) -> Rect2:
	return Rect2(bodies[letters[n][0]].position + Vector2(letters[n][1] * CW, -4), Vector2(CW, CH + 4))

func hit_spike() -> bool:
	var pr := Rect2(player.position - PSIZE / 2, PSIZE)
	for k in words.size():
		for c in words[k].length():
			if PUNCT.contains(words[k][c]) and pr.intersects(spike_rect(k, c)):
				return true
	return false

func is_wall(w: String) -> bool:  # too long to jump over; wraps like any word
	if w.length() < 4:
		return false
	for ch in w:
		if not PUNCT.contains(ch):
			return false
	return true

func spike_rect(k: int, c: int) -> Rect2:
	var h := CH if is_wall(words[k]) else CH * 0.6
	return Rect2(bodies[k].position + Vector2(c * CW + 4, -h), Vector2(CW - 8, h))

func _draw() -> void:
	var goal := words.size() - 1
	for k in words.size():
		var base := Color(0.62, 0.62, 0.66)
		if k == goal:
			base = Color(0.95, 0.78, 0.2) if spell_p == letters.size() else Color(0.55, 0.47, 0.2)
		var col := base.lerp(Color(0.45, 0.85, 1.0), clamp(flash[k] / 0.6, 0.0, 1.0))
		var p := bodies[k].position
		for c in words[k].length():
			draw_rect(Rect2(p + Vector2(c * CW + 1, 1), Vector2(CW - 2, CH - 2)), col)
			if is_cap(words[k][c]):
				draw_rect(Rect2(p + Vector2(c * CW + 1, -CH + 1), Vector2(CW - 2, CH - 2)), col.darkened(0.15))
			if PUNCT.contains(words[k][c]):
				draw_rect(spike_rect(k, c), Color(0.9, 0.25, 0.25))
	for n in letters.size():  # spell letters: collected green, next one bright with an outline, later ones dim
		var r := letter_rect(n).grow_individual(-1, -3, -1, -1)
		var lc := Color(0.3, 0.9, 0.4) if n < spell_p else (Color(1, 0.35, 0.9) if n == spell_p else Color(0.6, 0.3, 0.6))
		draw_rect(r, lc)
		if n == spell_p:
			draw_rect(r.grow(2), Color.WHITE, false, 2.0)
	if kind == "caret":  # telegraph: a dim trail over the cells it reaches in the next second
		var n := char_word.size()
		var ahead := int(n * CARET_WARN / CARET_PERIOD)
		for s in range(1, ahead + 1):
			var i := (int(caret_q) + s) % n
			var a := 0.28 * (1.0 - float(s) / (ahead + 1))
			draw_rect(Rect2(bodies[char_word[i]].position + Vector2(char_off[i] * CW, -20), Vector2(CW, 36)), Color(1, 1, 1, a))
		if fmod(elapsed, 0.5) < 0.35:
			draw_rect(caret_rect(), Color(1, 1, 1))
	draw_rect(Rect2(OX - 16, 0, 14, 540), Color(0.3, 0.3, 0.34))  # the left wall
	var mx := OX + cols * CW
	draw_rect(Rect2(mx, 0, 14, 540), Color(0.45, 0.25, 0.45))  # the margin wall
	draw_rect(Rect2(mx - 1, OY - 12, 2, 540 - OY), Color(0.9, 0.4, 0.9, 0.6))
	draw_rect(Rect2(mx - 6, OY - 24, 12, 24), Color(1, 0.7, 1) if dragging or hover else Color(0.9, 0.4, 0.9))
	if preview >= 0:  # the would-be layout as hollow outlines; your word and you, highlighted
		var lay := layout(preview)
		for k in words.size():
			var oc := Color(0.7, 0.7, 0.8, 0.45)
			if k == goal:
				oc = Color(0.95, 0.78, 0.2, 0.9)
			elif is_wall(words[k]):
				oc = Color(0.95, 0.3, 0.3, 0.8)
			draw_rect(Rect2(lay[k], Vector2(words[k].length() * CW, CH)), oc, false, 1.0)
		if floor_word >= 0:
			draw_rect(Rect2(lay[floor_word], Vector2(words[floor_word].length() * CW, CH)).grow(2), Color(0.45, 0.95, 1.0), false, 2.0)
			draw_rect(Rect2(lay[floor_word] + (player.position - bodies[floor_word].position) - PSIZE / 2, PSIZE), Color(0.3, 1.0, 0.45, 0.9), false, 2.0)
		draw_rect(Rect2(OX + preview * CW - 1, OY - 24, 2, 540 - OY + 24), Color(1, 0.8, 1, 0.9))
	draw_rect(Rect2(player.position - PSIZE / 2, PSIZE), Color(0.3, 1.0, 0.45))
	var msg := "Level %d/%d    " % [level + 1, LEVELS.size()]
	if budget < 0:
		msg += "margin changes: %d (par %d)" % [used, par]
	else:
		msg += "changes left: %d of %d (par %d)" % [budget - used, budget, par]
	msg += "    time %.1f s    deaths %d" % [elapsed, deaths]
	if preview >= 0:
		msg = "Preview: width %d, costs %d. Release to apply, Esc to cancel." % [preview, 0 if preview == cols else 1]
	elif not undo_stack.is_empty():
		msg += "    Z: undo"
	if kind == "align":
		msg += "    alignment: %s (Tab, costs 1)" % ALIGNS[align]
	if kind == "caret":
		msg += "    the caret kills: jump it"
	if kind == "spell":
		var sp := ""
		for n in letters.size():
			sp += (words[letters[n][0]][letters[n][1]].to_upper() if n < spell_p else "_") + " "
		msg += "    spell before the gold word counts: " + sp
	if not started and preview < 0:
		msg = "DRAG THE MARGIN: reach the gold word. You cannot jump up a line.   " + msg
	if note_t > 0:
		msg = note
	if failed:
		msg = "Out of margin changes (budget %d). Press R to retry.   time %.1f s" % [budget, elapsed]
	if won:
		msg = "Level complete in %d changes (par %d), %.1f s, %d deaths. Press N for the next paragraph." % [used, par, elapsed, deaths]
	if won and level == LEVELS.size() - 1:
		msg = "Last level complete in %d changes (par %d). Press N to finish." % [used, par]
	if finished:
		msg = "The end. All paragraphs read. Press R to start over."
	label.text = msg
	hint.text = "Drag the margin (or Left/Right)" if level == 0 else "Tab: alignment"
	hint.visible = ((level == 0 and used == 0) or (kind == "align" and not tabbed)) and not (won or failed)
	if tip_t > 0:
		hint.text = "hold to preview, one change per release"
		hint.visible = true
	hint.position = player.position + Vector2(-48 if tip_t <= 0 else -120, -46)
