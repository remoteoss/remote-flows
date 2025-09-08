/// <reference types="cypress" />

describe('annual gross salary', () => {
  beforeEach(() => {
    cy.visit(
      Cypress.env('BASE_URL') ||
        'http://localhost:3001?demo=with-premium-benefits-cost-calculator',
    );
  });

  it('shows the annual gross salary', () => {
    cy.get('#country').select('Argentina');
    cy.get('#currency').select('USD');
    cy.get('#salary_conversion').type('1000');
    cy.get('.submit-button').click();
    cy.contains(
      '[data-selector=annual-gross-salary-employer-amount]',
      '$1,000.00',
    );
  });
});
