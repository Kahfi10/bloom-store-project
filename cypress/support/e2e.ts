// cypress/support/e2e.ts
// Global support file — runs before every test

// Import custom commands
import './commands';

// Suppress uncaught exceptions from Next.js HMR
Cypress.on('uncaught:exception', () => false);
