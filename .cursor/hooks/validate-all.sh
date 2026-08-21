#!/bin/bash
# Validate-all hook: runs when agent stops to validate code quality

set -euo pipefail

# Read hook input (though we don't need it for this hook)
input=$(cat)

# Only run validation if we're in a git repository and npm is available
if [ -d ".git" ] && command -v npm &> /dev/null; then
  echo "Running validation checks..." >&2
  
  # Run format check
  if npm run check-format > /tmp/format-check.log 2>&1; then
    format_status="✅ Format check passed"
  else
    format_status="❌ Format check failed (run 'npm run format')"
  fi
  
  # Run lint
  if npm run lint > /tmp/lint-check.log 2>&1; then
    lint_status="✅ Lint check passed"
  else
    lint_status="⚠️  Lint warnings (see 'npm run lint')"
  fi
  
  # Run type check
  if npm run type-check > /tmp/type-check.log 2>&1; then
    type_status="✅ Type check passed"
  else
    type_status="❌ Type check failed (see 'npm run type-check')"
  fi
  
<<<<<<< Updated upstream
  # Build summary message
  summary="Validation Results:\n$format_status\n$lint_status\n$type_status"
  
  # Return the validation summary as a followup message
  echo "{
    \"followup_message\": \"$summary\"
  }"
else
  # If not in git repo or npm not available, skip validation
  echo '{ "followup_message": "Skipped validation (not in git repo or npm not available)" }'
=======
  # Check if any validation failed
  has_failures=false
  if [[ "$format_status" == *"❌"* ]] || [[ "$type_status" == *"❌"* ]]; then
    has_failures=true
  fi
  
  if [ "$has_failures" = true ]; then
    # Build summary message only for failures
    summary="Validation Results:\n$format_status\n$lint_status\n$type_status"
    
    echo "{
      \"followup_message\": \"$summary\"
    }"
  else
    # All checks passed - return empty response to end the session
    echo "{}"
  fi
else
  # If not in git repo or npm not available, skip validation
  echo '{}'
>>>>>>> Stashed changes
fi

exit 0
