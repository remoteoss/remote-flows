import '@testing-library/jest-dom/vitest';

// import { http, HttpResponse } from 'msw';
// import { setupServer } from 'msw/node';
// import { afterAll, afterEach, beforeAll } from 'vitest';

// const posts = {
//   data: [
//     {
//       cenas: 'renas',
//     },
//   ],
// };

// export const restHandlers = [
//   http.get('*/v1/cost-calculator/countries', () => {
//     return HttpResponse.json(posts);
//   }),
// ];

// const server = setupServer(...restHandlers);

// // Start server before all tests
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// // Close server after all tests
// afterAll(() => server.close());

// // Reset handlers after each test for test isolation
// afterEach(() => server.resetHandlers());
