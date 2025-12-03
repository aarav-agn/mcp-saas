#!/bin/bash

echo "=== CLEAN REPO STARTER ==="

# 1. Backup existing project
echo "[1/7] Creating full project backup..."
timestamp=$(date +"%Y%m%d_%H%M%S")
backup_dir="../project_backup_$timestamp"
mkdir -p "$backup_dir"
cp -r . "$backup_dir"
echo "Backup created at: $backup_dir"

# 2. Remove old git history
echo "[2/7] Removing old .git directory..."
rm -rf .git

# 3. Create a proper .gitignore
echo "[3/7] Creating .gitignore..."
cat <<EOF > .gitignore
# Node / JS
node_modules/
**/node_modules/
.npm/
dist/
build/
.next/
out/
.cache/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
*.log

# Env
.env
*.env
.env.*
.env.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
EOF

echo ".gitignore created."

# 4. Re-initialize Git
echo "[4/7] Re-initializing Git..."
git init

# 5. Stage only clean files
echo "[5/7] Staging files..."
git add .

# 6. Fresh initial commit
echo "[6/7] Creating clean commit..."
git commit -m "chore: clean initial commit (node_modules removed, history reset)"

# 7. Configure remote and push
echo "[7/7] Setting remote & pushing..."
read -p "Enter your GitHub HTTPS repo URL: " repo_url
git remote add origin "$repo_url"

echo "Do you want to force-push (recommended for rewriting history)? (y/n)"
read forcepush

if [ "$forcepush" = "y" ]; then
    git branch -M main
    git push -f origin main
else
    echo "Skipping push. You can push manually using:"
    echo "git push origin main"
fi

echo "=== CLEAN REPO PROCESS COMPLETE ==="
