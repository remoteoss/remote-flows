# Bundle Size Badge Setup Guide

This guide explains how to set up the automatic bundle size badge for the README.

## Overview

The bundle size badge system:

- Automatically analyzes bundle size on every push to `main`
- Stores historical size data in a GitHub Gist
- Updates a shields.io badge in the README
- Tracks size trends over time

## Prerequisites

1. A GitHub account with access to create Gists
2. Repository access to configure secrets

## Setup Steps

### 1. Create a GitHub Gist

1. Go to https://gist.github.com/
2. Create a **public** gist with:
   - **Filename**: `bundle-size.json`
   - **Content**: (Initial placeholder data)
   ```json
   {
     "schemaVersion": 1,
     "label": "bundle size",
     "message": "calculating...",
     "color": "lightgrey"
   }
   ```
3. Click "Create public gist"
4. Copy the Gist ID from the URL
   - Example URL: `https://gist.github.com/username/abc123def456`
   - Gist ID: `abc123def456`

### 2. Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name: `Bundle Size Badge Update`
4. Select scopes:
   - ✅ `gist` - Create and update gists
5. Click "Generate token"
6. **Copy the token immediately** (you won't be able to see it again!)

### 3. Configure Repository Secrets

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add two secrets:

   **Secret 1: BUNDLE_SIZE_GIST_ID**
   - Name: `BUNDLE_SIZE_GIST_ID`
   - Value: The Gist ID from step 1 (e.g., `abc123def456`)

   **Secret 2: GIST_TOKEN**
   - Name: `GIST_TOKEN`
   - Value: The personal access token from step 2

### 4. Update README Badge URL

1. Open `README.md`
2. Find the badge line:
   ```markdown
   [![Bundle Size](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/remoteoss/GIST_ID/raw/bundle-size.json)](https://github.com/remoteoss/remote-flows/actions/workflows/update-badge.yml)
   ```
3. Replace `GIST_ID` with your actual Gist ID
4. Replace `remoteoss` with your GitHub username or organization name

   Example:

   ```markdown
   [![Bundle Size](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/acme/abc123def456/raw/bundle-size.json)](https://github.com/acme/remote-flows/actions/workflows/update-badge.yml)
   ```

### 5. Test the Setup

1. Make a change to the code and push to `main`:

   ```bash
   git add .
   git commit -m "Test badge setup"
   git push origin main
   ```

2. Check the GitHub Actions workflow:
   - Go to Actions → "Update Bundle Size Badge"
   - Wait for the workflow to complete

3. Verify the Gist was updated:
   - Visit your Gist URL
   - The `bundle-size.json` file should now contain real data

4. Check the README:
   - The badge should now show the actual bundle size
   - It may take a few moments for shields.io to update its cache

## Badge Colors

The badge color automatically changes based on size:

- 🟢 **Green** (brightgreen): < 120 KB gzipped
- 🟡 **Yellow**: 120-150 KB gzipped
- 🔴 **Red**: > 150 KB gzipped

## Data Structure

The Gist stores data in this format:

```json
{
  "schemaVersion": 1,
  "label": "bundle size",
  "message": "142 KB",
  "color": "green"
}
```

The `history` array keeps the last 50 entries for trend analysis.

## Manual Testing

You can test the badge generation locally:

```bash
# Build the project
npm run build

# Analyze bundle size
npm run size -- --output out/bundle-analysis.json

# Generate badge data
npm run size:badge --silent out/bundle-analysis.json > out/size-data.json

# View the generated data
cat out/size-data.json
```

## Troubleshooting

### Badge shows "invalid"

- Check that the Gist is public (not secret)
- Verify the Gist URL in README is correct
- Check that the Gist contains valid JSON

### Badge shows "calculating..."

- The workflow hasn't run yet or failed
- Check Actions → "Update Bundle Size Badge" for errors
- Verify the secrets are configured correctly

### Workflow fails with 404 on Gist update

- Check that `BUNDLE_SIZE_GIST_ID` is correct
- Verify that `GIST_TOKEN` has the `gist` scope
- Ensure the token hasn't expired

### Badge doesn't update after push

- Clear shields.io cache by visiting:
  `https://img.shields.io/endpoint?url=YOUR_GIST_URL&bust=TIMESTAMP`
- Wait a few minutes for GitHub/shields.io caches to clear

## Advanced Configuration

### Customizing Badge Thresholds

Edit `scripts/update-size-badge.ts` and modify the `getBadgeColor()` function:

```typescript
function getBadgeColor(gzipSize: number): string {
  const KB_120 = 120 * 1024;
  const KB_150 = 150 * 1024;

  if (gzipSize < KB_120) {
    return 'brightgreen';
  } else if (gzipSize <= KB_150) {
    return 'yellow';
  } else {
    return 'red';
  }
}
```

### Customizing History Length

Edit `scripts/update-size-badge.ts` and change the slice value:

```typescript
// Keep only last 100 entries instead of 50
const trimmedHistory = history.slice(-100);
```

## Maintenance

### Rotating the Personal Access Token

If you need to rotate the token:

1. Create a new token with `gist` scope
2. Update the `GIST_TOKEN` secret in repository settings
3. The old token can be deleted

### Migrating to a New Gist

1. Create a new Gist (follow step 1 above)
2. Update `BUNDLE_SIZE_GIST_ID` secret
3. Update the badge URL in README
4. Delete the old Gist if no longer needed

## Resources

- [GitHub Gists Documentation](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Shields.io Endpoint Badges](https://shields.io/endpoint)
- [Build Size Guardrails Plan](../BUILD_SIZE_GUARDRAILS_PLAN.md)
