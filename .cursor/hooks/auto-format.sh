#!/bin/bash
# Auto-format hook: runs after file edits to ensure consistent formatting

set -euo pipefail

<<<<<<< Updated upstream
# Read hook input from stdin
input=$(cat)

# Extract the file path from the hook input
file_path=$(echo "$input" | jq -r '.path // empty')
=======
# Read and discard hook input from stdin
cat > /dev/null
>>>>>>> Stashed changes

# Only run format if we're in a git repository and npm is available
if [ -d ".git" ] && command -v npm &> /dev/null; then
  # Run oxfmt to format the edited file and any others that need it
  # Suppress output to avoid noise in the agent's context
  npm run format > /dev/null 2>&1 || true
  
  # Return success to allow the edit to continue
  echo '{ "additional_context": "Auto-formatted code with oxfmt" }'
else
  # If not in git repo or npm not available, just pass through
  echo '{ "additional_context": "" }'
fi

exit 0
