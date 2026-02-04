import { setupServer } from 'msw/node';
import { defaultHandlers } from '@/src/tests/handlers';

export const server = setupServer(...defaultHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers());
