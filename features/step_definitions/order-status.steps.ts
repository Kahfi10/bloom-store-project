import { Before, Given, When, Then, setWorldConstructor } from '@cucumber/cucumber';
import * as assert from 'assert';
import { validateOrderTransition, TransitionResult } from '../../lib/business/orderTransition';

// ─── Custom World ─────────────────────────────────────────────────────────────
class OrderStatusWorld {
  currentStatus!: string;
  targetStatus!:  string;
  result!:        TransitionResult;
}
setWorldConstructor(OrderStatusWorld);

// ─── Hooks ────────────────────────────────────────────────────────────────────
Before(function (this: OrderStatusWorld) {
  this.currentStatus = '';
  this.targetStatus  = '';
  this.result        = { valid: false, message: '' };
});

// ─── Given ────────────────────────────────────────────────────────────────────
Given('pesanan berada pada status {string}', function (this: OrderStatusWorld, status: string) {
  this.currentStatus = status;
});

// ─── When ─────────────────────────────────────────────────────────────────────
When('admin mengubah status menjadi {string}', function (this: OrderStatusWorld, newStatus: string) {
  this.targetStatus = newStatus;
  this.result       = validateOrderTransition(this.currentStatus, newStatus);
});

// ─── Then ─────────────────────────────────────────────────────────────────────
Then('sistem menerima perubahan status', function (this: OrderStatusWorld) {
  assert.strictEqual(this.result.valid, true,
    `Expected valid=true but got false. From: ${this.currentStatus} → ${this.targetStatus}. Message: ${this.result.message}`);
});

Then('sistem menolak perubahan status', function (this: OrderStatusWorld) {
  assert.strictEqual(this.result.valid, false,
    `Expected valid=false but got true. From: ${this.currentStatus} → ${this.targetStatus}. Message: ${this.result.message}`);
});

Then('status pesanan menjadi {string}', function (this: OrderStatusWorld, expectedStatus: string) {
  // Jika transisi valid, status akan berubah ke targetStatus
  assert.ok(this.result.valid,
    `Cannot verify status change because transition was rejected: ${this.result.message}`);
  assert.strictEqual(this.targetStatus, expectedStatus,
    `Expected target status "${expectedStatus}" but transition targeted "${this.targetStatus}"`);
});

Then('pesan penolakan tidak kosong', function (this: OrderStatusWorld) {
  assert.ok(
    this.result.message && this.result.message.trim().length > 0,
    'Expected a non-empty rejection message'
  );
});

Then('pesan penolakan mengandung kata {string}', function (this: OrderStatusWorld, keyword: string) {
  assert.ok(
    this.result.message.toLowerCase().includes(keyword.toLowerCase()),
    `Expected rejection message to contain "${keyword}" but got: "${this.result.message}"`
  );
});

Then('hasil transisi adalah {word}', function (this: OrderStatusWorld, expected: string) {
  const expectedValid = expected === 'valid';
  assert.strictEqual(this.result.valid, expectedValid,
    `Expected valid=${expectedValid} but got ${this.result.valid}. From: ${this.currentStatus} → ${this.targetStatus}. Message: ${this.result.message}`);
});
