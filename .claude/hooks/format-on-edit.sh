#!/bin/bash
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input.file_path||"")}catch(e){}})')
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css) ;;
  *) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
pnpm exec oxfmt "$file" >/dev/null 2>&1
exit 0
