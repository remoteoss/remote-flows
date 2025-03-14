import '@testing-library/jest-dom/vitest';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Mock PointerEvent to enable testing interactions with the select component
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

const countries = {
  data: [
    {
      code: 'POL',
      name: 'Poland',
      currency: {
        code: 'PLN',
        name: 'Polish Zloty',
        symbol: 'zł',
        slug: 'pln-33441af1-a601-4a22-8f52-1ec090f10b4a',
      },
      region_slug: 'a23370e3-b280-468f-b54c-25dd79b5690b',
      child_regions: [],
      has_additional_fields: false,
      availability: 'active',
      original_country_slug: 'poland-d3f6d510-2fdf-4b9d-8520-2b581a862411',
    },
  ],
};

const currencies = {
  data: {
    company_currencies: [
      {
        code: 'USD',
        slug: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
      },
    ],
  },
};

export const restHandlers = [
  http.get('*/v1/cost-calculator/countries', () => {
    return HttpResponse.json(countries);
  }),
  http.get('*/v1/company-currencies', () => {
    return HttpResponse.json(currencies);
  }),
  http.get('*/v1/cost-calculator/regions/*/fields', () => {
    return HttpResponse.json({
      data: {
        version: 7,
        schema: {
          additionalProperties: false,
          properties: {},
          required: [],
          type: 'object',
        },
      },
    });
  }),
  http.post('*/v1/cost-calculator/estimation', () => {
    return HttpResponse.json({
      data: {
        employments: [],
      },
    });
  }),
];

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers());
