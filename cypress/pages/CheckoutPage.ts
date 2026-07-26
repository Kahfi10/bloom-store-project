/**
 * cypress/pages/CheckoutPage.ts
 * Page Object Model — Halaman Checkout (/checkout)
 */
export class CheckoutPage {
  visit() {
    cy.visit('/checkout');
    return this;
  }

  // ── Form fields ───────────────────────────────────────────────────────────
  getNameInput() {
    return cy.get('input[autocomplete="name"]');
  }
  getAddressInput() {
    return cy.get('textarea[autocomplete="street-address"]');
  }
  getPhoneInput() {
    return cy.get('input[autocomplete="tel"]');
  }
  getSubmitButton() {
    return cy.contains('button', 'Buat Pesanan');
  }
  getBackButton() {
    return cy.contains('a', 'Kembali ke Keranjang');
  }

  // ── Breadcrumb ────────────────────────────────────────────────────────────
  getBreadcrumb() {
    return cy.get('nav').contains('Checkout');
  }

  // ── Error messages ────────────────────────────────────────────────────────
  getFieldError(field: 'name' | 'address' | 'phone') {
    const map = { name: 'Nama penerima', address: 'Alamat pengiriman', phone: 'Nomor telepon' };
    return cy.contains(map[field]);
  }

  // ── Order summary ─────────────────────────────────────────────────────────
  getOrderSummary() {
    return cy.contains('h2', 'Ringkasan Pesanan').parent();
  }
  getTotalPrice() {
    return cy.contains('Total Pembayaran').parent().find('.font-bold').last();
  }

  // ── Aksi ──────────────────────────────────────────────────────────────────
  fillShipping(name: string, address: string, phone: string) {
    this.getNameInput().clear().type(name);
    this.getAddressInput().clear().type(address);
    this.getPhoneInput().clear().type(phone);
    return this;
  }
  submit() {
    this.getSubmitButton().click();
    return this;
  }
  submitOrder(name: string, address: string, phone: string) {
    return this.fillShipping(name, address, phone).submit();
  }
}
