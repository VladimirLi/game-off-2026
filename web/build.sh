#!/usr/bin/env bash
# Export one Godot project as a web build.
#   web/build.sh <project_dir> <out_dir>
# Uses $GODOT (default: godot on PATH). Needs the 4.7.2 web export templates installed.
set -euo pipefail
proj=$1
out=$2
GODOT=${GODOT:-godot}
here=$(cd "$(dirname "$0")" && pwd)

if [ ! -f "$proj/project.godot" ]; then
	echo "no project.godot in $proj" >&2
	exit 1
fi

temp_preset=""
if [ ! -f "$proj/export_presets.cfg" ]; then
	cp "$here/export_presets.web.cfg" "$proj/export_presets.cfg"
	temp_preset="$proj/export_presets.cfg"
	trap 'rm -f "$temp_preset"' EXIT
fi

mkdir -p "$out"
out_abs=$(cd "$out" && pwd)

# First pass imports resources (fills .godot/), second pass exports.
"$GODOT" --headless --path "$proj" --import >/dev/null 2>&1 || true
"$GODOT" --headless --path "$proj" --export-release Web "$out_abs/index.html"

test -s "$out_abs/index.wasm" && test -s "$out_abs/index.pck"
echo "exported $proj -> $out_abs"
