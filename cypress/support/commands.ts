// cypress/support/commands.ts
// Custom Cypress commands

declare global {
  namespace Cypress {
    interface Chainable {
      /** Login via UI form */
      loginUI(credential: string, password: string): Chainable<void>;
      /** Login via API (faster, skips UI) */
      loginAPI(credential: string, password: string): Chainable<void>;
      /** Clear cart state from localStorage */
      clearCart(): Chainable<void>;
    }
  }
}

// Login through the UI form
Cypress.Commands.add('loginUI', (credential: string, password: string) => {
  cy.visit('/login');
  cy.get('input[autocomplete="username"]').clear().type(credential);
  cy.get('input[autocomplete="current-password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
});

// Login via API — sets localStorage directly (faster for non-login tests)
Cypress.Commands.add('loginAPI', (credential: string, password: string) => {
  cy.request('POST', '/api/auth/login', { credential, password }).then((res) => {
    if (res.body.success) {
      window.localStorage.setItem('bloom_store_user', JSON.stringify(res.body.data));
    }
  });
});

// Clear cart from localStorage
Cypress.Commands.add('clearCart', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('bloom_cart');
  });
});

export {};
