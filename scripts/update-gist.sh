#!/bin/bash

# Script to manually update the GitHub Gist with bundle size data
# Usage: ./scripts/update-gist.sh <GIST_TOKEN>

set -e

GIST_ID="b8884fb20051d4c0095a29569d51e34e"
GIST_TOKEN="${1:-$GIST_TOKEN}"

if [ -z "$GIST_TOKEN" ]; then
  echo "Error: GIST_TOKEN not provided"
  echo "Usage: ./scripts/update-gist.sh <GIST_TOKEN>"
  echo "Or set GIST_TOKEN environment variable"
  exit 1
fi

# Ensure we have the badge data
if [ ! -f "out/size-data.json" ]; then
  echo "Generating badge data..."
  npm run build
  npm run size -- --output out/bundle-analysis.json
  npm run size:badge --silent out/bundle-analysis.json > out/size-data.json
fi

# Read the badge data (shields.io endpoint format)
BADGE_DATA=$(cat out/size-data.json)

echo "Updating gist $GIST_ID..."
echo "Badge data:"
echo "$BADGE_DATA" | jq '.'

# Update the gist using GitHub API
RESPONSE=$(curl -s -X PATCH \
  -H "Authorization: token $GIST_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/gists/$GIST_ID" \
  -d "{
    \"files\": {
      \"remote-flows-bundle-size.json\": {
        \"content\": $(echo "$BADGE_DATA" | jq -Rs .)
      }
    }
  }")

# Check if update was successful
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo "✓ Successfully updated gist!"
  echo "View at: https://gist.github.com/remotecom/$GIST_ID"
else
  echo "✗ Failed to update gist"
  echo "Response:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi
