#!/bin/bash
command -v node >/dev/null || exit 0
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input.file_path||"")}catch(e){}})')
[ -f "$file" ] || exit 0
root=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null) || exit 0
[ -f "$root/.oxfmtrc.json" ] && [ -x "$root/node_modules/.bin/oxfmt" ] || exit 0
(cd "$root" && node_modules/.bin/oxfmt -- "$file") >/dev/null 2>&1
exit 0
