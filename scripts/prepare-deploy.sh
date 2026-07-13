#!/usr/bin/env bash
set -euo pipefail

# prepare-deploy.sh
# Creates a clean production copy of the project for server deployment.
# Usage: bash prepare-deploy.sh [target-dir]
#   target-dir — where to create the copy (default: ../zokul-deploy)

TARGET="${1:-../zokul-deploy}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Copying project to $TARGET ..."

rsync -a --delete \
  --exclude='.git/' \
  --exclude='docs/' \
  --exclude='reports/' \
  --exclude='client/__tests__/' \
  --exclude='server/__tests__/' \
  --exclude='client/node_modules/' \
  --exclude='server/node_modules/' \
  --exclude='client/dist/' \
  --exclude='server/dist/' \
  --exclude='.github/' \
  --exclude='*.local.yml' \
  --exclude='tsconfig.d.ts' \
  --exclude='vite.config.d.ts' \
  --exclude='fixer-brain.md' \
  --exclude='server/uploads/' \
  --exclude='server/test-uploads/' \
  "$REPO_DIR/" "$TARGET/"

echo "==> Removing dev-only files..."
rm -f "$TARGET/docker-compose.local.yml"

echo "==> Initializing fresh git repo ..."
cd "$TARGET"
rm -rf .git
git init
git add -A

echo ""
echo "================================================"
echo "  Production copy ready at: $TARGET"
echo "  Size: $(du -sh "$TARGET" | cut -f1)"
echo ""
echo "  To commit and push to GitHub:"
echo "    cd $TARGET"
echo "    git config user.email 'your@email.com'"
echo "    git config user.name 'Your Name'"
echo "    git commit -m 'Production deploy'"
echo "    git remote add origin git@github.com:YOUR_USER/zokul-deploy.git"
echo "    git push -u origin master"
echo "================================================"
