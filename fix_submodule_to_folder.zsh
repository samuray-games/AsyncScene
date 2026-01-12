#!/bin/zsh
set -euo pipefail

APPLY=0
REPO_ROOT="$(pwd)"
SUBPATH="AsyncScene"

for arg in "$@"; do
  [[ "$arg" == "--apply" ]] && APPLY=1
done

say() { print -r -- "$*"; }
die() { say "ERROR: $*"; exit 1; }
run() {
  if [[ "$APPLY" -eq 1 ]]; then
    say "+ $*"
    eval "$@"
  else
    say "[dry-run] $*"
  fi
}

say "Repo: $REPO_ROOT"
run "git rev-parse --is-inside-work-tree >/dev/null"

if [[ ! -e "$SUBPATH" ]]; then
  die "Path '$SUBPATH' not found. Run this from repo root."
fi

if [[ ! -f ".gitmodules" ]]; then
  say "No .gitmodules found. This may not be a submodule. Aborting safely."
  exit 1
fi

# Check if AsyncScene is a submodule entry
if ! grep -qE '^\[submodule "AsyncScene"\]' .gitmodules; then
  say "No submodule entry [submodule \"AsyncScene\"] in .gitmodules."
  say "If the submodule has a different name, edit SUBPATH in this script."
  exit 1
fi

say ""
say "Step 0) Ensure submodule content exists locally (so we can commit it as normal files)."
run "git submodule update --init --recursive -- \"$SUBPATH\" || true"

say ""
say "Step 1) Backup current submodule working tree to a temp folder (safety net)."
TS="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR=\"../_backup_${SUBPATH}_$TS\"
run "rm -rf $BACKUP_DIR"
run "mkdir -p $BACKUP_DIR"
run "rsync -a --delete --exclude '.git' -- \"$SUBPATH/\" $BACKUP_DIR/"

say ""
say "Step 2) Deinit submodule (detaches submodule config)."
run "git submodule deinit -f -- \"$SUBPATH\" || true"

say ""
say "Step 3) Remove submodule from index (keeps working tree files)."
run "git rm -f --cached -- \"$SUBPATH\" || true"

say ""
say "Step 4) Remove .gitmodules entry and any submodule config residues."
if [[ "$APPLY" -eq 1 ]]; then
  # Remove the AsyncScene submodule block from .gitmodules
  perl -0777 -i -pe 's/\\n?\\[submodule \"AsyncScene\"\\][^\\[]*//s' .gitmodules
  # Clean empty file if needed
  if [[ ! -s .gitmodules ]]; then
    rm -f .gitmodules
  fi
else
  say "[dry-run] edit .gitmodules: remove block [submodule \"AsyncScene\"] ..."
fi

run "git config -f .git/config --remove-section submodule.$SUBPATH 2>/dev/null || true"
run "rm -rf .git/modules/$SUBPATH 2>/dev/null || true"

say ""
say "Step 5) Remove any gitlink file inside AsyncScene (submodule pointer file)."
# Sometimes submodule path becomes a file or contains a .git file pointing to modules
if [[ -f \"$SUBPATH/.git\" ]]; then
  run "rm -f -- \"$SUBPATH/.git\""
fi

say ""
say "Step 6) Add AsyncScene as normal files."
run "git add -- \"$SUBPATH\""

say ""
say "Step 7) Show status."
run "git status --porcelain=v1"

say ""
say "Done."
say "If this looks correct, run again with: ./fix_submodule_to_folder.zsh --apply"
say "Then commit and push."
say ""
say "Safety backup created at: ../_backup_${SUBPATH}_$TS (only if --apply ran rsync for real)."
