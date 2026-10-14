#!/bin/zsh
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  bundled_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"
  if [ -x "$bundled_node/node" ]; then export PATH="$bundled_node:$PATH"; fi
fi
if ! command -v node >/dev/null 2>&1; then
  echo '请先安装 Node.js 22 LTS，再双击这个文件。'
  read -r reply
  exit 1
fi
if [ ! -d node_modules/next ]; then
  if command -v npm >/dev/null 2>&1; then npm install
  else
    bundled_pnpm="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm"
    if [ -x "$bundled_pnpm" ]; then "$bundled_pnpm" install --frozen-lockfile
    else echo '请安装 Node.js（含 npm）后重试。'; read -r reply; exit 1; fi
  fi
fi
if [ ! -f .next/BUILD_ID ]; then node node_modules/next/dist/bin/next build --webpack; fi
node scripts/start-local.mjs
