/**
 * cypress/e2e/login.cy.ts
 * UI Tests — Modul Autentikasi (PRD §Modul 1)
 *
 * Test cases:
 *   TC-UI-01  Login berhasil dengan kredensial valid
 *   TC-UI-02  Login gagal — password salah
 *   TC-UI-03  Login gagal — field credential kosong
 *   TC-UI-04  Login gagal — field password kosong
 *   TC-UI-05  Login sebagai admin → tombol Panel Admin tampil
 *   TC-UI-06  Register tab muncul dan bisa beralih
 *   TC-UI-07  Register gagal — password tidak cocok
 *   TC-UI-08  Halaman login redirect ke home jika sudah login
 */

import { LoginPage } from '../pages/LoginPage';

const loginPage = new LoginPage();

describe('TC-UI: Modul Autentikasi', () => {
  beforeEach(() => {
    // Clear any existing session
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  // ── TC-UI-01: Login berhasil ─────────────────────────────────────────────
  it('TC-UI-01: Login berhasil dengan kredensial customer valid', () => {
    cy.fixture('testData').then((data) => {
      loginPage.visit();

      // Verifikasi halaman login tampil
      cy.url().should('include', '/login');
      cy.contains('Bloom Store').should('be.visible');

      // Isi form dan submit
      loginPage.login(data.validUser.credential, data.validUser.password);

      // Setelah login berhasil, tampilkan welcome screen
      cy.contains('Selamat datang').should('be.visible');
      cy.contains(data.validUser.name).should('be.visible');

      // Tidak ada tombol admin untuk customer biasa
      cy.contains('Buka Panel Admin').should('not.exist');
    });
  });

  // ── TC-UI-02: Login gagal — password salah ───────────────────────────────
  it('TC-UI-02: Login gagal dengan password yang salah', () => {
    cy.fixture('testData').then((data) => {
      loginPage.visit();
      loginPage.login(data.invalidUser.credential, data.invalidUser.password);

      // Pesan error harus tampil
      loginPage.getErrorMessage().should('be.visible');
      loginPage.getErrorMessage().should('contain.text', 'salah');

      // Masih di halaman login
      cy.url().should('include', '/login');
    });
  });

  // ── TC-UI-03: Login gagal — credential kosong ────────────────────────────
  it('TC-UI-03: Validasi field — credential wajib diisi', () => {
    loginPage.visit();
    // Klik submit tanpa isi form
    loginPage.getSubmitButton().click();

    // Pesan validasi harus muncul
    loginPage.getErrorMessage().should('be.visible');
    cy.url().should('include', '/login');
  });

  // ── TC-UI-04: Login gagal — password kosong ──────────────────────────────
  it('TC-UI-04: Validasi field — password wajib diisi', () => {
    loginPage.visit();
    loginPage.fillCredential('user');
    // Submit tanpa mengisi password
    loginPage.getSubmitButton().click();

    loginPage.getErrorMessage().should('be.visible');
    cy.url().should('include', '/login');
  });

  // ── TC-UI-05: Login admin → tombol panel admin tampil ────────────────────
  it('TC-UI-05: Login admin menampilkan tombol Buka Panel Admin', () => {
    cy.fixture('testData').then((data) => {
      loginPage.visit();
      loginPage.login(data.adminUser.credential, data.adminUser.password);

      // Tombol admin harus tampil setelah login
      loginPage.getAdminPanelButton().should('be.visible');
      cy.contains(data.adminUser.name).should('be.visible');
    });
  });

  // ── TC-UI-06: Register tab bisa dibuka ───────────────────────────────────
  it('TC-UI-06: Tab Daftar tampil dan bisa beralih dari Login', () => {
    loginPage.visit();

    // Klik tab register
    loginPage.getRegisterTab().click();

    // Form register harus muncul (ada input name dan email)
    loginPage.getNameInput().should('be.visible');
    loginPage.getEmailInput().should('be.visible');

    // Bisa kembali ke login
    loginPage.getLoginTab().click();
    loginPage.getCredentialInput().should('be.visible');
  });

  // ── TC-UI-07: Register gagal — password tidak cocok ─────────────────────
  it('TC-UI-07: Register gagal jika password konfirmasi tidak cocok', () => {
    loginPage.visit();
    loginPage.getRegisterTab().click();

    loginPage.getNameInput().type('Test User');
    loginPage.getEmailInput().type('test@example.com');
    cy.get('input[autocomplete="username"]').type('testuser123');
    cy.get('input[autocomplete="new-password"]').first().type('password123');
    cy.get('input[autocomplete="new-password"]').last().type('DIFFERENT_PASSWORD');

    cy.get('button[type="submit"]').click();

    // Pesan error konfirmasi
    cy.contains('tidak cocok').should('be.visible');
  });

  // ── TC-UI-08: Halaman login redirect jika sudah login ───────────────────
  it('TC-UI-08: Redirect ke home jika user sudah login', () => {
    cy.fixture('testData').then((data) => {
      // Set localStorage sebagai already logged in
      cy.window().then((win) => {
        const user = {
          id: 2, name: data.validUser.name,
          username: data.validUser.credential,
          email: 'user@bloom.com', role: 'customer'
        };
        win.localStorage.setItem('bloom_store_user', JSON.stringify(user));
      });

      // Coba buka halaman login
      loginPage.visit();

      // Harus redirect ke home
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });
  });
});
