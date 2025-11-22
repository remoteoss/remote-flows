# Development Guide

This guide is for internal developers working on the `@remoteoss/remote-flows` package.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Bundle Size Management](#bundle-size-management)
- [CI/CD](#cicd)
- [Release Process](#release-process)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/remoteoss/remote-flows.git
cd remote-flows
```

2. Install dependencies:
```bash
npm install
```

3. Link the package for local development:
```bash
npm link
npm run dev
```

4. Set up the example app:
```bash
cd example
npm install
npm link @remoteoss/remote-flows
```

5. Create `.env` file in the example directory:
```env
VITE_CLIENT_ID=your_client_id
VITE_CLIENT_SECRET=your_client_secret
VITE_REFRESH_TOKEN=your_refresh_token
VITE_REMOTE_GATEWAY=partners # for sandbox
# VITE_REMOTE_GATEWAY=production # for production
```

6. Start the example app:
```bash
npm run dev
```

The example app will be available at `http://localhost:3001`.

## Development Workflow

### Available Scripts

- `npm run dev` - Build the package in watch mode
- `npm run build` - Build the package for production
- `npm test` - Run tests
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run size` - Analyze bundle size
- `npm run size:check` - Check if bundle size is within limits

### Code Structure

```
remote-flows/
├── src/
│   ├── flows/           # Flow components (CostCalculator, Termination, etc.)
│   ├── components/      # Shared components
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
├── example/             # Example application
├── scripts/             # Build and analysis scripts
└── .github/             # CI/CD workflows
```

## Testing

Run the test suite:
```bash
npm test
```

Run type checking:
```bash
npm run type-check
```

## Bundle Size Management

We have automated bundle size tracking to ensure the package stays performant.

### Size Limits

Size limits are defined in `.sizelimit.json`:

```json
{
  "limits": {
    "total": 524288,           // 512 KB (raw)
    "totalGzip": 131072,       // 128 KB (gzip)
    "css": 20480,              // 20 KB (raw)
    "cssGzip": 10240,          // 10 KB (gzip)
    "maxChunkSize": 262144,    // 256 KB (raw)
    "maxChunkSizeGzip": 65536  // 64 KB (gzip)
  }
}
```

### Analyzing Bundle Size

To analyze the current bundle size:
```bash
npm run size
```

This will output:
- Total bundle size (raw and gzipped)
- JavaScript breakdown
- CSS breakdown
- Top 10 largest files
- JSON report in `out/bundle-analysis.json`

### Checking Size Limits

To verify the bundle is within limits:
```bash
npm run size:check
```

This command will fail if any limits are exceeded.

### Size Comparison

The comparison script compares two bundle analyses:
```bash
npx tsx scripts/compare-sizes.ts out/base-bundle.json out/current-bundle.json
```

This generates a detailed markdown report showing:
- Size changes (current vs previous)
- Percentage changes
- Limit violations
- File-by-file comparison

## CI/CD

### Workflows

#### CI Workflow (`.github/workflows/ci.yml`)
Runs on every push and pull request:
- Type checking
- Tests
- Build
- Format check

#### Size Check Workflow (`.github/workflows/size-check.yml`)
Runs on pull requests to `main`:
- Analyzes bundle size for both PR and base branch
- Posts comparison report as PR comment
- Fails if size limits are exceeded
- Shows current size when comparison isn't available (e.g., when adding new features)

#### Release Workflow (`.github/workflows/release.yml`)
Runs when a release PR is merged:
- Publishes package to npm
- Creates GitHub release

### Bundle Size Reporting

When you open a PR, the size-check workflow will automatically:

1. Build and analyze your PR's bundle
2. Build and analyze the base branch bundle
3. Compare the two and post a detailed report

The report includes:
- Size changes with percentage differences
- Current size vs limits
- Violations (if any)
- Largest files with changes
- Full file breakdown in collapsible section

If the comparison script doesn't exist in the base branch (e.g., when adding this feature), it will show the current PR's bundle size instead.

## Release Process

We use an automated release workflow. See the main [README.md](./README.md#release-process) for details.

### Quick Reference

1. Install gh CLI: `brew install gh`
2. Authenticate: `gh auth login`
3. Run release script: `npm run release`
4. Review and merge the PR
5. GitHub will automatically publish to npm

## Tips & Best Practices

### Keep Bundle Size Small

- Tree-shake unused code
- Lazy load heavy components
- Monitor the size report on every PR
- Consider alternatives before adding large dependencies

### Code Quality

- Run `npm run format` before committing
- Ensure `npm run type-check` passes
- Write tests for new features
- Update flow-specific READMEs when changing APIs

### Working with Flows

Each flow has its own README:
- [Cost Calculator](./src/flows/CostCalculator/README.md)
- [Termination](./src/flows/Termination/README.md)
- [Contract Amendment](./src/flows/ContractAmendment/README.md)
- [Onboarding](./src/flows/Onboarding/README.md)

When modifying a flow, update its README accordingly.

## Troubleshooting

### Bundle size check failing in CI

1. Run `npm run size:check` locally to see violations
2. Run `npm run size` to see detailed breakdown
3. Identify large files or new dependencies
4. Optimize or split code as needed
5. If the increase is justified, update limits in `.sizelimit.json`

### Example app not updating

1. Ensure you've linked the package: `npm link @remoteoss/remote-flows`
2. Restart both the package dev server and example dev server
3. Check for build errors in both terminals

### Type errors in development

1. Run `npm run type-check` to see all errors
2. Ensure dependencies are up to date
3. Check for TypeScript version compatibility
