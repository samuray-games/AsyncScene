#!/bin/zsh
set -euo pipefail

APPLY=0
for arg in "$@"; do
  [[ "$arg" == "--apply" ]] && APPLY=1
done

SUBPATH="AsyncScene"
TS="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="../_backup_${SUBPATH}_$TS"

say(){ print -r -- "$*"; }
run(){
  if [[ "$APPLY" -eq 1 ]]; then
    say "+ $*"
    eval "$@"
  else
    say "[dry-run] $*"
  fi
}

say "PWD: $(pwd)"
run "git rev-parse --is-inside-work-tree >/dev/null"
TOP="$(git rev-parse --show-toplevel)"
say "Git toplevel: $TOP"
[[ "$TOP" == "$(pwd)" ]] || say "WARN: You are not at git repo root. Recommended: cd \"$TOP\""

say ""
say "Step 1) Detect whether '$SUBPATH' is a gitlink in HEAD"
LS="$(git ls-tree HEAD "$SUBPATH" 2>/dev/null || true)"
say "ls-tree: $LS"
if ! print -r -- "$LS" | grep -q '^160000 commit '; then
  say "ERROR: '$SUBPATH' is not a gitlink in HEAD. Aborting to avoid damage."
  say "If GitHub shows an arrow but ls-tree is not 160000, tell me the ls-tree output."
  exit 1
fi

say ""
say "Step 2) Backup current working tree folder (if exists) to $BACKUP_DIR"
if [[ -e "$SUBPATH" ]]; then
  run "rm -rf \"$BACKUP_DIR\""
  run "mkdir -p \"$BACKUP_DIR\""
  run "rsync -a --exclude '.git' -- \"$SUBPATH/\" \"$BACKUP_DIR/\" || true"
else
  say "No working tree folder '$SUBPATH' found (ok)."
fi

say ""
say "Step 3) Remove gitlink from index (this removes the submodule pointer entry)"
run "git rm -f --cached -- \"$SUBPATH\""

say ""
say "Step 4) Ensure '$SUBPATH' folder exists and is filled with real files"
# If backup has files, restore them into SUBPATH
if [[ "$APPLY" -eq 1 ]]; then
  rm -rf -- "$SUBPATH"
  mkdir -p -- "$SUBPATH"
  if [[ -d "$BACKUP_DIR" ]] && [[ -n "$(ls -A "$BACKUP_DIR" 2>/dev/null || true)" ]]; then
    rsync -a -- "$BACKUP_DIR/" "$SUBPATH/"
  else
    say "WARN: Backup is empty. If your game files are elsewhere, copy them into '$SUBPATH' now, then rerun: git add AsyncScene"
  fi
else
  say "[dry-run] rm -rf \"$SUBPATH\"; mkdir -p \"$SUBPATH\"; rsync from backup if non-empty"
fi

say ""
say "Step 5) If '$SUBPATH' contains its own .git (nested repo), remove it so files are committable"
if [[ -d "$SUBPATH/.git" ]]; then
  run "rm -rf -- \"$SUBPATH/.git\""
fi
if [[ -f "$SUBPATH/.git" ]]; then
  run "rm -f -- \"$SUBPATH/.git\""
fi

say ""
say "Step 6) Add real files to repo"
run "git add -- \"$SUBPATH\""

say ""
say "Step 7) Show status"
run "git status --porcelain=v1"

say ""
say "DONE."
say "If the status looks correct, commit and push:"
say "  git commit -m \"Replace AsyncScene gitlink with real files\""
say "  git push"
say ""
say "Backup (for safety): $BACKUP_DIR"
