/**
 * cypress/pages/LoginPage.ts
 * Page Object Model — Halaman Login (/login)
 */
export class LoginPage {
  // ── Navigasi ──────────────────────────────────────────────────────────────
  visit() {
    cy.visit('/login');
    return this;
  }

  // ── Elemen form ───────────────────────────────────────────────────────────
  getCredentialInput() {
    return cy.get('input[autocomplete="username"]');
  }
  getPasswordInput() {
    return cy.get('input[autocomplete="current-password"]');
  }
  getSubmitButton() {
    return cy.get('button[type="submit"]');
  }
  getRegisterTab() {
    return cy.contains('button', 'Daftar sekarang');
  }
  getLoginTab() {
    return cy.contains('button', 'Masuk di sini');
  }

  // ── Form register ──────────────────────────────────────────────────────────
  getNameInput() {
    return cy.get('input[autocomplete="name"]');
  }
  getEmailInput() {
    return cy.get('input[autocomplete="email"]');
  }
  getPasswordConfirmInput() {
    return cy.get('input[autocomplete="new-password"]').last();
  }

  // ── Pesan & state ──────────────────────────────────────────────────────────
  getErrorMessage() {
    return cy.get('.text-bloom-danger').first();
  }
  getAdminPanelButton() {
    return cy.contains('a', 'Buka Panel Admin');
  }
  getWelcomeText() {
    return cy.contains('Selamat datang');
  }

  // ── Aksi ──────────────────────────────────────────────────────────────────
  fillCredential(val: string) {
    this.getCredentialInput().clear().type(val);
    return this;
  }
  fillPassword(val: string) {
    this.getPasswordInput().clear().type(val);
    return this;
  }
  submit() {
    this.getSubmitButton().click();
    return this;
  }
  login(credential: string, password: string) {
    return this.fillCredential(credential).fillPassword(password).submit();
  }
}
