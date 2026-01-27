# MSW Auto Mock Integration Guide

## Overview

This guide provides a plan for integrating `msw-auto-mock` into the remote-flows project. MSW Auto Mock automatically generates mock data from your OpenAPI specification, eliminating the need to manually write MSW response resolvers.

## Current Project Setup

- **MSW Version**: 2.12.2 (already installed)
- **OpenAPI Source**: `https://gateway.remote.com/v1/docs/openapi.json`
- **Testing Framework**: Vitest
- **Current OpenAPI Client**: `@hey-api/openapi-ts`

## Benefits

1. **Automatic Mock Generation**: Generate mocks directly from your OpenAPI spec
2. **Consistency**: Mocks stay in sync with your API schema
3. **Time Savings**: No need to manually write mock handlers for each endpoint
4. **Testing Support**: Easily mock API responses for unit and integration tests
5. **Development Experience**: Work with realistic mock data during development

## Implementation Plan

### Phase 1: Installation and Setup

#### Step 1: Install Dependencies

```bash
npm install -D msw-auto-mock @faker-js/faker
```

**Required versions:**
- `@faker-js/faker` >= 8
- `msw` >= 2 (already satisfied)

#### Step 2: Generate Mock Handlers

Create a script in `package.json` to generate mocks:

```json
{
  "scripts": {
    "mock:generate": "npx msw-auto-mock https://gateway.remote.com/v1/docs/openapi.json -o ./src/mocks",
    "mock:dev": "npm run mock:generate -- --output-type ts"
  }
}
```

**CLI Options to Consider:**
- `-o, --output`: Output directory (suggested: `./src/mocks`)
- `--output-type`: `ts` for TypeScript or `js` for JavaScript
- `--base-url`: Override base URL if needed
- `--max-array-length`: Control array length in responses (default: 20)
- `--include`: Filter endpoints by keyword
- `--exclude`: Exclude specific endpoints

### Phase 2: Project Structure

After generation, your project will have:

```
src/
├── mocks/
│   ├── browser.ts       # Browser MSW worker
│   ├── node.ts          # Node MSW server (for tests)
│   ├── handlers.ts      # Auto-generated handlers
│   └── [other generated files]
```

### Phase 3: Integration Points

#### A. Development Environment

**For Browser/Example App** (`example/src/main.tsx` or similar):

```typescript
import { worker } from '@/mocks/browser';

if (import.meta.env.DEV) {
  await worker.start({
    onUnhandledRequest: 'warn',
  });
}
```

#### B. Testing Environment

**Update `vitest-setup.ts`:**

```typescript
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './src/mocks/node';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

#### C. Specific Test Cases

Override generated mocks when needed:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/node';

test('handles API error', async () => {
  server.use(
    http.get('/v1/some-endpoint', () => {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    })
  );

  // Your test code
});
```

### Phase 4: Configuration Options

#### Basic Configuration

Create `.msw-auto-mock.json` (optional):

```json
{
  "input": "https://gateway.remote.com/v1/docs/openapi.json",
  "output": "./src/mocks",
  "outputType": "ts",
  "maxArrayLength": 10,
  "baseUrl": "https://gateway.remote.com"
}
```

#### AI-Enhanced Mocking (Optional)

For more realistic mock data, configure AI support in `package.json`:

```json
{
  "msw-auto-mock": {
    "ai": {
      "enable": true,
      "provider": "anthropic",
      "anthropic": {
        "apiKey": "process.env.ANTHROPIC_API_KEY",
        "model": "claude-3-5-sonnet-20241022"
      }
    }
  }
}
```

**Supported AI Providers:**
- OpenAI
- Azure OpenAI
- Anthropic (Claude)

**Security Note**: Store API keys in `.env` file:
```bash
ANTHROPIC_API_KEY=your-key-here
```

### Phase 5: Workflow Integration

#### Update Package Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "mock:generate": "msw-auto-mock https://gateway.remote.com/v1/docs/openapi.json -o ./src/mocks",
    "mock:watch": "npm run mock:generate -- --watch",
    "pretest": "npm run mock:generate",
    "dev:with-mocks": "npm run mock:generate && npm run dev"
  }
}
```

#### Git Considerations

**Option A**: Commit generated mocks
- Add `src/mocks/` to version control
- Regenerate when OpenAPI spec changes
- ✅ Pros: Consistent across team
- ❌ Cons: Larger diffs

**Option B**: Ignore generated mocks
- Add to `.gitignore`:
  ```
  src/mocks/
  ```
- Generate on install: Add to `postinstall` script
- ✅ Pros: Cleaner git history
- ❌ Cons: Must regenerate locally

### Phase 6: Advanced Features

#### Selective Endpoint Mocking

Mock only specific endpoints:

```bash
npx msw-auto-mock https://gateway.remote.com/v1/docs/openapi.json \
  --include "users,contracts" \
  -o ./src/mocks
```

#### Custom Status Codes

Generate specific HTTP responses:

```bash
npx msw-auto-mock https://gateway.remote.com/v1/docs/openapi.json \
  --status 201 \
  -o ./src/mocks
```

#### Multiple Environments

Create different mock configurations:

```json
{
  "scripts": {
    "mock:dev": "msw-auto-mock <spec> -o ./src/mocks/dev",
    "mock:test": "msw-auto-mock <spec> -o ./src/mocks/test --status 200",
    "mock:error": "msw-auto-mock <spec> -o ./src/mocks/error --status 500"
  }
}
```

## Testing Strategy

### Unit Tests

Mock specific endpoints per test:

```typescript
import { server } from '@/mocks/node';
import { http, HttpResponse } from 'msw';

describe('MyComponent', () => {
  it('handles successful response', async () => {
    server.use(
      http.get('/v1/endpoint', () => {
        return HttpResponse.json({ data: 'mock' });
      })
    );
    // Test implementation
  });
});
```

### Integration Tests

Use generated mocks as default, override when needed:

```typescript
// Default mocks work automatically
test('loads user data', async () => {
  // MSW auto-mock handles the response
  render(<UserProfile />);
  // Assertions
});

// Override for edge cases
test('handles empty user list', async () => {
  server.use(
    http.get('/v1/users', () => {
      return HttpResponse.json({ users: [] });
    })
  );
  // Test implementation
});
```

## Migration Path

### From Manual MSW Handlers

1. **Audit Current Mocks**: Identify custom logic in existing handlers
2. **Generate Auto-Mocks**: Run msw-auto-mock to generate handlers
3. **Preserve Custom Logic**: Move custom response logic to test-specific overrides
4. **Update Imports**: Point to new generated handlers
5. **Test Coverage**: Ensure all tests still pass

### Incremental Adoption

1. Generate mocks in parallel directory: `src/mocks-auto/`
2. Gradually migrate tests from manual to auto-generated mocks
3. Keep critical custom mocks as overrides
4. Remove old mocks directory once migration is complete

## Maintenance

### Keeping Mocks Updated

When OpenAPI spec changes:

```bash
npm run mock:generate
```

### CI/CD Integration

Add to GitHub Actions (`.github/workflows/`):

```yaml
- name: Generate API Mocks
  run: npm run mock:generate

- name: Run Tests with Mocks
  run: npm test
```

### Monitoring Mock Freshness

Create a script to compare OpenAPI spec versions:

```typescript
// scripts/check-mock-freshness.ts
// Compare last generation time vs. OpenAPI spec update time
```

## Troubleshooting

### Common Issues

1. **CORS Errors in Browser**
   - Ensure `worker.start()` is called before API requests
   - Check MSW service worker registration

2. **Mock Data Doesn't Match Schema**
   - Regenerate mocks: `npm run mock:generate`
   - Verify OpenAPI spec is valid

3. **Tests Failing with MSW**
   - Check `vitest-setup.ts` configuration
   - Ensure server is started before tests
   - Use `server.resetHandlers()` in `afterEach`

4. **Type Errors**
   - Regenerate with `--output-type ts`
   - Ensure `@faker-js/faker` types are installed

## Best Practices

1. **Regenerate Regularly**: Keep mocks in sync with OpenAPI spec
2. **Override Sparingly**: Only override when testing specific scenarios
3. **Use Real Data Shapes**: Let auto-generated mocks provide realistic structures
4. **Test Error States**: Override for 4xx/5xx responses in error tests
5. **Document Custom Overrides**: Comment why specific mocks are overridden
6. **Version Control**: Decide team convention on committing generated files

## Next Steps

1. Install dependencies: `npm install -D msw-auto-mock @faker-js/faker`
2. Generate initial mocks: `npm run mock:generate`
3. Integrate into development environment
4. Update test setup in `vitest-setup.ts`
5. Test with example app
6. Migrate existing manual mocks incrementally

## Resources

- [MSW Auto Mock GitHub](https://github.com/zoubingwu/msw-auto-mock)
- [MSW Documentation](https://mswjs.io/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Faker.js Documentation](https://fakerjs.dev/)

## Questions to Consider

Before implementation, decide:

1. Should generated mocks be committed to git?
2. Do we need AI-enhanced mocking for better data quality?
3. Which endpoints need custom mock logic?
4. Should we generate mocks in CI or locally?
5. Do we want separate mock configurations for dev/test/error scenarios?
