#!/usr/bin/env python3
"""PreToolUse (project settings, every tool): when the caller is a persona-tester subagent
(agent_type in the hook input), it may only play and see the game.

Allowed: Bash running `node <run>/play.js ...`; Read of screenshots in <run>/sessions/;
Write of <run>/interviews/<name>.md. Everything else is refused, so a tester can't read
levels, code, docs or game.html.
"""
import json, os, re, subprocess, sys

e = json.load(sys.stdin)
if e.get("agent_type") != "persona-tester":
    sys.exit(0)
tool, i = e.get("tool_name"), e.get("tool_input", {})
GUARDED = {"Bash", "Read", "Write", "Edit", "MultiEdit", "NotebookEdit", "Glob", "Grep", "LS", "WebFetch", "WebSearch", "Agent"}
if tool not in GUARDED:
    sys.exit(0)  # harness tools such as SubagentHandback must work
root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
runs = os.path.realpath(subprocess.run(["git", "-C", root, "rev-parse", "--path-format=absolute", "--git-path", "persona-runs"], capture_output=True, text=True).stdout.strip() or "/nonexistent")

def inside(p, *parts):
    p = os.path.realpath(p or "")
    return p.startswith(runs + os.sep) and all(x in p.split(os.sep) for x in parts)

ok = False
if tool == "Bash":
    m = re.fullmatch(r"\s*node\s+(\S+/play\.js)(\s+--(session|keys|note|filter)\s+(\"[^\"`$]*\"|'[^'`$]*'|[^\s;&|`$<>]+))*\s*", i.get("command", ""))
    ok = bool(m) and inside(m.group(1))
elif tool == "Read":
    ok = inside(i.get("file_path"), "sessions") and i.get("file_path", "").endswith(".png")
elif tool == "Write":
    ok = inside(i.get("file_path"), "interviews") and i.get("file_path", "").endswith(".md")
if not ok:
    print("Persona testers play blind: only `node <run>/play.js --session ... --keys ... --note ...`, reading your own "
          "screenshots, and writing <run>/interviews/<name>.md are allowed.", file=sys.stderr)
    sys.exit(2)
