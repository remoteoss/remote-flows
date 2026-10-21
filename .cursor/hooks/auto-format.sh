#!/bin/bash
# Auto-format hook: runs after file edits to ensure consistent formatting

set -euo pipefail

# Read and discard hook input from stdin
cat > /dev/null

# Only run format if we're in a git repository and pnpm is available
if [ -d ".git" ] && command -v pnpm &> /dev/null; then
  # Run oxfmt to format the edited file and any others that need it
  # Suppress output to avoid noise in the agent's context
  pnpm run format > /dev/null 2>&1 || true
  
  # Return success to allow the edit to continue
  echo '{ "additional_context": "Auto-formatted code with oxfmt" }'
else
  # If not in git repo or pnpm not available, just pass through
  echo '{ "additional_context": "" }'
fi

exit 0
