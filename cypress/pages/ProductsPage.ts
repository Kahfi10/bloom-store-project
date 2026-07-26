/**
 * cypress/pages/ProductsPage.ts
 * Page Object Model — Halaman Produk (home page product grid)
 */
export class ProductsPage {
  visit() {
    cy.visit('/');
    return this;
  }

  // ── Section produk ────────────────────────────────────────────────────────
  getProductsSection() {
    return cy.get('#produk');
  }
  getProductCards() {
    return cy.get('article[aria-label]');
  }
  getFirstProductCard() {
    return this.getProductCards().first();
  }
  getProductCardByName(name: string) {
    return cy.contains('article', name);
  }

  // ── Elemen di dalam card ──────────────────────────────────────────────────
  getAddToCartButton(card: Cypress.Chainable<JQuery>) {
    return card.find('button').contains('Tambah');
  }
  getProductPrice(card: Cypress.Chainable<JQuery>) {
    return card.find('.font-bold').filter(':contains("Rp")');
  }

  // ── Navigasi ke detail ────────────────────────────────────────────────────
  clickProductCard(name: string) {
    // Klik bagian gambar/nama card (Link area)
    cy.contains('article', name).find('a').first().click({ force: true });
    return this;
  }

  // ── Cart badge di navbar ───────────────────────────────────────────────────
  getCartBadge() {
    return cy.get('header').find('a[href="/cart"]').find('span');
  }

  // ── Scroll ke section produk ───────────────────────────────────────────────
  scrollToProducts() {
    cy.get('#produk').scrollIntoView();
    return this;
  }

  // ── Tambah ke keranjang ────────────────────────────────────────────────────
  addToCart(productName: string) {
    cy.contains('article', productName)
      .find('button')
      .contains('Tambah')
      .click({ force: true });
    return this;
  }
}
