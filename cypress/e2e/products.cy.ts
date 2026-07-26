/**
 * cypress/e2e/products.cy.ts
 * UI Tests — Modul Daftar Produk & Keranjang (PRD §Modul 2 & 3)
 *
 * Test cases:
 *   TC-UI-09  Produk tampil di halaman utama
 *   TC-UI-10  Klik produk card → navigasi ke product detail
 *   TC-UI-11  Tambah produk ke keranjang → badge update
 *   TC-UI-12  Product detail page menampilkan galeri foto
 *   TC-UI-13  Keranjang kosong menampilkan empty state
 *   TC-UI-14  Keranjang tampil setelah produk ditambahkan
 *   TC-UI-15  Checkout tanpa login → redirect ke login
 *   TC-UI-16  Qty stepper tidak bisa di bawah 1
 */

import { ProductsPage } from '../pages/ProductsPage';
import { CartPage }     from '../pages/CartPage';

const productsPage = new ProductsPage();
const cartPage     = new CartPage();

describe('TC-UI: Modul Produk & Keranjang', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  // ── TC-UI-09: Produk tampil di homepage ──────────────────────────────────
  it('TC-UI-09: Daftar produk tampil di halaman utama', () => {
    productsPage.visit();

    // Scroll ke section produk
    cy.get('#produk').scrollIntoView();

    // Minimal 1 product card harus tampil
    productsPage.getProductCards().should('have.length.at.least', 1);

    // Produk pertama menampilkan nama, harga, tombol tambah
    productsPage.getFirstProductCard().within(() => {
      cy.get('h3').should('be.visible');
      cy.contains('Rp').should('be.visible');
      cy.contains('Tambah').should('be.visible');
    });
  });

  // ── TC-UI-10: Klik produk → product detail ───────────────────────────────
  it('TC-UI-10: Klik produk card navigasi ke halaman detail produk', () => {
    cy.fixture('testData').then((data) => {
      productsPage.visit();
      cy.get('#produk').scrollIntoView();

      // Klik link pada card (area gambar/nama)
      cy.contains('article', data.products.first.name)
        .find('a').first()
        .click({ force: true });

      // URL harus berubah ke /products/[slug]
      cy.url().should('include', `/products/${data.products.first.slug}`);

      // Halaman detail harus menampilkan nama produk
      cy.contains('h1', data.products.first.name).should('be.visible');
    });
  });

  // ── TC-UI-11: Tambah ke keranjang → badge update ─────────────────────────
  it('TC-UI-11: Tambah produk ke keranjang memperbarui badge counter', () => {
    cy.fixture('testData').then((data) => {
      productsPage.visit();
      cy.get('#produk').scrollIntoView();

      // Tambah produk pertama
      productsPage.addToCart(data.products.first.name);

      // Toast harus tampil
      cy.contains('ditambahkan ke keranjang', { timeout: 5000 }).should('be.visible');

      // Badge di navbar harus menampilkan angka
      cy.get('header').find('a[href="/cart"]').within(() => {
        cy.get('span').should('be.visible').and('not.have.text', '');
      });
    });
  });

  // ── TC-UI-12: Product detail menampilkan galeri ──────────────────────────
  it('TC-UI-12: Halaman detail produk menampilkan galeri foto dan informasi', () => {
    cy.fixture('testData').then((data) => {
      cy.visit(`/products/${data.products.first.slug}`);

      // Judul produk
      cy.contains('h1', data.products.first.name).should('be.visible');

      // Galeri foto (gambar utama)
      cy.get('img[alt*="foto"]').should('exist');

      // Harga
      cy.contains(data.products.first.price).should('be.visible');

      // Tombol add to cart
      cy.contains('Tambah ke Keranjang').should('be.visible');

      // Breadcrumb
      cy.contains('Produk').should('be.visible');
    });
  });

  // ── TC-UI-13: Keranjang kosong → empty state ─────────────────────────────
  it('TC-UI-13: Keranjang kosong menampilkan pesan empty state', () => {
    cartPage.visit();

    // Empty state harus tampil
    cartPage.getEmptyState().should('be.visible');

    // Tidak ada item
    cy.contains('Rp').should('not.exist');
  });

  // ── TC-UI-14: Keranjang tampil setelah tambah produk ────────────────────
  it('TC-UI-14: Keranjang menampilkan produk setelah ditambahkan', () => {
    cy.fixture('testData').then((data) => {
      // Tambah produk dari homepage
      productsPage.visit();
      cy.get('#produk').scrollIntoView();
      productsPage.addToCart(data.products.first.name);

      // Tunggu toast
      cy.contains('ditambahkan', { timeout: 5000 }).should('be.visible');

      // Buka keranjang
      cartPage.visit();

      // Produk harus tampil di keranjang
      cy.contains(data.products.first.name).should('be.visible');
      cartPage.getCartHeading().should('be.visible');
    });
  });

  // ── TC-UI-15: Checkout tanpa login → redirect ────────────────────────────
  it('TC-UI-15: Checkout tanpa login menampilkan tombol yang redirect ke login', () => {
    cy.fixture('testData').then((data) => {
      // Tambah ke keranjang tanpa login
      productsPage.visit();
      cy.get('#produk').scrollIntoView();
      productsPage.addToCart(data.products.first.name);
      cy.contains('ditambahkan', { timeout: 5000 });

      // Buka cart
      cartPage.visit();

      // Ada notice harus login
      cy.contains('masuk').should('be.visible');

      // Klik checkout button
      cartPage.getCheckoutButton().click();

      // Harus redirect ke login
      cy.url().should('include', '/login');
    });
  });

  // ── TC-UI-16: Qty stepper minimum 1 ─────────────────────────────────────
  it('TC-UI-16: Qty stepper tidak bisa dikurangi di bawah 1', () => {
    cy.fixture('testData').then((data) => {
      // Login dulu
      cy.request('POST', '/api/auth/login', {
        credential: data.validUser.credential,
        password:   data.validUser.password,
      }).then((res) => {
        cy.window().then((win) => {
          win.localStorage.setItem('bloom_store_user', JSON.stringify(res.body.data));
        });
      });

      // Tambah produk dan buka cart
      productsPage.visit();
      cy.get('#produk').scrollIntoView();
      productsPage.addToCart(data.products.first.name);
      cy.contains('ditambahkan', { timeout: 5000 });
      cartPage.visit();

      // Tombol kurangi harus disabled saat qty = 1
      cy.contains(data.products.first.name)
        .parents('div').first()
        .find('button').first()
        .should('be.disabled');
    });
  });
});
