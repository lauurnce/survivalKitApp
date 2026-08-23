#!/bin/bash
# Refuse edits inside the main checkout. Parallel sessions that share it fight
# over HEAD and the index; every session belongs in its own worktree.
# See docs/WORKTREES.md. Wired up as a PreToolUse hook in .claude/settings.json.

PATH=/usr/bin:/bin:/usr/sbin:/sbin:$PATH

MAIN="/Users/lauurnce/projects/survivalKitApp"

file=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$file" ] && exit 0

# Relative paths resolve against the session's working directory
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
# bad hook locks every session out of the file needed to fix it.
case "$abs" in
  "$MAIN"/.claude/*) exit 0 ;;
esac

rel="${abs#"$MAIN"/}"

reason="$rel is in the main checkout, which is read-only for feature work.
Parallel sessions sharing it fight over HEAD and the git index.

Work in a worktree instead:

  git -C $MAIN worktree add ~/projects/survivalKitApp-<track> -b <type>/<description> origin/main
  cd ~/projects/survivalKitApp-<track>
  ln -s $MAIN/.env.local .env.local
  ln -s $MAIN/node_modules node_modules

Then claim your files in ~/projects/.survivalkit-claims.md before editing.
Full procedure: docs/WORKTREES.md.

The main checkout still accepts reads, merges, and pushes — just not edits."

jq -n --arg r "$reason" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: $r
  }
}'
