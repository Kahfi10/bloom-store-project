import { Before, Given, When, Then, setWorldConstructor } from '@cucumber/cucumber';
import * as assert from 'assert';
import { validateCartItem, CartValidationResult } from '../../lib/business/cartValidation';

// ─── Custom World ─────────────────────────────────────────────────────────────
class CartWorld {
  stock!: number;
  qty!: number;
  result!: CartValidationResult;
}
setWorldConstructor(CartWorld);

// ─── Hooks ────────────────────────────────────────────────────────────────────
Before(function (this: CartWorld) {
  this.stock  = 0;
  this.qty    = 0;
  this.result = { valid: false, message: '' };
});

// ─── Given ────────────────────────────────────────────────────────────────────
Given('stok produk {string} tersedia sebanyak {int} unit', function (this: CartWorld, _name: string, stock: number) {
  this.stock = stock;
});

Given('stok produk tersedia sebanyak {int} unit', function (this: CartWorld, stock: number) {
  this.stock = stock;
});

// ─── When ─────────────────────────────────────────────────────────────────────
When('pelanggan ingin membeli {float} unit', function (this: CartWorld, qty: number) {
  this.qty    = qty;
  this.result = validateCartItem(qty, this.stock);
});

// ─── Then ─────────────────────────────────────────────────────────────────────
Then('sistem menerima penambahan ke keranjang', function (this: CartWorld) {
  assert.strictEqual(this.result.valid, true,
    `Expected valid=true but got false. Message: ${this.result.message}`);
});

Then('sistem menolak penambahan ke keranjang', function (this: CartWorld) {
  assert.strictEqual(this.result.valid, false,
    `Expected valid=false but got true. Message: ${this.result.message}`);
});

Then('pesan {string} ditampilkan', function (this: CartWorld, keyword: string) {
  assert.ok(
    this.result.message.toLowerCase().includes(keyword.toLowerCase()),
    `Expected message to contain "${keyword}" but got: "${this.result.message}"`
  );
});

Then('pesan error mengandung kata {string}', function (this: CartWorld, keyword: string) {
  assert.ok(
    this.result.message.toLowerCase().includes(keyword.toLowerCase()),
    `Expected error message to contain "${keyword}" but got: "${this.result.message}"`
  );
});

Then('hasil validasi adalah {word}', function (this: CartWorld, expected: string) {
  const expectedValid = expected === 'valid';
  assert.strictEqual(this.result.valid, expectedValid,
    `Expected valid=${expectedValid} but got ${this.result.valid}. qty=${this.qty}, stock=${this.stock}. Message: ${this.result.message}`);
});
