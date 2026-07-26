/**
 * cypress/pages/CartPage.ts
 * Page Object Model — Halaman Keranjang (/cart)
 */
export class CartPage {
  visit() {
    cy.visit('/cart');
    return this;
  }

  // ── State ─────────────────────────────────────────────────────────────────
  getEmptyState() {
    return cy.contains('Keranjang Kosong');
  }
  getCartHeading() {
    return cy.contains('h1', 'Keranjang Belanja');
  }

  // ── Items ─────────────────────────────────────────────────────────────────
  getCartItems() {
    return cy.get('div[class*="border-b"]').filter(':has(img)');
  }
  getItemByName(name: string) {
    return cy.contains('a', name).parents('div').first();
  }

  // ── Tombol ────────────────────────────────────────────────────────────────
  getCheckoutButton() {
    return cy.contains('button', 'Lanjut ke Checkout');
  }
  getBackButton() {
    return cy.contains('a', 'Lanjut Belanja');
  }
  getRemoveButton(productName: string) {
    return cy.contains('a', productName)
      .parents('div').first()
      .find('button[aria-label*="Hapus"]');
  }

  // ── Qty stepper ───────────────────────────────────────────────────────────
  getQtyIncrease(productName: string) {
    return cy.contains('a', productName)
      .parents('div').first()
      .find('button').last();
  }
  getQtyDecrease(productName: string) {
    return cy.contains('a', productName)
      .parents('div').first()
      .find('button').first();
  }

  // ── Total ─────────────────────────────────────────────────────────────────
  getTotalPrice() {
    return cy.contains('Total').next();
  }

  // ── Auth notice ────────────────────────────────────────────────────────────
  getLoginNotice() {
    return cy.contains('Kamu perlu');
  }

  // ── Aksi ─────────────────────────────────────────────────────────────────
  clickCheckout() {
    this.getCheckoutButton().click();
    return this;
  }
}
