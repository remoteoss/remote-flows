/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />
//
Cypress.Commands.overwrite(
  'visit',
  (originalFn, url: any, options: any = {}, window) => {
    options.headers = {
      ...options?.headers,
      'x-vercel-protection-bypass': Cypress.env('VERCEL_BYPASS_TOKEN'),
      'x-vercel-set-bypass-cookie': 'true',
    };

    return originalFn(url, options, window);
  },
);

/* eslint-disable-next-line @typescript-eslint/no-namespace */
declare namespace Cypress {
  interface Chainable {
    visit(
      originalFn: CommandOriginalFn<any>,
      url: string,
      options: Partial<VisitOptions>,
    ): Chainable<Element>;
  }
}
