#!/usr/bin/env python3
"""Stop hook: don't let the agent stop while changed Body Hop files fail their checks.

Changed files = everything changed since the last commit that passed, plus uncommitted
and untracked files, under each folder in .claude/checks.json (docs and playtests
ignored). Every check runs, even after one fails.

- First stop with a failure: block (exit 2) and give the agent the failing lines.
- Repeat stop (stop_hook_active): run the checks again. Still failing: don't block
  again, tell the owner instead (systemMessage). No loops, and nothing hidden.
- A check exiting 3 is "skipped": reported, never blocking, never recorded as a pass.
- A clean pass is remembered (hash of the changed files), and HEAD becomes the new
  baseline once the tree is clean and everything passed.
- While background subagents are still running, do nothing: their files are half-written.
- If the hook itself crashes, block once with the error, so checks are never silently off.
"""
import fnmatch, hashlib, json, os, subprocess, sys

CHECK_TIMEOUT = 120
REPEAT = False


def main():
    global REPEAT
    root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    event = json.load(sys.stdin)
    REPEAT = bool(event.get("stop_hook_active"))
    running = [t for t in (event.get("background_tasks") or []) if isinstance(t, dict) and t.get("status", "running") == "running"]
    if running:
        return 0
    cfg = json.load(open(os.path.join(root, ".claude", "checks.json")))

    def git(*a):
        return subprocess.run(["git", "-C", root, *a], capture_output=True, text=True).stdout

    stamp_dir = git("rev-parse", "--path-format=absolute", "--git-path", "claude-checks").strip()
    os.makedirs(stamp_dir, exist_ok=True)
    base_file = os.path.join(stamp_dir, "last-pass-commit")
    base = open(base_file).read().strip() if os.path.exists(base_file) else ""

    changed = set()
    entries = git("status", "--porcelain", "-z", "-uall").split("\0")
    i = 0
    while i < len(entries):
        e = entries[i]
        if len(e) > 3:
            changed.add(e[3:])
            if e[0] in "RC":  # rename/copy: the next entry is the old path
                i += 1
        i += 1
    if base and git("cat-file", "-t", base).strip() == "commit":
        changed |= {f for f in git("diff", "--name-only", "-z", base, "HEAD").split("\0") if f}

    def ignored(f, proto):
        rel = os.path.relpath(f, proto)
        return any(fnmatch.fnmatch(rel, p) or fnmatch.fnmatch(os.path.basename(f), p) for p in cfg["ignore"])

    failures, skipped, all_pass = [], [], True
    for proto, cmds in cfg["prototypes"].items():
        files = sorted(f for f in changed if f.startswith(proto + "/") and not ignored(f, proto))
        if not files:
            continue
        h = hashlib.sha256()
        for f in files:
            h.update(f.encode())
            p = os.path.join(root, f)
            h.update(open(p, "rb").read() if os.path.isfile(p) else b"<deleted>")
        stamp = os.path.join(stamp_dir, h.hexdigest())
        if os.path.exists(stamp):
            continue
        bad, skip = [], False
        for cmd in cmds:
            try:
                r = subprocess.run(cmd, shell=True, cwd=os.path.join(root, proto), capture_output=True, text=True, timeout=CHECK_TIMEOUT)
                code, out = r.returncode, (r.stdout + r.stderr).strip().splitlines()
            except subprocess.TimeoutExpired:
                code, out = 124, [f"timed out after {CHECK_TIMEOUT} s"]
            if code == 3:
                skip = True
                skipped.append(f"{proto}: " + (out[-1] if out else cmd))
            elif code != 0:
                keep = [l for l in out if any(k in l for k in ("ERROR", "Error", "error", "FAIL", "should", "mismatch", "timed out"))][:12]
                tail = [l for l in out[-6:] if l not in keep]
                bad.append(f"$ {cmd}\nexit {code}\n" + "\n".join(keep + tail))
        if bad:
            all_pass = False
            failures.append(f"{proto} (changed: {', '.join(files[:5])})\n" + "\n\n".join(bad))
        elif skip:
            all_pass = False
        else:
            open(stamp, "w").close()

    if all_pass and not git("status", "--porcelain").strip():
        with open(base_file, "w") as fh:
            fh.write(git("rev-parse", "HEAD").strip())

    note = ("\n\nNot run: " + "; ".join(skipped)) if skipped else ""
    if failures:
        report = "\n\n".join(failures)
        if REPEAT:
            print(json.dumps({"systemMessage": "Body Hop checks still FAIL after the agent's last turn:\n" + report[:3000] + note}))
            return 0
        print(("Checks failed for changed Body Hop files. Fix them, or end by telling the owner plainly "
               "which check fails and why. Do not claim the change works.\n\n" + report + note)[:9000], file=sys.stderr)
        return 2
    if skipped:
        print(json.dumps({"systemMessage": "Not run: " + "; ".join(skipped)}))
    return 0


try:
    sys.exit(main())
except SystemExit:
    raise
except Exception as e:  # never let the checks be silently off
    msg = f"The Body Hop check hook crashed ({type(e).__name__}: {e}). Checks did not run."
    if REPEAT:
        print(json.dumps({"systemMessage": msg}))
        sys.exit(0)
    print(msg + " Say so to the owner.", file=sys.stderr)
    sys.exit(2)
