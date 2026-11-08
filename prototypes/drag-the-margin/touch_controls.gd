extends Control
# On-screen controls for phones. Shown when a touchscreen is present or on the first touch.
# Buttons send the same key events the keyboard would (A, D, Space, Left, Right, Z, Tab, Esc, R, N),
# so the game logic, the key log and the playtest reports are unchanged. A touch on the play field
# near the margin drags the handle, through the game's drag_begin/drag_move/drag_end.

const KEYS := {
	"walk_l": KEY_A, "walk_r": KEY_D, "jump": KEY_SPACE,
	"margin_l": KEY_LEFT, "margin_r": KEY_RIGHT,
	"undo": KEY_Z, "align": KEY_TAB, "cancel": KEY_ESCAPE, "restart": KEY_R, "next": KEY_N,
}
const LABELS := {
	"walk_l": "", "walk_r": "", "jump": "JUMP",  # walk buttons draw a triangle
	"margin_l": "< margin", "margin_r": "margin >",
	"undo": "undo", "align": "align", "cancel": "cancel", "restart": "R", "next": "next >",
}
const RECTS := {  # in the 960x540 game space
	"walk_l": Rect2(12, 424, 96, 104), "walk_r": Rect2(116, 424, 96, 104),
	"jump": Rect2(852, 424, 96, 104),
	"margin_l": Rect2(740, 330, 100, 80), "margin_r": Rect2(848, 330, 100, 80),
	"undo": Rect2(748, 4, 64, 40), "align": Rect2(748, 4, 64, 40), "cancel": Rect2(748, 4, 64, 40),
	"restart": Rect2(820, 4, 56, 40), "next": Rect2(884, 4, 64, 40),
}
const GRAB := 48.0  # touch tolerance around the margin line, wider than the mouse's 14

var game: Node2D
var active := false
var fingers := {}       # finger index -> button id
var drag_finger := -1   # finger dragging the margin handle
var font: Font

func _ready() -> void:
	game = get_parent()
	font = ThemeDB.fallback_font
	mouse_filter = MOUSE_FILTER_IGNORE
	size = Vector2(960, 540)
	active = DisplayServer.is_touchscreen_available()
	_apply_mode()
	set_process(true)

func _apply_mode() -> void:
	if not active:
		return
	game.help.visible = false  # the keyboard help line
	game.label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	game.label.size.x = 720  # keep the HUD clear of the top-right buttons

func _visible_buttons() -> Array:
	var ids := ["walk_l", "walk_r", "jump", "margin_l", "margin_r", "restart"]
	if game.preview >= 0:
		ids.append("cancel")
	elif game.kind == "align":
		ids.append("align")
	elif not game.undo_stack.is_empty():
		ids.append("undo")
	if game.won:
		ids.append("next")
	return ids

func _button_at(p: Vector2) -> String:
	for id in _visible_buttons():
		if RECTS[id].grow(6).has_point(p):
			return id
	return ""

func _send(id: String, pressed: bool) -> void:
	var e := InputEventKey.new()
	e.keycode = KEYS[id]
	e.physical_keycode = KEYS[id]
	e.pressed = pressed
	Input.parse_input_event.call_deferred(e)

func _input(e: InputEvent) -> void:
	if e is InputEventScreenTouch:
		if not active:
			active = true
			_apply_mode()
		if e.pressed:
			var id := _button_at(e.position)
			if id != "":
				fingers[e.index] = id
				_send(id, true)
			elif drag_finger < 0 and abs(e.position.x - (game.OX + game.cols * game.CW)) < GRAB:
				drag_finger = e.index
				game.drag_begin()
		else:
			if fingers.has(e.index):
				_send(fingers[e.index], false)
				fingers.erase(e.index)
			elif e.index == drag_finger:
				drag_finger = -1
				game.drag_end()
		get_viewport().set_input_as_handled()
	elif e is InputEventScreenDrag:
		if e.index == drag_finger:
			game.drag_move(e.position.x)
		get_viewport().set_input_as_handled()

func _process(_dt: float) -> void:
	if active:
		# A button that disappears (e.g. "cancel" after a release) must not stay logically held.
		for idx in fingers.keys():
			if not fingers[idx] in _visible_buttons():
				_send(fingers[idx], false)
				fingers.erase(idx)
		queue_redraw()

func _draw() -> void:
	if not active:
		return
	var held := fingers.values()
	for id in _visible_buttons():
		var r: Rect2 = RECTS[id]
		var down: bool = id in held
		var fill := Color(1, 1, 1, 0.42 if down else 0.16)
		if id == "jump":
			fill = Color(0.3, 1.0, 0.45, 0.5 if down else 0.2)
		elif id.begins_with("margin") or id == "cancel":
			fill = Color(0.9, 0.4, 0.9, 0.5 if down else 0.2)
		draw_rect(r, fill)
		draw_rect(r, Color(1, 1, 1, 0.55), false, 2.0)
		var text: String = LABELS[id]
		if text == "":  # walk buttons: a triangle pointing the way
			var c := r.get_center()
			var d := 1.0 if id == "walk_r" else -1.0
			draw_colored_polygon(PackedVector2Array([c + Vector2(18 * d, 0), c + Vector2(-12 * d, -22), c + Vector2(-12 * d, 22)]), Color(1, 1, 1, 0.95))
			continue
		var fs := 18
		var w := font.get_string_size(text, HORIZONTAL_ALIGNMENT_CENTER, -1, fs).x
		draw_string(font, Vector2(r.position.x + (r.size.x - w) / 2, r.position.y + r.size.y / 2 + fs * 0.35), text, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Color(1, 1, 1, 0.95))
