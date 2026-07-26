# Behavior-Driven Development (BDD)
## Bloom Store — Cucumber.js + Gherkin

---

## Pendahuluan

Behavior-Driven Development (BDD) adalah pendekatan pengembangan yang mendeskripsikan perilaku sistem menggunakan bahasa natural yang dapat dipahami semua pemangku kepentingan (developer, QA, business analyst). Spesifikasi ditulis dalam format **Gherkin** menggunakan kata kunci:

- **Feature:** Fitur yang diuji
- **Scenario:** Skenario spesifik
- **Given:** Kondisi awal
- **When:** Aksi yang dilakukan
- **Then:** Hasil yang diharapkan

---

## Setup & Konfigurasi

**Framework:** @cucumber/cucumber 12  
**Bahasa:** TypeScript (via ts-node)  
**File konfigurasi:** `cucumber.json`

```json
{
  "default": {
    "requireModule": ["ts-node/register"],
    "require": ["features/support/**/*.ts", "features/step_definitions/**/*.ts"],
    "paths": ["features/**/*.feature"],
    "format": ["progress-bar", "html:cucumber-report.html"]
  }
}
```

**Cara menjalankan:**
```bash
npm run test:bdd              # Semua scenario
npm run test:bdd:report       # + Generate HTML report
```

---

## Feature File 1: Keranjang Belanja

**File:** `features/cart.feature`  
**PRD Reference:** §Modul 3

```gherkin
Feature: Validasi Keranjang Belanja
  Sebagai pelanggan Bloom Store
  Saya ingin dapat menambahkan bunga ke keranjang dengan jumlah yang valid
  Agar saya bisa memesan produk sesuai kebutuhan
```

### Skenario dalam `cart.feature`

| # | Tipe | Skenario |
|---|---|---|
| 1 | Positif | Menambahkan produk dengan jumlah valid (qty=3, stok=15) |
| 2 | Positif | Membeli tepat 1 unit (batas minimum) |
| 3 | Positif | Membeli tepat 10 unit (batas maksimum) |
| 4 | Negatif | Menolak jumlah nol |
| 5 | Negatif | Menolak jumlah negatif |
| 6 | Negatif | Menolak jumlah melebihi batas maksimum 10 |
| 7 | Negatif | Menolak pembelian saat stok habis |
| 8 | Negatif | Menolak jumlah melebihi stok yang tersedia |
| 9 | Negatif | Menolak jumlah desimal |
| 10 | Scenario Outline | 8 kombinasi qty × stok → valid/invalid |

### Scenario Outline (Boundary Testing)

```gherkin
Scenario Outline: Validasi berbagai jumlah pembelian terhadap batas sistem
  Given stok produk tersedia sebanyak <stok> unit
  When pelanggan ingin membeli <qty> unit
  Then hasil validasi adalah <hasil>

  Examples:
    | qty | stok | hasil   |
    | 1   | 10   | valid   |
    | 10  | 10   | valid   |
    | 5   | 10   | valid   |
    | 0   | 10   | invalid |
    | -1  | 10   | invalid |
    | 11  | 10   | invalid |
    | 5   | 3    | invalid |
    | 1   | 0    | invalid |
```

---

## Feature File 2: Status Pesanan

**File:** `features/order-status.feature`  
**PRD Reference:** §Modul 5

```gherkin
Feature: Transisi Status Pesanan
  Sebagai pelanggan Bloom Store
  Saya ingin status pesanan saya dapat diubah sesuai alur yang benar
  Agar proses pemesanan berjalan dengan tertib dan transparan
```

### Skenario dalam `order-status.feature`

| # | Tipe | Skenario |
|---|---|---|
| 1 | Positif | Mengkonfirmasi pesanan dari Draft |
| 2 | Positif | Menyelesaikan pesanan yang sudah dikonfirmasi |
| 3 | Positif | Membatalkan pesanan Draft |
| 4 | Positif | Membatalkan pesanan Confirmed |
| 5 | Negatif | Menolak Draft langsung ke Completed |
| 6 | Negatif | Menolak perubahan pesanan Completed (locked) |
| 7 | Negatif | Menolak aktivasi ulang pesanan Cancelled (locked) |
| 8 | Negatif | Menolak mundur dari Confirmed ke Draft |
| 9 | Status Sama | Menolak perubahan ke status yang sama |
| 10 | Scenario Outline | 11 kombinasi from × to → valid/invalid |

### Scenario Outline (Semua Kombinasi Transisi)

```gherkin
Scenario Outline: Validasi berbagai kombinasi transisi status pesanan
  Given pesanan berada pada status "<dari>"
  When admin mengubah status menjadi "<ke>"
  Then hasil transisi adalah <hasil>

  Examples:
    | dari      | ke        | hasil   |
    | DRAFT     | CONFIRMED | valid   |
    | DRAFT     | CANCELLED | valid   |
    | CONFIRMED | COMPLETED | valid   |
    | CONFIRMED | CANCELLED | valid   |
    | DRAFT     | COMPLETED | invalid |
    | DRAFT     | DRAFT     | invalid |
    | CONFIRMED | DRAFT     | invalid |
    | COMPLETED | CONFIRMED | invalid |
    | COMPLETED | CANCELLED | invalid |
    | CANCELLED | DRAFT     | invalid |
    | CANCELLED | CONFIRMED | invalid |
```

---

## Step Definitions

### `cart.steps.ts`

```typescript
Given('stok produk {string} tersedia sebanyak {int} unit', 
  function(name, stock) { this.stock = stock; });

When('pelanggan ingin membeli {float} unit',
  function(qty) { this.result = validateCartItem(qty, this.stock); });

Then('sistem menerima penambahan ke keranjang',
  function() { assert.strictEqual(this.result.valid, true); });

Then('sistem menolak penambahan ke keranjang',
  function() { assert.strictEqual(this.result.valid, false); });

Then('hasil validasi adalah {word}',
  function(expected) { 
    assert.strictEqual(this.result.valid, expected === 'valid'); 
  });
```

### `order-status.steps.ts`

```typescript
Given('pesanan berada pada status {string}',
  function(status) { this.currentStatus = status; });

When('admin mengubah status menjadi {string}',
  function(newStatus) { 
    this.result = validateOrderTransition(this.currentStatus, newStatus); 
  });

Then('sistem menerima perubahan status',
  function() { assert.strictEqual(this.result.valid, true); });

Then('sistem menolak perubahan status',
  function() { assert.strictEqual(this.result.valid, false); });

Then('hasil transisi adalah {word}',
  function(expected) { 
    assert.strictEqual(this.result.valid, expected === 'valid'); 
  });
```

---

## Hasil Eksekusi

```
37 scenarios (37 passed)
124 steps (124 passed)
0m00.061s
```

| Feature | Scenarios | Steps | Status |
|---|---|---|---|
| `cart.feature` | 18 | 67 | ✅ PASS |
| `order-status.feature` | 19 | 57 | ✅ PASS |
| **Total** | **37** | **124** | **✅ SEMUA PASS** |

---

## Cakupan Skenario per PRD

| Tipe Skenario | Jumlah | Contoh |
|---|---|---|
| Positif | 7 | Tambah qty valid, transisi DRAFT→CONFIRMED |
| Negatif | 13 | Qty negatif, transisi locked |
| Batas (Boundary) | 9 | qty=1, qty=10, qty=0, qty=11 |
| Perubahan Status | 8 | Semua kombinasi transisi |
| Scenario Outline | 19 | Tabel Examples dengan berbagai input |
