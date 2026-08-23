#!/bin/bash
# Keep the main checkout to one editor at a time.
#
# A solo session edits it normally — a worktree for a one-line fix is overhead
# nobody wants. The moment a second editor appears, the latecomer is pushed into
# its own worktree instead, which is where the collisions actually come from.
#
# The incumbent keeps main: whoever is mid-edit should not be evicted.
#
# Wired up as a PreToolUse hook in .claude/settings.json. See docs/WORKTREES.md.

PATH=/usr/bin:/bin:/usr/sbin:/sbin:$PATH

MAIN="/Users/lauurnce/projects/survivalKitApp"
BEATS="$HOME/.claude/survivalkit-sessions"
STALE_MINUTES=60

payload=$(cat)
file=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$file" ] && exit 0

case "$file" in
  /*) abs="$file" ;;
  *)  abs="$PWD/$file" ;;
esac

# The trailing slash matters: without it this also swallows survivalKitApp-dash,
# -emails, -preview and every other sibling worktree.
case "$abs" in
  "$MAIN"/*) ;;
  *) exit 0 ;;
esac

# Escape hatch. Claude Code's own config has to stay editable from here, or a
# bad hook locks every session out of the file needed to repair it.
case "$abs" in
  "$MAIN"/.claude/*) exit 0 ;;
esac

me=$(printf '%s' "$payload" | jq -r '.session_id // empty' 2>/dev/null)
[ -z "$me" ] && me="nosession-$PPID"

mkdir -p "$BEATS" 2>/dev/null
# A session that died should not hold main forever.
find "$BEATS" -type f -mmin "+$STALE_MINUTES" -delete 2>/dev/null

rel="${abs#"$MAIN"/}"

recipe="Work in a worktree instead:

  git -C $MAIN worktree add ~/projects/survivalKitApp-<track> -b <type>/<description> origin/main
  cd ~/projects/survivalKitApp-<track>
  ln -s $MAIN/.env.local .env.local
  ln -s $MAIN/node_modules node_modules

Then claim your files in ~/projects/.survivalkit-claims.md before editing.
Full procedure: docs/WORKTREES.md."

deny() {
  jq -n --arg r "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

ask() {
  jq -n --arg r "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

# Any other Claude session that touched main recently owns it.
holder=$(find "$BEATS" -type f ! -name "$me" 2>/dev/null | head -1)
if [ -n "$holder" ]; then
  deny "$rel is in the main checkout, which another Claude session is already editing
(claimed by session ${holder##*/}, within the last $STALE_MINUTES minutes).

Two sessions editing one checkout fight over HEAD and the git index. The session
that got there first keeps it.

$recipe"
fi

# opencode never runs this hook, so it can edit main whenever it likes and we
# cannot see which project it is in. Only you know whether it is working in this
# repo, so ask rather than guess.
#
# The claim is staked before asking, not after: the hook cannot see your answer.
# Answering no leaves a claim that expires in $STALE_MINUTES minutes, which only
# holds other Claude sessions off main — the safe direction to be wrong in.
if pgrep -x opencode >/dev/null 2>&1; then
  touch "$BEATS/$me" 2>/dev/null
  ask "opencode is running, and $rel is in the main checkout.

opencode does not run this hook, so it can edit the main checkout at any time
and this session cannot tell which project it is working in. If opencode is
working somewhere else, this edit is safe. If it is in this repo, you are about
to collide with it.

Allow the edit, or refuse and work in a worktree:

$recipe"
fi

# Sole editor — claim main and allow the edit.
touch "$BEATS/$me" 2>/dev/null
exit 0
